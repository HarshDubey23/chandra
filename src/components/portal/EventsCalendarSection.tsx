'use client'
import { useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Calendar,
  CalendarDays,
  MapPin,
  Clock,
  Users,
  MessageSquare,
  ExternalLink,
  Flag,
  Syringe,
  HeartPulse,
  Home,
  Trash2,
  Building2,
  Megaphone,
  Camera,
  CheckCircle2,
} from 'lucide-react'
import { ScrollReveal } from './ScrollReveal'

/* ──────────────────────────────────────────────────────────────────────
   Events Calendar Section — Gram Panchayat Chandra
   Upcoming panchayat events: Gram Sabha, immunization camps, scheme drives,
   cultural programmes, sanitation campaigns — bilingual (hi/en).
   August 2025 visualization with mini month calendar + sorted event list.
   ────────────────────────────────────────────────────────────────────── */

type CategoryKey = 'governance' | 'health' | 'scheme' | 'cultural' | 'sanitation'

interface PanchayatEvent {
  id: string
  day: number // 1..31 (August 2025)
  weekdayHi: string
  weekdayEn: string
  titleHi: string
  titleEn: string
  timeHi: string
  timeEn: string
  locationHi: string
  locationEn: string
  organizerHi: string
  organizerEn: string
  category: CategoryKey
  tagHi: string
  tagEn: string
  icon: 'governance' | 'health' | 'scheme' | 'cultural' | 'sanitation'
  isReal?: boolean // true = verified from knowledge base photos
  imageSrc?: string // WhatsApp image filename for this event
}

const EVENTS: PanchayatEvent[] = [
  // ── REAL events from knowledge base (VLM OCR'd photos) — 28/07/2026 ──
  {
    id: 'ev-real-1',
    day: 28,
    weekdayHi: 'मंगल',
    weekdayEn: 'Tue',
    titleHi: 'पंच प्राण शपथ',
    titleEn: 'Panch Pran Shapath (Pledge)',
    timeHi: 'सुबह 9:00 बजे',
    timeEn: '9:00 AM',
    locationHi: 'प्राथमिक विद्यालय चंद्रा खास',
    locationEn: 'PS Chandra Khas',
    organizerHi: 'ग्राम पंचायत चंद्रा',
    organizerEn: 'Gram Panchayat Chandra',
    category: 'cultural',
    tagHi: 'सांस्कृतिक',
    tagEn: 'Cultural',
    icon: 'cultural',
    isReal: true,
    imageSrc: '/whatsapp-optimized/IMG-20260728-WA0033.webp',
  },
  {
    id: 'ev-real-2',
    day: 28,
    weekdayHi: 'मंगल',
    weekdayEn: 'Tue',
    titleHi: 'तिरंगा यात्रा, प्रभात फेरी',
    titleEn: 'Tiranga Yatra, Prabhat Pheri (Flag Rally)',
    timeHi: 'सुबह 7:00 बजे',
    timeEn: '7:00 AM',
    locationHi: 'प्राथमिक विद्यालय चंद्रा खास',
    locationEn: 'PS Chandra Khas',
    organizerHi: 'ग्राम पंचायत चंद्रा',
    organizerEn: 'Gram Panchayat Chandra',
    category: 'cultural',
    tagHi: 'सांस्कृतिक',
    tagEn: 'Cultural',
    icon: 'cultural',
    isReal: true,
    imageSrc: '/whatsapp-optimized/IMG-20260728-WA0034.webp',
  },
  {
    id: 'ev-real-3',
    day: 28,
    weekdayHi: 'मंगल',
    weekdayEn: 'Tue',
    titleHi: 'संचारी रोग जागरूकता कार्यक्रम',
    titleEn: 'Communicable Disease Awareness Program',
    timeHi: 'सुबह 10:00 बजे',
    timeEn: '10:00 AM',
    locationHi: 'चंद्रा खास',
    locationEn: 'Chandra Khas',
    organizerHi: 'ANM + आशा कार्यकर्ता',
    organizerEn: 'ANM + Asha Workers',
    category: 'health',
    tagHi: 'स्वास्थ्य',
    tagEn: 'Health',
    icon: 'health',
    isReal: true,
    imageSrc: '/whatsapp-optimized/IMG-20260728-WA0039.webp',
  },
  // ── Placeholder events removed — only real events from verified sources are shown ──
]

