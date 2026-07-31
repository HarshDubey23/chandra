// Forgot password — generates a reset token and stores it
// In production this would send an email/SMS. For now, we store the token
// in SiteSettings and return it (demo mode shows it to the user).
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import crypto from 'node:crypto'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { email } = body

  if (!email) {
    return NextResponse.json({ error: 'email_required' }, { status: 400 })
  }

  const user = await db.user.findUnique({ where: { email } })
  if (!user) {
    // Don't reveal whether email exists — security best practice
    // But for demo/citizen portal, we return a friendly message
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

  // In production: send email with reset link containing the token
  // For demo: return the token so the UI can display it
  return NextResponse.json({
    ok: true,
    message: 'Password reset link generated. Check your email.',
    // Demo only — remove in production:
    demoToken: resetToken,
    demoExpiry: expiresAt.toISOString(),
  })
}
