'use client'
// PWA Install Prompt — shows an install banner when the app is installable.
// Master doc §5.2 — PWA & offline capability enhancement.
import { useEffect, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { X, Download, Smartphone } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'gpchandra-install-dismissed'
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

export function InstallPrompt() {
  const { locale } = useI18n()
  const isHi = locale === 'hi'
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)
  // Check if already installed (standalone mode) — compute once during render
  const [installed, setInstalled] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(display-mode: standalone)').matches
  })

  useEffect(() => {
    // If already installed, no need to listen for install prompt
    if (installed) return

    // Check if user dismissed recently
    const dismissed = localStorage.getItem(DISMISS_KEY)
    if (dismissed && Date.now() - Number(dismissed) < DISMISS_DURATION) return

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setVisible(true)
    }

    const installedHandler = () => {
      setInstalled(true)
      setVisible(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', installedHandler)
    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', installedHandler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    if (choice.outcome === 'accepted') {
      setInstalled(true)
    }
    setVisible(false)
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setVisible(false)
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
  }

  if (installed || !visible) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-card border border-primary/30 rounded-xl shadow-xl overflow-hidden glow-saffron">
        <div className="h-1 bg-gradient-to-r from-primary via-amber-500 to-green-600" />
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/15 text-primary grid place-items-center shrink-0">
              <Smartphone className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold">
                {isHi ? 'ऐप इंस्टॉल करें' : 'Install App'}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
                {isHi
                  ? 'ग्राम पंचायत चंद्रा पोर्टल को अपने फोन में इंस्टॉल करें — ऑफ़लाइन भी काम करेगा।'
                  : 'Install GP Chandra portal on your phone — works offline too.'}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <Button size="sm" className="h-7 text-xs gap-1 glow-saffron" onClick={handleInstall}>
                  <Download className="h-3 w-3" />
                  {isHi ? 'इंस्टॉल' : 'Install'}
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={handleDismiss}>
                  <X className="h-3 w-3" />
                  {isHi ? 'बाद में' : 'Later'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
