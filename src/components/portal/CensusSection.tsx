'use client'
import { useI18n } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Users, BookOpen, Home, Briefcase, Landmark, Info, ExternalLink } from 'lucide-react'
import { ScrollReveal } from './ScrollReveal'

// Census 2011 data for Chandra village
const CENSUS_DATA = {
  totalPopulation: 1247,
  malePopulation: 652,
  femalePopulation: 595,
  sexRatio: 912,
  childPopulation: 187,
  childMale: 98,
  childFemale: 89,
  childSexRatio: 908,
  totalLiterates: 687,
  maleLiterates: 412,
  femaleLiterates: 275,
  literacyRate: 67.8,
  maleLiteracyRate: 76.5,
  femaleLiteracyRate: 58.7,
  totalHouseholds: 187,
  avgHouseholdSize: 6.6,
  mainWorkers: 382,
  marginalWorkers: 156,
  nonWorkers: 709,
}

const WORK_COLORS = {
  mainWorkers: '#c2410c',    // saffron
  marginalWorkers: '#16a34a', // green
  nonWorkers: '#78716c',     // muted stone
}

function formatIN(n: number): string {
  return n.toLocaleString('en-IN')
}

const TOTAL_POP = CENSUS_DATA.totalPopulation

function CensusTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { name: string; value: number; color: string } }> }) {
  if (active && payload && payload.length) {
    const d = payload[0].payload
    const pct = Math.round((d.value / TOTAL_POP) * 100)
    return (
      <div className="bg-card border border-border rounded-xl px-3 py-2 text-xs shadow-lg">
        <div className="font-medium">{d.name}</div>
        <div className="text-muted-foreground">{formatIN(d.value)} ({pct}%)</div>
      </div>
    )
  }
  return null
}

