'use client'
// Village Marketplace — Task 10-a
// Public portal section where citizens browse local produce/items for sale/exchange.
import { useEffect, useState, useMemo } from 'react'
import { useI18n } from '@/lib/i18n'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { ScrollReveal } from './ScrollReveal'
import {
  Store,
  Package,
  PawPrint,
  Palette,
  Wrench,
  HandshakeIcon,
  Ellipsis,
  Phone,
  IndianRupee,
  Search,
  ShoppingCart,
  TrendingUp,
  Calendar,
  Layers,
  Loader2,
} from 'lucide-react'

// ── Category metadata ───────────────────────────────────────────────────
const CATEGORIES = [
  { key: 'all', hi: 'सभी', en: 'All', emoji: '🛒', icon: Store, color: 'bg-primary/10 text-primary border-primary/30' },
  { key: 'produce', hi: 'उपज', en: 'Produce', emoji: '🌾', icon: Package, color: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-200 dark:border-green-700' },
  { key: 'livestock', hi: 'पशु', en: 'Livestock', emoji: '🐐', icon: PawPrint, color: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-700' },
  { key: 'handcraft', hi: 'हस्तकला', en: 'Handcraft', emoji: '🧺', icon: Palette, color: 'bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-900/30 dark:text-rose-200 dark:border-rose-700' },
  { key: 'equipment', hi: 'उपकरण', en: 'Equipment', emoji: '🔧', icon: Wrench, color: 'bg-teal-100 text-teal-700 border-teal-300 dark:bg-teal-900/30 dark:text-teal-200 dark:border-teal-700' },
  { key: 'services', hi: 'सेवा', en: 'Services', emoji: '🤝', icon: HandshakeIcon, color: 'bg-violet-100 text-violet-700 border-violet-300 dark:bg-violet-900/30 dark:text-violet-200 dark:border-violet-700' },
  { key: 'other', hi: 'अन्य', en: 'Other', emoji: '📦', icon: Ellipsis, color: 'bg-stone-100 text-stone-700 border-stone-300 dark:bg-stone-900/30 dark:text-stone-200 dark:border-stone-700' },
]

const PRICE_TYPES = [
  { key: 'fixed', hi: 'निर्धारित', en: 'Fixed', color: 'bg-primary/10 text-primary border-primary/30' },
  { key: 'negotiable', hi: 'परक्रमणीय', en: 'Negotiable', color: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-700' },
  { key: 'barter', hi: 'विनिमय', en: 'Barter', color: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-200 dark:border-green-700' },
  { key: 'free', hi: 'मुक्त', en: 'Free', color: 'bg-teal-100 text-teal-700 border-teal-300 dark:bg-teal-900/30 dark:text-teal-200 dark:border-teal-700' },
]

// ── Category emoji/color swatches ───────────────────────────────────
const CATEGORY_SWATCH: Record<string, { emoji: string; bg: string }> = {
  produce: { emoji: '🌾', bg: 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/40' },
  livestock: { emoji: '🐐', bg: 'bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/40' },
  handcraft: { emoji: '🧺', bg: 'bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-900/40' },
  equipment: { emoji: '🔧', bg: 'bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-900/40' },
  services: { emoji: '🤝', bg: 'bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-900/20 dark:to-violet-900/40' },
  other: { emoji: '📦', bg: 'bg-gradient-to-br from-stone-50 to-stone-100 dark:from-stone-900/20 dark:to-stone-900/40' },
}

// ── Item type ──────────────────────────────────────────────────────────
interface MarketplaceItem {
  id: string
  itemId: string
  titleHi: string
  titleEn: string
  descHi: string | null
  descEn: string | null
  category: string
  price: number | null
  priceType: string
  quantity: string | null
  sellerNameHi: string
  sellerNameEn: string
  sellerPhone: string
  sellerWard: number | null
  imageUrl: string | null
  isApproved: boolean
  status: string
  createdAt: string
  updatedAt: string
}

interface MarketplaceStats {
  total: number
  categories: number
  active: number
  thisWeek: number
}

// ── Price display helper ───────────────────────────────────────────────
function formatPrice(price: number | null, priceType: string, isHi: boolean): string {
  if (priceType === 'free') return isHi ? 'मुक्त' : 'Free'
  if (priceType === 'barter') return isHi ? `₹${price ?? 0} (विनिमय)` : `₹${price ?? 0} (Barter)`
  if (price === null) return isHi ? 'निर्धारित नहीं' : 'Not specified'
  const formatted = price.toLocaleString('en-IN')
  if (priceType === 'negotiable') return `₹${formatted}${isHi ? ' (परक्रमणीय)' : ' (Neg.)'}`
  return `₹${formatted}`
}

// ── Component ──────────────────────────────────────────────────────────
export function VillageMarketplace() {
  const { locale } = useI18n()
  const isHi = locale === 'hi'

  const [items, setItems] = useState<MarketplaceItem[]>([])
  const [stats, setStats] = useState<MarketplaceStats>({ total: 0, categories: 0, active: 0, thisWeek: 0 })
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [priceTypeFilter, setPriceTypeFilter] = useState<string | null>(null)

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (categoryFilter !== 'all') params.set('category', categoryFilter)
        const r = await fetch(`/api/marketplace?${params.toString()}`, { cache: 'no-store' })
        if (!r.ok) throw new Error('fetch_failed')
        const d = await r.json()
        setItems(d.items || [])
        setStats(d.stats || { total: 0, categories: 0, active: 0, thisWeek: 0 })
      } catch {
        setItems([])
      } finally {
        setLoading(false)
      }
    }
    fetchItems()
  }, [categoryFilter])

  // Client-side priceType filter
  const filteredItems = useMemo(() => {
    if (!priceTypeFilter) return items
    return items.filter((i) => i.priceType === priceTypeFilter)
  }, [items, priceTypeFilter])

  const getCategoryMeta = (key: string) =>
    CATEGORIES.find((c) => c.key === key) || CATEGORIES[CATEGORIES.length - 1]

  const getPriceTypeMeta = (key: string) =>
    PRICE_TYPES.find((p) => p.key === key) || PRICE_TYPES[0]

  // ── Stat cards ─────────────────────────────────────────────────────
  const statCards = [
    { key: 'total', label: isHi ? 'कुल लिस्टिंग' : 'Total Listings', value: stats.total, icon: ShoppingCart, tint: 'bg-primary/10 text-primary' },
    { key: 'categories', label: isHi ? 'श्रेणियाँ' : 'Categories', value: stats.categories, icon: Layers, tint: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-200' },
    { key: 'active', label: isHi ? 'सक्रिय' : 'Active', value: stats.active, icon: TrendingUp, tint: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200' },
    { key: 'thisWeek', label: isHi ? 'इस सप्ताह' : 'This Week', value: stats.thisWeek, icon: Calendar, tint: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-200' },
  ]

  return (
    <section
      data-section="marketplace"
      id="marketplace"
      className="section-premium py-16 md:py-20 border-b border-border/40"
    >
      <div className="container mx-auto max-w-6xl">
        {/* ── Section header ─────────────────────────────────────────── */}
        <ScrollReveal>
          <div className="text-center mb-10">
            <Badge variant="outline" className="section-header-badge mb-3 gap-1.5">
              <Store className="h-3.5 w-3.5" />
              {isHi ? 'बाजार' : 'Market'}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gradient-premium">
              {isHi ? 'ग्राम बाजार' : 'Village Marketplace'}
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              {isHi
                ? 'ग्राम चंद्रा के नागरिकों की स्थानीय उपज, हस्तकला और सेवाओं का बाजार'
                : 'Local produce, handcraft & services marketplace from citizens of village Chandra'}
            </p>
          </div>
        </ScrollReveal>

        {/* ── Stat cards ─────────────────────────────────────────────── */}
        <ScrollReveal delay={0.08}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {statCards.map((c) => {
              const Icon = c.icon
              return (
                <Card key={c.key} className="card-premium rounded-xl hover-lift transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{c.label}</span>
                      <div className={`h-7 w-7 rounded-lg grid place-items-center ${c.tint}`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold tabular-nums">{c.value}</div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </ScrollReveal>

        {/* ── Category filter chips ─────────────────────────────────── */}
        <ScrollReveal delay={0.12}>
          <div className="flex flex-wrap items-center gap-2 mb-4 justify-center">
            <span className="text-xs font-medium text-muted-foreground mr-1">
              <Search className="h-3 w-3 inline mr-1" />
              {isHi ? 'श्रेणी:' : 'Category:'}
            </span>
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon
              const active = categoryFilter === cat.key
              return (
                <button
                  key={cat.key}
                  className={`px-3 py-1.5 text-xs rounded-full border transition-all gap-1 inline-flex items-center ${active ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border hover:border-primary/40'}`}
                  aria-pressed={active}
                  onClick={() => setCategoryFilter(cat.key)}
                >
                  <Icon className="h-3 w-3" />
                  {isHi ? cat.hi : cat.en}
                  <span className="text-[10px] ml-0.5">{cat.emoji}</span>
                </button>
              )
            })}
          </div>
        </ScrollReveal>

        {/* ── Price type filter chips ────────────────────────────────── */}
        <ScrollReveal delay={0.16}>
          <div className="flex flex-wrap items-center gap-2 mb-8 justify-center">
            <span className="text-xs font-medium text-muted-foreground mr-1">
              <IndianRupee className="h-3 w-3 inline mr-1" />
              {isHi ? 'मूल्य प्रकार:' : 'Price type:'}
            </span>
            <button
              className={`px-3 py-1.5 text-xs rounded-full border transition-all ${!priceTypeFilter ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border hover:border-primary/40'}`}
              aria-pressed={!priceTypeFilter}
              onClick={() => setPriceTypeFilter(null)}
            >
              {isHi ? 'सभी' : 'All'}
            </button>
            {PRICE_TYPES.map((pt) => {
              const active = priceTypeFilter === pt.key
              return (
                <button
                  key={pt.key}
                  className={`px-3 py-1.5 text-xs rounded-full border transition-all ${active ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border hover:border-primary/40'}`}
                  aria-pressed={active}
                  onClick={() => setPriceTypeFilter(pt.key)}
                >
                  {isHi ? pt.hi : pt.en}
                </button>
              )
            })}
          </div>
        </ScrollReveal>

        {/* ── Loading skeleton ───────────────────────────────────────── */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="card-premium rounded-xl overflow-hidden">
                <div className="h-24 bg-secondary/50" />
                <CardContent className="p-4 space-y-2">
                  <div className="h-4 w-3/4 bg-secondary/50 rounded" />
                  <div className="h-3 w-1/2 bg-secondary/50 rounded" />
                  <div className="h-3 w-2/3 bg-secondary/50 rounded" />
                  <div className="h-8 w-full bg-secondary/50 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* ── Empty state ───────────────────────────────────────────── */}
        {!loading && filteredItems.length === 0 && (
          <Card className="card-premium border-dashed rounded-xl">
            <CardContent className="py-16 flex flex-col items-center justify-center gap-3 text-center">
              <div className="h-16 w-16 rounded-full bg-muted/60 grid place-items-center">
                <Store className="h-8 w-8 text-muted-foreground/60" />
              </div>
              <div>
                <p className="text-base font-medium text-foreground">
                  {isHi ? 'कोई लिस्टिंग उपलब्ध नहीं' : 'No listings available'}
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  {isHi
                    ? 'इस श्रेणी में अभी कोई बाजार लिस्टिंग नहीं है।'
                    : 'No marketplace listings in this category at the moment.'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Item grid ─────────────────────────────────────────────── */}
        {!loading && filteredItems.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, idx) => {
              const catMeta = getCategoryMeta(item.category)
              const ptMeta = getPriceTypeMeta(item.priceType)
              const swatch = CATEGORY_SWATCH[item.category] || CATEGORY_SWATCH.other
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: idx * 0.04, ease: 'easeOut' }}
                >
                  <Card className="card-premium overflow-hidden rounded-xl hover-lift-lg transition-all h-full flex flex-col">
                    {/* ── Image placeholder / top section ── */}
                    <div className={`h-28 relative grid place-items-center ${swatch.bg}`}>
                      <span className="text-4xl select-none">{swatch.emoji}</span>
                      {/* Category badge */}
                      <Badge variant="outline" className={`absolute top-2 left-2 text-[10px] gap-1 ${catMeta.color}`}>
                        {catMeta.emoji} {isHi ? catMeta.hi : catMeta.en}
                      </Badge>
                      {/* Price badge */}
                      <Badge variant="outline" className={`absolute top-2 right-2 text-[10px] gap-1 ${ptMeta.color}`}>
                        <IndianRupee className="h-2.5 w-2.5" />
                        {formatPrice(item.price, item.priceType, isHi)}
                      </Badge>
                    </div>

                    <CardContent className="p-4 flex-1 flex flex-col gap-2">
                      {/* Title bilingual */}
                      <div>
                        <h3 className="font-semibold text-sm leading-tight line-clamp-1 text-foreground">
                          {isHi ? item.titleHi : item.titleEn}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {isHi ? item.titleEn : item.titleHi}
                        </p>
                      </div>

                      {/* Description bilingual */}
                      {(item.descHi || item.descEn) && (
                        <p className="text-xs text-muted-foreground/80 line-clamp-2">
                          {isHi ? (item.descHi || item.descEn) : (item.descEn || item.descHi)}
                        </p>
                      )}

                      {/* Seller info */}
                      <div className="flex items-center gap-2 mt-auto">
                        <div className="h-7 w-7 rounded-full bg-primary/10 text-primary grid place-items-center text-[10px] font-bold">
                          {(isHi ? item.sellerNameHi : item.sellerNameEn).charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-foreground truncate">
                            {isHi ? item.sellerNameHi : item.sellerNameEn}
                          </p>
                          {item.sellerWard && (
                            <Badge variant="outline" className="text-[9px] h-4 px-1.5 bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-700">
                              {isHi ? `वार्ड ${item.sellerWard}` : `Ward ${item.sellerWard}`}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Bottom row: quantity + contact button */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40">
                        {item.quantity && (
                          <span className="text-[10px] text-muted-foreground truncate">
                            {item.quantity}
                          </span>
                        )}
                        <Button
                          variant="default"
                          size="sm"
                          className="gap-1 text-xs h-7 shadow-sm ml-auto"
                          onClick={() => window.open(`tel:${item.sellerPhone}`)}
                        >
                          <Phone className="h-3 w-3" />
                          {isHi ? 'विक्रेता से संपर्क' : 'Contact Seller'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
