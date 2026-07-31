'use client'
// Image manager — grid of all images with inline edit + isPublic toggle.
// Includes client-side search by filename/caption/imageId + status filter (all/public/private) + category filter (high-level bucket).
import { useEffect, useState, useCallback, useMemo } from 'react'
import { useI18n } from '@/lib/i18n'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Eye, EyeOff, ImageOff, Loader2, Pencil, Save, Search } from 'lucide-react'
import { IMAGE_CATEGORIES } from './lib'
import { ImageUploadDialog } from './ImageUploadDialog'

interface ImageAsset {
  id: string
  imageId: string
  filename: string
  url: string
  category: string
  hiCaption: string
  enCaption: string
  isPublic: boolean
  updatedAt: string
}

// ── High-level category buckets (prefix matcher) ──
// The actual DB categories use dot-notation like 'infrastructure.water.handpump',
// 'scheme.pmay-g', 'event.gram-sabha'. We expose the 5 high-level buckets for
// easier admin filtering.
type CategoryBucket = 'all' | 'infrastructure' | 'scheme' | 'event' | 'health' | 'education'

const CATEGORY_BUCKET_OPTIONS: { id: CategoryBucket; hi: string; en: string }[] = [
  { id: 'all', hi: 'सभी श्रेणियाँ', en: 'All categories' },
  { id: 'infrastructure', hi: 'आधारभूत संरचना', en: 'Infrastructure' },
  { id: 'scheme', hi: 'योजना', en: 'Scheme' },
  { id: 'event', hi: 'कार्यक्रम', en: 'Event' },
  { id: 'health', hi: 'स्वास्थ्य', en: 'Health' },
  { id: 'education', hi: 'शिक्षा', en: 'Education' },
]

function matchBucket(category: string, bucket: CategoryBucket): boolean {
  if (bucket === 'all') return true
  // health & education also pull in related infrastructure.* subcategories
  // so admins see anganwadi/school images under those filters.
  if (bucket === 'health') {
    return category.startsWith('health') || category.startsWith('infrastructure.anganwadi')
  }
  if (bucket === 'education') {
    return category.startsWith('education') || category.startsWith('infrastructure.school')
  }
  return category.startsWith(bucket)
}

type StatusFilter = 'all' | 'public' | 'private'