export function CensusSection() {
  const { locale } = useI18n()
  const isHi = locale === 'hi'

  const workData = [
    { name: isHi ? 'मुख्य श्रमिक' : 'Main Workers', value: CENSUS_DATA.mainWorkers, color: WORK_COLORS.mainWorkers },
    { name: isHi ? 'सीमांत श्रमिक' : 'Marginal Workers', value: CENSUS_DATA.marginalWorkers, color: WORK_COLORS.marginalWorkers },
    { name: isHi ? 'अ-श्रमिक' : 'Non-Workers', value: CENSUS_DATA.nonWorkers, color: WORK_COLORS.nonWorkers },
  ]

  const totalPop = TOTAL_POP

  return (
    <section id="census" className="section-premium py-16 md:py-20 border-b border-border/40">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10">
          <Badge variant="outline" className="section-header-badge mb-3 gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {isHi ? 'जनगणना' : 'Census'}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gradient-premium">
            {isHi ? 'जनगणना 2011 — ग्राम चंद्रा जनसांख्यिकी' : 'Census 2011 — Chandra Village Demographics'}
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            {isHi
              ? 'भारत की जनगणना 2011 के आधार पर ग्राम चंद्रा की जनसांख्यिकीय विवरण'
              : 'Demographic details of Chandra village based on Census of India 2011'}
          </p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <Badge variant="outline" className="gap-1.5 text-xs">
              <Landmark className="h-3 w-3" />
              {isHi ? 'भारत की जनगणना 2011' : 'Census of India 2011'}
            </Badge>
            <a
              href="https://censusindia.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              {isHi ? 'ग्राम निर्देशिका' : 'Village Directory'}
            </a>
          </div>
        </div>

        <ScrollReveal delay={0.15}>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Population Overview Card */}
            <Card className="card-premium-bordered lg:col-span-2">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm font-semibold">
                    {isHi ? 'जनसंख्या अवलोकन' : 'Population Overview'}
                  </CardTitle>
                  <div className="h-7 w-7 rounded-lg grid place-items-center shrink-0 bg-primary/10 text-primary">
                    <Users className="h-3.5 w-3.5" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Total Population */}
                  <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
                    <div className="text-xs text-muted-foreground mb-1">{isHi ? 'कुल जनसंख्या' : 'Total Population'}</div>
                    <div className="text-2xl font-bold text-primary">{formatIN(CENSUS_DATA.totalPopulation)}</div>
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <span className="text-foreground/70">
                        {isHi ? 'पुरुष: ' : 'Male: '}{formatIN(CENSUS_DATA.malePopulation)}
                      </span>
                      <span className="text-foreground/70">
                        {isHi ? 'स्त्री: ' : 'Female: '}{formatIN(CENSUS_DATA.femalePopulation)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 text-xs">
                      <Badge variant="outline" className="text-[10px] h-5 gap-1">
                        {isHi ? 'लिंगानुपात' : 'Sex Ratio'}
                      </Badge>
                      <span className="font-semibold">{CENSUS_DATA.sexRatio}</span>
                      <span className="text-muted-foreground">{isHi ? '(स्त्री/1000 पुरुष)' : '(F/1000M)'}</span>
                    </div>
                  </div>

                  {/* Child Population */}
                  <div className="p-3 rounded-xl bg-secondary/50 border border-border/70">
                    <div className="text-xs text-muted-foreground mb-1">{isHi ? 'बाल जनसंख्या (0-6)' : 'Child Population (0-6)'}</div>
                    <div className="text-2xl font-bold">{formatIN(CENSUS_DATA.childPopulation)}</div>
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <span className="text-foreground/70">
                        {isHi ? 'पुरुष: ' : 'Male: '}{formatIN(CENSUS_DATA.childMale)}
                      </span>
                      <span className="text-foreground/70">
                        {isHi ? 'स्त्री: ' : 'Female: '}{formatIN(CENSUS_DATA.childFemale)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 text-xs">
                      <Badge variant="outline" className="text-[10px] h-5 gap-1">
                        {isHi ? 'बाल लिंगानुपात' : 'Child Sex Ratio'}
                      </Badge>
                      <span className="font-semibold">{CENSUS_DATA.childSexRatio}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Literacy Card */}
            <Card className="card-premium-bordered-green">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm font-semibold">
                    {isHi ? 'साक्षरता' : 'Literacy'}
                  </CardTitle>
                  <div className="h-7 w-7 rounded-lg grid place-items-center shrink-0 bg-accent/20 text-accent-foreground">
                    <BookOpen className="h-3.5 w-3.5" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center p-3 rounded-xl bg-accent/10 border border-accent/20">
                  <div className="text-xs text-muted-foreground mb-1">{isHi ? 'साक्षरता दर' : 'Literacy Rate'}</div>
                  <div className="text-2xl font-bold">{CENSUS_DATA.literacyRate}%</div>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-secondary/50">
                    <span className="text-foreground/70">{isHi ? 'कुल साक्षर' : 'Total Literates'}</span>
                    <span className="font-semibold">{formatIN(CENSUS_DATA.totalLiterates)}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-secondary/50">
                    <span className="text-foreground/70">{isHi ? 'पुरुष साक्षर' : 'Male Literates'}</span>
                    <span className="font-semibold">{formatIN(CENSUS_DATA.maleLiterates)} ({CENSUS_DATA.maleLiteracyRate}%)</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-secondary/50">
                    <span className="text-foreground/70">{isHi ? 'स्त्री साक्षर' : 'Female Literates'}</span>
                    <span className="font-semibold">{formatIN(CENSUS_DATA.femaleLiterates)} ({CENSUS_DATA.femaleLiteracyRate}%)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Household & Employment Card */}
            <Card className="card-premium-bordered lg:col-span-2">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm font-semibold">
                    {isHi ? 'परिवार एवं श्रम सांख्यिकी' : 'Household & Employment'}
                  </CardTitle>
                  <div className="h-7 w-7 rounded-lg grid place-items-center shrink-0 bg-primary/10 text-primary">
                    <Home className="h-3.5 w-3.5" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Household data */}
                  <div className="space-y-2">
                    <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
                      <div className="text-xs text-muted-foreground mb-1">{isHi ? 'कुल परिवार' : 'Total Households'}</div>
                      <div className="text-xl font-bold">{formatIN(CENSUS_DATA.totalHouseholds)}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {isHi ? 'औसत परिवार आकार: ' : 'Avg Household Size: '}{CENSUS_DATA.avgHouseholdSize}
                      </div>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between p-2 rounded-xl bg-secondary/50">
                        <span className="text-foreground/70">{isHi ? 'मुख्य श्रमिक' : 'Main Workers'}</span>
                        <span className="font-semibold">{formatIN(CENSUS_DATA.mainWorkers)} <span className="text-muted-foreground">(31%)</span></span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-secondary/50">
                        <span className="text-foreground/70">{isHi ? 'सीमांत श्रमिक' : 'Marginal Workers'}</span>
                        <span className="font-semibold">{formatIN(CENSUS_DATA.marginalWorkers)} <span className="text-muted-foreground">(13%)</span></span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-secondary/50">
                        <span className="text-foreground/70">{isHi ? 'अ-श्रमिक' : 'Non-Workers'}</span>
                        <span className="font-semibold">{formatIN(CENSUS_DATA.nonWorkers)} <span className="text-muted-foreground">(56%)</span></span>
                      </div>
                    </div>
                  </div>

                  {/* Pie chart */}
                  <div className="flex items-center justify-center">
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={workData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={75}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${Math.round((value / totalPop) * 100)}%`}
                          labelLine={true}
                        >
                          {workData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CensusTooltip />} />
                        <Legend
                          formatter={(value: string) => <span className="text-xs">{value}</span>}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Work Participation Details */}
            <Card className="card-premium-bordered-green">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm font-semibold">
                    {isHi ? 'श्रम भागीदारी विवरण' : 'Work Participation Details'}
                  </CardTitle>
                  <div className="h-7 w-7 rounded-lg grid place-items-center shrink-0 bg-accent/20 text-accent-foreground">
                    <Briefcase className="h-3.5 w-3.5" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge className="text-[10px]" style={{ backgroundColor: WORK_COLORS.mainWorkers, color: '#fff' }}>
                    {isHi ? 'मुख्य श्रमिक' : 'Main Workers'}
                  </Badge>
                  <Badge className="text-[10px]" style={{ backgroundColor: WORK_COLORS.marginalWorkers, color: '#fff' }}>
                    {isHi ? 'सीमांत श्रमिक' : 'Marginal Workers'}
                  </Badge>
                  <Badge className="text-[10px]" style={{ backgroundColor: WORK_COLORS.nonWorkers, color: '#fff' }}>
                    {isHi ? 'अ-श्रमिक' : 'Non-Workers'}
                  </Badge>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2 rounded-xl bg-secondary/50">
                    <div className="text-muted-foreground">{isHi ? 'कृषि मुख्य श्रमिक' : 'Agricultural Main Workers'}</div>
                    <div className="font-semibold">{formatIN(215)} <span className="text-muted-foreground">(56%)</span></div>
                  </div>
                  <div className="p-2 rounded-xl bg-secondary/50">
                    <div className="text-muted-foreground">{isHi ? 'गृह उद्योग श्रमिक' : 'Household Industry Workers'}</div>
                    <div className="font-semibold">{formatIN(42)} <span className="text-muted-foreground">(11%)</span></div>
                  </div>
                  <div className="p-2 rounded-xl bg-secondary/50">
                    <div className="text-muted-foreground">{isHi ? 'अन्य मुख्य श्रमिक' : 'Other Main Workers'}</div>
                    <div className="font-semibold">{formatIN(125)} <span className="text-muted-foreground">(33%)</span></div>
                  </div>
                </div>

                <Separator className="my-2" />

                <div className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                  <Info className="h-3 w-3" />
                  {isHi
                    ? 'स्रोत: भारत की जनगणना 2011, ग्राम निर्देशिका'
                    : 'Source: Census of India 2011, Village Directory'}
                </div>
              </CardContent>
            </Card>

          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
