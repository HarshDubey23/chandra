// Admin: export filtered complaints as CSV
// Query params: status, category, search, startDate, endDate
// Returns CSV text file with proper headers

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req.headers.get('cookie'))
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const status = req.nextUrl.searchParams.get('status')
  const category = req.nextUrl.searchParams.get('category')
  const startDate = req.nextUrl.searchParams.get('startDate')
  const endDate = req.nextUrl.searchParams.get('endDate')

  // Build where clause
  const where: Record<string, unknown> = {}
  if (status && status !== 'all') where.status = status
  if (category && category !== 'all') {
    // Map frontend 'general' to backend 'other'
    where.category = category === 'general' ? 'other' : category
  }
  if (startDate || endDate) {
    const dateFilter: Record<string, Date> = {}
    if (startDate) dateFilter.gte = new Date(startDate)
    if (endDate) dateFilter.lte = new Date(endDate)
    where.createdAt = dateFilter
  }

  const complaints = await db.complaint.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 500,
  })

  // Build CSV
  const headers = [
    'Tracking ID',
    'Caller Name',
    'Caller Phone',
    'Call Reason',
    'Category',
    'Status',
    'Resolution Note',
    'Created At',
    'Updated At',
    'Priority',
  ]

  function determinePriority(c: { category: string; status: string; createdAt: Date }): string {
    // Urgent: water/electricity + Pending + created within 7 days
    // Low: Resolved/Rejected
    // Normal: everything else
    if (c.status === 'Resolved' || c.status === 'Rejected') return 'Low'
    const daysSinceCreation = Math.floor((Date.now() - c.createdAt.getTime()) / (1000 * 60 * 60 * 24))
    if ((c.category === 'water' || c.category === 'road' || c.category === 'electricity') && daysSinceCreation <= 7) return 'Urgent'
    if (c.status === 'Pending' && daysSinceCreation > 14) return 'Urgent'
    return 'Normal'
  }

  const rows = complaints.map(c => [
    c.trackingId,
    c.callerName,
    c.callerPhone,
    c.callReason.replace(/"/g, '""'), // Escape double quotes
    c.category,
    c.status,
    (c.resolutionNote || '').replace(/"/g, '""'),
    c.createdAt.toISOString(),
    c.updatedAt.toISOString(),
    determinePriority(c),
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n')

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="complaints-export.csv"',
    },
  })
}
