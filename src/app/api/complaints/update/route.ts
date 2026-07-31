// Admin: update complaint status (with audit log + timeline append)
// Also dispatches a WhatsApp notification to the citizen AND the Pradhan
// whenever the status changes — via the vapi-webhook mini-service /send-whatsapp
// endpoint (server-to-server, direct localhost:3003 call).
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { logActivity } from '@/lib/audit'

const VAPI_WEBHOOK_BASE = process.env.VAPI_WEBHOOK_BASE || 'http://localhost:3003'
const PRADHAN_WHATSAPP = (process.env.ADMIN_WHATSAPP || '9651035021').replace(/[^\d]/g, '')

/** Server-side helper: POST { to, message } to the vapi-webhook mini-service. */
async function sendWhatsApp(to: string, message: string): Promise<void> {
  if (!to || !message) return
  try {
    await fetch(`${VAPI_WEBHOOK_BASE}/send-whatsapp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, message }),
    })
  } catch (e) {
    // never break the main flow if WhatsApp dispatch fails
    console.error('[complaints/update] WhatsApp dispatch failed:', e)
  }
}

const STATUS_LABEL_HI: Record<string, string> = {
  Pending: 'लंबित',
  InProgress: 'प्रगति पर',
  Resolved: 'हल',
  Rejected: 'अस्वीकृत',
}

export async function POST(req: NextRequest) {
  const user = await requireRole(req.headers.get('cookie'), 'secretary')
  if (!user) return NextResponse.json({ error: 'unauthorized', message: 'संपादक या उच्च अनुमति आवश्यक' }, { status: 403 })

  const body = await req.json()
  const { trackingId, status, resolutionNote, assignedToId } = body
  if (!trackingId || !status) {
    return NextResponse.json({ error: 'missing fields' }, { status: 400 })
  }
  const valid = ['Pending', 'InProgress', 'Resolved', 'Rejected']
  if (!valid.includes(status)) {
    return NextResponse.json({ error: 'invalid status' }, { status: 400 })
  }

  const existing = await db.complaint.findUnique({ where: { trackingId } })
  if (!existing) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  // Append to timeline
  const oldTimeline = existing.timeline ? JSON.parse(existing.timeline) : []
  const newEntry = {
    status,
    ts: new Date().toISOString(),
    note: resolutionNote || `Status changed to ${status}`,
    by: user.id,
  }
  const newTimeline = [...oldTimeline, newEntry]

  const updated = await db.complaint.update({
    where: { trackingId },
    data: {
      status,
      resolutionNote: resolutionNote ?? existing.resolutionNote,
      resolvedAt: status === 'Resolved' || status === 'Rejected' ? new Date() : existing.resolvedAt,
      assignedToId: assignedToId ?? existing.assignedToId,
      timeline: JSON.stringify(newTimeline),
    },
  })

  await logActivity({
    adminId: user.id,
    action: 'update',
    entityType: 'complaint',
    entityId: trackingId,
    before: { status: existing.status, resolutionNote: existing.resolutionNote },
    after: { status, resolutionNote },
    ip: req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || undefined,
    userAgent: req.headers.get('user-agent') || undefined,
  })

  // ─── WhatsApp notifications (citizen + Pradhan) ───────────────────────
  // Only fire when the status actually changed (don't spam on no-op updates)
  if (existing.status !== status) {
    const statusHi = STATUS_LABEL_HI[status] || status
    const note = resolutionNote ? `\nनोट: ${resolutionNote}` : ''

    // 1. Notify the citizen
    if (existing.callerPhone) {
      const citizenMsg =
        `आपकी शिकायत ${trackingId} की स्थिति अपडेट हुई है: ${statusHi}.${note}\n— ग्राम पंचायत चंद्रा`
      await sendWhatsApp(existing.callerPhone, citizenMsg)
    }

    // 2. Notify the Pradhan
    const pradhanMsg =
      `शिकायत ${trackingId} स्थिति बदली गई: ${statusHi}.\n` +
      `नागरिक: ${existing.callerName}.${note}\n— ग्राम पंचायत चंद्रा (एडमिन अपडेट)`
    await sendWhatsApp(PRADHAN_WHATSAPP, pradhanMsg)
  }

  return NextResponse.json({ ok: true, complaint: updated })
}
