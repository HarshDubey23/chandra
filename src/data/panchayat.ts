/* ──────────────────────────────────────────────────────────────────────
   Shared Panchayat Data — Single Source of Truth
   Gram Panchayat Chandra, Block Shankargarh, Prayagraj, UP

   All hard-coded contact info, panchayat identity, staff, and emergency
   numbers live HERE.  Every component imports from this file instead of
   duplicating data.
   ────────────────────────────────────────────────────────────────────── */

// ── Pradhan (elected head) ──
export const PRADHAN = {
  nameHi: 'श्रीमती संगीता मिश्रा',
  nameEn: 'Smt. Sangita Mishra',
  nameEnFull: 'Mrs. Sangita Mishra',
  initialsHi: 'समि',
  initialsEn: 'SM',
  phone: '9651035021',
  phoneFormatted: '96510 35021',
  phoneHref: 'tel:+919651035021',
  email: 'pradhan@chandra-gp.in',
  educationHi: 'बी.ए. बी.टी.सी.',
  educationEn: 'B.A. BTC',
  photoUrl: '/whatsapp-optimized/IMG-20260725-WA0003.webp',
  tenureStart: '2021-12-19',
  bioHi: 'ग्राम पंचायत चंद्रा की निर्वाचित प्रधान। जल, शिक्षा एवं आवास योजनाओं के क्रियान्वयन में सक्रिय।',
  bioEn: 'Elected Pradhan of Gram Panchayat Chandra. Active in water, education and housing scheme implementation.',
  whatsappUrl: 'https://wa.me/919651035021',
} as const

// ── GPA (Gram Panchayat Adhikari / Secretary) ──
export const GPA = {
  nameHi: 'श्री बलवंत चौहान',
  nameEn: 'Shri Balwant Chauhan',
  nameEnFull: 'Mr. Balwant Chauhan',
  initialsHi: 'बच',
  initialsEn: 'BC',
  phone: '9839312578',
  phoneFormatted: '98393 12578',
  phoneHref: 'tel:+919839312578',
  email: 'gpa@chandra-gp.in',
  designationHi: 'ग्राम पंचायत अधिकारी',
  designationEn: 'Gram Panchayat Adhikari (GPA)',
  appointedByHi: 'ग्राम पंचायत अधिकारी (GPA), बी.डी.ओ. कार्यालय शंकरगढ़ द्वारा नियुक्त',
  appointedByEn: 'Gram Panchayat Adhikari (GPA), appointed by BDO Office Shankargarh',
  photoUrl: '/whatsapp-optimized/IMG-20260725-WA0091.webp',
  noteHi: 'GPA राज्य सरकार द्वारा नियुक्त, निर्वाचित नहीं।',
  noteEn: 'GPA is state-appointed, not elected.',
} as const

// ── Panchayat Identity ──
export const PANCHAYAT = {
  nameHi: 'ग्राम पंचायत चंद्रा',
  nameEn: 'Gram Panchayat Chandra',
  code: '3145021064',
  blockCode: '3145021',
  districtCode: '3145',
  stateCode: '31',
  blockHi: 'शंकरगढ़',
  blockEn: 'Shankargarh',
  districtHi: 'प्रयागराज',
  districtEn: 'Prayagraj',
  stateHi: 'उत्तर प्रदेश',
  stateEn: 'Uttar Pradesh',
  pincode: '212108',
  totalWards: 11,
  villagesUnderGP: 1,
  populationRef: 'Census 2011',
} as const

// ── Office Address ──
export const OFFICE_ADDRESS = {
  hi: 'ग्राम पंचायत चंद्रा, विकास खण्ड शंकरगढ़, जनपद प्रयागराज, उत्तर प्रदेश - 212108',
  en: 'Gram Panchayat Chandra, Block Shankargarh, District Prayagraj, Uttar Pradesh - 212108',
  shortHi: 'शंकरगढ़, प्रयागराज, उ.प्र.',
  shortEn: 'Shankargarh, Prayagraj, UP',
} as const

