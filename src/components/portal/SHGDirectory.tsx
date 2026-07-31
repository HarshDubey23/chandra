'use client'

import { useMemo, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  Users,
  Clock,
  Phone,
  CalendarDays,
  Sparkles,
  UserCircle2,
  Search,
  Filter,
  X,
  HeartHandshake,
} from 'lucide-react'
import { ScrollReveal } from './ScrollReveal'

/* ──────────────────────────────────────────────────────────────────────
   Self-Help Groups (SHG) Directory — Gram Panchayat Chandra
   A directory of SHGs, Mahila Mangal Dals, Yuva Clubs, farmers' groups,
   senior-citizen committees, and volunteer networks active in the village.
   Purely client-side (module-level dataset). Bilingual (hi/en), Hindi-first.
   ────────────────────────────────────────────────────────────────────── */

// ── Group type taxonomy ──
type GroupType = 'shg' | 'yuva' | 'farmers' | 'senior' | 'volunteer'
type GroupStatus = 'active' | 'recruiting'

interface SHGGroup {
  id: string
  type: GroupType
  nameHi: string
  nameEn: string
  presidentHi: string
  presidentEn: string
  members: number
  founded: number
  status: GroupStatus
  activities: string[]
  meetingHi: string
  meetingEn: string
  contact: string | null
  initials: string
}

// ── Per-type color accents (amber, sky, emerald, stone, rose) ──
const TYPE_BADGE_STYLES: Record<GroupType, string> = {
  shg:
    'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900/60',
  yuva:
    'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-900/60',
  farmers:
    'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900/60',
  senior:
    'bg-stone-200 text-stone-800 border-stone-300 dark:bg-stone-800/50 dark:text-stone-300 dark:border-stone-700/60',
  volunteer:
    'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900/60',
}

// ── Per-type avatar background gradients ──
const TYPE_AVATAR_STYLES: Record<GroupType, string> = {
  shg: 'from-amber-500 to-amber-600',
  yuva: 'from-sky-500 to-sky-600',
  farmers: 'from-emerald-500 to-emerald-600',
  senior: 'from-stone-500 to-stone-600',
  volunteer: 'from-rose-500 to-rose-600',
}

// ── Bilingual labels for group types ──
const TYPE_LABELS: Record<GroupType, { hi: string; en: string }> = {
  shg: { hi: 'महिला एसएचजी', en: 'SHG (Mahila)' },
  yuva: { hi: 'युवा क्लब', en: 'Yuva Club' },
  farmers: { hi: 'किसान समूह', en: 'Farmers Group' },
  senior: { hi: 'वरिष्ठ नागरिक', en: 'Senior Citizens' },
  volunteer: { hi: 'स्वयंसेवी', en: 'Volunteer' },
}

