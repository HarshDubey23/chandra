// Public: scheme summary (aggregated from scraped data)
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  // group scraped data by portal and recordType
  const all = await db.scrapedData.findMany()
  const byPortal: Record<string, { count: number; types: string[]; latestRetrievedAt: string | null; totalPiiRedactions: number }> = {}
  for (const r of all) {
    if (!byPortal[r.portal]) byPortal[r.portal] = { count: 0, types: [], latestRetrievedAt: null, totalPiiRedactions: 0 }
    byPortal[r.portal].count++
    if (!byPortal[r.portal].types.includes(r.recordType)) byPortal[r.portal].types.push(r.recordType)
    byPortal[r.portal].totalPiiRedactions += r.piiRedactions
    if (!byPortal[r.portal].latestRetrievedAt || r.retrievedAt > new Date(byPortal[r.portal].latestRetrievedAt!)) {
      byPortal[r.portal].latestRetrievedAt = r.retrievedAt.toISOString()
    }
  }
  return NextResponse.json({ schemes: byPortal })
}
