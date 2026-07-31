'use client'
import { useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollReveal } from './ScrollReveal'
import {
  Quote,
  Star,
  TrendingUp,
  Home,
  Droplets,
  HeartPulse,
  Users,
  GraduationCap,
  CheckCircle2,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Story = {
  id: string
  icon: typeof Home
  categoryHi: string
  categoryEn: string
  beneficiaryHi: string
  beneficiaryEn: string
  ward: number
  storyHi: string
  storyEn: string
  impactHi: string
  impactEn: string
  scheme: string
  metricValue: string
  metricLabelHi: string
  metricLabelEn: string
}

const STORIES: Story[] = []

export function SuccessStories() {
  const { locale } = useI18n()
  const [expanded, setExpanded] = useState<string | null>(null)
  const hi = locale === 'hi'

  return (
    <section id="success-stories" className="section-premium py-16 md:py-20 border-b border-border/40">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <Badge variant="outline" className="section-header-badge mb-3 gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            {hi ? 'सफलता की कहानियाँ' : 'Success Stories'}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gradient-premium">
            {hi ? 'सफलता की कहानियाँ' : 'Success Stories'}
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            {hi
              ? 'ग्राम चंद्रा में सरकारी योजनाओं से बदली ज़िंदगियाँ। वास्तविक लाभार्थियों के अनुभव।'
              : 'Real lives transformed by government schemes in Chandra. Authentic beneficiary experiences.'}
          </p>
        </div>

        {/* No fabricated stories — awaiting real beneficiary testimonials */}
        <div className="text-center py-12 text-muted-foreground">
          <Sparkles className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p className="text-sm">
            {hi
              ? 'वास्तविक लाभार्थी कहानियाँ जल्द ही यहाँ उपलब्ध होंगी।'
              : 'Real beneficiary stories will be available here soon.'}
          </p>
        </div>

        {/* Footer CTA */}
        <div className="text-center mt-8">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => {
              const el = document.getElementById('eligibility')
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
          >
            <Star className="h-3.5 w-3.5 text-primary" />
            {hi ? 'योजना पात्रता जांचें' : 'Check scheme eligibility'}
          </Button>
        </div>
      </div>
    </section>
  )
}
