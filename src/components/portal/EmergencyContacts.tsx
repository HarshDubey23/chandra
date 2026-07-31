'use client'
import { useI18n } from '@/lib/i18n'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import {
  Phone,
  Ambulance,
  Siren,
  Flame,
  HeartPulse,
  ShieldAlert,
  Hospital,
  Droplets,
  Truck,
  Building2,
  Baby,
  Zap,
  Stethoscope,
  Users,
  Flashlight,
  BriefcaseMedical,
  MapPin,
  Clock,
  Bed,
  ExternalLink,
} from 'lucide-react'
import { ScrollReveal } from './ScrollReveal'

/* ──────────────────────────────────────────────────────────────────────
   Emergency Contacts — Gram Panchayat Chandra
   Critical emergency numbers, nearby health facilities, village-level
   first responders, preparedness tips, and the UP-112 single emergency
   number CTA. Bilingual (hi/en), Hindi-first.
   ────────────────────────────────────────────────────────────────────── */

type Severity = 'critical' | 'helpline' | 'utility'

// ── Color tokens for severity badges ──
const SEVERITY_STYLES: Record<Severity, string> = {
  critical:
    'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/50',
  helpline:
    'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50',
  utility:
    'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/50',
}

const SEVERITY_ICON_WRAP: Record<Severity, string> = {
  critical: 'bg-red-600/10 text-red-600 dark:text-red-400',
  helpline: 'bg-amber-600/10 text-amber-600 dark:text-amber-400',
  utility: 'bg-blue-600/10 text-blue-600 dark:text-blue-400',
}

const SEVERITY_BORDER: Record<Severity, string> = {
  critical: 'border-l-4 border-l-red-500',
  helpline: 'border-l-4 border-l-amber-500',
  utility: 'border-l-4 border-l-blue-500',
}

const SEVERITY_GRADIENT: Record<Severity, string> = {
  critical: 'from-red-50 to-white dark:from-red-950/20 dark:to-card',
  helpline: 'from-amber-50 to-white dark:from-amber-950/20 dark:to-card',
  utility: 'from-blue-50 to-white dark:from-blue-950/20 dark:to-card',
}

interface EmergencyNumber {
  id: string
  icon: typeof Phone
  nameHi: string
  nameEn: string
  numbers: string
  telHref: string
  noteHi: string
  noteEn: string
  subHi: string
  subEn: string
  severity: Severity
  emoji: string
}

