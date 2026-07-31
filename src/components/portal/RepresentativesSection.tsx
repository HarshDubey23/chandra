'use client'
import { useI18n } from '@/lib/i18n'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Landmark,
  GraduationCap,
  Users,
  Mail,
  Phone,
  ExternalLink,
  ShieldCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowUpCircle,
  Award,
  MapPin,
} from 'lucide-react'
import { ScrollReveal } from './ScrollReveal'
import { PRADHAN, GPA } from '@/data/panchayat'

interface Bi { hi: string; en: string }

interface TermData {
  id: number
  period: string
  label: Bi
  pradhan: { name: Bi; initials: Bi; education: Bi; age?: number }
  wardMembers: number
  achievement?: Bi
  status: Bi
  statusType: 'completed' | 'delayed' | 'current'
  note?: Bi
  nextElection?: Bi
  isCurrent?: boolean
}

interface SecretaryData {
  name: Bi
  initials: Bi
  appointedBy: Bi
  email: string
  phone: string
  note: Bi
}

// ── Current leadership (real photos from WhatsApp) ──
// Pradhan photo: IMG-20260725-WA0003.jpg (Smt. Sangita Mishra, woman in orange sari)
// GPA photo: IMG-20260725-WA0091.jpg (Shri Balwant Chauhan, man at desk with Hindi posters)
const PRADHAN_PHONE = `+91 ${PRADHAN.phoneFormatted}`
const GPA_PHONE = `+91 ${GPA.phoneFormatted}`

const TERMS: TermData[] = [
  {
    id: 3, period: '2021-2026', label: { hi: 'वर्तमान कार्यकाल', en: 'Current Term' },
    pradhan: { name: { hi: PRADHAN.nameHi, en: PRADHAN.nameEn }, initials: { hi: PRADHAN.initialsHi, en: PRADHAN.initialsEn }, education: { hi: PRADHAN.educationHi, en: PRADHAN.educationEn } },
    wardMembers: 11,
    status: { hi: 'वर्तमान', en: 'Active' }, statusType: 'current',
    nextElection: { hi: 'मई 2026', en: 'May 2026' }, isCurrent: true,
  },
]

const SECRETARY: SecretaryData = {
  name: { hi: GPA.nameHi, en: GPA.nameEn },
  initials: { hi: GPA.initialsHi, en: GPA.initialsEn },
  appointedBy: { hi: GPA.appointedByHi, en: GPA.appointedByEn },
  email: GPA.email,
  phone: GPA.phone,
  note: { hi: GPA.noteHi, en: GPA.noteEn },
}

function TimelineCard({ children, delay }: { children: React.ReactNode; delay: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.55, ease: 'easeOut', delay }}
    >
      {children}
    </motion.div>
  )
}

function getStatusBadgeClasses(type: TermData['statusType']) {
  switch (type) {
    case 'current': return 'bg-[var(--saffron)]/10 text-[var(--saffron)] border-[var(--saffron)]/30'
    case 'delayed': return 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-700/40'
    case 'completed': return 'bg-muted text-muted-foreground border-border/60'
    default: return 'bg-muted text-muted-foreground border-border/60'
  }
}

function StatusIcon({ type }: { type: TermData['statusType'] }) {
  switch (type) {
    case 'current': return <ArrowUpCircle className="h-3.5 w-3.5" />
    case 'delayed': return <AlertTriangle className="h-3.5 w-3.5" />
    case 'completed': return <CheckCircle2 className="h-3.5 w-3.5" />
    default: return <Clock className="h-3.5 w-3.5" />
  }
}

