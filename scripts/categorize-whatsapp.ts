// Categorize a sample of WhatsApp images via VLM to map them to portal sections.
import ZAI from 'z-ai-web-dev-sdk'
import fs from 'node:fs'
import path from 'node:path'

const DIR = '/home/z/my-project/public/whatsapp'
const SAMPLE = [
  'IMG-20260725-WA0003.jpg',
  'IMG-20260725-WA0011.jpg',
  'IMG-20260725-WA0016.jpg',
  'IMG-20260725-WA0020.jpg',
  'IMG-20260725-WA0024.jpg',
  'IMG-20260725-WA0030.jpg',
  'IMG-20260725-WA0036.jpg',
  'IMG-20260725-WA0042.jpg',
  'IMG-20260725-WA0050.jpg',
  'IMG-20260725-WA0058.jpg',
  'IMG-20260725-WA0065.jpg',
  'IMG-20260725-WA0072.jpg',
  'IMG-20260725-WA0080.jpg',
  'IMG-20260725-WA0085.jpg',
  'IMG-20260725-WA0091.jpg',
]

const PROMPT = `You are categorizing real photographs from an Indian village panchayat (Gram Panchayat Chandra, Uttar Pradesh). Analyze this image and respond with ONLY a compact JSON object (no markdown, no prose) with these fields:
{"category": one of ["building","road","water","school","health","event","people","document","agriculture","solar","housing","other"], "description": "10-15 word English description", "hero_suitable": true/false, "has_people": true/false, "is_outdoor": true/false}`

async function analyzeOne(zai, file) {
  const p = path.join(DIR, file)
  if (!fs.existsSync(p)) return { file, error: 'missing' }
  const buf = fs.readFileSync(p)
  const b64 = buf.toString('base64')
  try {
    const resp = await zai.chat.completions.createVision({
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: PROMPT },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${b64}` } },
        ],
      }],
      thinking: { type: 'disabled' },
    })
    let txt = resp.choices[0]?.message?.content || ''
    txt = txt.replace(/```json|```/g, '').trim()
    let parsed
    try { parsed = JSON.parse(txt) } catch { parsed = { raw: txt } }
    return { file, ...parsed }
  } catch (e) {
    return { file, error: String(e).slice(0, 120) }
  }
}

async function main() {
  const zai = await ZAI.create()
  const results = []
  for (let i = 0; i < SAMPLE.length; i += 5) {
    const batch = SAMPLE.slice(i, i + 5)
    const out = await Promise.all(batch.map(f => analyzeOne(zai, f)))
    results.push(...out)
    process.stdout.write(`  analyzed ${Math.min(i + 5, SAMPLE.length)}/${SAMPLE.length}\n`)
  }
  console.log(JSON.stringify(results, null, 2))
}
main().catch(e => { console.error('FATAL', e); process.exit(1) })