// ── 12 SHGs / community groups active in Gram Chandra ──
const SHG_GROUPS: SHGGroup[] = [
  {
    id: 'shg-01',
    type: 'shg',
    nameHi: 'चंद्रा महिला स्वयं सहायता समूह',
    nameEn: 'Chandra Mahila Swayam Sahayata Samooh',
    presidentHi: 'श्रीमती सुनीता देवी',
    presidentEn: 'Smt. Sunita Devi',
    members: 12,
    founded: 2018,
    status: 'active',
    activities: ['Microfinance', 'Pickle making', 'Tailoring'],
    meetingHi: 'हर शनिवार अपराह्न 4 बजे, पंचायत भवन',
    meetingEn: 'Every Saturday 4pm at Panchayat Bhawan',
    contact: null,
    initials: 'चम',
  },
  {
    id: 'shg-02',
    type: 'shg',
    nameHi: 'दुर्गा माता महिला मंडल',
    nameEn: 'Durga Mata Mahila Mandal',
    presidentHi: 'श्रीमती गीता देवी',
    presidentEn: 'Smt. Geeta Devi',
    members: 15,
    founded: 2015,
    status: 'recruiting',
    activities: ['SHG savings', 'Festivals', 'Community kitchen'],
    meetingHi: 'हर रविवार प्रातः 11 बजे, सामुदायिक भवन',
    meetingEn: 'Every Sunday 11am at Community Hall',
    contact: null,
    initials: 'दम',
  },
  {
    id: 'shg-03',
    type: 'yuva',
    nameHi: 'चंद्रा युवा क्लब',
    nameEn: 'Chandra Yuva Club',
    presidentHi: 'श्री अमित कुमार',
    presidentEn: 'Shri Amit Kumar',
    members: 28,
    founded: 2012,
    status: 'recruiting',
    activities: ['Sports', 'Cultural programs', 'Cleanliness drives', 'Blood donation'],
    meetingHi: 'हर रविवार प्रातः 8 बजे, खेल का मैदान',
    meetingEn: 'Every Sunday 8am at Playground',
    contact: null,
    initials: 'चय',
  },
  {
    id: 'shg-04',
    type: 'farmers',
    nameHi: 'किसान हित समिति',
    nameEn: 'Kisan Hit Samiti',
    presidentHi: 'श्री रामप्रसाद',
    presidentEn: 'Shri Ramprasad',
    members: 22,
    founded: 2010,
    status: 'active',
    activities: ['Cooperative farming', 'Seed bank', 'Equipment sharing', 'KVK liaison'],
    meetingHi: 'माह के पहले रविवार, पंचायत भवन',
    meetingEn: '1st Sunday of month at Panchayat Bhawan',
    contact: null,
    initials: 'किहि',
  },
  {
    id: 'shg-05',
    type: 'senior',
    nameHi: 'वृद्ध जन कल्याण समिति',
    nameEn: 'Vridh Jan Kalyan Samiti',
    presidentHi: 'श्री मोहन लाल',
    presidentEn: 'Shri Mohan Lal',
    members: 18,
    founded: 2019,
    status: 'active',
    activities: ['Pension assistance', 'Health checkups', 'Recitation'],
    meetingHi: 'हर बुधवार सायं 5 बजे, पंचायत भवन',
    meetingEn: 'Every Wednesday 5pm at Panchayat Bhawan',
    contact: null,
    initials: 'वृक',
  },
  {
    id: 'shg-06',
    type: 'volunteer',
    nameHi: 'रोज़गार सेवा दल',
    nameEn: 'Rozgar Seva Dal',
    presidentHi: 'श्री सुनील तिवारी',
    presidentEn: 'Shri Sunil Tiwari',
    members: 11,
    founded: 2020,
    status: 'recruiting',
    activities: ['Job listings', 'Skill training', 'MGNREGA support'],
    meetingHi: 'माह के द्वितीय एवं चतुर्थ शनिवार',
    meetingEn: '2nd & 4th Saturday of month',
    contact: null,
    initials: 'रसे',
  },
  {
    id: 'shg-07',
    type: 'volunteer',
    nameHi: 'चंद्रा स्वच्छता सेना',
    nameEn: 'Chandra Swachhata Sena',
    presidentHi: 'श्रीमती पुष्पा देवी',
    presidentEn: 'Smt. Pushpa Devi',
    members: 14,
    founded: 2014,
    status: 'active',
    activities: ['ODF monitoring', 'Cleanliness drives', 'Waste segregation'],
    meetingHi: 'हर रविवार प्रातः 6 बजे, मुख्य चौराह',
    meetingEn: 'Every Sunday 6am at Main Square',
    contact: null,
    initials: 'चसे',
  },
  {
    id: 'shg-08',
    type: 'shg',
    nameHi: 'महिला सशक्तिकरण समूह',
    nameEn: 'Mahila Shashaktikaran Samooh',
    presidentHi: 'श्रीमती सरोज देवी',
    presidentEn: 'Smt. Saroj Devi',
    members: 16,
    founded: 2017,
    status: 'recruiting',
    activities: ['Tailoring center', 'Computer literacy', 'SHG savings'],
    meetingHi: 'मंगलवार/गुरुवार अपराह्न 3 बजे, आंगनवाड़ी',
    meetingEn: 'Tue/Thu 3pm at Anganwadi',
    contact: null,
    initials: 'मस',
  },
  {
    id: 'shg-09',
    type: 'farmers',
    nameHi: 'चंद्रा कृषि उत्पादक संघ',
    nameEn: 'Chandra Krishi Utpadak Sangh',
    presidentHi: 'श्री देवेंद्र यादव',
    presidentEn: 'Shri Devendra Yadav',
    members: 35,
    founded: 2008,
    status: 'active',
    activities: ['Mandi price info', 'Organic farming', 'Cooperative sale'],
    meetingHi: 'माह के पहले रविवार',
    meetingEn: '1st Sunday of month',
    contact: null,
    initials: 'चकृ',
  },
  {
    id: 'shg-10',
    type: 'yuva',
    nameHi: 'युवा क्रिकेट क्लब',
    nameEn: 'Yuva Cricket Club',
    presidentHi: 'श्री राजेश मौर्य',
    presidentEn: 'Shri Rajesh Maurya',
    members: 22,
    founded: 2015,
    status: 'active',
    activities: ['Cricket tournaments', 'Coaching'],
    meetingHi: 'हर रविवार प्रातः 6 बजे, खेल का मैदान',
    meetingEn: 'Every Sunday 6am at Playground',
    contact: null,
    initials: 'यक्रि',
  },
  {
    id: 'shg-11',
    type: 'volunteer',
    nameHi: 'सक्षम विकास समिति',
    nameEn: 'Saksham Vikas Samiti',
    presidentHi: 'श्री अरुण कुमार',
    presidentEn: 'Shri Arun Kumar',
    members: 9,
    founded: 2021,
    status: 'recruiting',
    activities: ['Adult literacy', 'Free tuition for kids', 'Career counseling'],
    meetingHi: 'हर शनिवार सायं 5 बजे, विद्यालय',
    meetingEn: 'Every Saturday 5pm at School',
    contact: null,
    initials: 'सवि',
  },
  {
    id: 'shg-12',
    type: 'senior',
    nameHi: 'वृद्ध महिला मंडल',
    nameEn: 'Vridh Mahila Mandal',
    presidentHi: 'श्रीमती रामकली देवी',
    presidentEn: 'Smt. Ramkali Devi',
    members: 8,
    founded: 2020,
    status: 'active',
    activities: ['Old age pension help', 'Bhajan', 'Health talks'],
    meetingHi: 'हर शुक्रवार अपराह्न 4 बजे, सामुदायिक भवन',
    meetingEn: 'Every Friday 4pm at Community Hall',
    contact: null,
    initials: 'वम',
  },
]

