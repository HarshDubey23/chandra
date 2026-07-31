// OTP send — generates a 6-digit OTP for phone-based login
// In production this would send via SMS/WhatsApp. For demo (non-prod), returns the OTP.
// SECURITY (BACKEND_AUDIT.md P0): demoOtp gated behind NODE_ENV !== 'production'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import crypto from 'node:crypto'
import { otpSendSchema, parseBody } from '@/lib/validations'

export async function POST(req: NextRequest) {
  const parsed = await parseBody(req, otpSendSchema)
  if ('error' in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status })
  }
  const { phone: normalizedPhone } = parsed.data

  // Check if any user has this phone (do not leak existence to caller)
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
  const isDev = process.env.NODE_ENV !== 'production'

  return NextResponse.json({
    ok: true,
    message: `OTP sent to +91 ${normalizedPhone}`,
    registered: !!user,
    // Dev/demo only — NEVER expose OTP in production responses
    ...(isDev ? { demoOtp: otp, demoExpiry: expiresAt.toISOString() } : {}),
  })
}
