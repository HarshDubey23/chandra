// OTP verify — verifies the OTP and logs in the user (or creates a new viewer account)
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { db } from '@/lib/db'
import { COOKIE_NAME, createSessionToken, hashPassword } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { phone, otp, name } = body

  if (!phone || !otp) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 })
  }

  const normalizedPhone = phone.replace(/\D/g, '').slice(-10)

  // Look up the stored OTP
  const otpRecord = await db.siteSettings.findUnique({
    where: { key: `otp_${normalizedPhone}` },
  })

  if (!otpRecord) {
    return NextResponse.json({ error: 'otp_not_found' }, { status: 404 })
  }

  const stored = JSON.parse(otpRecord.value)

  // Check expiry
  if (Date.now() > new Date(stored.expiresAt).getTime()) {
    await db.siteSettings.delete({ where: { key: `otp_${normalizedPhone}` } })
    return NextResponse.json({ error: 'otp_expired' }, { status: 410 })
  }

  // Verify OTP
  if (stored.otp !== otp) {
    return NextResponse.json({ error: 'otp_invalid' }, { status: 401 })
  }

  // OTP is valid — find or create user
  let user = await db.user.findFirst({ where: { phone: { contains: normalizedPhone } } })

  if (!user) {
    // Create a new viewer account with phone-based login
    const email = `phone_${normalizedPhone}@chandra-gp.in`
    user = await db.user.create({
      data: {
        name: name || `Citizen ${normalizedPhone.slice(-4)}`,
        email,
        phone: normalizedPhone,
        passwordHash: hashPassword(crypto.randomUUID()), // random password — OTP-only login
        role: 'viewer',
      },
    })
  }

  // Clean up the OTP record
  await db.siteSettings.delete({ where: { key: `otp_${normalizedPhone}` } }).catch(() => {})

  // Create session
  const token = createSessionToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as 'admin' | 'secretary' | 'viewer',
  })

  const res = NextResponse.json({
    ok: true,
    user: { id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone },
  })

  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  return res
}
