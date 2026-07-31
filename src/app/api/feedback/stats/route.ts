// Feedback rating distribution stats — for admin dashboard chart.
// Returns count per rating (1-5 stars) + average rating.
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const user = await requireRole(req.headers.get('cookie'), 'viewer')
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 403 })

  const [totalCount, avgRating, ratingGroups] = await Promise.all([
    db.citizenFeedback.count(),
    db.citizenFeedback.aggregate({ _avg: { rating: true } }),
    db.citizenFeedback.groupBy({ by: ['rating'], _count: true, orderBy: { rating: 'asc' } }),
  ])

  // Build distribution for ratings 1-5
  const distribution = [1, 2, 3, 4, 5].map(rating => {
    const group = ratingGroups.find(g => g.rating === rating)
    return { rating, count: group?._count ?? 0 }
  })

  return NextResponse.json({
    total: totalCount,
    average: avgRating._avg.rating ?? 0,
    distribution,
  })
}
