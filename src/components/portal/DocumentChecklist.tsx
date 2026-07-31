'use client'
import { useI18n } from '@/lib/i18n'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import {
  FileText,
  FileCheck,
  User,
  Home,
  Users,
  GraduationCap,
  HeartPulse,
  IndianRupee,
  Landmark,
  Copy,
  Check,
  Printer,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Clock,
  MapPin,
  Phone,
} from 'lucide-react'
import { ScrollReveal } from './ScrollReveal'
import { toast } from 'sonner'

/* ──────────────────────────────────────────────────────────────────────
   Document Checklist — Gram Panchayat Chandra
   A citizen-facing reference for documents required for various
   government services and certificates. Bilingual (hi/en), Hindi-first.
   ────────────────────────────────────────────────────────────────────── */

type ServiceCategory =
  | 'identity'
  | 'residence'
  | 'income'
  | 'caste'
  | 'housing'
  | 'welfare'
  | 'education'
  | 'health'

interface ServiceCategoryMeta {
  icon: typeof FileText
  hi: string
  en: string
  color: string // tailwind text color
  bg: string // tailwind bg color
  border: string // tailwind border color
}

const CATEGORY_META: Record<ServiceCategory, ServiceCategoryMeta> = {
  identity: {
    icon: User,
    hi: 'पहचान',
    en: 'Identity',
    color: 'text-blue-700 dark:text-blue-300',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    border: 'border-blue-200 dark:border-blue-800',
  },
  residence: {
    icon: Home,
    hi: 'निवास',
    en: 'Residence',
    color: 'text-emerald-700 dark:text-emerald-300',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
  income: {
    icon: IndianRupee,
    hi: 'आय',
    en: 'Income',
    color: 'text-amber-700 dark:text-amber-300',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-amber-200 dark:border-amber-800',
  },
  caste: {
    icon: Users,
    hi: 'जाति',
    en: 'Caste',
    color: 'text-purple-700 dark:text-purple-300',
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    border: 'border-purple-200 dark:border-purple-800',
  },
  housing: {
    icon: Landmark,
    hi: 'आवास',
    en: 'Housing',
    color: 'text-rose-700 dark:text-rose-300',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    border: 'border-rose-200 dark:border-rose-800',
  },
  welfare: {
    icon: HeartPulse,
    hi: 'कल्याण',
    en: 'Welfare',
    color: 'text-teal-700 dark:text-teal-300',
    bg: 'bg-teal-50 dark:bg-teal-950/40',
    border: 'border-teal-200 dark:border-teal-800',
  },
  education: {
    icon: GraduationCap,
    hi: 'शिक्षा',
    en: 'Education',
    color: 'text-indigo-700 dark:text-indigo-300',
    bg: 'bg-indigo-50 dark:bg-indigo-950/40',
    border: 'border-indigo-200 dark:border-indigo-800',
  },
  health: {
    icon: HeartPulse,
    hi: 'स्वास्थ्य',
    en: 'Health',
    color: 'text-red-700 dark:text-red-300',
    bg: 'bg-red-50 dark:bg-red-950/40',
    border: 'border-red-200 dark:border-red-800',
  },
}

interface DocumentItem {
  hi: string
  en: string
  required: boolean // true = mandatory, false = optional/helpful
  noteHi?: string
  noteEn?: string
}

interface Service {
  id: string
  category: ServiceCategory
  nameHi: string
  nameEn: string
  issuingAuthorityHi: string
  issuingAuthorityEn: string
  processingTimeHi: string
  processingTimeEn: string
  feeHi: string
  feeEn: string
  documents: DocumentItem[]
  applyAtHi: string
  applyAtEn: string
  applyUrl?: string
  applyPhone?: string
}

const SERVICES: Service[] = [
  {
    id: 'aadhaar',
    category: 'identity',
    nameHi: 'आधार कार्ड',
    nameEn: 'Aadhaar Card',
    issuingAuthorityHi: 'UIDAI (भारतीय विशिष्ट पहचान प्राधिकरण)',
    issuingAuthorityEn: 'UIDAI (Unique Identification Authority of India)',
    processingTimeHi: '30-90 दिन',
    processingTimeEn: '30-90 days',
    feeHi: 'निःशुल्क',
    feeEn: 'Free',
    documents: [
      { hi: 'जन्म प्रमाणपत्र / स्कूल प्रमाणपत्र', en: 'Birth certificate / School certificate', required: true },
      { hi: 'पते का प्रमाण (बिजली बिल / राशन कार्ड)', en: 'Address proof (Electricity bill / Ration card)', required: true },
      { hi: 'फोटो (बायोमेट्रिक कैप्चर)', en: 'Photo (biometric capture at center)', required: true },
      { hi: 'पहचान प्रमाण (पैन / वोटर आईडी)', en: 'Identity proof (PAN / Voter ID)', required: false, noteHi: 'यदि उपलब्ध हो', noteEn: 'If available' },
    ],
    applyAtHi: 'आधार एनरोलमेंट सेंटर (बैंक / पोस्ट ऑफिस)',
    applyAtEn: 'Aadhaar Enrollment Center (Bank / Post Office)',
    applyPhone: '1947',
  },
  {
    id: 'pan',
    category: 'identity',
    nameHi: 'पैन कार्ड',
    nameEn: 'PAN Card',
    issuingAuthorityHi: 'आयकर विभाग',
    issuingAuthorityEn: 'Income Tax Department',
    processingTimeHi: '15-20 दिन',
    processingTimeEn: '15-20 days',
    feeHi: '₹107 (नया) / ₹50 (सुधार)',
    feeEn: '₹107 (New) / ₹50 (Correction)',
    documents: [
      { hi: 'आधार कार्ड', en: 'Aadhaar card', required: true },
      { hi: 'जन्म तिथि का प्रमाण', en: 'Date of birth proof', required: true },
      { hi: 'फोटो (आधार से लिया जाएगा)', en: 'Photo (will be taken from Aadhaar)', required: true },
    ],
    applyAtHi: 'ऑनलाइन (protean.in / utiitsl.com) या जन सेवा केंद्र',
    applyAtEn: 'Online (protean.in / utiitsl.com) or CSC',
    applyUrl: 'https://www.protean-tinpan.com',
  },
  {
    id: 'voter',
    category: 'identity',
    nameHi: 'वोटर आईडी (EPIC)',
    nameEn: 'Voter ID (EPIC)',
    issuingAuthorityHi: 'चुनाव आयोग (ईआरओ)',
    issuingAuthorityEn: 'Election Commission (ERO)',
    processingTimeHi: '30-45 दिन',
    processingTimeEn: '30-45 days',
    feeHi: 'निःशुल्क',
    feeEn: 'Free',
    documents: [
      { hi: 'आधार कार्ड', en: 'Aadhaar card', required: true },
      { hi: 'पते का प्रमाण', en: 'Address proof', required: true },
      { hi: 'पासपोर्ट साइज फोटो', en: 'Passport-size photo', required: true },
      { hi: 'फॉर्म 6 (नया पंजीकरण)', en: 'Form 6 (new registration)', required: true },
    ],
    applyAtHi: 'वोटर हेल्पलाइन ऐप / nvsp.in / बीएलओ से',
    applyAtEn: 'Voter Helpline App / nvsp.in / via BLO',
    applyUrl: 'https://voters.eci.gov.in',
  },
  {
    id: 'income-cert',
    category: 'income',
    nameHi: 'आय प्रमाणपत्र',
    nameEn: 'Income Certificate',
    issuingAuthorityHi: 'तहसीलदार / नायब तहसीलदार',
    issuingAuthorityEn: 'Tehsildar / Naib Tehsildar',
    processingTimeHi: '7-15 दिन',
    processingTimeEn: '7-15 days',
    feeHi: 'निःशुल्क (ऑनलाइन ₹20 प्रोसेसिंग)',
    feeEn: 'Free (₹20 processing online)',
    documents: [
      { hi: 'आधार कार्ड', en: 'Aadhaar card', required: true },
      { hi: 'राशन कार्ड', en: 'Ration card', required: true },
      { hi: 'वेतन पर्ची (सरकारी/निजी कर्मचारी)', en: 'Salary slip (Govt/Private employee)', required: false, noteHi: 'नौकरीपेशा के लिए', noteEn: 'For salaried' },
      { hi: 'भूमि के रिकॉर्ड (खतियान / लगान रसीद)', en: 'Land records (Khatian / Lagaan receipt)', required: false, noteHi: 'किसानों के लिए', noteEn: 'For farmers' },
      { hi: 'शपथ पत्र (स्व-घोषणा)', en: 'Affidavit (self-declaration)', required: true },
    ],
    applyAtHi: 'ऑनलाइन (edistrict.up.gov.in) / जन सेवा केंद्र / तहसील कार्यालय',
    applyAtEn: 'Online (edistrict.up.gov.in) / CSC / Tehsil office',
    applyUrl: 'https://edistrict.up.gov.in',
  },
  {
    id: 'caste-cert',
    category: 'caste',
    nameHi: 'जाति प्रमाणपत्र',
    nameEn: 'Caste Certificate',
    issuingAuthorityHi: 'तहसीलदार / सब-डिवीजनल मजिस्ट्रेट',
    issuingAuthorityEn: 'Tehsildar / Sub-Divisional Magistrate',
    processingTimeHi: '15-30 दिन',
    processingTimeEn: '15-30 days',
    feeHi: 'निःशुल्क',
    feeEn: 'Free',
    documents: [
      { hi: 'आधार कार्ड', en: 'Aadhaar card', required: true },
      { hi: 'माता-पिता का जाति प्रमाणपत्र', en: "Parents' caste certificate", required: true, noteHi: 'अनिवार्य अधिकांश राज्यों में', noteEn: 'Mandatory in most states' },
      { hi: 'राशन कार्ड / बिजली बिल (पता प्रमाण)', en: 'Ration card / Electricity bill (address proof)', required: true },
      { hi: 'स्कूल छोड़ने का प्रमाणपत्र (TC)', en: 'School leaving certificate (TC)', required: false, noteHi: 'यदि उपलब्ध', noteEn: 'If available' },
      { hi: 'शपथ पत्र', en: 'Affidavit', required: true },
    ],
    applyAtHi: 'ऑनलाइन (edistrict.up.gov.in) / तहसील कार्यालय शंकरगढ़',
    applyAtEn: 'Online (edistrict.up.gov.in) / Tehsil office Shankargarh',
    applyUrl: 'https://edistrict.up.gov.in',
  },
  {
    id: 'residence-cert',
    category: 'residence',
    nameHi: 'निवास प्रमाणपत्र (डोमिसाइल)',
    nameEn: 'Residence Certificate (Domicile)',
    issuingAuthorityHi: 'तहसीलदार',
    issuingAuthorityEn: 'Tehsildar',
    processingTimeHi: '15-30 दिन',
    processingTimeEn: '15-30 days',
    feeHi: 'निःशुल्क',
    feeEn: 'Free',
    documents: [
      { hi: 'आधार कार्ड', en: 'Aadhaar card', required: true },
      { hi: 'राशन कार्ड', en: 'Ration card', required: true },
      { hi: 'बिजली / पानी बिल (वर्तमान पते का प्रमाण)', en: 'Electricity / Water bill (current address proof)', required: true },
      { hi: 'मकान स्वामित्व के रिकॉर्ड (खतियान)', en: 'House ownership records (Khatian)', required: false },
      { hi: 'शपथ पत्र', en: 'Affidavit', required: true },
    ],
    applyAtHi: 'जन सेवा केंद्र / तहसील कार्यालय / ऑनलाइन',
    applyAtEn: 'CSC / Tehsil office / Online',
    applyUrl: 'https://edistrict.up.gov.in',
  },
  {
    id: 'pmayg',
    category: 'housing',
    nameHi: 'PMAY-G आवास सहायता',
    nameEn: 'PMAY-G Housing Assistance',
    issuingAuthorityHi: 'ग्राम पंचायत + ब्लॉक कार्यालय',
    issuingAuthorityEn: 'Gram Panchayat + Block Office',
    processingTimeHi: '90-180 दिन (सत्यापन + निर्माण)',
    processingTimeEn: '90-180 days (verification + construction)',
    feeHi: 'निःशुल्क आवेदन',
    feeEn: 'Free application',
    documents: [
      { hi: 'आधार कार्ड (परिवार के सभी सदस्यों का)', en: 'Aadhaar (all family members)', required: true },
      { hi: 'बीपीएल राशन कार्ड', en: 'BPL Ration card', required: true },
      { hi: 'आय प्रमाणपत्र (₹3 लाख से कम)', en: 'Income certificate (less than ₹3 lakh)', required: true },
      { hi: 'कच्चा घर का फोटो', en: 'Photo of kachha house', required: true },
      { hi: 'बैंक पासबुक (खाता विवरण)', en: 'Bank passbook (account details)', required: true },
      { hi: 'जमीन के रिकॉर्ड (यदि अपनी जमीन पर)', en: 'Land records (if on own land)', required: false },
    ],
    applyAtHi: 'ग्राम पंचायत कार्यालय चंद्रा / बीडीओ शंकरगढ़',
    applyAtEn: 'Gram Panchayat office Chandra / BDO Shankargarh',
    applyPhone: '9651035021',
  },
  {
    id: 'jjm',
    category: 'welfare',
    nameHi: 'जल जीवन मिशन — नल कनेक्शन',
    nameEn: 'Jal Jeevan Mission — Tap Connection',
    issuingAuthorityHi: 'जल निगम / ग्राम पंचायत',
    issuingAuthorityEn: 'Jal Nigam / Gram Panchayat',
    processingTimeHi: '15-30 दिन',
    processingTimeEn: '15-30 days',
    feeHi: '₹500-2000 (वार्ड के आधार पर)',
    feeEn: '₹500-2000 (varies by ward)',
    documents: [
      { hi: 'आधार कार्ड', en: 'Aadhaar card', required: true },
      { hi: 'मकान स्वामित्व का प्रमाण (खतियान / रजिस्ट्री)', en: 'House ownership proof (Khatian / Registry)', required: true },
      { hi: 'राशन कार्ड (पता प्रमाण)', en: 'Ration card (address proof)', required: true },
      { hi: 'बैंक पासबुक', en: 'Bank passbook', required: false, noteHi: 'सब्सिडी के लिए', noteEn: 'For subsidy' },
      { hi: 'पिछला बिल (यदि पहले से कनेक्शन है)', en: 'Previous bill (if existing connection)', required: false },
    ],
    applyAtHi: 'ग्राम पंचायत कार्यालय चंद्रा',
    applyAtEn: 'Gram Panchayat office Chandra',
    applyPhone: '9651035021',
  },
  {
    id: 'ayushman',
    category: 'health',
    nameHi: 'आयुष्मान भारत कार्ड (PM-JAY)',
    nameEn: 'Ayushman Bharat Card (PM-JAY)',
    issuingAuthorityHi: 'राष्ट्रीय स्वास्थ्य एजेंसी',
    issuingAuthorityEn: 'National Health Authority',
    processingTimeHi: 'तुरंत (तत्काल जारी)',
    processingTimeEn: 'Instant (issued on-spot)',
    feeHi: 'निःशुल्क',
    feeEn: 'Free',
    documents: [
      { hi: 'आधार कार्ड', en: 'Aadhaar card', required: true },
      { hi: 'राशन कार्ड (परिवार की सूची)', en: 'Ration card (family list)', required: true },
      { hi: 'मोबाइल नंबर (आधार से लिंक)', en: 'Mobile number (linked to Aadhaar)', required: true },
      { hi: 'पते का प्रमाण', en: 'Address proof', required: false },
    ],
    applyAtHi: 'सामुदायिक स्वास्थ्य केंद्र / जन सेवा केंद्र / pmjay.gov.in',
    applyAtEn: 'CHC / CSC / pmjay.gov.in',
    applyUrl: 'https://pmjay.gov.in',
  },
  {
    id: 'scholarship',
    category: 'education',
    nameHi: 'छात्रवृत्ति (पोस्ट-मैट्रिक)',
    nameEn: 'Scholarship (Post-Matric)',
    issuingAuthorityHi: 'समाज कल्याण विभाग / शिक्षा विभाग',
    issuingAuthorityEn: 'Social Welfare / Education Department',
    processingTimeHi: '60-90 दिन (सत्यापन के बाद)',
    processingTimeEn: '60-90 days (after verification)',
    feeHi: 'निःशुल्क',
    feeEn: 'Free',
    documents: [
      { hi: 'आधार कार्ड', en: 'Aadhaar card', required: true },
      { hi: 'जाति प्रमाणपत्र (SC/ST/OBC के लिए)', en: 'Caste certificate (for SC/ST/OBC)', required: true },
      { hi: 'आय प्रमाणपत्र', en: 'Income certificate', required: true },
      { hi: 'पिछली कक्षा की मार्कशीट', en: "Previous class marksheet", required: true },
      { hi: 'वर्तमान स्कूल/कॉलेज का प्रमाणपत्र', en: 'Current school/college certificate', required: true },
      { hi: 'बैंक पासबुक (छात्र के नाम पर)', en: 'Bank passbook (in student name)', required: true },
      { hi: 'राशन कार्ड', en: 'Ration card', required: false },
    ],
    applyAtHi: 'ऑनलाइन (scholarship.up.gov.in) / शिक्षण संस्थान से',
    applyAtEn: 'Online (scholarship.up.gov.in) / via institution',
    applyUrl: 'https://scholarship.up.gov.in',
  },
  {
    id: 'old-age-pension',
    category: 'welfare',
    nameHi: 'वृद्धावस्था पेंशन (IGNOAPS)',
    nameEn: 'Old Age Pension (IGNOAPS)',
    issuingAuthorityHi: 'समाज कल्याण विभाग',
    issuingAuthorityEn: 'Social Welfare Department',
    processingTimeHi: '45-60 दिन',
    processingTimeEn: '45-60 days',
    feeHi: 'निःशुल्क',
    feeEn: 'Free',
    documents: [
      { hi: 'आधार कार्ड', en: 'Aadhaar card', required: true },
      { hi: 'आयु प्रमाण (जन्म प्रमाणपत्र / वोटर आईडी / स्कूल प्रमाणपत्र)', en: 'Age proof (Birth cert / Voter ID / School cert)', required: true },
      { hi: 'आय प्रमाणपत्र (BPL)', en: 'Income certificate (BPL)', required: true },
      { hi: 'बैंक पासबुक', en: 'Bank passbook', required: true },
      { hi: 'राशन कार्ड', en: 'Ration card', required: true },
      { hi: 'पासपोर्ट साइज फोटो', en: 'Passport-size photo', required: true },
    ],
    applyAtHi: 'ग्राम पंचायत कार्यालय / जन सेवा केंद्र / sspy-up.gov.in',
    applyAtEn: 'Gram Panchayat / CSC / sspy-up.gov.in',
    applyUrl: 'https://sspy-up.gov.in',
  },
  {
    id: 'widow-pension',
    category: 'welfare',
    nameHi: 'विधवा पेंशन',
    nameEn: 'Widow Pension',
    issuingAuthorityHi: 'समाज कल्याण विभाग',
    issuingAuthorityEn: 'Social Welfare Department',
    processingTimeHi: '45-60 दिन',
    processingTimeEn: '45-60 days',
    feeHi: 'निःशुल्क',
    feeEn: 'Free',
    documents: [
      { hi: 'आधार कार्ड', en: 'Aadhaar card', required: true },
      { hi: 'पति का मृत्यु प्रमाणपत्र', en: "Husband's death certificate", required: true },
      { hi: 'आय प्रमाणपत्र (BPL)', en: 'Income certificate (BPL)', required: true },
      { hi: 'बैंक पासबुक (विधवा के नाम पर)', en: 'Bank passbook (in widow name)', required: true },
      { hi: 'राशन कार्ड', en: 'Ration card', required: true },
      { hi: 'आयु प्रमाण (18-60 वर्ष)', en: 'Age proof (18-60 years)', required: true },
      { hi: 'पासपोर्ट साइज फोटो', en: 'Passport-size photo', required: true },
    ],
    applyAtHi: 'ग्राम पंचायत कार्यालय / जन सेवा केंद्र',
    applyAtEn: 'Gram Panchayat / CSC',
  },
]

const STATS = [
  { value: SERVICES.length, labelHi: 'सेवाएँ', labelEn: 'Services', color: 'text-primary' },
  { value: SERVICES.reduce((acc, s) => acc + s.documents.length, 0), labelHi: 'दस्तावेज़ आइटम', labelEn: 'Document Items', color: 'text-emerald-600' },
  { value: Object.keys(CATEGORY_META).length, labelHi: 'श्रेणियाँ', labelEn: 'Categories', color: 'text-amber-600' },
  { value: SERVICES.filter((s) => s.applyUrl).length, labelHi: 'ऑनलाइन आवेदन', labelEn: 'Online Apply', color: 'text-sky-600' },
]

export function DocumentChecklist() {
  const { locale } = useI18n()
  const isHi = locale === 'hi'
  const [expandedId, setExpandedId] = useState<string | null>(SERVICES[0].id)
  const [filterCategory, setFilterCategory] = useState<ServiceCategory | 'all'>('all')
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({})
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const filteredServices = filterCategory === 'all' ? SERVICES : SERVICES.filter((s) => s.category === filterCategory)

  const handleToggleDoc = (key: string) => {
    setCheckedDocs((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleCopyDocs = async (service: Service) => {
    const text = isHi
      ? `${service.nameHi}\n${service.documents.map((d, i) => `${i + 1}. ${d.hi}${d.required ? ' (अनिवार्य)' : ' (वैकल्पिक)'}${d.noteHi ? ' — ' + d.noteHi : ''}`).join('\n')}`
      : `${service.nameEn}\n${service.documents.map((d, i) => `${i + 1}. ${d.en}${d.required ? ' (Required)' : ' (Optional)'}${d.noteEn ? ' — ' + d.noteEn : ''}`).join('\n')}`
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(service.id)
      toast.success(isHi ? 'दस्तावेज़ सूची कॉपी हुई' : 'Document list copied')
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      toast.error(isHi ? 'कॉपी विफल' : 'Copy failed')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <section
      id="documents"
      data-section="documents"
      className="section-premium py-16 md:py-20 border-b border-border/40"
    >
      <div className="container mx-auto px-4 max-w-6xl">
        <ScrollReveal>
          <div className="text-center mb-12">
            <Badge variant="outline" className="section-header-badge mb-3 gap-1.5">
              <FileCheck className="h-3.5 w-3.5" />
              {isHi ? 'दस्तावेज़ चेकलिस्ट' : 'Document Checklist'}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gradient-premium">
              {isHi ? 'ज़रूरी दस्तावेज़ — सरकारी सेवाओं के लिए' : 'Required Documents — For Government Services'}
            </h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              {isHi
                ? 'विभिन्न सरकारी प्रमाणपत्रों और योजनाओं के लिए चाहिए दस्तावेज़ों की सूची। चेक करें, कॉपी करें, या प्रिंट करें।'
                : 'List of documents required for various government certificates and schemes. Check, copy, or print them.'}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 max-w-2xl mx-auto">
              {STATS.map((s, i) => (
                <div key={i} className="card-premium p-4 text-center hover-lift">
                  <div className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    {isHi ? s.labelHi : s.labelEn}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Category filter chips */}
        <ScrollReveal delay={0.05}>
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            <button
              type="button"
              onClick={() => setFilterCategory('all')}
              aria-pressed={filterCategory === 'all'}
              className={`pill-button focus-ring px-4 py-1.5 rounded-full border text-xs font-medium ${
                filterCategory === 'all'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border/70 bg-background hover:bg-secondary/60 text-foreground'
              }`}
            >
              {isHi ? 'सभी सेवाएँ' : 'All Services'}
            </button>
            {(Object.keys(CATEGORY_META) as ServiceCategory[]).map((cat) => {
              const meta = CATEGORY_META[cat]
              const Icon = meta.icon
              const count = SERVICES.filter((s) => s.category === cat).length
              if (count === 0) return null
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFilterCategory(cat)}
                  aria-pressed={filterCategory === cat}
                  className={`pill-button focus-ring px-4 py-1.5 rounded-full border text-xs font-medium inline-flex items-center gap-1.5 ${
                    filterCategory === cat
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border/70 bg-background hover:bg-secondary/60 text-foreground'
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  {isHi ? meta.hi : meta.en}
                  <span className="text-[10px] text-muted-foreground">({count})</span>
                </button>
              )
            })}
          </div>
        </ScrollReveal>

        {/* Services accordion */}
        <ScrollReveal delay={0.1}>
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredServices.map((service, idx) => {
                const meta = CATEGORY_META[service.category]
                const Icon = meta.icon
                const isExpanded = expandedId === service.id
                const requiredDocs = service.documents.filter((d) => d.required).length
                const totalDocs = service.documents.length
                const checkedCount = service.documents.filter((_, di) => checkedDocs[`${service.id}-${di}`]).length
                const allChecked = checkedCount === totalDocs

                return (
                  <motion.div
                    key={service.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, delay: Math.min(idx * 0.03, 0.3) }}
                    className={`card-premium overflow-hidden ${isExpanded ? 'ring-2 ring-primary/30 shadow-lg' : 'hover-lift'} transition-all`}
                  >
                    {/* Header */}
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : service.id)}
                      aria-expanded={isExpanded}
                      className="w-full text-left p-4 md:p-5 hover:bg-secondary/30 transition-colors focus-ring"
                    >
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className={`h-11 w-11 md:h-12 md:w-12 rounded-lg ${meta.bg} grid place-items-center shrink-0`}>
                          <Icon className={`h-5 w-5 md:h-6 md:w-6 ${meta.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="text-base md:text-lg font-semibold leading-tight">
                              {isHi ? service.nameHi : service.nameEn}
                            </h3>
                            <Badge variant="outline" className={`text-[10px] gap-1 ${meta.bg} ${meta.color} ${meta.border}`}>
                              <Icon className="h-2.5 w-2.5" />
                              {isHi ? meta.hi : meta.en}
                            </Badge>
                            {allChecked && (
                              <Badge className="text-[10px] gap-1 bg-emerald-600 text-white hover:bg-emerald-600">
                                <Check className="h-2.5 w-2.5" />
                                {isHi ? 'पूर्ण' : 'Complete'}
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {isHi ? service.processingTimeHi : service.processingTimeEn}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <IndianRupee className="h-3 w-3" />
                              {isHi ? service.feeHi : service.feeEn}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {isHi
                                ? `${requiredDocs} अनिवार्य / ${totalDocs} कुल`
                                : `${requiredDocs} required / ${totalDocs} total`}
                            </span>
                            {checkedCount > 0 && (
                              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                                <Check className="h-3 w-3" />
                                {isHi ? `${checkedCount}/${totalDocs} तैयार` : `${checkedCount}/${totalDocs} ready`}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="shrink-0">
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Expanded content */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 md:p-5 pt-0 space-y-4 border-t border-border/60 mt-0">
                            {/* Issuing authority + apply at */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
                              <div className={`rounded-lg p-3 ${meta.bg} border ${meta.border}`}>
                                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                                  <Landmark className="h-3 w-3" />
                                  {isHi ? 'जारीकर्ता प्राधिकरण' : 'Issuing Authority'}
                                </div>
                                <div className="text-sm font-medium">
                                  {isHi ? service.issuingAuthorityHi : service.issuingAuthorityEn}
                                </div>
                              </div>
                              <div className="rounded-lg p-3 bg-secondary/30 border border-border/60">
                                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {isHi ? 'आवेदन कहाँ करें' : 'Where to Apply'}
                                </div>
                                <div className="text-sm font-medium">
                                  {isHi ? service.applyAtHi : service.applyAtEn}
                                </div>
                              </div>
                            </div>

                            {/* Documents checklist */}
                            <div>
                              <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                                <FileCheck className="h-4 w-4 text-primary" />
                                {isHi ? 'ज़रूरी दस्तावेज़' : 'Required Documents'}
                                <span className="text-xs text-muted-foreground font-normal">
                                  ({isHi ? 'चेक करने के लिए क्लिक करें' : 'Click to check off'})
                                </span>
                              </h4>
                              <ul className="space-y-1.5">
                                {service.documents.map((doc, di) => {
                                  const key = `${service.id}-${di}`
                                  const isChecked = !!checkedDocs[key]
                                  return (
                                    <li key={di}>
                                      <label
                                        className={`flex items-start gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${
                                          isChecked
                                            ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30'
                                            : 'border-border/60 hover:border-border hover:bg-secondary/30'
                                        }`}
                                      >
                                        <button
                                          type="button"
                                          role="checkbox"
                                          aria-checked={isChecked}
                                          onClick={() => handleToggleDoc(key)}
                                          className={`mt-0.5 h-5 w-5 rounded border-2 grid place-items-center shrink-0 transition-all ${
                                            isChecked
                                              ? 'border-emerald-500 bg-emerald-500 text-white'
                                              : 'border-border bg-background hover:border-primary'
                                          }`}
                                        >
                                          {isChecked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                                        </button>
                                        <div className="flex-1 min-w-0">
                                          <div className="text-sm font-medium flex items-center gap-1.5 flex-wrap">
                                            <span className={isChecked ? 'line-through text-muted-foreground' : ''}>
                                              {isHi ? doc.hi : doc.en}
                                            </span>
                                            {doc.required ? (
                                              <Badge variant="outline" className="text-[9px] bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800">
                                                {isHi ? 'अनिवार्य' : 'Required'}
                                              </Badge>
                                            ) : (
                                              <Badge variant="outline" className="text-[9px] bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
                                                {isHi ? 'वैकल्पिक' : 'Optional'}
                                              </Badge>
                                            )}
                                          </div>
                                          {(doc.noteHi || doc.noteEn) && (
                                            <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                                              <AlertCircle className="h-3 w-3 shrink-0" />
                                              {isHi ? doc.noteHi : doc.noteEn}
                                            </div>
                                          )}
                                        </div>
                                      </label>
                                    </li>
                                  )
                                })}
                              </ul>
                            </div>

                            {/* Action buttons */}
                            <div className="flex flex-wrap gap-2 pt-2 border-t border-border/60">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCopyDocs(service)}
                                className="gap-1.5"
                              >
                                {copiedId === service.id ? (
                                  <>
                                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                                    {isHi ? 'कॉपी हुई' : 'Copied'}
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3.5 w-3.5" />
                                    {isHi ? 'सूची कॉपी करें' : 'Copy List'}
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handlePrint}
                                className="gap-1.5"
                              >
                                <Printer className="h-3.5 w-3.5" />
                                {isHi ? 'प्रिंट' : 'Print'}
                              </Button>
                              {service.applyUrl && (
                                <Button
                                  variant="default"
                                  size="sm"
                                  asChild
                                  className="gap-1.5 ml-auto"
                                >
                                  <a href={service.applyUrl} target="_blank" rel="noopener noreferrer">
                                    {isHi ? 'ऑनलाइन आवेदन' : 'Apply Online'}
                                  </a>
                                </Button>
                              )}
                              {service.applyPhone && (
                                <Button
                                  variant="default"
                                  size="sm"
                                  asChild
                                  className={`gap-1.5 ${service.applyUrl ? '' : 'ml-auto'}`}
                                >
                                  <a href={`tel:${service.applyPhone}`}>
                                    <Phone className="h-3.5 w-3.5" />
                                    {isHi ? 'कॉल करें' : 'Call'}
                                  </a>
                                </Button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </ScrollReveal>

        {/* Footer note */}
        <ScrollReveal delay={0.15}>
          <div className="mt-8 card-premium-bordered p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold mb-1">
                {isHi ? 'नोट:' : 'Note:'}
              </p>
              <p className="text-muted-foreground">
                {isHi
                  ? 'यह सूची सामान्य आवश्यकताओं के लिए है। कुछ योजनाओं के लिए अतिरिक्त दस्तावेज़ चाहिए हो सकते हैं। पंचायत कार्यालय या जन सेवा केंद्र से संपर्क करें।'
                  : 'This list covers general requirements. Some schemes may need additional documents. Contact the panchayat office or CSC.'}
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
