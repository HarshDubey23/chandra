// Theme store — manages light/dark/auto mode with localStorage persistence.
// Applies `.dark` class to <html> element to match shadcn/ui dark variant.
// 'auto' mode follows system preference via prefers-color-scheme media query.
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeMode = 'light' | 'dark' | 'auto'

type ResolvedTheme = 'light' | 'dark'

interface ThemeState {
  theme: ThemeMode
  resolved: ResolvedTheme // computed: actual applied theme (light or dark)
  setTheme: (t: ThemeMode) => void
  toggle: () => void
  setResolved: (r: ResolvedTheme) => void
}

function applyThemeClass(resolved: ResolvedTheme) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (resolved === 'dark') root.classList.add('dark')
  else root.classList.remove('dark')
  // Also set color-scheme for native form controls
  root.style.colorScheme = resolved
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function resolveTheme(mode: ThemeMode): ResolvedTheme {
  return mode === 'auto' ? getSystemTheme() : mode
}

// Singleton media query listener (only set up once in browser)
let mediaListenerActive = false

function setupSystemListener() {
  if (typeof window === 'undefined' || mediaListenerActive) return
  mediaListenerActive = true
  const mql = window.matchMedia('(prefers-color-scheme: dark)')
  mql.addEventListener('change', (e) => {
    // Read current theme from store
    const state = useTheme.getState()
    if (state.theme === 'auto') {
      const newResolved: ResolvedTheme = e.matches ? 'dark' : 'light'
      applyThemeClass(newResolved)
      state.setResolved(newResolved)
    }
  })
}

export const useTheme = create<ThemeState>()(
  persist(
    (set, get) => ({
      // DESIGN_INTELLIGENCE §7 — dark mode default (cinematic + AMOLED battery)
      theme: 'dark',
      resolved: 'dark',
      setTheme: (t) => {
        const resolved = resolveTheme(t)
        applyThemeClass(resolved)
        set({ theme: t, resolved })
        if (t === 'auto') setupSystemListener()
      },
      toggle: () => {
        // Smart toggle: light → dark → auto → light
        const current = get().theme
        const next: ThemeMode = current === 'light' ? 'dark' : current === 'dark' ? 'auto' : 'light'
        const resolved = resolveTheme(next)
        applyThemeClass(resolved)
        set({ theme: next, resolved })
        if (next === 'auto') setupSystemListener()
      },
      setResolved: (r) => set({ resolved: r }),
    }),
    {
      name: 'gpchandra-theme',
      onRehydrateStorage: () => (state) => {
        if (state) {
          const resolved = resolveTheme(state.theme)
          applyThemeClass(resolved)
          state.resolved = resolved
          if (state.theme === 'auto') setupSystemListener()
        }
      },
    }
  )
)

// Apply persisted theme on first mount (call from a client component useEffect)
export function applyInitialTheme() {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem('gpchandra-theme')
    if (raw) {
      const parsed = JSON.parse(raw) as { state?: { theme?: ThemeMode } }
      const theme = parsed?.state?.theme ?? 'light'
      const resolved = resolveTheme(theme)
      applyThemeClass(resolved)
      if (theme === 'auto') setupSystemListener()
    }
  } catch {
    // ignore
  }
}
