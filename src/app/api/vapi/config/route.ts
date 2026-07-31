import { NextResponse } from 'next/server'
import { VAPI_ASSISTANT_CONFIG, VAPI_SYSTEM_PROMPT, COMPLAINT_CATEGORIES } from '@/lib/vapi-system-prompt'

/**
 * GET /api/vapi/config
 * Returns the Vapi assistant configuration including the system prompt.
 * This is used by the Vapi dashboard/webhook to configure the assistant
 * and by the frontend to display complaint categories.
 */
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      config: VAPI_ASSISTANT_CONFIG,
      systemPrompt: VAPI_SYSTEM_PROMPT,
      categories: COMPLAINT_CATEGORIES,
      environment: {
        publicKey: process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY ? 'configured' : 'missing',
        assistantId: process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID ? 'configured' : 'missing',
      },
    })
  } catch (error) {
    console.error('[vapi/config] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load Vapi configuration' },
      { status: 500 }
    )
  }
}
