// Forgot password — generates a reset token and stores it
// In production this would send an email/SMS. For dev (non-prod), returns the token.
// SECURITY (BACKEND_AUDIT.md P0): demoToken gated behind NODE_ENV !== 'production'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import crypto from 'node:crypto'
import { forgotPasswordSchema, parseBody } from '@/lib/validations'

export async function POST(req: NextRequest) {
  const parsed = await parseBody(req, forgotPasswordSchema)
  if ('error' in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status })
  }
  const { email } = parsed.data

  const user = await db.user.findUnique({ where: { email } })
  if (!user) {
    // Don't reveal whether email exists — security best practice
    return NextResponse.json({
      ok: true,
      message: 'If this email is registered, a reset link has been sent.',
    })
  }

  // Generate a secure reset token (valid for 1 hour)
  const resetToken = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  // Store the reset token in SiteSettings
  await db.siteSettings.upsert({
    where: { key: `reset_${email}` },
    update: { value: JSON.stringify({ token: resetToken, expiresAt: expiresAt.toISOString(), userId: user.id }) },
    create: { key: `reset_${email}`, value: JSON.stringify({ token: resetToken, expiresAt: expiresAt.toISOString(), userId: user.id }) },
  })

  const isDev = process.env.NODE_ENV !== 'production'

  return NextResponse.json({
    ok: true,
    message: 'Password reset link generated. Check your email.',
    // Dev/demo only — NEVER expose reset token in production responses
    ...(isDev ? { demoToken: resetToken, demoExpiry: expiresAt.toISOString() } : {}),
  })
}