// ── Staff Directory (12 people) ──
export type StaffCategory = 'official' | 'health' | 'education' | 'sanitation' | 'emergency'

export interface StaffMember {
  id: number
  nameHi: string
  nameEn: string
  designationHi: string
  designationEn: string
  phone?: string
  category: StaffCategory
  initialsHi: string
  initialsEn: string
}

export const STAFF: StaffMember[] = [
  {
    id: 1,
    nameHi: 'संगीता मिश्रा',
    nameEn: 'Sangita Mishra',
    designationHi: 'ग्राम प्रधान',
    designationEn: 'Gram Pradhan',
    phone: '9651035021',
    category: 'official',
    initialsHi: 'सं',
    initialsEn: 'SM',
  },
  {
    id: 2,
    nameHi: 'बलवंत चौहान',
    nameEn: 'Balwant Chauhan',
    designationHi: 'ग्राम पंचायत अधिकारी',
    designationEn: 'Gram Panchayat Adhikari (GPA)',
    phone: '9839312578',
    category: 'official',
    initialsHi: 'ब',
    initialsEn: 'BC',
  },
  {
    id: 3,
    nameHi: 'श्रीमती पूनम मौर्य',
    nameEn: 'Smt. Poonam Maurya',
    designationHi: 'लेखपाल',
    designationEn: 'Lekhpal',
    phone: '9450273074',
    category: 'official',
    initialsHi: 'पू',
    initialsEn: 'PM',
  },
  {
    id: 4,
    nameHi: 'अर्चना सिंह',
    nameEn: 'Archana Singh',
    designationHi: 'ANM (सहायक नर्स-मित्र)',
    designationEn: 'ANM (Auxiliary Nurse Midwife)',
    phone: '8528667723',
    category: 'health',
    initialsHi: 'अ',
    initialsEn: 'AS',
  },
  {
    id: 5,
    nameHi: 'अनीता सिंह',
    nameEn: 'Anita Singh',
    designationHi: 'आशा कार्यकर्ता',
    designationEn: 'Asha Worker',
    phone: '8188081020',
    category: 'health',
    initialsHi: 'अ',
    initialsEn: 'AS',
  },
  {
    id: 6,
    nameHi: 'दया शंकर',
    nameEn: 'Daya Shankar',
    designationHi: 'सफाई कर्मी',
    designationEn: 'Sanitation Worker',
    phone: '6392167328',
    category: 'sanitation',
    initialsHi: 'द',
    initialsEn: 'DS',
  },
  {
    id: 7,
    nameHi: 'पुष्प लता तिवारी',
    nameEn: 'Pushpa Lata Tiwari',
    designationHi: 'पंचायत सहायिका',
    designationEn: 'Panchayat Assistant',
    phone: '8931943436',
    category: 'official',
    initialsHi: 'पु',
    initialsEn: 'PT',
  },
  {
    id: 8,
    nameHi: 'अल्ताफ मोहम्मद',
    nameEn: 'Altaf Mohammad',
    designationHi: 'प्रधानाध्यापक',
    designationEn: 'Headmaster',
    phone: '7054306848',
    category: 'education',
    initialsHi: 'अ',
    initialsEn: 'AM',
  },
  {
    id: 9,
    nameHi: 'पुष्पेन्द्र सिंह',
    nameEn: 'Pushpendra Singh',
    designationHi: 'सहायक अध्यापक',
    designationEn: 'Assistant Teacher',
    phone: '8858881045',
    category: 'education',
    initialsHi: 'पु',
    initialsEn: 'PS',
  },
  {
    id: 10,
    nameHi: 'श्रीमती संध्या सिंह',
    nameEn: 'Smt. Sandhya Singh',
    designationHi: 'सहायक अध्यापिका',
    designationEn: 'Assistant Teacher',
    category: 'education',
    initialsHi: 'सं',
    initialsEn: 'SS',
  },
  {
    id: 11,
    nameHi: 'विमला देवी',
    nameEn: 'Vimala Devi',
    designationHi: 'रसोईया',
    designationEn: 'Cook',
    phone: '9519805850',
    category: 'education',
    initialsHi: 'वि',
    initialsEn: 'VD',
  },
  {
    id: 12,
    nameHi: 'थानाध्यक्ष थाना बारा',
    nameEn: 'SHO Bara',
    designationHi: 'थानाध्यक्ष',
    designationEn: 'Station House Officer',
    phone: '9454402820',
    category: 'emergency',
    initialsHi: 'थ',
    initialsEn: 'SHO',
  },
] as const

