// Public: scraped-data records (read-only) — filter by portal
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const portal = req.nextUrl.searchParams.get('portal')
  const recordType = req.nextUrl.searchParams.get('recordType')
  const where: { portal?: string; recordType?: string } = {}
  if (portal) where.portal = portal
  if (recordType) where.recordType = recordType
  const records = await db.scrapedData.findMany({
    where,
    orderBy: { retrievedAt: 'desc' },
    take: 100,
  })
  // Parse JSON fields
  const parsed = records.map(r => ({
    ...r,
    data: r.data ? JSON.parse(r.data) : null,
    piiRedactionTypes: r.piiRedactionTypes ? JSON.parse(r.piiRedactionTypes) : [],
  }))
  return NextResponse.json({ records: parsed })
}