export function ImageManager() {
  const { locale } = useI18n()
  const [images, setImages] = useState<ImageAsset[] | null>(null)
  const [loading, setLoading] = useState(true)
  // ── Client-side search & filter state ──
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('all')
  const [filterCategory, setFilterCategory] = useState<CategoryBucket>('all')

  const load = useCallback(() => {
    fetch('/api/images')
      .then(r => r.json())
      .then(d => setImages(d.images || []))
      .catch(() => { setImages([]); toast.error(locale === 'hi' ? 'छवियाँ लोड विफल' : 'Image load failed') })
      .finally(() => setLoading(false))
  }, [locale])

  useEffect(() => { load() }, [load])

  // ── Derived filtered list (client-side) ──
  const filteredImages = useMemo(() => {
    if (!images) return []
    const q = searchQuery.trim().toLowerCase()
    return images.filter((img) => {
      if (q) {
        const hay = `${img.filename} ${img.hiCaption} ${img.enCaption} ${img.imageId}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (filterStatus === 'public' && !img.isPublic) return false
      if (filterStatus === 'private' && img.isPublic) return false
      if (!matchBucket(img.category, filterCategory)) return false
      return true
    })
  }, [images, searchQuery, filterStatus, filterCategory])

  const totalCount = images?.length ?? 0
  const visibleCount = filteredImages.length
  const hasActiveFilters = searchQuery !== '' || filterStatus !== 'all' || filterCategory !== 'all'

  const resetFilters = () => {
    setSearchQuery('')
    setFilterStatus('all')
    setFilterCategory('all')
  }

  const patch = async (imageId: string, body: Record<string, unknown>, successMsgHi: string, successMsgEn: string) => {
    try {
      const r = await fetch('/api/images', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageId, ...body }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'patch_failed')
      setImages(prev => prev?.map(img => img.imageId === imageId ? { ...img, ...body } as ImageAsset : img) || null)
      toast.success(locale === 'hi' ? successMsgHi : successMsgEn)
    } catch (e) {
      toast.error(locale === 'hi' ? 'अपडेट विफल' : 'Update failed', { description: (e as Error).message })
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
      </div>
    )
  }

  if (!images || images.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
          <ImageOff className="h-6 w-6 opacity-50" />
          {locale === 'hi' ? 'अभी तक कोई छवि नहीं।' : 'No images yet.'}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold section-heading">
            {locale === 'hi' ? 'गैलरी प्रबंधक' : 'Gallery Manager'}
          </h2>
          <p className="text-xs text-muted-foreground mt-2">
            {locale === 'hi'
              ? `${images.length} छवियाँ — कैप्शन, श्रेणी एवं दृश्यता संपादित करें।`
              : `${images.length} images — edit captions, category, and visibility.`}
          </p>
        </div>
        <ImageUploadDialog onUploaded={load} />
      </div>

      {/* ── Search & filter bar ── */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto] gap-3 items-center">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={locale === 'hi'
              ? 'फ़ाइल नाम, कैप्शन या छवि आईडी खोजें...'
              : 'Search filename, caption, or image ID...'}
            className="pl-8 text-xs h-9"
            aria-label={locale === 'hi' ? 'खोज' : 'Search'}
          />
        </div>
        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as StatusFilter)}>
          <SelectTrigger className="text-xs h-9 w-[140px]">
            <SelectValue placeholder={locale === 'hi' ? 'स्थिति' : 'Status'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">{locale === 'hi' ? 'सभी' : 'All'}</SelectItem>
            <SelectItem value="public" className="text-xs">{locale === 'hi' ? 'सार्वजनिक' : 'Public'}</SelectItem>
            <SelectItem value="private" className="text-xs">{locale === 'hi' ? 'निजी' : 'Private'}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v as CategoryBucket)}>
          <SelectTrigger className="text-xs h-9 w-[180px]">
            <SelectValue placeholder={locale === 'hi' ? 'श्रेणी' : 'Category'} />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_BUCKET_OPTIONS.map((opt) => (
              <SelectItem key={opt.id} value={opt.id} className="text-xs">
                {locale === 'hi' ? opt.hi : opt.en}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Badge variant="outline" className="text-[10px] gap-1 whitespace-nowrap h-9 px-2.5 inline-flex items-center justify-center">
          {locale === 'hi'
            ? `${visibleCount} में से ${totalCount} दिखाई दे रहे हैं`
            : `Showing ${visibleCount} of ${totalCount}`}
        </Badge>
      </div>

      {/* ── Grid or empty state ── */}
      {filteredImages.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-10 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
            <ImageOff className="h-6 w-6 opacity-50" />
            <div>
              {locale === 'hi' ? 'कोई छवि नहीं मिली।' : 'No images found.'}
              <span className="text-muted-foreground/70 font-normal">
                {' / '}
                {locale === 'hi' ? 'No images found.' : 'कोई छवि नहीं मिली।'}
              </span>
            </div>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="mt-1 h-8 text-xs gap-1.5"
              >
                {locale === 'hi' ? 'फ़िल्टर रीसेट करें' : 'Reset filters'}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredImages.map(img => (
            <ImageCard key={img.imageId} img={img} locale={locale} onPatch={patch} />
          ))}
        </div>
      )}
    </div>
  )
}

function ImageCard({
  img,
  locale,
  onPatch,
}: {
  img: ImageAsset
  locale: 'hi' | 'en'
  onPatch: (id: string, body: Record<string, unknown>, hi: string, en: string) => Promise<void>
}) {
  const [editOpen, setEditOpen] = useState(false)
  const [hi, setHi] = useState(img.hiCaption)
  const [en, setEn] = useState(img.enCaption)
  const [cat, setCat] = useState(img.category)
  const [saving, setSaving] = useState(false)

  // Reset local edits whenever the dialog opens (derives fresh state from latest img props)
  const openEdit = (open: boolean) => {
    if (open) {
      setHi(img.hiCaption); setEn(img.enCaption); setCat(img.category)
    }
    setEditOpen(open)
  }

  const saveEdits = async () => {
    setSaving(true)
    await onPatch(img.imageId, { hiCaption: hi, enCaption: en, category: cat },
      'कैप्शन सहेजे गए', 'Captions saved')
    setSaving(false)
    setEditOpen(false)
  }

  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="relative aspect-video bg-muted">
        <img src={img.url} alt={locale === 'hi' ? img.hiCaption : img.enCaption} className="h-full w-full object-cover" loading="lazy" />
        <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
          {img.isPublic ? (
            <Badge variant="outline" className="bg-background/90 text-[10px] gap-1"><Eye className="h-3 w-3" />{locale === 'hi' ? 'सार्वजनिक' : 'Public'}</Badge>
          ) : (
            <Badge variant="outline" className="bg-background/90 text-[10px] gap-1"><EyeOff className="h-3 w-3" />{locale === 'hi' ? 'निजी' : 'Private'}</Badge>
          )}
        </div>
        <div className="absolute bottom-1.5 left-1.5">
          <Badge variant="outline" className="bg-background/90 text-[10px] font-mono">{img.imageId}</Badge>
        </div>
      </div>

      <CardContent className="p-3 space-y-2 flex-1 flex flex-col">
        <div className="text-xs font-medium line-clamp-2">{locale === 'hi' ? img.hiCaption : img.enCaption}</div>
        <div className="text-[10px] text-muted-foreground font-mono truncate">{img.category}</div>

        <div className="flex items-center gap-2 pt-1">
          <Label htmlFor={`pub-${img.imageId}`} className="text-[11px] text-muted-foreground">
            {locale === 'hi' ? 'सार्वजनिक' : 'Public'}
          </Label>
          <Switch
            id={`pub-${img.imageId}`}
            checked={img.isPublic}
            onCheckedChange={(checked) => onPatch(img.imageId, { isPublic: checked },
              checked ? 'सार्वजनिक किया गया' : 'निजी किया गया',
              checked ? 'Made public' : 'Made private')}
          />
        </div>

        <Dialog open={editOpen} onOpenChange={openEdit}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="w-full gap-1.5 mt-auto">
              <Pencil className="h-3.5 w-3.5" />
              {locale === 'hi' ? 'संपादित करें' : 'Edit'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base">
                <Pencil className="h-4 w-4 text-primary" />
                {locale === 'hi' ? 'छवि संपादित करें' : 'Edit Image'}
                <span className="text-xs font-mono text-muted-foreground">{img.imageId}</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <img src={img.url} alt="" className="w-full aspect-video object-cover rounded-md" />
              <div className="space-y-1.5">
                <Label className="text-xs">{locale === 'hi' ? 'कैप्शन (हिंदी)' : 'Caption (Hindi)'}</Label>
                <Input value={hi} onChange={(e) => setHi(e.target.value)} className="text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{locale === 'hi' ? 'कैप्शन (अंग्रेज़ी)' : 'Caption (English)'}</Label>
                <Input value={en} onChange={(e) => setEn(e.target.value)} className="text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{locale === 'hi' ? 'श्रेणी' : 'Category'}</Label>
                <Select value={cat} onValueChange={setCat}>
                  <SelectTrigger className="w-full text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {IMAGE_CATEGORIES.map(c => <SelectItem key={c} value={c} className="text-xs font-mono">{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditOpen(false)}>{locale === 'hi' ? 'रद्द करें' : 'Cancel'}</Button>
              <Button onClick={saveEdits} disabled={saving} className="gap-1.5">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {locale === 'hi' ? 'सहेजें' : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
