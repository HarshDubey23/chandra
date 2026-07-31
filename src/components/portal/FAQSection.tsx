'use client'
import { useI18n } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import {
  HelpCircle,
  FileQuestion,
  MessageSquareQuote,
  Phone,
  Mail,
  Clock,
  MapPin,
  Users,
} from 'lucide-react'
import { ScrollReveal } from './ScrollReveal'

interface FAQItem {
  id: string
  qHi: string
  qEn: string
  aHi: string
  aEn: string
}

interface FAQCategory {
  id: string
  nameHi: string
  nameEn: string
  icon: typeof HelpCircle
  accent: string
  items: FAQItem[]
}

const categories: FAQCategory[] = [
  {
    id: 'complaints',
    nameHi: 'शिकायत एवं ट्रैकिंग',
    nameEn: 'Complaints',
    icon: MessageSquareQuote,
    accent: 'text-primary',
    items: [
      {
        id: 'faq-1',
        qHi: 'मैं अपनी शिकायत कैसे दर्ज करूँ?',
        qEn: 'How do I file a complaint?',
        aHi: 'आप तीन तरीकों से शिकायत दर्ज कर सकते हैं — AI वॉइस लाइन +91 96510 35021 पर कॉल करके, पंचायत कार्यालय में व्यक्तिगत रूप से आकर, या प्रधान जी से मिलकर। दर्ज होने के बाद आपको एक ट्रैकिंग आईडी मिलेगी।',
        aEn:
          'You can file a complaint in three ways — by calling AI voice line +91 96510 35021, visiting the panchayat office in person, or meeting the Pradhan. After filing, you will receive a tracking ID.',
      },
      {
        id: 'faq-2',
        qHi: 'ट्रैकिंग आईडी कितने समय में मिलती है?',
        qEn: 'How long does it take to get a tracking ID?',
        aHi: 'AI वॉइस लाइन से दर्ज करने पर ट्रैकिंग आईडी तुरंत SMS द्वारा भेज दी जाती है। कार्यालय में दर्ज कराने पर रसीद पर लिखित रूप में मिलती है।',
        aEn:
          'For AI voice line filings, the tracking ID is sent immediately via SMS. For office filings, it is provided in writing on the receipt.',
      },
      {
        id: 'faq-3',
        qHi: 'शिकायत का समाधान कितने दिनों में होता है?',
        qEn: 'In how many days is a complaint resolved?',
        aHi: 'सामान्य शिकायतों का समाधान 7 कार्य दिवसों में किया जाता है। जल और बिजली संबंधी शिकायतों के लिए 48 घंटे का लक्ष्य रहता है। जटिल मामलों में 30 दिन लग सकते हैं।',
        aEn:
          'General complaints are resolved within 7 working days. Water and electricity complaints target 48 hours. Complex cases may take 30 days.',
      },
      {
        id: 'faq-4',
        qHi: 'क्या मैं गुमनाम रहकर शिकायत कर सकता हूँ?',
        qEn: 'Can I file a complaint anonymously?',
        aHi: 'हाँ, आप गुमनाम शिकायत दर्ज कर सकते हैं, परन्तु ट्रैकिंग आईडी प्राप्त करने के लिए कॉलबैक नंबर या ईमेल देना आवश्यक है।',
        aEn:
          'Yes, you can file an anonymous complaint, but providing a callback number or email is required to receive a tracking ID.',
      },
      {
        id: 'faq-5',
        qHi: 'यदि समाधान से संतुष्ट न हूँ तो क्या करूँ?',
        qEn: "What if I'm not satisfied with the resolution?",
        aHi: 'आप उच्चतर अधिकारी — ब्लॉक विकास अधिकारी (BDO) शंकरगढ़ को अपील कर सकते हैं। उनका संपर्क: bdo-shankargarh@up.gov.in',
        aEn:
          'You can appeal to the higher authority — Block Development Officer (BDO) Shankargarh. Contact: bdo-shankargarh@up.gov.in',
      },
    ],
  },
  {
    id: 'schemes',
    nameHi: 'योजनाएँ',
    nameEn: 'Schemes',
    icon: HelpCircle,
    accent: 'text-foreground',
    items: [
      {
        id: 'faq-6',
        qHi: 'मनरेगा जॉब कार्ड के लिए कैसे आवेदन करें?',
        qEn: 'How to apply for MGNREGA job card?',
        aHi: 'आधार कार्ड, बैंक पासबुक और पासपोर्ट फोटो के साथ ग्राम पंचायत कार्यालय में आवेदन करें। 30 दिनों के भीतर जॉब कार्ड जारी किया जाता है।',
        aEn:
          'Apply at the Gram Panchayat office with Aadhaar, bank passbook, and passport photo. Job card is issued within 30 days.',
      },
      {
        id: 'faq-7',
        qHi: 'पीएमएवाई-जी (आवास) योजना के लिए पात्रता क्या है?',
        qEn: 'What is the eligibility for PMAY-G (housing)?',
        aHi: 'परिवार की वार्षिक आय ₹1,17,000 से कम, पक्का मकान न होना, और परिवार में कोई सरकारी कर्मचारी न होना आवश्यक है। SECC 2011 डेटा के आधार पर चयन होता है।',
        aEn:
          'Annual family income less than ₹1,17,000, no pucca house, and no government employee in family. Selection is based on SECC 2011 data.',
      },
      {
        id: 'faq-8',
        qHi: 'जल जीवन मिशन के तहत नल कनेक्शन कैसे मिलेगा?',
        qEn: 'How to get tap connection under Jal Jeevan Mission?',
        aHi: 'ग्राम पंचायत में आवेदन फॉर्म भरें। ₹500 की राशि 12 महीनों में किस्तों में देय है। BPL परिवारों के लिए निःशुल्क।',
        aEn:
          'Fill the application form at the Gram Panchayat. ₹500 payable in installments over 12 months. Free for BPL families.',
      },
      {
        id: 'faq-9',
        qHi: 'आंगनवाड़ी में अपने बच्चे का नामांकन कैसे कराएँ?',
        qEn: 'How to enroll my child in Anganwadi?',
        aHi: '6 महीने से 6 वर्ष तक के बच्चों के लिए आंगनवाड़ी केंद्र खुला है। जन्म प्रमाणपत्र और आधार के साथ निकटतम केंद्र में संपर्क करें।',
        aEn:
          'Open for children aged 6 months to 6 years. Visit nearest center with birth certificate and Aadhaar.',
      },
    ],
  },
  {
    id: 'documents',
    nameHi: 'दस्तावेज़',
    nameEn: 'Documents',
    icon: FileQuestion,
    accent: 'text-foreground',
    items: [
      {
        id: 'faq-10',
        qHi: 'आय प्रमाणपत्र कैसे प्राप्त करें?',
        qEn: 'How to get income certificate?',
        aHi: 'तहसील कार्यालय शंकरगढ़ में आवेदन करें या ऑनलाइन eDistrict UP पोर्टल पर आवेदन करें। आवश्यक दस्तावेज़: आधार, राशन कार्ड, बैंक पासबुक।',
        aEn:
          'Apply at Tehsil office Shankargarh or online at eDistrict UP portal. Required: Aadhaar, ration card, bank passbook.',
      },
      {
        id: 'faq-11',
        qHi: 'जाति प्रमाणपत्र कितने दिनों में मिलता है?',
        qEn: 'In how many days is caste certificate issued?',
        aHi: 'ऑनलाइन आवेदन के 15 कार्य दिवसों के भीतर जाति प्रमाणपत्र डाउनलोड होने योग्य हो जाता है। शुल्क निःशुल्क है।',
        aEn:
          'Within 15 working days of online application, caste certificate becomes downloadable. No fee.',
      },
      {
        id: 'faq-12',
        qHi: 'निवास प्रमाणपत्र की वैधता कितनी होती है?',
        qEn: 'What is the validity of residence certificate?',
        aHi: 'निवास प्रमाणपत्र आजीवन वैध होता है, परन्तु शैक्षिक सुविधा के लिए 3 वर्ष की वैधता मानी जाती है।',
        aEn:
          'Residence certificate is valid for lifetime, but for educational benefits 3-year validity is considered.',
      },
      {
        id: 'faq-13',
        qHi: 'भूमि के रिकॉर्ड (खतियान) कहाँ देखें?',
        qEn: 'Where to view land records (khatian)?',
        aHi: 'upbhulekh.gov.in पर ऑनलाइन देखें या लेखपाल से संपर्क करें। खतियान की प्रति ₹50 में उपलब्ध है।',
        aEn: 'View online at upbhulekh.gov.in or contact Lekhpal. Khatian copy available for ₹50.',
      },
    ],
  },
  {
    id: 'general',
    nameHi: 'सामान्य',
    nameEn: 'General',
    icon: HelpCircle,
    accent: 'text-foreground',
    items: [
      {
        id: 'faq-14',
        qHi: 'ग्राम सभा की बैठक कब होती है?',
        qEn: 'When is Gram Sabha meeting held?',
        aHi: 'वर्ष में चार बार — अगस्त, नवंबर, फरवरी, और मई में। तिथि की घोषणा 7 दिन पहले की जाती है।',
        aEn:
          'Four times a year — August, November, February, and May. Date announced 7 days in advance.',
      },
      {
        id: 'faq-15',
        qHi: 'पंचायत कार्यालय के कार्यकाल क्या हैं?',
        qEn: 'What are the panchayat office hours?',
        aHi: 'सोमवार से शुक्रवार, सुबह 10:00 बजे से दोपहर 5:00 बजे तक। शनिवार 10:00 से 2:00 बजे तक। रविवार और सरकारी अवकाश बंद।',
        aEn:
          'Monday to Friday, 10:00 AM to 5:00 PM. Saturday 10:00 AM to 2:00 PM. Sunday and public holidays closed.',
      },
      {
        id: 'faq-16',
        qHi: 'वॉटर टैक्स / हाउस टैक्स कैसे जमा करें?',
        qEn: 'How to pay water tax / house tax?',
        aHi: 'पंचायत कार्यालय में नकद या चेक द्वारा जमा करें। ऑनलाइन भुगतान अभी उपलब्ध नहीं है। रसीद अवश्य प्राप्त करें।',
        aEn:
          'Pay in cash or check at the panchayat office. Online payment not yet available. Receipt must be obtained.',
      },
      {
        id: 'faq-17',
        qHi: 'मैं पंचायत के बजट की जानकारी कैसे प्राप्त करूँ?',
        qEn: 'How do I get panchayat budget information?',
        aHi: 'बजट इस पोर्टल के RTI अनुभाग में Section 4(1)(b) के तहत उपलब्ध है। अधिक विवरण के लिए पंचायत कार्यालय में आवेदन करें।',
        aEn:
          'Budget is available on this portal under RTI section Section 4(1)(b). For more details, apply at the panchayat office.',
      },
    ],
  },
]

