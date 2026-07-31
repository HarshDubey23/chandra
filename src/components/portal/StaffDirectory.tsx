'use client'
import { useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  Phone,
  Search,
  Landmark,
  GraduationCap,
  HeartPulse,
  Trash2,
  ShieldAlert,
  User,
  Briefcase,
  Mail,
  ShieldCheck,
  MapPin,
  Award,
} from 'lucide-react'
import { ScrollReveal } from './ScrollReveal'
import { STAFF as SHARED_STAFF, type StaffCategory } from '@/data/panchayat'

/* ──────────────────────────────────────────────────────────────────────
   Staff Directory — Gram Panchayat Chandra
   Premium searchable/filterable grid of all 12+ panchayat officials and staff.
   Category filter tabs: All / Official / Health / Education / Sanitation / Emergency.
   ────────────────────────────────────────────────────────────────────── */

type CategoryKey = StaffCategory

interface StaffMember {
  id: number
  nameHi: string
  nameEn: string
  designationHi: string
  designationEn: string
  phone?: string
  category: CategoryKey
  initialsHi: string
  initialsEn: string
}

const STAFF: StaffMember[] = SHARED_STAFF.map(s => ({ ...s }));

// Category filter tab definitions
const CATEGORY_TABS: { key: CategoryKey | 'all'; labelHi: string; labelEn: string; icon: React.ReactNode }[] = [
  { key: 'all', labelHi: 'सभी', labelEn: 'All', icon: <Users className="h-3.5 w-3.5" /> },
  { key: 'official', labelHi: 'शासन', labelEn: 'Official', icon: <Landmark className="h-3.5 w-3.5" /> },
  { key: 'health', labelHi: 'स्वास्थ्य', labelEn: 'Health', icon: <HeartPulse className="h-3.5 w-3.5" /> },
  { key: 'education', labelHi: 'शिक्षा', labelEn: 'Education', icon: <GraduationCap className="h-3.5 w-3.5" /> },
  { key: 'sanitation', labelHi: 'स्वच्छता', labelEn: 'Sanitation', icon: <Trash2 className="h-3.5 w-3.5" /> },
  { key: 'emergency', labelHi: 'आपातकाल', labelEn: 'Emergency', icon: <ShieldAlert className="h-3.5 w-3.5" /> },
]

