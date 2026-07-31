'use client'
import { useEffect, useState, useCallback } from 'react'
import { useI18n } from '@/lib/i18n'
import { COMPLAINT_CATEGORIES } from '@/lib/vapi-system-prompt'
import { toast } from 'sonner'
import { Mic, Phone, PhoneOff, ChevronRight, ChevronLeft, Loader2, CheckCircle2, X, Sparkles, MessageCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useUI } from '@/lib/ui-store'

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 // 7 = result

interface SimForm {
  name: string
  phone: string
  village: string
  ward: string
  category: string
  description: string
  priority: string
}

const PRIORITY_OPTIONS = [
  { value: 'low', labelHi: 'निम्न', labelEn: 'Low' },
  { value: 'medium', labelHi: 'सामान्य', labelEn: 'Medium' },
  { value: 'high', labelHi: 'उच्च', labelEn: 'High' },
  { value: 'critical', labelHi: 'गंभीर', labelEn: 'Critical' },
  { value: 'emergency', labelHi: 'आपातकालीन', labelEn: 'Emergency' },
]

const VILLAGES = ['चंद्रा खास', 'चंद्रा', 'अन्य']

interface SubmitResult {
  ok: boolean
  trackingId?: string
  complaintId?: string
  department?: { code: string; nameHi: string; officerName: string; officerPhone: string }
  routing?: { priority: string; slaHours: number }
  error?: string
  message?: string
}

