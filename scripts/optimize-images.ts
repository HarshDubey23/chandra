// Batch image optimization — converts all WhatsApp JPGs to WebP format.
// Master doc §5.1. Reduces 48MB total to ~8-10MB while maintaining quality.
// Run: bun run scripts/optimize-images.ts
import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'

const SRC_DIR = '/home/z/my-project/public/whatsapp'
const OPT_DIR = '/home/z/my-project/public/whatsapp-optimized'
const QUALITY = 78

async function main() {
  console.log('🖼️  Optimizing WhatsApp images (JPG → WebP)...')
  if (!fs.existsSync(SRC_DIR)) {
    console.error('Source directory not found:', SRC_DIR)
    process.exit(1)
  }
  fs.mkdirSync(OPT_DIR, { recursive: true })

  const files = fs.readdirSync(SRC_DIR).filter(f => /^IMG-.*\.jpg$/i.test(f))
  let totalOriginal = 0
  let totalOptimized = 0
  let converted = 0

  for (const file of files) {
    const srcPath = path.join(SRC_DIR, file)
    const outName = file.replace(/\.jpg$/i, '.webp')
    const outPath = path.join(OPT_DIR, outName)

    const origStat = fs.statSync(srcPath)
    totalOriginal += origStat.size

    try {
      const info = await sharp(srcPath)
        .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toFile(outPath)
      totalOptimized += info.size
      converted++
      if (converted % 10 === 0) process.stdout.write(`  ${converted}/${files.length}\n`)
    } catch (e) {
      console.error(`  ✗ Failed: ${file} — ${e}`)
    }
  }

  const origMB = (totalOriginal / 1024 / 1024).toFixed(2)
  const optMB = (totalOptimized / 1024 / 1024).toFixed(2)
  const reduction = ((1 - totalOptimized / totalOriginal) * 100).toFixed(1)

  console.log(`\n✅ Optimization complete!`)
  console.log(`   Converted: ${converted}/${files.length} images`)
  console.log(`   Original:  ${origMB} MB`)
  console.log(`   Optimized: ${optMB} MB`)
  console.log(`   Reduction: ${reduction}% smaller`)
  console.log(`   Output:    ${OPT_DIR}`)
  console.log(`\nNote: Optimized WebP files are in /public/whatsapp-optimized/.`)
  console.log(`      To use them, update the image URLs in seed.ts or swap the directory.`)
}

main().catch(e => { console.error('FATAL', e); process.exit(1) })
