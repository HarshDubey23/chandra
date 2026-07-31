'use client'
// Content Editor — admin can edit dynamic portal data with structured form or raw JSON.
// Master doc §4.3. Form mode provides labeled inputs; JSON mode for advanced users.
import { useEffect, useState, useCallback } from 'react'
import { useI18n } from '@/lib/i18n'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Database, Save, Loader2, Edit3, Check, X, AlertCircle, Code, FormInput, Plus } from 'lucide-react'

interface SectionMeta {
  key: string
  hi: string
  en: string
  icon: string
  description: string
  // Field definitions for structured form mode
  fields?: FieldDef[]
  // Array field definitions for list-type data (e.g., contacts, SHG groups)
  arrayFields?: ArrayFieldDef[]
}

interface FieldDef {
  path: string // dot-notation path e.g. "population", "roads.pucca_km"
  hi: string
  en: string
  type: 'number' | 'text'
  unit?: string
}

interface ArrayFieldDef {
  arrayPath: string // e.g. "contacts", "groups"
  itemHi: string // e.g. "संपर्क", "समूह"
  itemEn: string // e.g. "Contact", "Group"
  // Fields within each array item
  itemFields: { key: string; hi: string; en: string; type: 'number' | 'text' }[]
}

const SECTIONS: SectionMeta[] = [
  { key: 'village_stats', hi: 'ग्राम आँकड़े', en: 'Village Stats', icon: 'users', description: 'Population, households, literacy, workers',
    fields: [
      { path: 'population', hi: 'जनसंख्या', en: 'Population', type: 'number' },
      { path: 'households', hi: 'घर', en: 'Households', type: 'number' },
      { path: 'wards', hi: 'वार्ड', en: 'Wards', type: 'number' },
      { path: 'area_ha', hi: 'क्षेत्रफल (हेक्टेयर)', en: 'Area (ha)', type: 'number' },
      { path: 'literacy_rate', hi: 'साक्षरता दर (%)', en: 'Literacy Rate (%)', type: 'number' },
      { path: 'sex_ratio', hi: 'लिंग अनुपात', en: 'Sex Ratio', type: 'number' },
      { path: 'population_male', hi: 'पुरुष जनसंख्या', en: 'Male Population', type: 'number' },
      { path: 'population_female', hi: 'महिला जनसंख्या', en: 'Female Population', type: 'number' },
      { path: 'main_workers', hi: 'मुख्य श्रमिक', en: 'Main Workers', type: 'number' },
      { path: 'marginal_workers', hi: 'सीमांत श्रमिक', en: 'Marginal Workers', type: 'number' },
    ],
  },
  { key: 'infrastructure', hi: 'आधारभूत संरचना', en: 'Infrastructure', icon: 'building', description: 'Roads, water, power, sanitation',
    fields: [
      { path: 'roads.pucca_km', hi: 'पक्की सड़क (किमी)', en: 'Pucca Road (km)', type: 'number' },
      { path: 'roads.kuccha_km', hi: 'कच्ची सड़क (किमी)', en: 'Kuccha Road (km)', type: 'number' },
      { path: 'roads.drains_km', hi: 'नाली (किमी)', en: 'Drains (km)', type: 'number' },
      { path: 'water.handpumps', hi: 'हैंडपंप', en: 'Handpumps', type: 'number' },
      { path: 'water.tap_connections', hi: 'नल कनेक्शन', en: 'Tap Connections', type: 'number' },
      { path: 'water.jjm_coverage_pct', hi: 'JJM कवरेज (%)', en: 'JJM Coverage (%)', type: 'number' },
      { path: 'power.household_electrified', hi: 'विद्युत युक्त घर', en: 'Electrified Homes', type: 'number' },
      { path: 'power.solar_panels', hi: 'सौर पैनल', en: 'Solar Panels', type: 'number' },
      { path: 'power.street_lights', hi: 'स्ट्रीट लाइट', en: 'Street Lights', type: 'number' },
      { path: 'sanitation.ihhl_built', hi: 'शौचालय निर्मित', en: 'Toilets Built', type: 'number' },
      { path: 'sanitation.sbm_coverage_pct', hi: 'SBM कवरेज (%)', en: 'SBM Coverage (%)', type: 'number' },
    ],
  },
  { key: 'education', hi: 'शिक्षा', en: 'Education', icon: 'graduation', description: 'School, anganwadi, enrollment, literacy',
    fields: [
      { path: 'primary_school.teachers', hi: 'शिक्षक', en: 'Teachers', type: 'number' },
      { path: 'primary_school.students', hi: 'छात्र', en: 'Students', type: 'number' },
      { path: 'primary_school.rooms', hi: 'कक्षाएँ', en: 'Rooms', type: 'number' },
      { path: 'anganwadi.centers', hi: 'आंगनवाड़ी केंद्र', en: 'Anganwadi Centers', type: 'number' },
      { path: 'anganwadi.children_enrolled', hi: 'बच्चे नामांकित', en: 'Children Enrolled', type: 'number' },
      { path: 'literacy.male', hi: 'पुरुष साक्षरता (%)', en: 'Male Literacy (%)', type: 'number' },
      { path: 'literacy.female', hi: 'महिला साक्षरता (%)', en: 'Female Literacy (%)', type: 'number' },
      { path: 'literacy.overall', hi: 'कुल साक्षरता (%)', en: 'Overall Literacy (%)', type: 'number' },
      { path: 'mid_day_meal.students_served', hi: 'MDM छात्र', en: 'MDM Students', type: 'number' },
      { path: 'scholarships.total', hi: 'कुल छात्रवृत्ति', en: 'Total Scholarships', type: 'number' },
    ],
  },
  { key: 'health', hi: 'स्वास्थ्य', en: 'Health', icon: 'heart', description: 'Sub-center, PHC, immunization, maternal',
    fields: [
      { path: 'anganwadi_centers', hi: 'आंगनवाड़ी केंद्र', en: 'Anganwadi Centers', type: 'number' },
      { path: 'immunization_coverage_pct', hi: 'टीकाकरण कवरेज (%)', en: 'Immunization (%)', type: 'number' },
      { path: 'health_workers.anm', hi: 'ANM', en: 'ANM', type: 'number' },
      { path: 'health_workers.asha', hi: 'ASHA', en: 'ASHA', type: 'number' },
      { path: 'health_workers.anganwadi_workers', hi: 'आंगनवाड़ी कार्यकर्ता', en: 'Anganwadi Workers', type: 'number' },
      { path: 'sanitation.ihhl_built', hi: 'शौचालय निर्मित', en: 'Toilets Built', type: 'number' },
      { path: 'sanitation.coverage_pct', hi: 'SBM कवरेज (%)', en: 'SBM Coverage (%)', type: 'number' },
      { path: 'maternal_care.anc_registered', hi: 'ANC पंजीकृत', en: 'ANC Registered', type: 'number' },
      { path: 'maternal_care.institutional_deliveries', hi: 'संस्थागत प्रसव', en: 'Institutional Deliveries', type: 'number' },
    ],
  },
  { key: 'schemes_coverage', hi: 'योजना कवरेज', en: 'Scheme Coverage', icon: 'briefcase', description: 'MGNREGA, PMAY-G, JJM, pension, SBM-G',
    fields: [
      { path: 'mgnrega.active_jobcards', hi: 'मनरेगा सक्रिय जॉब कार्ड', en: 'MGNREGA Active Cards', type: 'number' },
      { path: 'mgnrega.total_jobcards', hi: 'मनरेगा कुल जॉब कार्ड', en: 'MGNREGA Total Cards', type: 'number' },
      { path: 'mgnrega.coverage_pct', hi: 'मनरेगा कवरेज (%)', en: 'MGNREGA Coverage (%)', type: 'number' },
      { path: 'mgnrega.persondays', hi: 'मानव-दिन', en: 'Persondays', type: 'number' },
      { path: 'mgnrega.expenditure_rs', hi: 'मनरेगा व्यय (₹)', en: 'MGNREGA Expenditure (₹)', type: 'number' },
      { path: 'pmay_g.completed', hi: 'PMAY पूर्ण', en: 'PMAY Completed', type: 'number' },
      { path: 'pmay_g.total', hi: 'PMAY कुल', en: 'PMAY Total', type: 'number' },
      { path: 'pmay_g.coverage_pct', hi: 'PMAY कवरेज (%)', en: 'PMAY Coverage (%)', type: 'number' },
      { path: 'jjm.tap_connections', hi: 'JJM नल कनेक्शन', en: 'JJM Tap Connections', type: 'number' },
      { path: 'jjm.coverage_pct', hi: 'JJM कवरेज (%)', en: 'JJM Coverage (%)', type: 'number' },
      { path: 'pension.old_age', hi: 'वृद्धा पेंशन', en: 'Old Age Pension', type: 'number' },
      { path: 'pension.widow', hi: 'विधवा पेंशन', en: 'Widow Pension', type: 'number' },
      { path: 'pension.divyang', hi: 'दिव्यांग पेंशन', en: 'Divyang Pension', type: 'number' },
    ],
  },
  { key: 'shg_directory', hi: 'स्व-सहायता समूह', en: 'SHG Directory', icon: 'users', description: 'Self-help groups, members, savings',
    arrayFields: [
      {
        arrayPath: 'groups', itemHi: 'समूह', itemEn: 'Group',
        itemFields: [
          { key: 'name', hi: 'नाम', en: 'Name', type: 'text' },
          { key: 'name_en', hi: 'नाम (अंग्रेज़ी)', en: 'Name (English)', type: 'text' },
          { key: 'members', hi: 'सदस्य', en: 'Members', type: 'number' },
          { key: 'ward', hi: 'वार्ड', en: 'Ward', type: 'number' },
          { key: 'activity', hi: 'गतिविधि', en: 'Activity', type: 'text' },
          { key: 'savings', hi: 'बचत (₹)', en: 'Savings (₹)', type: 'number' },
        ],
      },
    ],
  },
  { key: 'emergency_contacts', hi: 'आपातकालीन संपर्क', en: 'Emergency Contacts', icon: 'phone', description: 'Police, ambulance, PHC, utilities',
    arrayFields: [
      {
        arrayPath: 'contacts', itemHi: 'संपर्क', itemEn: 'Contact',
        itemFields: [
          { key: 'name_hi', hi: 'नाम (हिंदी)', en: 'Name (Hindi)', type: 'text' },
          { key: 'name_en', hi: 'नाम (अंग्रेज़ी)', en: 'Name (English)', type: 'text' },
          { key: 'phone', hi: 'फ़ोन', en: 'Phone', type: 'text' },
          { key: 'category', hi: 'श्रेणी', en: 'Category', type: 'text' },
          { key: 'available', hi: 'उपलब्ध', en: 'Available', type: 'text' },
        ],
      },
    ],
  },
]