// ── Filter chip definitions ──
type TypeFilter = 'all' | GroupType
type StatusFilter = 'all' | GroupStatus

const TYPE_FILTERS: { id: TypeFilter; hi: string; en: string }[] = [
  { id: 'all', hi: 'सभी', en: 'All' },
  { id: 'shg', hi: 'महिला एसएचजी', en: 'SHG (Mahila)' },
  { id: 'yuva', hi: 'युवा क्लब', en: 'Yuva Club' },
  { id: 'farmers', hi: 'किसान समूह', en: 'Farmers Group' },
  { id: 'senior', hi: 'वरिष्ठ नागरिक', en: 'Senior Citizens' },
  { id: 'volunteer', hi: 'स्वयंसेवी', en: 'Volunteer' },
]

const STATUS_FILTERS: { id: StatusFilter; hi: string; en: string }[] = [
  { id: 'all', hi: 'सभी', en: 'All' },
  { id: 'active', hi: 'सक्रिय', en: 'Active' },
  { id: 'recruiting', hi: 'सदस्य ले रहे हैं', en: 'Recruiting' },
]

// ── Helper: build a tel: href from a phone string ──
function telHref(phone: string | null): string {
  if (!phone) return '#'
  return `tel:+91${phone.replace(/[^0-9]/g, '')}`
}

