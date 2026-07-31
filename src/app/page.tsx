'use client'
import { useEffect } from 'react'
import { Header } from '@/components/portal/Header'
import { TopBar } from '@/components/portal/TopBar'
import { AnnouncementTicker } from '@/components/portal/AnnouncementTicker'
import { Footer } from '@/components/portal/Footer'
import { PublicPortal } from '@/components/portal/PublicPortal'
import { ComplaintTracking } from '@/components/portal/ComplaintTracking'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { ScrollProgress } from '@/components/portal/ScrollProgress'
import { BackToTop } from '@/components/portal/BackToTop'
import { AIVoiceButton } from '@/components/portal/AIVoiceButton'
import { SimulateCallPanel } from '@/components/portal/SimulateCallPanel'
import { EmergencyQuickDial } from '@/components/portal/EmergencyQuickDial'
import { QuickStats } from '@/components/portal/QuickStats'
import { ServiceWorkerRegister } from '@/components/portal/ServiceWorkerRegister'
import { InstallPrompt } from '@/components/portal/InstallPrompt'
import { LivePortalStats } from '@/components/portal/LivePortalStats'
import { LandingPage } from '@/components/auth/LandingPage'
import { CitizenDashboard } from '@/components/auth/CitizenDashboard'
import { useUI } from '@/lib/ui-store'
import { useI18n } from '@/lib/i18n'
import { useAuth } from '@/lib/auth-store'

export default function Home() {
  const { view, setView } = useUI()
  const { locale } = useI18n()
  const { isAuthenticated, isGuest, user, checkSession } = useAuth()

  // keep <html lang> attribute in sync with locale for screen readers + CSS :lang()
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  // Check existing session on mount
  useEffect(() => {
    checkSession()
  }, [checkSession])

  // Show landing page if not authenticated and not in guest mode
  const showPortal = isAuthenticated || isGuest

  // Scroll to top instantly when transitioning from landing → portal (login/guest)
  // Prevents the portal from opening mid-scroll wherever the user was on the landing page
  useEffect(() => {
    if (showPortal) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
    }
  }, [showPortal])

  if (!showPortal) {
    return <LandingPage />
  }

  // Determine which view to show
  // - If authenticated and view is 'home' or 'dashboard', show dashboard for citizens
  // - Admin/secretary users see the full portal
  const showDashboard = isAuthenticated && user?.role === 'viewer' && (view === 'home' || view === 'dashboard')

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main-content" className="skip-link">
        {locale === 'hi' ? 'मुख्य सामग्री पर जाएं' : 'Skip to main content'}
      </a>
      <TopBar />
      <Header />
      {view === 'home' && <AnnouncementTicker />}
      <ScrollProgress />
      <main id="main-content" className="flex-1">
        {showDashboard ? (
          <CitizenDashboard />
        ) : (
          <>
            {view === 'home' && <PublicPortal />}
            {view === 'complaints' && <ComplaintTracking />}
            {view === 'admin' && <AdminPanel />}
            {view === 'dashboard' && <CitizenDashboard />}
          </>
        )}
      </main>
      <Footer />
      <BackToTop />
      {view !== 'admin' && <AIVoiceButton />}
      {view !== 'admin' && <SimulateCallPanel />}
      {view !== 'admin' && <EmergencyQuickDial />}
      {view === 'home' && !showDashboard && <QuickStats />}
      <ServiceWorkerRegister />
      <InstallPrompt />
      {view === 'home' && !showDashboard && <LivePortalStats />}
    </div>
  )
}