export function FAQSection() {
  const { locale } = useI18n()
  const isHi = locale === 'hi'

  const totalCount = categories.reduce((acc, c) => acc + c.items.length, 0)

  return (
    <section id="faq" className="section-premium py-16 md:py-20 border-b border-border/40">
      <div className="container mx-auto px-4">
        <ScrollReveal delay={0.1}>
          {/* Header */}
          <div className="text-center mb-10">
            <Badge variant="outline" className="section-header-badge mb-3 gap-1.5">
              <HelpCircle className="h-3.5 w-3.5" />
              {isHi ? 'सामान्य प्रश्न / FAQ' : 'सामान्य प्रश्न / FAQ'}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gradient-premium">
              {isHi
                ? 'नागरिक सहायता — सामान्य प्रश्न'
                : 'Citizen Help — Frequently Asked Questions'}
            </h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              {isHi
                ? 'पंचायत से जुड़े सामान्य प्रश्नों के उत्तर यहाँ दिए गए हैं। / Answers to common questions about the panchayat are given below.'
                : 'पंचायत से जुड़े सामान्य प्रश्नों के उत्तर यहाँ दिए गए हैं। / Answers to common questions about the panchayat are given below.'}
            </p>
          </div>

          {/* Two-column layout */}
          <div className="grid lg:grid-cols-[260px_1fr] gap-6 lg:gap-8">
            {/* Left: Category navigation */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <Card className="card-premium">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-primary" />
                    {isHi ? 'श्रेणियाँ / Categories' : 'श्रेणियाँ / Categories'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-1">
                    {categories.map((cat) => {
                      const Icon = cat.icon
                      return (
                        <li key={cat.id}>
                          <a
                            href={`#${cat.id}`}
                            className="flex items-center justify-between gap-2 rounded-md px-3 py-2 text-xs hover:bg-primary/5 transition-colors group"
                          >
                            <span className="flex items-center gap-2 min-w-0">
                              <Icon className="h-3.5 w-3.5 shrink-0 text-primary" />
                              <span className="truncate group-hover:text-primary transition-colors">
                                {isHi ? cat.nameHi : cat.nameEn}
                              </span>
                            </span>
                            <Badge
                              variant="secondary"
                              className="h-5 text-[10px] shrink-0 bg-primary/10 text-primary"
                            >
                              {cat.items.length}
                            </Badge>
                          </a>
                        </li>
                      )
                    })}
                  </ul>
                  <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {isHi ? 'कुल प्रश्न' : 'Total questions'}
                    </span>
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                      {totalCount}
                    </Badge>
                  </div>

                  {/* Quick contact block */}
                  <div className="mt-4 pt-3 border-t border-border/60 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-foreground/70">
                      <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>+91 96510 35021</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-foreground/70">
                      <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>{isHi ? 'सोम–शुक्र 10–5, शनि 10–2' : 'Mon–Fri 10–5, Sat 10–2'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-foreground/70">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>{isHi ? 'पंचायत भवन, चंद्रा' : 'Panchayat Bhawan, Chandra'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-foreground/70">
                      <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="truncate">bdo-shankargarh@up.gov.in</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </aside>

            {/* Right: Accordion grouped by category */}
            <div className="space-y-6">
              {categories.map((cat) => {
                const Icon = cat.icon
                return (
                  <div key={cat.id} id={cat.id} className="scroll-mt-24">
                    {/* Category sub-heading */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-8 w-8 rounded-lg grid place-items-center shrink-0 bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <h3 className="text-base md:text-lg font-semibold leading-tight">
                        {isHi ? cat.nameHi : cat.nameEn}{' '}
                        <span className="text-muted-foreground text-sm font-normal">
                          / {isHi ? cat.nameEn : cat.nameHi}
                        </span>
                      </h3>
                      <Badge
                        variant="outline"
                        className="ml-auto bg-primary/5 text-primary border-primary/20 text-xs"
                      >
                        {cat.items.length} {isHi ? 'प्रश्न' : 'questions'}
                      </Badge>
                    </div>

                    {/* Accordion card */}
                    <Card className="card-premium">
                      <CardContent className="p-0">
                        <Accordion type="single" collapsible className="w-full px-4">
                          {cat.items.map((item) => (
                            <AccordionItem key={item.id} value={item.id} className="border-border/60">
                              <AccordionTrigger className="text-sm hover:no-underline">
                                <span className="flex flex-col items-start gap-0.5 text-left">
                                  <span className="font-medium">
                                    {isHi ? item.qHi : item.qEn}
                                  </span>
                                  <span className="text-xs text-muted-foreground font-normal">
                                    {isHi ? item.qEn : item.qHi}
                                  </span>
                                </span>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-2 text-xs">
                                  <p className="text-foreground/80 leading-relaxed">
                                    {isHi ? item.aHi : item.aEn}
                                  </p>
                                  <div className="pt-2 border-t border-border/40">
                                    <p className="text-muted-foreground leading-relaxed italic">
                                      {isHi ? item.aEn : item.aHi}
                                    </p>
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </CardContent>
                    </Card>
                  </div>
                )
              })}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
