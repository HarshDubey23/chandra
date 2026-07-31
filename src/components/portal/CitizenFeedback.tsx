'use client'
import { useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Star,
  ThumbsUp,
  Loader2,
  CheckCircle2,
  MessageSquare,
  CloudCheck,
  CloudOff,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface CitizenFeedbackProps {
  trackingId: string
  /** Optional pre-existing rating/comment (e.g., from API in future) */
  initialRating?: number
  initialComment?: string
}

const STORAGE_KEY = 'gpchandra-feedback'

interface StoredEntry {
  rating: number
  comment: string
  ts: string
  /** ISO timestamp when the entry was successfully synced to the panchayat API */
  syncedAt?: string | null
}

/** Read all feedback entries from localStorage. */
function readAllFeedback(): Record<string, StoredEntry> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) as Record<string, StoredEntry> : {}
  } catch {
    return {}
  }
}

/** Persist a feedback entry to localStorage keyed by trackingId. */
function writeFeedback(trackingId: string, entry: StoredEntry) {
  if (typeof window === 'undefined') return
  try {
    const all = readAllFeedback()
    all[trackingId] = entry
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  } catch {
    // ignore quota errors
  }
}

/**
 * CitizenFeedback — allows a citizen to rate their satisfaction with a
 * resolved complaint on a 1-5 star scale, with an optional comment.
 * Primary persistence is the public /api/feedback endpoint (Prisma-backed).
 * If the API is unreachable, feedback falls back to localStorage and a
 * subtle "saved locally" toast is shown with an amber sync indicator.
 */