// Day-of-week header (Sun-Sat) — bilingual short labels
const DOW_HI = ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि']
const DOW_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// August 2025 — Aug 1 falls on a Friday (day index 5, Sun=0)
const AUG_2025_FIRST_DOW = 5 // Friday
const AUG_2025_DAYS = 31

// Pick "today" for the demo — Aug 11 (Mon), not an event date so both states are visible.
const TODAY_DAY = 11

/* Category → tailwind color token (NO indigo/blue per design rules) */
const CATEGORY_STYLE: Record<
  CategoryKey,
  { hi: string; en: string; dot: string; badge: string; icon: React.ReactNode }
> = {
  governance: {
    hi: 'शासन',
    en: 'Governance',
    dot: 'bg-orange-700',
    badge: 'bg-orange-700/10 text-orange-700 border-orange-700/30',
    icon: <Flag className="h-3 w-3" />,
  },
  health: {
    hi: 'स्वास्थ्य',
    en: 'Health',
    dot: 'bg-green-600',
    badge: 'bg-green-600/10 text-green-700 border-green-600/30',
    icon: <HeartPulse className="h-3 w-3" />,
  },
  scheme: {
    hi: 'योजना',
    en: 'Scheme',
    dot: 'bg-amber-600',
    badge: 'bg-amber-600/10 text-amber-700 border-amber-600/30',
    icon: <Building2 className="h-3 w-3" />,
  },
  cultural: {
    hi: 'सांस्कृतिक',
    en: 'Cultural',
    dot: 'bg-orange-700',
    badge: 'bg-orange-700/10 text-orange-700 border-orange-700/30',
    icon: <Megaphone className="h-3 w-3" />,
  },
  sanitation: {
    hi: 'स्वच्छता',
    en: 'Sanitation',
    dot: 'bg-green-600',
    badge: 'bg-green-600/10 text-green-700 border-green-600/30',
    icon: <Trash2 className="h-3 w-3" />,
  },
}

const EVENT_ICON: Record<PanchayatEvent['icon'], React.ReactNode> = {
  governance: <Flag className="h-3.5 w-3.5" />,
  health: <Syringe className="h-3.5 w-3.5" />,
  scheme: <Home className="h-3.5 w-3.5" />,
  cultural: <Flag className="h-3.5 w-3.5" />,
  sanitation: <Trash2 className="h-3.5 w-3.5" />,
}

// Real panchayat photographs — past event highlights (visual evidence)
const EVENT_PHOTOS = [
  {
    src: '/whatsapp-optimized/IMG-20260725-WA0080.webp',
    titleHi: 'ग्राम सभा — सामूहिक सभा',
    titleEn: 'Gram Sabha — Public Gathering',
    descHi: 'ग्राम चंद्रा में आयोजित सामूहिक ग्राम सभा का वास्तविक दृश्य।',
    descEn: 'Real scene of a public Gram Sabha gathering held in Gram Chandra.',
    tagHi: 'शासन',
    tagEn: 'Governance',
  },
  {
    src: '/whatsapp-optimized/IMG-20260725-WA0016.webp',
    titleHi: 'रात्रिकालीन बैठक',
    titleEn: 'Night Meeting',
    descHi: 'ग्रामीणों की रात्रिकालीन बैठक — योजना चर्चा एवं जनसमस्याओं का समाधान।',
    descEn: 'Villagers\' night meeting — scheme discussion and resolving public issues.',
    tagHi: 'सामुदायिक',
    tagEn: 'Community',
  },
]

