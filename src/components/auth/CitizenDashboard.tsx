'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { useI18n } from '@/lib/i18n'
import { useAuth } from '@/lib/auth-store'
import { useUI } from '@/lib/ui-store'
import { toast } from 'sonner'
import {
  User, MessageSquare, Clock, CheckCircle2, AlertCircle,
  TrendingUp, FileText, Phone, MapPin, Calendar,
  ArrowRight, Activity, Bell, Settings, LogOut, Search, Loader2, Inbox
} from 'lucide-react'

interface CitizenComplaint {
  trackingId: string
  category: string
  status: string
  callReason: string
  createdAt: string
  resolvedAt?: string
  resolutionNote?: string | null
  timeline?: string
}

export function CitizenDashboard() {
  const { locale } = useI18n()
  const { user, logout } = useAuth()
  const { setView } = useUI()
  const [complaints, setComplaints] = useState<CitizenComplaint[]>([])
  const [loading, setLoading] = useState(false)
  const [phoneInput, setPhoneInput] = useState('')
  const [searched, setSearched] = useState(false)
  const hi = locale === 'hi'

  // Try to fetch real complaints by phone. The user's stored phone (if any)
  // is hashed for DPDP, so we ask the citizen to enter their phone number
  // to look up their own complaints.
  const fetchMine = async (phone: string) => {
    setLoading(true)
    setSearched(true)
    try {
      const r = await fetch('/api/complaints/mine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data?.message || data?.error || 'fetch_failed')
      setComplaints(data.complaints || [])
    } catch (e) {
      toast.error(hi ? 'शिकायतें लाने में विफल' : 'Failed to load complaints', {
        description: (e as Error).message,
      })
      setComplaints([])
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const stats = [
    {
      icon: MessageSquare,
      labelHi: 'कुल शिकायतें',
      labelEn: 'Total Complaints',
      value: complaints.length,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      icon: CheckCircle2,
      labelHi: 'हल हुई',
      labelEn: 'Resolved',
      value: complaints.filter((c) => c.status === 'Resolved').length,
      color: 'text-green-600',
      bg: 'bg-green-600/10',
    },
    {
      icon: Clock,
      labelHi: 'लंबित',
      labelEn: 'Pending',
      value: complaints.filter((c) => c.status === 'InProgress' || c.status === 'Pending').length,
      color: 'text-amber-600',
      bg: 'bg-amber-600/10',
    },
  ]

  const statusColors: Record<string, string> = {
    Resolved: 'bg-green-600/10 text-green-700 dark:text-green-400 border-green-600/20',
    InProgress: 'bg-amber-600/10 text-amber-700 dark:text-amber-400 border-amber-600/20',
    Pending: 'bg-blue-600/10 text-blue-700 dark:text-blue-400 border-blue-600/20',
    Rejected: 'bg-red-600/10 text-red-700 dark:text-red-400 border-red-600/20',
  }

  const statusLabels: Record<string, { hi: string; en: string }> = {
    Pending: { hi: 'लंबित', en: 'Pending' },
    InProgress: { hi: 'प्रगति पर', en: 'In Progress' },
    Resolved: { hi: 'हल', en: 'Resolved' },
    Rejected: { hi: 'अस्वीकृत', en: 'Rejected' },
  }

  const categoryLabels: Record<string, { hi: string; en: string }> = {
    water: { hi: 'जल', en: 'Water' },
    road: { hi: 'सड़क', en: 'Road' },
    school: { hi: 'विद्यालय', en: 'School' },
    housing: { hi: 'आवास', en: 'Housing' },
    pension: { hi: 'पेंशन', en: 'Pension' },
    mgnrega: { hi: 'मनरेगा', en: 'MGNREGA' },
    other: { hi: 'अन्य', en: 'Other' },
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto px-4 py-8 max-w-5xl"
    >
      {/* Header with user info */}
      <Card className="mb-6 overflow-hidden border-primary/20">
        <div className="h-24 bg-gradient-to-r from-primary/20 via-accent/15 to-green-600/20 relative">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        </div>
        <CardContent className="p-6 -mt-12 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <Avatar className="h-24 w-24 ring-4 ring-background shadow-lg">
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl font-bold truncate">{user.name}</h2>
                <Badge variant="outline" className="border-primary/30 text-primary">
                  {user.role === 'admin' ? (hi ? 'प्रधान' : 'Admin') :
                   user.role === 'secretary' ? (hi ? 'सचिव' : 'Secretary') :
                   (hi ? 'नागरिक' : 'Citizen')}
                </Badge>
              </div>
              <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {user.email}
                </span>
                {user.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    +91 {user.phone}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {hi ? 'चंद्रा, शंकरगढ़' : 'Chandra, Shankargarh'}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Settings className="h-3.5 w-3.5" />
                {hi ? 'सेटिंग्स' : 'Settings'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-destructive hover:text-destructive"
                onClick={async () => await logout()}
              >
                <LogOut className="h-3.5 w-3.5" />
                {hi ? 'लॉग आउट' : 'Logout'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Phone Lookup Card */}
      <Card className="mb-6 border-primary/30 overflow-hidden">
        <CardHeader className="pb-3 border-b bg-gradient-to-r from-primary/5 to-transparent">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Search className="h-4 w-4 text-primary" />
            {hi ? 'अपनी शिकायतें खोजें' : 'Find Your Complaints'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
            {hi
              ? 'अपना मोबाइल नंबर दर्ज करें जिससे शिकायत दर्ज की गई थी। हम आपकी सभी शिकायतें और उनकी वर्तमान स्थिति दिखाएंगे।'
              : 'Enter the mobile number you used to file complaints. We\'ll show all your complaints and their current status.'}
          </p>
          <div className="flex gap-2">
            <Input
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value.replace(/[^\d]/g, '').slice(0, 10))}
              placeholder={hi ? '10-अंकीय मोबाइल नंबर' : '10-digit mobile number'}
              inputMode="numeric"
              className="font-mono"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && phoneInput.length >= 10) {
                  fetchMine(phoneInput)
                }
              }}
            />
            <Button
              onClick={() => fetchMine(phoneInput)}
              disabled={phoneInput.length < 10 || loading}
              className="gap-1.5 shrink-0"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {loading ? (hi ? 'खोज…' : 'Searching…') : (hi ? 'खोजें' : 'Search')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid — only show after search */}
      {searched && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"
        >
          {stats.map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.labelEn}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="hover:shadow-md transition-shadow border-border/60 overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-primary/40 to-primary/0" />
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-xl ${stat.bg} grid place-items-center shrink-0 ring-1 ring-border/40`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-2xl font-bold tabular-nums">{stat.value}</div>
                      <div className="text-xs text-muted-foreground">
                        {hi ? stat.labelHi : stat.labelEn}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {/* Quick Actions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            {hi ? 'त्वरित क्रियाएं / Quick Actions' : 'Quick Actions'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: MessageSquare, labelHi: 'शिकायत दर्ज करें', labelEn: 'File Complaint', action: () => setView('complaints'), color: 'bg-primary/10 text-primary' },
              { icon: FileText, labelHi: 'योजनाएं देखें', labelEn: 'View Schemes', action: () => { setView('home'); setTimeout(() => document.getElementById('schemes')?.scrollIntoView({ behavior: 'smooth' }), 100) }, color: 'bg-green-600/10 text-green-600' },
              { icon: Phone, labelHi: 'AI सहायक', labelEn: 'AI Assistant', action: () => { setView('home') }, color: 'bg-amber-600/10 text-amber-600' },
              { icon: Bell, labelHi: 'सूचनाएं', labelEn: 'Notifications', action: () => {}, color: 'bg-blue-600/10 text-blue-600' },
            ].map((action) => {
              const Icon = action.icon
              return (
                <button
                  key={action.labelEn}
                  onClick={action.action}
                  className="group flex flex-col items-center gap-2 p-4 rounded-xl border border-border/40 hover:border-primary/30 hover:bg-primary/5 transition-all"
                >
                  <div className={`h-10 w-10 rounded-lg ${action.color} grid place-items-center group-hover:scale-110 transition-transform`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium text-center">
                    {hi ? action.labelHi : action.labelEn}
                  </span>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* My Complaints — real data from /api/complaints/mine */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              {hi ? 'मेरी शिकायतें / My Complaints' : 'My Complaints'}
              {searched && !loading && complaints.length > 0 && (
                <Badge variant="secondary" className="text-[10px]">{complaints.length}</Badge>
              )}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs gap-1"
              onClick={() => setView('complaints')}
            >
              {hi ? 'सभी देखें' : 'View all'}
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!searched ? (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">
                {hi ? 'अपनी शिकायतें देखने के लिए ऊपर मोबाइल नंबर दर्ज करें' : 'Enter your mobile number above to view your complaints'}
              </p>
            </div>
          ) : loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 rounded-lg bg-muted/30 animate-pulse" />
              ))}
            </div>
          ) : complaints.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Inbox className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">
                {hi ? 'इस नंबर पर कोई शिकायत नहीं मिली' : 'No complaints found for this number'}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 gap-1.5"
                onClick={() => setView('complaints')}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                {hi ? 'नई शिकायत दर्ज करें' : 'File a new complaint'}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {complaints.map((complaint, i) => {
                const statusCfg = statusLabels[complaint.status] || { hi: complaint.status, en: complaint.status }
                const catCfg = categoryLabels[complaint.category] || { hi: complaint.category, en: complaint.category }
                return (
                  <motion.div
                    key={complaint.trackingId}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group flex items-center gap-3 p-3 rounded-lg border border-border/40 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer"
                    onClick={() => setView('complaints')}
                  >
                    <div className="h-10 w-10 rounded-lg bg-primary/10 grid place-items-center shrink-0">
                      {complaint.status === 'Resolved' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : complaint.status === 'Rejected' ? (
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-amber-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <code className="text-xs font-mono font-semibold text-primary">
                          {complaint.trackingId}
                        </code>
                        <Badge variant="outline" className={`text-[9px] h-4 px-1 ${statusColors[complaint.status] || ''}`}>
                          {hi ? statusCfg.hi : statusCfg.en}
                        </Badge>
                        <Badge variant="secondary" className="text-[9px] h-4 px-1">
                          {hi ? catCfg.hi : catCfg.en}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {complaint.callReason}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                        <Calendar className="h-2.5 w-2.5" />
                        {new Date(complaint.createdAt).toLocaleDateString('en-IN')}
                        {complaint.resolvedAt && (
                          <>
                            <span>→</span>
                            <CheckCircle2 className="h-2.5 w-2.5 text-green-600" />
                            {new Date(complaint.resolvedAt).toLocaleDateString('en-IN')}
                          </>
                        )}
                      </div>
                      {complaint.resolutionNote && complaint.status === 'Resolved' && (
                        <p className="text-[10px] text-green-700 dark:text-green-400 mt-1 truncate">
                          ✓ {complaint.resolutionNote}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </motion.div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Separator className="my-6" />

      {/* Footer info */}
      <div className="text-center text-xs text-muted-foreground">
        <p className="flex items-center justify-center gap-1.5">
          <TrendingUp className="h-3 w-3" />
          {hi
            ? 'आपकी शिकायतों का समाधान दर 85% है — ग्राम पंचायत चंद्रा'
            : 'Your complaint resolution rate is 85% — Gram Panchayat Chandra'}
        </p>
      </div>
    </motion.div>
  )
}
