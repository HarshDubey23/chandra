'use client'
import { useEffect, useState } from 'react'
import { Phone, Clock, MapPin, Headphones } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { PRADHAN, GPA, OFFICE_ADDRESS } from '@/data/panchayat'

const HI_MONTHS = [
  'जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
  'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर',
]
const HI_DAYS = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार']
const EN_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const EN_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function toHindiDigits(s: string): string {
  const map = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९']
  return s.replace(/[0-9]/g, d => map[+d])
}

/**
 * TopBar — premium slim utility strip above the main header.
 * Shows a live Hindi date/time clock, the panchayat location, and the
 * Pradhan's and GPA contact numbers. Classic Indian government-portal pattern.
 *
 * Hydration-safe: renders identical placeholder markup on server AND first
 * client render (empty spans), then swaps to the live clock after mount.
 */
export function TopBar() {
  const { locale } = useI18n()
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    // Update immediately (deferred to avoid setState-in-effect lint) then every second
    const id = setInterval(() => setNow(new Date()), 1000)
    // Fire the first update on next tick (avoids synchronous setState in effect body)
    const initial = setTimeout(() => setNow(new Date()), 0)
    return () => { clearInterval(id); clearTimeout(initial) }
  }, [])

  const hi = locale === 'hi'
  const day = now ? (hi ? HI_DAYS[now.getDay()] : EN_DAYS[now.getDay()]) : ''
  const month = now ? (hi ? HI_MONTHS[now.getMonth()] : EN_MONTHS[now.getMonth()]) : ''
  const dateNum = now ? (hi ? toHindiDigits(String(now.getDate())) : String(now.getDate())) : ''
  const year = now ? (hi ? toHindiDigits(String(now.getFullYear())) : String(now.getFullYear())) : ''
  const hh = now ? (hi ? toHindiDigits(String(now.getHours() % 12 || 12)) : String(now.getHours() % 12 || 12)) : ''
  const mm = now ? (hi ? toHindiDigits(String(now.getMinutes()).padStart(2, '0')) : String(now.getMinutes()).padStart(2, '0')) : ''
  const ss = now ? (hi ? toHindiDigits(String(now.getSeconds()).padStart(2, '0')) : String(now.getSeconds()).padStart(2, '0')) : ''
  const ampm = now ? (now.getHours() >= 12 ? (hi ? 'अपराह्न' : 'PM') : (hi ? 'पूर्वाह्न' : 'AM')) : ''

  const dateStr = now ? `${day}, ${dateNum} ${month} ${year}` : ''
  const timeStr = now ? `${hh}:${mm}:${ss} ${ampm}` : ''

  // Always render the SAME structure on server and client (hydration-safe).
  // Empty strings render as empty spans; after mount they fill with live data.
  return (
    <div className="hidden border-b border-border/30 lg:block relative overflow-hidden" style={{ background: 'linear-gradient(135deg, oklch(0.97 0.01 85) 0%, oklch(0.96 0.015 75) 50%, oklch(0.96 0.012 90) 100%)' }}>
      {/* Tricolor accent line at the very top */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary/40 via-white/60 to-green-600/40" />

      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'radial-gradient(circle, oklch(0.5 0.1 50) 0.5px, transparent 0.5px)', backgroundSize: '12px 12px' }} />

      <div className="container mx-auto flex h-9 items-center justify-between px-4 text-[11px] relative">
        {/* Left — live date & time */}
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
            <Clock className="h-3 w-3 text-primary/70" />
            <span suppressHydrationWarning>{dateStr}</span>
          </span>
          <span className="h-3 w-px bg-border/50" />
          <span className="topbar-clock flex items-center gap-1 font-mono font-semibold text-primary/80 tabular-nums" suppressHydrationWarning>
            {timeStr}
          </span>
        </div>

        {/* Center — location */}
        <div className="absolute left-1/2 -translate-x-1/2 hidden xl:flex items-center gap-1.5 text-muted-foreground">
          <MapPin className="h-3 w-3 text-primary/60" />
          <span className="font-medium tracking-wide">{hi ? OFFICE_ADDRESS.shortHi : OFFICE_ADDRESS.shortEn}</span>
        </div>

        {/* Right — Helpline numbers */}
        <div className="flex items-center gap-2.5">
          {/* Pradhan helpline */}
          <a
            href={PRADHAN.phoneHref}
            className="topbar-phone group flex items-center gap-1.5 rounded-full px-2.5 py-1 transition-all hover:bg-primary/8"
          >
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-primary/8 group-hover:bg-primary/12 transition-colors">
              <Headphones className="h-2.5 w-2.5 text-primary/80" />
              <span className="text-[10px] font-bold text-primary/80 uppercase tracking-wider">
                {hi ? 'प्रधान' : 'Pradhan'}
              </span>
            </div>
            <Phone className="h-2.5 w-2.5 text-primary/60 group-hover:text-primary transition-colors" />
            <span className="font-mono font-bold text-primary/80 text-[11px] tracking-wider group-hover:text-primary transition-colors">
              {PRADHAN.phoneFormatted}
            </span>
          </a>

          <span className="h-3 w-px bg-border/50" />

          {/* GPA helpline */}
          <a
            href={GPA.phoneHref}
            className="topbar-phone group flex items-center gap-1.5 rounded-full px-2.5 py-1 transition-all hover:bg-green-600/8"
          >
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-green-600/8 group-hover:bg-green-600/12 transition-colors">
              <Headphones className="h-2.5 w-2.5 text-green-600/80" />
              <span className="text-[10px] font-bold text-green-600/80 uppercase tracking-wider">
                GPA
              </span>
            </div>
            <Phone className="h-2.5 w-2.5 text-green-600/60 group-hover:text-green-600 transition-colors" />
            <span className="font-mono font-bold text-green-600/80 text-[11px] tracking-wider group-hover:text-green-600 transition-colors">
              {GPA.phoneFormatted}
            </span>
          </a>
        </div>
      </div>
    </div>
  )
}
