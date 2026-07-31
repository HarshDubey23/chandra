// Admin: bulk update complaint status (update multiple complaints at once)
// Receives { trackingIds: string[], status: string, resolutionNote?: string }
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUser, requireRole } from '@/lib/auth'
import { logActivity } from '@/lib/audit'

export async function POST(req: NextRequest) {
  const user = await requireRole(req.headers.get('cookie'), 'secretary')
  if (!user) return NextResponse.json({ error: 'unauthorized', message: 'संपादक या उच्च अनुमति आवश्यक' }, { status: 403 })

  const body = await req.json()
  const { trackingIds, status, resolutionNote } = body

  if (!Array.isArray(trackingIds) || trackingIds.length === 0 || !status) {
    return NextResponse.json({ error: 'missing fields' }, { status: 400 })
  }

  const valid = ['Pending', 'InProgress', 'Resolved', 'Rejected']
  if (!valid.includes(status)) {
    return NextResponse.json({ error: 'invalid status' }, { status: 400 })
  }

  // Limit bulk updates to 50 at once
  if (trackingIds.length > 50) {
    return NextResponse.json({ error: 'too many items (max 50)' }, { status: 400 })
  }

  const updatedCount = 0
  const errors: string[] = []

  for (const tid of trackingIds) {
    const existing = await db.complaint.findUnique({ where: { trackingId: tid } })
    if (!existing) {
      errors.push(`Not found: ${tid}`)
      continue
    }

    // Append to timeline
    const oldTimeline = existing.timeline ? JSON.parse(existing.timeline) : []
    const newEntry = {
      status,
      ts: new Date().toISOString(),
      note: resolutionNote || `Bulk status change to ${status}`,
      by: user.id,
    }
    const newTimeline = [...oldTimeline, newEntry]

    await db.complaint.update({
      where: { trackingId: tid },
      data: {
        status,
        resolutionNote: resolutionNote ?? existing.resolutionNote,
        resolvedAt: status === 'Resolved' || status === 'Rejected' ? new Date() : existing.resolvedAt,
        timeline: JSON.stringify(newTimeline),
      },
    })

    await logActivity({
      adminId: user.id,
      action: 'update',
      entityType: 'complaint',
      entityId: tid,
      before: { status: existing.status },
      after: { status, resolutionNote },
      ip: req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || undefined,
      userAgent: req.headers.get('user-agent') || undefined,
    })
  }

  return NextResponse.json({
    ok: true,
    updatedCount,
    errors,
    message: `Bulk update completed. ${errors.length > 0 ? `Errors: ${errors.join(', ')}` : 'All updated successfully.'}`,
  })
}
