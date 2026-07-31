/**
 * GET /api/server-url
 *
 * Returns the EXACT Vapi Server URL that must be pasted into the Vapi
 * dashboard (Assistant → Server URL). It reads the real public Host header
 * forwarded by the platform Caddy gateway, so the URL is correct regardless
 * of which preview domain this sandbox is currently exposed under.
 *
 * The vapi-webhook mini-service listens on port 3003 internally; the gateway
 * routes to it via the `?XTransformPort=3003` query parameter (see Caddyfile).
 *
 * Response 200 — JSON:
 *   {
 *     "serverUrl": "https://<public-host>/vapi-webhook?XTransformPort=3003",
 *     "host": "<public-host>",
 *     "scheme": "https",
 *     "webhookPort": 3003,
 *     "instructions": [ ... ]
 *   }
 */
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const hdr = (k: string) => req.headers.get(k) || ''
  // The platform gateway (Caddy) forwards Host and X-Forwarded-Proto.
  const host =
    hdr('x-forwarded-host') ||
    hdr('host') ||
    hdr('x-original-host') ||
    'YOUR-PREVIEW-DOMAIN'
  // x-forwarded-proto reflects the public scheme (https). Fallback to https.
  const proto = hdr('x-forwarded-proto') || 'https'
  const publicOrigin = `${proto}://${host}`
  const serverUrl = `${publicOrigin}/vapi-webhook?XTransformPort=3003`

  return Response.json(
    {
      serverUrl,
      host,
      scheme: proto,
      webhookPort: 3003,
      webhookPath: '/vapi-webhook',
      transformQuery: 'XTransformPort=3003',
      healthUrl: `${publicOrigin}/health?XTransformPort=3003`,
      live: true,
      instructions: [
        '1. Copy the value of "serverUrl" above.',
        '2. Open the Vapi dashboard → Assistants → b3bcf257-175c-48d3-b333-365baa4eaaab.',
        '3. Paste it into the "Server URL" field and Save.',
        '4. Under "Server Events" enable "End-of-call report".',
        '5. Under "Structured Data" add: caller_name (string), call_reason (string), category (enum: water|road|school|housing|pension|mgnrega|other).',
        '6. Paste the system prompt from VAPI_SYSTEM_PROMPT.md into the assistant.',
        '7. Click Publish.',
        'After publish: end any Vapi call → Vapi POSTs to serverUrl → complaint stored (GPCH- tracking id) → real WhatsApp alert to Pradhan (+91 96510 35021).',
      ],
    },
    {
      headers: {
        'cache-control': 'no-store, no-cache, must-revalidate',
        'access-control-allow-origin': '*',
      },
    },
  )
}
