// Citizen Polls API (Task 8-a)
// - GET  /api/polls       → public list of all polls with options + vote counts
// - POST /api/polls       → admin-only: create a new poll (2-6 bilingual options)
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUser, requireRole } from '@/lib/auth'
import { logActivity } from '@/lib/audit'

export const dynamic = 'force-dynamic'

// ── GET — public listing ────────────────────────────────────────────────────
export async function GET() {
  const polls = await db.poll.findMany({
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    include: {
      options: {
        orderBy: { order: 'asc' },
        select: {
          id: true,
          textHi: true,
          textEn: true,
          order: true,
          _count: { select: { votes: true } },
        },
      },
      _count: { select: { votes: true } },
    },
  })

  // Shape the response — flatten _count.votes into `votes` per option
  const shaped = polls.map((p) => ({
    id: p.id,
    questionHi: p.questionHi,
    questionEn: p.questionEn,
    descriptionHi: p.descriptionHi,
    descriptionEn: p.descriptionEn,
    status: p.status,
    startDate: p.startDate,
    endDate: p.endDate,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    totalVotes: p._count.votes,
    options: p.options.map((o) => ({
      id: o.id,
      textHi: o.textHi,
      textEn: o.textEn,
      order: o.order,
      votes: o._count.votes,
    })),
  }))

  return NextResponse.json({ polls: shaped })
}

// ── POST — admin-only create ────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const user = await requireRole(req.headers.get('cookie'), 'admin')
  if (!user) return NextResponse.json({ error: 'unauthorized', message: 'सुपर एडमिन अनुमति आवश्यक' }, { status: 403 })

  let body: {
    questionHi?: unknown
    questionEn?: unknown
    descriptionHi?: unknown
    descriptionEn?: unknown
    endDate?: unknown
    options?: unknown
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const questionHi =
    typeof body.questionHi === 'string' ? body.questionHi.trim() : ''
  const questionEn =
    typeof body.questionEn === 'string' ? body.questionEn.trim() : ''
  if (!questionHi || !questionEn) {
    return NextResponse.json({ error: 'missing_question' }, { status: 400 })
  }

  const descriptionHi =
    typeof body.descriptionHi === 'string' && body.descriptionHi.trim().length > 0
      ? body.descriptionHi.trim().slice(0, 2000)
      : null
  const descriptionEn =
    typeof body.descriptionEn === 'string' && body.descriptionEn.trim().length > 0
      ? body.descriptionEn.trim().slice(0, 2000)
      : null

  // endDate (optional ISO string)
  let endDate: Date | null = null
  if (typeof body.endDate === 'string' && body.endDate.trim().length > 0) {
    const d = new Date(body.endDate)
    if (!isNaN(d.getTime())) endDate = d
  }

  // Options: array of { textHi, textEn }, 2..6 items
  const rawOptions = Array.isArray(body.options) ? body.options : []
  const options = rawOptions
    .map((o: unknown) => {
      if (typeof o !== 'object' || o === null) return null
      const obj = o as { textHi?: unknown; textEn?: unknown }
      const th = typeof obj.textHi === 'string' ? obj.textHi.trim() : ''
      const te = typeof obj.textEn === 'string' ? obj.textEn.trim() : ''
      if (!th || !te) return null
      return { textHi: th.slice(0, 500), textEn: te.slice(0, 500) }
    })
    .filter((o): o is { textHi: string; textEn: string } => o !== null)

  if (options.length < 2) {
    return NextResponse.json({ error: 'too_few_options' }, { status: 400 })
  }
  if (options.length > 6) {
    return NextResponse.json({ error: 'too_many_options' }, { status: 400 })
  }

  const created = await db.poll.create({
    data: {
      questionHi,
      questionEn,
      descriptionHi,
      descriptionEn,
      endDate,
      createdBy: user.id,
      options: {
        create: options.map((o, idx) => ({
          textHi: o.textHi,
          textEn: o.textEn,
          order: idx,
        })),
      },
    },
    include: {
      options: { orderBy: { order: 'asc' } },
    },
  })

  await logActivity({
    adminId: user.id,
    action: 'create',
    entityType: 'announcement', // closest matching enum; polls reuse audit infra
    entityId: created.id,
    after: { questionHi, questionEn, options: options.length },
    ip: req.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
    userAgent: req.headers.get('user-agent') || undefined,
  })

  return NextResponse.json({ ok: true, poll: created }, { status: 201 })
}
