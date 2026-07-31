'use client'
import { useEffect, useState } from 'react'

/**
 * ScrollProgress — a thin saffron→emerald gradient bar fixed at the top of the
 * viewport showing reading progress through the page. Sits just below the
 * sticky header (top-16) so it doesn't overlap the nav.
 *
 * PERFORMANCE: uses requestAnimationFrame to throttle scroll updates (no raw
 * scroll listener churn). Width animated via transform scaleX (GPU-only) with
 * design-system expo-out easing.
 */
export function ScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let rafId = 0
    let ticking = false

    const update = () => {
      ticking = false
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      setProgress(Math.min(100, Math.max(0, pct)))
    }

    const onScroll = () => {
      if (!ticking) {
        rafId = requestAnimationFrame(update)
        ticking = true
      }
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div
      className="fixed top-16 left-0 right-0 z-40 h-[2px] bg-transparent pointer-events-none"
      aria-hidden="true"
    >
      <div
        className="h-full origin-left bg-gradient-to-r from-primary via-amber-500 to-accent"
        style={{
          transform: `scaleX(${progress / 100})`,
          transition: 'transform 80ms linear',
          boxShadow: progress > 5 ? '0 0 8px var(--saffron-glow)' : 'none',
        }}
      />
    </div>
  )
}
