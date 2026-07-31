'use client'
import { useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollReveal } from './ScrollReveal'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  FileCheck,
  Download,
  Printer,
  User,
  Home,
  GraduationCap,
  HeartPulse,
  IndianRupee,
  Landmark,
  Scale,
  Users,
  Clock,
  ExternalLink,
  Check,
  Copy,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  MapPin,
  Phone,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

/* ──────────────────────────────────────────────────────────────────────
   DownloadsSection — Gram Panchayat Chandra
   Merged: Downloadable forms + Required documents checklist (DocumentChecklist)
   ────────────────────────────────────────────────────────────────────── */

// ── Form definitions (from original DownloadsSection) ──
type FormDef = {
  id: string
  icon: typeof FileText
  titleHi: string
  titleEn: string
  descHi: string
  descEn: string
  category: 'certificate' | 'scheme' | 'grievance' | 'utility'
  fee: string
  duration: string
  body: string
  onlineUrl?: string
  onlineLabel?: string
  /** Related service ID from DOCUMENT_SERVICES for required docs */
  relatedServiceId?: string
}

const FORMS: FormDef[] = [
  {
    id: 'income-cert',
    icon: IndianRupee,
    titleHi: 'आय प्रमाणपत्र',
    titleEn: 'Income Certificate',
    descHi: 'आय प्रमाणपत्र के लिए आवेदन फॉर्म। छात्रवृत्ति, राशन कार्ड, योजना पात्रता हेतु आवश्यक।',
    descEn: 'Application form for Income Certificate. Required for scholarships, ration card, scheme eligibility.',
    category: 'certificate',
    fee: 'निःशुल्क / Free',
    duration: '7-15 दिन / days',
    onlineUrl: 'https://edistrict.up.gov.in',
    onlineLabel: 'eDistrict UP',
    relatedServiceId: 'income-cert',
    body: `आय प्रमाणपत्र आवेदन / INCOME CERTIFICATE APPLICATION
ग्राम पंचायत चंद्रा, विकास खण्ड शंकरगढ़, जनपद प्रयागराज, उत्तर प्रदेश

1. आवेदक का नाम / Applicant Name: ________________________
2. पिता/पति का नाम / Father/Husband Name: ________________________
3. पता / Address: ग्राम चंद्रा, वार्ड ___, पोस्ट ___, पिन 212108
4. आधार नंबर / Aadhaar No: ____-____-____-____
5. मोबाइल नंबर / Mobile: +91 ___________
6. वार्षिक आय / Annual Income (₹): ___________
7. आय का स्रोत / Income Source: कृषि / मजदूरी / व्यापार / नौकरी
8. जाति / Caste: _________  9. धर्म / Religion: _________

संलग्नक / Enclosures: (1) आधार कार्ड (2) निवास प्रमाणपत्र (3) पासपोर्ट फोटो
घोषणा / Declaration: मैं घोषित करता/करती हूं कि उपर्युक्त जानकारी सत्य है।

तिथि / Date: ___________   हस्ताक्षर / Signature: ___________`,
  },
  {
    id: 'caste-cert',
    icon: Users,
    titleHi: 'जाति प्रमाणपत्र',
    titleEn: 'Caste Certificate',
    descHi: 'जाति प्रमाणपत्र के लिए आवेदन। छात्रवृत्ति, आरक्षण, योजना लाभ हेतु आवश्यक।',
    descEn: 'Application for Caste Certificate. Required for scholarships, reservation, scheme benefits.',
    category: 'certificate',
    fee: 'निःशुल्क / Free',
    duration: '15 दिन / days',
    onlineUrl: 'https://edistrict.up.gov.in',
    onlineLabel: 'eDistrict UP',
    relatedServiceId: 'caste-cert',
    body: `जाति प्रमाणपत्र आवेदन / CASTE CERTIFICATE APPLICATION
ग्राम पंचायत चंद्रा, शंकरगढ़, प्रयागराज, उ.प्र.

1. आवेदक का नाम / Applicant Name: ________________________
2. पिता का नाम / Father Name: ________________________
3. पता / Address: ग्राम चंद्रा, वार्ड ___
4. आधार नंबर / Aadhaar: ____-____-____-____
5. जाति / Caste (SC/ST/OBC): _________
6. उप-जाति / Sub-caste: _________
7. माता-पिता की जाति / Parents Caste: _________

संलग्नक: (1) आधार (2) पिता का जाति प्रमाणपत्र (3) स्कूल प्रमाणपत्र (4) फोटो
घोषणा: जानकारी सत्य है, अन्यथा कानूनी कार्रवाई होगी।

तिथि: ___________   हस्ताक्षर: ___________`,
  },
  {
    id: 'residence-cert',
    icon: Home,
    titleHi: 'निवास प्रमाणपत्र',
    titleEn: 'Residence Certificate',
    descHi: 'निवास प्रमाणपत्र आवेदन। निवास स्थान का प्रमाण हेतु।',
    descEn: 'Residence Certificate application. Proof of place of residence.',
    category: 'certificate',
    fee: 'निःशुल्क / Free',
    duration: '7 दिन / days',
    onlineUrl: 'https://edistrict.up.gov.in',
    onlineLabel: 'eDistrict UP',
    relatedServiceId: 'residence-cert',
    body: `निवास प्रमाणपत्र आवेदन / RESIDENCE CERTIFICATE APPLICATION
ग्राम पंचायत चंद्रा, शंकरगढ़, प्रयागराज, उ.प्र.

1. आवेदक का नाम: ________________________
2. पिता/पति का नाम: ________________________
3. वर्तमान पता: ग्राम चंद्रा, वार्ड ___, पिन 212108
4. स्थायी पता: ________________________
5. आधार नंबर: ____-____-____-____
6. निवास अवधि / Residence Duration: ___ वर्ष
7. गवाह का नाम / Witness Name: ________________________

संलग्नक: (1) आधार (2) राशन कार्ड (3) विद्युत बिल (4) फोटो
तिथि: ___________   हस्ताक्षर: ___________`,
  },
  {
    id: 'mgnrega-jobcard',
    icon: Users,
    titleHi: 'मनरेगा जॉब कार्ड आवेदन',
    titleEn: 'MGNREGA Job Card Application',
    descHi: 'मनरेगा जॉब कार्ड के लिए आवेदन। 100 दिन की गारंटीकृत रोजगार हेतु।',
    descEn: 'Application for MGNREGA Job Card. For 100-day guaranteed employment.',
    category: 'scheme',
    fee: 'निःशुल्क / Free',
    duration: '15 दिन / days',
    onlineUrl: 'https://nrega.nic.in',
    onlineLabel: 'NREGA Portal',
    relatedServiceId: 'mgnrega',
    body: `मनरेगा जॉब कार्ड आवेदन / MGNREGA JOB CARD APPLICATION
ग्राम पंचायत चंद्रा, कोड 3145021064

1. परिवार के मुखिया का नाम: ________________________
2. पिता/पति का नाम: ________________________
3. पता: ग्राम चंद्रा, वार्ड ___, पिन 212108
4. आधार नंबर: ____-____-____-____
5. मोबाइल नंबर: +91 ___________
6. बैंक खाता नंबर / Bank A/c: ___________
7. IFSC कोड / IFSC: ___________
8. परिवार के सदस्य / Family Members:
   क्र. | नाम | उम्र | लिंग | आधार
   1.  |      |     |      |
   2.  |      |     |      |
   3.  |      |     |      |

घोषणा: हम अकुशल मजदूरी करने को तैयार हैं।
तिथि: ___________   हस्ताक्षर (मुखिया): ___________`,
  },
  {
    id: 'pmay-g',
    icon: Home,
    titleHi: 'PMAY-G आवास आवेदन',
    titleEn: 'PMAY-G Housing Application',
    descHi: 'प्रधानमंत्री आवास योजना-ग्रामीण के लिए आवेदन। ₹1,20,000 सहायता।',
    descEn: 'PMAY-Gramin housing application. ₹1,20,000 assistance.',
    category: 'scheme',
    fee: 'निःशुल्क / Free',
    duration: 'सत्यापन 30 दिन / verification 30 days',
    onlineUrl: 'https://pmayg.nic.in',
    onlineLabel: 'PMAY-G Portal',
    relatedServiceId: 'pmayg',
    body: `PMAY-G आवास आवेदन / PMAY-G HOUSING APPLICATION
ग्राम पंचायत चंद्रा

1. आवेदक का नाम: ________________________
2. पिता/पति का नाम: ________________________
3. पता: ग्राम चंद्रा, वार्ड ___
4. आधार नंबर: ____-____-____-____
5. मोबाइल: +91 ___________
6. बैंक खाता: ___________  IFSC: _________
7. भूमि स्वामित्व / Land Ownership: स्वयं के नाम पर हां/नहीं
8. वर्तमान घर का प्रकार: कच्चा/पक्का/घर नहीं
9. परिवार के सदस्य संख्या: ___

संलग्नक: (1) आधार (2) बैंक पासबुक (3) भूमि दस्तावेज (4) आय प्रमाणपत्र (5) फोटो
तिथि: ___________   हस्ताक्षर: ___________`,
  },
  {
    id: 'pension',
    icon: HeartPulse,
    titleHi: 'वृद्धावस्था/विधवा/दिव्यांग पेंशन',
    titleEn: 'Old Age/Widow/Divyang Pension',
    descHi: 'पेंशन योजना आवेदन। ₹1,000-1,200/माह लाभ।',
    descEn: 'Pension scheme application. ₹1,000-1,200/month benefit.',
    category: 'scheme',
    fee: 'निःशुल्क / Free',
    duration: '30 दिन / days',
    onlineUrl: 'https://sspy-up.gov.in',
    onlineLabel: 'SSPY UP',
    relatedServiceId: 'old-age-pension',
    body: `पेंशन आवेदन / PENSION APPLICATION
वृद्धावस्था (60+)/ विधवा / दिव्यांग — (उपयुक्त पर गोला लगाएं)

1. आवेदक का नाम: ________________________
2. पता: ग्राम चंद्रा, वार्ड ___
3. आयु / Age: ___ वर्ष (जन्म तिथि: __/__/____)
4. लिंग / Gender: ___  5. वैवाहिक स्थिति: ___
6. आधार नंबर: ____-____-____-____
7. बैंक खाता: ___________  IFSC: _________
8. आय / Income: ₹_________ प्रति वर्ष
9. दिव्यांगता % (यदि लागू): ___%

संलग्नक: (1) आधार (2) आयु प्रमाण (3) आय प्रमाण (4) बैंक पासबुक (5) फोटो
(विधवा: पति का मृत्यु प्रमाणपत्र) (दिव्यांग: चिकित्सा प्रमाणपत्र)
तिथि: ___________   हस्ताक्षर: ___________`,
  },
  {
    id: 'rti',
    icon: Scale,
    titleHi: 'RTI आवेदन',
    titleEn: 'RTI Application',
    descHi: 'सूचना अधिकार अधिनियम 2005 के तहत सूचना अनुरोध। शुल्क ₹10।',
    descEn: 'Information request under RTI Act 2005. Fee ₹10.',
    category: 'grievance',
    fee: '₹10',
    duration: '30 दिन / days',
    body: `सूचना अधिकार (RTI) आवेदन / RIGHT TO INFORMATION APPLICATION
सेवा में / To: जन सूचना अधिकारी (PIO), ग्राम पंचायत चंद्रा

1. आवेदक का नाम: ________________________
2. पता: ग्राम चंद्रा, वार्ड ___, पिन 212108
3. संपर्क: +91 ___________
4. जानकारी चाहिए विभाग / Department: पंचायत / MGNREGA / PMAY / अन्य

विषय / Subject: ________________________

अनुरोधित सूचना / Information Requested:
_________________________________________
_________________________________________
_________________________________________

शुल्क ₹10 भारतीय डाक टिकट संलग्न / Fee ₹10 via Indian Postal Order attached.

तिथि: ___________   हस्ताक्षर: ___________`,
  },
  {
    id: 'water-connection',
    icon: Landmark,
    titleHi: 'जल जीवन मिशन — नल कनेक्शन',
    titleEn: 'Jal Jeevan Mission — Tap Connection',
    descHi: 'घरेलू नल कनेक्शन आवेदन। निःशुल्क पहला कनेक्शन।',
    descEn: 'Household tap connection application. Free first connection.',
    category: 'utility',
    fee: 'निःशुल्क / Free (first)',
    duration: '15-30 दिन / days',
    relatedServiceId: 'jjm',
    body: `जल जीवन मिशन नल कनेक्शन आवेदन / JJM TAP CONNECTION APPLICATION
ग्राम पंचायत चंद्रा

1. आवेदक का नाम: ________________________
2. पता: ग्राम चंद्रा, वार्ड ___, हाउस नंबर ___
3. आधार नंबर: ____-____-____-____
4. मोबाइल: +91 ___________
5. परिवार के सदस्य: ___ व्यक्ति
6. वर्तमान जल स्रोत: हैंडपंप/कुआं/टैंकर/अन्य
7. घर का स्वामित्व: स्वयं का/किराये का

संलग्नक: (1) आधार (2) निवास प्रमाण (3) फोटो
तिथि: ___________   हस्ताक्षर: ___________`,
  },
  // ── Additional forms for services that previously had no downloadable form ──
  {
    id: 'pmayg-form',
    icon: Home,
    titleHi: 'PMAY-G आवास आवेदन फॉर्म',
    titleEn: 'PMAY-G Housing Application Form',
    descHi: 'प्रधानमंत्री आवास योजना-ग्रामीण के तहत ₹1,20,000 सहायता।',
    descEn: '₹1,20,000 assistance under PMAY-Gramin.',
    category: 'scheme',
    fee: 'निःशुल्क / Free',
    duration: 'सत्यापन 30 दिन / verification 30 days',
    body: `प्रधानमंत्री आवास योजना-ग्रामीण आवेदन / PMAY-G APPLICATION
ग्राम पंचायत चंद्रा, कोड 3145021064, शंकरगढ़, प्रयागराज, उ.प्र.

1. आवेदक का नाम / Applicant Name: ________________________
2. पिता/पति का नाम / Father/Husband Name: ________________________
3. पता / Address: ग्राम चंद्रा, वार्ड ___, पिन 212108
4. आधार नंबर / Aadhaar No: ____-____-____-____
5. मोबाइल / Mobile: +91 ___________
6. बीपीएल राशन कार्ड नंबर / BPL Ration Card No: ___________
7. परिवार के सदस्य / Family Members: ___ व्यक्ति
8. वर्तमान घर का प्रकार / Current House Type: कच्चा/पक्का/अन्य
9. वार्षिक आय / Annual Income: ₹___________
10. बैंक खाता नंबर / Bank A/c No: ___________
11. IFSC कोड / IFSC Code: ___________

संलग्नक / Enclosures:
(1) आधार कार्ड (परिवार के सभी सदस्यों का)
(2) बीपीएल राशन कार्ड
(3) आय प्रमाणपत्र (₹3 लाख से कम)
(4) कच्चा घर का फोटो
(5) बैंक पासबुक
(6) जमीन के रिकॉर्ड (यदि अपनी जमीन पर)

तिथि: ___________   आवेदक हस्ताक्षर: ___________
कार्यालय उपयोग / Office Use: सत्यापित ✓/✗   प्रधान हस्ताक्षर: ___________`,
    onlineUrl: 'https://pmayg.nic.in',
    onlineLabel: 'PMAY-G Portal',
    relatedServiceId: 'pmayg',
  },
  {
    id: 'jjm-form',
    icon: Home,
    titleHi: 'जल जीवन मिशन — नल कनेक्शन आवेदन',
    titleEn: 'Jal Jeevan Mission — Tap Connection Application',
    descHi: 'घरेलू नल कनेक्शन। निःशुल्क पहला कनेक्शन।',
    descEn: 'Household tap connection. Free first connection.',
    category: 'utility',
    fee: 'निःशुल्क / Free (first)',
    duration: '15-30 दिन / days',
    body: `जल जीवन मिशन नल कनेक्शन आवेदन / JJM TAP CONNECTION APPLICATION
ग्राम पंचायत चंद्रा, शंकरगढ़, प्रयागराज, उ.प्र.

1. आवेदक का नाम / Applicant Name: ________________________
2. पता / Address: ग्राम चंद्रा, वार्ड ___, पिन 212108
3. आधार नंबर / Aadhaar No: ____-____-____-____
4. मोबाइल / Mobile: +91 ___________
5. मकान स्वामित्व / House Ownership: स्वयं का/किराये का
6. खतियान / रजिस्ट्री नंबर / Khatian No: ___________
7. वर्तमान जल स्रोत / Current Water Source: हैंडपंप/कुआं/टैंकर/अन्य
8. बैंक खाता (सब्सिडी हेतु) / Bank A/c: ___________

संलग्नक / Enclosures:
(1) आधार कार्ड
(2) मकान स्वामित्व का प्रमाण (खतियान/रजिस्ट्री)
(3) राशन कार्ड (पता प्रमाण)
(4) बैंक पासबुक
(5) पिछला बिल (यदि पहले से कनेक्शन है)

तिथि: ___________   आवेदक हस्ताक्षर: ___________`,
    onlineUrl: 'https://jaljeevanmission.gov.in',
    onlineLabel: 'JJM Portal',
    relatedServiceId: 'jjm',
  },
  {
    id: 'old-age-pension-form',
    icon: HeartPulse,
    titleHi: 'वृद्धावस्था पेंशन आवेदन (IGNOAPS)',
    titleEn: 'Old Age Pension Application (IGNOAPS)',
    descHi: '60+ वर्ष के लिए ₹1,000/माह पेंशन।',
    descEn: '₹1,000/month pension for 60+ years.',
    category: 'scheme',
    fee: 'निःशुल्क / Free',
    duration: '30 दिन / days',
    body: `वृद्धावस्था पेंशन आवेदन / OLD AGE PENSION APPLICATION
ग्राम पंचायत चंद्रा, शंकरगढ़, प्रयागराज, उ.प्र.

1. आवेदक का नाम / Applicant Name: ________________________
2. पिता/पति का नाम / Father/Husband Name: ________________________
3. जन्म तिथि / Date of Birth: ___/___/______
4. आयु / Age: ___ वर्ष
5. पता / Address: ग्राम चंद्रा, वार्ड ___, पिन 212108
6. आधार नंबर / Aadhaar No: ____-____-____-____
7. मोबाइल / Mobile: +91 ___________
8. बैंक खाता नंबर / Bank A/c No: ___________
9. IFSC कोड / IFSC Code: ___________
10. वार्षिक आय / Annual Income: ₹___________ (BPL)

संलग्नक / Enclosures:
(1) आधार कार्ड
(2) आयु प्रमाण (जन्म प्रमाणपत्र/वोटर आईडी/स्कूल प्रमाणपत्र)
(3) आय प्रमाणपत्र (BPL)
(4) बैंक पासबुक
(5) राशन कार्ड
(6) पासपोर्ट साइज फोटो

तिथि: ___________   आवेदक हस्ताक्षर: ___________`,
    onlineUrl: 'https://sspy-up.gov.in',
    onlineLabel: 'SSPY UP Portal',
    relatedServiceId: 'old-age-pension',
  },
  {
    id: 'widow-pension-form',
    icon: HeartPulse,
    titleHi: 'विधवा पेंशन आवेदन',
    titleEn: 'Widow Pension Application',
    descHi: 'विधवा महिलाओं के लिए ₹1,000/माह पेंशन।',
    descEn: '₹1,000/month pension for widows.',
    category: 'scheme',
    fee: 'निःशुल्क / Free',
    duration: '30 दिन / days',
    body: `विधवा पेंशन आवेदन / WIDOW PENSION APPLICATION
ग्राम पंचायत चंद्रा, शंकरगढ़, प्रयागराज, उ.प्र.

1. आवेदक का नाम / Applicant Name: ________________________
2. पति का नाम / Husband Name: ________________________
3. पति की मृत्यु तिथि / Husband's Death Date: ___/___/______
4. आयु / Age: ___ वर्ष
5. पता / Address: ग्राम चंद्रा, वार्ड ___, पिन 212108
6. आधार नंबर / Aadhaar No: ____-____-____-____
7. मोबाइल / Mobile: +91 ___________
8. बैंक खाता नंबर (विधवा के नाम पर) / Bank A/c: ___________
9. IFSC कोड / IFSC Code: ___________
10. वार्षिक आय / Annual Income: ₹___________ (BPL)

संलग्नक / Enclosures:
(1) आधार कार्ड
(2) पति का मृत्यु प्रमाणपत्र
(3) आय प्रमाणपत्र (BPL)
(4) बैंक पासबुक (विधवा के नाम पर)
(5) राशन कार्ड
(6) पासपोर्ट साइज फोटो

तिथि: ___________   आवेदक हस्ताक्षर: ___________`,
    onlineUrl: 'https://sspy-up.gov.in',
    onlineLabel: 'SSPY UP Portal',
    relatedServiceId: 'widow-pension',
  },
  {
    id: 'mgnrega-form',
    icon: Landmark,
    titleHi: 'मनरेगा जॉब कार्ड आवेदन',
    titleEn: 'MGNREGA Job Card Application',
    descHi: '100 दिन की गारंटीकृत रोजगार हेतु जॉब कार्ड।',
    descEn: 'Job card for 100-day guaranteed employment.',
    category: 'scheme',
    fee: 'निःशुल्क / Free',
    duration: '15 दिन / days',
    body: `मनरेगा जॉब कार्ड आवेदन / MGNREGA JOB CARD APPLICATION
ग्राम पंचायत चंद्रा, कोड 3145021064, शंकरगढ़, प्रयागराज, उ.प्र.

1. आवेदक का नाम / Applicant Name: ________________________
2. पिता/पति का नाम / Father/Husband Name: ________________________
3. आयु / Age: ___ वर्ष
4. पता / Address: ग्राम चंद्रा, वार्ड ___, पिन 212108
5. आधार नंबर / Aadhaar No: ____-____-____-____
6. मोबाइल / Mobile: +91 ___________
7. परिवार के सदस्य / Family Members: ___ व्यक्ति
8. बैंक खाता नंबर / Bank A/c No: ___________
9. IFSC कोड / IFSC Code: ___________

परिवार के सदस्यों का विवरण / Family Member Details:
क्र.सं. | नाम | आयु | आधार नंबर | संबंध
1. ___________ | _____ | ________ | __________
2. ___________ | _____ | ________ | __________
3. ___________ | _____ | ________ | __________

संलग्नक / Enclosures:
(1) आधार कार्ड (परिवार के सभी सदस्यों का)
(2) निवास प्रमाणपत्र
(3) बैंक पासबुक
(4) पासपोर्ट साइज फोटो

तिथि: ___________   आवेदक हस्ताक्षर: ___________`,
    onlineUrl: 'https://nregaweb2.nic.in',
    onlineLabel: 'NREGA Portal',
    relatedServiceId: 'mgnrega',
  },
  {
    id: 'ayushman-form',
    icon: HeartPulse,
    titleHi: 'आयुष्मान भारत कार्ड आवेदन (PM-JAY)',
    titleEn: 'Ayushman Bharat Card Application (PM-JAY)',
    descHi: '₹5 लाख/परिवार/वर्ष का निःशुल्क स्वास्थ्य बीमा।',
    descEn: '₹5 lakh/family/year free health insurance.',
    category: 'scheme',
    fee: 'निःशुल्क / Free',
    duration: 'तुरंत / Instant',
    body: `आयुष्मान भारत कार्ड आवेदन / AYUSHMAN BHARAT CARD APPLICATION
ग्राम पंचायत चंद्रा, शंकरगढ़, प्रयागराज, उ.प्र.

1. आवेदक का नाम / Applicant Name: ________________________
2. पति/पिता का नाम / Husband/Father Name: ________________________
3. पता / Address: ग्राम चंद्रा, वार्ड ___, पिन 212108
4. आधार नंबर / Aadhaar No: ____-____-____-____
5. मोबाइल नंबर (आधार से लिंक) / Mobile: +91 ___________
6. राशन कार्ड नंबर / Ration Card No: ___________
7. परिवार के सदस्य / Family Members: ___ व्यक्ति

परिवार के सदस्यों का विवरण / Family Member Details:
क्र.सं. | नाम | आयु | लिंग | आधार नंबर
1. ___________ | _____ | ___ | __________
2. ___________ | _____ | ___ | __________
3. ___________ | _____ | ___ | __________

संलग्नक / Enclosures:
(1) आधार कार्ड
(2) राशन कार्ड (परिवार की सूची)
(3) मोबाइल नंबर (आधार से लिंक)
(4) पते का प्रमाण

तिथि: ___________   आवेदक हस्ताक्षर: ___________`,
    onlineUrl: 'https://pmjay.gov.in',
    onlineLabel: 'PM-JAY Portal',
    relatedServiceId: 'ayushman',
  },
  {
    id: 'scholarship-form',
    icon: GraduationCap,
    titleHi: 'छात्रवृत्ति आवेदन (पोस्ट-मैट्रिक)',
    titleEn: 'Scholarship Application (Post-Matric)',
    descHi: 'SC/ST/OBC छात्रों के लिए छात्रवृत्ति।',
    descEn: 'Scholarship for SC/ST/OBC students.',
    category: 'scheme',
    fee: 'निःशुल्क / Free',
    duration: '60-90 दिन / days',
    body: `छात्रवृत्ति आवेदन / SCHOLARSHIP APPLICATION (POST-MATRIC)
ग्राम पंचायत चंद्रा, शंकरगढ़, प्रयागराज, उ.प्र.

1. छात्र का नाम / Student Name: ________________________
2. पिता का नाम / Father Name: ________________________
3. माता का नाम / Mother Name: ________________________
4. पता / Address: ग्राम चंद्रा, वार्ड ___, पिन 212108
5. आधार नंबर / Aadhaar No: ____-____-____-____
6. मोबाइल / Mobile: +91 ___________
7. जाति / Caste: SC/ST/OBC/General
8. जाति प्रमाणपत्र नंबर / Caste Cert No: ___________
9. वर्तमान कक्षा/कोर्स / Current Class/Course: ___________
10. स्कूल/कॉलेज का नाम / School/College Name: ___________
11. बैंक खाता नंबर (छात्र के नाम पर) / Bank A/c: ___________
12. IFSC कोड / IFSC Code: ___________

संलग्क / Enclosures:
(1) आधार कार्ड
(2) जाति प्रमाणपत्र (SC/ST/OBC के लिए)
(3) आय प्रमाणपत्र
(4) पिछली कक्षा की मार्कशीट
(5) वर्तमान स्कूल/कॉलेज का प्रमाणपत्र
(6) बैंक पासबुक (छात्र के नाम पर)
(7) राशन कार्ड

तिथि: ___________   छात्र हस्ताक्षर: ___________   अभिभावक हस्ताक्षर: ___________`,
    onlineUrl: 'https://scholarship.up.gov.in',
    onlineLabel: 'UP Scholarship Portal',
    relatedServiceId: 'scholarship',
  },
]

