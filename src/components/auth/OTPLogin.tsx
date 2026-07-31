'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useI18n } from '@/lib/i18n'
import { useAuth } from '@/lib/auth-store'
import { Phone, Smartphone, ArrowLeft, ArrowRight, Loader2, MessageSquare, CheckCircle2, RefreshCw } from 'lucide-react'

interface OTPLoginProps {
  onBack: () => void
}

export function OTPLogin({ onBack }: OTPLoginProps) {
  const { locale } = useI18n()
  const { sendOtp, verifyOtp, isLoading, error, otpSent, otpPhone, otpDemoCode, resetOtpState, clearError } = useAuth()
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [name, setName] = useState('')
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])
  const hi = locale === 'hi'

  useEffect(() => {
    return () => {
      resetOtpState()
    }
  }, [resetOtpState])

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone || phone.replace(/\D/g, '').length < 10) return
    await sendOtp(phone)
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    clearError()

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length > 0) {
      const newOtp = pasted.split('').concat(Array(6 - pasted.length).fill(''))
      setOtp(newOtp)
      otpRefs.current[Math.min(pasted.length, 5)]?.focus()
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    const otpCode = otp.join('')
    if (otpCode.length !== 6) return
    await verifyOtp(otpPhone || phone, otpCode, name || undefined)
  }

  const resendOtp = async () => {
    if (otpPhone) {
      await sendOtp(otpPhone)
    }
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {!otpSent ? (
          <motion.form
            key="phone"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onSubmit={handleSendOtp}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="otp-phone" className="text-xs font-medium">
                {hi ? 'फोन नंबर / Phone Number' : 'Phone Number'}
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-mono">+91</span>
                <Input
                  id="otp-phone"
                  type="tel"
                  placeholder="96510 35021"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-11 pl-10"
                  maxLength={10}
                  required
                />
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-[11px] text-muted-foreground">
                {hi
                  ? 'आपके फोन पर 6 अंकों का OTP भेजा जाएगा'
                  : 'A 6-digit OTP will be sent to your phone'}
              </p>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-gradient-to-r from-primary to-primary/90 shadow-md"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {hi ? 'OTP भेजें' : 'Send OTP'}
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full text-xs"
              onClick={() => { clearError(); onBack() }}
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
              {hi ? 'ईमेल लॉग इन पर वापस' : 'Back to Email Login'}
            </Button>
          </motion.form>
        ) : (
          <motion.form
            key="otp"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={handleVerifyOtp}
            className="space-y-4"
          >
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-1.5">
                <Smartphone className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">
                  {hi ? 'OTP भेजा गया' : 'OTP Sent'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {hi ? '+91 ' : '+91 '}{otpPhone} {hi ? 'पर' : ''}
              </p>
            </div>

            {/* Demo OTP display */}
            {otpDemoCode && (
              <Card className="bg-amber-500/5 border-amber-500/30 border-dashed">
                <CardContent className="p-3 text-center">
                  <p className="text-[10px] text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1">
                    {hi ? 'डेमो OTP (उत्पादन में छिपाएं)' : 'Demo OTP (hidden in production)'}
                  </p>
                  <code className="text-2xl font-bold font-mono text-amber-600 tracking-[0.3em]">
                    {otpDemoCode}
                  </code>
                </CardContent>
              </Card>
            )}

            <div className="space-y-2">
              <Label className="text-xs font-medium">
                {hi ? '6 अंकों का OTP दर्ज करें / Enter 6-digit OTP' : 'Enter 6-digit OTP'}
              </Label>
              <div className="flex gap-2 justify-between" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <Input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-12 h-14 text-center text-xl font-bold p-0"
                    autoFocus={i === 0}
                  />
                ))}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || otp.join('').length !== 6}
              className="w-full h-11 bg-gradient-to-r from-primary to-primary/90 shadow-md"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {hi ? 'सत्यापित करें' : 'Verify OTP'}
                </>
              )}
            </Button>

            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => { resetOtpState(); setOtp(['', '', '', '', '', '']) }}
                className="text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <ArrowLeft className="h-3 w-3" />
                {hi ? 'नंबर बदलें' : 'Change number'}
              </button>
              <button
                type="button"
                onClick={resendOtp}
                disabled={isLoading}
                className="text-primary hover:underline flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                {hi ? 'OTP पुनः भेजें' : 'Resend OTP'}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}
