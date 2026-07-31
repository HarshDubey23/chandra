'use client'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { ease, dur } from '@/lib/motion/springs'

interface KineticDividerProps {
  /** 'dots' = 3-dot tricolor, 'line' = gradient hairline, 'orb' = centered orb */
  variant?: 'dots' | 'line' | 'orb'
  className?: string
}

/**
 * KineticDivider — animated section divider with GPU-only motion.
 * - 'dots': 3 tricolor dots that scale-in sequentially
 * - 'line': gradient hairline that draws left-to-right
 * - 'orb': single saffron orb with heartbeat glow
 */
export function KineticDivider({ variant = 'dots', className = '' }: KineticDividerProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-30px' })

  if (variant === 'line') {
    return (
      <div ref={ref} className={`flex justify-center py-[var(--space-xl)] ${className}`}>
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={isInView ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
          transition={{ duration: dur.slow, ease: ease.expoOut }}
          className="h-px w-full max-w-md"
          style={{
            background: 'linear-gradient(90deg, transparent, var(--border) 20%, var(--border) 80%, transparent)',
            transformOrigin: 'center',
          }}
        />
      </div>
    )
  }

  if (variant === 'orb') {
    return (
      <div ref={ref} className={`flex justify-center py-[var(--space-xl)] ${className}`}>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
          transition={{ duration: dur.slow, ease: ease.spring }}
          className="relative h-3 w-3 rounded-full bg-primary"
          style={{ boxShadow: '0 0 24px var(--saffron-glow)' }}
        >
          <motion.span
            className="absolute inset-0 rounded-full bg-primary"
            animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: ease.expoInOut }}
          />
        </motion.div>
      </div>
    )
  }

  // 'dots' — 3-dot tricolor
  const dots = [
    { color: 'var(--primary)', delay: 0 },
    { color: 'var(--foreground)', delay: 0.08, muted: true },
    { color: 'var(--accent)', delay: 0.16 },
  ]
  return (
    <div ref={ref} className={`flex justify-center items-center gap-[var(--space-sm)] py-[var(--space-xl)] ${className}`}>
      {dots.map((d, i) => (
        <motion.span
          key={i}
          initial={{ scale: 0, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
          transition={{ duration: dur.base, ease: ease.spring, delay: d.delay }}
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: d.color, opacity: d.muted ? 0.4 : 0.8 }}
        />
      ))}
    </div>
  )
}
