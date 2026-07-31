'use client'
// PollsManager — admin CRUD for citizen polls/surveys (Task 8-a)
// Bilingual HI/EN. Lists active + closed polls with vote distribution bars,
// Create-Poll dialog with 2-6 bilingual options, search, close/reopen, delete.
import { useEffect, useMemo, useState, useCallback } from 'react'
import { useI18n } from '@/lib/i18n'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  AlertCircle,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Vote,
  X,
} from 'lucide-react'
import { formatDateTime, formatDate } from './lib'
import type { Locale } from '@/lib/i18n'

// ── Warm Indian palette (matches FeedbackDashboard)
const BAR_PALETTE = [
  'bg-primary',
  'bg-amber-500',
  'bg-green-600',
  'bg-orange-500',
  'bg-teal-600',
  'bg-purple-500',
]

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
  updatedAt: string
  totalVotes: number
  options: PollOptionDTO[]
}

interface CreateOptionRow {
  textHi: string
  textEn: string
}

export function PollsManager() {
  const { locale } = useI18n()
  const isHi = locale === 'hi'

  const [polls, setPolls] = useState<PollDTO[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [pendingActionId, setPendingActionId] = useState<string | null>(null)

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
      setPolls(null)
    } finally {
      setLoading(false)
    }
  }, [isHi])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(() => {
    if (!polls) return []
    if (!searchQuery.trim()) return polls
    const q = searchQuery.trim().toLowerCase()
    return polls.filter(
      (p) =>
        p.questionHi.toLowerCase().includes(q) ||
        p.questionEn.toLowerCase().includes(q),
    )
  }, [polls, searchQuery])

  const activePolls = filtered.filter((p) => p.status === 'active')
  const closedPolls = filtered.filter((p) => p.status === 'closed')

  const handleToggleStatus = async (poll: PollDTO) => {
    const nextStatus = poll.status === 'active' ? 'closed' : 'active'
    setPendingActionId(poll.id)
    try {
      const r = await fetch(`/api/polls/${encodeURIComponent(poll.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'update_failed')
      toast.success(
        isHi
          ? nextStatus === 'closed'
            ? 'सर्वेक्षण बंद किया गया'
            : 'सर्वेक्षण पुनः खुला'
          : nextStatus === 'closed'
            ? 'Poll closed'
            : 'Poll reopened',
      )
      load()
    } catch (e) {
      toast.error(isHi ? 'स्थिति अपडेट विफल' : 'Status update failed', {
        description: (e as Error).message,
      })
    } finally {
      setPendingActionId(null)
    }
  }

  const handleDelete = async (id: string) => {
    setPendingActionId(id)
    try {
      const r = await fetch(`/api/polls/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'delete_failed')
      toast.success(isHi ? 'सर्वेक्षण हटाया गया' : 'Poll deleted')
      setDeleteId(null)
      load()
    } catch (e) {
      toast.error(isHi ? 'हटाना विफल' : 'Delete failed', {
        description: (e as Error).message,
      })
    } finally {
      setPendingActionId(null)
    }
  }

  const t = isHi
    ? {
        heading: 'सर्वेक्षण',
        subheading: 'नागरिक सर्वेक्षण बनाएँ, बंद करें और परिणाम देखें।',
        create: 'नया सर्वेक्षण',
        refresh: 'रिफ्रेश',
        searchPlaceholder: 'प्रश्न खोजें...',
        activeSection: 'सक्रिय सर्वेक्षण',
        closedSection: 'बंद सर्वेक्षण',
        totalVotes: 'कुल वोट',
        options: 'विकल्प',
        endsOn: 'समाप्ति',
        created: 'बनाया गया',
        noEndDate: 'अनिश्चित',
        close: 'बंद करें',
        reopen: 'पुनः खोलें',
        delete: 'हटाएँ',
        empty: 'अभी कोई सर्वेक्षण नहीं',
        emptyHint: '"नया सर्वेक्षण" बटन से पहला सर्वेक्षण बनाएँ।',
        noResults: 'इस खोज में कोई सर्वेक्षण नहीं।',
        loading: 'लोड हो रहा है...',
        closed: 'बंद',
        active: 'सक्रिय',
        deleteTitle: 'सर्वेक्षण हटाएँ?',
        deleteWarning: 'यह क्रिया वापस नहीं हो सकती। सभी वोट भी हट जाएँगे।',
        cancel: 'रद्द करें',
      }
    : {
        heading: 'Polls',
        subheading: 'Create, close, and view results of citizen polls.',
        create: 'Create New Poll',
        refresh: 'Refresh',
        searchPlaceholder: 'Search question...',
        activeSection: 'Active Polls',
        closedSection: 'Closed Polls',
        totalVotes: 'Total Votes',
        options: 'Options',
        endsOn: 'Ends On',
        created: 'Created',
        noEndDate: 'Indefinite',
        close: 'Close',
        reopen: 'Reopen',
        delete: 'Delete',
        empty: 'No polls yet',
        emptyHint: 'Create your first poll using the "Create New Poll" button.',
        noResults: 'No polls match your search.',
        loading: 'Loading...',
        closed: 'Closed',
        active: 'Active',
        deleteTitle: 'Delete Poll?',
        deleteWarning: 'This action cannot be undone. All votes will also be removed.',
        cancel: 'Cancel',
      }

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div className="space-y-4">
        <div>
          <div className="h-6 w-64 skeleton-card" />
          <div className="h-3 w-96 mt-2 skeleton-card" />
        </div>
        <div className="h-10 skeleton-card" />
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-40 skeleton-card" />
          ))}
        </div>
      </div>
    )
  }

  // ── Error state ──
  if (error) {
    return (
      <Card className="border-dashed border-destructive/40">
        <CardContent className="p-8 text-center text-sm text-destructive flex items-center justify-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </CardContent>
      </Card>
    )
  }

  const renderPollCard = (poll: PollDTO) => {
    const total = poll.totalVotes
    return (
      <Card key={poll.id} className="border-border/70 card-hover-lift">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <Badge
                  variant="outline"
                  className={`text-[10px] gap-1 ${
                    poll.status === 'active'
                      ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/40 dark:text-green-200 dark:border-green-700'
                      : 'bg-muted text-muted-foreground border-border'
                  }`}
                >
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
                  {poll.status === 'active' ? t.active : t.closed}
                </Badge>
                <Badge variant="outline" className="text-[10px] gap-1">
                  <Vote className="h-3 w-3" />
                  {total} {isHi ? 'वोट' : 'votes'}
                </Badge>
                {poll.endDate && (
                  <Badge variant="outline" className="text-[10px] gap-1">
                    <CalendarClock className="h-3 w-3" />
                    {t.endsOn}: {formatDate(poll.endDate, locale as Locale)}
                  </Badge>
                )}
              </div>
              <CardTitle className="text-sm leading-snug">
                {isHi ? poll.questionHi : poll.questionEn}
                <span className="text-muted-foreground/70 font-normal block text-xs mt-0.5">
                  {isHi ? poll.questionEn : poll.questionHi}
                </span>
              </CardTitle>
              {(poll.descriptionHi || poll.descriptionEn) && (
                <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                  {isHi ? poll.descriptionHi : poll.descriptionEn}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleToggleStatus(poll)}
                disabled={pendingActionId === poll.id}
                className="gap-1.5 text-xs"
              >
                {pendingActionId === poll.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : poll.status === 'active' ? (
                  <X className="h-3.5 w-3.5" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                )}
                {poll.status === 'active' ? t.close : t.reopen}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setDeleteId(poll.id)}
                disabled={pendingActionId === poll.id}
                className="gap-1.5 text-xs text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t.delete}</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Vote distribution bars */}
          <div className="space-y-2">
            {poll.options.map((opt, idx) => {
              const pct = total === 0 ? 0 : (opt.votes / total) * 100
              const barColor = BAR_PALETTE[idx % BAR_PALETTE.length]
              return (
                <div key={opt.id} className="space-y-1">
                  <div className="flex items-baseline justify-between gap-2 text-xs">
                    <span className="text-foreground/90 truncate">
                      {isHi ? opt.textHi : opt.textEn}
                      <span className="text-muted-foreground/60 ml-1">
                        / {isHi ? opt.textEn : opt.textHi}
                      </span>
                    </span>
                    <span className="text-muted-foreground tabular-nums-strong whitespace-nowrap">
                      <span className="font-medium text-foreground">
                        {opt.votes}
                      </span>
                      {' '}
                      ({pct.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className={`h-full ${barColor} rounded-full transition-all duration-500 ease-out`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-3 text-[10px] text-muted-foreground flex items-center gap-1.5">
            <CalendarClock className="h-3 w-3" />
            {t.created}: {formatDateTime(poll.createdAt, locale as Locale)}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-5">
      {/* Heading */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold section-heading">
            {isHi ? 'सर्वेक्षण' : 'Polls'}
            <span className="text-muted-foreground/60 font-normal">
              {' / '}
              {isHi ? 'Polls' : 'सर्वेक्षण'}
            </span>
          </h2>
          <p className="text-xs text-muted-foreground mt-2">{t.subheading}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={load}>
            <RefreshCw className="h-3.5 w-3.5" />
            {t.refresh}
          </Button>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-1.5">
                <Plus className="h-4 w-4" />
                {t.create}
              </Button>
            </DialogTrigger>
            <CreatePollDialog
              locale={locale as Locale}
              onClose={() => setCreateOpen(false)}
              onCreated={() => {
                setCreateOpen(false)
                load()
              }}
            />
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="pl-8 text-xs h-9"
        />
      </div>

      {/* Empty state */}
      {polls && polls.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-16 flex flex-col items-center justify-center gap-3 text-center">
            <div className="h-16 w-16 rounded-full bg-muted/60 grid place-items-center">
              <Vote className="h-8 w-8 text-muted-foreground/60" />
            </div>
            <div>
              <p className="text-base font-medium text-foreground">{t.empty}</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                {t.emptyHint}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtered-out state */}
      {polls && polls.length > 0 && filtered.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-10 flex flex-col items-center justify-center gap-2 text-center">
            <BarChart3 className="h-6 w-6 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">{t.noResults}</p>
          </CardContent>
        </Card>
      )}

      {/* Active polls */}
      {activePolls.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
            {t.activeSection}
            <Badge variant="outline" className="text-[10px]">
              {activePolls.length}
            </Badge>
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {activePolls.map(renderPollCard)}
          </div>
        </div>
      )}

      {/* Closed polls */}
      {closedPolls.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-muted-foreground/40" />
            {t.closedSection}
            <Badge variant="outline" className="text-[10px]">
              {closedPolls.length}
            </Badge>
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 opacity-90">
            {closedPolls.map(renderPollCard)}
          </div>
        </div>
      )}

      {/* Delete confirm */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-base">
              <Trash2 className="h-4 w-4 text-destructive" />
              {t.deleteTitle}
            </AlertDialogTitle>
            <AlertDialogDescription>{t.deleteWarning}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Create Poll Dialog
// ────────────────────────────────────────────────────────────────────────────
function CreatePollDialog({
  locale,
  onClose,
  onCreated,
}: {
  locale: Locale
  onClose: () => void
  onCreated: () => void
}) {
  const isHi = locale === 'hi'
  const [questionHi, setQuestionHi] = useState('')
  const [questionEn, setQuestionEn] = useState('')
  const [descriptionHi, setDescriptionHi] = useState('')
  const [descriptionEn, setDescriptionEn] = useState('')
  const [endDate, setEndDate] = useState('')
  const [options, setOptions] = useState<CreateOptionRow[]>([
    { textHi: '', textEn: '' },
    { textHi: '', textEn: '' },
  ])
  const [saving, setSaving] = useState(false)

  const t = isHi
    ? {
        title: 'नया सर्वेक्षण',
        questionHi: 'प्रश्न (हिंदी)',
        questionEn: 'प्रश्न (अंग्रेज़ी)',
        descHi: 'विवरण (हिंदी, वैकल्पिक)',
        descEn: 'विवरण (अंग्रेज़ी, वैकल्पिक)',
        endDate: 'समाप्ति तिथि (वैकल्पिक)',
        optionsTitle: 'विकल्प',
        optHi: 'विकल्प पाठ (हिंदी)',
        optEn: 'विकल्प पाठ (अंग्रेज़ी)',
        addOption: 'विकल्प जोड़ें',
        removeOption: 'हटाएँ',
        create: 'बनाएँ',
        cancel: 'रद्द करें',
        errQuestion: 'दोनों प्रश्न आवश्यक हैं',
        errOptions: 'कम-से-कम 2 विकल्प (दोनों भाषाओं में) आवश्यक हैं',
        errMaxOptions: 'अधिकतम 6 विकल्प अनुमत हैं',
        created: 'सर्वेक्षण बनाया गया',
        failed: 'निर्माण विफल',
        optionIdx: 'विकल्प',
      }
    : {
        title: 'New Poll',
        questionHi: 'Question (Hindi)',
        questionEn: 'Question (English)',
        descHi: 'Description (Hindi, optional)',
        descEn: 'Description (English, optional)',
        endDate: 'End Date (optional)',
        optionsTitle: 'Options',
        optHi: 'Option text (Hindi)',
        optEn: 'Option text (English)',
        addOption: 'Add Option',
        removeOption: 'Remove',
        create: 'Create',
        cancel: 'Cancel',
        errQuestion: 'Both questions are required',
        errOptions: 'At least 2 options (in both languages) are required',
        errMaxOptions: 'Maximum 6 options allowed',
        created: 'Poll created',
        failed: 'Create failed',
        optionIdx: 'Option',
      }

  const addOption = () => {
    if (options.length >= 6) {
      toast.error(t.errMaxOptions)
      return
    }
    setOptions([...options, { textHi: '', textEn: '' }])
  }

  const removeOption = (idx: number) => {
    if (options.length <= 2) return
    setOptions(options.filter((_, i) => i !== idx))
  }

  const updateOption = (idx: number, field: 'textHi' | 'textEn', value: string) => {
    setOptions(
      options.map((o, i) => (i === idx ? { ...o, [field]: value } : o)),
    )
  }

  const submit = async () => {
    if (!questionHi.trim() || !questionEn.trim()) {
      toast.error(t.errQuestion)
      return
    }
    const validOptions = options.filter(
      (o) => o.textHi.trim() && o.textEn.trim(),
    )
    if (validOptions.length < 2) {
      toast.error(t.errOptions)
      return
    }
    if (validOptions.length > 6) {
      toast.error(t.errMaxOptions)
      return
    }
    setSaving(true)
    try {
      const r = await fetch('/api/polls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionHi: questionHi.trim(),
          questionEn: questionEn.trim(),
          descriptionHi: descriptionHi.trim() || undefined,
          descriptionEn: descriptionEn.trim() || undefined,
          endDate: endDate ? new Date(endDate).toISOString() : undefined,
          options: validOptions.map((o) => ({
            textHi: o.textHi.trim(),
            textEn: o.textEn.trim(),
          })),
        }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'create_failed')
      toast.success(t.created)
      // Reset form for next time
      setQuestionHi('')
      setQuestionEn('')
      setDescriptionHi('')
      setDescriptionEn('')
      setEndDate('')
      setOptions([
        { textHi: '', textEn: '' },
        { textHi: '', textEn: '' },
      ])
      onCreated()
    } catch (e) {
      toast.error(t.failed, { description: (e as Error).message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto custom-scroll">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-base">
          <Vote className="h-4 w-4 text-primary" />
          {t.title}
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">{t.questionHi}</Label>
            <Textarea
              value={questionHi}
              onChange={(e) => setQuestionHi(e.target.value)}
              className="text-sm min-h-[60px]"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">{t.questionEn}</Label>
            <Textarea
              value={questionEn}
              onChange={(e) => setQuestionEn(e.target.value)}
              className="text-sm min-h-[60px]"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">{t.descHi}</Label>
            <Textarea
              value={descriptionHi}
              onChange={(e) => setDescriptionHi(e.target.value)}
              className="text-sm min-h-[50px]"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">{t.descEn}</Label>
            <Textarea
              value={descriptionEn}
              onChange={(e) => setDescriptionEn(e.target.value)}
              className="text-sm min-h-[50px]"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">{t.endDate}</Label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="text-sm max-w-[200px]"
          />
        </div>
        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold uppercase tracking-wide">
              {t.optionsTitle}
              <span className="ml-1.5 text-muted-foreground normal-case font-normal">
                ({options.length}/6)
              </span>
            </Label>
            <Button
              size="sm"
              variant="outline"
              onClick={addOption}
              disabled={options.length >= 6}
              className="text-xs h-7 gap-1"
            >
              <Plus className="h-3 w-3" />
              {t.addOption}
            </Button>
          </div>
          <div className="space-y-2">
            {options.map((opt, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 items-start p-2 rounded-md border bg-secondary/30"
              >
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">
                    {t.optionIdx} {idx + 1} — {t.optHi}
                  </Label>
                  <Input
                    value={opt.textHi}
                    onChange={(e) => updateOption(idx, 'textHi', e.target.value)}
                    className="text-xs h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">
                    {t.optEn}
                  </Label>
                  <Input
                    value={opt.textEn}
                    onChange={(e) => updateOption(idx, 'textEn', e.target.value)}
                    className="text-xs h-8"
                  />
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => removeOption(idx)}
                  disabled={options.length <= 2}
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 mt-[18px]"
                  aria-label={t.removeOption}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          {t.cancel}
        </Button>
        <Button onClick={submit} disabled={saving} className="gap-1.5">
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          {t.create}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
