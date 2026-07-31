// Reset password — verifies the token from forgot-password and sets a new password
// SECURITY: token must match + not be expired. Password hashed with scrypt.
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const resetSchema = z.object({
  email: z.string().email('invalid_email'),
  token: z.string().min(10, 'invalid_token'),
  newPassword: z.string().min(6, 'password_too_short').max(200, 'password_too_long'),
})

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const parsed = resetSchema.safeParse(body)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]
    return NextResponse.json({ error: firstError?.message || 'validation_error' }, { status: 400 })
  }

  const { email, token, newPassword } = parsed.data

  // Look up the stored reset token
  const record = await db.siteSettings.findUnique({
    where: { key: `reset_${email}` },
  })

  if (!record) {
    // Don't reveal whether email exists
    return NextResponse.json({ error: 'invalid_or_expired_token' }, { status: 400 })
  }

  let tokenData: { token: string; expiresAt: string; userId: string }
  try {
    tokenData = JSON.parse(record.value)
  } catch {
    return NextResponse.json({ error: 'invalid_or_expired_token' }, { status: 400 })
  }

  // Verify token matches
  if (tokenData.token !== token) {
    return NextResponse.json({ error: 'invalid_or_expired_token' }, { status: 400 })
  }

  // Check expiry
  const expiresAt = new Date(tokenData.expiresAt)
  if (expiresAt.getTime() < Date.now()) {
    return NextResponse.json({ error: 'token_expired' }, { status: 400 })
  }

  // Update the user's password
  const passwordHash = hashPassword(newPassword)
  await db.user.update({
    where: { id: tokenData.userId },
    data: { passwordHash },
  })

  // Delete the used token so it can't be reused
  await db.siteSettings.delete({
    where: { key: `reset_${email}` },
  })

  return NextResponse.json({
    ok: true,
    message: 'Password updated successfully. You can now log in with your new password.',
  })
}
