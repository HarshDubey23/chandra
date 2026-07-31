/**
 * POST /api/complaints — Production complaint registration endpoint.
 *
 * Accepts JSON body from:
 *   1. Vapi apiRequest tool (AI voice complaint filing)
 *   2. Direct API calls (curl, Postman, external integrations)
 *   3. Web form (backward compatible with /api/complaints/create)
 *
 * Generates sequential tracking ID: GPCH-2026-000001
 * Sends notification hooks (notifyOfficer + notifyAdmin).
 * Returns tracking ID on success.
 *
 * Validation: Zod (vapiComplaintSchema)
 * Rate limiting: 10 requests per IP per 10 minutes
 * Error handling: 400 (invalid input), 429 (rate limited), 500 (server error)
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import crypto from 'node:crypto'
import { vapiComplaintSchema } from '@/lib/validations'
import { generateSequentialTrackingId } from '@/lib/tracking-id'
import { notifyOfficer, notifyAdmin, type NotificationPayload } from '@/lib/notification-service'

export const dynamic = 'force-dynamic'

// ── Rate limiting (in-memory, per IP) ──
const RATE_WINDOW_MS = 10 * 60 * 1000 // 10 minutes
const RATE_MAX = 10
const ipHits = new Map<string, number[]>()

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const hits = (ipHits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS)
  hits.push(now)
  ipHits.set(ip, hits)
  return hits.length > RATE_MAX
}

// ── Phone hashing (DPDP 2023 compliance) ──
function hashPhone(phone: string): string {
  return 'MOB_' + crypto.createHash('sha256').update(phone).digest('hex').slice(0, 16)
}

// ── POST handler ──
export async function POST(req: NextRequest) {
  // Parse + validate body
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { success: false, error: 'invalid_json', message: 'Request body must be valid JSON' },
      { status: 400 },
    )
  }

  const parsed = vapiComplaintSchema.safeParse(body)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]
    return NextResponse.json(
      {
        success: false,
        error: firstError?.message || 'validation_error',
        field: firstError?.path?.join('.') || null,
      },
      { status: 400 },
    )
  }

  const {
    name,
    phone,
    village,
    ward,
    category,
    description,
    departmentCode,
    priority,
    location,
    landmark,
    vapiCallId,
  } = parsed.data

  // Rate limiting
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  if (rateLimited(ip)) {
    return NextResponse.json(
      { success: false, error: 'rate_limited', message: 'Too many requests. Try again in 10 minutes.' },
      { status: 429 },
    )
  }

  // Generate sequential tracking ID
  let trackingId: string
  try {
    trackingId = await generateSequentialTrackingId()
  } catch (e) {
    console.error('[api/complaints] Tracking ID generation failed:', e)
    return NextResponse.json(
      { success: false, error: 'tracking_id_failed' },
      { status: 500 },
    )
  }

  // Build timeline entry
  const nowIso = new Date().toISOString()
  const source = vapiCallId ? 'vapi' : 'web'
  const timeline = [
    {
      status: 'NEW',
      ts: nowIso,
      note: source === 'vapi' ? 'AI voice complaint registered' : 'Web form complaint registered',
      by: source,
    },
  ]

  // Save to database
  try {
    const complaint = await db.complaint.create({
      data: {
        trackingId,
        vapiCallId: vapiCallId || null,
        // Map new fields to legacy columns (backward compat with admin panel)
        callerName: name,
        callerPhone: hashPhone(phone),
        callReason: description,
        // New production fields
        village,
        ward: ward || null,
        departmentCode,
        location: location || null,
        landmark: landmark || null,
        priority,
        source,
        category: category || 'other',
        status: 'NEW',
        rawTranscript: `${source.toUpperCase()} complaint from ${name} (IP: ${ip})`,
        timeline: JSON.stringify(timeline),
      },
    })

    // ── Logging ──
    console.log(`[api/complaints] ✓ Complaint registered`, {
      trackingId,
      name,
      category,
      departmentCode,
      priority,
      source,
      timestamp: nowIso,
    })

    // ── Notification hooks (non-blocking) ──
    const notificationPayload: NotificationPayload = {
      trackingId,
      citizenName: name,
      citizenPhone: phone,
      category,
      departmentCode,
      priority,
      description,
      village,
      ward,
      source: source as 'vapi' | 'web',
    }

    // Fire notifications in background (don't block the response)
    ;(async () => {
      try {
        // Look up department officer phone
        const dept = await db.department.findUnique({
          where: { code: departmentCode },
          select: { officerName: true, officerPhone: true },
        }).catch(() => null)

        if (dept?.officerPhone) {
          await notifyOfficer(dept.officerPhone, dept.officerName || 'Officer', notificationPayload)
        }

        // Notify admin (Pradhan)
        const adminPhone = process.env.ADMIN_PHONE || '919651035021'
        await notifyAdmin(adminPhone, notificationPayload)
      } catch (e) {
        console.error('[api/complaints] Notification failed (non-fatal):', e)
      }
    })()

    // ── Return success ──
    return NextResponse.json(
      {
        success: true,
        trackingId,
        complaintId: complaint.id,
      },
      { status: 201 },
    )
  } catch (e) {
    console.error('[api/complaints] DB insert failed:', e)
    return NextResponse.json(
      { success: false, error: 'internal_error', message: 'Failed to register complaint' },
      { status: 500 },
    )
  }
}

// ── GET handler (list complaints — for admin dashboard) ──
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const limit = Math.min(parseInt(sp.get('limit') || '20'), 100)
  const offset = parseInt(sp.get('offset') || '0')
  const status = sp.get('status')

  const where: Record<string, unknown> = {}
  if (status) where.status = status

  try {
    const [complaints, total] = await Promise.all([
      db.complaint.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          trackingId: true,
          callerName: true,
          category: true,
          departmentCode: true,
          priority: true,
          status: true,
          source: true,
          village: true,
          ward: true,
          createdAt: true,
        },
      }),
      db.complaint.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      complaints,
      total,
      limit,
      offset,
    })
  } catch (e) {
    console.error('[api/complaints] GET failed:', e)
    return NextResponse.json(
      { success: false, error: 'internal_error' },
      { status: 500 },
    )
  }
}
