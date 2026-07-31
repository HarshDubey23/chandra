'use client'
import { useEffect, useRef, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { useUI } from '@/lib/ui-store'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { ScrollReveal } from './ScrollReveal'
import {
  Inbox,
  Hourglass,
  Loader2,
  CheckCircle2,
  Mic,
  TrendingUp,
  Droplets,
  Route as RouteIcon,
  GraduationCap,
  Home,
  Wallet,
  Pickaxe,
  MoreHorizontal,
  ArrowRight,
  Search,
  PenSquare,
  Activity,
} from 'lucide-react'

/* ─── API response shape (subset we use) ─── */
interface StatsResponse {
  complaints: { total: number; pending: number; inProgress: number; resolved: number; rejected: number }
  vapiFiledCount: number
  categoryBreakdown: { category: string; count: number }[]
  complaintsTrend: { date: string; count: number }[]
}

/* ─── Category metadata (icon + Hindi label + color) ─── */
const CATEGORY_META: Record<string, { hi: string; en: string; Icon: typeof Droplets; color: string }> = {
  water: { hi: 'जल', en: 'Water', Icon: Droplets, color: '#0ea5e9' },
  road: { hi: 'सड़क', en: 'Road', Icon: RouteIcon, color: '#f59e0b' },
  school: { hi: 'विद्यालय', en: 'School', Icon: GraduationCap, color: '#8b5cf6' },
  housing: { hi: 'आवास', en: 'Housing', Icon: Home, color: '#ec4899' },
  pension: { hi: 'पेंशन', en: 'Pension', Icon: Wallet, color: '#10b981' },
  mgnrega: { hi: 'मनरेगा', en: 'MGNREGA', Icon: Pickaxe, color: '#a16207' },
  other: { hi: 'अन्य', en: 'Other', Icon: MoreHorizontal, color: '#64748b' },
}

/* ─── Count-up animation hook (animates from 0 to value on mount/change) ─── */
function useCountUp(value: number, durationMs = 900) {
  const [display, setDisplay] = useState(0)
  const fromRef = useRef(0)
  const rafRef = useRef<number | null>(null)
  useEffect(() => {
    const from = fromRef.current
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min((now - start) / durationMs, 1)
      // easeOutCubic for a snappy deceleration
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(Math.round(from + (value - from) * eased))
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        fromRef.current = value
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [value, durationMs])
  return display
}

/* ─── Individual stat counter card ─── */
function StatCard({
  label, value, Icon, accent, delay,
}: { label: string; value: number; Icon: typeof Inbox; accent: string; delay: number }) {
  const animated = useCountUp(value)
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-xl border border-border/70 bg-card p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
    >
      {/* Top accent stripe */}
      <div className="absolute inset-x-0 top-0 h-1" style={{ background: accent }} />
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `${accent}1a`, color: accent }}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-2 font-mono text-3xl font-bold tabular-nums text-foreground" style={{ color: accent }}>
        {animated}
      </div>
    </motion.div>
  )
}

/**
 * ComplaintLiveStatus — a transparent, real-time dashboard showcasing the
 * output of the Vapi→complaint→WhatsApp pipeline directly on the homepage.
 * Citizens see live counts (total/pending/in-progress/resolved), a 7-day
 * filing trend, a category breakdown, and a prominent "AI voice filed"
 * highlight proving the voice-complaint system is active. Auto-refreshes
 * every 60 seconds. Placed right after the Hero section.
 */
