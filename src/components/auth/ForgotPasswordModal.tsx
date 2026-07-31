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
import { Badge } from '@/components/ui/badge'
import { useI18n } from '@/lib/i18n'
import { useAuth } from '@/lib/auth-store'
import { Mail, KeyRound, CheckCircle2, Loader2, Copy, AlertCircle } from 'lucide-react'

interface ForgotPasswordModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultEmail?: string
}

export function ForgotPasswordModal({ open, onOpenChange, defaultEmail }: ForgotPasswordModalProps) {
  const { locale } = useI18n()
  const { forgotPassword, isLoading, resetToken, clearError } = useAuth()
  const [email, setEmail] = useState(defaultEmail || '')
  const [copied, setCopied] = useState(false)
  const hi = locale === 'hi'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    await forgotPassword(email)
  }

  const handleClose = () => {
    clearError()
    setCopied(false)
    onOpenChange(false)
  }

  const copyToken = () => {
    if (resetToken) {
      navigator.clipboard.writeText(resetToken)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
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
            {hi
              ? 'अपना ईमेल दर्ज करें और हम आपको एक रीसेट लिंक भेजेंगे।'
              : 'Enter your email and we\'ll send you a reset link.'}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {!resetToken ? (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
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
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <div className="flex flex-col items-center text-center py-4">
                <div className="h-14 w-14 rounded-full bg-green-600/10 grid place-items-center mb-3">
                  <CheckCircle2 className="h-7 w-7 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg">
                  {hi ? 'रीसेट लिंक तैयार!' : 'Reset Link Ready!'}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {hi
                    ? 'डेमो मोड: नीचे दिया गया टोकन आपका पासवर्ड रीसेट टोकन है।'
                    : 'Demo mode: Below is your password reset token.'}
                </p>
              </div>

              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <code className="text-xs font-mono text-primary break-all flex-1">
                      {resetToken}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={copyToken}
                      className="shrink-0 h-8 px-2"
                    >
                      {copied ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Badge variant="outline" className="w-full justify-center py-1.5">
                {hi ? '⏱️ 1 घंटे में समाप्त होगा' : '⏱️ Expires in 1 hour'}
              </Badge>

              <DialogFooter>
                <Button onClick={handleClose} className="w-full">
                  {hi ? 'समझ गया' : 'Got it'}
                </Button>
              </DialogFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
