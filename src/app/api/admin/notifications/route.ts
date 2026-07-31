// Admin: notification counts + recent notification items for badge/dropdown.
// Returns counts of new complaints, feedback, poll votes since the
// provided `since` timestamp (ISO string). Also returns the last 10
// notification items for the dropdown panel.

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req.headers.get('cookie'))
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const since = req.nextUrl.searchParams.get('since') // ISO timestamp

  const sinceDate = since ? new Date(since) : new Date(0) // if no since, count all

  // ── Unread counts ────────────────────────────────────────────────
  const newComplaints = await db.complaint.count({
    where: { createdAt: { gte: sinceDate } },
  })

  const newFeedback = await db.citizenFeedback.count({
    where: { createdAt: { gte: sinceDate } },
  })

  const newPollVotes = await db.pollVote.count({
    where: { createdAt: { gte: sinceDate } },
  })

  // ── Recent notification items (last 10) ──────────────────────────
  // We'll query the latest 4 complaints, 3 feedback, 3 poll votes
  const recentComplaints = await db.complaint.findMany({
    where: { createdAt: { gte: sinceDate } },
    orderBy: { createdAt: 'desc' },
    take: 4,
    select: { id: true, trackingId: true, callerName: true, category: true, createdAt: true },
  })

  const recentFeedback = await db.citizenFeedback.findMany({
    where: { createdAt: { gte: sinceDate } },
    orderBy: { createdAt: 'desc' },
    take: 3,
    select: { id: true, trackingId: true, rating: true, createdAt: true },
  })

  const recentPollVotes = await db.pollVote.findMany({
    where: { createdAt: { gte: sinceDate } },
    orderBy: { createdAt: 'desc' },
    take: 3,
    select: { id: true, pollId: true, createdAt: true },
  })

  // Build notification items
  const notifications: Array<{
    id: string
    type: 'complaint' | 'feedback' | 'poll'
    title: string
    description: string
    timestamp: string
    read: boolean
    targetTab: string
  }> = []

  for (const c of recentComplaints) {
    notifications.push({
      id: `complaint-${c.id}`,
      type: 'complaint',
      title: 'New Complaint',
      description: `${c.callerName} — ${c.trackingId}`,
      timestamp: c.createdAt.toISOString(),
      read: false,
      targetTab: 'complaints',
    })
  }

  for (const f of recentFeedback) {
    notifications.push({
      id: `feedback-${f.id}`,
      type: 'feedback',
      title: 'New Feedback',
      description: `${f.rating}★ rating for ${f.trackingId}`,
      timestamp: f.createdAt.toISOString(),
      read: false,
      targetTab: 'feedback',
    })
  }

  for (const p of recentPollVotes) {
    notifications.push({
      id: `poll-${p.id}`,
      type: 'poll',
      title: 'New Poll Vote',
      description: `Vote on poll ${p.pollId}`,
      timestamp: p.createdAt.toISOString(),
      read: false,
      targetTab: 'polls',
    })
  }

  // Sort by timestamp descending, limit to 10
  notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  const limitedNotifications = notifications.slice(0, 10)

  return NextResponse.json({
    unreadCounts: {
      complaints: newComplaints,
      feedback: newFeedback,
      pollVotes: newPollVotes,
    },
    notifications: limitedNotifications,
  })
}
