'use client'
// Admin Dashboard tab — overview stats with sparklines, scheme coverage progress
// bars, real-time system status panel, quick actions grid, and a recent
// complaints table with category icons. Bilingual HI/EN throughout.
// Round 9-c enhancement.
import { useEffect, useMemo, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Activity,
  AlertCircle,
  Bell,
  CheckCircle2,
  Clock,
  Cross,
  Database,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Hammer,
  HardDrive,
  HelpCircle,
  Home,
  Image as ImageIcon,
  Loader2,
  MessageSquareWarning,
  PiggyBank,
  Server,
  Star,
  Target,
  TrendingUp,
  Truck,
  Upload,
  UserCog,
  Vote,
  Wifi,
  WifiOff,
  Droplets,
} from 'lucide-react'
import { categoryLabel, formatDateTime, statusBadgeClass, statusLabel } from './lib'

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────
type TabKey = 'dashboard' | 'profile' | 'images' | 'complaints' | 'feedback' | 'polls' | 'announcements' | 'csv' | 'activity'

interface TrendPoint {
  date: string
  count: number
}

interface PerformanceYear {
  year: number
  complaintsResolved: number
  complaintsTotal: number
  schemesCovered: number
  budgetUtilizedPct: number
  feedbackCount: number
  avgRating: number
}

interface Goal {
  id: string
  descriptionHi: string
  descriptionEn: string
  current: number
  target: number
  unit: string
}

interface Stats {
  complaints: { total: number; pending: number; inProgress: number; resolved: number; rejected: number }
  images: number
  scrapedRecords: number
  feedback: number
  complaintsTrend: TrendPoint[]
  resolvedTrend: TrendPoint[]
  feedbackTrend: TrendPoint[]
  imageCount: number
  dbSizeBytes: number
  performanceData: PerformanceYear[]
  goals: Goal[]
}

interface Complaint {
  id: string
  trackingId: string
  callerName: string
  category: string
  status: string
  createdAt: string
}

// ────────────────────────────────────────────────────────────────────────────
// Constants — palette (warm Indian; spec allows sky/rose for two schemes)
// ────────────────────────────────────────────────────────────────────────────
const COLOR = {
  saffron: '#f59e0b',
  amber: '#d97706',
  green: '#16a34a',
  emerald: '#10b981',
  purple: '#a855f7',
  teal: '#14b8a6',
  sky: '#0ea5e9',
  rose: '#f43f5e',
}

// Scheme coverage data — hardcoded per Round 9-c spec
const SCHEMES: { id: string; nameHi: string; nameEn: string; current: number; target: number; color: string }[] = [
  { id: 'mgnrega', nameHi: 'मनरेगा', nameEn: 'MGNREGA', current: 84, target: 100, color: COLOR.saffron },
  { id: 'pmayg', nameHi: 'पीएमआवास-ग्रामीण', nameEn: 'PMAY-G', current: 38, target: 50, color: COLOR.emerald },
  { id: 'jjm', nameHi: 'जल जीवन मिशन', nameEn: 'Jal Jeevan Mission', current: 215, target: 215, color: COLOR.sky },
  { id: 'ayushman', nameHi: 'आयुष्मान भारत', nameEn: 'Ayushman Bharat', current: 215, target: 215, color: COLOR.rose },
  { id: 'pmkisan', nameHi: 'पीएम-किसान', nameEn: 'PM-Kisan', current: 67, target: 85, color: COLOR.amber },
  { id: 'sbm', nameHi: 'SBM शौचालय', nameEn: 'SBM Toilets', current: 215, target: 215, color: COLOR.green },
]