export function CitizenFeedback({ trackingId, initialRating, initialComment }: CitizenFeedbackProps) {
  const { locale } = useI18n()
  const isHi = locale === 'hi'

  // Lazy-load any existing feedback for this trackingId on first render
  const [existingEntry, setExistingEntry] = useState<StoredEntry | null>(
    () => readAllFeedback()[trackingId] ?? null,
  )

  const [rating, setRating] = useState<number | null>(existingEntry?.rating ?? initialRating ?? null)
  const [hover, setHover] = useState<number | null>(null)
  const [comment, setComment] = useState(existingEntry?.comment ?? initialComment ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(!!existingEntry)

  // Whether the current entry is synced to the panchayat server
  const isSynced = !!existingEntry?.syncedAt

  const handleSubmit = async () => {
    if (rating === null) {
      toast.error(isHi ? 'कृपया रेटिंग चुनें' : 'Please select a rating')
      return
    }
    setSubmitting(true)

    // Always update localStorage first as an immediate cache/fallback
    const localEntry: StoredEntry = {
      rating,
      comment: comment.trim(),
      ts: new Date().toISOString(),
      syncedAt: existingEntry?.syncedAt ?? null,
    }
    writeFeedback(trackingId, localEntry)

    // Attempt to POST to the panchayat API
    let synced = false
    try {
      const r = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackingId,
          rating,
          comment: comment.trim() || undefined,
          language: locale,
        }),
      })
      if (r.ok) {
        synced = true
      } else if (r.status === 404) {
        // Tracking id not found — shouldn't happen for a resolved complaint,
        // but surface a gentle error to the citizen.
        toast.error(isHi ? 'शिकायत आईडी नहीं मिली' : 'Complaint ID not found')
        setSubmitting(false)
        return
      }
      // For other non-OK responses (400/500), fall through to local-only mode.
    } catch {
      // Network error — fall back to local-only mode silently.
    }

    const finalEntry: StoredEntry = {
      ...localEntry,
      syncedAt: synced ? new Date().toISOString() : localEntry.syncedAt,
    }
    writeFeedback(trackingId, finalEntry)
    setExistingEntry(finalEntry)
    setSubmitting(false)
    setSubmitted(true)

    if (synced) {
      toast.success(
        isHi
          ? 'धन्यवाद! आपकी प्रतिक्रिया पंचायत को भेज दी गई है।'
          : 'Thank you! Your feedback has been sent to the panchayat.',
      )
    } else {
      toast(
        isHi
          ? 'स्थानीय रूप से सहेजा गया — ऑनलाइन होने पर सिंक होगा'
          : 'Saved locally — will sync when online',
        { icon: '☁️' },
      )
    }
  }

  const labels = isHi
    ? {
        title: 'नागरिक प्रतिक्रिया',
        subtitle: 'आपकी शिकायत के समाधान से कितना संतुष्ट हैं?',
        ratingHint: '1 = असंतुष्ट, 5 = बहुत संतुष्ट',
        commentLabel: 'अपनी टिप्पणी यहाँ लिखें (वैकल्पिक)',
        commentPlaceholder: 'अपना अनुभव साझा करें...',
        submit: 'प्रतिक्रिया दें',
        submitted: 'प्रतिक्रिया दर्ज हो गई',
        submittedAt: 'दर्ज तिथि',
        thanks: 'आपकी बहुमूल्य प्रतिक्रिया के लिए धन्यवाद!',
        edit: 'प्रतिक्रिया संपादित करें',
        stars: ['बहुत खराब', 'खराब', 'औसत', 'अच्छा', 'बहुत अच्छा'],
        synced: 'पंचायत सर्वर पर सिंक हो गया',
        localOnly: 'स्थानीय रूप से सहेजा गया (सिंक लंबित)',
      }
    : {
        title: 'Citizen Feedback',
        subtitle: 'How satisfied are you with the resolution of your complaint?',
        ratingHint: '1 = Unsatisfied, 5 = Very Satisfied',
        commentLabel: 'Write your comment here (optional)',
        commentPlaceholder: 'Share your experience...',
        submit: 'Submit Feedback',
        submitted: 'Feedback recorded',
        submittedAt: 'Submitted on',
        thanks: 'Thank you for your valuable feedback!',
        edit: 'Edit feedback',
        stars: ['Very Bad', 'Bad', 'Average', 'Good', 'Excellent'],
        synced: 'Synced to panchayat server',
        localOnly: 'Saved locally (sync pending)',
      }

  return (
    <Card className="border-accent/40 bg-accent/5 mt-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-accent text-accent-foreground grid place-items-center">
              <MessageSquare className="h-3.5 w-3.5" />
            </div>
            {labels.title}
          </CardTitle>
          <div className="flex items-center gap-1.5">
            {submitted && existingEntry && (
              <Badge variant="outline" className="gap-1 text-[10px] text-accent-foreground border-accent/40 bg-accent/10">
                <CheckCircle2 className="h-3 w-3" />
                {labels.submitted}
              </Badge>
            )}
            {submitted && existingEntry && (
              <Badge
                variant="outline"
                className={cn(
                  'gap-1 text-[10px] border',
                  isSynced
                    ? 'bg-green-100 text-green-900 border-green-300 dark:bg-green-900/40 dark:text-green-100 dark:border-green-700'
                    : 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-900/40 dark:text-amber-100 dark:border-amber-700',
                )}
                title={isSynced ? labels.synced : labels.localOnly}
              >
                {isSynced ? (
                  <CloudCheck className="h-3 w-3" />
                ) : (
                  <CloudOff className="h-3 w-3" />
                )}
                <span className="hidden sm:inline">
                  {isSynced ? (isHi ? 'सिंक' : 'Synced') : (isHi ? 'स्थानीय' : 'Local')}
                </span>
                <span
                  className={cn(
                    'inline-block h-1.5 w-1.5 rounded-full sm:hidden',
                    isSynced ? 'bg-green-600' : 'bg-amber-500',
                  )}
                  aria-hidden
                />
              </Badge>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{labels.subtitle}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Star rating */}
        <div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => {
              const isFilled = (hover ?? rating ?? 0) >= n
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => { setRating(n); setSubmitted(false) }}
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(null)}
                  className={cn(
                    'p-1 rounded transition-all hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
                    isFilled ? 'text-amber-500' : 'text-muted-foreground/40',
                  )}
                  aria-label={`${n} star — ${labels.stars[n - 1]}`}
                  title={`${n} — ${labels.stars[n - 1]}`}
                >
                  <Star className={cn('h-7 w-7 transition-all', isFilled && 'fill-current')} />
                </button>
              )
            })}
            {rating !== null && (
              <span className="ml-2 text-xs font-medium text-foreground/80">
                {labels.stars[rating - 1]}
              </span>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">{labels.ratingHint}</p>
        </div>

        {/* Comment */}
        <div>
          <label className="text-xs font-medium block mb-1.5">{labels.commentLabel}</label>
          <Textarea
            value={comment}
            onChange={(e) => { setComment(e.target.value); setSubmitted(false) }}
            placeholder={labels.commentPlaceholder}
            rows={3}
            maxLength={500}
            className="text-sm resize-none bg-background/60"
          />
          <div className="text-[10px] text-muted-foreground mt-0.5 text-right">{comment.length}/500</div>
        </div>

        {/* Submit button */}
        {!submitted ? (
          <Button
            onClick={handleSubmit}
            disabled={submitting || rating === null}
            className="gap-1.5 w-full sm:w-auto"
            size="sm"
          >
            {submitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ThumbsUp className="h-3.5 w-3.5" />
            )}
            {labels.submit}
          </Button>
        ) : (
          <div className="space-y-2">
            <div className="flex items-start gap-2 p-3 rounded-md bg-accent/15 border border-accent/30">
              <CheckCircle2 className="h-4 w-4 text-accent-foreground mt-0.5 shrink-0" />
              <div className="text-xs text-foreground/80">
                <p className="font-medium text-accent-foreground">{labels.thanks}</p>
                {existingEntry && (
                  <p className="mt-0.5 text-muted-foreground">
                    {labels.submittedAt}: {new Date(existingEntry.ts).toLocaleString(isHi ? 'hi-IN' : 'en-IN')}
                  </p>
                )}
                {existingEntry && (
                  <p className="mt-0.5 flex items-center gap-1 text-muted-foreground">
                    {isSynced ? (
                      <>
                        <CloudCheck className="h-3 w-3 text-green-600" />
                        {labels.synced}
                      </>
                    ) : (
                      <>
                        <CloudOff className="h-3 w-3 text-amber-600" />
                        {labels.localOnly}
                      </>
                    )}
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSubmitted(false)}
              className="gap-1.5 text-xs"
            >
              {labels.edit}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
