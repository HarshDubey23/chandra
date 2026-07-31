'use client'

import { useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { ScrollReveal } from './ScrollReveal'
import { OFFICE_ADDRESS } from '@/data/panchayat'
import {
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  Loader2,
  User,
  Hash,
  MessageSquare,
  AlertTriangle,
  Navigation,
} from 'lucide-react'

export function ContactUsSection() {
  const { locale } = useI18n()
  const isHi = locale === 'hi'

  /* ─── Form state ─── */
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [ward, setWard] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError(isHi ? 'कृपया नाम दर्ज करें' : 'Please enter your name')
      return
    }
    if (!phone.trim() || phone.replace(/[^\d]/g, '').length < 10) {
      setError(isHi ? 'कृपया सही 10-अंकीय फ़ोन नंबर दर्ज करें' : 'Please enter a valid 10-digit phone number')
      return
    }
    if (!message.trim() || message.trim().length < 10) {
      setError(isHi ? 'कृपया संदेश दर्ज करें (कम से कम 10 अक्षर)' : 'Please enter a message (at least 10 characters)')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/complaints/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callerName: name.trim(),
          callerPhone: phone.trim(),
          callReason: `[Ward ${ward || 'N/A'}] ${message.trim()}`,
          category: 'other',
        }),
      })
      const data = await res.json()
      if (data.ok) {
        setSubmitted(true)
      } else {
        setError(data.message || (isHi ? 'शिकायत दर्ज करने में विफल' : 'Failed to submit'))
      }
    } catch {
      setError(isHi ? 'नेटवर्क त्रुटि। पुनः प्रयास करें।' : 'Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setName('')
    setPhone('')
    setWard('')
    setMessage('')
    setSubmitted(false)
    setError('')
  }

  return (
    <section id="contact-us" className="section-premium py-16 md:py-20 border-b border-border/40 relative overflow-hidden">
      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <ScrollReveal delay={0.1}>
          <div className="text-center mb-10">
            <Badge variant="outline" className="section-header-badge mb-3 gap-1.5">
              <Phone className="h-3.5 w-3.5" />
              {isHi ? 'संपर्क करें' : 'Contact Us'}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gradient-premium">
              {isHi ? 'शिकायत / संपर्क फ़ॉर्म' : 'Complaint / Contact Form'}
            </h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              {isHi
                ? 'अपनी शिकायत या सुझाव यहाँ भेजें। ट्रैकिंग आईडी मिलेगी।'
                : 'Send your complaint or suggestion here. You will receive a tracking ID.'}
            </p>
          </div>
        </ScrollReveal>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          {/* LEFT: Contact Form */}
          <ScrollReveal delay={0.15}>
            <Card className="card-premium-bordered h-full relative overflow-hidden rounded-xl">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-md bg-primary/10 grid place-items-center shrink-0">
                    <MessageSquare className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="text-base font-semibold">
                    {isHi ? 'शिकायत / संदेश भेजें' : 'Send Complaint / Message'}
                  </CardTitle>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {isHi
                    ? 'अपनी शिकायत या सुझाव यहाँ भेजें। ट्रैकिंग आईडी मिलेगी।'
                    : 'Send your complaint or suggestion here. You will receive a tracking ID.'}
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                {submitted ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="h-12 w-12 mx-auto text-green-600 mb-3" />
                    <p className="text-lg font-semibold mb-1">
                      {isHi ? 'सफलतापूर्वक भेजा गया!' : 'Submitted Successfully!'}
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      {isHi
                        ? 'आपकी शिकायत दर्ज हो गई है। ट्रैकिंग आईडी आपके फ़ोन पर भेजी जाएगी।'
                        : 'Your complaint has been filed. A tracking ID will be sent to your phone.'}
                    </p>
                    <button
                      onClick={resetForm}
                      className="text-sm text-primary hover:underline underline-offset-2"
                    >
                      {isHi ? 'नई शिकायत दर्ज करें' : 'File new complaint'}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                      <label className="text-xs font-medium text-foreground/80 mb-1.5 block">
                        {isHi ? 'नाम / Name' : 'Name / नाम'} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={name}
                          onChange={(e) => setName(e.target.value.slice(0, 100))}
                          placeholder={isHi ? 'अपना नाम दर्ज करें' : 'Enter your name'}
                          className="pl-9"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="text-xs font-medium text-foreground/80 mb-1.5 block">
                        {isHi ? 'फ़ोन नंबर / Phone' : 'Phone / फ़ोन नंबर'} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.slice(0, 15))}
                          placeholder={isHi ? '10-अंकीय मोबाइल नंबर' : '10-digit mobile number'}
                          className="pl-9"
                        />
                      </div>
                    </div>

                    {/* Ward dropdown */}
                    <div>
                      <label className="text-xs font-medium text-foreground/80 mb-1.5 block">
                        {isHi ? 'वार्ड / Ward' : 'Ward / वार्ड'}
                      </label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <select
                          value={ward}
                          onChange={(e) => setWard(e.target.value)}
                          className="flex h-9 w-full rounded-md border border-input bg-transparent pl-9 pr-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                        >
                          <option value="">{isHi ? 'वार्ड चुनें' : 'Select ward'}</option>
                          {Array.from({ length: 11 }, (_, i) => (
                            <option key={i + 1} value={String(i + 1)}>
                              {isHi ? `वार्ड ${i + 1}` : `Ward ${i + 1}`}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="text-xs font-medium text-foreground/80 mb-1.5 block">
                        {isHi ? 'संदेश / Message' : 'Message / संदेश'} <span className="text-red-500">*</span>
                      </label>
                      <Textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value.slice(0, 2000))}
                        placeholder={isHi ? 'अपनी शिकायत या सुझाव यहाँ लिखें (कम से कम 10 अक्षर)' : 'Write your complaint or suggestion here (at least 10 characters)'}
                        rows={4}
                        className="resize-none"
                      />
                      <div className="flex justify-between mt-1">
                        <span className="text-[10px] text-muted-foreground">{message.length}/2000</span>
                        {message.length > 0 && message.length < 10 && (
                          <span className="text-[10px] text-amber-500">
                            {isHi ? 'कम से कम 10 अक्षर आवश्यक' : 'Minimum 10 characters required'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Error */}
                    {error && (
                      <div className="flex items-center gap-2 text-xs text-red-500 bg-red-500/10 px-3 py-2 rounded-md">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        {error}
                      </div>
                    )}

                    {/* Submit */}
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-sm hover:shadow-md transition-all"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          {isHi ? 'भेज रहे हैं...' : 'Submitting...'}
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          {isHi ? 'शिकायत भेजें' : 'Submit Complaint'}
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* RIGHT: Office Address + Map */}
          <div className="space-y-6">
            {/* Office address + Map placeholder */}
            <ScrollReveal delay={0.2}>
              <Card className="card-premium-bordered-green overflow-hidden rounded-xl h-full">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="h-8 w-8 rounded-md bg-primary/10 grid place-items-center shrink-0">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold mb-1">
                        {isHi ? 'पंचायत कार्यालय पता' : 'Office Address'}
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {isHi ? OFFICE_ADDRESS.hi : OFFICE_ADDRESS.en}
                      </p>
                    </div>
                  </div>

                  {/* Map placeholder */}
                  <div className="relative rounded-lg overflow-hidden border border-border/40 bg-gradient-to-br from-green-600/5 via-primary/5 to-accent/5">
                    <div className="h-40 flex flex-col items-center justify-center gap-2 p-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 grid place-items-center">
                        <Navigation className="h-5 w-5 text-primary" />
                      </div>
                      <p className="text-xs font-semibold text-foreground/80">
                        {isHi ? 'पंचायत स्थान' : 'Panchayat Location'}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        25.18°N, 81.75°E
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {isHi ? 'शंकरगढ़, प्रयागराज, उ.प्र.' : 'Shankargarh, Prayagraj, UP'}
                      </p>
                      <a
                        href="https://www.google.com/maps/search/Gram+Panchayat+Chandra+Shankargarh+Prayagraj"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-md hover:bg-primary/20 transition-colors mt-1"
                      >
                        <MapPin className="h-2.5 w-2.5" />
                        {isHi ? 'Google Maps पर देखें' : 'View on Google Maps'}
                      </a>
                    </div>
                    <div className="absolute inset-0 opacity-[0.03]" style={{
                      backgroundImage: 'linear-gradient(oklch(0.62 0.18 55) 1px, transparent 1px), linear-gradient(90deg, oklch(0.62 0.18 55) 1px, transparent 1px)',
                      backgroundSize: '20px 20px',
                    }} />
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  )
}
