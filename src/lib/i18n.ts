// i18n store + helpers for Gram Panchayat Chandra portal
// §8 of Master Prompt v2.0 — Hindi-first bilingual (hi/en)

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Locale = 'hi' | 'en'

interface I18nState {
  locale: Locale
  hydrated: boolean
  setLocale: (l: Locale) => void
  toggle: () => void
  _hydrate: () => void
}

export const useI18n = create<I18nState>()(
  persist(
    (set, get) => ({
      locale: 'hi', // Hindi-first per §8.1
      hydrated: false,
      setLocale: (l) => set({ locale: l }),
      toggle: () => set({ locale: get().locale === 'hi' ? 'en' : 'hi' }),
      _hydrate: () => set({ hydrated: true }),
    }),
    {
      name: 'gpchandra-locale',
      onRehydrateStorage: () => (state) => {
        if (state) state._hydrate()
      },
    }
  )
)

// Server-side default locale (for SSR)
export const DEFAULT_LOCALE: Locale = 'hi'

// Helper for picking a localized string
export function t(hi: string, en: string, locale: Locale): string {
  return locale === 'hi' ? hi : en
}
