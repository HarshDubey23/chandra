'use client'
import { useI18n } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'
import { motion } from 'framer-motion'
import {
  Trees,
  Droplets,
  Wheat,
  Building,
  Sun,
  Wind,
  Mountain,
  Tractor,
  LandPlot,
  TreePine,
  Waves,
  Sprout,
  Flame,
  MapPin,
  Phone,
  Clock,
  Info,
  CheckCircle2,
  ExternalLink,
  Combine,
} from 'lucide-react'
import { ScrollReveal } from './ScrollReveal'

// ── Land-use breakdown data (6 slices, 460 ha total) ──
interface LandUseSlice {
  key: string
  nameHi: string
  nameEn: string
  value: number // hectare
  pct: number
  color: string
}

const LAND_USE: LandUseSlice[] = [
  { key: 'agri',   nameHi: 'कृषि भूमि',          nameEn: 'Agricultural Land',    value: 285, pct: 62.0, color: '#FF9933' },
  { key: 'forest', nameHi: 'वन / चारागाह',        nameEn: 'Forest / Grazing',     value: 65,  pct: 14.1, color: '#138808' },
  { key: 'resi',   nameHi: 'आवासीय क्षेत्र',       nameEn: 'Residential',          value: 42,  pct: 9.1,  color: '#F59E0B' },
  { key: 'water',  nameHi: 'जल स्रोत',             nameEn: 'Water Bodies',         value: 18,  pct: 3.9,  color: '#0EA5E9' },
  { key: 'pub',    nameHi: 'सार्वजनिक ढांचा',      nameEn: 'Public Infrastructure',value: 15,  pct: 3.3,  color: '#8B5CF6' },
  { key: 'waste',  nameHi: 'बंजर / अन्य',          nameEn: 'Wasteland / Other',    value: 35,  pct: 7.6,  color: '#6B7280' },
]

const TOTAL_HA = 460

// ── Water bodies & irrigation sources ──
const WATER_BODIES = [
  {
    id: 'tubewells',
    icon: Droplets,
    titleHi: 'सरकारी ट्यूबवेल',
    titleEn: 'Government Tube wells',
    countHi: '4 ट्यूबवेल',
    countEn: '4 tube wells',
    descHi: 'सिंचाई हेतु',
    descEn: 'For irrigation',
    detailHi: 'वार्ड 2, 5, 7, 9',
    detailEn: 'Ward 2, 5, 7, 9',
  },
  {
    id: 'ponds',
    icon: Waves,
    titleHi: 'तालाब / पोखर',
    titleEn: 'Ponds / Tanks',
    countHi: '2 सामुदायिक तालाब',
    countEn: '2 community ponds',
    descHi: 'मछली पालन एवं पुनर्भरण',
    descEn: 'Fishery & recharge',
    detailHi: 'वार्ड 1 एवं 6',
    detailEn: 'Ward 1 & 6',
  },
  {
    id: 'canal',
    icon: Droplets,
    titleHi: 'नहर पहुँच',
    titleEn: 'Canal Reach',
    countHi: 'असी-वरुणा शाखा',
    countEn: 'Assi-Varuna canal branch',
    descHi: 'कृषि जल आपूर्ति',
    descEn: 'Agricultural water supply',
    detailHi: '145 हे कमान क्षेत्र',
    detailEn: '145 ha command area',
  },
]

