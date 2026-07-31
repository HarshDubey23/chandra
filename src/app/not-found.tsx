'use client'
/**
 * not-found.tsx — 404 page with kinetic micro-interactions (Phase 5)
 */
import { motion } from 'framer-motion'
import { Home, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ease, dur } from '@/lib/motion/springs'

export default function NotFound() {
  return (
    <div
      className="min-h-[100svh] flex items-center justify-center p-6 bg-background text-foreground overflow-hidden relative"
      role="main"
    >
      {/* Decorative mesh background */}
      <div className="mesh-gradient opacity-30" aria-hidden="true" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: dur.slow, ease: ease.expoOut }}
        className="max-w-lg w-full text-center space-y-6 relative z-10"
      >
        {/* 404 — kinetic scale-in */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: dur.cinematic, ease: ease.spring }}
          className="text-[clamp(5rem,15vw,9rem)] font-black leading-none tracking-tighter bg-gradient-to-br from-primary via-primary to-accent bg-clip-text text-transparent"
        >
          404
        </motion.div>

        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            पृष्ठ नहीं मिला
          </h1>
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button
            onClick={() => window.location.href = '/'}
            className="gap-2 h-12 rounded-xl"
          >
            <Home className="h-4 w-4" />
            होम पर जाएं / Go Home
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const event = new KeyboardEvent('keydown', {
                key: 'k',
                ctrlKey: true,
                bubbles: true,
              })
              window.dispatchEvent(event)
            }}
            className="gap-2 h-12 rounded-xl"
          >
            <Search className="h-4 w-4" />
            खोजें / Search
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
