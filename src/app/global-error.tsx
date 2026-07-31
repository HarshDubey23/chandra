'use client'
/**
 * global-error.tsx — catches errors in the root layout itself (Phase 5).
 * Must render its own <html> + <body> since the root layout is bypassed.
 */
import { motion } from 'framer-motion'
import { AlertOctagon, RotateCcw } from 'lucide-react'
import { ease, dur } from '@/lib/motion/springs'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="hi">
      <body
        style={{
          margin: 0,
          minHeight: '100svh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          background: 'oklch(0.05 0 0)',
          color: 'oklch(0.96 0.005 80)',
          fontFamily: 'system-ui, sans-serif',
          overflow: 'hidden',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: dur.slow, ease: ease.expoOut }}
          style={{ maxWidth: '28rem', textAlign: 'center' }}
        >
          <motion.div
            initial={{ rotate: -15, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ duration: dur.slow, ease: ease.spring, delay: 0.1 }}
            style={{
              margin: '0 auto 1.5rem',
              width: '5rem',
              height: '5rem',
              borderRadius: '1rem',
              background: 'oklch(0.65 0.22 25 / 0.15)',
              color: 'oklch(0.65 0.22 25)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <AlertOctagon size={40} />
          </motion.div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            गंभीर त्रुटि
          </h1>
          <p style={{ color: 'oklch(0.68 0.012 80)', marginBottom: '1.5rem' }}>
            A critical error occurred. The application shell needs to reload.
          </p>
          <button
            onClick={reset}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              height: '3rem',
              padding: '0 1.5rem',
              borderRadius: '0.75rem',
              border: 'none',
              background: 'oklch(0.75 0.16 60)',
              color: 'oklch(0.10 0.02 60)',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={16} />
            पुनः लोड करें / Reload
          </button>
        </motion.div>
      </body>
    </html>
  )
}
