'use client'
// Notification Bell — displays unread count badge with conic-ring,
// opens a popover dropdown showing recent notifications.
// Polls /api/admin/notifications every 30 seconds.

import { useEffect, useState, useCallback, useRef } from 'react'
import { useI18n } from '@/lib/i18n'
import { useNotificationStore } from '@/lib/notification-store'
import { Button } from '@/components/ui/button'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Bell,
  CheckCheck,
  Trash2,
  MessageSquareWarning,
  Star,
  Vote,
  Loader2,
} from 'lucide-react'

type TabKey = 'dashboard' | 'profile' | 'images' | 'complaints' | 'feedback' | 'polls' | 'marketplace' | 'announcements' | 'csv' | 'activity'

export function NotificationBell({ onNavigate }: { onNavigate: (tab: TabKey) => void }) {
  const { locale } = useI18n()
  const {
    totalUnread,
    unreadCounts,
    notifications,
    isOpen,
    setOpen,
    markAllAsRead,
    clearAll,
    resetFromApi,
    setLastVisitTimestamp,
  } = useNotificationStore()

  const [loading, setLoading] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── Polling mechanism (every 30 seconds) ────────────────────────
  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const since = useNotificationStore.getState().lastVisitTimestamp || new Date(0).toISOString()
      const r = await fetch(`/api/admin/notifications?since=${encodeURIComponent(since)}`)
      const d = await r.json()
      if (r.ok) {
        resetFromApi(d.unreadCounts, d.notifications)
      }
    } catch {
      // silent — polling will retry
    } finally {
      setLoading(false)
    }
  }, [resetFromApi])

  // Initial fetch + start polling
  useEffect(() => {
    fetchNotifications()
    pollRef.current = setInterval(fetchNotifications, 30000)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [fetchNotifications])

  // When popover opens, mark the visit timestamp
  const handleOpenChange = (open: boolean) => {
    setOpen(open)
    if (open) {
      setLastVisitTimestamp(new Date().toISOString())
    }
  }

  // Navigate to relevant tab
  const handleNotificationClick = (tab: string) => {
    setOpen(false)
    onNavigate(tab as TabKey)
  }

  const typeIcon = (type: string) => {
    switch (type) {
      case 'complaint': return <MessageSquareWarning className="h-3.5 w-3.5 text-amber-600" />
      case 'feedback': return <Star className="h-3.5 w-3.5 text-green-600" />
      case 'poll': return <Vote className="h-3.5 w-3.5 text-primary" />
      default: return <Bell className="h-3.5 w-3.5" />
    }
  }

  const typeLabel = (type: string) => {
    switch (type) {
      case 'complaint': return locale === 'hi' ? 'शिकायत' : 'Complaint'
      case 'feedback': return locale === 'hi' ? 'प्रतिक्रिया' : 'Feedback'
      case 'poll': return locale === 'hi' ? 'सर्वेक्षण' : 'Poll'
      default: return type
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = Date.now()
    const then = new Date(timestamp).getTime()
    const diff = now - then
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return locale === 'hi' ? 'अभी' : 'Just now'
    if (minutes < 60) return locale === 'hi' ? `${minutes} मिनट पहले` : `${minutes}m ago`
    if (hours < 24) return locale === 'hi' ? `${hours} घंटे पहले` : `${hours}h ago`
    return locale === 'hi' ? `${days} दिन पहले` : `${days}d ago`
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 shadow-sm border-primary/30 hover:border-primary/50 hover:bg-primary/5 transition-all relative"
          aria-label={locale === 'hi' ? 'सूचनाएँ' : 'Notifications'}
        >
          <Bell className="h-3.5 w-3.5 text-primary" />
          {totalUnread > 0 && (
            <span className="absolute -top-1 -right-1 h-4 min-w-4 rounded-full conic-ring text-[9px] font-bold text-white grid place-items-center leading-none px-0.5">
              {totalUnread > 99 ? '99+' : totalUnread}
            </span>
          )}
          {loading && (
            <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2">
              <Loader2 className="h-2 w-2 animate-spin text-muted-foreground" />
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        side="bottom"
        className="w-80 p-0 notification-dropdown-slide"
      >
        {/* Header */}
        <div className="px-4 py-3 border-b bg-secondary/30">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-1.5">
              <Bell className="h-3.5 w-3.5 text-primary" />
              {locale === 'hi' ? 'सूचनाएँ' : 'Notifications'}
            </h3>
            <div className="flex items-center gap-1">
              {totalUnread > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs gap-1 px-2 text-muted-foreground hover:text-primary"
                  onClick={markAllAsRead}
                  title={locale === 'hi' ? 'सभी पढ़ें' : 'Mark all as read'}
                >
                  <CheckCheck className="h-3 w-3" />
                  {locale === 'hi' ? 'पढ़ें' : 'Read'}
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs gap-1 px-2 text-muted-foreground hover:text-destructive"
                  onClick={clearAll}
                  title={locale === 'hi' ? 'सभी हटाएं' : 'Clear all'}
                >
                  <Trash2 className="h-3 w-3" />
                  {locale === 'hi' ? 'हटाएं' : 'Clear'}
                </Button>
              )}
            </div>
          </div>
          {/* Summary counts */}
          <div className="flex gap-3 mt-2 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <MessageSquareWarning className="h-2.5 w-2.5 text-amber-600" />
              {unreadCounts.complaints} {locale === 'hi' ? 'शिकायतें' : 'complaints'}
            </span>
            <span className="flex items-center gap-1">
              <Star className="h-2.5 w-2.5 text-green-600" />
              {unreadCounts.feedback} {locale === 'hi' ? 'प्रतिक्रियाएँ' : 'feedback'}
            </span>
            <span className="flex items-center gap-1">
              <Vote className="h-2.5 w-2.5" />
              {unreadCounts.pollVotes} {locale === 'hi' ? 'मत' : 'votes'}
            </span>
          </div>
        </div>

        <Separator />

        {/* Notification list */}
        <div className="max-h-64 overflow-y-auto custom-scroll">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              {locale === 'hi' ? 'कोई सूचना नहीं' : 'No notifications'}
            </div>
          ) : (
            notifications.map(n => (
              <button
                key={n.id}
                className="w-full text-left px-4 py-2.5 hover:bg-primary/5 transition-colors flex items-start gap-2.5 notification-item-hover-lift"
                onClick={() => handleNotificationClick(n.targetTab)}
              >
                <span className="flex-shrink-0 mt-0.5">{typeIcon(n.type)}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium">{typeLabel(n.type)}</span>
                    {!n.read && (
                      <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{n.description}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{formatTimeAgo(n.timestamp)}</p>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        {totalUnread > 0 && (
          <div className="px-4 py-2 border-t bg-secondary/20 text-center">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1 text-primary hover:text-primary"
              onClick={() => {
                markAllAsRead()
                setOpen(false)
              }}
            >
              <CheckCheck className="h-3 w-3" />
              {locale === 'hi' ? 'सभी सूचनाएँ पढ़ें' : 'Mark all as read'}
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
