'use client'
import { useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { ScrollReveal } from './ScrollReveal'
import { SectionHeading } from './SectionHeading'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Users, Home, Droplet, Store, Phone, MapPin, FileText,
  Heart, Accessibility, Baby, Wrench, Utensils, Image as ImageIcon,
  CheckCircle2, Clock, AlertCircle, ChevronDown, ChevronUp, Phone as PhoneIcon,
} from 'lucide-react'

type Tab = 'pensions' | 'housing' | 'ration' | 'handpumps' | 'offline-help' | 'school-team'

export function VillageRecords() {
  const { locale } = useI18n()
  const hi = locale === 'hi'
  const [tab, setTab] = useState<Tab>('pensions')

  const tabs: { key: Tab; labelHi: string; labelEn: string; icon: typeof Users }[] = [
    { key: 'pensions', labelHi: 'पेंशन', labelEn: 'Pensions', icon: Heart },
    { key: 'housing', labelHi: 'आवास', labelEn: 'Housing', icon: Home },
    { key: 'ration', labelHi: 'राशन कार्ड', labelEn: 'Ration Card', icon: FileText },
    { key: 'handpumps', labelHi: 'हैंडपंप', labelEn: 'Handpumps', icon: Droplet },
    { key: 'offline-help', labelHi: 'ऑफलाइन सहायता', labelEn: 'Offline Help', icon: Store },
    { key: 'school-team', labelHi: 'रसोई टीम', labelEn: 'Kitchen Team', icon: Utensils },
  ]

  return (
    <section id="village-records" className="py-16 md:py-20 border-b border-border/40 bg-gradient-to-b from-transparent via-secondary/5 to-transparent">
      <div className="container mx-auto px-4">
        <ScrollReveal delay={0.1}>
          <div className="mb-8">
            <SectionHeading
              hi={hi ? 'ग्राम रिकॉर्ड एवं लाभार्थी सूची' : 'ग्राम रिकॉर्ड'}
              en="Village Records & Beneficiary Lists"
              eyebrowHi="वास्तविक डेटा"
              eyebrowEn="Real Data"
              icon={<FileText className="h-3.5 w-3.5" />}
              align="center"
              showDivider
            />
            <p className="text-sm text-muted-foreground mt-4 max-w-2xl mx-auto text-center">
              {hi
                ? 'पेंशन, आवास, राशन कार्ड, हैंडपंप स्थान एवं ऑफलाइन सहायता — वास्तविक ग्राम डेटा'
                : 'Pensions, housing, ration cards, handpump locations & offline help — real village data'}
            </p>
          </div>
        </ScrollReveal>

        {/* Tab bar */}
        <ScrollReveal delay={0.15}>
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {tabs.map(t => {
              const Icon = t.icon
              const active = tab === t.key
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium border transition-all ${
                    active
                      ? 'bg-primary text-primary-foreground border-primary shadow-md'
                      : 'bg-background border-border hover:border-primary/40 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {hi ? t.labelHi : t.labelEn}
                </button>
              )
            })}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="max-w-5xl mx-auto">
            {tab === 'pensions' && <PensionsView hi={hi} />}
            {tab === 'housing' && <HousingView hi={hi} />}
            {tab === 'ration' && <RationView hi={hi} />}
            {tab === 'handpumps' && <HandpumpsView hi={hi} />}
            {tab === 'offline-help' && <OfflineHelpView hi={hi} />}
            {tab === 'school-team' && <SchoolTeamView hi={hi} />}
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

// ── Pensions View ──
function PensionsView({ hi }: { hi: boolean }) {
  const pensions = [
    { key: 'widow', data: { titleHi: 'विधवा पेंशन', titleEn: 'Widow Pension', amount: 1000, count: 8, beneficiaries: [
      { name: hi ? 'श्रीमती रामवती' : 'Smt. Ramwati', ward: 3, status: 'active', since: '2023-04' },
      { name: hi ? 'श्रीमती कमला' : 'Smt. Kamla', ward: 5, status: 'active', since: '2022-11' },
      { name: hi ? 'श्रीमती सीता' : 'Smt. Sita', ward: 2, status: 'active', since: '2023-01' },
      { name: hi ? 'श्रीमती गीता' : 'Smt. Geeta', ward: 7, status: 'active', since: '2022-06' },
      { name: hi ? 'श्रीमती राधा' : 'Smt. Radha', ward: 4, status: 'pending', since: '2024-03' },
    ]}, icon: Heart, color: 'text-pink-500 bg-pink-500/10' },
    { key: 'oldAge', data: { titleHi: 'वृद्धावस्था पेंशन (IGNOAPS)', titleEn: 'Old Age Pension (IGNOAPS)', amount: 1000, count: 14, beneficiaries: [
      { name: hi ? 'श्री रामप्रसाद' : 'Shri Ramprasad', ward: 1, status: 'active', since: '2021-06' },
      { name: hi ? 'श्री मुन्नीलाल' : 'Shri Munnilal', ward: 3, status: 'active', since: '2020-11' },
      { name: hi ? 'श्रीमती फूलमती' : 'Smt. Phoolmati', ward: 5, status: 'active', since: '2022-03' },
      { name: hi ? 'श्री हरिश्चंद्र' : 'Shri Harishchandra', ward: 2, status: 'active', since: '2021-09' },
      { name: hi ? 'श्री विश्वनाथ मिश्र' : 'Shri Vishwanath Mishra', ward: 4, status: 'active', since: '2022-08' },
      { name: hi ? 'श्री राजेंद्र मिश्र' : 'Shri Rajendra Mishra', ward: 6, status: 'active', since: '2021-12' },
    ]}, icon: Users, color: 'text-amber-500 bg-amber-500/10' },
    { key: 'disability', data: { titleHi: 'विकलांग पेंशन', titleEn: 'Disability Pension', amount: 1000, count: 5, beneficiaries: [
      { name: hi ? 'श्री अमित' : 'Shri Amit', ward: 3, status: 'active', since: '2023-02' },
      { name: hi ? 'श्री रवि' : 'Shri Ravi', ward: 5, status: 'active', since: '2022-07' },
      { name: hi ? 'श्रीमती प्रियंका' : 'Smt. Priyanka', ward: 1, status: 'active', since: '2023-09' },
    ]}, icon: Accessibility, color: 'text-emerald-500 bg-emerald-500/10' },
  ]

  return (
    <div className="grid gap-4">
      {pensions.map(p => {
        const Icon = p.icon
        return (
          <Card key={p.key} className="overflow-hidden">
            <div className="flex items-center gap-3 p-4 border-b border-border/40 bg-muted/30">
              <div className={`h-10 w-10 rounded-xl grid place-items-center ${p.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{hi ? p.data.titleHi : p.data.titleEn}</h3>
                <p className="text-xs text-muted-foreground">₹{p.data.amount}/month • {p.data.count} {hi ? 'लाभार्थी' : 'beneficiaries'}</p>
              </div>
              <Badge variant="secondary" className="gap-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                {p.data.beneficiaries.length} {hi ? 'दिखाए गए' : 'shown'}
              </Badge>
            </div>
            <div className="divide-y divide-border/30">
              {p.data.beneficiaries.map((b, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/20 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary grid place-items-center text-xs font-bold">
                    {b.name.charAt(hi ? 0 : 0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{b.name}</p>
                    <p className="text-[11px] text-muted-foreground">{hi ? 'वार्ड' : 'Ward'} {b.ward} • {hi ? 'से' : 'since'} {b.since}</p>
                  </div>
                  <Badge variant={b.status === 'active' ? 'default' : 'outline'} className="text-[10px]">
                    {b.status === 'active' ? (hi ? 'सक्रिय' : 'Active') : (hi ? 'लंबित' : 'Pending')}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        )
      })}
    </div>
  )
}

// ── Housing View ──
function HousingView({ hi }: { hi: boolean }) {
  const schemes = [
    { key: 'pmayG', titleHi: 'प्रधानमंत्री आवास योजना — ग्रामीण (PMAY-G)', titleEn: 'PM Awas Yojana — Gramin', amount: 125000, count: 23, beneficiaries: [
      { name: hi ? 'श्री सुरेश चंद्र मिश्र' : 'Shri Suresh Chandra Mishra', ward: 4, status: 'completed', received: 125000 },
      { name: hi ? 'श्री दुरेंद्र सिंह' : 'Shri Durendra Singh', ward: 6, status: 'in-progress', received: 85000 },
      { name: hi ? 'श्री रमेश चंद्र मिश्र' : 'Shri Ramesh Chandra Mishra', ward: 4, status: 'completed', received: 125000 },
      { name: hi ? 'श्री हेतराम मिश्र' : 'Shri Hetram Mishra', ward: 2, status: 'in-progress', received: 40000 },
      { name: hi ? 'श्री छोटे मोकदम' : 'Shri Chhote Mokdam', ward: 3, status: 'pending', received: 0 },
      { name: hi ? 'श्री मुन्नीलाल हरिजन' : 'Shri Munnilal Harizan', ward: 3, status: 'in-progress', received: 85000 },
      { name: hi ? 'श्री हरिश्चंद्र हरिजन' : 'Shri Harishchandra Harizan', ward: 2, status: 'completed', received: 125000 },
    ]},
    { key: 'cmAwas', titleHi: 'मुख्यमंत्री आवास योजना', titleEn: 'CM Awas Yojana', amount: 70000, count: 11, beneficiaries: [
      { name: hi ? 'श्री अजय कुमार' : 'Shri Ajay Kumar', ward: 5, status: 'completed', received: 70000 },
      { name: hi ? 'श्री राजेंद्र मिश्र' : 'Shri Rajendra Mishra', ward: 6, status: 'in-progress', received: 40000 },
      { name: hi ? 'श्री विश्वनाथ मिश्र' : 'Shri Vishwanath Mishra', ward: 4, status: 'pending', received: 0 },
    ]},
  ]
  const newApps = [
    { name: hi ? 'श्री रामप्रसाद' : 'Shri Ramprasad', ward: 1, status: 'under-review' },
    { name: hi ? 'श्रीमती फूलमती' : 'Smt. Phoolmati', ward: 5, status: 'under-review' },
    { name: hi ? 'श्री रवि' : 'Shri Ravi', ward: 5, status: 'documents-pending' },
  ]

  return (
    <div className="space-y-4">
      {schemes.map(s => (
        <Card key={s.key}>
          <div className="flex items-center gap-3 p-4 border-b border-border/40 bg-muted/30">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center">
              <Home className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{hi ? s.titleHi : s.titleEn}</h3>
              <p className="text-xs text-muted-foreground">₹{s.amount.toLocaleString('en-IN')} • {s.count} {hi ? 'लाभार्थी' : 'beneficiaries'}</p>
            </div>
          </div>
          <div className="divide-y divide-border/30">
            {s.beneficiaries.map((b, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                <div className="flex-1">
                  <p className="text-sm font-medium">{b.name}</p>
                  <p className="text-[11px] text-muted-foreground">{hi ? 'वार्ड' : 'Ward'} {b.ward}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-primary">₹{b.received.toLocaleString('en-IN')}</p>
                  <Badge variant={b.status === 'completed' ? 'default' : 'outline'} className="text-[10px]">
                    {b.status === 'completed' ? (hi ? 'पूर्ण' : 'Done') : b.status === 'in-progress' ? (hi ? 'जारी' : 'Progress') : (hi ? 'लंबित' : 'Pending')}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
      <Card className="border-primary/30 bg-primary/5">
        <div className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            {hi ? 'नई आवेदन — आवास के लिए' : 'New Applications — Housing'}
          </h3>
          <div className="space-y-2">
            {newApps.map((a, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span>{a.name} ({hi ? 'वार्ड' : 'Ward'} {a.ward})</span>
                <Badge variant="outline" className="text-[10px]">
                  {a.status === 'under-review' ? (hi ? 'समीक्षा में' : 'Under Review') : (hi ? 'दस्तावेज़ लंबित' : 'Docs Pending')}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}

// ── Ration Card View ──
function RationView({ hi }: { hi: boolean }) {
  const categories = [
    { type: 'AAY', labelHi: 'अंत्योदय (AAY)', count: 18, color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
    { type: 'BPL', labelHi: 'गरीबी रेखा से नीचे (BPL)', count: 42, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
    { type: 'APL', labelHi: 'गरीबी रेखा से ऊपर (APL)', count: 127, color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  ]

  return (
    <div className="space-y-4">
      <Card>
        <div className="p-5">
          <h3 className="font-semibold text-lg mb-4">{hi ? 'राशन कार्ड पत्र गृहस्थी सूची' : 'Ration Card — Family List'}</h3>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-3 rounded-xl bg-muted/50">
              <div className="text-2xl font-bold text-primary">187</div>
              <div className="text-[10px] text-muted-foreground uppercase">{hi ? 'कुल परिवार' : 'Families'}</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-muted/50">
              <div className="text-2xl font-bold text-primary">1,247</div>
              <div className="text-[10px] text-muted-foreground uppercase">{hi ? 'कुल सदस्य' : 'Members'}</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-muted/50">
              <div className="text-2xl font-bold text-primary">3</div>
              <div className="text-[10px] text-muted-foreground uppercase">{hi ? 'श्रेणियाँ' : 'Categories'}</div>
            </div>
          </div>
          <div className="space-y-2">
            {categories.map(c => (
              <div key={c.type} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                <Badge className={c.color}>{c.labelHi}</Badge>
                <span className="text-lg font-bold">{c.count} {hi ? 'परिवार' : 'families'}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="border-primary/30 bg-primary/5">
        <div className="p-4">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Store className="h-4 w-4 text-primary" />
            {hi ? 'राशन की दुकान (FPS)' : 'Fair Price Shop (FPS)'}
          </h3>
          <p className="text-sm">{hi ? 'अजय कुमार — सरकारी सस्ते गल्ले की दुकान' : 'Ajay Kumar — Government Cheap Ration Shop'}</p>
          <a href="tel:+919721144741" className="inline-flex items-center gap-1.5 text-sm text-primary font-semibold mt-2">
            <Phone className="h-3.5 w-3.5" /> 97211 44741
          </a>
        </div>
      </Card>

      <Card>
        <div className="p-4">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            {hi ? 'नई आवेदन' : 'New Applications'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {hi ? 'राशन कार्ड / गृहस्थी सूची / आधार सूची के लिए नई आवेदन' : 'New applications for Ration Card / Family List / Aadhaar List'}
          </p>
          <div className="mt-3 flex items-center gap-3">
            <Badge variant="secondary">9 {hi ? 'आवेदन' : 'applications'}</Badge>
            <span className="text-xs text-muted-foreground">{hi ? 'तहसील शंकरगढ़ में प्रसंस्करण' : 'Processing at Tehsil Shankargarh'}</span>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-4">
          <h3 className="font-semibold mb-2">{hi ? 'परिवार रजिस्टर (VBGRAMG) एवं श्रमिक सूची' : 'Family Register (VBGRAMG) & Labor List'}</h3>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="p-3 rounded-lg bg-muted/30">
              <p className="text-xs text-muted-foreground">{hi ? 'परिवार रजिस्टर' : 'Family Register'}</p>
              <p className="text-lg font-bold">187 {hi ? 'परिवार' : 'families'}</p>
              <p className="text-[10px] text-muted-foreground">{hi ? 'अपडेटेड: 2024-08' : 'Updated: 2024-08'}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30">
              <p className="text-xs text-muted-foreground">{hi ? 'श्रमिक सूची' : 'Labor List'}</p>
              <p className="text-lg font-bold">34 {hi ? 'श्रमिक' : 'workers'}</p>
              <p className="text-[10px] text-muted-foreground">{hi ? 'नया पंजीकरण उपलब्ध' : 'New registration open'}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

// ── Handpumps View ──
function HandpumpsView({ hi }: { hi: boolean }) {
  const handpumps = [
    { id: 'HP-01', loc: hi ? 'हेतराम मिश्र के घर के सामने' : 'In front of Hetram Mishra\'s house', type: hi ? 'जल स्तर नीचे' : 'Low water table', ward: 2, status: 'needs-deepening' },
    { id: 'HP-02', loc: hi ? 'हरिश्चंद्र पटेल के घर के सामने' : 'In front of Harishchandra Patel\'s house', type: hi ? 'जल स्तर नीचे' : 'Low water table', ward: 2, status: 'needs-deepening' },
    { id: 'HP-03', loc: hi ? 'हरिश्चंद्र हरिजन के घर के पास' : 'Near Harishchandra Harizan\'s house', type: hi ? 'हैंडपंप' : 'Handpump', ward: 3, status: 'working' },
    { id: 'HP-04', loc: hi ? 'छोटे मोकदम के घर के पास' : 'Near Chhote Mokdam\'s house', type: hi ? 'हैंडपंप' : 'Handpump', ward: 3, status: 'working' },
    { id: 'HP-05', loc: hi ? 'मुन्नीलाल हरिजन के घर के पास' : 'Near Munnilal Harizan\'s house', type: hi ? 'हैंडपंप' : 'Handpump', ward: 3, status: 'working' },
    { id: 'HP-06', loc: hi ? 'पंचायत भवन' : 'Panchayat Bhavan', type: hi ? 'हैंडपंप' : 'Handpump', ward: 1, status: 'working' },
    { id: 'HP-07', loc: hi ? 'प्राथमिक विद्यालय चंद्रा खास में' : 'Primary School Chandra Khas', type: hi ? 'हैंडपंप' : 'Handpump', ward: 1, status: 'working' },
    { id: 'HP-08', loc: hi ? 'विश्वनाथ मिश्र के घर के पास' : 'Near Vishwanath Mishra\'s house', type: hi ? 'हैंडपंप' : 'Handpump', ward: 4, status: 'working' },
    { id: 'HP-09', loc: hi ? 'राजेंद्र मिश्र के घर के पास' : 'Near Rajendra Mishra\'s house', type: hi ? 'हैंडपंप' : 'Handpump', ward: 6, status: 'working' },
    { id: 'HP-10', loc: hi ? 'काली माता मंदिर मार्ग — रमेश चंद्र मिश्र के घर के पास' : 'Kali Mata Mandir road — near Ramesh Chandra Mishra', type: hi ? 'हैंडपंप' : 'Handpump', ward: 4, status: 'working' },
    { id: 'HP-11', loc: hi ? 'सुरेश चंद्र मिश्र के घर के पास' : 'Near Suresh Chandra Mishra\'s house', type: hi ? 'हैंडपंप' : 'Handpump', ward: 4, status: 'working' },
    { id: 'HP-12', loc: hi ? 'दुरेंद्र सिंह के घर के पास' : 'Near Durendra Singh\'s house', type: hi ? 'हैंडपंप' : 'Handpump', ward: 6, status: 'working' },
    { id: 'HP-13', loc: hi ? 'प्राथमिक विद्यालय चंद्रा लोनियां में' : 'Primary School Chandra Loniyan', type: hi ? 'हैंडपंप' : 'Handpump', ward: 7, status: 'working' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-4 px-1">
        <div>
          <p className="text-sm font-semibold">{hi ? 'सरकारी हैंडपंप सूची — चंद्रा' : 'Government Handpump List — Chandra'}</p>
          <p className="text-xs text-muted-foreground">{handpumps.length} {hi ? 'हैंडपंप' : 'handpumps'} • {handpumps.filter(h=>h.status==='working').length} {hi ? 'काम कर रहे' : 'working'} • {handpumps.filter(h=>h.status==='needs-deepening').length} {hi ? 'गहराई चाहिए' : 'need deepening'}</p>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Droplet className="h-3 w-3" /> JJM
        </Badge>
      </div>
      <div className="grid gap-2">
        {handpumps.map(hp => (
          <Card key={hp.id} className="p-3 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div className={`h-9 w-9 rounded-lg grid place-items-center shrink-0 ${hp.status === 'working' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                <Droplet className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-mono font-bold text-muted-foreground">{hp.id}</span>
                  <Badge variant={hp.status === 'working' ? 'default' : 'outline'} className="text-[9px] py-0">
                    {hp.status === 'working' ? (hi ? 'काम कर रहा' : 'Working') : (hi ? 'गहराई चाहिए' : 'Needs Deepening')}
                  </Badge>
                </div>
                <p className="text-sm font-medium text-foreground">{hp.loc}</p>
                <p className="text-[11px] text-muted-foreground">{hi ? 'वार्ड' : 'Ward'} {hp.ward} • {hp.type}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ── Offline Help View ──
function OfflineHelpView({ hi }: { hi: boolean }) {
  const contacts = [
    {
      name: hi ? 'सूर्या प्रसाद गुप्ता' : 'Surya Prasad Gupta',
      shop: hi ? 'गुड़िया स्टूडियो' : 'Gudiya Studio',
      phone: '9792983671',
      service: hi ? 'ऑफलाइन फॉर्म भरने में सहायता, फोटो, प्रिंट, लेमिनेशन' : 'Help filling offline forms, photos, printing, lamination',
      emoji: '📷',
    },
    {
      name: hi ? 'अजय कुमार' : 'Ajay Kumar',
      shop: hi ? 'सरकारी सस्ते गल्ले की दुकान' : 'Government Cheap Ration Shop (FPS)',
      phone: '9721144741',
      service: hi ? 'राशन कार्ड, गृहस्थी सूची, खाद्य सुरक्षा योजना' : 'Ration card, family list, food security scheme',
      emoji: '🏪',
    },
  ]

  return (
    <div>
      <div className="text-center mb-6 px-4 py-3 rounded-xl bg-primary/5 border border-primary/20">
        <p className="text-sm font-medium text-foreground">
          {hi ? 'किसी भी दस्तावेज़ की ऑफलाइन समस्या होने पर इनसे संपर्क करें' : 'Contact these people for any offline document problems'}
        </p>
      </div>
      <div className="grid gap-4">
        {contacts.map((c, i) => (
          <Card key={i} className="p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 grid place-items-center text-2xl shrink-0">
                {c.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-foreground">{c.name}</h3>
                <p className="text-sm text-primary font-medium">{c.shop}</p>
                <p className="text-xs text-muted-foreground mt-1">{c.service}</p>
                <a
                  href={`tel:+91${c.phone}`}
                  className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  <PhoneIcon className="h-3.5 w-3.5" />
                  +91 {c.phone.slice(0,5)} {c.phone.slice(5)}
                </a>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ── School Team View ──
function SchoolTeamView({ hi }: { hi: boolean }) {
  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <img
          src="/whatsapp-optimized/school-kitchen-team.webp"
          alt={hi ? 'प्राथमिक विद्यालय चंद्रा खास की रसोईया टीम' : 'Primary School Chandra Khas Kitchen Team'}
          className="w-full h-auto max-h-[500px] object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          <Badge className="mb-2 bg-primary text-primary-foreground">
            <Utensils className="h-3 w-3 mr-1" /> {hi ? 'मध्याह्न भोजन' : 'Mid-Day Meal'}
          </Badge>
          <h3 className="text-xl font-bold">
            {hi ? 'प्राथमिक विद्यालय चंद्रा खास की रसोईया टीम' : 'Primary School Chandra Khas — Kitchen Team'}
          </h3>
          <p className="text-sm text-white/90 mt-1">
            {hi ? 'यह टीम प्रतिदिन छात्रों के लिए पौष्टिक मध्याह्न भोजन तैयार करती है।' : 'This team prepares nutritious mid-day meals for students daily.'}
          </p>
        </div>
      </div>
    </Card>
  )
}
