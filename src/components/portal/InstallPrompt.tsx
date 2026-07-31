'use client'
// PWA Install Prompt — shows install banner immediately on mobile.
// Also shows manual install instructions for iOS (which doesn't support beforeinstallprompt).
import { useEffect, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { X, Download, Smartphone, Share } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'gpchandra-install-dismissed'
const DISMISS_DURATION = 3 * 24 * 60 * 60 * 1000 // 3 days (show more often)

export function InstallPrompt() {
  const { locale } = useI18n()
  const isHi = locale === 'hi'
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [installed, setInstalled] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(display-mode: standalone)').matches
  })

  useEffect(() => {
    if (installed) return

    // Detect iOS (no beforeinstallprompt support — need manual instructions)
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    queueMicrotask(() => setIsIOS(iOS))

    // Check if user dismissed recently
    const dismissed = localStorage.getItem(DISMISS_KEY)
    if (dismissed && Date.now() - Number(dismissed) < DISMISS_DURATION) return

    // For iOS — show after 5 seconds (since beforeinstallprompt never fires)
    if (iOS) {
      const timer = setTimeout(() => setVisible(true), 5000)
      return () => clearTimeout(timer)
    }

    // For Android/Chrome — listen for beforeinstallprompt
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
  }, [installed])

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
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-[60] animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-card border border-primary/40 rounded-2xl shadow-2xl overflow-hidden glow-saffron">
        <div className="h-1.5 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />
        <div className="p-5">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground grid place-items-center shrink-0 shadow-lg">
              <Smartphone className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-foreground">
                {isHi ? '📱 ऐप डाउनलोड करें' : '📱 Download App'}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 leading-snug">
                {isHi
                  ? 'ग्राम पंचायत चंद्रा पोर्टल को अपने फोन में इंस्टॉल करें। Play Store की ज़रूरत नहीं — सीधे होम स्क्रीन पर।'
                  : 'Install GP Chandra portal on your phone. No Play Store needed — directly on home screen.'}
              </p>

              {isIOS ? (
                // iOS instructions — no native install prompt
                <div className="mt-3 space-y-2">
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-xs text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">{isHi ? 'कैसे इंस्टॉल करें:' : 'How to install:'}</p>
                    <ol className="space-y-1 list-decimal list-inside">
                      <li>{isHi ? 'नीचे दिए Share बटन (⬆️) पर टैप करें' : 'Tap the Share button (⬆️) below'}</li>
                      <li>{isHi ? '"Add to Home Screen" चुनें' : 'Select "Add to Home Screen"'}</li>
                      <li>{isHi ? '"Add" पर टैप करें — हो गया!' : 'Tap "Add" — done!'}</li>
                    </ol>
                  </div>
                  <Button size="sm" variant="ghost" className="h-8 text-xs gap-1" onClick={handleDismiss}>
                    <X className="h-3 w-3" />
                    {isHi ? 'बाद में' : 'Later'}
                  </Button>
                </div>
              ) : (
                // Android/Chrome — native install prompt
                <div className="flex items-center gap-2 mt-3">
                  <Button size="sm" className="h-9 text-xs gap-1.5 glow-saffron" onClick={handleInstall}>
                    <Download className="h-4 w-4" />
                    {isHi ? 'इंस्टॉल करें' : 'Install Now'}
                  </Button>
                  <Button size="sm" variant="ghost" className="h-9 text-xs gap-1" onClick={handleDismiss}>
                    <X className="h-3.5 w-3.5" />
                    {isHi ? 'बाद में' : 'Later'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
