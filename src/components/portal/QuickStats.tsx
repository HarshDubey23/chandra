'use client'
import { useEffect, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { Users, Home, ShieldCheck, CheckCircle2, X, TrendingUp } from 'lucide-react'

type Stats = {
  population?: number
  households?: number
  wards?: number
  literacyRate?: number
  complaintsTotal?: number
  complaintsResolved?: number
}

/**
 * QuickStats — a compact KPI strip that slides up from the bottom of the
 * viewport after the user scrolls past the hero section. Shows live panchayat
 * stats (population, households, wards, complaints resolved) at a glance.
 * Dismissible per session. Hidden on mobile (too cramped) — shows on sm+.
 */
export function QuickStats() {
  const { locale } = useI18n()
  const [visible, setVisible] = useState(false)
  // Lazy init dismissal from sessionStorage (avoids setState-in-effect entirely)
  const [dismissed, setDismissed] = useState(() =>
    typeof window !== 'undefined' && sessionStorage.getItem('quickstats-dismissed') === '1'
  )
  const [stats, setStats] = useState<Stats>({})

  useEffect(() => {
    if (dismissed) return
    // Fetch village stats + complaint stats in parallel
    Promise.all([
      fetch('/api/content/village_stats').then(r => r.json()).catch(() => ({})),
      fetch('/api/stats').then(r => r.json()).catch(() => ({})),
    ]).then(([v, s]) => {
      setStats({
        population: v?.data?.population,
        households: v?.data?.households,
        wards: v?.data?.wards,
        literacyRate: v?.data?.literacy_rate,
        complaintsTotal: s?.complaints?.total,
        complaintsResolved: s?.complaints?.resolved,
      })
    }).catch(() => {})
  }, [dismissed])

  // Show after scrolling past hero (600px), hide near footer (bottom 600px)
  useEffect(() => {
    if (dismissed) return
    const onScroll = () => {
      const y = window.scrollY
      const max = document.body.scrollHeight - window.innerHeight
      setVisible(y > 600 && y < max - 600)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [dismissed])

  const dismiss = () => {
    sessionStorage.setItem('quickstats-dismissed', '1')
    setDismissed(true)
    setVisible(false)
  }

  if (dismissed || !visible) return null

  const hi = locale === 'hi'
  const items = [
    { icon: Users, label: hi ? 'जनसंख्या' : 'Population', value: stats.population, suffix: '' },
    { icon: Home, label: hi ? 'परिवार' : 'Households', value: stats.households, suffix: '' },
    { icon: ShieldCheck, label: hi ? 'वार्ड' : 'Wards', value: stats.wards, suffix: '' },
    { icon: TrendingUp, label: hi ? 'साक्षरता' : 'Literacy', value: stats.literacyRate, suffix: '%' },
    { icon: CheckCircle2, label: hi ? 'शिकायतें हल' : 'Complaints Resolved', value: stats.complaintsResolved, suffix: '' },
  ].filter(i => i.value != null)

  return (
    <div
      className="quickstats-enter fixed bottom-4 left-1/2 z-40 hidden -translate-x-1/2 sm:block"
      role="region"
      aria-label={hi ? 'त्वरित सांख्यिकी' : 'Quick statistics'}
    >
      <div className="quickstats-bar flex items-center gap-1 rounded-full border border-border/60 bg-background/90 px-2 py-1.5 shadow-xl ring-1 ring-primary/10">
        {/* Tricolor accent dot */}
        <span className="ml-1 mr-0.5 flex h-3 w-3 flex-col overflow-hidden rounded-full ring-1 ring-border/40" aria-hidden="true">
          <span className="h-1/3 w-full" style={{ background: 'oklch(0.72 0.17 60)' }} />
          <span className="h-1/3 w-full bg-white" />
          <span className="h-1/3 w-full" style={{ background: 'oklch(0.55 0.14 150)' }} />
        </span>
        {items.map((it, i) => (
          <div
            key={i}
            className="quickstats-stat flex items-center gap-1.5 rounded-full px-2.5 py-1 hover:bg-primary/5"
          >
            <it.icon className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="text-sm font-bold font-mono tabular-nums text-foreground">
              {typeof it.value === 'number' ? it.value.toLocaleString('en-IN') : it.value}
              {it.suffix}
            </span>
            <span className="hidden text-[11px] text-muted-foreground lg:inline">
              {it.label}
            </span>
          </div>
        ))}
        {/* Dismiss */}
        <button
          onClick={dismiss}
          className="ml-0.5 grid h-6 w-6 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          aria-label={hi ? 'बंद करें' : 'Dismiss'}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
