'use client'
import { useI18n } from '@/lib/i18n'
import { useUI } from '@/lib/ui-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ShieldCheck, Phone, MapPin, FileSearch, Mic, ArrowRight, Sun, Users, Landmark, Home, GraduationCap, Utensils, Briefcase, BookOpen } from 'lucide-react'
import { useEffect, useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { startVapiCall } from '@/lib/vapi'
import { useCountUp } from '@/lib/use-count-up'
import { staggerContainer, staggerContainerCinematic, maskUpChild, fadeUpChild, scaleUpChild, fadeInChild, viewportOnce } from '@/lib/motion/variants'
import { ease, dur } from '@/lib/motion/springs'

// Real WhatsApp photographs of Gram Panchayat Chandra — used as the hero
// background rotator. NO AI-generated images. Each is an authentic panchayat
// photograph (flag hoisting at the panchayat bhawan, primary school building,
// village gathering, water tanker, well construction).
const HERO_IMAGES = [
  { src: '/whatsapp-optimized/IMG-20260725-WA0072.webp', credit: 'झंडारोहण, पंचायत भवन / Flag hoisting, Panchayat Bhawan' },
  { src: '/whatsapp-optimized/IMG-20260725-WA0011.webp', credit: 'प्राथमिक विद्यालय भवन / Primary school building' },
  { src: '/whatsapp-optimized/IMG-20260725-WA0080.webp', credit: 'ग्राम सभा आयोजन / Village gathering event' },
  { src: '/whatsapp-optimized/IMG-20260725-WA0020.webp', credit: 'जल टंकी आपूर्ति / Water tanker supply' },
  { src: '/whatsapp-optimized/IMG-20260725-WA0042.webp', credit: 'कुआँ निर्माण / Well construction' },
]

/* ── Animated stat counter component ── */
function AnimatedStat({ value, suffix = '' }: { value: number; suffix?: string }) {
  const { count, ref } = useCountUp(value, 1800, true)
  return (
    <span ref={ref as React.RefObject<HTMLSpanElement>} className="tabular-nums-strong">
      {count.toLocaleString('en-IN')}{suffix}
    </span>
  )
}

export function Hero() {
  const { locale } = useI18n()
  const { setView } = useUI()
  const [siteConfig, setSiteConfig] = useState<Record<string, unknown> | null>(null)
  const [activeIdx, setActiveIdx] = useState(0)
  const [prevIdx, setPrevIdx] = useState(0)
  const [mounted, setMounted] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  // Parallax REMOVED — scroll-driven transforms were causing jank on low-end devices

  useEffect(() => {
    // Defer to avoid synchronous setState in effect (react-hooks/set-state-in-effect)
    queueMicrotask(() => setMounted(true))
    fetch('/api/profile?key=site_config')
      .then(r => r.json())
      .then(d => setSiteConfig(d.value || d))
      .catch(() => {})
  }, [])

  // CSS fade rotator — cycles through real village photos every 8 seconds
  useEffect(() => {
    const id = setInterval(() => {
      setPrevIdx(activeIdx)
      setActiveIdx(i => (i + 1) % HERO_IMAGES.length)
    }, 8000)
    return () => clearInterval(id)
  }, [activeIdx])

  const handleImageNav = useCallback((idx: number) => {
    setPrevIdx(activeIdx)
    setActiveIdx(idx)
  }, [activeIdx])

  const codes = [
    { labelHi: 'पंचायत कोड', labelEn: 'Panchayat Code', value: '3145021064', color: 'from-white/[0.12] to-white/[0.04]' },
    { labelHi: 'ब्लॉक कोड', labelEn: 'Block Code', value: '3145021', color: 'from-white/[0.10] to-white/[0.03]' },
    { labelHi: 'जिला कोड', labelEn: 'District Code', value: '3145', color: 'from-white/[0.12] to-white/[0.04]' },
    { labelHi: 'राज्य कोड', labelEn: 'State Code', value: '31', color: 'from-white/[0.10] to-white/[0.03]' },
  ]

  const quickStats = [
    { labelHi: 'जनसंख्या', labelEn: 'Population', value: 1247, suffix: '', Icon: Users },
    { labelHi: 'वार्ड', labelEn: 'Wards', value: 11, suffix: '', Icon: Landmark },
    { labelHi: 'घर', labelEn: 'Households', value: 187, suffix: '', Icon: Home },
    { labelHi: 'साक्षरता', labelEn: 'Literacy', value: 67, suffix: '.8%', Icon: GraduationCap },
  ] as const

  const portalStats = [
    { labelHi: 'वार्ड', labelEn: 'Wards', value: 11, Icon: Landmark, accent: 'amber' },
    { labelHi: 'अधिकारी', labelEn: 'Officials', value: 12, Icon: Briefcase, accent: 'emerald' },
    { labelHi: 'योजनाएँ', labelEn: 'Schemes', value: 11, Icon: BookOpen, accent: 'amber' },
    { labelHi: 'विद्यार्थी', labelEn: 'Students', value: 64, Icon: Utensils, accent: 'emerald' },
  ] as const

  const complaintCategories = [
    { hi: 'जल', en: 'Water' },
    { hi: 'सड़क', en: 'Roads' },
    { hi: 'बिजली', en: 'Power' },
    { hi: 'पेंशन', en: 'Pension' },
    { hi: 'स्वास्थ्य', en: 'Health' },
    { hi: 'मनरेगा', en: 'MNREGA' },
    { hi: 'प्रमाण पत्र', en: 'Certificates' },
    { hi: 'आपातकाल', en: 'Emergency' },
  ]

  // Headline words for mask-up reveal — Devanagari first
  const headlineHi = ['चन्द्रा', 'ग्राम', 'सभा']
  const headlineEn = ['Gram Panchayat', 'Chandra']

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative overflow-hidden min-h-[100svh] flex flex-col"
      style={{ contain: 'layout paint style' }}
    >
      {/* ═══════════════════════════════════════════════════════════════
          LAYER 0 — Background (static mesh + current image only, no parallax)
          ═══════════════════════════════════════════════════════════════ */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        {/* Mesh gradient — static, no animation */}
        <div className="mesh-gradient" />

        {/* Image rotator — only render active + prev image (was rendering all 5) */}
        {[prevIdx, activeIdx].filter((v, i, a) => a.indexOf(v) === i).map((i) => {
          const img = HERO_IMAGES[i]
          if (!img) return null
          return (
            <motion.div
              key={img.src}
              className="absolute inset-0"
              initial={false}
              animate={{
                opacity: i === activeIdx ? 1 : 0,
                scale: i === activeIdx ? 1.03 : 1.0,
              }}
              transition={{ duration: 1.5, ease: ease.expoOut }}
            >
              <img
                src={img.src}
                alt=""
                loading={i === 0 ? 'eager' : 'lazy'}
                className="h-full w-full object-cover"
              />
            </motion.div>
          )
        })}

        {/* Multi-layer gradient overlay — static opacity (was scroll-driven) */}
        <div className="absolute inset-0">
          {/* Base dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/80" />
          {/* Saffron tint from left */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#FF9933]/25 via-transparent to-transparent" />
          {/* Green tint from right */}
          <div className="absolute inset-0 bg-gradient-to-l from-[#138808]/20 via-transparent to-transparent" />
          {/* Bottom vignette for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
          {/* Center radial glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.4)_100%)]" />
        </div>

        {/* Subtle tricolor top bar */}
        <div
          className="tricolor-bar h-1.5 w-full absolute top-0 left-0 right-0 z-30"
          style={{ backgroundSize: '200% 100%', animation: 'tricolor-shift 8s ease-in-out infinite' }}
        />

        {/* Decorative Indian geometric pattern overlay */}
        <div
          className="absolute inset-0 z-[1] opacity-[0.04]"
          aria-hidden="true"
          style={{
            backgroundImage: `
              radial-gradient(circle, white 1px, transparent 1px),
              radial-gradient(circle, white 0.5px, transparent 0.5px)
            `,
            backgroundSize: '32px 32px, 16px 16px',
            backgroundPosition: '0 0, 8px 8px',
          }}
        />
      </div>

      {/* Floating particles */}
      <div className="hero-particle hero-particle-1 z-0" aria-hidden="true" />
      <div className="hero-particle hero-particle-2 z-0" aria-hidden="true" />
      <div className="hero-particle hero-particle-3 z-0" aria-hidden="true" />
      <div className="hero-particle hero-particle-4 z-0" aria-hidden="true" />
      <div className="hero-particle hero-particle-5 z-0" aria-hidden="true" />
      <div className="hero-particle hero-particle-6 z-0" aria-hidden="true" />

      {/* ═══════════════════════════════════════════════════════════════
          LAYER 1 — Main Hero Content (Signature "जागृति" reveal)
          ═══════════════════════════════════════════════════════════════ */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20 relative z-10 flex-1 flex flex-col justify-center">
        <div className="max-w-3xl space-y-6 lg:space-y-8">

          {/* Badge row */}
          <motion.div
            variants={fadeInChild}
            initial="hidden"
            animate={mounted ? 'visible' : 'hidden'}
            className="flex items-center gap-2.5 flex-wrap"
          >
            <Badge
              variant="secondary"
              className="gap-1.5 py-1.5 px-3.5 text-[11px] font-semibold shadow-sm bg-white/95 backdrop-blur-md border border-white/30"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              {locale === 'hi'
                ? 'OSINT-सत्यापित • DPDP 2023 अनुपालन • शून्य-बजट'
                : 'OSINT-Verified • DPDP 2023 Compliant • Zero-Budget'}
            </Badge>
            <Sun className="h-4 w-4 text-amber-300 slow-rotate shrink-0 drop-shadow-lg" aria-hidden="true" />
          </motion.div>

          {/* Welcome greeting */}
          <motion.div
            variants={fadeUpChild}
            initial="hidden"
            animate={mounted ? 'visible' : 'hidden'}
            className="space-y-3"
          >
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl md:text-4xl font-bold text-amber-300 hero-title-shadow">
                {locale === 'hi' ? '🙏 स्वागत है' : '🙏 Welcome'}
              </span>
              <span className="text-lg md:text-xl text-white/80 font-medium hero-subtitle-shadow">
                {locale === 'hi' ? '— ग्राम पंचायत चंद्रा' : '— Gram Panchayat Chandra'}
              </span>
            </div>
          </motion.div>

          {/* ══ SIGNATURE HEADLINE — Mask-up kinetic reveal ══ */}
          <motion.div
            variants={staggerContainerCinematic}
            initial="hidden"
            animate={mounted ? 'visible' : 'hidden'}
            className="space-y-3"
          >
            {/* Devanagari headline — mask-up word by word */}
            <h1
              className="font-bold tracking-tight leading-[1.1] text-white hero-title-shadow"
              style={{ fontSize: 'var(--text-7xl)' }}
            >
              <span className="block">
                {headlineHi.map((word, i) => (
                  <span key={i} className="mask-line inline-block overflow-hidden mr-[0.25em] align-bottom" style={{ paddingBlock: '0.15em' }}>
                    <motion.span
                      variants={maskUpChild}
                      className={`inline-block bg-gradient-to-r from-amber-300 via-amber-200 to-amber-400 bg-clip-text text-transparent ${i === 2 ? 'saffron-heartbeat' : ''}`}
                    >
                      {word}
                    </motion.span>
                  </span>
                ))}
              </span>
              {/* English accompaniment — smaller, muted */}
              <span className="block mt-2">
                {headlineEn.map((word, i) => (
                  <span key={i} className="mask-line inline-block overflow-hidden mr-[0.25em]">
                    <motion.span
                      variants={maskUpChild}
                      className="inline-block text-white/90"
                      style={{ fontSize: 'clamp(1.5rem, 3vw + 0.5rem, 2.5rem)' }}
                    >
                      {word}
                    </motion.span>
                  </span>
                ))}
              </span>
            </h1>

            <motion.p
              variants={fadeUpChild}
              className="text-xl md:text-2xl lg:text-3xl text-white/95 font-semibold hero-subtitle-shadow tracking-wide"
            >
              {locale === 'hi' ? 'डिजिटल शासन पोर्टल' : 'Digital Governance Portal'}
            </motion.p>
            <motion.p
              variants={fadeUpChild}
              className="text-sm md:text-base text-white/85 flex items-center gap-2 flex-wrap hero-subtitle-shadow"
            >
              <MapPin className="h-4 w-4 text-amber-300 shrink-0" />
              <span className="tricolor-underline">
                {locale === 'hi'
                  ? 'विकास खण्ड शंकरगढ़ • जनपद प्रयागराज • उत्तर प्रदेश'
                  : 'Block Shankargarh • District Prayagraj • Uttar Pradesh'}
              </span>
            </motion.p>
          </motion.div>

          {/* ── Codes grid — compact glassmorphism cards ── */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={mounted ? 'visible' : 'hidden'}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 max-w-2xl">
              {codes.map((c, i) => (
                <motion.div key={c.value} variants={scaleUpChild} className="group">
                  <div className={`rounded-xl bg-gradient-to-br ${c.color} backdrop-blur-xl border border-white/20 p-3 shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:border-white/30 group-hover:-translate-y-1`}>
                    <div className="text-[10px] uppercase tracking-widest text-white/70 font-medium mb-1">
                      {locale === 'hi' ? c.labelHi : c.labelEn}
                    </div>
                    <div className="text-base font-mono font-bold text-white tracking-tight tabular-nums-strong">
                      {c.value}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ── CTA Buttons — magnetic on desktop ── */}
          <motion.div
            variants={fadeUpChild}
            initial="hidden"
            animate={mounted ? 'visible' : 'hidden'}
            className="flex flex-wrap gap-3 pt-1"
          >
              <Button
                onClick={() => setView('complaints')}
                size="lg"
                className="gap-2.5 shadow-xl hover:shadow-2xl glow-saffron shiny-sweep gradient-border-animate bg-primary text-base px-7 h-12 rounded-xl font-semibold"
              >
                <FileSearch className="h-4.5 w-4.5" />
                {locale === 'hi' ? 'शिकायत ट्रैक करें' : 'Track Complaint'}
              </Button>
              <Button
                onClick={() => {
                  setView('home')
                  setTimeout(() => document.getElementById('schemes')?.scrollIntoView({ behavior: 'smooth' }), 100)
                }}
                variant="outline"
                size="lg"
                className="gap-2.5 shadow-lg hover:shadow-xl shiny-sweep bg-white/90 backdrop-blur-md border-white/30 text-foreground hover:bg-white/95 text-base px-7 h-12 rounded-xl font-semibold"
              >
                {locale === 'hi' ? 'योजनाएँ देखें' : 'View Schemes'}
                <ArrowRight className="h-4.5 w-4.5" />
              </Button>
          </motion.div>

          {/* ── AI Voice Complaint Line — Simplified Card ── */}
          <motion.div
            variants={fadeUpChild}
            initial="hidden"
            animate={mounted ? 'visible' : 'hidden'}
            className="max-w-2xl"
          >
            <Card className="border-white/20 bg-white/[0.08] backdrop-blur-xl border-glow shadow-2xl overflow-hidden">
              {/* Subtle top gradient accent */}
              <div className="h-[2px] bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />
              <CardContent className="p-4 md:p-5 space-y-3.5">
                {/* Header row */}
                <div className="flex items-center gap-3.5">
                  <motion.div
                    className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-amber-950 grid place-items-center shrink-0 shadow-lg float-bob"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Mic className="h-5 w-5" />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold flex items-center gap-2 text-white">
                      {locale === 'hi' ? 'AI वॉइस शिकायत लाइन' : 'AI Voice Complaint Line'}
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-100 bg-amber-500/30 px-2 py-0.5 rounded-full border border-amber-400/30">
                        <span className="h-2 w-2 rounded-full bg-amber-300 soft-pulse" />
                        {locale === 'hi' ? 'लाइव' : 'Live'}
                      </span>
                    </div>
                    <div className="text-xs text-white/80 mt-0.5 leading-relaxed">
                      {locale === 'hi'
                        ? 'प्रधान जी उपलब्ध नहीं हैं? AI सहायक से शिकायत दर्ज करें।'
                        : 'Pradhan unavailable? File a complaint with the AI assistant.'}
                    </div>
                  </div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 shrink-0 shadow-md bg-white/90 border-white/30 h-9 rounded-lg font-semibold"
                      onClick={() => startVapiCall()}
                    >
                      <Mic className="h-3.5 w-3.5" />
                      {locale === 'hi' ? 'AI से बात करें' : 'Talk to AI'}
                    </Button>
                  </motion.div>
                </div>

                {/* Categories + helpline reference */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-xs text-white/70">
                    <Phone className="h-3 w-3 shrink-0" />
                    <span>{locale === 'hi' ? 'हेल्पलाइन नीचे देखें → आपातकालीन संपर्क अनुभाग' : 'See helpline below → Emergency Contacts section'}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {complaintCategories.map((cat) => (
                      <span
                        key={cat.en}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.08] text-white/80 border border-white/15 hover:bg-white/15 hover:text-white transition-colors duration-200 cursor-default"
                      >
                        {locale === 'hi' ? cat.hi : cat.en}
                      </span>
                    ))}
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.08] text-white/80 border border-white/15">
                      +16 {locale === 'hi' ? 'और' : 'more'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-white/60">
                    <span>{locale === 'hi' ? 'हिंदी / English / Hinglish' : 'Hindi / English / Hinglish'}</span>
                    <span className="w-1 h-1 rounded-full bg-white/40" />
                    <span>{locale === 'hi' ? '24 श्रेणियाँ' : '24 categories'}</span>
                    <span className="w-1 h-1 rounded-full bg-white/40" />
                    <span>{locale === 'hi' ? 'स्वचालित रूटिंग' : 'Auto-routing'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            Quick Stats — Animated Counters
            ═══════════════════════════════════════════════════════════════ */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-10 md:mt-14 max-w-5xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer}
        >
          {quickStats.map((s, i) => {
            const Icon = s.Icon
            return (
              <motion.div key={i} variants={fadeUpChild} className="group">
                <div className="stat-card hover-lift-large stat-card-shimmer bg-white/[0.08] backdrop-blur-xl border border-white/15 rounded-xl p-3.5 hover:border-white/25 transition-colors duration-300">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-400/25 to-amber-500/15 text-amber-300 grid place-items-center shrink-0 group-hover:from-amber-400/35 group-hover:to-amber-500/25 transition-all duration-300">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="stat-card-number text-white text-xl">
                      {s.suffix === '.8%'
                        ? <><AnimatedStat value={s.value} />.8%</>
                        : <AnimatedStat value={s.value} />
                      }
                    </div>
                    <div className="stat-card-label text-white/75">{locale === 'hi' ? s.labelHi : s.labelEn}</div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* ── Portal Stats Row ── */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 max-w-5xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer}
        >
          {portalStats.map((s, i) => {
            const Icon = s.Icon
            const isAmber = s.accent === 'amber'
            return (
              <motion.div key={i} variants={fadeUpChild} className="group">
                <div className="stat-card hover-lift-large stat-card-shimmer bg-white/[0.08] backdrop-blur-xl border border-white/15 rounded-xl p-3.5 hover:border-white/25 transition-colors duration-300">
                  <div className={`h-9 w-9 rounded-xl grid place-items-center shrink-0 transition-all duration-300 ${
                    isAmber
                      ? 'bg-gradient-to-br from-amber-400/25 to-amber-500/15 text-amber-300 group-hover:from-amber-400/35 group-hover:to-amber-500/25'
                      : 'bg-gradient-to-br from-emerald-400/25 to-emerald-500/15 text-emerald-300 group-hover:from-emerald-400/35 group-hover:to-emerald-500/25'
                  }`}>
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="stat-card-number text-white text-xl">
                      <AnimatedStat value={s.value} />
                    </div>
                    <div className="stat-card-label text-white/75">{locale === 'hi' ? s.labelHi : s.labelEn}</div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          Custom SVG Scroll Indicator — animated chevron
          ═══════════════════════════════════════════════════════════════ */}
      <motion.div
        className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 hidden md:flex flex-col items-center gap-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: mounted ? 1 : 0, y: 0 }}
        transition={{ delay: 1.5, duration: dur.slow, ease: ease.expoOut }}
        aria-hidden="true"
      >
        <span className="text-[10px] uppercase tracking-[0.2em] text-white/60 font-medium">
          {locale === 'hi' ? 'नीचे स्क्रॉल करें' : 'Scroll'}
        </span>
        <motion.svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white/60"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: ease.expoInOut }}
        >
          <path d="M6 9l6 6 6-6" />
        </motion.svg>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════
          LAYER 2 — Image Credit + Rotator Navigation
          ═══════════════════════════════════════════════════════════════ */}
      <div className="absolute bottom-4 right-4 sm:bottom-5 sm:right-6 z-20 flex items-center gap-3">
        <span className="text-[10px] text-white/60 hidden sm:inline-block bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
          {locale === 'hi' ? 'वास्तविक ग्राम चंद्रा चित्र' : 'Authentic Chandra village photo'} • {HERO_IMAGES[activeIdx].credit}
        </span>
        <div className="flex items-center gap-2">
          {HERO_IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => handleImageNav(i)}
              aria-label={`${locale === 'hi' ? 'चित्र' : 'Image'} ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === activeIdx
                  ? 'w-6 bg-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                  : 'w-1.5 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Section divider */}
      <div className="section-divider mt-auto relative z-10">
        <div className="section-divider-dot" />
        <div className="section-divider-dot" />
        <div className="section-divider-dot" />
      </div>
    </section>
  )
}
