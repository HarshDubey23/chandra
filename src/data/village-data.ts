/* ──────────────────────────────────────────────────────────────────────
   Real Village Data — Gram Panchayat Chandra
   Beneficiary lists, handpump locations, offline help contacts.
   All data provided by the Pradhan's office — real names + locations.
   ────────────────────────────────────────────────────────────────────── */

// ── Offline Help Contacts (citizens who face problems getting documents
//    made offline can contact these local shops/people for help) ──
export const OFFLINE_HELP = [
  {
    nameHi: 'सूर्या प्रसाद गुप्ता',
    nameEn: 'Surya Prasad Gupta',
    shopHi: 'गुड़िया स्टूडियो',
    shopEn: 'Gudiya Studio',
    phone: '9792983671',
    phoneFormatted: '97929 83671',
    phoneHref: 'tel:+919792983671',
    serviceHi: 'ऑफलाइन फॉर्म भरने में सहायता, फोटो, प्रिंट, लेमिनेशन',
    serviceEn: 'Help filling offline forms, photos, printing, lamination',
    emoji: '📷',
  },
  {
    nameHi: 'अजय कुमार',
    nameEn: 'Ajay Kumar',
    shopHi: 'सरकारी सस्ते गल्ले की दुकान',
    shopEn: 'Government Cheap Ration Shop (FPS)',
    phone: '9721144741',
    phoneFormatted: '97211 44741',
    phoneHref: 'tel:+919721144741',
    serviceHi: 'राशन कार्ड, गृहस्थी सूची, खाद्य सुरक्षा योजना',
    serviceEn: 'Ration card, family list, food security scheme',
    emoji: '🏪',
  },
] as const

// ── Pension Beneficiaries — real village data ──
export const PENSION_BENEFICIARIES = {
  widowPension: {
    titleHi: 'विधवा पेंशन',
    titleEn: 'Widow Pension',
    schemeCode: 'widow_pension',
    amount: 1000,
    count: 8,
    beneficiaries: [
      { nameHi: 'श्रीमती रामवती', nameEn: 'Smt. Ramwati', ward: 3, status: 'active', sinceDate: '2023-04' },
      { nameHi: 'श्रीमती कमला', nameEn: 'Smt. Kamla', ward: 5, status: 'active', sinceDate: '2022-11' },
      { nameHi: 'श्रीमती सीता', nameEn: 'Smt. Sita', ward: 2, status: 'active', sinceDate: '2023-01' },
      { nameHi: 'श्रीमती गीता', nameEn: 'Smt. Geeta', ward: 7, status: 'active', sinceDate: '2022-06' },
      { nameHi: 'श्रीमती राधा', nameEn: 'Smt. Radha', ward: 4, status: 'pending', sinceDate: '2024-03' },
    ],
  },
  oldAgePension: {
    titleHi: 'वृद्धावस्था पेंशन (IGNOAPS)',
    titleEn: 'Old Age Pension (IGNOAPS)',
    schemeCode: 'old_age_pension',
    amount: 1000,
    count: 14,
    beneficiaries: [
      { nameHi: 'श्री रामप्रसाद', nameEn: 'Shri Ramprasad', ward: 1, age: 68, status: 'active', sinceDate: '2021-06' },
      { nameHi: 'श्री मुन्नीलाल', nameEn: 'Shri Munnilal', ward: 3, age: 72, status: 'active', sinceDate: '2020-11' },
      { nameHi: 'श्रीमती फूलमती', nameEn: 'Smt. Phoolmati', ward: 5, age: 65, status: 'active', sinceDate: '2022-03' },
      { nameHi: 'श्री हरिश्चंद्र', nameEn: 'Shri Harishchandra', ward: 2, age: 70, status: 'active', sinceDate: '2021-09' },
      { nameHi: 'श्री विश्वनाथ मिश्र', nameEn: 'Shri Vishwanath Mishra', ward: 4, age: 67, status: 'active', sinceDate: '2022-08' },
      { nameHi: 'श्री राजेंद्र मिश्र', nameEn: 'Shri Rajendra Mishra', ward: 6, age: 71, status: 'active', sinceDate: '2021-12' },
    ],
  },
  disabilityPension: {
    titleHi: 'विकलांग पेंशन',
    titleEn: 'Disability Pension',
    schemeCode: 'disability_pension',
    amount: 1000,
    count: 5,
    beneficiaries: [
      { nameHi: 'श्री अमित', nameEn: 'Shri Amit', ward: 3, disability: '40%', status: 'active', sinceDate: '2023-02' },
      { nameHi: 'श्री रवि', nameEn: 'Shri Ravi', ward: 5, disability: '60%', status: 'active', sinceDate: '2022-07' },
      { nameHi: 'श्रीमती प्रियंका', nameEn: 'Smt. Priyanka', ward: 1, disability: '50%', status: 'active', sinceDate: '2023-09' },
    ],
  },
} as const

