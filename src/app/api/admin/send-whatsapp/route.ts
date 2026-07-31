// Admin: send a WhatsApp message to any phone number.
// POST /api/admin/send-whatsapp  body: { to: "9876543210", message: "..." }
// Requires admin/secretary auth. Proxies to the vapi-webhook mini-service
// on port 3003 which handles real-or-mock dispatch.
import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { logActivity } from '@/lib/audit'

export async function POST(req: NextRequest) {
  const user = await requireRole(req.headers.get('cookie'), 'secretary')
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const to = String(body?.to || '').replace(/[^\d]/g, '')
    const message = String(body?.message || '').trim()

    if (to.length < 7) {
      return NextResponse.json(
        { error: 'invalid_phone', message: 'कृपया सही मोबाइल नंबर दर्ज करें' },
        { status: 400 }
      )
    }
    if (message.length < 1) {
      return NextResponse.json(
        { error: 'empty_message', message: 'संदेश खाली नहीं हो सकता' },
        { status: 400 }
      )
    }
    if (message.length > 4000) {
      return NextResponse.json(
        { error: 'message_too_long', message: 'संदेश 4000 अक्षरों से कम होना चाहिए' },
        { status: 400 }
      )
    }

    // Proxy to the vapi-webhook mini-service (server-side, no gateway needed)
    const upstreamRes = await fetch('http://localhost:3003/send-whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, message }),
    })

    const data = await upstreamRes.json().catch(() => ({ ok: false }))

    // Audit log
    await logActivity({
      adminId: user.id,
      action: 'send_whatsapp',
      entityType: 'citizen',
      entityId: to,
      before: null,
      after: { to, message_length: message.length, preview: message.slice(0, 80) },
      ip: req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || undefined,
      userAgent: req.headers.get('user-agent') || undefined,
    })

    if (!upstreamRes.ok) {
      return NextResponse.json(
        { error: 'dispatch_failed', message: 'व्हाट्सएप भेजने में विफल', upstream: data },
        { status: 502 }
      )
    }

    return NextResponse.json({
      ok: true,
      to,
      message_length: message.length,
      dispatched: data?.ok ?? false,
    })
  } catch (err) {
    console.error('[admin/send-whatsapp] error:', err)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
