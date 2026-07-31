// Village Marketplace item API (Task 10-a)
// - PATCH /api/marketplace/[id] → admin-only: approve/reject/mark-sold, edit fields
// - DELETE /api/marketplace/[id] → admin-only: delete listing
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUser, requireRole } from '@/lib/auth'

// ── PATCH — admin-only update ──────────────────────────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireRole(req.headers.get('cookie'), 'admin')
  if (!user) return NextResponse.json({ error: 'unauthorized', message: 'सुपर एडमिन अनुमति आवश्यक' }, { status: 403 })

  const { id } = await params
  const existing = await db.marketplaceItem.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  // Handle status-based actions
  const action = typeof body.action === 'string' ? body.action.trim() : undefined
  if (action === 'approve') {
    const updated = await db.marketplaceItem.update({
      where: { id },
      data: { isApproved: true, status: 'active' },
    })
    return NextResponse.json({ ok: true, item: updated })
  }
  if (action === 'reject') {
    const updated = await db.marketplaceItem.update({
      where: { id },
      data: { isApproved: false, status: 'expired' },
    })
    return NextResponse.json({ ok: true, item: updated })
  }
  if (action === 'mark-sold') {
    const updated = await db.marketplaceItem.update({
      where: { id },
      data: { status: 'sold' },
    })
    return NextResponse.json({ ok: true, item: updated })
  }

  // General field update
  const data: Record<string, unknown> = {}

  if (typeof body.titleHi === 'string' && body.titleHi.trim()) data.titleHi = body.titleHi.trim()
  if (typeof body.titleEn === 'string' && body.titleEn.trim()) data.titleEn = body.titleEn.trim()
  if (typeof body.descHi === 'string') data.descHi = body.descHi.trim()
  if (typeof body.descEn === 'string') data.descEn = body.descEn.trim()
  if (typeof body.category === 'string') {
    const validCategories = ['produce', 'livestock', 'handcraft', 'equipment', 'services', 'other']
    if (validCategories.includes(body.category.trim())) data.category = body.category.trim()
  }
  if (typeof body.price === 'number' && body.price >= 0) data.price = body.price
  if (typeof body.priceType === 'string') {
    const validPriceTypes = ['fixed', 'negotiable', 'barter', 'free']
    if (validPriceTypes.includes(body.priceType.trim())) data.priceType = body.priceType.trim()
  }
  if (typeof body.quantity === 'string') data.quantity = body.quantity.trim()
  if (typeof body.sellerNameHi === 'string') data.sellerNameHi = body.sellerNameHi.trim()
  if (typeof body.sellerNameEn === 'string') data.sellerNameEn = body.sellerNameEn.trim()
  if (typeof body.sellerPhone === 'string') data.sellerPhone = body.sellerPhone.trim()
  if (typeof body.sellerWard === 'number' && body.sellerWard >= 1 && body.sellerWard <= 10) data.sellerWard = body.sellerWard
  if (typeof body.imageUrl === 'string') data.imageUrl = body.imageUrl.trim()
  if (typeof body.isApproved === 'boolean') data.isApproved = body.isApproved
  if (typeof body.status === 'string') {
    const validStatuses = ['active', 'sold', 'expired']
    if (validStatuses.includes(body.status.trim())) data.status = body.status.trim()
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'no_fields_to_update' }, { status: 400 })
  }

  const updated = await db.marketplaceItem.update({
    where: { id },
    data,
  })

  return NextResponse.json({ ok: true, item: updated })
}

// ── DELETE — admin-only delete ──────────────────────────────────────────────
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireRole(req.headers.get('cookie'), 'admin')
  if (!user) return NextResponse.json({ error: 'unauthorized', message: 'सुपर एडमिन अनुमति आवश्यक' }, { status: 403 })

  const { id } = await params
  const existing = await db.marketplaceItem.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  await db.marketplaceItem.delete({ where: { id } })

  return NextResponse.json({ ok: true, deleted: existing.itemId })
}
