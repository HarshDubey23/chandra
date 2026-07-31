'use client'
import { useEffect, useState } from 'react'
import { Megaphone, X, Bell, ChevronRight } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

type Announcement = {
  id: string
  titleHi: string
  titleEn: string
  pinned?: boolean
}

/**
 * सूचना पट्टी / Announcement Ticker
 * A premium, horizontally-scrolling marquee of the latest panchayat
 * announcements, shown directly below the header. Classic Indian
 * government-portal pattern with modern polish.
 * Pauses on hover; dismissible per session.
 */
export function AnnouncementTicker() {
  const { locale } = useI18n()
  const [items, setItems] = useState<Announcement[]>([])
  const [dismissed, setDismissed] = useState(() =>
    typeof window !== 'undefined' && sessionStorage.getItem('ticker-dismissed') === '1'
  )
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    fetch('/api/announcements')
      .then(r => r.json())
      .then(d => {
        if (!alive) return
        const list: Announcement[] = d.announcements || d || []
        setItems(list.slice(0, 8))
      })
      .catch(() => {})
      .finally(() => alive && setLoading(false))
    return () => { alive = false }
  }, [])

  const dismiss = () => {
    sessionStorage.setItem('ticker-dismissed', '1')
    setDismissed(true)
  }

  if (dismissed || loading || items.length === 0) return null

  // Duplicate the list so the marquee loops seamlessly (translateX -50%)
  const loop = [...items, ...items]
  const label = locale === 'hi' ? 'सूचना' : 'NOTICE'

  const goToAnnouncements = () => {
    const el = document.getElementById('announcements')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Premium saffron gradient
  const saffronGradient: React.CSSProperties = {
    background:
      'linear-gradient(135deg, oklch(0.55 0.18 45) 0%, oklch(0.62 0.16 50) 40%, oklch(0.58 0.17 55) 100%)',
  }
  const saffronDeep = 'oklch(0.48 0.18 42)'

  return (
    <div
      role="region"
      aria-label={locale === 'hi' ? 'पंचायत सूचनाएँ' : 'Panchayat announcements'}
      className="relative z-40 flex items-stretch shadow-lg"
      style={saffronGradient}
    >
      {/* Left badge — "सूचना" with premium styling */}
      <button
        onClick={goToAnnouncements}
        className="group relative flex shrink-0 items-center gap-2.5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:brightness-110 sm:px-5"
        style={{ backgroundColor: saffronDeep }}
        aria-label={locale === 'hi' ? 'सभी सूचनाएँ देखें' : 'View all announcements'}
      >
        <div className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-white animate-pulse" />
        </div>
        <span className="hidden sm:inline tracking-widest">{label}</span>
        <ChevronRight className="h-3 w-3 opacity-50 group-hover:translate-x-0.5 transition-transform" />
      </button>

      {/* Scrolling track with premium styling */}
      <div className="ticker-wrap relative flex-1 overflow-hidden py-2.5">
        <div className="ticker-track text-sm font-medium">
          {loop.map((a, i) => (
            <span key={`${a.id}-${i}`} className="ticker-item">
              {a.pinned && (
                <span className="mr-1.5 inline-flex h-5 items-center rounded-md bg-white/20 px-1.5 text-[9px] font-bold uppercase tracking-wide backdrop-blur-sm">
                  ★ PIN
                </span>
              )}
              <button
                onClick={goToAnnouncements}
                className="hover:underline underline-offset-2 decoration-white/50 transition-colors"
              >
                {locale === 'hi' ? a.titleHi : a.titleEn}
              </button>
              <span className="ml-3 text-white/30" aria-hidden="true">◆</span>
            </span>
          ))}
        </div>
        {/* Fade edges for polish */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-12" style={{ background: 'linear-gradient(90deg, oklch(0.48 0.18 42), transparent)' }} />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-12" style={{ background: 'linear-gradient(270deg, oklch(0.48 0.18 42), transparent)' }} />
      </div>

      {/* Dismiss button with premium styling */}
      <button
        onClick={dismiss}
        className="group/dismiss shrink-0 px-3 text-white/70 transition-all duration-200 hover:bg-white/15 hover:text-white"
        aria-label={locale === 'hi' ? 'सूचना पट्टी बंद करें' : 'Dismiss ticker'}
      >
        <X className="h-4 w-4 group-hover/dismiss:rotate-90 transition-transform duration-200" />
      </button>
    </div>
  )
}
