'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useI18n } from '@/lib/i18n'
import { useAuth } from '@/lib/auth-store'
import { useCountUp } from '@/lib/use-count-up'
import { ForgotPasswordModal } from './ForgotPasswordModal'
import { OTPLogin } from './OTPLogin'
import {
  Phone, Users, Shield,
  ArrowRight, Eye, EyeOff, Loader2, CheckCircle2,
  Sparkles, Crown, Globe, IndianRupee,
  MessageSquare, GraduationCap, Droplets,
  KeyRound, Smartphone, Mail, Building2, BookOpen,
  Bell, TrendingUp, Star, Award, ChevronRight,
  MapPin, Menu, X, User, Lock, PhoneCall
} from 'lucide-react'

// ─── Animated stat counter ───
function AnimatedStat({ end, suffix = '', duration = 1500 }: { end: number; suffix?: string; duration?: number }) {
  const { count } = useCountUp(end, duration, false)
  return <span className="tabular-nums">{count.toLocaleString('en-IN')}{suffix}</span>
}

// ─── Home icon SVG component ───
function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

// ═══════════════════════════════════════════════════════════════
//  PREMIUM CINEMATIC LOADING SCREEN
// ═══════════════════════════════════════════════════════════════
function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState('Initializing Portal...')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    const texts = [
      'Initializing Portal...',
      'Loading Services...',
      'Connecting to Panchayat...',
      'Almost Ready...',
    ]
    let textIdx = 0
    const textInterval = setInterval(() => {
      textIdx = (textIdx + 1) % texts.length
      setStatusText(texts[textIdx])
    }, 500)

    // Use a simple counter approach — more reliable than random
    let p = 0
    const progressInterval = setInterval(() => {
      p += 8
      if (p >= 100) {
        p = 100
        clearInterval(progressInterval)
        clearInterval(textInterval)
        timerRef.current = setTimeout(() => onCompleteRef.current(), 300)
      }
      setProgress(p)
    }, 100)

    // FAILSAFE: Auto-complete after 3 seconds no matter what
    // This prevents the loading screen from getting stuck if intervals don't fire
    const failsafe = setTimeout(() => {
      clearInterval(progressInterval)
      clearInterval(textInterval)
      setProgress(100)
      onCompleteRef.current()
    }, 3000)

    return () => {
      clearInterval(progressInterval)
      clearInterval(textInterval)
      clearTimeout(failsafe)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 40%, #1a1a2e 100%)' }}
    >
      {/* Animated background mesh */}
      <div className="absolute inset-0 opacity-20" aria-hidden="true">
        <div className="absolute top-0 left-0 w-full h-full"
          style={{
            backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(242,106,46,0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(76,175,80,0.12) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(0,100,200,0.08) 0%, transparent 50%)',
          }}
        />
      </div>

      {/* Floating particles */}
      {[1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={i}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 3 + i * 0.7,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.4,
          }}
          className="absolute rounded-full"
          style={{
            width: `${4 + i * 3}px`,
            height: `${4 + i * 3}px`,
            background: i % 2 === 0 ? '#F26A2E' : '#4CAF50',
            top: `${15 + i * 15}%`,
            left: `${10 + i * 18}%`,
            filter: 'blur(1px)',
          }}
          aria-hidden="true"
        />
      ))}

      {/* Tricolor line at top */}
      <div className="absolute top-0 left-0 right-0 h-1 flex" aria-hidden="true">
        <div className="flex-1 bg-[#FF9933]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#138808]" />
      </div>

      {/* Logo & branding */}
      <motion.div
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative mb-10"
      >
        <div className="relative h-24 w-24 rounded-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #F26A2E 0%, #E85D26 50%, #D4451A 100%)',
            boxShadow: '0 0 60px rgba(242,106,46,0.3), 0 0 120px rgba(242,106,46,0.1)',
          }}
        >
          <div className="absolute inset-0 grid place-items-center">
            <span className="text-3xl font-serif-display font-bold text-white drop-shadow-lg">ग्रा</span>
          </div>
          {/* Rotating ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-3xl border-2 border-white/10"
          />
          {/* Inner glow */}
          <div className="absolute inset-0 rounded-3xl"
            style={{ background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%)' }}
          />
        </div>

        {/* Orbiting dot */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-2 -right-2"
        >
          <div className="h-5 w-5 rounded-full bg-[#4CAF50] border-2 border-[#0F172A] shadow-lg shadow-[#4CAF50]/30" />
        </motion.div>
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-xl font-serif-display font-bold text-white mb-1">
          ग्राम पंचायत चंद्रा
        </h1>
        <p className="text-xs text-white/50 tracking-widest uppercase">
          Digital Governance Portal
        </p>
      </motion.div>

      {/* Status text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-sm text-white/40 mb-6 font-medium tracking-wide"
      >
        {statusText}
      </motion.p>

      {/* Progress bar */}
      <div className="w-72 h-1.5 rounded-full bg-white/10 overflow-hidden relative">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.2 }}
          className="h-full rounded-full relative"
          style={{ background: 'linear-gradient(90deg, #FF9933, #F26A2E, #4CAF50)' }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 opacity-50"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
              animation: 'shimmer 1.5s infinite',
            }}
          />
        </motion.div>
      </div>

      {/* Percentage */}
      <p className="mt-4 text-xs text-white/30 tabular-nums font-mono">
        {Math.round(progress)}%
      </p>

      {/* Skip button */}
      <button
        onClick={onComplete}
        className="absolute bottom-8 right-8 text-xs text-white/30 hover:text-white/60 transition-colors flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/10 hover:border-white/20 hover:bg-white/5"
      >
        Skip
        <ArrowRight className="h-3 w-3" />
      </button>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  PREMIUM FLOATING NAVBAR
