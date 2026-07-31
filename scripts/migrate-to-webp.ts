// Migrate image URLs from /whatsapp/*.jpg to /whatsapp-optimized/*.webp
// Run: bun run scripts/migrate-to-webp.ts
import { db } from '@/lib/db'

async function main() {
  console.log('🔄 Migrating image URLs to optimized WebP...')
  const images = await db.imageAsset.findMany({ where: { url: { startsWith: '/whatsapp/IMG-' } } })
  console.log(`  Found ${images.length} images to migrate`)

  let updated = 0
  for (const img of images) {
    // /whatsapp/IMG-20260725-WA0003.jpg → /whatsapp-optimized/IMG-20260725-WA0003.webp
    const newUrl = img.url
      .replace('/whatsapp/', '/whatsapp-optimized/')
      .replace(/\.jpg$/i, '.webp')
    await db.imageAsset.update({ where: { id: img.id }, data: { url: newUrl } })
    updated++
  }
  console.log(`✅ Migrated ${updated} image URLs to WebP`)
}

main().catch(e => { console.error('FATAL', e); process.exit(1) })
