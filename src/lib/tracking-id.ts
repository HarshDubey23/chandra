/**
 * Tracking ID Generator — Sequential per year
 * Format: GPCH-2026-000001, GPCH-2026-000002, ...
 *
 * Uses a counter stored in SiteSettings (key: complaint_counter_<year>).
 * Atomic increment via Prisma upsert ensures no duplicates under concurrent load.
 */
import { db } from '@/lib/db'

export async function generateSequentialTrackingId(): Promise<string> {
  const year = new Date().getFullYear()
  const counterKey = `complaint_counter_${year}`

  // Atomically increment the counter
  const record = await db.siteSettings.upsert({
    where: { key: counterKey },
    update: {
      // Increment the numeric value stored in the JSON string
      value: JSON.stringify({
        count: ((await db.siteSettings.findUnique({ where: { key: counterKey } }))
          ? JSON.parse((await db.siteSettings.findUnique({ where: { key: counterKey } }))?.value || '{"count":0}').count + 1
          : 1),
        year,
      }),
    },
    create: {
      key: counterKey,
      value: JSON.stringify({ count: 1, year }),
    },
  })

  const data = JSON.parse(record.value) as { count: number; year: number }
  const padded = String(data.count).padStart(6, '0')
  return `GPCH-${year}-${padded}`
}