export function EventsCalendarSection() {
  const { locale } = useI18n()
  const isHi = locale === 'hi'
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  // Build calendar cells: leading blanks + dates 1..DAYS + trailing blanks to fill last row.
  const cells: (number | null)[] = []
  for (let i = 0; i < AUG_2025_FIRST_DOW; i++) cells.push(null)
  for (let d = 1; d <= AUG_2025_DAYS; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  // Map of day → events for quick lookup
  const eventsByDay = new Map<number, PanchayatEvent>()
  EVENTS.forEach((e) => eventsByDay.set(e.day, e))

  // Sorted: real events first, then by day ascending
  const sortedEvents = [...EVENTS].sort((a, b) => {
    if (a.isReal && !b.isReal) return -1
    if (!a.isReal && b.isReal) return 1
    return a.day - b.day
  })

  // Selected event (from clicking a calendar date)
  const selectedEvent = selectedDay ? eventsByDay.get(selectedDay) ?? null : null

  // Quick stats
  const governanceCount = EVENTS.filter((e) => e.category === 'governance' || e.category === 'cultural').length
  const campCount = EVENTS.filter((e) => e.category === 'health' || e.category === 'sanitation').length

  // Google Calendar — generic link to August 2025 month view
  const googleCalUrl = 'https://calendar.google.com/calendar/u/0/r/month/2025/8'

  return (
    <section
      id="events"
      className="section-premium py-16 md:py-20 border-b border-border/40"
    >
      <div className="container mx-auto px-4">
        {/* ─────────── Header ─────────── */}
        <div className="text-center mb-10">
          <Badge variant="outline" className="section-header-badge mb-3 gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {isHi ? 'आगामी कार्यक्रम' : 'Upcoming Events'}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gradient-premium">
            {isHi
              ? 'ग्राम पंचायत चंद्रा — आगामी कार्यक्रम एवं शिविर'
              : 'Gram Panchayat Chandra — Upcoming Events & Camps'}
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            {isHi
              ? 'ग्राम सभा, टीकाकरण शिविर, योजना नामांकन एवं अन्य आगामी कार्यक्रम'
              : 'Gram Sabha, immunization camps, scheme enrollment and other upcoming events'}
          </p>
          <Badge className="bg-primary/10 text-primary border-primary/20 text-[11px] gap-1 mt-2">
            <CalendarDays className="h-3 w-3" />
            {isHi ? 'अगस्त 2025' : 'August 2025'}
          </Badge>
        </div>

        {/* ─────────── Real panchayat photographs — past event highlights ─────────── */}
        <ScrollReveal delay={0.12}>
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {EVENT_PHOTOS.map((p, idx) => (
              <Card
                key={idx}
                className="overflow-hidden card-premium hover-lift indian-border-top group"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-secondary">
                  <img
                    src={p.src}
                    alt={(isHi ? p.titleHi : p.titleEn) + ' — वास्तविक तस्वीर / Real photo'}
                    loading="lazy"
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/10 to-transparent" />
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="text-[10px] py-0 px-1.5 bg-background/90 backdrop-blur gap-1 shadow-sm">
                      <CalendarDays className="h-3 w-3 text-primary" />
                      {isHi ? 'वास्तविक कार्यक्रम तस्वीर' : 'Real event photo'}
                    </Badge>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2">
                    <h4 className="text-sm font-semibold text-foreground drop-shadow-sm leading-tight">
                      {isHi ? p.titleHi : p.titleEn}
                    </h4>
                  </div>
                </div>
                <CardContent className="p-4 space-y-1.5">
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {isHi ? p.descHi : p.descEn}
                  </p>
                  <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-border/40">
                    <span className="text-[10px] text-green-700 dark:text-green-400 font-medium inline-flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
                      वास्तविक तस्वीर / Real photo
                    </span>
                    <span className="text-[10px] text-muted-foreground inline-flex items-center gap-1">
                      <Camera className="h-2.5 w-2.5" />
                      {isHi ? 'पंचायत फोटो' : 'Panchayat photo'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollReveal>

        {/* ─────────── Calendar + Events List (12-col grid) ─────────── */}
        <ScrollReveal delay={0.1}>
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Mini Month Calendar — span 5 */}
            <div className="lg:col-span-5">
              <Card className="card-premium conic-ring hover-lift h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm font-semibold leading-tight">
                      {isHi ? 'माह दृश्य / Month View — August 2025' : 'Month View — August 2025'}
                    </CardTitle>
                    <div className="h-7 w-7 rounded-md grid place-items-center shrink-0 bg-primary/10 text-primary">
                      <CalendarDays className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Day-of-week header */}
                  <div className="cal-grid">
                    {DOW_EN.map((d, i) => (
                      <div key={d} className="cal-header">
                        {isHi ? DOW_HI[i] : d}
                      </div>
                    ))}
                  </div>

                  {/* Date cells */}
                  <div className="cal-grid">
                    {cells.map((day, idx) => {
                      if (day === null) {
                        return <div key={`b-${idx}`} className="cal-cell cal-empty" aria-hidden />
                      }
                      const ev = eventsByDay.get(day)
                      const isToday = day === TODAY_DAY
                      const isSelected = day === selectedDay
                      const stateClass = isSelected
                        ? 'cal-selected'
                        : isToday
                          ? 'cal-today pulse-glow'
                          : ev
                            ? 'cal-event'
                            : ''
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => ev && setSelectedDay(day)}
                          disabled={!ev}
                          aria-label={
                            ev
                              ? `${isHi ? 'कार्यक्रम' : 'Event'} — ${day} ${isHi ? 'अगस्त' : 'August'}: ${isHi ? ev.titleHi : ev.titleEn}`
                              : `${day} ${isHi ? 'अगस्त' : 'August'}`
                          }
                          className={`cal-cell focus-ring relative ${stateClass}`.trim()}
                          style={!ev ? { cursor: 'default' } : undefined}
                        >
                          {day}
                        </button>
                      )
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-2 border-t border-border/40 text-[10px]">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-primary" />
                      {isHi ? 'कार्यक्रम है' : 'Has event'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-green-600" />
                      {isHi ? 'आज' : 'Today'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-primary ring-2 ring-primary/30" />
                      {isHi ? 'चयनित' : 'Selected'}
                    </span>
                  </div>

                  {/* Selected event preview */}
                  {selectedEvent ? (
                    <div className="mt-2 p-3 rounded-md border border-primary/30 bg-primary/5 accent-border-left">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={`text-[10px] gap-1 ${CATEGORY_STYLE[selectedEvent.category].badge}`}>
                          {EVENT_ICON[selectedEvent.icon]}
                          {isHi ? CATEGORY_STYLE[selectedEvent.category].hi : CATEGORY_STYLE[selectedEvent.category].en}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {selectedEvent.day} {isHi ? 'अगस्त' : 'Aug'} · {isHi ? selectedEvent.weekdayHi : selectedEvent.weekdayEn}
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm">
                        {isHi ? selectedEvent.titleHi : selectedEvent.titleEn}
                      </h4>
                      <p className="text-[11px] text-foreground/70 mt-1 flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        {isHi ? selectedEvent.timeHi : selectedEvent.timeEn}
                      </p>
                      <p className="text-[11px] text-foreground/70 mt-0.5 flex items-center gap-1.5">
                        <MapPin className="h-3 w-3" />
                        {isHi ? selectedEvent.locationHi : selectedEvent.locationEn}
                      </p>
                    </div>
                  ) : (
                    <p className="text-[11px] text-muted-foreground mt-2 italic">
                      {isHi
                        ? 'किसी तिथि पर क्लिक करें (नारंगी चिह्नित) विवरण देखने के लिए।'
                        : 'Click any highlighted date to see event details.'}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Events List — span 7 */}
            <div className="lg:col-span-7">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  {isHi ? 'आगामी कार्यक्रम सूची' : 'Upcoming Events List'}
                </h3>
                <Badge variant="outline" className="text-[10px]">
                  {isHi ? `${sortedEvents.length} कार्यक्रम` : `${sortedEvents.length} events`}
                </Badge>
              </div>

              <div className="space-y-3 max-h-[640px] overflow-y-auto custom-scroll pr-1">
                {sortedEvents.map((ev) => {
                  const cat = CATEGORY_STYLE[ev.category]
                  return (
                    <Card
                      key={ev.id}
                      className="card-premium hover-lift overflow-hidden"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-stretch gap-3 sm:gap-4">
                          {/* Date block — number-badge styling */}
                          <div className="shrink-0 flex flex-col items-center justify-center">
                            <div className="number-badge flex flex-col leading-none !w-14 !h-14 !rounded-xl">
                              <span className="text-lg font-bold">{ev.day}</span>
                              <span className="text-[9px] uppercase tracking-wider opacity-90 mt-0.5">
                                {isHi ? 'अगस्त' : 'AUG'}
                              </span>
                            </div>
                            <span className="text-[10px] text-muted-foreground mt-1.5 font-medium">
                              {isHi ? ev.weekdayHi : ev.weekdayEn}
                            </span>
                          </div>

                          {/* Middle — title, time, location, organizer */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm leading-tight mb-1.5 flex items-center gap-1.5 flex-wrap">
                              {isHi ? ev.titleHi : ev.titleEn}
                              {ev.isReal && (
                                <Badge className="text-[9px] gap-0.5 py-0 px-1.5 bg-green-600/15 text-green-700 border-green-600/30 shrink-0">
                                  <CheckCircle2 className="h-2.5 w-2.5" />
                                  {isHi ? 'वास्तविक' : 'Real'}
                                </Badge>
                              )}
                            </h4>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-[11px] text-foreground/70">
                                <Clock className="h-3 w-3 text-primary/70 shrink-0" />
                                <span>{isHi ? ev.timeHi : ev.timeEn}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px] text-foreground/70">
                                <MapPin className="h-3 w-3 text-primary/70 shrink-0" />
                                <span>{isHi ? ev.locationHi : ev.locationEn}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px] text-foreground/70">
                                <Users className="h-3 w-3 text-primary/70 shrink-0" />
                                <span>
                                  <span className="text-muted-foreground">{isHi ? 'आयोजक: ' : 'Organizer: '}</span>
                                  {isHi ? ev.organizerHi : ev.organizerEn}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Right — category badge + tag chip */}
                          <div className="shrink-0 flex flex-col items-end gap-1.5 justify-start">
                            <Badge variant="outline" className={`text-[10px] gap-1 ${cat.badge}`}>
                              {cat.icon}
                              {isHi ? cat.hi : cat.en}
                            </Badge>
                            <span className="tag-chip">
                              {EVENT_ICON[ev.icon]}
                              {isHi ? ev.tagHi : ev.tagEn}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ─────────── Quick Stats Row ─────────── */}
        <ScrollReveal delay={0.15}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
            <div className="stat-card">
              <div className="h-10 w-10 rounded-lg grid place-items-center shrink-0 bg-primary/10 text-primary">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="stat-card-number">{EVENTS.length}</div>
                <div className="stat-card-label">
                  {isHi ? 'इस माह कार्यक्रम' : 'Events This Month'}
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="h-10 w-10 rounded-lg grid place-items-center shrink-0 bg-orange-700/10 text-orange-700">
                <Flag className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="stat-card-number">{governanceCount}</div>
                <div className="stat-card-label">
                  {isHi ? 'शासन कार्यक्रम' : 'Governance Events'}
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="h-10 w-10 rounded-lg grid place-items-center shrink-0 bg-green-600/10 text-green-700">
                <Syringe className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="stat-card-number">{campCount}</div>
                <div className="stat-card-label">
                  {isHi ? 'शिविर' : 'Camps'}
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ─────────── Add to Calendar CTA ─────────── */}
        <ScrollReveal delay={0.2}>
          <Card className="mt-10 card-premium hover-lift glow-saffron tricolor-frame overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="h-11 w-11 rounded-xl grid place-items-center shrink-0 bg-primary text-primary-foreground">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-base leading-tight">
                      {isHi ? 'अपने कैलेंडर में जोड़ें / सूचना प्राप्त करें' : 'Add to Your Calendar / Get Updates'}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {isHi
                        ? 'इन कार्यक्रमों को अपने Google कैलेंडर में जोड़ें या WhatsApp पर अनुस्मारक प्राप्त करें।'
                        : 'Add these events to your Google Calendar or receive reminders on WhatsApp.'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                  <Button asChild className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground glow-saffron">
                    <a href={googleCalUrl} target="_blank" rel="noopener noreferrer">
                      <Calendar className="h-4 w-4" />
                      <span>{isHi ? 'गूगल कैलेंडर' : 'Google Calendar'}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="gap-2 border-green-600/40 text-green-700 hover:bg-green-600/10 hover:text-green-700"
                  >
                    <a href="https://wa.me/919450000000" target="_blank" rel="noopener noreferrer">
                      <MessageSquare className="h-4 w-4" />
                      <span>{isHi ? 'WhatsApp सूचना प्राप्त करें' : 'Get WhatsApp Updates'}</span>
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* ─────────── Footer Note ─────────── */}
        <div className="mt-10">
          <div className="section-divider">
            <span className="section-divider-dot" />
            <span className="section-divider-dot" />
            <span className="section-divider-dot" />
          </div>
          <p className="text-center text-xs text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {isHi
              ? 'कार्यक्रम तिथियाँ बदली जा सकती हैं। नवीनतम जानकारी के लिए पंचायत कार्यालय से संपर्क करें।'
              : 'Event dates may change. Contact panchayat office for latest info.'}
          </p>
        </div>
      </div>
    </section>
  )
}
