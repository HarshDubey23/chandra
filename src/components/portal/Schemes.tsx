'use client'
import { useEffect, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { BookOpen, ExternalLink, Database, Lock, Calendar, Droplets, Home, Heart, GraduationCap, Users, HandCoins, FileText, Baby, ArrowRight, ShieldCheck, CheckCircle2, Hammer, IndianRupee, Construction, Clock, Briefcase } from 'lucide-react'
import { ScrollReveal } from './ScrollReveal'
import { SectionHeading } from './SectionHeading'

/* ──────────────────────────────────────────────────────────────────────
   Schemes — Gram Panchayat Chandra
   Merged: Scheme cards + OSINT data from SchemeDataCards
   ────────────────────────────────────────────────────────────────────── */

interface SchemeInfo {
  code: string
  nameHi: string
  nameEn: string
  portal: string
  url: string
  descHi: string
  descEn: string
  accent: string
  gradientBg: string
  icon: React.ElementType
  /** Whether this scheme has OSINT scraped data */
  hasOsintData?: boolean
}

const SCHEMES: SchemeInfo[] = [
  {
    code: 'mgnrega',
    nameHi: 'मनरेगा (MGNREGA)',
    nameEn: 'MGNREGA',
    portal: 'nrega',
    url: 'https://mnregaweb2.dord.gov.in/netnrega/IndexFrame.aspx?lflag=eng&District_Code=3145&district_name=PRAYAGRAJ&state_name=UTTAR+PRADESH&state_Code=31&block_name=SHANKARGARH&block_code=3145021&fin_year=2026-2027&check=1&Panchayat_name=chandra&Panchayat_Code=3145021064',
    descHi: 'महात्मा गांधी राष्ट्रीय ग्रामीण रोजगार गारंटी अधिनियम — प्रति परिवार वर्ष में 100 दिन काम की गारंटी। वर्तमान मजदूरी दर ₹257/दिन (उ.प्र.)।',
    descEn: 'Mahatma Gandhi NREGA — 100 days of guaranteed work per household per year. Current wage rate ₹257/day (UP).',
    accent: 'bg-[var(--saffron)]/10 text-[var(--saffron)]',
    gradientBg: 'from-[var(--saffron)]/5 to-transparent',
    icon: HandCoins,
    hasOsintData: true,
  },
  {
    code: 'pmayg',
    nameHi: 'पीएमआवास-ग्रामीण (PMAY-G)',
    nameEn: 'PMAY-G',
    portal: 'pmayg',
    url: 'https://report.pmayg.dord.gov.in/',
    descHi: 'प्रधानमंत्री आवास योजना — ग्रामीण। मैदानी क्षेत्र में ₹1.20 लाख की सहायता, 4 किस्तों में।',
    descEn: 'PM Awaas Yojana - Gramin. ₹1.20 lakh assistance in plain areas, in 4 installments.',
    accent: 'bg-[var(--green)]/10 text-[var(--green)]',
    gradientBg: 'from-[var(--green)]/5 to-transparent',
    icon: Home,
    hasOsintData: true,
  },
  {
    code: 'jjm',
    nameHi: 'जल जीवन मिशन (JJM)',
    nameEn: 'Jal Jeevan Mission',
    portal: 'jjm',
    url: 'https://jjm.up.gov.in/',
    descHi: 'हर घर जल जोड़ — ग्रामीण घरों तक नल से पीने योग्य पानी।',
    descEn: 'Har Ghar Jal — piped potable water to rural households.',
    accent: 'bg-[var(--saffron)]/10 text-[var(--saffron)]',
    gradientBg: 'from-[var(--saffron)]/5 to-[var(--green)]/3',
    icon: Droplets,
    hasOsintData: true,
  },
  {
    code: 'sbmg',
    nameHi: 'स्वच्छ भारत मिशन-ग्रामीण',
    nameEn: 'SBM-Gramin',
    portal: 'icds',
    url: 'https://swachhbharatmission.ddws.gov.in/',
    descHi: 'ग्रामीण क्षेत्र में खुले में शौच मुक्ति, शौचालय निर्माण, ठोस अपशिष्ट प्रबंधन।',
    descEn: 'Open-defecation free rural India, toilet construction, solid waste management.',
    accent: 'bg-[var(--green)]/10 text-[var(--green)]',
    gradientBg: 'from-[var(--green)]/5 to-[var(--saffron)]/3',
    icon: Heart,
  },
  {
    code: 'icds',
    nameHi: 'आंगनवाड़ी (ICDS)',
    nameEn: 'Anganwadi (ICDS)',
    portal: 'icds',
    url: 'https://icds-wcd.nic.in/',
    descHi: 'समेकित बाल विकास सेवा — 0-6 वर्ष बच्चों एवं गर्भवती/धाती महिलाओं के लिए पोषण।',
    descEn: 'Integrated Child Development Services — nutrition for 0-6 yr children and pregnant/lactating women.',
    accent: 'bg-[var(--saffron)]/10 text-[var(--saffron)]',
    gradientBg: 'from-[var(--saffron)]/5 to-transparent',
    icon: GraduationCap,
  },
  {
    code: 'gpdp',
    nameHi: 'ग्राम पंचायत विकास योजना',
    nameEn: 'GPDP',
    portal: 'egramswaraj',
    url: 'https://egramswaraj.gov.in/',
    descHi: 'GPDP योजना — वित्त आयोग अनुदान से ग्राम पंचायत की वार्षिक विकास योजना।',
    descEn: 'Gram Panchayat Development Plan — annual plan via Finance Commission grants.',
    accent: 'bg-[var(--green)]/10 text-[var(--green)]',
    gradientBg: 'from-[var(--green)]/5 to-transparent',
    icon: Users,
  },
  {
    code: 'birth-cert',
    nameHi: 'जन्म प्रमाण पत्र',
    nameEn: 'Birth Certificate',
    portal: 'edistrict',
    url: 'https://edistrict.up.gov.in/',
    descHi: 'जन्म प्रमाण पत्र — नवजात शिशु के जन्म का आधिकारिक दस्तावेज़। आवेदन ई-डिस्ट्रिक्ट पोर्टल द्वारा।',
    descEn: 'Birth Certificate — official document for newborn registration. Apply via e-District portal.',
    accent: 'bg-[var(--saffron)]/10 text-[var(--saffron)]',
    gradientBg: 'from-[var(--saffron)]/5 to-transparent',
    icon: FileText,
  },
  {
    code: 'death-cert',
    nameHi: 'मृत्यु प्रमाण पत्र',
    nameEn: 'Death Certificate',
    portal: 'edistrict',
    url: 'https://edistrict.up.gov.in/',
    descHi: 'मृत्यु प्रमाण पत्र — मृत्यु का आधिकारिक दस्तावेज़। ई-डिस्ट्रिक्ट पोर्टल पर आवेदन।',
    descEn: 'Death Certificate — official document for death registration. Apply on e-District portal.',
    accent: 'bg-[var(--green)]/10 text-[var(--green)]',
    gradientBg: 'from-[var(--green)]/5 to-transparent',
    icon: FileText,
  },
  {
    code: 'family-reg',
    nameHi: 'परिवार रजिस्टर की आनलाइन नकल',
    nameEn: 'Family Register Online Copy',
    portal: 'edistrict',
    url: 'https://edistrict.up.gov.in/',
    descHi: 'परिवार रजिस्टर की आनलाइन नकल — ग्राम पंचायत के परिवार रजिस्टर की प्रमाणित प्रति।',
    descEn: 'Family Register Online Copy — certified copy of Gram Panchayat family register.',
    accent: 'bg-[var(--saffron)]/10 text-[var(--saffron)]',
    gradientBg: 'from-[var(--saffron)]/5 to-[var(--green)]/3',
    icon: FileText,
  },
  {
    code: 'disability-pension',
    nameHi: 'दिव्यांग पेंशन',
    nameEn: 'Disability Pension',
    portal: 'sspy',
    url: 'https://sspy-up.gov.in/',
    descHi: 'दिव्यांग पेंशन — 40%+ दिव्यांगता वाले व्यक्तियों को ₹500/माह राज्य पेंशन।',
    descEn: 'Disability Pension — ₹500/month state pension for persons with 40%+ disability.',
    accent: 'bg-[var(--green)]/10 text-[var(--green)]',
    gradientBg: 'from-[var(--green)]/5 to-[var(--saffron)]/3',
    icon: Heart,
  },
  {
    code: 'anganwadi-standalone',
    nameHi: 'आंगन बाड़ी',
    nameEn: 'Anganwadi',
    portal: 'icds',
    url: 'https://icds-wcd.nic.in/',
    descHi: 'आंगन बाड़ी — 0-6 वर्ष बच्चों के पोषण, प्री-स्कूल शिक्षा एवं गर्भवती/धाती महिलाओं का स्वास्थ्य पोषण।',
    descEn: 'Anganwadi — nutrition for 0-6 yr children, pre-school education, and health for pregnant/lactating women.',
    accent: 'bg-[var(--saffron)]/10 text-[var(--saffron)]',
    gradientBg: 'from-[var(--saffron)]/5 to-transparent',
    icon: Baby,
  },
]

// ── OSINT data types (from SchemeDataCards) ──
interface ScrapedRecord {
  id: string
  portal: string
  recordType: string
  data: Record<string, unknown>
  sourceUrl: string
  retrievedAt: string
}

interface NregaProfile {
  panchayat_code: string
  total_jobcards: number
  active_jobcards: number
  total_workers: number
  persondays_generated: number
  total_expenditure_rs: number
}

interface NregaJobcard {
  sample_jobcards: Array<{
    jobcard_no: string
    household: string
    members: number
    status: string
  }>
  total_jobcards: number
  active: number
}

interface PmaygBeneficiary {
  total_beneficiaries: number
  completed: number
  under_construction: number
  not_started: number
  assistance_plain_area_rs: number
  installments: { first: number; second: number; third: number; fourth: number }
  sample: Array<{
    reg_no: string
    name: string
    category: string
    status: string
    installments: number
  }>
}

interface JjmWater {
  total_households: number
  tap_connections_provided: number
  functional: number
  non_functional: number
  coverage_pct: number
  last_updated: string
}

interface SchemesData {
  schemes: Record<string, { count: number; types: string[]; latestRetrievedAt: string | null; totalPiiRedactions: number }>
}

// ── Helper: display "—" when data is not available ──
const dash = '—'

export function Schemes() {
  const { locale } = useI18n()
  const hi = locale === 'hi'
  const [data, setData] = useState<SchemesData | null>(null)

  // OSINT data
  const [nregaRecords, setNregaRecords] = useState<ScrapedRecord[]>([])
  const [pmaygRecords, setPmaygRecords] = useState<ScrapedRecord[]>([])
  const [jjmRecords, setJjmRecords] = useState<ScrapedRecord[]>([])

  useEffect(() => {
    fetch('/api/schemes').then(r => r.json()).then(setData).catch(() => {})
  }, [])

  useEffect(() => {
    fetch('/api/scraped?portal=nrega').then(r => r.json()).then(d => setNregaRecords(d.records || [])).catch(() => {})
    fetch('/api/scraped?portal=pmayg').then(r => r.json()).then(d => setPmaygRecords(d.records || [])).catch(() => {})
    fetch('/api/scraped?portal=jjm').then(r => r.json()).then(d => setJjmRecords(d.records || [])).catch(() => {})
  }, [])

  // Extract OSINT data — NO fallback numbers
  const nregaProfile = nregaRecords.find(r => r.recordType === 'panchayat_profile')?.data as NregaProfile | undefined
  const nregaJobcards = nregaRecords.find(r => r.recordType === 'jobcard')?.data as NregaJobcard | undefined
  const nregaSourceUrl = nregaRecords.find(r => r.recordType === 'panchayat_profile')?.sourceUrl || 'https://mnregaweb2.dord.gov.in/'
  const nregaSampleJobcards = nregaJobcards?.sample_jobcards || []

  const pmaygData = pmaygRecords.find(r => r.recordType === 'beneficiary')?.data as PmaygBeneficiary | undefined
  const pmaygSourceUrl = pmaygRecords.find(r => r.recordType === 'beneficiary')?.sourceUrl || 'https://report.pmayg.dord.gov.in/'
  const pmaygSample = pmaygData?.sample || []

  const jjmData = jjmRecords.find(r => r.recordType === 'water_status')?.data as JjmWater | undefined
  const jjmSourceUrl = jjmRecords.find(r => r.recordType === 'water_status')?.sourceUrl || 'https://jjm.up.gov.in/'

  const hasNregaData = !!nregaProfile
  const hasPmaygData = !!pmaygData
  const hasJjmData = !!jjmData

  const formatRupees = (amount: number | undefined) => {
    if (amount === undefined || amount === null) return dash
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} ${hi ? 'लाख' : 'lakh'}`
    return `₹${amount.toLocaleString('en-IN')}`
  }

  const displayNum = (n: number | undefined) => {
    if (n === undefined || n === null) return dash
    return n.toLocaleString('en-IN')
  }

  return (
    <section id="schemes" className="section-premium-green relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--green)]/5 via-transparent to-[var(--saffron)]/5 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--saffron)] via-white to-[var(--green)]" />

      <div className="container mx-auto px-4 relative">
        {/* ── Section Header — kinetic mask-up reveal ── */}
        <ScrollReveal delay={0.1}>
          <div className="mb-12">
            <SectionHeading
              hi={hi ? 'योजनाएँ एवं लाभार्थी डेटा' : 'सरकारी योजनाएँ'}
              en="Schemes & Beneficiary Data"
              eyebrowHi="सरकारी योजनाएँ"
              eyebrowEn="Government Schemes"
              icon={<BookOpen className="h-3.5 w-3.5" />}
              align="center"
              showDivider
            />
            <p className="text-sm text-muted-foreground mt-4 max-w-2xl mx-auto leading-relaxed text-center">
              {hi
                ? 'OSINT-सत्यापित लाभार्थी डेटा — प्रत्येक रिकॉर्ड का स्रोत URL अनुमान्य है।'
                : 'OSINT-verified beneficiary data — every record traces to a source URL.'}
            </p>
            <div className="flex items-center justify-center gap-3 mt-4">
              <Badge variant="outline" className="gap-1.5 text-[11px]">
                <Database className="h-3 w-3" />
                {data ? Object.keys(data.schemes).length : '—'} {hi ? 'पोर्टल' : 'portals'}
              </Badge>
              <Badge variant="outline" className="gap-1.5 text-[11px]">
                <ShieldCheck className="h-3 w-3 text-green-600" />
                {hi ? 'OSINT सत्यापित' : 'OSINT Verified'}
              </Badge>
            </div>
          </div>
        </ScrollReveal>

        {/* ── Scheme Cards Grid ── */}
        <ScrollReveal delay={0.15}>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {SCHEMES.map((s, idx) => {
              const stats = data?.schemes[s.portal]
              const SchemeIcon = s.icon

              // Determine OSINT data for this scheme
              let osintSection: React.ReactNode = null
              if (s.code === 'mgnrega' && hasNregaData) {
                osintSection = (
                  <div className="mt-3 border-t border-border/40 pt-3 space-y-2">
                    <div className="flex items-center gap-1.5 mb-2">
                      <ShieldCheck className="h-3 w-3 text-primary" />
                      <span className="text-[10px] font-semibold text-primary">{hi ? 'OSINT डेटा' : 'OSINT Data'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="h-3 w-3 text-primary" />
                        <span className="text-muted-foreground">{hi ? 'कुल जॉब कार्ड' : 'Total Job Cards'}:</span>
                        <span className="font-semibold">{displayNum(nregaProfile?.total_jobcards)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3 w-3 text-accent-foreground" />
                        <span className="text-muted-foreground">{hi ? 'सक्रिय' : 'Active'}:</span>
                        <span className="font-semibold">{displayNum(nregaJobcards?.active || nregaProfile?.active_jobcards)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3 w-3 text-primary" />
                        <span className="text-muted-foreground">{hi ? 'कुल श्रमिक' : 'Workers'}:</span>
                        <span className="font-semibold">{displayNum(nregaProfile?.total_workers)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <IndianRupee className="h-3 w-3 text-primary" />
                        <span className="text-muted-foreground">{hi ? 'व्यय' : 'Expenditure'}:</span>
                        <span className="font-semibold">{formatRupees(nregaProfile?.total_expenditure_rs)}</span>
                      </div>
                    </div>
                    {nregaProfile?.persondays_generated && (
                      <div className="text-xs text-muted-foreground">
                        {hi ? 'व्यक्ति-दिवस' : 'Person-days'}: <span className="font-semibold">{displayNum(nregaProfile.persondays_generated)}</span>
                      </div>
                    )}
                    {nregaSampleJobcards.length > 0 && (
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="nrega-details" className="border-border/40">
                          <AccordionTrigger className="text-xs py-1.5">{hi ? 'जॉब कार्ड विवरण' : 'Job Card Details'}</AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-1.5 text-xs">
                              {nregaSampleJobcards.map((jc, i) => (
                                <div key={i} className="bg-secondary/50 rounded-md p-2 space-y-0.5">
                                  <div className="font-medium font-mono text-[10px]">{jc.jobcard_no}</div>
                                  <div className="text-muted-foreground">{hi ? 'परिवार' : 'HH'}: {jc.household} · {hi ? 'सदस्य' : 'Members'}: {jc.members}</div>
                                  <Badge variant="outline" className="text-[9px] py-0 px-1.5">
                                    {jc.status === 'active' ? (hi ? 'सक्रिय' : 'Active') : jc.status}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    )}
                    <Button asChild variant="ghost" size="sm" className="w-full gap-1.5 h-7 text-xs">
                      <a href={nregaSourceUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3" />
                        {hi ? 'स्रोत: mnregaweb2.dord.gov.in' : 'Source: mnregaweb2.dord.gov.in'}
                      </a>
                    </Button>
                  </div>
                )
              } else if (s.code === 'pmayg' && hasPmaygData) {
                const pmaygTotal = pmaygData?.total_beneficiaries
                const pmaygCompleted = pmaygData?.completed
                const pmaygProgress = pmaygTotal ? Math.round(((pmaygCompleted || 0) / pmaygTotal) * 100) : 0
                osintSection = (
                  <div className="mt-3 border-t border-border/40 pt-3 space-y-2">
                    <div className="flex items-center gap-1.5 mb-2">
                      <ShieldCheck className="h-3 w-3 text-primary" />
                      <span className="text-[10px] font-semibold text-primary">{hi ? 'OSINT डेटा' : 'OSINT Data'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3 w-3 text-accent-foreground" />
                        <span className="text-muted-foreground">{hi ? 'कुल लाभार्थी' : 'Beneficiaries'}:</span>
                        <span className="font-semibold">{displayNum(pmaygTotal)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3 w-3 text-accent-foreground" />
                        <span className="text-muted-foreground">{hi ? 'पूर्ण' : 'Completed'}:</span>
                        <span className="font-semibold">{displayNum(pmaygCompleted)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Construction className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">{hi ? 'निर्माणाधीन' : 'Under Const.'}:</span>
                        <span className="font-semibold">{displayNum(pmaygData?.under_construction)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">{hi ? 'अप्रारंभ' : 'Not Started'}:</span>
                        <span className="font-semibold">{displayNum(pmaygData?.not_started)}</span>
                      </div>
                    </div>
                    {pmaygData?.assistance_plain_area_rs && (
                      <div className="text-xs text-muted-foreground">
                        {hi ? 'सहायता (मैदानी)' : 'Assistance (Plain)'}: <span className="font-semibold">{formatRupees(pmaygData.assistance_plain_area_rs)}</span>
                      </div>
                    )}
                    {pmaygData?.installments && pmaygTotal && (
                      <div className="space-y-1 text-xs">
                        <div className="font-medium text-[11px]">{hi ? 'किस्त प्रगति' : 'Installment Progress'}</div>
                        {[
                          { label: hi ? '1st' : '1st', count: pmaygData.installments.first },
                          { label: hi ? '2nd' : '2nd', count: pmaygData.installments.second },
                          { label: hi ? '3rd' : '3rd', count: pmaygData.installments.third },
                          { label: hi ? '4th' : '4th', count: pmaygData.installments.fourth },
                        ].map((inst) => (
                          <div key={inst.label} className="flex items-center gap-2">
                            <span className="w-8 text-muted-foreground shrink-0">{inst.label}</span>
                            <Progress value={pmaygTotal > 0 ? Math.round((inst.count / pmaygTotal) * 100) : 0} className="h-2 flex-1" />
                            <span className="font-semibold w-8 text-right">{displayNum(inst.count)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {pmaygTotal && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium">{hi ? 'कुल प्रगति' : 'Completion'}</span>
                          <span className="font-semibold">{pmaygProgress}%</span>
                        </div>
                        <Progress value={pmaygProgress} className="h-2.5" />
                      </div>
                    )}
                    {pmaygSample.length > 0 && (
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="pmayg-details" className="border-border/40">
                          <AccordionTrigger className="text-xs py-1.5">{hi ? 'लाभार्थी विवरण' : 'Beneficiary Details'}</AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-1.5 text-xs">
                              {pmaygSample.map((b, i) => (
                                <div key={i} className="bg-secondary/50 rounded-md p-2 space-y-0.5">
                                  <div className="font-medium font-mono text-[10px]">{b.reg_no}</div>
                                  <div className="text-muted-foreground">{hi ? 'नाम' : 'Name'}: {b.name} · {hi ? 'वर्ग' : 'Cat'}: {b.category}</div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-[9px] py-0 px-1.5">
                                      {b.status === 'Completed' ? (hi ? 'पूर्ण' : 'Completed') : b.status}
                                    </Badge>
                                    <span className="text-muted-foreground">{hi ? 'किस्त' : 'Inst.'}: {b.installments}/4</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    )}
                    <Button asChild variant="ghost" size="sm" className="w-full gap-1.5 h-7 text-xs">
                      <a href={pmaygSourceUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3" />
                        {hi ? 'स्रोत: report.pmayg.dord.gov.in' : 'Source: report.pmayg.dord.gov.in'}
                      </a>
                    </Button>
                  </div>
                )
              } else if (s.code === 'jjm' && hasJjmData) {
                osintSection = (
                  <div className="mt-3 border-t border-border/40 pt-3 space-y-2">
                    <div className="flex items-center gap-1.5 mb-2">
                      <ShieldCheck className="h-3 w-3 text-primary" />
                      <span className="text-[10px] font-semibold text-primary">{hi ? 'OSINT डेटा' : 'OSINT Data'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3 w-3 text-primary" />
                        <span className="text-muted-foreground">{hi ? 'कुल घर' : 'Households'}:</span>
                        <span className="font-semibold">{displayNum(jjmData?.total_households)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Droplets className="h-3 w-3 text-primary" />
                        <span className="text-muted-foreground">{hi ? 'नल कनेक्शन' : 'Taps'}:</span>
                        <span className="font-semibold">{displayNum(jjmData?.tap_connections_provided)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3 w-3 text-accent-foreground" />
                        <span className="text-muted-foreground">{hi ? 'कार्यशील' : 'Functional'}:</span>
                        <span className="font-semibold">{displayNum(jjmData?.functional)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Construction className="h-3 w-3 text-destructive" />
                        <span className="text-muted-foreground">{hi ? 'अकार्यशील' : 'Non-func.'}:</span>
                        <span className="font-semibold text-destructive">{displayNum(jjmData?.non_functional)}</span>
                      </div>
                    </div>
                    {jjmData?.coverage_pct !== undefined && jjmData?.total_households && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium">{hi ? 'नल कवरेज' : 'Tap Coverage'}</span>
                          <span className="font-semibold">{jjmData.coverage_pct}%</span>
                        </div>
                        <Progress value={jjmData.coverage_pct} className="h-2.5" />
                        <div className="text-[10px] text-muted-foreground">
                          {hi
                            ? `${jjmData.tap_connections_provided}/${jjmData.total_households} घरों में नल कनेक्शन`
                            : `${jjmData.tap_connections_provided}/${jjmData.total_households} households with tap connections`}
                        </div>
                      </div>
                    )}
                    <Button asChild variant="ghost" size="sm" className="w-full gap-1.5 h-7 text-xs">
                      <a href={jjmSourceUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3" />
                        {hi ? 'स्रोत: jjm.up.gov.in' : 'Source: jjm.up.gov.in'}
                      </a>
                    </Button>
                  </div>
                )
              }

              return (
                <div key={s.code} className="card-premium overflow-hidden group">
                  <div className="h-1 w-full bg-gradient-to-r from-[var(--saffron)]/60 via-amber-400/60 to-[var(--green)]/60" />
                  <div className="p-5">
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold leading-tight group-hover:text-[var(--saffron)] transition-colors">
                          {hi ? s.nameHi : s.nameEn}
                        </h3>
                      </div>
                      <div className={`h-10 w-10 rounded-xl grid place-items-center shrink-0 shadow-sm ${s.accent} group-hover:scale-110 transition-transform`}>
                        <SchemeIcon className="h-5 w-5" />
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-foreground/70 leading-relaxed mb-4">
                      {hi ? s.descHi : s.descEn}
                    </p>

                    {/* Stats Badges */}
                    {stats && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        <Badge variant="outline" className="text-[10px] gap-1 py-0.5">
                          <Database className="h-2.5 w-2.5" />
                          {stats.count} {hi ? 'रिकॉर्ड' : 'records'}
                        </Badge>
                        {stats.totalPiiRedactions > 0 && (
                          <Badge variant="outline" className="text-[10px] gap-1 py-0.5 text-[var(--green)]">
                            <Lock className="h-2.5 w-2.5" />
                            {stats.totalPiiRedactions} {hi ? 'PII रेड' : 'PII redacted'}
                          </Badge>
                        )}
                        {stats.latestRetrievedAt && (
                          <Badge variant="outline" className="text-[10px] gap-1 py-0.5">
                            <Calendar className="h-2.5 w-2.5" />
                            {new Date(stats.latestRetrievedAt).toLocaleDateString(hi ? 'hi-IN' : 'en-IN')}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* OSINT Data section (from SchemeDataCards) */}
                    {osintSection}

                    {/* CTA Button (only if no OSINT section with its own button) */}
                    {!osintSection && (
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="w-full gap-2 h-9 text-xs font-medium text-[var(--saffron)] hover:bg-[var(--saffron)]/10 hover:text-[var(--saffron)] transition-colors group/btn"
                      >
                        <a href={s.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3.5 w-3.5" />
                          {hi ? 'स्रोत पोर्टल देखें' : 'View Source Portal'}
                          <ArrowRight className="h-3 w-3 ml-auto opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollReveal>

        {/* ── Section Divider ── */}
        <div className="section-divider mt-10">
          <div className="section-divider-dot" />
          <div className="section-divider-dot" />
          <div className="section-divider-dot" />
        </div>
      </div>
    </section>
  )
}
