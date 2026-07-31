// OTP send — generates a 6-digit OTP for phone-based login
// In production this would send via SMS/WhatsApp. For demo, returns the OTP.
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import crypto from 'node:crypto'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { phone } = body

  if (!phone) {
    return NextResponse.json({ error: 'phone_required' }, { status: 400 })
  }

  // Normalize phone (remove +91, spaces)
  const normalizedPhone = phone.replace(/\D/g, '').slice(-10)

  if (normalizedPhone.length !== 10) {
    return NextResponse.json({ error: 'invalid_phone' }, { status: 400 })
  }

  // Check if any user has this phone
  const user = await db.user.findFirst({ where: { phone: { contains: normalizedPhone } } })

  // Generate 6-digit OTP
  const otp = String(crypto.randomInt(100000, 999999))
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

  // Store OTP in SiteSettings
  await db.siteSettings.upsert({
    where: { key: `otp_${normalizedPhone}` },
    update: { value: JSON.stringify({ otp, expiresAt: expiresAt.toISOString(), userId: user?.id || null }) },
    create: { key: `otp_${normalizedPhone}`, value: JSON.stringify({ otp, expiresAt: expiresAt.toISOString(), userId: user?.id || null }) },
  })

  // In production: send OTP via SMS/WhatsApp API
  // For demo: return the OTP so the UI can display it
  return NextResponse.json({
    ok: true,
    message: `OTP sent to +91 ${normalizedPhone}`,
    registered: !!user,
    // Demo only — remove in production:
    demoOtp: otp,
    demoExpiry: expiresAt.toISOString(),
  })
}
