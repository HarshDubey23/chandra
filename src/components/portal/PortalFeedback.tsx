'use client'
import { useMemo, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, ThumbsUp, CheckCircle2, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScrollReveal } from './ScrollReveal'

/**
 * PortalFeedback — homepage "संतुष्टि पल्स" widget.
 * Lets any visitor rate the portal (1-5 stars) + leave an optional comment.
 * Ratings are persisted to localStorage (anonymous, no PII).
 */
const STORAGE_KEY = 'gpchandra-portal-feedback'

type Stored = { rating: number; comment?: string; ts: number }

export function PortalFeedback() {
  const { locale } = useI18n()
  const [myRating, setMyRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [allRatings, setAllRatings] = useState<Stored[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const list = raw ? JSON.parse(raw) : []
      return Array.isArray(list) ? list : []
    } catch {
      return []
    }
  })

  const avg = useMemo(() => {
    if (allRatings.length === 0) return 0
    const sum = allRatings.reduce((a, b) => a + b.rating, 0)
    return sum / allRatings.length
  }, [allRatings])

  const submit = () => {
    if (myRating < 1 || myRating > 5) return
    const entry: Stored = { rating: myRating, comment: comment.trim() || undefined, ts: Date.now() }
    const next = [...allRatings, entry]
    setAllRatings(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      /* ignore quota errors */
    }
    setSubmitted(true)
  }

  const reset = () => {
    setMyRating(0)
    setHoverRating(0)
    setComment('')
    setSubmitted(false)
  }

  const hi = locale === 'hi'

  return (
    <section id="portal-feedback" className="section-premium py-16 md:py-20 border-b border-border/40">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10">
          <Badge variant="outline" className="section-header-badge mb-3 gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            {hi ? 'संतुष्टि पल्स' : 'Satisfaction Pulse'}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gradient-premium">
            {hi ? 'पोर्टल संतुष्टि पल्स' : 'Portal Satisfaction Pulse'}
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            {hi
              ? 'आपकी राय हमारे लिए महत्वपूर्ण है। इस डिजिटल पोर्टल की गुणवत्ता को 1 से 5 तक रेट करें।'
              : 'Your opinion matters. Rate this digital portal from 1 to 5 stars.'}
          </p>
        </div>

        <ScrollReveal>
          <Card className="card-premium-bordered max-w-2xl mx-auto rounded-xl overflow-hidden">
            <CardContent className="p-6 md:p-8">
              {/* Aggregate display */}
              {allRatings.length > 0 && (
                <div className="mb-6 flex items-center justify-center gap-3 rounded-lg bg-primary/5 px-4 py-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(n => (
                      <Star
                        key={n}
                        className={cn(
                          'h-5 w-5 transition-colors',
                          n <= Math.round(avg) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40',
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-2xl font-bold font-mono text-primary">
                    {avg.toFixed(1)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {hi
                      ? `${allRatings.length} ${allRatings.length === 1 ? 'रेटिंग' : 'रेटिंग्स'}`
                      : `${allRatings.length} ${allRatings.length === 1 ? 'rating' : 'ratings'}`}
                  </span>
                </div>
              )}

              {submitted ? (
                <div className="text-center py-6">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-green-600 mb-3" />
                  <p className="text-lg font-semibold mb-1">
                    {hi ? 'धन्यवाद आपकी राय के लिए!' : 'Thank you for your feedback!'}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {hi
                      ? `आपने ${myRating} स्टार दिए। आपकी प्रतिक्रिया से हम सेवा बेहतर बनाएंगे।`
                      : `You rated ${myRating} star${myRating > 1 ? 's' : ''}. Your input helps us improve.`}
                  </p>
                  <button
                    onClick={reset}
                    className="text-sm text-primary hover:underline underline-offset-2"
                  >
                    {hi ? 'फिर से रेट करें' : 'Rate again'}
                  </button>
                </div>
              ) : (
                <>
                  {/* Star rating input */}
                  <div className="flex flex-col items-center gap-3 mb-6">
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map(n => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setMyRating(n)}
                          onMouseEnter={() => setHoverRating(n)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="group p-1 rounded-md transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          aria-label={`${n} ${hi ? 'स्टार' : 'star'}`}
                        >
                          <Star
                            className={cn(
                              'h-8 w-8 md:h-10 md:w-10 transition-all duration-150',
                              (hoverRating || myRating) >= n
                                ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                                : 'text-muted-foreground/40 group-hover:text-muted-foreground',
                            )}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground h-5">
                      {myRating === 0
                        ? hi ? 'अपनी रेटिंग चुनें' : 'Choose your rating'
                        : hi
                          ? ['बहुत खराब', 'खराब', 'ठीक', 'अच्छा', 'उत्कृष्ट'][myRating - 1]
                          : ['Very poor', 'Poor', 'Okay', 'Good', 'Excellent'][myRating - 1]}
                    </span>
                  </div>

                  {/* Comment (optional) */}
                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value.slice(0, 300))}
                    placeholder={hi ? 'अपनी टिप्पणी यहाँ लिखें (वैकल्पिक)' : 'Write your comment here (optional)'}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-colors"
                    rows={3}
                    maxLength={300}
                  />
                  <div className="flex items-center justify-between mt-1 mb-4">
                    <span className="text-xs text-muted-foreground">
                      {comment.length}/300
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {hi ? 'आपकी पहचान सुरक्षित रहेगी' : 'Anonymous & safe'}
                    </span>
                  </div>

                  <button
                    onClick={submit}
                    disabled={myRating < 1}
                    className={cn(
                      'w-full flex items-center justify-center gap-2 rounded-md py-2.5 text-sm font-semibold transition-all',
                      myRating >= 1
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md'
                        : 'bg-muted text-muted-foreground cursor-not-allowed',
                    )}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    {hi ? 'प्रतिक्रिया जमा करें' : 'Submit feedback'}
                  </button>
                </>
              )}
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>
    </section>
  )
}