const CATEGORY_LABELS: Record<FormDef['category'], { hi: string; en: string }> = {
  certificate: { hi: 'प्रमाणपत्र', en: 'Certificate' },
  scheme: { hi: 'योजना', en: 'Scheme' },
  grievance: { hi: 'शिकायत', en: 'Grievance' },
  utility: { hi: 'उपयोगिता', en: 'Utility' },
}

// ── Document checklist data (from DocumentChecklist) ──
type ServiceCategory =
  | 'identity'
  | 'residence'
  | 'income'
  | 'caste'
  | 'housing'
  | 'welfare'
  | 'education'
  | 'health'

interface DocumentItem {
  hi: string
  en: string
  required: boolean
  noteHi?: string
  noteEn?: string
}

interface DocumentService {
  id: string
  category: ServiceCategory
  nameHi: string
  nameEn: string
  documents: DocumentItem[]
  applyUrl?: string
  applyPhone?: string
}

const DOCUMENT_SERVICES: DocumentService[] = [
  {
    id: 'income-cert',
    category: 'income',
    nameHi: 'आय प्रमाणपत्र',
    nameEn: 'Income Certificate',
    documents: [
      { hi: 'आधार कार्ड', en: 'Aadhaar card', required: true },
      { hi: 'राशन कार्ड', en: 'Ration card', required: true },
      { hi: 'वेतन पर्ची (सरकारी/निजी कर्मचारी)', en: 'Salary slip (Govt/Private employee)', required: false, noteHi: 'नौकरीपेशा के लिए', noteEn: 'For salaried' },
      { hi: 'भूमि के रिकॉर्ड (खतियान / लगान रसीद)', en: 'Land records (Khatian / Lagaan receipt)', required: false, noteHi: 'किसानों के लिए', noteEn: 'For farmers' },
      { hi: 'शपथ पत्र (स्व-घोषणा)', en: 'Affidavit (self-declaration)', required: true },
    ],
    applyUrl: 'https://edistrict.up.gov.in',
  },
  {
    id: 'caste-cert',
    category: 'caste',
    nameHi: 'जाति प्रमाणपत्र',
    nameEn: 'Caste Certificate',
    documents: [
      { hi: 'आधार कार्ड', en: 'Aadhaar card', required: true },
      { hi: 'माता-पिता का जाति प्रमाणपत्र', en: "Parents' caste certificate", required: true, noteHi: 'अनिवार्य अधिकांश राज्यों में', noteEn: 'Mandatory in most states' },
      { hi: 'राशन कार्ड / बिजली बिल (पता प्रमाण)', en: 'Ration card / Electricity bill (address proof)', required: true },
      { hi: 'स्कूल छोड़ने का प्रमाणपत्र (TC)', en: 'School leaving certificate (TC)', required: false, noteHi: 'यदि उपलब्ध', noteEn: 'If available' },
      { hi: 'शपथ पत्र', en: 'Affidavit', required: true },
    ],
    applyUrl: 'https://edistrict.up.gov.in',
  },
  {
    id: 'residence-cert',
    category: 'residence',
    nameHi: 'निवास प्रमाणपत्र (डोमिसाइल)',
    nameEn: 'Residence Certificate (Domicile)',
    documents: [
      { hi: 'आधार कार्ड', en: 'Aadhaar card', required: true },
      { hi: 'राशन कार्ड', en: 'Ration card', required: true },
      { hi: 'बिजली / पानी बिल (वर्तमान पते का प्रमाण)', en: 'Electricity / Water bill (current address proof)', required: true },
      { hi: 'मकान स्वामित्व के रिकॉर्ड (खतियान)', en: 'House ownership records (Khatian)', required: false },
      { hi: 'शपथ पत्र', en: 'Affidavit', required: true },
    ],
    applyUrl: 'https://edistrict.up.gov.in',
  },
  {
    id: 'pmayg',
    category: 'housing',
    nameHi: 'PMAY-G आवास सहायता',
    nameEn: 'PMAY-G Housing Assistance',
    documents: [
      { hi: 'आधार कार्ड (परिवार के सभी सदस्यों का)', en: 'Aadhaar (all family members)', required: true },
      { hi: 'बीपीएल राशन कार्ड', en: 'BPL Ration card', required: true },
      { hi: 'आय प्रमाणपत्र (₹3 लाख से कम)', en: 'Income certificate (less than ₹3 lakh)', required: true },
      { hi: 'कच्चा घर का फोटो', en: 'Photo of kachha house', required: true },
      { hi: 'बैंक पासबुक (खाता विवरण)', en: 'Bank passbook (account details)', required: true },
      { hi: 'जमीन के रिकॉर्ड (यदि अपनी जमीन पर)', en: 'Land records (if on own land)', required: false },
    ],
    applyPhone: '9651035021',
  },
  {
    id: 'jjm',
    category: 'welfare',
    nameHi: 'जल जीवन मिशन — नल कनेक्शन',
    nameEn: 'Jal Jeevan Mission — Tap Connection',
    documents: [
      { hi: 'आधार कार्ड', en: 'Aadhaar card', required: true },
      { hi: 'मकान स्वामित्व का प्रमाण (खतियान / रजिस्ट्री)', en: 'House ownership proof (Khatian / Registry)', required: true },
      { hi: 'राशन कार्ड (पता प्रमाण)', en: 'Ration card (address proof)', required: true },
      { hi: 'बैंक पासबुक', en: 'Bank passbook', required: false, noteHi: 'सब्सिडी के लिए', noteEn: 'For subsidy' },
      { hi: 'पिछला बिल (यदि पहले से कनेक्शन है)', en: 'Previous bill (if existing connection)', required: false },
    ],
    applyPhone: '9651035021',
  },
  {
    id: 'old-age-pension',
    category: 'welfare',
    nameHi: 'वृद्धावस्था पेंशन (IGNOAPS)',
    nameEn: 'Old Age Pension (IGNOAPS)',
    documents: [
      { hi: 'आधार कार्ड', en: 'Aadhaar card', required: true },
      { hi: 'आयु प्रमाण (जन्म प्रमाणपत्र / वोटर आईडी / स्कूल प्रमाणपत्र)', en: 'Age proof (Birth cert / Voter ID / School cert)', required: true },
      { hi: 'आय प्रमाणपत्र (BPL)', en: 'Income certificate (BPL)', required: true },
      { hi: 'बैंक पासबुक', en: 'Bank passbook', required: true },
      { hi: 'राशन कार्ड', en: 'Ration card', required: true },
      { hi: 'पासपोर्ट साइज फोटो', en: 'Passport-size photo', required: true },
    ],
    applyUrl: 'https://sspy-up.gov.in',
  },
  {
    id: 'mgnrega',
    category: 'welfare',
    nameHi: 'मनरेगा जॉब कार्ड',
    nameEn: 'MGNREGA Job Card',
    documents: [
      { hi: 'आधार कार्ड (परिवार के सभी सदस्यों का)', en: 'Aadhaar (all family members)', required: true },
      { hi: 'राशन कार्ड', en: 'Ration card', required: true },
      { hi: 'बैंक पासबुक', en: 'Bank passbook', required: true },
      { hi: 'निवास प्रमाण', en: 'Residence proof', required: true },
      { hi: 'पासपोर्ट साइज फोटो', en: 'Passport-size photo', required: true },
    ],
    applyUrl: 'https://nrega.nic.in',
  },
  {
    id: 'ayushman',
    category: 'health',
    nameHi: 'आयुष्मान भारत कार्ड (PM-JAY)',
    nameEn: 'Ayushman Bharat Card (PM-JAY)',
    documents: [
      { hi: 'आधार कार्ड', en: 'Aadhaar card', required: true },
      { hi: 'राशन कार्ड (परिवार की सूची)', en: 'Ration card (family list)', required: true },
      { hi: 'मोबाइल नंबर (आधार से लिंक)', en: 'Mobile number (linked to Aadhaar)', required: true },
      { hi: 'पते का प्रमाण', en: 'Address proof', required: false },
    ],
    applyUrl: 'https://pmjay.gov.in',
  },
  {
    id: 'scholarship',
    category: 'education',
    nameHi: 'छात्रवृत्ति (पोस्ट-मैट्रिक)',
    nameEn: 'Scholarship (Post-Matric)',
    documents: [
      { hi: 'आधार कार्ड', en: 'Aadhaar card', required: true },
      { hi: 'जाति प्रमाणपत्र (SC/ST/OBC के लिए)', en: 'Caste certificate (for SC/ST/OBC)', required: true },
      { hi: 'आय प्रमाणपत्र', en: 'Income certificate', required: true },
      { hi: 'पिछली कक्षा की मार्कशीट', en: 'Previous class marksheet', required: true },
      { hi: 'वर्तमान स्कूल/कॉलेज का प्रमाणपत्र', en: 'Current school/college certificate', required: true },
      { hi: 'बैंक पासबुक (छात्र के नाम पर)', en: 'Bank passbook (in student name)', required: true },
      { hi: 'राशन कार्ड', en: 'Ration card', required: false },
    ],
    applyUrl: 'https://scholarship.up.gov.in',
  },
  {
    id: 'widow-pension',
    category: 'welfare',
    nameHi: 'विधवा पेंशन',
    nameEn: 'Widow Pension',
    documents: [
      { hi: 'आधार कार्ड', en: 'Aadhaar card', required: true },
      { hi: 'पति का मृत्यु प्रमाणपत्र', en: "Husband's death certificate", required: true },
      { hi: 'आय प्रमाणपत्र (BPL)', en: 'Income certificate (BPL)', required: true },
      { hi: 'बैंक पासबुक (विधवा के नाम पर)', en: 'Bank passbook (in widow name)', required: true },
      { hi: 'राशन कार्ड', en: 'Ration card', required: true },
      { hi: 'आयु प्रमाण (18-60 वर्ष)', en: 'Age proof (18-60 years)', required: true },
      { hi: 'पासपोर्ट साइज फोटो', en: 'Passport-size photo', required: true },
    ],
  },
]

