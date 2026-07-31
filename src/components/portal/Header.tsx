'use client'
import { useState, useEffect } from 'react'
import { useI18n } from '@/lib/i18n'
import { useUI } from '@/lib/ui-store'
import { LanguageSwitcher } from './LanguageSwitcher'
import { DarkModeToggle } from './DarkModeToggle'
import { ExportReport } from './ExportReport'
import { GlobalSearch } from './GlobalSearch'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetHeader,
} from '@/components/ui/sheet'
import { Menu, Shield, Phone, Mic, Home, Building2, Droplets, Image, MessageSquare, BookOpen, Globe, Users, CloudSun, HelpCircle, IndianRupee, Landmark, Scale, GraduationCap, HeartPulse, Calendar, ChevronDown, MoreHorizontal, Flag, ClipboardCheck, FileCheck, FileText, Store, Video, Search, Sparkles, LogOut, User, LayoutDashboard } from 'lucide-react'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { startVapiCall } from '@/lib/vapi'
import { useAuth } from '@/lib/auth-store'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'

export function Header() {
  const { locale } = useI18n()
  const { view, setView, setScrollTarget } = useUI()
  const { isAuthenticated, isGuest, user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Keyboard shortcut: Ctrl+K / Cmd+K to open global search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const navItems = [
    { key: 'home', labelHi: 'मुख्य', labelEn: 'Home', icon: Home, view: 'home' as const, scroll: 'hero' },
    { key: 'about', labelHi: 'परिचय', labelEn: 'About', icon: Building2, view: 'home' as const, scroll: 'about' },
    { key: 'schemes', labelHi: 'योजनाएँ', labelEn: 'Schemes', icon: BookOpen, view: 'home' as const, scroll: 'schemes' },
    { key: 'wards', labelHi: 'वार्ड', labelEn: 'Wards', icon: Users, view: 'home' as const, scroll: 'wards' },
    { key: 'budget', labelHi: 'बजट', labelEn: 'Budget', icon: IndianRupee, view: 'home' as const, scroll: 'budget' },
    { key: 'complaints', labelHi: 'शिकायत', labelEn: 'Complaint', icon: MessageSquare, view: 'complaints' as const, scroll: null },
  ]

  // Secondary nav items — shown in "More" dropdown to keep desktop nav clean
  const secondaryNavItems = [
    { key: 'representatives', labelHi: 'पदाधिकारी', labelEn: 'Reps', icon: Landmark, view: 'home' as const, scroll: 'representatives' },
    { key: 'education', labelHi: 'शिक्षा', labelEn: 'Education', icon: GraduationCap, view: 'home' as const, scroll: 'education' },
    { key: 'shg', labelHi: 'समूह', labelEn: 'Groups', icon: Users, view: 'home' as const, scroll: 'shg' },
    { key: 'health', labelHi: 'स्वास्थ्य', labelEn: 'Health', icon: HeartPulse, view: 'home' as const, scroll: 'health' },
    { key: 'weather', labelHi: 'मौसम', labelEn: 'Weather', icon: CloudSun, view: 'home' as const, scroll: 'weather-agri' },
    { key: 'marketplace', labelHi: 'बाजार', labelEn: 'Market', icon: Store, view: 'home' as const, scroll: 'marketplace' },
    { key: 'grievance', labelHi: 'शिकायत निवारण', labelEn: 'Grievance', icon: Scale, view: 'home' as const, scroll: 'grievance' },
    { key: 'events', labelHi: 'कार्यक्रम', labelEn: 'Events', icon: Calendar, view: 'home' as const, scroll: 'events' },
    { key: 'gram-sabha', labelHi: 'ग्राम सभा', labelEn: 'Gram Sabha', icon: Landmark, view: 'home' as const, scroll: 'gram-sabha' },
    { key: 'rti', labelHi: 'सूचना अधिकार', labelEn: 'RTI', icon: Scale, view: 'home' as const, scroll: 'rti' },
    { key: 'documents', labelHi: 'दस्तावेज़', labelEn: 'Documents', icon: FileCheck, view: 'home' as const, scroll: 'documents' },
    { key: 'downloads', labelHi: 'फॉर्म डाउनलोड', labelEn: 'Forms', icon: FileText, view: 'home' as const, scroll: 'downloads' },
    { key: 'success-stories', labelHi: 'सफलता की कहानियाँ', labelEn: 'Stories', icon: Sparkles, view: 'home' as const, scroll: 'success-stories' },
    { key: 'faq', labelHi: 'सहायता', labelEn: 'Help', icon: HelpCircle, view: 'home' as const, scroll: 'faq' },
    { key: 'infrastructure', labelHi: 'आधारभूत', labelEn: 'Infra', icon: Droplets, view: 'home' as const, scroll: 'infrastructure' },
    { key: 'gallery', labelHi: 'गैलरी', labelEn: 'Gallery', icon: Image, view: 'home' as const, scroll: 'gallery' },
    { key: 'videos', labelHi: 'वीडियो', labelEn: 'Videos', icon: Video, view: 'home' as const, scroll: 'videos' },
    { key: 'eligibility', labelHi: 'पात्रता', labelEn: 'Eligibility', icon: ClipboardCheck, view: 'home' as const, scroll: 'eligibility' },
  ]

  const handleNav = (item: typeof navItems[number]) => {
    setView(item.view)
    if (item.scroll) {
      setTimeout(() => {
        const el = document.getElementById(item.scroll!)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
    setMobileOpen(false)
  }

  // Determine if a nav item is active
  const isActive = (item: typeof navItems[number]) => {
    if (item.view === 'complaints') return view === 'complaints'
    return view === item.view
  }

  return (
    <>
      {/* Tricolor accent strip — 3px with animation */}
      <div className="tricolor-bar h-[3px] w-full" style={{ backgroundSize: '200% 100%', animation: 'tricolor-shift 8s ease-in-out infinite' }} />

      <header
        className={cn(
          'sticky top-0 z-50 w-full transition-all duration-300 ease-out',
          scrolled
            ? 'bg-background/98 shadow-lg shadow-primary/[0.06] backdrop-blur-xl border-b border-border/40'
            : 'bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 border-b border-border/30'
        )}
      >
        <div className="container mx-auto flex h-[68px] items-center justify-between px-4 gap-4">

          {/* ── Logo + Title ── */}
          <button
            onClick={() => handleNav(navItems[0])}
            className="flex items-center gap-3 text-left group shrink-0"
          >
            {/* Circular emblem-style logo */}
            <div className="relative h-11 w-11 rounded-full bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-primary-foreground grid place-items-center shadow-lg shadow-primary/20 group-hover:shadow-primary/30 transition-all duration-300 group-hover:scale-[1.06] ring-2 ring-primary/10 group-hover:ring-primary/20">
              <span className="text-sm font-bold avatar-initials leading-none">ग्रा</span>
              {/* Subtle green dot indicator */}
              <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-green-600 border-[2.5px] border-background shadow-sm" />
              {/* Tricolor ring */}
              <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/20" />
            </div>
            <div className="hidden sm:block leading-tight">
              <div className="text-[15px] font-bold text-foreground tracking-tight group-hover:text-primary transition-colors duration-200">
                {locale === 'hi' ? 'ग्राम पंचायत चंद्रा' : 'Gram Panchayat Chandra'}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-[0.15em] font-medium mt-0.5">
                {locale === 'hi' ? 'शंकरगढ़ • प्रयागराज • उ.प्र.' : 'Shankargarh • Prayagraj • UP'}
              </div>
            </div>
          </button>

          {/* ── Desktop Navigation ── */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item)
              return (
                <button
                  key={item.key}
                  onClick={() => handleNav(item)}
                  className={cn(
                    'relative flex items-center gap-2 h-9 px-3.5 rounded-lg text-[13px] font-medium transition-all duration-200',
                    active
                      ? 'text-primary bg-primary/8'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                  )}
                >
                  <Icon className={cn('h-[15px] w-[15px]', active ? 'text-primary' : 'text-muted-foreground/70')} />
                  <span>{locale === 'hi' ? item.labelHi : item.labelEn}</span>
                  {/* Active underline indicator */}
                  {active && (
                    <span className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-gradient-to-r from-primary via-primary/80 to-green-600" />
                  )}
                </button>
              )
            })}

            {/* "More" dropdown for secondary nav items */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative flex items-center gap-1.5 h-9 px-3 rounded-lg text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all duration-200">
                  <MoreHorizontal className="h-[15px] w-[15px]" />
                  <span>{locale === 'hi' ? 'अधिक' : 'More'}</span>
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-1.5">
                <DropdownMenuLabel className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold px-2 py-1.5">
                  {locale === 'hi' ? 'सभी अनुभाग / All Sections' : 'All Sections'}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1" />
                <div className="grid grid-cols-2 gap-0.5 max-h-[320px] overflow-y-auto custom-scroll">
                  {secondaryNavItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <DropdownMenuItem
                        key={item.key}
                        onClick={() => handleNav(item)}
                        className="gap-2 cursor-pointer rounded-md px-2 py-2 text-[12px] transition-colors"
                      >
                        <Icon className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                        <span className="truncate">{locale === 'hi' ? item.labelHi : item.labelEn}</span>
                      </DropdownMenuItem>
                    )
                  })}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* ── Right Actions ── */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Search button */}
            <Button
              variant="outline"
              size="sm"
              className={cn(
                'gap-1.5 h-9 text-xs transition-all duration-200 rounded-lg',
                'border-border/60 hover:border-primary/40 hover:bg-primary/5',
                'shadow-sm hover:shadow-md'
              )}
              onClick={() => setSearchOpen(true)}
              aria-label={locale === 'hi' ? 'खोजें' : 'Search'}
              title={locale === 'hi' ? 'खोजें (Ctrl+K)' : 'Search (Ctrl+K)'}
            >
              <Search className="h-3.5 w-3.5 text-primary/70" />
              <span className="hidden xl:inline">{locale === 'hi' ? 'खोजें' : 'Search'}</span>
              <kbd className="hidden xl:inline text-[9px] text-muted-foreground/70 border border-border/50 rounded px-1.5 py-0.5 ml-1 font-mono">⌘K</kbd>
            </Button>

            {/* Export Report */}
            <ExportReport />

            {/* AI Assistant button */}
            <Button
              variant="outline"
              size="sm"
              className={cn(
                'hidden md:flex gap-1.5 h-9 text-xs transition-all duration-200 rounded-lg',
                'border-primary/25 hover:border-primary/45 hover:bg-primary/5',
                'shadow-sm hover:shadow-md',
                'group'
              )}
              onClick={() => startVapiCall()}
            >
              <Mic className="h-3.5 w-3.5 text-primary/70 group-hover:text-primary transition-colors" />
              <span>{locale === 'hi' ? 'AI सहायक' : 'AI Assistant'}</span>
            </Button>

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Dark Mode Toggle */}
            <DarkModeToggle />

            {/* Global Search Dialog */}
            <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />

            {/* Auth status — show user info + logout */}
            {isAuthenticated && user ? (
              <div className="hidden sm:flex items-center gap-1.5">
                {/* Dashboard button for citizens */}
                {user.role === 'viewer' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 h-9 text-xs rounded-lg hover:bg-secondary/60 transition-all duration-200"
                    onClick={() => setView('dashboard')}
                  >
                    <LayoutDashboard className="h-3.5 w-3.5" />
                    {locale === 'hi' ? 'डैशबोर्ड' : 'Dashboard'}
                  </Button>
                )}
                <button
                  onClick={() => setView(user.role === 'viewer' ? 'dashboard' : 'home')}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <Badge variant="outline" className="text-[10px] h-7 gap-1.5 border-primary/25 bg-primary/5 text-primary rounded-full px-2.5 font-medium">
                    <User className="h-3 w-3" />
                    <span className="max-w-[80px] truncate">{user.name}</span>
                  </Badge>
                </button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 h-9 text-xs text-muted-foreground hover:text-destructive rounded-lg transition-colors duration-200"
                  onClick={async () => { await logout() }}
                >
                  <LogOut className="h-3.5 w-3.5" />
                  {locale === 'hi' ? 'लॉग आउट' : 'Logout'}
                </Button>
              </div>
            ) : isGuest ? (
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex gap-1.5 h-9 text-xs rounded-lg border-primary/25 hover:border-primary/45 hover:bg-primary/5 transition-all duration-200"
                onClick={async () => { await logout() }}
              >
                <LogOut className="h-3.5 w-3.5" />
                {locale === 'hi' ? 'लॉग इन करें' : 'Login'}
              </Button>
            ) : null}
            {(isAuthenticated && user?.role === 'admin') && (
              <Button
                variant="default"
                size="sm"
                className="hidden sm:flex gap-1.5 h-9 shadow-sm hover:shadow-md rounded-lg transition-all duration-200"
                onClick={() => setView('admin')}
              >
                <Shield className="h-3.5 w-3.5" />
                {locale === 'hi' ? 'व्यवस्थापक' : 'Admin'}
              </Button>
            )}

            {/* Mobile menu trigger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="lg:hidden h-9 w-9 rounded-lg border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 shadow-sm"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[320px] sm:w-[380px] p-0">
                <SheetHeader className="sr-only">
                  <VisuallyHidden>
                    <SheetTitle>Navigation</SheetTitle>
                  </VisuallyHidden>
                </SheetHeader>

                {/* Mobile menu content */}
                <div className="flex flex-col h-full">
                  {/* Mobile header with emblem */}
                  <div className="px-5 pt-6 pb-4 border-b border-border/40">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 rounded-full bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-primary-foreground grid place-items-center shadow-lg shadow-primary/20 ring-2 ring-primary/10">
                        <span className="text-sm font-bold avatar-initials leading-none">ग्रा</span>
                        <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-green-600 border-[2.5px] border-background shadow-sm" />
                      </div>
                      <div>
                        <div className="text-[15px] font-bold text-foreground">
                          {locale === 'hi' ? 'ग्राम पंचायत चंद्रा' : 'Gram Panchayat Chandra'}
                        </div>
                        <div className="text-[11px] text-muted-foreground font-medium">
                          {locale === 'hi' ? 'डिजिटल शासन पोर्टल' : 'Digital Governance Portal'}
                        </div>
                      </div>
                    </div>
                    {/* Tricolor accent line */}
                    <div className="mt-4 h-[2px] rounded-full bg-gradient-to-r from-primary via-primary/40 to-green-600" />
                  </div>

                  {/* Primary nav items */}
                  <div className="flex-1 overflow-y-auto custom-scroll">
                    <div className="px-3 py-3 space-y-0.5">
                      {navItems.map((item) => {
                        const Icon = item.icon
                        const active = isActive(item)
                        return (
                          <button
                            key={item.key}
                            onClick={() => handleNav(item)}
                            className={cn(
                              'w-full flex items-center gap-3 h-11 px-3 rounded-lg text-sm font-medium transition-all duration-200',
                              active
                                ? 'text-primary bg-primary/8'
                                : 'text-foreground hover:bg-secondary/60'
                            )}
                          >
                            <Icon className={cn('h-4 w-4', active ? 'text-primary' : 'text-muted-foreground')} />
                            <span>{locale === 'hi' ? item.labelHi : item.labelEn}</span>
                            {active && (
                              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                            )}
                          </button>
                        )
                      })}
                    </div>

                    {/* Secondary nav section */}
                    <div className="px-5 py-2">
                      <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">
                        {locale === 'hi' ? 'सभी अनुभाग / All Sections' : 'All Sections'}
                      </div>
                    </div>
                    <div className="px-3 pb-3 grid grid-cols-2 gap-0.5">
                      {secondaryNavItems.map((item) => {
                        const Icon = item.icon
                        return (
                          <button
                            key={item.key}
                            onClick={() => handleNav(item)}
                            className="flex items-center gap-2 h-9 px-2.5 rounded-md text-[12px] text-foreground hover:bg-secondary/60 transition-all duration-200"
                          >
                            <Icon className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                            <span className="truncate">{locale === 'hi' ? item.labelHi : item.labelEn}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Mobile footer actions */}
                  <div className="border-t border-border/40 px-3 py-3 space-y-1">
                    {(isAuthenticated && user?.role === 'admin') && (
                      <button
                        className="w-full flex items-center gap-3 h-11 px-3 rounded-lg text-sm font-medium text-foreground hover:bg-secondary/60 transition-all duration-200"
                        onClick={() => { setView('admin'); setMobileOpen(false) }}
                      >
                        <Shield className="h-4 w-4 text-primary" />
                        {locale === 'hi' ? 'व्यवस्थापक पैनल' : 'Admin Panel'}
                      </button>
                    )}
                    {(isAuthenticated && user?.role === 'viewer') && (
                      <button
                        className="w-full flex items-center gap-3 h-11 px-3 rounded-lg text-sm font-medium text-foreground hover:bg-secondary/60 transition-all duration-200"
                        onClick={() => { setView('dashboard'); setMobileOpen(false) }}
                      >
                        <LayoutDashboard className="h-4 w-4 text-primary" />
                        {locale === 'hi' ? 'मेरा डैशबोर्ड' : 'My Dashboard'}
                      </button>
                    )}
                    <button
                      className="w-full flex items-center gap-3 h-11 px-3 rounded-lg text-sm font-medium text-foreground hover:bg-secondary/60 transition-all duration-200"
                      onClick={() => { startVapiCall(); setMobileOpen(false) }}
                    >
                      <Mic className="h-4 w-4 text-primary" />
                      <span>{locale === 'hi' ? 'AI सहायक से बात करें' : 'Talk to AI'}</span>
                    </button>
                    <button
                      className="w-full flex items-center gap-3 h-11 px-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all duration-200"
                      onClick={async () => { await logout(); setMobileOpen(false) }}
                    >
                      <LogOut className="h-4 w-4" />
                      {isAuthenticated
                        ? (locale === 'hi' ? 'लॉग आउट' : 'Logout')
                        : (locale === 'hi' ? 'लॉग इन करें' : 'Login')}
                    </button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  )
}