// Quick Actions — tab navigation shortcuts
const QUICK_ACTIONS: { tab: TabKey; hi: string; en: string; icon: React.ElementType; tint: string }[] = [
  { tab: 'announcements', hi: 'नई घोषणा', en: 'New Announcement', icon: Bell, tint: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200' },
  { tab: 'images', hi: 'छवि अपलोड', en: 'Upload Image', icon: Upload, tint: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-200' },
  { tab: 'csv', hi: 'CSV अपलोड', en: 'Upload CSV', icon: FileSpreadsheet, tint: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-200' },
  { tab: 'complaints', hi: 'शिकायतें देखें', en: 'View Complaints', icon: MessageSquareWarning, tint: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-200' },
  { tab: 'polls', hi: 'सर्वेक्षण बनाएँ', en: 'Create Poll', icon: Vote, tint: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-200' },
  { tab: 'profile', hi: 'प्रोफ़ाइल संपादित करें', en: 'Edit Profile', icon: UserCog, tint: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200' },
]

// Category → icon mapping for the recent complaints table
function categoryIcon(category: string): React.ElementType {
  switch (category) {
    case 'water': return Droplets
    case 'road': return Truck
    case 'school': return GraduationCap
    case 'housing': return Home
    case 'pension': return PiggyBank
    case 'mgnrega': return Hammer
    default: return HelpCircle
  }
}

function categoryIconColor(category: string): string {
  switch (category) {
    case 'water': return 'text-sky-500'
    case 'road': return 'text-amber-600'
    case 'school': return 'text-purple-500'
    case 'housing': return 'text-emerald-500'
    case 'pension': return 'text-rose-500'
    case 'mgnrega': return 'text-orange-500'
    default: return 'text-muted-foreground'
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Panchayat Performance — color palette and module-level subcomponents
// ────────────────────────────────────────────────────────────────────────────
const PERF_COLORS = {
  resolved: '#16a34a',
  pending: '#d97706',
  saffronLine: '#c2410c',
  targetLine: '#16a34a',
}

// Goal progress color: green if met, amber if 50-99%, red if <50%
function goalProgressColor(pct: number, met: boolean): string {
  if (met) return '#16a34a'
  if (pct >= 50) return '#d97706'
  return '#ef4444'
}

// Custom tooltip for Year-over-Year Complaints BarChart
function YearChartTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { value: number; dataKey: string; name: string }[]
  label?: string
}) {
  if (!active || !payload || payload.length === 0) return null
  const resolved = payload.find(p => p.dataKey === 'complaintsResolved')?.value ?? 0
  const total = payload.find(p => p.dataKey === 'complaintsPending')?.value != null
    ? resolved + (payload.find(p => p.dataKey === 'complaintsPending')?.value ?? 0)
    : 0
  // For stacked bars: pending = total - resolved
  const pendingVal = payload.find(p => p.dataKey === 'complaintsPending')?.value ?? 0
  const actualTotal = resolved + pendingVal
  const rate = actualTotal > 0 ? Math.round((resolved / actualTotal) * 100) : 0
  return (
    <div className="rounded-lg border bg-card/90 p-3 shadow-lg text-xs space-y-1.5 backdrop-blur-sm">
      <div className="font-semibold text-foreground">{label}</div>
      <div className="flex items-center gap-1.5">
        <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: PERF_COLORS.resolved }} />
        <span className="text-muted-foreground">Resolved: <span className="font-medium text-foreground">{resolved}</span></span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: PERF_COLORS.pending }} />
        <span className="text-muted-foreground">Pending: <span className="font-medium text-foreground">{pendingVal}</span></span>
      </div>
      <div className="text-muted-foreground">
        Total: <span className="font-medium text-foreground">{actualTotal}</span> · Rate: <span className="font-bold" style={{ color: rate >= 90 ? PERF_COLORS.resolved : PERF_COLORS.pending }}>{rate}%</span>
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Sparkline subcomponent — tiny line/bar chart, no axes, no grid
// ────────────────────────────────────────────────────────────────────────────
function Sparkline({ data, color, type = 'line' }: { data: TrendPoint[]; color: string; type?: 'line' | 'bar' }) {
  const margin = { top: 2, right: 0, bottom: 2, left: 0 }
  if (type === 'bar') {
    return (
      <div className="mt-2 h-[30px] w-full">
        <ResponsiveContainer width="100%" height={30}>
          <BarChart data={data} margin={margin}>
            <Bar dataKey="count" fill={color} isAnimationActive={false} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }
  return (
    <div className="mt-2 h-[30px] w-full">
      <ResponsiveContainer width="100%" height={30}>
        <LineChart data={data} margin={margin}>
          <Line
            type="monotone"
            dataKey="count"
            stroke={color}
            strokeWidth={1.75}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Status-dot indicator — green/amber/red with pulse animation
// ────────────────────────────────────────────────────────────────────────────
function StatusDot({ tone }: { tone: 'ok' | 'warn' | 'bad' }) {
  if (tone === 'bad') return <span className="status-dot red" aria-hidden />
  if (tone === 'warn') return <span className="status-dot amber" aria-hidden />
  return <span className="status-dot pulse-glow" aria-hidden />
}

// ────────────────────────────────────────────────────────────────────────────
// Helper: format bytes as KB/MB
// ────────────────────────────────────────────────────────────────────────────
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

// ────────────────────────────────────────────────────────────────────────────
// Main component
// ────────────────────────────────────────────────────────────────────────────
export function Dashboard({ onNavigate }: { onNavigate?: (tab: TabKey) => void }) {
  const { locale } = useI18n()
  const [stats, setStats] = useState<Stats | null>(null)
  const [recent, setRecent] = useState<Complaint[] | null>(null)
  const [feedbackStats, setFeedbackStats] = useState<{ total: number; average: number; distribution: { rating: number; count: number }[] } | null>(null)
  const [complaintTrend, setComplaintTrend] = useState<{ month: string; monthHi: string; total: number; resolved: number; pending: number; resolutionRate: number }[] | null>(null)
  const [wardAnalytics, setWardAnalytics] = useState<{ wards: { ward: number; name: string; population: number; households: number; marketplaceItems: number; activityPer100: number }[]; summary: { totalWards: number; totalPopulation: number; totalHouseholds: number; totalMarketplaceItems: number; avgItemsPerWard: number } } | null>(null)
  const [loading, setLoading] = useState(true)

  // System status checks
  const [vapiStatus, setVapiStatus] = useState<'checking' | 'online' | 'offline'>('checking')
  const [swStatus, setSwStatus] = useState<'checking' | 'active' | 'inactive'>('checking')

  useEffect(() => {
    let alive = true
    Promise.all([
      fetch('/api/stats').then(r => r.json()),
      fetch('/api/complaints/list').then(r => r.json()),
      fetch('/api/feedback/stats').then(r => r.ok ? r.json() : null).catch(() => null),
      fetch('/api/complaints/stats').then(r => r.ok ? r.json() : null).catch(() => null),
      fetch('/api/analytics/wards').then(r => r.ok ? r.json() : null).catch(() => null),
    ])
      .then(([s, c, f, ct, wa]) => {
        if (!alive) return
        setStats(s)
        setRecent((c.complaints || []).slice(0, 5))
        if (f) setFeedbackStats(f)
        if (ct?.trend) setComplaintTrend(ct.trend)
        if (wa?.wards) setWardAnalytics(wa)
      })
      .catch(() => {
        if (!alive) return
        setStats(null)
        setRecent([])
      })
      .finally(() => alive && setLoading(false))
    return () => { alive = false }
  }, [])

  // Vapi webhook health check (2-second timeout via AbortController)
  useEffect(() => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 2000)
    fetch('/health?XTransformPort=3003', { signal: controller.signal, cache: 'no-store' })
      .then(r => setVapiStatus(r.ok ? 'online' : 'offline'))
      .catch(() => setVapiStatus('offline'))
      .finally(() => clearTimeout(timeout))
    return () => { clearTimeout(timeout); controller.abort() }
  }, [])

  // Service Worker check (client-side only) — one-time post-hydration probe.
  // Wrapped in a microtask so setState is not called synchronously in the
  // effect body (avoids cascading-render lint warning).
  useEffect(() => {
    void Promise.resolve().then(() => {
      if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
        setSwStatus(navigator.serviceWorker.controller ? 'active' : 'inactive')
      } else {
        setSwStatus('inactive')
      }
    })
  }, [])

  // Pending trend — flat line at current count (no historical pending data)
  const pendingTrend = useMemo<TrendPoint[]>(() => {
    if (!stats) return []
    const today = new Date()
    const out: TrendPoint[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      out.push({ date: `${y}-${m}-${day}`, count: stats.complaints.pending })
    }
    return out
  }, [stats])

  // Computed chart data for performance bar chart
  const complaintsByYear = useMemo(() =>
    (stats?.performanceData ?? []).map(d => ({
      year: d.year,
      complaintsResolved: d.complaintsResolved,
      complaintsPending: d.complaintsTotal - d.complaintsResolved,
    })), [stats?.performanceData])

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 skeleton-card rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-72 skeleton-card rounded-xl" />
          <div className="h-72 skeleton-card rounded-xl" />
        </div>
        <div className="h-40 skeleton-card rounded-xl" />
        <div className="h-64 skeleton-card rounded-xl" />
      </div>
    )
  }

  // ── Error state ──────────────────────────────────────────────────────────
  if (!stats) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {locale === 'hi' ? 'आँकड़े लोड करने में त्रुटि।' : 'Failed to load stats.'}
        </CardContent>
      </Card>
    )
  }

  // ── Stat cards configuration ─────────────────────────────────────────────
  const cards = [
    {
      key: 'total',
      label: locale === 'hi' ? 'कुल शिकायतें' : 'Total Complaints',
      value: stats.complaints.total,
      icon: MessageSquareWarning,
      tint: 'bg-primary/10',
      accent: COLOR.saffron,
      sparkline: <Sparkline data={stats.complaintsTrend} color={COLOR.saffron} type="line" />,
    },
    {
      key: 'pending',
      label: locale === 'hi' ? 'लंबित' : 'Pending',
      value: stats.complaints.pending,
      icon: Clock,
      tint: 'bg-amber-100 dark:bg-amber-900/30',
      accent: COLOR.amber,
      sparkline: <Sparkline data={pendingTrend} color={COLOR.amber} type="line" />,
    },
    {
      key: 'resolved',
      label: locale === 'hi' ? 'हल' : 'Resolved',
      value: stats.complaints.resolved,
      icon: CheckCircle2,
      tint: 'bg-green-100 dark:bg-green-900/30',
      accent: COLOR.green,
      sparkline: <Sparkline data={stats.resolvedTrend} color={COLOR.green} type="bar" />,
    },
    {
      key: 'images',
      label: locale === 'hi' ? 'गैलरी छवियाँ' : 'Gallery Images',
      value: stats.images,
      icon: ImageIcon,
      tint: 'bg-purple-100 dark:bg-purple-900/30',
      accent: COLOR.purple,
      sparkline: null, // static — no time series
    },
    {
      key: 'scraped',
      label: locale === 'hi' ? 'स्क्रैप्ड रिकॉर्ड' : 'Scraped Records',
      value: stats.scrapedRecords,
      icon: FileText,
      tint: 'bg-teal-100 dark:bg-teal-900/30',
      accent: COLOR.teal,
      sparkline: null, // static — no time series
    },
    {
      key: 'feedback',
      label: locale === 'hi' ? 'नागरिक प्रतिक्रिया' : 'Citizen Feedback',
      value: stats.feedback,
      icon: Star,
      tint: 'bg-rose-100 dark:bg-rose-900/30',
      accent: COLOR.rose,
      sparkline: <Sparkline data={stats.feedbackTrend} color={COLOR.rose} type="line" />,
    },
  ] as const

  // ── System status rows ───────────────────────────────────────────────────
  const dbModelCount = 13 // count of Prisma models in schema.prisma
  const dbMetric = `${dbModelCount} ${locale === 'hi' ? 'मॉडल' : 'models'} / ${formatBytes(stats.dbSizeBytes)}`
  const imageMetric = `${stats.imageCount} ${locale === 'hi' ? 'छवियाँ' : 'images'}`
  const vapiMetric = vapiStatus === 'checking'
    ? (locale === 'hi' ? 'जाँच रहा है…' : 'checking…')
    : vapiStatus === 'online'
      ? (locale === 'hi' ? 'पोर्ट 3003 • लाइव' : 'port 3003 • live')
      : (locale === 'hi' ? 'पोर्ट 3003 • पहुँच नहीं' : 'port 3003 • unreachable')
  const swMetric = swStatus === 'checking'
    ? (locale === 'hi' ? 'जाँच रहा है…' : 'checking…')
    : swStatus === 'active'
      ? (locale === 'hi' ? 'रजिस्टर्ड • सक्रिय' : 'registered • active')
      : (locale === 'hi' ? 'रजिस्टर्ड नहीं' : 'not registered')

  const systemRows = [
    {
      key: 'db',
      name: locale === 'hi' ? 'डेटाबेस (SQLite)' : 'Database (SQLite)',
      icon: Database,
      tone: 'ok' as const,
      statusLabel: locale === 'hi' ? 'ऑनलाइन' : 'Online',
      metric: dbMetric,
    },
    {
      key: 'vapi',
      name: locale === 'hi' ? 'Vapi वेबहूक' : 'Vapi Webhook',
      icon: vapiStatus === 'online' ? Wifi : vapiStatus === 'offline' ? WifiOff : Loader2,
      tone: vapiStatus === 'online' ? 'ok' as const : vapiStatus === 'offline' ? 'bad' as const : 'warn' as const,
      statusLabel: vapiStatus === 'online'
        ? (locale === 'hi' ? 'ऑनलाइन' : 'Online')
        : vapiStatus === 'offline'
          ? (locale === 'hi' ? 'ऑफ़लाइन' : 'Offline')
          : (locale === 'hi' ? 'जाँच रहा है' : 'Checking'),
      metric: vapiMetric,
      iconSpin: vapiStatus === 'checking',
    },
    {
      key: 'images',
      name: locale === 'hi' ? 'छवि भंडारण' : 'Image Storage',
      icon: HardDrive,
      tone: 'ok' as const,
      statusLabel: locale === 'hi' ? 'ऑनलाइन' : 'Online',
      metric: imageMetric,
    },
    {
      key: 'sw',
      name: locale === 'hi' ? 'सर्विस वर्कर (PWA)' : 'Service Worker (PWA)',
      icon: Server,
      tone: swStatus === 'active' ? 'ok' as const : swStatus === 'inactive' ? 'warn' as const : 'warn' as const,
      statusLabel: swStatus === 'active'
        ? (locale === 'hi' ? 'सक्रिय' : 'Active')
        : swStatus === 'inactive'
          ? (locale === 'hi' ? 'नहीं' : 'Inactive')
          : (locale === 'hi' ? 'जाँच रहा है' : 'Checking'),
      metric: swMetric,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold section-heading">
          {locale === 'hi' ? 'पैनल अवलोकन' : 'Panel Overview'}
        </h2>
        <p className="text-xs text-muted-foreground mt-2">
          {locale === 'hi'
            ? 'वास्तविक समय की स्थिति — सभी डेटा स्रोतों से।'
            : 'Real-time status across all data sources.'}
        </p>
      </div>

      {/* ── Stat Cards with Sparklines ────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map(c => {
          const Icon = c.icon
          return (
            <Card key={c.key} className="overflow-hidden card-hover-lift stat-card-shimmer">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-medium text-muted-foreground">{c.label}</CardTitle>
                  <div className={`h-8 w-8 rounded-lg grid place-items-center ${c.tint}`}>
                    <Icon className="h-4 w-4" style={{ color: c.accent }} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-bold tabular-nums text-foreground">{c.value}</div>
                {c.sparkline ?? (
                  <div className="mt-2 h-[30px] flex items-center text-[10px] text-muted-foreground gap-1">
                    <Activity className="h-3 w-3" />
                    <span>{locale === 'hi' ? 'सभी समय' : 'all-time'}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* ── Scheme Coverage + System Status (2-col on lg) ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Scheme Coverage Progress */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              {locale === 'hi' ? 'योजना कवरेज प्रगति' : 'Scheme Coverage Progress'}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {locale === 'hi'
                ? 'प्रमुख कल्याणकारी योजनाओं के लक्ष्य बनाम वर्तमान कवरेज।'
                : 'Major welfare schemes — target vs current coverage.'}
            </p>
          </CardHeader>
          <CardContent className="space-y-3.5">
            {SCHEMES.map(s => {
              const pct = s.target === 0 ? 0 : Math.round((s.current / s.target) * 100)
              const complete = s.current >= s.target
              return (
                <div key={s.id} className="space-y-1">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-medium truncate">
                        {locale === 'hi' ? s.nameHi : s.nameEn}
                      </span>
                      {complete && (
                        <Badge variant="outline" className="text-[9px] py-0 px-1.5 border-green-300 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-200 dark:border-green-700">
                          <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                          {locale === 'hi' ? 'पूर्ण' : 'done'}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 tabular-nums flex-shrink-0">
                      <span className="font-semibold text-foreground">{s.current}</span>
                      <span className="text-muted-foreground">/ {s.target}</span>
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: `${s.color}22`, color: s.color }}
                      >
                        {pct}%
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={pct}
                    className="h-2.5 scheme-progress"
                    style={{ '--scheme-color': s.color } as React.CSSProperties}
                  />
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* System Status Panel */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Server className="h-4 w-4 text-primary" />
              {locale === 'hi' ? 'सिस्टम स्थिति' : 'System Status'}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {locale === 'hi'
                ? 'वास्तविक समय में डेटा स्रोतों का स्वास्थ्य।'
                : 'Real-time health of data sources.'}
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {systemRows.map(row => {
                const Icon = row.icon
                return (
                  <div
                    key={row.key}
                    className="rounded-lg border bg-card/60 p-3 flex items-start gap-2.5 card-hover-lift"
                  >
                    <div className="h-8 w-8 rounded-md bg-secondary/70 grid place-items-center flex-shrink-0">
                      <Icon className={`h-4 w-4 text-primary ${row.iconSpin ? 'animate-spin' : ''}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium truncate">{row.name}</span>
                        <StatusDot tone={row.tone} />
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="outline"
                          className={`text-[9px] py-0 px-1.5 ${
                            row.tone === 'ok'
                              ? 'border-green-300 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-200 dark:border-green-700'
                              : row.tone === 'bad'
                                ? 'border-red-300 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-200 dark:border-red-700'
                                : 'border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-700'
                          }`}
                        >
                          {row.statusLabel}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1 truncate">{row.metric}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Quick Actions ─────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            {locale === 'hi' ? 'त्वरित क्रियाएँ' : 'Quick Actions'}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {locale === 'hi'
              ? 'एक क्लिक में सामान्य व्यवस्थापक कार्यों पर जाएँ।'
              : 'Jump to common admin tasks in one click.'}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {QUICK_ACTIONS.map(a => {
              const Icon = a.icon
              const disabled = !onNavigate
              return (
                <Button
                  key={a.tab}
                  variant="outline"
                  className="h-auto py-3 flex flex-col items-center gap-1.5 card-hover-lift"
                  onClick={() => onNavigate?.(a.tab)}
                  disabled={disabled}
                >
                  <div className={`h-9 w-9 rounded-lg grid place-items-center ${a.tint}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-[11px] font-medium leading-tight text-center">
                    {locale === 'hi' ? a.hi : a.en}
                  </span>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── Complaint Trend (6 months) ─────────────────────────────────────── */}
      {complaintTrend && complaintTrend.some(m => m.total > 0) && (
        <Card className="border-bottom-glow">
          <CardHeader className="pb-3">
            <CardTitle className="text-base section-heading flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              {locale === 'hi' ? 'शिकायत प्रवृत्ति (6 माह)' : 'Complaint Trend (6 months)'}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {locale === 'hi' ? 'मासिक शिकायतें एवं समाधान दर।' : 'Monthly complaints and resolution rate.'}
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={complaintTrend.map(m => ({ name: locale === 'hi' ? m.monthHi : m.month, ...m }))}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <Tooltip
                  contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: number, name: string) => {
                    if (name === 'total') return [val, locale === 'hi' ? 'कुल' : 'Total']
                    if (name === 'resolved') return [val, locale === 'hi' ? 'हल' : 'Resolved']
                    if (name === 'resolutionRate') return [`${val}%`, locale === 'hi' ? 'समाधान दर' : 'Resolution Rate']
                    return [val, name]
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} formatter={(v) => v === 'total' ? (locale === 'hi' ? 'कुल' : 'Total') : v === 'resolved' ? (locale === 'hi' ? 'हल' : 'Resolved') : v === 'resolutionRate' ? (locale === 'hi' ? 'समाधान दर %' : 'Resolution %') : v} />
                <Line type="monotone" dataKey="total" stroke="oklch(0.62 0.18 55)" strokeWidth={2.5} dot={{ r: 4, fill: 'oklch(0.62 0.18 55)' }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="resolved" stroke="oklch(0.60 0.14 145)" strokeWidth={2.5} dot={{ r: 4, fill: 'oklch(0.60 0.14 145)' }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="resolutionRate" stroke="oklch(0.55 0.16 35)" strokeWidth={2} strokeDasharray="5 5" dot={false} yAxisId={0} />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-between mt-3 grid grid-cols-3 gap-2 text-center">
              {(() => {
                const total6 = complaintTrend.reduce((a, m) => a + m.total, 0)
                const resolved6 = complaintTrend.reduce((a, m) => a + m.resolved, 0)
                const avgRate = total6 > 0 ? Math.round((resolved6 / total6) * 100) : 0
                return (
                  <>
                    <div className="p-2 rounded-lg bg-secondary/40">
                      <div className="text-lg font-bold text-primary">{total6}</div>
                      <div className="text-[9px] text-muted-foreground">{locale === 'hi' ? '6 माह कुल' : '6mo Total'}</div>
                    </div>
                    <div className="p-2 rounded-lg bg-green-600/5">
                      <div className="text-lg font-bold text-green-700 dark:text-green-400">{resolved6}</div>
                      <div className="text-[9px] text-muted-foreground">{locale === 'hi' ? 'हल' : 'Resolved'}</div>
                    </div>
                    <div className="p-2 rounded-lg bg-amber-500/5">
                      <div className="text-lg font-bold text-amber-600">{avgRate}%</div>
                      <div className="text-[9px] text-muted-foreground">{locale === 'hi' ? 'औसत दर' : 'Avg Rate'}</div>
                    </div>
                  </>
                )
              })()}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Multi-Ward Comparative Analytics ───────────────────────────────── */}
      {wardAnalytics && wardAnalytics.summary.totalMarketplaceItems > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Home className="h-4 w-4 text-primary" />
              {locale === 'hi' ? 'वार्ड तुलनात्मक विश्लेषण' : 'Ward Comparative Analytics'}
              <Badge variant="outline" className="text-[9px] ml-auto gap-1">
                {locale === 'hi' ? `${wardAnalytics.summary.totalWards} वार्ड` : `${wardAnalytics.summary.totalWards} wards`}
              </Badge>
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {locale === 'hi' ? 'जनसंख्या एवं बाजार गतिविधि के अनुसार वार्ड तुलना।' : 'Ward comparison by population and marketplace activity.'}
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={wardAnalytics.wards.map(({ name: _, ...rest }) => ({ name: `W${rest.ward}`, nameFull: _, ...rest }))} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} className="text-muted-foreground" width={35} />
                <Tooltip
                  contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: number, name: string) => {
                    if (name === 'population') return [val, locale === 'hi' ? 'जनसंख्या' : 'Population']
                    if (name === 'marketplaceItems') return [val, locale === 'hi' ? 'बाजार वस्तुएँ' : 'Market Items']
                    return [val, name]
                  }}
                  labelFormatter={(label, payload) => {
                    const item = payload?.[0]?.payload
                    return item ? `Ward ${item.ward}: ${item.nameFull}` : label
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} formatter={(v) => v === 'population' ? (locale === 'hi' ? 'जनसंख्या' : 'Population') : v === 'marketplaceItems' ? (locale === 'hi' ? 'बाजार' : 'Market') : v} />
                <Bar dataKey="population" fill="oklch(0.62 0.18 55)" radius={[0, 4, 4, 0]} />
                <Bar dataKey="marketplaceItems" fill="oklch(0.60 0.14 145)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-4 gap-2 mt-3 text-center">
              <div className="p-2 rounded-lg bg-secondary/40">
                <div className="text-sm font-bold text-primary">{wardAnalytics.summary.totalPopulation}</div>
                <div className="text-[9px] text-muted-foreground">{locale === 'hi' ? 'कुल जनसंख्या' : 'Total Pop.'}</div>
              </div>
              <div className="p-2 rounded-lg bg-secondary/40">
                <div className="text-sm font-bold text-primary">{wardAnalytics.summary.totalHouseholds}</div>
                <div className="text-[9px] text-muted-foreground">{locale === 'hi' ? 'घर' : 'Households'}</div>
              </div>
              <div className="p-2 rounded-lg bg-green-600/5">
                <div className="text-sm font-bold text-green-700 dark:text-green-400">{wardAnalytics.summary.totalMarketplaceItems}</div>
                <div className="text-[9px] text-muted-foreground">{locale === 'hi' ? 'बाजार वस्तुएँ' : 'Market Items'}</div>
              </div>
              <div className="p-2 rounded-lg bg-amber-500/5">
                <div className="text-sm font-bold text-amber-600">{wardAnalytics.summary.avgItemsPerWard}</div>
                <div className="text-[9px] text-muted-foreground">{locale === 'hi' ? 'औसत/वार्ड' : 'Avg/Ward'}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Panchayat Performance Comparison ───────────────────────────────── */}
      {stats.performanceData && stats.performanceData.length > 0 && (
        <Card className="border-bottom-glow">
          <CardHeader className="pb-3">
            <CardTitle className="text-base section-heading flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              {locale === 'hi' ? 'पंचायत प्रदर्शन' : 'Panchayat Performance'}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {locale === 'hi'
                ? 'वर्ष-दर-वर्ष शिकायत तुलना, बजट प्रगति, और लक्ष्य ट्रैकिंग।'
                : 'Year-over-year complaint comparison, budget progress, and goal tracking.'}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* ── Year-over-Year Complaints Chart ─────────────────────────── */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                {locale === 'hi' ? 'शिकायत वर्ष-दर-वर्ष तुलना' : 'Complaints Year-over-Year'}
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height={256}>
                  <BarChart
                    data={complaintsByYear}
                    margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="year" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                    <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                    <Tooltip content={<YearChartTooltip />} />
                    <Legend
                      formatter={(value: string) =>
                        value === 'complaintsResolved'
                          ? (locale === 'hi' ? 'हल' : 'Resolved')
                          : (locale === 'hi' ? 'लंबित' : 'Pending')
                      }
                    />
                    <Bar dataKey="complaintsResolved" stackId="a" fill={PERF_COLORS.resolved} radius={[0, 0, 0, 0]}>
                      {stats.performanceData.map((_, idx) => (
                        <Cell key={idx} fill={PERF_COLORS.resolved} />
                      ))}
                    </Bar>
                    <Bar dataKey="complaintsPending" stackId="a" fill={PERF_COLORS.pending} radius={[4, 4, 0, 0]}>
                      {stats.performanceData.map((_, idx) => (
                        <Cell key={idx} fill={PERF_COLORS.pending} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ── Budget Utilization Trend ─────────────────────────────────── */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                {locale === 'hi' ? 'बजट उपयोग प्रवृत्ति' : 'Budget Utilization Trend'}
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height={256}>
                  <LineChart
                    data={stats.performanceData}
                    margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="year" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                    <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" domain={[0, 100]} />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        `${value}%`,
                        name === 'budgetUtilizedPct'
                          ? (locale === 'hi' ? 'बजट उपयोग' : 'Budget Utilized')
                          : (locale === 'hi' ? 'लक्ष्य (85%)' : 'Target (85%)'),
                      ]}
                      labelFormatter={(label: number) => `${label}`}
                    />
                    <Legend
                      formatter={(value: string) =>
                        value === 'budgetUtilizedPct'
                          ? (locale === 'hi' ? 'बजट उपयोग' : 'Budget Utilized')
                          : (locale === 'hi' ? 'लक्ष्य (85%)' : 'Target (85%)')
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="budgetUtilizedPct"
                      stroke={PERF_COLORS.saffronLine}
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: PERF_COLORS.saffronLine }}
                      activeDot={{ r: 6 }}
                    />
                    {/* Target line at 85% — reference line rendered as a separate data series */}
                    <Line
                      type="monotone"
                      dataKey={() => 85}
                      stroke={PERF_COLORS.targetLine}
                      strokeWidth={2}
                      strokeDasharray="6 4"
                      dot={false}
                      name="target85"
                      legendType="plainline"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ── Goals Tracker ────────────────────────────────────────────── */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                {locale === 'hi' ? 'लक्ष्य ट्रैकर' : 'Goals Tracker'}
              </h3>
              <div className="space-y-4">
                {stats.goals.map(goal => {
                  const pct = goal.unit === 'stars'
                    ? goal.target > 0 ? Math.round((goal.current / goal.target) * 100) : 0
                    : goal.target > 0 ? Math.round((goal.current / goal.target) * 100) : 0
                  const met = goal.unit === 'stars' ? goal.current >= goal.target : goal.current >= goal.target
                  const color = goalProgressColor(pct, met)
                  return (
                    <div key={goal.id} className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {met ? (
                            <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" style={{ color: '#16a34a' }} />
                          ) : (
                            <Cross className="h-3.5 w-3.5 flex-shrink-0" style={{ color: pct < 50 ? '#ef4444' : '#d97706' }} />
                          )}
                          <span className="font-medium truncate">
                            {locale === 'hi' ? goal.descriptionHi : goal.descriptionEn}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 tabular-nums flex-shrink-0">
                          <span className="font-semibold text-foreground">
                            {goal.unit === 'stars' ? goal.current.toFixed(1) : goal.current}
                          </span>
                          <span className="text-muted-foreground">/ {goal.unit === 'stars' ? goal.target.toFixed(1) : goal.target}</span>
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: `${color}22`, color }}
                          >
                            {pct}%
                          </span>
                        </div>
                      </div>
                      <Progress
                        value={Math.min(pct, 100)}
                        className="h-2.5 scheme-progress"
                        style={{ '--scheme-color': color } as React.CSSProperties}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Citizen Feedback Rating Distribution ──────────────────────────── */}
      {feedbackStats && feedbackStats.total > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="h-4 w-4 text-primary" />
              {locale === 'hi' ? 'नागरिक प्रतिक्रिया रेटिंग' : 'Citizen Feedback Ratings'}
              <Badge variant="outline" className="text-[9px] ml-auto gap-1">
                <Star className="h-2.5 w-2.5" />
                {feedbackStats.average.toFixed(1)} / 5
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={feedbackStats.distribution.map(d => ({ name: `${d.rating}★`, rating: d.rating, count: d.count }))}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <Tooltip
                  contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: number) => [`${val} ${locale === 'hi' ? 'प्रतिक्रियाएँ' : 'feedback'}`, locale === 'hi' ? 'गणना' : 'Count']}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {feedbackStats.distribution.map((d) => {
                    // Color gradient: red (1★) → green (5★)
                    const colors = ['oklch(0.58 0.22 27)', 'oklch(0.65 0.18 45)', 'oklch(0.72 0.15 65)', 'oklch(0.68 0.14 130)', 'oklch(0.60 0.14 145)']
                    return <Cell key={d.rating} fill={colors[d.rating - 1]} />
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
              <span>{locale === 'hi' ? `कुल ${feedbackStats.total} प्रतिक्रियाएँ` : `${feedbackStats.total} total feedback`}</span>
              <span>{locale === 'hi' ? `औसत: ${feedbackStats.average.toFixed(2)} / 5` : `Average: ${feedbackStats.average.toFixed(2)} / 5`}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Recent Complaints Table ───────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquareWarning className="h-4 w-4 text-primary" />
            {locale === 'hi' ? 'हाल की शिकायतें' : 'Recent Complaints'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recent && recent.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              {locale === 'hi' ? 'अभी तक कोई शिकायत दर्ज नहीं।' : 'No complaints filed yet.'}
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto custom-scroll">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">{locale === 'hi' ? 'ट्रैकिंग आईडी' : 'Tracking ID'}</TableHead>
                    <TableHead className="text-xs">{locale === 'hi' ? 'श्रेणी' : 'Category'}</TableHead>
                    <TableHead className="text-xs">{locale === 'hi' ? 'स्थिति' : 'Status'}</TableHead>
                    <TableHead className="text-xs">{locale === 'hi' ? 'बनाया गया' : 'Created'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recent?.map(c => {
                    const CatIcon = categoryIcon(c.category)
                    const catColor = categoryIconColor(c.category)
                    return (
                      <TableRow
                        key={c.id}
                        className={onNavigate ? 'cursor-pointer hover:bg-muted/50' : ''}
                        onClick={() => onNavigate?.('complaints')}
                      >
                        <TableCell className="font-mono text-xs">{c.trackingId}</TableCell>
                        <TableCell className="text-xs">
                          <div className="flex items-center gap-1.5">
                            <CatIcon className={`h-3.5 w-3.5 ${catColor}`} />
                            <span>{categoryLabel(c.category, locale)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-[10px] ${statusBadgeClass(c.status)}`}>
                            {statusLabel(c.status, locale)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{formatDateTime(c.createdAt, locale)}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
