'use client'
// FeedbackDashboard — admin aggregation of citizen feedback (Task 7-c)
// Bilingual HI/EN. Pulls /api/feedback (admin auth via cookie) and renders
// summary stats, a rating-distribution BarChart, and a filterable recent list.
import { useEffect, useMemo, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  AlertCircle,
  MessageSquareQuote,
  RefreshCw,
  Search,
  Star,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDateTime } from './lib'
import type { Locale } from '@/lib/i18n'

// Warm Indian palette — NO indigo/blue. Amber for rating bars.
const AMBER = '#f59e0b'
const AMBER_DARK = '#b45309'
const GREEN = '#16a34a'

interface FeedbackRecord {
  id: string
  trackingId: string
  rating: number
  comment: string | null
  language: string
  createdAt: string
}

interface ApiResponse {
  feedback: FeedbackRecord[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ── Custom tooltip for the rating distribution chart ──
function RatingChartTooltip({ active, payload }: {
  active?: boolean
  payload?: Array<{ payload: { stars: string; count: number; label: string } }>
}) {
  if (!active || !payload || payload.length === 0) return null
  const p = payload[0].payload
  return (
    <div className="rounded-md border bg-background px-2.5 py-1.5 text-xs shadow-md">
      <div className="font-medium">{p.stars}</div>
      <div className="text-muted-foreground">
        {p.count} {p.count === 1 ? 'entry' : 'entries'}
      </div>
      <div className="text-[10px] text-muted-foreground">{p.label}</div>
    </div>
  )
}

// ── Star row renderer ──
function StarRow({ rating, size = 'h-3 w-3' }: { rating: number; size?: string }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} / 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${size} ${n <= rating ? 'text-amber-500 fill-current' : 'text-muted-foreground/30'}`}
        />
      ))}
    </div>
  )
}

export function FeedbackDashboard() {
  const { locale } = useI18n()
  const isHi = locale === 'hi'

  const [data, setData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ── Client-side filters ──
  const [searchQuery, setSearchQuery] = useState('')
  const [ratingFilter, setRatingFilter] = useState<string>('all')

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const r = await fetch('/api/feedback?page=1&limit=200', { cache: 'no-store' })
      if (r.status === 401) {
        setError(isHi ? 'अनधिकृत — कृपया लॉगिन करें' : 'Unauthorized — please login')
        setData(null)
        return
      }
      if (!r.ok) throw new Error('fetch_failed')
      const d: ApiResponse = await r.json()
      setData(d)
    } catch {
      setError(isHi ? 'प्रतिक्रिया लोड विफल' : 'Failed to load feedback')
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [isHi])

  // ── Derived: all records (already fetched up to 200) ──
  const allRecords = data?.feedback ?? []

  // ── Derived stats ──
  const stats = useMemo(() => {
    const total = allRecords.length
    if (total === 0) {
      return { total: 0, avg: 0, satisfaction: 0, thisMonth: 0 }
    }
    const sum = allRecords.reduce((acc, f) => acc + f.rating, 0)
    const avg = sum / total
    const satisfied = allRecords.filter((f) => f.rating >= 4).length
    const satisfaction = (satisfied / total) * 100

    const now = new Date()
    const thisMonth = allRecords.filter((f) => {
      const d = new Date(f.createdAt)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).length

    return {
      total,
      avg,
      satisfaction,
      thisMonth,
    }
  }, [allRecords])

  // ── Rating distribution (1-5) ──
  const distribution = useMemo(() => {
    const starLabelsHi = ['बहुत खराब', 'खराब', 'औसत', 'अच्छा', 'बहुत अच्छा']
    const starLabelsEn = ['Very Bad', 'Bad', 'Average', 'Good', 'Excellent']
    return [1, 2, 3, 4, 5].map((n) => ({
      stars: `${n}★`,
      rating: n,
      count: allRecords.filter((f) => f.rating === n).length,
      label: isHi ? starLabelsHi[n - 1] : starLabelsEn[n - 1],
    }))
  }, [allRecords, isHi])

  // ── Filtered recent list (max 20) ──
  const filtered = useMemo(() => {
    let list = allRecords
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      list = list.filter((f) => f.trackingId.toLowerCase().includes(q))
    }
    if (ratingFilter !== 'all') {
      const r = Number(ratingFilter)
      list = list.filter((f) => f.rating === r)
    }
    return list.slice(0, 20)
  }, [allRecords, searchQuery, ratingFilter])

  const langBadgeClass = (lang: string) => {
    if (lang === 'hi') return 'bg-primary/10 text-primary border-primary/30'
    if (lang === 'en') return 'bg-teal-100 text-teal-900 border-teal-300 dark:bg-teal-900/40 dark:text-teal-100 dark:border-teal-700'
    return 'bg-muted text-muted-foreground border-border'
  }

  const t = isHi
    ? {
        heading: 'नागरिक प्रतिक्रिया',
        subheading: 'नागरिकों द्वारा दी गई शिकायत संतुष्टि प्रतिक्रिया।',
        stats: {
          total: 'कुल प्रतिक्रिया',
          avg: 'औसत रेटिंग',
          satisfaction: 'संतुष्टि दर',
          thisMonth: 'इस माह',
        },
        chartTitle: 'रेटिंग वितरण',
        chartSubtitle: '1 से 5 स्टार तक प्रतिक्रिया संख्या',
        listTitle: 'हाल की प्रतिक्रिया',
        listSubtitle: 'अंतिम 20 प्रविष्टियाँ',
        searchPlaceholder: 'ट्रैकिंग आईडी खोजें...',
        ratingFilter: 'रेटिंग फ़िल्टर',
        all: 'सभी',
        empty: 'अभी कोई प्रतिक्रिया नहीं',
        emptyHint: 'नागरिकों द्वारा शिकायतें हल होने के बाद प्रतिक्रिया देने पर यहाँ दिखेगी।',
        emptyFiltered: 'इस फ़िल्टर में कोई प्रतिक्रिया नहीं।',
        colTracking: 'ट्रैकिंग आईडी',
        colRating: 'रेटिंग',
        colComment: 'टिप्पणी',
        colLanguage: 'भाषा',
        colDate: 'तिथि',
        noComment: '— कोई टिप्पणी नहीं —',
        refresh: 'रिफ्रेश',
        loading: 'लोड हो रहा है...',
      }
    : {
        heading: 'Citizen Feedback',
        subheading: 'Citizen satisfaction feedback submitted on resolved complaints.',
        stats: {
          total: 'Total Feedback',
          avg: 'Average Rating',
          satisfaction: 'Satisfaction Rate',
          thisMonth: 'This Month',
        },
        chartTitle: 'Rating Distribution',
        chartSubtitle: 'Feedback counts from 1 to 5 stars',
        listTitle: 'Recent Feedback',
        listSubtitle: 'Last 20 entries',
        searchPlaceholder: 'Search tracking ID...',
        ratingFilter: 'Rating filter',
        all: 'All',
        empty: 'No feedback yet',
        emptyHint: 'Feedback submitted by citizens after their complaints are resolved will appear here.',
        emptyFiltered: 'No feedback matches this filter.',
        colTracking: 'Tracking ID',
        colRating: 'Rating',
        colComment: 'Comment',
        colLanguage: 'Language',
        colDate: 'Date',
        noComment: '— no comment —',
        refresh: 'Refresh',
        loading: 'Loading...',
      }

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div className="space-y-4">
        <div>
          <div className="h-6 w-64 skeleton-card" />
          <div className="h-3 w-96 mt-2 skeleton-card" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 skeleton-card" />
          ))}
        </div>
        <div className="h-64 skeleton-card" />
        <div className="h-72 skeleton-card" />
      </div>
    )
  }

  // ── Error state ──
  if (error) {
    return (
      <Card className="border-dashed border-destructive/40">
        <CardContent className="p-8 text-center text-sm text-destructive flex items-center justify-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </CardContent>
      </Card>
    )
  }

  const statCards = [
    {
      key: 'total',
      label: t.stats.total,
      value: stats.total.toString(),
      icon: MessageSquareQuote,
      tint: 'bg-primary/10 text-primary',
    },
    {
      key: 'avg',
      label: t.stats.avg,
      value: stats.total === 0 ? '—' : stats.avg.toFixed(1),
      icon: Star,
      tint: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200',
    },
    {
      key: 'satisfaction',
      label: t.stats.satisfaction,
      value: stats.total === 0 ? '—' : `${stats.satisfaction.toFixed(0)}%`,
      icon: TrendingUp,
      tint: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-200',
    },
    {
      key: 'thisMonth',
      label: t.stats.thisMonth,
      value: stats.thisMonth.toString(),
      icon: TrendingUp,
      tint: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-200',
    },
  ]

  return (
    <div className="space-y-5">
      {/* Heading */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold section-heading">
            {isHi ? 'नागरिक प्रतिक्रिया' : 'Citizen Feedback'}
            <span className="text-muted-foreground/60 font-normal"> / {isHi ? 'Citizen Feedback' : 'नागरिक प्रतिक्रिया'}</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-2">{t.subheading}</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={fetchData}>
          <RefreshCw className="h-3.5 w-3.5" />
          {t.refresh}
        </Button>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map((c) => {
          const Icon = c.icon
          return (
            <Card key={c.key} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                    {c.label}
                  </span>
                  <div className={`h-8 w-8 rounded-lg grid place-items-center ${c.tint}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold tabular-nums text-foreground">{c.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* ── Empty state for first-load with no data ── */}
      {stats.total === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 flex flex-col items-center justify-center gap-3 text-center">
            <div className="h-16 w-16 rounded-full bg-muted/60 grid place-items-center">
              <MessageSquareQuote className="h-8 w-8 text-muted-foreground/60" />
            </div>
            <div>
              <p className="text-base font-medium text-foreground">
                {isHi ? 'अभी कोई प्रतिक्रिया नहीं' : 'No feedback yet'}
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">{t.emptyHint}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* ── Rating distribution chart ── */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-500" />
                {t.chartTitle}
              </CardTitle>
              <p className="text-xs text-muted-foreground">{t.chartSubtitle}</p>
            </CardHeader>
            <CardContent>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={distribution}
                    margin={{ top: 8, right: 8, bottom: 4, left: -20 }}
                  >
                    <XAxis
                      dataKey="stars"
                      tick={{ fontSize: 12, fill: 'currentColor' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: 'currentColor' }}
                      axisLine={false}
                      tickLine={false}
                      width={36}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(245, 158, 11, 0.08)' }}
                      content={<RatingChartTooltip />}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={64}>
                      {distribution.map((d) => {
                        // Color by rating: red-leaning for low, amber for mid, green for high
                        let fill = AMBER
                        if (d.rating <= 2) fill = AMBER_DARK
                        else if (d.rating === 5) fill = GREEN
                        return <Cell key={d.rating} fill={fill} />
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Mini legend */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-sm" style={{ background: AMBER_DARK }} />
                  {isHi ? '1-2 स्टार (कम)' : '1-2 stars (low)'}
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-sm" style={{ background: AMBER }} />
                  {isHi ? '3-4 स्टार (मध्यम)' : '3-4 stars (mid)'}
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-sm" style={{ background: GREEN }} />
                  {isHi ? '5 स्टार (उत्कृष्ट)' : '5 stars (excellent)'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* ── Recent feedback table ── */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <MessageSquareQuote className="h-4 w-4 text-primary" />
                    {t.listTitle}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">{t.listSubtitle}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* ── Filters ── */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative sm:col-span-2">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    className="pl-8 text-xs h-9"
                  />
                </div>
                <Select value={ratingFilter} onValueChange={setRatingFilter}>
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue placeholder={t.ratingFilter} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">
                      {isHi ? 'सभी रेटिंग' : 'All ratings'}
                    </SelectItem>
                    {[5, 4, 3, 2, 1].map((r) => (
                      <SelectItem key={r} value={r.toString()} className="text-xs">
                        {`${r} ★`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {filtered.length === 0 ? (
                <div className="p-10 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                  <MessageSquareQuote className="h-6 w-6 opacity-50" />
                  {t.emptyFiltered}
                </div>
              ) : (
                <div className="max-h-[60vh] overflow-y-auto custom-scroll rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">{t.colTracking}</TableHead>
                        <TableHead className="text-xs">{t.colRating}</TableHead>
                        <TableHead className="text-xs">{t.colComment}</TableHead>
                        <TableHead className="text-xs">{t.colLanguage}</TableHead>
                        <TableHead className="text-xs whitespace-nowrap">{t.colDate}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((f) => (
                        <TableRow key={f.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                  {f.rating}★
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-mono text-xs">{f.trackingId}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <StarRow rating={f.rating} />
                          </TableCell>
                          <TableCell className="max-w-[280px]">
                            {f.comment ? (
                              <span
                                className="text-xs text-foreground/80 line-clamp-2"
                                title={f.comment}
                              >
                                {f.comment}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">{t.noComment}</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`text-[10px] ${langBadgeClass(f.language)}`}>
                              {f.language.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDateTime(f.createdAt, locale as Locale)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