// ── Common property resources ──
const CPR = [
  {
    id: 'bhawan',
    icon: Building,
    titleHi: 'पंचायत भवन',
    titleEn: 'Panchayat Bhawan',
    metaHi: '1 भवन',
    metaEn: '1 building',
    descHi: 'सरपंच कार्यालय',
    descEn: 'Sarpanch office',
    detailHi: 'वार्ड 4 · 2400 वर्ग फुट',
    detailEn: 'Ward 4 · 2400 sq ft',
  },
  {
    id: 'hall',
    icon: Building,
    titleHi: 'सामुदायिक भवन',
    titleEn: 'Community Hall',
    metaHi: '1 हॉल',
    metaEn: '1 hall',
    descHi: 'विवाह एवं सभाएँ',
    descEn: 'Weddings & meetings',
    detailHi: '200 क्षमता',
    detailEn: '200 capacity',
  },
  {
    id: 'cremation',
    icon: Flame,
    titleHi: 'श्मशान घाट',
    titleEn: 'Cremation Ground',
    metaHi: '1 स्थल',
    metaEn: '1 site',
    descHi: 'अंतिम संस्कार',
    descEn: 'Last rites',
    detailHi: 'वार्ड 8 बाहरी क्षेत्र',
    detailEn: 'Ward 8 outskirts',
  },
  {
    id: 'playground',
    icon: Mountain,
    titleHi: 'खेल का मैदान',
    titleEn: 'Playground',
    metaHi: '1 मैदान',
    metaEn: '1 ground',
    descHi: 'बच्चों का मैदान',
    descEn: "Children's ground",
    detailHi: '1.2 एकड़, विद्यालय के पास',
    detailEn: '1.2 acre near school',
  },
  {
    id: 'grazing',
    icon: Wheat,
    titleHi: 'चारागाह',
    titleEn: 'Grazing Land',
    metaHi: '65 हे',
    metaEn: '65 ha',
    descHi: 'चारागाह',
    descEn: 'Pasture land',
    detailHi: 'गोपालन हेतु',
    detailEn: 'For cattle grazing',
  },
  {
    id: 'forest',
    icon: TreePine,
    titleHi: 'वन क्षेत्र',
    titleEn: 'Forest Patch',
    metaHi: '28 हे',
    metaEn: '28 ha',
    descHi: 'वन क्षेत्र',
    descEn: 'Forest area',
    detailHi: 'संयुक्त वन प्रबंधन समिति',
    detailEn: 'Joint Forest Management Committee',
  },
]

// ── Renewable energy & public assets ──
const ENERGY_ASSETS = [
  {
    id: 'solar-street',
    icon: Sun,
    titleHi: 'सौर स्ट्रीट लाइट',
    titleEn: 'Solar Street Lights',
    metaHi: '38 लाइटें · 10 वार्ड',
    metaEn: '38 lights · 10 wards',
    descHi: 'रात्रि गशन',
    descEn: 'Night lighting',
    detailHi: '₹1.2 लाख/वर्ष बिजली बचत',
    detailEn: '₹1.2L/year electricity saved',
  },
  {
    id: 'solar-pump',
    icon: Sun,
    titleHi: 'सौर जल पम्प',
    titleEn: 'Solar Water Pump',
    metaHi: '2 पम्प · पेय जल',
    metaEn: '2 pumps · drinking water',
    descHi: 'पेय जल आपूर्ति',
    descEn: 'Drinking water supply',
    detailHi: 'वार्ड 3 एवं 7',
    detailEn: 'Ward 3 & 7',
  },
  {
    id: 'toilets',
    icon: Building,
    titleHi: 'सार्वजनिक शौचालय',
    titleEn: 'Public Toilets',
    metaHi: '4 यूनिट (2 पुरुष + 2 महिला)',
    metaEn: '4 units (2 male + 2 female)',
    descHi: 'सामुदायिक शौचालय',
    descEn: 'Community toilets',
    detailHi: 'ODF++ प्रमाणित',
    detailEn: 'ODF++ certified',
  },
  {
    id: 'biogas',
    icon: Wind,
    titleHi: 'बायो-गैस संयंत्र',
    titleEn: 'Bio-Gas Plant',
    metaHi: '1 संयंत्र · 5 घन मीटर',
    metaEn: '1 plant · 5 cubic m',
    descHi: 'कच्चे कचन से',
    descEn: 'From organic waste',
    detailHi: '8 घर जुड़े',
    detailEn: '8 households connected',
  },
]

// ── Agricultural equipment bank ──
interface EquipmentItem {
  key: string
  nameHi: string
  nameEn: string
  rent: number
  status: 'available' | 'on-rent'
  noteHi?: string
  noteEn?: string
}

const EQUIPMENT: EquipmentItem[] = [
  {
    key: 'tractor',
    nameHi: 'ट्रैक्टर (मैसी फर्ग्यूसन 385)',
    nameEn: 'Tractor (Massey Ferguson 385)',
    rent: 800,
    status: 'available',
  },
  {
    key: 'rotavator',
    nameHi: 'रोटावेटर',
    nameEn: 'Rotavator',
    rent: 400,
    status: 'available',
  },
  {
    key: 'thresher',
    nameHi: 'थ्रेसर',
    nameEn: 'Thresher',
    rent: 600,
    status: 'on-rent',
    noteHi: 'वापसी: 15 अगस्त',
    noteEn: 'Return: 15 Aug',
  },
  {
    key: 'pump',
    nameHi: 'सिंचाई पम्प सेट',
    nameEn: 'Irrigation Pump Set',
    rent: 200,
    status: 'available',
  },
  {
    key: 'combine',
    nameHi: 'कम्बाइन हार्वेस्टर',
    nameEn: 'Combine Harvester',
    rent: 1500,
    status: 'on-rent',
    noteHi: 'वापसी: 20 अक्टूबर',
    noteEn: 'Return: 20 Oct',
  },
]

