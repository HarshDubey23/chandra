// Admin: list all complaints (requires auth)
// Public: when ?public=1 is set, return only the last N (default 5) complaints
// with public-safe fields (no callerPhone, no rawTranscript). Used by the
// public RecentComplaints widget on the home page.
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const isPublic = sp.get('public') === '1'
  const limit = Math.min(parseInt(sp.get('limit') || '5', 10) || 5, 50)

  // Public mode: no auth required, restricted fields
  if (isPublic) {
    const rows = await db.complaint.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        trackingId: true,
        callerName: true,
        category: true,
        status: true,
        createdAt: true,
        resolvedAt: true,
      },
    })
    return NextResponse.json({ complaints: rows })
  }

  // Authenticated mode — full fields
  const user = await getSessionUser(req.headers.get('cookie'))
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const status = sp.get('status')
  const where = status ? { status } : {}
  const complaints = await db.complaint.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 200,
  })
  return NextResponse.json({ complaints })
}
