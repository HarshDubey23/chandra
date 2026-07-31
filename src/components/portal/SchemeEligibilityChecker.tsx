'use client'
import { useEffect, useMemo, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  ClipboardCheck,
  HandCoins,
  Home,
  Droplets,
  Heart,
  GraduationCap,
  Users,
  Tractor,
  Wallet,
  HeartHandshake,
  Accessibility,
  FileText,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  Frown,
  Building2,
  Monitor,
  Sparkles,
  Info,
} from 'lucide-react'
import { ScrollReveal } from './ScrollReveal'

/* ──────────────────────────────────────────────────────────────────────
   Scheme Eligibility Checker — Gram Panchayat Chandra
   A 5-step bilingual (hi/en) wizard that asks citizens a few questions
   and shows which government schemes they are eligible for. Purely
   client-side — answers persisted to localStorage so users can resume.
   ────────────────────────────────────────────────────────────────────── */

// ── Types ──────────────────────────────────────────────────────────────

type Category =
  | 'income'
  | 'housing'
  | 'water'
  | 'health'
  | 'education'
  | 'pension'
  | 'all'

type IncomeBand = '0-1L' | '1-3L' | '3-5L' | '5L+'
type SocialCategory = 'general' | 'obc' | 'sc' | 'st' | 'ews'
type AgeBand = 'under18' | '18-40' | '40-60' | '60plus'
type Gender = 'male' | 'female' | 'other'
type Occupation =
  | 'farmer'
  | 'laborer'
  | 'govt-employee'
  | 'private-employee'
  | 'self-employed'
  | 'unemployed'
  | 'student'
  | 'retired'
type YesNo = 'yes' | 'no'

interface Answers {
  category: Category | null
  income: IncomeBand | null
  socialCategory: SocialCategory | null
  familySize: number | null
  age: AgeBand | null
  gender: Gender | null
  occupation: Occupation | null
  hasRationCard: YesNo | null
  hasAyushmanCard: YesNo | null
  hasPuccaHouse: YesNo | null
  hasTapWater: YesNo | null
  isWidow: YesNo | null
  isDisabled: YesNo | null
  isSenior: YesNo | null
  isSingleWoman: YesNo | null
}

const INITIAL_ANSWERS: Answers = {
  category: null,
  income: null,
  socialCategory: null,
  familySize: null,
  age: null,
  gender: null,
  occupation: null,
  hasRationCard: null,
  hasAyushmanCard: null,
  hasPuccaHouse: null,
  hasTapWater: null,
  isWidow: null,
  isDisabled: null,
  isSenior: null,
  isSingleWoman: null,
}

const STORAGE_KEY = 'gpch_eligibility_answers'
const STEP_STORAGE_KEY = 'gpch_eligibility_step'

// ── Eligibility rule interface ─────────────────────────────────────────

interface SchemeRule {
  id: string
  nameHi: string
  nameEn: string
  icon: typeof HandCoins
  descriptionHi: string
  descriptionEn: string
  benefitHi: string
  benefitEn: string
  applyUrl: string
  applyMethodHi: string
  applyMethodEn: string
  documentsHi: string[]
  documentsEn: string[]
  categories: Category[]
  check: (a: Answers) => boolean
}

// ── Helpers ─────────────────────────────────────────────────────────────

const isLowIncome = (a: Answers) => a.income === '0-1L' || a.income === '1-3L'
const isVeryLowIncome = (a: Answers) => a.income === '0-1L'
const isLandlessOrWorker = (a: Answers) =>
  a.occupation === 'farmer' ||
  a.occupation === 'laborer' ||
  a.occupation === 'unemployed'
const isAdult = (a: Answers) =>
  a.age === '18-40' || a.age === '40-60' || a.age === '60plus'
const isMarginalCategory = (a: Answers) =>
  a.socialCategory === 'sc' || a.socialCategory === 'st' || a.socialCategory === 'ews'

// ── Eligibility rules — 10 schemes ──────────────────────────────────────

