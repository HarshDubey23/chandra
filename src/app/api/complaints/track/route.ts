// Public: track a complaint by trackingId
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')?.trim()
  if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 })
  const c = await db.complaint.findUnique({ where: { trackingId: id } })
  if (!c) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  // Strip sensitive fields for public view
  return NextResponse.json({
    trackingId: c.trackingId,
    callerName: c.callerName,
    callReason: c.callReason,
    category: c.category,
    status: c.status,
    createdAt: c.createdAt,
    resolvedAt: c.resolvedAt,
    resolutionNote: c.resolutionNote,
    timeline: c.timeline ? JSON.parse(c.timeline) : [],
  })
}
