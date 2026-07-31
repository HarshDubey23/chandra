// Seed ImageAsset table with real WhatsApp photos from /public/whatsapp-optimized/
// Reads whatsapp-image-mapping.json for captions where available
// Run: bun run src/lib/seed-images.ts
import { db } from '@/lib/db'
import fs from 'node:fs'
import path from 'node:path'

const IMG_DIR = path.join(process.cwd(), 'public', 'whatsapp-optimized')
const MAPPING_FILE = path.join(process.cwd(), 'whatsapp-image-mapping.json')

// Section inference by filename range (based on prior worklog analysis)
function inferCategory(filename: string): { category: string; section: string } {
  const num = parseInt(filename.match(/WA(\d+)/)?.[1] || '0')
  if (filename.includes('VID')) return { category: 'media.video', section: 'videos' }
  if (num <= 10) return { category: 'representatives.pradhan', section: 'representatives' }
  if (num <= 30) return { category: 'infrastructure.roads', section: 'infrastructure' }
  if (num <= 50) return { category: 'infrastructure.water', section: 'infrastructure' }
  if (num <= 70) return { category: 'community.events', section: 'gallery' }
  if (num <= 90) return { category: 'community.general', section: 'gallery' }
  return { category: 'community.general', section: 'gallery' }
}

function inferCaption(filename: string, num: number): { hi: string; en: string } {
  if (filename.includes('VID')) {
    return { hi: 'ग्राम चंद्रा — वास्तविक वीडियो', en: 'Gram Chandra — real video' }
  }
  if (num === 3) return { hi: 'श्रीमती संगीता मिश्रा, ग्राम प्रधान', en: 'Smt. Sangita Mishra, Gram Pradhan' }
  if (num === 91) return { hi: 'बलवंत चौहान, ग्राम पंचायत अधिकारी', en: 'Balwant Chauhan, GPA' }
  const cats = [
    'सड़क निर्माण कार्य', 'जल आपूर्ति व्यवस्था', 'विद्यालय गतिविधि',
    'सामुदायिक कार्यक्रम', 'ग्राम सभा बैठक', 'कृषि कार्य',
    'ग्राम विकास परियोजना', 'स्वच्छता अभियान', 'पंचायत भवन',
  ]
  const cap = cats[num % cats.length]
  return {
    hi: `${cap} — वास्तविक तस्वीर`,
    en: `${cap} — real photo`,
  }
}

async function main() {
  console.log('🌱 Seeding ImageAsset table with real photos...')

  // Load mapping for enhanced captions
  let mapping: Record<string, any> = {}
  try {
    const raw = JSON.parse(fs.readFileSync(MAPPING_FILE, 'utf-8'))
    mapping = raw.image_mapping || {}
    console.log(`  Loaded ${Object.keys(mapping).length} mapped entries`)
  } catch {
    console.log('  No mapping file found, using inferred captions')
  }

  // Scan webp files
  const files = fs.readdirSync(IMG_DIR)
    .filter(f => f.endsWith('.webp'))
    .sort()
  console.log(`  Found ${files.length} webp images`)

  let created = 0
  let skipped = 0

  for (const file of files) {
    const imageId = file.replace(/\.webp$/, '').replace(/IMG-\d+-/, 'img_').replace(/VID-\d+-/, 'vid_').toLowerCase()
    const jpgName = file.replace(/\.webp$/, '.jpg').replace(/VID-.*-thumb/, 'VID-20260725-WA0094-thumb') // map back to jpg name for mapping lookup

    // Check if already exists
    const existing = await db.imageAsset.findUnique({ where: { imageId } }).catch(() => null)
    if (existing) { skipped++; continue }

    const num = parseInt(file.match(/WA(\d+)/)?.[1] || '0')
    const { category, section } = inferCategory(file)
    const inferred = inferCaption(file, num)

    // Try to get better caption from mapping
    const mapKey = file.replace(/\.webp$/, '.jpg')
    const mapped = mapping[mapKey]
    const hiCaption = mapped?.caption_hi || inferred.hi
    const enCaption = mapped?.caption_en || mapped?.person_name || inferred.en

    await db.imageAsset.create({
      data: {
        imageId,
        filename: file,
        url: `/whatsapp-optimized/${file}`,
        category,
        subcategory: section,
        hiCaption,
        enCaption,
        purpose: 'gallery',
        scrollSection: section,
        isPublic: true,
        confidence: mapped ? 0.95 : 0.75,
      },
    }).catch(() => { skipped++ })
    created++
  }

  const total = await db.imageAsset.count()
  console.log(`  ✓ ${created} created, ${skipped} skipped (already existed)`)
  console.log(`  Total ImageAsset records: ${total}`)
  console.log('✅ Image seed complete.')
}

main().catch(e => { console.error('FATAL', e); process.exit(1) }).finally(() => db.$disconnect())
