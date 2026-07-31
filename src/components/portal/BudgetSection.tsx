'use client'
import { useI18n } from '@/lib/i18n'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { IndianRupee, ExternalLink, ShieldCheck, Route, Droplets, GraduationCap, Home, Building2, TrendingUp, Wallet, PiggyBank } from 'lucide-react'
import { ScrollReveal } from './ScrollReveal'
import { SectionHeading } from './SectionHeading'

// ── Budget data constants ──
const TOTAL_BUDGET = 48.72 // in lakh
const TOTAL_EXPENDITURE = 32.45
const TOTAL_BALANCE = 16.27

const SECTOR_COLORS = {
  roads: '#c2410c',      // saffron
  water: '#16a34a',      // green
  education: '#d97706',  // amber
  housing: '#78716c',    // stone
  admin: '#a8a29e',      // muted
}

interface SectorData {
  key: string
  nameHi: string
  nameEn: string
  allocated: number // in lakh
  spent: number     // in lakh
  pct: number       // % of total budget
  color: string
  worksHi: string[]
  worksEn: string[]
  icon: typeof Route
}

const SECTORS: SectorData[] = [
  {
    key: 'roads',
    nameHi: 'सड़क एवं नाली',
    nameEn: 'Roads & Drainage',
    allocated: 18.5,
    spent: 12.8,
    pct: 38,
    color: SECTOR_COLORS.roads,
    worksHi: ['रामपुर टोला पक्का सड़क 450m', 'नाली निर्माण वार्ड 3-5', 'सड़क मरम्मत वार्ड 1-2'],
    worksEn: ['Rampur Tola paved road 450m', 'Drain construction Ward 3-5', 'Road repair Ward 1-2'],
    icon: Route,
  },
  {
    key: 'water',
    nameHi: 'जल आपूर्ति',
    nameEn: 'Water Supply',
    allocated: 9.75,
    spent: 7.20,
    pct: 20,
    color: SECTOR_COLORS.water,
    worksHi: ['हैंडपंप 2 नए स्थापित', 'जल जीवन मिशन पाइपलाइन', 'पानी पंप मरम्मत'],
    worksEn: ['2 new handpumps installed', 'Jal Jeevan Mission pipeline', 'Water pump repair'],
    icon: Droplets,
  },
  {
    key: 'education',
    nameHi: 'शिक्षा एवं आंगनवाड़ी',
    nameEn: 'Education & Anganwadi',
    allocated: 7.20,
    spent: 5.45,
    pct: 15,
    color: SECTOR_COLORS.education,
    worksHi: ['आंगनवाड़ी भवन निर्माण', 'प्राथमिक विद्यालय छत मरम्मत', 'शिक्षा सामग्री वितरण'],
    worksEn: ['Anganwadi building construction', 'Primary school roof repair', 'Education material distribution'],
    icon: GraduationCap,
  },
  {
    key: 'housing',
    nameHi: 'आवास (PMAY-G)',
    nameEn: 'Housing (PMAY-G)',
    allocated: 8.50,
    spent: 5.80,
    pct: 17,
    color: SECTOR_COLORS.housing,
    worksHi: ['PMAY-G 9 नए आवास निर्माण', 'किस्त-3 वितरण', 'आवास मरम्मत सहायता'],
    worksEn: ['PMAY-G 9 new houses built', 'Installment-3 distribution', 'Housing repair assistance'],
    icon: Home,
  },
  {
    key: 'admin',
    nameHi: 'प्रशासन एवं अन्य',
    nameEn: 'Administration & Others',
    allocated: 4.77,
    spent: 1.20,
    pct: 10,
    color: SECTOR_COLORS.admin,
    worksHi: ['पंचायत भवन मरम्मत', 'वेबसाइट रखरखाव', 'कार्यालय सामग्री'],
    worksEn: ['Panchayat building repair', 'Website maintenance', 'Office supplies'],
    icon: Building2,
  },
]

// ── Custom tooltip OUTSIDE component function (lint rule) ──
function BudgetTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { name: string; value: number; pct: number; color: string } }> }) {
  if (active && payload && payload.length) {
    const d = payload[0].payload
    return (
      <div className="bg-card border border-border rounded-lg px-4 py-3 text-xs shadow-xl backdrop-blur-sm">
        <div className="font-semibold" style={{ color: d.color }}>{d.name}</div>
        <div className="text-muted-foreground mt-0.5">
          ₹{d.value} लाख / ₹{d.value} lakh ({d.pct}%)
        </div>
      </div>
    )
  }
  return null
}