const EMERGENCY_NUMBERS: EmergencyNumber[] = [
  {
    id: 'ambulance',
    icon: Ambulance,
    nameHi: 'एम्बुलेंस',
    nameEn: 'Ambulance',
    numbers: '108 / 102',
    telHref: 'tel:108',
    noteHi: 'मुफ्त एम्बुलेंस',
    noteEn: 'Free ambulance service',
    subHi: '108 (राष्ट्रीय), 102 (जननी शिशु सुरक्षा)',
    subEn: '108 (National), 102 (Janani Shishu Suraksha)',
    severity: 'critical',
    emoji: '🚑',
  },
  {
    id: 'fire',
    icon: Flame,
    nameHi: 'अग्निशमन',
    nameEn: 'Fire Brigade',
    numbers: '101',
    telHref: 'tel:101',
    noteHi: 'अग्निशमन विभाग',
    noteEn: 'Fire department',
    subHi: 'शंकरगढ़ अग्निशमन स्टेशन',
    subEn: 'Shankargarh Fire Station',
    severity: 'critical',
    emoji: '🚒',
  },
  {
    id: 'police',
    icon: Siren,
    nameHi: 'पुलिस',
    nameEn: 'Police',
    numbers: '100 / 112',
    telHref: 'tel:100',
    noteHi: 'पुलिस सहायता',
    noteEn: 'Police assistance',
    subHi: '100 (पुलिस), 112 (यूपी-112)',
    subEn: '100 (Police), 112 (UP-112)',
    severity: 'critical',
    emoji: '🚓',
  },
  {
    id: 'women',
    icon: HeartPulse,
    nameHi: 'महिला हेल्पलाइन',
    nameEn: 'Women Helpline',
    numbers: '1091 / 181',
    telHref: 'tel:1091',
    noteHi: 'महिला हेल्पलाइन',
    noteEn: 'Women helpline',
    subHi: '1091 (महिला), 181 (शासन)',
    subEn: '1091 (Women), 181 (Govt)',
    severity: 'helpline',
    emoji: '🩺',
  },
  {
    id: 'child',
    icon: Baby,
    nameHi: 'बाल हेल्पलाइन',
    nameEn: 'Child Helpline',
    numbers: '1098',
    telHref: 'tel:1098',
    noteHi: 'बाल सहायता',
    noteEn: 'Child helpline',
    subHi: 'CHILDLINE 24x7 सेवा',
    subEn: 'CHILDLINE 24x7 service',
    severity: 'helpline',
    emoji: '👶',
  },
  {
    id: 'disaster',
    icon: ShieldAlert,
    nameHi: 'आपदा प्रबंधन',
    nameEn: 'Disaster Mgmt',
    numbers: '1070',
    telHref: 'tel:1070',
    noteHi: 'आपदा प्रबंधन',
    noteEn: 'Disaster management',
    subHi: 'राज्य आपदा प्रबंधन प्राधिकरण',
    subEn: 'State Disaster Management Authority',
    severity: 'helpline',
    emoji: '🆘',
  },
  {
    id: 'electricity',
    icon: Zap,
    nameHi: 'विद्युत शिकायत',
    nameEn: 'Electricity Fault',
    numbers: '19120',
    telHref: 'tel:19120',
    noteHi: 'विद्युत शिकायत',
    noteEn: 'Power complaint',
    subHi: 'पीवीवीएनएल (PVVNL)',
    subEn: 'PVVNL — Paschimanchal Vidyut Vitaran',
    severity: 'utility',
    emoji: '⚡',
  },
  {
    id: 'water',
    icon: Droplets,
    nameHi: 'जल संकट',
    nameEn: 'Water Crisis',
    numbers: 'पंचायत / Panchayat',
    telHref: 'tel:+919651035021',
    noteHi: 'जल संकट',
    noteEn: 'Water crisis',
    subHi: 'ग्राम पंचायत कार्यालय',
    subEn: 'Gram Panchayat office',
    severity: 'utility',
    emoji: '💧',
  },
]

interface HealthFacility {
  id: string
  icon: typeof Hospital
  nameHi: string
  nameEn: string
  distance: string
  detail1Hi: string
  detail1En: string
  detail2Hi: string
  detail2En: string
  phone?: string
  beds?: string
  tagHi: string
  tagEn: string
}

const HEALTH_FACILITIES: HealthFacility[] = [
  {
    id: 'phc',
    icon: Building2,
    nameHi: 'प्राथमिक स्वास्थ्य केंद्र, शंकरगढ़',
    nameEn: 'PHC Shankargarh',
    distance: '3 किमी / 3 km',
    detail1Hi: '24x7 आपातकालीन सेवा',
    detail1En: '24x7 emergency service',
    detail2Hi: 'डॉ. आर.के. सिंह (एमओ)',
    detail2En: 'Dr. R.K. Singh (MO)',
    phone: '9651035021',
    tagHi: 'प्राथमिक स्वास्थ्य केंद्र',
    tagEn: 'Primary Health Centre',
  },
  {
    id: 'chc',
    icon: Hospital,
    nameHi: 'सामुदायिक स्वास्थ्य केंद्र, शंकरगढ़',
    nameEn: 'CHC Shankargarh',
    distance: '3 किमी / 3 km',
    detail1Hi: '30 बिस्तर, प्रसूति एवं शल्य',
    detail1En: '30 beds, maternity & surgery',
    detail2Hi: 'रेफरल अस्पताल',
    detail2En: 'Referral hospital',
    phone: '9651035021',
    beds: '30',
    tagHi: 'सामुदायिक स्वास्थ्य केंद्र',
    tagEn: 'Community Health Centre',
  },
  {
    id: 'district-hospital',
    icon: Hospital,
    nameHi: 'जिला अस्पताल, प्रयागराज',
    nameEn: 'District Hospital Prayagraj',
    distance: '38 किमी / 38 km',
    detail1Hi: '500 बिस्तर, सभी विशेषताएँ',
    detail1En: '500 beds, all specialties',
    detail2Hi: 'उच्च रेफरल केंद्र',
    detail2En: 'Tertiary referral centre',
    beds: '500',
    tagHi: 'जिला अस्पताल',
    tagEn: 'District Hospital',
  },
]

