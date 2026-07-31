'use client'
// Department Directory — public-facing page showing all 11 panchayat
// departments with click-to-call, officer name, SLA, and complaint categories
// handled by each. Mounted in PublicPortal after StaffDirectory.
import { useEffect, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollReveal } from './ScrollReveal'
import { motion } from 'framer-motion'
import {
  Phone, MessageCircle, Clock, ShieldCheck, AlertCircle, Loader2, Building2,
  Droplets, Route, Zap, Trash2, ShieldAlert, Stethoscope, GraduationCap,
  HeartPulse, Briefcase, Landmark, Inbox, Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface RoutingRule {
  category: string
  subcategory: string | null
  priority: string
  slaHours: number
  escalationLevel: number
}

interface Department {
  id: string
  code: string
  nameHi: string
  nameEn: string
  officerName: string | null
  officerPhone: string | null
  headPhone: string | null
  isActive: boolean
  routingRules: RoutingRule[]
}

// Department code → icon + accent color
const DEPT_ICON: Record<string, { icon: React.ElementType; color: string; bg: string; ring: string }> = {
  water: { icon: Droplets, color: 'text-cyan-700 dark:text-cyan-300', bg: 'bg-cyan-50 dark:bg-cyan-950/40', ring: 'ring-cyan-400/40' },
  roads: { icon: Route, color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-950/40', ring: 'ring-amber-400/40' },
  electricity: { icon: Zap, color: 'text-yellow-700 dark:text-yellow-300', bg: 'bg-yellow-50 dark:bg-yellow-950/40', ring: 'ring-yellow-400/40' },
  sanitation: { icon: Trash2, color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-950/40', ring: 'ring-emerald-400/40' },
  secretary: { icon: Briefcase, color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-50 dark:bg-blue-950/40', ring: 'ring-blue-400/40' },
  pradhan: { icon: Landmark, color: 'text-orange-700 dark:text-orange-300', bg: 'bg-orange-50 dark:bg-orange-950/40', ring: 'ring-orange-400/40' },
  pension: { icon: HeartPulse, color: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-50 dark:bg-rose-950/40', ring: 'ring-rose-400/40' },
  health: { icon: Stethoscope, color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-950/40', ring: 'ring-emerald-400/40' },
  education: { icon: GraduationCap, color: 'text-indigo-700 dark:text-indigo-300', bg: 'bg-indigo-50 dark:bg-indigo-950/40', ring: 'ring-indigo-400/40' },
  emergency: { icon: ShieldAlert, color: 'text-red-700 dark:text-red-300', bg: 'bg-red-50 dark:bg-red-950/40', ring: 'ring-red-500/50' },
  general: { icon: Building2, color: 'text-muted-foreground', bg: 'bg-muted/40', ring: 'ring-border/60' },
}

const PRIORITY_COLORS: Record<string, string> = {
  emergency: 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900',
  critical: 'text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-900',
  high: 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900',
  medium: 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900',
  low: 'text-muted-foreground bg-muted/40 border-border',
}

const PRIORITY_LABELS: Record<string, { hi: string; en: string }> = {
  emergency: { hi: 'आपातकालीन', en: 'Emergency' },
  critical: { hi: 'गंभीर', en: 'Critical' },
  high: { hi: 'उच्च', en: 'High' },
  medium: { hi: 'मध्यम', en: 'Medium' },
  low: { hi: 'निम्न', en: 'Low' },
}

export function DepartmentDirectory() {
  const { locale } = useI18n()
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const hi = locale === 'hi'

  useEffect(() => {
    fetch('/api/vapi/departments')
      .then(r => r.json())
      .then(d => {
        setDepartments(d.departments || [])
        setLoading(false)
      })
      .catch(e => {
        setError((e as Error).message)
        setLoading(false)
      })
  }, [])

  return (
    <ScrollReveal>
      <section id="departments" className="container mx-auto px-4 py-12 md:py-16">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold mb-3">
            <Building2 className="h-3 w-3" />
            {hi ? 'संगठनात्मक संरचना' : 'Organizational Structure'}
          </div>
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
            {hi ? 'विभाग निर्देशिका — 11 विभाग' : 'Department Directory — 11 Departments'}
          </h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl mx-auto">
            {hi
              ? 'पंचायत के सभी विभाग और उनके अधिकारी — एक टैप पर कॉल करें। प्रत्येक विभाग की SLA, प्राथमिकता और शिकायत श्रेणियाँ देखें।'
              : 'All panchayat departments and their officers — call with one tap. View SLA, priority, and complaint categories for each department.'}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 rounded-xl bg-muted/30 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <Card className="border-destructive/40">
            <CardContent className="p-6 text-center text-destructive">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">{hi ? 'विभाग लोड करने में विफल' : 'Failed to load departments'}</p>
              <p className="text-xs text-muted-foreground mt-1">{error}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((d, idx) => {
              const cfg = DEPT_ICON[d.code] || DEPT_ICON.general
              const Icon = cfg.icon
              const totalCategories = d.routingRules?.length || 0
              const highestPriority = d.routingRules?.[0]?.priority || 'medium'
              const minSla = d.routingRules?.reduce((min, r) => Math.min(min, r.slaHours), Infinity)
              const priorityCfg = PRIORITY_COLORS[highestPriority] || PRIORITY_COLORS.medium
              const priorityLbl = PRIORITY_LABELS[highestPriority] || PRIORITY_LABELS.medium

              return (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.06, duration: 0.4 }}
                >
                  <Card className={cn('group relative overflow-hidden border-border/60 hover:border-primary/30 hover:shadow-lg transition-all duration-300 ring-1 ring-transparent hover:', cfg.ring)}>
                    {/* Top accent bar */}
                    <div className={cn('h-1.5 w-full', cfg.bg)} />

                    <CardHeader className="pb-3 -mt-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ring-1', cfg.bg, cfg.ring)}>
                            <Icon className={cn('h-5 w-5', cfg.color)} />
                          </div>
                          <div className="min-w-0">
                            <CardTitle className="text-sm leading-tight truncate">
                              {hi ? d.nameHi : d.nameEn}
                            </CardTitle>
                            <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider mt-0.5">
                              {d.code}
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className={cn('text-[9px] gap-1 shrink-0', priorityCfg)}>
                          <span className="text-[8px]">●</span>
                          {hi ? priorityLbl.hi : priorityLbl.en}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-2.5 pt-0">
                      {/* Officer info */}
                      {d.officerName && (
                        <div className="flex items-center gap-2 text-xs">
                          <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="font-medium text-foreground truncate">{d.officerName}</span>
                        </div>
                      )}

                      {/* Phone actions */}
                      <div className="flex gap-1.5">
                        {d.officerPhone && (
                          <a
                            href={`tel:${d.officerPhone}`}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-background px-2 py-2 text-xs font-medium hover:border-primary/40 hover:bg-primary/5 transition-colors"
                          >
                            <Phone className="h-3.5 w-3.5 text-primary" />
                            <span className="font-mono">{d.officerPhone}</span>
                          </a>
                        )}
                        {d.officerPhone && (
                          <a
                            href={`https://wa.me/91${d.officerPhone.replace(/[^\d]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center rounded-md border border-green-600/40 bg-green-50 dark:bg-green-950/40 px-2.5 py-2 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                            title={hi ? 'WhatsApp पर संदेश भेजें' : 'Send WhatsApp message'}
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>

                      {/* SLA + Categories */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="rounded-md bg-muted/30 p-2 text-center">
                          <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">
                            {hi ? 'SLA' : 'SLA'}
                          </div>
                          <div className="text-sm font-bold text-foreground tabular-nums">
                            {minSla && Number.isFinite(minSla) ? `${minSla}h` : '—'}
                          </div>
                        </div>
                        <div className="rounded-md bg-muted/30 p-2 text-center">
                          <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">
                            {hi ? 'श्रेणियाँ' : 'Categories'}
                          </div>
                          <div className="text-sm font-bold text-foreground tabular-nums">
                            {totalCategories}
                          </div>
                        </div>
                      </div>

                      {/* Category list (collapsible) */}
                      {totalCategories > 0 && (
                        <div className="pt-1.5 border-t border-border/40">
                          <div className="flex flex-wrap gap-1">
                            {d.routingRules.slice(0, 5).map(r => (
                              <span
                                key={r.category}
                                className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted/60 text-muted-foreground border border-border/40"
                              >
                                {r.category.replace(/_/g, ' ')}
                              </span>
                            ))}
                            {totalCategories > 5 && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted/60 text-muted-foreground">
                                +{totalCategories - 5}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Head phone (if different) */}
                      {d.headPhone && d.headPhone !== d.officerPhone && (
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground pt-1.5 border-t border-border/40">
                          <ShieldCheck className="h-3 w-3" />
                          <span>{hi ? 'विभाग प्रमुख' : 'Dept Head'}:</span>
                          <a href={`tel:${d.headPhone}`} className="font-mono hover:text-primary hover:underline">
                            {d.headPhone}
                          </a>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Footer note */}
        <div className="mt-6 text-center text-xs text-muted-foreground max-w-2xl mx-auto">
          <p className="flex items-center justify-center gap-1.5 flex-wrap">
            <Clock className="h-3 w-3" />
            {hi
              ? 'सभी विभाग सोम-शुक्र 10:00–17:00 उपलब्ध। आपातकालीन विभाग 24×7 सक्रिय।'
              : 'All departments available Mon-Fri 10:00-17:00. Emergency department active 24×7.'}
          </p>
        </div>
      </section>
    </ScrollReveal>
  )
}
