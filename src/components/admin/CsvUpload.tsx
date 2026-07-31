'use client'
// CSV bulk upload UI — preview with PII detection + confirm.
import { useState, useRef } from 'react'
import { useI18n } from '@/lib/i18n'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  AlertTriangle,
  CheckCircle2,
  FileUp,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  UploadCloud,
} from 'lucide-react'
import { CSV_PORTALS, piiTypeLabel } from './lib'
import type { Locale } from '@/lib/i18n'

interface Preview {
  ok: boolean
  preview: boolean
  headers: string[]
  totalRows: number
  sampleRows: string[][]
  piiSummary: Record<string, number>
  piiIssues: { row: number; field: string; type: string }[]
  piiIssueCount: number
}

interface ConfirmResult {
  ok: boolean
  inserted: number
  redacted: number
  totalRows: number
}

export function CsvUpload() {
  const { locale } = useI18n()
  const [portal, setPortal] = useState<string>('csv_upload')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<Preview | null>(null)
  const [confirmResult, setConfirmResult] = useState<ConfirmResult | null>(null)
  const [busy, setBusy] = useState<'preview' | 'confirm' | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const upload = async (f: File, confirm: boolean) => {
    setBusy(confirm ? 'confirm' : 'preview')
    try {
      const fd = new FormData()
      fd.append('file', f)
      fd.append('portal', portal)
      if (confirm) fd.append('confirm', 'true')
      const r = await fetch('/api/admin/csv-upload', { method: 'POST', body: fd })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'upload_failed')
      if (confirm) {
        setConfirmResult(d as ConfirmResult)
        toast.success(locale === 'hi'
          ? `${d.inserted} रिकॉर्ड डाले गए, ${d.redacted} PII रिडैक्ट किए गए`
          : `${d.inserted} records inserted, ${d.redacted} PII redacted`)
      } else {
        setPreview(d as Preview)
        setConfirmResult(null)
        toast.success(locale === 'hi' ? 'पूर्वावलोकन तैयार' : 'Preview ready')
      }
    } catch (e) {
      toast.error(locale === 'hi' ? 'अपलोड विफल' : 'Upload failed', { description: (e as Error).message })
    } finally {
      setBusy(null)
    }
  }

  const onFileSelected = (f: File | null) => {
    if (!f) return
    if (!f.name.toLowerCase().endsWith('.csv')) {
      toast.error(locale === 'hi' ? 'केवल .csv फ़ाइलें' : 'Only .csv files')
      return
    }
    setFile(f)
    setPreview(null)
    setConfirmResult(null)
    upload(f, false)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files?.[0]
    if (f) onFileSelected(f)
  }

  const reset = () => {
    setFile(null)
    setPreview(null)
    setConfirmResult(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold section-heading">
          {locale === 'hi' ? 'CSV बल्क अपलोड' : 'CSV Bulk Upload'}
        </h2>
        <p className="text-xs text-muted-foreground mt-2">
          {locale === 'hi'
            ? 'DPDP §9 के अनुसार PII का स्वतः पता लगाना एवं रिडैक्शन। पहले पूर्वावलोकन करें, फिर पुष्टि करें।'
            : 'Automatic PII detection + redaction per DPDP §9. Preview first, then confirm.'}
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileUp className="h-4 w-4 text-primary" />
            {locale === 'hi' ? 'फ़ाइल अपलोड करें' : 'Upload File'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-3">
            <div className="space-y-1.5 md:col-span-1">
              <Label className="text-xs">{locale === 'hi' ? 'पोर्टल' : 'Portal'}</Label>
              <Select value={portal} onValueChange={(v) => { setPortal(v); reset() }}>
                <SelectTrigger className="w-full text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CSV_PORTALS.map(p => <SelectItem key={p} value={p} className="text-xs font-mono">{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2 flex items-end">
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                className={`w-full rounded-lg border-2 border-dashed p-4 text-center cursor-pointer transition-colors min-h-[88px] flex flex-col items-center justify-center gap-1 ${
                  dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-secondary/40'
                }`}
              >
                <UploadCloud className="h-6 w-6 text-primary" />
                <div className="text-xs">
                  {file ? (
                    <span className="font-medium">{file.name} <span className="text-muted-foreground">({(file.size / 1024).toFixed(1)} KB)</span></span>
                  ) : (
                    <span>{locale === 'hi' ? 'CSV फ़ाइल यहाँ खींचें या क्लिक करके चुनें' : 'Drag CSV here or click to select'}</span>
                  )}
                </div>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(e) => onFileSelected(e.target.files?.[0] || null)}
                />
              </div>
            </div>
          </div>

          {busy && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {busy === 'preview'
                ? (locale === 'hi' ? 'पूर्वावलोकन बना रहे हैं...' : 'Generating preview...')
                : (locale === 'hi' ? 'रिकॉर्ड डाल रहे हैं...' : 'Inserting records...')}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview panel */}
      {preview && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              {locale === 'hi' ? 'पूर्वावलोकन एवं PII रिपोर्ट' : 'Preview & PII Report'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Stat label={locale === 'hi' ? 'कुल पंक्तियाँ' : 'Total Rows'} value={preview.totalRows} />
              <Stat label={locale === 'hi' ? 'हेडर' : 'Headers'} value={preview.headers.length} />
              <Stat label={locale === 'hi' ? 'PII मुद्दे' : 'PII Issues'} value={preview.piiIssueCount} tone={preview.piiIssueCount > 0 ? 'warn' : 'ok'} />
              <Stat label={locale === 'hi' ? 'प्रकार' : 'Types'} value={Object.keys(preview.piiSummary).length} />
            </div>

            {/* PII summary badges */}
            {Object.keys(preview.piiSummary).length > 0 ? (
              <div className="rounded-md border border-orange-300 bg-orange-50 dark:bg-orange-950/30 dark:border-orange-800 p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-900 dark:text-orange-200">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  {locale === 'hi' ? 'PII सारांश (रिडैक्शन के लिए चिह्नित)' : 'PII Summary (flagged for redaction)'}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(preview.piiSummary).map(([type, count]) => (
                    <Badge key={type} variant="outline" className="bg-orange-100 dark:bg-orange-900/40 text-orange-900 dark:text-orange-100 border-orange-300 dark:border-orange-700 text-[10px] gap-1">
                      {piiTypeLabel(type, locale)}
                      <span className="font-bold">×{count}</span>
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-md border border-green-300 bg-green-50 dark:bg-green-950/30 dark:border-green-800 p-3 flex items-center gap-1.5 text-xs text-green-900 dark:text-green-200">
                <ShieldCheck className="h-3.5 w-3.5" />
                {locale === 'hi' ? 'कोई PII नहीं मिला।' : 'No PII detected.'}
              </div>
            )}

            {/* Sample rows */}
            <div>
              <div className="text-xs font-medium mb-1.5">{locale === 'hi' ? 'पहली 10 पंक्तियाँ' : 'First 10 rows'}</div>
              <div className="max-h-72 overflow-auto custom-scroll rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[10px] w-10">#</TableHead>
                      {preview.headers.map((h, i) => <TableHead key={i} className="text-[10px] font-mono">{h}</TableHead>)}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.sampleRows.map((row, ri) => (
                      <TableRow key={ri}>
                        <TableCell className="text-[10px] text-muted-foreground">{ri + 1}</TableCell>
                        {preview.headers.map((h, ci) => {
                          const val = row[ci] || ''
                          const flagged = preview.piiIssues.some(p => p.row === ri + 1 && p.field === h)
                          return (
                            <TableCell key={ci} className={`text-[10px] font-mono ${flagged ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-900 dark:text-orange-100' : ''}`}>
                              {flagged ? <span className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{val}</span> : val}
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* PII issues list */}
            {preview.piiIssues.length > 0 && (
              <div>
                <div className="text-xs font-medium mb-1.5">
                  {locale === 'hi' ? `पहले ${Math.min(preview.piiIssues.length, 20)} PII मुद्दे` : `First ${Math.min(preview.piiIssues.length, 20)} PII issues`}
                  {preview.piiIssueCount > preview.piiIssues.length && (
                    <span className="text-muted-foreground"> ({locale === 'hi' ? `कुल ${preview.piiIssueCount} में से` : `of ${preview.piiIssueCount} total`})</span>
                  )}
                </div>
                <div className="max-h-40 overflow-y-auto custom-scroll rounded-md border bg-secondary/30">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-[10px]">{locale === 'hi' ? 'पंक्ति' : 'Row'}</TableHead>
                        <TableHead className="text-[10px]">{locale === 'hi' ? 'फ़ील्ड' : 'Field'}</TableHead>
                        <TableHead className="text-[10px]">{locale === 'hi' ? 'प्रकार' : 'Type'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {preview.piiIssues.slice(0, 20).map((iss, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-[10px] font-mono">{iss.row}</TableCell>
                          <TableCell className="text-[10px] font-mono">{iss.field}</TableCell>
                          <TableCell><Badge variant="outline" className="text-[10px]">{piiTypeLabel(iss.type, locale)}</Badge></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-2 border-t">
              <Button onClick={() => file && upload(file, true)} disabled={busy !== null} className="gap-1.5">
                {busy === 'confirm' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                {locale === 'hi' ? 'अपलोड की पुष्टि करें' : 'Confirm Upload'}
              </Button>
              <Button variant="outline" onClick={reset}>{locale === 'hi' ? 'रीसेट' : 'Reset'}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirm result panel */}
      {confirmResult && (
        <Card className="border-green-400 dark:border-green-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-green-900 dark:text-green-200">
              <CheckCircle2 className="h-4 w-4" />
              {locale === 'hi' ? 'अपलोड पूर्ण' : 'Upload Complete'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              <Stat label={locale === 'hi' ? 'डाले गए' : 'Inserted'} value={confirmResult.inserted} tone="ok" />
              <Stat label={locale === 'hi' ? 'PII रिडैक्ट' : 'PII Redacted'} value={confirmResult.redacted} tone="warn" />
              <Stat label={locale === 'hi' ? 'कुल पंक्तियाँ' : 'Total Rows'} value={confirmResult.totalRows} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: 'ok' | 'warn' }) {
  const toneClass = tone === 'ok'
    ? 'border-green-300 bg-green-50 dark:bg-green-950/30 dark:border-green-700'
    : tone === 'warn'
    ? 'border-orange-300 bg-orange-50 dark:bg-orange-950/30 dark:border-orange-700'
    : 'border-border bg-secondary/30'
  return (
    <div className={`rounded-md border p-2.5 ${toneClass}`}>
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className="text-xl font-bold tabular-nums mt-0.5">{value}</div>
    </div>
  )
}
