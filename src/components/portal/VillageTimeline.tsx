'use client'
import { useI18n } from '@/lib/i18n'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import {
  History,
  Landmark,
  Users,
  Droplets,
  Zap,
  GraduationCap,
  HeartPulse,
  Building2,
  Award,
  Calendar,
  Wheat,
  Sparkles,
  Flag,
} from 'lucide-react'
import { ScrollReveal } from './ScrollReveal'

/* ──────────────────────────────────────────────────────────────────────
   Village Timeline — Gram Panchayat Chandra
   Historical panchayat milestones from 1957 (first elections) to 2026
   (digital governance launch). Bilingual (hi/en), Hindi-first.
   ────────────────────────────────────────────────────────────────────── */

type Category =
  | 'election'
  | 'infra'
  | 'scheme'
  | 'water'
  | 'power'
  | 'education'
  | 'health'
  | 'award'
  | 'civic'

interface CategoryMeta {
  icon: typeof History
  hi: string
  en: string
  dot: string
  badge: string
  ring: string
}

const CATEGORY_META: Record<Category, CategoryMeta> = {
  election: {
    icon: Landmark,
    hi: 'चुनाव',
    en: 'Election',
    dot: 'bg-amber-500',
    badge:
      'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    ring: 'group-hover:ring-amber-400/60',
  },
  infra: {
    icon: Building2,
    hi: 'आधारभूत',
    en: 'Infra',
    dot: 'bg-stone-500',
    badge:
      'bg-stone-100 text-stone-800 border-stone-300 dark:bg-stone-800/60 dark:text-stone-200 dark:border-stone-700',
    ring: 'group-hover:ring-stone-400/60',
  },
  scheme: {
    icon: Award,
    hi: 'योजना',
    en: 'Scheme',
    dot: 'bg-emerald-600',
    badge:
      'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
    ring: 'group-hover:ring-emerald-400/60',
  },
  water: {
    icon: Droplets,
    hi: 'जल',
    en: 'Water',
    dot: 'bg-sky-500',
    badge:
      'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800',
    ring: 'group-hover:ring-sky-400/60',
  },
  power: {
    icon: Zap,
    hi: 'विद्युत',
    en: 'Power',
    dot: 'bg-yellow-500',
    badge:
      'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-950/50 dark:text-yellow-300 dark:border-yellow-800',
    ring: 'group-hover:ring-yellow-400/60',
  },
  education: {
    icon: GraduationCap,
    hi: 'शिक्षा',
    en: 'Education',
    dot: 'bg-violet-500',
    badge:
      'bg-violet-100 text-violet-800 border-violet-300 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-800',
    ring: 'group-hover:ring-violet-400/60',
  },
  health: {
    icon: HeartPulse,
    hi: 'स्वास्थ्य',
    en: 'Health',
    dot: 'bg-rose-500',
    badge:
      'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800',
    ring: 'group-hover:ring-rose-400/60',
  },
  award: {
    icon: Sparkles,
    hi: 'पुरस्कार',
    en: 'Award',
    dot: 'bg-purple-500',
    badge:
      'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800',
    ring: 'group-hover:ring-purple-400/60',
  },
  civic: {
    icon: Users,
    hi: 'नागरिक',
    en: 'Civic',
    dot: 'bg-teal-500',
    badge:
      'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800',
    ring: 'group-hover:ring-teal-400/60',
  },
}

interface Milestone {
  year: string
  date?: string
  category: Category
  titleHi: string
  titleEn: string
  descHi: string
  descEn: string
  tagHi?: string
  tagEn?: string
}

const MILESTONES: Milestone[] = []

export function VillageTimeline() {
  const { locale } = useI18n()
  const isHi = locale === 'hi'

  // Stats: count by category
  const stats = {
    total: MILESTONES.length,
    elections: MILESTONES.filter((m) => m.category === 'election').length,
    schemes: MILESTONES.filter((m) => m.category === 'scheme').length,
    awards: MILESTONES.filter((m) => m.category === 'award').length,
  }

  return (
    <section
      id="timeline"
      data-section="timeline"
      className="section-premium py-16 md:py-20 border-b border-border/40"
    >
      <div className="container mx-auto px-4 max-w-6xl">
        <ScrollReveal>
          <div className="text-center mb-12">
            <Badge variant="outline" className="section-header-badge mb-3 gap-1.5">
              <History className="h-3.5 w-3.5" />
              {isHi ? 'इतिहास' : 'Timeline'}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gradient-premium">
              {isHi
                ? 'ग्राम पंचायत चंद्रा — ऐतिहासिक माइल के पत्थर'
                : 'Gram Panchayat Chandra — Historical Milestones'}
            </h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              {isHi
                ? 'पंचायत की ऐतिहासिक यात्रा — जल्द ही विस्तृत माइलस्टोन जोड़े जाएंगे।'
                : 'The panchayat\'s historical journey — detailed milestones will be added soon.'}
            </p>
          </div>
        </ScrollReveal>

        {/* No fabricated milestones — awaiting verified historical data */}
        <div className="text-center py-12 text-muted-foreground">
          <History className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p className="text-sm">
            {isHi
              ? 'सत्यापित ऐतिहासिक माइलस्टोन जल्द ही यहाँ उपलब्ध होंगी।'
              : 'Verified historical milestones will be available here soon.'}
          </p>
        </div>
      </div>
    </section>
  )
}