const ELIGIBILITY_RULES: SchemeRule[] = [
  {
    id: 'mgnrega',
    nameHi: 'मनरेगा (MGNREGA)',
    nameEn: 'MGNREGA',
    icon: HandCoins,
    descriptionHi:
      'महात्मा गांधी राष्ट्रीय ग्रामीण रोजगार गारंटी अधिनियम — प्रति परिवार वर्ष में 100 दिन काम की गारंटी।',
    descriptionEn:
      'Mahatma Gandhi NREGA — 100 days of guaranteed wage employment per household per year.',
    benefitHi: 'वर्तमान मजदूरी दर ₹257/दिन (उ.प्र.) — वर्ष में 100 दिन काम की गारंटी',
    benefitEn: 'Current wage rate ₹257/day (UP) — 100 days of guaranteed work per year',
    applyUrl: 'https://nrega.nic.in',
    applyMethodHi: 'पंचायत कार्यालय',
    applyMethodEn: 'Panchayat Office',
    documentsHi: ['आधार कार्ड', 'बैंक पासबुक', 'पासपोर्ट आकार फोटो', 'निवास प्रमाणपत्र'],
    documentsEn: ['Aadhaar card', 'Bank passbook', 'Passport-size photo', 'Residence certificate'],
    categories: ['income', 'all'],
    check: (a) => isLandlessOrWorker(a) && isAdult(a),
  },
  {
    id: 'pmay-g',
    nameHi: 'पीएमआवास-ग्रामीण (PMAY-G)',
    nameEn: 'PMAY-G',
    icon: Home,
    descriptionHi:
      'प्रधानमंत्री आवास योजना — ग्रामीण। पक्के मकान के निर्माण हेतु वित्तीय सहायता।',
    descriptionEn:
      'PM Awaas Yojana - Gramin. Financial assistance for construction of pucca house.',
    benefitHi: '₹1.20 लाख की सहायता — 4 किस्तों में (मैदानी क्षेत्र)',
    benefitEn: '₹1.20 lakh assistance — in 4 installments (plain areas)',
    applyUrl: 'https://pmayg.nic.in',
    applyMethodHi: 'पंचायत कार्यालय',
    applyMethodEn: 'Panchayat Office',
    documentsHi: ['आधार कार्ड', 'बैंक पासबुक', 'भूमि पत्र', 'आय प्रमाणपत्र', 'जाति प्रमाणपत्र (लागू होने पर)'],
    documentsEn: ['Aadhaar card', 'Bank passbook', 'Land document', 'Income certificate', 'Caste certificate (if applicable)'],
    categories: ['housing', 'all'],
    check: (a) =>
      a.hasPuccaHouse === 'no' && (isLowIncome(a) || isMarginalCategory(a)),
  },
  {
    id: 'jjm',
    nameHi: 'जल जीवन मिशन (JJM)',
    nameEn: 'Jal Jeevan Mission',
    icon: Droplets,
    descriptionHi:
      'हर घर जल जोड़ — ग्रामीण घरों तक नल से पीने योग्य पानी का कनेक्शन।',
    descriptionEn:
      'Har Ghar Jal — piped potable water connection to rural households.',
    benefitHi: 'घर तक नल का पानी — नि:शुल्क कनेक्शन (BPL परिवारों हेतु)',
    benefitEn: 'Tap water at home — free connection (for BPL households)',
    applyUrl: 'https://jaljeevanmission.gov.in',
    applyMethodHi: 'पंचायत कार्यालय',
    applyMethodEn: 'Panchayat Office',
    documentsHi: ['आधार कार्ड', 'निवास प्रमाणपत्र', 'बैंक पासबुक (वैकल्पिक)', 'परिवार विवरण पत्र'],
    documentsEn: ['Aadhaar card', 'Residence certificate', 'Bank passbook (optional)', 'Family details form'],
    categories: ['water', 'all'],
    check: (a) => a.hasTapWater === 'no',
  },
  {
    id: 'ayushman',
    nameHi: 'आयुष्मान भारत (PM-JAY)',
    nameEn: 'Ayushman Bharat (PM-JAY)',
    icon: Heart,
    descriptionHi:
      'प्रधानमंत्री जन आरोग्य योजना — परिवार के सभी सदस्यों हेतु प्रति वर्ष ₹5 लाख तक का निःशुल्क स्वास्थ्य बीमा।',
    descriptionEn:
      'PM Jan Arogya Yojana — up to ₹5 lakh per family per year of free health insurance.',
    benefitHi: 'प्रति वर्ष ₹5 लाख तक निःशुल्क उपचार — कवर्ड अस्पतालों में',
    benefitEn: 'Up to ₹5 lakh/year free treatment — at empanelled hospitals',
    applyUrl: 'https://pmjay.gov.in',
    applyMethodHi: 'जन सेवा केंद्र',
    applyMethodEn: 'CSC (Common Service Centre)',
    documentsHi: ['आधार कार्ड', 'राशन कार्ड', 'मोबाइल नंबर', 'पासपोर्ट आकार फोटो'],
    documentsEn: ['Aadhaar card', 'Ration card', 'Mobile number', 'Passport-size photo'],
    categories: ['health', 'all'],
    check: (a) => a.hasAyushmanCard === 'no' && (a.income !== '5L+'),
  },
  {
    id: 'pm-kisan',
    nameHi: 'पीएम-किसान सम्मान निधि',
    nameEn: 'PM-Kisan Samman Nidhi',
    icon: Tractor,
    descriptionHi:
      'छोटे एवं सीमांत किसानों को वर्ष में ₹6,000 आय सहायता — तीन किस्तों में।',
    descriptionEn:
      '₹6,000/year income support to small & marginal farmers — in 3 installments.',
    benefitHi: 'वर्ष में ₹6,000 — तीन किस्तों में सीधे बैंक खाते में',
    benefitEn: '₹6,000/year — in 3 installments, direct to bank account',
    applyUrl: 'https://pmkisan.gov.in',
    applyMethodHi: 'ऑनलाइन आवेदन',
    applyMethodEn: 'Online Application',
    documentsHi: ['आधार कार्ड', 'बैंक पासबुक', 'भूमि का दस्तावेज़ (खतौनी)', 'मोबाइल नंबर'],
    documentsEn: ['Aadhaar card', 'Bank passbook', 'Land record (khatouni)', 'Mobile number'],
    categories: ['income', 'all'],
    check: (a) => a.occupation === 'farmer',
  },
  {
    id: 'ignoaps',
    nameHi: 'इंदिरा गांधी राष्ट्रीय वृद्धावस्था पेंशन (IGNOAPS)',
    nameEn: 'Old Age Pension (IGNOAPS)',
    icon: Wallet,
    descriptionHi:
      'बीपीएल परिवार के 60 वर्ष से अधिक आयु वाले व्यक्तियों को मासिक पेंशन।',
    descriptionEn:
      'Monthly pension for BPL individuals aged 60+ years.',
    benefitHi: 'मासिक ₹200 (केंद्र) + ₹500 (राज्य) = ₹700/माह — 60+ वर्ष के लिए',
    benefitEn: 'Monthly ₹200 (Centre) + ₹500 (State) = ₹700/month — for age 60+',
    applyUrl: 'https://nsap.nic.in',
    applyMethodHi: 'पंचायत कार्यालय',
    applyMethodEn: 'Panchayat Office',
    documentsHi: ['आधार कार्ड', 'आयु प्रमाणपत्र', 'आय प्रमाणपत्र (BPL)', 'बैंक पासबुक', 'पासपोर्ट आकार फोटो'],
    documentsEn: ['Aadhaar card', 'Age proof', 'Income proof (BPL)', 'Bank passbook', 'Passport-size photo'],
    categories: ['pension', 'all'],
    check: (a) => a.age === '60plus' || a.isSenior === 'yes',
  },
  {
    id: 'widow-pension',
    nameHi: 'इंदिरा गांधी राष्ट्रीय विधवा पेंशन',
    nameEn: 'Widow Pension (IGNWPS)',
    icon: HeartHandshake,
    descriptionHi:
      '40-79 वर्ष की विधवा महिलाओं को मासिक पेंशन (BPL श्रेणी)।',
    descriptionEn:
      'Monthly pension for widowed women aged 40-79 (BPL category).',
    benefitHi: 'मासिक ₹300 (केंद्र) + ₹500 (राज्य) = ₹800/माह',
    benefitEn: 'Monthly ₹300 (Centre) + ₹500 (State) = ₹800/month',
    applyUrl: 'https://nsap.nic.in',
    applyMethodHi: 'पंचायत कार्यालय',
    applyMethodEn: 'Panchayat Office',
    documentsHi: ['आधार कार्ड', 'पति के मृत्यु प्रमाणपत्र', 'आय प्रमाणपत्र (BPL)', 'बैंक पासबुक', 'पासपोर्ट आकार फोटो'],
    documentsEn: ['Aadhaar card', "Husband's death certificate", 'Income proof (BPL)', 'Bank passbook', 'Passport-size photo'],
    categories: ['pension', 'all'],
    check: (a) => a.isWidow === 'yes',
  },
  {
    id: 'disability-pension',
    nameHi: 'इंदिरा गांधी राष्ट्रीय विकलांगता पेंशन (IGNDPS)',
    nameEn: 'Disability Pension (IGNDPS)',
    icon: Accessibility,
    descriptionHi:
      '18-79 वर्ष के 40%+ विकलांग वाले व्यक्तियों को मासिक पेंशन (BPL श्रेणी)।',
    descriptionEn:
      'Monthly pension for persons with 40%+ disability aged 18-79 (BPL category).',
    benefitHi: 'मासिक ₹300 (केंद्र) + ₹500 (राज्य) = ₹800/माह',
    benefitEn: 'Monthly ₹300 (Centre) + ₹500 (State) = ₹800/month',
    applyUrl: 'https://nsap.nic.in',
    applyMethodHi: 'पंचायत कार्यालय',
    applyMethodEn: 'Panchayat Office',
    documentsHi: ['आधार कार्ड', 'विकलांगता प्रमाणपत्र (40%+)', 'आय प्रमाणपत्र (BPL)', 'बैंक पासबुक', 'पासपोर्ट आकार फोटो'],
    documentsEn: ['Aadhaar card', 'Disability certificate (40%+)', 'Income proof (BPL)', 'Bank passbook', 'Passport-size photo'],
    categories: ['pension', 'all'],
    check: (a) => a.isDisabled === 'yes',
  },
  {
    id: 'scholarship',
    nameHi: 'पोस्ट-मैट्रिक छात्रवृत्ति (Post-Matric Scholarship)',
    nameEn: 'Post-Matric Scholarship',
    icon: GraduationCap,
    descriptionHi:
      'SC/ST/OBC/Minority छात्रों के लिए मैट्रिक के बाद की पढ़ाई हेतु छात्रवृत्ति।',
    descriptionEn:
      'Scholarship for SC/ST/OBC/Minority students for post-matric studies.',
    benefitHi: 'कोर्स के अनुसार ₹1,000–₹5,000/वर्ष + विशेष शुल्क प्रतिपूर्ति',
    benefitEn: '₹1,000–₹5,000/year depending on course + fee reimbursement',
    applyUrl: 'https://scholarships.gov.in',
    applyMethodHi: 'ऑनलाइन आवेदन',
    applyMethodEn: 'Online Application',
    documentsHi: ['आधार कार्ड', 'मार्कशीट (अंतिम उत्तीर्ण कक्षा)', 'आय प्रमाणपत्र', 'जाति प्रमाणपत्र', 'बैंक पासबुक', 'संस्था का प्रमाणपत्र'],
    documentsEn: ['Aadhaar card', 'Mark sheet (last passed class)', 'Income certificate', 'Caste certificate', 'Bank passbook', 'Institution certificate'],
    categories: ['education', 'all'],
    check: (a) =>
      (a.age === 'under18' || a.age === '18-40') &&
      a.occupation === 'student',
  },
  {
    id: 'nfbs',
    nameHi: 'राष्ट्रीय परिवार लाभ योजना (NFBS)',
    nameEn: 'National Family Benefit Scheme (NFBS)',
    icon: Users,
    descriptionHi:
      'BPL परिवार के मुखिया की मृत्यु (18-60 वर्ष) पर एकमुश्त सहायता राशि।',
    descriptionEn:
      'Lumpsum assistance on death (18-60 yrs) of BPL family primary breadwinner.',
    benefitHi: 'एकमुश्त ₹20,000 सहायता — मृत्यु के बाद',
    benefitEn: 'One-time ₹20,000 assistance — after death',
    applyUrl: 'https://nsap.nic.in',
    applyMethodHi: 'पंचायत कार्यालय',
    applyMethodEn: 'Panchayat Office',
    documentsHi: ['आधार कार्ड', 'मृत्यु प्रमाणपत्र', 'आय प्रमाणपत्र (BPL)', 'बैंक पासबुक', 'पासपोर्ट आकार फोटो'],
    documentsEn: ['Aadhaar card', 'Death certificate', 'Income proof (BPL)', 'Bank passbook', 'Passport-size photo'],
    categories: ['pension', 'all'],
    check: (a) => isVeryLowIncome(a),
  },
]

