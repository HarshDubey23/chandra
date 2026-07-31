'use client'
import { useEffect, useState, useMemo } from 'react'
import { useI18n } from '@/lib/i18n'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Droplets, School, Baby, Route, Home, Sun, Building2, Hammer, CalendarDays, Image as ImageIcon, Lock, Camera, GraduationCap, HeartPulse, Zap, Bath, TreePine, Mail, ShoppingBasket, Landmark, CheckCircle2, Clock, ClipboardList } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { ScrollReveal } from './ScrollReveal'
import { ImageLightbox } from './ImageLightbox'

/* ──────────────────────────────────────────────────────────────────────
   Infrastructure — Gram Panchayat Chandra
   Merged: Photo gallery with tabs + Facilities Overview (FacilitiesSection)
   ────────────────────────────────────────────────────────────────────── */

// ── Image assets for gallery ──
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

const SECTIONS = [
  { id: 'water-infrastructure', labelHi: 'जल आपूर्ति', labelEn: 'Water', icon: Droplets, prefix: 'infrastructure.water' },
  { id: 'school', labelHi: 'विद्यालय', labelEn: 'School', icon: School, prefix: 'infrastructure.school' },
  { id: 'anganwadi', labelHi: 'आंगनवाड़ी', labelEn: 'Anganwadi', icon: Baby, prefix: 'infrastructure.anganwadi' },
  { id: 'road', labelHi: 'सड़क एवं नाली', labelEn: 'Roads', icon: Route, prefix: 'infrastructure.road' },
  { id: 'housing', labelHi: 'आवास', labelEn: 'Housing', icon: Home, prefix: 'scheme.pmay-g' },
  { id: 'power', labelHi: 'विद्युत', labelEn: 'Power', icon: Sun, prefix: 'infrastructure.power' },
  { id: 'civic', labelHi: 'सामाजिक', labelEn: 'Civic', icon: Building2, prefix: 'infrastructure.civic' },
  { id: 'mgnrega', labelHi: 'मनरेगा', labelEn: 'MGNREGA', icon: Hammer, prefix: 'scheme.mgnrega' },
  { id: 'events', labelHi: 'कार्यक्रम', labelEn: 'Events', icon: CalendarDays, prefix: 'event' },
]

// ── Facility data (from FacilitiesSection) ──
type FacilityStatus = 'available' | 'in-progress' | 'planned'

interface Facility {
  key: string
  nameHi: string
  nameEn: string
  Icon: typeof Building2
  status: FacilityStatus
  detailHi: string
  detailEn: string
}

const FACILITIES: Facility[] = [
  { key: 'panchayat-bhawan', nameHi: 'पंचायत भवन', nameEn: 'Panchayat Bhawan', Icon: Building2, status: 'available', detailHi: 'ग्राम पंचायत का मुख्य प्रशासनिक भवन', detailEn: 'Main administrative building of the Gram Panchayat' },
  { key: 'primary-school', nameHi: 'प्राथमिक विद्यालय', nameEn: 'Primary School', Icon: GraduationCap, status: 'available', detailHi: 'प्राथमिक विद्यालय चंद्रा खास', detailEn: 'Primary School Chandra Khas' },
  { key: 'anganwadi', nameHi: 'आंगनवाड़ी केंद्र', nameEn: 'Anganwadi Center', Icon: Baby, status: 'available', detailHi: 'बाल विकास एवं पोषण सेवा केंद्र', detailEn: 'Child development & nutrition service center' },
  { key: 'health-center', nameHi: 'स्वास्थ्य केंद्र', nameEn: 'Health Sub-Center', Icon: HeartPulse, status: 'available', detailHi: 'ANM — स्वास्थ्य सेवा', detailEn: 'ANM — health services' },
  { key: 'water-supply', nameHi: 'जल आपूर्ति (JJM)', nameEn: 'Water Supply (JJM)', Icon: Droplets, status: 'in-progress', detailHi: 'जल जीवन मिशन — हर घर नल का जल', detailEn: 'Jal Jeevan Mission — tap water to every home' },
  { key: 'road', nameHi: 'सड़क', nameEn: 'Road Connectivity', Icon: Route, status: 'available', detailHi: 'शंकरगढ़ — 8 किमी, प्रयागराज — 45 किमी', detailEn: 'Shankargarh — 8 km, Prayagraj — 45 km' },
  { key: 'electricity', nameHi: 'बिजली', nameEn: 'Electricity', Icon: Zap, status: 'available', detailHi: 'विद्युत आपूर्ति — घर घर बिजली', detailEn: 'Electricity supply — power to every home' },
  { key: 'public-toilet', nameHi: 'सार्वजनिक शौचालय (SBM)', nameEn: 'Public Toilets (SBM)', Icon: Bath, status: 'available', detailHi: 'स्वच्छ भारत मिशन — सार्वजनिक शौचालय', detailEn: 'Swachh Bharat Mission — public sanitation' },
  { key: 'playground', nameHi: 'खेल का मैदान', nameEn: 'Playground', Icon: TreePine, status: 'planned', detailHi: 'बाल खेल मैदान — निर्माण योजना में', detailEn: 'Children playground — under planning' },
  { key: 'post-office', nameHi: 'डाक घर', nameEn: 'Post Office', Icon: Mail, status: 'available', detailHi: 'शंकरगढ़ डाक घर — 8 किमी', detailEn: 'Shankargarh Post Office — 8 km' },
  { key: 'ration-shop', nameHi: 'राशन दुकान (PDS)', nameEn: 'PDS Shop', Icon: ShoppingBasket, status: 'available', detailHi: 'सार्वजनिक वितरन प्रणाली — राशन वितरण', detailEn: 'Public Distribution System — ration distribution' },
  { key: 'banking', nameHi: 'बैंक सेवा (BC)', nameEn: 'Banking (BC)', Icon: Landmark, status: 'in-progress', detailHi: 'बैंकिंग संवाहक — वित्तीय सेवा', detailEn: 'Banking Correspondent — financial services' },
]