// ═══════════════════════════════════════════════════════════════
function FloatingNavbar({ hi, onToggleLocale }: { hi: boolean; onToggleLocale: () => void }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { labelHi: 'योजनाएं', labelEn: 'Schemes', icon: BookOpen },
    { labelHi: 'शिकायत', labelEn: 'Complaints', icon: MessageSquare },
    { labelHi: 'बजट', labelEn: 'Budget', icon: IndianRupee },
    { labelHi: 'वार्ड', labelEn: 'Wards', icon: Building2 },
    { labelHi: 'AI सहायक', labelEn: 'AI Assistant', icon: Sparkles },
  ]

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="sticky top-0 z-50 w-full px-4 sm:px-6 lg:px-8 pt-3"
    >
      <div className="max-w-7xl mx-auto">
        <div
          className={`rounded-2xl px-5 py-3.5 flex items-center justify-between transition-all duration-300 ${
            scrolled
              ? 'bg-white/90 backdrop-blur-xl border border-white/60 shadow-lg shadow-black/[0.03]'
              : 'bg-white/60 backdrop-blur-lg border border-white/40'
          }`}
        >
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#F26A2E] to-[#E85D26] grid place-items-center shadow-md shadow-[#F26A2E]/20 relative overflow-hidden">
              <span className="text-sm font-serif-display font-bold text-white relative z-10">ग्रा</span>
              <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%)' }} />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-[#1F2937] tracking-tight">
                {hi ? 'ग्राम पंचायत चंद्रा' : 'GP Chandra'}
              </p>
              <p className="text-[10px] text-[#9CA3AF] tracking-wider uppercase font-medium">
                {hi ? 'शंकरगढ़ • प्रयागराज' : 'Shankargarh • Prayagraj'}
              </p>
            </div>
          </div>

          {/* Desktop nav items */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const NavIcon = item.icon
              return (
                <button
                  key={item.labelEn}
                  className="text-[13px] text-[#6B7280] hover:text-[#1F2937] transition-all duration-200 flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-[#F26A2E]/5 group"
                >
                  <NavIcon className="h-3.5 w-3.5 text-[#9CA3AF] group-hover:text-[#F26A2E] transition-colors" />
                  {hi ? item.labelHi : item.labelEn}
                </button>
              )
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language toggle */}
            <button
              onClick={onToggleLocale}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F26A2E]/8 hover:bg-[#F26A2E]/15 transition-all duration-200 text-xs font-semibold text-[#F26A2E] border border-[#F26A2E]/10"
              aria-label="Toggle language"
            >
              <Globe className="h-3.5 w-3.5" />
              {hi ? 'EN' : 'हिं'}
            </button>
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#6B7280] px-3 py-2 rounded-xl bg-[#F5F5F5]/50">
              <MapPin className="h-3.5 w-3.5 text-[#F26A2E]" />
              <span>{hi ? 'प्रयागराज, उ.प्र.' : 'Prayagraj, UP'}</span>
            </div>
            {/* Mobile menu button */}
            <button
              className="lg:hidden h-10 w-10 rounded-xl bg-[#F26A2E]/10 flex items-center justify-center hover:bg-[#F26A2E]/15 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-4 w-4 text-[#F26A2E]" /> : <Menu className="h-4 w-4 text-[#F26A2E]" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden mt-2 bg-white/95 backdrop-blur-xl rounded-2xl p-4 border border-[#E5E7EB]/60 shadow-xl"
            >
              {navItems.map((item) => {
                const NavIcon = item.icon
                return (
                  <button
                    key={item.labelEn}
                    className="w-full py-3 px-4 text-sm text-[#6B7280] hover:text-[#1F2937] hover:bg-[#F26A2E]/5 rounded-xl transition-all flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <NavIcon className="h-4 w-4 text-[#F26A2E]" />
                    {hi ? item.labelHi : item.labelEn}
                  </button>
                )
              })}
              <div className="mt-2 pt-2 border-t border-[#E5E7EB]">
                <div className="flex items-center gap-2 text-xs text-[#6B7280] px-4 py-2">
                  <MapPin className="h-3.5 w-3.5 text-[#F26A2E]" />
                  {hi ? 'प्रयागराज, उत्तर प्रदेश' : 'Prayagraj, Uttar Pradesh'}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  )
}

// ═══════════════════════════════════════════════════════════════
//  MAIN LANDING PAGE — AWARD-WINNING PREMIUM DESIGN
// ═══════════════════════════════════════════════════════════════
export function LandingPage() {
  const { locale, toggle: toggleLocale } = useI18n()
  const { login, signup, isLoading, error, clearError } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup' | 'otp'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [forgotOpen, setForgotOpen] = useState(false)
  const [loadingComplete, setLoadingComplete] = useState(false)

  // Login form state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Signup form state
  const [signupName, setSignupName] = useState('')
  const [signupPhone, setSignupPhone] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')

  // Live announcements
  const [announcements, setAnnouncements] = useState<Array<{ titleHi: string; titleEn: string }>>([])

  const hi = locale === 'hi'

  const handleLoadingComplete = () => {
    setLoadingComplete(true)
  }

  useEffect(() => {
    fetch('/api/announcements')
      .then(r => r.json())
      .then(d => setAnnouncements(d.announcements || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    clearError()
  }, [mode, clearError])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginEmail || !loginPassword) return
    await login(loginEmail, loginPassword)
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signupName || !signupPhone || !signupEmail || !signupPassword) return
    await signup(signupName, signupEmail, signupPhone, signupPassword)
  }

  const trustedLogos = [
    { labelHi: 'डिजिटल इंडिया', labelEn: 'Digital India', icon: Globe },
    { labelHi: 'eGramSwaraj', labelEn: 'eGramSwaraj', icon: Building2 },
    { labelHi: 'NREGA', labelEn: 'NREGA', icon: Users },
    { labelHi: 'PMAY-G', labelEn: 'PMAY-G', icon: HomeIcon },
    { labelHi: 'जल जीवन', labelEn: 'Jal Jeevan', icon: Droplets },
    { labelHi: 'GPDP', labelEn: 'GPDP', icon: BookOpen },
  ]

  const stats = [
    { icon: Users, end: 1247, suffix: '', labelHi: 'निवासी', labelEn: 'Residents' },
    { icon: Building2, end: 11, suffix: '', labelHi: 'वार्ड', labelEn: 'Wards' },
    { icon: BookOpen, end: 11, suffix: '+', labelHi: 'योजनाएं', labelEn: 'Schemes' },
    { icon: Shield, end: 24, suffix: '×7', labelHi: 'सुनवाई', labelEn: 'Support' },
  ]

  const features = [
    { icon: MessageSquare, titleHi: 'AI शिकायत दर्ज', titleEn: 'AI Complaint Filing', descHi: 'फोन कॉल से शिकायत दर्ज करें', descEn: 'File complaints via phone call' },
    { icon: IndianRupee, titleHi: 'बजट पारदर्शिता', titleEn: 'Budget Transparency', descHi: 'पंचायत बजट देखें', descEn: 'View panchayat budget details' },
    { icon: GraduationCap, titleHi: 'शिक्षा डेटा', titleEn: 'Education Data', descHi: 'स्कूल एवं विद्यार्थी जानकारी', descEn: 'School & student information' },
    { icon: Droplets, titleHi: 'जल आपूर्ति', titleEn: 'Water Supply', descHi: 'हैंडपंप एवं जल स्रोत स्थिति', descEn: 'Handpump & water source status' },
  ]

  return (
    <>
      {/* ─── Loading Screen ─── */}
      <AnimatePresence>
        {!loadingComplete && <LoadingScreen onComplete={handleLoadingComplete} />}
      </AnimatePresence>

      {/* ─── Main Page ─── */}
      {loadingComplete && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="min-h-screen flex flex-col relative overflow-hidden"
          style={{ background: '#FAFAF8' }}
        >
          {/* ─── Background Effects ─── */}
          <div className="absolute inset-0 grid-pattern opacity-40" aria-hidden="true" />

          {/* Ambient gradient orbs */}
          <div className="absolute top-[-15%] left-[-10%] w-[600px] h-[600px] rounded-full orb-animate opacity-25"
            style={{ background: 'radial-gradient(circle, rgba(242,106,46,0.12) 0%, transparent 70%)' }}
            aria-hidden="true"
          />
          <div className="absolute bottom-[-15%] right-[-10%] w-[700px] h-[700px] rounded-full orb-animate-slow opacity-20"
            style={{ background: 'radial-gradient(circle, rgba(76,175,80,0.10) 0%, transparent 70%)' }}
            aria-hidden="true"
          />
          <div className="absolute top-[30%] left-[60%] w-[400px] h-[400px] rounded-full orb-animate opacity-15"
            style={{ background: 'radial-gradient(circle, rgba(0,100,200,0.06) 0%, transparent 70%)' }}
            aria-hidden="true"
          />

          {/* ─── Navbar ─── */}
          <FloatingNavbar hi={hi} onToggleLocale={toggleLocale} />

          {/* ─── Announcements Ticker ─── */}
          {announcements.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="w-full px-4 sm:px-6 lg:px-8 py-2 relative z-10"
            >
              <div className="max-w-7xl mx-auto flex items-center gap-3 rounded-xl px-4 py-2 bg-white/70 backdrop-blur-sm border border-[#E5E7EB]/40"
                style={{ boxShadow: '0 2px 12px rgba(15,23,42,0.03)' }}
              >
                <Badge className="bg-gradient-to-r from-[#F26A2E] to-[#E85D26] text-white text-[10px] h-6 px-2.5 shrink-0 flex items-center gap-1 rounded-lg border-0">
                  <Bell className="h-2.5 w-2.5" />
                  LIVE
                </Badge>
                <div className="flex-1 overflow-hidden">
                  <div className="flex gap-8 whitespace-nowrap marquee-animate">
                    {announcements.concat(announcements).map((ann, i) => (
                      <span key={i} className="text-xs text-[#6B7280] flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#F26A2E] shrink-0" />
                        {hi ? ann.titleHi : ann.titleEn}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════════════════════
              HERO SECTION — Split Layout
              ═══════════════════════════════════════════════════════ */}
          <div className="flex-1 flex items-center relative z-10">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-20">
              <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">

                {/* ═══ LEFT SIDE: Trust + Image + Social Proof ═══ */}
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                  className="lg:w-[55%] flex flex-col items-center lg:items-start"
                >
                  {/* Hero headline */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="mb-8 text-center lg:text-left"
                  >
                    <Badge className="section-header-badge mb-4">
                      <Sparkles className="h-3 w-3" />
                      {hi ? 'डिजिटल शासन पोर्टल' : 'Digital Governance Portal'}
                    </Badge>

                    <h1 className="text-heading-1 font-serif-display mb-5" style={{ lineHeight: 1.1 }}>
                      {hi ? 'आपका पंचायत,' : 'Your Panchayat,'}
                      <br />
                      <span className="brush-stroke text-[#F26A2E]">
                        {hi ? 'आपकी शक्ति।' : 'Your Power.'}
                      </span>
                    </h1>

                    <p className="text-body-lg max-w-lg mx-auto lg:mx-0" style={{ color: '#6B7280' }}>
                      {hi
                        ? 'शिकायत दर्ज, योजना पात्रता जानें, बजट देखें — AI शक्तिशाली शासन पोर्टल, 24×7 सुनवाई।'
                        : 'File complaints, check scheme eligibility, view budgets — AI-powered governance portal with 24×7 support.'}
                    </p>
                  </motion.div>

                  {/* ─── Pradhan Photo + GPA Card ─── */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="mb-6 w-full max-w-sm"
                  >
                    <div className="relative">
                      {/* Soft glow behind photo */}
                      <div className="absolute inset-0 rounded-3xl opacity-30 blur-2xl scale-110"
                        style={{ background: 'radial-gradient(circle at 30% 30%, rgba(242,106,46,0.15) 0%, rgba(76,175,80,0.10) 50%, transparent 70%)' }}
                        aria-hidden="true"
                      />

                      {/* Photo container */}
                      <div
                        className="relative w-full h-[320px] sm:h-[380px] rounded-3xl overflow-hidden card-premium"
                        style={{ boxShadow: '0 25px 60px rgba(15,23,42,0.12)' }}
                      >
                        <img
                          src="/pradhan-portrait.png"
                          alt={hi ? 'श्रीमती संगीता मिश्रा — ग्राम प्रधान' : 'Shrimati Sangita Mishra — Gram Pradhan'}
                          className="w-full h-full object-cover"
                        />
                        {/* Bottom gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/60 via-[#0F172A]/10 to-transparent" />

                        {/* Tricolor accent at top */}
                        <div className="absolute top-0 left-0 right-0 h-1 flex" aria-hidden="true">
                          <div className="flex-1 bg-[#FF9933]" />
                          <div className="flex-1 bg-white" />
                          <div className="flex-1 bg-[#138808]" />
                        </div>
                      </div>

                      {/* Verified badge on photo */}
                      <div className="absolute top-5 right-5 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm text-[#4CAF50] text-[11px] font-semibold px-3 py-1.5 rounded-xl shadow-lg"
                        style={{ boxShadow: '0 4px 20px rgba(15,23,42,0.12)' }}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 fill-[#4CAF50] text-white" />
                        {hi ? 'सत्यापित' : 'Verified'}
                      </div>

                      {/* Name card floating over bottom of photo */}
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.7, duration: 0.4 }}
                        className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md rounded-2xl px-4 py-3"
                        style={{ boxShadow: '0 8px 30px rgba(15,23,42,0.08)' }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#F26A2E] to-[#E85D26] grid place-items-center shadow-md shrink-0">
                            <Crown className="h-4 w-4 text-white" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-[#1F2937] truncate">
                              {hi ? 'श्रीमती संगीता मिश्रा' : 'Shrimati Sangita Mishra'}
                            </p>
                            <p className="text-[11px] text-[#6B7280]">
                              {hi ? 'ग्राम प्रधान • +91 96510 35021' : 'Gram Pradhan • +91 96510 35021'}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* GPA (Balwant Chauhan) info card */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.4 }}
                    className="mb-6 w-full max-w-sm"
                  >
                    <a href="tel:+919839312578"
                      className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/80 backdrop-blur-sm border border-[#4CAF50]/15 hover:border-[#4CAF50]/30 transition-all group card-premium"
                      style={{ boxShadow: '0 4px 20px rgba(15,23,42,0.04)' }}
                    >
                      <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#4CAF50] to-[#388E3C] grid place-items-center shadow-md shrink-0">
                        <Building2 className="h-5 w-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-[#1F2937]">
                          {hi ? 'श्री बलवंत चौहान' : 'Shri Balwant Chauhan'}
                        </p>
                        <p className="text-[11px] text-[#6B7280]">
                          {hi ? 'ग्राम पंचायत अधिकारी (GPA) • +91 98393 12578' : 'Gram Panchayat Adhikari (GPA) • +91 98393 12578'}
                        </p>
                      </div>
                      <Phone className="h-4 w-4 text-[#4CAF50] ml-auto shrink-0 group-hover:scale-110 transition-transform" />
                    </a>
                  </motion.div>

                  {/* Achievement badges */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.0 }}
                    className="flex flex-wrap items-center gap-2 mb-8 justify-center lg:justify-start"
                  >
                    <div className="flex items-center gap-1.5 text-[11px] text-[#4CAF50] bg-[#4CAF50]/8 px-3 py-1.5 rounded-lg border border-[#4CAF50]/15 font-medium">
                      <Award className="h-3 w-3" />
                      DPDP 2023
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#6B7280] bg-[#6B7280]/8 px-3 py-1.5 rounded-lg border border-[#6B7280]/15 font-medium">
                      <Shield className="h-3 w-3" />
                      {hi ? 'OSINT सत्यापित' : 'OSINT Verified'}
                    </div>
                  </motion.div>

                  {/* Stats row */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1, duration: 0.5 }}
                    className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 w-full"
                  >
                    {stats.map((stat) => {
                      const StatIcon = stat.icon
                      return (
                        <div
                          key={stat.labelEn}
                          className="card-premium flex flex-col items-center py-4 px-3 rounded-2xl hover:border-[#F26A2E]/20 transition-all"
                        >
                          <StatIcon className="h-5 w-5 text-[#F26A2E] mb-1.5" />
                          <span className="text-xl font-bold text-[#1F2937]">
                            <AnimatedStat end={stat.end} suffix={stat.suffix} />
                          </span>
                          <span className="text-[11px] text-[#9CA3AF] mt-0.5 font-medium">
                            {hi ? stat.labelHi : stat.labelEn}
                          </span>
                        </div>
                      )
                    })}
                  </motion.div>

                  {/* Trusted logos marquee */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="overflow-hidden w-full"
                  >
                    <p className="text-[10px] text-[#9CA3AF] uppercase tracking-widest mb-3 text-center lg:text-left font-semibold">
                      {hi ? 'इन पोर्टलों से जुड़ा' : 'Connected with'}
                    </p>
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className="flex gap-3 marquee-animate whitespace-nowrap">
                        {trustedLogos.concat(trustedLogos).map((item, i) => {
                          const LogoIcon = item.icon
                          return (
                            <span key={i} className="flex items-center gap-1.5 text-[11px] font-medium text-[#9CA3AF] px-3 py-1.5 rounded-xl bg-white/60 border border-[#E5E7EB]/40 hover:border-[#F26A2E]/15 transition-colors">
                              <LogoIcon className="h-3 w-3 text-[#B0B0B0]" />
                              {hi ? item.labelHi : item.labelEn}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>

                {/* ═══ RIGHT SIDE: Premium Glassmorphism Auth Card ═══ */}
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                  className="lg:w-[45%] w-full max-w-md mx-auto lg:mx-0"
                >
                  <div
                    className="relative rounded-3xl overflow-hidden"
                    style={{ boxShadow: '0 25px 60px rgba(15,23,42,0.08), 0 0 0 1px rgba(255,255,255,0.6)' }}
                  >
                    {/* Glass card background */}
                    <div className="bg-white/80 backdrop-blur-xl p-6 sm:p-8 relative">
                      {/* Subtle decorative gradient */}
                      <div className="absolute top-0 left-0 right-0 h-1.5 flex" aria-hidden="true">
                        <div className="flex-1 bg-[#FF9933]" />
                        <div className="flex-1 bg-white" />
                        <div className="flex-1 bg-[#138808]" />
                      </div>

                      {/* Form mode switcher tabs */}
                      <div className="flex items-center gap-1 mb-7 mt-2 bg-[#F5F5F5]/80 rounded-xl p-1">
                        {([
                          { key: 'login' as const, labelHi: 'लॉग इन', labelEn: 'Sign In', icon: Lock },
                          { key: 'signup' as const, labelHi: 'साइन अप', labelEn: 'Sign Up', icon: User },
                          { key: 'otp' as const, labelHi: 'OTP', labelEn: 'OTP', icon: Smartphone },
                        ]).map((m) => {
                          const TabIcon = m.icon
                          return (
                            <button
                              key={m.key}
                              onClick={() => setMode(m.key)}
                              className={`flex-1 py-2.5 px-3 rounded-lg text-[13px] font-medium transition-all duration-200 flex items-center justify-center gap-1.5 ${
                                mode === m.key
                                  ? 'bg-white text-[#1F2937] shadow-sm'
                                  : 'text-[#9CA3AF] hover:text-[#6B7280]'
                              }`}
                              style={mode === m.key ? { boxShadow: '0 2px 8px rgba(15,23,42,0.06)' } : {}}
                            >
                              <TabIcon className="h-3.5 w-3.5" />
                              {hi ? m.labelHi : m.labelEn}
                            </button>
                          )
                        })}
                      </div>

                      {/* Form heading */}
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={mode}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <h2 className="text-heading-3 font-serif-display text-[#1F2937] mb-1.5">
                            {mode === 'login'
                              ? (hi ? 'लॉग इन करें' : 'Welcome Back')
                              : mode === 'signup'
                              ? (hi ? 'अकाउंट बनाएं' : 'Start Your Free Access')
                              : (hi ? 'OTP लॉग इन' : 'Quick OTP Login')
                            }
                          </h2>
                          <p className="text-sm text-[#9CA3AF] mb-6">
                            {mode === 'login'
                              ? (hi ? 'पंचायत पोर्टल में प्रवेश करें' : 'Access the panchayat portal and all services')
                              : mode === 'signup'
                              ? (hi ? 'नागरिक अकाउंट बनाएं' : 'Create a citizen account to file complaints & access services')
                              : (hi ? 'फोन OTP से तेज़ लॉग इन' : 'Instant login with your phone number')
                            }
                          </p>
                        </motion.div>
                      </AnimatePresence>

                      {/* Error message */}
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mb-4 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2"
                        >
                          <Shield className="h-4 w-4 shrink-0" />
                          {error}
                        </motion.div>
                      )}

                      {/* ═══ Forms ═══ */}
                      <AnimatePresence mode="wait">
                        {mode === 'login' ? (
                          <motion.form
                            key="login"
                            initial={{ opacity: 0, x: -15 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 15 }}
                            transition={{ duration: 0.2 }}
                            onSubmit={handleLogin}
                            className="space-y-5 stagger-children"
                          >
                            <div className="space-y-2">
                              <Label htmlFor="login-email" className="text-xs font-semibold text-[#374151]">
                                {hi ? 'ईमेल' : 'Email Address'}
                              </Label>
                              <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#B0B0B0]" />
                                <Input
                                  id="login-email"
                                  type="email"
                                  placeholder="you@email.com"
                                  value={loginEmail}
                                  onChange={(e) => setLoginEmail(e.target.value)}
                                  className="input-premium pl-12 bg-white/70"
                                  required
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label htmlFor="login-password" className="text-xs font-semibold text-[#374151]">
                                  {hi ? 'पासवर्ड' : 'Password'}
                                </Label>
                                <button
                                  type="button"
                                  onClick={() => setForgotOpen(true)}
                                  className="text-xs text-[#F26A2E] hover:underline font-medium"
                                >
                                  {hi ? 'पासवर्ड भूल गए?' : 'Forgot password?'}
                                </button>
                              </div>
                              <div className="relative">
                                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#B0B0B0]" />
                                <Input
                                  id="login-password"
                                  type={showPassword ? 'text' : 'password'}
                                  placeholder="••••••••"
                                  value={loginPassword}
                                  onChange={(e) => setLoginPassword(e.target.value)}
                                  className="input-premium pl-12 pr-12 bg-white/70"
                                  required
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#B0B0B0] hover:text-[#374151] transition-colors"
                                >
                                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>
                            </div>

                            {/* CTA button */}
                            <Button
                              type="submit"
                              disabled={isLoading}
                              className="w-full btn-premium bg-gradient-to-r from-[#F26A2E] to-[#E85D26] btn-gradient-animate hover:from-[#E85D26] hover:to-[#F26A2E] text-white font-semibold shadow-lg shadow-[#F26A2E]/20"
                            >
                              {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                              ) : (
                                <>
                                  {hi ? 'लॉग इन करें' : 'Sign In'}
                                  <ArrowRight className="h-4 w-4 ml-2" />
                                </>
                              )}
                            </Button>

                            <div className="relative my-1">
                              <Separator className="bg-[#E5E7EB]" />
                              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/80 px-3 text-[10px] text-[#B0B0B0] uppercase tracking-widest font-medium">
                                {hi ? 'या' : 'OR'}
                              </span>
                            </div>

                            {/* Secondary actions */}
                            <div className="grid grid-cols-2 gap-3">
                              <Button
                                variant="outline"
                                type="button"
                                className="h-12 rounded-xl border-[#E5E7EB]/80 hover:border-[#F26A2E]/30 hover:bg-[#F26A2E]/5 text-sm font-medium gap-2 transition-all"
                                onClick={() => setMode('otp')}
                              >
                                <Smartphone className="h-4 w-4 text-[#F26A2E]" />
                                {hi ? 'OTP' : 'OTP Login'}
                              </Button>
                              <Button
                                variant="outline"
                                type="button"
                                className="h-12 rounded-xl border-[#E5E7EB]/80 hover:border-[#4CAF50]/30 hover:bg-[#4CAF50]/5 text-sm font-medium gap-2 transition-all"
                                onClick={() => useAuth.getState().setGuestMode(true)}
                              >
                                <Globe className="h-4 w-4 text-[#4CAF50]" />
                                {hi ? 'अतिथि' : 'Guest'}
                              </Button>
                            </div>
                          </motion.form>
                        ) : mode === 'signup' ? (
                          <motion.form
                            key="signup"
                            initial={{ opacity: 0, x: 15 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -15 }}
                            transition={{ duration: 0.2 }}
                            onSubmit={handleSignup}
                            className="space-y-5 stagger-children"
                          >
                            <div className="space-y-2">
                              <Label htmlFor="signup-name" className="text-xs font-semibold text-[#374151]">
                                {hi ? 'पूरा नाम' : 'Full Name'}
                              </Label>
                              <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#B0B0B0]" />
                                <Input
                                  id="signup-name"
                                  type="text"
                                  placeholder={hi ? 'अपना पूरा नाम दर्ज करें' : 'Enter your full name'}
                                  value={signupName}
                                  onChange={(e) => setSignupName(e.target.value)}
                                  className="input-premium pl-12 bg-white/70"
                                  required
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <Label htmlFor="signup-phone" className="text-xs font-semibold text-[#374151]">
                                  {hi ? 'फोन' : 'Phone'}
                                </Label>
                                <div className="relative">
                                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-[#B0B0B0] font-mono">+91</span>
                                  <Input
                                    id="signup-phone"
                                    type="tel"
                                    placeholder="96510 35021"
                                    value={signupPhone}
                                    onChange={(e) => setSignupPhone(e.target.value)}
                                    className="input-premium pl-10 bg-white/70"
                                    required
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="signup-email" className="text-xs font-semibold text-[#374151]">
                                  {hi ? 'ईमेल' : 'Email'}
                                </Label>
                                <Input
                                  id="signup-email"
                                  type="email"
                                  placeholder="you@email.com"
                                  value={signupEmail}
                                  onChange={(e) => setSignupEmail(e.target.value)}
                                  className="input-premium bg-white/70"
                                  required
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="signup-password" className="text-xs font-semibold text-[#374151]">
                                {hi ? 'पासवर्ड' : 'Password'}
                              </Label>
                              <div className="relative">
                                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#B0B0B0]" />
                                <Input
                                  id="signup-password"
                                  type={showPassword ? 'text' : 'password'}
                                  placeholder="••••••••"
                                  value={signupPassword}
                                  onChange={(e) => setSignupPassword(e.target.value)}
                                  className="input-premium pl-12 pr-12 bg-white/70"
                                  required
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#B0B0B0] hover:text-[#374151] transition-colors"
                                >
                                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px] text-[#9CA3AF] mt-1">
                                <CheckCircle2 className={`h-3 w-3 ${signupPassword.length >= 8 ? 'text-[#4CAF50]' : 'text-[#D1D5DB]'}`} />
                                <span>{hi ? '8 अक्षर या अधिक' : '8 characters or more'}</span>
                              </div>
                            </div>

                            {/* CTA button */}
                            <Button
                              type="submit"
                              disabled={isLoading}
                              className="w-full btn-premium bg-gradient-to-r from-[#F26A2E] to-[#E85D26] btn-gradient-animate hover:from-[#E85D26] hover:to-[#F26A2E] text-white font-semibold shadow-lg shadow-[#F26A2E]/20"
                            >
                              {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                              ) : (
                                <>
                                  {hi ? 'अकाउंट बनाएं' : 'Create Account'}
                                  <ArrowRight className="h-4 w-4 ml-2" />
                                </>
                              )}
                            </Button>

                            <div className="relative my-1">
                              <Separator className="bg-[#E5E7EB]" />
                              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/80 px-3 text-[10px] text-[#B0B0B0] uppercase tracking-widest font-medium">
                                {hi ? 'या' : 'OR'}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <Button
                                variant="outline"
                                type="button"
                                className="h-12 rounded-xl border-[#E5E7EB]/80 hover:border-[#F26A2E]/30 hover:bg-[#F26A2E]/5 text-sm font-medium gap-2 transition-all"
                                onClick={() => setMode('otp')}
                              >
                                <Smartphone className="h-4 w-4 text-[#F26A2E]" />
                                {hi ? 'OTP' : 'OTP Login'}
                              </Button>
                              <Button
                                variant="outline"
                                type="button"
                                className="h-12 rounded-xl border-[#E5E7EB]/80 hover:border-[#4CAF50]/30 hover:bg-[#4CAF50]/5 text-sm font-medium gap-2 transition-all"
                                onClick={() => useAuth.getState().setGuestMode(true)}
                              >
                                <Globe className="h-4 w-4 text-[#4CAF50]" />
                                {hi ? 'अतिथि' : 'Guest'}
                              </Button>
                            </div>
                          </motion.form>
                        ) : (
                          <motion.div
                            key="otp"
                            initial={{ opacity: 0, x: 15 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -15 }}
                            transition={{ duration: 0.2 }}
                          >
                            <OTPLogin onBack={() => setMode('login')} />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* ─── Enter as Guest — Prominent ─── */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mt-6"
                      >
                        <button
                          onClick={() => useAuth.getState().setGuestMode(true)}
                          className="w-full flex items-center justify-center gap-2.5 p-4 rounded-2xl border-2 border-dashed border-[#E5E7EB]/80 hover:border-[#F26A2E]/30 hover:bg-[#F26A2E]/5 transition-all group"
                        >
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#F26A2E]/10 to-[#4CAF50]/10 flex items-center justify-center group-hover:from-[#F26A2E]/20 group-hover:to-[#4CAF50]/20 transition-all">
                            <PhoneCall className="h-5 w-5 text-[#F26A2E] group-hover:scale-110 transition-transform" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-semibold text-[#1F2937] group-hover:text-[#F26A2E] transition-colors">
                              {hi ? 'अतिथि के रूप में प्रवेश करें' : 'Enter as Guest'}
                            </p>
                            <p className="text-[11px] text-[#9CA3AF]">
                              {hi ? 'बिना अकाउंट के पोर्टल देखें' : 'Explore the portal without an account'}
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-[#D1D5DB] ml-auto group-hover:text-[#F26A2E] group-hover:translate-x-1 transition-all" />
                        </button>
                      </motion.div>

                      {/* Bottom trust indicators */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-6 pt-5 border-t border-[#E5E7EB]/40"
                      >
                        <div className="flex items-center justify-center gap-1 mb-2">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className="h-3 w-3 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        <p className="text-xs text-[#9CA3AF] text-center">
                          {hi
                            ? 'चंद्रा पंचायत के निवासियों द्वारा विश्वसनीय।'
                            : 'Trusted by residents of Chandra Panchayat.'}
                        </p>
                      </motion.div>
                    </div>
                  </div>

                  {/* Features preview below card (desktop only) */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8 hidden lg:block"
                  >
                    <p className="text-[10px] text-[#9CA3AF] uppercase tracking-widest mb-4 text-center font-semibold">
                      {hi ? 'पोर्टल सुविधाएं' : 'Portal Features'}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {features.map((feat) => {
                        const FeatIcon = feat.icon
                        return (
                          <motion.div
                            key={feat.titleEn}
                            whileHover={{ scale: 1.02, y: -2 }}
                            className="card-premium flex items-center gap-3 p-4 rounded-2xl cursor-default"
                          >
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#F26A2E]/10 to-[#F26A2E]/5 flex items-center justify-center shrink-0">
                              <FeatIcon className="h-5 w-5 text-[#F26A2E]" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-[#1F2937] truncate">
                                {hi ? feat.titleHi : feat.titleEn}
                              </p>
                              <p className="text-[11px] text-[#9CA3AF] truncate">
                                {hi ? feat.descHi : feat.descEn}
                              </p>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════
              FOOTER — Premium Design
              ═══════════════════════════════════════════════════════ */}
          <motion.footer
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="w-full mt-auto relative z-10 border-t border-[#E5E7EB]/40"
          >
            {/* Main footer content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Brand column */}
                <div className="sm:col-span-2 lg:col-span-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#F26A2E] to-[#E85D26] grid place-items-center shadow-md shadow-[#F26A2E]/20 relative overflow-hidden">
                      <span className="text-sm font-serif-display font-bold text-white relative z-10">ग्रा</span>
                      <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%)' }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1F2937] tracking-tight">
                        {hi ? 'ग्राम पंचायत चंद्रा' : 'GP Chandra'}
                      </p>
                      <p className="text-[10px] text-[#9CA3AF] tracking-wider uppercase font-medium">
                        {hi ? 'शंकरगढ़ • प्रयागराज • उ.प्र.' : 'Shankargarh • Prayagraj • UP'}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-[#9CA3AF] leading-relaxed mb-4">
                    {hi
                      ? 'AI-संचालित डिजिटल शासन पोर्टल — चंद्रा पंचायत के निवासियों के लिए पारदर्शी, तेज़, और भरोसेमंद सेवा।'
                      : 'AI-powered digital governance portal — transparent, fast, and trusted services for Chandra residents.'}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[9px] border-[#F26A2E]/20 text-[#F26A2E] rounded-lg px-2 py-0.5 font-medium">
                      🇮🇳 Digital India
                    </Badge>
                    <Badge variant="outline" className="text-[9px] border-[#4CAF50]/20 text-[#4CAF50] rounded-lg px-2 py-0.5 font-medium">
                      <Shield className="h-2.5 w-2.5 mr-0.5" />
                      OSINT Verified
                    </Badge>
                  </div>
                </div>

                {/* Quick Services */}
                <div>
                  <h4 className="text-xs font-semibold text-[#1F2937] mb-4 uppercase tracking-widest">
                    {hi ? 'त्वरित सेवाएं' : 'Quick Services'}
                  </h4>
                  <ul className="space-y-2.5">
                    {[
                      { labelHi: 'शिकायत दर्ज करें', labelEn: 'File Complaint' },
                      { labelHi: 'योजना पात्रता', labelEn: 'Scheme Eligibility' },
                      { labelHi: 'बजट विवरण', labelEn: 'Budget Details' },
                      { labelHi: 'वार्ड मानचित्र', labelEn: 'Ward Map' },
                    ].map((link) => (
                      <li key={link.labelEn}>
                        <button className="text-xs text-[#9CA3AF] hover:text-[#F26A2E] transition-colors flex items-center gap-1.5 group">
                          <ChevronRight className="h-3 w-3 text-[#F26A2E]/30 group-hover:text-[#F26A2E] transition-colors" />
                          {hi ? link.labelHi : link.labelEn}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Government Portals */}
                <div>
                  <h4 className="text-xs font-semibold text-[#1F2937] mb-4 uppercase tracking-widest">
                    {hi ? 'सरकारी पोर्टल' : 'Government Portals'}
                  </h4>
                  <ul className="space-y-2.5">
                    {[
                      { labelHi: 'eGramSwaraj', labelEn: 'eGramSwaraj' },
                      { labelHi: 'NREGA पोर्टल', labelEn: 'NREGA Portal' },
                      { labelHi: 'PMAY-G', labelEn: 'PMAY-G' },
                      { labelHi: 'जल जीवन मिशन', labelEn: 'Jal Jeevan Mission' },
                    ].map((link) => (
                      <li key={link.labelEn}>
                        <button className="text-xs text-[#9CA3AF] hover:text-[#F26A2E] transition-colors flex items-center gap-1.5 group">
                          <ChevronRight className="h-3 w-3 text-[#F26A2E]/30 group-hover:text-[#F26A2E] transition-colors" />
                          {hi ? link.labelHi : link.labelEn}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Contact */}
                <div>
                  <h4 className="text-xs font-semibold text-[#1F2937] mb-4 uppercase tracking-widest">
                    {hi ? 'संपर्क करें' : 'Contact'}
                  </h4>
                  <div className="space-y-3">
                    <a href="tel:+919651035021" className="flex items-center gap-2.5 text-xs text-[#9CA3AF] hover:text-[#F26A2E] transition-colors group">
                      <div className="h-7 w-7 rounded-lg bg-[#F26A2E]/10 flex items-center justify-center shrink-0 group-hover:bg-[#F26A2E]/20 transition-colors">
                        <Phone className="h-3.5 w-3.5 text-[#F26A2E]" />
                      </div>
                      <span>{hi ? 'प्रधान: +91 96510 35021' : 'Pradhan: +91 96510 35021'}</span>
                    </a>
                    <a href="tel:+919839312578" className="flex items-center gap-2.5 text-xs text-[#9CA3AF] hover:text-[#4CAF50] transition-colors group">
                      <div className="h-7 w-7 rounded-lg bg-[#4CAF50]/10 flex items-center justify-center shrink-0 group-hover:bg-[#4CAF50]/20 transition-colors">
                        <Phone className="h-3.5 w-3.5 text-[#4CAF50]" />
                      </div>
                      <span>{hi ? 'GPA (बलवंत चौहान): +91 98393 12578' : 'GPA (Balwant Chauhan): +91 98393 12578'}</span>
                    </a>
                    <div className="flex items-center gap-2.5 text-xs text-[#9CA3AF]">
                      <div className="h-7 w-7 rounded-lg bg-[#6B7280]/10 flex items-center justify-center shrink-0">
                        <MapPin className="h-3.5 w-3.5 text-[#6B7280]" />
                      </div>
                      {hi ? 'ग्राम पंचायत चंद्रा, शंकरगढ़' : 'GP Chandra, Shankargarh'}
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-[#9CA3AF]">
                      <div className="h-7 w-7 rounded-lg bg-[#6B7280]/10 flex items-center justify-center shrink-0">
                        <Building2 className="h-3.5 w-3.5 text-[#6B7280]" />
                      </div>
                      {hi ? 'विकास खंड शंकरगढ़, जनपद प्रयागराज' : 'Vikas Khand Shankargarh, Prayagraj'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-[#E5E7EB]/40 py-4 px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
                <p className="text-[10px] text-[#B0B0B0]">
                  &copy; {new Date().getFullYear()} {hi ? 'ग्राम पंचायत चंद्रा — सर्वाधिकार सुरक्षित' : 'Gram Panchayat Chandra — All Rights Reserved'}
                </p>
                <p className="text-[10px] text-[#B0B0B0]">
                  {hi ? 'DPDP 2023 अनुपालन • बहुभाषी (हिंदी/अंग्रेजी)' : 'DPDP 2023 Compliant • Bilingual (HI/EN)'}
                </p>
              </div>
            </div>
          </motion.footer>

          {/* Forgot Password Modal */}
          <ForgotPasswordModal
            open={forgotOpen}
            onOpenChange={setForgotOpen}
            defaultEmail={loginEmail}
          />
        </motion.div>
      )}
    </>
  )
}
