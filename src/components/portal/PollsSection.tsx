'use client'
// PollsSection — public-facing citizen polls (Task 8-a)
// Bilingual HI/EN. Lists ACTIVE polls only (status='active' AND not expired).
// Citizens vote once per poll (localStorage flag + server voterKey unique constraint).
// After voting (or if already voted) results display as horizontal bars with %.
import { useEffect, useState, useCallback } from 'react'
import { useI18n } from '@/lib/i18n'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Loader2,
  Vote,
  Users,
} from 'lucide-react'
import { ScrollReveal } from './ScrollReveal'

const VOTE_STORAGE_PREFIX = 'gpch_poll_voted_'

interface PollOptionDTO {
  id: string
  textHi: string
  textEn: string
  order: number
  votes: number
}

interface PollDTO {
  id: string
  questionHi: string
  questionEn: string
  descriptionHi: string | null
  descriptionEn: string | null
  status: 'active' | 'closed'
  startDate: string
  endDate: string | null
  createdAt: string
  totalVotes: number
  options: PollOptionDTO[]
}

const BAR_PALETTE = [
  'bg-primary',
  'bg-amber-500',
  'bg-green-600',
  'bg-orange-500',
  'bg-teal-600',
  'bg-purple-500',
]

function isPollActive(p: PollDTO): boolean {
  if (p.status !== 'active') return false
  if (p.endDate && new Date(p.endDate).getTime() < Date.now()) return false
  return true
}

