'use client'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { ease, dur } from '@/lib/motion/springs'

interface ScrollRevealProps {
  children: React.ReactNode
  delay?: number
  className?: string
  /** Direction of the reveal. Default 'up'. */
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade'
  /** Stagger children instead of revealing as a block. */
  stagger?: boolean
}

/**
 * ScrollReveal — IntersectionObserver-backed reveal wrapper.
 * Uses GPU-only properties (transform, opacity). Custom expo-out easing.
 * `once: true` — reveals only the first time it enters viewport.
 */
export function ScrollReveal({
  children,
  delay = 0,
  className,
  direction = 'up',
  stagger = false,
}: ScrollRevealProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  const offset = 24
  const initial =
    direction === 'up' ? { opacity: 0, y: offset } :
    direction === 'down' ? { opacity: 0, y: -offset } :
    direction === 'left' ? { opacity: 0, x: -offset } :
    direction === 'right' ? { opacity: 0, x: offset } :
    { opacity: 0 }

  if (stagger) {
    return (
      <motion.div
        ref={ref}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.08, delayChildren: delay } },
        }}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className={className}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : initial}
      transition={{ duration: dur.slow, ease: ease.expoOut, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
