// Seed ALL images from public/whatsapp-optimized/ into ImageAsset table.
// Uses VLM analysis results from /tmp/vlm_results_final.jsonl where available,
// falls back to a reasonable category based on filename ordering for the rest.
// Run: bun run src/lib/seed-all-images.ts
import { db } from '@/lib/db'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const IMG_DIR = join(process.cwd(), 'public', 'whatsapp-optimized')
const VLM_RESULTS = '/tmp/vlm_results_final.jsonl'

interface VlmResult {
  file: string
  analysis: string
}

function loadVlmResults(): Map<string, VlmResult> {
  const map = new Map<string, VlmResult>()
  if (!existsSync(VLM_RESULTS)) return map
  const lines = readFileSync(VLM_RESULTS, 'utf8').trim().split('\n')
  for (const line of lines) {
    try {
      const r = JSON.parse(line) as VlmResult
      if (r.analysis && r.analysis.trim()) {
        map.set(r.file, r)
      }
    } catch {}
  }
  return map
}

// Map VLM category to our DB category format
function mapCategory(vlmCat: string): string {
  const c = vlmCat.toLowerCase().trim()
  if (c.includes('representatives')) return 'representatives.pradhan'
  if (c.includes('office')) return 'representatives.office'
  if (c.includes('infrastructure.water') || c.includes('water') || c.includes('handpump') || c.includes('well') || c.includes('tank')) return 'infrastructure.water'
  if (c.includes('infrastructure.road') || c.includes('road')) return 'infrastructure.roads'
  if (c.includes('infrastructure.electricity') || c.includes('electric')) return 'infrastructure.electricity'
  if (c.includes('infrastructure.panchayat') || c.includes('panchayat_bhawan') || c.includes('building')) return 'infrastructure.panchayat_bhawan'
  if (c.includes('infrastructure.school') || c.includes('school') || c.includes('classroom') || c.includes('student')) return 'infrastructure.school'
  if (c.includes('infrastructure.health') || c.includes('health') || c.includes('hospital') || c.includes('medical')) return 'infrastructure.health'
  if (c.includes('infrastructure.sanitation') || c.includes('sanitation') || c.includes('toilet')) return 'infrastructure.sanitation'
  if (c.includes('agriculture') || c.includes('farm') || c.includes('crop')) return 'agriculture'
  if (c.includes('event') || c.includes('celebration') || c.includes('flag') || c.includes('independence')) return 'event.celebration'
  if (c.includes('meeting') || c.includes('gathering') || c.includes('sabha')) return 'event.meeting'
  if (c.includes('scheme') || c.includes('distribution') || c.includes('beneficiary')) return 'scheme.distribution'
  if (c.includes('document')) return 'document'
  return 'village_scene'
}

// Generate a Hindi caption from the VLM analysis
function generateCaptions(analysis: string, filename: string): { hi: string; en: string } {
  // Parse the VLM analysis: "CATEGORY|Description"
  const parts = analysis.split('|')
  if (parts.length >= 2) {
    const enDesc = parts.slice(1).join('|').trim()
    // Simple Hindi translation of common patterns
    let hiDesc = enDesc
    const translations: [RegExp, string][] = [
      [/panchayat bhawan/i, 'पंचायत भवन'],
      [/school/i, 'विद्यालय'],
      [/classroom/i, 'कक्षा'],
      [/children/i, 'बच्चे'],
      [/students/i, 'छात्र'],
      [/women/i, 'महिलाएँ'],
      [/men/i, 'पुरुष'],
      [/villagers/i, 'ग्रामीण'],
      [/water/i, 'पानी'],
      [/handpump/i, 'हैंडपंप'],
      [/well/i, 'कुआं'],
      [/road/i, 'सड़क'],
      [/building/i, 'इमारत'],
      [/office/i, 'कार्यालय'],
      [/meeting/i, 'बैठक'],
      [/gathering/i, 'सम्मेलन'],
      [/flag/i, 'ध्वज'],
      [/agriculture/i, 'कृषि'],
      [/farm/i, 'खेत'],
      [/temple/i, 'मंदिर'],
      [/child/i, 'बच्चा'],
      [/woman/i, 'महिला'],
      [/man/i, 'पुरुष'],
    ]
    for (const [re, hi] of translations) {
      hiDesc = hiDesc.replace(re, hi)
    }
    return { hi: hiDesc, en: enDesc }
  }
  // Fallback
  return { hi: `ग्राम चंद्रा — — ${filename}`, en: `Village Chandra scene — ${filename}` }
}

async function main() {
  console.log('🌱 Seeding ALL images from public/whatsapp-optimized/...')
  
  const vlmMap = loadVlmResults()
  console.log(`  VLM results loaded: ${vlmMap.size}`)
  
  const files = readdirSync(IMG_DIR).filter(f => f.endsWith('.webp')).sort()
  console.log(`  Total image files: ${files.length}`)
  
  let created = 0
  let skipped = 0
  let updated = 0
  
  for (const filename of files) {
    const filepath = `/whatsapp-optimized/${filename}`
    const imageId = `img_${filename.replace('.webp', '').replace(/-/g, '_').toLowerCase()}`
    
    // Check if already exists
    const existing = await db.imageAsset.findUnique({ where: { imageId } })
    
    const vlm = vlmMap.get(filename)
    const category = vlm ? mapCategory(vlm.analysis) : 'village_scene'
    const captions = vlm ? generateCaptions(vlm.analysis, filename) : { hi: `ग्राम चंद्रा — ${filename}`, en: `Village Chandra — ${filename}` }
    
    if (existing) {
      // Update caption if it was empty or generic
      if (vlm && (!existing.hiCaption || existing.hiCaption.startsWith('ग्राम चंद्रा —'))) {
        await db.imageAsset.update({
          where: { imageId },
          data: {
            hiCaption: captions.hi,
            enCaption: captions.en,
            category,
          },
        })
        updated++
      } else {
        skipped++
      }
    } else {
      await db.imageAsset.create({
        data: {
          imageId,
          filename,
          url: filepath,
          category,
          hiCaption: captions.hi,
          enCaption: captions.en,
          purpose: 'asset-evidence',
          confidence: vlm ? 0.9 : 0.5,
          isPublic: true,
        },
      })
      created++
    }
  }
  
  console.log(`  ✓ Created: ${created}`)
  console.log(`  ✓ Updated: ${updated}`)
  console.log(`  ✓ Skipped (already good): ${skipped}`)
  
  const total = await db.imageAsset.count()
  console.log(`✅ Total ImageAsset records: ${total}`)
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
