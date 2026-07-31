// Public: get pradhan / secretary / site_config
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const key = url.searchParams.get('key') // pradhan | secretary | site_config
  if (key) {
    const row = await db.siteSettings.findUnique({ where: { key } })
    if (!row) return NextResponse.json({ error: 'not_found' }, { status: 404 })
    return NextResponse.json({ key: row.key, value: JSON.parse(row.value), updatedAt: row.updatedAt })
  }
  const rows = await db.siteSettings.findMany()
  const out: Record<string, unknown> = {}
  for (const r of rows) out[r.key] = JSON.parse(r.value)
  return NextResponse.json(out)
}

// Admin: update pradhan / secretary / site_config
import { NextRequest } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { logActivity } from '@/lib/audit'

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req.headers.get('cookie'))
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = await req.json()
  const { key, value } = body
  if (!key || !value) return NextResponse.json({ error: 'missing fields' }, { status: 400 })

  const allowed = ['pradhan', 'secretary', 'site_config']
  if (!allowed.includes(key)) return NextResponse.json({ error: 'invalid key' }, { status: 400 })

  const existing = await db.siteSettings.findUnique({ where: { key } })
  const updated = await db.siteSettings.upsert({
    where: { key },
    update: { value: JSON.stringify(value), updatedBy: user.id },
    create: { key, value: JSON.stringify(value), updatedBy: user.id },
  })

  await logActivity({
    adminId: user.id,
    action: 'update',
    entityType: key === 'site_config' ? 'site_config' : (key as 'pradhan' | 'secretary'),
    entityId: key,
    before: existing ? JSON.parse(existing.value) : null,
    after: value,
    ip: req.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
    userAgent: req.headers.get('user-agent') || undefined,
  })

  return NextResponse.json({ ok: true, key: updated.key, updatedAt: updated.updatedAt })
}
