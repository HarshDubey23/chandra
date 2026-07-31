'use client'
// Announcements manager — list with delete + new-announcement dialog.
// Includes client-side search by title + status filter (all/pinned/active/expired).
import { useEffect, useState, useCallback, useMemo } from 'react'
import { useI18n } from '@/lib/i18n'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Bell, Inbox, Loader2, Pin, Plus, Search, Trash2 } from 'lucide-react'
import { formatDateTime } from './lib'
import type { Locale } from '@/lib/i18n'

interface Announcement {
  id: string
  titleHi: string
  titleEn: string
  bodyHi: string
  bodyEn: string
  pinned: boolean
  expiresAt: string | null
  createdAt: string
}

type FilterStatus = 'all' | 'pinned' | 'active' | 'expired'

const isExpired = (a: Announcement): boolean =>
  !!a.expiresAt && new Date(a.expiresAt).getTime() < Date.now()

export function AnnouncementsManager() {
  const { locale } = useI18n()
  const [items, setItems] = useState<Announcement[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  // ── Client-side search & filter ──
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')

  // ── Derived filtered list (client-side) ──
  const filteredItems = useMemo(() => {
    if (!items) return []
    const q = searchQuery.trim().toLowerCase()
    return items.filter((a) => {
      if (q) {
        const hay = `${a.titleHi} ${a.titleEn} ${a.bodyHi} ${a.bodyEn}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (filterStatus === 'pinned') {
        if (!a.pinned) return false
      } else if (filterStatus === 'active') {
        if (isExpired(a)) return false
      } else if (filterStatus === 'expired') {
        if (!isExpired(a)) return false
      }
      return true
    })
  }, [items, searchQuery, filterStatus])

  const totalCount = items?.length ?? 0
  const visibleCount = filteredItems.length

  const load = useCallback(() => {
    fetch('/api/announcements')
      .then(r => r.json())
      .then(d => setItems(d.announcements || []))
      .catch(() => { setItems([]); toast.error(locale === 'hi' ? 'घोषणाएँ लोड विफल' : 'Announcements load failed') })
      .finally(() => setLoading(false))
  }, [locale])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id: string) => {
    try {
      const r = await fetch(`/api/announcements?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'delete_failed')
      toast.success(locale === 'hi' ? 'घोषणा हटाई गई' : 'Announcement deleted')
      setDeleteId(null)
      load()
    } catch (e) {
      toast.error(locale === 'hi' ? 'हटाना विफल' : 'Delete failed', { description: (e as Error).message })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold section-heading">
            {locale === 'hi' ? 'घोषणाएँ' : 'Announcements'}
          </h2>
          <p className="text-xs text-muted-foreground mt-2">
            {locale === 'hi' ? 'सार्वजनिक घोषणाएँ प्रबंधित करें।' : 'Manage public announcements.'}
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5"><Plus className="h-4 w-4" />{locale === 'hi' ? 'नई घोषणा' : 'New Announcement'}</Button>
          </DialogTrigger>
          <CreateDialog
            locale={locale}
            onClose={() => setCreateOpen(false)}
            onCreated={() => { setCreateOpen(false); load() }}
          />
        </Dialog>
      </div>

      {/* ── Search & filter bar ── */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-center">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={locale === 'hi' ? 'शीर्षक खोजें...' : 'Search title...'}
            className="pl-8 text-xs h-9"
            aria-label={locale === 'hi' ? 'खोज' : 'Search'}
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as FilterStatus)}>
            <SelectTrigger className="text-xs h-9 w-[160px]">
              <SelectValue placeholder={locale === 'hi' ? 'फ़िल्टर' : 'Filter'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">{locale === 'hi' ? 'सभी' : 'All'}</SelectItem>
              <SelectItem value="pinned" className="text-xs">{locale === 'hi' ? 'पिन किए गए' : 'Pinned'}</SelectItem>
              <SelectItem value="active" className="text-xs">{locale === 'hi' ? 'सक्रिय' : 'Active'}</SelectItem>
              <SelectItem value="expired" className="text-xs">{locale === 'hi' ? 'समाप्त' : 'Expired'}</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="outline" className="text-[10px] gap-1 whitespace-nowrap h-9 px-2.5 inline-flex items-center">
            {locale === 'hi'
              ? `${visibleCount} में से ${totalCount} दिखाई दे रहे हैं`
              : `Showing ${visibleCount} of ${totalCount}`}
          </Badge>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 rounded" />)}
            </div>
          ) : !items || items.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
              <Inbox className="h-6 w-6 opacity-50" />
              {locale === 'hi' ? 'अभी तक कोई घोषणा नहीं।' : 'No announcements yet.'}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
              <Search className="h-6 w-6 opacity-50" />
              {locale === 'hi' ? 'कोई परिणाम नहीं।' : 'No results found.'}
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setSearchQuery(''); setFilterStatus('all') }}
                className="mt-1 h-8 text-xs gap-1.5"
              >
                {locale === 'hi' ? 'फ़िल्टर रीसेट करें' : 'Reset filters'}
              </Button>
            </div>
          ) : (
            <div className="max-h-[60vh] overflow-y-auto custom-scroll">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">{locale === 'hi' ? 'शीर्षक' : 'Title'}</TableHead>
                    <TableHead className="text-xs">{locale === 'hi' ? 'पिन किया' : 'Pinned'}</TableHead>
                    <TableHead className="text-xs">{locale === 'hi' ? 'समाप्त' : 'Expires'}</TableHead>
                    <TableHead className="text-xs">{locale === 'hi' ? 'बनाया गया' : 'Created'}</TableHead>
                    <TableHead className="text-xs text-right">{locale === 'hi' ? 'क्रिया' : 'Action'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map(a => (
                    <TableRow key={a.id}>
                      <TableCell className="max-w-[280px]">
                        <div className="text-xs font-medium line-clamp-1">{locale === 'hi' ? a.titleHi : a.titleEn}</div>
                        <div className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{locale === 'hi' ? a.bodyHi : a.bodyEn}</div>
                      </TableCell>
                      <TableCell>
                        {a.pinned && <Badge variant="outline" className="text-[10px] gap-1 bg-accent"><Pin className="h-3 w-3" />{locale === 'hi' ? 'पिन' : 'Pinned'}</Badge>}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{formatDateTime(a.expiresAt, locale)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{formatDateTime(a.createdAt, locale)}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" className="gap-1.5 text-destructive hover:text-destructive" onClick={() => setDeleteId(a.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">{locale === 'hi' ? 'हटाएँ' : 'Delete'}</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-base">
              <Trash2 className="h-4 w-4 text-destructive" />
              {locale === 'hi' ? 'घोषणा हटाएँ?' : 'Delete Announcement?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {locale === 'hi' ? 'यह क्रिया वापस नहीं हो सकती।' : 'This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{locale === 'hi' ? 'रद्द करें' : 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {locale === 'hi' ? 'हटाएँ' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function CreateDialog({
  locale,
  onClose,
  onCreated,
}: {
  locale: Locale
  onClose: () => void
  onCreated: () => void
}) {
  const [titleHi, setTitleHi] = useState('')
  const [titleEn, setTitleEn] = useState('')
  const [bodyHi, setBodyHi] = useState('')
  const [bodyEn, setBodyEn] = useState('')
  const [pinned, setPinned] = useState(false)
  const [expiresAt, setExpiresAt] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    if (!titleHi || !titleEn || !bodyHi || !bodyEn) {
      toast.error(locale === 'hi' ? 'सभी द्विभाषी फ़ील्ड आवश्यक हैं' : 'All bilingual fields are required')
      return
    }
    setSaving(true)
    try {
      const r = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titleHi, titleEn, bodyHi, bodyEn,
          pinned,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'create_failed')
      toast.success(locale === 'hi' ? 'घोषणा बनाई गई' : 'Announcement created')
      onCreated()
    } catch (e) {
      toast.error(locale === 'hi' ? 'निर्माण विफल' : 'Create failed', { description: (e as Error).message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto custom-scroll">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-base">
          <Bell className="h-4 w-4 text-primary" />
          {locale === 'hi' ? 'नई घोषणा' : 'New Announcement'}
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">{locale === 'hi' ? 'शीर्षक (हिंदी)' : 'Title (Hindi)'}</Label>
            <Input value={titleHi} onChange={(e) => setTitleHi(e.target.value)} className="text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">{locale === 'hi' ? 'शीर्षक (अंग्रेज़ी)' : 'Title (English)'}</Label>
            <Input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} className="text-sm" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">{locale === 'hi' ? 'विवरण (हिंदी)' : 'Body (Hindi)'}</Label>
          <Textarea value={bodyHi} onChange={(e) => setBodyHi(e.target.value)} className="text-sm min-h-[80px]" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">{locale === 'hi' ? 'विवरण (अंग्रेज़ी)' : 'Body (English)'}</Label>
          <Textarea value={bodyEn} onChange={(e) => setBodyEn(e.target.value)} className="text-sm min-h-[80px]" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">{locale === 'hi' ? 'समाप्ति तिथि' : 'Expiry Date'}</Label>
            <Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className="text-sm" />
          </div>
          <div className="space-y-1.5 flex flex-col justify-end">
            <div className="flex items-center gap-2 pb-1.5">
              <Switch id="pinned" checked={pinned} onCheckedChange={setPinned} />
              <Label htmlFor="pinned" className="text-xs flex items-center gap-1"><Pin className="h-3 w-3" />{locale === 'hi' ? 'शीर्ष पर पिन करें' : 'Pin to top'}</Label>
            </div>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>{locale === 'hi' ? 'रद्द करें' : 'Cancel'}</Button>
        <Button onClick={submit} disabled={saving} className="gap-1.5">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {locale === 'hi' ? 'बनाएँ' : 'Create'}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
