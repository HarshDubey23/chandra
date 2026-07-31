'use client'
// Video Gallery — Gram Panchayat Chandra
// Displays the 3 real WhatsApp MP4 videos with thumbnail + play dialog.
import { useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { motion } from 'framer-motion'
import { Video, Play, X, Clock, Eye, Camera } from 'lucide-react'
import { ScrollReveal } from './ScrollReveal'

interface VideoItem {
  src: string
  thumb: string
  titleHi: string
  titleEn: string
  descHi: string
  descEn: string
  duration: string
}

const VIDEOS: VideoItem[] = [
  {
    src: '/whatsapp/VID-20260725-WA0094.mp4',
    thumb: '/whatsapp-optimized/VID-20260725-WA0094-thumb.webp',
    titleHi: 'विद्यालय बैग वितरण',
    titleEn: 'School Bag Distribution',
    descHi: 'ग्राम पंचायत चंद्रा में विद्यालय बैग वितरण कार्यक्रम',
    descEn: 'School bag distribution program at Gram Panchayat Chandra',
    duration: '0:30',
  },
  {
    src: '/whatsapp/VID-20260725-WA0095.mp4',
    thumb: '/whatsapp-optimized/VID-20260725-WA0095-thumb.webp',
    titleHi: 'विद्यालय सांस्कृतिक कार्यक्रम',
    titleEn: 'School Cultural Program',
    descHi: 'विद्यालय सभा में बच्चों द्वारा सांस्कृतिक नृत्य प्रस्तुति',
    descEn: 'Children performing cultural dance at school assembly',
    duration: '0:45',
  },
  {
    src: '/whatsapp/VID-20260725-WA0096.mp4',
    thumb: '/whatsapp-optimized/VID-20260725-WA0096-thumb.webp',
    titleHi: 'विद्यालय कक्षा नेतृत्व पट्टिका',
    titleEn: 'School Class Leaders Board',
    descHi: 'प्राथमिक विद्यालय की कक्षा नेतृत्व पट्टिका का प्रदर्शन',
    descEn: 'Primary school class leaders poster displayed on wall',
    duration: '0:15',
  },
]

function VideoCard({ video, isHi, onPlay, delay }: { video: VideoItem; isHi: boolean; onPlay: () => void; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.5, ease: 'easeOut', delay }}
    >
      <Card className="card-premium-bordered overflow-hidden rounded-xl hover-lift-lg group">
        <button
          onClick={onPlay}
          className="relative w-full aspect-video block bg-black overflow-hidden"
          aria-label={isHi ? `वीडियो चलाएं: ${video.titleHi}` : `Play video: ${video.titleEn}`}
        >
          <img
            src={video.thumb}
            alt={isHi ? video.titleHi : video.titleEn}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          {/* Play button */}
          <div className="absolute inset-0 grid place-items-center">
            <div className="h-14 w-14 rounded-full bg-white/90 backdrop-blur grid place-items-center shadow-lg transition-transform duration-200 group-hover:scale-110">
              <Play className="h-6 w-6 text-primary ml-0.5" fill="currentColor" />
            </div>
          </div>
          {/* Duration badge */}
          <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 bg-black/75 text-white text-[10px] px-1.5 py-0.5 rounded">
            <Clock className="h-2.5 w-2.5" />
            {video.duration}
          </span>
          {/* Real video tag */}
          <span className="absolute top-2 left-2 inline-flex items-center gap-1 bg-green-600/90 text-white text-[9px] font-medium px-1.5 py-0.5 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-white soft-pulse" />
            {isHi ? 'वास्तविक वीडियो' : 'Real video'}
          </span>
          {/* Title on thumbnail */}
          <div className="absolute bottom-2 left-2 right-16">
            <p className="text-xs font-semibold text-white line-clamp-1 drop-shadow">
              {isHi ? video.titleHi : video.titleEn}
            </p>
          </div>
        </button>
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <Video className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-foreground/80 line-clamp-2">
                {isHi ? video.descHi : video.descEn}
              </p>
              <p className="text-[10px] text-muted-foreground/70 mt-1 line-clamp-1">
                {isHi ? video.descEn : video.descHi}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function VideoGallery() {
  const { locale } = useI18n()
  const isHi = locale === 'hi'
  const [selected, setSelected] = useState<VideoItem | null>(null)
  const [open, setOpen] = useState(false)

  const handlePlay = (v: VideoItem) => {
    setSelected(v)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setSelected(null)
  }

  return (
    <section
      id="videos"
      data-section="videos"
      className="section-premium py-16 md:py-20 border-b border-border/40"
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <ScrollReveal delay={0.1}>
          <div className="text-center mb-10">
            <Badge variant="outline" className="section-header-badge mb-3 gap-1.5">
              <Video className="h-3.5 w-3.5" />
              {isHi ? 'वीडियो गैलरी' : 'Video Gallery'}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gradient-premium">
              {isHi ? 'ग्राम चंद्रा — वीडियो गैलरी' : 'Gram Chandra — Video Gallery'}
            </h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              {isHi
                ? 'पंचायत कार्यक्रमों, विद्यालय गतिविधियों एवं ग्राम सभा के वास्तविक वीडियो'
                : 'Real videos of panchayat events, school activities and gram sabha'}
            </p>
          </div>
        </ScrollReveal>

        {/* Stats bar */}
        <ScrollReveal delay={0.15}>
          <div className="flex items-center justify-center gap-4 mb-8 text-xs text-muted-foreground flex-wrap">
            <span className="inline-flex items-center gap-1.5">
              <Video className="h-3.5 w-3.5 text-primary" />
              {isHi ? `${VIDEOS.length} वास्तविक वीडियो` : `${VIDEOS.length} real videos`}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5 text-accent-foreground" />
              {isHi ? 'सभी वीडियो वास्तविक हैं — कोई AI नहीं' : 'All videos are real — no AI'}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Camera className="h-3.5 w-3.5 text-primary" />
              {isHi ? 'व्हाट्सएप से प्राप्त' : 'Received via WhatsApp'}
            </span>
          </div>
        </ScrollReveal>

        {/* Video grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {VIDEOS.map((v, i) => (
            <VideoCard
              key={v.src}
              video={v}
              isHi={isHi}
              onPlay={() => handlePlay(v)}
              delay={i * 0.1}
            />
          ))}
        </div>

        {/* Player dialog */}
        <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
          <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden" aria-describedby={undefined}>
            <DialogHeader className="p-4 pb-2">
              <DialogTitle className="flex items-center gap-2 text-gradient-premium text-base">
                <Video className="h-4 w-4 text-primary" />
                {selected && (isHi ? selected.titleHi : selected.titleEn)}
              </DialogTitle>
            </DialogHeader>
            {selected && (
              <div className="px-4 pb-4">
                <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
                  <video
                    src={selected.src}
                    controls
                    autoPlay
                    className="h-full w-full"
                    poster={selected.thumb}
                  >
                    <track kind="captions" />
                  </video>
                </div>
                <div className="mt-3 flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <p className="text-sm text-foreground/80">
                      {isHi ? selected.descHi : selected.descEn}
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      {isHi ? selected.descEn : selected.descHi}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 bg-green-600/10 text-green-700 dark:text-green-400 text-[10px] font-medium px-2 py-1 rounded-full shrink-0">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-600 soft-pulse" />
                    {isHi ? 'वास्तविक वीडियो / Real video' : 'Real video'}
                  </span>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  )
}
