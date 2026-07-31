'use client'
import { useEffect, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PieChart, Pie, Cell, BarChart, Bar, ResponsiveContainer, Tooltip, Legend, Label } from 'recharts'
import { Droplets, School, Route, Home, Sun, Building2, BarChart3, TrendingUp, Activity, Layers } from 'lucide-react'
import { ScrollReveal } from './ScrollReveal'

interface StatsData {
  complaints: { total: number; pending: number; inProgress: number; resolved: number; rejected: number }
  images: number
  scrapedRecords: number
}

interface ImageAsset {
  imageId: string
  category: string
  isPublic: boolean
}

// Warm Indian palette colors for chart slices
const COMPLAINT_COLORS = {
  pending: '#d97706',    // amber
  inProgress: '#0891b2', // cyan
  resolved: '#16a34a',   // green (matches accent)
  rejected: '#dc2626',   // red
}

const SAFFRON_BAR = '#c2410c' // deep saffron for bar chart

const INFRA_ICONS: Record<string, { icon: typeof Droplets; labelHi: string; labelEn: string; color: string }> = {
  'infrastructure.water': { icon: Droplets, labelHi: 'जल स्रोत', labelEn: 'Water', color: '#0891b2' },
  'infrastructure.school': { icon: School, labelHi: 'विद्यालय', labelEn: 'School', color: '#7c3aed' },
  'infrastructure.road': { icon: Route, labelHi: 'सड़क', labelEn: 'Roads', color: '#c2410c' },
  'scheme.pmay-g': { icon: Home, labelHi: 'आवास', labelEn: 'Housing', color: '#16a34a' },
  'infrastructure.power': { icon: Sun, labelHi: 'विद्युत', labelEn: 'Power', color: '#d97706' },
  'infrastructure.civic': { icon: Building2, labelHi: 'सामाजिक', labelEn: 'Civic', color: '#78716c' },
}

function BarTooltip({ active, payload }: { active?: boolean; payload?: Array<{ value: number; payload: { name: string; label: string } }> }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg px-4 py-3 text-xs shadow-xl backdrop-blur-sm">
        <div className="font-semibold text-foreground">{payload[0].payload.name}</div>
        <div className="text-muted-foreground mt-0.5">{payload[0].payload.label}</div>
      </div>
    )
  }
  return null
}

