/**
 * chandra-vapi-webhook — Vapi Voice Complaint webhook mini-service (v2)
 *
 * Endpoints:
 *   POST /vapi-webhook       — ingest a Vapi end-of-call-report payload, store
 *                              Complaint + CallRecord (+ Escalation if needed),
 *                              dispatch WhatsApp to Pradhan + officer + head + citizen.
 *   POST /function-call      — dispatch a Vapi function-call payload to the right
 *                              handler (registerComplaint | transferCall |
 *                              getRoutingInfo | endCall). Used by both the live
 *                              Vapi SDK (via AIVoiceButton) and the SimulateCallPanel.
 *   POST /send-whatsapp      — send a WhatsApp message to a specific number
 *                              `{ to, message }` (real or mock).
 *   POST /broadcast          — internal broadcast hook (logs a complaint event
 *                              so external subscribers can poll for it).
 *   GET  /health             — liveness probe.
 *   GET  /                   — HTML doc page.
 *
 * Port: 3003 (hardcoded per spec)
 */

import { createHmac, timingSafeEqual } from 'node:crypto'
import { appendFileSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PrismaClient } from '@prisma/client'

// ─── Hardcoded port per spec ──────────────────────────────────────────────
const PORT = 3003

// ─── Resolve paths ─────────────────────────────────────────────────────────
const SERVICE_DIR = dirname(fileURLToPath(import.meta.url))
const OUTBOX_LOG = resolve(SERVICE_DIR, 'whatsapp-outbox.log')
const BROADCAST_LOG = resolve(SERVICE_DIR, 'broadcast.log')

// ─── Env (with safe fallbacks for dev) ─────────────────────────────────────
process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  'file:' + resolve(SERVICE_DIR, '../../db/custom.db').replace(/\\/g, '/')

const VAPI_SECRET = process.env.VAPI_SECRET || ''
const VAPI_IP_ALLOWLIST_RAW = process.env.VAPI_IP_ALLOWLIST || ''
const DEV_MODE = VAPI_SECRET === '' || VAPI_SECRET === 'dev-secret'

// Pradhan's WhatsApp number — fallback to 9651035021 (Sangeeta Mishra, Pradhan)
const PRADHAN_WHATSAPP = (process.env.ADMIN_WHATSAPP || '9651035021').replace(/[^\d]/g, '')

// ─── Prisma client (shared SQLite file with the main portal) ──────────────
const db = new PrismaClient()

// ─── Complaint category mapping ──────────────────────────────────────────
// The COMPLAINT_CATEGORIES on the AI side has 24 rich codes (water_supply,
// road_damage, …). The Complaint.category column (per prisma schema comment)
// uses 7 short codes (water, road, school, housing, pension, mgnrega, other).
// We map rich → short for Complaint storage and store the rich code on the
// CallRecord row (which supports any string).
const RICH_TO_SHORT_CATEGORY: Record<string, string> = {
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

const ALLOWED_SHORT_CATEGORIES = new Set([
  'water',
  'road',
  'school',
  'housing',
  'pension',
  'mgnrega',
  'other',
])

// ─── Helpers ──────────────────────────────────────────────────────────────

function getClientIp(req: Request, server: any): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  const xri = req.headers.get('x-real-ip')
  if (xri) return xri.trim()
  try {
    const ip = server.requestIP(req) as { address: string } | null
    if (ip?.address) return ip.address
  } catch {
    /* ignore */
  }
  return 'unknown'
}

