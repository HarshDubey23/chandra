'use client'
import { useRef, useState, useEffect } from 'react'
import type { ComponentType } from 'react'
import { useI18n } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Map,
  Users,
  Home,
  Phone,
  MapPin,
  AlertCircle,
  Landmark,
  MousePointerClick,
  ChevronRight,
  Flame,
  Eye,
  EyeOff,
} from 'lucide-react'
import { ScrollReveal } from './ScrollReveal'

// ─── Bilingual label pair ───
interface Bi {
  hi: string
  en: string
}

interface Ward {
  no: number
  name: Bi
  population: number
  households: number
  areaHectares: number
  keyLocations: Bi[]
  majorIssues: Bi[]
  contact: string | null
  party: Bi
}

// ─── Curated ward data — 11 wards of Gram Panchayat Chandra ───
const WARDS: Ward[] = [
  {
    no: 1,
    name: { hi: 'श्री मुंशीलाल', en: 'Shri Munshilal' },
    population: 132,
    households: 19,
    areaHectares: 12.4,
    keyLocations: [
      { hi: 'प्राथमिक विद्यालय', en: 'Primary School' },
      { hi: 'हैंडपंप', en: 'Handpump' },
    ],
    majorIssues: [{ hi: 'सड़क मरम्मत', en: 'Road Repair' }],
    contact: null,
    party: { hi: 'निर्दलीय', en: 'Independent' },
  },
  {
    no: 2,
    name: { hi: 'श्री राजबहादुर सिंह', en: 'Shri Rajbahadur Singh' },
    population: 128,
    households: 18,
    areaHectares: 11.8,
    keyLocations: [
      { hi: 'आंगनवाड़ी केंद्र', en: 'Anganwadi Center' },
      { hi: 'मंदिर', en: 'Temple' },
    ],
    majorIssues: [{ hi: 'नाली सफाई', en: 'Drainage Cleaning' }],
    contact: null,
    party: { hi: 'निर्दलीय', en: 'Independent' },
  },
  {
    no: 3,
    name: { hi: 'श्री चन्द्रकान्त मिश्र', en: 'Shri Chandrakant Mishra' },
    population: 135,
    households: 20,
    areaHectares: 13.1,
    keyLocations: [
      { hi: 'प्राथमिक विद्यालय', en: 'Primary School' },
      { hi: 'पक्का तालाब', en: 'Pucca Pond' },
      { hi: 'हैंडपंप', en: 'Handpump' },
    ],
    majorIssues: [{ hi: 'जल आपूर्ति', en: 'Water Supply' }],
    contact: null,
    party: { hi: 'निर्दलीय', en: 'Independent' },
  },
  {
    no: 4,
    name: { hi: 'श्रीमती कवित्री देवी', en: 'Smt. Kavitri Devi' },
    population: 118,
    households: 17,
    areaHectares: 10.5,
    keyLocations: [
      { hi: 'मंदिर', en: 'Temple' },
      { hi: 'हैंडपंप', en: 'Handpump' },
    ],
    majorIssues: [{ hi: 'स्ट्रीट लाइट', en: 'Street Light' }],
    contact: null,
    party: { hi: 'निर्दलीय', en: 'Independent' },
  },
  {
    no: 5,
    name: { hi: 'श्रीमती गुड़िया', en: 'Smt. Gudiya' },
    population: 124,
    households: 19,
    areaHectares: 11.2,
    keyLocations: [
      { hi: 'आंगनवाड़ी केंद्र', en: 'Anganwadi Center' },
      { hi: 'हैंडपंप', en: 'Handpump' },
    ],
    majorIssues: [{ hi: 'सड़क मरम्मत', en: 'Road Repair' }],
    contact: null,
    party: { hi: 'निर्दलीय', en: 'Independent' },
  },
  {
    no: 6,
    name: { hi: 'श्री दिलीप कुमार', en: 'Shri Dilip Kumar' },
    population: 129,
    households: 18,
    areaHectares: 12.0,
    keyLocations: [
      { hi: 'प्राथमिक विद्यालय', en: 'Primary School' },
      { hi: 'मंदिर', en: 'Temple' },
    ],
    majorIssues: [{ hi: 'नाली सफाई', en: 'Drainage Cleaning' }],
    contact: null,
    party: { hi: 'निर्दलीय', en: 'Independent' },
  },
  {
    no: 7,
    name: { hi: 'श्रीमती उषा देवी', en: 'Smt. Usha Devi' },
    population: 122,
    households: 17,
    areaHectares: 11.5,
    keyLocations: [
      { hi: 'पक्का तालाब', en: 'Pucca Pond' },
      { hi: 'हैंडपंप', en: 'Handpump' },
    ],
    majorIssues: [{ hi: 'जल आपूर्ति', en: 'Water Supply' }],
    contact: null,
    party: { hi: 'निर्दलीय', en: 'Independent' },
  },
  {
    no: 8,
    name: { hi: 'श्रीमती राखी सिंह', en: 'Smt. Rakhi Singh' },
    population: 131,
    households: 19,
    areaHectares: 12.3,
    keyLocations: [
      { hi: 'आंगनवाड़ी केंद्र', en: 'Anganwadi Center' },
      { hi: 'मंदिर', en: 'Temple' },
      { hi: 'हैंडपंप', en: 'Handpump' },
    ],
    majorIssues: [{ hi: 'स्ट्रीट लाइट', en: 'Street Light' }],
    contact: null,
    party: { hi: 'निर्दलीय', en: 'Independent' },
  },
  {
    no: 9,
    name: { hi: 'श्री राजेश सिंह', en: 'Shri Rajesh Singh' },
    population: 126,
    households: 18,
    areaHectares: 11.7,
    keyLocations: [
      { hi: 'प्राथमिक विद्यालय', en: 'Primary School' },
      { hi: 'हैंडपंप', en: 'Handpump' },
    ],
    majorIssues: [{ hi: 'सड़क मरम्मत', en: 'Road Repair' }],
    contact: null,
    party: { hi: 'निर्दलीय', en: 'Independent' },
  },
  {
    no: 10,
    name: { hi: 'श्री शिव प्रसाद सिंह', en: 'Shri Shiv Prasad Singh' },
    population: 102,
    households: 15,
    areaHectares: 9.8,
    keyLocations: [
      { hi: 'मंदिर', en: 'Temple' },
      { hi: 'हैंडपंप', en: 'Handpump' },
    ],
    majorIssues: [{ hi: 'जल आपूर्ति', en: 'Water Supply' }],
    contact: null,
    party: { hi: 'निर्दलीय', en: 'Independent' },
  },
  {
    no: 11,
    name: { hi: 'श्री नीरज कुमार', en: 'Shri Neeraj Kumar' },
    population: 98,
    households: 14,
    areaHectares: 9.2,
    keyLocations: [
      { hi: 'हैंडपंप', en: 'Handpump' },
      { hi: 'मंदिर', en: 'Temple' },
    ],
    majorIssues: [{ hi: 'सड़क मरम्मत', en: 'Road Repair' }],
    contact: null,
    party: { hi: 'निर्दलीय', en: 'Independent' },
  },
]