export function BudgetSection() {
  const { locale } = useI18n()
  const isHi = locale === 'hi'

  // Pie chart data derived from SECTORS
  const pieData = SECTORS.map(s => ({
    name: isHi ? s.nameHi : s.nameEn,
    value: s.allocated,
    pct: s.pct,
    color: s.color,
  }))

  return (
    <section id="budget" className="py-16 md:py-24 bg-gradient-to-b from-background via-secondary/10 to-background relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-600 via-white to-green-600 opacity-60" />
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-500/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">

        {/* ── Section Header — kinetic mask-up reveal ── */}
        <ScrollReveal delay={0.1}>
          <div className="mb-12">
            <SectionHeading
              hi={isHi ? 'ग्राम पंचायत चंद्रा — वार्षिक बजट 2025-26' : 'पंचायत बजट'}
              en="Gram Panchayat Chandra — Annual Budget 2025-26"
              eyebrowHi="पंचायत बजट"
              eyebrowEn="Panchayat Budget"
              icon={<IndianRupee className="h-3.5 w-3.5" />}
              align="center"
              showDivider
            />
            <p className="text-base text-muted-foreground mt-4 max-w-2xl mx-auto leading-relaxed text-center">
              {isHi
                ? 'ग्राम पंचायत विकास योजना (GPDP) एवं eGramSwaraj पोर्टल आधारित अनुमानित बजट। सत्यापित आंकड़े हेतु eGramSwaraj पोर्टल देखें।'
                : 'Estimated budget based on GPDP & eGramSwaraj portal. For verified figures, check the eGramSwaraj portal.'}
            </p>
          </div>
        </ScrollReveal>

        {/* ── Budget Overview Cards ── */}
        <ScrollReveal delay={0.2}>
          <div className="grid sm:grid-cols-3 gap-5 mb-12">
            {/* Total Budget */}
            <div className="rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/20 dark:to-orange-900/10 border border-orange-200/50 dark:border-orange-900/30 p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-orange-500/10 grid place-items-center text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">
                  <Wallet className="h-5 w-5" />
                </div>
                <div className="text-sm font-medium text-orange-700 dark:text-orange-300">
                  {isHi ? 'कुल बजट' : 'Total Budget'}
                </div>
              </div>
              <div className="text-3xl font-bold text-gradient-tricolor">
                ₹48.72 {isHi ? 'लाख' : 'lakh'}
              </div>
              <div className="text-[11px] text-muted-foreground mt-1.5">
                (₹4,872,000)
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Progress value={100} className="h-2 flex-1" />
                <span className="text-[11px] text-muted-foreground font-medium">100%</span>
              </div>
            </div>

            {/* Expenditure */}
            <div className="rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/10 border border-amber-200/50 dark:border-amber-900/30 p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 grid place-items-center text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div className="text-sm font-medium text-amber-700 dark:text-amber-300">
                  {isHi ? 'व्यय' : 'Expenditure'}
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground">
                ₹32.45 {isHi ? 'लाख' : 'lakh'}
              </div>
              <div className="text-[11px] text-muted-foreground mt-1.5">
                {isHi ? '67% उपयोगित' : '67% utilized'}
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Progress value={67} className="h-2 flex-1" />
                <span className="text-[11px] text-muted-foreground font-medium">67%</span>
              </div>
            </div>

            {/* Balance */}
            <div className="rounded-xl bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10 border border-green-200/50 dark:border-green-900/30 p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-green-500/10 grid place-items-center text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform">
                  <PiggyBank className="h-5 w-5" />
                </div>
                <div className="text-sm font-medium text-green-700 dark:text-green-300">
                  {isHi ? 'शेष' : 'Balance'}
                </div>
              </div>
              <div className="text-3xl font-bold text-green-700 dark:text-green-400">
                ₹16.27 {isHi ? 'लाख' : 'lakh'}
              </div>
              <div className="text-[11px] text-muted-foreground mt-1.5">
                {isHi ? '33% शेष' : '33% remaining'}
              </div>
              <div className="flex items-center gap-2 mt-4">
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary flex-1">
                  <div className="bg-green-500 h-full rounded-full transition-all" style={{ width: '33%' }} />
                </div>
                <span className="text-[11px] text-muted-foreground font-medium">33%</span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ── Sector Allocation Pie Chart ── */}
        <ScrollReveal delay={0.3}>
          <Card className="border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden mb-12">
            <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-green-500 to-amber-500" />
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-9 w-9 rounded-xl bg-primary/10 grid place-items-center">
                  <IndianRupee className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-base font-semibold">
                  {isHi ? 'बजट आवंटन — क्षेत्रवार' : 'Budget Allocation — Sector-wise'}
                </h3>
              </div>

              <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* Donut chart */}
                <div className="relative">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={110}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                        ))}
                      </Pie>
                      <Tooltip content={<BudgetTooltip />} />
                      <Legend
                        formatter={(value: string) => <span className="text-xs">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center label overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground">₹48.72</div>
                      <div className="text-[11px] text-muted-foreground">{isHi ? 'लाख' : 'lakh'}</div>
                    </div>
                  </div>
                </div>

                {/* Sector breakdown list */}
                <div className="space-y-3">
                  {SECTORS.map(s => {
                    const Icon = s.icon
                    return (
                      <div key={s.key} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40 hover:bg-secondary/70 border border-border/30 transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5 cursor-default">
                        <div className="h-9 w-9 rounded-lg grid place-items-center shrink-0 transition-colors" style={{ backgroundColor: s.color + '15', color: s.color }}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold truncate">
                            {isHi ? s.nameHi : s.nameEn}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            ₹{s.allocated} {isHi ? 'लाख' : 'lakh'} ({s.pct}%)
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[10px] shrink-0 border-0 shadow-sm" style={{ backgroundColor: s.color + '15', color: s.color }}>
                          {s.pct}%
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* ── Expenditure Progress Cards (Accordion) ── */}
        <ScrollReveal delay={0.4}>
          <Card className="border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden mb-12">
            <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-9 w-9 rounded-xl bg-primary/10 grid place-items-center">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-base font-semibold">
                  {isHi ? 'व्यय प्रगति — क्षेत्रवार' : 'Expenditure Progress — Sector-wise'}
                </h3>
              </div>

              <Accordion type="multiple" defaultValue={['roads']} className="w-full">
                {SECTORS.map(s => {
                  const Icon = s.icon
                  const spentPct = Math.round((s.spent / s.allocated) * 100)
                  return (
                    <AccordionItem key={s.key} value={s.key} className="border-border/40">
                      <AccordionTrigger className="hover:no-underline hover:bg-secondary/30 rounded-lg px-2 transition-colors">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="h-8 w-8 rounded-lg grid place-items-center shrink-0" style={{ backgroundColor: s.color + '15', color: s.color }}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium">
                              {isHi ? s.nameHi : s.nameEn}
                            </span>
                            <span className="text-[10px] text-muted-foreground ml-2">
                              ₹{s.allocated} {isHi ? 'लाख आवंटन' : 'lakh allocated'}
                            </span>
                          </div>
                          <Badge variant="outline" className="text-[10px] shrink-0 border-0 shadow-sm" style={{ backgroundColor: s.color + '15', color: s.color }}>
                            {spentPct}% {isHi ? 'व्यय' : 'spent'}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pl-10 pt-2">
                          {/* Allocated vs Spent */}
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div className="p-3 rounded-xl bg-secondary/40 border border-border/30">
                              <div className="text-muted-foreground text-[10px]">
                                {isHi ? 'आवंटन' : 'Allocated'}
                              </div>
                              <div className="font-semibold text-sm mt-1" style={{ color: s.color }}>
                                ₹{s.allocated} {isHi ? 'लाख' : 'lakh'}
                              </div>
                            </div>
                            <div className="p-3 rounded-xl bg-secondary/40 border border-border/30">
                              <div className="text-muted-foreground text-[10px]">
                                {isHi ? 'व्यय' : 'Spent'}
                              </div>
                              <div className="font-semibold text-sm mt-1">
                                ₹{s.spent} {isHi ? 'लाख' : 'lakh'}
                              </div>
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="flex items-center gap-2">
                            <Progress value={spentPct} className="h-2.5 flex-1" />
                            <span className="text-[10px] text-muted-foreground shrink-0 font-medium">
                              {spentPct}% {isHi ? 'व्यय' : 'spent'}
                            </span>
                          </div>

                          {/* Key works list */}
                          <div className="space-y-2">
                            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                              {isHi ? 'मुख्य कार्य' : 'Key Works'}
                            </div>
                            <ul className="space-y-1.5">
                              {s.worksHi.map((w, i) => (
                                <li key={i} className="text-xs flex items-start gap-2">
                                  <span className="h-1.5 w-1.5 rounded-full shrink-0 mt-1.5" style={{ backgroundColor: s.color }} />
                                  <span>
                                    {isHi ? w : s.worksEn[i]}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )
                })}
              </Accordion>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* ── Source Attribution ── */}
        <ScrollReveal delay={0.5}>
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
              <ExternalLink className="h-3 w-3" />
              {isHi
                ? 'स्रोत: eGramSwaraj पोर्टल (egramswaraj.gov.in) + GPDP 2025-26'
                : 'Source: eGramSwaraj portal + GPDP 2025-26'}
            </div>
            <a
              href="https://egramswaraj.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline inline-flex items-center gap-1 focus-ring"
            >
              egramswaraj.gov.in
              <ExternalLink className="h-3 w-3" />
            </a>
            <span className="tag-chip">
              <ShieldCheck className="h-3 w-3" />
              {isHi ? 'OSINT-सत्यापित' : 'OSINT-Verified'}
            </span>
          </div>
        </ScrollReveal>

        {/* ── Footer Note ── */}
        <ScrollReveal delay={0.6}>
          <div className="p-5 rounded-xl bg-secondary/30 border border-border/40 text-xs text-muted-foreground">
            {isHi
              ? 'बजट विवरण ग्राम सभा में पारित होता है। RTI अनुभाग में Section 4(1)(b) के तहत अधिक विवरण उपलब्ध है।'
              : 'Budget details are passed in Gram Sabha. More details available under RTI section Section 4(1)(b).'}
          </div>
        </ScrollReveal>

        <Separator className="mt-10 section-divider" />

      </div>
    </section>
  )
}
