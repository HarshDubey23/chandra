// Citizen notification subscription — citizens subscribe to complaint status updates.
// Master doc §9.2. Public POST (no auth) to subscribe, GET to check subscription status.
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET — check if a tracking ID has active subscriptions
export async function GET(req: NextRequest) {
  const trackingId = req.nextUrl.searchParams.get('trackingId')?.trim().toUpperCase()
  if (!trackingId) return NextResponse.json({ error: 'missing_trackingId' }, { status: 400 })

  const subs = await db.notificationSubscription.findMany({
    where: { trackingId, active: true },
    select: { id: true, channel: true, phone: true, createdAt: true },
  })
  return NextResponse.json({ subscribed: subs.length > 0, subscriptions: subs })
}

// POST — subscribe to notifications for a tracking ID
export async function POST(req: NextRequest) {
  let body: { trackingId?: string; phone?: string; channel?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }) }

  const trackingId = (body.trackingId || '').trim().toUpperCase()
  const phone = (body.phone || '').trim().replace(/[^\d+]/g, '')
  const channel = ['sms', 'whatsapp', 'both'].includes(body.channel || '') ? body.channel! : 'sms'

  if (!trackingId) return NextResponse.json({ error: 'missing_trackingId', message: 'ट्रैकिंग आईडी आवश्यक' }, { status: 400 })
  if (phone.length < 10) return NextResponse.json({ error: 'missing_phone', message: 'सही 10-अंकीय फ़ोन नंबर आवश्यक' }, { status: 400 })

  // Verify complaint exists
  const complaint = await db.complaint.findUnique({ where: { trackingId } })
  if (!complaint) return NextResponse.json({ error: 'not_found', message: 'यह शिकायत नहीं मिली' }, { status: 404 })

  // Check if already subscribed with this phone
  const existing = await db.notificationSubscription.findFirst({
    where: { trackingId, phone, active: true },
  })
  if (existing) {
    return NextResponse.json({ ok: true, message: 'पहले से सदस्यता ली हुई है', subscription: existing })
  }

  // Create subscription
  const sub = await db.notificationSubscription.create({
    data: { trackingId, phone, channel },
  })

  return NextResponse.json({
    ok: true,
    message: 'सदस्यता सफल! शिकायत की स्थिति बदने पर आपको सूचित किया जाएगा।',
    subscription: { id: sub.id, trackingId: sub.trackingId, channel: sub.channel },
  })
}

// DELETE — unsubscribe
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'missing_id' }, { status: 400 })
  await db.notificationSubscription.update({ where: { id }, data: { active: false } })
  return NextResponse.json({ ok: true, message: 'सदस्यता रद्द की गई' })
}