// ── Static step metadata ────────────────────────────────────────────────

const TOTAL_STEPS = 5

interface StepMeta {
  num: number
  titleHi: string
  titleEn: string
  shortHi: string
  shortEn: string
}

const STEP_META: StepMeta[] = [
  {
    num: 1,
    titleHi: 'सहायता श्रेणी चुनें',
    titleEn: 'Choose Assistance Category',
    shortHi: 'श्रेणी',
    shortEn: 'Category',
  },
  {
    num: 2,
    titleHi: 'परिवार की जानकारी',
    titleEn: 'Family Information',
    shortHi: 'परिवार',
    shortEn: 'Family',
  },
  {
    num: 3,
    titleHi: 'व्यक्तिगत विवरण',
    titleEn: 'Personal Details',
    shortHi: 'व्यक्ति',
    shortEn: 'Personal',
  },
  {
    num: 4,
    titleHi: 'वर्तमान लाभ',
    titleEn: 'Current Benefits',
    shortHi: 'लाभ',
    shortEn: 'Benefits',
  },
  {
    num: 5,
    titleHi: 'विशेष श्रेणियाँ',
    titleEn: 'Special Categories',
    shortHi: 'विशेष',
    shortEn: 'Special',
  },
]

// ── Sub-component: option pills for radio choices ───────────────────────

