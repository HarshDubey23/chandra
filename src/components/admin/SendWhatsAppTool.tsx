'use client'
// Admin tool: Send WhatsApp message to any phone number.
// Uses /api/admin/send-whatsapp (which proxies to vapi-webhook mini-service).
// Visible in the AdminPanel as a quick-access tool card.
import { useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { MessageCircle, Send, Loader2, CheckCircle2, AlertCircle, Phone, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const QUICK_TEMPLATES = [
  {
    id: 'status_update',
    hi: 'शिकायत स्थिति अपडेट',
    en: 'Complaint Status Update',
    template: 'नमस्ते {name}, आपकी शिकायत {trackingId} की स्थिति अपडेट हुई है। अधिक जानकारी के लिए पंचायत कार्यालय 9651035021 पर संपर्क करें। — ग्राम पंचायत चंद्रा',
  },
  {
    id: 'meeting_invite',
    hi: 'ग्राम सभा निमंत्रण',
    en: 'Gram Sabha Invitation',
    template: 'प्रिय ग्रामीण, दिनांक 15 अगस्त 2026 को प्रातः 10 बजे ग्राम सभा बैठक आयोजित होगी। कृपया समय पर उपस्थित हों। — ग्राम पंचायत चंद्रा',
  },
  {
    id: 'scheme_info',
    hi: 'योजना जानकारी',
    en: 'Scheme Information',
    template: 'प्रधानमंत्री आवास योजना (PMAY-G) के तहत आवेदन शुरू हो गए हैं। पात्रता: बीपीएल परिवार, कच्चा घर। आवेदन के लिए पंचायत कार्यालय में संपर्क करें। — ग्राम पंचायत चंद्रा',
  },
  {
    id: 'emergency_alert',
    hi: 'आपातकालीन अलर्ट',
    en: 'Emergency Alert',
    template: '🚨 आपातकालीन सूचना: {message}। कृपया सतर्क रहें और आवश्यकता पड़ने पर 100/112 पर कॉल करें। — ग्राम पंचायत चंद्रा',
  },
]

export function SendWhatsAppTool() {
  const { locale } = useI18n()
  const hi = locale === 'hi'
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; to?: string; error?: string } | null>(null)

  const handleSend = async () => {
    setResult(null)
    const digits = phone.replace(/[^\d]/g, '')
    if (digits.length < 10) {
      toast.error(hi ? 'सही 10-अंकीय मोबाइल नंबर दर्ज करें' : 'Enter valid 10-digit phone')
      return
    }
    if (message.trim().length < 1) {
      toast.error(hi ? 'संदेश खाली नहीं हो सकता' : 'Message cannot be empty')
      return
    }
    setSending(true)
    try {
      const r = await fetch('/api/admin/send-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: digits, message: message.trim() }),
      })
      const data = await r.json()
      if (!r.ok) {
        throw new Error(data?.message || data?.error || 'send_failed')
      }
      setResult({ ok: true, to: digits })
      toast.success(hi ? `WhatsApp भेजा गया: ${digits}` : `WhatsApp sent to ${digits}`)
      setMessage('')
    } catch (e) {
      const err = (e as Error).message
      setResult({ ok: false, error: err })
      toast.error(hi ? 'भेजने में विफल' : 'Failed to send', { description: err })
    } finally {
      setSending(false)
    }
  }

  const applyTemplate = (template: string) => {
    setMessage(template)
  }

  return (
    <Card className="border-green-500/30 overflow-hidden">
      <CardHeader className="border-b bg-gradient-to-r from-green-50/70 to-emerald-50/40 dark:from-green-950/30 dark:to-emerald-950/20 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-white shadow-sm">
            <MessageCircle className="h-4 w-4" />
          </div>
          {hi ? 'व्हाट्सएप संदेश भेजें' : 'Send WhatsApp Message'}
          <span className="ml-auto text-[10px] font-normal text-muted-foreground">
            {hi ? 'किसी को भी संदेश भेजें' : 'Send to anyone'}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        {/* Phone input */}
        <div className="space-y-1.5">
          <Label className="text-xs flex items-center gap-1.5">
            <Phone className="h-3 w-3" />
            {hi ? 'मोबाइल नंबर (10 अंक)' : 'Mobile Number (10 digits)'}
          </Label>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, '').slice(0, 10))}
            placeholder="9876543210"
            inputMode="numeric"
            className="font-mono"
          />
        </div>

        {/* Quick templates */}
        <div className="space-y-1.5">
          <Label className="text-xs flex items-center gap-1.5">
            <Zap className="h-3 w-3" />
            {hi ? 'त्वरित टेम्पलेट' : 'Quick Templates'}
          </Label>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => applyTemplate(t.template)}
                className="text-[10px] px-2 py-1 rounded-md border border-border bg-secondary/40 hover:bg-secondary hover:border-primary/40 transition-colors"
              >
                {hi ? t.hi : t.en}
              </button>
            ))}
          </div>
        </div>

        {/* Message textarea */}
        <div className="space-y-1.5">
          <Label className="text-xs flex items-center gap-1.5">
            <MessageCircle className="h-3 w-3" />
            {hi ? 'संदेश' : 'Message'}
            <span className="text-muted-foreground ml-1">({message.length}/4000)</span>
          </Label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, 4000))}
            placeholder={hi ? 'अपना संदेश यहाँ लिखें…' : 'Type your message here…'}
            className="min-h-[120px] text-sm"
          />
        </div>

        {/* Result feedback */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`rounded-md border p-2.5 text-xs flex items-start gap-2 ${
                result.ok
                  ? 'border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                  : 'border-destructive/40 bg-destructive/10 text-destructive'
              }`}
            >
              {result.ok ? (
                <>
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">
                      {hi ? `WhatsApp सफलतापूर्वक भेजा गया: ${result.to}` : `WhatsApp sent successfully to ${result.to}`}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {hi
                        ? '(mock mode में whatsapp-outbox.log में लॉग होता है)'
                        : '(in mock mode, logged to whatsapp-outbox.log)'}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">{hi ? 'भेजने में विफल' : 'Failed to send'}</p>
                    <p className="text-[10px] mt-0.5">{result.error}</p>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Send button */}
        <Button
          onClick={handleSend}
          disabled={sending || !phone || !message.trim()}
          className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {sending
            ? (hi ? 'भेजा जा रहा है…' : 'Sending…')
            : (hi ? 'व्हाट्सएप भेजें' : 'Send WhatsApp')}
        </Button>

        <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
          {hi
            ? 'हर भेजा गया संदेश ऑडिट लॉग में दर्ज होता है। केवल प्रमाणित अधिकारी उपयोग कर सकते हैं।'
            : 'Every sent message is recorded in the audit log. Only authenticated officers can use this.'}
        </p>
      </CardContent>
    </Card>
  )
}
