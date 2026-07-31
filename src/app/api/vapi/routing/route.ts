import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * GET /api/vapi/routing
 * Returns all routing rules and department contacts.
 * Used by the AI to determine where to route calls.
 */
export async function GET() {
  try {
    const [routingRules, departments] = await Promise.all([
      db.routingRule.findMany({ where: { isActive: true } }),
      db.department.findMany({ where: { isActive: true } }),
    ])

    // Build a lookup map for quick routing
    const routingMap = routingRules.map((rule) => {
      const dept = departments.find((d) => d.code === rule.departmentCode)
      return {
        category: rule.category,
        subcategory: rule.subcategory,
        departmentCode: rule.departmentCode,
        departmentNameHi: dept?.nameHi ?? '',
        departmentNameEn: dept?.nameEn ?? '',
        officerName: dept?.officerName ?? '',
        officerPhone: dept?.officerPhone ?? '',
        headPhone: dept?.headPhone ?? '',
        priority: rule.priority,
        slaHours: rule.slaHours,
        escalationLevel: rule.escalationLevel,
      }
    })

    return NextResponse.json({
      success: true,
      routingRules: routingMap,
      departments: departments.map((d) => ({
        code: d.code,
        nameHi: d.nameHi,
        nameEn: d.nameEn,
        officerName: d.officerName,
        officerPhone: d.officerPhone,
        headPhone: d.headPhone,
      })),
    })
  } catch (error) {
    console.error('[vapi/routing] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load routing information' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/vapi/routing
 * Creates a new routing rule.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { category, subcategory, departmentCode, priority, slaHours, escalationLevel } = body

    if (!category || !departmentCode) {
      return NextResponse.json(
        { success: false, error: 'category and departmentCode are required' },
        { status: 400 }
      )
    }

    // Verify department exists
    const dept = await db.department.findUnique({ where: { code: departmentCode } })
    if (!dept) {
      return NextResponse.json(
        { success: false, error: `Department "${departmentCode}" not found` },
        { status: 404 }
      )
    }

    const rule = await db.routingRule.create({
      data: {
        category,
        subcategory: subcategory ?? null,
        departmentCode,
        priority: priority ?? 'medium',
        slaHours: slaHours ?? 72,
        escalationLevel: escalationLevel ?? 0,
      },
    })

    return NextResponse.json({ success: true, rule }, { status: 201 })
  } catch (error: unknown) {
    console.error('[vapi/routing] Error creating rule:', error)
    const msg = error instanceof Error ? error.message : 'Unknown error'
    if (msg.includes('Unique')) {
      return NextResponse.json(
        { success: false, error: 'Routing rule for this category already exists' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create routing rule' },
      { status: 500 }
    )
  }
}
