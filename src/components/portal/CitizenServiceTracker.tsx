'use client'
import { useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  ClipboardCheck,
  FileText,
  Home,
  Droplets,
  GraduationCap,
  Heart,
  Users,
  Phone,
  Clock,
  CheckCircle2,
  CircleDot,
  Circle,
  ArrowRight,
  ExternalLink,
  HelpCircle,
  MapPin,
  Landmark,
  HandCoins,
  BadgeCheck,
  Sparkles,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ScrollReveal } from './ScrollReveal'

// ── Bilingual label pair ──
interface Bi { hi: string; en: string }

// ── Service application data ──
interface ServiceStep {
  stepHi: string
  stepEn: string
  durationDays: number
  icon: React.ElementType
}

interface ServiceApplication {
  id: string
  nameHi: string
  nameEn: string
  category: string
  categoryHi: string
  categoryEn: string
  descriptionHi: string
  descriptionEn: string
  icon: React.ElementType
  totalDays: number
  steps: ServiceStep[]
  requiredDocsHi: string[]
  requiredDocsEn: string[]
  officeHi: string
  officeEn: string
  fee: string
  url: string
  accentColor: string
}

// ── Demo applications removed — use real API data only ──

const SERVICES: ServiceApplication[] = [
  {
    id: 'cert-residence',
    nameHi: 'निवास प्रमाण पत्र',
    nameEn: 'Residence Certificate',
    category: 'certificates',
    categoryHi: 'प्रमाण पत्र',
    categoryEn: 'Certificates',
    descriptionHi: 'ग्राम पंचायत चंद्रा में निवास का प्रमाण — सभी सरकारी सेवाओं के लिए आवश्यक।',
    descriptionEn: 'Proof of residence in GP Chandra — required for all government services.',
    icon: FileText,
    totalDays: 7,
    steps: [
      { stepHi: 'पंचायत कार्यालय में आवेदन', stepEn: 'Apply at Panchayat Office', durationDays: 1, icon: ClipboardCheck },
      { stepHi: 'वार्ड सदस्य सत्यापन', stepEn: 'Ward Member Verification', durationDays: 2, icon: Users },
      { stepHi: 'लेखपाल जाँच', stepEn: 'Lekhpal Verification', durationDays: 2, icon: CheckCircle2 },
      { stepHi: 'प्रधान हस्ताक्षर', stepEn: 'Pradhan Signature', durationDays: 1, icon: BadgeCheck },
      { stepHi: 'प्रमाण पत्र जारी', stepEn: 'Certificate Issued', durationDays: 1, icon: Sparkles },
    ],
    requiredDocsHi: ['आधार कार्ड', 'राशन कार्ड', 'वार्ड सदस्य प्रमाण'],
    requiredDocsEn: ['Aadhaar Card', 'Ration Card', 'Ward Member Certificate'],
    officeHi: 'पंचायत भवन, चंद्रा',
    officeEn: 'Panchayat Bhawan, Chandra',
    fee: '₹0 (निःशुल्क)',
    url: '',
    accentColor: 'bg-primary/10 text-primary',
  },
  {
    id: 'cert-income',
    nameHi: 'आय प्रमाण पत्र',
    nameEn: 'Income Certificate',
    category: 'certificates',
    categoryHi: 'प्रमाण पत्र',
    categoryEn: 'Certificates',
    descriptionHi: 'परिवार की वार्षिक आय का प्रमाण — योजना पात्रता के लिए आवश्यक।',
    descriptionEn: 'Proof of annual family income — required for scheme eligibility.',
    icon: HandCoins,
    totalDays: 10,
    steps: [
      { stepHi: 'तहसील कार्यालय में आवेदन', stepEn: 'Apply at Tehsil Office', durationDays: 1, icon: ClipboardCheck },
      { stepHi: 'लेखपाल आय सत्यापन', stepEn: 'Lekhpal Income Verification', durationDays: 3, icon: Users },
      { stepHi: 'तहसीलदार जाँच', stepEn: 'Tehsildar Review', durationDays: 3, icon: CheckCircle2 },
      { stepHi: 'ADM हस्ताक्षर', stepEn: 'ADM Signature', durationDays: 2, icon: BadgeCheck },
      { stepHi: 'प्रमाण पत्र जारी', stepEn: 'Certificate Issued', durationDays: 1, icon: Sparkles },
    ],
    requiredDocsHi: ['आधार कार्ड', 'निवास प्रमाण पत्र', 'स्व-घोषणा पत्र'],
    requiredDocsEn: ['Aadhaar Card', 'Residence Certificate', 'Self-declaration Form'],
    officeHi: 'तहसील कार्यालय, शंकरगढ़',
    officeEn: 'Tehsil Office, Shankargarh',
    fee: '₹0 (निःशुल्क)',
    url: '',
    accentColor: 'bg-accent/20 text-accent-foreground',
  },
  {
    id: 'pmayg-apply',
    nameHi: 'PMAY-G आवास आवेदन',
    nameEn: 'PMAY-G Housing Application',
    category: 'schemes',
    categoryHi: 'योजना आवेदन',
    categoryEn: 'Scheme Applications',
    descriptionHi: 'प्रधानमंत्री आवास योजना-ग्रामीण में आवेदन — ₹1.20 लाख आवास सहायता।',
    descriptionEn: 'Apply for PM Awaas Yojana-Gramin — ₹1.20 lakh housing assistance.',
    icon: Home,
    totalDays: 45,
    steps: [
      { stepHi: 'पंचायत में आवेदन दर्ज', stepEn: 'Application filed at GP', durationDays: 1, icon: ClipboardCheck },
      { stepHi: 'वार्ड सदस्य सत्यापन', stepEn: 'Ward Member Verification', durationDays: 5, icon: Users },
      { stepHi: 'लेखपाल भूमि सत्यापन', stepEn: 'Lekhpal Land Verification', durationDays: 7, icon: CheckCircle2 },
      { stepHi: 'BDO जाँच एवं स्वीकृति', stepEn: 'BDO Review & Approval', durationDays: 10, icon: BadgeCheck },
      { stepHi: 'Awaassoft पर संस्धिकरण', stepEn: 'Registration on Awaassoft', durationDays: 7, icon: ExternalLink },
      { stepHi: 'किस्त 1 जारी (₹30,000)', stepEn: 'Installment 1 Released (₹30K)', durationDays: 10, icon: Sparkles },
      { stepHi: 'निर्माण जाँच → किस्त 2-4', stepEn: 'Construction Review → Inst 2-4', durationDays: 10, icon: CheckCircle2 },
    ],
    requiredDocsHi: ['आधार कार्ड', 'आय प्रमाण पत्र', 'भूमि पत्र/खतौनी', 'बैंक पासबुक', 'पात्रता प्रमाण'],
    requiredDocsEn: ['Aadhaar Card', 'Income Certificate', 'Land Document/Khatauni', 'Bank Passbook', 'Eligibility Certificate'],
    officeHi: 'पंचायत भवन → ब्लॉक कार्यालय',
    officeEn: 'Panchayat Bhawan → Block Office',
    fee: '₹0 (निःशुल्क)',
    url: 'https://pmayg.nic.in/netiay/Home.aspx',
    accentColor: 'bg-primary/10 text-primary',
  },
  {
    id: 'mgnrega-apply',
    nameHi: 'MGNREGA जॉब कार्ड',
    nameEn: 'MGNREGA Job Card',
    category: 'schemes',
    categoryHi: 'योजना आवेदन',
    categoryEn: 'Scheme Applications',
    descriptionHi: 'मनरेगा जॉब कार्ड आवेदन — वर्ष में 100 दिन काम की गारंटी।',
    descriptionEn: 'MGNREGA Job Card application — 100 days guaranteed work per year.',
    icon: HandCoins,
    totalDays: 15,
    steps: [
      { stepHi: 'पंचायत में आवेदन', stepEn: 'Apply at GP Office', durationDays: 1, icon: ClipboardCheck },
      { stepHi: 'वार्ड सदस्य प्रमाण', stepEn: 'Ward Member Certificate', durationDays: 3, icon: Users },
      { stepHi: 'प्रधान सत्यापन', stepEn: 'Pradhan Verification', durationDays: 3, icon: BadgeCheck },
      { stepHi: 'BDO जॉब कार्ड संस्धिकरण', stepEn: 'BDO Job Card Registration', durationDays: 5, icon: ExternalLink },
      { stepHi: 'जॉब कार्ड जारी', stepEn: 'Job Card Issued', durationDays: 3, icon: Sparkles },
    ],
    requiredDocsHi: ['आधार कार्ड', 'निवास प्रमाण', 'राशन कार्ड', 'बैंक पासबुक'],
    requiredDocsEn: ['Aadhaar Card', 'Residence Certificate', 'Ration Card', 'Bank Passbook'],
    officeHi: 'पंचायत भवन → ब्लॉक कार्यालय',
    officeEn: 'Panchayat Bhawan → Block Office',
    fee: '₹0 (निःशुल्क)',
    url: 'https://nrega.nic.in',
    accentColor: 'bg-accent/20 text-accent-foreground',
  },
  {
    id: 'jjm-apply',
    nameHi: 'जल जीवन मिशन — नल जोड़',
    nameEn: 'Jal Jeevan Mission — Tap Connection',
    category: 'schemes',
    categoryHi: 'योजना आवेदन',
    categoryEn: 'Scheme Applications',
    descriptionHi: 'हर घर नल — जल जीवन मिशन में घर तक पानी पहुँचाने का आवेदन।',
    descriptionEn: 'Har Ghar Jal — apply for tap water connection at home.',
    icon: Droplets,
    totalDays: 20,
    steps: [
      { stepHi: 'पंचायत में आवेदन दर्ज', stepEn: 'Application filed at GP', durationDays: 1, icon: ClipboardCheck },
      { stepHi: 'वार्ड सदस्य सत्यापन', stepEn: 'Ward Member Verification', durationDays: 3, icon: Users },
      { stepHi: 'JJM टीम सर्वेक्षण', stepEn: 'JJM Team Survey', durationDays: 5, icon: MapPin },
      { stepHi: 'पाइपलाइन लाइन आवंटन', stepEn: 'Pipeline Line Allocation', durationDays: 5, icon: BadgeCheck },
      { stepHi: 'नल कनेक्शन स्थापना', stepEn: 'Tap Connection Installation', durationDays: 3, icon: CheckCircle2 },
      { stepHi: 'कनेक्शन सत्यापन एवं जारी', stepEn: 'Connection Verified & Active', durationDays: 3, icon: Sparkles },
    ],
    requiredDocsHi: ['आधार कार्ड', 'निवास प्रमाण', 'बैंक पासबुक'],
    requiredDocsEn: ['Aadhaar Card', 'Residence Certificate', 'Bank Passbook'],
    officeHi: 'पंचायत भवन → जल निगम',
    officeEn: 'Panchayat Bhawan → Jal Nigam',
    fee: '₹0 (निःशुल्क)',
    url: 'https://jjm.up.gov.in/',
    accentColor: 'bg-primary/10 text-primary',
  },
  {
    id: 'pension-apply',
    nameHi: 'वृद्धावस्था/विकलांग पेंशन',
    nameEn: 'Old Age/Disability Pension',
    category: 'schemes',
    categoryHi: 'योजना आवेदन',
    categoryEn: 'Scheme Applications',
    descriptionHi: '60+ वर्ष वृद्धावस्था पेंशन (₹1000/माह) एवं विकलांग पेंशन आवेदन।',
    descriptionEn: 'Old age pension (₹1000/mo) for 60+ and disability pension application.',
    icon: Heart,
    totalDays: 30,
    steps: [
      { stepHi: 'पंचायत में आवेदन', stepEn: 'Apply at GP Office', durationDays: 1, icon: ClipboardCheck },
      { stepHi: 'आय/आयु सत्यापन', stepEn: 'Income/Age Verification', durationDays: 7, icon: Users },
      { stepHi: 'सामाजिक सत्यापन कम', stepEn: 'Social Verification Committee', durationDays: 7, icon: CheckCircle2 },
      { stepHi: 'BDO स्वीकृति', stepEn: 'BDO Approval', durationDays: 7, icon: BadgeCheck },
      { stepHi: 'बैंक में DBT संस्धिकरण', stepEn: 'DBT Registration in Bank', durationDays: 5, icon: ExternalLink },
      { stepHi: 'पेंशन शुरू', stepEn: 'Pension Started', durationDays: 3, icon: Sparkles },
    ],
    requiredDocsHi: ['आधार कार्ड', 'आय प्रमाण', 'आयु प्रमाण (वोटर ID)', 'बैंक पासबुक', 'विकलांग प्रमाण (यदि)'],
    requiredDocsEn: ['Aadhaar Card', 'Income Certificate', 'Age Proof (Voter ID)', 'Bank Passbook', 'Disability Certificate (if)'],
    officeHi: 'पंचायत भवन → ब्लॉक कार्यालय',
    officeEn: 'Panchayat Bhawan → Block Office',
    fee: '₹0 (निःशुल्क)',
    url: 'https://sspy-up.gov.in/',
    accentColor: 'bg-accent/20 text-accent-foreground',
  },
]

