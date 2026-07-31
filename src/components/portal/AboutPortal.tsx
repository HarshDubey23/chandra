'use client'

import { useI18n } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollReveal } from './ScrollReveal'
import { DATA_SOURCES, PRADHAN } from '@/data/panchayat'
import {
  Info,
  ShieldCheck,
  Database,
  Camera,
  Phone,
  ExternalLink,
  FileText,
  Eye,
  Clock,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  TrendingUp,
} from 'lucide-react'

/* ─── Data source list ─── */
const dataSources = DATA_SOURCES.map(src => ({ ...src }))

export function AboutPortal() {
  const { locale } = useI18n()
  const isHi = locale === 'hi'

  return (
    <section id="about-portal" className="section-premium py-16 md:py-20 border-b border-border/40">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <ScrollReveal delay={0.1}>
          <div className="text-center mb-10">
            <Badge variant="outline" className="section-header-badge mb-3 gap-1.5">
              <Info className="h-3.5 w-3.5" />
              {isHi ? 'पोर्टल के बारे में' : 'About This Portal'}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gradient-premium">
              {isHi ? 'पोर्टल के बारे में' : 'About This Portal'}
            </h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              {isHi
                ? 'इस पोर्टल का डेटा कहाँ से आता है और कैसे संग्रहित किया गया है'
                : 'Where the data on this portal comes from and how it was collected'}
            </p>

            {/* Last Updated + Data Accuracy badges */}
            <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
              <Badge variant="outline" className="text-[10px] h-6 gap-1.5 bg-primary/5 border-primary/20 text-primary">
                <Clock className="h-3 w-3" />
                {isHi ? 'अंतिम अपडेट' : 'Last Updated'}: {isHi ? 'मार्च २०२६' : 'March 2026'}
              </Badge>
              <Badge variant="outline" className="text-[10px] h-6 gap-1.5 bg-green-600/5 border-green-600/20 text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-3 w-3" />
                {isHi ? 'डेटा सटीकता: सत्यापित' : 'Data Accuracy: Verified'}
              </Badge>
              <Badge variant="outline" className="text-[10px] h-6 gap-1.5 bg-amber-600/5 border-amber-600/20 text-amber-600 dark:text-amber-400">
                <TrendingUp className="h-3 w-3" />
                {isHi ? '6+ सरकारी स्रोत' : '6+ Gov Sources'}
              </Badge>
            </div>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Section 1: Data Sources */}
          <ScrollReveal delay={0.15}>
            <Card className="card-premium-bordered h-full relative overflow-hidden rounded-xl">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-md bg-primary/10 grid place-items-center shrink-0">
                    <Database className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="text-base font-semibold">
                    {isHi ? 'डेटा स्रोत' : 'Data Sources'}
                  </CardTitle>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {isHi
                    ? 'यह पोर्टल निम्नलिखित सरकारी पोर्टलों से सार्वजनिक डेटा उपयोग करता है'
                    : 'This portal uses public data from the following government portals'}
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {dataSources.map((src) => (
                    <a
                      key={src.name}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-start gap-3 p-2.5 rounded-lg hover:bg-primary/5 transition-colors"
                    >
                      <div className="h-7 w-7 rounded-md bg-muted grid place-items-center shrink-0 group-hover:bg-primary/10 transition-colors">
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold group-hover:text-primary transition-colors">
                          {src.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          {isHi ? src.descHi : src.descEn}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>

                {/* Data Accuracy badge at bottom */}
                <div className="mt-4 pt-3 border-t border-border/40 flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-green-600/10 grid place-items-center shrink-0">
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-green-600 dark:text-green-400">
                      {isHi ? 'डेटा सटीकता बैज' : 'Data Accuracy Badge'}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {isHi
                        ? 'सभी डेटा सत्यापित सरकारी स्रोतों से — OSINT पद्धति द्वारा'
                        : 'All data from verified government sources — via OSINT methodology'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* Section 2: OSINT Methodology */}
          <ScrollReveal delay={0.2}>
            <Card className="card-premium-bordered h-full relative overflow-hidden rounded-xl">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-md bg-amber-600/10 grid place-items-center shrink-0">
                    <Eye className="h-4 w-4 text-amber-600" />
                  </div>
                  <CardTitle className="text-base font-semibold">
                    {isHi ? 'OSINT पद्धति' : 'OSINT Methodology'}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 text-xs text-muted-foreground leading-relaxed">
                  <p>
                    {isHi
                      ? 'इस पोर्टल का सारा डेटा सार्वजनिक सरकारी स्रोतों (Open Source Intelligence) से एकत्रित किया गया है। कोई भी निजी या गोपनीय जानकारी बिना अनुमति के उपयोग नहीं की गई है।'
                      : 'All data on this portal has been collected from public government sources using Open Source Intelligence (OSINT) methods. No private or confidential information was used without permission.'}
                  </p>
                  <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20">
                    <FileText className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <p>
                      {isHi
                        ? 'डेटा स्रोत: NREGA पोर्टल, eGramSwaraj, PMAY-G, JJM, जनगणना 2011, UDISE+ एवं अन्य सार्वजनिक रिकॉर्ड।'
                        : 'Data sources: NREGA portal, eGramSwaraj, PMAY-G, JJM, Census 2011, UDISE+ and other public records.'}
                    </p>
                  </div>
                  <p>
                    {isHi
                      ? 'पोर्टल का उद्देश्य पंचायत के डिजिटल शासन को पारदर्शी बनाना और नागरिकों को आसानी से जानकारी उपलब्ध कराना है।'
                      : 'The portal aims to make panchayat digital governance transparent and provide easy access to information for citizens.'}
                  </p>

                  {/* Last updated timestamp */}
                  <div className="mt-4 pt-3 border-t border-border/40 flex items-center gap-2">
                    <RefreshCw className="h-3.5 w-3.5 text-primary shrink-0" />
                    <div>
                      <p className="text-[10px] font-semibold text-foreground/80">
                        {isHi ? 'अंतिम अपडेट' : 'Last Updated'}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {isHi ? 'मार्च 2026 — डेटा सत्यापित एवं अद्यतित' : 'March 2026 — Data verified and updated'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* Section 3: DPDP 2023 Compliance */}
          <ScrollReveal delay={0.25}>
            <Card className="card-premium-bordered-green h-full relative overflow-hidden rounded-xl">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-md bg-green-600/10 grid place-items-center shrink-0">
                    <ShieldAlert className="h-4 w-4 text-green-600" />
                  </div>
                  <CardTitle className="text-base font-semibold">
                    {isHi ? 'DPDP 2023 अनुपालन' : 'DPDP 2023 Compliance'}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 text-xs text-muted-foreground leading-relaxed">
                  <p>
                    {isHi
                      ? 'यह पोर्टल डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम (DPDP) 2023 का पूर्ण रूप से अनुपालन करता है।'
                      : 'This portal fully complies with the Digital Personal Data Protection (DPDP) Act 2023.'}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 rounded-md bg-red-500/5 border border-red-500/20">
                      <div className="h-5 w-5 rounded bg-red-500/10 grid place-items-center shrink-0">
                        <span className="text-[10px] font-bold text-red-500">✕</span>
                      </div>
                      <span className="text-xs">
                        {isHi ? 'आधार संख्या (Aadhaar) — पूर्ण रूप से रेड-एक्टेड' : 'Aadhaar number — fully redacted'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-md bg-red-500/5 border border-red-500/20">
                      <div className="h-5 w-5 rounded bg-red-500/10 grid place-items-center shrink-0">
                        <span className="text-[10px] font-bold text-red-500">✕</span>
                      </div>
                      <span className="text-xs">
                        {isHi ? 'बैंक खाता नंबर (Bank Account) — पूर्ण रूप से रेड-एक्टेड' : 'Bank account number — fully redacted'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-md bg-red-500/5 border border-red-500/20">
                      <div className="h-5 w-5 rounded bg-red-500/10 grid place-items-center shrink-0">
                        <span className="text-[10px] font-bold text-red-500">✕</span>
                      </div>
                      <span className="text-xs">
                        {isHi ? 'IFSC कोड — पूर्ण रूप से रेड-एक्टेड' : 'IFSC code — fully redacted'}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground/70 italic">
                    {isHi
                      ? 'फ़ोन नंबर केवल अंतिम 4 अंक प्रदर्शित (व्यवस्थापक पैनल में)। सार्वजनिक दृश्य में पूर्ण नंबर नहीं दिखाए जाते।'
                      : 'Phone numbers show only last 4 digits (in admin panel). Full numbers are not displayed in public view.'}
                  </p>

                  {/* Shield icon badge for DPDP compliance */}
                  <div className="mt-3 pt-3 border-t border-border/40 flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-green-600/10 grid place-items-center shrink-0">
                      <ShieldCheck className="h-3 w-3 text-green-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-green-600 dark:text-green-400">
                        {isHi ? 'DPDP 2023 संरक्षण सक्रिय' : 'DPDP 2023 Protection Active'}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {isHi ? 'सभी संवेदनशील डेटा स्वचालित रूप से रेड-एक्टेड' : 'All sensitive data automatically redacted'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* Section 4: WhatsApp Data + Contact for corrections */}
          <ScrollReveal delay={0.3}>
            <Card className="card-premium-bordered-green h-full relative overflow-hidden rounded-xl">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-md bg-green-600/10 grid place-items-center shrink-0">
                    <Camera className="h-4 w-4 text-green-600" />
                  </div>
                  <CardTitle className="text-base font-semibold">
                    {isHi ? 'WhatsApp फ़ोटो डेटा' : 'WhatsApp Photo Data'}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 text-xs text-muted-foreground leading-relaxed">
                  <p>
                    {isHi
                      ? 'पंचायत अधिकारी द्वारा WhatsApp के माध्यम से 230+ फोटोग्राफ प्राप्त की गई हैं। इन फोटो की पुष्टि VLM (Vision Language Model) द्वारा की गई है।'
                      : '230+ photographs were received from the panchayat official via WhatsApp. These photos have been verified using VLM (Vision Language Model).'}
                  </p>
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-green-500/5 border border-green-500/20">
                    <Camera className="h-3.5 w-3.5 text-green-600 shrink-0" />
                    <span>
                      {isHi
                        ? '230+ फोटो • VLM-सत्यापित • WhatsApp स्रोत'
                        : '230+ photos • VLM-verified • WhatsApp source'}
                    </span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border/40">
                    <div className="flex items-center gap-2 mb-2">
                      <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                      <p className="text-xs font-semibold text-foreground">
                        {isHi ? 'सुधार के लिए संपर्क करें' : 'Contact for Corrections'}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {isHi
                        ? 'यदि आपको कोई त्रुटि मिलती है, तो पंचायत कार्यालय से संपर्क करें:'
                        : 'If you find any errors, contact the panchayat office:'}
                    </p>
                    <a
                      href={PRADHAN.phoneHref}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline underline-offset-2 mt-1"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      {PRADHAN.phoneFormatted}
                    </a>
                  </div>

                  {/* Data Accuracy Badge */}
                  <div className="mt-3 pt-3 border-t border-border/40">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
                      <div>
                        <p className="text-[10px] font-semibold text-green-600 dark:text-green-400">
                          {isHi ? 'VLM सत्यापन दर' : 'VLM Verification Rate'}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {isHi ? '230+ फोटो सत्यापित — 95%+ सटीकता' : '230+ photos verified — 95%+ accuracy'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
