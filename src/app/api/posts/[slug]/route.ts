// Single post API — public GET (by slug) + admin PATCH (edit) + DELETE.
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUser, requireRole } from '@/lib/auth'
import { logActivity } from '@/lib/audit'

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const user = await getSessionUser(req.headers.get('cookie'))
  const post = await db.post.findUnique({ where: { slug }, include: { author: { select: { name: true } } } })
  if (!post) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  // Non-admins cannot see drafts/archived
  if (!user && post.status !== 'published') return NextResponse.json({ error: 'not_found' }, { status: 404 })
  return NextResponse.json({ post })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const user = await requireRole(req.headers.get('cookie'), 'secretary')
  if (!user) return NextResponse.json({ error: 'unauthorized', message: 'संपादक या उच्च अनुमति आवश्यक' }, { status: 403 })
  const { slug } = await params
  const existing = await db.post.findUnique({ where: { slug } })
  if (!existing) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }) }

  const data: Record<string, unknown> = {}
  if (typeof body.title === 'string') data.title = body.title
  if (typeof body.slug === 'string' && body.slug !== slug) data.slug = body.slug
  if (typeof body.excerpt === 'string') data.excerpt = body.excerpt
  if (typeof body.content === 'string') data.content = body.content
  if (typeof body.coverImage === 'string') data.coverImage = body.coverImage
  if (typeof body.category === 'string') data.category = body.category
  if (Array.isArray(body.tags)) data.tags = JSON.stringify(body.tags)
  if (typeof body.status === 'string') {
    data.status = body.status
    // Set publishedAt when transitioning to published
    if (body.status === 'published' && !existing.publishedAt) data.publishedAt = new Date()
  }

  try {
    const updated = await db.post.update({ where: { slug }, data })
    await logActivity({
      adminId: user.id,
      action: 'update',
      entityType: 'post',
      entityId: updated.id,
      before: { title: existing.title, status: existing.status, category: existing.category },
      after: data,
      ip: req.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
      userAgent: req.headers.get('user-agent') || undefined,
    })
    return NextResponse.json({ ok: true, post: updated })
  } catch (e) {
    return NextResponse.json({ error: 'db_error', message: String(e).slice(0, 200) }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const user = await requireRole(req.headers.get('cookie'), 'admin')
  if (!user) return NextResponse.json({ error: 'unauthorized', message: 'सुपर एडमिन अनुमति आवश्यक' }, { status: 403 })
  const { slug } = await params
  const existing = await db.post.findUnique({ where: { slug } })
  if (!existing) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  await db.post.delete({ where: { slug } })
  await logActivity({
    adminId: user.id,
    action: 'delete',
    entityType: 'post',
    entityId: existing.id,
    before: { title: existing.title, slug: existing.slug },
    ip: req.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
    userAgent: req.headers.get('user-agent') || undefined,
  })
  return NextResponse.json({ ok: true })
}
