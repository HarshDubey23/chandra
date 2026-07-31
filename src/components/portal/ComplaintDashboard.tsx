'use client'
import { useEffect, useRef, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { useUI } from '@/lib/ui-store'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollReveal } from './ScrollReveal'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import {
  Inbox,
  Hourglass,
  Loader2,
  CheckCircle2,
  PenSquare,
  BarChart3,
  Activity,
  ArrowRight,
  TrendingUp,
  Droplets,
  Route as RouteIcon,
  GraduationCap,
  Home,
  Wallet,
  Pickaxe,
  MoreHorizontal,
  Building2,
  HeartPulse,
  Zap,
  ShieldCheck,
  Phone,
  Mic,
  Search,
} from 'lucide-react'

// ── Color palette (NO indigo/blue) ──
const COLORS = {
  saffron: '#c2410c',
  green: '#16a34a',
  amber: '#d97706',
  stone: '#78716c',
  rose: '#e11d48',
  teal: '#0d9488',
  purple: '#7c3aed',
  sky: '#0ea5e9',
}

const PIE_COLORS = ['#c2410c', '#d97706', '#0d9488', '#16a34a', '#78716c', '#7c3aed', '#e11d48']

// ── Category metadata ──
const CATEGORY_META: Record<string, { hi: string; en: string; Icon: typeof Droplets; color: string }> = {
  water: { hi: 'जल', en: 'Water', Icon: Droplets, color: '#0ea5e9' },
  road: { hi: 'सड़क', en: 'Road', Icon: RouteIcon, color: '#f59e0b' },
  school: { hi: 'विद्यालय', en: 'School', Icon: GraduationCap, color: '#8b5cf6' },
  housing: { hi: 'आवास', en: 'Housing', Icon: Home, color: '#ec4899' },
  pension: { hi: 'पेंशन', en: 'Pension', Icon: Wallet, color: '#10b981' },
  mgnrega: { hi: 'मनरेगा', en: 'MGNREGA', Icon: Pickaxe, color: '#a16207' },
  other: { hi: 'अन्य', en: 'Other', Icon: MoreHorizontal, color: '#64748b' },
}

// ── Department icon mapping ──
const DEPT_ICON_MAP: Record<string, typeof Building2> = {
  water: Droplets,
  roads: RouteIcon,
  health: HeartPulse,
  education: GraduationCap,
  electricity: Zap,
  emergency: Phone,
  sanitation: ShieldCheck,
  pension: Wallet,
  mgnrega: Pickaxe,
  housing: Home,
  administration: Building2,
}

// ── Ward population data ──
const WARD_POPULATIONS = [
  { ward: 1, pop: 132, nameHi: 'मुंशीलाल', nameEn: 'Munshilal' },
  { ward: 2, pop: 128, nameHi: 'राजबहादुर', nameEn: 'Rajbahadur' },
  { ward: 3, pop: 135, nameHi: 'चन्द्रकान्त', nameEn: 'Chandrakant' },
  { ward: 4, pop: 118, nameHi: 'कवित्री देवी', nameEn: 'Kavitri Devi' },
  { ward: 5, pop: 129, nameHi: 'गीता देवी', nameEn: 'Geeta Devi' },
  { ward: 6, pop: 131, nameHi: 'अरुण कुमार', nameEn: 'Arun Kumar' },
  { ward: 7, pop: 127, nameHi: 'सुनील तिवारी', nameEn: 'Sunil Tiwari' },
  { ward: 8, pop: 125, nameHi: 'पुष्पा देवी', nameEn: 'Pushpa Devi' },
  { ward: 9, pop: 130, nameHi: 'देवेंद्र यादव', nameEn: 'Devendra Yadav' },
  { ward: 10, pop: 86, nameHi: 'राजेश मौर्य', nameEn: 'Rajesh Maurya' },
  { ward: 11, pop: 90, nameHi: 'संगीता मिश्रा', nameEn: 'Sangeeta Mishra' },
]

