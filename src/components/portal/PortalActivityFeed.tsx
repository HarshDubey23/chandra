'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useI18n } from '@/lib/i18n'
import { ScrollReveal } from './ScrollReveal'
import { SectionHeading } from './SectionHeading'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  MessageSquare, Megaphone, Vote, Clock, ArrowRight, Activity
} from 'lucide-react'
import { ease, dur } from '@/lib/motion/springs'

interface FeedItem {
  id: string
  type: 'complaint' | 'announcement' | 'poll'
  titleHi: string
  titleEn: string
  metaHi: string
  metaEn: string
  timestamp: string
  status?: string
}

/**
 * PortalActivityFeed — a unified live timeline showing the 8 most recent
 * portal activities (complaints, announcements, polls) in a single feed.
 *
 * Fetches from /api/stats + /api/announcements + /api/polls, merges by
 * timestamp, and renders as a vertical timeline with type-coded icons.
 * Adds a "living portal" feel — citizens see real activity at a glance.
 *
 * Performance: single fetch on mount (no polling — the LivePortalStats
 * widget already polls). IntersectionObserver-revealed. GPU-only animation.
 */
export function PortalActivityFeed() {
  const { locale } = useI18n()
  const hi = locale === 'hi'
  const [items, setItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const [statsRes, annRes, pollsRes] = await Promise.all([
          fetch('/api/stats').then(r => r.json()).catch(() => null),
          fetch('/api/announcements').then(r => r.json()).catch(() => null),
          fetch('/api/polls').then(r => r.json()).catch(() => null),
        ])

        const feed: FeedItem[] = []

        // Recent complaints (from stats)
        if (statsRes?.recentComplaints) {
          statsRes.recentComplaints.slice(0, 4).forEach((c: Record<string, unknown>) => {
            const category = String(c.category || 'other')
            const trackingId = String(c.trackingId || '')
            const status = String(c.status || 'Pending')
            feed.push({
              id: `c-${trackingId}`,
              type: 'complaint',
              titleHi: `${category} शिकायत`,
              titleEn: `${category} complaint`,
              metaHi: `ट्रैकिंग: ${trackingId}`,
              metaEn: `Tracking: ${trackingId}`,
              timestamp: String(c.createdAt || new Date().toISOString()),
              status,
            })
          })
        }

        // Announcements
        if (annRes?.items) {
          annRes.items.slice(0, 3).forEach((a: Record<string, unknown>) => {
            feed.push({
              id: `a-${a.id}`,
              type: 'announcement',
              titleHi: String(a.titleHi || a.titleEn || ''),
              titleEn: String(a.titleEn || a.titleHi || ''),
              metaHi: a.pinned ? 'पिन की गई' : 'सामान्य',
              metaEn: a.pinned ? 'Pinned' : 'General',
              timestamp: String(a.createdAt || new Date().toISOString()),
            })
          })
        }

        // Active polls
        if (pollsRes?.polls) {
          pollsRes.polls.slice(0, 2).forEach((p: Record<string, unknown>) => {
            feed.push({
              id: `p-${p.id}`,
              type: 'poll',
              titleHi: String(p.questionHi || p.questionEn || ''),
              titleEn: String(p.questionEn || p.questionHi || ''),
              metaHi: p.status === 'active' ? 'सक्रिय मतदान' : 'बंद',
              metaEn: p.status === 'active' ? 'Active voting' : 'Closed',
              timestamp: String(p.createdAt || new Date().toISOString()),
            })
          })
        }

        // Sort by timestamp desc, take 8
        feed.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        setItems(feed.slice(0, 8))
      } catch {
        // silent fail — feed is non-critical
      } finally {
        queueMicrotask(() => setLoading(false))
      }
    }
    fetchFeed()
  }, [])

  const typeConfig = {
    complaint: { icon: MessageSquare, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', labelHi: 'शिकायत', labelEn: 'Complaint' },
    announcement: { icon: Megaphone, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20', labelHi: 'सूचना', labelEn: 'Notice' },
    poll: { icon: Vote, color: 'text-accent-text', bg: 'bg-accent/10', border: 'border-accent/20', labelHi: 'मतदान', labelEn: 'Poll' },
  } as const

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso)
      const now = Date.now()
      const diff = now - d.getTime()
      const mins = Math.floor(diff / 60000)
      const hours = Math.floor(diff / 3600000)
      const days = Math.floor(diff / 86400000)
      if (hi) {
        if (mins < 1) return 'अभी'
        if (mins < 60) return `${mins} मिनट पहले`
        if (hours < 24) return `${hours} घंटे पहले`
        if (days < 7) return `${days} दिन पहले`
        return d.toLocaleDateString('hi-IN')
      }
      if (mins < 1) return 'just now'
      if (mins < 60) return `${mins}m ago`
      if (hours < 24) return `${hours}h ago`
      if (days < 7) return `${days}d ago`
      return d.toLocaleDateString('en-IN')
    } catch {
      return ''
    }
  }

  return (
    <section id="activity-feed" className="py-16 md:py-20 bg-gradient-to-b from-transparent via-secondary/5 to-transparent relative overflow-hidden">
      <div className="container mx-auto px-4 relative">
        <ScrollReveal delay={0.1}>
          <div className="mb-10">
            <SectionHeading
              hi={hi ? 'पोर्टल गतिविधि फ़ीड' : 'पोर्टल गतिविधि'}
              en="Portal Activity Feed"
              eyebrowHi="लाइव गतिविधि"
              eyebrowEn="Live Activity"
              icon={<Activity className="h-3.5 w-3.5" />}
              align="center"
              showDivider
            />
            <p className="text-sm text-muted-foreground mt-4 max-w-2xl mx-auto text-center">
              {hi
                ? 'हाल की शिकायतें, सूचनाएँ एवं मतदान — एक स्थान पर'
                : 'Recent complaints, announcements, and polls — in one place'}
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="max-w-3xl mx-auto">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-xl bg-card border border-border shimmer-loading" />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-3 opacity-40" />
                <p className="text-sm">{hi ? 'अभी कोई गतिविधि नहीं' : 'No recent activity'}</p>
              </div>
            ) : (
              <div className="relative">
                {/* Vertical timeline line */}
                <div className="absolute left-5 top-2 bottom-2 w-px bg-gradient-to-b from-primary/30 via-border to-accent/30" aria-hidden="true" />

                <motion.ol
                  className="space-y-3"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-30px' }}
                  variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
                >
                  {items.map((item) => {
                    const cfg = typeConfig[item.type]
                    const Icon = cfg.icon
                    return (
                      <motion.li
                        key={item.id}
                        variants={{
                          hidden: { opacity: 0, x: -16 },
                          visible: { opacity: 1, x: 0, transition: { duration: dur.slow, ease: ease.expoOut } },
                        }}
                        className="relative pl-14"
                      >
                        {/* Timeline dot */}
                        <div className={`absolute left-2 top-3 h-6 w-6 rounded-full ${cfg.bg} ${cfg.border} border grid place-items-center`}>
                          <Icon className={`h-3 w-3 ${cfg.color}`} />
                        </div>

                        <Card className="p-3.5 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 group cursor-default">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className={`text-[9px] py-0 px-1.5 ${cfg.border} ${cfg.bg} ${cfg.color} font-semibold uppercase tracking-wide`}>
                                  {hi ? cfg.labelHi : cfg.labelEn}
                                </Badge>
                                {item.status && (
                                  <Badge variant="secondary" className="text-[9px] py-0 px-1.5 font-medium">
                                    {item.status}
                                  </Badge>
                                )}
                                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                  <Clock className="h-2.5 w-2.5" />
                                  {formatTime(item.timestamp)}
                                </span>
                              </div>
                              <p className="text-sm font-medium text-foreground leading-snug truncate group-hover:text-primary transition-colors">
                                {hi ? item.titleHi : item.titleEn}
                              </p>
                              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                                {hi ? item.metaHi : item.metaEn}
                              </p>
                            </div>
                            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-primary/60 group-hover:translate-x-0.5 transition-all duration-300 shrink-0 mt-1" />
                          </div>
                        </Card>
                      </motion.li>
                    )
                  })}
                </motion.ol>
              </div>
            )}
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