export function RepresentativesSection() {
  const { locale } = useI18n()
  const isHi = locale === 'hi'

  return (
    <section id="representatives" className="section-premium-accent relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--saffron)]/5 via-transparent to-[var(--green)]/5 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--saffron)] via-white to-[var(--green)]" />

      <div className="container mx-auto px-4 relative">
        {/* ── Section Header ── */}
        <ScrollReveal delay={0.1}>
          <div className="section-header text-center mb-12">
            <div className="section-header-badge mx-auto">
              <Landmark className="h-3.5 w-3.5" />
              {isHi ? 'नेतृत्व एवं इतिहास' : 'Leadership & History'}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gradient-premium leading-tight">
              {isHi ? 'ग्राम पंचायत चंद्रा — नेतृत्व एवं पदाधिकारी' : 'Gram Panchayat Chandra — Leadership & Representatives'}
            </h2>
            <p className="text-sm text-muted-foreground mt-3 max-w-2xl mx-auto leading-relaxed">
              {isHi ? '2021-2026 वर्तमान कार्यकाल।' : '2021-2026 Current tenure.'}
            </p>
          </div>
        </ScrollReveal>

        {/* ── Current Leadership — Prominent Cards with Real Photos ── */}
        <ScrollReveal delay={0.15}>
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-[var(--saffron)]" />
            <h3 className="text-lg font-semibold">{isHi ? 'वर्तमान नेतृत्व' : 'Current Leadership'}</h3>
            <Badge className="bg-[var(--saffron)] text-white gap-1.5 ml-2 px-3 py-1 text-[11px]">
              <span className="h-1.5 w-1.5 rounded-full bg-white soft-pulse" />
              {isHi ? '2021–2026 वर्तमान' : '2021–2026 Active'}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-8 max-w-2xl">
            {isHi
              ? 'ग्राम पंचायत चंद्रा के निर्वाचित एवं प्रशासनिक पदाधिकारी। वास्तविक तस्वीरें।'
              : 'Elected and administrative officials of Gram Panchayat Chandra. Real photographs.'}
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
          {/* ── Pradhan Card — Premium ── */}
          <ScrollReveal delay={0.18}>
            <div className="card-premium-bordered overflow-hidden group">
              <div className="h-1.5 w-full bg-gradient-to-r from-[var(--saffron)] via-amber-500 to-[var(--green)]" />
              <CardContent className="p-6 text-center">
                <div className="relative mx-auto mb-5 w-36 h-36">
                  <Avatar className="w-36 h-36 rounded-2xl border-4 border-[var(--saffron)]/20 shadow-xl mx-auto">
                    <AvatarImage src="/whatsapp-optimized/IMG-20260725-WA0003.webp" alt={isHi ? 'श्रीमती संगीता मिश्रा' : 'Smt. Sangita Mishra'} className="object-cover" />
                    <AvatarFallback className="rounded-2xl bg-gradient-to-br from-[var(--saffron)]/15 to-[var(--saffron)]/5 text-[var(--saffron)] text-4xl avatar-initials">
                      {isHi ? 'समि' : 'SM'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute -bottom-2 -right-2 bg-[var(--saffron)] text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg uppercase tracking-wider">
                    {isHi ? 'प्रधान' : 'Pradhan'}
                  </span>
                </div>

                <Badge className="bg-[var(--saffron)] text-white mb-3 gap-1.5 px-3 py-1">
                  <Award className="h-3.5 w-3.5" /> {isHi ? 'ग्राम प्रधान' : 'Gram Pradhan'}
                </Badge>
                <h4 className="text-xl font-bold leading-tight text-gradient-premium">
                  {isHi ? 'श्रीमती संगीता मिश्रा' : 'Smt. Sangita Mishra'}
                </h4>
                <p className="text-xs text-muted-foreground mt-1 font-medium">Mrs. Sangita Mishra</p>
                <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mt-2">
                  <GraduationCap className="h-3.5 w-3.5 text-[var(--saffron)]" />
                  {isHi ? 'बी.ए. बी.टी.सी. (स्नातक)' : 'B.A. BTC (Graduate)'}
                </div>

                <div className="mt-4 pt-4 border-t border-border/40 space-y-2">
                  <a href={`tel:${PRADHAN_PHONE.replace(/\s/g, '')}`} className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-[var(--saffron)] hover:underline">
                    <Phone className="h-4 w-4" /> {PRADHAN_PHONE}
                  </a>
                  <p className="text-[11px] text-muted-foreground">{isHi ? 'पंचायत कार्यालय, ग्राम चंद्रा' : 'Panchayat Office, Gram Chandra'}</p>
                </div>

                <div className="mt-3 text-[10px] text-green-700 dark:text-green-400 bg-green-500/10 rounded-full px-3 py-1.5 inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-3 w-3" />
                  {isHi ? 'वास्तविक तस्वीर / Real photo' : 'Real photograph'}
                </div>
              </CardContent>
            </div>
          </ScrollReveal>

          {/* ── GPA Card — Premium ── */}
          <ScrollReveal delay={0.3}>
            <div className="card-premium-bordered-green overflow-hidden group">
              <div className="h-1.5 w-full bg-gradient-to-r from-[var(--green)] via-amber-500 to-[var(--saffron)]" />
              <CardContent className="p-6 text-center">
                <div className="relative mx-auto mb-5 w-36 h-36">
                  <Avatar className="w-36 h-36 rounded-2xl border-4 border-[var(--green)]/20 shadow-xl mx-auto">
                    <AvatarImage src="/whatsapp-optimized/IMG-20260725-WA0091.webp" alt={isHi ? 'श्री बलवंत चौहान' : 'Shri Balwant Chauhan'} className="object-cover" />
                    <AvatarFallback className="rounded-2xl bg-gradient-to-br from-[var(--green)]/15 to-[var(--green)]/5 text-[var(--green)] text-4xl avatar-initials">
                      {isHi ? 'बच' : 'BC'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute -bottom-2 -right-2 bg-[var(--green)] text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg uppercase tracking-wider">
                    {isHi ? 'जी.पी.ए.' : 'GPA'}
                  </span>
                </div>

                <Badge variant="outline" className="mb-3 gap-1.5 border-[var(--green)]/40 text-[var(--green)] px-3 py-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> {isHi ? 'ग्राम पंचायत अधिकारी' : 'Gram Panchayat Adhikari'}
                </Badge>
                <h4 className="text-xl font-bold leading-tight">
                  {isHi ? 'श्री बलवंत चौहान' : 'Shri Balwant Chauhan'}
                </h4>
                <p className="text-xs text-muted-foreground mt-1 font-medium">Mr. Balwant Chauhan</p>
                <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mt-2">
                  <Landmark className="h-3.5 w-3.5 text-[var(--green)]" />
                  {isHi ? 'ग्राम पंचायत अधिकारी (GPA)' : 'Gram Panchayat Adhikari (GPA)'}
                </div>

                <div className="mt-4 pt-4 border-t border-border/40 space-y-2">
                  <a href={`tel:${GPA_PHONE.replace(/\s/g, '')}`} className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-[var(--green)] hover:underline">
                    <Phone className="h-4 w-4" /> {GPA_PHONE}
                  </a>
                  <p className="text-[11px] text-muted-foreground">{isHi ? 'पंचायत कार्यालय, ग्राम चंद्रा' : 'Panchayat Office, Gram Chandra'}</p>
                </div>

                <div className="mt-3 text-[10px] text-green-700 dark:text-green-400 bg-green-500/10 rounded-full px-3 py-1.5 inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-3 w-3" />
                  {isHi ? 'वास्तविक तस्वीर / Real photo' : 'Real photograph'}
                </div>
              </CardContent>
            </div>
          </ScrollReveal>
        </div>

        {/* ── Timeline Visualization ── */}
        <ScrollReveal delay={0.2}>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-[var(--saffron)]" />
            <h3 className="text-lg font-semibold">{isHi ? 'वर्तमान कार्यकाल' : 'Current Tenure'}</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-6 max-w-2xl">
            {isHi ? '2021-2026 वर्तमान कार्यकाल विवरण।' : '2021-2026 Current tenure details.'}
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-5 mb-14 max-w-2xl">
          {TERMS.map((term, idx) => {
            const isCurrentTerm = term.isCurrent
            return (
              <TimelineCard key={term.id} delay={0.1 + idx * 0.05}>
                <div className="card-premium-bordered overflow-hidden">
                  <div className="h-1 w-full bg-gradient-to-r from-[var(--saffron)] via-amber-500 to-[var(--green)]" />
                  <CardHeader className="pb-2 pt-5 px-6">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-[var(--saffron)]/10 text-[var(--saffron)] border border-[var(--saffron)]/20">
                        {term.period}
                      </span>
                      <Badge variant="outline" className={`text-[10px] gap-1 ${getStatusBadgeClasses(term.statusType)}`}>
                        <StatusIcon type={term.statusType} />
                        {isHi ? term.status.hi : term.status.en}
                      </Badge>
                    </div>
                    <CardTitle className="text-base mt-2">{isHi ? term.label.hi : term.label.en}</CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 pb-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 shrink-0 ring-2 ring-[var(--saffron)]/20">
                        <AvatarFallback className="text-sm avatar-initials bg-[var(--saffron)]/10 text-[var(--saffron)]">
                          {isHi ? term.pradhan.initials.hi : term.pradhan.initials.en}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">{isHi ? 'प्रधान' : 'Pradhan'}</div>
                        <p className="text-sm font-semibold truncate">{isHi ? term.pradhan.name.hi : term.pradhan.name.en}</p>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <GraduationCap className="h-3 w-3" />
                            {isHi ? term.pradhan.education.hi : term.pradhan.education.en}
                          </span>
                          {term.pradhan.age && <span>{isHi ? `अयु ${term.pradhan.age}` : `Age ${term.pradhan.age}`}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="h-3 w-3 shrink-0" />
                      {isHi ? `${term.wardMembers} वार्ड सदस्य` : `${term.wardMembers} Ward Members`}
                    </div>
                    {term.achievement && (
                      <div className="pt-3 border-t border-border/40">
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1">{isHi ? 'मुख्य उपलब्धि' : 'Key Achievement'}</div>
                        <p className="text-xs text-foreground/80">{isHi ? term.achievement.hi : term.achievement.en}</p>
                      </div>
                    )}
                    {term.note && (
                      <div className="pt-3 border-t border-amber-300/40 dark:border-amber-700/30">
                        <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400">
                          <AlertTriangle className="h-3 w-3 shrink-0" />
                          {isHi ? term.note.hi : term.note.en}
                        </div>
                      </div>
                    )}
                    {isCurrentTerm && (
                      <div className="pt-3 border-t border-[var(--saffron)]/20">
                        <a href="#representatives" className="flex items-center gap-1.5 text-xs text-[var(--saffron)] font-medium hover:underline">
                          <ArrowUpCircle className="h-3 w-3 shrink-0" />
                          {isHi ? '↑ वर्तमान नेतृत्व देखें' : '↑ See Current Leadership above'}
                        </a>
                      </div>
                    )}
                  </CardContent>
                </div>
              </TimelineCard>
            )
          })}
        </div>

        {/* ── Panchayat Secretary (GPA) Section ── */}
        <ScrollReveal delay={0.25}>
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="h-4 w-4 text-[var(--green)]" />
            <h3 className="text-lg font-semibold">{isHi ? 'ग्राम पंचायत अधिकारी (GPA)' : 'Gram Panchayat Adhikari (GPA)'}</h3>
          </div>
          <div className="card-premium-bordered-green overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-[var(--green)] via-amber-500 to-[var(--saffron)]" />
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-5">
                <Avatar className="h-20 w-20 border-4 border-[var(--green)]/20 shadow-lg shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-[var(--green)]/15 to-[var(--green)]/5 text-[var(--green)] avatar-initials text-2xl">
                    {isHi ? SECRETARY.initials.hi : SECRETARY.initials.en}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 space-y-4">
                  <div>
                    <p className="text-xl font-bold text-gradient-premium">{isHi ? SECRETARY.name.hi : SECRETARY.name.en}</p>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                      <Landmark className="h-3.5 w-3.5 shrink-0 text-[var(--green)]" />
                      {isHi ? SECRETARY.appointedBy.hi : SECRETARY.appointedBy.en}
                    </div>
                  </div>
                  <div className="flex items-center gap-5 text-sm text-muted-foreground flex-wrap">
                    <a href={`tel:${GPA_PHONE.replace(/\s/g, '')}`} className="inline-flex items-center gap-1.5 hover:text-[var(--saffron)] transition-colors font-medium">
                      <Phone className="h-3.5 w-3.5 shrink-0 text-[var(--saffron)]" /> {GPA_PHONE}
                    </a>
                    <a href={`mailto:${SECRETARY.email}`} className="inline-flex items-center gap-1.5 hover:text-[var(--saffron)] transition-colors font-medium">
                      <Mail className="h-3.5 w-3.5 shrink-0 text-[var(--saffron)]" /> {SECRETARY.email}
                    </a>
                  </div>
                  <div className="pt-3 border-t border-border/40">
                    <p className="text-xs text-muted-foreground italic leading-relaxed">{isHi ? SECRETARY.note.hi : SECRETARY.note.en}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        </ScrollReveal>

        {/* ── Section Divider ── */}
        <ScrollReveal delay={0.3}>
          <div className="section-divider mt-10">
            <div className="section-divider-dot" />
            <div className="section-divider-dot" />
            <div className="section-divider-dot" />
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ExternalLink className="h-3 w-3 shrink-0" />
            <span>{isHi ? 'निर्वाचन आयोग, उत्तर प्रदेश — sec.up.nic.in' : 'Election Commission, Uttar Pradesh — sec.up.nic.in'}</span>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
