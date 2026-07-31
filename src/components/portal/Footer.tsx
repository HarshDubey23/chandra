'use client'
import { useI18n } from '@/lib/i18n'
import { useUI } from '@/lib/ui-store'
import {
  ShieldCheck, Lock, MapPin, Phone, Mic, Mail, ExternalLink,
  FileText, Database, Heart, Sun, MessageCircle, Globe, Clock,
  Users, Building2, AlertTriangle, Siren, ChevronRight,
  ChevronUp, ArrowUpRight, PhoneCall,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { startVapiCall } from '@/lib/vapi'
import { PRADHAN, GPA, OFFICE_ADDRESS, PANCHAYAT, IMPORTANT_NUMBERS } from '@/data/panchayat'

export function Footer() {
  const { locale } = useI18n()
  const { setView } = useUI()

  const quickLinks = [
    { labelHi: 'हमारे बारे में', labelEn: 'About', icon: Globe, action: () => setView('home') },
    { labelHi: 'सरकारी योजनाएं', labelEn: 'Schemes', icon: FileText, action: () => setView('home') },
    { labelHi: 'वार्ड मानचित्र', labelEn: 'Wards', icon: Users, action: () => setView('home') },
    { labelHi: 'शिकायत दर्ज करें', labelEn: 'Complaints', icon: AlertTriangle, action: () => setView('complaints') },
    { labelHi: 'संपर्क करें', labelEn: 'Contact', icon: Phone, action: () => setView('home') },
  ]

  const importantNumbers = IMPORTANT_NUMBERS.map(n => ({
    ...n,
    icon: n.phone === '9651035021' ? Building2 : n.phone === '9839312578' ? Building2 : n.phone === '9454402820' ? Siren : n.phone === '8528667723' ? Heart : AlertTriangle,
    color: n.color === 'primary' ? 'text-primary' : n.color === 'green' ? 'text-green-600 dark:text-green-400' : n.color === 'red' ? 'text-red-600 dark:text-red-400' : n.color === 'pink' ? 'text-pink-500' : 'text-amber-600 dark:text-amber-400',
  }))

  const govLinks = [
    { label: 'eGramSwaraj', href: 'https://egramswaraj.gov.in/' },
    { label: 'NREGA Portal', href: 'https://mnregaweb2.dord.gov.in/' },
    { label: 'PMAY-G', href: 'https://pmayg.nic.in/' },
    { label: 'Jal Jeevan Mission', href: 'https://jaljeevanmission.gov.in/' },
  ]

  return (
    <footer className="mt-auto relative overflow-hidden">
      {/* ─── Tricolor gradient top border ─── */}
      <div
        className="tricolor-bar h-1.5 w-full"
        style={{ backgroundSize: '200% 100%', animation: 'tricolor-shift 8s ease-in-out infinite' }}
      />

      {/* ─── Quick Dial Row ─── */}
      <div className="bg-gradient-to-r from-[oklch(0.58_0.20_55/0.04)] via-[oklch(0.50_0.14_150/0.04)] to-[oklch(0.58_0.20_55/0.04)] border-b border-border/40">
        <div className="container mx-auto px-4 py-3.5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-primary/10 grid place-items-center">
                <PhoneCall className="h-4 w-4 text-primary" />
              </div>
              <div>
                <span className="text-xs font-semibold text-foreground/90 block leading-tight">
                  {locale === 'hi' ? 'त्वरित डायल' : 'Quick Dial'}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {locale === 'hi' ? 'एक क्लिक में संपर्क करें' : 'One-tap emergency contacts'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {IMPORTANT_NUMBERS.map((n) => {
                const badgeColorClasses: Record<string, string> = {
                  primary: 'bg-primary/5 text-primary border-primary/20 hover:bg-primary/15 hover:border-primary/40 group-hover:shadow-primary/10',
                  green: 'bg-green-600/5 text-green-600 dark:text-green-400 border-green-600/20 hover:bg-green-600/15 hover:border-green-600/40 group-hover:shadow-green-600/10',
                  red: 'bg-red-500/5 text-red-600 dark:text-red-400 border-red-500/20 hover:bg-red-500/15 hover:border-red-500/40 group-hover:shadow-red-500/10',
                  pink: 'bg-pink-500/5 text-pink-600 dark:text-pink-400 border-pink-500/20 hover:bg-pink-500/15 hover:border-pink-500/40 group-hover:shadow-pink-500/10',
                  amber: 'bg-amber-500/5 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/15 hover:border-amber-500/40 group-hover:shadow-amber-500/10',
                }
                const isEmergency = n.phone === '112'
                return (
                  <a key={n.phone} href={`tel:${n.phone.length > 6 ? '+91' : ''}${n.phone}`} className="group">
                    <Badge
                      variant="outline"
                      className={`text-[11px] h-8 gap-1.5 transition-all duration-200 cursor-pointer group-hover:shadow-sm ${badgeColorClasses[n.color] || badgeColorClasses.primary}`}
                    >
                      {isEmergency ? <AlertTriangle className="h-3 w-3" /> : <Phone className="h-3 w-3" />}
                      {locale === 'hi' ? n.badgeLabelHi : n.badgeLabelEn}: {n.phone.length > 6 ? `${n.phone.slice(0, 5)} ${n.phone.slice(5)}` : n.phone}
                    </Badge>
                  </a>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Main Footer Content ─── */}
      <div className="bg-gradient-to-b from-secondary/40 via-secondary/50 to-secondary/70 relative dot-grid">
        {/* Subtle pattern overlay — dual radial dots for depth */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0), radial-gradient(circle at 12px 12px, currentColor 0.5px, transparent 0)`,
          backgroundSize: '24px 24px, 24px 24px'
        }} />

        <div className="container mx-auto px-4 py-10 lg:py-12 relative">
          {/* ─── 4-Column Grid on Desktop ─── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">

            {/* Column 1: Brand & Identity */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground grid place-items-center font-bold text-base shadow-lg shadow-primary/20">
                  ग्रा
                </div>
                <div>
                  <div className="text-sm font-bold leading-tight text-gradient-tricolor">
                    {locale === 'hi' ? 'ग्राम पंचायत चंद्रा' : 'Gram Panchayat Chandra'}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
                    {locale === 'hi' ? 'डिजिटल शासन पोर्टल' : 'Digital Governance Portal'}
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                {locale === 'hi'
                  ? `विकास खण्ड शंकरगढ़, जनपद प्रयागराज, उत्तर प्रदेश। पंचायत कोड: ${PANCHAYAT.code}।`
                  : `Block Shankargarh, District Prayagraj, Uttar Pradesh. Panchayat Code: ${PANCHAYAT.code}.`}
              </p>

              {/* Government compliance badges */}
              <div className="flex flex-wrap items-center gap-1.5 mb-5">
                <span className="text-[9px] font-semibold px-2.5 py-1 rounded-md border border-primary/30 bg-primary/5 text-primary" title="Digital India Initiative">
                  Digital India
                </span>
                <span className="text-[9px] font-semibold px-2.5 py-1 rounded-md border border-accent-foreground/30 bg-accent/10 text-accent-foreground" title="eGramSwaraj">
                  eGramSwaraj
                </span>
                <span className="text-[9px] font-semibold px-2.5 py-1 rounded-md border border-green-600/30 bg-green-600/5 text-green-700 dark:text-green-400" title="NeSDA Compliant">
                  NeSDA
                </span>
              </div>

              {/* Social Media / Contact Icons */}
              <div className="flex items-center gap-2 mb-4">
                <a
                  href={PRADHAN.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 w-9 rounded-lg bg-green-600/10 grid place-items-center text-green-600 hover:bg-green-600 hover:text-white hover:shadow-md hover:shadow-green-600/20 hover:scale-110 transition-all duration-200"
                  title="WhatsApp"
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
                <a
                  href={PRADHAN.phoneHref}
                  className="h-9 w-9 rounded-lg bg-primary/10 grid place-items-center text-primary hover:bg-primary hover:text-primary-foreground hover:shadow-md hover:shadow-primary/20 hover:scale-110 transition-all duration-200"
                  title={locale === 'hi' ? 'फ़ोन करें' : 'Call'}
                >
                  <Phone className="h-4 w-4" />
                </a>
                <a
                  href={`mailto:${PRADHAN.email}`}
                  className="h-9 w-9 rounded-lg bg-amber-600/10 grid place-items-center text-amber-600 hover:bg-amber-600 hover:text-white hover:shadow-md hover:shadow-amber-600/20 hover:scale-110 transition-all duration-200"
                  title="Email"
                >
                  <Mail className="h-4 w-4" />
                </a>
                <button
                  type="button"
                  onClick={() => startVapiCall()}
                  className="h-9 w-9 rounded-lg bg-primary/10 grid place-items-center text-primary hover:bg-primary hover:text-primary-foreground hover:shadow-md hover:shadow-primary/20 hover:scale-110 transition-all duration-200"
                  title={locale === 'hi' ? 'AI सहायक' : 'AI Assistant'}
                >
                  <Mic className="h-4 w-4" />
                </button>
              </div>

              {/* Office hours */}
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>
                  {locale === 'hi' ? 'कार्यालय समय: सोम-शुक्र 10:00 – 5:00 बजे' : 'Office Hours: Mon-Fri 10:00 AM – 5:00 PM'}
                </span>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-1 w-6 rounded-full bg-gradient-to-r from-primary to-primary/40" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                  {locale === 'hi' ? 'त्वरित लिंक' : 'Quick Links'}
                </h4>
              </div>
              <ul className="space-y-1">
                {quickLinks.map((link) => {
                  const LinkIcon = link.icon
                  return (
                    <li key={link.labelEn}>
                      <button
                        onClick={link.action}
                        className="text-xs text-muted-foreground hover:text-primary transition-all duration-200 flex items-center gap-2.5 group w-full text-left py-1.5 px-2 -mx-2 rounded-lg hover:bg-primary/5"
                      >
                        <LinkIcon className="h-3.5 w-3.5 opacity-40 group-hover:opacity-100 transition-opacity shrink-0" />
                        <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                          {locale === 'hi' ? link.labelHi : link.labelEn}
                        </span>
                        <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-all duration-200 ml-auto shrink-0" />
                      </button>
                    </li>
                  )
                })}
                <li className="pt-1.5 mt-1.5 border-t border-border/30">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 px-2 mb-1 block">
                    {locale === 'hi' ? 'सरकारी पोर्टल' : 'Gov Portals'}
                  </span>
                </li>
                {govLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:text-primary transition-all duration-200 flex items-center gap-2.5 group py-1.5 px-2 -mx-2 rounded-lg hover:bg-primary/5"
                    >
                      <Globe className="h-3.5 w-3.5 opacity-40 group-hover:opacity-100 transition-opacity shrink-0" />
                      <span className="group-hover:translate-x-0.5 transition-transform duration-200">{link.label}</span>
                      <ExternalLink className="h-2.5 w-2.5 opacity-40 group-hover:opacity-80 transition-opacity ml-auto shrink-0" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Important Numbers */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-1 w-6 rounded-full bg-gradient-to-r from-green-600 to-green-600/40" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                  {locale === 'hi' ? 'महत्वपूर्ण नंबर' : 'Important Numbers'}
                </h4>
              </div>
              <div className="space-y-1.5">
                {importantNumbers.map((num) => {
                  const NumIcon = num.icon
                  return (
                    <a
                      key={num.phone}
                      href={`tel:+91${num.phone}`}
                      className="group flex items-center gap-2.5 p-2.5 -mx-1 rounded-lg hover:bg-primary/5 transition-all duration-200"
                    >
                      <div className={`h-8 w-8 rounded-lg bg-muted/80 grid place-items-center shrink-0 group-hover:scale-110 transition-transform duration-200 ${num.color}`}>
                        <NumIcon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-medium leading-tight truncate text-foreground/80 group-hover:text-foreground transition-colors">
                          {locale === 'hi' ? num.labelHi : num.labelEn}
                        </p>
                        <p className="text-[11px] text-primary font-mono group-hover:underline underline-offset-2 font-semibold">
                          {num.phone.length > 6 ? `+91 ${num.phone.slice(0, 5)} ${num.phone.slice(5)}` : num.phone}
                        </p>
                      </div>
                      <ArrowUpRight className="h-3 w-3 text-muted-foreground/30 group-hover:text-primary/60 transition-all duration-200 shrink-0" />
                    </a>
                  )
                })}
              </div>
            </div>

            {/* Column 4: Contact & Legal */}
            <div className="space-y-6">
              {/* Contact */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-1 w-6 rounded-full bg-gradient-to-r from-primary to-green-600" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                    {locale === 'hi' ? 'संपर्क / Contact' : 'Contact / संपर्क'}
                  </h4>
                </div>
                <ul className="space-y-2.5 text-xs">
                  <li className="flex items-start gap-2.5 text-muted-foreground group">
                    <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" />
                    <span className="group-hover:text-foreground/80 transition-colors leading-relaxed">
                      {locale === 'hi' ? OFFICE_ADDRESS.hi : OFFICE_ADDRESS.en}
                    </span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Mic className="h-3.5 w-3.5 shrink-0 text-primary" />
                    <button
                      type="button"
                      onClick={() => startVapiCall()}
                      className="hover:text-primary text-xs text-muted-foreground underline underline-offset-2 cursor-pointer transition-colors"
                    >
                      {locale === 'hi' ? 'AI सहायक से बात करें' : 'Talk to AI Assistant'}
                    </button>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Mail className="h-3.5 w-3.5 shrink-0 text-primary" />
                    <a href={`mailto:${PRADHAN.email}`} className="text-muted-foreground hover:text-primary transition-colors">
                      {PRADHAN.email}
                    </a>
                  </li>
                </ul>
              </div>

              {/* Legal */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                    {locale === 'hi' ? 'कानूनी / Legal' : 'Legal / कानूनी'}
                  </h4>
                </div>
                <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/30 shadow-sm tricolor-frame">
                  <CardContent className="p-3 space-y-2.5">
                    <div className="flex items-start gap-2 text-[11px] text-foreground/70 leading-relaxed">
                      <Lock className="h-3.5 w-3.5 mt-0.5 shrink-0 text-accent-foreground" />
                      <span>
                        {locale === 'hi'
                          ? 'DPDP अधिनियम 2023 अनुपालन — संवेदनशील डेटा (आधार, बैंक, IFSC) रेड-एक्टेड है।'
                          : 'DPDP Act 2023 Compliant — Sensitive data (Aadhaar, Bank, IFSC) is redacted.'}
                      </span>
                    </div>
                    <div className="flex items-start gap-2 text-[11px] text-foreground/70 leading-relaxed">
                      <Database className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" />
                      <span>
                        {locale === 'hi'
                          ? 'इस पोर्टल का डेटा सार्वजनिक सरकारी पोर्टलों से OSINT विधि से एकत्रित है।'
                          : 'Data collected via OSINT from public government portals.'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* ─── Decorative divider ─── */}
          <div className="section-divider my-2">
            <div className="section-divider-dot" />
            <div className="section-divider-dot" />
            <div className="section-divider-dot" />
          </div>

          {/* ─── Bottom Bar ─── */}
          <div className="mt-6 pt-5 border-t border-border/40">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Copyright */}
              <div className="flex items-center gap-2">
                <span className="pulse-glow inline-flex rounded-full">
                  <Sun className="h-3.5 w-3.5 text-primary slow-rotate" aria-hidden="true" />
                </span>
                <span className="text-[11px] text-muted-foreground">
                  &copy; {new Date().getFullYear()} {locale === 'hi' ? 'ग्राम पंचायत चंद्रा। सर्वाधिकार सुरक्षित।' : 'Gram Panchayat Chandra. All Rights Reserved.'}
                </span>
              </div>

              {/* Kinetic Back-to-Top button */}
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="group inline-flex items-center gap-1.5 h-8 px-3 rounded-full border border-border/50 bg-background/50 hover:bg-primary/5 hover:border-primary/30 transition-all duration-300"
                aria-label={locale === 'hi' ? 'शीर्ष पर जाएं' : 'Back to top'}
              >
                <span className="text-[10px] font-medium text-muted-foreground group-hover:text-primary transition-colors uppercase tracking-wider">
                  {locale === 'hi' ? 'शीर्ष' : 'Top'}
                </span>
                <ChevronUp className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-all duration-300 group-hover:-translate-y-0.5" />
              </button>

              {/* Tags */}
              <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
                <span className="tag-chip">Zero-Budget</span>
                <span className="tag-chip">Open-Source</span>
                <span className="tag-chip">Bilingual (HI/EN)</span>
                <span className="tag-chip text-primary/80 inline-flex items-center gap-1">
                  🇮🇳 {locale === 'hi' ? 'Powered by डिजिटल इंडिया' : 'Powered by Digital India'}
                </span>
              </div>
            </div>
          </div>

          {/* ─── Tagline ─── */}
          <div className="text-center mt-5">
            <p className="text-[11px] text-muted-foreground/80 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full border border-accent/30 bg-accent/5 glow-green">
              <Heart className="h-3 w-3 text-primary/60" />
              {locale === 'hi'
                ? '❤️ ग्राम पंचायत चंद्रा के लिए बनाया गया'
                : 'Made with ❤️ for Gram Panchayat Chandra'}
            </p>
          </div>

          {/* ─── Powered by Digital India badge ─── */}
          <div className="text-center mt-3">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-primary/5 via-accent/5 to-green-600/5 border border-border/40">
              <span className="text-[10px] font-semibold text-foreground/60 uppercase tracking-wider">
                {locale === 'hi' ? '🇮🇳 डिजिटल इंडिया द्वारा संचालित' : '🇮🇳 Powered by Digital India'}
              </span>
              <span className="text-[10px] text-muted-foreground/40">|</span>
              <span className="text-[10px] font-medium text-foreground/50">
                {locale === 'hi' ? 'शून्य-बजट • ओपन-सोर्स' : 'Zero-Budget • Open-Source'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
