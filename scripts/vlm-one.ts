import ZAI from 'z-ai-web-dev-sdk'
import fs from 'node:fs'
const file = process.argv[2]
const buf = fs.readFileSync('/home/z/my-project/public/whatsapp/' + file)
const b64 = buf.toString('base64')
const zai = await ZAI.create()
const PROMPT = `Categorize this real photo from Indian village panchayat Chandra, UP. Respond ONLY JSON: {"category": one of ["building","road","water","school","health","event","people","document","agriculture","solar","housing","other"], "description": "10-15 words", "hero_suitable": bool, "has_people": bool, "is_outdoor": bool}`
const r = await zai.chat.completions.createVision({ messages: [{ role: 'user', content: [{ type: 'text', text: PROMPT }, { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${b64}` } }] }], thinking: { type: 'disabled' } })
console.log(file, '=>', r.choices[0]?.message?.content?.replace(/```json|```/g,'').trim())
