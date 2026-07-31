'use client'
// Activity log — immutable, reverse-chronological list with before/after diff.
import { useEffect, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Activity, ChevronRight, Clock, Hash, Inbox, Lock, Server, Download, Loader2 } from 'lucide-react'
import { actionBadgeClass, actionLabel, entityTypeLabel, formatDateTime } from './lib'
import type { Locale } from '@/lib/i18n'

interface LogEntry {
  id: string
  adminId: string | null
  admin: { name: string; email: string } | null
  action: string
  entityType: string
  entityId: string | null
  before: unknown
  after: unknown
  ip: string | null
  userAgent: string | null
  createdAt: string
}

export function ActivityLog() {
  const { locale } = useI18n()
  const [logs, setLogs] = useState<LogEntry[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [detail, setDetail] = useState<LogEntry | null>(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    fetch('/api/admin/activity?limit=100')
      .then(r => r.json())
      .then(d => setLogs(d.logs || []))
      .catch(() => { setLogs([]); toast.error(locale === 'hi' ? 'लॉग लोड विफल' : 'Activity log load failed') })
      .finally(() => setLoading(false))
  }, [locale])

  const handleExport = async () => {
    setExporting(true)
    try {
      const r = await fetch('/api/admin/activity/export')
      if (!r.ok) throw new Error('export_failed')
      const blob = await r.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `activity-log-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success(locale === 'hi' ? 'CSV डाउनलोड हुआ' : 'CSV downloaded')
    } catch (e) {
      toast.error(locale === 'hi' ? 'निर्यात विफल' : 'Export failed')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold section-heading">
            {locale === 'hi' ? 'गतिविधि लॉग' : 'Activity Log'}
          </h2>
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
            <Lock className="h-3 w-3" />
            {locale === 'hi'
              ? 'अपरिवर्तनीय ऑडिट ट्रेल (केवल पठनीय)।'
              : 'Immutable audit trail (read-only).'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {logs && (
            <Badge variant="outline" className="text-[10px] gap-1">
              <Activity className="h-3 w-3" />
              {locale === 'hi' ? `${logs.length} प्रविष्टियाँ` : `${logs.length} entries`}
            </Badge>
          )}
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs gap-1.5 border-primary/30 hover:border-primary/50"
            onClick={handleExport}
            disabled={exporting || !logs || logs.length === 0}
          >
            {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
            {locale === 'hi' ? 'CSV निर्यात' : 'Export CSV'}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 rounded" />)}
            </div>
          ) : !logs || logs.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
              <Inbox className="h-6 w-6 opacity-50" />
              {locale === 'hi' ? 'अभी तक कोई गतिविधि नहीं।' : 'No activity yet.'}
            </div>
          ) : (
            <div className="max-h-[70vh] overflow-y-auto custom-scroll divide-y">
              {logs.map(log => (
                <button
                  key={log.id}
                  onClick={() => setDetail(log)}
                  className="w-full text-left p-3 hover:bg-secondary/40 transition-colors flex items-start gap-3"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <Badge variant="outline" className={`text-[10px] ${actionBadgeClass(log.action)}`}>
                      {actionLabel(log.action, locale)}
                    </Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs">
                      <span className="font-medium">
                        {log.admin?.name || (locale === 'hi' ? 'सिस्टम' : 'system')}
                      </span>
                      <span className="text-muted-foreground">
                        {' · '}
                        {entityTypeLabel(log.entityType, locale)}
                        {log.entityId && <span className="font-mono"> · {log.entityId.length > 16 ? log.entityId.slice(0, 8) + '…' : log.entityId}</span>}
                      </span>
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-3 flex-wrap">
                      <span className="flex items-center gap-1"><Clock className="h-2.5 w-2.5" />{formatDateTime(log.createdAt, locale)}</span>
                      {log.ip && <span className="flex items-center gap-1 font-mono"><Server className="h-2.5 w-2.5" />{log.ip}</span>}
                      {log.entityId && <span className="flex items-center gap-1 font-mono"><Hash className="h-2.5 w-2.5" />{log.entityId.slice(0, 20)}</span>}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <DetailDialog entry={detail} locale={locale} onClose={() => setDetail(null)} />
    </div>
  )
}

function DetailDialog({ entry, locale, onClose }: { entry: LogEntry | null; locale: Locale; onClose: () => void }) {
  if (!entry) return null
  const hasDiff = entry.before !== null || entry.after !== null
  return (
    <Dialog open={!!entry} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto custom-scroll">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4 text-primary" />
            {locale === 'hi' ? 'गतिविधि विवरण' : 'Activity Detail'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <Field label={locale === 'hi' ? 'क्रिया' : 'Action'} value={actionLabel(entry.action, locale)} />
            <Field label={locale === 'hi' ? 'प्रकार' : 'Type'} value={entityTypeLabel(entry.entityType, locale)} />
            <Field label={locale === 'hi' ? 'एडमिन' : 'Admin'} value={entry.admin?.name || (locale === 'hi' ? 'सिस्टम' : 'system')} />
            <Field label={locale === 'hi' ? 'ईमेल' : 'Email'} value={entry.admin?.email || '—'} />
            <Field label={locale === 'hi' ? 'समय' : 'Timestamp'} value={formatDateTime(entry.createdAt, locale)} />
            <Field label="IP" value={entry.ip || '—'} mono />
            <Field label={locale === 'hi' ? 'एंटिटी आईडी' : 'Entity ID'} value={entry.entityId || '—'} mono />
            <Field label={locale === 'hi' ? 'लॉग आईडी' : 'Log ID'} value={entry.id} mono />
          </div>

          {entry.userAgent && (
            <div className="text-[10px] text-muted-foreground bg-secondary/30 rounded p-2 font-mono break-all">
              {entry.userAgent}
            </div>
          )}

          {hasDiff ? (
            <div className="grid md:grid-cols-2 gap-3">
              <div className="rounded-md border p-2.5">
                <div className="text-xs font-semibold mb-1.5 flex items-center gap-1.5">
                  <Badge variant="outline" className="text-[10px] bg-red-50 text-red-900 border-red-300 dark:bg-red-900/30 dark:text-red-200 dark:border-red-700">{locale === 'hi' ? 'पहले' : 'Before'}</Badge>
                </div>
                <pre className="text-[10px] font-mono whitespace-pre-wrap break-words max-h-48 overflow-y-auto custom-scroll">
                  {entry.before === null ? '—' : JSON.stringify(entry.before, null, 2)}
                </pre>
              </div>
              <div className="rounded-md border p-2.5">
                <div className="text-xs font-semibold mb-1.5 flex items-center gap-1.5">
                  <Badge variant="outline" className="text-[10px] bg-green-50 text-green-900 border-green-300 dark:bg-green-900/30 dark:text-green-200 dark:border-green-700">{locale === 'hi' ? 'बाद में' : 'After'}</Badge>
                </div>
                <pre className="text-[10px] font-mono whitespace-pre-wrap break-words max-h-48 overflow-y-auto custom-scroll">
                  {entry.after === null ? '—' : JSON.stringify(entry.after, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground bg-secondary/30 rounded p-2.5 text-center">
              {locale === 'hi' ? 'इस प्रविष्टि के लिए कोई before/after डेटा नहीं।' : 'No before/after data for this entry.'}
            </div>
          )}

          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground pt-2 border-t">
            <Lock className="h-3 w-3" />
            {locale === 'hi' ? 'यह लॉग अपरिवर्तनीय है।' : 'This log entry is immutable.'}
          </div>

          <div className="flex justify-end pt-1">
            <Button variant="outline" size="sm" onClick={onClose}>{locale === 'hi' ? 'बंद करें' : 'Close'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="bg-secondary/30 rounded p-2">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className={`text-xs font-medium mt-0.5 break-words ${mono ? 'font-mono' : ''}`}>{value}</div>
    </div>
  )
}
