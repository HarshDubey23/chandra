// Public: list announcements (active, non-expired); Admin: full CRUD
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUser, requireRole } from '@/lib/auth'
import { logActivity } from '@/lib/audit'

export async function GET() {
  const now = new Date()
  const items = await db.announcement.findMany({
    where: {
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
  })
  return NextResponse.json({ announcements: items })
}

export async function POST(req: NextRequest) {
  const user = await requireRole(req.headers.get('cookie'), 'secretary')
  if (!user) return NextResponse.json({ error: 'unauthorized', message: 'संपादक या उच्च अनुमति आवश्यक' }, { status: 403 })

  const body = await req.json()
  const { titleHi, titleEn, bodyHi, bodyEn, pinned, expiresAt } = body
  if (!titleHi || !titleEn || !bodyHi || !bodyEn) {
    return NextResponse.json({ error: 'missing fields' }, { status: 400 })
  }
  const created = await db.announcement.create({
    data: {
      titleHi, titleEn, bodyHi, bodyEn,
      pinned: !!pinned,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdBy: user.id,
    },
  })
  await logActivity({
    adminId: user.id, action: 'create', entityType: 'announcement', entityId: created.id,
    after: { titleHi, titleEn }, ip: req.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
    userAgent: req.headers.get('user-agent') || undefined,
  })
  return NextResponse.json({ ok: true, announcement: created })
}

export async function DELETE(req: NextRequest) {
  const user = await requireRole(req.headers.get('cookie'), 'admin')
  if (!user) return NextResponse.json({ error: 'unauthorized', message: 'सुपर एडमिन अनुमति आवश्यक' }, { status: 403 })
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 })
  const existing = await db.announcement.findUnique({ where: { id } })
  await db.announcement.delete({ where: { id } })
  await logActivity({
    adminId: user.id, action: 'delete', entityType: 'announcement', entityId: id,
    before: existing, ip: req.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
    userAgent: req.headers.get('user-agent') || undefined,
  })
  return NextResponse.json({ ok: true })
}