// ── Crop calendar ──
const CROP_CALENDAR = [
  { cropHi: 'धान (खरीफ)', cropEn: 'Paddy (Kharif)', periodHi: 'जून–नवंबर', periodEn: 'Jun–Nov', area: 145 },
  { cropHi: 'गेहूं (रबी)', cropEn: 'Wheat (Rabi)', periodHi: 'नवंबर–अप्रैल', periodEn: 'Nov–Apr', area: 120 },
  { cropHi: 'चना', cropEn: 'Gram/Chana', periodHi: 'अक्टूबर–मार्च', periodEn: 'Oct–Mar', area: 40 },
  { cropHi: 'सरसों', cropEn: 'Mustard', periodHi: 'अक्टूबर–फरवरी', periodEn: 'Oct–Feb', area: 25 },
  { cropHi: 'सब्जी (बागवानी)', cropEn: 'Vegetables (Horticulture)', periodHi: 'सालभर', periodEn: 'Year-round', area: 20 },
]

// ── Custom tooltip for land-use pie chart ──
function LandUseTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: LandUseSlice }> }) {
  if (active && payload && payload.length) {
    const d = payload[0].payload
    return (
      <div className="bg-card border border-border rounded-xl px-3 py-2 text-xs shadow-lg">
        <div className="font-medium" style={{ color: d.color }}>{d.nameHi} / {d.nameEn}</div>
        <div className="text-muted-foreground">{d.value} ha ({d.pct}%)</div>
      </div>
    )
  }
  return null
}