export function SHGDirectory() {
  const { locale } = useI18n()
  const isHi = locale === 'hi'

  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  // ── Derived filtered list (client-side) ──
  const filteredGroups = useMemo(() => {
    return SHG_GROUPS.filter((g) => {
      if (typeFilter !== 'all' && g.type !== typeFilter) return false
      if (statusFilter !== 'all' && g.status !== statusFilter) return false
      return true
    })
  }, [typeFilter, statusFilter])

  // ── Stats bar ──
  const totalGroups = SHG_GROUPS.length
  const totalMembers = SHG_GROUPS.reduce((sum, g) => sum + g.members, 0)
  const activeGroups = SHG_GROUPS.filter((g) => g.status === 'active').length
  const recruitingGroups = SHG_GROUPS.filter((g) => g.status === 'recruiting').length

  const stats = [
    {
      id: 'total',
      hi: 'कुल समूह',
      en: 'Total Groups',
      value: totalGroups,
      icon: Users,
      tone: 'bg-primary/10 text-primary',
    },
    {
      id: 'members',
      hi: 'कुल सदस्य',
      en: 'Total Members',
      value: totalMembers,
      icon: UserCircle2,
      tone: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
    },
    {
      id: 'active',
      hi: 'सक्रिय समूह',
      en: 'Active Groups',
      value: activeGroups,
      icon: HeartHandshake,
      tone: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
    },
    {
      id: 'recruiting',
      hi: 'सदस्य ले रहे हैं',
      en: 'Recruiting',
      value: recruitingGroups,
      icon: Sparkles,
      tone: 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300',
    },
  ]

  const hasActiveFilters = typeFilter !== 'all' || statusFilter !== 'all'

  const resetFilters = () => {
    setTypeFilter('all')
    setStatusFilter('all')
  }

  return (
    <section id="shg" className="section-premium py-16 md:py-20 border-b border-border/40">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10">
          <Badge variant="outline" className="section-header-badge mb-3 gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {isHi ? 'स्वयं सहायता समूह' : 'Self-Help Groups'}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gradient-premium">
            {isHi
              ? 'ग्राम चंद्रा — स्वयं सहायता समूह एवं स्वयंसेवी नेटवर्क'
              : 'Gram Chandra — SHGs & Volunteer Network'}
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            {isHi
              ? 'इस निर्देशिका में गाँव के सक्रिय स्वयं सहायता समूह, महिला मंगल दल, युवा क्लब एवं स्वयंसेवी संगठनों की जानकारी है।'
              : 'This directory lists the active SHGs, Mahila Mangal Dals, Yuva Clubs and volunteer organisations in our village.'}
          </p>
        </div>

        {/* Stats bar */}
        <ScrollReveal delay={0.15}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((s) => {
              const Icon = s.icon
              return (
                <Card
                  key={s.id}
                  className="card-premium hover-lift overflow-hidden"
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-lg grid place-items-center shrink-0 ${s.tone}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-2xl font-bold tabular-nums leading-none">
                        {s.value}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-1 truncate">
                        {isHi ? s.hi : s.en}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </ScrollReveal>

        {/* Filter chips */}
        <ScrollReveal delay={0.2}>
          <div className="mb-8 space-y-3">
            {/* Type filter */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mr-1">
                <Filter className="h-3 w-3" />
                {isHi ? 'प्रकार' : 'Type'}
              </span>
              {TYPE_FILTERS.map((f) => {
                const active = typeFilter === f.id
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setTypeFilter(f.id)}
                    aria-pressed={active}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                      active
                        ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                        : 'border-border bg-background text-foreground hover:bg-secondary/80 hover:border-primary/40'
                    }`}
                  >
                    {isHi ? f.hi : f.en}
                  </button>
                )
              })}
            </div>

            {/* Status filter */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mr-1">
                <span className="h-2 w-2 rounded-full bg-primary/60" aria-hidden />
                {isHi ? 'स्थिति' : 'Status'}
              </span>
              {STATUS_FILTERS.map((f) => {
                const active = statusFilter === f.id
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setStatusFilter(f.id)}
                    aria-pressed={active}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                      active
                        ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                        : 'border-border bg-background text-foreground hover:bg-secondary/80 hover:border-primary/40'
                    }`}
                  >
                    {isHi ? f.hi : f.en}
                  </button>
                )
              })}

              {/* Result count badge + reset */}
              <div className="ml-auto flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="text-[10px] gap-1 whitespace-nowrap h-7 px-2.5 inline-flex items-center"
                >
                  {isHi
                    ? `${filteredGroups.length} में से ${totalGroups} दिखाई दे रहे हैं`
                    : `Showing ${filteredGroups.length} of ${totalGroups}`}
                </Badge>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    className="h-7 px-2 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                    {isHi ? 'रीसेट' : 'Reset'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* SHG grid or empty state */}
        {filteredGroups.length === 0 ? (
          <ScrollReveal delay={0.1}>
            <Card className="border-dashed">
              <CardContent className="p-10 text-center text-sm text-muted-foreground flex flex-col items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-muted/60 grid place-items-center">
                  <Search className="h-5 w-5 opacity-60" />
                </div>
                <div>
                  {isHi
                    ? 'इन फ़िल्टरों से कोई समूह नहीं मिला।'
                    : 'No groups match these filters.'}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                  className="mt-1 gap-1.5"
                >
                  <X className="h-3.5 w-3.5" />
                  {isHi ? 'फ़िल्टर रीसेट करें' : 'Reset filters'}
                </Button>
              </CardContent>
            </Card>
          </ScrollReveal>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group, idx) => (
              <SHGCard key={group.id} group={group} isHi={isHi} index={idx} />
            ))}
          </div>
        )}

        {/* Closing note */}
        <ScrollReveal delay={0.15}>
          <div className="mt-10 rounded-xl border border-primary/20 bg-primary/5 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0">
              <HeartHandshake className="h-5 w-5" />
            </div>
            <div className="text-xs leading-relaxed text-foreground/90 flex-1">
              {isHi
                ? 'नया समूह बनाना चाहते हैं या किसी समूह के साथ सहयोग करना चाहते हैं? ग्राम पंचायत कार्यालय में संपर्क करें।'
                : 'Want to start a new group or collaborate with an existing one? Reach out to the Gram Panchayat office.'}
            </div>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="shrink-0 gap-1.5 border-primary/30 hover:border-primary/50"
            >
              <a href="tel:+919651035021">
                <Phone className="h-3.5 w-3.5 text-primary" />
                <span className="font-mono text-xs">+91 96510 35021</span>
              </a>
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