const DEMO_APPLICATIONS: never[] = []

export function CitizenServiceTracker() {
  const { locale } = useI18n()
  const isHi = locale === 'hi'
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedService, setSelectedService] = useState<ServiceApplication | null>(null)

  const categories = [
    { value: 'all', labelHi: 'सभी सेवाएँ', labelEn: 'All Services' },
    { value: 'certificates', labelHi: 'प्रमाण पत्र', labelEn: 'Certificates' },
    { value: 'schemes', labelHi: 'योजना आवेदन', labelEn: 'Scheme Applications' },
  ]

  const filteredServices = selectedCategory === 'all'
    ? SERVICES
    : SERVICES.filter(s => s.category === selectedCategory)

  return (
    <section
      id="service-tracker"
      data-section="service-tracker"
      className="section-premium py-16 md:py-20 border-b border-border/40"
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <ScrollReveal delay={0.1}>
          <div className="text-center mb-10">
            <Badge variant="outline" className="section-header-badge mb-3 gap-1.5">
              <ClipboardCheck className="h-3.5 w-3.5" />
              {isHi ? 'सेवा ट्रैकर' : 'Service Tracker'}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gradient-premium">
              {isHi ? 'नागरिक सेवा ट्रैकर' : 'Citizen Service Tracker'}
            </h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              {isHi
                ? 'अपनी आवेदन की प्रगति ट्रैक करें — प्रमाण पत्र, योजना आवेदन, और सरकारी सेवाएँ'
                : 'Track your application progress — certificates, scheme applications, and government services'}
            </p>
          </div>
        </ScrollReveal>

        {/* Category Tabs */}
        <ScrollReveal delay={0.15}>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
            <TabsList className="overflow-x-auto">
              {categories.map(c => (
                <TabsTrigger key={c.value} value={c.value} className="text-xs">
                  {isHi ? c.labelHi : c.labelEn}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </ScrollReveal>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((service, idx) => {
            const Icon = service.icon

            return (
              <ScrollReveal key={service.id} delay={0.05 * idx}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    className={`border-border/70 hover-lift-large cursor-pointer group ${selectedService?.id === service.id ? 'tricolor-frame' : ''}`}
                    onClick={() => setSelectedService(selectedService?.id === service.id ? null : service)}
                  >
                    <CardContent className="p-5 space-y-3">
                      {/* Icon + title */}
                      <div className="flex items-start gap-3">
                        <div className={`h-10 w-10 rounded-lg grid place-items-center shrink-0 ${service.accentColor}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-sm group-hover:text-primary transition-colors">
                            {isHi ? service.nameHi : service.nameEn}
                          </div>
                          <Badge variant="secondary" className="text-[10px] mt-1 gap-1">
                            <Clock className="h-2.5 w-2.5" />
                            {isHi ? `${service.totalDays} दिन` : `${service.totalDays} days`}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {isHi ? service.descriptionHi : service.descriptionEn}
                      </p>

                      {/* Mini progress steps */}
                      <div className="flex items-center gap-0.5 overflow-hidden">
                        {service.steps.map((step, si) => {
                          return (
                            <div
                              key={si}
                              className="h-1.5 flex-1 rounded-full bg-muted"
                            />
                          )
                        })}
                      </div>

                      {/* Expand hint */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {isHi ? service.officeHi : service.officeEn}
                        </span>
                        <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                          {isHi ? 'विवरण देखें →' : 'View details →'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </ScrollReveal>
            )
          })}
        </div>

        {/* Expanded Service Detail */}
        <AnimatePresence>
          {selectedService && (
            <motion.div
              initial={{ opacity: 0, y: 20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-8"
            >
              <Card className="border-border/70 conic-ring">
                <CardContent className="p-6 space-y-5">
                  {/* Title */}
                  <div className="flex items-center gap-3">
                    {(() => { const SIcon = selectedService.icon; return <div className={`h-12 w-12 rounded-lg grid place-items-center ${selectedService.accentColor}`}><SIcon className="h-6 w-6" /></div> })()}
                    <div>
                      <h3 className="font-bold text-lg">
                        {isHi ? selectedService.nameHi : selectedService.nameEn}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {isHi ? selectedService.descriptionHi : selectedService.descriptionEn}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Step-by-step timeline */}
                  <div>
                    <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
                      <ClipboardCheck className="h-4 w-4 text-primary" />
                      {isHi ? 'आवेदन प्रक्रिया — चरण-दर-चरण' : 'Application Process — Step by Step'}
                    </h4>
                    <div className="space-y-3">
                      {selectedService.steps.map((step, si) => {
                        const StepIcon = step.icon
                        return (
                          <motion.div
                            key={si}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: si * 0.05 }}
                            className="flex items-center gap-3"
                          >
                            <div className="h-8 w-8 rounded-full grid place-items-center shrink-0 bg-muted text-muted-foreground">
                              <StepIcon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium">
                                {isHi ? step.stepHi : step.stepEn}
                              </div>
                              <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <Clock className="h-2.5 w-2.5" />
                                {isHi ? `अनुमानित ${step.durationDays} दिन` : `Est. ${step.durationDays} days`}
                              </div>
                            </div>
                            <div className="text-xs font-mono text-muted-foreground shrink-0">
                              चरण {si + 1}/{selectedService.steps.length}
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                    {/* Total duration */}
                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground bg-secondary/40 rounded-md px-3 py-2">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      {isHi
                        ? `कुल अनुमानित समय: ${selectedService.totalDays} दिन (विलंब संभव)`
                        : `Total estimated time: ${selectedService.totalDays} days (delays possible)`}
                    </div>
                  </div>

                  <Separator />

                  {/* Required documents */}
                  <div>
                    <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-primary" />
                      {isHi ? 'आवश्यक दस्तावेज' : 'Required Documents'}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(isHi ? selectedService.requiredDocsHi : selectedService.requiredDocsEn).map((doc, di) => (
                        <div key={di} className="flex items-center gap-2 text-xs bg-secondary/30 rounded-md px-3 py-2">
                          <CheckCircle2 className="h-3 w-3 text-green-600 shrink-0" />
                          {doc}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Office & fee info */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex items-center gap-2 text-xs">
                      <Landmark className="h-4 w-4 text-primary" />
                      <div>
                        <div className="text-muted-foreground">{isHi ? 'कार्यालय' : 'Office'}</div>
                        <div className="font-medium">{isHi ? selectedService.officeHi : selectedService.officeEn}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <HandCoins className="h-4 w-4 text-primary" />
                      <div>
                        <div className="text-muted-foreground">{isHi ? 'शुल्क' : 'Fee'}</div>
                        <div className="font-medium">{selectedService.fee}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Phone className="h-4 w-4 text-primary" />
                      <div>
                        <div className="text-muted-foreground">{isHi ? 'सहायता' : 'Help'}</div>
                        <div className="font-medium">96510 35021</div>
                      </div>
                    </div>
                  </div>

                  {/* Online portal link (if available) */}
                  {selectedService.url && (
                    <div className="flex items-center gap-2 text-xs pt-2">
                      <ExternalLink className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">{isHi ? 'ऑनलाइन पोर्टल:' : 'Online portal:'}</span>
                      <a
                        href={selectedService.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline hover:text-primary/80 transition-colors"
                      >
                        {isHi ? 'यहाँ जाएँ' : 'Visit portal'}
                      </a>
                    </div>
                  )}

                  {/* Close button */}
                  <div className="pt-2 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedService(null)}
                      className="gap-1.5"
                    >
                      {isHi ? 'बंद करें' : 'Close'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick stats */}
        <ScrollReveal delay={0.25}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            <div className="card-premium rounded-xl p-4 hover-lift-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{isHi ? 'सेवाएँ' : 'Services'}</span>
                <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0">
                  <FileText className="h-3.5 w-3.5" />
                </div>
              </div>
              <div className="text-2xl font-bold tabular-nums">{SERVICES.length}</div>
            </div>
            <div className="card-premium rounded-xl p-4 hover-lift-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{isHi ? 'अनु. दिन' : 'Avg. Days'}</span>
                <div className="h-7 w-7 rounded-lg bg-amber-600/10 text-amber-600 grid place-items-center shrink-0">
                  <Clock className="h-3.5 w-3.5" />
                </div>
              </div>
              <div className="text-2xl font-bold tabular-nums">
                  {Math.round(SERVICES.reduce((s, sv) => s + sv.totalDays, 0) / SERVICES.length)}
              </div>
            </div>
            <div className="card-premium rounded-xl p-4 hover-lift-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{isHi ? 'शुल्क' : 'Fee'}</span>
                <div className="h-7 w-7 rounded-lg bg-accent/40 text-accent-foreground grid place-items-center shrink-0">
                  <BadgeCheck className="h-3.5 w-3.5" />
                </div>
              </div>
              <div className="text-2xl font-bold tabular-nums">₹0</div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
