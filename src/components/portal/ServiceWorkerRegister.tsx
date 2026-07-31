'use client'

import { useEffect, useState } from 'react'

/**
 * Registers the PWA service worker on the client.
 * Renders a subtle toast/banner when an update is available.
 */
export function ServiceWorkerRegister() {
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return
    if (process.env.NODE_ENV !== 'production' && window.location.hostname === 'localhost') {
      // Still register in dev to test, but log so it's visible
      // Production-grade behavior would skip dev — we keep it for QA.
    }

    let registering: Promise<ServiceWorkerRegistration> | null = null
    try {
      registering = navigator.serviceWorker.register('/sw.js', { scope: '/' })
    } catch {
      return
    }

    if (!registering) return

    registering
      .then((reg) => {
        // Check for updates every 60 minutes
        setInterval(() => reg.update().catch(() => {}), 60 * 60 * 1000)

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          if (!newWorker) return
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true)
            }
          })
        })
      })
      .catch(() => {
        // Silent fail — service worker is a progressive enhancement
      })
  }, [])

  useEffect(() => {
    if (!updateAvailable) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      window.location.reload()
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [updateAvailable])

  if (!updateAvailable) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] bg-primary text-primary-foreground shadow-lg rounded-full px-4 py-2 text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2"
    >
      <span className="h-2 w-2 rounded-full bg-primary-foreground/80 animate-pulse" aria-hidden="true" />
      A new version is available. Reload to update.
    </div>
  )
}