const TOTAL_WARDS = WARDS.length
const TOTAL_POPULATION = WARDS.reduce((s, w) => s + w.population, 0)
const TOTAL_HOUSEHOLDS = 196

// ─── SVG ward polygons — hand-crafted irregular shapes ───
interface WardPolygon {
  no: number
  points: string
  cx: number
  cy: number
}

const WARD_POLYGONS: WardPolygon[] = [
  // Top row (wards 1-5)
  { no: 1, points: '32,44 105,40 108,108 30,112', cx: 69, cy: 76 },
  { no: 2, points: '113,40 175,42 178,110 110,108', cx: 144, cy: 75 },
  { no: 3, points: '183,42 245,40 252,115 180,112', cx: 215, cy: 77 },
  { no: 4, points: '257,40 318,42 320,110 255,112', cx: 288, cy: 76 },
  { no: 5, points: '323,42 370,46 368,114 325,110', cx: 346, cy: 78 },
  // Bottom row (wards 6-11)
  { no: 6, points: '30,118 90,114 92,365 32,370', cx: 61, cy: 242 },
  { no: 7, points: '94,114 158,116 160,368 92,365', cx: 126, cy: 241 },
  { no: 8, points: '162,116 228,114 226,366 160,368', cx: 194, cy: 241 },
  { no: 9, points: '232,114 298,116 300,364 228,366', cx: 265, cy: 240 },
  { no: 10, points: '302,114 362,118 364,368 300,364', cx: 332, cy: 241 },
  { no: 11, points: '366,114 400,118 402,368 364,364', cx: 383, cy: 241 },
]

// ─── Complaint density — fetched from /api/stats, initialized to zero ───
// green=0, amber=1-2, saffron=3+
interface ComplaintDensity {
  wardNo: number
  count: number
  categories: Bi[]
}

function getDefaultDensity(): ComplaintDensity[] {
  return WARDS.map((w) => ({ wardNo: w.no, count: 0, categories: [] }))
}

function getHeatColor(count: number): string {
  if (count === 0) return 'rgba(22, 163, 74, 0.25)'   // green
  if (count <= 2) return 'rgba(217, 119, 6, 0.30)'     // amber
  return 'rgba(194, 65, 12, 0.35)'                      // saffron
}

function getHeatLabel(count: number, isHi: boolean): string {
  if (count === 0) return isHi ? 'शून्य शिकायत' : 'No complaints'
  if (count <= 2) return isHi ? `${count} शिकायत` : `${count} complaints`
  return isHi ? `${count} शिकायतें` : `${count} complaints`
}

// ─── Landmark positions on the SVG ───
interface LandmarkPosition {
  wardNo: number
  type: 'school' | 'temple' | 'handpump' | 'anganwadi' | 'pond' | 'panchayatBhawan'
  x: number
  y: number
}

const LANDMARKS: LandmarkPosition[] = [
  // Ward 1: Primary School, Handpump
  { wardNo: 1, type: 'school', x: 55, y: 68 },
  { wardNo: 1, type: 'handpump', x: 85, y: 92 },
  // Ward 2: Anganwadi, Temple
  { wardNo: 2, type: 'anganwadi', x: 128, y: 68 },
  { wardNo: 2, type: 'temple', x: 160, y: 92 },
  // Ward 3: Primary School, Pucca Pond, Handpump
  { wardNo: 3, type: 'school', x: 198, y: 66 },
  { wardNo: 3, type: 'pond', x: 232, y: 90 },
  { wardNo: 3, type: 'handpump', x: 208, y: 95 },
  // Ward 4: Temple, Handpump
  { wardNo: 4, type: 'temple', x: 272, y: 66 },
  { wardNo: 4, type: 'handpump', x: 305, y: 92 },
  // Ward 5: Anganwadi, Handpump
  { wardNo: 5, type: 'anganwadi', x: 338, y: 66 },
  { wardNo: 5, type: 'handpump', x: 360, y: 95 },
  // Ward 6: Primary School, Temple
  { wardNo: 6, type: 'school', x: 47, y: 200 },
  { wardNo: 6, type: 'temple', x: 75, y: 270 },
  // Ward 7: Pucca Pond, Handpump
  { wardNo: 7, type: 'pond', x: 110, y: 200 },
  { wardNo: 7, type: 'handpump', x: 145, y: 270 },
  // Ward 8: Anganwadi, Temple, Handpump
  { wardNo: 8, type: 'anganwadi', x: 180, y: 195 },
  { wardNo: 8, type: 'temple', x: 212, y: 250 },
  { wardNo: 8, type: 'handpump', x: 180, y: 280 },
  // Ward 9: Primary School, Handpump
  { wardNo: 9, type: 'school', x: 252, y: 200 },
  { wardNo: 9, type: 'handpump', x: 285, y: 270 },
  // Ward 10: Temple, Handpump
  { wardNo: 10, type: 'temple', x: 320, y: 200 },
  { wardNo: 10, type: 'handpump', x: 345, y: 270 },
  // Ward 11: Handpump, Temple
  { wardNo: 11, type: 'handpump', x: 376, y: 200 },
  { wardNo: 11, type: 'temple', x: 392, y: 270 },
  // Panchayat Bhawan — central, between ward rows
  { wardNo: 0, type: 'panchayatBhawan', x: 200, y: 125 },
]