export function VillageResources() {
  const { locale } = useI18n()
  const isHi = locale === 'hi'

  const landUseData = LAND_USE.map(d => ({
    name: isHi ? d.nameHi : d.nameEn,
    ...d,
  }))

  return (
    <section id="village-resources" className="section-premium-green py-16 md:py-20 border-b border-border/40">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10">
          <Badge variant="outline" className="section-header-badge mb-3 gap-1.5">
            <Trees className="h-3.5 w-3.5" />
            {isHi ? 'ग्राम संसाधन' : 'Village Resources'}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gradient-premium">
            {isHi ? 'ग्राम चंद्रा — भूमि, जल एवं संसाधन' : 'Gram Chandra — Land, Water & Resources'}
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            {isHi
              ? 'भूमि उपयोग, जल स्रोत, सार्वजनिक संपत्ति, कृषि उपकरण एवं ऊर्जा संसाधनों का विस्तृत विवरण'
              : 'Detailed overview of land use, water sources, public property, agricultural equipment & energy resources'}
          </p>
        </div>

        {/* Land Use Pie Chart + Legend */}
        <ScrollReveal delay={0.1}>
          <Card className="card-premium mb-8">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <LandPlot className="h-4 w-4 text-primary" />
                  {isHi ? 'भूमि उपयोग वितरण' : 'Land Use Distribution'}
                </CardTitle>
                <Badge variant="outline" className="text-[10px] gap-1">
                  {TOTAL_HA} ha
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6 items-center">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={landUseData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                      labelLine={true}
                    >
                      {landUseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<LandUseTooltip />} />
                    <Legend formatter={(value: string) => <span className="text-xs">{value}</span>} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {landUseData.map((d, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-secondary/40 border border-border/40">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-sm shrink-0" style={{ backgroundColor: d.color }} />
                        <span className="text-xs font-medium">{isHi ? d.nameHi : d.nameEn}</span>
                      </div>
                      <div className="text-xs">
                        <span className="font-semibold">{d.value} ha</span>
                        <span className="text-muted-foreground ml-1">({d.pct}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Water Bodies */}
        <ScrollReveal delay={0.15}>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {WATER_BODIES.map(wb => {
              const Icon = wb.icon
              return (
                <Card key={wb.id} className="card-premium-bordered-green hover-lift">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg grid place-items-center shrink-0 bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold">{isHi ? wb.titleHi : wb.titleEn}</div>
                        <div className="text-xs text-primary font-medium mt-0.5">{isHi ? wb.countHi : wb.countEn}</div>
                        <div className="text-[10px] text-muted-foreground mt-1">{isHi ? wb.descHi : wb.descEn}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                          <MapPin className="h-2.5 w-2.5" />
                          {isHi ? wb.detailHi : wb.detailEn}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </ScrollReveal>

        {/* Common Property Resources */}
        <ScrollReveal delay={0.2}>
          <Card className="card-premium mb-8">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <Building className="h-4 w-4 text-primary" />
                {isHi ? 'सार्वजनिक संपत्ति संसाधन' : 'Common Property Resources'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {CPR.map(c => {
                  const Icon = c.icon
                  return (
                    <div key={c.id} className="p-3 rounded-xl bg-secondary/40 border border-border/40 hover-lift">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-8 w-8 rounded-lg grid place-items-center shrink-0 bg-primary/10 text-primary">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="text-xs font-semibold">{isHi ? c.titleHi : c.titleEn}</div>
                      </div>
                      <div className="text-[10px] text-primary font-medium">{isHi ? c.metaHi : c.metaEn}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{isHi ? c.descHi : c.descEn}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{isHi ? c.detailHi : c.detailEn}</div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Renewable Energy & Public Assets */}
        <ScrollReveal delay={0.25}>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {ENERGY_ASSETS.map(ea => {
              const Icon = ea.icon
              return (
                <Card key={ea.id} className="card-premium-bordered hover-lift">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-2 mb-2">
                      <div className="h-8 w-8 rounded-lg grid place-items-center shrink-0 bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="text-xs font-semibold">{isHi ? ea.titleHi : ea.titleEn}</div>
                    </div>
                    <div className="text-[10px] text-primary font-medium">{isHi ? ea.metaHi : ea.metaEn}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{isHi ? ea.descHi : ea.descEn}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{isHi ? ea.detailHi : ea.detailEn}</div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </ScrollReveal>

        {/* Agricultural Equipment Bank */}
        <ScrollReveal delay={0.3}>
          <Card className="card-premium-bordered-green mb-8">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <Tractor className="h-4 w-4 text-primary" />
                  {isHi ? 'कृषि उपकरण बैंक' : 'Agricultural Equipment Bank'}
                </CardTitle>
                <Badge variant="outline" className="text-[10px] gap-1">
                  <Combine className="h-3 w-3" />
                  {isHi ? 'पंचायत उपकरण' : 'Panchayat Equipment'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {EQUIPMENT.map(eq => (
                  <div key={eq.key} className="p-3 rounded-xl bg-secondary/40 border border-border/40 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold">{isHi ? eq.nameHi : eq.nameEn}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {isHi ? 'किराया' : 'Rent'}: ₹{eq.rent}/{isHi ? 'घंटा' : 'hr'}
                      </div>
                      {eq.noteHi && (
                        <div className="text-[10px] text-amber-600 mt-0.5">{isHi ? eq.noteHi : eq.noteEn}</div>
                      )}
                    </div>
                    <Badge variant={eq.status === 'available' ? 'default' : 'secondary'} className="text-[10px] gap-1 shrink-0">
                      <CheckCircle2 className="h-3 w-3" />
                      {eq.status === 'available'
                        ? (isHi ? 'उपलब्ध' : 'Available')
                        : (isHi ? 'किराये पर' : 'On Rent')}
                    </Badge>
                  </div>
                ))}
              </div>
              <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-3">
                <Info className="h-3 w-3" />
                {isHi
                  ? 'संपर्क: पंचायत भवन · समय: 10 AM – 5 PM'
                  : 'Contact: Panchayat Bhawan · Hours: 10 AM – 5 PM'}
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Crop Calendar */}
        <ScrollReveal delay={0.35}>
          <Card className="card-premium mb-8">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <Sprout className="h-4 w-4 text-primary" />
                {isHi ? 'फसल कैलेंडर' : 'Crop Calendar'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {CROP_CALENDAR.map((crop, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-secondary/40 border border-border/40 hover-lift">
                    <div className="text-xs font-semibold">{isHi ? crop.cropHi : crop.cropEn}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" />
                      {isHi ? crop.periodHi : crop.periodEn}
                    </div>
                    <div className="text-[10px] text-primary font-medium mt-0.5">{crop.area} ha</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>
    </section>
  )
}
