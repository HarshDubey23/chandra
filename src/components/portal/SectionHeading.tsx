'use client'
import { motion, useInView } from 'framer-motion'
import { useRef, type ReactNode } from 'react'
import { ease, dur } from '@/lib/motion/springs'
import { useI18n } from '@/lib/i18n'

interface SectionHeadingProps {
  /** Hindi text (primary) */
  hi: string
  /** English text (accompaniment) */
  en: string
  /** Optional eyebrow label above the heading */
  eyebrowHi?: string
  eyebrowEn?: string
  /** Optional icon */
  icon?: ReactNode
  /** Alignment */
  align?: 'left' | 'center'
  /** Show the tricolor 3-dot divider below */
  showDivider?: boolean
  className?: string
}

/**
 * SectionHeading — kinetic mask-up reveal heading with bilingual hierarchy.
 * Devanagari leads (larger, foreground), English accompanies (smaller, muted).
 * Eyebrow label uses tracking-wide uppercase. GPU-only animation.
 */
export function SectionHeading({
  hi,
  en,
  eyebrowHi,
  eyebrowEn,
  icon,
  align = 'left',
  showDivider = false,
  className = '',
}: SectionHeadingProps) {
  const { locale } = useI18n()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  const alignClass = align === 'center' ? 'text-center items-center' : 'text-left items-start'

  return (
    <div ref={ref} className={`flex flex-col ${alignClass} gap-2 ${className}`}>
      {eyebrowHi && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          transition={{ duration: dur.base, ease: ease.expoOut }}
          className="flex items-center gap-2 text-[var(--text-xs)] font-semibold uppercase tracking-[0.2em] text-primary"
        >
          {icon && <span className="text-primary">{icon}</span>}
          <span>{locale === 'hi' ? eyebrowHi : eyebrowEn}</span>
        </motion.div>
      )}

      {/* Devanagari headline — mask-up reveal, matra-safe */}
      <div className="overflow-hidden" style={{ paddingBlock: '0.1em' }}>
        <motion.h2
          initial={{ y: '110%' }}
          animate={isInView ? { y: 0 } : { y: '110%' }}
          transition={{ duration: dur.cinematic, ease: ease.expoOut }}
          className="font-bold tracking-tight leading-[1.15] text-foreground"
          style={{ fontSize: 'var(--text-4xl)' }}
        >
          {hi}
        </motion.h2>
      </div>

      {/* English accompaniment — smaller, muted */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: dur.slow, ease: ease.expoOut, delay: 0.2 }}
        className="text-muted-foreground font-medium"
        style={{ fontSize: 'var(--text-lg)' }}
      >
        {en}
      </motion.p>

      {showDivider && (
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={isInView ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0 }}
          transition={{ duration: dur.slow, ease: ease.expoOut, delay: 0.3 }}
          className="flex items-center gap-2 mt-2"
          style={{ transformOrigin: align === 'center' ? 'center' : 'left' }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          <span className="h-1.5 w-1.5 rounded-full bg-foreground/40" />
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        </motion.div>
      )}
    </div>
  )
}
