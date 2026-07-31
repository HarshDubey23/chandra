// Single user management — PATCH (edit role/name, reset password) + DELETE.
// Master doc §5.3. Admin-only.
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole, hashPassword } from '@/lib/auth'
import { logActivity } from '@/lib/audit'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const currentUser = await requireRole(req.headers.get('cookie'), 'admin')
  if (!currentUser) return NextResponse.json({ error: 'unauthorized' }, { status: 403 })
  const { id } = await params

  let body: { name?: string; role?: string; phone?: string; password?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }) }

  const existing = await db.user.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  // Prevent self-demotion (admin can't remove their own admin role)
  if (id === currentUser.id && body.role && body.role !== 'admin') {
    return NextResponse.json({ error: 'self_demotion', message: 'आप अपनी एडमिन भूमिका नहीं हटा सकते' }, { status: 400 })
  }

  const data: Record<string, unknown> = {}
  if (typeof body.name === 'string' && body.name.trim()) data.name = body.name.trim()
  if (typeof body.phone === 'string') data.phone = body.phone.trim() || null
  if (['admin', 'secretary', 'viewer'].includes(body.role || '')) data.role = body.role
  if (typeof body.password === 'string' && body.password.length >= 6) {
    data.passwordHash = hashPassword(body.password)
  }

  if (Object.keys(data).length === 0) return NextResponse.json({ error: 'no_changes' }, { status: 400 })

  try {
    const updated = await db.user.update({
      where: { id },
      data,
      select: { id: true, email: true, name: true, role: true, phone: true, updatedAt: true },
    })
    await logActivity({
      adminId: currentUser.id, action: 'update', entityType: 'user', entityId: id,
      before: { name: existing.name, role: existing.role, phone: existing.phone },
      after: data,
      ip: req.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
      userAgent: req.headers.get('user-agent') || undefined,
    })
    return NextResponse.json({ ok: true, user: updated })
  } catch (e) {
    return NextResponse.json({ error: 'db_error', message: String(e).slice(0, 200) }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const currentUser = await requireRole(req.headers.get('cookie'), 'admin')
  if (!currentUser) return NextResponse.json({ error: 'unauthorized' }, { status: 403 })
  const { id } = await params

  // Prevent self-deletion
  if (id === currentUser.id) {
    return NextResponse.json({ error: 'self_delete', message: 'आप अपना खाता नहीं हटा सकते' }, { status: 400 })
  }

  const existing = await db.user.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  await db.user.delete({ where: { id } })
  await logActivity({
    adminId: currentUser.id, action: 'delete', entityType: 'user', entityId: id,
    before: { name: existing.name, email: existing.email, role: existing.role },
    ip: req.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
    userAgent: req.headers.get('user-agent') || undefined,
  })
  return NextResponse.json({ ok: true })
}
