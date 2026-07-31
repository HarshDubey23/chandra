'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, TrendingUp, Users, CheckCircle2, Store } from 'lucide-react'
import { ease, dur } from '@/lib/motion/springs'
import { useI18n } from '@/lib/i18n'

interface Stats {
  resolved: number
  pending: number
  total: number
  vapiFiled: number
}

/**
 * LivePortalStats — a dismissible floating widget (bottom-left, desktop only)
 * that fetches real portal metrics every 60s and displays them with animated
 * counters. Adds a "living portal" feel without blocking content.
 *
 * Hidden on mobile (would clutter 360px) and dismissible via X button.
 * Persisted dismissal in sessionStorage so it doesn't nag within a session.
 */
export function LivePortalStats() {
  const { locale } = useI18n()
  const [stats, setStats] = useState<Stats | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (sessionStorage.getItem('live-stats-dismissed') === '1') {
      queueMicrotask(() => setDismissed(true))
      return
    }
    // Only show on desktop (hover:hover) — mobile 360px hasn't room
    if (!window.matchMedia('(min-width: 1024px)').matches) return

    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats')
        if (res.ok) {
          const data = await res.json()
          setStats({
            resolved: data.complaints?.resolved ?? 0,
            pending: data.complaints?.pending ?? 0,
            total: data.complaints?.total ?? 0,
            vapiFiled: data.vapiFiledCount ?? 0,
          })
        }
      } catch {
        // silent fail — widget is non-critical
      }
    }
    fetchStats()
    const id = setInterval(fetchStats, 60000)
    return () => clearInterval(id)
  }, [])

  const dismiss = () => {
    setDismissed(true)
    sessionStorage.setItem('live-stats-dismissed', '1')
  }

  if (dismissed || !stats) return null

  const items = [
    { icon: CheckCircle2, labelHi: 'समाधान', labelEn: 'Resolved', value: stats.resolved, color: 'text-emerald-500' },
    { icon: TrendingUp, labelHi: 'लंबित', labelEn: 'Pending', value: stats.pending, color: 'text-amber-500' },
    { icon: Users, labelHi: 'कुल शिकायत', labelEn: 'Total', value: stats.total, color: 'text-primary' },
    { icon: Store, labelHi: 'AI शिकायत', labelEn: 'AI-Filed', value: stats.vapiFiled, color: 'text-accent-text' },
  ]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: -40, y: 0 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        exit={{ opacity: 0, x: -40 }}
        transition={{ duration: dur.slow, ease: ease.expoOut }}
        className="fixed bottom-6 left-6 z-40 hidden lg:block"
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        <div className="glass-strong rounded-2xl border border-border/50 shadow-lg overflow-hidden">
          {/* Header row — always visible */}
          <div className="flex items-center gap-2.5 px-4 py-2.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground">
              {locale === 'hi' ? 'लाइव पोर्टल' : 'Live Portal'}
            </span>
            <button
              onClick={dismiss}
              className="ml-1 text-muted-foreground hover:text-foreground transition-colors rounded p-0.5"
              aria-label={locale === 'hi' ? 'बंद करें' : 'Dismiss'}
            >
              <X className="h-3 w-3" />
            </button>
          </div>

          {/* Expanded stats grid — reveals on hover */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: dur.base, ease: ease.expoOut }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-px bg-border/30 px-px pb-px">
                  {items.map((item, i) => {
                    const Icon = item.icon
                    return (
                      <div key={i} className="bg-background/80 px-3 py-2 flex items-center gap-2">
                        <Icon className={`h-3.5 w-3.5 ${item.color}`} />
                        <div className="flex flex-col leading-tight">
                          <span className="text-base font-bold tabular-nums text-foreground">
                            {item.value.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[9px] text-muted-foreground uppercase tracking-wide">
                            {locale === 'hi' ? item.labelHi : item.labelEn}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
