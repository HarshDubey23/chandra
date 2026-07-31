// Client-side UI store — manages current view (public portal / complaints / admin / dashboard)
// since the project constraint mandates a single / route.
import { create } from 'zustand'

export type View = 'home' | 'complaints' | 'admin' | 'dashboard'

interface UIState {
  view: View
  setView: (v: View) => void
  // scroll target within the home view
  scrollTarget: string | null
  setScrollTarget: (s: string | null) => void
}

export const useUI = create<UIState>((set) => ({
  view: 'home',
  setView: (v) => {
    set({ view: v })
    // scroll to top on view change
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  },
  scrollTarget: null,
  setScrollTarget: (s) => set({ scrollTarget: s }),
}))
