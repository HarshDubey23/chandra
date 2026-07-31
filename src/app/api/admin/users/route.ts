// Admin user management API — list users + create new user.
// Master doc §5.3. Admin-only (requireRole 'admin').
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole, hashPassword } from '@/lib/auth'
import { logActivity } from '@/lib/audit'

export async function GET(req: NextRequest) {
  const user = await requireRole(req.headers.get('cookie'), 'admin')
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 403 })

  const users = await db.user.findMany({
    select: { id: true, email: true, name: true, role: true, phone: true, createdAt: true, updatedAt: true },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json({ users })
}

export async function POST(req: NextRequest) {
  const user = await requireRole(req.headers.get('cookie'), 'admin')
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 403 })

  let body: { name?: string; email?: string; password?: string; role?: string; phone?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }) }

  const name = (body.name || '').trim()
  const email = (body.email || '').trim().toLowerCase()
  const password = (body.password || '').trim()
  const role = ['admin', 'secretary', 'viewer'].includes(body.role || '') ? body.role! : 'viewer'
  const phone = (body.phone || '').trim() || null

  if (!name || !email || !password) return NextResponse.json({ error: 'missing_fields', message: 'नाम, ईमेल एवं पासवर्ड आवश्यक' }, { status: 400 })
  if (password.length < 6) return NextResponse.json({ error: 'weak_password', message: 'पासवर्ड कम से कम 6 अक्षर का हो' }, { status: 400 })

  // Check email uniqueness
  const existing = await db.user.findUnique({ where: { email } })
  if (existing) return NextResponse.json({ error: 'email_exists', message: 'यह ईमेल पहले से पंजीकृत है' }, { status: 409 })

  try {
    const newUser = await db.user.create({
      data: { name, email, passwordHash: hashPassword(password), role, phone },
      select: { id: true, email: true, name: true, role: true, phone: true, createdAt: true },
    })
    await logActivity({
      adminId: user.id, action: 'create', entityType: 'user', entityId: newUser.id,
      after: { name, email, role },
      ip: req.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
      userAgent: req.headers.get('user-agent') || undefined,
    })
    return NextResponse.json({ ok: true, user: newUser })
  } catch (e) {
    return NextResponse.json({ error: 'db_error', message: String(e).slice(0, 200) }, { status: 500 })
  }
}
