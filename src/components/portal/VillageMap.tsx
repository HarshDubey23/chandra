'use client'
import { useEffect, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MapPin, ExternalLink, Navigation, Building2, Compass, Mountain, TreePine } from 'lucide-react'
import { ScrollReveal } from './ScrollReveal'

interface SiteConfig {
  panchayat_code: string
  block_name: string
  district_name: string
  state_name: string
  panchayat_name: string
  tehsil: string
  vehicle_prefix: string
  coords: { lat: number; lng: number }
  office_address_hi: string
  office_address_en: string
  total_wards: number
}

export function VillageMap() {
  const { locale } = useI18n()
  const [config, setConfig] = useState<SiteConfig | null>(null)

  const isHi = locale === 'hi'

  useEffect(() => {
    fetch('/api/profile?key=site_config').then(r => r.json()).then(d => setConfig(d.value)).catch(() => {})
  }, [])

  const lat = config?.coords?.lat ?? 25.187
  const lng = config?.coords?.lng ?? 81.612
  const panchayatName = config?.panchayat_name ?? 'Chandra'
  const block = config?.block_name ?? 'Shankargarh'
  const district = config?.district_name ?? 'Prayagraj'
  const state = config?.state_name ?? 'Uttar Pradesh'
  const vehiclePrefix = config?.vehicle_prefix ?? 'UP-70'

  const osmUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`

  return (
    <section id="village-map" className="section-premium-accent py-16 md:py-20 border-b border-border/40">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10">
          <Badge variant="outline" className="section-header-badge mb-3 gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {isHi ? 'ग्राम स्थान' : 'Village Location'}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gradient-premium">
            {isHi ? 'ग्राम चंद्रा — स्थान एवं भौगोलिक विवरण' : 'Chandra Village — Location & Geography'}
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            {isHi
              ? 'ग्राम पंचायत चंद्रा का भौगोलिक स्थान, प्रशासनिक विवरण एवं नक्शा'
              : 'Geographic location, administrative details & map of Gram Panchayat Chandra'}
          </p>
        </div>

        <ScrollReveal delay={0.1}>
          <Card className="card-premium max-w-3xl mx-auto hover-lift-lg">
            {/* Tricolor accent bar */}
            <div className="h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#138808] rounded-t-xl" />
            <CardContent className="pt-6 pb-6">
              {/* Decorative compass icon and map placeholder */}
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                {/* Map pin avatar placeholder with compass */}
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="h-16 w-16 rounded-full border-2 border-primary/40 shadow-lg">
                    <AvatarFallback className="bg-gradient-to-br from-primary/15 to-primary/5 text-primary">
                      <MapPin className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="h-8 w-8 rounded-full bg-accent/10 text-accent-foreground grid place-items-center shadow-sm">
                    <Compass className="h-4 w-4" />
                  </div>
                </div>

                {/* Location details */}
                <div className="flex-1 space-y-3 text-center md:text-left">
                  <div className="text-lg font-bold">
                    {isHi
                      ? `ग्राम पंचायत ${panchayatName}`
                      : `Gram Panchayat ${panchayatName}`}
                  </div>

                  <div className="space-y-1.5 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                      <Building2 className="h-3.5 w-3.5 text-primary" />
                      <span>{isHi ? `विकास खण्ड: ${block}` : `Block: ${block}`}</span>
                    </div>
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                      <Navigation className="h-3.5 w-3.5 text-primary" />
                      <span>{isHi ? `जनपद: ${district}, ${state}` : `District: ${district}, ${state}`}</span>
                    </div>
                  </div>

                  {/* Geographic details */}
                  <div className="bg-gradient-to-r from-secondary/50 via-secondary/30 to-accent/5 rounded-xl p-3 border border-border/50 shadow-sm">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <Mountain className="h-4 w-4 text-primary/60" />
                      <span>{isHi ? 'विंध्य पर्वतमाला के निकट' : 'Near Vindhya Range'}</span>
                      <TreePine className="h-4 w-4 text-accent-foreground/60 ml-2" />
                      <span>{isHi ? 'कृषि प्रधान ग्राम' : 'Agriculture-dominated village'}</span>
                    </div>
                  </div>

                  {/* Coordinates */}
                  <div className="flex items-center gap-2 justify-center md:justify-start">
                    <Badge variant="outline" className="text-xs font-mono gap-1 shadow-sm">
                      <MapPin className="h-2.5 w-2.5" />
                      {lat.toFixed(3)}°N, {lng.toFixed(3)}°E
                    </Badge>
                  </div>

                  {/* Additional reference info */}
                  <div className="grid grid-cols-2 gap-3 mt-2 text-xs">
                    <div className="bg-gradient-to-br from-secondary/50 to-secondary/30 rounded-xl p-3 border border-border/40 shadow-sm">
                      <div className="text-muted-foreground text-[10px] uppercase tracking-wider">{isHi ? 'संदर्भ नगर' : 'Reference Town'}</div>
                      <div className="font-medium mt-1">{isHi ? 'शंकरगढ़ (17,785 जनसंख्या)' : 'Shankargarh (Pop. 17,785)'}</div>
                      <a
                        href="https://en.wikipedia.org/wiki/Shankargarh"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary text-[10px] hover:underline flex items-center gap-0.5 mt-1"
                      >
                        <ExternalLink className="h-2.5 w-2.5" />
                        Wikipedia
                      </a>
                    </div>
                    <div className="bg-gradient-to-br from-secondary/50 to-secondary/30 rounded-xl p-3 border border-border/40 shadow-sm">
                      <div className="text-muted-foreground text-[10px] uppercase tracking-wider">{isHi ? 'अन्य विवरण' : 'Other Details'}</div>
                      <div className="font-medium mt-1">{isHi ? `वाहन: ${vehiclePrefix}` : `Vehicle: ${vehiclePrefix}`}</div>
                      <div className="text-muted-foreground mt-0.5">{isHi ? 'PIN: 212108' : 'PIN: 212108'}</div>
                    </div>
                  </div>

                  {/* OpenStreetMap link */}
                  <Button asChild variant="default" size="sm" className="gap-1.5 mt-3 shadow-md">
                    <a href={osmUrl} target="_blank" rel="noopener noreferrer">
                      <MapPin className="h-3.5 w-3.5" />
                      {isHi ? 'OpenStreetMap पर देखें' : 'View on OpenStreetMap'}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>
    </section>
  )
}