export function SimulateCallPanel() {
  const { locale } = useI18n()
  const { setView } = useUI()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>(1)
  const [form, setForm] = useState<SimForm>({
    name: '',
    phone: '',
    village: VILLAGES[0],
    ward: '',
    category: '',
    description: '',
    priority: 'medium',
  })
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<SubmitResult | null>(null)
  const [chatPreview, setChatPreview] = useState<Array<{ from: 'ai' | 'user'; text: string }>>([])

  // Reset state whenever the dialog is reopened
  useEffect(() => {
    if (open) {
      setStep(1)
      setResult(null)
      setChatPreview([
        { from: 'ai', text: 'नमस्ते! मैं चंद्रा सहायक हूँ, ग्राम पंचायत चंद्रा की AI असिस्टेंट। मैं आपकी शिकायत दर्ज करने में मदद करूँगी।' },
      ])
    }
  }, [open])

  const setField = <K extends keyof SimForm>(k: K, v: SimForm[K]) => {
    setForm(prev => ({ ...prev, [k]: v }))
  }

  const next = useCallback(() => {
    // Simple validation per step
    if (step === 1 && !form.name.trim()) {
      toast.error(locale === 'hi' ? 'कृपया नाम दर्ज करें' : 'Please enter your name')
      return
    }
    if (step === 2 && !form.phone.trim()) {
      toast.error(locale === 'hi' ? 'कृपया मोबाइल नंबर दर्ज करें' : 'Please enter your mobile number')
      return
    }
    if (step === 3 && (!form.village.trim() || !form.ward.trim())) {
      toast.error(locale === 'hi' ? 'कृपया गाँव और वार्ड दर्ज करें' : 'Please enter village and ward')
      return
    }
    if (step === 4 && (!form.category || !form.description.trim())) {
      toast.error(locale === 'hi' ? 'कृपया श्रेणी चुनें और समस्या बताएं' : 'Please pick a category and describe the issue')
      return
    }
    // Push a chat preview line per step
    setChatPreview(prev => {
      const next = [...prev]
      if (step === 1) next.push({ from: 'user', text: form.name })
      if (step === 2) next.push({ from: 'user', text: form.phone })
      if (step === 3) next.push({ from: 'user', text: `${form.village}, वार्ड ${form.ward}` })
      if (step === 4) next.push({ from: 'user', text: form.description })
      if (step === 5) next.push({ from: 'user', text: form.priority })
      // AI ack lines — adapted to the chosen category for realism
      const cat = COMPLAINT_CATEGORIES.find(c => c.code === form.category)
      const catHi = cat?.nameHi ?? form.category
      const deptCode = cat?.departmentCode ?? 'general'
      // Department-specific acknowledgement
      const deptAckHi: Record<string, string> = {
        water: `यह जल विभाग (${catHi}) की समस्या है। मैं इसे GPA बलवंत चौहान जी को भेज रही हूँ।`,
        roads: `यह सड़क विभाग (${catHi}) की समस्या है। मैं इसे GPA बलवंत चौहान जी को भेज रही हूँ।`,
        electricity: `यह बिजली विभाग (${catHi}) की समस्या है। मैं इसे GPA जी को भेज रही हूँ।`,
        sanitation: `यह सफाई विभाग (${catHi}) की समस्या है। दया शंकर (सफाई कर्मी) को सूचित करेंगे।`,
        secretary: `यह सचिव विभाग (${catHi}) की समस्या है। GPA बलवंत चौहान जी देखेंगे।`,
        pradhan: `यह प्रधान विभाग (${catHi}) की समस्या है। श्रीमती संगीता मिश्रा जी को सूचित करेंगे।`,
        pension: `यह पेंशन (${catHi}) की समस्या है। पंचायत सहायिका पुष्प लता तिवारी देखेंगी।`,
        health: `यह स्वास्थ्य विभाग (${catHi}) की समस्या है। ANM अर्चना सिंह जी को सूचित करेंगे।`,
        education: `यह शिक्षा विभाग (${catHi}) की समस्या है। Headmaster अल्ताफ मोहम्मद जी को भेजेंगे।`,
        emergency: `यह आपातकालीन स्थिति है! मैं तुरंत SHO Bara (9454402820) को सूचित कर रही हूँ।`,
        general: `ठीक है, मैं आपकी शिकायत दर्ज कर रही हूँ।`,
      }
      const aiAckMap: Record<number, string> = {
        1: `धन्यवाद ${form.name}! अपना मोबाइल नंबर बताएं ताकि हम आपको अपडेट भेज सकें।`,
        2: 'बढ़िया! आप किस गाँव के हैं और आपका वार्ड नंबर क्या है? (1 से 11)',
        3: 'ठीक है। अपनी समस्या बताएं — जैसे पानी नहीं आ रहा, सड़क टूटी है, बिजली नहीं है।',
        4: deptAckHi[deptCode] || 'मैं समझ गई। क्या यह बहुत जल्दी हल करना ज़रूरी है?',
        5: 'धन्यवाद! मैं आपकी शिकायत दर्ज कर रही हूँ…',
      }
      const ack = aiAckMap[step]
      if (ack) next.push({ from: 'ai', text: ack })
      return next
    })
    setStep(s => (Math.min(6, s + 1) as Step))
  }, [step, form, locale])

  const back = () => {
    if (step > 1) setStep(s => (s - 1) as Step)
  }

  const submit = async () => {
    setSubmitting(true)
    // Map form → registerComplaint parameters
    const params: Record<string, unknown> = {
      name: form.name,
      phone: form.phone,
      village: form.village,
      ward: parseInt(form.ward, 10) || 0,
      category: form.category,
      description: form.description,
      priority: form.priority,
      departmentCode: COMPLAINT_CATEGORIES.find(c => c.code === form.category)?.departmentCode || 'general',
      language: locale === 'hi' ? 'hi' : 'en',
    }
    const toolCallId = `sim-${Date.now()}`
    try {
      const r = await fetch('/function-call?XTransformPort=3003', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolCallId,
          functionCall: { name: 'registerComplaint', parameters: params },
        }),
      })
      // Better error handling: capture the raw response text for debugging
      const responseText = await r.text()
      let data: SubmitResult
      try {
        data = JSON.parse(responseText)
      } catch {
        // If JSON parsing fails, show the actual response + status for debugging
        const errorMsg = responseText.slice(0, 200) || `HTTP ${r.status} ${r.statusText} (empty body)`
        data = { ok: false, error: `invalid_response (${r.status}): ${errorMsg}` }
        console.error('[SimulateCallPanel] Failed to parse response:', { status: r.status, body: responseText.slice(0, 500) })
      }
      setResult(data)
      setStep(7)

      // Build the final AI response — adapt to priority + department
      const isEmergency = form.priority === 'emergency' || form.priority === 'critical'
      const isPolice = form.category === 'emergency'
      const successLine = data?.ok && data?.trackingId
        ? (isPolice
            ? `🚨 आपातकालीन स्थिति! मैंने SHO Bara (9454402820) को सूचित कर दिया है। आपकी शिकायत दर्ज हुई — ट्रैकिंग आईडी: ${data.trackingId}। कृपया 100 या 112 पर भी कॉल करें यदि तुरंत मदद चाहिए।`
            : (isEmergency
              ? `⚡ गंभीर प्राथमिकता! मैंने ${data.department?.nameHi ?? 'संबंधित विभाग'} (${data.department?.officerName ?? ''}) को तुरंत WhatsApp भेज दिया है। ट्रैकिंग आईडी: ${data.trackingId}। 24 घंटे में कार्रवाई होगी।`
              : `✅ आपकी शिकायत दर्ज हो गई है। ट्रैकिंग आईडी: ${data.trackingId}। ${data.department ? `विभाग: ${data.department.nameHi} (${data.department.officerName})।` : ''} हमारी टीम जल्द ही आपसे संपर्क करेगी।`))
        : `क्षमा करें, शिकायत दर्ज करने में त्रुटि: ${data?.error || 'unknown'}`

      setChatPreview(prev => [...prev, { from: 'ai', text: successLine }])
      if (data?.ok) {
        toast.success(locale === 'hi'
          ? `शिकायत दर्ज हुई! ट्रैकिंग आईडी: ${data.trackingId}`
          : `Complaint filed! Tracking ID: ${data.trackingId}`)
      } else {
        toast.error(locale === 'hi' ? 'शिकायत दर्ज विफल' : 'Complaint filing failed')
      }
    } catch (e) {
      const err = (e as Error).message
      setResult({ ok: false, error: err })
      setStep(7)
      toast.error(locale === 'hi' ? 'नेटवर्क त्रुटि' : 'Network error', { description: err })
    } finally {
      setSubmitting(false)
    }
  }

  const reset = () => {
    setForm({ name: '', phone: '', village: VILLAGES[0], ward: '', category: '', description: '', priority: 'medium' })
    setStep(1)
    setResult(null)
    setChatPreview([{ from: 'ai', text: 'नमस्ते! मैं चंद्रा सहायक हूँ…' }])
  }

  const close = () => {
    setOpen(false)
  }

  const cat = COMPLAINT_CATEGORIES.find(c => c.code === form.category)

  const stepTitle = (s: Step): string => {
    const titles: Record<Step, { hi: string; en: string }> = {
      1: { hi: 'नाम बताएं', en: 'Tell us your name' },
      2: { hi: 'मोबाइल नंबर', en: 'Mobile number' },
      3: { hi: 'गाँव और वार्ड', en: 'Village & Ward' },
      4: { hi: 'अपनी समस्या बताएं', en: 'Describe your issue' },
      5: { hi: 'प्राथमिकता', en: 'Priority' },
      6: { hi: 'पुष्टि करें', en: 'Confirm' },
      7: { hi: 'परिणाम', en: 'Result' },
    }
    return locale === 'hi' ? titles[s].hi : titles[s].en
  }

  return (
    <>
      {/* Floating "Simulate AI Call" button — sits next to the AIVoiceButton.
          Always visible (no Vapi keys needed). */}
      <div className="fixed bottom-20 right-20 z-50 sm:bottom-6 sm:right-24">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group flex items-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 shadow-xl ring-2 ring-emerald-400/30 transition-all"
          aria-label={locale === 'hi' ? 'AI कॉल सिमुलेट करें' : 'Simulate AI Call'}
        >
          <Sparkles className="h-4 w-4 group-hover:rotate-12 transition-transform" />
          <span className="text-xs font-semibold hidden sm:inline">
            {locale === 'hi' ? 'AI कॉल सिमुलेट करें' : 'Simulate AI Call'}
          </span>
          <Sparkles className="h-4 w-4 sm:hidden" />
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              {locale === 'hi' ? 'AI कॉल सिमुलेशन' : 'AI Call Simulation'}
              <span className="text-xs font-normal text-muted-foreground ml-1">
                {locale === 'hi' ? '(डेमो)' : '(demo)'}
              </span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              {locale === 'hi'
                ? 'Vapi क्रेडेंशियल के बिना पूरा AI वर्कफ़्लो टेस्ट करें — शिकायत दर्ज करें, विभाग रूट करें, WhatsApp भेजें।'
                : 'Test the full AI workflow without Vapi credentials — file a complaint, route to a department, send WhatsApp.'}
            </DialogDescription>
          </DialogHeader>

          {/* ── Chat preview (collapses long history) ─────────────────── */}
          <div className="rounded-md border bg-secondary/30 p-3 max-h-32 overflow-y-auto custom-scroll">
            <div className="text-[10px] text-muted-foreground mb-1.5 flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              {locale === 'hi' ? 'बातचीत पूर्वावलोकन' : 'Conversation preview'}
            </div>
            <div className="space-y-1.5">
              {chatPreview.map((m, i) => (
                <div key={i} className={`text-[11px] leading-relaxed ${m.from === 'ai' ? 'text-emerald-700 dark:text-emerald-400' : 'text-foreground'}`}>
                  <span className="font-semibold mr-1">{m.from === 'ai' ? 'AI:' : 'आप:'}</span>
                  <span>{m.text}</span>
                </div>
              ))}
              {submitting && (
                <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  {locale === 'hi' ? 'शिकायत दर्ज हो रही है…' : 'Filing complaint…'}
                </div>
              )}
            </div>
          </div>

          {/* ── Step indicator ──────────────────────────────────────── */}
          <div className="flex items-center justify-between gap-1">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div
                key={n}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  step >= n ? 'bg-emerald-500' : 'bg-muted'
                }`}
              />
            ))}
          </div>
          <div className="text-xs text-muted-foreground -mt-2">
            {locale === 'hi' ? `चरण ${Math.min(step, 6)}/6 — ${stepTitle(Math.min(step, 6) as Step)}` : `Step ${Math.min(step, 6)}/6 — ${stepTitle(Math.min(step, 6) as Step)}`}
          </div>

          {/* ── Step content ────────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-2">
              <Label className="text-xs flex items-center gap-1">
                <Mic className="h-3 w-3" />
                {locale === 'hi' ? 'आपका पूरा नाम' : 'Your full name'}
              </Label>
              <Input
                autoFocus
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                placeholder={locale === 'hi' ? 'जैसे: रामकुमार यादव' : 'e.g. Ramkumar Yadav'}
                onKeyDown={(e) => { if (e.key === 'Enter') next() }}
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-2">
              <Label className="text-xs flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {locale === 'hi' ? 'मोबाइल नंबर (10 अंक)' : 'Mobile number (10 digits)'}
              </Label>
              <Input
                autoFocus
                inputMode="numeric"
                value={form.phone}
                onChange={(e) => setField('phone', e.target.value.replace(/[^\d]/g, '').slice(0, 10))}
                placeholder="9876543210"
                onKeyDown={(e) => { if (e.key === 'Enter') next() }}
              />
              <p className="text-[10px] text-muted-foreground">
                {locale === 'hi'
                  ? 'इस नंबर पर शिकायत दर्ज होने की WhatsApp पुष्टि भेजी जाएगी।'
                  : 'WhatsApp confirmation will be sent to this number.'}
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">{locale === 'hi' ? 'गाँव' : 'Village'}</Label>
                <Select value={form.village} onValueChange={(v) => setField('village', v)}>
                  <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {VILLAGES.map(v => (
                      <SelectItem key={v} value={v} className="text-xs">{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{locale === 'hi' ? 'वार्ड नंबर (1–11)' : 'Ward number (1–11)'}</Label>
                <Input
                  inputMode="numeric"
                  value={form.ward}
                  onChange={(e) => setField('ward', e.target.value.replace(/[^\d]/g, '').slice(0, 2))}
                  placeholder="3"
                  onKeyDown={(e) => { if (e.key === 'Enter') next() }}
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">{locale === 'hi' ? 'शिकायत श्रेणी चुनें' : 'Select complaint category'}</Label>
                <Select value={form.category} onValueChange={(v) => setField('category', v)}>
                  <SelectTrigger className="text-sm"><SelectValue placeholder={locale === 'hi' ? 'श्रेणी चुनें' : 'Pick category'} /></SelectTrigger>
                  <SelectContent className="max-h-72 overflow-y-auto">
                    {COMPLAINT_CATEGORIES.map(c => (
                      <SelectItem key={c.code} value={c.code} className="text-xs">
                        {locale === 'hi' ? c.nameHi : c.nameEn}
                        <span className="text-muted-foreground ml-1">({c.departmentCode})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{locale === 'hi' ? 'समस्या का विवरण' : 'Issue description'}</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setField('description', e.target.value)}
                  placeholder={locale === 'hi'
                    ? 'जैसे: हमारे मोहल्ले में पानी 3 दिन से नहीं आ रहा है।'
                    : 'e.g. Water hasn\'t come for 3 days in our neighborhood.'}
                  className="min-h-[80px] text-sm"
                  autoFocus
                />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-2">
              <Label className="text-xs">{locale === 'hi' ? 'प्राथमिकता स्तर' : 'Priority level'}</Label>
              <div className="grid grid-cols-1 gap-2">
                {PRIORITY_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setField('priority', opt.value)}
                    className={`flex items-center justify-between rounded-md border px-3 py-2 text-left text-xs transition-colors ${
                      form.priority === opt.value
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
                        : 'border-border hover:bg-muted/50'
                    }`}
                  >
                    <span className="font-medium">
                      {locale === 'hi' ? opt.labelHi : opt.labelEn}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase">{opt.value}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-2 text-xs">
              <div className="rounded-md border bg-secondary/30 p-3 space-y-1">
                <div><span className="text-muted-foreground">{locale === 'hi' ? 'नाम: ' : 'Name: '}</span><span className="font-medium">{form.name || '—'}</span></div>
                <div><span className="text-muted-foreground">{locale === 'hi' ? 'फ़ोन: ' : 'Phone: '}</span><span className="font-mono">{form.phone || '—'}</span></div>
                <div><span className="text-muted-foreground">{locale === 'hi' ? 'गाँव: ' : 'Village: '}</span><span>{form.village || '—'}</span></div>
                <div><span className="text-muted-foreground">{locale === 'hi' ? 'वार्ड: ' : 'Ward: '}</span><span>{form.ward || '—'}</span></div>
                <div><span className="text-muted-foreground">{locale === 'hi' ? 'श्रेणी: ' : 'Category: '}</span><span>{cat ? (locale === 'hi' ? cat.nameHi : cat.nameEn) : '—'}</span></div>
                <div><span className="text-muted-foreground">{locale === 'hi' ? 'विभाग: ' : 'Department: '}</span><span>{cat?.departmentCode || '—'}</span></div>
                <div><span className="text-muted-foreground">{locale === 'hi' ? 'प्राथमिकता: ' : 'Priority: '}</span><span className="uppercase">{form.priority}</span></div>
                <div><span className="text-muted-foreground">{locale === 'hi' ? 'विवरण: ' : 'Description: '}</span><span>{form.description || '—'}</span></div>
              </div>
              <p className="text-[10px] text-muted-foreground">
                {locale === 'hi'
                  ? 'सबमिट करने पर यह शिकायत डेटाबेस में दर्ज होगी, प्रधान + विभाग अधिकारी को WhatsApp भेजी जाएगी, और आपको ट्रैकिंग आईडी मिलेगी।'
                  : 'On submit, the complaint will be saved to the database, WhatsApp sent to Pradhan + department officer, and you\'ll get a tracking ID.'}
              </p>
            </div>
          )}

          {step === 7 && result && (
            <div className="space-y-3">
              {result.ok ? (
                <>
                  {/* Premium success card with animation */}
                  <div className="relative rounded-md border border-emerald-500/40 bg-gradient-to-br from-emerald-50 via-emerald-50/70 to-emerald-100/40 dark:from-emerald-950/40 dark:to-emerald-900/20 p-4 space-y-3 overflow-hidden">
                    {/* Decorative gradient bar */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500" />
                    {/* Pulse rings around the check icon */}
                    <div className="flex items-start gap-3">
                      <div className="relative shrink-0">
                        <span className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping" style={{ animationDuration: '1.5s' }} />
                        <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/30">
                          <CheckCircle2 className="h-6 w-6" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-sm text-emerald-800 dark:text-emerald-300 block">
                          {locale === 'hi' ? 'शिकायत सफलतापूर्वक दर्ज हुई!' : 'Complaint filed successfully!'}
                        </span>
                        <span className="text-[10px] text-emerald-700/70 dark:text-emerald-400/70">
                          {locale === 'hi' ? 'AI वॉइस पाइपलाइन सक्रिय' : 'AI voice pipeline active'}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs space-y-1.5 border-t border-emerald-200/60 dark:border-emerald-900/60 pt-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{locale === 'hi' ? 'ट्रैकिंग आईडी' : 'Tracking ID'}</span>
                        <span className="font-mono font-bold text-primary text-sm bg-primary/10 px-2 py-0.5 rounded">{result.trackingId}</span>
                      </div>
                      {result.department && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">{locale === 'hi' ? 'विभाग' : 'Department'}</span>
                          <span className="font-medium text-foreground">{result.department.nameHi}</span>
                        </div>
                      )}
                      {result.department && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">{locale === 'hi' ? 'अधिकारी' : 'Officer'}</span>
                          <span className="font-medium text-foreground">{result.department.officerName}</span>
                        </div>
                      )}
                      {result.department && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">{locale === 'hi' ? 'फ़ोन' : 'Phone'}</span>
                          <a href={`tel:${result.department.officerPhone}`} className="font-mono text-primary text-xs hover:underline">{result.department.officerPhone}</a>
                        </div>
                      )}
                      {result.routing && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">{locale === 'hi' ? 'SLA' : 'SLA'}</span>
                          <span className="font-medium text-foreground">{result.routing.slaHours} {locale === 'hi' ? 'घंटे' : 'hrs'} <span className="text-[10px] text-muted-foreground">({result.routing.priority})</span></span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* WhatsApp dispatch notification card */}
                  <div className="rounded-md border border-green-500/40 bg-green-50/50 dark:bg-green-950/20 p-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <MessageCircle className="h-3.5 w-3.5 text-green-600" />
                      <span className="text-[11px] font-semibold text-green-700 dark:text-green-300">
                        {locale === 'hi' ? 'WhatsApp भेजे गए' : 'WhatsApp dispatched'}
                      </span>
                    </div>
                    <div className="space-y-1 text-[10px] text-green-800/80 dark:text-green-200/80">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">📲</span>
                        <span>{locale === 'hi' ? 'प्रधान (9651035021)' : 'Pradhan (9651035021)'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">👮</span>
                        <span>{result.department?.officerName ?? 'विभाग अधिकारी'} ({result.department?.officerPhone ?? ''})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">👤</span>
                        <span>{locale === 'hi' ? 'आपको पुष्टिकरण' : 'You received confirmation'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Emergency banner */}
                  {(form.priority === 'emergency' || form.priority === 'critical') && (
                    <div className="rounded-md border-2 border-red-500/60 bg-red-50 dark:bg-red-950/40 p-3 relative overflow-hidden">
                      <div className="absolute inset-0 bg-red-500/10 animate-pulse" style={{ animationDuration: '2s' }} />
                      <div className="relative flex items-start gap-2">
                        <span className="text-lg shrink-0">🚨</span>
                        <div>
                          <p className="text-xs font-bold text-red-700 dark:text-red-300 uppercase tracking-wide">
                            {locale === 'hi' ? 'आपातकालीन प्राथमिकता' : 'Emergency Priority'}
                          </p>
                          <p className="text-[10px] text-red-700/80 dark:text-red-300/80 mt-0.5">
                            {form.category === 'emergency'
                              ? (locale === 'hi' ? 'SHO Bara को तुरंत सूचित किया गया। आपातकाल में 100/112 पर कॉल करें।' : 'SHO Bara has been immediately notified. Call 100/112 for emergency.')
                              : (locale === 'hi' ? 'विभाग अधिकारी को तुरंत WhatsApp भेजा गया। 24 घंटे SLA।' : 'Department officer notified via WhatsApp immediately. 24-hour SLA.')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <p className="text-[10px] text-muted-foreground text-center">
                    {locale === 'hi'
                      ? 'WhatsApp संदेश प्रधान, विभाग अधिकारी और आपके नंबर पर भेजे गए हैं।'
                      : 'WhatsApp messages sent to Pradhan, department officer, and your number.'}
                  </p>
                </>
              ) : (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4">
                  <p className="text-sm font-medium text-destructive">
                    {locale === 'hi' ? 'शिकायत दर्ज करने में त्रुटि' : 'Error filing complaint'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{result.error || 'unknown error'}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex-row justify-between gap-2 sm:justify-between">
            {step > 1 && step < 7 ? (
              <Button variant="ghost" size="sm" onClick={back} className="gap-1 text-xs">
                <ChevronLeft className="h-3.5 w-3.5" />
                {locale === 'hi' ? 'पीछे' : 'Back'}
              </Button>
            ) : step === 7 ? (
              <Button variant="ghost" size="sm" onClick={reset} className="gap-1 text-xs">
                <Sparkles className="h-3.5 w-3.5" />
                {locale === 'hi' ? 'नई शिकायत' : 'New complaint'}
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={close} className="gap-1 text-xs">
                <X className="h-3.5 w-3.5" />
                {locale === 'hi' ? 'रद्द करें' : 'Cancel'}
              </Button>
            )}

            {step < 6 && (
              <Button size="sm" onClick={next} className="gap-1 text-xs">
                {locale === 'hi' ? 'आगे' : 'Next'}
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            )}
            {step === 6 && (
              <Button size="sm" onClick={submit} disabled={submitting} className="gap-1.5 text-xs">
                {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Phone className="h-3.5 w-3.5" />}
                {locale === 'hi' ? 'शिकायत दर्ज करें' : 'File Complaint'}
              </Button>
            )}
            {step === 7 && result?.ok && (
              <Button
                size="sm"
                onClick={() => {
                  setView('complaints')
                  close()
                }}
                className="gap-1.5 text-xs"
              >
                {locale === 'hi' ? 'ट्रैक करें' : 'Track It'}
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            )}
            {step === 7 && !result?.ok && (
              <Button size="sm" onClick={close} className="gap-1.5 text-xs">
                <PhoneOff className="h-3.5 w-3.5" />
                {locale === 'hi' ? 'बंद करें' : 'Close'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
