'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { motion } from 'framer-motion'
import {
  Images,
  ImageOff,
  Maximize2,
  RefreshCw,
} from 'lucide-react'
import { ScrollReveal } from './ScrollReveal'
import { ImageLightbox } from './ImageLightbox'
import { BlurImage } from './BlurImage'

/* ──────────────────────────────────────────────────────────────────────
   Photo Gallery — Gram Panchayat Chandra
   Public-facing gallery portal section showing infrastructure, schemes,
   events, health and education photos with category chips + lightbox.
   Bilingual (hi/en), Hindi-first.
   ────────────────────────────────────────────────────────────────────── */

interface ImageAsset {
  imageId: string
  filename: string
  url: string
  category: string
  subcategory: string | null
  hiCaption: string
  enCaption: string
  schemeLogos: string | null
  purpose: string
  chatContext: string | null
  exif: string | null
  geoInferred: string | null
  scrollSection: string | null
  facesDetected: number
  confidence: number
  isPublic: boolean
}

// ── Category bucket definitions ────────────────────────────────────────
interface CategoryBucket {
  id: string
  hi: string
  en: string
  matchers: string[]
}

const CATEGORY_BUCKETS: CategoryBucket[] = [
  { id: 'representatives', hi: 'पदाधिकारी', en: 'Representatives', matchers: ['representatives'] },
  { id: 'infrastructure', hi: 'आधारभूत संरचना', en: 'Infrastructure', matchers: ['infrastructure'] },
  { id: 'education', hi: 'शिक्षा', en: 'Education', matchers: ['education'] },
  { id: 'community', hi: 'सामुदायिक', en: 'Community', matchers: ['community'] },
  { id: 'agriculture', hi: 'कृषि', en: 'Agriculture', matchers: ['agriculture'] },
]

const ALL_BUCKET: { id: 'all'; hi: string; en: string } = { id: 'all', hi: 'सभी', en: 'All' }

// ── Per-bucket colour accents for the corner category badge ──
const BUCKET_BADGE_STYLES: Record<string, string> = {
  representatives:
    'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900/50',
  infrastructure:
    'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900/50',
  education:
    'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-900/50',
  community:
    'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900/50',
  agriculture:
    'bg-green-100 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-300 dark:border-green-900/50',
}

const UNKNOWN_BADGE_STYLE =
  'bg-secondary text-secondary-foreground border-border'

function resolveBucketId(category: string): string | null {
  for (const b of CATEGORY_BUCKETS) {
    if (b.matchers.some((m) => category.startsWith(m))) return b.id
  }
  return null
}

