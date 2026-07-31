'use client'
import { useI18n } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Utensils,
  Star,
  User,
  Phone,
  Users,
  School,
  Flame,
  Apple,
  Egg,
  Leaf,
  CheckCircle2,
  Camera,
} from 'lucide-react'
import { ScrollReveal } from './ScrollReveal'

/* ──────────────────────────────────────────────────────────────────────
   Mid-Day Meal Menu — Gram Panchayat Chandra
   Day-wise menu for Primary School Chandra Khas, bilingual (hi/en).
   Source: VLM OCR from IMG-20260728-WA0126.jpg
   ────────────────────────────────────────────────────────────────────── */

interface DayMenu {
  dayHi: string
  dayEn: string
  primaryHi: string
  primaryEn: string
  upperPrimaryHi: string
  upperPrimaryEn: string
  icon: React.ReactNode
  rating: number // decorative taste rating (1-5)
  special?: { hi: string; en: string }
}

const WEEKLY_MENU: DayMenu[] = [
  {
    dayHi: 'सोमवार',
    dayEn: 'Monday',
    primaryHi: 'चावल, दाल, सब्जी',
    primaryEn: 'Rice, Dal, Vegetable',
    upperPrimaryHi: 'चावल, दाल, सब्जी (बड़ा परोस)',
    upperPrimaryEn: 'Rice, Dal, Vegetable (larger portion)',
    icon: <Flame className="h-4 w-4" />,
    rating: 4,
  },
  {
    dayHi: 'मंगलवार',
    dayEn: 'Tuesday',
    primaryHi: 'रोटी, दाल, सब्जी',
    primaryEn: 'Roti, Dal, Vegetable',
    upperPrimaryHi: 'रोटी, दाल, सब्जी (बड़ा परोस)',
    upperPrimaryEn: 'Roti, Dal, Vegetable (larger portion)',
    icon: <Utensils className="h-4 w-4" />,
    rating: 4,
  },
  {
    dayHi: 'बुधवार',
    dayEn: 'Wednesday',
    primaryHi: 'चावल, राजमा, सब्जी',
    primaryEn: 'Rice, Rajma, Vegetable',
    upperPrimaryHi: 'चावल, राजमा, सब्जी (बड़ा परोस)',
    upperPrimaryEn: 'Rice, Rajma, Vegetable (larger portion)',
    icon: <Apple className="h-4 w-4" />,
    rating: 5,
    special: { hi: 'राजमा — बच्चों का पसंदीदा!', en: 'Rajma — children\'s favourite!' },
  },
  {
    dayHi: 'गुरुवार',
    dayEn: 'Thursday',
    primaryHi: 'पूड़ी, छोले, सब्जी',
    primaryEn: 'Puri, Chole, Vegetable',
    upperPrimaryHi: 'पूड़ी, छोले, सब्जी (बड़ा परोस)',
    upperPrimaryEn: 'Puri, Chole, Vegetable (larger portion)',
    icon: <Flame className="h-4 w-4" />,
    rating: 5,
    special: { hi: 'पूड़ी-छोले — सबको पसंद!', en: 'Puri-Chole — everyone loves it!' },
  },
  {
    dayHi: 'शुक्रवार',
    dayEn: 'Friday',
    primaryHi: 'चावल, दाल, सब्जी, अंडा',
    primaryEn: 'Rice, Dal, Vegetable, Egg',
    upperPrimaryHi: 'चावल, दाल, सब्जी, अंडा (बड़ा परोस)',
    upperPrimaryEn: 'Rice, Dal, Vegetable, Egg (larger portion)',
    icon: <Egg className="h-4 w-4" />,
    rating: 5,
    special: { hi: 'अंडा — प्रोटीन दिवस!', en: 'Egg — protein day!' },
  },
]

// Cook information
const COOK = {
  nameHi: 'विमला देवी',
  nameEn: 'Vimala Devi',
  roleHi: 'रसोईया',
  roleEn: 'Cook',
  phone: '9519805850',
  initialsHi: 'वि',
  initialsEn: 'V',
}

const TOTAL_STUDENTS = 64

