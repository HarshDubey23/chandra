'use client'
// User Management — admin can create/edit/delete users + assign roles.
// Master doc §5.3. Admin-only tab.
import { useEffect, useState, useCallback } from 'react'
import { useI18n } from '@/lib/i18n'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Users, Plus, Pencil, Trash2, Loader2, Save, X, Shield, Mail, Phone, Key, AlertCircle, Check,
} from 'lucide-react'

interface User {
  id: string
  email: string
  name: string
  role: string
  phone: string | null
  createdAt: string
  updatedAt?: string
}

const ROLES = [
  { id: 'admin', hi: 'सुपर एडमिन', en: 'SuperAdmin', color: 'bg-primary/15 text-primary border-primary/30', desc: 'पूर्ण पहुँच' },
  { id: 'secretary', hi: 'संपादक', en: 'Editor', color: 'bg-green-600/15 text-green-700 dark:text-green-400 border-green-600/30', desc: 'सामग्री संपादन' },
  { id: 'viewer', hi: 'दर्शक', en: 'Viewer', color: 'bg-muted text-muted-foreground border-border', desc: 'केवल पढ़ें' },
]

export function UserManagement() {
  const { locale } = useI18n()
  const isHi = locale === 'hi'
  const [users, setUsers] = useState<User[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  // Form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('viewer')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/admin/users')
      .then(r => r.json())
      .then(d => setUsers(d.users || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const openNew = () => {
    setEditing(null)
    setName(''); setEmail(''); setRole('viewer'); setPhone(''); setPassword('')
    setDialogOpen(true)
  }

  const openEdit = (u: User) => {
    setEditing(u)
    setName(u.name); setEmail(u.email); setRole(u.role); setPhone(u.phone || ''); setPassword('')
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) { toast.error(isHi ? 'नाम एवं ईमेल आवश्यक' : 'Name and email required'); return }
    if (!editing && password.length < 6) { toast.error(isHi ? 'पासवर्ड कम से कम 6 अक्षर' : 'Password min 6 chars'); return }
    setSaving(true)
    try {
      const body: Record<string, unknown> = { name, email, role, phone }
      if (password) body.password = password
      const url = editing ? `/api/admin/users/${editing.id}` : '/api/admin/users'
      const method = editing ? 'PATCH' : 'POST'
      const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const d = await r.json()
      if (!r.ok) throw new Error(d.message || d.error || 'save_failed')
      toast.success(editing ? (isHi ? 'उपयोगकर्ता अपडेट हुआ' : 'User updated') : (isHi ? 'उपयोगकर्ता बनाया गया' : 'User created'))
      setDialogOpen(false)
      load()
    } catch (e) {
      toast.error(isHi ? 'सहेजने में विफल' : 'Save failed', { description: (e as Error).message })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (u: User) => {
    if (!confirm(isHi ? `क्या आप "${u.name}" को हटाना चाहते हैं?` : `Delete user "${u.name}"?`)) return
    try {
      const r = await fetch(`/api/admin/users/${u.id}`, { method: 'DELETE' })
      if (!r.ok) {
        const d = await r.json()
        throw new Error(d.message || 'delete_failed')
      }
      toast.success(isHi ? 'उपयोगकर्ता हटाया गया' : 'User deleted')
      load()
    } catch (e) {
      toast.error(isHi ? 'हटाने में विफल' : 'Delete failed', { description: (e as Error).message })
    }
  }

  const roleInfo = (r: string) => ROLES.find(x => x.id === r) || ROLES[2]

  if (loading) {
    return <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold section-heading flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            {isHi ? 'उपयोगकर्ता प्रबंधन' : 'User Management'}
          </h2>
          <p className="text-xs text-muted-foreground mt-2">
            {isHi ? `${users?.length || 0} उपयोगकर्ता — भूमिकाएँ एवं अनुमतियाँ प्रबंधित करें` : `${users?.length || 0} users — manage roles and permissions`}
          </p>
        </div>
        <Button size="sm" onClick={openNew} className="gap-1.5 glow-saffron">
          <Plus className="h-3.5 w-3.5" />
          {isHi ? 'नया उपयोगकर्ता' : 'New User'}
        </Button>
      </div>

      {/* Role legend */}
      <div className="flex flex-wrap gap-2 text-[10px]">
        {ROLES.map(r => (
          <span key={r.id} className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border ${r.color}`}>
            <Shield className="h-2.5 w-2.5" />
            {isHi ? r.hi : r.en} — {isHi ? r.desc : r.desc}
          </span>
        ))}
      </div>

      {/* Users list */}
      <div className="space-y-2">
        {users?.map(u => {
          const ri = roleInfo(u.role)
          return (
            <Card key={u.id} className="card-hover-lift shadow-sm hover:shadow-md">
              <CardContent className="p-3 flex items-center gap-3 flex-wrap">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/15 to-primary/5 text-primary grid place-items-center font-bold text-sm shrink-0">
                  {u.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium truncate">{u.name}</p>
                    <Badge variant="outline" className={`text-[9px] ${ri.color}`}>
                      {isHi ? ri.hi : ri.en}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-0.5 flex-wrap">
                    <span className="inline-flex items-center gap-1"><Mail className="h-2.5 w-2.5" />{u.email}</span>
                    {u.phone && <span className="inline-flex items-center gap-1"><Phone className="h-2.5 w-2.5" />{u.phone}</span>}
                    <span>{new Date(u.createdAt).toLocaleDateString(isHi ? 'hi-IN' : 'en-IN')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(u)} title={isHi ? 'संपादित करें' : 'Edit'}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete(u)} title={isHi ? 'हटाएं' : 'Delete'}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Create/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={(o) => { if (!saving) setDialogOpen(o) }}>
        <DialogContent className="sm:max-w-[440px]" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gradient-tricolor">
              <Users className="h-4 w-4 text-primary" />
              {editing ? (isHi ? 'उपयोगकर्ता संपादित करें' : 'Edit User') : (isHi ? 'नया उपयोगकर्ता बनाएं' : 'Create New User')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">{isHi ? 'नाम *' : 'Name *'}</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="text-sm h-9" dir="auto" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{isHi ? 'ईमेल *' : 'Email *'}</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="text-sm h-9" disabled={!!editing} />
              {editing && <p className="text-[9px] text-muted-foreground">{isHi ? 'ईमेल बदला नहीं जा सकता' : 'Email cannot be changed'}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">{isHi ? 'भूमिका' : 'Role'}</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="text-sm h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ROLES.map(r => <SelectItem key={r.id} value={r.id} className="text-sm">{isHi ? r.hi : r.en} / {isHi ? r.en : r.hi}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{isHi ? 'फ़ोन' : 'Phone'}</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="text-sm h-9 font-mono" inputMode="tel" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">
                {editing ? (isHi ? 'नया पासवर्ड (रिक्त = नहीं बदलें)' : 'New Password (blank = no change)') : (isHi ? 'पासवर्ड *' : 'Password *')}
              </Label>
              <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="text-sm h-9" placeholder={editing ? '••••••' : (isHi ? 'कम से कम 6 अक्षर' : 'Min 6 chars')} />
            </div>
            {editing && (
              <div className="flex items-center gap-1.5 text-[10px] text-amber-700 dark:text-amber-400 bg-amber-500/5 p-2 rounded-lg border border-amber-400/20">
                <AlertCircle className="h-3 w-3 shrink-0" />
                {isHi ? 'आप अपनी एडमिन भूमिका नहीं हटा सकते या खाता नहीं हटा सकते' : 'You cannot remove your own admin role or delete your own account'}
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)} disabled={saving}>
              <X className="h-3.5 w-3.5" /> {isHi ? 'रद्द' : 'Cancel'}
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5 glow-saffron">
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {isHi ? 'सहेजें' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