// ── Emergency Numbers (100, 108, 112) ──
export const EMERGENCY_NUMBERS = [
  { id: 'police', labelHi: 'पुलिस', labelEn: 'Police', number: '100', color: 'bg-red-600' },
  { id: 'ambulance', labelHi: 'एम्बुलेंस', labelEn: 'Ambulance', number: '108', color: 'bg-green-600' },
  { id: 'emergency', labelHi: 'आपातकाल', labelEn: 'Emergency', number: '112', color: 'bg-amber-600' },
] as const

// ── Important Numbers (for Footer Quick Dial) ──
export const IMPORTANT_NUMBERS = [
  { labelHi: 'प्रधान (संगीता मिश्रा)', labelEn: 'Pradhan (Sangita Mishra)', phone: '9651035021', badgeLabelHi: 'प्रधान', badgeLabelEn: 'Pradhan', color: 'primary' },
  { labelHi: 'GPA (बलवंत चौहान)', labelEn: 'GPA (Balwant Chauhan)', phone: '9839312578', badgeLabelHi: 'GPA (बलवंत चौहान)', badgeLabelEn: 'GPA (Balwant)', color: 'green' },
  { labelHi: 'शो बारा', labelEn: 'SHO Bara', phone: '9454402820', badgeLabelHi: 'शो बारा', badgeLabelEn: 'SHO Bara', color: 'red' },
  { labelHi: 'ANM (अर्चना सिंह)', labelEn: 'ANM (Archana Singh)', phone: '8528667723', badgeLabelHi: 'ANM', badgeLabelEn: 'ANM', color: 'pink' },
  { labelHi: 'आपातकालीन हेल्पलाइन', labelEn: 'Emergency Helpline', phone: '112', badgeLabelHi: 'आपातकाल', badgeLabelEn: 'Emergency', color: 'amber' },
] as const

// ── Data Sources (for AboutPortal) ──
export const DATA_SOURCES = [
  { name: 'NREGA', url: 'https://nregarep.nic.in/', descHi: 'मनरेगा जॉब कार्ड, वेतन, योजना विवरण', descEn: 'MGNREGA job cards, wages, scheme details' },
  { name: 'eGramSwaraj', url: 'https://egramswaraj.gov.in/', descHi: 'पंचायत बजट, योजना एवं वित्तीय डेटा', descEn: 'Panchayat budget, plans & financial data' },
  { name: 'PMAY-G', url: 'https://pmayg.nic.in/', descHi: 'प्रधानमंत्री आवास योजना लाभार्थी', descEn: 'PM Awas Yojana beneficiaries' },
  { name: 'JJM', url: 'https://jaljeevanmission.gov.in/', descHi: 'जल जीवन मिशन — नल से जल कनेक्शन', descEn: 'Jal Jeevan Mission — tap water connections' },
  { name: 'Census 2011', url: 'https://censusindia.gov.in/', descHi: 'जनगणना 2011 — जनसंख्या एवं सामाजिक डेटा', descEn: 'Census 2011 — population & social data' },
  { name: 'UDISE+', url: 'https://udiseplus.gov.in/', descHi: 'विद्यालय शिक्षा डेटा — छात्र, शिक्षक, बुनियादी ढांचा', descEn: 'School education data — students, teachers, infrastructure' },
] as const
