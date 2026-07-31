// Citizen Polls API — single-poll admin mutations (Task 8-a)
// - PATCH  /api/polls/[id]  → admin: update status (close/reopen) or question
// - DELETE /api/polls/[id]  → admin: delete poll (cascades options + votes)
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUser, requireRole } from '@/lib/auth'
import { logActivity } from '@/lib/audit'

export const dynamic = 'force-dynamic'

// ── PATCH — admin update ────────────────────────────────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireRole(req.headers.get('cookie'), 'admin')
  if (!user) return NextResponse.json({ error: 'unauthorized', message: 'सुपर एडमिन अनुमति आवश्यक' }, { status: 403 })

  const { id } = await params

  let body: {
    status?: unknown
    questionHi?: unknown
    questionEn?: unknown
    endDate?: unknown
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const existing = await db.poll.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  const data: {
    status?: string
    questionHi?: string
    questionEn?: string
    endDate?: Date | null
  } = {}

  if (typeof body.status === 'string') {
    const s = body.status.trim()
    if (s !== 'active' && s !== 'closed') {
      return NextResponse.json({ error: 'invalid_status' }, { status: 400 })
    }
    data.status = s
    // Closing a poll stamps endDate automatically if not already set
    if (s === 'closed' && !existing.endDate) {
      data.endDate = new Date()
    }
    // Reopening clears any prior endDate so the poll runs again
    if (s === 'active') {
      data.endDate = null
    }
  }

  if (typeof body.questionHi === 'string') {
    const q = body.questionHi.trim()
    if (q.length === 0) {
      return NextResponse.json({ error: 'empty_questionHi' }, { status: 400 })
    }
    data.questionHi = q.slice(0, 1000)
  }
  if (typeof body.questionEn === 'string') {
    const q = body.questionEn.trim()
    if (q.length === 0) {
      return NextResponse.json({ error: 'empty_questionEn' }, { status: 400 })
    }
    data.questionEn = q.slice(0, 1000)
  }

  if (typeof body.endDate === 'string') {
    if (body.endDate.trim().length === 0) {
      data.endDate = null
    } else {
      const d = new Date(body.endDate)
      if (!isNaN(d.getTime())) data.endDate = d
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'no_fields' }, { status: 400 })
  }

  const updated = await db.poll.update({
    where: { id },
    data,
  })

  await logActivity({
    adminId: user.id,
    action: 'update',
    entityType: 'announcement', // closest enum; polls reuse audit infra
    entityId: id,
    before: {
      status: existing.status,
      questionHi: existing.questionHi,
      questionEn: existing.questionEn,
      endDate: existing.endDate,
    },
    after: data,
    ip: req.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
    userAgent: req.headers.get('user-agent') || undefined,
  })

  return NextResponse.json({ ok: true, poll: updated })
}

// ── DELETE — admin delete (cascade) ─────────────────────────────────────────
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireRole(req.headers.get('cookie'), 'admin')
  if (!user) return NextResponse.json({ error: 'unauthorized', message: 'सुपर एडमिन अनुमति आवश्यक' }, { status: 403 })

  const { id } = await params

  const existing = await db.poll.findUnique({
    where: { id },
    select: { id: true, questionHi: true, questionEn: true, status: true },
  })
  if (!existing) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  // Prisma cascade onDelete: Cascade on PollOption + PollVote handles children
  await db.poll.delete({ where: { id } })

  await logActivity({
    adminId: user.id,
    action: 'delete',
    entityType: 'announcement', // closest enum; polls reuse audit infra
    entityId: id,
    before: existing,
    ip: req.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
    userAgent: req.headers.get('user-agent') || undefined,
  })

  return NextResponse.json({ ok: true })
}
