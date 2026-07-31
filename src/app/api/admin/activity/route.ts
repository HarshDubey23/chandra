// Admin activity log
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req.headers.get('cookie'))
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '50', 10)
  const logs = await db.adminActivityLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: Math.min(limit, 500),
    include: { admin: { select: { name: true, email: true } } },
  })
  // Parse JSON fields
  const parsed = logs.map(l => ({
    ...l,
    before: l.before ? JSON.parse(l.before) : null,
    after: l.after ? JSON.parse(l.after) : null,
  }))
  return NextResponse.json({ logs: parsed })
}
