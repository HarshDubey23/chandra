// Public: citizen file a new complaint via web form (no auth required).
// Master doc §9.1 — citizen complaint flow (web variant).
// Generates a GPCH- tracking ID, stores complaint with source='web' timeline,
// hashes caller phone per DPDP (last-4 visible in admin only).
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import crypto from 'node:crypto'

export const dynamic = 'force-dynamic'

const ALLOWED_CATEGORIES = ['water', 'road', 'school', 'housing', 'pension', 'mgnrega', 'other']

// Simple in-memory rate limit: max 5 complaints per IP per 10 minutes
const RATE_WINDOW_MS = 10 * 60 * 1000
const RATE_MAX = 5
const ipHits = new Map<string, number[]>()

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const hits = (ipHits.get(ip) || []).filter(t => now - t < RATE_WINDOW_MS)
  hits.push(now)
  ipHits.set(ip, hits)
  return hits.length > RATE_MAX
}

function generateTrackingId(): string {
  return `GPCH-${Date.now().toString(36).toUpperCase()}`
}

function hashPhone(phone: string): string {
  // Store a hash for dedup/audit; admin sees last-4 only via separate field
  return 'MOB_' + crypto.createHash('sha256').update(phone).digest('hex').slice(0, 16)
}

export async function POST(req: NextRequest) {
  let body: { callerName?: string; callerPhone?: string; callReason?: string; category?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
  if (rateLimited(ip)) {
    return NextResponse.json({ error: 'rate_limited', message: 'बहुत अधिक शिकायतें। 10 मिनट बाद प्रयास करें।' }, { status: 429 })
  }

  const callerName = (body.callerName || '').trim().slice(0, 100)
  const callerPhone = (body.callerPhone || '').trim().replace(/[^\d+]/g, '').slice(0, 15)
  const callReason = (body.callReason || '').trim().slice(0, 2000)
  const category = ALLOWED_CATEGORIES.includes(body.category || '') ? body.category! : 'other'

  if (!callerName) {
    return NextResponse.json({ error: 'missing_name', message: 'कृपया नाम दर्ज करें' }, { status: 400 })
  }
  if (!callerPhone || callerPhone.replace(/[^\d]/g, '').length < 10) {
    return NextResponse.json({ error: 'missing_phone', message: 'कृपया सही 10-अंकीय फ़ोन नंबर दर्ज करें' }, { status: 400 })
  }
  if (!callReason || callReason.length < 10) {
    return NextResponse.json({ error: 'missing_reason', message: 'कृपया शिकायत विवरण दर्ज करें (कम से कम 10 अक्षर)' }, { status: 400 })
  }

  const trackingId = generateTrackingId()
  const nowIso = new Date().toISOString()
  const timeline = [
    {
      status: 'Pending',
      ts: nowIso,
      note: 'Web form se shikayat darj (citizen web complaint)',
      by: 'web-form',
    },
  ]

  try {
    await db.complaint.create({
      data: {
        trackingId,
        callerName,
        callerPhone: hashPhone(callerPhone),
        callReason,
        category,
        status: 'Pending',
        rawTranscript: `Web complaint from ${callerName} (${ip})`,
        timeline: JSON.stringify(timeline),
      },
    })
  } catch (e) {
    console.error('[complaints/create] DB insert failed:', e)
    return NextResponse.json({ error: 'db_error', message: 'शिकायत दर्ज करने में विफल। पुनः प्रयास करें।' }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    trackingId,
    message: 'शिकायत सफलतापूर्वक दर्ज हुई। अपनी ट्रैकिंग आईडी सुरक्षित रखें।',
  })
}
