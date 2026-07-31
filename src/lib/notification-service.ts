/**
 * Notification Service Interface
 *
 * Production-ready interface for sending notifications to officers and admins
 * when new complaints are registered.
 *
 * Current implementation: stubs that log to console + audit outbox.
 * Future: wire to Vapi SMS, email, or push notifications.
 */

export interface NotificationPayload {
  trackingId: string
  citizenName: string
  citizenPhone: string
  category: string
  departmentCode: string
  priority: string
  description: string
  village?: string
  ward?: number
  source: 'vapi' | 'web'
}

export interface NotificationResult {
  sent: boolean
  channel: 'sms' | 'email' | 'log'
  recipient: string
  timestamp: string
  error?: string
}

/**
 * Notify the department officer about a new complaint.
 * Stub: logs to console. In production, dispatch via Vapi SMS.
 */
export async function notifyOfficer(
  officerPhone: string,
  officerName: string,
  payload: NotificationPayload,
): Promise<NotificationResult> {
  const timestamp = new Date().toISOString()
  const message = buildOfficerMessage(officerName, payload)

  console.log(`[notification] notifyOfficer → ${officerName} (${officerPhone})`)
  console.log(`[notification] trackingId=${payload.trackingId} category=${payload.category} dept=${payload.departmentCode}`)

  // ── STUB: In production, call Vapi SMS dispatch here ──
  // await dispatchVapiSms(officerPhone, message)

  return {
    sent: true,
    channel: 'log',
    recipient: officerPhone,
    timestamp,
  }
}

/**
 * Notify the admin (Pradhan) about a new complaint.
 * Stub: logs to console. In production, dispatch via Vapi SMS.
 */
export async function notifyAdmin(
  adminPhone: string,
  payload: NotificationPayload,
): Promise<NotificationResult> {
  const timestamp = new Date().toISOString()
  const message = buildAdminMessage(payload)

  console.log(`[notification] notifyAdmin → ${adminPhone}`)
  console.log(`[notification] trackingId=${payload.trackingId} priority=${payload.priority}`)

  // ── STUB: In production, call Vapi SMS dispatch here ──
  // await dispatchVapiSms(adminPhone, message)

  return {
    sent: true,
    channel: 'log',
    recipient: adminPhone,
    timestamp,
  }
}

// ── Message builders ──

function buildOfficerMessage(officerName: string, p: NotificationPayload): string {
  return [
    `📢 नई शिकायत असाइन की गई`,
    ``,
    `नाम: ${p.citizenName}`,
    `फोन: +91 ${p.citizenPhone}`,
    p.village ? `गांव: ${p.village}` : '',
    p.ward ? `वार्ड: ${p.ward}` : '',
    `श्रेणी: ${p.category}`,
    `विभाग: ${p.departmentCode}`,
    `प्राथमिकता: ${p.priority}`,
    `ट्रैकिंग: ${p.trackingId}`,
    ``,
    `विवरण: ${p.description.substring(0, 200)}`,
    ``,
    `— ग्राम पंचायत चंद्रा`,
  ].filter(Boolean).join('\n')
}

function buildAdminMessage(p: NotificationPayload): string {
  return [
    `🆕 नई शिकायत दर्ज`,
    ``,
    `ट्रैकिंग: ${p.trackingId}`,
    `नाम: ${p.citizenName}`,
    `श्रेणी: ${p.category}`,
    `विभाग: ${p.departmentCode}`,
    `प्राथमिकता: ${p.priority}`,
    `स्रोत: ${p.source === 'vapi' ? 'AI वॉइस' : 'वेब फॉर्म'}`,
    ``,
    `— ग्राम पंचायत चंद्रा`,
  ].filter(Boolean).join('\n')
}
