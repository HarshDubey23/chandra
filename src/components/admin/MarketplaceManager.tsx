'use client'
// MarketplaceManager — admin component (Task 10-a)
// Bilingual HI/EN. Manage marketplace items: approve/reject, edit, delete.
// Uses /api/marketplace (GET all) + /api/marketplace/[id] (PATCH, DELETE).
import { useEffect, useMemo, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Store,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Trash2,
  Search,
  RefreshCw,
  Loader2,
  Package,
  PawPrint,
  Palette,
  Wrench,
  HandshakeIcon,
  Ellipsis,
  IndianRupee,
} from 'lucide-react'

// ── Category metadata (OUTSIDE component) ──────────────────────────────────
const CATEGORIES = [
  { key: 'all', hi: 'सभी', en: 'All' },
  { key: 'produce', hi: 'उपज', en: 'Produce', icon: Package, color: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-200 dark:border-green-700' },
  { key: 'livestock', hi: 'पशु', en: 'Livestock', icon: PawPrint, color: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-700' },
  { key: 'handcraft', hi: 'हस्तकला', en: 'Handcraft', icon: Palette, color: 'bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-900/30 dark:text-rose-200 dark:border-rose-700' },
  { key: 'equipment', hi: 'उपकरण', en: 'Equipment', icon: Wrench, color: 'bg-teal-100 text-teal-700 border-teal-300 dark:bg-teal-900/30 dark:text-teal-200 dark:border-teal-700' },
  { key: 'services', hi: 'सेवा', en: 'Services', icon: HandshakeIcon, color: 'bg-violet-100 text-violet-700 border-violet-300 dark:bg-violet-900/30 dark:text-violet-200 dark:border-violet-700' },
  { key: 'other', hi: 'अन्य', en: 'Other', icon: Ellipsis, color: 'bg-stone-100 text-stone-700 border-stone-300 dark:bg-stone-900/30 dark:text-stone-200 dark:border-stone-700' },
]

const STATUS_MAP: Record<string, { hi: string; en: string; color: string }> = {
  active: { hi: 'सक्रिय', en: 'Active', color: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-200 dark:border-green-700' },
  sold: { hi: 'बिका', en: 'Sold', color: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-700' },
  expired: { hi: 'समाप्त', en: 'Expired', color: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-200 dark:border-red-700' },
}

// ── Item type ──────────────────────────────────────────────────────────────
interface MarketplaceItem {
  id: string
  itemId: string
  titleHi: string
  titleEn: string
  descHi: string | null
  descEn: string | null
  category: string
  price: number | null
  priceType: string
  quantity: string | null
  sellerNameHi: string
  sellerNameEn: string
  sellerPhone: string
  sellerWard: number | null
  imageUrl: string | null
  isApproved: boolean
  status: string
  createdAt: string
  updatedAt: string
}

export function MarketplaceManager() {
  const { locale } = useI18n()
  const isHi = locale === 'hi'

  const [items, setItems] = useState<MarketplaceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  // Fetch all items (including unapproved) — admin-only endpoint
  const fetchItems = async () => {
    setLoading(true)
    try {
      // GET /api/marketplace only returns approved+active items.
      // For admin we need a way to get all items.
      // We'll fetch from a special admin query — but since GET only returns approved+active,
      // we need to add admin support. Let's use the existing endpoint for now and add
      // admin-specific query via URL params.
      const r = await fetch('/api/marketplace?admin=true', { cache: 'no-store' })
      if (r.status === 401) {
        toast.error(isHi ? 'अनधिकृत' : 'Unauthorized')
        setItems([])
        setLoading(false)
        return
      }
      if (!r.ok) throw new Error('fetch_failed')
      const d = await r.json()
      setItems(d.items || [])
    } catch {
      toast.error(isHi ? 'बाजार डेटा लोड विफल' : 'Failed to load marketplace data')
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [isHi])

  // ── Stats ───────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = items.length
    const pending = items.filter((i) => !i.isApproved).length
    const active = items.filter((i) => i.isApproved && i.status === 'active').length
    return { total, pending, active }
  }, [items])

  // ── Filtered list ──────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = items
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      list = list.filter((i) =>
        i.titleHi.toLowerCase().includes(q) || i.titleEn.toLowerCase().includes(q)
      )
    }
    if (statusFilter !== 'all') {
      if (statusFilter === 'pending') {
        list = list.filter((i) => !i.isApproved)
      } else {
        list = list.filter((i) => i.status === statusFilter && i.isApproved)
      }
    }
    if (categoryFilter !== 'all') {
      list = list.filter((i) => i.category === categoryFilter)
    }
    return list
  }, [items, searchQuery, statusFilter, categoryFilter])

  // ── Actions ─────────────────────────────────────────────────────────────
  const handleApprove = async (id: string) => {
    try {
      const r = await fetch(`/api/marketplace/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      })
      if (!r.ok) throw new Error('approve_failed')
      toast.success(isHi ? 'लिस्टिंग स्वीकृत' : 'Listing approved')
      fetchItems()
    } catch {
      toast.error(isHi ? 'स्वीकृति विफल' : 'Approval failed')
    }
  }

  const handleReject = async (id: string) => {
    try {
      const r = await fetch(`/api/marketplace/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject' }),
      })
      if (!r.ok) throw new Error('reject_failed')
      toast.success(isHi ? 'लिस्टिंग अस्वीकृत' : 'Listing rejected')
      fetchItems()
    } catch {
      toast.error(isHi ? 'अस्वीकृति विफल' : 'Rejection failed')
    }
  }

  const handleMarkSold = async (id: string) => {
    try {
      const r = await fetch(`/api/marketplace/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark-sold' }),
      })
      if (!r.ok) throw new Error('mark_sold_failed')
      toast.success(isHi ? 'बिका हुआ चिह्नित' : 'Marked as sold')
      fetchItems()
    } catch {
      toast.error(isHi ? 'चिह्नित करना विफल' : 'Marking failed')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const r = await fetch(`/api/marketplace/${id}`, { method: 'DELETE' })
      if (!r.ok) throw new Error('delete_failed')
      toast.success(isHi ? 'लिस्टिंग हटाई गई' : 'Listing deleted')
      fetchItems()
    } catch {
      toast.error(isHi ? 'हटाना विफल' : 'Delete failed')
    }
  }

  const getCategoryMeta = (key: string) =>
    CATEGORIES.find((c) => c.key === key) || CATEGORIES[CATEGORIES.length - 1]

  const getStatusMeta = (status: string) =>
    STATUS_MAP[status] || STATUS_MAP.expired

  // ── Stat cards data ─────────────────────────────────────────────────────
  const statCards = [
    { key: 'total', label: isHi ? 'कुल' : 'Total', value: stats.total, icon: Store, tint: 'bg-primary/10 text-primary' },
    { key: 'pending', label: isHi ? 'अनस्वीकृत' : 'Pending', value: stats.pending, icon: Clock, tint: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200' },
    { key: 'active', label: isHi ? 'सक्रिय' : 'Active', value: stats.active, icon: TrendingUp, tint: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-200' },
  ]

  // ── Loading skeleton ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-64 skeleton-card" />
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 skeleton-card" />
          ))}
        </div>
        <div className="h-72 skeleton-card" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* ── Heading ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold section-heading">
            {isHi ? 'बाजार प्रबंधन' : 'Marketplace Management'}
            <span className="text-muted-foreground/60 font-normal"> / {isHi ? 'Marketplace Management' : 'बाजार प्रबंधन'}</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            {isHi ? 'ग्राम बाजार की लिस्टिंग्स को स्वीकृत, अस्वीकृत और प्रबंधित करें' : 'Approve, reject, and manage marketplace listings'}
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={fetchItems}>
          <RefreshCw className="h-3.5 w-3.5" />
          {isHi ? 'रिफ्रेश' : 'Refresh'}
        </Button>
      </div>

      {/* ── Stat cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {statCards.map((c) => {
          const Icon = c.icon
          return (
            <Card key={c.key} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{c.label}</span>
                  <div className={`h-7 w-7 rounded-lg grid place-items-center ${c.tint}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                </div>
                <div className="text-2xl font-bold tabular-nums">{c.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* ── Filters ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isHi ? 'शीर्षक खोजें...' : 'Search by title...'}
            className="pl-8 text-xs h-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="text-xs h-9">
            <SelectValue placeholder={isHi ? 'स्थिति फ़िल्टर' : 'Status filter'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">{isHi ? 'सभी स्थिति' : 'All statuses'}</SelectItem>
            <SelectItem value="pending" className="text-xs">{isHi ? 'अनस्वीकृत' : 'Pending Approval'}</SelectItem>
            <SelectItem value="active" className="text-xs">{isHi ? 'सक्रिय' : 'Active'}</SelectItem>
            <SelectItem value="sold" className="text-xs">{isHi ? 'बिका' : 'Sold'}</SelectItem>
            <SelectItem value="expired" className="text-xs">{isHi ? 'समाप्त' : 'Expired'}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="text-xs h-9">
            <SelectValue placeholder={isHi ? 'श्रेणी फ़िल्टर' : 'Category filter'} />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.key} value={cat.key} className="text-xs">
                {isHi ? cat.hi : cat.en}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── Empty state ──────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 flex flex-col items-center justify-center gap-3 text-center">
            <div className="h-14 w-14 rounded-full bg-muted/60 grid place-items-center">
              <Store className="h-7 w-7 text-muted-foreground/60" />
            </div>
            <p className="text-sm font-medium text-foreground">
              {isHi ? 'कोई लिस्टिंग नहीं' : 'No listings found'}
            </p>
            <p className="text-xs text-muted-foreground max-w-sm">
              {isHi ? 'इस फ़िल्टर में कोई बाजार लिस्टिंग उपलब्ध नहीं।' : 'No marketplace listings match the current filter.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        /* ── Items table ──────────────────────────────────────────────────── */
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Store className="h-4 w-4 text-primary" />
              {isHi ? 'बाजार लिस्टिंग्स' : 'Marketplace Listings'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-[60vh] overflow-y-auto custom-scroll rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">{isHi ? 'आईडी' : 'ID'}</TableHead>
                    <TableHead className="text-xs">{isHi ? 'शीर्षक' : 'Title'}</TableHead>
                    <TableHead className="text-xs">{isHi ? 'श्रेणी' : 'Category'}</TableHead>
                    <TableHead className="text-xs">{isHi ? 'मूल्य' : 'Price'}</TableHead>
                    <TableHead className="text-xs">{isHi ? 'विक्रेता' : 'Seller'}</TableHead>
                    <TableHead className="text-xs">{isHi ? 'स्थिति' : 'Status'}</TableHead>
                    <TableHead className="text-xs">{isHi ? 'कार्य' : 'Actions'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((item) => {
                    const catMeta = getCategoryMeta(item.category)
                    const statusMeta = getStatusMeta(item.status)
                    const isPending = !item.isApproved
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono text-xs">{item.itemId}</TableCell>
                        <TableCell>
                          <div className="text-xs font-medium">{isHi ? item.titleHi : item.titleEn}</div>
                          <div className="text-[10px] text-muted-foreground">{isHi ? item.titleEn : item.titleHi}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-[10px] ${catMeta.color}`}>
                            {isHi ? catMeta.hi : catMeta.en}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          <div className="flex items-center gap-1">
                            <IndianRupee className="h-2.5 w-2.5 text-muted-foreground" />
                            {item.price !== null ? item.price.toLocaleString('en-IN') : '—'}
                          </div>
                          <span className="text-[9px] text-muted-foreground">{item.priceType}</span>
                        </TableCell>
                        <TableCell className="text-xs">
                          {isHi ? item.sellerNameHi : item.sellerNameEn}
                          {item.sellerWard ? (
                            <Badge variant="outline" className="text-[9px] ml-1 h-4 px-1">
                              W{item.sellerWard}
                            </Badge>
                          ) : null}
                        </TableCell>
                        <TableCell>
                          {isPending ? (
                            <Badge className="text-[10px] bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-700">
                              {isHi ? 'अनस्वीकृत' : 'Pending'}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className={`text-[10px] ${statusMeta.color}`}>
                              {isHi ? statusMeta.hi : statusMeta.en}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {isPending && (
                              <>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-7 gap-1 text-xs text-green-700 border-green-300 hover:bg-green-50 dark:text-green-200 dark:border-green-700 dark:hover:bg-green-900/30">
                                      <CheckCircle2 className="h-3 w-3" />
                                      {isHi ? 'स्वीकृत' : 'Approve'}
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>{isHi ? 'लिस्टिंग स्वीकृत करें?' : 'Approve listing?'}</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        {isHi
                                          ? `"${item.titleHi}" को स्वीकृत करें? यह बाजार में दिखेगी।`
                                          : `Approve "${item.titleEn}"? It will become visible in the marketplace.`}
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>{isHi ? 'नहीं' : 'Cancel'}</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleApprove(item.id)}>{isHi ? 'स्वीकृत करें' : 'Approve'}</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-7 gap-1 text-xs text-red-700 border-red-300 hover:bg-red-50 dark:text-red-200 dark:border-red-700 dark:hover:bg-red-900/30">
                                      <XCircle className="h-3 w-3" />
                                      {isHi ? 'अस्वीकृत' : 'Reject'}
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>{isHi ? 'लिस्टिंग अस्वीकृत करें?' : 'Reject listing?'}</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        {isHi
                                          ? `"${item.titleHi}" को अस्वीकृत करें? यह बाजार में नहीं दिखेगी।`
                                          : `Reject "${item.titleEn}"? It will not be visible in the marketplace.`}
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>{isHi ? 'नहीं' : 'Cancel'}</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleReject(item.id)}>{isHi ? 'अस्वीकृत करें' : 'Reject'}</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </>
                            )}
                            {!isPending && item.status === 'active' && (
                              <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" onClick={() => handleMarkSold(item.id)}>
                                <Badge className="h-3 w-3 text-amber-600" />
                                {isHi ? 'बिका' : 'Sold'}
                              </Button>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="h-7 gap-1 text-xs text-destructive border-destructive/30 hover:bg-destructive/10">
                                  <Trash2 className="h-3 w-3" />
                                  {isHi ? 'हटाएं' : 'Delete'}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>{isHi ? 'लिस्टिंग हटाएं?' : 'Delete listing?'}</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {isHi
                                      ? `"${item.titleHi}" को हटाएं? यह कार्य अपरिवर्तनीय है।`
                                      : `Delete "${item.titleEn}"? This action cannot be undone.`}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>{isHi ? 'नहीं' : 'Cancel'}</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(item.id)}>{isHi ? 'हटाएं' : 'Delete'}</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
