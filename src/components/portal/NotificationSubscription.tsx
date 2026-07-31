'use client'
// Notification Subscription — citizens subscribe to complaint status updates.
// Master doc §9.2. Shows subscribe form + confirmation after tracking a complaint.
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Bell, BellRing, Loader2, Check, MessageCircle, Smartphone } from 'lucide-react'

interface Props {
  trackingId: string
  locale: 'hi' | 'en'
}

export function NotificationSubscription({ trackingId, locale }: Props) {
  const isHi = locale === 'hi'
  const [phone, setPhone] = useState('')
  const [channel, setChannel] = useState<'sms' | 'whatsapp' | 'both'>('whatsapp')
  const [subscribing, setSubscribing] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubscribe = async () => {
    setError(null)
    if (phone.replace(/[^\d]/g, '').length < 10) {
      setError(isHi ? 'सही 10-अंकीय फ़ोन नंबर दर्ज करें' : 'Enter valid 10-digit phone')
      return
    }
    setSubscribing(true)
    try {
      const r = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingId, phone, channel }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.message || 'subscribe_failed')
      setSubscribed(true)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSubscribing(false)
    }
  }

  if (subscribed) {
    return (
      <div className="p-4 rounded-lg bg-green-600/5 border border-green-600/30">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-8 w-8 rounded-full bg-green-600 text-white grid place-items-center">
            <Check className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-green-700 dark:text-green-400">
              {isHi ? 'सदस्यता सफल!' : 'Subscribed!'}
            </h4>
            <p className="text-[11px] text-muted-foreground">
              {isHi
                ? `${trackingId} की स्थिति बदने पर आपको ${channel === 'whatsapp' ? 'WhatsApp' : channel === 'sms' ? 'SMS' : 'WhatsApp + SMS'} पर सूचित किया जाएगा।`
                : `You'll be notified via ${channel === 'whatsapp' ? 'WhatsApp' : channel === 'sms' ? 'SMS' : 'WhatsApp + SMS'} when ${trackingId} status changes.`}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="h-9 w-9 rounded-full bg-primary/15 text-primary grid place-items-center shrink-0">
            <BellRing className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold">
              {isHi ? 'स्थिति अपडेट प्राप्त करें' : 'Get Status Updates'}
            </h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {isHi
                ? 'अपनी शिकायत की स्थिति बदने पर सूचना प्राप्त करें।'
                : 'Receive notifications when your complaint status changes.'}
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          <div>
            <Label className="text-[10px] text-muted-foreground">{isHi ? 'फ़ोन नंबर' : 'Phone Number'}</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={isHi ? '10-अंकीय मोबाइल नंबर' : '10-digit mobile number'}
              className="text-sm h-8 font-mono"
              inputMode="tel"
              maxLength={13}
            />
          </div>
          <div>
            <Label className="text-[10px] text-muted-foreground">{isHi ? 'सूचना माध्यम' : 'Notification Channel'}</Label>
            <div className="flex gap-1.5 mt-1">
              {([
                { id: 'whatsapp', hi: 'WhatsApp', en: 'WhatsApp', icon: MessageCircle },
                { id: 'sms', hi: 'SMS', en: 'SMS', icon: Smartphone },
                { id: 'both', hi: 'दोनों', en: 'Both', icon: Bell },
              ] as const).map(ch => {
                const Icon = ch.icon
                return (
                  <button
                    key={ch.id}
                    onClick={() => setChannel(ch.id)}
                    className={`flex-1 h-8 text-[10px] rounded-md border inline-flex items-center justify-center gap-1 transition-colors ${
                      channel === ch.id
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background border-border hover:bg-secondary'
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    {isHi ? ch.hi : ch.en}
                  </button>
                )
              })}
            </div>
          </div>
          {error && <p className="text-[10px] text-destructive">{error}</p>}
          <Button
            size="sm"
            className="w-full h-8 text-xs gap-1.5 glow-saffron"
            onClick={handleSubscribe}
            disabled={subscribing}
          >
            {subscribing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Bell className="h-3 w-3" />}
            {isHi ? 'सदस्यता लें' : 'Subscribe'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
