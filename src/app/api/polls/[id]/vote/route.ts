// Citizen Polls API — cast a vote (Task 8-a)
// - POST /api/polls/[id]/vote  → public; one vote per poll per voterKey
// voterKey = sha256(ip + user-agent + pollId) — anonymized server-side
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

function computeVoterKey(ip: string, ua: string, pollId: string): string {
  return crypto
    .createHash('sha256')
    .update(`${ip}::${ua}::${pollId}`)
    .digest('hex')
}

function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return req.headers.get('x-real-ip') || '0.0.0.0'
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: pollId } = await params

  let body: { optionId?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const optionId =
    typeof body.optionId === 'string' ? body.optionId.trim() : ''
  if (!optionId) {
    return NextResponse.json({ error: 'missing_optionId' }, { status: 400 })
  }

  // Verify poll exists
  const poll = await db.poll.findUnique({
    where: { id: pollId },
    select: { id: true, status: true, endDate: true },
  })
  if (!poll) {
    return NextResponse.json({ error: 'poll_not_found' }, { status: 404 })
  }

  // Closed polls cannot accept votes
  if (poll.status === 'closed') {
    return NextResponse.json({ error: 'poll_closed' }, { status: 409 })
  }
  // Expired polls cannot accept votes
  if (poll.endDate && poll.endDate.getTime() < Date.now()) {
    return NextResponse.json({ error: 'poll_expired' }, { status: 409 })
  }

  // Verify option belongs to this poll
  const option = await db.pollOption.findUnique({
    where: { id: optionId },
    select: { id: true, pollId: true },
  })
  if (!option || option.pollId !== pollId) {
    return NextResponse.json({ error: 'option_not_found' }, { status: 404 })
  }

  // Compute voterKey server-side from request fingerprint
  const ip = getClientIp(req)
  const ua = req.headers.get('user-agent') || ''
  const voterKey = computeVoterKey(ip, ua, pollId)

  // Check existing vote (unique constraint will also enforce)
  const existing = await db.pollVote.findUnique({
    where: { pollId_voterKey: { pollId, voterKey } },
    select: { id: true },
  })
  if (existing) {
    return NextResponse.json({ error: 'already_voted' }, { status: 409 })
  }

  try {
    await db.pollVote.create({
      data: { pollId, optionId, voterKey },
    })
  } catch (e) {
    // P2002 = unique constraint violation (concurrent vote race)
    if (e && typeof e === 'object' && 'code' in e && e.code === 'P2002') {
      return NextResponse.json({ error: 'already_voted' }, { status: 409 })
    }
    throw e
  }

  // Return updated vote counts so frontend can refresh without re-fetching
  const options = await db.pollOption.findMany({
    where: { pollId },
    orderBy: { order: 'asc' },
    select: {
      id: true,
      textHi: true,
      textEn: true,
      order: true,
      _count: { select: { votes: true } },
    },
  })

  const totalVotes = await db.pollVote.count({ where: { pollId } })

  return NextResponse.json(
    {
      ok: true,
      votedOptionId: optionId,
      poll: {
        id: pollId,
        totalVotes,
        options: options.map((o) => ({
          id: o.id,
          textHi: o.textHi,
          textEn: o.textEn,
          order: o.order,
          votes: o._count.votes,
        })),
      },
    },
    { status: 201 },
  )
}
