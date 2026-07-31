'use client'
import { useI18n } from '@/lib/i18n'
import { Building2, Flag } from 'lucide-react'
import { ScrollReveal } from './ScrollReveal'
import { PANCHAYAT } from '@/data/panchayat'

export function About() {
  const { locale } = useI18n()

  return (
    <section id="about" className="section-premium relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--saffron)]/5 via-transparent to-[var(--green)]/5 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--saffron)] via-white to-[var(--green)]" />

      <div className="container mx-auto px-4 relative">
        {/* ── Section Header ── */}
        <ScrollReveal delay={0.1}>
          <div className="section-header text-center mb-12">
            <div className="section-header-badge mx-auto">
              <Building2 className="h-3.5 w-3.5" />
              {locale === 'hi' ? 'पंचायत परिचय' : 'About the Panchayat'}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gradient-premium leading-tight">
              {locale === 'hi' ? 'ग्राम पंचायत चंद्रा' : 'Gram Panchayat Chandra'}
            </h2>
            <p className="text-sm text-muted-foreground mt-3 max-w-2xl mx-auto leading-relaxed">
              {locale === 'hi'
                ? 'पंचायत की पहचान, स्थान एवं प्रशासनिक विवरण'
                : 'Panchayat identity, location and administrative details'}
            </p>
          </div>
        </ScrollReveal>

        {/* ── Hero Banner — Panchayat photograph ── */}
        <ScrollReveal delay={0.15}>
          <div className="mb-8 relative rounded-2xl overflow-hidden card-premium group">
            <div className="relative aspect-[21/9] sm:aspect-[3/1]">
              <img
                src="/whatsapp-optimized/IMG-20260725-WA0072.webp"
                alt={locale === 'hi'
                  ? 'पंचायत भवन पर ध्वजारोहण — ग्राम चंद्रा की वास्तविक तस्वीर'
                  : 'Flag hoisting at panchayat building — real photo of Gram Chandra'}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Gradient overlays */}
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--saffron)]/85 via-[var(--saffron)]/55 to-[var(--saffron)]/15" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              <div className="relative h-full flex flex-col justify-end p-6 sm:p-10">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/90 backdrop-blur-sm px-3 py-1.5 text-[11px] font-bold text-[var(--saffron)] shadow-md mb-3 uppercase tracking-wider">
                    <Flag className="h-3.5 w-3.5" />
                    {locale === 'hi' ? 'ग्राम पंचायत चंद्रा' : 'Gram Panchayat Chandra'}
                  </div>
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white drop-shadow-lg leading-tight">
                    {locale === 'hi'
                      ? 'जनभागीदारी से ग्राम विकास'
                      : 'Village development through public participation'}
                  </h3>
                  <p className="text-sm sm:text-base text-white/90 mt-3 leading-relaxed max-w-xl">
                    {locale === 'hi'
                      ? `शंकरगढ़ विकास खंड, जनपद प्रयागराज, उत्तर प्रदेश — पंचायत कोड ${PANCHAYAT.code}`
                      : `Shankargarh Block, Prayagraj District, Uttar Pradesh — Panchayat Code ${PANCHAYAT.code}`}
                  </p>
                </div>
              </div>
            </div>
            <div className="px-5 py-2.5 bg-gradient-to-r from-[var(--surface-warm)] to-[var(--surface-elevated)] border-t border-border/40 flex items-center justify-between gap-3">
              <span className="text-[11px] text-green-700 dark:text-green-400 font-semibold flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-green-500 soft-pulse" />
                {locale === 'hi' ? 'वास्तविक तस्वीर / Real photo' : 'वास्तविक तस्वीर / Real photo'}
              </span>
              <span className="text-[11px] text-muted-foreground font-medium">
                {locale === 'hi' ? 'पंचायत भवन, स्वतंत्रता दिवस' : 'Panchayat Bhawan, Independence Day'}
              </span>
            </div>
          </div>
        </ScrollReveal>

        {/* ── Section Divider ── */}
        <div className="section-divider mt-10">
          <div className="section-divider-dot" />
          <div className="section-divider-dot" />
          <div className="section-divider-dot" />
        </div>
      </div>
    </section>
  )
}