export function PollsSection() {
  const { locale } = useI18n()
  const isHi = locale === 'hi'

  const [polls, setPolls] = useState<PollDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [votedFlags, setVotedFlags] = useState<Record<string, string>>(() => {
    // Hydrate from localStorage on init
    if (typeof window === 'undefined') return {}
    const map: Record<string, string> = {}
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k && k.startsWith(VOTE_STORAGE_PREFIX)) {
          const pollId = k.slice(VOTE_STORAGE_PREFIX.length)
          const val = localStorage.getItem(k)
          if (val) map[pollId] = val
        }
      }
    } catch {
      // ignore
    }
    return map
  })
  const [votingForPollId, setVotingForPollId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const r = await fetch('/api/polls', { cache: 'no-store' })
      if (!r.ok) throw new Error('fetch_failed')
      const d: { polls: PollDTO[] } = await r.json()
      setPolls(d.polls || [])
    } catch {
      setError(isHi ? 'सर्वेक्षण लोड विफल' : 'Failed to load polls')
      setPolls([])
    } finally {
      setLoading(false)
    }
  }, [isHi])

  useEffect(() => {
    load()
  }, [load])

  const activePolls = polls.filter(isPollActive)

  const handleVote = async (pollId: string, optionId: string) => {
    if (votedFlags[pollId]) return
    setVotingForPollId(pollId)
    try {
      const r = await fetch(
        `/api/polls/${encodeURIComponent(pollId)}/vote`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ optionId }),
        },
      )
      const d = await r.json()
      if (r.status === 409) {
        // Already voted (server-side) — sync localStorage flag and refresh
        try {
          localStorage.setItem(VOTE_STORAGE_PREFIX + pollId, 'synced')
        } catch {
          // ignore
        }
        setVotedFlags((prev) => ({ ...prev, [pollId]: 'synced' }))
        toast.info(
          isHi ? 'आप पहले ही वोट कर चुके हैं' : 'You have already voted',
        )
        load()
        return
      }
      if (!r.ok) throw new Error(d.error || 'vote_failed')
      // Success: persist localStorage flag and refresh data
      try {
        localStorage.setItem(VOTE_STORAGE_PREFIX + pollId, optionId)
      } catch {
        // ignore
      }
      setVotedFlags((prev) => ({ ...prev, [pollId]: optionId }))
      toast.success(isHi ? 'आपका वोट दर्ज हुआ' : 'Vote recorded')
      // Optimistic update with returned counts, also refetch for safety
      if (d.poll) {
        setPolls((prev) =>
          prev.map((p) =>
            p.id === pollId
              ? {
                  ...p,
                  totalVotes: d.poll.totalVotes,
                  options: d.poll.options,
                }
              : p,
          ),
        )
      }
      load()
    } catch (e) {
      toast.error(isHi ? 'वोट दर्ज करने में त्रुटि' : 'Failed to vote', {
        description: (e as Error).message,
      })
    } finally {
      setVotingForPollId(null)
    }
  }

  const t = isHi
    ? {
        badge: 'सर्वेक्षण',
        badgeAlt: 'Polls',
        heading: 'ग्राम सभा सर्वेक्षण',
        headingAlt: 'Gram Sabha Polls',
        subheading:
          'ग्राम पंचायत चंद्रा के सर्वेक्षणों में भाग लें और अपनी राय दर्ज करें। प्रत्येक सर्वेक्षण में केवल एक बार वोट किया जा सकता है।',
        subheadingAlt:
          'Participate in Gram Panchayat Chandra polls and register your opinion. You can vote only once per poll.',
        endsOn: 'समाप्ति',
        totalVotes: 'कुल वोट',
        voteBtn: 'इस विकल्प के लिए वोट करें',
        voteBtnAlt: 'Vote for this option',
        recorded: 'आपका वोट दर्ज है',
        recordedAlt: 'Vote recorded',
        loading: 'लोड हो रहा है...',
        empty: 'कोई सक्रिय सर्वेक्षण नहीं',
        emptyAlt: 'No active polls',
        emptyHint: 'अभी कोई सक्रिय सर्वेक्षण उपलब्ध नहीं है। कृपया बाद में पुनः जाँच करें।',
        emptyHintAlt: 'No active polls are available right now. Please check back later.',
        results: 'परिणाम',
        resultsAlt: 'Results',
        error: 'सर्वेक्षण लोड विफल',
      }
    : {
        badge: 'Polls',
        badgeAlt: 'सर्वेक्षण',
        heading: 'Gram Sabha Polls',
        headingAlt: 'ग्राम सभा सर्वेक्षण',
        subheading:
          'Participate in Gram Panchayat Chandra polls and register your opinion. You can vote only once per poll.',
        subheadingAlt:
          'ग्राम पंचायत चंद्रा के सर्वेक्षणों में भाग लें और अपनी राय दर्ज करें। प्रत्येक सर्वेक्षण में केवल एक बार वोट किया जा सकता है।',
        endsOn: 'Ends on',
        totalVotes: 'Total votes',
        voteBtn: 'Vote for this option',
        voteBtnAlt: 'इस विकल्प के लिए वोट करें',
        recorded: 'Vote recorded',
        recordedAlt: 'आपका वोट दर्ज है',
        loading: 'Loading...',
        empty: 'No active polls',
        emptyAlt: 'कोई सक्रिय सर्वेक्षण नहीं',
        emptyHint: 'No active polls are available right now. Please check back later.',
        emptyHintAlt: 'अभी कोई सक्रिय सर्वेक्षण उपलब्ध नहीं है। कृपया बाद में पुनः जाँच करें।',
        results: 'Results',
        resultsAlt: 'परिणाम',
        error: 'Failed to load polls',
      }

  // Format endDate using locale-aware formatter (inline since we don't import admin lib here)
  const formatDate = (iso: string | null): string => {
    if (!iso) return ''
    const d = new Date(iso)
    if (isNaN(d.getTime())) return ''
    try {
      return new Intl.DateTimeFormat(isHi ? 'hi-IN' : 'en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(d)
    } catch {
      return d.toISOString().slice(0, 10)
    }
  }

  return (
    <section
      id="polls"
      data-section="polls"
      className="section-premium py-16 md:py-20 border-b border-border/40"
    >
      <div className="container mx-auto px-4">
        {/* ── Section Header ── */}
        <ScrollReveal delay={0.1}>
          <div className="text-center mb-10">
            <Badge variant="outline" className="section-header-badge mb-3 gap-1.5">
              <Vote className="h-3.5 w-3.5" />
              {t.badge}
              <span className="text-muted-foreground">/</span>
              {t.badgeAlt}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gradient-premium">
              {isHi ? t.heading : t.headingAlt}
              {' / '}
              {isHi ? t.headingAlt : t.heading}
            </h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              {isHi ? t.subheading : t.subheadingAlt}
            </p>
          </div>
        </ScrollReveal>

        {/* ── Loading skeleton ── */}
        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-44 skeleton-card rounded-lg" />
            ))}
          </div>
        )}

        {/* ── Error state ── */}
        {!loading && error && (
          <Card className="border-dashed border-destructive/40">
            <CardContent className="p-8 text-center text-sm text-destructive flex items-center justify-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </CardContent>
          </Card>
        )}

        {/* ── Empty state ── */}
        {!loading && !error && activePolls.length === 0 && (
          <ScrollReveal delay={0.15}>
            <Card className="border-dashed">
              <CardContent className="py-16 flex flex-col items-center justify-center gap-3 text-center">
                <div className="h-16 w-16 rounded-full bg-muted/60 grid place-items-center">
                  <Vote className="h-8 w-8 text-muted-foreground/60" />
                </div>
                <div>
                  <p className="text-base font-medium text-foreground">
                    {isHi ? t.empty : t.emptyAlt}
                    <span className="text-muted-foreground/70 font-normal">
                      {' / '}
                      {isHi ? t.emptyAlt : t.empty}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                    {isHi ? t.emptyHint : t.emptyHintAlt}
                  </p>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        )}

        {/* ── Polls grid ── */}
        {!loading && !error && activePolls.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {activePolls.map((poll, pIdx) => {
              const hasVoted = !!votedFlags[poll.id]
              const total = poll.totalVotes
              return (
                <ScrollReveal key={poll.id} delay={0.1 + pIdx * 0.05}>
                  <Card className="card-premium hover-lift h-full">
                    <CardContent className="p-5 md:p-6 flex flex-col gap-4">
                      {/* Header */}
                      <div>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge
                            variant="outline"
                            className="text-[10px] gap-1 bg-green-100 text-green-800 border-green-300 dark:bg-green-900/40 dark:text-green-200 dark:border-green-700"
                          >
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                            {isHi ? 'सक्रिय' : 'Active'}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] gap-1">
                            <Users className="h-3 w-3" />
                            {total} {isHi ? 'वोट' : 'votes'}
                          </Badge>
                          {poll.endDate && (
                            <Badge variant="outline" className="text-[10px] gap-1">
                              <CalendarClock className="h-3 w-3" />
                              {t.endsOn}: {formatDate(poll.endDate)}
                            </Badge>
                          )}
                          {hasVoted && (
                            <Badge
                              variant="outline"
                              className="text-[10px] gap-1 bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-200 dark:border-amber-700"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              {isHi ? t.recorded : t.recordedAlt}
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-base md:text-lg font-semibold leading-snug">
                          {isHi ? poll.questionHi : poll.questionEn}
                          <span className="block text-sm md:text-base text-muted-foreground/80 font-normal mt-1">
                            {isHi ? poll.questionEn : poll.questionHi}
                          </span>
                        </h3>
                        {(poll.descriptionHi || poll.descriptionEn) && (
                          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                            {isHi ? poll.descriptionHi : poll.descriptionEn}
                          </p>
                        )}
                      </div>

                      {/* Options or Results */}
                      {hasVoted ? (
                        <div className="space-y-2.5">
                          <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                            <Vote className="h-3 w-3" />
                            {isHi ? t.results : t.resultsAlt}
                            <span className="text-muted-foreground/60 font-normal normal-case">
                              {' '}
                              / {isHi ? t.resultsAlt : t.results}
                            </span>
                          </div>
                          {poll.options.map((opt, idx) => {
                            const pct =
                              total === 0 ? 0 : (opt.votes / total) * 100
                            const barColor =
                              BAR_PALETTE[idx % BAR_PALETTE.length]
                            const isUserChoice =
                              votedFlags[poll.id] === opt.id
                            return (
                              <motion.div
                                key={opt.id}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                  duration: 0.3,
                                  delay: 0.04 * idx,
                                  ease: 'easeOut',
                                }}
                                className="space-y-1"
                              >
                                <div className="flex items-baseline justify-between gap-2 text-xs">
                                  <span className="text-foreground/90 truncate flex items-center gap-1.5">
                                    {isUserChoice && (
                                      <CheckCircle2 className="h-3 w-3 text-primary flex-shrink-0" />
                                    )}
                                    {isHi ? opt.textHi : opt.textEn}
                                    <span className="text-muted-foreground/60">
                                      / {isHi ? opt.textEn : opt.textHi}
                                    </span>
                                  </span>
                                  <span className="text-muted-foreground tabular-nums-strong whitespace-nowrap text-[11px]">
                                    <span className="font-medium text-foreground">
                                      {opt.votes}
                                    </span>
                                    {' '}
                                    ({pct.toFixed(1)}%)
                                  </span>
                                </div>
                                <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
                                  <motion.div
                                    className={`h-full ${barColor} rounded-full`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pct}%` }}
                                    transition={{
                                      duration: 0.6,
                                      delay: 0.1 + 0.04 * idx,
                                      ease: 'easeOut',
                                    }}
                                  />
                                </div>
                              </motion.div>
                            )
                          })}
                          <div className="text-[10px] text-muted-foreground pt-1 border-t mt-2">
                            {t.totalVotes}:{' '}
                            <span className="font-medium text-foreground tabular-nums-strong">
                              {total}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {poll.options.map((opt, idx) => (
                            <motion.button
                              key={opt.id}
                              type="button"
                              onClick={() => handleVote(poll.id, opt.id)}
                              disabled={votingForPollId === poll.id}
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                              className="w-full text-left p-3 rounded-lg border border-border/70 bg-secondary/40 hover:bg-primary/5 hover:border-primary/40 transition-colors focus-ring disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-3 group"
                              aria-label={`${isHi ? t.voteBtn : t.voteBtnAlt}: ${isHi ? opt.textHi : opt.textEn}`}
                            >
                              <div
                                className={`h-7 w-7 rounded-full grid place-items-center text-xs font-bold shrink-0 ${BAR_PALETTE[idx % BAR_PALETTE.length]} text-white`}
                              >
                                {String.fromCharCode(65 + idx)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium leading-tight">
                                  {isHi ? opt.textHi : opt.textEn}
                                </div>
                                <div className="text-[11px] text-muted-foreground/80 mt-0.5">
                                  {isHi ? opt.textEn : opt.textHi}
                                </div>
                              </div>
                              {votingForPollId === poll.id ? (
                                <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
                              ) : (
                                <Vote className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0" />
                              )}
                            </motion.button>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </ScrollReveal>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