interface RadioOption {
  value: string
  labelHi: string
  labelEn: string
  hintHi?: string
  hintEn?: string
}

interface RadioChoicesProps {
  options: RadioOption[]
  value: string | null
  onChange: (v: string) => void
  name: string
  legendHi: string
  legendEn: string
  locale: 'hi' | 'en'
}

function RadioChoices({
  options,
  value,
  onChange,
  name,
  legendHi,
  legendEn,
  locale,
}: RadioChoicesProps) {
  return (
    <fieldset className="space-y-3">
      <legend className="sr-only">{locale === 'hi' ? legendHi : legendEn}</legend>
      <RadioGroup
        value={value ?? ''}
        onValueChange={onChange}
        name={name}
        className="grid gap-2.5"
        aria-label={locale === 'hi' ? legendHi : legendEn}
      >
        {options.map((opt) => {
          const selected = value === opt.value
          return (
            <Label
              key={opt.value}
              htmlFor={`${name}-${opt.value}`}
              className={cnRadioLabel(selected)}
            >
              <RadioGroupItem
                id={`${name}-${opt.value}`}
                value={opt.value}
                className="mt-0.5"
              />
              <span className="flex-1">
                <span className="block text-sm font-medium leading-tight">
                  {locale === 'hi' ? opt.labelHi : opt.labelEn}
                </span>
                {opt.hintHi && opt.hintEn && (
                  <span className="block text-[11px] text-muted-foreground mt-0.5">
                    {locale === 'hi' ? opt.hintHi : opt.hintEn}
                  </span>
                )}
              </span>
            </Label>
          )
        })}
      </RadioGroup>
    </fieldset>
  )
}

function cnRadioLabel(selected: boolean) {
  return [
    'flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-all focus-ring',
    selected
      ? 'border-primary bg-primary/5 shadow-sm'
      : 'border-border hover:border-primary/40 hover:bg-secondary/40',
  ].join(' ')
}

// ── Main component ──────────────────────────────────────────────────────

