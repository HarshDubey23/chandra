'use client'
import { useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { useUI } from '@/lib/ui-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Phone, Mic, ArrowLeft, Clock, CheckCircle2, AlertCircle, XCircle, Loader2, Send, FileText, CheckCircle, Printer } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CitizenFeedback } from './CitizenFeedback'
import { NotificationSubscription } from './NotificationSubscription'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { startVapiCall } from '@/lib/vapi'

interface ComplaintResponse {
  trackingId: string
  callerName: string
  callReason: string
  category: string
  status: string
  createdAt: string
  resolvedAt: string | null
  resolutionNote: string | null
  timeline: { status: string; ts: string; note: string; by: string }[]
}

const STATUS_CONFIG: Record<string, { hi: string; en: string; icon: React.ElementType; color: string; step: number }> = {
  Pending: { hi: 'लंबित', en: 'Pending', icon: Clock, color: 'text-amber-600 bg-amber-50 border-amber-200', step: 0 },
  InProgress: { hi: 'प्रगति पर', en: 'In Progress', icon: Loader2, color: 'text-blue-600 bg-blue-50 border-blue-200', step: 1 },
  Resolved: { hi: 'हल हो गया', en: 'Resolved', icon: CheckCircle2, color: 'text-green-600 bg-green-50 border-green-200', step: 2 },
  Rejected: { hi: 'अस्वीकृत', en: 'Rejected', icon: XCircle, color: 'text-red-600 bg-red-50 border-red-200', step: -1 },
}

const CATEGORIES: Record<string, { hi: string; en: string }> = {
  water: { hi: 'जल', en: 'Water' },
  road: { hi: 'सड़क', en: 'Road' },
  school: { hi: 'विद्यालय', en: 'School' },
  housing: { hi: 'आवास', en: 'Housing' },
  pension: { hi: 'पेंशन', en: 'Pension' },
  mgnrega: { hi: 'मनरेगा', en: 'MGNREGA' },
  other: { hi: 'अन्य', en: 'Other' },
}

export function ComplaintTracking() {
  const { locale } = useI18n()
  const { setView } = useUI()
  const [trackingId, setTrackingId] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ComplaintResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  // ── Web complaint form state ──
  const [showForm, setShowForm] = useState(false)
  const [formName, setFormName] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formCategory, setFormCategory] = useState('other')
  const [formReason, setFormReason] = useState('')
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)
  const [lastSubmission, setLastSubmission] = useState<{ trackingId: string; name: string; phone: string; category: string; reason: string } | null>(null)

  const resetForm = () => {
    setFormName(''); setFormPhone(''); setFormCategory('other'); setFormReason('')
    setFormError(null); setFormSuccess(null)
  }

  const handleSubmitComplaint = async () => {
    setFormError(null)
    setFormSuccess(null)
    if (!formName.trim()) { setFormError(locale === 'hi' ? 'कृपया नाम दर्ज करें' : 'Please enter your name'); return }
    if (formPhone.replace(/[^\d]/g, '').length < 10) { setFormError(locale === 'hi' ? 'कृपया सही 10-अंकीय फ़ोन नंबर दर्ज करें' : 'Please enter a valid 10-digit phone number'); return }
    if (formReason.trim().length < 10) { setFormError(locale === 'hi' ? 'कृपया शिकायत विवरण दर्ज करें (कम से कम 10 अक्षर)' : 'Please enter complaint details (min 10 characters)'); return }
    setFormSubmitting(true)
    try {
      const r = await fetch('/api/complaints/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callerName: formName, callerPhone: formPhone, category: formCategory, callReason: formReason }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.message || d.error || 'submit_failed')
      setLastSubmission({
        trackingId: d.trackingId,
        name: formName.trim(),
        phone: formPhone.trim(),
        category: formCategory,
        reason: formReason.trim(),
      })
      setFormSuccess(d.trackingId)
      resetForm()
    } catch (e) {
      setFormError((e as Error).message || (locale === 'hi' ? 'शिकायत दर्ज करने में विफल' : 'Failed to submit complaint'))
    } finally {
      setFormSubmitting(false)
    }
  }

  const handleTrack = async (overrideId?: string) => {
    const id = (overrideId || trackingId).trim().toUpperCase()
    if (!id) {
      setError(locale === 'hi' ? 'कृपया ट्रैकिंग आईडी दर्ज करें' : 'Please enter a tracking ID')
      return
    }
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const r = await fetch(`/api/complaints/track?id=${encodeURIComponent(id)}`)
      if (!r.ok) {
        if (r.status === 404) setError(locale === 'hi' ? 'इस ट्रैकिंग आईडी से कोई शिकायत नहीं मिली' : 'No complaint found for this tracking ID')
        else setError(locale === 'hi' ? 'सर्वर त्रुटि' : 'Server error')
        return
      }
      const data = await r.json()
      setResult(data)
    } catch {
      setError(locale === 'hi' ? 'नेटवर्क त्रुटि' : 'Network error')
    } finally {
      setLoading(false)
    }
  }

  const statusCfg = result ? STATUS_CONFIG[result.status] : null

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 min-h-[70vh]">
      <Button variant="ghost" size="sm" className="mb-4 gap-1.5" onClick={() => setView('home')}>
        <ArrowLeft className="h-4 w-4" />
        {locale === 'hi' ? 'मुख्य पर वापस' : 'Back to Home'}
      </Button>

      <div className="max-w-3xl mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-primary">
            {locale === 'hi' ? 'शिकायत ट्रैकिंग' : 'Complaint Tracking'}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {locale === 'hi' ? 'अपनी शिकायत की स्थिति देखें' : 'Check the status of your complaint'}
          </p>
        </div>

        {/* Search card */}
        <Card className="mb-6 border-primary/30">
          <CardContent className="p-5">
            <label className="text-sm font-medium block mb-2">
              {locale === 'hi' ? 'ट्रैकिंग आईडी दर्ज करें' : 'Enter your Tracking ID'}
            </label>
            <div className="flex gap-2">
              <Input
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
                placeholder={locale === 'hi' ? 'जैसे: GPCH-XXXX' : 'e.g., GPCH-XXXX'}
                className="font-mono uppercase"
                autoCapitalize="characters"
              />
              <Button onClick={() => handleTrack()} disabled={loading} className="gap-1.5 shrink-0">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                {locale === 'hi' ? 'ट्रैक करें' : 'Track'}
              </Button>
            </div>
            {error && (
              <div className="mt-3 flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
            <div className="mt-3 text-[11px] text-muted-foreground">
              {locale === 'hi'
                ? 'डेमो आईडी: GPCH-DEMO001, GPCH-DEMO002, GPCH-DEMO003'
                : 'Demo IDs: GPCH-DEMO001, GPCH-DEMO002, GPCH-DEMO003'}
            </div>
          </CardContent>
        </Card>

        {/* Result */}
        {result && statusCfg && (
          <Card className="border-border/70">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <CardTitle className="text-lg font-mono">{result.trackingId}</CardTitle>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant="outline" className="text-[10px]">
                      {CATEGORIES[result.category] ? (locale === 'hi' ? CATEGORIES[result.category].hi : CATEGORIES[result.category].en) : result.category}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground">
                      {locale === 'hi' ? 'दर्ज: ' : 'Filed: '}
                      {new Date(result.createdAt).toLocaleString(locale === 'hi' ? 'hi-IN' : 'en-IN')}
                    </span>
                  </div>
                </div>
                <Badge className={cn('gap-1 border', statusCfg.color)}>
                  <statusCfg.icon className={cn('h-3.5 w-3.5', result.status === 'InProgress' && 'animate-spin')} />
                  {locale === 'hi' ? statusCfg.hi : statusCfg.en}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* complaint details */}
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                    {locale === 'hi' ? 'नाम' : 'Name'}
                  </div>
                  <div className="font-medium">{result.callerName}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                    {locale === 'hi' ? 'श्रेणी' : 'Category'}
                  </div>
                  <div className="font-medium">
                    {CATEGORIES[result.category] ? (locale === 'hi' ? CATEGORIES[result.category].hi : CATEGORIES[result.category].en) : result.category}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                    {locale === 'hi' ? 'शिकायत विवरण' : 'Complaint Details'}
                  </div>
                  <div className="text-sm text-foreground/80 leading-relaxed bg-secondary/40 rounded p-3">
                    {result.callReason}
                  </div>
                </div>
                {result.resolutionNote && (
                  <div className="sm:col-span-2">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                      {locale === 'hi' ? 'समाधान टिप्पणी' : 'Resolution Note'}
                    </div>
                    <div className="text-sm text-foreground/80 leading-relaxed bg-green-50 border border-green-200 rounded p-3">
                      {result.resolutionNote}
                    </div>
                  </div>
                )}
              </div>

              {/* Timeline */}
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">
                  {locale === 'hi' ? 'समय-रेखा' : 'Timeline'}
                </div>
                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-border">
                  {result.timeline.map((entry, i) => {
                    const cfg = STATUS_CONFIG[entry.status] || STATUS_CONFIG.Pending
                    return (
                      <div key={i} className="relative">
                        <div className={cn('absolute -left-[1.15rem] top-1 h-3 w-3 rounded-full border-2 border-background', cfg.color.split(' ')[1])} />
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <Badge variant="outline" className={cn('text-[10px]', cfg.color)}>
                            <cfg.icon className="h-2.5 w-2.5" />
                            {locale === 'hi' ? cfg.hi : cfg.en}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(entry.ts).toLocaleString(locale === 'hi' ? 'hi-IN' : 'en-IN')}
                          </span>
                        </div>
                        <p className="text-xs text-foreground/70">{entry.note}</p>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Citizen Feedback — only shown when complaint is Resolved */}
              {result.status === 'Resolved' && (
                <CitizenFeedback trackingId={result.trackingId} />
              )}

              {/* Notification Subscription — citizens can subscribe to status updates */}
              <NotificationSubscription trackingId={result.trackingId} locale={locale} />
            </CardContent>
          </Card>
        )}

        {/* New complaint — two options: web form + voice call */}
        {!result && (
          <div className="mt-6 space-y-4">
            {/* Success banner */}
            {formSuccess && (
              <Card className="border-green-500/50 bg-green-500/5 border-2">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-600 text-white grid place-items-center shrink-0">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-green-700 dark:text-green-400">
                        {locale === 'hi' ? 'शिकायत सफलतापूर्वक दर्ज हुई!' : 'Complaint filed successfully!'}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {locale === 'hi' ? 'आपकी ट्रैकिंग आईडी:' : 'Your tracking ID:'}
                      </p>
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        <code className="text-lg font-mono font-bold text-green-700 dark:text-green-400 bg-green-500/10 px-3 py-1 rounded">
                          {formSuccess}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1.5"
                          onClick={() => { const tid = formSuccess; setShowForm(false); setFormSuccess(null); handleTrack(tid) }}
                        >
                          <Search className="h-3 w-3" />
                          {locale === 'hi' ? 'अभी ट्रैक करें' : 'Track now'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1.5 no-print"
                          onClick={() => window.print()}
                        >
                          <Printer className="h-3 w-3" />
                          {locale === 'hi' ? 'रसीद प्रिंट करें' : 'Print receipt'}
                        </Button>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-2">
                        {locale === 'hi' ? 'इस आईडी को सुरक्षित रखें। भविष्य में स्थिति देखने के लिए उपयोग करें।' : 'Save this ID to check status in the future.'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Printable receipt — hidden on screen, visible only when printing */}
            {formSuccess && lastSubmission && (
              <div className="print-receipt hidden">
                <div style={{ textAlign: 'center', borderBottom: '2px solid #c2410c', paddingBottom: '12px', marginBottom: '16px' }}>
                  <h1 style={{ fontSize: '18px', margin: 0, color: '#c2410c' }}>
                    ग्राम पंचायत चंद्रा — शिकायत रसीद
                  </h1>
                  <p style={{ fontSize: '11px', margin: '4px 0 0 0' }}>
                    Gram Panchayat Chandra — Complaint Receipt
                  </p>
                  <p style={{ fontSize: '10px', margin: '2px 0 0 0', color: '#666' }}>
                    पंचायत कोड 3145021064 • शंकरगढ़, प्रयागराज, उ.प्र.
                  </p>
                </div>
                <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr><td style={{ padding: '4px 0', fontWeight: 'bold', width: '35%' }}>ट्रैकिंग आईडी / Tracking ID</td><td style={{ padding: '4px 0', fontFamily: 'monospace', fontWeight: 'bold', color: '#c2410c' }}>{lastSubmission.trackingId}</td></tr>
                    <tr><td style={{ padding: '4px 0', fontWeight: 'bold' }}>नाम / Name</td><td style={{ padding: '4px 0' }}>{lastSubmission.name}</td></tr>
                    <tr><td style={{ padding: '4px 0', fontWeight: 'bold' }}>फ़ोन / Phone</td><td style={{ padding: '4px 0' }}>+91 {lastSubmission.phone}</td></tr>
                    <tr><td style={{ padding: '4px 0', fontWeight: 'bold' }}>श्रेणी / Category</td><td style={{ padding: '4px 0' }}>{CATEGORIES[lastSubmission.category] ? (locale === 'hi' ? CATEGORIES[lastSubmission.category].hi : CATEGORIES[lastSubmission.category].en) : lastSubmission.category}</td></tr>
                    <tr><td style={{ padding: '4px 0', fontWeight: 'bold', verticalAlign: 'top' }}>शिकायत / Complaint</td><td style={{ padding: '4px 0' }}>{lastSubmission.reason}</td></tr>
                    <tr><td style={{ padding: '4px 0', fontWeight: 'bold' }}>दर्ज तिथि / Filed</td><td style={{ padding: '4px 0' }}>{new Date().toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })}</td></tr>
                    <tr><td style={{ padding: '4px 0', fontWeight: 'bold' }}>स्थिति / Status</td><td style={{ padding: '4px 0' }}>{locale === 'hi' ? 'लंबित (Pending)' : 'Pending'}</td></tr>
                  </tbody>
                </table>
                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed #999', fontSize: '10px', color: '#666' }}>
                  <p style={{ margin: '0 0 4px 0' }}>• इस आईडी को सुरक्षित रखें। भविष्य में स्थिति देखने के लिए उपयोग करें।</p>
                  <p style={{ margin: '0 0 4px 0' }}>• ऑनलाइन ट्रैकिंग: वेबसाइट पर "शिकायत ट्रैक करें" में आईडी दर्ज करें।</p>
                  <p style={{ margin: '0 0 4px 0' }}>• पंचायत कार्यालय: +91 96510 35021</p>
                  <p style={{ margin: '8px 0 0 0', textAlign: 'center', fontStyle: 'italic' }}>डिजिटल इंडिया • eGramSwaraj • DPDP अधिनियम 2023 अनुपालन</p>
                </div>
              </div>
            )}

            {/* Web form */}
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-5">
                <div
                  onClick={() => { setShowForm(s => !s); if (showForm) resetForm() }}
                  className="w-full flex items-center gap-4 text-left cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setShowForm(s => !s); if (showForm) resetForm() } }}
                >
                  <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground grid place-items-center shrink-0 shadow-md">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm">
                      {locale === 'hi' ? 'ऑनलाइन शिकायत दर्ज करें' : 'File Complaint Online'}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {locale === 'hi'
                        ? 'फॉर्म भरकर तुरंत शिकायत दर्ज करें। ट्रैकिंग आईडी तुरंत मिलेगी।'
                        : 'Fill the form to file a complaint instantly. Get a tracking ID immediately.'}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 shrink-0 h-8 px-3 text-xs rounded-md border border-border bg-background text-foreground hover:bg-accent">
                    {showForm ? (locale === 'hi' ? 'बंद करें' : 'Close') : (locale === 'hi' ? 'खोलें' : 'Open')}
                  </span>
                </div>

                {showForm && (
                  <div className="mt-5 pt-5 border-t border-border/50 space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium">
                          {locale === 'hi' ? 'नाम *' : 'Name *'}
                        </label>
                        <Input
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          placeholder={locale === 'hi' ? 'अपना पूरा नाम' : 'Your full name'}
                          className="text-sm"
                          dir="auto"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium">
                          {locale === 'hi' ? 'फ़ोन नंबर *' : 'Phone Number *'}
                        </label>
                        <Input
                          value={formPhone}
                          onChange={(e) => setFormPhone(e.target.value)}
                          placeholder={locale === 'hi' ? '10-अंकीय मोबाइल नंबर' : '10-digit mobile number'}
                          className="text-sm font-mono"
                          inputMode="tel"
                          maxLength={13}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium">
                        {locale === 'hi' ? 'श्रेणी' : 'Category'}
                      </label>
                      <Select value={formCategory} onValueChange={setFormCategory}>
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(CATEGORIES).map(([key, val]) => (
                            <SelectItem key={key} value={key} className="text-sm">
                              {locale === 'hi' ? val.hi : val.en} {locale === 'hi' ? `/ ${val.en}` : `/ ${val.hi}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium">
                        {locale === 'hi' ? 'शिकायत विवरण *' : 'Complaint Details *'}
                      </label>
                      <Textarea
                        value={formReason}
                        onChange={(e) => setFormReason(e.target.value)}
                        placeholder={locale === 'hi' ? 'अपनी शिकायत का विस्तृत विवरण लिखें...' : 'Write detailed description of your complaint...'}
                        className="text-sm min-h-[100px]"
                        dir="auto"
                        maxLength={2000}
                      />
                      <p className="text-[10px] text-muted-foreground text-right">{formReason.length}/2000</p>
                    </div>
                    {formError && (
                      <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/5 p-3 rounded-lg border border-destructive/20">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {formError}
                      </div>
                    )}
                    <div className="flex items-center gap-3 flex-wrap">
                      <Button onClick={handleSubmitComplaint} disabled={formSubmitting} className="gap-1.5 glow-saffron">
                        {formSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        {formSubmitting ? (locale === 'hi' ? 'दर्ज हो रहा है...' : 'Submitting...') : (locale === 'hi' ? 'शिकायत दर्ज करें' : 'Submit Complaint')}
                      </Button>
                      <p className="text-[10px] text-muted-foreground">
                        {locale === 'hi' ? 'आपका फ़ोन नंबर DPDP अनुसार सुरक्षित रहेगा' : 'Your phone is protected per DPDP Act'}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Voice complaint CTA */}
            <Card className="border-accent/40 bg-accent/5">
              <CardContent className="p-5 flex items-center gap-4 flex-wrap">
                <div className="h-12 w-12 rounded-full bg-accent text-accent-foreground grid place-items-center shrink-0">
                  <Mic className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm">
                    {locale === 'hi' ? 'AI वॉइस शिकायत लाइन' : 'AI Voice Complaint Line'}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {locale === 'hi'
                      ? 'प्रधान जी उपलब्ध नहीं हैं? AI वॉइस सहायक से शिकायत दर्ज करें।'
                      : 'Pradhan unavailable? File a complaint with the AI voice assistant.'}
                  </p>
                </div>
                <Button className="gap-1.5" onClick={() => startVapiCall()}>
                  <Phone className="h-4 w-4" />
                  {locale === 'hi' ? 'AI से बात करें' : 'Talk to AI'}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
