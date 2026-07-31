// Citizen: fetch their own complaints by phone number (no auth required,
// since citizens may not have accounts but they DO have a tracking ID + phone).
// POST /api/complaints/mine  body: { phone: "9876543210" }
// Returns all complaints matching that phone (public-safe fields only).
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const phone = String(body?.phone || '').replace(/[^\d]/g, '')

    if (phone.length < 7) {
      return NextResponse.json(
        { error: 'valid_phone_required', message: 'कृपया सही मोबाइल नंबर दर्ज करें (कम से कम 10 अंक)' },
        { status: 400 }
      )
    }

    // Search for any complaint whose callerPhone contains these digits.
    // (Stored formats may include +91 prefix or be raw 10-digit.)
    const complaints = await db.complaint.findMany({
      where: {
        OR: [
          { callerPhone: { contains: phone } },
          { callerPhone: { contains: `+91${phone}` } },
          { callerPhone: { contains: `+91 ${phone}` } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        trackingId: true,
        callerName: true,
        category: true,
        callReason: true,
        status: true,
        createdAt: true,
        resolvedAt: true,
        resolutionNote: true,
        timeline: true,
      },
    })

    return NextResponse.json({ complaints, count: complaints.length })
  } catch (err) {
    console.error('[complaints/mine] error:', err)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
