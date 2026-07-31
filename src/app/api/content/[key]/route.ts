// Dynamic content API — public GET + admin PUT for ContentSection data.
// Master doc §4.3. Allows admin to update village stats, infrastructure,
// education, health, scheme coverage etc. without code changes.
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUser, requireRole } from '@/lib/auth'
import { logActivity } from '@/lib/audit'

export async function GET(req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params
  const section = await db.contentSection.findUnique({ where: { key } })
  if (!section) return NextResponse.json({ error: 'not_found', key }, { status: 404 })
  try {
    return NextResponse.json({ key, data: JSON.parse(section.data), updatedAt: section.updatedAt })
  } catch {
    return NextResponse.json({ key, data: null, updatedAt: section.updatedAt })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const user = await requireRole(req.headers.get('cookie'), 'admin')
  if (!user) return NextResponse.json({ error: 'unauthorized', message: 'सुपर एडमिन अनुमति आवश्यक' }, { status: 403 })
  const { key } = await params

  let body: { data?: unknown }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }) }
  if (!body.data || typeof body.data !== 'object') return NextResponse.json({ error: 'missing_data' }, { status: 400 })

  const dataStr = JSON.stringify(body.data)
  const existing = await db.contentSection.findUnique({ where: { key } })

  const section = await db.contentSection.upsert({
    where: { key },
    update: { data: dataStr, updatedBy: user.id },
    create: { key, data: dataStr, updatedBy: user.id },
  })

  await logActivity({
    adminId: user.id,
    action: 'update',
    entityType: 'content_section',
    entityId: key,
    before: existing ? { data: existing.data } : null,
    after: { data: dataStr },
    ip: req.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
    userAgent: req.headers.get('user-agent') || undefined,
  })

  return NextResponse.json({ ok: true, key, updatedAt: section.updatedAt })
}
