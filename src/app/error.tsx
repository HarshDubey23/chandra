'use client'
/**
 * error.tsx — Route-level error boundary (Phase 5)
 * Kinetic micro-interactions, bilingual, matches the design system.
 * Catches errors thrown in the `/` route's client components.
 */
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RotateCcw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ease, dur } from '@/lib/motion/springs'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to console for dev — in prod this would go to a monitoring service
    console.error('[Chandra Portal Error]', error)
  }, [error])

  return (
    <div
      className="min-h-[100svh] flex items-center justify-center p-6 bg-background text-foreground overflow-hidden"
      role="alert"
      aria-live="assertive"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: dur.slow, ease: ease.expoOut }}
        className="max-w-md w-full text-center space-y-6 relative z-10"
      >
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: dur.slow, ease: ease.spring, delay: 0.1 }}
          className="mx-auto h-20 w-20 rounded-2xl bg-destructive/10 text-destructive grid place-items-center"
        >
          <AlertTriangle className="h-10 w-10" />
        </motion.div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            कुछ गड़बड़ हो गई
          </h1>
          <p className="text-muted-foreground">
            Something went wrong. Please try again.
          </p>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <pre className="text-xs text-left bg-muted/50 rounded-lg p-3 overflow-x-auto border border-border">
            <code>{error.message}</code>
          </pre>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} className="gap-2 h-12 rounded-xl">
            <RotateCcw className="h-4 w-4" />
            पुनः प्रयास करें / Try again
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="gap-2 h-12 rounded-xl"
          >
            <Home className="h-4 w-4" />
            होम पर जाएं / Go home
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