interface FirstResponder {
  id: string
  icon: typeof Phone
  roleHi: string
  roleEn: string
  nameHi: string
  nameEn: string
  detailHi: string
  detailEn: string
  phone?: string
  hoursHi?: string
  hoursEn?: string
}

const FIRST_RESPONDERS: FirstResponder[] = [
  {
    id: 'asha',
    icon: HeartPulse,
    roleHi: 'ग्राम स्वास्थ्य कार्यकर्ता (आशा)',
    roleEn: 'Village Health Worker (ASHA)',
    nameHi: 'अर्चना सिंह (ANM)',
    nameEn: 'Archana Singh (ANM)',
    detailHi: 'वार्ड 1-5',
    detailEn: 'Ward 1-5',
    phone: '9651035021',
  },
  {
    id: 'anm',
    icon: Stethoscope,
    roleHi: 'एएनएम',
    roleEn: 'ANM',
    nameHi: 'अर्चना सिंह',
    nameEn: 'Archana Singh',
    detailHi: 'पीएचसी विज़िट — बुधवार',
    detailEn: 'PHC visit — Wednesdays',
    phone: '9651035021',
  },
  {
    id: 'sewak',
    icon: Users,
    roleHi: 'पंचायत सेवक',
    roleEn: 'Panchayat Sewak',
    nameHi: 'श्री रामपाल',
    nameEn: 'Shri Rampal',
    detailHi: 'वार्ड 6-10',
    detailEn: 'Ward 6-10',
    phone: '9651035021',
  },
  {
    id: 'vdo',
    icon: Building2,
    roleHi: 'विलेज डेवलपमेंट ऑफिसर (वीडीओ)',
    roleEn: 'Village Development Officer (VDO)',
    nameHi: 'ब्लॉक शंकरगढ़',
    nameEn: 'Block Shankargarh',
    detailHi: 'कार्यालय समय',
    detailEn: 'Office hours',
    hoursHi: 'सुबह 10 – शाम 5',
    hoursEn: '10 AM – 5 PM',
  },
]

interface PreparednessTip {
  id: string
  icon: typeof Phone
  emoji: string
  textHi: string
  textEn: string
}

const PREPAREDNESS_TIPS: PreparednessTip[] = [
  {
    id: 'tip-1',
    icon: Phone,
    emoji: '📞',
    textHi: 'इन नंबरों को अपने मोबाइल में सहेज कर रखें',
    textEn: 'Keep these numbers saved in your mobile',
  },
  {
    id: 'tip-2',
    icon: Flashlight,
    emoji: '🔦',
    textHi: 'बिजली कटौती के लिए टॉर्च व मोमबत्ती तैयार रखें',
    textEn: 'Keep torch & candles ready for power cuts',
  },
  {
    id: 'tip-3',
    icon: BriefcaseMedical,
    emoji: '💊',
    textHi: 'घर पर बुनियादी प्राथमिक-चिकित्सा किट रखें',
    textEn: 'Keep basic first-aid kit at home',
  },
  {
    id: 'tip-4',
    icon: MapPin,
    emoji: '🚨',
    textHi: 'आपातकाल में अपना स्थान परिवार के साथ साझा करें',
    textEn: 'Share your location with family during emergencies',
  },
]

