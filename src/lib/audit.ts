// Audit logger — writes to AdminActivityLog (immutable, insert-only) per §6.3
import { db } from '@/lib/db'

export interface AuditParams {
  adminId?: string
  action: 'update' | 'delete' | 'override' | 'upload' | 'login' | 'logout' | 'create' | 'send_whatsapp' | 'send_message'
  entityType: 'pradhan' | 'secretary' | 'announcement' | 'complaint' | 'scraped_data' | 'image' | 'site_config' | 'notice' | 'auth' | 'user' | 'post' | 'content_section' | 'citizen' | 'whatsapp'
  entityId?: string
  before?: unknown
  after?: unknown
  ip?: string
  userAgent?: string
}

export async function logActivity(p: AuditParams): Promise<void> {
  try {
    await db.adminActivityLog.create({
      data: {
        adminId: p.adminId || null,
        action: p.action,
        entityType: p.entityType,
        entityId: p.entityId || null,
        before: p.before != null ? JSON.stringify(p.before) : null,
        after: p.after != null ? JSON.stringify(p.after) : null,
        ip: p.ip || null,
        userAgent: p.userAgent || null,
      },
    })
  } catch (e) {
    // audit log must never break the main flow
    console.error('[audit] failed to log activity:', e)
  }
}
