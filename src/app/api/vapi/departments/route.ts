import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * GET /api/vapi/departments
 * Returns all departments with their routing info.
 */
export async function GET() {
  try {
    const departments = await db.department.findMany({
      where: { isActive: true },
      orderBy: { code: 'asc' },
    })

    const routingRules = await db.routingRule.findMany({
      where: { isActive: true },
    })

    // Enrich departments with their routing rules
    const enriched = departments.map((dept) => ({
      ...dept,
      routingRules: routingRules
        .filter((r) => r.departmentCode === dept.code)
        .map((r) => ({
          category: r.category,
          subcategory: r.subcategory,
          priority: r.priority,
          slaHours: r.slaHours,
          escalationLevel: r.escalationLevel,
        })),
    }))

    return NextResponse.json({
      success: true,
      departments: enriched,
      total: departments.length,
    })
  } catch (error) {
    console.error('[vapi/departments] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load departments' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/vapi/departments
 * Creates a new department.
 */
export async function POST(request: NextRequest) {
  let body: any
  try {
    body = await request.json()
    const { code, nameHi, nameEn, officerName, officerPhone, headPhone } = body

    if (!code || !nameHi || !nameEn) {
      return NextResponse.json(
        { success: false, error: 'code, nameHi, and nameEn are required' },
        { status: 400 }
      )
    }

    const department = await db.department.create({
      data: {
        code,
        nameHi,
        nameEn,
        officerName: officerName ?? null,
        officerPhone: officerPhone ?? null,
        headPhone: headPhone ?? null,
      },
    })

    return NextResponse.json({ success: true, department }, { status: 201 })
  } catch (error: unknown) {
    console.error('[vapi/departments] Error creating department:', error)
    const msg = error instanceof Error ? error.message : 'Unknown error'
    if (msg.includes('Unique')) {
      return NextResponse.json(
        { success: false, error: `Department "${body.code}" already exists` },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create department' },
      { status: 500 }
    )
  }
}
