'use client'
// Profile editor — Pradhan / Secretary / Site Config cards.
import { useEffect, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Loader2, Save, User, UserCog, MapPin } from 'lucide-react'

interface ProfileValue {
  name_hi?: string
  name_en?: string
  photo_url?: string
  education_hi?: string
  education_en?: string
  designation_hi?: string
  designation_en?: string
  mobile_last4?: string
  mobile_hashed?: string
  email?: string
  tenure_start?: string
  bio_hi?: string
  bio_en?: string
}

interface SiteConfigValue {
  panchayat_code?: string
  block_code?: string
  district_code?: string
  state_code?: string
  state_name?: string
  district_name?: string
  block_name?: string
  panchayat_name?: string
  tehsil?: string
  fin_year?: string
  vehicle_prefix?: string
  coords?: { lat: number; lng: number }
  gpdp_year?: string
  office_address_hi?: string
  office_address_en?: string
  total_wards?: number
  villages_under_gp?: number
  population_ref?: string
  [k: string]: unknown
}

type AllSettings = { pradhan: ProfileValue; secretary: ProfileValue; site_config: SiteConfigValue }

export function ProfileEditor() {
  const { locale } = useI18n()
  const [data, setData] = useState<AllSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingKey, setSavingKey] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    fetch('/api/profile')
      .then(r => r.json())
      .then(d => { if (alive) setData(d) })
      .catch(() => { if (alive) toast.error(locale === 'hi' ? 'प्रोफ़ाइल लोड विफल' : 'Profile load failed') })
      .finally(() => alive && setLoading(false))
    return () => { alive = false }
  }, [locale])

  const save = async (key: 'pradhan' | 'secretary' | 'site_config', value: ProfileValue | SiteConfigValue) => {
    setSavingKey(key)
    try {
      const r = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'save_failed')
      toast.success(locale === 'hi' ? `${key === 'pradhan' ? 'प्रधान' : key === 'secretary' ? 'सचिव' : 'साइट'} प्रोफ़ाइल सहेजी गई` : `${key} profile saved`)
    } catch (e) {
      toast.error(locale === 'hi' ? 'सहेजने में त्रुटि' : 'Save failed', { description: (e as Error).message })
    } finally {
      setSavingKey(null)
    }
  }

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 gap-4">
        <Skeleton className="h-96 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
        <Skeleton className="h-64 rounded-xl md:col-span-2" />
      </div>
    )
  }

  if (!data) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {locale === 'hi' ? 'प्रोफ़ाइल डेटा लोड नहीं हो सका।' : 'Could not load profile data.'}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold section-heading">
          {locale === 'hi' ? 'पदाधिकारी प्रोफ़ाइल' : 'Office Bearer Profiles'}
        </h2>
        <p className="text-xs text-muted-foreground mt-2">
          {locale === 'hi'
            ? 'प्रधान एवं सचिव की सार्वजनिक जानकारी संपादित करें। साइट कॉन्फ़िग केवल पठनीय है (कार्यालय पता संपादन योग्य)।'
            : 'Edit the public information for the Pradhan and Secretary. Site codes are read-only (office address is editable).'}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <PersonCard
          title={locale === 'hi' ? 'प्रधान प्रोफ़ाइल' : 'Pradhan Profile'}
          icon={<User className="h-4 w-4 text-primary" />}
          value={data.pradhan}
          saving={savingKey === 'pradhan'}
          locale={locale}
          onChange={(v) => setData({ ...data, pradhan: v })}
          onSave={() => save('pradhan', data.pradhan)}
          showEducation
        />
        <PersonCard
          title={locale === 'hi' ? 'सचिव प्रोफ़ाइल' : 'Secretary Profile'}
          icon={<UserCog className="h-4 w-4 text-primary" />}
          value={data.secretary}
          saving={savingKey === 'secretary'}
          locale={locale}
          onChange={(v) => setData({ ...data, secretary: v })}
          onSave={() => save('secretary', data.secretary)}
          showDesignation
        />
      </div>

      <SiteConfigCard
        value={data.site_config}
        saving={savingKey === 'site_config'}
        locale={locale}
        onChange={(v) => setData({ ...data, site_config: v })}
        onSave={() => save('site_config', data.site_config)}
      />
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Person card — Pradhan or Secretary
// ────────────────────────────────────────────────────────────────────────────
function PersonCard({
  title,
  icon,
  value,
  saving,
  locale,
  onChange,
  onSave,
  showEducation,
  showDesignation,
}: {
  title: string
  icon: React.ReactNode
  value: ProfileValue
  saving: boolean
  locale: 'hi' | 'en'
  onChange: (v: ProfileValue) => void
  onSave: () => void
  showEducation?: boolean
  showDesignation?: boolean
}) {
  const set = <K extends keyof ProfileValue>(k: K, v: ProfileValue[K]) => onChange({ ...value, [k]: v })
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">{locale === 'hi' ? 'नाम (हिंदी)' : 'Name (Hindi)'}</Label>
            <Input value={value.name_hi || ''} onChange={(e) => set('name_hi', e.target.value)} className="text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">{locale === 'hi' ? 'नाम (अंग्रेज़ी)' : 'Name (English)'}</Label>
            <Input value={value.name_en || ''} onChange={(e) => set('name_en', e.target.value)} className="text-sm" />
          </div>
        </div>

        {showEducation && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">{locale === 'hi' ? 'शिक्षा (हिंदी)' : 'Education (Hindi)'}</Label>
              <Input value={value.education_hi || ''} onChange={(e) => set('education_hi', e.target.value)} className="text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{locale === 'hi' ? 'शिक्षा (अंग्रेज़ी)' : 'Education (English)'}</Label>
              <Input value={value.education_en || ''} onChange={(e) => set('education_en', e.target.value)} className="text-sm" />
            </div>
          </div>
        )}

        {showDesignation && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">{locale === 'hi' ? 'पदनाम (हिंदी)' : 'Designation (Hindi)'}</Label>
              <Input value={value.designation_hi || ''} onChange={(e) => set('designation_hi', e.target.value)} className="text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{locale === 'hi' ? 'पदनाम (अंग्रेज़ी)' : 'Designation (English)'}</Label>
              <Input value={value.designation_en || ''} onChange={(e) => set('designation_en', e.target.value)} className="text-sm" />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">{locale === 'hi' ? 'मोबाइल (अंतिम 4)' : 'Mobile (last 4)'}</Label>
            <Input
              value={value.mobile_last4 || ''}
              onChange={(e) => set('mobile_last4', e.target.value.replace(/\D/g, '').slice(0, 4))}
              className="text-sm font-mono"
              inputMode="numeric"
            />
            <p className="text-[10px] text-muted-foreground">
              {locale === 'hi' ? 'पूर्ण नंबर हैश किया गया है (DPDP)।' : 'Full number is hashed (DPDP).'}
            </p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">{locale === 'hi' ? 'ईमेल' : 'Email'}</Label>
            <Input value={value.email || ''} onChange={(e) => set('email', e.target.value)} className="text-sm" type="email" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">{locale === 'hi' ? 'परिचय (हिंदी)' : 'Bio (Hindi)'}</Label>
          <Textarea value={value.bio_hi || ''} onChange={(e) => set('bio_hi', e.target.value)} className="text-sm min-h-[60px]" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">{locale === 'hi' ? 'परिचय (अंग्रेज़ी)' : 'Bio (English)'}</Label>
          <Textarea value={value.bio_en || ''} onChange={(e) => set('bio_en', e.target.value)} className="text-sm min-h-[60px]" />
        </div>

        <Button onClick={onSave} disabled={saving} className="w-full gap-1.5">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {locale === 'hi' ? 'सहेजें' : 'Save'}
        </Button>
      </CardContent>
    </Card>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Site config card — codes read-only, office address editable
// ────────────────────────────────────────────────────────────────────────────
function SiteConfigCard({
  value,
  saving,
  locale,
  onChange,
  onSave,
}: {
  value: SiteConfigValue
  saving: boolean
  locale: 'hi' | 'en'
  onChange: (v: SiteConfigValue) => void
  onSave: () => void
}) {
  const codes = [
    { k: 'panchayat_code', l: locale === 'hi' ? 'पंचायत कोड' : 'Panchayat Code' },
    { k: 'block_code', l: locale === 'hi' ? 'ब्लॉक कोड' : 'Block Code' },
    { k: 'district_code', l: locale === 'hi' ? 'ज़िला कोड' : 'District Code' },
    { k: 'state_code', l: locale === 'hi' ? 'राज्य कोड' : 'State Code' },
    { k: 'fin_year', l: locale === 'hi' ? 'वित्त वर्ष' : 'Financial Year' },
    { k: 'gpdp_year', l: locale === 'hi' ? 'GPDP वर्ष' : 'GPDP Year' },
  ]
  const set = <K extends keyof SiteConfigValue>(k: K, v: SiteConfigValue[K]) => onChange({ ...value, [k]: v })

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          {locale === 'hi' ? 'साइट कॉन्फ़िगरेशन' : 'Site Configuration'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {codes.map(c => (
            <div key={c.k} className="rounded-lg border bg-secondary/30 p-2.5">
              <div className="text-[10px] text-muted-foreground">{c.l}</div>
              <div className="text-xs font-mono font-semibold mt-0.5">{String(value[c.k as keyof SiteConfigValue] ?? '—')}</div>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-dashed p-2.5 text-xs text-muted-foreground flex items-center gap-2">
          <Badge variant="outline" className="text-[10px]">{locale === 'hi' ? 'केवल पठनीय' : 'Read-only'}</Badge>
          {locale === 'hi'
            ? 'पंचायत कोड OSINT-सत्यापित हैं और बदले नहीं जा सकते।'
            : 'Panchayat codes are OSINT-verified and cannot be changed.'}
        </div>

        <div className="grid md:grid-cols-2 gap-3 pt-2 border-t">
          <div className="space-y-1.5">
            <Label className="text-xs">{locale === 'hi' ? 'कार्यालय पता (हिंदी)' : 'Office Address (Hindi)'}</Label>
            <Textarea
              value={value.office_address_hi || ''}
              onChange={(e) => set('office_address_hi', e.target.value)}
              className="text-sm min-h-[80px]"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">{locale === 'hi' ? 'कार्यालय पता (अंग्रेज़ी)' : 'Office Address (English)'}</Label>
            <Textarea
              value={value.office_address_en || ''}
              onChange={(e) => set('office_address_en', e.target.value)}
              className="text-sm min-h-[80px]"
            />
          </div>
        </div>

        <Button onClick={onSave} disabled={saving} className="gap-1.5">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {locale === 'hi' ? 'पता सहेजें' : 'Save Address'}
        </Button>
      </CardContent>
    </Card>
  )
}
