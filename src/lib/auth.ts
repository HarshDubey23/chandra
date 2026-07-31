// Auth for Gram Panchayat Chandra admin panel
// §6.1 RBAC — admin (Pradhan) | secretary | viewer
// Production-grade: scrypt password hashing (Node built-in, OWASP-recommended)
// with per-user random salt + HMAC-signed session tokens.
// Backward-compatible: verifies legacy SHA-256 hashes so existing logins
// keep working until re-hash on next successful login.

import crypto from 'node:crypto'
import { db } from '@/lib/db'

export interface SessionUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'secretary' | 'viewer'
}

const SESSION_SECRET = process.env.SESSION_SECRET!
if (!SESSION_SECRET || SESSION_SECRET.length < 16) {
  // In production this must be set. We allow fallback ONLY to avoid hard crash
  // during cold starts without env, but log a loud warning.
  if (process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET environment variable must be set (>= 16 chars) in production')
  }
  console.warn('⚠️  SESSION_SECRET not set — using insecure dev fallback. Set SESSION_SECRET env var for production.')
}
const SECRET = SESSION_SECRET || 'gpchandra-dev-fallback-secret-please-change'
const COOKIE_NAME = 'gpchandra_session'

// ── scrypt password hashing (per-user salt) ──────────────────────────────
// OWASP-recommended. N=16384, r=8, p=1 (Node defaults), keylen=64.
const SCRYPT_KEYLEN = 64
const LEGACY_SALT = 'gpchandra-salt-v1'

function hashScrypt(password: string, salt: string): string {
  const hash = crypto.scryptSync(password, salt, SCRYPT_KEYLEN)
  return hash.toString('hex')
}

/** Hash a password using scrypt with a random per-user salt. */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = hashScrypt(password, salt)
  return `scrypt$${salt}$${hash}`
}

/**
 * Verify a password against a stored hash.
 * Supports both new scrypt format (`scrypt$salt$hash`) and legacy
 * SHA-256 format (`sha256...`/raw hex) for backward compatibility.
 * Returns true on match.
 */
export function verifyPassword(password: string, stored: string): boolean {
  if (stored.startsWith('scrypt$')) {
    const parts = stored.split('$')
    if (parts.length !== 3) return false
    const [, salt, hash] = parts
    const computed = hashScrypt(password, salt)
    // constant-time compare
    return computed.length === hash.length && crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(hash))
  }
  // Legacy SHA-256 + static salt (deprecated, kept only for migration)
  const legacy = crypto.createHash('sha256').update(LEGACY_SALT + ':' + password).digest('hex')
  if (legacy.length === stored.length) {
    try {
      return crypto.timingSafeEqual(Buffer.from(legacy), Buffer.from(stored))
    } catch {
      return false
    }
  }
  return false
}

/** Detect legacy hash so caller can re-hash on successful login. */
export function isLegacyHash(stored: string): boolean {
  return !stored.startsWith('scrypt$')
}

// ── Session tokens (HMAC-signed) ─────────────────────────────────────────
export function createSessionToken(user: SessionUser): string {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
  }
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = crypto.createHmac('sha256', SECRET).update(body).digest('base64url')
  return `${body}.${sig}`
}

export function verifySessionToken(token: string | undefined | null): SessionUser | null {
  if (!token) return null
  const [body, sig] = token.split('.')
  if (!body || !sig) return null
  const expected = crypto.createHmac('sha256', SECRET).update(body).digest('base64url')
  if (sig.length !== expected.length) return null
  let diff = 0
  for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i)
  if (diff !== 0) return null
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString())
    if (payload.exp && Date.now() > payload.exp) return null
    return {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    }
  } catch {
    return null
  }
}

export { COOKIE_NAME }

/** Authenticate by email + password, returns session token or null. */
export async function authenticate(email: string, password: string): Promise<string | null> {
  const user = await db.user.findUnique({ where: { email } })
  if (!user) return null
  if (!verifyPassword(password, user.passwordHash)) return null
  // Upgrade legacy SHA-256 hash to scrypt on successful login
  if (isLegacyHash(user.passwordHash)) {
    try {
      await db.user.update({ where: { id: user.id }, data: { passwordHash: hashPassword(password) } })
    } catch {
      // non-fatal — login still succeeds
    }
  }
  return createSessionToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as 'admin' | 'secretary' | 'viewer',
  })
}

/** Get current user from a request's cookies (server-side). */
export async function getSessionUser(cookieHeader: string | null): Promise<SessionUser | null> {
  if (!cookieHeader) return null
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const [k, ...v] = c.trim().split('=')
      return [k, v.join('=')]
    })
  )
  return verifySessionToken(cookies[COOKIE_NAME])
}

// ── RBAC helpers (master doc §5.3) ──────────────────────────────────────
// Role hierarchy: admin > secretary > viewer
// - admin: full access (all mutations)
// - secretary: content edits (posts, images, announcements, complaints status)
// - viewer: read-only (no mutations)
const ROLE_LEVELS: Record<string, number> = { viewer: 0, secretary: 1, admin: 2 }

/** Check if a user has at least the required role level. */
export function hasRole(user: SessionUser | null, required: 'viewer' | 'secretary' | 'admin'): boolean {
  if (!user) return false
  return (ROLE_LEVELS[user.role] ?? 0) >= (ROLE_LEVELS[required] ?? 0)
}

/** Require authentication + role; returns user or null. Use in API routes:
 *  const user = requireRole(req, 'secretary'); if (!user) return 401/403 */
export async function requireRole(
  cookieHeader: string | null,
  required: 'viewer' | 'secretary' | 'admin'
): Promise<SessionUser | null> {
  const user = await getSessionUser(cookieHeader)
  if (!user) return null
  if (!hasRole(user, required)) return null
  return user
}