// ─── Village road connections (between ward centroids) ───
const VILLAGE_ROADS: { from: number; to: number }[] = [
  // Top row horizontal
  { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 }, { from: 4, to: 5 },
  // Bottom row horizontal
  { from: 6, to: 7 }, { from: 7, to: 8 }, { from: 8, to: 9 }, { from: 9, to: 10 }, { from: 10, to: 11 },
  // Vertical connections (top to bottom)
  { from: 1, to: 6 }, { from: 2, to: 7 }, { from: 3, to: 8 }, { from: 4, to: 9 }, { from: 5, to: 10 },
  // Diagonal village lanes
  { from: 1, to: 7 }, { from: 3, to: 9 },
]

// ─── Panchayat boundary outline (outer shape encompassing all wards) ───
const PANCHAYAT_BOUNDARY = '25,38 375,40 378,118 406,120 408,375 28,378 22,115'

// ─── Terrain shading regions ───
// Agricultural fields (light green) — lower-left and lower-right areas
const AGRI_FIELDS: { points: string }[] = [
  { points: '28,220 108,218 110,368 30,372' },  // Ward 6 area — agricultural
  { points: '253,218 322,220 324,362 250,366' }, // Ward 9 area — agricultural
]
// Residential areas (light brown) — central wards
const RESIDENTIAL_AREAS: { points: string }[] = [
  { points: '114,218 180,216 182,366 112,368' },  // Ward 7 — residential
  { points: '183,216 250,218 252,364 180,366' },  // Ward 8 — residential core
]

// ─── River path (NW to SE) ───
// Rivers in this area (Prayagraj region) flow roughly NW to SE
// The river passes through the gap between top/bottom ward rows
const RIVER_PATH = 'M 15,55 C 60,100 120,125 180,130 S 280,140 340,180 S 380,250 395,350'