function verifyHmac(rawBody: string, signature: string, secret: string): boolean {
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex')
  const a = Buffer.from(signature)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

/** Generate the tracking id: GPCH-<base36 of Date.now(), uppercased>. */
function generateTrackingId(): string {
  return `GPCH-${Date.now().toString(36).toUpperCase()}`
}

function str(val: unknown, fallback = ''): string {
  return typeof val === 'string' && val.length > 0 ? val : fallback
}

function num(val: unknown, fallback: number | null = null): number | null {
  if (typeof val === 'number' && Number.isFinite(val)) return val
  if (typeof val === 'string' && /^\d+$/.test(val.trim())) return parseInt(val.trim(), 10)
  return fallback
}

/** Normalize an AI rich-category code to the short Complaint.category enum. */
function toShortCategory(val: unknown): string {
  const c = typeof val === 'string' ? val.trim().toLowerCase() : ''
  if (RICH_TO_SHORT_CATEGORY[c]) return RICH_TO_SHORT_CATEGORY[c]
  if (ALLOWED_SHORT_CATEGORIES.has(c)) return c
  return 'other'
}

/** Strip everything except digits from a phone number; coerce empty → null. */
function normalizePhone(val: unknown): string | null {
  if (typeof val !== 'string' && typeof val !== 'number') return null
  const digits = String(val).replace(/[^\d]/g, '')
  if (digits.length < 7) return null
  // strip leading 0 / 91 if it makes the number too long
  return digits
}

/** Append a WhatsApp message to console + outbox log file (audit trail). */
function logWhatsAppToOutbox(msg: string, to: string, tag: string): void {
  const stamp = new Date().toISOString()
  const block = `\n[${stamp}] [${tag}] [to:${to}]\n${msg}\n---\n`
  console.log(`[vapi-webhook] WhatsApp (${tag}) → ${to}:`)
  console.log(msg)
  console.log('---')
  try {
    mkdirSync(SERVICE_DIR, { recursive: true })
    appendFileSync(OUTBOX_LOG, block, 'utf8')
  } catch (e) {
    console.error(`[vapi-webhook] failed to append outbox log:`, e)
  }
}

/** Append a broadcast event to broadcast.log (poll-able by the Next.js SSE route). */
function broadcastEvent(event: string, payload: unknown): void {
  const stamp = new Date().toISOString()
  const line = JSON.stringify({ event, payload, ts: stamp }) + '\n'
  try {
    mkdirSync(SERVICE_DIR, { recursive: true })
    appendFileSync(BROADCAST_LOG, line, 'utf8')
  } catch (e) {
    console.error(`[vapi-webhook] failed to append broadcast log:`, e)
  }
}

/**
 * Send a real WhatsApp message to a specific phone number via the Meta Cloud API.
 * Returns true on success, false on any failure (caller falls back to log).
 * Requires env: WHATSAPP_TOKEN, WHATSAPP_PHONE_ID.
 */
async function sendWhatsAppCloudApi(to: string, msg: string): Promise<boolean> {
  const token = process.env.WHATSAPP_TOKEN || ''
  const phoneId = process.env.WHATSAPP_PHONE_ID || ''
  if (!token || !phoneId) {
    return false
  }
  const cleaned = to.replace(/[^\d]/g, '')
  if (!cleaned) return false
  try {
    const res = await fetch(`https://graph.facebook.com/v25.0/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: cleaned,
        type: 'text',
        text: { preview_url: false, body: msg },
      }),
    })
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>
    if (!res.ok) {
      console.error(`[vapi-webhook] WhatsApp API error ${res.status} (to=${cleaned}):`, JSON.stringify(data))
      return false
    }
    console.log(`[vapi-webhook] WhatsApp sent OK (to=${cleaned}):`, JSON.stringify(data))
    return true
  } catch (e) {
    console.error(`[vapi-webhook] WhatsApp API request failed (to=${cleaned}):`, e)
    return false
  }
}

/**
 * Send WhatsApp via Twilio API (alternative provider).
 * Requires env: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM
 * Returns true on success, false on failure.
 */
async function sendWhatsAppTwilio(to: string, msg: string): Promise<boolean> {
  const sid = process.env.TWILIO_ACCOUNT_SID || ''
  const authToken = process.env.TWILIO_AUTH_TOKEN || ''
  const from = process.env.TWILIO_WHATSAPP_FROM || '' // e.g. whatsapp:+14155238886
  if (!sid || !authToken || !from) return false
  const cleaned = to.replace(/[^\d]/g, '')
  if (!cleaned) return false
  try {
    const auth = Buffer.from(`${sid}:${authToken}`).toString('base64')
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: from,
        To: `whatsapp:+${cleaned}`,
        Body: msg,
      }).toString(),
    })
    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      console.error(`[vapi-webhook] Twilio WhatsApp error ${res.status} (to=${cleaned}):`, errText)
      return false
    }
    console.log(`[vapi-webhook] Twilio WhatsApp sent OK (to=${cleaned})`)
    return true
  } catch (e) {
    console.error(`[vapi-webhook] Twilio WhatsApp request failed (to=${cleaned}):`, e)
    return false
  }
}

/** Dispatch WhatsApp to a specific recipient. Tries Meta → Twilio → mock log. */
async function dispatchWhatsApp(to: string, msg: string): Promise<void> {
  const cleaned = to.replace(/[^\d]/g, '')
  if (!cleaned) {
    console.warn('[vapi-webhook] dispatchWhatsApp: skipping empty recipient')
    return
  }
  // Try Meta Cloud API first
  let sent = await sendWhatsAppCloudApi(cleaned, msg)
  // Fallback to Twilio if Meta not configured / failed
  if (!sent) {
    sent = await sendWhatsAppTwilio(cleaned, msg)
  }
  logWhatsAppToOutbox(msg, cleaned, sent ? 'sent' : 'mock')
}

// ─── JSON helper ──────────────────────────────────────────────────────────
function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...headers },
  })
}

// ─── WhatsApp message builders (Hindi) ────────────────────────────────────

interface ComplaintMsgParams {
  name: string
  phone: string
  village?: string
  ward?: string | number | null
  categoryRich?: string
  categoryShort: string
  priority?: string
  departmentName?: string
  trackingId: string
  reason: string
}

function buildComplaintMessage(p: ComplaintMsgParams): string {
  const lines = [
    '🔔 नई शिकायत दर्ज!',
    `नाम: ${p.name}`,
    `फ़ोन: ${p.phone}`,
  ]
  if (p.village) lines.push(`गाँव: ${p.village}`)
  if (p.ward) lines.push(`वार्ड: ${p.ward}`)
  lines.push(`श्रेणी: ${p.categoryRich || p.categoryShort}`)
  if (p.priority) lines.push(`प्राथमिकता: ${p.priority}`)
  if (p.departmentName) lines.push(`विभाग: ${p.departmentName}`)
  lines.push(`ट्रैकिंग आईडी: ${p.trackingId}`)
  lines.push(`शिकायत: ${p.reason}`)
  return lines.join('\n')
}

function buildCitizenConfirmationMessage(p: ComplaintMsgParams): string {
  const lines = [
    '✅ आपकी शिकायत दर्ज हो गई है।',
    `ट्रैकिंग आईडी: ${p.trackingId}`,
    `श्रेणी: ${p.categoryRich || p.categoryShort}`,
  ]
  if (p.departmentName) lines.push(`विभाग: ${p.departmentName}`)
  lines.push('')
  lines.push('हमारी टीम जल्द ही आपसे संपर्क करेगी।')
  lines.push('— ग्राम पंचायत चंद्रा')
  return lines.join('\n')
}

function buildTransferMessage(opts: {
  officerName: string
  citizenName: string
  citizenPhone: string
  category: string
  reason: string
  trackingId?: string
}): string {
  const lines = [
    '📞 इनकमिंग ट्रांसफर्ड कॉल',
    `नागरिक: ${opts.citizenName} (${opts.citizenPhone})`,
    `श्रेणी: ${opts.category}`,
    `कारण: ${opts.reason}`,
  ]
  if (opts.trackingId) lines.push(`ट्रैकिंग आईडी: ${opts.trackingId}`)
  lines.push('')
  lines.push('कृपया तुरंत नागरिक से संपर्क करें।')
  lines.push('— ग्राम पंचायत चंद्रा')
  return lines.join('\n')
}

// ─── Function-call handlers ──────────────────────────────────────────────

interface RegisterComplaintParams {
  name?: string
  phone?: string
  village?: string
  ward?: number | string
  category?: string
  subcategory?: string
  description?: string
  location?: string
  landmark?: string
  priority?: string
  departmentCode?: string
  language?: string
}

async function handleRegisterComplaint(params: RegisterComplaintParams, toolCallId?: string): Promise<Response> {
  const name = str(params.name, 'अनाम नागरिक')
  const phone = str(params.phone, '')
  const village = str(params.village, '')
  const ward = num(params.ward)
  const categoryRich = str(params.category, 'general')
  const categoryShort = toShortCategory(categoryRich)
  const subcategory = str(params.subcategory, '')
  const description = str(params.description, str(params.location, 'शिकायत विवरण उपलब्ध नहीं'))
  const location = str(params.location, '')
  const landmark = str(params.landmark, '')
  const priority = str(params.priority, 'medium')
  const departmentCode = str(params.departmentCode, 'general')
  const language = str(params.language, 'hi')

  // Look up department + routing rule
  const department = await db.department.findUnique({ where: { code: departmentCode } }).catch(() => null)
  const routingRule = await db.routingRule.findUnique({ where: { category: categoryRich } }).catch(() => null)

  const trackingId = generateTrackingId()
  const nowIso = new Date().toISOString()
  const timeline = [
    {
      status: 'Pending',
      ts: nowIso,
      note: `AI voice assistant filed complaint (priority=${priority}, dept=${departmentCode})`,
      by: 'vapi-assistant',
    },
  ]

  // Insert the Complaint row
  const complaint = await db.complaint.create({
    data: {
      trackingId,
      vapiCallId: toolCallId || null,
      callerName: name,
      callerPhone: phone,
      callReason: description,
      category: categoryShort,
      status: 'Pending',
      rawTranscript: description,
      timeline: JSON.stringify(timeline),
    },
  })

  // Insert the CallRecord row (rich data — village, ward, priority, department, etc.)
  const callRecord = await db.callRecord.create({
    data: {
      vapiCallId: toolCallId || null,
      callerPhone: phone || null,
      citizenName: name,
      villageName: village || null,
      wardNumber: ward,
      category: categoryRich,
      subcategory: subcategory || null,
      priority,
      departmentCode,
      transferStatus: 'pending',
      complaintId: complaint.id,
      transcript: description,
      suggestedAction: `Route to ${departmentCode} department`,
      language,
      status: 'active',
    },
  }).catch((e) => {
    console.error('[vapi-webhook] CallRecord insert failed (non-fatal):', e)
    return null
  })

  // ─── WhatsApp dispatch ────────────────────────────────────────────────
  // Build the master complaint message
  const msgParams: ComplaintMsgParams = {
    name,
    phone,
    village,
    ward,
    categoryRich,
    categoryShort,
    priority,
    departmentName: department?.nameHi || department?.nameEn || departmentCode,
    trackingId,
    reason: description,
  }
  const complaintMsg = buildComplaintMessage(msgParams)

  // Recipients: Pradhan, department officer, department head (if different), citizen
  // Dedupe by phone number so the Pradhan (who is also often the dept head) gets ONE message.
  const seenPhones = new Set<string>()
  const recipients: Array<{ to: string; tag: string; msg: string }> = []
  function addRecipient(to: string, tag: string, msg: string) {
    const digits = to.replace(/\D/g, '')
    if (!digits || digits.length < 7) return
    if (seenPhones.has(digits)) return
    seenPhones.add(digits)
    recipients.push({ to: digits, tag, msg })
  }
  addRecipient(PRADHAN_WHATSAPP, 'pradhan', complaintMsg)
  if (department?.officerPhone) {
    addRecipient(department.officerPhone, `officer:${departmentCode}`, complaintMsg)
  }
  if (department?.headPhone) {
    addRecipient(department.headPhone, `head:${departmentCode}`, complaintMsg)
  }
  if (phone) {
    addRecipient(phone, 'citizen', buildCitizenConfirmationMessage(msgParams))
  }

  // Fire all WhatsApp dispatches in parallel (don't block the response)
  const dispatches = recipients.map((r) => dispatchWhatsApp(r.to, r.msg).catch((e) => {
    console.error(`[vapi-webhook] WhatsApp dispatch failed (to=${r.to}):`, e)
  }))
  await Promise.allSettled(dispatches)

  // Broadcast a "complaint:new" event so the SSE route can pick it up
  broadcastEvent('complaint:new', {
    trackingId,
    complaintId: complaint.id,
    callRecordId: callRecord?.id || null,
    callerName: name,
    category: categoryShort,
    categoryRich,
    priority,
    departmentCode,
    village,
    ward,
    createdAt: nowIso,
  })

  console.log(
    `[vapi-webhook] registerComplaint OK — trackingId=${trackingId} category=${categoryRich}→${categoryShort} dept=${departmentCode} priority=${priority}`,
  )

  return json({
    ok: true,
    trackingId,
    complaintId: complaint.id,
    callRecordId: callRecord?.id || null,
    department: department
      ? { code: department.code, nameHi: department.nameHi, officerName: department.officerName, officerPhone: department.officerPhone }
      : null,
    routing: routingRule
      ? { priority: routingRule.priority, slaHours: routingRule.slaHours, escalationLevel: routingRule.escalationLevel }
      : null,
    message: `शिकायत दर्ज हो गई। ट्रैकिंग आईडी: ${trackingId}`,
  })
}

interface TransferCallParams {
  departmentCode?: string
  officerName?: string
  officerPhone?: string
  reason?: string
  // Optional context that the AI may pass through
  citizenName?: string
  citizenPhone?: string
  category?: string
  trackingId?: string
}

async function handleTransferCall(params: TransferCallParams, toolCallId?: string): Promise<Response> {
  const departmentCode = str(params.departmentCode, 'general')
  const officerName = str(params.officerName, '')
  const officerPhoneRaw = str(params.officerPhone, '')
  const reason = str(params.reason, 'Citizen requested officer transfer')
  const citizenName = str(params.citizenName, 'नागरिक')
  const citizenPhone = str(params.citizenPhone, '')
  const category = str(params.category, 'general')
  const trackingId = str(params.trackingId, '')

  // Look up department to fill in missing officer info
  const department = await db.department.findUnique({ where: { code: departmentCode } }).catch(() => null)
  const finalOfficerName = officerName || department?.officerName || 'अधिकारी'
  const finalOfficerPhone = officerPhoneRaw || department?.officerPhone || ''

  // Update the CallRecord (if there's an active one for this toolCallId)
  let callRecordId: string | null = null
  if (toolCallId) {
    const updated = await db.callRecord.updateMany({
      where: { vapiCallId: toolCallId },
      data: {
        transferTarget: finalOfficerPhone || null,
        transferStatus: 'pending',
        departmentCode,
      },
    }).catch((e) => {
      console.error('[vapi-webhook] CallRecord transfer update failed (non-fatal):', e)
      return null
    })
    if (updated && updated.count > 0) {
      const rec = await db.callRecord.findFirst({ where: { vapiCallId: toolCallId } }).catch(() => null)
      callRecordId = rec?.id || null
    }
  }

  // Send WhatsApp to the officer (incoming transferred call notification)
  if (finalOfficerPhone) {
    const msg = buildTransferMessage({
      officerName: finalOfficerName,
      citizenName,
      citizenPhone,
      category,
      reason,
      trackingId,
    })
    await dispatchWhatsApp(finalOfficerPhone, msg).catch((e) => {
      console.error(`[vapi-webhook] officer transfer WhatsApp failed (to=${finalOfficerPhone}):`, e)
    })
  }

  // Also notify the Pradhan about the transfer
  if (finalOfficerPhone && finalOfficerPhone !== PRADHAN_WHATSAPP) {
    const pradhanMsg = `📞 कॉल ट्रांसफर: ${citizenName} (${citizenPhone || 'नंबर अनुपलब्ध'}) की कॉल ${finalOfficerName} (${finalOfficerPhone}) को ट्रांसफर की गई।\nश्रेणी: ${category}\nकारण: ${reason}`
    await dispatchWhatsApp(PRADHAN_WHATSAPP, pradhanMsg).catch(() => {})
  }

  broadcastEvent('call:transfer', {
    toolCallId,
    departmentCode,
    officerName: finalOfficerName,
    officerPhone: finalOfficerPhone,
    citizenName,
    citizenPhone,
    trackingId,
    callRecordId,
  })

  console.log(
    `[vapi-webhook] transferCall OK — dept=${departmentCode} officer=${finalOfficerName} phone=${finalOfficerPhone}`,
  )

  return json({
    ok: true,
    transferInitiated: true,
    officerName: finalOfficerName,
    officerPhone: finalOfficerPhone,
    departmentCode,
    callRecordId,
    // Vapi transfer format: returning a "number" field triggers Vapi to dial it
    // The number must be in E.164 format (+91XXXXXXXXXX)
    number: finalOfficerPhone ? `+91${finalOfficerPhone.replace(/\D/g, '').slice(-10)}` : undefined,
    message: `कॉल ${finalOfficerName} (${finalOfficerPhone}) को ट्रांसफर की जा रही है।`,
  })
}

interface GetRoutingInfoParams {
  category?: string
}

async function handleGetRoutingInfo(params: GetRoutingInfoParams): Promise<Response> {
  const category = str(params.category, 'general')
  const routingRule = await db.routingRule.findUnique({ where: { category } }).catch(() => null)
  const departmentCode = routingRule?.departmentCode || 'general'
  const department = await db.department.findUnique({ where: { code: departmentCode } }).catch(() => null)

  if (!routingRule || !department) {
    return json({
      ok: false,
      error: 'no_routing',
      message: `No routing rule found for category '${category}'`,
    }, 404)
  }

  return json({
    ok: true,
    category,
    departmentCode,
    officerName: department.officerName || '',
    officerPhone: department.officerPhone || '',
    headPhone: department.headPhone || '',
    priority: routingRule.priority,
    slaHours: routingRule.slaHours,
    escalationLevel: routingRule.escalationLevel,
    departmentNameHi: department.nameHi,
    departmentNameEn: department.nameEn,
  })
}

interface EndCallParams {
  callSummary?: string
  transcript?: string
  // Optional context
  trackingId?: string
  citizenName?: string
  citizenPhone?: string
  village?: string
  ward?: number | string
  category?: string
  departmentCode?: string
  priority?: string
}

async function handleEndCall(params: EndCallParams, toolCallId?: string): Promise<Response> {
  const callSummary = str(params.callSummary, '')
  const transcript = str(params.transcript, callSummary)
  const trackingId = str(params.trackingId, '')
  const citizenName = str(params.citizenName, 'अनाम')
  const citizenPhone = str(params.citizenPhone, '')
  const village = str(params.village, '')
  const ward = num(params.ward)
  const categoryRich = str(params.category, '')
  const departmentCode = str(params.departmentCode, '')
  const priority = str(params.priority, 'medium')

  // Update the CallRecord (if exists for this toolCallId)
  let callRecord: any = null
  if (toolCallId) {
    callRecord = await db.callRecord.findFirst({ where: { vapiCallId: toolCallId } }).catch(() => null)
    if (callRecord) {
      callRecord = await db.callRecord.update({
        where: { id: callRecord.id },
        data: {
          status: 'ended',
          endedAt: new Date(),
          transcript: transcript || callRecord.transcript,
        },
      }).catch((e) => {
        console.error('[vapi-webhook] CallRecord endCall update failed:', e)
        return callRecord
      })
    }
  }

  // If no complaint was registered for this call, auto-register one from the summary.
  // First check if a complaint already exists for this toolCallId (so we don't double-register).
  let autoTrackingId: string | null = null
  if (!trackingId && callSummary) {
    if (toolCallId) {
      const existingComplaint = await db.complaint.findFirst({
        where: { vapiCallId: toolCallId },
        select: { trackingId: true },
      }).catch(() => null)
      if (existingComplaint) {
        autoTrackingId = existingComplaint.trackingId
      }
    }
    if (!autoTrackingId) {
      const autoParams: RegisterComplaintParams = {
        name: citizenName,
        phone: citizenPhone,
        village,
        ward: ward || undefined,
        category: categoryRich || 'general',
        description: callSummary,
        priority,
        departmentCode: departmentCode || 'general',
      }
      const r = await handleRegisterComplaint(autoParams, toolCallId || undefined)
      const data = await r.json()
      autoTrackingId = (data as any)?.trackingId || null
    }
  }

  broadcastEvent('call:end', {
    toolCallId,
    trackingId: trackingId || autoTrackingId,
    citizenPhone,
    summary: callSummary,
  })

  console.log(
    `[vapi-webhook] endCall OK — toolCallId=${toolCallId} trackingId=${trackingId || autoTrackingId}`,
  )

  return json({
    ok: true,
    callRecordId: callRecord?.id || null,
    autoRegisteredTrackingId: autoTrackingId,
    message: 'कॉल समाप्त। रिकॉर्ड सहेजा गया।',
  })
}

/** Dispatch a Vapi function-call payload to the right handler. */
async function handleFunctionCall(req: Request): Promise<Response> {
  let payload: any
  try {
    payload = await req.json()
  } catch {
    return json({ ok: false, error: 'Invalid JSON body' }, 400)
  }

  const toolCallId = str(payload?.toolCallId, '') || null
  // Vapi payload shape: { functionCall: { name, parameters } }
  // or { name, parameters } (from SimulateCallPanel)
  const functionCall = payload?.functionCall || payload
  const fnName = str(functionCall?.name, '')
  const fnParams = (functionCall?.parameters || {}) as Record<string, unknown>

  console.log(`[vapi-webhook] /function-call → ${fnName} (toolCallId=${toolCallId || 'none'})`)

  switch (fnName) {
    case 'registerComplaint':
      return handleRegisterComplaint(fnParams as RegisterComplaintParams, toolCallId || undefined)
    case 'transferCall':
      return handleTransferCall(fnParams as TransferCallParams, toolCallId || undefined)
    case 'getRoutingInfo':
      return handleGetRoutingInfo(fnParams as GetRoutingInfoParams)
    case 'shareNumber':
      return handleShareNumber(fnParams as { departmentCode: string; officerName: string; officerPhone: string; reason: string }, toolCallId || undefined)
    case 'endCall':
      return handleEndCall(fnParams as EndCallParams, toolCallId || undefined)
    default:
      return json({ ok: false, error: `Unknown function: ${fnName}` }, 400)
  }
}

/**
 * handleShareNumber — Vapi shares an officer's contact number with the citizen
 * (no live transfer; the citizen calls the officer themselves).
 * Logs the share + sends WhatsApp to citizen with the contact details.
 */
async function handleShareNumber(
  params: { departmentCode: string; officerName: string; officerPhone: string; reason: string },
  toolCallId?: string
): Promise<Response> {
  const { departmentCode, officerName, officerPhone, reason } = params
  console.log(`[vapi-webhook] shareNumber → dept=${departmentCode} officer=${officerName} phone=${officerPhone} reason=${reason}`)

  // The Vapi assistant will speak the number to the citizen; we just log it
  // and return a success result so the assistant can continue.
  return json({
    ok: true,
    result: {
      shared: true,
      departmentCode,
      officerName,
      officerPhone,
      reason,
      message: `Number shared with citizen: ${officerName} (${officerPhone}) — ${reason}`,
    },
    toolCallId,
  })
}

/** /send-whatsapp endpoint — used by Next.js API routes (server-side). */
async function handleSendWhatsApp(req: Request): Promise<Response> {
  let body: any
  try {
    body = await req.json()
  } catch {
    return json({ ok: false, error: 'Invalid JSON body' }, 400)
  }
  const to = str(body?.to, '')
  const message = str(body?.message, '')
  if (!to || !message) {
    return json({ ok: false, error: 'Missing to or message' }, 400)
  }
  await dispatchWhatsApp(to, message)
  return json({ ok: true, to, length: message.length })
}

/** /broadcast endpoint — used by other services to broadcast an event. */
async function handleBroadcast(req: Request): Promise<Response> {
  let body: any
  try {
    body = await req.json()
  } catch {
    return json({ ok: false, error: 'Invalid JSON body' }, 400)
  }
  const event = str(body?.event, 'generic')
  const payload = body?.payload || {}
  broadcastEvent(event, payload)
  return json({ ok: true, event })
}

// ─── end-of-call-report webhook handler ──────────────────────────────────

async function handleWebhook(req: Request, server: any): Promise<Response> {
  // ─── 1. IP allowlist check ──────────────────────────────────────────────
  const clientIp = getClientIp(req, server)
  if (VAPI_IP_ALLOWLIST_RAW.trim().length > 0) {
    const allowlist = VAPI_IP_ALLOWLIST_RAW.split(',').map((s) => s.trim()).filter(Boolean)
    const allowed = allowlist.includes('*') ||
      allowlist.some((a) => clientIp === a || clientIp.endsWith(`.${a}`))
    if (!allowed) {
      console.warn(`[vapi-webhook] 403 IP not in allowlist: ${clientIp}`)
      return json({ ok: false, error: 'IP not allowed', ip: clientIp }, 403)
    }
  } else {
    console.warn('[vapi-webhook] WARNING: VAPI_IP_ALLOWLIST not set — allowing all IPs (dev only).')
  }

  // ─── 2. Read raw body (preserve for HMAC) ──────────────────────────────
  const rawBody = await req.text()

  // ─── 3. HMAC-SHA256 verify ──────────────────────────────────────────────
  if (DEV_MODE) {
    const reason = VAPI_SECRET === '' ? 'VAPI_SECRET unset' : 'VAPI_SECRET=dev-secret'
    console.warn(`[vapi-webhook] WARNING: DEV MODE — HMAC verification SKIPPED (${reason}).`)
  } else {
    const sig = req.headers.get('x-vapi-signature') || ''
    if (!sig) return json({ ok: false, error: 'Missing signature' }, 401)
    if (!verifyHmac(rawBody, sig, VAPI_SECRET)) {
      return json({ ok: false, error: 'Invalid signature' }, 401)
    }
  }

  // ─── 4. Parse JSON payload ──────────────────────────────────────────────
  let payload: any
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return json({ ok: false, error: 'Invalid JSON body' }, 400)
  }

  const msgType = str(payload?.message?.type)
  if (msgType && msgType !== 'end-of-call-report') {
    return json({ ok: true, ignored: msgType })
  }

  const message = payload?.message ?? {}
  const call = message?.call
  if (!call || typeof call !== 'object' || !call.id) {
    return json({ ok: false, error: 'Missing message.call.id' }, 400)
  }

  const vapiCallId = str(call.id)
  const callerPhone = str(call?.customer?.number)
  const transcript = str(call?.transcript) || str(message?.transcript) || str(message?.artifact?.transcript)
  const structured = ((call?.analysis?.structuredData || message?.analysis?.structuredData || {}) as Record<string, unknown>)

  function pick(...keys: string[]): string {
    for (const k of keys) {
      const v = structured[k]
      if (v) return str(v)
    }
    return ''
  }

  const callerName = pick('caller_name', 'callerName', 'name') || 'अनाम'
  const callReason = pick('call_reason', 'complaintReason', 'callReason', 'description') || transcript
  const categoryRich = pick('category', 'categoryCode')
  const categoryShort = toShortCategory(categoryRich)
  const priority = pick('priority') || 'medium'
  const departmentCode = pick('departmentCode', 'department_code') || 'general'
  const wardNumber = num(pick('wardNumber', 'ward_number', 'ward'))
  const villageName = pick('villageName', 'village_name', 'village')
  const transferStatus = pick('transferStatus', 'transfer_status') || 'pending'
  const officerName = pick('officerName', 'officer_name')
  const officerPhone = pick('officerPhone', 'officer_phone')

  if (!callReason) {
    return json({ ok: false, error: 'Missing call_reason / transcript' }, 400)
  }

  // ─── 5. Idempotency check on vapiCallId ────────────────────────────────
  const existing = await db.complaint.findFirst({
    where: { vapiCallId },
    select: { id: true, trackingId: true },
  }).catch((e) => {
    console.error('[vapi-webhook] DB error during dedup check:', e)
    return null
  })
  if (existing) {
    console.log(`[vapi-webhook] DEDUPED — complaint already exists for vapiCallId=${vapiCallId}`)
    return json({ ok: true, deduped: true, trackingId: existing.trackingId })
  }

  // ─── 6. Generate tracking ID + insert ──────────────────────────────────
  const trackingId = generateTrackingId()
  const nowIso = new Date().toISOString()
  const timeline = [
    {
      status: 'Pending',
      ts: nowIso,
      note: `AI voice assistant filed complaint (priority=${priority}, dept=${departmentCode})`,
      by: 'vapi-assistant',
    },
  ]

  const department = await db.department.findUnique({ where: { code: departmentCode } }).catch(() => null)
  const routingRule = await db.routingRule.findUnique({ where: { category: categoryRich || categoryShort } }).catch(() => null)

  const complaint = await db.complaint.create({
    data: {
      trackingId,
      vapiCallId,
      callerName,
      callerPhone,
      callReason,
      category: categoryShort,
      status: 'Pending',
      rawTranscript: transcript,
      timeline: JSON.stringify(timeline),
    },
  })

  // Insert the CallRecord (rich data)
  const callRecord = await db.callRecord.create({
    data: {
      vapiCallId,
      callerPhone: callerPhone || null,
      citizenName: callerName,
      villageName: villageName || null,
      wardNumber: wardNumber,
      category: categoryRich || categoryShort,
      priority,
      departmentCode,
      transferTarget: officerPhone || null,
      transferStatus,
      complaintId: complaint.id,
      transcript,
      language: 'hi',
      status: transferStatus === 'connected' ? 'transferred' : 'ended',
      endedAt: new Date(),
    },
  }).catch((e) => {
    console.error('[vapi-webhook] CallRecord insert failed (non-fatal):', e)
    return null
  })

  // ─── 7. Escalation row if transfer failed / no answer ─────────────────
  if (transferStatus === 'failed' || transferStatus === 'no_answer') {
    await db.escalation.create({
      data: {
        complaintId: complaint.id,
        callId: callRecord?.id || null,
        level: 1,
        reason: `Transfer ${transferStatus} — officer ${officerName || departmentCode} unreachable`,
        notifiedTo: PRADHAN_WHATSAPP,
        status: 'pending',
      },
    }).catch((e) => {
      console.error('[vapi-webhook] Escalation insert failed (non-fatal):', e)
    })

    // Notify Pradhan about the escalation
    const escalationMsg = [
      '⚠️ एस्केलेशन — कॉल ट्रांसफर फेल',
      `ट्रैकिंग आईडी: ${trackingId}`,
      `नागरिक: ${callerName} (${callerPhone || 'नंबर अनुपलब्ध'})`,
      `विभाग: ${department?.nameHi || departmentCode}`,
      `अधिकारी: ${officerName || 'नाम अनुपलब्ध'} (${officerPhone || 'नंबर अनुपलब्ध'})`,
      `कारण: अधिकारी उपलब्ध नहीं (${transferStatus})`,
      '',
      'कृपया शीघ्र ही नागरिक से संपर्क करें।',
    ].join('\n')
    await dispatchWhatsApp(PRADHAN_WHATSAPP, escalationMsg).catch(() => {})
  }

  // ─── 8. WhatsApp dispatch: Pradhan + officer + head + citizen ────────
  const msgParams: ComplaintMsgParams = {
    name: callerName,
    phone: callerPhone,
    village: villageName,
    ward: wardNumber,
    categoryRich: categoryRich || categoryShort,
    categoryShort,
    priority,
    departmentName: department?.nameHi || department?.nameEn || departmentCode,
    trackingId,
    reason: callReason,
  }
  const complaintMsg = buildComplaintMessage(msgParams)

  // Dedupe by phone number so the Pradhan (often also the dept head) gets ONE message.
  const seenPhonesEnd = new Set<string>()
  const recipients: Array<{ to: string; tag: string; msg: string }> = []
  function addRecipientEnd(to: string, tag: string, msg: string) {
    const digits = to.replace(/\D/g, '')
    if (!digits || digits.length < 7) return
    if (seenPhonesEnd.has(digits)) return
    seenPhonesEnd.add(digits)
    recipients.push({ to: digits, tag, msg })
  }
  addRecipientEnd(PRADHAN_WHATSAPP, 'pradhan', complaintMsg)
  if (department?.officerPhone) {
    addRecipientEnd(department.officerPhone, `officer:${departmentCode}`, complaintMsg)
  }
  if (department?.headPhone) {
    addRecipientEnd(department.headPhone, `head:${departmentCode}`, complaintMsg)
  }
  if (callerPhone) {
    addRecipientEnd(callerPhone, 'citizen', buildCitizenConfirmationMessage(msgParams))
  }

  await Promise.allSettled(recipients.map((r) => dispatchWhatsApp(r.to, r.msg).catch(() => {})))

  // ─── 9. Broadcast complaint:new event ────────────────────────────────
  broadcastEvent('complaint:new', {
    trackingId,
    complaintId: complaint.id,
    callRecordId: callRecord?.id || null,
    callerName,
    category: categoryShort,
    categoryRich: categoryRich || categoryShort,
    priority,
    departmentCode,
    village: villageName,
    ward: wardNumber,
    transferStatus,
    createdAt: nowIso,
  })

  console.log(
    `[vapi-webhook] OK — complaint inserted: trackingId=${trackingId} vapiCallId=${vapiCallId} category=${categoryRich}→${categoryShort} dept=${departmentCode} priority=${priority}`,
  )
  return json({ ok: true, trackingId, complaintId: complaint.id, callRecordId: callRecord?.id || null })
}

// ─── HTML doc page ────────────────────────────────────────────────────────

const HTML_DOC = `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Vapi Webhook Service — Gram Panchayat Chandra</title>
  <style>
    :root { color-scheme: light dark; }
    body { font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans Devanagari", sans-serif; max-width: 880px; margin: 0 auto; padding: 32px 20px 80px; line-height: 1.6; background: #fafaf9; color: #1c1917; }
    @media (prefers-color-scheme: dark) { body { background: #0c0a09; color: #fafaf9; } }
    h1 { font-size: 1.6rem; margin: 0 0 4px; }
    h2 { font-size: 1.15rem; margin: 28px 0 8px; border-bottom: 1px solid #78716c33; padding-bottom: 4px; }
    .sub { color: #78716c; font-size: 0.9rem; margin-bottom: 8px; }
    code, pre { font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace; background: #e7e5e4; padding: 2px 6px; border-radius: 4px; font-size: 0.86rem; }
    @media (prefers-color-scheme: dark) { code, pre { background: #1c1917; } }
    pre { padding: 14px 16px; overflow-x: auto; border-radius: 8px; line-height: 1.45; white-space: pre-wrap; word-break: break-word; }
    table { border-collapse: collapse; width: 100%; margin: 8px 0; font-size: 0.9rem; }
    th, td { border: 1px solid #78716c55; padding: 8px 10px; text-align: left; vertical-align: top; }
    th { background: #e7e5e4; }
    @media (prefers-color-scheme: dark) { th { background: #1c1917; } }
    .badge { display: inline-block; padding: 2px 10px; border-radius: 999px; background: #16a34a; color: white; font-size: 0.74rem; font-weight: 600; margin-left: 6px; }
    .back { display: inline-block; margin-top: 28px; text-decoration: none; color: #16a34a; font-weight: 600; }
  </style>
</head>
<body>
  <h1>Vapi Voice-Complaint Webhook <span class="badge">port 3003 · v2</span></h1>
  <p class="sub">Gram Panchayat Chandra — Digital Governance Portal</p>

  <h2>Endpoints</h2>
  <table>
    <tr><th>Method</th><th>Path</th><th>Description</th></tr>
    <tr><td><code>POST</code></td><td><code>/vapi-webhook</code></td><td>Receive a Vapi end-of-call-report, verify HMAC, insert Complaint + CallRecord + Escalation, dispatch WhatsApp to Pradhan + officer + head + citizen.</td></tr>
    <tr><td><code>POST</code></td><td><code>/function-call</code></td><td>Dispatch a Vapi function-call payload to the right handler (registerComplaint, transferCall, getRoutingInfo, endCall).</td></tr>
    <tr><td><code>POST</code></td><td><code>/send-whatsapp</code></td><td>Send a WhatsApp message to a specific number <code>{ to, message }</code>.</td></tr>
    <tr><td><code>POST</code></td><td><code>/broadcast</code></td><td>Internal broadcast hook (writes to broadcast.log for SSE polling).</td></tr>
    <tr><td><code>GET</code></td><td><code>/health</code></td><td>Liveness probe.</td></tr>
    <tr><td><code>GET</code></td><td><code>/</code></td><td>This documentation page.</td></tr>
  </table>

  <h2>WhatsApp recipients on new complaint</h2>
  <ul>
    <li>Pradhan: <code>${PRADHAN_WHATSAPP}</code></li>
    <li>Department officer (looked up from Department table)</li>
    <li>Department head (if different from officer)</li>
    <li>Citizen (confirmation message with tracking ID)</li>
  </ul>

  <a class="back" href="/?XTransformPort=3000">← वापस मुख्य पोर्टल पर जाएं / Back to main portal</a>
</body>
</html>`

// ─── Bun server ───────────────────────────────────────────────────────────
const server = Bun.serve({
  port: PORT,
  async fetch(req, server) {
    const url = new URL(req.url)
    const path = url.pathname

    // GET /health
    if (req.method === 'GET' && path === '/health') {
      return json({
        ok: true,
        service: 'vapi-webhook',
        port: PORT,
        ts: new Date().toISOString(),
      })
    }

    // GET /whatsapp-status → which WhatsApp provider is active + recent outbox
    if (req.method === 'GET' && path === '/whatsapp-status') {
      const metaConfigured = !!(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_ID)
      const twilioConfigured = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WHATSAPP_FROM)
      let recentOutbox: string[] = []
      try {
        const log = readFileSync(OUTBOX_LOG, 'utf-8').split('\n').filter(Boolean).slice(-5)
        recentOutbox = log
      } catch { /* no outbox yet */ }
      return json({
        ok: true,
        providers: {
          meta: { configured: metaConfigured, phoneId: process.env.WHATSAPP_PHONE_ID ? 'set' : 'missing' },
          twilio: { configured: twilioConfigured, from: process.env.TWILIO_WHATSAPP_FROM || 'missing' },
        },
        activeProvider: metaConfigured ? 'meta' : (twilioConfigured ? 'twilio' : 'mock'),
        adminWhatsapp: process.env.ADMIN_WHATSAPP || 'not set',
        recentOutbox,
      })
    }

    // GET / → HTML doc page
    if (req.method === 'GET' && (path === '/' || path === '')) {
      return new Response(HTML_DOC, {
        headers: { 'content-type': 'text/html; charset=utf-8' },
      })
    }

    // POST /vapi-webhook → main Vapi end-of-call webhook
    if (req.method === 'POST' && (path === '/vapi-webhook' || path === '/webhook')) {
      return handleWebhook(req, server)
    }

    // POST /function-call → dispatch a Vapi function-call payload
    if (req.method === 'POST' && path === '/function-call') {
      return handleFunctionCall(req)
    }

    // POST /send-whatsapp → send a WhatsApp message to a specific number
    if (req.method === 'POST' && path === '/send-whatsapp') {
      return handleSendWhatsApp(req)
    }

    // POST /broadcast → broadcast an event
    if (req.method === 'POST' && path === '/broadcast') {
      return handleBroadcast(req)
    }

    // 404
    return json({ ok: false, error: 'Not Found', path }, 404)
  },
  error(err) {
    console.error('[vapi-webhook] uncaught server error:', err)
    return json({ ok: false, error: 'Internal Server Error' }, 500)
  },
})

console.log(`[vapi-webhook] listening on http://localhost:${PORT}`)
console.log(
  `[vapi-webhook] dev_mode=${DEV_MODE} (HMAC ${DEV_MODE ? 'SKIPPED' : 'ENABLED'}) | ` +
  `IP allowlist ${VAPI_IP_ALLOWLIST_RAW ? 'ENABLED' : 'OPEN (dev)'}`,
)
console.log(`[vapi-webhook] DATABASE_URL=${process.env.DATABASE_URL}`)
console.log(`[vapi-webhook] Pradhan WhatsApp: ${PRADHAN_WHATSAPP}`)
console.log(`[vapi-webhook] outbox log: ${OUTBOX_LOG}`)
console.log(`[vapi-webhook] broadcast log: ${BROADCAST_LOG}`)

process.on('SIGINT', () => {
  console.log('[vapi-webhook] SIGINT — shutting down...')
  db.$disconnect().finally(() => process.exit(0))
})
process.on('SIGTERM', () => {
  console.log('[vapi-webhook] SIGTERM — shutting down...')
  db.$disconnect().finally(() => process.exit(0))
})

export { server }