export function VillageStats() {
  const { locale } = useI18n()
  const [stats, setStats] = useState<StatsData | null>(null)
  const [images, setImages] = useState<ImageAsset[]>([])
  const [schemeData, setSchemeData] = useState<{ mgnrega?: { coverage_pct: number }; pmay_g?: { coverage_pct: number }; jjm?: { coverage_pct: number } } | null>(null)

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats).catch(() => {})
    fetch('/api/images').then(r => r.json()).then(d => setImages(d.images || [])).catch(() => {})
    fetch('/api/content/schemes_coverage').then(r => r.ok ? r.json() : null).then(d => d?.data && setSchemeData(d.data)).catch(() => {})
  }, [])

  const isHi = locale === 'hi'

  // Complaint status data for pie chart
  const complaintData = stats
    ? [
        { name: isHi ? 'लंबित' : 'Pending', value: stats.complaints.pending, color: COMPLAINT_COLORS.pending },
        { name: isHi ? 'प्रगति में' : 'In Progress', value: stats.complaints.inProgress, color: COMPLAINT_COLORS.inProgress },
        { name: isHi ? 'समाधान' : 'Resolved', value: stats.complaints.resolved, color: COMPLAINT_COLORS.resolved },
        { name: isHi ? 'अस्वीकृत' : 'Rejected', value: stats.complaints.rejected, color: COMPLAINT_COLORS.rejected },
      ].filter(d => d.value > 0)
    : []

  const totalComplaints = stats?.complaints.total || 0
  const resolvedCount = stats?.complaints.resolved || 0
  const resolutionRate = totalComplaints > 0 ? Math.round((resolvedCount / totalComplaints) * 100) : 0

  // Scheme coverage data for bar chart — fetched from content API (admin-editable)
  const mCov = schemeData?.mgnrega?.coverage_pct ?? 76
  const pCov = schemeData?.pmay_g?.coverage_pct ?? 63
  const jCov = schemeData?.jjm?.coverage_pct ?? 93
  const schemeCoverageData = [
    { name: isHi ? 'मनरेगा' : 'MGNREGA', coverage: mCov, label: isHi ? `${mCov}% सक्रिय` : `${mCov}% Active` },
    { name: isHi ? 'पीएमआवास' : 'PMAY-G', coverage: pCov, label: isHi ? `${pCov}% पूर्ण` : `${pCov}% Done` },
    { name: isHi ? 'जल जीवन' : 'JJM', coverage: jCov, label: isHi ? `${jCov}% कवर्ड` : `${jCov}% Covered` },
  ]

  // Infrastructure category counts from images
  const infraCounts: Record<string, number> = {}
  for (const img of images) {
    // Match prefix (e.g., "infrastructure.water.handpump" matches "infrastructure.water")
    const prefixes = Object.keys(INFRA_ICONS)
    for (const prefix of prefixes) {
      if (img.category.startsWith(prefix)) {
        infraCounts[prefix] = (infraCounts[prefix] || 0) + 1
        break
      }
    }
  }

  // Custom label for pie center
  const renderPieCenterLabel = () => {
    return (
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" className="fill-foreground">
        <tspan fontSize="22" fontWeight="bold">{totalComplaints}</tspan>
        <tspan fontSize="11" x="50%" dy="18">{isHi ? 'शिकायत' : 'Total'}</tspan>
      </text>
    )
  }

  return (
    <section id="village-stats" className="py-16 md:py-24 bg-gradient-to-b from-background via-secondary/10 to-background relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-600 via-white to-green-600 opacity-60" />
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-500/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        {/* ── Section Header ── */}
        <ScrollReveal delay={0.1}>
          <div className="mb-12 text-center">
            <Badge variant="outline" className="mb-4 gap-2 px-4 py-1.5 text-sm border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors">
              <BarChart3 className="h-4 w-4 text-primary" />
              {isHi ? 'सांख्यिकी' : 'Statistics'}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold section-heading">
              {isHi ? 'विवरण एवं सांख्यिकी' : 'Village Statistics'}
            </h2>
            <p className="text-base text-muted-foreground mt-4 max-w-2xl mx-auto leading-relaxed">
              {isHi
                ? 'ग्राम चंद्रा की शिकायत स्थिति, योजना कवरेज और आधारभूत संरचना सारांश'
                : 'Complaint status, scheme coverage, and infrastructure summary for Chandra village'}
            </p>
          </div>
        </ScrollReveal>

        {/* ── Quick Stats Bar ── */}
        <ScrollReveal delay={0.15}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <div className="rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/20 dark:to-orange-900/10 border border-orange-200/50 dark:border-orange-900/30 p-4 text-center hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300 hover:-translate-y-0.5">
              <div className="text-2xl md:text-3xl font-bold text-orange-700 dark:text-orange-400">{totalComplaints}</div>
              <div className="text-xs text-orange-600/70 dark:text-orange-400/70 mt-1 font-medium">{isHi ? 'कुल शिकायत' : 'Total Complaints'}</div>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10 border border-green-200/50 dark:border-green-900/30 p-4 text-center hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300 hover:-translate-y-0.5">
              <div className="text-2xl md:text-3xl font-bold text-green-700 dark:text-green-400">{resolvedCount}</div>
              <div className="text-xs text-green-600/70 dark:text-green-400/70 mt-1 font-medium">{isHi ? 'समाधान' : 'Resolved'}</div>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-cyan-50 to-cyan-100/50 dark:from-cyan-950/20 dark:to-cyan-900/10 border border-cyan-200/50 dark:border-cyan-900/30 p-4 text-center hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 hover:-translate-y-0.5">
              <div className="text-2xl md:text-3xl font-bold text-cyan-700 dark:text-cyan-400">{resolutionRate}%</div>
              <div className="text-xs text-cyan-600/70 dark:text-cyan-400/70 mt-1 font-medium">{isHi ? 'समाधान दर' : 'Resolution Rate'}</div>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/10 border border-amber-200/50 dark:border-amber-900/30 p-4 text-center hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300 hover:-translate-y-0.5">
              <div className="text-2xl md:text-3xl font-bold text-amber-700 dark:text-amber-400">{images.length}</div>
              <div className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-1 font-medium">{isHi ? 'इंफ्रास्ट्रक्चर' : 'Infrastructure'}</div>
            </div>
          </div>
        </ScrollReveal>

        {/* ── Chart Cards ── */}
        <ScrollReveal delay={0.2}>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Complaint Status Pie Chart */}
            <Card className="border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group">
              <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-amber-500 to-green-500" />
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-5">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 grid place-items-center">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold">
                    {isHi ? 'शिकायत स्थिति वितरण' : 'Complaint Status Distribution'}
                  </h3>
                </div>
                {complaintData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={complaintData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                        labelLine={true}
                      >
                        {complaintData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                        ))}
                        <Label content={renderPieCenterLabel} position="center" />
                      </Pie>
                      <Tooltip
                        formatter={(value: number, name: string) => [value, name]}
                        contentStyle={{ fontSize: '12px', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">
                    {isHi ? 'डेटा लोड हो रहा है...' : 'Loading data...'}
                  </div>
                )}
                <div className="flex flex-wrap gap-2 mt-4 justify-center">
                  {complaintData.map(d => (
                    <Badge key={d.name} variant="outline" className="text-[10px] gap-1.5 px-2.5 py-1 border-0 shadow-sm" style={{ backgroundColor: d.color + '15', color: d.color }}>
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                      {d.name}: {d.value}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Scheme Coverage Bar Chart */}
            <Card className="border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group">
              <div className="h-1 w-full bg-gradient-to-r from-saffron via-amber-500 to-orange-500" />
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-5">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 grid place-items-center">
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold">
                    {isHi ? 'योजना कवरेज' : 'Scheme Coverage'}
                  </h3>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={schemeCoverageData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                  >
                    <Tooltip content={<BarTooltip />} />
                    <Bar
                      dataKey="coverage"
                      fill={SAFFRON_BAR}
                      radius={[0, 6, 6, 0]}
                      barSize={28}
                      label={({ x, width, value, y }) => {
                        const safeX = Number.isFinite(x) ? x : 0
                        const safeWidth = Number.isFinite(width) ? width : 0
                        const safeY = Number.isFinite(y) ? y : 0
                        const safeValue = Number.isFinite(value) ? value : 0
                        if (!Number.isFinite(x) || !Number.isFinite(width) || !Number.isFinite(y)) return <text />
                        return (
                          <text
                            x={safeX + safeWidth + 10}
                            y={safeY + 14}
                            fontSize="12"
                            fontWeight="700"
                            fill="var(--foreground)"
                          >
                            {safeValue}%
                          </text>
                        )
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 mt-4 justify-center">
                  {schemeCoverageData.map(d => (
                    <Badge key={d.name} variant="outline" className="text-[10px] gap-1.5 px-2.5 py-1 border-0 shadow-sm" style={{ backgroundColor: SAFFRON_BAR + '15', color: SAFFRON_BAR }}>
                      {d.name}: {d.coverage}%
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Infrastructure Summary */}
            <Card className="border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group md:col-span-2 lg:col-span-1">
              <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500" />
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-5">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 grid place-items-center">
                    <Layers className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold">
                    {isHi ? 'आधारभूत संरचना सारांश' : 'Infrastructure Summary'}
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(INFRA_ICONS).map(([prefix, info]) => {
                    const Icon = info.icon
                    const count = infraCounts[prefix] || 0
                    return (
                      <div key={prefix} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40 hover:bg-secondary/70 border border-border/30 transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5 cursor-default">
                        <div className="h-9 w-9 rounded-lg grid place-items-center shrink-0 transition-colors" style={{ backgroundColor: info.color + '15', color: info.color }}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold">{isHi ? info.labelHi : info.labelEn}</div>
                          <div className="text-[10px] text-muted-foreground">{count} {isHi ? 'चित्र' : 'images'}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-5 text-xs text-muted-foreground flex items-center gap-1.5 p-3 rounded-lg bg-secondary/30 border border-border/20">
                  <Layers className="h-3.5 w-3.5 text-primary" />
                  {isHi
                    ? `कुल ${images.length} आधारभूत संरचना चित्र उपलब्ध`
                    : `Total ${images.length} infrastructure images available`}
                </div>
              </CardContent>
            </Card>

          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