export function SchemeEligibilityChecker() {
  const { locale } = useI18n()
  const isHi = locale === 'hi'

  const [currentStep, setCurrentStep] = useState<number>(1)
  const [answers, setAnswers] = useState<Answers>(INITIAL_ANSWERS)
  const [hydrated, setHydrated] = useState(false)
  const [showResume, setShowResume] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const stepRaw = localStorage.getItem(STEP_STORAGE_KEY)
      if (raw) {
        const saved = JSON.parse(raw) as Partial<Answers>
        const merged: Answers = { ...INITIAL_ANSWERS, ...saved }
        const hasAnyAnswer = (Object.keys(merged) as (keyof Answers)[]).some(
          (k) => merged[k] !== null && merged[k] !== undefined,
        )
        if (hasAnyAnswer) {
          setAnswers(merged)
          if (stepRaw) {
            const s = Number(stepRaw)
            if (s >= 1 && s <= TOTAL_STEPS) setCurrentStep(s)
          }
          // Show resume option since user has saved answers
          setShowResume(true)
        }
      }
    } catch {
      // ignore malformed storage
    } finally {
      setHydrated(true)
    }
  }, [])

  // Persist answers
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(answers))
      localStorage.setItem(STEP_STORAGE_KEY, String(currentStep))
    } catch {
      // ignore
    }
  }, [answers, currentStep, hydrated])

  const progressValue = (currentStep / TOTAL_STEPS) * 100

  // Compute eligible schemes (only when on results step)
  const eligibleSchemes = useMemo<SchemeRule[]>(() => {
    return ELIGIBILITY_RULES.filter((rule) => {
      // Filter by category if user chose one (and it's not 'all')
      if (answers.category && answers.category !== 'all') {
        if (!rule.categories.includes(answers.category)) return false
      }
      return rule.check(answers)
    })
  }, [answers])

  const onResults = currentStep > TOTAL_STEPS

  // ── Step validation ───────────────────────────────────────────────────
  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 1:
        return answers.category !== null
      case 2:
        return (
          answers.income !== null &&
          answers.socialCategory !== null &&
          answers.familySize !== null &&
          answers.familySize >= 1 &&
          answers.familySize <= 20
        )
      case 3:
        return (
          answers.age !== null && answers.gender !== null && answers.occupation !== null
        )
      case 4:
        return (
          answers.hasRationCard !== null &&
          answers.hasAyushmanCard !== null &&
          answers.hasPuccaHouse !== null &&
          answers.hasTapWater !== null
        )
      case 5:
        return (
          answers.isWidow !== null &&
          answers.isDisabled !== null &&
          answers.isSenior !== null &&
          answers.isSingleWoman !== null
        )
      default:
        return false
    }
  }, [currentStep, answers])

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((s) => s + 1)
    } else if (currentStep === TOTAL_STEPS && canProceed) {
      setCurrentStep(TOTAL_STEPS + 1) // results
    }
  }

  const handlePrev = () => {
    if (onResults) {
      setCurrentStep(TOTAL_STEPS)
    } else if (currentStep > 1) {
      setCurrentStep((s) => s - 1)
    }
  }

  const handleReset = () => {
    setAnswers(INITIAL_ANSWERS)
    setCurrentStep(1)
    try {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(STEP_STORAGE_KEY)
    } catch {
      // ignore
    }
    setShowResume(false)
    toast.success(isHi ? 'रीसेट हो गया' : 'Reset complete')
  }

  const handleStartFresh = () => {
    setAnswers(INITIAL_ANSWERS)
    setCurrentStep(1)
    setShowResume(false)
    try {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(STEP_STORAGE_KEY)
    } catch {
      // ignore
    }
  }

  const handleResume = () => {
    setShowResume(false)
  }

  const setAnswer = <K extends keyof Answers>(key: K, val: Answers[K]) => {
    setAnswers((prev) => ({ ...prev, [key]: val }))
  }

  // ── Render step content ────────────────────────────────────────────────
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1Category
            answers={answers}
            setAnswer={setAnswer}
            isHi={isHi}
          />
        )
      case 2:
        return (
          <Step2Demographics
            answers={answers}
            setAnswer={setAnswer}
            isHi={isHi}
          />
        )
      case 3:
        return (
          <Step3Personal
            answers={answers}
            setAnswer={setAnswer}
            isHi={isHi}
          />
        )
      case 4:
        return (
          <Step4Benefits
            answers={answers}
            setAnswer={setAnswer}
            isHi={isHi}
          />
        )
      case 5:
        return (
          <Step5Special
            answers={answers}
            setAnswer={setAnswer}
            isHi={isHi}
          />
        )
      default:
        return null
    }
  }

  // ── Render results ─────────────────────────────────────────────────────
  const renderResults = () => {
    const count = eligibleSchemes.length
    return (
      <div className="space-y-5">
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 text-primary grid place-items-center shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {isHi
                ? `आपके उत्तरों के आधार पर, ${count} योजनाएँ पात्र हैं।`
                : `Based on your answers, ${count} scheme${count === 1 ? '' : 's'} eligible.`}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {isHi
                ? 'नीचे दी गई योजनाओं के लिए आवश्यक दस्तावेज़ तैयार करें और आवेदन करें।'
                : 'Prepare the required documents for the schemes listed below and apply.'}
            </p>
          </div>
        </div>

        {count === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center space-y-3">
              <div className="mx-auto h-14 w-14 rounded-full bg-muted text-muted-foreground grid place-items-center">
                <Frown className="h-7 w-7" />
              </div>
              <p className="text-base font-semibold">
                {isHi ? 'कोई योजना नहीं मिली' : 'No schemes found'}
              </p>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                {isHi
                  ? 'कृपया पंचायत कार्यालय से संपर्क करें — हो सकता है कि आप कुछ राज्य-विशिष्ट योजनाओं के लिए पात्र हों जो इस चेकर में शामिल नहीं हैं।'
                  : 'Please contact the panchayat office — you may be eligible for some state-specific schemes not covered by this checker.'}
              </p>
              <Button variant="outline" size="sm" className="mt-2 gap-1.5" asChild>
                <a href="tel:+919651035021">
                  <Building2 className="h-3.5 w-3.5" />
                  {isHi ? 'पंचायत कार्यालय से संपर्क करें' : 'Contact Panchayat Office'}
                </a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {eligibleSchemes.map((scheme, idx) => (
              <SchemeResultCard key={scheme.id} scheme={scheme} isHi={isHi} index={idx} />
            ))}
          </div>
        )}

        <div className="pt-2">
          <Button onClick={handleReset} variant="outline" className="gap-2 w-full sm:w-auto">
            <RotateCcw className="h-4 w-4" />
            {isHi ? 'फिर से शुरू करें' : 'Start Over'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <section
      id="eligibility"
      data-section="eligibility"
      className="section-premium py-16 md:py-20 border-b border-border/40"
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10">
          <Badge variant="outline" className="section-header-badge mb-3 gap-1.5">
            <ClipboardCheck className="h-3.5 w-3.5" />
            {isHi ? 'योजना पात्रता' : 'Scheme Eligibility'}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gradient-premium">
            {isHi ? 'मुझे कौन सी योजना उपलब्ध है?' : 'Which Scheme Can I Get?'}
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            {isHi
              ? 'कुछ प्रश्नों के उत्तर दें और जानें कि आप किन सरकारी योजनाओं के लिए पात्र हैं।'
              : 'Answer a few questions to find out which government schemes you are eligible for.'}
          </p>
          <Badge variant="secondary" className="gap-1.5 shadow-sm mt-4">
            <Sparkles className="h-3 w-3" />
            {isHi ? '5 चरण • ~2 मिनट' : '5 steps • ~2 min'}
          </Badge>
        </div>

        <ScrollReveal delay={0.1}>
          <Card className="border-border/70 shadow-md max-w-4xl mx-auto bouncy-in">
            <CardHeader className="pb-4">
              {/* Resume banner */}
              {hydrated && showResume && !onResults && (
                <div className="mb-3 rounded-lg border border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30 p-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-amber-900 dark:text-amber-200">
                      {isHi
                        ? 'पिछला उत्तर मिला — आगे बढ़ें या नए सिरे से शुरू करें।'
                        : 'Previous answers found — resume or start fresh.'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={handleResume}>
                      {isHi ? 'पुनः आरंभ करें' : 'Resume'}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleStartFresh}>
                      {isHi ? 'नया शुरू करें' : 'Start Fresh'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Progress bar + step indicator */}
              {!onResults && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="font-semibold text-foreground">
                      {isHi
                        ? `चरण ${currentStep} / ${TOTAL_STEPS} — ${STEP_META[currentStep - 1].titleHi}`
                        : `Step ${currentStep} / ${TOTAL_STEPS} — ${STEP_META[currentStep - 1].titleEn}`}
                    </span>
                    <span className="text-muted-foreground font-mono">
                      {Math.round(progressValue)}%
                    </span>
                  </div>
                  <Progress value={progressValue} className="h-2" />
                  <div className="flex items-center justify-between gap-1 pt-1">
                    {STEP_META.map((s) => {
                      const completed = s.num < currentStep
                      const current = s.num === currentStep
                      return (
                        <button
                          key={s.num}
                          type="button"
                          onClick={() => {
                            // Allow navigating back to completed steps only
                            if (s.num < currentStep) setCurrentStep(s.num)
                          }}
                          disabled={s.num > currentStep}
                          aria-label={isHi ? `चरण ${s.num}: ${s.shortHi}` : `Step ${s.num}: ${s.shortEn}`}
                          className={cnStepDot(completed, current)}
                        >
                          {completed ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : (
                            <span className="text-[10px] font-bold">{s.num}</span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </CardHeader>

            <CardContent>
              <AnimatePresence mode="wait">
                {onResults ? (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="mb-5">
                      <CardTitle className="text-lg">
                        {isHi ? 'आपके लिए पात्र योजनाएँ' : 'Eligible Schemes for You'}
                      </CardTitle>
                    </div>
                    {renderResults()}
                  </motion.div>
                ) : (
                  <motion.div
                    key={`step-${currentStep}`}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.25 }}
                  >
                    {renderStep()}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation */}
              {!onResults && (
                <>
                  <Separator className="my-5" />
                  <div className="flex items-center justify-between gap-3">
                    <Button
                      variant="ghost"
                      onClick={handlePrev}
                      disabled={currentStep === 1}
                      className="gap-1.5"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      {isHi ? 'पिछला' : 'Previous'}
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleReset}
                        className="gap-1.5"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">
                          {isHi ? 'रीसेट' : 'Reset'}
                        </span>
                      </Button>
                      <Button
                        onClick={handleNext}
                        disabled={!canProceed}
                        className="gap-1.5"
                      >
                        {currentStep === TOTAL_STEPS
                          ? isHi
                            ? 'परिणाम देखें'
                            : 'See Results'
                          : isHi
                            ? 'अगला'
                            : 'Next'}
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>
    </section>
  )
}

// ── Helper for step dot classes ──────────────────────────────────────────
function cnStepDot(completed: boolean, current: boolean) {
  return [
    'flex items-center justify-center h-8 w-8 rounded-full border-2 transition-all focus-ring',
    completed
      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
      : current
        ? 'border-primary text-primary bg-primary/10 shadow-sm scale-110'
        : 'border-border text-muted-foreground bg-background',
  ].join(' ')
}

// ── Scheme result card ───────────────────────────────────────────────────
function SchemeResultCard({
  scheme,
  isHi,
  index,
}: {
  scheme: SchemeRule
  isHi: boolean
  index: number
}) {
  const Icon = scheme.icon
  const isExternal = scheme.applyUrl.startsWith('http')
  const applyMethodIcon = scheme.applyMethodEn.includes('Online')
    ? Monitor
    : scheme.applyMethodEn.includes('CSC')
      ? Building2
      : Building2

  const handleApplyClick = () => {
    if (!isExternal) {
      toast.success(
        isHi ? 'पंचायत कार्यालय में संपर्क करें' : 'Contact panchayat office',
      )
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.07, 0.5) }}
    >
      <Card className="border-border/70 hover:border-primary/40 transition-all card-hover-lift shadow-sm overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0 shadow-sm">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base leading-tight">
                  {isHi ? scheme.nameHi : scheme.nameEn}
                </CardTitle>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {isHi ? scheme.nameEn : scheme.nameHi}
                </p>
              </div>
            </div>
            <Badge
              variant="secondary"
              className="gap-1 shrink-0 bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50"
            >
              <CheckCircle2 className="h-3 w-3" />
              {isHi ? 'पात्र' : 'Eligible'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-foreground/75 leading-relaxed">
            {isHi ? scheme.descriptionHi : scheme.descriptionEn}
          </p>

          {/* Benefit callout */}
          <div className="rounded-md border border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30 px-3 py-2">
            <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-100 leading-snug">
              <span className="inline-flex items-center gap-1.5">
                <Wallet className="h-3.5 w-3.5 shrink-0" />
                {isHi ? 'लाभ: ' : 'Benefit: '}
              </span>
              <span className="font-normal">
                {isHi ? scheme.benefitHi : scheme.benefitEn}
              </span>
            </p>
          </div>

          {/* Documents */}
          <div>
            <p className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              {isHi ? 'आवश्यक दस्तावेज़:' : 'Required documents:'}
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-muted-foreground">
              {(isHi ? scheme.documentsHi : scheme.documentsEn).map((d, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>

          <Separator />

          {/* Apply method + button */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge variant="outline" className="gap-1 text-[11px]">
              {(() => {
                const M = applyMethodIcon
                return <M className="h-3 w-3" />
              })()}
              {isHi ? scheme.applyMethodHi : scheme.applyMethodEn}
            </Badge>
            {isExternal ? (
              <Button asChild size="sm" className="gap-1.5">
                <a href={scheme.applyUrl} target="_blank" rel="noopener noreferrer">
                  {isHi ? 'आवेदन करें' : 'Apply'}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
            ) : (
              <Button size="sm" className="gap-1.5" onClick={handleApplyClick}>
                {isHi ? 'आवेदन करें' : 'Apply'}
                <Building2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ── Step 1: Category ─────────────────────────────────────────────────────
function Step1Category({
  answers,
  setAnswer,
  isHi,
}: {
  answers: Answers
  setAnswer: <K extends keyof Answers>(k: K, v: Answers[K]) => void
  isHi: boolean
}) {
  const options: RadioOption[] = [
    {
      value: 'income',
      labelHi: 'आय सहायता',
      labelEn: 'Income support',
      hintHi: 'PM-Kisan, MGNREGA',
      hintEn: 'PM-Kisan, MGNREGA',
    },
    {
      value: 'housing',
      labelHi: 'आवास',
      labelEn: 'Housing',
      hintHi: 'PMAY-G',
      hintEn: 'PMAY-G',
    },
    {
      value: 'water',
      labelHi: 'जल कनेक्शन',
      labelEn: 'Water connection',
      hintHi: 'जल जीवन मिशन',
      hintEn: 'Jal Jeevan Mission',
    },
    {
      value: 'health',
      labelHi: 'स्वास्थ्य बीमा',
      labelEn: 'Health insurance',
      hintHi: 'आयुष्मान भारत',
      hintEn: 'Ayushman Bharat',
    },
    {
      value: 'education',
      labelHi: 'शिक्षा',
      labelEn: 'Education',
      hintHi: 'छात्रवृत्तियाँ',
      hintEn: 'Scholarships',
    },
    {
      value: 'pension',
      labelHi: 'पेंशन',
      labelEn: 'Pension',
      hintHi: 'वृद्धावस्था, विधवा, विकलांगता',
      hintEn: 'Old age, Widow, Disability',
    },
    {
      value: 'all',
      labelHi: 'सभी देखें',
      labelEn: 'Show all schemes',
      hintHi: 'सभी योजनाओं के लिए जाँचें',
      hintEn: 'Check against all schemes',
    },
  ]
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-foreground">
          {isHi ? 'आप किस श्रेणी की सहायता चाहते हैं?' : 'What kind of assistance are you looking for?'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {isHi
            ? 'एक श्रेणी चुनें — या सभी योजनाएँ देखने के लिए "सभी देखें" चुनें।'
            : 'Pick a category — or choose "Show all schemes" to see everything.'}
        </p>
      </div>
      <RadioChoices
        name="category"
        legendHi="सहायता श्रेणी"
        legendEn="Assistance category"
        value={answers.category ?? ''}
        onChange={(v) => setAnswer('category', v as Category)}
        options={options}
        locale={isHi ? 'hi' : 'en'}
      />
    </div>
  )
}

// ── Step 2: Demographics ─────────────────────────────────────────────────
function Step2Demographics({
  answers,
  setAnswer,
  isHi,
}: {
  answers: Answers
  setAnswer: <K extends keyof Answers>(k: K, v: Answers[K]) => void
  isHi: boolean
}) {
  const incomeItems: { value: IncomeBand; labelHi: string; labelEn: string }[] = [
    { value: '0-1L', labelHi: '₹0 – ₹1 लाख', labelEn: '₹0 – ₹1 lakh' },
    { value: '1-3L', labelHi: '₹1 – ₹3 लाख', labelEn: '₹1 – ₹3 lakh' },
    { value: '3-5L', labelHi: '₹3 – ₹5 लाख', labelEn: '₹3 – ₹5 lakh' },
    { value: '5L+', labelHi: '₹5 लाख से अधिक', labelEn: 'Above ₹5 lakh' },
  ]
  const categoryItems: { value: SocialCategory; labelHi: string; labelEn: string }[] = [
    { value: 'general', labelHi: 'सामान्य', labelEn: 'General' },
    { value: 'obc', labelHi: 'अन्य पिछड़ा वर्ग (OBC)', labelEn: 'OBC' },
    { value: 'sc', labelHi: 'अनुसूचित जाति (SC)', labelEn: 'SC' },
    { value: 'st', labelHi: 'अनुसूचित जनजाति (ST)', labelEn: 'ST' },
    { value: 'ews', labelHi: 'आर्थिक रूप से कमजोर वर्ग (EWS)', labelEn: 'EWS' },
  ]
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-foreground">
          {isHi ? 'परिवार की जानकारी दें' : 'Provide your family information'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {isHi
            ? 'यह जानकारी आपकी पात्रता तय करने में सहायता करती है।'
            : 'This information helps determine your eligibility.'}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="income" className="text-sm font-medium">
          {isHi ? 'वार्षिक पारिवारिक आय' : 'Annual family income'}
        </Label>
        <Select
          value={answers.income ?? ''}
          onValueChange={(v) => setAnswer('income', v as IncomeBand)}
        >
          <SelectTrigger id="income" className="w-full">
            <SelectValue placeholder={isHi ? 'आय श्रेणी चुनें' : 'Select income band'} />
          </SelectTrigger>
          <SelectContent>
            {incomeItems.map((it) => (
              <SelectItem key={it.value} value={it.value}>
                {isHi ? it.labelHi : it.labelEn}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="social-category" className="text-sm font-medium">
          {isHi ? 'पारिवारिक श्रेणी' : 'Family category'}
        </Label>
        <Select
          value={answers.socialCategory ?? ''}
          onValueChange={(v) => setAnswer('socialCategory', v as SocialCategory)}
        >
          <SelectTrigger id="social-category" className="w-full">
            <SelectValue placeholder={isHi ? 'श्रेणी चुनें' : 'Select category'} />
          </SelectTrigger>
          <SelectContent>
            {categoryItems.map((it) => (
              <SelectItem key={it.value} value={it.value}>
                {isHi ? it.labelHi : it.labelEn}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="family-size" className="text-sm font-medium">
          {isHi ? 'परिवार के सदस्यों की संख्या' : 'Number of family members'}
        </Label>
        <Input
          id="family-size"
          type="number"
          min={1}
          max={20}
          inputMode="numeric"
          value={answers.familySize ?? ''}
          onChange={(e) => {
            const n = Number(e.target.value)
            setAnswer('familySize', Number.isFinite(n) ? n : null)
          }}
          placeholder={isHi ? 'जैसे 5' : 'e.g. 5'}
          className="max-w-[200px]"
        />
        <p className="text-[11px] text-muted-foreground">
          {isHi ? '1 से 20 के बीच' : 'Between 1 and 20'}
        </p>
      </div>
    </div>
  )
}

// ── Step 3: Personal status ──────────────────────────────────────────────
function Step3Personal({
  answers,
  setAnswer,
  isHi,
}: {
  answers: Answers
  setAnswer: <K extends keyof Answers>(k: K, v: Answers[K]) => void
  isHi: boolean
}) {
  const ageOptions: RadioOption[] = [
    { value: 'under18', labelHi: '18 वर्ष से कम', labelEn: 'Under 18' },
    { value: '18-40', labelHi: '18 – 40 वर्ष', labelEn: '18 – 40 years' },
    { value: '40-60', labelHi: '40 – 60 वर्ष', labelEn: '40 – 60 years' },
    { value: '60plus', labelHi: '60 वर्ष से अधिक', labelEn: '60+ years' },
  ]
  const genderOptions: RadioOption[] = [
    { value: 'male', labelHi: 'पुरुष', labelEn: 'Male' },
    { value: 'female', labelHi: 'महिला', labelEn: 'Female' },
    { value: 'other', labelHi: 'अन्य', labelEn: 'Other' },
  ]
  const occupationItems: { value: Occupation; labelHi: string; labelEn: string }[] = [
    { value: 'farmer', labelHi: 'किसान', labelEn: 'Farmer' },
    { value: 'laborer', labelHi: 'दैनिक मजदूर', labelEn: 'Daily wage laborer' },
    { value: 'govt-employee', labelHi: 'सरकारी कर्मचारी', labelEn: 'Government employee' },
    { value: 'private-employee', labelHi: 'निजी कर्मचारी', labelEn: 'Private employee' },
    { value: 'self-employed', labelHi: 'स्वरोजगार', labelEn: 'Self-employed' },
    { value: 'unemployed', labelHi: 'बेरोजगार', labelEn: 'Unemployed' },
    { value: 'student', labelHi: 'छात्र', labelEn: 'Student' },
    { value: 'retired', labelHi: 'सेवानिवृत्त', labelEn: 'Retired' },
  ]
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-foreground">
          {isHi ? 'व्यक्तिगत विवरण' : 'Personal details'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {isHi
            ? 'ये विवरण कई योजनाओं की पात्रता तय करते हैं।'
            : 'These details determine eligibility for several schemes.'}
        </p>
      </div>

      <RadioChoices
        name="age"
        legendHi="आयु वर्ग"
        legendEn="Age group"
        value={answers.age ?? ''}
        onChange={(v) => setAnswer('age', v as AgeBand)}
        options={ageOptions}
        locale={isHi ? 'hi' : 'en'}
      />

      <RadioChoices
        name="gender"
        legendHi="लिंग"
        legendEn="Gender"
        value={answers.gender ?? ''}
        onChange={(v) => setAnswer('gender', v as Gender)}
        options={genderOptions}
        locale={isHi ? 'hi' : 'en'}
      />

      <div className="space-y-2">
        <Label htmlFor="occupation" className="text-sm font-medium">
          {isHi ? 'व्यवसाय' : 'Occupation'}
        </Label>
        <Select
          value={answers.occupation ?? ''}
          onValueChange={(v) => setAnswer('occupation', v as Occupation)}
        >
          <SelectTrigger id="occupation" className="w-full">
            <SelectValue placeholder={isHi ? 'व्यवसाय चुनें' : 'Select occupation'} />
          </SelectTrigger>
          <SelectContent>
            {occupationItems.map((it) => (
              <SelectItem key={it.value} value={it.value}>
                {isHi ? it.labelHi : it.labelEn}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

// ── Step 4: Current benefits ─────────────────────────────────────────────
function Step4Benefits({
  answers,
  setAnswer,
  isHi,
}: {
  answers: Answers
  setAnswer: <K extends keyof Answers>(k: K, v: Answers[K]) => void
  isHi: boolean
}) {
  const yesNoOptions: RadioOption[] = [
    { value: 'yes', labelHi: 'हाँ', labelEn: 'Yes' },
    { value: 'no', labelHi: 'नहीं', labelEn: 'No' },
  ]
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-foreground">
          {isHi ? 'वर्तमान में प्राप्त लाभ' : 'Current benefits you receive'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {isHi
            ? 'इससे हम जान सकते हैं कि आपको कौन सी नई योजना चाहिए।'
            : 'This helps us know which new schemes you may need.'}
        </p>
      </div>

      <RadioChoices
        name="ration-card"
        legendHi="क्या आपके पास राशन कार्ड है?"
        legendEn="Do you have a ration card?"
        value={answers.hasRationCard ?? ''}
        onChange={(v) => setAnswer('hasRationCard', v as YesNo)}
        options={yesNoOptions}
        locale={isHi ? 'hi' : 'en'}
      />

      <RadioChoices
        name="ayushman-card"
        legendHi="क्या आपके पास आयुष्मान कार्ड है?"
        legendEn="Do you have an Ayushman card?"
        value={answers.hasAyushmanCard ?? ''}
        onChange={(v) => setAnswer('hasAyushmanCard', v as YesNo)}
        options={yesNoOptions}
        locale={isHi ? 'hi' : 'en'}
      />

      <RadioChoices
        name="pucca-house"
        legendHi="क्या आपके पास पक्का घर है?"
        legendEn="Do you have a pucca house?"
        value={answers.hasPuccaHouse ?? ''}
        onChange={(v) => setAnswer('hasPuccaHouse', v as YesNo)}
        options={yesNoOptions}
        locale={isHi ? 'hi' : 'en'}
      />

      <RadioChoices
        name="tap-water"
        legendHi="क्या आपके घर में नल का पानी कनेक्शन है?"
        legendEn="Do you have a tap water connection?"
        value={answers.hasTapWater ?? ''}
        onChange={(v) => setAnswer('hasTapWater', v as YesNo)}
        options={yesNoOptions}
        locale={isHi ? 'hi' : 'en'}
      />
    </div>
  )
}

// ── Step 5: Special categories ───────────────────────────────────────────
function Step5Special({
  answers,
  setAnswer,
  isHi,
}: {
  answers: Answers
  setAnswer: <K extends keyof Answers>(k: K, v: Answers[K]) => void
  isHi: boolean
}) {
  const yesNoOptions: RadioOption[] = [
    { value: 'yes', labelHi: 'हाँ', labelEn: 'Yes' },
    { value: 'no', labelHi: 'नहीं', labelEn: 'No' },
  ]
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-foreground">
          {isHi ? 'विशेष श्रेणियाँ' : 'Special categories'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {isHi
            ? 'ये जानकारी कुछ विशेष पेंशन योजनाओं के लिए आवश्यक है। आपकी जानकारी गोपनीय है।'
            : 'This information is needed for certain special pension schemes. Your data is confidential.'}
        </p>
      </div>

      <RadioChoices
        name="widow"
        legendHi="क्या आप विधवा हैं?"
        legendEn="Are you a widow?"
        value={answers.isWidow ?? ''}
        onChange={(v) => setAnswer('isWidow', v as YesNo)}
        options={yesNoOptions}
        locale={isHi ? 'hi' : 'en'}
      />

      <RadioChoices
        name="disabled"
        legendHi="क्या आप विकलांग हैं?"
        legendEn="Are you disabled?"
        value={answers.isDisabled ?? ''}
        onChange={(v) => setAnswer('isDisabled', v as YesNo)}
        options={yesNoOptions}
        locale={isHi ? 'hi' : 'en'}
      />

      <RadioChoices
        name="senior"
        legendHi="क्या आप वरिष्ठ नागरिक (60+ वर्ष) हैं?"
        legendEn="Are you a senior citizen (60+)?"
        value={answers.isSenior ?? ''}
        onChange={(v) => setAnswer('isSenior', v as YesNo)}
        options={yesNoOptions}
        locale={isHi ? 'hi' : 'en'}
      />

      <RadioChoices
        name="single-woman"
        legendHi="क्या आप एकल महिला हैं?"
        legendEn="Are you a single woman?"
        value={answers.isSingleWoman ?? ''}
        onChange={(v) => setAnswer('isSingleWoman', v as YesNo)}
        options={yesNoOptions}
        locale={isHi ? 'hi' : 'en'}
      />
    </div>
  )
}
