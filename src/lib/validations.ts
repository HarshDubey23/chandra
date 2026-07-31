/**
 * Zod validation schemas for API routes — DESIGN_INTELLIGENCE §7 + BACKEND_AUDIT.md
 * Enforce input validation on every public mutation endpoint.
 */
import { z } from 'zod'

/** 10-digit Indian mobile number (after stripping +91/spaces) */
export const phoneSchema = z
  .string()
  .min(1, 'phone_required')
  .transform((s) => s.replace(/\D/g, '').slice(-10))
  .refine((s) => s.length === 10, 'invalid_phone')

/** OTP — 6 digits */
export const otpSchema = z.string().regex(/^\d{6}$/, 'invalid_otp')

/** Email */
export const emailSchema = z.string().email('invalid_email').max(254)

/** Tracking ID — alphanumeric with hyphens, max 30 chars */
export const trackingIdSchema = z
  .string()
  .regex(/^[A-Za-z0-9-]+$/, 'invalid_tracking_id')
  .min(3, 'tracking_id_too_short')
  .max(30, 'tracking_id_too_long')

/** Complaint category */
export const complaintCategorySchema = z.enum([
  'water', 'road', 'school', 'housing', 'pension', 'mgnrega', 'other',
])

/** Complaint create body (legacy web form) */
export const complaintCreateSchema = z.object({
  callerName: z.string().min(2, 'name_too_short').max(100, 'name_too_long'),
  callerPhone: phoneSchema,
  callReason: z.string().min(10, 'reason_too_short').max(2000, 'reason_too_long'),
  category: complaintCategorySchema.default('other'),
  vapiCallId: z.string().max(100).optional(),
})

/** Vapi complaint registration schema (production API) */
export const vapiComplaintSchema = z.object({
  name: z.string().min(2, 'name_required').max(100, 'name_too_long'),
  phone: phoneSchema,
  village: z.string().max(200).optional().default('Chandra'),
  ward: z.number().int().min(1, 'invalid_ward').max(15, 'invalid_ward').optional(),
  category: z.string().min(2, 'category_required').max(50),
  description: z.string().min(5, 'description_required').max(2000, 'description_too_long'),
  departmentCode: z.string().min(2, 'department_required').max(30),
  priority: z.enum(['low', 'medium', 'high', 'critical', 'emergency']).default('medium'),
  location: z.string().max(300).optional(),
  landmark: z.string().max(200).optional(),
  vapiCallId: z.string().max(100).optional(),
})

/** Poll vote body */
export const pollVoteSchema = z.object({
  optionId: z.string().min(1).max(100),
})

/** Signup body */
export const signupSchema = z.object({
  email: emailSchema,
  name: z.string().min(2, 'name_too_short').max(100, 'name_too_long'),
  password: z.string().min(6, 'password_too_short').max(200, 'password_too_long'),
  phone: phoneSchema.optional(),
})

/** OTP send body */
export const otpSendSchema = z.object({
  phone: phoneSchema,
})

/** OTP verify body */
export const otpVerifySchema = z.object({
  phone: phoneSchema,
  otp: otpSchema,
})

/** Forgot password body */
export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

/** Marketplace item create body */
export const marketplaceCreateSchema = z.object({
  titleHi: z.string().min(2).max(200),
  titleEn: z.string().min(2).max(200),
  descHi: z.string().max(2000).optional(),
  descEn: z.string().max(2000).optional(),
  category: z.enum(['produce', 'livestock', 'handcraft', 'equipment', 'services', 'other']),
  price: z.number().int().min(0).max(10000000).nullable().optional(),
  priceType: z.enum(['fixed', 'negotiable', 'barter', 'free']).default('fixed'),
  quantity: z.string().max(100).optional(),
  sellerNameHi: z.string().min(2).max(100),
  sellerNameEn: z.string().min(2).max(100),
  sellerPhone: phoneSchema,
  sellerWard: z.number().int().min(1).max(15).optional(),
  imageUrl: z.string().url().max(500).optional().or(z.literal('')),
})

/** Helper: safely parse JSON body, returning {data|error} */
export async function parseBody<T>(
  req: Request,
  schema: z.ZodType<T>
): Promise<{ data: T } | { error: string; status: number }> {
  try {
    const json = await req.json()
    const result = schema.safeParse(json)
    if (!result.success) {
      const firstError = result.error.issues[0]
      return { error: firstError?.message || 'validation_error', status: 400 }
    }
    return { data: result.data }
  } catch {
    return { error: 'invalid_json', status: 400 }
  }
}
