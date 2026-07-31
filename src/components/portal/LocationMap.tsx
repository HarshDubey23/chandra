'use client'
import { useI18n } from '@/lib/i18n'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollReveal } from './ScrollReveal'
import { motion } from 'framer-motion'
import {
  MapPin,
  Navigation,
  Building2,
  ExternalLink,
  Phone,
  ArrowRight,
  Compass,
  Ruler,
} from 'lucide-react'

// ── Nearby landmarks ──
interface Landmark {
  nameHi: string
  nameEn: string
  distance: string
  direction: string
  type: string
}

const LANDMARKS: Landmark[] = [
  { nameHi: 'शंकरगढ़', nameEn: 'Shankargarh', distance: '8 किमी', direction: 'SE', type: 'block' },
  { nameHi: 'बारा', nameEn: 'Bara', distance: '12 किमी', direction: 'SW', type: 'tehsil' },
  { nameHi: 'प्रयागराज', nameEn: 'Prayagraj', distance: '45 किमी', direction: 'NW', type: 'district' },
  { nameHi: 'मनौरा', nameEn: 'Manaura', distance: '3 किमी', direction: 'N', type: 'village' },
  { nameHi: 'कोटवा', nameEn: 'Kotwa', distance: '5 किमी', direction: 'E', type: 'village' },
]

// ── Panchayat office address ──
const ADDRESS = {
  hi: 'ग्राम पंचायत चंद्रा, विकास खण्ड शंकरगढ़, जनपद प्रयागराज, उत्तर प्रदेश — 212108',
  en: 'Gram Panchayat Chandra, Block Shankargarh, District Prayagraj, Uttar Pradesh — 212108',
}

const COORDINATES = { lat: 25.187, lng: 81.612 }

