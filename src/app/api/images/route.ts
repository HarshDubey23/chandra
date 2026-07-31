// Public: list images (only isPublic); Admin: full CRUD + toggle public + category
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUser } from '@/lib/auth'
import { logActivity } from '@/lib/audit'

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req.headers.get('cookie'))
  const category = req.nextUrl.searchParams.get('category')
  const where: { isPublic?: boolean; category?: { startsWith: string } } = {}
  if (!user) where.isPublic = true
  if (category && category !== 'all') where.category = { startsWith: category }
  const images = await db.imageAsset.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ images })
}

export async function PATCH(req: NextRequest) {
  const user = await getSessionUser(req.headers.get('cookie'))
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const body = await req.json()
  const { imageId, hiCaption, enCaption, category, isPublic } = body
  if (!imageId) return NextResponse.json({ error: 'missing imageId' }, { status: 400 })
  const existing = await db.imageAsset.findUnique({ where: { imageId } })
  if (!existing) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  const updated = await db.imageAsset.update({
    where: { imageId },
    data: {
      ...(hiCaption !== undefined && { hiCaption }),
      ...(enCaption !== undefined && { enCaption }),
      ...(category !== undefined && { category }),
      ...(isPublic !== undefined && { isPublic }),
    },
  })
  await logActivity({
    adminId: user.id, action: 'update', entityType: 'image', entityId: imageId,
    before: { hiCaption: existing.hiCaption, enCaption: existing.enCaption, category: existing.category, isPublic: existing.isPublic },
    after: { hiCaption, enCaption, category, isPublic },
    ip: req.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
    userAgent: req.headers.get('user-agent') || undefined,
  })
  return NextResponse.json({ ok: true, image: updated })
}
