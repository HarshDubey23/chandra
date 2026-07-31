'use client'
import { useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollReveal } from './ScrollReveal'
import {
  Landmark,
  Users,
  FileText,
  CheckCircle2,
  Clock,
  Calendar,
  ChevronDown,
  ChevronRight,
  Gavel,
  TrendingUp,
  ScrollText,
  MapPin,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Resolution = {
  id: string
  topicHi: string
  topicEn: string
  status: 'passed' | 'pending' | 'rejected'
  votesFor: number
  votesAgainst: number
  votesNeutral: number
}

type Meeting = {
  id: string
  date: string
  dateLabel: string
  titleHi: string
  titleEn: string
  type: 'quarterly' | 'special' | 'annual'
  attendance: number
  totalMembers: number
  presidedBy: string
  location: string
  agendaHi: string[]
  agendaEn: string[]
  resolutions: Resolution[]
  keyDecisionsHi: string[]
  keyDecisionsEn: string[]
}

const MEETINGS: Meeting[] = [
  {
    id: 'gs-2026-q2',
    date: '2026-05-15',
    dateLabel: '15 मई 2026 / 15 May 2026',
    titleHi: 'वार्षिक ग्राम सभा — वित्तीय वर्ष 2025-26 समीक्षा',
    titleEn: 'Annual Gram Sabha — FY 2025-26 Review',
    type: 'annual',
    attendance: 187,
    totalMembers: 210,
    presidedBy: 'श्रीमती संगीता मिश्रा (प्रधान)',
    location: 'पंचायत भवन, ग्राम चंद्रा',
    agendaHi: [
      'वित्तीय वर्ष 2025-26 का बजट निरीक्षण एवं व्यय रिपोर्ट',
      'MGNREGA के तहत 4,820 व्यक्ति-दिन कार्य की समीक्षा',
      'PMAY-G लाभार्थी सूची अनुमोदन (9 नए आवंटन)',
      'जल जीवन मिशन — शेष 31 घरों में नल कनेक्शन योजना',
      'ग्राम सेवा केंद्र संचालन के लिए समिति गठन',
    ],
    agendaEn: [
      'Budget review & expenditure report for FY 2025-26',
      'MGNREGA 4,820 person-days work review',
      'PMAY-G beneficiary list approval (9 new allocations)',
      'Jal Jeevan Mission — plan for remaining 31 households',
      'Committee formation for Gram Seva Kendra operation',
    ],
    resolutions: [
      {
        id: 'r1',
        topicHi: 'PMAY-G नई सूची अनुमोदन',
        topicEn: 'PMAY-G new list approval',
        status: 'passed',
        votesFor: 178,
        votesAgainst: 5,
        votesNeutral: 4,
      },
      {
        id: 'r2',
        topicHi: 'MGNREGA श्रम दर वृद्धि सिफारिश',
        topicEn: 'MGNREGA wage rate hike recommendation',
        status: 'passed',
        votesFor: 165,
        votesAgainst: 12,
        votesNeutral: 10,
      },
      {
        id: 'r3',
        topicHi: 'ग्राम सेवा केंद्र के लिए भूमि आवंटन',
        topicEn: 'Land allocation for Gram Seva Kendra',
        status: 'pending',
        votesFor: 95,
        votesAgainst: 80,
        votesNeutral: 12,
      },
    ],
    keyDecisionsHi: [
      'PMAY-G के तहत 9 नए लाभार्थियों की सूची अनुमोदित — कुल 38 में से 24 घर पूर्ण',
      'MGNREGA मजदूरी सीधे बैंक खाते में — 8 FTO सफलतापूर्वक संसाधित',
      'ग्राम सेवा केंद्र के लिए समिति गठित — 5 सदस्य नामित',
      'अगली ग्राम सभा — 15 अगस्त 2026 (स्वतंत्रता दिवस)',
    ],
    keyDecisionsEn: [
      'PMAY-G: 9 new beneficiaries approved — 24 of 38 houses complete',
      'MGNREGA wages direct to bank — 8 FTOs processed successfully',
      'Committee formed for Gram Seva Kendra — 5 members nominated',
      'Next Gram Sabha — 15 August 2026 (Independence Day)',
    ],
  },
  {
    id: 'gs-2026-q1',
    date: '2026-02-15',
    dateLabel: '15 फरवरी 2026 / 15 Feb 2026',
    titleHi: 'त्रैमासिक ग्राम सभा — बजट अनुमोदन',
    titleEn: 'Quarterly Gram Sabha — Budget Approval',
    type: 'quarterly',
    attendance: 156,
    totalMembers: 210,
    presidedBy: 'श्रीमती संगीता मिश्रा (प्रधान)',
    location: 'पंचायत भवन, ग्राम चंद्रा',
    agendaHi: [
      'वित्तीय वर्ष 2026-27 का वार्षिक बजट प्रस्तुति एवं अनुमोदन',
      'GPDP (ग्राम पंचायत विकास योजना) 2026-27 का प्रारूप',
      'स्वच्छ भारत मिशन — फेज 2 लक्ष्य निर्धारण',
      'वार्ड 3 एवं 5 में सड़क मरम्मत स्वीकृति',
    ],
    agendaEn: [
      'Annual budget FY 2026-27 presentation & approval',
      'GPDP (Gram Panchayat Development Plan) 2026-27 draft',
      'Swachh Bharat Mission — Phase 2 target setting',
      'Road repair approval for Ward 3 & 5',
    ],
    resolutions: [
      {
        id: 'r1',
        topicHi: 'वार्षिक बजट ₹18.92 लाख अनुमोदन',
        topicEn: 'Annual budget ₹18.92 lakh approval',
        status: 'passed',
        votesFor: 152,
        votesAgainst: 2,
        votesNeutral: 2,
      },
      {
        id: 'r2',
        topicHi: 'वार्ड 3 एवं 5 सड़क मरम्मत — ₹2.5 लाख स्वीकृत',
        topicEn: 'Ward 3 & 5 road repair — ₹2.5 lakh approved',
        status: 'passed',
        votesFor: 148,
        votesAgainst: 6,
        votesNeutral: 2,
      },
    ],
    keyDecisionsHi: [
      'वार्षिक बजट ₹18,92,000 अनुमोदित — कृषि 25%, शिक्षा 20%, स्वास्थ्य 15%',
      'वार्ड 3 एवं 5 में 1.2 किमी सड़क मरम्मत स्वीकृत',
      'SBM फेज 2 — शेष 13 घरों में शौचालय निर्माण का लक्ष्य',
    ],
    keyDecisionsEn: [
      'Annual budget ₹18,92,000 approved — Agriculture 25%, Education 20%, Health 15%',
      '1.2 km road repair approved in Ward 3 & 5',
      'SBM Phase 2 — target to build toilets in remaining 13 households',
    ],
  },
  {
    id: 'gs-2025-special',
    date: '2025-11-20',
    dateLabel: '20 नवंबर 2025 / 20 Nov 2025',
    titleHi: 'विशेष ग्राम सभा — जल जीवन मिशन जागरूकता',
    titleEn: 'Special Gram Sabha — JJM Awareness',
    type: 'special',
    attendance: 142,
    totalMembers: 210,
    presidedBy: 'श्रीमती संगीता मिश्रा (प्रधान)',
    location: 'सामुदायिक भवन, ग्राम चंद्रा',
    agendaHi: [
      'जल जीवन मिशन — शेष 31 घरों में नल कनेक्शन अभियान',
      'जल गुणवत्ता परीक्षण एवं स्रोत संरक्षण',
      'ओवरहेड टैंक रखरखाव समिति गठन',
    ],
    agendaEn: [
      'Jal Jeevan Mission — campaign for remaining 31 tap connections',
      'Water quality testing & source protection',
      'Overhead tank maintenance committee formation',
    ],
    resolutions: [
      {
        id: 'r1',
        topicHi: 'जल स्रोत संरक्षण समिति गठन',
        topicEn: 'Water source protection committee formation',
        status: 'passed',
        votesFor: 140,
        votesAgainst: 0,
        votesNeutral: 2,
      },
    ],
    keyDecisionsHi: [
      '5 सदस्यीय जल स्रोत संरक्षण समिति गठित',
      '31 शेष घरों के लिए दरवाज़ा-दरवाज़ा जागरूकता अभियान स्वीकृत',
      'मासिक जल गुणवत्ता परीक्षण अनिवार्य — ASHA नोडल',
    ],
    keyDecisionsEn: [
      '5-member water source protection committee formed',
      'Door-to-door awareness campaign approved for 31 remaining households',
      'Monthly water quality testing mandatory — ASHA as nodal',
    ],
  },
]

const TYPE_LABELS = {
  quarterly: { hi: 'त्रैमासिक', en: 'Quarterly', color: 'bg-blue-500/15 text-blue-700 dark:text-blue-300' },
  special: { hi: 'विशेष', en: 'Special', color: 'bg-amber-500/15 text-amber-700 dark:text-amber-300' },
  annual: { hi: 'वार्षिक', en: 'Annual', color: 'bg-primary/15 text-primary' },
}

const STATUS_LABELS = {
  passed: { hi: 'पारित', en: 'Passed', icon: CheckCircle2, color: 'text-green-600' },
  pending: { hi: 'लंबित', en: 'Pending', icon: Clock, color: 'text-amber-600' },
  rejected: { hi: 'अस्वीकृत', en: 'Rejected', icon: Gavel, color: 'text-red-600' },
}

export function GramSabha() {
  const { locale } = useI18n()
  const [expanded, setExpanded] = useState<string>(MEETINGS[0].id)
  const hi = locale === 'hi'

  return (
    <section id="gram-sabha" className="section-premium py-16 md:py-20 border-b border-border/40">
      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div className="text-center mb-10">
          <Badge variant="outline" className="section-header-badge mb-3 gap-1.5">
            <Landmark className="h-3.5 w-3.5" />
            {hi ? 'ग्राम सभा' : 'Gram Sabha'}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gradient-premium">
            {hi ? 'ग्राम सभा — कार्यवाही एवं प्रस्ताव' : 'Gram Sabha — Proceedings & Resolutions'}
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            {hi
              ? 'पारदर्शिता के लिए ग्राम सभा की बैठक कार्यवाही, उपस्थिति एवं पारित प्रस्तावों का विवरण।'
              : 'Gram Sabha meeting proceedings, attendance, and passed resolutions for transparency.'}
          </p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Calendar, value: '4+', labelHi: 'वार्षिक बैठकें', labelEn: 'Annual meetings' },
            { icon: Users, value: '210', labelHi: 'कुल सदस्य', labelEn: 'Total members' },
            { icon: CheckCircle2, value: '6', labelHi: 'पारित प्रस्ताव', labelEn: 'Resolutions passed' },
            { icon: TrendingUp, value: '89%', labelHi: 'औसत उपस्थिति', labelEn: 'Avg attendance' },
          ].map((s, i) => (
            <ScrollReveal key={i} delay={i * 70}>
              <div className="card-premium p-4 text-center hover-lift">
                <s.icon className="h-5 w-5 mx-auto mb-1 text-primary" />
                <div className="text-2xl font-bold font-mono text-primary">{s.value}</div>
                <div className="text-[11px] text-muted-foreground">{hi ? s.labelHi : s.labelEn}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Meeting cards (accordion) */}
        <div className="space-y-4 max-w-4xl mx-auto">
          {MEETINGS.map((meeting, i) => {
            const isExpanded = expanded === meeting.id
            const typeLabel = TYPE_LABELS[meeting.type]
            const attendancePct = Math.round((meeting.attendance / meeting.totalMembers) * 100)
            return (
              <ScrollReveal key={meeting.id} delay={i * 80}>
                <Card className={cn(
                  'card-premium overflow-hidden transition-all',
                  isExpanded ? 'ring-2 ring-primary/30 shadow-lg' : 'hover-lift',
                )}>
                  {/* Meeting header (clickable) */}
                  <button
                    onClick={() => setExpanded(isExpanded ? '' : meeting.id)}
                    className="w-full text-left p-5 flex items-start gap-4 hover:bg-muted/30 transition-colors"
                  >
                    {/* Date block */}
                    <div className="shrink-0 grid place-items-center w-14 h-14 rounded-lg bg-primary/10 border border-primary/20">
                      <Calendar className="h-5 w-5 text-primary mb-0.5" />
                      <span className="text-[9px] font-mono text-muted-foreground">
                        {meeting.date.slice(5, 7)}/{meeting.date.slice(8, 10)}
                      </span>
                    </div>
                    {/* Title + meta */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Badge className={cn('text-[10px]', typeLabel.color)} variant="secondary">
                          {hi ? typeLabel.hi : typeLabel.en}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {meeting.location}
                        </span>
                      </div>
                      <h3 className="font-semibold text-sm leading-tight">
                        {hi ? meeting.titleHi : meeting.titleEn}
                      </h3>
                      <div className="text-[11px] text-muted-foreground mt-1">
                        {meeting.dateLabel} • {meeting.presidedBy}
                      </div>
                    </div>
                    {/* Attendance ring */}
                    <div className="shrink-0 text-center">
                      <div className="relative w-12 h-12">
                        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted/30" />
                          <circle
                            cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3"
                            className="text-primary"
                            strokeDasharray={`${(attendancePct / 100) * 94.2} 94.2`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="absolute inset-0 grid place-items-center text-[10px] font-bold font-mono text-primary">
                          {attendancePct}%
                        </span>
                      </div>
                      <span className="text-[9px] text-muted-foreground">
                        {meeting.attendance}/{meeting.totalMembers}
                      </span>
                    </div>
                    {/* Chevron */}
                    <ChevronDown className={cn('h-5 w-5 text-muted-foreground shrink-0 transition-transform', isExpanded && 'rotate-180')} />
                  </button>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="px-5 pb-5 space-y-4 border-t border-border/60 pt-4">
                      {/* Agenda */}
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5">
                          <ScrollText className="h-3.5 w-3.5" />
                          {hi ? 'कार्यसूची / Agenda' : 'Agenda'}
                        </h4>
                        <ol className="space-y-1.5">
                          {(hi ? meeting.agendaHi : meeting.agendaEn).map((item, idx) => (
                            <li key={idx} className="text-xs flex items-start gap-2">
                              <span className="shrink-0 grid place-items-center w-4 h-4 rounded-full bg-primary/10 text-primary text-[9px] font-bold font-mono">
                                {idx + 1}
                              </span>
                              <span className="text-foreground/80">{item}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* Resolutions */}
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5">
                          <Gavel className="h-3.5 w-3.5" />
                          {hi ? 'प्रस्ताव / Resolutions' : 'Resolutions'}
                        </h4>
                        <div className="space-y-2">
                          {meeting.resolutions.map(r => {
                            const st = STATUS_LABELS[r.status]
                            const total = r.votesFor + r.votesAgainst + r.votesNeutral
                            return (
                              <div key={r.id} className="rounded-md border border-border/60 p-3 bg-muted/20">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <span className="text-xs font-medium flex-1">
                                    {hi ? r.topicHi : r.topicEn}
                                  </span>
                                  <Badge variant="outline" className={cn('text-[10px] gap-1 shrink-0', st.color)}>
                                    <st.icon className="h-3 w-3" />
                                    {hi ? st.hi : st.en}
                                  </Badge>
                                </div>
                                {/* Vote bar */}
                                <div className="flex h-2 rounded-full overflow-hidden bg-muted">
                                  <div className="bg-green-500" style={{ width: `${(r.votesFor / total) * 100}%` }} />
                                  <div className="bg-red-500" style={{ width: `${(r.votesAgainst / total) * 100}%` }} />
                                  <div className="bg-amber-400" style={{ width: `${(r.votesNeutral / total) * 100}%` }} />
                                </div>
                                <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                                  <span className="text-green-600">✓ {r.votesFor}</span>
                                  <span className="text-red-600">✗ {r.votesAgainst}</span>
                                  <span className="text-amber-600">○ {r.votesNeutral}</span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {/* Key decisions */}
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {hi ? 'मुख्य निर्णय / Key Decisions' : 'Key Decisions'}
                        </h4>
                        <ul className="space-y-1.5">
                          {(hi ? meeting.keyDecisionsHi : meeting.keyDecisionsEn).map((d, idx) => (
                            <li key={idx} className="text-xs flex items-start gap-2 text-foreground/80">
                              <ChevronRight className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                              <span>{d}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </Card>
              </ScrollReveal>
            )
          })}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          {hi
            ? 'ग्राम सभा एक महत्वपूर्ण लोकतांत्रिक संस्था है। सभी वयस्क ग्रामीण सदस्य भाग ले सकते हैं। अगली बैठक: 15 अगस्त 2026'
            : 'Gram Sabha is a key democratic institution. All adult rural members can participate. Next meeting: 15 August 2026'}
        </p>
      </div>
    </section>
  )
}