export function LocationMap() {
  const { locale } = useI18n()
  const hi = locale === 'hi'

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${COORDINATES.lat},${COORDINATES.lng}&hl=${locale}`

  return (
    <section id="location-map" className="section-premium-accent py-16 md:py-20 border-b border-border/40">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10">
          <Badge variant="outline" className="section-header-badge mb-3 gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {hi ? 'स्थान' : 'Location'}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gradient-premium">
            {hi ? 'पंचायत स्थान एवं मार्ग' : 'Panchayat Location & Directions'}
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            {hi
              ? 'ग्राम पंचायत चंद्रा का स्थान — आस-पास के प्रमुख स्थल एवं मार्गदर्शन'
              : 'Location of Gram Panchayat Chandra — nearby landmarks & directions'}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* SVG Map Illustration */}
          <ScrollReveal delay={0.15}>
            <Card className="card-premium overflow-hidden hover-lift-lg">
              {/* Tricolor accent bar */}
              <div className="h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />
              <CardContent className="p-0">
                {/* SVG Map */}
                <div className="relative w-full bg-gradient-to-br from-green-50 via-white to-amber-50 dark:from-green-900/10 dark:via-background dark:to-amber-900/10 aspect-[4/3]">
                  <svg
                    viewBox="0 0 400 300"
                    className="absolute inset-0 w-full h-full"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Background subtle grid */}
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5" opacity="0.4" />
                      </pattern>
                    </defs>
                    <rect width="400" height="300" fill="url(#grid)" />

                    {/* River (Yamuna suggestion) */}
                    <path
                      d="M 0 180 Q 80 170 160 190 Q 240 210 320 195 Q 380 185 400 190"
                      fill="none"
                      stroke="#93c5fd"
                      strokeWidth="8"
                      strokeLinecap="round"
                      opacity="0.5"
                    />
                    <text x="200" y="215" fontSize="10" fill="#3b82f6" opacity="0.6" textAnchor="middle">
                      {hi ? 'गंगा-यमुना नदी क्षेत्र' : 'Ganga-Yamuna Region'}
                    </text>

                    {/* Road to Shankargarh */}
                    <line x1="180" y2="140" y1="140" x2="320" stroke="#d97706" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
                    <line x1="180" y1="140" x2="320" y2="140" stroke="#d97706" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
                    <text x="250" y="133" fontSize="9" fill="#d97706" textAnchor="middle" fontWeight="600">
                      {hi ? 'शंकरगढ़ मार्ग' : 'Shankargarh Rd'}
                    </text>

                    {/* Road to Bara */}
                    <line x1="180" y1="140" x2="100" y2="200" stroke="#64748b" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                    <text x="135" y="175" fontSize="8" fill="#64748b" textAnchor="middle">
                      {hi ? 'बारा मार्ग' : 'Bara Rd'}
                    </text>

                    {/* Road to Prayagraj */}
                    <line x1="180" y1="140" x2="60" y2="80" stroke="#64748b" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                    <text x="115" y="105" fontSize="8" fill="#64748b" textAnchor="middle">
                      {hi ? 'प्रयागराज मार्ग' : 'Prayagraj Rd'}
                    </text>

                    {/* Chandra — main village */}
                    <circle cx="180" cy="140" r="14" fill="#c2410c" opacity="0.9" />
                    <circle cx="180" cy="140" r="14" fill="none" stroke="#c2410c" strokeWidth="2" />
                    <circle cx="180" cy="140" r="20" fill="none" stroke="#c2410c" strokeWidth="1" opacity="0.4" />
                    <circle cx="180" cy="140" r="26" fill="none" stroke="#c2410c" strokeWidth="0.5" opacity="0.3" />
                    <text x="180" y="144" fontSize="11" fill="white" textAnchor="middle" fontWeight="700">
                      {hi ? 'चंद्रा' : 'Chandra'}
                    </text>

                    {/* Shankargarh */}
                    <rect x="305" y="130" width="50" height="20" rx="4" fill="#f59e0b" opacity="0.8" />
                    <text x="330" y="145" fontSize="9" fill="white" textAnchor="middle" fontWeight="600">
                      {hi ? 'शंकरगढ़' : 'Shankargarh'}
                    </text>
                    <text x="330" y="158" fontSize="8" fill="#92400e" textAnchor="middle">8km</text>

                    {/* Bara */}
                    <rect x="70" y="195" width="40" height="18" rx="4" fill="#64748b" opacity="0.7" />
                    <text x="90" y="208" fontSize="8" fill="white" textAnchor="middle" fontWeight="600">
                      {hi ? 'बारा' : 'Bara'}
                    </text>
                    <text x="90" y="220" fontSize="7" fill="#334155" textAnchor="middle">12km</text>

                    {/* Prayagraj */}
                    <rect x="20" y="65" width="55" height="20" rx="4" fill="#16a34a" opacity="0.8" />
                    <text x="48" y="80" fontSize="9" fill="white" textAnchor="middle" fontWeight="600">
                      {hi ? 'प्रयागराज' : 'Prayagraj'}
                    </text>
                    <text x="48" y="93" fontSize="8" fill="#14532d" textAnchor="middle">45km</text>

                    {/* Manaura */}
                    <circle cx="180" cy="80" r="6" fill="#78716c" opacity="0.7" />
                    <text x="180" y="70" fontSize="8" fill="#57534e" textAnchor="middle">
                      {hi ? 'मनौरा 3km' : 'Manaura 3km'}
                    </text>

                    {/* Kotwa */}
                    <circle cx="220" cy="155" r="6" fill="#78716c" opacity="0.7" />
                    <text x="235" y="163" fontSize="8" fill="#57534e" textAnchor="start">
                      {hi ? 'कोटवा 5km' : 'Kotwa 5km'}
                    </text>

                    {/* Compass */}
                    <g transform="translate(360, 260)">
                      <circle r="18" fill="white" opacity="0.8" stroke="#9ca3af" strokeWidth="1" />
                      <text y="-8" fontSize="8" fill="#c2410c" textAnchor="middle" fontWeight="700">N</text>
                      <text y="12" fontSize="7" fill="#64748b" textAnchor="middle">S</text>
                      <text x="-8" y="3" fontSize="7" fill="#64748b" textAnchor="middle">W</text>
                      <text x="9" y="3" fontSize="7" fill="#64748b" textAnchor="middle">E</text>
                      <line x1="0" y1="-5" x2="0" y2="-14" stroke="#c2410c" strokeWidth="1.5" />
                      <line x1="0" y1="5" x2="0" y2="10" stroke="#64748b" strokeWidth="1" />
                    </g>

                    {/* Coordinates badge */}
                    <rect x="5" y="5" width="90" height="22" rx="4" fill="#16a34a" opacity="0.15" />
                    <text x="50" y="20" fontSize="9" fill="#16a34a" textAnchor="middle" fontWeight="600">
                      25.187°N, 81.612°E
                    </text>
                  </svg>

                  {/* Overlay: Get Directions button */}
                  <div className="absolute bottom-3 right-3">
                    <Button
                      asChild
                      size="sm"
                      className="gap-1.5 shadow-md bg-primary hover:bg-primary/90"
                    >
                      <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                        <Navigation className="h-3.5 w-3.5" />
                        {hi ? 'मार्गदर्शन प्राप्त करें' : 'Get Directions'}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* Landmarks & Address panel */}
          <div className="flex flex-col gap-6">
            {/* Nearby landmarks */}
            <ScrollReveal delay={0.25}>
              <Card className="card-premium-bordered hover-lift">
                <CardContent className="p-4">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                    <Compass className="h-4 w-4 text-primary" />
                    {hi ? 'आस-पास के प्रमुख स्थल' : 'Nearby Landmarks'}
                  </h3>
                  <div className="space-y-2">
                    {LANDMARKS.map((lm, i) => (
                      <motion.div
                        key={lm.nameEn}
                        initial={{ opacity: 0, x: -8 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: 0.3 + i * 0.06 }}
                        className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/30 px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Ruler className="h-3.5 w-3.5" />
                          </span>
                          <div>
                            <span className="text-sm font-medium text-foreground">
                              {hi ? lm.nameHi : lm.nameEn}
                            </span>
                            <span className="ml-1.5 text-[10px] text-muted-foreground uppercase">{lm.direction}</span>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[10px] tabular-nums">
                          {hi ? lm.distance : lm.distance.replace('किमी', 'km')}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>

            {/* Panchayat Office Address */}
            <ScrollReveal delay={0.4}>
              <Card className="card-premium-bordered-green hover-lift">
                <CardContent className="p-4">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                    <Building2 className="h-4 w-4 text-primary" />
                    {hi ? 'पंचायत कार्यालय' : 'Panchayat Office'}
                  </h3>
                  <div className="rounded-xl border border-border/50 bg-muted/30 p-3 space-y-2">
                    <p className="text-sm text-foreground leading-relaxed">
                      {hi ? ADDRESS.hi : ADDRESS.en}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      <span className="font-mono tabular-nums">25.187°N, 81.612°E</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="h-3.5 w-3.5 text-green-600" />
                      <a href="tel:+919651035021" className="font-medium text-green-700 dark:text-green-400 hover:underline">
                        +91 96510 35021
                      </a>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full gap-1.5"
                    >
                      <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                        <Navigation className="h-3.5 w-3.5" />
                        {hi ? 'Google Maps पर देखें' : 'View on Google Maps'}
                        <ArrowRight className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>

            {/* Coordinates detail */}
            <ScrollReveal delay={0.5}>
              <div className="flex items-center justify-center gap-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-primary" />
                  25.187°N, 81.612°E
                </span>
                <span>·</span>
                <span>{hi ? 'विकास खण्ड शंकरगढ़' : 'Block Shankargarh'}</span>
                <span>·</span>
                <span>{hi ? 'जनपद प्रयागराज' : 'District Prayagraj'}</span>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  )
}