// ── Stats API response shape ──
interface StatsData {
  complaints: {
    total: number
    pending: number
    inProgress: number
    resolved: number
    rejected: number
  }
  vapiFiledCount: number
  categoryBreakdown: { category: string; count: number }[]
  complaintsTrend: { date: string; count: number }[]
}

// ── Department API response shape ──
interface DepartmentData {
  code: string
  nameHi: string
  nameEn: string
  officerName: string | null
  routingRules: { category: string; subcategory: string | null; priority: string; slaHours: number }[]
}

// ── Count-up animation hook (from ComplaintLiveStatus) ──
function useCountUp(value: number, durationMs = 900) {
  const [display, setDisplay] = useState(0)
  const fromRef = useRef(0)
  const rafRef = useRef<number | null>(null)
  useEffect(() => {
    const from = fromRef.current
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min((now - start) / durationMs, 1)
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

/**
 * ComplaintDashboard — merged with ComplaintLiveStatus
 * Includes: AI Voice Pipeline card, 7-day trend, resolution rate,
 * category breakdown, department performance, ward distribution, pie chart.
 */
export function ComplaintDashboard() {
  const { locale } = useI18n()
  const { setView } = useUI()
  const hi = locale === 'hi'

  const [stats, setStats] = useState<StatsData | null>(null)
  const [departments, setDepartments] = useState<DepartmentData[]>([])
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchStats = () => {
    fetch('/api/stats')
      .then(r => r.json())
      .then((d: StatsData) => { setStats(d); setLastUpdated(new Date()) })
      .catch(() => {})
  }

  useEffect(() => {
    fetchStats()
    const id = setInterval(fetchStats, 60_000) // auto-refresh every 60s
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    fetch('/api/vapi/departments')
      .then(r => r.json())
      .then(d => {
        if (d.success && d.departments) setDepartments(d.departments)
      })
      .catch(() => {})
  }, [])

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

  // ── Pie chart data ──
  const pieData = categories.map(cat => ({
    name: hi ? (CATEGORY_META[cat.category]?.hi ?? cat.category) : (CATEGORY_META[cat.category]?.en ?? cat.category),
    value: cat.count,
    category: cat.category,
  }))

  // ── Department performance data ──
  const deptData = departments.map(dept => {
    const deptCategories = dept.routingRules.map(r => r.category)
    let routedCount = 0
    deptCategories.forEach(rc => {
      const simpleCat = rc.split('_')[0]
      const found = categories.find(c => c.category === simpleCat)
      if (found) routedCount += found.count
    })
    const avgSla = dept.routingRules.length > 0
      ? Math.round(dept.routingRules.reduce((s, r) => s + r.slaHours, 0) / dept.routingRules.length)
      : 72
    const icon = DEPT_ICON_MAP[dept.code] ?? Building2
    return {
      code: dept.code,
      nameHi: dept.nameHi,
      nameEn: dept.nameEn,
      routedCount,
      slaHours: avgSla,
      ruleCount: dept.routingRules.length,
      Icon: icon,
    }
  }).sort((a, b) => b.routedCount - a.routedCount)

  // ── Ward-wise estimated distribution ──
  const totalPop = WARD_POPULATIONS.reduce((s, w) => s + w.pop, 0)
  const wardData = WARD_POPULATIONS.map(w => ({
    ward: w.ward,
    nameHi: w.nameHi,
    nameEn: w.nameEn,
    estimated: total > 0 ? Math.round((w.pop / totalPop) * total) : 0,
    population: w.pop,
  }))

  // ── Bar chart data for departments ──
  const deptBarData = deptData.map(d => ({
    name: hi ? d.nameHi : d.nameEn,
    count: d.routedCount,
    sla: d.slaHours,
  }))

  return (
    <section id="complaint-dashboard" className="section-premium py-16 md:py-20 border-b border-border/40">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          {/* Section header with LIVE badge */}
          <div className="mb-10 flex flex-col items-center text-center">
            <Badge variant="outline" className="section-header-badge mb-3 gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              <BarChart3 className="h-3.5 w-3.5" />
              {hi ? 'लाइव डेटा' : 'Live Data'} · {hi ? 'अपडेट हर 60 सेकंड' : 'Updates every 60s'}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gradient-premium">
              {hi ? 'शिकायत विश्लेषण डैशबोर्ड' : 'Complaint Analytics Dashboard'}
            </h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              {hi
                ? 'शिकायतों की पारदर्शी वास्तविक-समय स्थिति — AI वॉइस पाइपलाइन, श्रेणी विभाजन, विभाग एवं वार्ड वितरण'
                : 'Transparent real-time status of all complaints — AI Voice Pipeline, category breakdown, department & ward distribution'}
            </p>
          </div>
        </ScrollReveal>

        {/* ── Summary stat cards ── */}
        <ScrollReveal delay={0.1}>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 mb-6">
            {[
              { label: hi ? 'कुल शिकायतें' : 'Total', value: total, Icon: Inbox, color: COLORS.saffron },
              { label: hi ? 'लंबित' : 'Pending', value: pending, Icon: Hourglass, color: COLORS.amber },
              { label: hi ? 'प्रगति में' : 'In Progress', value: inProgress, Icon: Loader2, color: COLORS.teal },
              { label: hi ? 'समाधान' : 'Resolved', value: resolved, Icon: CheckCircle2, color: COLORS.green },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.05 }}
                className="relative overflow-hidden rounded-xl border border-border/70 bg-card p-4 shadow-sm"
              >
                <div className="absolute inset-x-0 top-0 h-1" style={{ background: s.color }} />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{s.label}</span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: `${s.color}1a`, color: s.color }}>
                    <s.Icon className="h-3.5 w-3.5" />
                  </span>
                </div>
                <div className="mt-1 font-mono text-2xl font-bold tabular-nums" style={{ color: s.color }}>{s.value}</div>
              </motion.div>
            ))}
          </div>
        </ScrollReveal>

        {/* ── 7-day trend + AI Voice Pipeline (from ComplaintLiveStatus) ── */}
        <div className="grid gap-4 md:grid-cols-3 mb-4">
          {/* 7-day trend mini bar chart */}
          <ScrollReveal delay={0.2}>
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
          </ScrollReveal>

          {/* AI Voice pipeline highlight card (from ComplaintLiveStatus) */}
          <ScrollReveal delay={0.25}>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: 0.38 }}
              className="relative overflow-hidden rounded-xl border border-primary/40 bg-gradient-to-br from-primary/15 via-primary/5 to-accent/10 p-5 shadow-sm h-full"
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
          </ScrollReveal>
        </div>

        {/* ── Category breakdown horizontal bars (from ComplaintLiveStatus) ── */}
        <div className="grid gap-4 md:grid-cols-3 mb-4">
          <ScrollReveal delay={0.3}>
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
                {categories.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center">{hi ? 'लोड हो रहा है…' : 'Loading…'}</p>
                )}
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
          </ScrollReveal>

          {/* Resolution rate + CTA */}
          <ScrollReveal delay={0.35}>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: 0.52 }}
              className="flex flex-col justify-between rounded-xl border border-border/70 bg-card p-5 shadow-sm h-full"
            >
              <div>
                <h3 className="mb-2 text-sm font-semibold text-foreground">
                  {hi ? 'समाधान दर' : 'Resolution Rate'}
                </h3>
                <div className="flex items-end gap-2">
                  <span className="font-mono text-4xl font-bold tabular-nums text-green-600">{useCountUp(resolutionRate)}%</span>
                  <span className="mb-1 text-xs text-muted-foreground">({resolved}/{total})</span>
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
          </ScrollReveal>
        </div>

        {/* ── Charts row: Pie (category) + Bar (department) ── */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Category-wise PieChart */}
          <ScrollReveal delay={0.4}>
            <Card className="border-border/70 shadow-sm">
              <CardContent className="p-4 md:p-5">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4">
                  <Activity className="h-4 w-4 text-primary" />
                  {hi ? 'श्रेणीवार विभाजन (पाई)' : 'Category Breakdown (Pie)'}
                </h3>
                {total > 0 ? (
                  <div className="h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={85}
                          paddingAngle={2}
                          dataKey="value"
                          nameKey="name"
                          stroke="none"
                        >
                          {pieData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number, name: string) => [`${value} ${hi ? 'शिकायतें' : 'complaints'}`, name]}
                          contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px' }} iconSize={8} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[240px] flex items-center justify-center text-muted-foreground text-sm">
                    {hi ? 'डेटा लोड हो रहा है…' : 'Loading data…'}
                  </div>
                )}
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* Department-wise BarChart */}
          <ScrollReveal delay={0.45}>
            <Card className="border-border/70 shadow-sm">
              <CardContent className="p-4 md:p-5">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4">
                  <Building2 className="h-4 w-4 text-primary" />
                  {hi ? 'विभागवार प्रदर्शन' : 'Department Performance'}
                </h3>
                {deptBarData.length > 0 ? (
                  <div className="h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={deptBarData} layout="vertical" margin={{ left: 0, right: 20, top: 5, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                        <XAxis type="number" tick={{ fontSize: 10 }} />
                        <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 10 }} interval={0} />
                        <Tooltip
                          formatter={(value: number, name: string) => {
                            if (name === 'count') return [`${value} ${hi ? 'शिकायतें' : 'complaints'}`, hi ? 'शिकायतें' : 'Complaints']
                            if (name === 'sla') return [`${value}h`, hi ? 'SLA घंटे' : 'SLA Hours']
                            return [value, name]
                          }}
                          contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                        />
                        <Bar dataKey="count" fill="#c2410c" radius={[0, 4, 4, 0]} name="count" barSize={16} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[240px] flex items-center justify-center text-muted-foreground text-sm">
                    {hi ? 'डेटा लोड हो रहा है…' : 'Loading data…'}
                  </div>
                )}
                {/* Department summary cards */}
                <div className="mt-3 grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {deptData.map(d => (
                    <div key={d.code} className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/30 p-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <d.Icon className="h-3 w-3" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-medium text-foreground truncate block">
                          {hi ? d.nameHi : d.nameEn}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                          <span>{d.routedCount} {hi ? 'शिकायतें' : 'complaints'}</span>
                          <span>·</span>
                          <span>{d.slaHours}h SLA</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>

        {/* ── Ward-wise distribution + Resolution details ── */}
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {/* Ward-wise BarChart */}
          <ScrollReveal delay={0.5}>
            <Card className="border-border/70 shadow-sm">
              <CardContent className="p-4 md:p-5">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4">
                  <RouteIcon className="h-4 w-4 text-primary" />
                  {hi ? 'वार्डवार शिकायत वितरण' : 'Ward-wise Distribution'}
                </h3>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={wardData} margin={{ left: -10, right: 10, top: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="ward"
                        tick={{ fontSize: 10 }}
                        label={{ value: hi ? 'वार्ड' : 'Ward', position: 'insideBottomRight', offset: -5, fontSize: 10 }}
                      />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip
                        formatter={(value: number, name: string) => {
                          if (name === 'estimated') return [`${value} ${hi ? 'शिकायतें (अनुमानित)' : 'complaints (estimated)'}`, hi ? 'शिकायतें' : 'Complaints']
                          if (name === 'population') return [value, hi ? 'जनसंख्या' : 'Population']
                          return [value, name]
                        }}
                        labelFormatter={(label: number) => {
                          const w = wardData.find(wd => wd.ward === label)
                          return w ? `${hi ? 'वार्ड' : 'Ward'} ${label} — ${hi ? w.nameHi : w.nameEn}` : `${label}`
                        }}
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px' }} iconSize={8} />
                      <Bar dataKey="estimated" fill="#c2410c" radius={[4, 4, 0, 0]} name={hi ? 'शिकायतें (अनुमानित)' : 'Complaints (est.)'} barSize={20} />
                      <Bar dataKey="population" fill="#16a34a" radius={[4, 4, 0, 0]} name={hi ? 'जनसंख्या' : 'Population'} barSize={20} opacity={0.3} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground text-center">
                  {hi
                    ? 'वार्डवार वितरण जनसंख्या अनुपात पर अनुमानित है'
                    : 'Ward distribution is estimated based on population ratio'}
                </p>
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* Resolution rate details + CTA */}
          <ScrollReveal delay={0.55}>
            <Card className="border-border/70 shadow-sm">
              <CardContent className="p-4 md:p-5 flex flex-col justify-between h-full">
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    {hi ? 'समाधान दर एवं विवरण' : 'Resolution Rate & Details'}
                  </h3>
                  <div className="flex items-end gap-2 mt-2">
                    <span className="font-mono text-4xl font-bold tabular-nums text-green-600">{resolutionRate}%</span>
                    <span className="mb-1 text-xs text-muted-foreground">
                      ({resolved}/{total} {hi ? 'समाधान' : 'resolved'})
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-muted">
                    <div className="flex h-full">
                      <div className="h-full bg-green-600" style={{ width: `${Math.round((resolved / (total || 1)) * 100)}%` }} />
                      <div className="h-full bg-teal-500" style={{ width: `${Math.round((inProgress / (total || 1)) * 100)}%` }} />
                      <div className="h-full bg-amber-500" style={{ width: `${Math.round((pending / (total || 1)) * 100)}%` }} />
                    </div>
                  </div>
                  {/* Legend */}
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="outline" className="gap-1 text-[10px]">
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                      {resolved} {hi ? 'समाधान' : 'Resolved'}
                    </Badge>
                    <Badge variant="outline" className="gap-1 text-[10px]">
                      <Loader2 className="h-3 w-3 text-teal-500" />
                      {inProgress} {hi ? 'प्रगति' : 'In Progress'}
                    </Badge>
                    <Badge variant="outline" className="gap-1 text-[10px]">
                      <Hourglass className="h-3 w-3 text-amber-500" />
                      {pending} {hi ? 'लंबित' : 'Pending'}
                    </Badge>
                  </div>

                  {/* Department quick stats */}
                  <div className="mt-4 rounded-lg border border-border/50 bg-muted/30 p-3">
                    <h4 className="text-xs font-semibold text-foreground mb-2">
                      {hi ? 'विभाग विवरण' : 'Department Details'}
                    </h4>
                    <div className="text-[11px] text-muted-foreground space-y-1">
                      <div className="flex justify-between">
                        <span>{hi ? 'कुल विभाग' : 'Total Departments'}</span>
                        <span className="font-semibold text-foreground">{departments.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{hi ? 'कुल रूटिंग नियम' : 'Total Routing Rules'}</span>
                        <span className="font-semibold text-foreground">{departments.reduce((s, d) => s + d.routingRules.length, 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{hi ? 'AI वॉइस दर्ज' : 'AI Voice Filed'}</span>
                        <span className="font-semibold text-foreground">{stats?.vapiFiledCount ?? 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTA buttons */}
                <div className="mt-4 flex flex-col gap-2">
                  <Button
                    onClick={() => setView('complaints')}
                    className="gap-1.5 bg-primary hover:bg-primary/90"
                    size="sm"
                  >
                    <PenSquare className="h-3.5 w-3.5" />
                    {hi ? 'शिकायत दर्ज करें' : 'File Complaint'}
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                  <Button
                    onClick={() => setView('complaints')}
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                  >
                    <Activity className="h-3.5 w-3.5" />
                    {hi ? 'शिकायत ट्रैक करें' : 'Track Complaint'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>

        {/* ── Bottom attribution ── */}
        <ScrollReveal delay={0.65}>
          <p className="mt-6 text-center text-[11px] text-muted-foreground">
            {hi ? 'स्रोत: लाइव डेटाबेस + Vapi विभाग डेटा' : 'Source: Live database + Vapi department data'}
            <span className="mx-1.5">·</span>
            {hi ? 'वार्ड वितरण जनसंख्या अनुपात पर अनुमानित' : 'Ward distribution estimated by population ratio'}
            {lastUpdated && (
              <>
                <span className="mx-1.5">·</span>
                {hi ? 'अंतिम अपडेट: ' : 'Last updated: '}
                {lastUpdated.toLocaleTimeString(hi ? 'hi-IN' : 'en-IN')}
              </>
            )}
          </p>
        </ScrollReveal>
      </div>
    </section>
  )
}
