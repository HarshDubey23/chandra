// CSV bulk upload — parse, validate, PII-detect (simple regex), preview/confirm
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionUser } from '@/lib/auth'
import { logActivity } from '@/lib/audit'
import crypto from 'node:crypto'

// Simple PII detection (DPDP §9 — Aadhaar 12-digit, Bank A/C 9-18, IFSC, mobile 10)
const PII_PATTERNS: { type: string; re: RegExp }[] = [
  { type: 'AADHAAR', re: /\b\d{4}\s?\d{4}\s?\d{4}\b/ },
  { type: 'BANK_AC', re: /\b\d{9,18}\b/ },
  { type: 'IFSC', re: /\b[A-Z]{4}0[A-Z0-9]{6}\b/ },
  { type: 'MOBILE', re: /\b[6-9]\d{9}\b/ },
  { type: 'PAN', re: /\b[A-Z]{5}\d{4}[A-Z]\b/ },
]

function detectPII(value: string): string[] {
  const found: string[] = []
  for (const { type, re } of PII_PATTERNS) if (re.test(value)) found.push(type)
  return found
}

function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.replace(/\r\n/g, '\n').split('\n').filter(l => l.trim())
  if (lines.length === 0) return { headers: [], rows: [] }
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
  const rows = lines.slice(1).map(line => {
    // naive CSV split — handles simple cases; for quoted commas we'd need a real parser
    return line.split(',').map(c => c.trim().replace(/^"|"$/g, ''))
  })
  return { headers, rows }
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req.headers.get('cookie'))
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  if (user.role === 'viewer') return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const portal = (formData.get('portal') as string) || 'csv_upload'
  const confirm = formData.get('confirm') === 'true'

  if (!file) return NextResponse.json({ error: 'no file' }, { status: 400 })
  const text = await file.text()
  const { headers, rows } = parseCSV(text)

  if (headers.length === 0) return NextResponse.json({ error: 'empty csv' }, { status: 400 })

  // PII scan + validation
  const issues: { row: number; field: string; type: string }[] = []
  const piiSummary: Record<string, number> = {}
  for (let i = 0; i < rows.length; i++) {
    for (let j = 0; j < rows[i].length; j++) {
      const val = rows[i][j]
      const detected = detectPII(val)
      for (const t of detected) {
        issues.push({ row: i + 1, field: headers[j], type: t })
        piiSummary[t] = (piiSummary[t] || 0) + 1
      }
    }
  }

  // Preview mode — return first 10 rows + validation report
  if (!confirm) {
    return NextResponse.json({
      ok: true,
      preview: true,
      headers,
      totalRows: rows.length,
      sampleRows: rows.slice(0, 10),
      piiSummary,
      piiIssues: issues.slice(0, 50),
      piiIssueCount: issues.length,
    })
  }

  // Confirm mode — insert as ScrapedData with PII redaction in-place
  let inserted = 0
  let redacted = 0
  for (const row of rows) {
    const record: Record<string, string> = {}
    for (let j = 0; j < headers.length; j++) {
      const val = row[j] || ''
      const detected = detectPII(val)
      if (detected.length > 0) {
        record[headers[j]] = `${detected[0]}_REDACTED_${crypto.createHash('sha256').update(val).digest('hex').slice(0, 8)}`
        redacted += detected.length
      } else {
        record[headers[j]] = val
      }
    }
    const dataStr = JSON.stringify(record)
    const contentHash = crypto.createHash('sha256').update(dataStr).digest('hex')
    await db.scrapedData.create({
      data: {
        portal,
        sourceUrl: `csv-upload://${file.name}`,
        recordType: 'bulk_upload',
        data: dataStr,
        contentHash,
        retrievedAt: new Date(),
        httpStatus: 200,
        bytes: dataStr.length,
        piiRedactions: redacted,
      },
    })
    inserted++
  }

  await logActivity({
    adminId: user.id, action: 'upload', entityType: 'scraped_data',
    after: { file: file.name, portal, rows: inserted, redactions: redacted },
    ip: req.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
    userAgent: req.headers.get('user-agent') || undefined,
  })

  return NextResponse.json({ ok: true, inserted, redacted, totalRows: rows.length })
}
