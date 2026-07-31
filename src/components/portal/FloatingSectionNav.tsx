'use client'
import { useEffect, useState, useRef } from 'react'
import { useI18n } from '@/lib/i18n'
import { motion, AnimatePresence } from 'framer-motion'
import { ease, dur } from '@/lib/motion/springs'
import { Compass, X } from 'lucide-react'

interface SectionInfo {
  id: string
  labelHi: string
  labelEn: string
  emoji: string
}

/**
 * FloatingSectionNav — a scroll-following sidebar navigator.
 *
 * Shows a compact list of all portal sections. Click any to jump to it.
 * Appears on the right side (desktop) after scrolling past the hero.
 * Dismissible via X (sessionStorage-persisted).
 * Collapses to a small compass icon when not hovered; expands on hover.
 *
 * Performance: IntersectionObserver to track active section (no scroll listener).
 */
const SECTIONS: SectionInfo[] = [
  { id: 'hero', labelHi: 'होम', labelEn: 'Home', emoji: '🏠' },
  { id: 'complaint-dashboard', labelHi: 'शिकायत डैशबोर्ड', labelEn: 'Complaints', emoji: '📊' },
  { id: 'activity-feed', labelHi: 'गतिविधि', labelEn: 'Activity', emoji: '⚡' },
  { id: 'about', labelHi: 'परिचय', labelEn: 'About', emoji: 'ℹ️' },
  { id: 'representatives', labelHi: 'पदाधिकारी', labelEn: 'Reps', emoji: '👥' },
  { id: 'schemes', labelHi: 'योजनाएँ', labelEn: 'Schemes', emoji: '📋' },
  { id: 'eligibility', labelHi: 'पात्रता', labelEn: 'Eligibility', emoji: '✅' },
  { id: 'village-stats', labelHi: 'सांख्यिकी', labelEn: 'Stats', emoji: '📈' },
  { id: 'wards', labelHi: 'वार्ड', labelEn: 'Wards', emoji: '🗺️' },
  { id: 'budget', labelHi: 'बजट', labelEn: 'Budget', emoji: '💰' },
  { id: 'education', labelHi: 'शिक्षा', labelEn: 'Education', emoji: '🎓' },
  { id: 'health', labelHi: 'स्वास्थ्य', labelEn: 'Health', emoji: '🏥' },
  { id: 'infrastructure', labelHi: 'आधारभूत', labelEn: 'Infra', emoji: '🏗️' },
  { id: 'marketplace', labelHi: 'बाजार', labelEn: 'Market', emoji: '🛒' },
  { id: 'grievance', labelHi: 'शिकायत निवारण', labelEn: 'Grievance', emoji: '⚖️' },
  { id: 'gram-sabha', labelHi: 'ग्राम सभा', labelEn: 'Gram Sabha', emoji: '🏛️' },
  { id: 'polls', labelHi: 'मतदान', labelEn: 'Polls', emoji: '🗳️' },
  { id: 'gallery', labelHi: 'गैलरी', labelEn: 'Gallery', emoji: '📸' },
  { id: 'videos', labelHi: 'वीडियो', labelEn: 'Videos', emoji: '🎥' },
  { id: 'announcements', labelHi: 'सूचनाएँ', labelEn: 'Notices', emoji: '📢' },
  { id: 'blog', labelHi: 'ब्लॉग', labelEn: 'Blog', emoji: '📰' },
  { id: 'faq', labelHi: 'सहायता', labelEn: 'Help', emoji: '❓' },
  { id: 'contact-us', labelHi: 'संपर्क', labelEn: 'Contact', emoji: '📞' },
]

export function FloatingSectionNav() {
  const { locale } = useI18n()
  const hi = locale === 'hi'
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (sessionStorage.getItem('section-nav-dismissed') === '1') {
      queueMicrotask(() => setDismissed(true))
      return
    }
    // Only show on desktop (right sidebar would clutter mobile)
    if (!window.matchMedia('(min-width: 1024px)').matches) return

    // Show after scrolling past 600px
    const onScroll = () => {
      setVisible(window.scrollY > 600)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    // IntersectionObserver to track active section
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        }
      },
      { rootMargin: '-30% 0px -60% 0px' }
    )
    // Observe all sections that exist
    SECTIONS.forEach(s => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })

    return () => {
      window.removeEventListener('scroll', onScroll)
      observer.disconnect()
    }
  }, [])

  const dismiss = () => {
    setDismissed(true)
    sessionStorage.setItem('section-nav-dismissed', '1')
  }

  const jumpTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setHovered(false)
    }
  }

  if (dismissed) return null

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 40 }}
          transition={{ duration: dur.base, ease: ease.expoOut }}
          className="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden lg:block"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <div className="glass-strong rounded-2xl border border-border/50 shadow-lg overflow-hidden">
            {/* Header — always visible */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-border/30">
              <div className="flex items-center gap-1.5">
                <Compass className="h-3.5 w-3.5 text-primary" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground">
                  {hi ? 'खोजें' : 'Navigate'}
                </span>
              </div>
              <button
                onClick={dismiss}
                className="text-muted-foreground hover:text-foreground transition-colors rounded p-0.5"
                aria-label={hi ? 'बंद करें' : 'Dismiss'}
              >
                <X className="h-3 w-3" />
              </button>
            </div>

            {/* Section list — compact dots when collapsed, full list when hovered */}
            <div className="p-2">
              {hovered ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col gap-0.5 max-h-[60vh] overflow-y-auto custom-scroll"
                >
                  {SECTIONS.map(s => {
                    const active = activeSection === s.id
                    return (
                      <button
                        key={s.id}
                        onClick={() => jumpTo(s.id)}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all duration-200 text-left ${
                          active
                            ? 'bg-primary/10 text-primary font-semibold'
                            : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                        }`}
                      >
                        <span className="text-sm">{s.emoji}</span>
                        <span className="truncate">{hi ? s.labelHi : s.labelEn}</span>
                        {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                      </button>
                    )
                  })}
                </motion.div>
              ) : (
                /* Collapsed: vertical dots, active one highlighted */
                <div className="flex flex-col gap-1.5 py-1 px-1">
                  {SECTIONS.slice(0, 12).map(s => {
                    const active = activeSection === s.id
                    return (
                      <button
                        key={s.id}
                        onClick={() => jumpTo(s.id)}
                        className={`rounded-full transition-all duration-200 ${
                          active
                            ? 'h-2 w-2 bg-primary mx-auto'
                            : 'h-1.5 w-1.5 bg-muted-foreground/40 hover:bg-foreground/60 mx-auto'
                        }`}
                        title={hi ? s.labelHi : s.labelEn}
                        aria-label={hi ? s.labelHi : s.labelEn}
                      />
                    )
                  })}
                  <span className="text-[8px] text-muted-foreground/60 text-center mt-1">↤ hover</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
