# chandra-vapi-webhook

Vapi voice-complaint webhook mini-service for **Gram Panchayat Chandra — Digital Governance Portal** (Master Prompt v2.0 §5.4).

Runs as an independent Bun project on **port 3003** (hardcoded). It receives Vapi voice-call payloads, verifies them, deduplicates by `call.id`, stores a row in the Prisma `Complaint` table (shared SQLite file with the main portal), and **mocks** a WhatsApp dispatch to the panchayat admin's phone (sandbox adaptation — logs to console + `whatsapp-outbox.log` instead of calling the real Meta Graph API).

## Files

```
mini-services/vapi-webhook/
├── package.json          # name: chandra-vapi-webhook, scripts: dev/start
├── index.ts              # Bun.serve HTTP server (port 3003)
├── .env.example          # documents VAPI_SECRET, VAPI_IP_ALLOWLIST, DATABASE_URL
├── README.md             # this file
├── service.log           # stdout/stderr when started with nohup (runtime)
└── whatsapp-outbox.log   # appended mock WhatsApp messages (runtime)
```

## Endpoints

| Method | Path             | Description                                                                       |
|--------|------------------|-----------------------------------------------------------------------------------|
| `POST` | `/vapi-webhook`  | Ingest a Vapi call payload → verify → dedupe → insert → mock WhatsApp dispatch.   |
| `GET`  | `/health`        | `{ ok: true, service: 'vapi-webhook', port: 3003, ts: <iso> }`                    |
| `GET`  | `/`              | HTML documentation page (with curl examples + link back to the main portal).      |

## POST /vapi-webhook flow

1. **IP allowlist** — `VAPI_IP_ALLOWLIST` (comma-separated). If unset in dev, allow all (with warning). Else `403`.
2. **HMAC-SHA256 verify** — header `x-vapi-signature` must equal `HMAC-SHA256(rawBody, VAPI_SECRET)` (constant-time compare). In dev mode (`VAPI_SECRET` unset OR `= dev-secret`) verification is SKIPPED (with warning).
3. **Idempotency** — if a `Complaint` row already exists with this `vapiCallId`, return `{ ok: true, deduped: true }`.
4. **Insert complaint** — tracking id `GPCH-<base36(Date.now()) uppercased>`, parse `message.call.{id, customer.number, transcript, analysis.structuredData.{caller_name, call_reason, category}}`. Default category `other`, status `Pending`. Initial timeline entry `{status:'Pending', ts, note:'AI voice assistant filed complaint', by:'vapi-assistant'}`.
5. **Mock WhatsApp dispatch** — append the Hindi message (see below) to console + `whatsapp-outbox.log`.
6. **Return** `{ ok: true, tracking_id }`.

### WhatsApp (mock) message format

```
🔔 नई शिकायत दर्ज!
नाम: {callerName}
फ़ोन: {callerPhone}
श्रेणी: {category}
ट्रैकिंग आईडी: {trackingId}
शिकायत: {callReason}
```

## Run

```bash
cd /home/z/my-project/mini-services/vapi-webhook
bun run dev     # bun --hot index.ts  (auto-restart on file change)
# or
bun run start   # bun index.ts
```

The `@prisma/client` dependency is satisfied by the main workspace's `node_modules` — `index.ts` imports it via the absolute path `/home/z/my-project/node_modules/@prisma/client` so the service reads/writes the same SQLite file as the main Next.js portal.

## Test with curl (dev mode — no HMAC needed)

```bash
# 1. Health
curl -s http://localhost:3003/health
# → {"ok":true,"service":"vapi-webhook","port":3003,"ts":"..."}

# 2. Doc page
curl -s http://localhost:3003/ | head -5

# 3. New complaint (first call)
curl -s -X POST http://localhost:3003/vapi-webhook \
  -H 'Content-Type: application/json' \
  -d '{"message":{"call":{"id":"test-call-001","customer":{"number":"+919651035099"},"transcript":"नमस्कार...शिकायत: हैंडपंप खराब","analysis":{"structuredData":{"caller_name":"रामावतार","call_reason":"हैंडपंप खराब है","category":"water"}}}}}'
# → {"ok":true,"tracking_id":"GPCH-..."}

# 4. Idempotency (same payload again)
# → {"ok":true,"deduped":true}
```

## How the main portal calls this service

Through the gateway (Caddy) — the path stays `/vapi-webhook` and the target port is encoded as a query param:

```ts
fetch('/vapi-webhook?XTransformPort=3003', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(vapiPayload),
})
```

## Production notes

- Set `VAPI_SECRET` to a strong shared secret and `VAPI_IP_ALLOWLIST` to the Vapi egress IPs.
- Replace the mock dispatch in `mockWhatsAppDispatch()` with a real Meta Graph API call (`https://graph.facebook.com/v20.0/<phone_id>/messages`) once WhatsApp Business Cloud credentials are provisioned.
- The `callerPhone` field is stored as-is in this sandbox; in production the schema comment calls for hashing (DPDP Act) — apply a one-way hash before insert and store only the last 4 in clear text.