const STATUS_CONFIG: Record<FacilityStatus, {
  labelHi: string; labelEn: string; variant: 'default' | 'secondary' | 'outline'; Icon: typeof CheckCircle2; color: string
}> = {
  'available': { labelHi: 'उपलब्ध', labelEn: 'Available', variant: 'default', Icon: CheckCircle2, color: '#16a34a' },
  'in-progress': { labelHi: 'प्रगति में', labelEn: 'In Progress', variant: 'secondary', Icon: Clock, color: '#d97706' },
  'planned': { labelHi: 'योजना में', labelEn: 'Planned', variant: 'outline', Icon: ClipboardList, color: '#78716c' },
}

export function Infrastructure() {
  const { locale } = useI18n()
  const hi = locale === 'hi'
  const [images, setImages] = useState<ImageAsset[]>([])
  const [activeTab, setActiveTab] = useState('all')
  const [selectedImage, setSelectedImage] = useState<ImageAsset | null>(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  useEffect(() => {
    fetch('/api/images').then(r => r.json()).then(d => setImages(d.images || [])).catch(() => {})
  }, [])

  const filtered = useMemo(() => {
    if (activeTab === 'all') return images
    const section = SECTIONS.find(s => s.id === activeTab)
    if (!section) return images
    return images.filter(img => img.category.startsWith(section.prefix) || img.scrollSection === activeTab)
  }, [images, activeTab])

  const grouped = useMemo(() => {
    const g: Record<string, ImageAsset[]> = {}
    for (const img of filtered) {
      const key = img.scrollSection || 'other'
      if (!g[key]) g[key] = []
      g[key].push(img)
    }
    return g
  }, [filtered])

  // Count by status
  const availableCount = FACILITIES.filter(f => f.status === 'available').length
  const inProgressCount = FACILITIES.filter(f => f.status === 'in-progress').length
  const plannedCount = FACILITIES.filter(f => f.status === 'planned').length

  return (
    <section id="infrastructure" className="section-premium py-16 md:py-20 border-b border-border/40">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10">
          <Badge variant="outline" className="section-header-badge mb-3 gap-1.5">
            <ImageIcon className="h-3.5 w-3.5" />
            {hi ? 'आधारभूत संरचना एवं सुविधाएँ' : 'Infrastructure & Facilities'}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gradient-premium">
            {hi ? 'आधारभूत संरचना एवं सुविधाएँ' : 'Infrastructure & Facilities'}
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            {hi
              ? 'पंचायत सुविधाओं की स्थिति एवं दृश्य प्रमाण — भाषा स्विच से कैप्शन बदलें'
              : 'Panchayat facilities status & visual evidence — use language switch to toggle captions'}
          </p>
        </div>

        {/* ── Facilities Overview Card (merged from FacilitiesSection) ── */}
        <ScrollReveal delay={0.05}>
          <Card className="card-premium-bordered overflow-hidden rounded-xl mb-10">
            <CardContent className="p-5 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
                  <Building2 className="h-5 w-5 text-primary" />
                  {hi ? 'सुविधाएँ — सारांश' : 'Facilities Overview'}
                </h3>
                <Badge variant="outline" className="text-[10px] gap-1">
                  {hi ? 'कुल' : 'Total'}: {FACILITIES.length}
                </Badge>
              </div>

              {/* Summary count cards */}
              <div className="mb-5 grid grid-cols-3 gap-3">
                <div className="rounded-lg p-3 text-center bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                  <div className="font-mono text-xl font-bold tabular-nums text-green-600">{availableCount}</div>
                  <div className="text-[10px] font-medium text-green-700 dark:text-green-400">
                    {hi ? 'उपलब्ध' : 'Available'}
                  </div>
                </div>
                <div className="rounded-lg p-3 text-center bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                  <div className="font-mono text-xl font-bold tabular-nums text-amber-600">{inProgressCount}</div>
                  <div className="text-[10px] font-medium text-amber-700 dark:text-amber-400">
                    {hi ? 'प्रगति में' : 'In Progress'}
                  </div>
                </div>
                <div className="rounded-lg p-3 text-center bg-stone-50 dark:bg-stone-950/30 border border-stone-200 dark:border-stone-800">
                  <div className="font-mono text-xl font-bold tabular-nums text-stone-600">{plannedCount}</div>
                  <div className="text-[10px] font-medium text-stone-700 dark:text-stone-400">
                    {hi ? 'योजना में' : 'Planned'}
                  </div>
                </div>
              </div>

              {/* Facility cards grid */}
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                {FACILITIES.map((facility, i) => {
                  const statusConf = STATUS_CONFIG[facility.status]
                  return (
                    <motion.div
                      key={facility.key}
                      initial={{ opacity: 0, y: 12, scale: 0.96 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      viewport={{ once: true, margin: '-30px' }}
                      transition={{ duration: 0.4, delay: 0.1 + i * 0.03, ease: [0.22, 1, 0.36, 1] }}
                      className="group relative overflow-hidden rounded-lg border border-border/60 bg-card p-3 hover:shadow-md transition-all"
                    >
                      {/* Top accent stripe */}
                      <div className="absolute inset-x-0 top-0 h-0.5" style={{ background: statusConf.color }} />
                      <div className="flex flex-col items-center text-center gap-1.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/50 transition-colors group-hover:bg-primary/10">
                          <facility.Icon className="h-4 w-4 text-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <h4 className="text-[11px] font-semibold text-foreground leading-tight">
                          {hi ? facility.nameHi : facility.nameEn}
                        </h4>
                        <Badge variant={statusConf.variant} className="gap-0.5 text-[9px] py-0 px-1.5">
                          <statusConf.Icon className="h-2.5 w-2.5" />
                          {hi ? statusConf.labelHi : statusConf.labelEn}
                        </Badge>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                          {hi ? facility.detailHi : facility.detailEn}
                        </p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
        {/* Featured real-photo highlights */}
        <div className="grid sm:grid-cols-2 gap-6 mb-10">
          <FeaturedPhotoCard
            src="/whatsapp-optimized/IMG-20260725-WA0042.webp"
            icon={Hammer}
            tagHi="वास्तविक तस्वीर / Real photo"
            tagEn="वास्तविक तस्वीर / Real photo"
            titleHi="कुआँ निर्माण — जल स्रोत विकास"
            titleEn="Well construction — water source development"
            captionHi="मनरेगा अंतर्गत ग्राम चंद्रा में नवनिर्मित कुआँ।"
            captionEn="Newly constructed well in Gram Chandra under MGNREGA."
            locale={locale}
          />
          <FeaturedPhotoCard
            src="/whatsapp-optimized/IMG-20260725-WA0020.webp"
            icon={Droplets}
            tagHi="वास्तविक तस्वीर / Real photo"
            tagEn="वास्तविक तस्वीर / Real photo"
            titleHi="जल टैंकर आपूर्ति — पेयजल सुविधा"
            titleEn="Water tanker supply — drinking water service"
            captionHi="ग्राम पंचायत द्वारा वर्षा ऋतु में जल टैंकर आपूर्ति।"
            captionEn="Panchayat-supplied water tanker during dry season."
            locale={locale}
          />
        </div>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex flex-wrap h-auto gap-1 bg-secondary/50 p-1 mb-6 rounded-xl">
            <TabsTrigger value="all" className="text-xs gap-1.5">
              <ImageIcon className="h-3 w-3" />
              {hi ? 'सभी' : 'All'}
              <Badge variant="secondary" className="text-[10px] py-0 px-1.5 ml-1">{images.length}</Badge>
            </TabsTrigger>
            {SECTIONS.map((s) => {
              const Icon = s.icon
              const count = images.filter(img => img.category.startsWith(s.prefix) || img.scrollSection === s.id).length
              if (count === 0) return null
              return (
                <TabsTrigger key={s.id} value={s.id} className="text-xs gap-1.5">
                  <Icon className="h-3 w-3" />
                  {hi ? s.labelHi : s.labelEn}
                  <Badge variant="secondary" className="text-[10px] py-0 px-1.5 ml-1">{count}</Badge>
                </TabsTrigger>
              )
            })}
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{hi ? 'इस श्रेणी में कोई चित्र उपलब्ध नहीं' : 'No images in this category'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filtered.map((img) => (
                  <ImageCard key={img.imageId} img={img} locale={locale} onClick={() => { setSelectedImage(img); setLightboxOpen(true) }} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
        </ScrollReveal>

        {/* Photo Lightbox */}
        <ImageLightbox
          image={selectedImage}
          open={lightboxOpen}
          onClose={() => { setLightboxOpen(false); setSelectedImage(null) }}
        />
      </div>
    </section>
  )
}

function ImageCard({ img, locale, onClick }: { img: ImageAsset; locale: 'hi' | 'en'; onClick?: () => void }) {
  const caption = locale === 'hi' ? img.hiCaption : img.enCaption
  const altCaption = locale === 'hi' ? img.enCaption : img.hiCaption
  const logos = img.schemeLogos ? JSON.parse(img.schemeLogos) as string[] : []
  const chatCtx = img.chatContext ? JSON.parse(img.chatContext) : null
  const geo = img.geoInferred ? JSON.parse(img.geoInferred) : null

  return (
    <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.2 }} onClick={onClick} className="cursor-pointer">
    <Card className="card-premium overflow-hidden rounded-xl group">
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        <img
          src={img.url}
          alt={caption}
          loading="lazy"
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
        />
        {logos.length > 0 && (
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            {logos.map((l) => (
              <Badge key={l} variant="secondary" className="text-[9px] py-0 px-1.5 bg-background/90 backdrop-blur">
                {l}
              </Badge>
            ))}
          </div>
        )}
        <div className="absolute bottom-2 left-2 flex gap-1">
          {img.confidence >= 0.9 && (
            <Badge variant="secondary" className="text-[9px] py-0 px-1.5 bg-background/90 backdrop-blur gap-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              {locale === 'hi' ? 'उच्च' : 'High'}
            </Badge>
          )}
        </div>
      </div>
      <CardContent className="p-3 space-y-2">
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-xs font-medium leading-snug line-clamp-2 cursor-help">
                {caption}
              </p>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[240px]">
              <p className="text-xs">{altCaption}</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {locale === 'hi' ? 'अंग्रेज़ी कैप्शन' : 'Hindi caption'}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="flex flex-wrap gap-1 pt-1 border-t border-border/40">
          <Badge variant="outline" className="text-[9px] py-0 px-1.5 font-mono">
            {img.imageId}
          </Badge>
          {geo && (
            <Badge variant="outline" className="text-[9px] py-0 px-1.5">
              {geo.village}
            </Badge>
          )}
          {img.purpose === 'asset-evidence' && (
            <Badge variant="outline" className="text-[9px] py-0 px-1.5 text-accent-foreground gap-0.5">
              <Lock className="h-2 w-2" />
              {locale === 'hi' ? 'साक्ष्य' : 'evidence'}
            </Badge>
          )}
        </div>

        {chatCtx && (
          <div className="text-[10px] text-muted-foreground bg-secondary/40 rounded p-1.5 line-clamp-2">
            <span className="font-medium">{chatCtx.sender}</span>: &ldquo;{chatCtx.msg_before}&rdquo;
          </div>
        )}
      </CardContent>
    </Card>
    </motion.div>
  )
}

function FeaturedPhotoCard({
  src,
  icon: Icon,
  tagHi,
  tagEn,
  titleHi,
  titleEn,
  captionHi,
  captionEn,
  locale,
}: {
  src: string
  icon: React.ElementType
  tagHi: string
  tagEn: string
  titleHi: string
  titleEn: string
  captionHi: string
  captionEn: string
  locale: 'hi' | 'en'
}) {
  return (
    <Card className="card-premium-bordered overflow-hidden rounded-xl hover-lift-lg group">
      <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
        <img
          src={src}
          alt={(locale === 'hi' ? titleHi : titleEn) + ' — वास्तविक तस्वीर / Real photo'}
          loading="lazy"
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="text-[10px] py-0 px-1.5 bg-background/90 backdrop-blur gap-1 shadow-sm">
            <Icon className="h-3 w-3 text-primary" />
            {locale === 'hi' ? 'आधारभूत संरचना' : 'Infrastructure'}
          </Badge>
        </div>
      </div>
      <CardContent className="p-4 space-y-1.5">
        <h4 className="text-sm font-semibold leading-snug">
          {locale === 'hi' ? titleHi : titleEn}
        </h4>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {locale === 'hi' ? captionHi : captionEn}
        </p>
        <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-border/40">
          <span className="text-[10px] text-green-700 dark:text-green-400 font-medium inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
            {locale === 'hi' ? tagHi : tagEn}
          </span>
          <span className="text-[10px] text-muted-foreground inline-flex items-center gap-1">
            <Camera className="h-2.5 w-2.5" />
            {locale === 'hi' ? 'पंचायत फोटो' : 'Panchayat photo'}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
