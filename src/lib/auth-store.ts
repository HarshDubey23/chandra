// Client-side auth store — manages authentication state
// Handles login, signup, guest mode, OTP login, forgot password, and session persistence
import { create } from 'zustand'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'secretary' | 'viewer'
  phone?: string
}

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isGuest: boolean
  isLoading: boolean
  error: string | null
  // OTP flow state
  otpSent: boolean
  otpPhone: string | null
  otpDemoCode: string | null
  // Forgot password state
  resetToken: string | null
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, phone: string, password: string) => Promise<void>
  sendOtp: (phone: string) => Promise<void>
  verifyOtp: (phone: string, otp: string, name?: string) => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  logout: () => Promise<void>
  setGuestMode: (guest: boolean) => void
  clearError: () => void
  resetOtpState: () => void
  checkSession: () => Promise<void>
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isGuest: false,
  isLoading: false,
  error: null,
  otpSent: false,
  otpPhone: null,
  otpDemoCode: null,
  resetToken: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        const errorMsg = data.error === 'invalid_credentials'
          ? 'Invalid email or password'
          : data.error === 'rate_limited'
          ? 'Too many login attempts. Please wait 1 minute.'
          : data.error || 'Login failed'
        set({ error: errorMsg, isLoading: false })
        return
      }
      set({
        user: data.user,
        isAuthenticated: true,
        isGuest: false,
        isLoading: false,
        error: null,
      })
    } catch {
      set({ error: 'Network error. Please try again.', isLoading: false })
    }
  },

  signup: async (name: string, email: string, phone: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        const errorMsg = data.error === 'email_exists'
          ? 'This email is already registered. Please log in instead.'
          : data.error === 'password_too_short'
          ? 'Password must be at least 8 characters'
          : data.error || 'Signup failed'
        set({ error: errorMsg, isLoading: false })
        return
      }
      set({
        user: data.user,
        isAuthenticated: true,
        isGuest: false,
        isLoading: false,
        error: null,
      })
    } catch {
      set({ error: 'Network error. Please try again.', isLoading: false })
    }
  },

  sendOtp: async (phone: string) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/auth/otp-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })
      const data = await res.json()
      if (!res.ok) {
        const errorMsg = data.error === 'invalid_phone'
          ? 'Please enter a valid 10-digit phone number'
          : data.error || 'Failed to send OTP'
        set({ error: errorMsg, isLoading: false })
        return
      }
      set({
        otpSent: true,
        otpPhone: phone,
        otpDemoCode: data.demoOtp || null,
        isLoading: false,
        error: null,
      })
    } catch {
      set({ error: 'Network error. Please try again.', isLoading: false })
    }
  },

  verifyOtp: async (phone: string, otp: string, name?: string) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/auth/otp-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, name }),
      })
      const data = await res.json()
      if (!res.ok) {
        const errorMsg = data.error === 'otp_invalid'
          ? 'Invalid OTP. Please try again.'
          : data.error === 'otp_expired'
          ? 'OTP has expired. Please request a new one.'
          : data.error === 'otp_not_found'
          ? 'No OTP found. Please request a new one.'
          : data.error || 'OTP verification failed'
        set({ error: errorMsg, isLoading: false })
        return
      }
      set({
        user: data.user,
        isAuthenticated: true,
        isGuest: false,
        isLoading: false,
        error: null,
        otpSent: false,
        otpPhone: null,
        otpDemoCode: null,
      })
    } catch {
      set({ error: 'Network error. Please try again.', isLoading: false })
    }
  },

  forgotPassword: async (email: string) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        set({ error: data.error || 'Failed to process request', isLoading: false })
        return
      }
      set({
        resetToken: data.demoToken || null,
        isLoading: false,
        error: null,
      })
    } catch {
      set({ error: 'Network error. Please try again.', isLoading: false })
    }
  },

  logout: async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
    } catch {
      // ignore
    }
    set({
      user: null,
      isAuthenticated: false,
      isGuest: false,
      error: null,
      otpSent: false,
      otpPhone: null,
      otpDemoCode: null,
      resetToken: null,
    })
  },

  setGuestMode: (guest: boolean) => {
    set({ isGuest: guest, isAuthenticated: false, user: null, error: null })
  },

  clearError: () => set({ error: null }),

  resetOtpState: () => set({ otpSent: false, otpPhone: null, otpDemoCode: null, error: null }),

  checkSession: async () => {
    try {
      const res = await fetch('/api/admin/me')
      const data = await res.json()
      if (data.user) {
        set({ user: data.user, isAuthenticated: true, isGuest: false })
      }
    } catch {
      // Session invalid, stay on landing
    }
  },
}))
