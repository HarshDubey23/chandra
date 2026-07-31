// Citizen Feedback API (Task 7-c)
// - POST /api/feedback     → public submission (validates trackingId, rating 1-5)
// - GET  /api/feedback     → admin-only listing with pagination + trackingId filter
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUser, requireRole } from '@/lib/auth'

// ── POST — public submission ────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  let body: {
    trackingId?: unknown
    rating?: unknown
    comment?: unknown
    language?: unknown
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const trackingId = typeof body.trackingId === 'string' ? body.trackingId.trim() : ''
  if (!trackingId) {
    return NextResponse.json({ error: 'missing_trackingId' }, { status: 400 })
  }

  // Rating must be an integer 1-5
  const ratingNum = Number(body.rating)
  if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return NextResponse.json({ error: 'invalid_rating' }, { status: 400 })
  }

  const comment =
    typeof body.comment === 'string' && body.comment.trim().length > 0
      ? body.comment.trim().slice(0, 1000)
      : null

  const language =
    typeof body.language === 'string' && body.language.trim().length > 0
      ? body.language.trim().slice(0, 8)
      : 'hi'

  // Verify trackingId exists in Complaint table
  const complaint = await db.complaint.findUnique({
    where: { trackingId },
    select: { trackingId: true, status: true },
  })
  if (!complaint) {
    return NextResponse.json({ error: 'tracking_id_not_found' }, { status: 404 })
  }

  const created = await db.citizenFeedback.create({
    data: {
      trackingId,
      rating: ratingNum,
      comment,
      language,
    },
  })

  return NextResponse.json(
    {
      ok: true,
      feedback: {
        id: created.id,
        trackingId: created.trackingId,
        rating: created.rating,
        comment: created.comment,
        language: created.language,
        createdAt: created.createdAt,
      },
    },
    { status: 201 },
  )
}

// ── GET — admin-only listing ────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const user = await requireRole(req.headers.get('cookie'), 'viewer')
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 403 })

  const sp = req.nextUrl.searchParams
  const pageRaw = Number(sp.get('page') ?? '1')
  const limitRaw = Number(sp.get('limit') ?? '20')
  const page = Number.isInteger(pageRaw) && pageRaw > 0 ? pageRaw : 1
  const limit = Number.isInteger(limitRaw) && limitRaw > 0 && limitRaw <= 200 ? limitRaw : 20
  const trackingIdFilter = sp.get('trackingId')?.trim() || undefined

  const where = trackingIdFilter ? { trackingId: trackingIdFilter } : {}

  const [records, total] = await Promise.all([
    db.citizenFeedback.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.citizenFeedback.count({ where }),
  ])

  return NextResponse.json({
    feedback: records,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  })
}