// ── Helper: find required docs for a form ──
function getRequiredDocs(formId: string): DocumentService | undefined {
  return DOCUMENT_SERVICES.find(s => s.id === formId)
}

/** Download the form body as a .txt file */
function downloadForm(form: FormDef) {
  const blob = new Blob([form.body], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${form.id}-form.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/** Print the form body via a new window */
function printForm(form: FormDef) {
  const w = window.open('', '_blank', 'width=700,height=900')
  if (!w) return
  w.document.write(`
    <html><head><title>${form.titleEn} — Form</title>
    <style>
      body { font-family: 'Noto Sans Devanagari', Arial, sans-serif; padding: 32px; color: #1a1a1a; line-height: 1.6; }
      h2 { color: #c2410c; border-bottom: 2px solid #c2410c; padding-bottom: 8px; }
      pre { white-space: pre-wrap; font-family: inherit; font-size: 13px; }
      @page { margin: 1.5cm; }
    </style></head><body>
    <h2>ग्राम पंचायत चंद्रा — ${form.titleHi}</h2>
    <pre>${form.body.replace(/</g, '&lt;')}</pre>
    </body></html>
  `)
  w.document.close()
  w.focus()
  setTimeout(() => w.print(), 300)
}

export function DownloadsSection() {
  const { locale } = useI18n()
  const [filter, setFilter] = useState<'all' | FormDef['category']>('all')
  const [expandedDocs, setExpandedDocs] = useState<string | null>(null)
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({})
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const hi = locale === 'hi'

  const filtered = filter === 'all' ? FORMS : FORMS.filter(f => f.category === filter)
  const categories: ('all' | FormDef['category'])[] = ['all', 'certificate', 'scheme', 'grievance', 'utility']

  const handleToggleDoc = (key: string) => {
    setCheckedDocs((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleCopyDocs = async (service: DocumentService) => {
    const text = hi
      ? `${service.nameHi}\n${service.documents.map((d, i) => `${i + 1}. ${d.hi}${d.required ? ' (अनिवार्य)' : ' (वैकल्पिक)'}${d.noteHi ? ' — ' + d.noteHi : ''}`).join('\n')}`
      : `${service.nameEn}\n${service.documents.map((d, i) => `${i + 1}. ${d.en}${d.required ? ' (Required)' : ' (Optional)'}${d.noteEn ? ' — ' + d.noteEn : ''}`).join('\n')}`
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(service.id)
      toast.success(hi ? 'दस्तावेज़ सूची कॉपी हुई' : 'Document list copied')
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      toast.error(hi ? 'कॉपी विफल' : 'Copy failed')
    }
  }

  return (
    <section id="downloads" className="section-premium py-16 md:py-20 border-b border-border/40">
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-10">
          <Badge variant="outline" className="section-header-badge mb-3 gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            {hi ? 'फॉर्म डाउनलोड / दस्तावेज़ चेकलिस्ट' : 'Form Downloads / Document Checklist'}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gradient-premium">
            {hi ? 'फॉर्म डाउनलोड / दस्तावेज़ चेकलिस्ट' : 'Form Downloads & Document Checklist'}
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            {hi
              ? 'सरकारी फॉर्म डाउनलोड करें, ज़रूरी दस्तावेज़ चेक करें, या ऑनलाइन आवेदन करें।'
              : 'Download government forms, check required documents, or apply online.'}
          </p>
        </div>

        {/* Category filter pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map(cat => {
            const active = filter === cat
            const label = cat === 'all'
              ? (hi ? 'सभी / All' : 'All')
              : (hi ? CATEGORY_LABELS[cat].hi : CATEGORY_LABELS[cat].en)
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={cn(
                  'rounded-full px-3.5 py-1.5 text-xs font-medium transition-all',
                  active
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary',
                )}
              >
                {label}
              </button>
            )
          })}
        </div>

        {/* Forms grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((form, i) => {
            const docService = form.relatedServiceId ? getRequiredDocs(form.relatedServiceId) : undefined
            const isDocsExpanded = expandedDocs === form.id

            return (
              <ScrollReveal key={form.id} delay={i * 50}>
                <Card className="card-premium hover-lift h-full overflow-hidden">
                  <CardContent className="p-5 flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                        <form.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm leading-tight">
                          {hi ? form.titleHi : form.titleEn}
                        </h3>
                        <Badge variant="secondary" className="mt-1 text-[10px]">
                          {hi ? CATEGORY_LABELS[form.category].hi : CATEGORY_LABELS[form.category].en}
                        </Badge>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-muted-foreground mb-3">
                      {hi ? form.descHi : form.descEn}
                    </p>

                    {/* Meta: fee + duration */}
                    <div className="flex items-center gap-3 mb-3 text-[11px]">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <IndianRupee className="h-3 w-3" />
                        {form.fee}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {form.duration}
                      </span>
                    </div>

                    {/* Required Documents sub-section */}
                    {docService && docService.documents.length > 0 && (
                      <div className="mb-3 border border-border/60 rounded-lg overflow-hidden">
                        <button
                          onClick={() => setExpandedDocs(isDocsExpanded ? null : form.id)}
                          className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium bg-muted/40 hover:bg-muted/60 transition-colors"
                        >
                          <span className="flex items-center gap-1.5">
                            <FileCheck className="h-3.5 w-3.5 text-primary" />
                            {hi ? 'ज़रूरी दस्तावेज़' : 'Required Documents'}
                            <span className="text-muted-foreground">
                              ({docService.documents.filter(d => d.required).length}/{docService.documents.length})
                            </span>
                          </span>
                          {isDocsExpanded ? (
                            <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </button>
                        <AnimatePresence initial={false}>
                          {isDocsExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: 'easeInOut' }}
                              className="overflow-hidden"
                            >
                              <div className="px-3 py-2 space-y-1">
                                {docService.documents.map((doc, di) => {
                                  const key = `${form.id}-${di}`
                                  const isChecked = !!checkedDocs[key]
                                  return (
                                    <label
                                      key={di}
                                      className={cn(
                                        'flex items-start gap-2 p-1.5 rounded-md cursor-pointer transition-all text-[11px]',
                                        isChecked
                                          ? 'bg-emerald-50 dark:bg-emerald-950/30'
                                          : 'hover:bg-secondary/40',
                                      )}
                                    >
                                      <button
                                        type="button"
                                        role="checkbox"
                                        aria-checked={isChecked}
                                        onClick={() => handleToggleDoc(key)}
                                        className={cn(
                                          'mt-0.5 h-4 w-4 rounded border-2 grid place-items-center shrink-0 transition-all',
                                          isChecked
                                            ? 'border-emerald-500 bg-emerald-500 text-white'
                                            : 'border-border bg-background hover:border-primary',
                                        )}
                                      >
                                        {isChecked && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                                      </button>
                                      <div className="flex-1 min-w-0">
                                        <span className={cn(isChecked && 'line-through text-muted-foreground')}>
                                          {hi ? doc.hi : doc.en}
                                        </span>
                                        {doc.required ? (
                                          <span className="ml-1 text-[9px] text-red-600 dark:text-red-400">*{hi ? 'अनिवार्य' : 'req'}</span>
                                        ) : (
                                          <span className="ml-1 text-[9px] text-amber-600 dark:text-amber-400">({hi ? 'वैकल्पिक' : 'opt'})</span>
                                        )}
                                        {(doc.noteHi || doc.noteEn) && (
                                          <span className="ml-1 text-[9px] text-muted-foreground">
                                            — {hi ? doc.noteHi : doc.noteEn}
                                          </span>
                                        )}
                                      </div>
                                    </label>
                                  )
                                })}
                                {/* Copy docs button */}
                                <button
                                  onClick={() => handleCopyDocs(docService)}
                                  className="flex items-center gap-1 mt-1 text-[10px] text-primary hover:underline"
                                >
                                  {copiedId === docService.id ? (
                                    <>
                                      <Check className="h-3 w-3" />
                                      {hi ? 'कॉपी हुई' : 'Copied'}
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-3 w-3" />
                                      {hi ? 'सूची कॉपी करें' : 'Copy List'}
                                    </>
                                  )}
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-1.5 mt-auto">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-[11px] gap-1 flex-1"
                        onClick={() => downloadForm(form)}
                      >
                        <Download className="h-3 w-3" />
                        {hi ? 'डाउनलोड' : 'Download'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-[11px] gap-1 flex-1"
                        onClick={() => printForm(form)}
                      >
                        <Printer className="h-3 w-3" />
                        {hi ? 'प्रिंट' : 'Print'}
                      </Button>
                      {form.onlineUrl && (
                        <a
                          href={form.onlineUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 h-7 px-2.5 text-[11px] font-medium rounded-md border border-primary/30 text-primary hover:bg-primary/5 transition-colors flex-1 justify-center"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {form.onlineLabel || (hi ? 'ऑनलाइन' : 'Online')}
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </ScrollReveal>
            )
          })}
        </div>

        {/* Additional services without downloadable forms (document checklist only) */}
        {filter === 'all' && (
          <ScrollReveal delay={0.3}>
            <div className="mt-10">
              <h3 className="text-lg font-semibold text-center mb-6">
                {hi ? 'अन्य सेवाओं के लिए ज़रूरी दस्तावेज़' : 'Required Documents for Other Services'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {DOCUMENT_SERVICES.filter(s => !FORMS.find(f => f.relatedServiceId === s.id)).map((service) => (
                  <Card key={service.id} className="card-premium hover-lift overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0">
                          <FileCheck className="h-4 w-4" />
                        </div>
                        <h4 className="text-sm font-semibold">{hi ? service.nameHi : service.nameEn}</h4>
                      </div>
                      <ul className="space-y-1 mb-3">
                        {service.documents.map((doc, di) => (
                          <li key={di} className="text-[11px] flex items-start gap-1.5">
                            {doc.required ? (
                              <AlertCircle className="h-3 w-3 text-red-500 shrink-0 mt-0.5" />
                            ) : (
                              <span className="h-3 w-3 shrink-0 mt-0.5 rounded-full border border-muted-foreground/40" />
                            )}
                            <span className={doc.required ? 'text-foreground' : 'text-muted-foreground'}>
                              {hi ? doc.hi : doc.en}
                            </span>
                          </li>
                        ))}
                      </ul>
                      {service.applyUrl && (
                        <a
                          href={service.applyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {hi ? 'ऑनलाइन आवेदन' : 'Apply Online'}
                        </a>
                      )}
                      {service.applyPhone && (
                        <a
                          href={`tel:${service.applyPhone}`}
                          className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline ml-3"
                        >
                          <Phone className="h-3 w-3" />
                          {hi ? 'कॉल करें' : 'Call'}
                        </a>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* Footer note */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          {hi
            ? 'फॉर्म भरने हेतु पंचायत कार्यालय से सहायता लें। संपर्क: +91 96510 35021'
            : 'For help filling forms, contact the panchayat office: +91 96510 35021'}
        </p>
      </div>
    </section>
  )
}