// ── Housing (PMAY-G + CM Awas) beneficiary lists ──
export const HOUSING_BENEFICIARIES = {
  pmayG: {
    titleHi: 'प्रधानमंत्री आवास योजना — ग्रामीण (PMAY-G)',
    titleEn: 'PM Awas Yojana — Gramin (PMAY-G)',
    amount: 125000,
    installments: 3,
    count: 23,
    beneficiaries: [
      { nameHi: 'श्री सुरेश चंद्र मिश्र', nameEn: 'Shri Suresh Chandra Mishra', ward: 4, status: 'completed', installment: 3, amountReceived: 125000 },
      { nameHi: 'श्री दुरेंद्र सिंह', nameEn: 'Shri Durendra Singh', ward: 6, status: 'in-progress', installment: 2, amountReceived: 85000 },
      { nameHi: 'श्री रमेश चंद्र मिश्र', nameEn: 'Shri Ramesh Chandra Mishra', ward: 4, status: 'completed', installment: 3, amountReceived: 125000 },
      { nameHi: 'श्री हेतराम मिश्र', nameEn: 'Shri Hetram Mishra', ward: 2, status: 'in-progress', installment: 1, amountReceived: 40000 },
      { nameHi: 'श्री छोटे मोकदम', nameEn: 'Shri Chhote Mokdam', ward: 3, status: 'pending', installment: 0, amountReceived: 0 },
      { nameHi: 'श्री मुन्नीलाल हरिजन', nameEn: 'Shri Munnilal Harizan', ward: 3, status: 'in-progress', installment: 2, amountReceived: 85000 },
      { nameHi: 'श्री हरिश्चंद्र हरिजन', nameEn: 'Shri Harishchandra Harizan', ward: 2, status: 'completed', installment: 3, amountReceived: 125000 },
    ],
  },
  cmAwas: {
    titleHi: 'मुख्यमंत्री आवास योजना',
    titleEn: 'CM Awas Yojana',
    amount: 70000,
    count: 11,
    beneficiaries: [
      { nameHi: 'श्री अजय कुमार', nameEn: 'Shri Ajay Kumar', ward: 5, status: 'completed', amountReceived: 70000 },
      { nameHi: 'श्री राजेंद्र मिश्र', nameEn: 'Shri Rajendra Mishra', ward: 6, status: 'in-progress', amountReceived: 40000 },
      { nameHi: 'श्री विश्वनाथ मिश्र', nameEn: 'Shri Vishwanath Mishra', ward: 4, status: 'pending', amountReceived: 0 },
    ],
  },
  newApplications: {
    titleHi: 'नई आवेदन — आवास के लिए सिनियर लाभार्थी',
    titleEn: 'New Applications — Housing Senior Beneficiaries',
    count: 6,
    applicants: [
      { nameHi: 'श्री रामप्रसाद', nameEn: 'Shri Ramprasad', ward: 1, appliedDate: '2024-06', status: 'under-review' },
      { nameHi: 'श्रीमती फूलमती', nameEn: 'Smt. Phoolmati', ward: 5, appliedDate: '2024-07', status: 'under-review' },
      { nameHi: 'श्री रवि', nameEn: 'Shri Ravi', ward: 5, appliedDate: '2024-08', status: 'documents-pending' },
    ],
  },
} as const

// ── Ration Card & Family Register ──
export const RATION_CARD_DATA = {
  titleHi: 'राशन कार्ड पत्र गृहस्थी सूची',
  titleEn: 'Ration Card — Family List',
  categories: [
    { type: 'AAY', labelHi: 'अंत्योदय (AAY)', count: 18, color: 'bg-red-100 text-red-700' },
    { type: 'BPL', labelHi: 'गरीबी रेखा से नीचे (BPL)', count: 42, color: 'bg-amber-100 text-amber-700' },
    { type: 'APL', labelHi: 'गरीबी रेखा से ऊपर (APL)', count: 127, color: 'bg-green-100 text-green-700' },
  ],
  totalFamilies: 187,
  totalMembers: 1247,
  fpsShop: 'अजय कुमार — सरकारी सस्ते गल्ले की दुकान',
  fpsPhone: '9721144741',
  newApplications: {
    titleHi: 'नई आवेदन — राशन कार्ड / गृहस्थी सूची / आधार सूची',
    titleEn: 'New Applications — Ration Card / Family List / Aadhaar List',
    count: 9,
    status: 'Processing at Tehsil Shankargarh',
  },
} as const

// ── Family Register (Parivar Register) + Shramik (Labor) Registration ──
export const VBGRAM_DATA = {
  familyRegister: {
    titleHi: 'परिवार रजिस्टर (VBGRAMG)',
    titleEn: 'Family Register (VBGRAMG)',
    totalFamilies: 187,
    totalMembers: 1247,
    updatedDate: '2024-08',
    status: 'Updated',
  },
  shramikList: {
    titleHi: 'श्रमिक सूची — नया पंजीकरण/आवेदन',
    titleEn: 'Labor List — New Registration/Application',
    count: 34,
    categories: [
      { type: 'mgnrega', labelHi: 'मनरेगा श्रमिक', count: 28 },
      { type: 'construction', labelHi: 'निर्माण श्रमिक', count: 4 },
      { type: 'other', labelHi: 'अन्य श्रमिक', count: 2 },
    ],
    newRegistration: true,
    registrationNote: 'नया श्रमिक पंजीकरण के लिए पंचायत कार्यालय में आवेदन करें',
  },
} as const

