// Citizen signup — creates a new viewer account + notifies admin via WhatsApp
import { NextRequest, NextResponse } from 'next/server'
import { hashPassword } from '@/lib/auth'
import { COOKIE_NAME, createSessionToken } from '@/lib/auth'
import { db } from '@/lib/db'
import { signupSchema } from '@/lib/validations'

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const parsed = signupSchema.safeParse(body)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]
    const msgMap: Record<string, string> = {
      password_too_short: 'Password must be at least 6 characters',
      email_exists: 'This email is already registered',
    }
    return NextResponse.json(
      { error: firstError?.message || 'validation_error', message: msgMap[firstError?.message || ''] || firstError?.message },
      { status: 400 }
    )
  }

  const { name, email, phone, password } = parsed.data

  // Check if email already exists
  const existing = await db.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'email_exists' }, { status: 409 })
  }

  // Create new viewer user
  const user = await db.user.create({
    data: {
      name,
      email,
      phone: 'MOB_' + phone.slice(-4), // Store partial for privacy
      passwordHash: hashPassword(password),
      role: 'viewer',
    },
  })

  // Create session token
  const token = createSessionToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as 'admin' | 'secretary' | 'viewer',
  })

  // ── Send WhatsApp notification to admin about new registration ──
  // This calls the vapi-webhook mini-service which dispatches via Meta/Twilio/mock
  const adminWhatsapp = process.env.ADMIN_WHATSAPP || '919651035021'
  const webhookBase = process.env.VAPI_WEBHOOK_BASE || 'http://localhost:3003'
  const message = `🆕 नया निवासी पंजीकरण / New Resident Registration\n\nनाम/Name: ${name}\nईमेल/Email: ${email}\nफोन/Phone: +91 ${phone}\n\nकृपया सत्यापित करें / Please verify.\n— ग्राम पंचायत चंद्रा`
  try {
    await fetch(`${webhookBase}/send-whatsapp?XTransformPort=3003`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: adminWhatsapp, message }),
    })
  } catch {
    // Non-fatal — registration succeeds even if WhatsApp fails
  }

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