export function ComplaintLiveStatus() {
  const { locale } = useI18n()
  const { setView } = useUI()
  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchStats = () => {
    fetch('/api/stats')
      .then(r => r.json())
      .then((d: StatsResponse) => { setStats(d); setLastUpdated(new Date()) })
      .catch(() => {})
  }

  useEffect(() => {
    fetchStats()
    const id = setInterval(fetchStats, 60_000) // auto-refresh every 60s
    return () => clearInterval(id)
  }, [])

  const hi = locale === 'hi'
  const c = stats?.complaints
  const total = c?.total ?? 0
  const pending = c?.pending ?? 0
  const inProgress = c?.inProgress ?? 0
  const resolved = c?.resolved ?? 0
  const vapiFiled = stats?.vapiFiledCount ?? 0
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0
  const trend = stats?.complaintsTrend ?? []
  const maxTrend = Math.max(1, ...trend.map(t => t.count))
  const categories = stats?.categoryBreakdown ?? []
  const maxCat = Math.max(1, ...categories.map(cat => cat.count))

  return (
    <section id="complaint-live" className="section-premium py-16 md:py-20 border-b border-border/40">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          {/* Section header with LIVE badge */}
          <div className="mb-10 flex flex-col items-center text-center">
            <Badge variant="outline" className="section-header-badge mb-3 gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              {hi ? 'लाइव डेटा' : 'Live Data'} · {hi ? 'अपडेट हर 60 सेकंड' : 'Updates every 60s'}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gradient-premium">
              {hi ? 'शिकायत लाइव स्थिति' : 'Complaint Live Status'}
            </h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              {hi
                ? 'AI वॉइस सहायक से दर्ज शिकायतों सहित सभी शिकायतों की पारदर्शी वास्तविक-समय स्थिति। प्रधान जी को तुरंत WhatsApp सूचना भेजी जाती है।'
                : 'Transparent real-time status of all complaints including those filed via the AI voice assistant. The Pradhan is instantly notified on WhatsApp.'}
            </p>
          </div>
        </ScrollReveal>

        {/* ─── 4 stat counter cards ─── */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          <StatCard label={hi ? 'कुल शिकायतें' : 'Total'} value={total} Icon={Inbox} accent="#f97316" delay={0} />
          <StatCard label={hi ? 'लंबित' : 'Pending'} value={pending} Icon={Hourglass} accent="#eab308" delay={0.08} />
          <StatCard label={hi ? 'प्रगति में' : 'In Progress'} value={inProgress} Icon={Loader2} accent="#3b82f6" delay={0.16} />
          <StatCard label={hi ? 'समाधान' : 'Resolved'} value={resolved} Icon={CheckCircle2} accent="#16a34a" delay={0.24} />
        </div>

        {/* ─── Main grid: trend chart (left) + AI voice + category (right) ─── */}
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {/* 7-day trend mini bar chart */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="rounded-xl border border-border/70 bg-card p-5 shadow-sm md:col-span-2"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <TrendingUp className="h-4 w-4 text-primary" />
                {hi ? '7-दिन शिकायत प्रवृत्ति' : '7-Day Complaint Trend'}
              </h3>
              <span className="text-[11px] text-muted-foreground">{hi ? 'दैनिक दर्ज' : 'filed daily'}</span>
            </div>
            <div className="flex h-32 items-end justify-between gap-1.5">
              {trend.length === 0 && (
                <p className="w-full text-center text-xs text-muted-foreground">{hi ? 'लोड हो रहा है…' : 'Loading…'}</p>
              )}
              {trend.map((t, i) => {
                const h = maxTrend > 0 ? (t.count / maxTrend) * 100 : 0
                const d = new Date(t.date)
                const label = d.toLocaleDateString(hi ? 'hi-IN' : 'en-IN', { weekday: 'short' })
                return (
                  <div key={t.date} className="flex flex-1 flex-col items-center gap-1.5">
                    <span className="text-[10px] font-semibold tabular-nums text-foreground">{t.count}</span>
                    <div className="flex w-full flex-1 items-end">
                      <motion.div
                        initial={{ height: 0 }}
                        whileInView={{ height: `${Math.max(h, 4)}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.4 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                        className="w-full rounded-t-md bg-gradient-to-t from-primary/60 to-primary"
                        style={{ minHeight: t.count > 0 ? 6 : 2, opacity: t.count > 0 ? 1 : 0.25 }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{label}</span>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* AI Voice pipeline highlight card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: 0.38 }}
            className="relative overflow-hidden rounded-xl border border-primary/40 bg-gradient-to-br from-primary/15 via-primary/5 to-accent/10 p-5 shadow-sm"
          >
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20 text-primary">
                    <Mic className="h-4 w-4" />
                  </span>
                  {hi ? 'AI वॉइस पाइपलाइन' : 'AI Voice Pipeline'}
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-green-600/15 px-2 py-0.5 text-[10px] font-bold uppercase text-green-700 dark:text-green-400">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-600" />
                  </span>
                  {hi ? 'सक्रिय' : 'Active'}
                </span>
              </div>
              <div className="mt-3 font-mono text-4xl font-bold tabular-nums text-primary">{useCountUp(vapiFiled)}</div>
              <p className="mt-1 text-xs text-muted-foreground">
                {hi ? 'AI वॉइस सहायक द्वारा दर्ज शिकायतें' : 'complaints filed via AI voice assistant'}
              </p>
              <div className="mt-3 rounded-lg border border-primary/20 bg-background/60 p-2.5 text-[11px] leading-relaxed text-muted-foreground">
                <span className="font-semibold text-foreground">{hi ? 'वार्ड 2 → प्रधान WhatsApp' : 'Ward 2 → Pradhan WhatsApp'}</span>
                <br />
                {hi ? 'Vapi कॉल → वेबहुक → DB → WhatsApp सूचना' : 'Vapi call → webhook → DB → WhatsApp alert'}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ─── Category breakdown + resolution rate + CTAs ─── */}
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {/* Category breakdown horizontal bars */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="rounded-xl border border-border/70 bg-card p-5 shadow-sm md:col-span-2"
          >
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Activity className="h-4 w-4 text-primary" />
              {hi ? 'श्रेणीवार विभाजन' : 'Category Breakdown'}
            </h3>
            <div className="space-y-2.5">
              {categories.map((cat, i) => {
                const meta = CATEGORY_META[cat.category] || CATEGORY_META.other
                const pct = maxCat > 0 ? (cat.count / maxCat) * 100 : 0
                const Icon = meta.Icon
                return (
                  <div key={cat.category} className="flex items-center gap-3">
                    <span className="flex w-28 shrink-0 items-center gap-1.5 text-xs font-medium text-foreground">
                      <Icon className="h-3.5 w-3.5" style={{ color: meta.color }} />
                      {hi ? meta.hi : meta.en}
                    </span>
                    <div className="relative h-5 flex-1 overflow-hidden rounded-md bg-muted">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${Math.max(pct, cat.count > 0 ? 6 : 0)}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.5 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                        className="flex h-full items-center justify-end rounded-md pr-2"
                        style={{ background: `${meta.color}33`, borderRight: `2px solid ${meta.color}` }}
                      >
                        {cat.count > 0 && (
                          <span className="text-[10px] font-bold tabular-nums" style={{ color: meta.color }}>{cat.count}</span>
                        )}
                      </motion.div>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Resolution rate + CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: 0.52 }}
            className="flex flex-col justify-between rounded-xl border border-border/70 bg-card p-5 shadow-sm"
          >
            <div>
              <h3 className="mb-2 text-sm font-semibold text-foreground">
                {hi ? 'समाधान दर' : 'Resolution Rate'}
              </h3>
              <div className="flex items-end gap-2">
                <span className="font-mono text-4xl font-bold tabular-nums text-green-600">{useCountUp(resolutionRate)}%</span>
                <span className="mb-1 text-xs text-muted-foreground">{hi ? `(${resolved}/${total})` : `(${resolved}/${total})`}</span>
              </div>
              <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${resolutionRate}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-600"
                />
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={() => setView('complaints')}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
              >
                <PenSquare className="h-3.5 w-3.5" />
                {hi ? 'शिकायत दर्ज करें' : 'File Complaint'}
              </button>
              <button
                onClick={() => setView('complaints')}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition-all hover:bg-muted"
              >
                <Search className="h-3.5 w-3.5" />
                {hi ? 'ट्रैकिंग आईडी से देखें' : 'Track Complaint'}
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Last updated timestamp */}
        {lastUpdated && (
          <p className="mt-4 text-center text-[11px] text-muted-foreground">
            {hi ? 'अंतिम अपडेट: ' : 'Last updated: '}
            {lastUpdated.toLocaleTimeString(hi ? 'hi-IN' : 'en-IN')}
            <span className="mx-1.5">·</span>
            {hi ? 'स्रोत: लाइव डेटाबेस' : 'Source: live database'}
          </p>
        )}
      </div>
    </section>
  )
}
