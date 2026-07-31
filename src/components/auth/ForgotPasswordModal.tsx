'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
import { Card, CardContent } from '@/components/ui/card'
import { useI18n } from '@/lib/i18n'
import { useAuth } from '@/lib/auth-store'
import { Mail, KeyRound, CheckCircle2, Loader2, AlertCircle, Lock } from 'lucide-react'

interface ForgotPasswordModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultEmail?: string
}

type Step = 'email' | 'sent' | 'reset' | 'done'

export function ForgotPasswordModal({ open, onOpenChange, defaultEmail }: ForgotPasswordModalProps) {
  const { locale } = useI18n()
  const { forgotPassword, isLoading, clearError } = useAuth()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState(defaultEmail || '')
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [resetting, setResetting] = useState(false)
  const [resetError, setResetError] = useState<string | null>(null)
  const hi = locale === 'hi'

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setResetError(null)
    await forgotPassword(email)
    // Always go to 'sent' step — don't reveal whether email exists
    setStep('sent')
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetError(null)
    if (newPassword.length < 6) {
      setResetError(hi ? 'पासवर्ड कम से कम 6 अक्षर का होना चाहिए' : 'Password must be at least 6 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setResetError(hi ? 'पासवर्ड मेल नहीं खाते' : 'Passwords do not match')
      return
    }
    setResetting(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'reset_failed')
      }
      setStep('done')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'reset_failed'
      setResetError(
        msg === 'invalid_or_expired_token'
          ? (hi ? 'अमान्य या समाप्त टोकन। कृपया नया रीसेट लिंक अनुरोध करें।' : 'Invalid or expired token. Please request a new reset link.')
          : msg === 'token_expired'
          ? (hi ? 'टोकन समाप्त हो गया। कृपया नया रीसेट लिंक अनुरोध करें।' : 'Token expired. Please request a new reset link.')
          : (hi ? 'पासवर्ड रीसेट विफल। पुनः प्रयास करें।' : 'Password reset failed. Please try again.')
      )
    } finally {
      setResetting(false)
    }
  }

  const handleClose = () => {
    clearError()
    setStep('email')
    setToken('')
    setNewPassword('')
    setConfirmPassword('')
    setResetError(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            {hi ? 'पासवर्ड रीसेट' : 'Password Reset'}
          </DialogTitle>
          <DialogDescription>
            {step === 'email' && (hi ? 'अपना पंजीकृत ईमेल दर्ज करें।' : 'Enter your registered email.')}
            {step === 'sent' && (hi ? 'रीसेट लिंक भेजा गया है।' : 'Reset link has been sent.')}
            {step === 'reset' && (hi ? 'नया पासवर्ड सेट करें।' : 'Set a new password.')}
            {step === 'done' && (hi ? 'पासवर्ड अपडेट हुआ!' : 'Password updated!')}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {/* Step 1: Enter email */}
          {step === 'email' && (
            <motion.form
              key="email"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmitEmail}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="forgot-email" className="text-xs font-medium">
                  {hi ? 'पंजीकृत ईमेल / Registered Email' : 'Registered Email'}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 h-11"
                    required
                  />
                </div>
              </div>

              <Card className="bg-amber-500/5 border-amber-500/20">
                <CardContent className="p-3 text-xs text-muted-foreground flex items-start gap-2">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-600 mt-0.5 shrink-0" />
                  <span>
                    {hi
                      ? 'यदि यह ईमेल पंजीकृत है, तो आपको 1 घंटे के भीतर एक रीसेट लिंक प्राप्त होगा।'
                      : 'If this email is registered, you\'ll receive a reset link within 1 hour.'}
                  </span>
                </CardContent>
              </Card>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  {hi ? 'रद्द करें' : 'Cancel'}
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      {hi ? 'रीसेट लिंक भेजें' : 'Send Reset Link'}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </motion.form>
          )}

          {/* Step 2: Success message (NO token shown) */}
          {step === 'sent' && (
            <motion.div
              key="sent"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <div className="flex flex-col items-center text-center py-4">
                <div className="h-14 w-14 rounded-full bg-green-600/10 grid place-items-center mb-3">
                  <CheckCircle2 className="h-7 w-7 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg">
                  {hi ? 'रीसेट लिंक भेजा गया' : 'Reset Link Sent'}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                  {hi
                    ? `यदि ${email} पंजीकृत है, तो आपको एक रीसेट लिंक ईमेल किया गया है। लिंक 1 घंटे में समाप्त हो जाएगा।`
                    : `If ${email} is registered, a reset link has been emailed to you. The link expires in 1 hour.`}
                </p>
              </div>

              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-3 text-xs text-muted-foreground">
                  {hi
                    ? 'ईमेल में आए लिंक पर क्लिक करें या नीचे टोकन दर्ज करके नया पासवर्ड सेट करें।'
                    : 'Click the link in your email or enter the token below to set a new password.'}
                </CardContent>
              </Card>

              <DialogFooter className="flex-col gap-2 sm:flex-col">
                <Button onClick={() => setStep('reset')} className="w-full">
                  {hi ? 'टोकन दर्ज करें' : 'Enter Token'}
                </Button>
                <Button type="button" variant="outline" onClick={handleClose} className="w-full">
                  {hi ? 'बंद करें' : 'Close'}
                </Button>
              </DialogFooter>
            </motion.div>
          )}

          {/* Step 3: Enter token + new password */}
          {step === 'reset' && (
            <motion.form
              key="reset"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleResetPassword}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="reset-token" className="text-xs font-medium">
                  {hi ? 'रीसेट टोकन / Reset Token' : 'Reset Token'}
                </Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reset-token"
                    type="text"
                    placeholder={hi ? 'ईमेल में प्राप्त टोकन' : 'Token from email'}
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="pl-9 h-11 font-mono text-xs"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-xs font-medium">
                  {hi ? 'नया पासवर्ड / New Password' : 'New Password'}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-9 h-11"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-xs font-medium">
                  {hi ? 'पासवर्ड की पुष्टि करें / Confirm Password' : 'Confirm Password'}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-9 h-11"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              {resetError && (
                <Card className="bg-destructive/5 border-destructive/20">
                  <CardContent className="p-3 text-xs text-destructive flex items-start gap-2">
                    <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <span>{resetError}</span>
                  </CardContent>
                </Card>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setStep('email')}>
                  {hi ? 'वापस' : 'Back'}
                </Button>
                <Button type="submit" disabled={resetting}>
                  {resetting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      {hi ? 'पासवर्ड अपडेट करें' : 'Update Password'}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </motion.form>
          )}

          {/* Step 4: Done */}
          {step === 'done' && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <div className="flex flex-col items-center text-center py-4">
                <div className="h-14 w-14 rounded-full bg-green-600/10 grid place-items-center mb-3">
                  <CheckCircle2 className="h-7 w-7 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg">
                  {hi ? 'पासवर्ड अपडेट हुआ!' : 'Password Updated!'}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {hi
                    ? 'अब आप अपने नए पासवर्ड से लॉग इन कर सकते हैं।'
                    : 'You can now log in with your new password.'}
                </p>
              </div>

              <DialogFooter>
                <Button onClick={handleClose} className="w-full">
                  {hi ? 'लॉग इन पर जाएं' : 'Go to Login'}
                </Button>
              </DialogFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