// ── Single SHG card ──
function SHGCard({
  group,
  isHi,
  index,
}: {
  group: SHGGroup
  isHi: boolean
  index: number
}) {
  const typeLabel = TYPE_LABELS[group.type]
  const isRecruiting = group.status === 'recruiting'

  const handleJoin = () => {
    if (group.contact) {
      toast.success(
        isHi
          ? `संपर्क करें: ${group.contact}`
          : `Contact: ${group.contact}`,
        {
          description: isHi
            ? `${group.nameHi} — ${group.presidentHi}`
            : `${group.nameEn} — ${group.presidentEn}`,
        },
      )
    } else {
      toast.info(
        isHi
          ? 'संपर्क जानकारी शीघ्र उपलब्ध होगी'
          : 'Contact info will be available soon',
      )
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{
        duration: 0.4,
        ease: 'easeOut',
        delay: 0.04 * index,
      }}
    >
      <Card className="card-premium h-full hover-lift overflow-hidden flex flex-col">
        <CardContent className="p-4 flex flex-col gap-3 flex-1">
          {/* Top row: type badge + status badge */}
          <div className="flex items-center justify-between gap-2">
            <Badge
              variant="outline"
              className={`text-[10px] border ${TYPE_BADGE_STYLES[group.type]}`}
            >
              {isHi ? typeLabel.hi : typeLabel.en}
            </Badge>
            {isRecruiting ? (
              <Badge
                variant="outline"
                className="text-[10px] gap-1 border bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900/60"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                </span>
                {isHi ? 'सदस्य ले रहे हैं' : 'Recruiting'}
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="text-[10px] gap-1 border bg-green-100 text-green-800 border-green-200 dark:bg-green-950/50 dark:text-green-300 dark:border-green-900/60"
              >
                <span className="h-2 w-2 rounded-full bg-green-500" aria-hidden />
                {isHi ? 'सक्रिय' : 'Active'}
              </Badge>
            )}
          </div>

          {/* Avatar + name + president */}
          <div className="flex items-start gap-3">
            <div
              className={`h-12 w-12 rounded-full bg-gradient-to-br ${TYPE_AVATAR_STYLES[group.type]} text-white grid place-items-center font-bold text-sm shrink-0 shadow-sm`}
              aria-hidden
            >
              {group.initials}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold leading-tight">
                {isHi ? group.nameHi : group.nameEn}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">
                {isHi ? group.presidentHi : group.presidentEn}
              </p>
            </div>
          </div>

          {/* Quick stats: members + founded */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-border/60 bg-secondary/40 px-2.5 py-1.5">
              <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Users className="h-3 w-3" />
                {isHi ? 'सदस्य' : 'Members'}
              </div>
              <div className="text-sm font-semibold tabular-nums">
                {group.members}
              </div>
            </div>
            <div className="rounded-xl border border-border/60 bg-secondary/40 px-2.5 py-1.5">
              <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                {isHi ? 'स्थापना' : 'Founded'}
              </div>
              <div className="text-sm font-semibold tabular-nums">
                {group.founded}
              </div>
            </div>
          </div>

          {/* Activities chip list */}
          <div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">
              {isHi ? 'गतिविधियाँ' : 'Activities'}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {group.activities.map((a) => (
                <Badge
                  key={a}
                  variant="secondary"
                  className="text-[10px] font-normal bg-secondary/80"
                >
                  {a}
                </Badge>
              ))}
            </div>
          </div>

          {/* Meeting schedule */}
          <div className="flex items-start gap-2 text-[11px] text-foreground/90">
            <Clock className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary/80" />
            <span className="leading-tight">
              {isHi ? group.meetingHi : group.meetingEn}
            </span>
          </div>

          {/* Contact + join */}
          <div className="mt-auto pt-1 space-y-2">
            {group.contact ? (
              <a
                href={telHref(group.contact)}
                className="group/tel inline-flex items-center justify-between gap-2 w-full rounded-xl border border-border/70 bg-secondary/40 px-2.5 py-1.5 hover:bg-primary/5 hover:border-primary/30 transition-colors"
              >
                <span className="flex items-center gap-1.5 text-xs">
                  <Phone className="h-3 w-3 text-primary" />
                  <span className="font-mono tabular-nums">{group.contact}</span>
                </span>
                <span className="text-[10px] text-muted-foreground group-hover/tel:text-primary transition-colors">
                  {isHi ? 'कॉल करें' : 'Call'}
                </span>
              </a>
            ) : (
              <div className="inline-flex items-center gap-1.5 w-full rounded-xl border border-dashed border-border/70 bg-secondary/20 px-2.5 py-1.5 text-xs text-muted-foreground">
                <Phone className="h-3 w-3 opacity-40" />
                <span>{isHi ? 'संपर्क जानकारी शीघ्र' : 'Contact info coming soon'}</span>
              </div>
            )}
            {isRecruiting && (
              <Button
                size="sm"
                className="w-full gap-1.5 text-xs"
                onClick={handleJoin}
              >
                <Sparkles className="h-3.5 w-3.5" />
                {isHi ? 'सदस्यता लें' : 'Join Group'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
