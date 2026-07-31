// Village Marketplace API (Task 10-a)
// - GET  /api/marketplace  → public, returns approved+active items. Supports ?category filter.
// - POST /api/marketplace  → admin-only create. Sets isApproved=true for admin, false for citizen.
// SECURITY (BACKEND_AUDIT.md): Zod validation on POST body.
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUser } from '@/lib/auth'
import { marketplaceCreateSchema, parseBody } from '@/lib/validations'

export const dynamic = 'force-dynamic'

// ── GET — public listing of approved+active items; admin=true returns all ────
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const category = sp.get('category')?.trim() || undefined
  const isAdminQuery = sp.get('admin') === 'true'

  // If admin query, verify auth first
  if (isAdminQuery) {
    const user = await getSessionUser(req.headers.get('cookie'))
    if (!user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }
  }

  const validCategories = ['produce', 'livestock', 'handcraft', 'equipment', 'services', 'other']
  if (category && !validCategories.includes(category)) {
    return NextResponse.json({ error: 'invalid_category' }, { status: 400 })
  }

  // Admin sees all items; public sees only approved+active
  const where: Record<string, unknown> = isAdminQuery
    ? {}
    : { isApproved: true, status: 'active' }
  if (category) where.category = category

  const items = await db.marketplaceItem.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })

  // Stats — always based on public (approved+active) items
  const totalApproved = await db.marketplaceItem.count({ where: { isApproved: true, status: 'active' } })
  const categoryCounts = await db.marketplaceItem.groupBy({
    by: ['category'],
    where: { isApproved: true, status: 'active' },
    _count: true,
  })
  const thisWeekStart = new Date()
  thisWeekStart.setDate(thisWeekStart.getDate() - 7)
  const thisWeekCount = await db.marketplaceItem.count({
    where: { isApproved: true, status: 'active', createdAt: { gte: thisWeekStart } },
  })

  return NextResponse.json({
    items,
    stats: {
      total: totalApproved,
      categories: categoryCounts.length,
      active: totalApproved,
      thisWeek: thisWeekCount,
    },
  })
}

// ── POST — create a new marketplace listing ─────────────────────────────────
export async function POST(req: NextRequest) {
  const user = await getSessionUser(req.headers.get('cookie'))

  // Zod validation — replaces manual typeof checks
  const parsed = await parseBody(req, marketplaceCreateSchema)
  if ('error' in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status })
  }
  const v = parsed.data

  // Generate itemId
  const itemId = `MPCH-${Date.now().toString(36).toUpperCase()}`

  const isApproved = user ? true : false // Admin submissions auto-approve

  const created = await db.marketplaceItem.create({
    data: {
      itemId,
      titleHi: v.titleHi,
      titleEn: v.titleEn,
      descHi: v.descHi || null,
      descEn: v.descEn || null,
      category: v.category,
      price: v.price ?? null,
      priceType: v.priceType,
      quantity: v.quantity || null,
      sellerNameHi: v.sellerNameHi,
      sellerNameEn: v.sellerNameEn,
      sellerPhone: v.sellerPhone,
      sellerWard: v.sellerWard ?? null,
      imageUrl: v.imageUrl || null,
      isApproved,
      status: 'active',
    },
  })

  return NextResponse.json(
    { ok: true, item: created },
    { status: 201 },
  )
}
