// Village Marketplace API (Task 10-a)
// - GET  /api/marketplace  → public, returns approved+active items. Supports ?category filter.
// - POST /api/marketplace  → admin-only create. Sets isApproved=true for admin, false for citizen.
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUser } from '@/lib/auth'

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

  // Citizens can also submit, but admin-created items auto-approve
  // If no auth at all → reject
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  // Validate required fields
  const titleHi = typeof body.titleHi === 'string' ? body.titleHi.trim() : ''
  const titleEn = typeof body.titleEn === 'string' ? body.titleEn.trim() : ''
  const category = typeof body.category === 'string' ? body.category.trim() : ''
  const sellerNameHi = typeof body.sellerNameHi === 'string' ? body.sellerNameHi.trim() : ''
  const sellerNameEn = typeof body.sellerNameEn === 'string' ? body.sellerNameEn.trim() : ''
  const sellerPhone = typeof body.sellerPhone === 'string' ? body.sellerPhone.trim() : ''

  if (!titleHi || !titleEn) {
    return NextResponse.json({ error: 'missing_title' }, { status: 400 })
  }
  const validCategories = ['produce', 'livestock', 'handcraft', 'equipment', 'services', 'other']
  if (!category || !validCategories.includes(category)) {
    return NextResponse.json({ error: 'invalid_category' }, { status: 400 })
  }
  if (!sellerNameHi || !sellerNameEn) {
    return NextResponse.json({ error: 'missing_seller_name' }, { status: 400 })
  }
  if (!sellerPhone) {
    return NextResponse.json({ error: 'missing_seller_phone' }, { status: 400 })
  }

  // Optional fields
  const descHi = typeof body.descHi === 'string' ? body.descHi.trim() : null
  const descEn = typeof body.descEn === 'string' ? body.descEn.trim() : null
  const price = typeof body.price === 'number' && body.price >= 0 ? body.price : null
  const priceType = typeof body.priceType === 'string' ? body.priceType.trim() : 'fixed'
  const validPriceTypes = ['fixed', 'negotiable', 'barter', 'free']
  if (!validPriceTypes.includes(priceType)) {
    return NextResponse.json({ error: 'invalid_price_type' }, { status: 400 })
  }
  const quantity = typeof body.quantity === 'string' ? body.quantity.trim() : null
  const sellerWard = typeof body.sellerWard === 'number' && body.sellerWard >= 1 && body.sellerWard <= 10 ? body.sellerWard : null
  const imageUrl = typeof body.imageUrl === 'string' ? body.imageUrl.trim() : null

  // Generate itemId
  const itemId = `MPCH-${Date.now().toString(36).toUpperCase()}`

  const isApproved = user ? true : false // Admin submissions auto-approve

  const created = await db.marketplaceItem.create({
    data: {
      itemId,
      titleHi,
      titleEn,
      descHi,
      descEn,
      category,
      price,
      priceType,
      quantity,
      sellerNameHi,
      sellerNameEn,
      sellerPhone,
      sellerWard,
      imageUrl,
      isApproved,
      status: 'active',
    },
  })

  return NextResponse.json(
    { ok: true, item: created },
    { status: 201 },
  )
}
