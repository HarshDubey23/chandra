// Multi-ward comparative analytics — aggregates complaints, marketplace items,
// and population data per ward for comparative dashboard chart.
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Static ward data (mirrors WardMap.tsx WARDS array)
const WARDS = [
  { no: 1, name: 'रामप्रसाद', population: 132, households: 19 },
  { no: 2, name: 'सरोज देवी', population: 128, households: 18 },
  { no: 3, name: 'मोहन लाल', population: 135, households: 20 },
  { no: 4, name: 'विजय कुमार', population: 124, households: 17 },
  { no: 5, name: 'गीता देवी', population: 129, households: 19 },
  { no: 6, name: 'अरुण कुमार', population: 131, households: 19 },
  { no: 7, name: 'सुनील तिवारी', population: 127, households: 18 },
  { no: 8, name: 'पुष्पा देवी', population: 125, households: 18 },
  { no: 9, name: 'देवेंद्र यादव', population: 130, households: 19 },
  { no: 10, name: 'राजेश मौर्य', population: 86, households: 12 },
]

export async function GET(req: NextRequest) {
  const user = await requireRole(req.headers.get('cookie'), 'viewer')
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 403 })

  // Get marketplace items per ward
  const marketItems = await db.marketplaceItem.groupBy({
    by: ['sellerWard'],
    _count: true,
    where: { isApproved: true, status: 'active' },
  })

  // Get complaints per ward — we don't have ward field on Complaint,
  // but we can use the marketplace sellerWard as a proxy for activity.
  // For real ward-level complaints, we'd need a ward field on Complaint.
  // For now, return ward population + marketplace activity.

  const wardAnalytics = WARDS.map(w => {
    const itemCount = marketItems.find(m => m.sellerWard === w.no)?._count ?? 0
    return {
      ward: w.no,
      name: w.name,
      population: w.population,
      households: w.households,
      marketplaceItems: itemCount,
      // Per-capita marketplace activity (items per 100 people)
      activityPer100: w.population > 0 ? Math.round((itemCount / w.population) * 100 * 10) / 10 : 0,
    }
  })

  // Summary stats
  const totalPopulation = WARDS.reduce((s, w) => s + w.population, 0)
  const totalHouseholds = WARDS.reduce((s, w) => s + w.households, 0)
  const totalItems = wardAnalytics.reduce((s, w) => s + w.marketplaceItems, 0)
  const avgItemsPerWard = totalItems / WARDS.length

  return NextResponse.json({
    wards: wardAnalytics,
    summary: {
      totalWards: WARDS.length,
      totalPopulation,
      totalHouseholds,
      totalMarketplaceItems: totalItems,
      avgItemsPerWard: Math.round(avgItemsPerWard * 10) / 10,
    },
  })
}
