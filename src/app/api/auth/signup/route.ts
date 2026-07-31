// Citizen signup — creates a new viewer account
import { NextRequest, NextResponse } from 'next/server'
import { hashPassword } from '@/lib/auth'
import { COOKIE_NAME, createSessionToken } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, email, phone, password } = body

  if (!name || !email || !phone || !password) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 })
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'password_too_short' }, { status: 400 })
  }

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
      phone,
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
