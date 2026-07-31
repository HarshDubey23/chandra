// Blog posts API — public GET (published only) + admin POST (create).
// Master doc §4.2.
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUser, requireRole } from '@/lib/auth'
import { logActivity } from '@/lib/audit'

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req.headers.get('cookie'))
  const category = req.nextUrl.searchParams.get('category')
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') || '20'), 50)

  const where: { status?: string; category?: string } = {}
  // Public users see only published; admins see all (drafts + archived)
  if (!user) where.status = 'published'
  if (category && category !== 'all') where.category = category

  const posts = await db.post.findMany({
    where,
    orderBy: { publishedAt: 'desc' },
    take: limit,
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      coverImage: true,
      category: true,
      status: true,
      tags: true,
      publishedAt: true,
      createdAt: true,
      author: { select: { name: true } },
    },
  })

  return NextResponse.json({ posts })
}

export async function POST(req: NextRequest) {
  const user = await requireRole(req.headers.get('cookie'), 'secretary')
  if (!user) return NextResponse.json({ error: 'unauthorized', message: 'संपादक या उच्च अनुमति आवश्यक' }, { status: 403 })

  let body: { title?: string; slug?: string; excerpt?: string; content?: string; coverImage?: string; category?: string; status?: string; tags?: string[] }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const title = (body.title || '').trim()
  let slug = (body.slug || '').trim()
  if (!slug) slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  if (!title || !slug) return NextResponse.json({ error: 'missing_title' }, { status: 400 })
  if (!body.content || body.content.trim().length < 10) return NextResponse.json({ error: 'missing_content' }, { status: 400 })

  const excerpt = (body.excerpt || '').trim() || body.content.replace(/<[^>]+>/g, '').slice(0, 160) + '...'
  const status = body.status === 'published' ? 'published' : 'draft'
  const category = ['announcement', 'scheme', 'news', 'meeting', 'notice'].includes(body.category || '') ? body.category! : 'news'
  const tags = JSON.stringify(body.tags || [])

  try {
    const post = await db.post.create({
      data: {
        title,
        slug,
        excerpt,
        content: body.content!,
        coverImage: body.coverImage || null,
        category,
        status,
        tags,
        authorId: user.id,
        publishedAt: status === 'published' ? new Date() : null,
      },
    })
    await logActivity({
      adminId: user.id,
      action: 'create',
      entityType: 'post',
      entityId: post.id,
      after: { title, slug, status, category },
      ip: req.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
      userAgent: req.headers.get('user-agent') || undefined,
    })
    return NextResponse.json({ ok: true, post })
  } catch (e) {
    const msg = String(e)
    if (msg.includes('Unique constraint')) {
      return NextResponse.json({ error: 'slug_exists', message: 'यह slug पहले से मौजूद है' }, { status: 409 })
    }
    return NextResponse.json({ error: 'db_error', message: msg.slice(0, 200) }, { status: 500 })
  }
}
