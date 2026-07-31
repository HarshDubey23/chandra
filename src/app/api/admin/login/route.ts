// Admin login
import { NextRequest, NextResponse } from 'next/server'
import { authenticate, COOKIE_NAME } from '@/lib/auth'
import { db } from '@/lib/db'
import { logActivity } from '@/lib/audit'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { email, password } = body
  if (!email || !password) return NextResponse.json({ error: 'missing fields' }, { status: 400 })

  // rate limit: 5 per minute per IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || 'unknown'
  const recent = await db.adminActivityLog.count({
    where: {
      action: 'login',
      ip,
      createdAt: { gt: new Date(Date.now() - 60_000) },
    },
  })
  if (recent >= 5) return NextResponse.json({ error: 'rate_limited' }, { status: 429 })

  const token = await authenticate(email, password)
  if (!token) {
    await logActivity({
      action: 'login', entityType: 'auth',
      after: { success: false, email }, ip, userAgent: req.headers.get('user-agent') || undefined,
    })
    return NextResponse.json({ error: 'invalid_credentials' }, { status: 401 })
  }

  const user = await db.user.findUnique({ where: { email } })
  await logActivity({
    adminId: user?.id, action: 'login', entityType: 'auth',
    after: { success: true, email }, ip, userAgent: req.headers.get('user-agent') || undefined,
  })

  const res = NextResponse.json({ ok: true, user: { id: user!.id, email, name: user!.name, role: user!.role } })
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
  return res
}