// Category → color mapping for avatar background
const CATEGORY_COLORS: Record<CategoryKey, { bg: string; text: string; border: string; ring: string }> = {
  official: { bg: 'bg-[var(--saffron)]/12', text: 'text-[var(--saffron)]', border: 'border-[var(--saffron)]/20', ring: 'ring-[var(--saffron)]/15' },
  health: { bg: 'bg-[var(--green)]/12', text: 'text-[var(--green)]', border: 'border-[var(--green)]/20', ring: 'ring-[var(--green)]/15' },
  education: { bg: 'bg-amber-500/12', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/20', ring: 'ring-amber-500/15' },
  sanitation: { bg: 'bg-emerald-500/12', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-500/20', ring: 'ring-emerald-500/15' },
  emergency: { bg: 'bg-red-600/12', text: 'text-red-700 dark:text-red-400', border: 'border-red-600/20', ring: 'ring-red-600/15' },
}

// Category → badge for card
const CATEGORY_BADGES: Record<CategoryKey, { hi: string; en: string; badge: string; icon: React.ReactNode }> = {
  official: { hi: 'शासन', en: 'Official', badge: 'bg-[var(--saffron)]/10 text-[var(--saffron)] border-[var(--saffron)]/20', icon: <Landmark className="h-2.5 w-2.5" /> },
  health: { hi: 'स्वास्थ्य', en: 'Health', badge: 'bg-[var(--green)]/10 text-[var(--green)] border-[var(--green)]/20', icon: <HeartPulse className="h-2.5 w-2.5" /> },
  education: { hi: 'शिक्षा', en: 'Education', badge: 'bg-amber-500/10 text-amber-600 border-amber-500/20', icon: <GraduationCap className="h-2.5 w-2.5" /> },
  sanitation: { hi: 'स्वच्छता', en: 'Sanitation', badge: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20', icon: <Trash2 className="h-2.5 w-2.5" /> },
  emergency: { hi: 'आपातकाल', en: 'Emergency', badge: 'bg-red-600/10 text-red-700 border-red-600/20', icon: <ShieldAlert className="h-2.5 w-2.5" /> },
}

export function StaffDirectory() {
  const { locale } = useI18n()
  const isHi = locale === 'hi'
  const [activeCategory, setActiveCategory] = useState<CategoryKey | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Filter staff by category and search
  const filteredStaff = STAFF.filter((s) => {
    const categoryMatch = activeCategory === 'all' || s.category === activeCategory
    const searchMatch =
      searchQuery.trim() === '' ||
      s.nameHi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.designationHi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.designationEn.toLowerCase().includes(searchQuery.toLowerCase())
    return categoryMatch && searchMatch
  })

  // Category counts for the tab badges
  const categoryCounts = {
    all: STAFF.length,
    official: STAFF.filter((s) => s.category === 'official').length,
    health: STAFF.filter((s) => s.category === 'health').length,
    education: STAFF.filter((s) => s.category === 'education').length,
    sanitation: STAFF.filter((s) => s.category === 'sanitation').length,
    emergency: STAFF.filter((s) => s.category === 'emergency').length,
  }

  return (
    <section
      id="staff-directory"
      className="section-premium relative overflow-hidden"
    >
      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--saffron)]/3 via-transparent to-[var(--green)]/3 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--saffron)] via-white to-[var(--green)]" />

      <div className="container mx-auto px-4 relative">
        {/* ─────────── Section Header ─────────── */}
        <ScrollReveal delay={0.1}>
          <div className="section-header text-center mb-12">
            <div className="section-header-badge mx-auto">
              <Users className="h-3.5 w-3.5" />
              {isHi ? 'कर्मचारी निर्देशिका' : 'Staff Directory'}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gradient-premium leading-tight">
              {isHi
                ? 'ग्राम पंचायत चंद्रा — कर्मचारी निर्देशिका'
                : 'Gram Panchayat Chandra — Staff Directory'}
            </h2>
            <p className="text-sm text-muted-foreground mt-3 max-w-3xl mx-auto leading-relaxed">
              {isHi
                ? 'पंचायत के सभी अधिकारी, स्वास्थ्य कर्मचारी, शिक्षक, सफाई कर्मी और आपातकालीन संपर्क — खोजें और फ़ोन करें।'
                : 'All panchayat officials, health workers, teachers, sanitation staff and emergency contacts — search and call.'}
            </p>
            <div className="flex items-center justify-center gap-3 mt-4">
              <Badge variant="outline" className="gap-1.5 text-[11px]">
                <Briefcase className="h-3 w-3" />
                {isHi ? `${STAFF.length} कर्मचारी` : `${STAFF.length} Staff`}
              </Badge>
              <Badge variant="outline" className="gap-1.5 text-[11px]">
                <ShieldCheck className="h-3 w-3 text-green-600" />
                {isHi ? 'सत्यापित डेटा' : 'Verified Data'}
              </Badge>
            </div>
          </div>
        </ScrollReveal>

        {/* ─────────── Search & Filter ─────────── */}
        <ScrollReveal delay={0.12}>
          <div className="mb-8 max-w-3xl mx-auto">
            {/* Search bar — Premium */}
            <div className="relative mb-5">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isHi ? 'नाम या पद खोजें...' : 'Search by name or designation...'}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-border/60 bg-[var(--surface-elevated)] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--saffron)]/30 focus:border-[var(--saffron)]/40 transition-all shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-muted text-muted-foreground grid place-items-center text-[10px] hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category filter tabs — Premium */}
            <div className="flex flex-wrap gap-2 justify-center">
              {CATEGORY_TABS.map((tab) => {
                const isActive = activeCategory === tab.key
                const count = categoryCounts[tab.key]
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveCategory(tab.key)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[var(--saffron)] text-white shadow-lg shadow-[var(--saffron)]/20'
                        : 'bg-[var(--surface-elevated)] text-muted-foreground hover:bg-[var(--saffron)]/10 hover:text-[var(--saffron)] border border-border/50 shadow-sm'
                    }`}
                    aria-pressed={isActive}
                  >
                    {tab.icon}
                    {isHi ? tab.labelHi : tab.labelEn}
                    <span className={`ml-1 text-[10px] font-bold ${isActive ? 'text-white/80' : 'text-muted-foreground/60'}`}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </ScrollReveal>

        {/* ─────────── Staff Card Grid ─────────── */}
        <ScrollReveal delay={0.14}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredStaff.map((staff) => {
              const cat = CATEGORY_COLORS[staff.category]
              const catBadge = CATEGORY_BADGES[staff.category]
              return (
                <div
                  key={staff.id}
                  className="card-premium overflow-hidden group"
                >
                  <div className="h-1 w-full bg-gradient-to-r from-[var(--saffron)]/40 via-amber-400/40 to-[var(--green)]/40" />
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Avatar with initials */}
                      <div className={`h-12 w-12 rounded-xl grid place-items-center shrink-0 border-2 ${cat.bg} ${cat.text} ${cat.border} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                        <span className="text-base font-bold">{isHi ? staff.initialsHi : staff.initialsEn}</span>
                      </div>

                      {/* Name & designation */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm leading-tight mb-0.5 truncate group-hover:text-[var(--saffron)] transition-colors">
                          {isHi ? staff.nameHi : staff.nameEn}
                        </h4>
                        <p className="text-xs text-muted-foreground mb-2 truncate">
                          {isHi ? staff.designationHi : staff.designationEn}
                        </p>

                        {/* Category badge */}
                        <Badge variant="outline" className={`text-[10px] gap-1 py-0 px-1.5 ${catBadge.badge}`}>
                          {catBadge.icon}
                          {isHi ? catBadge.hi : catBadge.en}
                        </Badge>

                        {/* Phone link */}
                        {staff.phone && (
                          <div className="mt-2.5">
                            <a
                              href={`tel:${staff.phone}`}
                              className="inline-flex items-center gap-1.5 text-xs text-[var(--saffron)] font-semibold hover:underline transition-colors"
                            >
                              <Phone className="h-3 w-3" />
                              {staff.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* No results */}
          {filteredStaff.length === 0 && (
            <div className="text-center py-16">
              <div className="h-14 w-14 rounded-2xl grid place-items-center mx-auto bg-[var(--surface-warm)] text-muted-foreground mb-4 shadow-sm">
                <User className="h-6 w-6" />
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                {isHi
                  ? 'कोई कर्मचारी नहीं मिला। अन्य शब्द या वर्ग चुनें।'
                  : 'No staff found. Try a different search or category.'}
              </p>
            </div>
          )}
        </ScrollReveal>

        {/* ─────────── Quick Stats — Premium ─────────── */}
        <ScrollReveal delay={0.16}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-12">
            <div className="card-premium-bordered overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-[var(--saffron)] via-amber-500 to-[var(--green)]" />
              <div className="p-4 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl grid place-items-center shrink-0 bg-[var(--saffron)]/10 text-[var(--saffron)] shadow-sm">
                  <Users className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-2xl font-bold text-gradient-premium">{STAFF.length}</div>
                  <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">
                    {isHi ? 'कुल कर्मचारी' : 'Total Staff'}
                  </div>
                </div>
              </div>
            </div>

            <div className="card-premium-bordered-green overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-[var(--green)] via-amber-500 to-[var(--saffron)]" />
              <div className="p-4 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl grid place-items-center shrink-0 bg-[var(--green)]/10 text-[var(--green)] shadow-sm">
                  <HeartPulse className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-2xl font-bold text-gradient-premium">{categoryCounts.health + categoryCounts.sanitation}</div>
                  <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">
                    {isHi ? 'स्वास्थ्य + स्वच्छता' : 'Health + Sanitation'}
                  </div>
                </div>
              </div>
            </div>

            <div className="card-premium-bordered overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-[var(--saffron)] via-amber-500 to-[var(--green)]" />
              <div className="p-4 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl grid place-items-center shrink-0 bg-amber-500/10 text-amber-600 shadow-sm">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-2xl font-bold text-gradient-premium">{categoryCounts.education}</div>
                  <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">
                    {isHi ? 'शिक्षा कर्मचारी' : 'Education Staff'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ─────────── Footer Note ─────────── */}
        <div className="mt-10">
          <div className="section-divider">
            <div className="section-divider-dot" />
            <div className="section-divider-dot" />
            <div className="section-divider-dot" />
          </div>
          <p className="text-center text-xs text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {isHi
              ? 'फोन नंबर पंचायत रिकॉर्ड से हैं। नवीनतम जानकारी के लिए पंचायत कार्यालय से संपर्क करें।'
              : 'Phone numbers from panchayat records. Contact panchayat office for latest info.'}
          </p>
        </div>
      </div>
    </section>
  )
}