// Warm Indian palette — NO indigo/blue
const SAFFRON = '#c2410c'
const GREEN = '#16a34a'

export function MidDayMealMenu() {
  const { locale } = useI18n()
  const isHi = locale === 'hi'

  return (
    <section id="mid-day-meal" className="section-premium-accent py-16 md:py-20 border-b border-border/40">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10">
          <Badge variant="outline" className="section-header-badge mb-3 gap-1.5">
            <Utensils className="h-3.5 w-3.5" />
            {isHi ? 'मध्याह्न भोजन' : 'Mid-Day Meal'}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gradient-premium">
            {isHi
              ? 'मध्याह्न भोजन मेनू — दिनवार'
              : 'Mid-Day Meal Menu — Day-wise'}
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            {isHi
              ? 'प्राथमिक विद्यालय चंद्रा खास में मध्याह्न भोजन योजना के अंतर्गत प्रतिदिन बच्चों को पौष्टिक भोजन प्रोस्य होता है।'
              : 'Under the Mid-Day Meal Scheme at Primary School Chandra Khas, children receive nutritious meals daily.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
            <Badge className="bg-primary/10 text-primary border-primary/20 text-[11px] gap-1">
              <School className="h-3 w-3" />
              {isHi ? 'प्राथमिक विद्यालय चंद्रा खास' : 'PS Chandra Khas'}
            </Badge>
            <Badge className="bg-green-600/10 text-green-700 border-green-600/30 text-[11px] gap-1">
              <Leaf className="h-3 w-3" />
              {isHi ? 'स्रोत: VLM OCR' : 'Source: VLM OCR'}
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <ScrollReveal delay={0.12}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="card-premium-bordered p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg grid place-items-center shrink-0 bg-primary/10 text-primary">
                <Users className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-2xl font-bold">{TOTAL_STUDENTS}</div>
                <div className="text-xs text-muted-foreground">
                  {isHi ? 'कुल विद्यार्थी' : 'Total Students'}
                </div>
              </div>
            </div>

            <div className="card-premium-bordered-green p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg grid place-items-center shrink-0 bg-green-600/10 text-green-700">
                <Leaf className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-2xl font-bold">5</div>
                <div className="text-xs text-muted-foreground">
                  {isHi ? 'दिन / व्यंजन' : 'Days / Dishes'}
                </div>
              </div>
            </div>

            <div className="card-premium-bordered p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg grid place-items-center shrink-0 bg-amber-500/10 text-amber-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-2xl font-bold">{isHi ? 'सक्रिय' : 'Active'}</div>
                <div className="text-xs text-muted-foreground">
                  {isHi ? 'योजना स्थिति' : 'Scheme Status'}
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Primary Menu Table */}
        <ScrollReveal delay={0.14}>
          <Card className="card-premium overflow-hidden mb-8">
            {/* Tricolor accent bar */}
            <div className="h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />
            <CardHeader className="pb-3 bg-gradient-to-r from-primary/10 via-amber-500/5 to-green-600/5">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-sm font-semibold leading-tight flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg grid place-items-center shrink-0 bg-primary text-primary-foreground">
                    <Utensils className="h-3.5 w-3.5" />
                  </div>
                  {isHi ? 'प्राथमिक विद्यार्थी मेनू / Primary Menu' : 'Primary Student Menu'}
                </CardTitle>
                <Badge variant="outline" className="text-[10px] gap-1 bg-primary/10 text-primary border-primary/20">
                  <School className="h-3 w-3" />
                  {isHi ? 'कक्षा 1-5' : 'Class 1-5'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Table header */}
              <div className="grid grid-cols-12 gap-0 px-4 py-3 bg-secondary/50 border-b border-border/60 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <div className="col-span-3">{isHi ? 'दिन' : 'Day'}</div>
                <div className="col-span-5">{isHi ? 'भोजन (हिंदी)' : 'Meal (Hindi)'}</div>
                <div className="col-span-3">{isHi ? 'भोजन (English)' : 'Meal (English)'}</div>
                <div className="col-span-1 text-center">{isHi ? '★' : '★'}</div>
              </div>

              {/* Day rows */}
              {WEEKLY_MENU.map((menu, idx) => (
                <div
                  key={idx}
                  className={`grid grid-cols-12 gap-0 px-4 py-3.5 items-center hover:bg-primary/5 transition-colors ${
                    idx !== WEEKLY_MENU.length - 1 ? 'border-b border-border/40' : ''
                  }`}
                >
                  {/* Day name + icon */}
                  <div className="col-span-3 flex items-center gap-2">
                    <div
                      className="h-7 w-7 rounded-lg grid place-items-center shrink-0"
                      style={{
                        backgroundColor: idx % 2 === 0 ? `${SAFFRON}15` : `${GREEN}15`,
                        color: idx % 2 === 0 ? SAFFRON : GREEN,
                      }}
                    >
                      {menu.icon}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-foreground">
                        {isHi ? menu.dayHi : menu.dayEn}
                      </span>
                      <span className="text-[10px] text-muted-foreground block">
                        {isHi ? menu.dayEn : menu.dayHi}
                      </span>
                    </div>
                  </div>

                  {/* Hindi meal */}
                  <div className="col-span-5 text-sm text-foreground font-medium">
                    {isHi ? menu.primaryHi : menu.primaryEn}
                    {menu.special && (
                      <span className="text-[10px] ml-1 inline-flex items-center gap-0.5 text-green-700 dark:text-green-400 font-medium">
                        <CheckCircle2 className="h-2.5 w-2.5" />
                        {isHi ? menu.special.hi : menu.special.en}
                      </span>
                    )}
                  </div>

                  {/* English meal */}
                  <div className="col-span-3 text-sm text-muted-foreground">
                    {isHi ? menu.primaryEn : menu.primaryHi}
                  </div>

                  {/* Decorative stars */}
                  <div className="col-span-1 text-center flex items-center justify-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, si) => (
                      <Star
                        key={si}
                        className={`h-3 w-3 ${si < menu.rating ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground/30'}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Upper Primary Menu Table */}
        <ScrollReveal delay={0.16}>
          <Card className="card-premium-bordered-green overflow-hidden mb-8">
            <CardHeader className="pb-3 bg-gradient-to-r from-green-600/10 via-amber-500/5 to-primary/5">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-sm font-semibold leading-tight flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg grid place-items-center shrink-0 bg-green-600 text-white">
                    <Flame className="h-3.5 w-3.5" />
                  </div>
                  {isHi ? 'ऊपरी प्राथमिक मेनू / Upper Primary Menu' : 'Upper Primary Student Menu'}
                </CardTitle>
                <Badge variant="outline" className="text-[10px] gap-1 bg-green-600/10 text-green-700 border-green-600/30">
                  <School className="h-3 w-3" />
                  {isHi ? 'बड़ा परोस' : 'Larger Portion'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Table header */}
              <div className="grid grid-cols-12 gap-0 px-4 py-3 bg-secondary/50 border-b border-border/60 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <div className="col-span-3">{isHi ? 'दिन' : 'Day'}</div>
                <div className="col-span-5">{isHi ? 'भोजन (हिंदी)' : 'Meal (Hindi)'}</div>
                <div className="col-span-3">{isHi ? 'भोजन (English)' : 'Meal (English)'}</div>
                <div className="col-span-1 text-center">{isHi ? '★' : '★'}</div>
              </div>

              {/* Day rows */}
              {WEEKLY_MENU.map((menu, idx) => (
                <div
                  key={idx}
                  className={`grid grid-cols-12 gap-0 px-4 py-3.5 items-center hover:bg-green-600/5 transition-colors ${
                    idx !== WEEKLY_MENU.length - 1 ? 'border-b border-border/40' : ''
                  }`}
                >
                  {/* Day name + icon */}
                  <div className="col-span-3 flex items-center gap-2">
                    <div
                      className="h-7 w-7 rounded-lg grid place-items-center shrink-0"
                      style={{
                        backgroundColor: idx % 2 === 0 ? `${GREEN}15` : `${SAFFRON}15`,
                        color: idx % 2 === 0 ? GREEN : SAFFRON,
                      }}
                    >
                      {menu.icon}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-foreground">
                        {isHi ? menu.dayHi : menu.dayEn}
                      </span>
                      <span className="text-[10px] text-muted-foreground block">
                        {isHi ? menu.dayEn : menu.dayHi}
                      </span>
                    </div>
                  </div>

                  {/* Hindi meal */}
                  <div className="col-span-5 text-sm text-foreground font-medium">
                    {isHi ? menu.upperPrimaryHi : menu.upperPrimaryEn}
                    {menu.special && (
                      <span className="text-[10px] ml-1 inline-flex items-center gap-0.5 text-green-700 dark:text-green-400 font-medium">
                        <CheckCircle2 className="h-2.5 w-2.5" />
                        {isHi ? menu.special.hi : menu.special.en}
                      </span>
                    )}
                  </div>

                  {/* English meal */}
                  <div className="col-span-3 text-sm text-muted-foreground">
                    {isHi ? menu.upperPrimaryEn : menu.upperPrimaryHi}
                  </div>

                  {/* Decorative stars */}
                  <div className="col-span-1 text-center flex items-center justify-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, si) => (
                      <Star
                        key={si}
                        className={`h-3 w-3 ${si < menu.rating ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground/30'}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Cook Info Card */}
        <ScrollReveal delay={0.18}>
          <Card className="card-premium-bordered hover-lift overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                {/* Avatar */}
                <div className="h-14 w-14 rounded-xl grid place-items-center shrink-0 bg-gradient-to-br from-primary/20 via-amber-500/20 to-green-600/20 text-primary border-2 border-primary/30 shadow-md">
                  <span className="text-xl font-bold">{isHi ? COOK.initialsHi : COOK.initialsEn}</span>
                </div>

                {/* Cook details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base leading-tight flex items-center gap-2">
                    {isHi ? COOK.nameHi : COOK.nameEn}
                    <Badge variant="outline" className="text-[10px] gap-1 bg-primary/10 text-primary border-primary/20">
                      <Utensils className="h-3 w-3" />
                      {isHi ? COOK.roleHi : COOK.roleEn}
                    </Badge>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isHi
                      ? 'प्राथमिक विद्यालय चंद्रा खास में मध्याह्न भोजन रसोईया — प्रतिदिन 64 विद्यार्थियों को पौष्टिक भोजन परोसती हैं।'
                      : 'Mid-Day Meal Cook at Primary School Chandra Khas — serves nutritious meals to 64 students daily.'}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <a
                      href={`tel:${COOK.phone}`}
                      className="inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline"
                    >
                      <Phone className="h-3 w-3" />
                      {COOK.phone}
                    </a>
                    <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/30 gap-1">
                      <Users className="h-3 w-3" />
                      {isHi ? `${TOTAL_STUDENTS} विद्यार्थी` : `${TOTAL_STUDENTS} students`}
                    </Badge>
                  </div>
                </div>

                {/* Photo credit */}
                <div className="shrink-0 flex flex-col items-end gap-1">
                  <div className="h-9 w-9 rounded-lg grid place-items-center bg-secondary text-muted-foreground">
                    <Camera className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] text-muted-foreground text-right">
                    {isHi ? 'स्रोत: IMG-20260728-WA0126.jpg' : 'Source: IMG-20260728-WA0126.jpg'}
                  </span>
                  <span className="text-[10px] text-muted-foreground text-right">
                    {isHi ? 'VLM OCR वास्तविक मेनू' : 'VLM OCR — real menu'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Footer Note */}
        <div className="mt-10">
          <p className="text-center text-xs text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {isHi
              ? 'मेनू में बदलाव हो सकते हैं। राजमा और छोले विशेष दिनों में प्रोस्य होते हैं। स्रोत: VLM OCR विश्लेषण (IMG-20260728-WA0126.jpg)'
              : 'Menu may vary. Rajma and Chole served on special days. Source: VLM OCR analysis (IMG-20260728-WA0126.jpg)'}
          </p>
        </div>
      </div>
    </section>
  )
}