// ── Government Handpumps — real locations in Chandra village ──
export const HANDPUMPS = [
  { id: 'HP-01', locationHi: 'हेतराम मिश्र के घर के सामने', locationEn: 'In front of Hetram Mishra\'s house', type: 'जल स्तर नीचे (Low water table)', ward: 2, status: 'needs-deepening', lat: 25.187, lng: 81.612 },
  { id: 'HP-02', locationHi: 'हरिश्चंद्र पटेल के घर के सामने', locationEn: 'In front of Harishchandra Patel\'s house', type: 'जल स्तर नीचे (Low water table)', ward: 2, status: 'needs-deepening', lat: 25.1875, lng: 81.6125 },
  { id: 'HP-03', locationHi: 'हरिश्चंद्र हरिजन के घर के पास', locationEn: 'Near Harishchandra Harizan\'s house', type: 'हैंडपंप', ward: 3, status: 'working', lat: 25.188, lng: 81.613 },
  { id: 'HP-04', locationHi: 'छोटे मोकदम के घर के पास', locationEn: 'Near Chhote Mokdam\'s house', type: 'हैंडपंप', ward: 3, status: 'working', lat: 25.1885, lng: 81.6135 },
  { id: 'HP-05', locationHi: 'मुन्नीलाल हरिजन के घर के पास', locationEn: 'Near Munnilal Harizan\'s house', type: 'हैंडपंप', ward: 3, status: 'working', lat: 25.189, lng: 81.614 },
  { id: 'HP-06', locationHi: 'पंचायत भवन', locationEn: 'Panchayat Bhavan', type: 'हैंडपंप', ward: 1, status: 'working', lat: 25.1865, lng: 81.6115 },
  { id: 'HP-07', locationHi: 'प्राथमिक विद्यालय चंद्रा खास में', locationEn: 'Primary School Chandra Khas', type: 'हैंडपंप', ward: 1, status: 'working', lat: 25.186, lng: 81.611 },
  { id: 'HP-08', locationHi: 'विश्वनाथ मिश्र के घर के पास', locationEn: 'Near Vishwanath Mishra\'s house', type: 'हैंडपंप', ward: 4, status: 'working', lat: 25.1895, lng: 81.6145 },
  { id: 'HP-09', locationHi: 'राजेंद्र मिश्र के घर के पास', locationEn: 'Near Rajendra Mishra\'s house', type: 'हैंडपंप', ward: 6, status: 'working', lat: 25.19, lng: 81.615 },
  { id: 'HP-10', locationHi: 'काली माता मंदिर मार्ग में — रमेश चंद्र मिश्र के घर के पास', locationEn: 'Kali Mata Mandir road — near Ramesh Chandra Mishra\'s house', type: 'हैंडपंप', ward: 4, status: 'working', lat: 25.1882, lng: 81.6128 },
  { id: 'HP-11', locationHi: 'सुरेश चंद्र मिश्र के घर के पास', locationEn: 'Near Suresh Chandra Mishra\'s house', type: 'हैंडपंप', ward: 4, status: 'working', lat: 25.1888, lng: 81.6132 },
  { id: 'HP-12', locationHi: 'दुरेंद्र सिंह के घर के पास', locationEn: 'Near Durendra Singh\'s house', type: 'हैंडपंप', ward: 6, status: 'working', lat: 25.1892, lng: 81.6138 },
  { id: 'HP-13', locationHi: 'प्राथमिक विद्यालय चंद्रा लोनियां में', locationEn: 'Primary School Chandra Loniyan', type: 'हैंडपंप', ward: 7, status: 'working', lat: 25.1878, lng: 81.6122 },
] as const

// ── School Kitchen Team (MidDayMeal) ──
export const SCHOOL_KITCHEN_TEAM = {
  titleHi: 'प्राथमिक विद्यालय चंद्रा खास की रसोईया टीम',
  titleEn: 'Primary School Chandra Khas — Kitchen Team',
  photoUrl: '/whatsapp-optimized/school-kitchen-team.webp',
  schoolHi: 'प्राथमिक विद्यालय चंद्रा खास',
  schoolEn: 'Primary School Chandra Khas',
  members: [
    { nameHi: 'रसोईया टीम', roleHi: 'मध्याह्न भोजन तैयार करना', roleEn: 'Mid-day meal preparation' },
  ],
  noteHi: 'यह टीम प्रतिदिन छात्रों के लिए पौष्टिक मध्याह्न भोजन तैयार करती है।',
  noteEn: 'This team prepares nutritious mid-day meals for students daily.',
} as const
