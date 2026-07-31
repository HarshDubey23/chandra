// Admin activity log CSV export — master doc §5.5 audit compliance.
// Returns all activity logs as a downloadable CSV file.
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'

export const dynamic = 'force-dynamic'

function csvEscape(val: unknown): string {
  if (val === null || val === undefined) return ''
  const s = typeof val === 'string' ? val : JSON.stringify(val)
  // Escape quotes and wrap in quotes if contains comma, quote, or newline
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export async function GET(req: NextRequest) {
  const user = await requireRole(req.headers.get('cookie'), 'admin')
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 403 })

  const logs = await db.adminActivityLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 1000,
    include: { admin: { select: { name: true, email: true } } },
  })

  const headers = ['Date', 'Admin', 'Email', 'Action', 'Entity Type', 'Entity ID', 'IP', 'Before', 'After']
  const rows = logs.map(l => [
    new Date(l.createdAt).toISOString(),
    l.admin?.name || '—',
    l.admin?.email || '—',
    l.action,
    l.entityType,
    l.entityId || '',
    l.ip || '',
    l.before || '',
    l.after || '',
  ])

  const csv = [headers, ...rows].map(row => row.map(csvEscape).join(',')).join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="activity-log-${new Date().toISOString().slice(0, 10)}.csv"`,
      'Cache-Control': 'no-cache',
    },
  })
}