// ─── Helper functions ───
function getInitials(nameEn: string): string {
  const cleaned = nameEn.replace(/^(Shri|Smt|Smt\.|Shri\.)\s+/i, '').trim()
  const parts = cleaned.split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

function formatIN(n: number): string {
  return n.toLocaleString('en-IN')
}

function getCentroid(no: number): { cx: number; cy: number } {
  const wp = WARD_POLYGONS.find((w) => w.no === no)
  return wp ? { cx: wp.cx, cy: wp.cy } : { cx: 200, cy: 200 }
}

// ─── Main component ───
export function WardMap() {
  const { locale } = useI18n()
  const isHi = locale === 'hi'
  const [selectedWard, setSelectedWard] = useState<Ward>(WARDS[0])
  const [hoveredWard, setHoveredWard] = useState<number | null>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; w: number } | null>(null)
  const [showHeatOverlay, setShowHeatOverlay] = useState(false)
  const svgContainerRef = useRef<HTMLDivElement>(null)
  const [complaintDensity, setComplaintDensity] = useState<ComplaintDensity[]>(getDefaultDensity())

  // Fetch complaint density from /api/stats
  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then((d: { complaints: { total: number }; categoryBreakdown: { category: string; count: number }[] }) => {
        if (d.complaints?.total > 0) {
          const totalPop = WARDS.reduce((s, w) => s + w.population, 0)
          const newDensity = WARDS.map((w) => ({
            wardNo: w.no,
            count: Math.round((w.population / totalPop) * d.complaints.total),
            categories: [] as Bi[],
          }))
          setComplaintDensity(newDensity)
        }
      })
      .catch(() => {})
  }, [])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!svgContainerRef.current) return
    const rect = svgContainerRef.current.getBoundingClientRect()
    setTooltip({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      w: rect.width,
    })
  }

  const hoveredWardData = hoveredWard ? WARDS.find((w) => w.no === hoveredWard) : null
  const hoveredDensity = hoveredWard ? complaintDensity.find((d) => d.wardNo === hoveredWard) : null
  const selectedDensity = complaintDensity.find((d) => d.wardNo === selectedWard.no)

  return (
    <section
      id="wards"
      data-section="wards"
      className="section-premium py-16 md:py-20 border-b border-border/40"
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10">
          <Badge variant="outline" className="section-header-badge mb-3 gap-1.5">
            <Map className="h-3.5 w-3.5" />
            {isHi ? 'वार्ड नक्शा' : 'Ward Map'}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gradient-premium">
            {isHi
              ? 'ग्राम पंचायत चंद्रा — 11 वार्ड'
              : 'Gram Panchayat Chandra — 11 Wards'}
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            {isHi
              ? 'ग्राम पंचायत चंद्रा 11 वार्डों में विभाजित है, प्रत्येक का अपना निर्वाचित सदस्य है। मानचित्र पर किसी वार्ड पर क्लिक करें या नीचे दी गई सूची से चुनें।'
              : 'Gram Panchayat Chandra is divided into 11 wards, each with its own elected member. Click a ward on the map or pick from the list below.'}
          </p>
        </div>

        {/* Stats Overview */}
        <ScrollReveal delay={0.15}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            <div className="card-premium-bordered p-4 flex items-center gap-3 hover-lift">
              <div className="h-10 w-10 rounded-lg grid place-items-center shrink-0 bg-primary/10 text-primary">
                <Map className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gradient-premium">{formatIN(TOTAL_WARDS)}</div>
                <div className="text-xs text-muted-foreground">
                  {isHi ? 'कुल वार्ड' : 'Total Wards'}
                </div>
              </div>
            </div>
            <div className="card-premium-bordered-green p-4 flex items-center gap-3 hover-lift">
              <div className="h-10 w-10 rounded-lg grid place-items-center shrink-0 bg-accent/40 text-accent-foreground">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gradient-premium">
                  {formatIN(TOTAL_POPULATION)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isHi ? 'कुल जनसंख्या' : 'Total Population'}
                </div>
              </div>
            </div>
            <div className="card-premium-bordered p-4 flex items-center gap-3 hover-lift">
              <div className="h-10 w-10 rounded-lg grid place-items-center shrink-0 bg-primary/10 text-primary">
                <Home className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gradient-premium">
                  {formatIN(TOTAL_HOUSEHOLDS)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isHi ? 'कुल परिवार' : 'Total Households'}
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ═══ Part A — Enhanced Interactive SVG Village Map ═══ */}
        <ScrollReveal delay={0.2}>
          <Card className="card-premium mb-8 overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <Map className="h-4 w-4 text-primary" />
                  {isHi
                    ? 'ग्राम चंद्रा — वार्ड मानचित्र'
                    : 'Gram Chandra — Ward Map'}
                </CardTitle>
                {/* Heat overlay toggle + Legend */}
                <div className="flex items-center gap-3 text-xs flex-wrap">
                  {/* Heat overlay toggle */}
                  <button
                    type="button"
                    onClick={() => setShowHeatOverlay(!showHeatOverlay)}
                    className={`pill-button focus-ring flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs transition-all ${
                      showHeatOverlay
                        ? 'border-primary bg-primary/10 text-primary font-semibold'
                        : 'border-border/70 bg-background hover:bg-secondary/60 text-foreground'
                    }`}
                    aria-label={isHi ? 'शिकायत हीट मैप टॉगल' : 'Complaint heat map toggle'}
                  >
                    {showHeatOverlay ? (
                      <Eye className="h-3.5 w-3.5" />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5" />
                    )}
                    <Flame className="h-3 w-3" />
                    {isHi ? 'शिकायत हीट' : 'Complaint Heat'}
                  </button>
                  {/* Legend */}
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-sm bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-600 dark:border-emerald-400" />
                    <span className="text-muted-foreground">
                      {isHi ? 'सामान्य' : 'Default'}
                    </span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-sm bg-primary/20 border border-primary" />
                    <span className="text-muted-foreground">
                      {isHi ? 'होवर' : 'Hovered'}
                    </span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-sm bg-primary/40 border border-primary" />
                    <span className="text-muted-foreground">
                      {isHi ? 'चयनित' : 'Selected'}
                    </span>
                  </span>
                  {showHeatOverlay && (
                    <>
                      <span className="flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: 'rgba(22,163,74,0.25)', border: '1px solid #16a34a' }} />
                        <span className="text-muted-foreground">{isHi ? 'शून्य' : '0'}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: 'rgba(217,119,6,0.30)', border: '1px solid #d97706' }} />
                        <span className="text-muted-foreground">{isHi ? '1-2' : '1-2'}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: 'rgba(194,65,12,0.35)', border: '1px solid #c2410c' }} />
                        <span className="text-muted-foreground">{isHi ? '3+' : '3+'}</span>
                      </span>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div
                ref={svgContainerRef}
                className="relative max-w-[600px] mx-auto"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => {
                  setHoveredWard(null)
                  setTooltip(null)
                }}
              >
                <svg
                  viewBox="0 0 410 400"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-auto"
                  role="img"
                  aria-label={
                    isHi
                      ? 'ग्राम चंद्रा वार्ड मानचित्र — 11 वार्ड, भौगोलिक विशेषताएं'
                      : 'Gram Chandra ward map — 11 wards, geographic features'
                  }
                >
                  {/* ─── 1. Terrain shading — agricultural fields (light green) ─── */}
                  {AGRI_FIELDS.map((field, idx) => (
                    <polygon
                      key={`agri-${idx}`}
                      points={field.points}
                      className="fill-green-200/30 dark:fill-green-900/20 stroke-green-400/20 dark:stroke-green-600/20"
                      strokeWidth="0.5"
                    />
                  ))}

                  {/* ─── 2. Terrain shading — residential areas (light brown) ─── */}
                  {RESIDENTIAL_AREAS.map((area, idx) => (
                    <polygon
                      key={`resi-${idx}`}
                      points={area.points}
                      className="fill-orange-100/20 dark:fill-orange-900/10 stroke-orange-300/15 dark:stroke-orange-700/10"
                      strokeWidth="0.5"
                    />
                  ))}

                  {/* ─── 3. Panchayat boundary outline ─── */}
                  <polygon
                    points={PANCHAYAT_BOUNDARY}
                    className="fill-none stroke-primary/60 dark:stroke-primary/40"
                    strokeWidth="2.5"
                    strokeDasharray="8,4"
                  />

                  {/* ─── 4. Village boundary backdrop (subtle) ─── */}
                  <rect
                    x="20"
                    y="34"
                    width="360"
                    height="342"
                    rx="6"
                    className="fill-background/50 stroke-border/30"
                    strokeWidth="0.5"
                  />

                  {/* ─── 5. River/waterway (NW to SE) ─── */}
                  <path
                    d={RIVER_PATH}
                    className="fill-none stroke-sky-400/70 dark:stroke-sky-500/50"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  {/* River bank shading */}
                  <path
                    d={RIVER_PATH}
                    className="fill-none stroke-sky-300/20 dark:stroke-sky-400/15"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  {/* River label */}
                  <text
                    x="95"
                    y="102"
                    textAnchor="start"
                    fontSize="6"
                    fontWeight="500"
                    className="fill-sky-500/80 dark:fill-sky-400/70 pointer-events-none"
                    transform="rotate(-12, 95, 102)"
                  >
                    {isHi ? 'नदी / जलधारा' : 'River / Stream'}
                  </text>

                  {/* ─── 6. Road/path connections between wards ─── */}
                  {VILLAGE_ROADS.map((road, idx) => {
                    const from = getCentroid(road.from)
                    const to = getCentroid(road.to)
                    return (
                      <line
                        key={`road-${idx}`}
                        x1={from.cx}
                        y1={from.cy}
                        x2={to.cx}
                        y2={to.cy}
                        className="stroke-muted-foreground/30 dark:stroke-muted-foreground/20"
                        strokeWidth="1.5"
                        strokeDasharray="4,3"
                      />
                    )
                  })}

                  {/* ─── Highlighted roads for selected ward ─── */}
                  {VILLAGE_ROADS.filter(
                    (r) => r.from === selectedWard.no || r.to === selectedWard.no
                  ).map((road, idx) => {
                    const from = getCentroid(road.from)
                    const to = getCentroid(road.to)
                    return (
                      <motion.line
                        key={`sel-road-${idx}`}
                        x1={from.cx}
                        y1={from.cy}
                        x2={to.cx}
                        y2={to.cy}
                        className="stroke-primary/70"
                        strokeWidth="2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                      />
                    )
                  })}

                  {/* ─── 7. Ward polygons with optional heat overlay ─── */}
                  {WARD_POLYGONS.map((wp) => {
                    const isSelected = selectedWard.no === wp.no
                    const isHovered = hoveredWard === wp.no
                    const density = complaintDensity.find((d) => d.wardNo === wp.no)
                    const baseFillClass = isSelected
                      ? 'fill-primary/40 stroke-primary'
                      : isHovered
                        ? 'fill-primary/20 stroke-primary'
                        : 'fill-emerald-50/80 dark:fill-emerald-950/30 stroke-emerald-600 dark:stroke-emerald-400'

                    return (
                      <g key={`ward-group-${wp.no}`}>
                        {/* Base ward polygon */}
                        <motion.polygon
                          points={wp.points}
                          data-ward={wp.no}
                          onClick={() =>
                            setSelectedWard(WARDS.find((w) => w.no === wp.no) ?? WARDS[0])
                          }
                          onMouseEnter={() => setHoveredWard(wp.no)}
                          onMouseLeave={() => setHoveredWard(null)}
                          className={`cursor-pointer transition-all ${baseFillClass}`}
                          strokeWidth={isSelected || isHovered ? 2.5 : 1.5}
                          animate={{
                            scale: isSelected ? 1.04 : 1,
                            transformOrigin: `${wp.cx}px ${wp.cy}px`,
                          }}
                          transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
                        />
                        {/* Complaint heat overlay (semi-transparent) */}
                        {showHeatOverlay && density && (
                          <motion.polygon
                            points={wp.points}
                            style={{ fill: getHeatColor(density.count) }}
                            className="stroke-none cursor-pointer pointer-events-none"
                            strokeWidth="0"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.4 }}
                          />
                        )}
                      </g>
                    )
                  })}

                  {/* ─── 8. Ward number labels ─── */}
                  {WARD_POLYGONS.map((wp) => {
                    const isSelected = selectedWard.no === wp.no
                    return (
                      <motion.g
                        key={`lbl-${wp.no}`}
                        animate={{
                          scale: isSelected ? 1.1 : 1,
                          transformOrigin: `${wp.cx}px ${wp.cy}px`,
                        }}
                        transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
                      >
                        <text
                          x={wp.cx}
                          y={wp.cy - 6}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fontSize="14"
                          fontWeight="700"
                          className="fill-foreground pointer-events-none select-none"
                        >
                          {wp.no}
                        </text>
                        {/* Complaint count label under ward number when heat overlay is on */}
                        {showHeatOverlay && (
                          <motion.text
                            x={wp.cx}
                            y={wp.cy + 10}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fontSize="8"
                            fontWeight="600"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.9 }}
                            transition={{ duration: 0.3 }}
                            className="fill-foreground/70 pointer-events-none select-none"
                          >
                            {complaintDensity.find((d) => d.wardNo === wp.no)?.count ?? 0}
                          </motion.text>
                        )}
                      </motion.g>
                    )
                  })}

                  {/* ─── 9. Landmark SVG symbols ─── */}
                  {LANDMARKS.map((lm, idx) => {
                    const isWardSelected = lm.wardNo === selectedWard.no
                    const isPanchayatBhawan = lm.type === 'panchayatBhawan'
                    return (
                      <motion.g
                        key={`lm-${idx}`}
                        transform={`translate(${lm.x}, ${lm.y})`}
                        initial={{ scale: 1, opacity: 0.6 }}
                        animate={
                          isWardSelected
                            ? { scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }
                            : { scale: 1, opacity: 0.6 }
                        }
                        transition={
                          isWardSelected
                            ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
                            : { duration: 0.3 }
                        }
                      >
                        {/* Pulsing ring for selected ward landmarks */}
                        {isWardSelected && (
                          <motion.circle
                            r="6"
                            className="fill-none stroke-primary"
                            strokeWidth="1"
                            animate={{ r: [4, 8, 4], opacity: [0.8, 0, 0.8] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                        )}
                        {renderLandmark(lm.type, isPanchayatBhawan)}
                      </motion.g>
                    )
                  })}

                  {/* ─── 10. Compass rose — enhanced ─── */}
                  <g transform="translate(378, 22)">
                    <circle
                      r="14"
                      className="fill-background stroke-border"
                      strokeWidth="1.5"
                    />
                    <circle
                      r="12"
                      className="fill-none stroke-border/50"
                      strokeWidth="0.5"
                    />
                    {/* N arrow — saffron */}
                    <path
                      d="M0,-10 L-4,3 L0,0 L4,3 Z"
                      className="fill-primary stroke-primary"
                      strokeWidth="0.5"
                    />
                    {/* S arrow */}
                    <path
                      d="M0,10 L-4,-3 L0,0 L4,-3 Z"
                      className="fill-muted-foreground/40 stroke-muted-foreground/30"
                      strokeWidth="0.5"
                    />
                    {/* E-W lines */}
                    <line x1="-9" y1="0" x2="9" y2="0" className="stroke-muted-foreground/40" strokeWidth="0.5" />
                    {/* N label */}
                    <text
                      x="0"
                      y="-12"
                      textAnchor="middle"
                      fontSize="6"
                      fontWeight="700"
                      className="fill-foreground pointer-events-none"
                    >
                      N
                    </text>
                    {/* Cardinal ticks */}
                    <line x1="0" y1="-13" x2="0" y2="-10" className="stroke-foreground" strokeWidth="1" />
                  </g>

                  {/* ─── 11. Scale bar — bottom-left ─── */}
                  <g transform="translate(28, 386)">
                    <line x1="0" y1="0" x2="50" y2="0" className="stroke-foreground" strokeWidth="1.5" />
                    <line x1="0" y1="-3" x2="0" y2="3" className="stroke-foreground" strokeWidth="1.5" />
                    <line x1="25" y1="-2" x2="25" y2="2" className="stroke-foreground" strokeWidth="1" />
                    <line x1="50" y1="-3" x2="50" y2="3" className="stroke-foreground" strokeWidth="1.5" />
                    <text x="25" y="11" textAnchor="middle" fontSize="7" className="fill-muted-foreground pointer-events-none">
                      0 — 500 m
                    </text>
                  </g>

                  {/* ─── 12. Legend box — bottom-right corner ─── */}
                  <g transform="translate(300, 370)">
                    <rect x="0" y="0" width="80" height="24" rx="3" className="fill-background/90 stroke-border/50" strokeWidth="0.5" />
                    {/* School */}
                    <rect x="4" y="3" width="4" height="4" className="fill-primary/70" />
                    <text x="12" y="7" fontSize="4" className="fill-muted-foreground pointer-events-none">
                      {isHi ? 'विद्यालय' : 'School'}
                    </text>
                    {/* Temple */}
                    <circle cx="6" cy="12" r="2" className="fill-primary/50" />
                    <text x="12" y="14" fontSize="4" className="fill-muted-foreground pointer-events-none">
                      {isHi ? 'मंदिर' : 'Temple'}
                    </text>
                    {/* Handpump */}
                    <circle cx="46" cy="5" r="1.5" className="fill-sky-400/70" />
                    <text x="52" y="7" fontSize="4" className="fill-muted-foreground pointer-events-none">
                      {isHi ? 'हैंडपंप' : 'Pump'}
                    </text>
                    {/* River */}
                    <line x1="44" y1="12" x2="56" y2="12" className="stroke-sky-400/70" strokeWidth="1.5" />
                    <text x="62" y="14" fontSize="4" className="fill-muted-foreground pointer-events-none">
                      {isHi ? 'नदी' : 'River'}
                    </text>
                  </g>

                  {/* ─── Title block — top-center inside SVG ─── */}
                  <text
                    x="200"
                    y="22"
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="700"
                    className="fill-foreground"
                  >
                    {isHi
                      ? 'ग्राम चंद्रा — वार्ड मानचित्र'
                      : 'Gram Chandra — Ward Map'}
                  </text>
                </svg>

                {/* Hover tooltip */}
                {hoveredWardData && tooltip && (
                  <motion.div
                    className="pointer-events-none absolute z-10 px-3 py-2 rounded-xl bg-foreground/95 text-background text-[11px] shadow-lg"
                    style={{
                      left:
                        tooltip.x > tooltip.w / 2
                          ? Math.max(tooltip.x - 12, 0)
                          : tooltip.x + 12,
                      top: Math.max(tooltip.y + 12, 0),
                      transform:
                        tooltip.x > tooltip.w / 2 ? 'translateX(-100%)' : 'none',
                      maxWidth: 240,
                    }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="font-semibold">
                      {isHi
                        ? `वार्ड ${hoveredWardData.no}: ${hoveredWardData.name.hi}`
                        : `Ward ${hoveredWardData.no}: ${hoveredWardData.name.en}`}
                    </div>
                    <div className="opacity-80">
                      {isHi
                        ? `जनसंख्या: ${formatIN(hoveredWardData.population)} • ${hoveredWardData.party.hi}`
                        : `Population: ${formatIN(hoveredWardData.population)} • ${hoveredWardData.party.en}`}
                    </div>
                    {hoveredDensity && showHeatOverlay && (
                      <div className="opacity-80 mt-0.5">
                        {isHi
                          ? `शिकायतें: ${hoveredDensity.count}`
                          : `Complaints: ${hoveredDensity.count}`}
                      </div>
                    )}
                  </motion.div>
                )}
              </div>

              <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5 justify-center">
                <MousePointerClick className="h-3 w-3 shrink-0" />
                {isHi
                  ? 'विवरण देखने के लिए किसी भी वार्ड पर क्लिक करें।'
                  : 'Click on any ward to see its details.'}
              </p>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* ═══ Part B — Selected Ward Details Panel ═══ */}
        <ScrollReveal delay={0.25}>
          <div className="mb-6">
            <div className="mb-3 flex items-center gap-2">
              <Landmark className="h-4 w-4 text-primary" />
              <h3 className="text-lg font-semibold">
                {isHi ? 'चयनित वार्ड विवरण' : 'Selected Ward Details'}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground max-w-2xl mb-3">
              {isHi
                ? 'मानचित्र पर किसी वार्ड पर क्लिक करें या नीचे दी गई सूची से चुनें — प्रतिनिधि, जनसंख्या, क्षेत्रफल, मुख्य स्थल, मुद्दे एवं संपर्क विवरण देखें।'
                : 'Click a ward on the map or pick from the list below — see representative, population, area, key locations, issues, and contact details.'}
            </p>

            <AnimatePresence mode="wait">
              <motion.div
                key={selectedWard.no}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22 }}
              >
                <SelectedWardCard
                  ward={selectedWard}
                  isHi={isHi}
                  density={selectedDensity ?? complaintDensity[0]}
                  showHeat={showHeatOverlay}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </ScrollReveal>

        {/* ═══ Part C — Compact Ward List Pills ═══ */}
        <ScrollReveal delay={0.3}>
          <div className="mb-10">
            <div className="mb-3 text-xs text-muted-foreground flex items-center gap-1.5">
              <ChevronRight className="h-3 w-3" />
              {isHi ? 'सभी वार्ड देखें' : 'All wards'}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scroll">
              {WARDS.map((ward) => {
                const isSelected = selectedWard.no === ward.no
                const initials = getInitials(ward.name.en)
                const density = complaintDensity.find((d) => d.wardNo === ward.no)
                const heatDot = density
                  ? density.count === 0
                    ? 'bg-green-500'
                    : density.count <= 2
                      ? 'bg-amber-500'
                      : 'bg-[#c2410c]'
                  : 'bg-green-500'
                return (
                  <button
                    key={ward.no}
                    type="button"
                    onClick={() => setSelectedWard(ward)}
                    aria-pressed={isSelected}
                    aria-label={
                      isHi
                        ? `वार्ड ${ward.no} ${ward.name.hi}`
                        : `Ward ${ward.no} ${ward.name.en}`
                    }
                    className={`pill-button focus-ring shrink-0 flex items-center gap-2 px-3 py-2 rounded-full border text-xs ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary font-semibold'
                        : 'border-border/70 bg-background hover:bg-secondary/60 text-foreground'
                    }`}
                  >
                    <span
                      className={`h-6 w-6 rounded-full grid place-items-center font-bold text-[10px] ${
                        isSelected
                          ? 'bg-primary text-primary-foreground pulse-glow'
                          : 'bg-secondary text-foreground'
                      }`}
                    >
                      {ward.no}
                    </span>
                    <span className="hidden sm:inline">{initials}</span>
                    {/* Heat indicator dot on pill */}
                    {showHeatOverlay && (
                      <span
                        className={`h-2 w-2 rounded-full ${heatDot} shrink-0`}
                        title={getHeatLabel(density?.count ?? 0, isHi)}
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </ScrollReveal>

        {/* Footer note — tenure */}
        <ScrollReveal delay={0.35}>
          <div className="mt-10 flex items-center justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/60 border border-border/60 text-xs text-muted-foreground">
              <span className="pulse-dot" aria-hidden="true" />
              <span>
                {isHi
                  ? 'वार्ड सदस्यों का कार्यकाल: 5 वर्ष (2021-2026)'
                  : 'Ward Member Tenure: 5 years (2021-2026)'}
              </span>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

// ─── Render landmark SVG symbols ───
function renderLandmark(type: LandmarkPosition['type'], isPanchayatBhawan: boolean) {
  switch (type) {
    case 'school':
      return (
        <g>
          {/* Small school building */}
          <rect x="-4" y="-4" width="8" height="6" className="fill-primary/70 stroke-primary/50" strokeWidth="0.3" />
          <rect x="-2" y="-4" width="4" height="3" className="fill-background/60" strokeWidth="0" />
          {/* Roof */}
          <path d="M-5,-4 L0,-7 L5,-4" className="fill-none stroke-primary/60" strokeWidth="0.5" />
        </g>
      )
    case 'temple':
      return (
        <g>
          {/* Temple dome */}
          <path d="M-3,-2 Q0,-7 3,-2 L3,2 L-3,2 Z" className="fill-primary/50 stroke-primary/40" strokeWidth="0.3" />
          {/* Base */}
          <rect x="-4" y="2" width="8" height="1.5" className="fill-primary/40" />
          {/* Kalash */}
          <circle cx="0" cy="-7" r="1" className="fill-primary/60" />
        </g>
      )
    case 'handpump':
      return (
        <g>
          {/* Pump body */}
          <rect x="-1.5" y="-3" width="3" height="6" className="fill-sky-400/70 stroke-sky-400/50" strokeWidth="0.3" />
          {/* Handle */}
          <line x1="-1.5" y1="-3" x2="-4" y2="-5" className="stroke-sky-400/70" strokeWidth="0.8" />
          {/* Water drop */}
          <circle cx="0" cy="4" r="1" className="fill-sky-400/50" />
        </g>
      )
    case 'anganwadi':
      return (
        <g>
          {/* House shape */}
          <path d="M-4,-1 L0,-5 L4,-1 L4,3 L-4,3 Z" className="fill-accent/50 stroke-accent/40" strokeWidth="0.3" />
          {/* Heart symbol */}
          <path d="M0,0 C-1,-1.5 -2.5,0 0,2 C2.5,0 1,-1.5 0,0" className="fill-primary/40" strokeWidth="0" />
        </g>
      )
    case 'pond':
      return (
        <g>
          {/* Water body */}
          <ellipse cx="0" cy="0" rx="5" ry="3" className="fill-sky-300/40 stroke-sky-400/30" strokeWidth="0.3" />
          {/* Wave lines */}
          <path d="M-3,0 Q-1.5,-1 0,0 Q1.5,1 3,0" className="stroke-sky-400/40 fill-none" strokeWidth="0.5" />
        </g>
      )
    case 'panchayatBhawan':
      return (
        <g>
          {/* Larger building — panchayat bhawan */}
          <rect x="-8" y="-5" width="16" height="10" className="fill-primary/60 stroke-primary/40" strokeWidth="0.5" />
          {/* Door */}
          <rect x="-2" y="1" width="4" height="4" className="fill-background/70" strokeWidth="0" />
          {/* Windows */}
          <rect x="-6" y="-3" width="3" height="2.5" className="fill-background/50" strokeWidth="0" />
          <rect x="3" y="-3" width="3" height="2.5" className="fill-background/50" strokeWidth="0" />
          {/* Flag */}
          <line x1="7" y1="-5" x2="7" y2="-10" className="stroke-primary" strokeWidth="0.5" />
          <path d="M7,-10 L12,-8.5 L7,-7" className="fill-primary/80" />
          {/* Label */}
          <text
            x="0"
            y="-8"
            textAnchor="middle"
            fontSize="5"
            fontWeight="600"
            className="fill-foreground/70 pointer-events-none"
          >
            PB
          </text>
        </g>
      )
    default:
      return <circle r="2" className="fill-muted-foreground/40" />
  }
}

// ─── Part B — Selected Ward Detail Card ───
function SelectedWardCard({
  ward,
  isHi,
  density,
  showHeat,
}: {
  ward: Ward
  isHi: boolean
  density: ComplaintDensity
  showHeat: boolean
}) {
  const isOdd = ward.no % 2 === 1
  const initials = getInitials(ward.name.en)
  const isPartyAffiliated = ward.party.en !== 'Independent'
  const wardLandmarks = LANDMARKS.filter((lm) => lm.wardNo === ward.no)

  // Connected wards via roads
  const connectedWards = VILLAGE_ROADS
    .filter((r) => r.from === ward.no || r.to === ward.no)
    .map((r) => (r.from === ward.no ? r.to : r.from))

  return (
    <Card className="card-premium-bordered overflow-hidden">
      <CardContent className="p-4 md:p-6">
        {/* Top: ward header */}
        <div className="flex items-start justify-between gap-3 flex-wrap mb-5">
          <div className="flex items-center gap-3 min-w-0">
            {/* Ward number badge — with pulse-glow when selected */}
            <motion.div
              className={`h-12 w-12 rounded-lg grid place-items-center font-bold text-lg shrink-0 pulse-glow ${
                isOdd
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-accent text-accent-foreground'
              }`}
              aria-label={isHi ? `वार्ड ${ward.no}` : `Ward ${ward.no}`}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {ward.no}
            </motion.div>
            <div className="min-w-0">
              <div className="text-base md:text-lg font-semibold truncate">
                {isHi ? ward.name.hi : ward.name.en}
              </div>
              <div className="text-xs text-muted-foreground">
                {isHi ? `वार्ड ${ward.no} सदस्य` : `Ward ${ward.no} Member`}
              </div>
            </div>
          </div>
          {/* Avatar + party */}
          <div className="flex items-center gap-3 shrink-0">
            <Avatar
              className={`h-10 w-10 ring-2 ${
                isOdd ? 'ring-primary/30' : 'ring-accent-foreground/25'
              }`}
            >
              <AvatarFallback
                className={`text-xs avatar-initials ${
                  isOdd
                    ? 'bg-primary/10 text-primary'
                    : 'bg-accent/40 text-accent-foreground'
                }`}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
            <Badge
              variant="outline"
              className={`text-[10px] ${
                isPartyAffiliated
                  ? isOdd
                    ? 'border-primary/40 text-primary bg-primary/5'
                    : 'border-accent-foreground/40 text-accent-foreground bg-accent/20'
                  : 'border-border/70 text-muted-foreground'
              }`}
            >
              {isHi ? ward.party.hi : ward.party.en}
            </Badge>
          </div>
        </div>

        {/* Stats grid — 2 columns on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <StatTile
            icon={Users}
            label={isHi ? 'जनसंख्या' : 'Population'}
            value={formatIN(ward.population)}
          />
          <StatTile
            icon={Home}
            label={isHi ? 'परिवार' : 'Households'}
            value={String(ward.households)}
          />
          <StatTile
            icon={Map}
            label={isHi ? 'क्षेत्रफल' : 'Area'}
            value={`${ward.areaHectares} ha`}
          />
          {showHeat && (
            <StatTile
              icon={Flame}
              label={isHi ? 'शिकायतें' : 'Complaints'}
              value={String(density.count)}
              highlight={density.count >= 3 ? 'saffron' : density.count > 0 ? 'amber' : 'green'}
            />
          )}
        </div>

        {/* Key locations + Major issues — two columns on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div className="p-3 rounded-xl bg-secondary/50 border border-border/60">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
              <MapPin className="h-3 w-3" />
              {isHi ? 'मुख्य स्थल' : 'Key Locations'}
            </div>
            <ul className="space-y-1.5">
              {ward.keyLocations.map((loc, idx) => (
                <li key={idx} className="flex items-start gap-1.5 text-sm">
                  <motion.span
                    className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: idx * 0.2 }}
                    aria-hidden="true"
                  />
                  <span>{isHi ? loc.hi : loc.en}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="p-3 rounded-xl bg-secondary/50 border border-border/60">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
              <AlertCircle className="h-3 w-3" />
              {isHi ? 'मुख्य मुद्दे' : 'Major Issues'}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ward.majorIssues.map((issue, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="text-[10px] border-primary/40 text-primary bg-primary/5 gap-1"
                >
                  <AlertCircle className="h-2.5 w-2.5" />
                  {isHi ? issue.hi : issue.en}
                </Badge>
              ))}
            </div>
            {/* Complaint density categories when heat overlay is on */}
            {showHeat && density.categories.length > 0 && (
              <div className="mt-2 pt-2 border-t border-border/40">
                <div className="text-[10px] text-muted-foreground mb-1">
                  {isHi ? 'शिकायत श्रेणियाँ:' : 'Complaint categories:'}
                </div>
                <div className="flex flex-wrap gap-1">
                  {density.categories.map((cat, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="text-[10px] border-[#c2410c]/40 text-[#c2410c] bg-[#c2410c]/5 gap-1"
                    >
                      <Flame className="h-2.5 w-2.5" />
                      {isHi ? cat.hi : cat.en}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Landmarks on map for selected ward */}
        {wardLandmarks.length > 0 && (
          <motion.div
            className="p-3 rounded-lg bg-secondary/50 border border-border/60 mb-5"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
              <Landmark className="h-3 w-3" />
              {isHi ? 'वार्ड स्थल मानचित्र पर' : 'Ward landmarks on map'}
            </div>
            <div className="flex flex-wrap gap-2">
              {wardLandmarks.map((lm, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="text-[10px] border-primary/30 bg-primary/5 gap-1"
                >
                  {getLandmarkIcon(lm.type)}
                  {isHi ? getLandmarkLabel(lm.type).hi : getLandmarkLabel(lm.type).en}
                </Badge>
              ))}
            </div>
          </motion.div>
        )}

        {/* Connected wards — infrastructure connections */}
        <motion.div
          className="p-3 rounded-lg bg-secondary/30 border border-border/40 mb-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
            <Map className="h-3 w-3" />
            {isHi ? 'सड़क / मार्ग संपर्क' : 'Road / Path Connections'}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {connectedWards.map((cNo) => (
              <Badge
                key={cNo}
                variant="outline"
                className="text-[10px] border-border/60 bg-background gap-1"
              >
                <Map className="h-2.5 w-2.5 text-muted-foreground" />
                {isHi ? `वार्ड ${cNo}` : `Ward ${cNo}`}
              </Badge>
            ))}
          </div>
        </motion.div>

        {/* Contact */}
        <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-0.5">
              <Phone className="h-3 w-3" />
              {isHi ? 'संपर्क नंबर' : 'Contact Number'}
            </div>
            <div className="text-base font-bold text-primary tracking-wide tabular-nums">
              {ward.contact ?? (isHi ? 'शीघ्र उपलब्ध' : 'Coming soon')}
            </div>
          </div>
          <div className="text-[10px] text-muted-foreground text-right">
            <div>{isHi ? 'कार्यालय समय' : 'Office hours'}</div>
            <div className="font-medium">10 AM – 5 PM</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Helper: landmark icon (emoji-style) ───
function getLandmarkIcon(type: LandmarkPosition['type']): string {
  switch (type) {
    case 'school': return '🏫'
    case 'temple': return '🛕'
    case 'handpump': return '💧'
    case 'anganwadi': return '🏠'
    case 'pond': return '🌊'
    case 'panchayatBhawan': return '🏛️'
    default: return '📍'
  }
}

// ─── Helper: landmark bilingual label ───
function getLandmarkLabel(type: LandmarkPosition['type']): Bi {
  switch (type) {
    case 'school': return { hi: 'विद्यालय', en: 'School' }
    case 'temple': return { hi: 'मंदिर', en: 'Temple' }
    case 'handpump': return { hi: 'हैंडपंप', en: 'Handpump' }
    case 'anganwadi': return { hi: 'आंगनवाड़ी', en: 'Anganwadi' }
    case 'pond': return { hi: 'तालाब', en: 'Pond' }
    case 'panchayatBhawan': return { hi: 'पंचायत भवन', en: 'Panchayat Bhawan' }
    default: return { hi: 'स्थल', en: 'Location' }
  }
}

// ─── Stat tile component ───
function StatTile({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  value: string
  highlight?: 'green' | 'amber' | 'saffron'
}) {
  const highlightClass = highlight
    ? highlight === 'green'
      ? 'text-green-600'
      : highlight === 'amber'
        ? 'text-amber-600'
        : 'text-[#c2410c]'
    : ''

  return (
    <div className="p-3 rounded-xl bg-secondary/50 border border-border/60">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className={`text-lg font-bold ${highlightClass}`}>{value}</div>
    </div>
  )
}
