import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * POST /api/vapi/call-end
 * Called when a Vapi call ends. It:
 * 1. Saves the call record with transcript
 * 2. If transfer failed, auto-registers a complaint
 * 3. Generates a ticket ID
 * 4. Sends WhatsApp notification (stub for now)
 * 5. Updates the dashboard
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      vapiCallId,
      callerPhone,
      citizenName,
      villageName,
      wardNumber,
      category,
      subcategory,
      priority,
      departmentCode,
      transferTarget,
      transferStatus,
      transcript,
      recordingUrl,
      duration,
      aiConfidence,
      suggestedAction,
      language,
      notes,
      // If complaint was already registered during the call
      complaintId,
    } = body

    // 1. Save the call record
    const callRecord = await db.callRecord.create({
      data: {
        vapiCallId: vapiCallId ?? null,
        callerPhone: callerPhone ?? null,
        citizenName: citizenName ?? null,
        villageName: villageName ?? null,
        wardNumber: wardNumber ?? null,
        category: category ?? null,
        subcategory: subcategory ?? null,
        priority: priority ?? 'medium',
        departmentCode: departmentCode ?? null,
        transferTarget: transferTarget ?? null,
        transferStatus: transferStatus ?? 'pending',
        complaintId: complaintId ?? null,
        transcript: transcript ?? null,
        recordingUrl: recordingUrl ?? null,
        duration: duration ?? 0,
        aiConfidence: aiConfidence ?? null,
        suggestedAction: suggestedAction ?? null,
        language: language ?? 'hi',
        notes: notes ?? null,
        status: 'ended',
        endedAt: new Date(),
      },
    })

    // 2. If transfer failed or no complaint was registered, auto-register a complaint
    let autoComplaint: { id: string; trackingId: string } | null = null
    if (citizenName && category && (!complaintId || transferStatus === 'failed' || transferStatus === 'no_answer')) {
      const trackingId = `GPCH-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

      autoComplaint = await db.complaint.create({
        data: {
          trackingId,
          vapiCallId: vapiCallId ?? null,
          callerName: citizenName,
          callerPhone: callerPhone ?? 'unknown',
          callReason: category,
          category: mapCategoryToComplaint(category),
          status: 'Pending',
          rawTranscript: transcript ?? null,
          timeline: JSON.stringify([
            {
              status: 'Pending',
              ts: new Date().toISOString(),
              note: `Auto-registered via AI voice call. Priority: ${priority ?? 'medium'}. Department: ${departmentCode ?? 'general'}. ${transferStatus === 'failed' ? 'Transfer failed — auto-registered.' : transferStatus === 'no_answer' ? 'Officer did not answer — auto-registered.' : ''}`,
              by: 'AI Voice System',
            },
          ]),
        },
      })

      // Update the call record with the complaint ID
      await db.callRecord.update({
        where: { id: callRecord.id },
        data: { complaintId: autoComplaint.id },
      })

      // 3. Create escalation for failed transfers
      if (transferStatus === 'failed' || transferStatus === 'no_answer') {
        const dept = departmentCode ? await db.department.findUnique({ where: { code: departmentCode } }) : null
        await db.escalation.create({
          data: {
            complaintId: autoComplaint.id,
            callId: callRecord.id,
            level: 1,
            reason: `Call transfer ${transferStatus} for ${category}. Officer: ${dept?.officerName ?? 'Unknown'}. Auto-registered complaint.`,
            notifiedTo: dept?.headPhone ?? null,
            status: 'pending',
          },
        })
      }

      // 4. WhatsApp notification stub
      await sendWhatsAppNotification({
        phone: callerPhone ?? '',
        name: citizenName,
        trackingId: autoComplaint.trackingId,
        category,
        priority: priority ?? 'medium',
      })
    }

    return NextResponse.json({
      success: true,
      callRecord: {
        id: callRecord.id,
        vapiCallId: callRecord.vapiCallId,
        status: callRecord.status,
      },
      complaint: autoComplaint ? {
        id: autoComplaint.id,
        trackingId: autoComplaint.trackingId,
      } : null,
    })
  } catch (error) {
    console.error('[vapi/call-end] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process call-end data' },
      { status: 500 }
    )
  }
}

/**
 * Map Vapi complaint category to the Complaint model's category field
 */
function mapCategoryToComplaint(category: string): string {
  const mapping: Record<string, string> = {
    water_supply: 'water',
    road_damage: 'road',
    drainage: 'road',
    electricity: 'other',
    street_lights: 'other',
    garbage_collection: 'other',
    birth_certificate: 'other',
    death_certificate: 'other',
    family_register: 'other',
    pm_awas_yojana: 'housing',
    cm_awas_yojana: 'housing',
    pension: 'pension',
    widow_pension: 'pension',
    old_age_pension: 'pension',
    disability_pension: 'pension',
    mnrega: 'mgnrega',
    land_records: 'other',
    government_schemes: 'other',
    health_services: 'other',
    anganwadi: 'other',
    primary_school: 'school',
    emergency: 'other',
    general: 'other',
    other: 'other',
  }
  return mapping[category] ?? 'other'
}

/**
 * WhatsApp notification stub — will be implemented with WhatsApp Business API
 */
async function sendWhatsAppNotification({
  phone,
  name,
  trackingId,
  category,
  priority,
}: {
  phone: string
  name: string
  trackingId: string
  category: string
  priority: string
}) {
  const token = process.env.WHATSAPP_TOKEN
  const phoneId = process.env.WHATSAPP_PHONE_ID
  const adminPhone = process.env.ADMIN_WHATSAPP

  if (!token || !phoneId || token === 'replace-with-your-meta-whatsapp-access-token') {
    console.log(`[WhatsApp Stub] Notification to ${phone}:`)
    console.log(`  नमस्ते ${name}! आपकी शिकायत दर्ज हो गई है।`)
    console.log(`  ट्रैकिंग आईडी: ${trackingId}`)
    console.log(`  श्रेणी: ${category} | प्राथमिकता: ${priority}`)
    return { sent: false, reason: 'WhatsApp Business API not configured' }
  }

  try {
    // Send to the citizen who filed the complaint
    const citizenBody = {
      messaging_product: 'whatsapp',
      to: phone.replace(/\D/g, ''),
      type: 'template',
      template: {
        name: 'order_confirmation',
        language: { code: 'hi' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: name },
              { type: 'text', text: trackingId },
              { type: 'text', text: category },
              { type: 'text', text: priority },
            ],
          },
        ],
      },
    }

    // Fallback: use simple text message if template not approved
    const textBody = {
      messaging_product: 'whatsapp',
      to: phone.replace(/\D/g, ''),
      type: 'text',
      text: {
        preview_url: false,
        body: `नमस्ते ${name}! आपकी शिकायत दर्ज हो गई है।\n\nट्रैकिंग आईडी: ${trackingId}\nश्रेणी: ${category}\nप्राथमिकता: ${priority}\n\nअपनी शिकायत ट्रैक करें: https://chandra-gp.in/track/${trackingId}`,
      },
    }

    // Send to citizen
    const citizenRes = await fetch(
      `https://graph.facebook.com/v25.0/${phoneId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(textBody),
      }
    )

    const citizenData = await citizenRes.json()

    // Also notify the Pradhan/Admin
    if (adminPhone) {
      const adminBody = {
        messaging_product: 'whatsapp',
        to: adminPhone,
        type: 'text',
        text: {
          preview_url: false,
          body: `🚨 नई शिकायत दर्ज\n\nनाम: ${name}\nफोन: ${phone}\nट्रैकिंग: ${trackingId}\nश्रेणी: ${category}\nप्राथमिकता: ${priority}`,
        },
      }

      await fetch(`https://graph.facebook.com/v25.0/${phoneId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adminBody),
      })
    }

    console.log(`[WhatsApp] Notification sent to ${phone}:`, citizenData)
    return { sent: true, messageId: citizenData.messages?.[0]?.id }
  } catch (err) {
    console.error('[WhatsApp] Failed to send notification:', err)
    return { sent: false, reason: String(err) }
  }
}
