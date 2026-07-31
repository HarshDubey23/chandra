'use client'
import { useI18n } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { Scale, FileText, Landmark, Eye, Gavel, Info, ExternalLink, Clock, IndianRupee, User, Building2, ListChecks } from 'lucide-react'
import { ScrollReveal } from './ScrollReveal'

export function RTISection() {
  const { locale } = useI18n()
  const isHi = locale === 'hi'

  const section4bDisclosures = [
    {
      id: 'org-chart',
      titleHi: 'संगठन चार्ट, कार्य एवं कर्तव्य',
      titleEn: 'Organization chart, functions and duties',
      descHi: 'ग्राम पंचायत चंद्रा का संगठनात्मक ढांचा, प्रधान, सदस्य, ग्राम पंचायत अधिकारी, लेखपाल की कार्यविधि एवं कर्तव्य।',
      descEn: 'Organizational structure of GP Chandra — Pradhan, members, Gram Panchayat Adhikari, Lekhpal — their functions and duties.',
    },
    {
      id: 'decision-process',
      titleHi: 'निर्णय लेने की प्रक्रिया',
      titleEn: 'Decision-making process',
      descHi: 'ग्राम सभा में पंचायत निर्णय लेती है। विकास योजनाएँ, बजट, लाभार्थी चयन — सभी ग्राम सभा अनुमोदन से।',
      descEn: 'Panchayat decisions are made in the Gram Sabha. Development plans, budgets, beneficiary selection — all require Gram Sabha approval.',
    },
    {
      id: 'budget',
      titleHi: 'बजट आवंटन एवं व्यय',
      titleEn: 'Budget allocations & expenditures',
      descHi: '14वें/15वें वित्त आयोग अनुदान, मनरेगा, PMAY-G, SBM, अन्य योजनाओं के बजट आवंटन एवं व्यय विवरण।',
      descEn: '14th/15th Finance Commission grants, MGNREGA, PMAY-G, SBM, and other scheme budget allocations and expenditure details.',
    },
    {
      id: 'subsidy',
      titleHi: 'सहायता योजनाएँ एवं लाभार्थी सूची',
      titleEn: 'Subsidy programs & beneficiary lists',
      descHi: 'सरकारी सहायता योजनाएँ — PMAY-G, SBM, JJM, ICDS, पुराना पेंशन, विकलांग पेंशन — एवं लाभार्थी विवरण।',
      descEn: 'Government subsidy programs — PMAY-G, SBM, JJM, ICDS, Old Age Pension, Disability Pension — and beneficiary details.',
    },
    {
      id: 'cpio',
      titleHi: 'CPIO विवरण एवं अपीलीय प्राधिकरण',
      titleEn: 'CPIO details & appellate authority',
      descHi: 'ग्राम पंचायत के CPIO (श्री बलवंत चौहान, GPA) एवं प्रथम अपीलीय प्राधिकरण (खंड विकास अधिकारी, शंकरगढ़) का विवरण।',
      descEn: 'Details of GP CPIO (Shri Balwant Chauhan, GPA) and First Appellate Authority (Block Development Officer, Shankargarh).',
    },
    {
      id: 'remuneration',
      titleHi: 'अधिकारियों का मासिक पारिश्रमिक',
      titleEn: 'Monthly remuneration of officers',
      descHi: 'प्रधान, ग्राम पंचायत अधिकारी, लेखपाल — मासिक पारिश्रमिक/वेतन विवरण (वित्त आयोग अनुदान से)।',
      descEn: 'Pradhan, Gram Panchayat Adhikari, Lekhpal — monthly remuneration/salary details (from Finance Commission grants).',
    },
    {
      id: 'ppp',
      titleHi: 'सार्वजनिक-निजी सहभागिता',
      titleEn: 'Public-private partnerships',
      descHi: 'ग्राम पंचायत चंद्रा के सार्वजनिक-निजी सहभागिता प्रोजेक्ट — वर्तमान में कोई PPP प्रोजेक्ट सक्रिय नहीं।',
      descEn: 'Public-private partnership projects of GP Chandra — currently no active PPP projects.',
    },
  ]

  return (
    <section id="rti" className="section-premium-accent py-16 md:py-20 border-b border-border/40">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10">
          <Badge variant="outline" className="section-header-badge mb-3 gap-1.5">
            <Scale className="h-3.5 w-3.5" />
            {isHi ? 'सूचना का अधिकार' : 'Right to Information (RTI)'}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gradient-premium">
            {isHi ? 'RTI अधिनियम 2005 — आपका अधिकार' : 'RTI Act 2005 — Your Right'}
          </h2>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
              {isHi ? 'भारत सरकार' : 'GOI'}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            {isHi
              ? 'सूचना का अधिकार अधिनियम 2005 भारत सरकार का एक महत्वपूर्ण कानून है, जो हर नागरिक को सरकारी सूचना मांगने का अधिकार देता है। ग्राम पंचायत चंद्रा पारदर्शिता एवं जवाबदेही के प्रति समर्पित है।'
              : 'The Right to Information Act 2005 is a landmark law by the Government of India that empowers every citizen to request government information. GP Chandra is committed to transparency and accountability.'}
          </p>
        </div>

        <ScrollReveal delay={0.1}>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {/* Card 1: How to file RTI */}
            <Card className="card-premium hover-lift">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm font-semibold leading-tight">
                    {isHi ? 'RTI कैसे दाखिल करें' : 'How to File RTI'}
                  </CardTitle>
                  <div className="h-8 w-8 rounded-lg grid place-items-center shrink-0 bg-primary/10 text-primary">
                    <ListChecks className="h-4 w-4" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <ol className="text-xs text-foreground/70 space-y-1.5">
                  <li className="flex items-start gap-1.5">
                    <span className="h-5 w-5 rounded-full grid place-items-center shrink-0 bg-primary/10 text-primary text-[10px] font-bold">1</span>
                    <span>{isHi ? 'PIO को लिखित अनुरोध (हिंदी/अंग्रेजी) भेजें' : 'Written request to PIO (Hindi/English)'}</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="h-5 w-5 rounded-full grid place-items-center shrink-0 bg-primary/10 text-primary text-[10px] font-bold">2</span>
                    <span>{isHi ? '₹10 आवेशन शुल्क जमा करें (BPL मुक्त)' : 'Pay ₹10 application fee (BPL exempt)'}</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="h-5 w-5 rounded-full grid place-items-center shrink-0 bg-primary/10 text-primary text-[10px] font-bold">3</span>
                    <span>{isHi ? '30 दिन में उत्तर प्राप्त करें' : 'Receive response within 30 days'}</span>
                  </li>
                </ol>
              </CardContent>
            </Card>

            {/* Card 2: PIO */}
            <Card className="card-premium-bordered hover-lift">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm font-semibold leading-tight">
                    {isHi ? 'लोक सूचना अधिकारी (PIO)' : 'Public Information Officer (PIO)'}
                  </CardTitle>
                  <div className="h-8 w-8 rounded-lg grid place-items-center shrink-0 bg-accent/20 text-accent-foreground">
                    <User className="h-4 w-4" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-xs text-foreground/70 space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">{isHi ? 'नाम:' : 'Name:'}</span>
                    <span className="font-medium">श्री बलवंत चौहान</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">{isHi ? 'पद:' : 'Designation:'}</span>
                    <span>{isHi ? 'ग्राम पंचायत अधिकारी (GPA)' : 'Gram Panchayat Adhikari (GPA)'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">{isHi ? 'कार्यालय:' : 'Office:'}</span>
                    <span>{isHi ? 'पंचायत भवन, चंद्रा' : 'Panchayat Bhawan, Chandra'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span>{isHi ? '10:00 AM – 5:00 PM (कार्यदिवस)' : '10:00 AM – 5:00 PM (working days)'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card 3: First Appellate Authority */}
            <Card className="card-premium hover-lift">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm font-semibold leading-tight">
                    {isHi ? 'प्रथम अपीलीय प्राधिकरण' : 'First Appellate Authority'}
                  </CardTitle>
                  <div className="h-8 w-8 rounded-lg grid place-items-center shrink-0 bg-primary/10 text-primary">
                    <Gavel className="h-4 w-4" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-xs text-foreground/70 space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">{isHi ? 'पद:' : 'Designation:'}</span>
                    <span className="font-medium">{isHi ? 'खंड विकास अधिकारी (BDO)' : 'Block Development Officer (BDO)'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Building2 className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span>{isHi ? 'शंकरगढ़ खंड, प्रयाजराज' : 'Shankargarh Block, Prayagraj'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span>{isHi ? '30 दिन में अपील दाखिल करें' : 'File appeal within 30 days'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card 4: Fee & Timeline */}
            <Card className="card-premium-bordered-green hover-lift">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm font-semibold leading-tight">
                    {isHi ? 'शुल्क एवं समयसीमा' : 'Fee & Timeline'}
                  </CardTitle>
                  <div className="h-8 w-8 rounded-lg grid place-items-center shrink-0 bg-accent/20 text-accent-foreground">
                    <IndianRupee className="h-4 w-4" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-xs text-foreground/70 space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <IndianRupee className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span>{isHi ? 'आवेशन शुल्क: ₹10' : 'Application fee: ₹10'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[10px] h-5">
                      {isHi ? 'BPL मुक्त' : 'BPL Exempt'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span>{isHi ? 'उत्तर: 30 दिन' : 'Response: 30 days'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span>{isHi ? 'तृतीय पक्ष: 45 दिन' : 'Third party: 45 days'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Section 4(1)(b) Transparency Disclosures */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="h-4 w-4 text-primary" />
              <h3 className="text-lg font-semibold">
                {isHi ? 'अनिवार्य पारदर्शिता प्रकटीकरण — धारा 4(1)(b)' : 'Mandatory Transparency Disclosures — Section 4(1)(b)'}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4 max-w-2xl">
              {isHi
                ? 'RTI अधिनियम 2005 की धारा 4(1)(b) के अंतर्गत ग्राम पंचायत को निम्नलिखित सूचना स्व:प्रकटित करना अनिवार्य है:'
                : 'Under Section 4(1)(b) of the RTI Act 2005, the Gram Panchayat is mandated to proactively disclose the following information:'}
            </p>

            <Card className="card-premium">
              <CardContent className="p-0">
                <Accordion type="single" collapsible className="w-full px-4">
                  {section4bDisclosures.map((item) => (
                    <AccordionItem key={item.id} value={item.id}>
                      <AccordionTrigger className="text-sm hover:no-underline">
                        {isHi ? item.titleHi : item.titleEn}
                      </AccordionTrigger>
                      <AccordionContent className="text-xs text-foreground/70">
                        {isHi ? item.descHi : item.descEn}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>

          {/* File RTI Online Button */}
          <div className="flex justify-center mt-8">
            <Button
              asChild
              size="lg"
              className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <a href="https://rti.gov.in" target="_blank" rel="noopener noreferrer">
                <FileText className="h-4 w-4" />
                {isHi ? 'RTI ऑनलाइन दाखिल करें' : 'File RTI Online'}
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