export function PhotoGallery() {
  const { locale } = useI18n()
  const isHi = locale === 'hi'

  const [images, setImages] = useState<ImageAsset[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedImage, setSelectedImage] = useState<ImageAsset | null>(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    fetch('/api/images')
      .then((r) => r.json())
      .then((d) => setImages(d.images || []))
      .catch(() => {
        setImages([])
        setError(isHi ? 'छवियाँ लोड करने में विफल' : 'Failed to load images')
      })
      .finally(() => setLoading(false))
  }, [isHi])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  // ── Derive per-bucket counts from the loaded images ──
  const bucketCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const b of CATEGORY_BUCKETS) counts[b.id] = 0
    counts.other = 0
    if (!images) return counts
    for (const img of images) {
      const bid = resolveBucketId(img.category)
      if (bid) counts[bid] += 1
      else counts.other += 1
    }
    return counts
  }, [images])

  // ── Derived filtered list (client-side) ──
  const filteredImages = useMemo(() => {
    if (!images) return []
    if (selectedCategory === 'all') return images
    if (selectedCategory === 'other') {
      return images.filter((img) => resolveBucketId(img.category) === null)
    }
    return images.filter((img) => resolveBucketId(img.category) === selectedCategory)
  }, [images, selectedCategory])

  const handleImageClick = (img: ImageAsset) => {
    setSelectedImage(img)
    setLightboxOpen(true)
  }

  const handleCloseLightbox = () => {
    setLightboxOpen(false)
    setSelectedImage(null)
  }

  // Build the chip list
  const chips: { id: string; hi: string; en: string; count: number }[] = [
    { ...ALL_BUCKET, count: images?.length ?? 0 },
    ...CATEGORY_BUCKETS.map((b) => ({
      id: b.id,
      hi: b.hi,
      en: b.en,
      count: bucketCounts[b.id] ?? 0,
    })),
  ]
  if ((bucketCounts.other ?? 0) > 0) {
    chips.push({ id: 'other', hi: 'अन्य', en: 'Other', count: bucketCounts.other ?? 0 })
  }

  return (
    <section
      id="gallery"
      data-section="gallery"
      className="section-premium py-16 md:py-20 border-b border-border/40"
    >
      <div className="container mx-auto px-4">
        {/* ── Section Header ── */}
        <ScrollReveal delay={0.1}>
          <div className="text-center mb-10">
            <Badge variant="outline" className="section-header-badge mb-3 gap-1.5">
              <Images className="h-3.5 w-3.5" />
              {isHi ? 'गैलरी' : 'Gallery'}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gradient-premium">
              {isHi ? 'ग्राम चंद्रा — फोटो गैलरी' : 'Gram Chandra — Photo Gallery'}
            </h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              {isHi
                ? 'आधारभूत संरचना, सरकारी योजनाएँ, ग्राम सभा कार्यक्रम, स्वास्थ्य एवं शिक्षा से जुड़ी तस्वीरें'
                : 'Photos of infrastructure, government schemes, gram sabha events, health and education'}
            </p>

            {/* Result count + refresh */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <Badge variant="outline" className="text-[10px] gap-1">
                {isHi
                  ? `${filteredImages.length} में से ${images?.length ?? 0} दिखाई दे रहे हैं`
                  : `Showing ${filteredImages.length} of ${images?.length ?? 0}`}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={load}
                disabled={loading}
                className="gap-1.5 h-8 text-xs"
                aria-label={isHi ? 'पुनः लोड करें' : 'Reload'}
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{isHi ? 'रिफ्रेश' : 'Refresh'}</span>
              </Button>
            </div>
          </div>
        </ScrollReveal>

        {/* ── Category chips ── */}
        <ScrollReveal delay={0.15}>
          <div
            className="mb-8 flex flex-wrap gap-2 justify-center"
            role="group"
            aria-label={isHi ? 'श्रेणी फ़िल्टर' : 'Category filter'}
          >
            {chips.map((c) => {
              const isActive = selectedCategory === c.id
              return (
                <Button
                  key={c.id}
                  type="button"
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(c.id)}
                  className="h-8 px-3 text-xs gap-1.5"
                  aria-pressed={isActive}
                >
                  {isHi ? c.hi : c.en}
                  <Badge
                    variant={isActive ? 'secondary' : 'outline'}
                    className="text-[9px] px-1.5 py-0 h-4 min-w-[1rem] flex items-center justify-center"
                  >
                    {c.count}
                  </Badge>
                </Button>
              )
            })}
          </div>
        </ScrollReveal>

        {/* ── Grid / States ── */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card-premium rounded-xl overflow-hidden">
                <Skeleton className="aspect-[4/3] w-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-10 text-center text-sm text-destructive flex flex-col items-center gap-2 border border-destructive/20 rounded-xl bg-destructive/5">
            <ImageOff className="h-6 w-6 opacity-60" />
            {error}
            <Button variant="outline" size="sm" onClick={load} className="mt-2 gap-1.5 h-8">
              <RefreshCw className="h-3.5 w-3.5" />
              {isHi ? 'पुनः प्रयास करें' : 'Try again'}
            </Button>
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground flex flex-col items-center gap-3 border border-dashed border-border/70 rounded-xl bg-secondary/30">
            <Images className="h-10 w-10 opacity-40" />
            <div className="font-medium">
              {isHi ? 'कोई चित्र उपलब्ध नहीं' : 'No images available'}
            </div>
            <div className="text-xs text-muted-foreground/80">
              {isHi
                ? 'इस श्रेणी में अभी कोई तस्वीर नहीं है। कृपया कोई अन्य श्रेणी चुनें।'
                : 'No photos in this category yet. Please pick another category.'}
            </div>
            {selectedCategory !== 'all' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCategory('all')}
                className="mt-1 h-8 text-xs gap-1.5"
              >
                {isHi ? 'सभी देखें' : 'View all'}
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredImages.map((img, idx) => {
              const bucketId = resolveBucketId(img.category)
              const bucket = CATEGORY_BUCKETS.find((b) => b.id === bucketId)
              const bucketLabel = bucket
                ? isHi
                  ? bucket.hi
                  : bucket.en
                : isHi
                  ? 'अन्य'
                  : 'Other'
              const badgeStyle = bucketId
                ? BUCKET_BADGE_STYLES[bucketId]
                : UNKNOWN_BADGE_STYLE
              const caption = isHi ? img.hiCaption : img.enCaption
              const altCaption = isHi ? img.enCaption : img.hiCaption

              return (
                <motion.button
                  key={img.imageId}
                  type="button"
                  onClick={() => handleImageClick(img)}
                  initial={{ opacity: 0, y: 16, scale: 0.97 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{
                    duration: 0.4,
                    ease: 'easeOut',
                    delay: Math.min(idx * 0.04, 0.4),
                  }}
                  className="card-premium rounded-xl overflow-hidden group relative text-left block w-full hover-lift"
                  aria-label={isHi ? `तस्वीर देखें: ${img.hiCaption}` : `View image: ${img.enCaption}`}
                >
                  {/* Image with blur-up placeholder */}
                  <BlurImage
                    src={img.url}
                    alt={caption}
                    loading="lazy"
                    aspectClassName="aspect-[4/3]"
                    containerClassName="group-hover:scale-105 transition-transform duration-500"
                  />
                    {/* Top-left category badge */}
                    <span
                      className={`absolute top-2 left-2 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium backdrop-blur-sm ${badgeStyle}`}
                    >
                      {bucketLabel}
                    </span>
                    {/* Top-right "View" affordance — appears on hover */}
                    <span className="absolute top-2 right-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-background/85 backdrop-blur opacity-0 transition-opacity duration-200 group-hover:opacity-100 text-foreground">
                      <Maximize2 className="h-3.5 w-3.5" />
                    </span>
                    {/* Bottom gradient + caption */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-8">
                      <div className="text-xs font-medium text-white line-clamp-2 leading-snug drop-shadow-sm">
                        {caption}
                      </div>
                      {altCaption && altCaption !== caption && (
                        <div className="text-[10px] text-white/70 line-clamp-1 mt-0.5">
                          {altCaption}
                        </div>
                      )}
                    </div>
                </motion.button>
              )
            })}
          </div>
        )}

        {/* ── Lightbox ── */}
        <ImageLightbox image={selectedImage} open={lightboxOpen} onClose={handleCloseLightbox} />
      </div>
    </section>
  )
}
