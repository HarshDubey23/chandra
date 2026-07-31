'use client'
import { useEffect, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bell, Pin, FileText, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScrollReveal } from './ScrollReveal'

interface Announcement {
  id: string
  titleHi: string; titleEn: string
  bodyHi: string; bodyEn: string
  pinned: boolean
  expiresAt: string | null
  createdAt: string
}
interface Notice {
  id: string
  titleHi: string; titleEn: string
  bodyHi: string; bodyEn: string
  category: string
  createdAt: string
}

export function Announcements() {
  const { locale } = useI18n()
  const [ann, setAnn] = useState<Announcement[]>([])
  const [notices, setNotices] = useState<Notice[]>([])

  useEffect(() => {
    fetch('/api/announcements').then(r => r.json()).then(d => setAnn(d.announcements || [])).catch(() => {})
    fetch('/api/notices').then(r => r.json()).then(d => setNotices(d.notices || [])).catch(() => {})
  }, [])

  const pinned = ann.filter(a => a.pinned)
  const others = ann.filter(a => !a.pinned)

  return (
    <section id="announcements" className="section-premium py-16 md:py-20 border-b border-border/40">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10">
          <Badge variant="outline" className="section-header-badge mb-3 gap-1.5">
            <Bell className="h-3.5 w-3.5" />
            {locale === 'hi' ? 'सूचनाएँ' : 'Announcements'}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gradient-premium">
            {locale === 'hi' ? 'पंचायत सूचनाएँ एवं नोटिस' : 'Panchayat Announcements & Notices'}
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            {locale === 'hi' ? 'नवीनतम सूचनाएँ एवं आधिकारिक नोटिस' : 'Latest announcements and official notices'}
          </p>
        </div>

        <ScrollReveal delay={0.1}>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Announcements — 2 cols */}
          <div className="lg:col-span-2 space-y-4">
            {pinned.length > 0 && (
              <div className="space-y-3">
                {pinned.map((a) => (
                  <Card key={a.id} className="card-premium-bordered overflow-hidden rounded-xl">
                    <CardContent className="p-4 md:p-5">
                      <div className="flex items-start gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground grid place-items-center shrink-0">
                          <Pin className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <Badge variant="default" className="text-[10px] py-0">{locale === 'hi' ? 'पिन की गई' : 'Pinned'}</Badge>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-2.5 w-2.5" />
                              {new Date(a.createdAt).toLocaleDateString(locale === 'hi' ? 'hi-IN' : 'en-IN')}
                            </span>
                          </div>
                          <h3 className="font-semibold text-sm mb-1">{locale === 'hi' ? a.titleHi : a.titleEn}</h3>
                          <p className="text-xs text-foreground/70 leading-relaxed">{locale === 'hi' ? a.bodyHi : a.bodyEn}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {others.length > 0 && (
              <div className="grid sm:grid-cols-2 gap-4">
                {others.map((a) => (
                  <Card key={a.id} className="card-premium overflow-hidden rounded-xl hover-lift">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-7 w-7 rounded-full bg-secondary text-secondary-foreground grid place-items-center shrink-0">
                          <Bell className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-2.5 w-2.5" />
                          {new Date(a.createdAt).toLocaleDateString(locale === 'hi' ? 'hi-IN' : 'en-IN')}
                        </span>
                      </div>
                      <h3 className="font-semibold text-sm mb-1">{locale === 'hi' ? a.titleHi : a.titleEn}</h3>
                      <p className="text-xs text-foreground/70 leading-relaxed line-clamp-3">{locale === 'hi' ? a.bodyHi : a.bodyEn}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {ann.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                {locale === 'hi' ? 'कोई सूचना उपलब्ध नहीं' : 'No announcements'}
              </div>
            )}
          </div>

          {/* Notices — 1 col */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">{locale === 'hi' ? 'नोटिस बोर्ड' : 'Notice Board'}</h3>
            </div>
            <div className="space-y-3">
              {notices.map((n) => (
                <Card key={n.id} className="card-premium-bordered-green overflow-hidden rounded-xl hover-lift">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[9px] py-0 px-1.5 uppercase">
                        {n.category}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(n.createdAt).toLocaleDateString(locale === 'hi' ? 'hi-IN' : 'en-IN')}
                      </span>
                    </div>
                    <h4 className="font-medium text-xs mb-1">{locale === 'hi' ? n.titleHi : n.titleEn}</h4>
                    <p className="text-[11px] text-foreground/70 leading-relaxed line-clamp-3">
                      {locale === 'hi' ? n.bodyHi : n.bodyEn}
                    </p>
                  </CardContent>
                </Card>
              ))}
              {notices.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  {locale === 'hi' ? 'कोई नोटिस उपलब्ध नहीं' : 'No notices'}
                </div>
              )}
            </div>
          </div>
        </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
