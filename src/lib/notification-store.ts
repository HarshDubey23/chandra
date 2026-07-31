// Notification store — Zustand store for admin notification badge & panel.
// Tracks unread counts for complaints, feedback, poll votes; stores recent
// notifications; provides markAsRead / clearAll actions.
// Uses localStorage for persistence across browser sessions.

import { create } from 'zustand'

export type NotificationType = 'complaint' | 'feedback' | 'poll'

export interface NotificationItem {
  id: string
  type: NotificationType
  title: string
  description: string
  timestamp: string
  read: boolean
  targetTab: string
}

interface NotificationState {
  lastVisitTimestamp: string | null
  unreadCounts: {
    complaints: number
    feedback: number
    pollVotes: number
  }
  notifications: NotificationItem[]
  totalUnread: number
  isOpen: boolean

  // Actions
  setLastVisitTimestamp: (ts: string) => void
  setUnreadCounts: (counts: { complaints: number; feedback: number; pollVotes: number }) => void
  setNotifications: (items: NotificationItem[]) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearAll: () => void
  setOpen: (open: boolean) => void
  resetFromApi: (counts: { complaints: number; feedback: number; pollVotes: number }, items: NotificationItem[]) => void
}

const STORAGE_KEY = 'gp-chandra-notifications'

function loadFromStorage(): Partial<NotificationState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

function saveToStorage(state: Partial<NotificationState>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      lastVisitTimestamp: state.lastVisitTimestamp,
      unreadCounts: state.unreadCounts,
      notifications: state.notifications,
    }))
  } catch {
    // ignore storage errors
  }
}

export const useNotificationStore = create<NotificationState>((set, get) => {
  const stored = loadFromStorage()

  return {
    lastVisitTimestamp: stored.lastVisitTimestamp ?? null,
    unreadCounts: stored.unreadCounts ?? { complaints: 0, feedback: 0, pollVotes: 0 },
    notifications: stored.notifications ?? [],
    totalUnread: (stored.unreadCounts?.complaints ?? 0) + (stored.unreadCounts?.feedback ?? 0) + (stored.unreadCounts?.pollVotes ?? 0),
    isOpen: false,

    setLastVisitTimestamp: (ts) => {
      set({ lastVisitTimestamp: ts })
      saveToStorage({ lastVisitTimestamp: ts, unreadCounts: get().unreadCounts, notifications: get().notifications })
    },

    setUnreadCounts: (counts) => {
      const total = counts.complaints + counts.feedback + counts.pollVotes
      set({ unreadCounts: counts, totalUnread: total })
      saveToStorage({ lastVisitTimestamp: get().lastVisitTimestamp, unreadCounts: counts, notifications: get().notifications })
    },

    setNotifications: (items) => {
      const totalUnread = get().unreadCounts.complaints + get().unreadCounts.feedback + get().unreadCounts.pollVotes
      set({ notifications: items, totalUnread })
      saveToStorage({ lastVisitTimestamp: get().lastVisitTimestamp, unreadCounts: get().unreadCounts, notifications: items })
    },

    markAsRead: (id) => {
      const notifications = get().notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      )
      set({ notifications })
      saveToStorage({ lastVisitTimestamp: get().lastVisitTimestamp, unreadCounts: get().unreadCounts, notifications })
    },

    markAllAsRead: () => {
      const notifications = get().notifications.map(n => ({ ...n, read: true }))
      const unreadCounts = { complaints: 0, feedback: 0, pollVotes: 0 }
      set({ notifications, unreadCounts, totalUnread: 0 })
      saveToStorage({ lastVisitTimestamp: get().lastVisitTimestamp, unreadCounts, notifications })
    },

    clearAll: () => {
      set({ notifications: [], unreadCounts: { complaints: 0, feedback: 0, pollVotes: 0 }, totalUnread: 0 })
      saveToStorage({ lastVisitTimestamp: get().lastVisitTimestamp, unreadCounts: { complaints: 0, feedback: 0, pollVotes: 0 }, notifications: [] })
    },

    setOpen: (open) => set({ isOpen: open }),

    resetFromApi: (counts, items) => {
      const total = counts.complaints + counts.feedback + counts.pollVotes
      set({ unreadCounts: counts, totalUnread: total, notifications: items })
      saveToStorage({ lastVisitTimestamp: get().lastVisitTimestamp, unreadCounts: counts, notifications: items })
    },
  }
})
