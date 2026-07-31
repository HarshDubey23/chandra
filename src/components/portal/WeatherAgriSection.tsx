'use client'
import { useEffect, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts'
import {
  CloudSun,
  Sun,
  CloudRain,
  Wind,
  Droplets,
  SunMedium,
  ExternalLink,
  Sprout,
  Phone,
  Thermometer,
  Calendar,
  TrendingUp,
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudSnow,
  Sunrise,
  Sunset,
  AlertCircle,
  Loader2,
  Umbrella,
  CalendarDays,
} from 'lucide-react'
import { ScrollReveal } from './ScrollReveal'

const SAFFRON = '#c2410c'
const GREEN = '#16a34a'
const AMBER = '#d97706'
const STONE = '#78716c'

// ─── Real weather types (from /api/weather) ───
type WeatherData = {
  current: {
    tempC: number
    feelsLikeC: number
    humidityPct: number
    windKmh: number
    windDirHi: string
    windDirEn: string
    uvIndex: number
    uvLabelHi: string
    uvLabelEn: string
    conditionHi: string
    conditionEn: string
    icon: 'sun' | 'cloud' | 'cloud-rain' | 'fog' | 'snow'
    isDay: boolean
    updatedHi: string
    updatedEn: string
    locationHi: string
    locationEn: string
    source: string
  }
  forecast: Array<{
    dayHi: string
    dayEn: string
    max: number
    min: number
    icon: string
    conditionHi: string
    conditionEn: string
    rainMm: number
    rainProb: number
  }>
  rainfall: {
    history30d: Array<{ date: string; mm: number }>
    total30d: number
    lastRainDate: string | null
    drySpellDays: number
    monthlyTotals: Array<{ month: string; mm: number }>
  }
  sunrise: string | null
  sunset: string | null
}

// Crop calendar (Kharif) — static agricultural reference
const CROP_CALENDAR = [
  { cropHi: 'धान', cropEn: 'Rice', sowingHi: 'जुलाई-अगस्त', sowingEn: 'Jul–Aug', harvestHi: 'अक्टूबर-नवंबर', harvestEn: 'Oct–Nov', yieldHi: '25-30 क्विंटल/हेक्टेयर', yieldEn: '25-30 q/ha' },
  { cropHi: 'बाजरा', cropEn: 'Bajra', sowingHi: 'जून-जुलाई', sowingEn: 'Jun–Jul', harvestHi: 'सितम्बर-अक्टूबर', harvestEn: 'Sep–Oct', yieldHi: '15-20 क्विंटल/हेक्टेयर', yieldEn: '15-20 q/ha' },
  { cropHi: 'उड़द', cropEn: 'Urad', sowingHi: 'जुलाई', sowingEn: 'Jul', harvestHi: 'अक्टूबर', harvestEn: 'Oct', yieldHi: '8-10 क्विंटल/हेक्टेयर', yieldEn: '8-10 q/ha' },
  { cropHi: 'तिल', cropEn: 'Sesame', sowingHi: 'जून-जुलाई', sowingEn: 'Jun–Jul', harvestHi: 'सितम्बर', harvestEn: 'Sep', yieldHi: '4-5 क्विंटल/हेक्टेयर', yieldEn: '4-5 q/ha' },
]

function ForecastIcon({ kind, className }: { kind: string; className?: string }) {
  if (kind === 'sun') return <Sun className={className} />
  if (kind === 'cloud') return <Cloud className={className} />
  if (kind === 'fog') return <CloudFog className={className} />
  if (kind === 'snow') return <CloudSnow className={className} />
  return <CloudRain className={className} />
}

// Format date as "28 जुलाई" / "28 Jul"
function formatLastRain(dateStr: string | null, locale: 'hi' | 'en'): string {
  if (!dateStr) return locale === 'hi' ? 'डेटा नहीं' : 'No data'
  const d = new Date(dateStr)
  const HI_MONTHS = ['जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर']
  const EN_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${d.getDate()} ${locale === 'hi' ? HI_MONTHS[d.getMonth()] : EN_MONTHS[d.getMonth()]}`
}

// Days ago helper
function daysAgo(dateStr: string | null): number {
  if (!dateStr) return -1
  const d = new Date(dateStr)
  const today = new Date()
  return Math.max(0, Math.round((today.getTime() - d.getTime()) / (24 * 60 * 60 * 1000)))
}

// Rainfall tooltip (last 30 days chart)
function RainfallTooltip({ active, payload, locale }: {
  active?: boolean
  payload?: Array<{ value: number; payload: { date: string; mm: number } }>
  locale: 'hi' | 'en'
}) {
  if (active && payload && payload.length) {
    const d = payload[0].payload
    return (
      <div className="bg-card border border-border rounded-md px-3 py-2 text-xs shadow-md">
        <div className="font-medium">{formatLastRain(d.date, locale)}</div>
        <div className="text-muted-foreground">{d.mm} {locale === 'hi' ? 'मिमी वर्षा' : 'mm rain'}</div>
      </div>
    )
  }
  return null
}

export function WeatherAgriSection() {
  const { locale } = useI18n()
  const isHi = locale === 'hi'
  const [data, setData] = useState<WeatherData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    fetch('/api/weather')
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then((d: WeatherData) => { if (alive) setData(d) })
      .catch((e) => { if (alive) setError(e.message) })
    return () => { alive = false }
  }, [])

  // Build chart data from real 30-day history (last 14 days for readability)
  const rainfallChart = data?.rainfall?.history30d?.slice(-14).map(d => ({
    date: d.date,
    label: formatLastRain(d.date, locale).split(' ')[0], // just day number
    mm: d.mm,
    fill: d.mm > 20 ? SAFFRON : d.mm > 5 ? AMBER : d.mm > 0.1 ? STONE : 'var(--muted)',
  })) || []

  const todayForecast = data?.forecast?.[0]
  const willRainToday = (todayForecast?.rainMm ?? 0) > 0.1
  const lastRainDaysAgo = daysAgo(data?.rainfall?.lastRainDate ?? null)

  return (
    <section id="weather-agri" className="section-premium-green py-16 md:py-20 border-b border-border/40">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <Badge variant="outline" className="section-header-badge mb-3 gap-1.5">
            <CloudSun className="h-3.5 w-3.5" />
            {isHi ? 'मौसम एवं कृषि' : 'Weather & Agriculture'}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gradient-premium">
            {isHi ? 'आज का मौसम एवं कृषि जानकारी' : "Today's Weather & Agriculture Info"}
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            {isHi
              ? 'ग्राम चंद्रा के लिए वास्तविक लाइव मौसम (Open-Meteo स्रोत), वर्षा इतिहास, फसल कैलेंडर एवं मंडी भाव।'
              : 'Real live weather for Chandra (Open-Meteo source), rainfall history, crop calendar, and mandi prices.'}
          </p>
        </div>

        {/* Error state */}
        {error && !data && (
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 flex items-start gap-3 mb-6">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <div className="font-semibold text-amber-700 dark:text-amber-400">
                {isHi ? 'मौसम डेटा लोड नहीं हो सका' : 'Weather data could not be loaded'}
              </div>
              <div className="text-muted-foreground text-xs mt-1">
                {isHi ? 'कृपया कुछ क्षण बाद पृष्ठ रीफ्रेश करें।' : 'Please refresh the page in a moment.'} ({error})
              </div>
            </div>
          </div>
        )}

        {/* Loading state */}
        {!data && !error && (
          <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm">{isHi ? 'वास्तविक मौसम डेटा लोड हो रहा है...' : 'Loading live weather data...'}</span>
          </div>
        )}

        {data && (
          <ScrollReveal delay={0.1}>
            <div className="space-y-6">
              {/* Row 1: Current Weather + 5-Day Forecast */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Current Weather Card */}
                <Card className="card-premium hover-lift lg:col-span-5 overflow-hidden">
                  <CardContent className="p-0">
                    {/* Top saffron-tinted band */}
                    <div className="bg-gradient-to-br from-primary/10 via-amber-500/5 to-transparent p-5 md:p-6">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
                            <Sunrise className="h-3 w-3" />
                            {isHi ? 'वर्तमान मौसम' : 'Current Weather'}
                          </div>
                          <div className="flex items-end gap-3">
                            <ForecastIcon
                              kind={data.current.icon}
                              className={`h-14 w-14 ${data.current.icon === 'sun' ? 'text-amber-500' : data.current.icon === 'cloud' ? 'text-stone-500' : data.current.icon === 'fog' ? 'text-stone-400' : data.current.icon === 'snow' ? 'text-sky-400' : 'text-primary'}`}
                            />
                            <div>
                              <div className="text-4xl md:text-5xl font-bold leading-none">
                                {data.current.tempC}°C
                              </div>
                              <div className="text-sm font-medium mt-1">
                                {isHi ? data.current.conditionHi : data.current.conditionEn}
                              </div>
                            </div>
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {isHi ? data.current.locationHi : data.current.locationEn}
                          </div>
                        </div>
                        <Badge variant="secondary" className="gap-1 text-[10px]">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-600 inline-block animate-pulse" />
                          {isHi ? 'लाइव' : 'Live'}
                        </Badge>
                      </div>
                    </div>

                    {/* Details grid */}
                    <div className="grid grid-cols-2 gap-px bg-border/40 p-0">
                      <DetailCell
                        icon={<Droplets className="h-4 w-4" />}
                        label={isHi ? 'आर्द्रता' : 'Humidity'}
                        value={`${data.current.humidityPct}%`}
                      />
                      <DetailCell
                        icon={<Wind className="h-4 w-4" />}
                        label={isHi ? 'हवा' : 'Wind'}
                        value={`${data.current.windKmh} km/h ${isHi ? data.current.windDirHi : data.current.windDirEn}`}
                      />
                      <DetailCell
                        icon={<Thermometer className="h-4 w-4" />}
                        label={isHi ? 'महसूस' : 'Feels Like'}
                        value={`${data.current.feelsLikeC}°C`}
                      />
                      <DetailCell
                        icon={<SunMedium className="h-4 w-4" />}
                        label={isHi ? 'यूवी सूचकांक' : 'UV Index'}
                        value={`${data.current.uvIndex} (${isHi ? data.current.uvLabelHi : data.current.uvLabelEn})`}
                      />
                    </div>

                    {/* Sunrise/Sunset strip */}
                    {data.sunrise && data.sunset && (
                      <div className="grid grid-cols-2 gap-px bg-border/40">
                        <div className="p-2.5 bg-secondary/30 flex items-center gap-2">
                          <Sunrise className="h-4 w-4 text-amber-500" />
                          <div>
                            <div className="text-[10px] text-muted-foreground">{isHi ? 'सूर्योदय' : 'Sunrise'}</div>
                            <div className="text-xs font-semibold font-mono">
                              {new Date(data.sunrise).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </div>
                          </div>
                        </div>
                        <div className="p-2.5 bg-secondary/30 flex items-center gap-2">
                          <Sunset className="h-4 w-4 text-orange-600" />
                          <div>
                            <div className="text-[10px] text-muted-foreground">{isHi ? 'सूर्यास्त' : 'Sunset'}</div>
                            <div className="text-xs font-semibold font-mono">
                              {new Date(data.sunset).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="p-4 flex flex-wrap items-center justify-between gap-2 border-t border-border/60">
                      <div className="text-[11px] text-muted-foreground">
                        {isHi ? 'अंतिम अपडेट: ' : 'Last updated: '}
                        <span className="text-foreground/80">
                          {isHi ? data.current.updatedHi : data.current.updatedEn}
                        </span>
                      </div>
                      <a
                        href="https://open-meteo.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-muted-foreground hover:text-primary inline-flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {isHi ? 'स्रोत: Open-Meteo' : 'Source: Open-Meteo'}
                      </a>
                    </div>
                  </CardContent>
                </Card>

                {/* 5-Day Forecast Card */}
                <Card className="card-premium lg:col-span-7 bg-secondary/30">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-primary" />
                        {isHi ? '7-दिवसीय पूर्वानुमान' : '7-Day Forecast'}
                      </CardTitle>
                      <Badge variant="outline" className="text-[10px] gap-1">
                        <CloudSun className="h-3 w-3" />
                        {isHi ? 'शंकरगढ़ क्षेत्र' : 'Shankargarh Area'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                      {data.forecast.map((f, idx) => (
                        <div
                          key={idx}
                          className="rounded-lg border border-border/60 bg-card p-2.5 flex flex-col items-center text-center gap-1 card-hover-lift"
                        >
                          <div className="text-[11px] font-semibold">
                            {isHi ? f.dayHi : f.dayEn}
                          </div>
                          <ForecastIcon
                            kind={f.icon}
                            className={`h-6 w-6 ${
                              f.icon === 'sun' ? 'text-amber-500'
                              : f.icon === 'cloud' ? 'text-stone-500'
                              : f.icon === 'fog' ? 'text-stone-400'
                              : f.icon === 'snow' ? 'text-sky-400'
                              : 'text-primary'
                            }`}
                          />
                          <div className="flex items-baseline gap-1 text-sm">
                            <span className="font-bold">{f.max}°</span>
                            <span className="text-muted-foreground text-[11px]">/ {f.min}°</span>
                          </div>
                          {f.rainProb > 5 && (
                            <div className="text-[10px] text-primary flex items-center gap-0.5 font-medium">
                              <CloudRain className="h-2.5 w-2.5" />
                              {f.rainProb}%
                            </div>
                          )}
                          {f.rainMm > 0.1 && (
                            <div className="text-[9px] text-muted-foreground">{f.rainMm}mm</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Row 2: Rainfall Insight Cards — REAL DATA */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Last rain */}
                <Card className="card-premium-bordered hover-lift">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                        <Umbrella className="h-4.5 w-4.5" />
                      </div>
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {isHi ? 'अंतिम बारिश' : 'Last Rainfall'}
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {formatLastRain(data.rainfall.lastRainDate, locale)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {lastRainDaysAgo === 0
                        ? (isHi ? 'आज बारिश हुई' : 'Rained today')
                        : lastRainDaysAgo === 1
                          ? (isHi ? '1 दिन पहले' : '1 day ago')
                          : (isHi ? `${lastRainDaysAgo} दिन पहले` : `${lastRainDaysAgo} days ago`)}
                    </div>
                  </CardContent>
                </Card>

                {/* Total 30d */}
                <Card className="card-premium-bordered hover-lift">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="grid h-9 w-9 place-items-center rounded-lg bg-green-600/10 text-green-600">
                        <Droplets className="h-4.5 w-4.5" />
                      </div>
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {isHi ? '30 दिन की वर्षा' : '30-Day Rainfall'}
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {data.rainfall.total30d} <span className="text-sm font-normal text-muted-foreground">मिमी / mm</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {isHi ? 'वास्तविक डेटा' : 'Real historical data'}
                    </div>
                  </CardContent>
                </Card>

                {/* Dry spell */}
                <Card className={`card-premium-bordered ${data.rainfall.drySpellDays > 7 ? 'ring-1 ring-amber-500/30' : ''} hover-lift`}>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`grid h-9 w-9 place-items-center rounded-lg ${data.rainfall.drySpellDays > 7 ? 'bg-amber-500/15 text-amber-600' : 'bg-primary/10 text-primary'}`}>
                        <CalendarDays className="h-4.5 w-4.5" />
                      </div>
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {isHi ? 'सूखा दौर' : 'Dry Spell'}
                      </div>
                    </div>
                    <div className={`text-2xl font-bold ${data.rainfall.drySpellDays > 7 ? 'text-amber-600' : 'text-primary'}`}>
                      {data.rainfall.drySpellDays} <span className="text-sm font-normal text-muted-foreground">{isHi ? 'दिन' : 'days'}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {data.rainfall.drySpellDays === 0
                        ? (isHi ? 'आज बारिश हुई' : 'Rained today')
                        : data.rainfall.drySpellDays > 7
                          ? (isHi ? '⚠ किसान सतर्क रहें' : '⚠ Farmers stay alert')
                          : (isHi ? 'सामान्य' : 'Normal')}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Row 3: Rainfall Chart — REAL 14-day history */}
              <Card className="card-premium bg-secondary/30">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                      <CloudRain className="h-4 w-4 text-primary" />
                      {isHi ? 'वास्तविक वर्षा — अंतिम 14 दिन (मिमी)' : 'Real Rainfall — Last 14 Days (mm)'}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="text-[10px] gap-1">
                        <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: SAFFRON }} />
                        {isHi ? 'भारी (>20mm)' : 'Heavy (>20mm)'}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] gap-1">
                        <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: AMBER }} />
                        {isHi ? 'मध्यम' : 'Moderate'}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] gap-1">
                        <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: STONE }} />
                        {isHi ? 'हल्की' : 'Light'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {rainfallChart.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart
                          data={rainfallChart}
                          margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                          <XAxis
                            dataKey="label"
                            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                            tickLine={false}
                            axisLine={{ stroke: 'var(--border)' }}
                          />
                          <YAxis
                            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                            tickLine={false}
                            axisLine={false}
                            width={32}
                          />
                          <Tooltip
                            cursor={{ fill: 'var(--muted)', opacity: 0.3 }}
                            content={<RainfallTooltip locale={locale} />}
                          />
                          <Bar dataKey="mm" radius={[4, 4, 0, 0]} barSize={28}>
                            {rainfallChart.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                        <div className="p-2 rounded-md bg-card border border-border/60">
                          <div className="text-muted-foreground">{isHi ? 'कुल 30 दिन' : 'Total 30 days'}</div>
                          <div className="font-bold text-primary">{data.rainfall.total30d} mm</div>
                        </div>
                        <div className="p-2 rounded-md bg-card border border-border/60">
                          <div className="text-muted-foreground">{isHi ? 'अंतिम बारिश' : 'Last rain'}</div>
                          <div className="font-bold text-primary">{formatLastRain(data.rainfall.lastRainDate, locale)}</div>
                        </div>
                        <div className="p-2 rounded-md bg-card border border-border/60">
                          <div className="text-muted-foreground">{isHi ? 'बारिश के दिन' : 'Rainy days (30d)'}</div>
                          <div className="font-bold text-primary">
                            {data.rainfall.history30d.filter(d => d.mm > 0.1).length}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-10 text-sm text-muted-foreground">
                      {isHi ? 'वर्षा डेटा लोड नहीं हो सका' : 'Rainfall data unavailable'}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Row 4: Crop Calendar + Mandi Prices */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Crop Calendar Card */}
                <Card className="card-premium lg:col-span-6">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                        <Sprout className="h-4 w-4 text-green-600" />
                        {isHi ? 'फसल कैलेंडर (खरीफ)' : 'Crop Calendar (Kharif)'}
                      </CardTitle>
                      <Badge variant="outline" className="text-[10px] gap-1">
                        <Sprout className="h-3 w-3" />
                        {isHi ? 'खरीफ सत्र' : 'Kharif Season'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">{isHi ? 'फसल' : 'Crop'}</TableHead>
                          <TableHead className="text-xs">{isHi ? 'बोना' : 'Sowing'}</TableHead>
                          <TableHead className="text-xs">{isHi ? 'कटाई' : 'Harvest'}</TableHead>
                          <TableHead className="text-xs">{isHi ? 'पैदावार' : 'Yield'}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {CROP_CALENDAR.map((c, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="text-xs font-medium">{isHi ? c.cropHi : c.cropEn}</TableCell>
                            <TableCell className="text-xs">{isHi ? c.sowingHi : c.sowingEn}</TableCell>
                            <TableCell className="text-xs">{isHi ? c.harvestHi : c.harvestEn}</TableCell>
                            <TableCell className="text-xs">{isHi ? c.yieldHi : c.yieldEn}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Mandi Prices Card — links to real portal (no fake prices) */}
                <Card className="card-premium lg:col-span-6">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        {isHi ? 'मंडी भाव' : 'Mandi Prices'}
                      </CardTitle>
                      <Badge variant="outline" className="text-[10px] gap-1">
                        <ExternalLink className="h-3 w-3" />
                        {isHi ? 'लाइव पोर्टल' : 'Live Portal'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-xs text-muted-foreground">
                        {isHi
                          ? 'वास्तविक मंडी भाव के लिए नीचे दिए गए पोर्टल पर जाएं। यह डेटा प्रतिदिन अपडेट होता है।'
                          : 'For real mandi prices, visit the portals below. Data updates daily.'}
                      </p>
                      <a
                        href="https://upagriculture.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 rounded-md border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors"
                      >
                        <div>
                          <div className="text-sm font-medium">{isHi ? 'उत्तर प्रदेश कृषि विभाग' : 'UP Agriculture Dept'}</div>
                          <div className="text-[10px] text-muted-foreground">upagriculture.com</div>
                        </div>
                        <ExternalLink className="h-4 w-4 text-primary" />
                      </a>
                      <a
                        href="https://agmarknet.gov.in/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 rounded-md border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors"
                      >
                        <div>
                          <div className="text-sm font-medium">{isHi ? 'अग्रमार्कनेट (राष्ट्रीय)' : 'Agmarknet (National)'}</div>
                          <div className="text-[10px] text-muted-foreground">agmarknet.gov.in</div>
                        </div>
                        <ExternalLink className="h-4 w-4 text-primary" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Footer note */}
              <div className="card-premium-bordered-green p-4 flex items-start gap-3">
                <div className="h-9 w-9 rounded-md grid place-items-center shrink-0 bg-green-600/15 text-green-700 dark:text-green-500">
                  <Phone className="h-4 w-4" />
                </div>
                <div className="text-sm">
                  <div className="font-semibold">
                    {isHi ? 'कृषि विशेषज्ञ सलाह के लिए' : 'For Expert Agricultural Advice'}
                  </div>
                  <div className="text-muted-foreground text-xs mt-0.5">
                    {isHi ? 'कृषि विज्ञान केंद्र शंकरगढ़ से संपर्क करें' : 'Contact Krishi Vigyan Kendra Shankargarh'}
                    {' — '}
                    <a href="tel:+915322800000" className="text-primary font-medium hover:underline">+91-532-2800000</a>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        )}
      </div>
    </section>
  )
}

// MapPin icon (avoid extra import — inline simple SVG path component)
function MapPin({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function DetailCell({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-3 bg-secondary/30">
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-1">
        <span className="text-primary">{icon}</span>
        {label}
      </div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  )
}
