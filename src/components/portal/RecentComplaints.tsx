'use client'
import { useEffect, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { useUI } from '@/lib/ui-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollReveal } from './ScrollReveal'
import { motion } from 'framer-motion'
import { Inbox, Clock, Loader2, CheckCircle2, AlertCircle, ArrowRight, Activity, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PublicComplaint {
  trackingId: string
  callerName: string
  category: string
  status: string
  createdAt: string
  resolvedAt: string | null
}

interface Stats {
  total: number
  pending: number
  inProgress: number
  resolved: number
  rejected: number
  vapiFiledCount: number
  categoryBreakdown: { category: string; count: number }[]
}

const STATUS_CFG: Record<string, { hi: string; en: string; icon: React.ElementType; color: string; dot: string }> = {
  Pending: { hi: 'लंबित', en: 'Pending', icon: Clock, color: 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-950/40 dark:border-amber-900', dot: 'bg-amber-500' },
  InProgress: { hi: 'प्रगति पर', en: 'In Progress', icon: Loader2, color: 'text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-300 dark:bg-blue-950/40 dark:border-blue-900', dot: 'bg-blue-500' },
  Resolved: { hi: 'हल', en: 'Resolved', icon: CheckCircle2, color: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-900', dot: 'bg-emerald-500' },
  Rejected: { hi: 'अस्वीकृत', en: 'Rejected', icon: AlertCircle, color: 'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-300 dark:bg-rose-950/40 dark:border-rose-900', dot: 'bg-rose-500' },
}

const CATEGORY_HI: Record<string, string> = {
  water: 'जल',
  road: 'सड़क',
  school: 'विद्यालय',
  housing: 'आवास',
  pension: 'पेंशन',
  mgnrega: 'मनरेगा',
  other: 'अन्य',
}

function timeAgo(iso: string, hi: boolean): string {
  const diff = Date.now() - new Date(iso).getTime()
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return hi ? 'अभी' : 'just now'
  const min = Math.floor(sec / 60)
  if (min < 60) return hi ? `${min} मिनट पहले` : `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return hi ? `${hr} घंटे पहले` : `${hr}h ago`
  const day = Math.floor(hr / 24)
  if (day < 30) return hi ? `${day} दिन पहले` : `${day}d ago`
  return new Date(iso).toLocaleDateString(hi ? 'hi-IN' : 'en-IN')
}

export function RecentComplaints() {
  const { locale } = useI18n()
  const { setView } = useUI()
  const [complaints, setComplaints] = useState<PublicComplaint[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const hi = locale === 'hi'

  useEffect(() => {
    // Fetch public stats + last 5 complaints (only public fields)
    Promise.all([
      fetch('/api/stats').then(r => r.json()).catch(() => null),
      fetch('/api/complaints/list?limit=5&public=1').then(r => r.ok ? r.json() : { complaints: [] }).catch(() => ({ complaints: [] })),
    ]).then(([s, c]) => {
      // The stats API returns { complaints: {...}, vapiFiledCount, ... }
      // so extract the inner `complaints` object that has total/pending/etc.
      if (s?.complaints) {
        setStats({ ...s.complaints, vapiFiledCount: s.vapiFiledCount ?? 0 })
      } else if (s?.total) {
        setStats(s)
      } else {
        setStats(null)
      }
      setComplaints(c?.complaints ?? [])
      setLoading(false)
    })
  }, [])

  // Calculate resolution rate
  const total = stats?.total ?? 0
  const resolved = stats?.resolved ?? 0
  const pending = stats?.pending ?? 0
  const inProgress = stats?.inProgress ?? 0
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0
  const aiFiled = stats?.vapiFiledCount ?? 0
  const aiAdoptionRate = total > 0 ? Math.round((aiFiled / total) * 100) : 0

  return (
    <ScrollReveal>
      <section id="recent-complaints" className="container mx-auto px-4 py-12 md:py-16">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold mb-3">
            <Activity className="h-3 w-3" />
            {hi ? 'पारदर्शिता' : 'Transparency'}
          </div>
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
            {hi ? 'हाल की शिकायतें और समाधान स्थिति' : 'Recent Complaints & Resolution Status'}
          </h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl mx-auto">
            {hi
              ? 'पंचायत की पारदर्शी कार्यप्रणाली — हर शिकायत, हर अपडेट, हर समाधान यहाँ दिखाई देता है।'
              : 'Transparent panchayat workflow — every complaint, every update, every resolution is visible here.'}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Stats cards */}
          <div className="space-y-3">
            <Card className="border-primary/30 overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                    {hi ? 'कुल शिकायतें' : 'Total Complaints'}
                  </span>
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                    <Inbox className="h-3.5 w-3.5 text-primary" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-foreground tabular-nums">
                  {total}
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">
                  {hi ? 'सभी श्रेणियाँ सम्मिलित' : 'Across all categories'}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <Card className="border-amber-200/60">
                <CardContent className="p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Clock className="h-3 w-3 text-amber-600" />
                    <span className="text-[10px] uppercase font-semibold text-amber-700 dark:text-amber-300">{hi ? 'लंबित' : 'Pending'}</span>
                  </div>
                  <div className="text-xl font-bold text-amber-700 dark:text-amber-300 tabular-nums">{pending}</div>
                </CardContent>
              </Card>
              <Card className="border-blue-200/60">
                <CardContent className="p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Loader2 className="h-3 w-3 text-blue-600" />
                    <span className="text-[10px] uppercase font-semibold text-blue-700 dark:text-blue-300">{hi ? 'प्रगति पर' : 'In Progress'}</span>
                  </div>
                  <div className="text-xl font-bold text-blue-700 dark:text-blue-300 tabular-nums">{inProgress}</div>
                </CardContent>
              </Card>
              <Card className="border-emerald-200/60">
                <CardContent className="p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    <span className="text-[10px] uppercase font-semibold text-emerald-700 dark:text-emerald-300">{hi ? 'हल' : 'Resolved'}</span>
                  </div>
                  <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">{resolved}</div>
                </CardContent>
              </Card>
              <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
                <CardContent className="p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <TrendingUp className="h-3 w-3 text-primary" />
                    <span className="text-[10px] uppercase font-semibold text-primary">{hi ? 'समाधान दर' : 'Resolution'}</span>
                  </div>
                  <div className="text-xl font-bold text-primary tabular-nums">{resolutionRate}%</div>
                </CardContent>
              </Card>
            </div>

            {/* AI Adoption Progress bar */}
            <Card className="border-purple-200/60 dark:border-purple-900/40">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-950/40">
                      <span className="text-[10px]">🤖</span>
                    </div>
                    <span className="text-[10px] uppercase font-semibold text-purple-700 dark:text-purple-300">
                      {hi ? 'AI वॉइस अपनान' : 'AI Voice Adoption'}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-purple-700 dark:text-purple-300">{aiFiled}/{total}</span>
                </div>
                <div className="h-1.5 rounded-full bg-purple-100 dark:bg-purple-950/60 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-700 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${aiAdoptionRate}%` }}
                    transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                  />
                </div>
                <div className="text-[10px] text-muted-foreground mt-1.5">
                  {hi
                    ? `${total} में से ${aiFiled} शिकायतें AI वॉइस सहायक द्वारा दर्ज`
                    : `${aiFiled} of ${total} complaints filed via AI voice assistant`}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Recent complaints list */}
          <Card className="lg:col-span-2 border-border/70 overflow-hidden">
            <CardHeader className="pb-3 border-b bg-gradient-to-r from-secondary/40 to-transparent">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Inbox className="h-4 w-4 text-primary" />
                  {hi ? 'नवीनतम शिकायतें' : 'Latest Complaints'}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setView('complaints')}
                  className="gap-1 text-xs"
                >
                  {hi ? 'सभी देखें' : 'View all'}
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  <span className="text-sm">{hi ? 'लोड हो रहा है…' : 'Loading…'}</span>
                </div>
              ) : complaints.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Inbox className="h-10 w-10 mb-2 opacity-40" />
                  <p className="text-sm">{hi ? 'अभी तक कोई सार्वजनिक शिकायत नहीं' : 'No public complaints yet'}</p>
                </div>
              ) : (
                <ul className="divide-y divide-border/40">
                  {complaints.map((c, idx) => {
                    const cfg = STATUS_CFG[c.status] ?? STATUS_CFG.Pending
                    const Icon = cfg.icon
                    const catHi = CATEGORY_HI[c.category] ?? c.category
                    return (
                      <motion.li
                        key={c.trackingId}
                        className="flex items-center gap-3 p-3 hover:bg-secondary/30 transition-colors cursor-pointer"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.06 }}
                        onClick={() => setView('complaints')}
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-background border-2 border-border shrink-0">
                          <Icon className={cn('h-4 w-4', cfg.color.split(' ')[0])} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-bold text-foreground">{c.trackingId}</span>
                            <Badge variant="outline" className={cn('text-[9px] gap-1', cfg.color)}>
                              <span className={cn('h-1.5 w-1.5 rounded-full', cfg.dot)} />
                              {hi ? cfg.hi : cfg.en}
                            </Badge>
                            <Badge variant="secondary" className="text-[9px] font-medium">
                              {hi ? catHi : c.category}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                            <span className="font-medium text-foreground/80 truncate">{c.callerName}</span>
                            <span className="text-muted-foreground/50">·</span>
                            <span>{timeAgo(c.createdAt, hi)}</span>
                          </div>
                        </div>
                      </motion.li>
                    )
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </ScrollReveal>
  )
}