export function EmergencyContacts() {
  const { locale } = useI18n()
  const isHi = locale === 'hi'

  // Resolve the WATER entry's numbers field bilingually
  const waterNumbers = isHi ? 'पंचायत' : 'Panchayat'

  return (
    <section
      id="emergency-contacts"
      className="py-16 md:py-24 bg-gradient-to-b from-background via-red-950/5 to-background relative overflow-hidden"
    >
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-amber-500 to-red-600 opacity-50" />
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-red-500/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        {/* ── Section Header ── */}
        <ScrollReveal delay={0.1}>
          <div className="mb-12 text-center">
            <Badge variant="outline" className="mb-4 gap-2 px-4 py-1.5 text-sm border-red-300 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300 dark:border-red-900/50 hover:bg-red-100 transition-colors">
              <ShieldAlert className="h-4 w-4" />
              {isHi ? 'आपातकालीन संपर्क' : 'Emergency Contacts'}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold section-heading">
              {isHi ? 'आपातकालीन संपर्क' : 'Emergency Contacts'}
            </h2>
            <p className="text-base text-muted-foreground mt-4 max-w-2xl mx-auto leading-relaxed">
              {isHi
                ? 'ग्राम पंचायत चंद्रा और आस-पास की आपातकालीन सेवाएँ'
                : 'Emergency services for GP Chandra and nearby areas'}
            </p>
          </div>
        </ScrollReveal>

        {/* ── Critical Emergency Numbers grid ── */}
        <ScrollReveal delay={0.15}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {EMERGENCY_NUMBERS.map((item, idx) => {
              const Icon = item.icon
              const displayNumbers =
                item.id === 'water' ? waterNumbers : item.numbers
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{
                    duration: 0.4,
                    ease: 'easeOut',
                    delay: 0.05 * idx,
                  }}
                >
                  <Card className={`h-full border-border/50 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group bg-gradient-to-br ${SEVERITY_GRADIENT[item.severity]} ${SEVERITY_BORDER[item.severity]}`}>
                    <CardContent className="p-5 flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-2">
                        <div
                          className={`h-11 w-11 rounded-xl grid place-items-center shrink-0 ${SEVERITY_ICON_WRAP[item.severity]} transition-transform group-hover:scale-110`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] border ${SEVERITY_STYLES[item.severity]}`}
                        >
                          {item.severity === 'critical'
                            ? isHi
                              ? 'गंभीर'
                              : 'Critical'
                            : item.severity === 'helpline'
                              ? isHi
                                ? 'हेल्पलाइन'
                                : 'Helpline'
                              : isHi
                                ? 'उपयोगिता'
                                : 'Utility'}
                        </Badge>
                      </div>
                      <div>
                        <div className="text-sm font-semibold leading-tight">
                          {isHi ? item.nameHi : item.nameEn}
                          <span className="text-muted-foreground/60 font-normal">
                            {' / '}
                            {isHi ? item.nameEn : item.nameHi}
                          </span>
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                          <span aria-hidden>{item.emoji}</span>
                          {isHi ? item.noteHi : item.noteEn}
                        </div>
                      </div>
                      <a
                        href={item.telHref}
                        className="group/tel mt-auto inline-flex items-center justify-between gap-2 rounded-xl border border-border/50 bg-white/60 dark:bg-white/5 px-4 py-2.5 hover:bg-primary/5 hover:border-primary/30 transition-all duration-200 focus-ring backdrop-blur-sm"
                      >
                        <span className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-primary" />
                          <span className={`text-lg font-bold tracking-tight text-foreground ${item.severity === 'critical' ? 'emergency-pulse' : ''}`}>
                            {displayNumbers}
                          </span>
                        </span>
                        <span className="text-[10px] text-muted-foreground group-hover/tel:text-primary transition-colors">
                          {isHi ? 'कॉल करें' : 'Call'}
                        </span>
                      </a>
                      <div className="text-[10px] text-muted-foreground leading-tight">
                        {isHi ? item.subHi : item.subEn}
                        <span className="text-muted-foreground/50">
                          {' / '}
                          {isHi ? item.subEn : item.subHi}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </ScrollReveal>

        {/* ── Nearby Health Facilities ── */}
        <ScrollReveal delay={0.2}>
          <Card className="mb-8 border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500" />
            <CardContent className="pt-6">
              <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-green-500/10 grid place-items-center">
                    <Hospital className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-base font-semibold">
                    {isHi
                      ? 'आस-पास की स्वास्थ्य सुविधाएँ'
                      : 'Nearby Health Facilities'}
                  </h3>
                </div>
                <Badge variant="outline" className="text-[10px] gap-1.5">
                  <MapPin className="h-3 w-3" />
                  {isHi ? 'शंकरगढ़ / प्रयागराज' : 'Shankargarh / Prayagraj'}
                </Badge>
              </div>
              <div className="grid md:grid-cols-3 gap-5">
                {HEALTH_FACILITIES.map((f, idx) => {
                  const Icon = f.icon
                  return (
                    <motion.div
                      key={f.id}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-40px' }}
                      transition={{
                        duration: 0.4,
                        ease: 'easeOut',
                        delay: 0.06 * idx,
                      }}
                      className="p-5 rounded-xl border border-border/40 bg-gradient-to-br from-green-50/50 to-white dark:from-green-950/10 dark:to-card hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                    >
                      <div className="flex items-start gap-3 mb-4">
                        <div className="h-11 w-11 rounded-xl bg-green-500/10 grid place-items-center shrink-0 text-green-600 dark:text-green-400">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold leading-tight">
                            {isHi ? f.nameHi : f.nameEn}
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {f.distance}
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-[10px] mb-4 border-green-200 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300 dark:border-green-900/50"
                      >
                        {isHi ? f.tagHi : f.tagEn}
                      </Badge>
                      <div className="space-y-2 text-xs text-muted-foreground">
                        <div className="flex items-start gap-2">
                          <Clock className="h-3.5 w-3.5 mt-0.5 shrink-0 text-green-600/70 dark:text-green-400/70" />
                          <span>
                            {isHi ? f.detail1Hi : f.detail1En}
                            <span className="text-muted-foreground/50">
                              {' / '}
                              {isHi ? f.detail1En : f.detail1Hi}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Stethoscope className="h-3.5 w-3.5 mt-0.5 shrink-0 text-green-600/70 dark:text-green-400/70" />
                          <span>
                            {isHi ? f.detail2Hi : f.detail2En}
                            <span className="text-muted-foreground/50">
                              {' / '}
                              {isHi ? f.detail2En : f.detail2Hi}
                            </span>
                          </span>
                        </div>
                        {f.beds && (
                          <div className="flex items-start gap-2">
                            <Bed className="h-3.5 w-3.5 mt-0.5 shrink-0 text-green-600/70 dark:text-green-400/70" />
                            <span>
                              {isHi ? `${f.beds} बिस्तर` : `${f.beds} beds`}
                            </span>
                          </div>
                        )}
                        {f.phone && (
                          <div className="flex items-start gap-2">
                            <Phone className="h-3.5 w-3.5 mt-0.5 shrink-0 text-green-600/70 dark:text-green-400/70" />
                            <a
                              href={`tel:${f.phone.replace(/[^+\d]/g, '')}`}
                              className="hover:text-primary hover:underline transition-colors"
                            >
                              {f.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* ── Village-Level First Responders ── */}
        <ScrollReveal delay={0.25}>
          <Card className="mb-8 border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />
            <CardContent className="pt-6">
              <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-blue-500/10 grid place-items-center">
                    <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-base font-semibold">
                    {isHi
                      ? 'ग्राम-स्तरीय प्रथम प्रतिक्रियादाता'
                      : 'Village-Level First Responders'}
                  </h3>
                </div>
                <Badge variant="outline" className="text-[10px] gap-1.5">
                  <Users className="h-3 w-3" />
                  {isHi ? 'ग्राम चंद्रा' : 'Village Chandra'}
                </Badge>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {FIRST_RESPONDERS.map((r, idx) => {
                  const Icon = r.icon
                  return (
                    <motion.div
                      key={r.id}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-40px' }}
                      transition={{
                        duration: 0.4,
                        ease: 'easeOut',
                        delay: 0.05 * idx,
                      }}
                      className="p-5 rounded-xl border border-border/40 bg-gradient-to-br from-blue-50/50 to-white dark:from-blue-950/10 dark:to-card hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col gap-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-xl bg-blue-500/10 grid place-items-center shrink-0 text-blue-600 dark:text-blue-400">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground leading-tight">
                          {isHi ? r.roleHi : r.roleEn}
                        </div>
                      </div>
                      <div className="text-sm font-medium">
                        {isHi ? r.nameHi : r.nameEn}
                        <span className="text-muted-foreground/60 font-normal">
                          {' / '}
                          {isHi ? r.nameEn : r.nameHi}
                        </span>
                      </div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {isHi ? r.detailHi : r.detailEn}
                        {r.hoursHi && (
                          <span className="text-muted-foreground/60">
                            {' '}
                            —{' '}
                            <Clock className="inline h-3 w-3 mr-0.5" />
                            {isHi ? r.hoursHi : r.hoursEn}
                          </span>
                        )}
                      </div>
                      {r.phone && (
                        <a
                          href={`tel:${r.phone.replace(/[^+\d]/g, '')}`}
                          className="mt-auto inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline focus-ring rounded transition-colors"
                        >
                          <Phone className="h-3 w-3" />
                          {r.phone}
                        </a>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* ── Emergency Preparedness Tips ── */}
        <ScrollReveal delay={0.3}>
          <Card className="mb-10 border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500" />
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-9 w-9 rounded-xl bg-amber-500/10 grid place-items-center">
                  <BriefcaseMedical className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-base font-semibold">
                  {isHi
                    ? 'आपातकालीन तैयारी सुझाव'
                    : 'Emergency Preparedness Tips'}
                </h3>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {PREPAREDNESS_TIPS.map((tip, idx) => {
                  const Icon = tip.icon
                  return (
                    <motion.div
                      key={tip.id}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-40px' }}
                      transition={{
                        duration: 0.4,
                        ease: 'easeOut',
                        delay: 0.05 * idx,
                      }}
                      className="p-5 rounded-xl border border-border/40 bg-gradient-to-br from-amber-50/50 to-white dark:from-amber-950/10 dark:to-card hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col gap-2.5"
                    >
                      <div className="flex items-center gap-2.5">
                        <span aria-hidden className="text-lg">
                          {tip.emoji}
                        </span>
                        <div className="h-8 w-8 rounded-lg bg-amber-500/10 grid place-items-center shrink-0 text-amber-600 dark:text-amber-400">
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                      </div>
                      <div className="text-xs leading-relaxed text-foreground/90">
                        {isHi ? tip.textHi : tip.textEn}
                        <span className="block text-muted-foreground/60 mt-1 text-[11px]">
                          {isHi ? tip.textEn : tip.textHi}
                        </span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* ── Bottom CTA — UP-112 single emergency number ── */}
        <ScrollReveal delay={0.35}>
          <Card className="border-border/50 shadow-xl overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-red-600 via-white to-green-600" />
            <CardContent className="p-6 md:p-10">
              <div className="flex flex-col md:flex-row items-center gap-8 md:gap-10">
                {/* Big pulse-glow 112 number */}
                <div className="shrink-0 flex flex-col items-center gap-3">
                  <a
                    href="tel:112"
                    className="pulse-glow h-28 w-28 md:h-32 md:w-32 rounded-full grid place-items-center bg-gradient-to-br from-red-600 to-red-700 text-white shadow-2xl shadow-red-600/30 hover:shadow-red-600/50 hover:scale-105 transition-all duration-300"
                    role="img"
                    aria-label="112 emergency number"
                  >
                    <span className="text-4xl md:text-5xl font-extrabold tracking-tight">
                      112
                    </span>
                  </a>
                  <Badge
                    variant="outline"
                    className="text-[10px] border-red-200 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/50 gap-1"
                  >
                    <Siren className="h-3 w-3" />
                    UP-112
                  </Badge>
                </div>

                {/* CTA copy + Call button */}
                <div className="flex-1 text-center md:text-left min-w-0">
                  <h3 className="text-xl md:text-2xl font-bold leading-tight">
                    {isHi
                      ? 'एक नंबर, सभी आपातकालीन सेवाएँ'
                      : 'One number, all emergency services'}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-3 max-w-xl leading-relaxed">
                    {isHi
                      ? 'पुलिस, अग्निशमन एवं एम्बुलेंस — तीनों सेवाएँ एक ही नंबर पर। यूपी-112 आपातकालीन सेवा राज्य सरकार द्वारा निःशुल्क प्रदान की जाती है।'
                      : 'Police, Fire, and Ambulance — all three services on a single number. The UP-112 emergency service is provided free of charge by the State Government.'}
                  </p>

                  <div className="mt-5 flex flex-col sm:flex-row items-center gap-3 md:justify-start justify-center">
                    <Button asChild size="lg" className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 hover:shadow-red-600/30 transition-all duration-300 rounded-xl px-8">
                      <a href="tel:112" className="gap-2">
                        <Phone className="h-4 w-4" />
                        {isHi ? '112 कॉल करें' : 'Call 112'}
                      </a>
                    </Button>
                    <a
                      href="https://uppolice.gov.in/page/hi/up-112"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline inline-flex items-center gap-1 focus-ring"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {isHi ? 'यूपी-112 के बारे में और' : 'More about UP-112'}
                    </a>
                  </div>

                  <div className="mt-4 text-[11px] text-muted-foreground/70 flex items-center justify-center md:justify-start gap-1.5">
                    <Truck className="h-3 w-3" />
                    {isHi
                      ? 'राज्य सरकार द्वारा प्रायोजित'
                      : 'Sponsored by State Government'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>
    </section>
  )
}
