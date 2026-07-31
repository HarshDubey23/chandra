// Complaint trend stats — monthly complaints + resolution rate for dashboard chart.
// Returns last 6 months of data: month label, total, resolved, pending.
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const user = await requireRole(req.headers.get('cookie'), 'viewer')
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 403 })

  // Get last 6 months
  const now = new Date()
  const months: { label: string; labelHi: string; start: Date; end: Date }[] = []
  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
    const labelEn = start.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
    const labelHi = start.toLocaleDateString('hi-IN', { month: 'short', year: '2-digit' })
    months.push({ label: labelEn, labelHi, start, end })
  }

  const trend = await Promise.all(
    months.map(async (m) => {
      const [total, resolved] = await Promise.all([
        db.complaint.count({ where: { createdAt: { gte: m.start, lt: m.end } } }),
        db.complaint.count({ where: { createdAt: { gte: m.start, lt: m.end }, status: 'Resolved' } }),
      ])
      return {
        month: m.label,
        monthHi: m.labelHi,
        total,
        resolved,
        pending: total - resolved,
        resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
      }
    })
  )

  return NextResponse.json({ trend })
}