// Get value at dot-notation path
function getPath(obj: unknown, path: string): unknown {
  const parts = path.split('.')
  let cur: unknown = obj
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in cur) {
      cur = (cur as Record<string, unknown>)[p]
    } else {
      return ''
    }
  }
  return cur
}

// Set value at dot-notation path (immutable)
function setPath(obj: Record<string, unknown>, path: string, val: unknown): Record<string, unknown> {
  const parts = path.split('.')
  const root = JSON.parse(JSON.stringify(obj)) as Record<string, unknown>
  let cur: Record<string, unknown> = root
  for (let i = 0; i < parts.length - 1; i++) {
    if (!cur[parts[i]] || typeof cur[parts[i]] !== 'object') cur[parts[i]] = {}
    cur = cur[parts[i]] as Record<string, unknown>
  }
  cur[parts[parts.length - 1]] = val
  return root
}

export function ContentEditor() {
  const { locale } = useI18n()
  const isHi = locale === 'hi'
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const [data, setData] = useState<Record<string, unknown>>({})
  const [editText, setEditText] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const [mode, setMode] = useState<'form' | 'json'>('form')

  const load = useCallback(async (key: string) => {
    setLoading(true)
    setDirty(false)
    try {
      const r = await fetch(`/api/content/${key}`)
      if (!r.ok) {
        if (r.status === 404) {
          setData({})
          setEditText('{}')
        }
        throw new Error('not_found')
      }
      const d = await r.json()
      const obj = (d.data || {}) as Record<string, unknown>
      setData(obj)
      setEditText(JSON.stringify(obj, null, 2))
      setUpdatedAt(d.updatedAt || null)
    } catch {
      setData({})
      setEditText('{}')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (activeKey) load(activeKey)
  }, [activeKey, load])

  // Sync editText when data changes via form mode
  useEffect(() => {
    if (mode === 'form' && dirty) {
      setEditText(JSON.stringify(data, null, 2))
    }
  }, [data, mode, dirty])

  const handleFieldChange = (path: string, val: string) => {
    const numVal = val === '' ? 0 : Number(val)
    const newData = setPath(data, path, isNaN(numVal) ? val : numVal)
    setData(newData)
    setDirty(true)
  }

  // ── Array item manipulation ──
  const handleArrayItemChange = (arrayPath: string, index: number, itemKey: string, val: string) => {
    const arr = (getPath(data, arrayPath) as Record<string, unknown>[]) || []
    const numVal = val === '' ? 0 : Number(val)
    const newArr = arr.map((item, i) => i === index ? { ...item, [itemKey]: isNaN(numVal) || itemKey === 'phone' ? val : numVal } : item)
    setData(setPath(data, arrayPath, newArr))
    setDirty(true)
  }

  const handleAddArrayItem = (arrayPath: string, itemFields: { key: string }[]) => {
    const arr = (getPath(data, arrayPath) as Record<string, unknown>[]) || []
    const newItem: Record<string, unknown> = {}
    for (const f of itemFields) newItem[f.key] = f.key === 'members' || f.key === 'ward' || f.key === 'savings' ? 0 : ''
    setData(setPath(data, arrayPath, [...arr, newItem]))
    setDirty(true)
  }

  const handleDeleteArrayItem = (arrayPath: string, index: number) => {
    const arr = (getPath(data, arrayPath) as Record<string, unknown>[]) || []
    setData(setPath(data, arrayPath, arr.filter((_, i) => i !== index)))
    setDirty(true)
  }

  const handleSave = async () => {
    if (!activeKey) return
    let parsed: unknown
    try {
      parsed = mode === 'json' ? JSON.parse(editText) : data
    } catch (e) {
      toast.error(isHi ? 'अमान्य JSON' : 'Invalid JSON', { description: (e as Error).message })
      return
    }
    setSaving(true)
    try {
      const r = await fetch(`/api/content/${activeKey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: parsed }),
      })
      if (!r.ok) throw new Error('save_failed')
      const d = await r.json()
      setUpdatedAt(d.updatedAt)
      setDirty(false)
      if (mode === 'json') setData(parsed as Record<string, unknown>)
      toast.success(isHi ? 'सामग्री सहेजी गई! पोर्टल तुरंत अपडेट होगा।' : 'Content saved! Portal updates instantly.')
    } catch (e) {
      toast.error(isHi ? 'सहेजने में विफल' : 'Save failed', { description: (e as Error).message })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (mode === 'json') {
      setEditText(JSON.stringify(data, null, 2))
    }
    setDirty(false)
  }

  const activeSection = SECTIONS.find(s => s.key === activeKey)
  const hasFields = !!activeSection?.fields

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold section-heading flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          {isHi ? 'सामग्री संपादक' : 'Content Editor'}
        </h2>
        <p className="text-xs text-muted-foreground mt-2">
          {isHi
            ? 'ग्राम के आँकड़े, आधारभूत संरचना, शिक्षा, स्वास्थ्य आदि संपादित करें — कोई कोड परिवर्तन नहीं।'
            : 'Edit village stats, infrastructure, education, health etc. — no code changes needed.'}
        </p>
      </div>

      {/* Section selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {SECTIONS.map(s => (
          <button
            key={s.key}
            onClick={() => setActiveKey(s.key)}
            className={`p-3 rounded-lg border text-left transition-all ${
              activeKey === s.key
                ? 'border-primary bg-primary/10 shadow-md ring-1 ring-primary/20'
                : 'border-border bg-card hover:border-primary/40 hover:bg-secondary/50'
            }`}
          >
            <div className="text-xs font-semibold leading-tight">
              {isHi ? s.hi : s.en}
            </div>
            <div className="text-[9px] text-muted-foreground mt-1 line-clamp-2 leading-tight">
              {s.description}
            </div>
          </button>
        ))}
      </div>

      {/* Editor */}
      {activeKey && (
        <Card className="border-primary/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">
                  {activeSection?.[isHi ? 'hi' : 'en']}
                </h3>
                <Badge variant="outline" className="text-[9px] font-mono">{activeKey}</Badge>
                {updatedAt && (
                  <span className="text-[10px] text-muted-foreground">
                    {isHi ? 'अपडेट: ' : 'Updated: '}
                    {new Date(updatedAt).toLocaleString(isHi ? 'hi-IN' : 'en-IN')}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {/* Mode toggle */}
                {(hasFields || activeSection?.arrayFields) && (
                  <div className="inline-flex rounded-lg border border-border overflow-hidden">
                    <button
                      onClick={() => setMode('form')}
                      className={`px-2.5 h-7 text-[10px] inline-flex items-center gap-1 transition-colors ${mode === 'form' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-secondary'}`}
                    >
                      <FormInput className="h-3 w-3" />
                      {isHi ? 'फॉर्म' : 'Form'}
                    </button>
                    <button
                      onClick={() => { setMode('json'); setEditText(JSON.stringify(data, null, 2)) }}
                      className={`px-2.5 h-7 text-[10px] inline-flex items-center gap-1 transition-colors ${mode === 'json' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-secondary'}`}
                    >
                      <Code className="h-3 w-3" />
                      JSON
                    </button>
                  </div>
                )}
                {dirty && (
                  <Badge className="text-[9px] bg-amber-500/20 text-amber-700 border-amber-400/40 gap-1">
                    <AlertCircle className="h-2.5 w-2.5" />
                    {isHi ? 'असहेजा' : 'Unsaved'}
                  </Badge>
                )}
                <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={handleReset} disabled={!dirty || saving}>
                  <X className="h-3 w-3" />
                  {isHi ? 'रद्द' : 'Revert'}
                </Button>
                <Button size="sm" className="h-7 text-xs gap-1 glow-saffron" onClick={handleSave} disabled={!dirty || saving}>
                  {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                  {isHi ? 'सहेजें' : 'Save'}
                </Button>
              </div>
            </div>

            {loading ? (
              <Skeleton className="h-96 rounded-lg" />
            ) : mode === 'form' && (hasFields || activeSection?.arrayFields) ? (
              /* Structured form mode — fields + arrays */
              <div className="space-y-4">
                {/* Scalar fields */}
                {hasFields && (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {activeSection!.fields!.map(f => {
                      const val = getPath(data, f.path)
                      return (
                        <div key={f.path} className="space-y-1">
                          <Label className="text-[10px] text-muted-foreground flex items-center justify-between">
                            <span>{isHi ? f.hi : f.en}</span>
                            <span className="font-mono text-[8px] opacity-50">{f.path}</span>
                          </Label>
                          <Input
                            type={f.type}
                            value={val === undefined || val === null ? '' : String(val)}
                            onChange={(e) => handleFieldChange(f.path, e.target.value)}
                            className="text-sm h-8"
                            dir={f.type === 'text' ? 'auto' : 'ltr'}
                          />
                          {f.unit && <span className="text-[8px] text-muted-foreground">{f.unit}</span>}
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Array fields — list editor with add/delete */}
                {activeSection?.arrayFields?.map(af => {
                  const arr = (getPath(data, af.arrayPath) as Record<string, unknown>[]) || []
                  return (
                    <div key={af.arrayPath} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold flex items-center gap-1.5">
                          <Database className="h-3 w-3 text-primary" />
                          {isHi ? `${af.itemHi} सूची (${arr.length})` : `${af.itemEn} List (${arr.length})`}
                          <span className="font-mono text-[8px] opacity-50">{af.arrayPath}</span>
                        </Label>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-[10px] gap-1 border-primary/30 hover:border-primary/50"
                          onClick={() => handleAddArrayItem(af.arrayPath, af.itemFields)}
                        >
                          <Plus className="h-3 w-3" />
                          {isHi ? `${af.itemHi} जोड़ें` : `Add ${af.itemEn}`}
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {arr.length === 0 && (
                          <div className="p-4 text-center text-xs text-muted-foreground border border-dashed border-border rounded-lg">
                            {isHi ? `कोई ${af.itemHi} नहीं। "${af.itemHi} जोड़ें" बटन से जोड़ें।` : `No ${af.itemEn.toLowerCase()}s. Click "Add ${af.itemEn}" to add.`}
                          </div>
                        )}
                        {arr.map((item, idx) => (
                          <div key={idx} className="p-3 rounded-lg border border-border bg-secondary/20 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-medium text-muted-foreground">
                                {isHi ? `${af.itemHi} ${idx + 1}` : `${af.itemEn} ${idx + 1}`}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteArrayItem(af.arrayPath, idx)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                              {af.itemFields.map(f => (
                                <div key={f.key} className="space-y-0.5">
                                  <Label className="text-[9px] text-muted-foreground">{isHi ? f.hi : f.en}</Label>
                                  <Input
                                    type={f.type}
                                    value={item[f.key] === undefined || item[f.key] === null ? '' : String(item[f.key])}
                                    onChange={(e) => handleArrayItemChange(af.arrayPath, idx, f.key, e.target.value)}
                                    className="text-xs h-7"
                                    dir={f.type === 'text' ? 'auto' : 'ltr'}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              /* JSON mode */
              <textarea
                value={editText}
                onChange={(e) => { setEditText(e.target.value); setDirty(true) }}
                className="w-full h-96 p-3 font-mono text-xs bg-secondary/30 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y custom-scroll"
                spellCheck={false}
                dir="ltr"
              />
            )}
            <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Check className="h-3 w-3 text-green-600" />
                {mode === 'form'
                  ? (isHi ? 'फॉर्म भरें और सहेजें — पोर्टल तुरंत अपडेट होगा।' : 'Fill form and save — portal updates instantly.')
                  : (isHi ? 'JSON संपादित करें और सहेजें।' : 'Edit JSON and save.')}
              </span>
              <span className="font-mono">{mode === 'json' ? `${editText.length} chars` : `${activeSection?.fields?.length || 0} fields`}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
