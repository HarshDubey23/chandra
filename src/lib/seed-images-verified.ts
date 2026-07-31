// Seed ImageAsset with ONLY VLM-verified images — accurate captions
// Each image was analyzed by VLM (glm-5v-turbo) and only included if clearly identifiable.
// Categories assigned based on actual visual content, NOT filename guesses.
// Run: bun run src/lib/seed-images-verified.ts
import { db } from '@/lib/db'

type VerifiedImage = {
  file: string
  imageId: string
  category: string
  hiCaption: string
  enCaption: string
}

// VLM-verified images — only those where content is clearly identified
const VERIFIED: VerifiedImage[] = [
  // ─── Representatives / Office ───
  {
    file: 'IMG-20260725-WA0003.webp', imageId: 'img_pradhan_portrait',
    category: 'representatives.pradhan',
    hiCaption: 'श्रीमती संगीता मिश्रा, ग्राम प्रधान — पीली साड़ी में',
    enCaption: 'Smt. Sangita Mishra, Gram Pradhan — in yellow sari',
  },
  {
    file: 'IMG-20260725-WA0004.webp', imageId: 'img_pradhan_office',
    category: 'representatives.office',
    hiCaption: 'प्रधान कार्यालय में — बच्चे के साथ, मानचित्र एवं कंप्यूटर दृश्य',
    enCaption: 'In Pradhan office — with child, map and computer visible',
  },
  {
    file: 'IMG-20260725-WA0007.webp', imageId: 'img_panchayat_bhawan',
    category: 'infrastructure.panchayat_bhawan',
    hiCaption: 'ग्राम पंचायत भवन — नारंगी रंग की इमारत',
    enCaption: 'Gram Panchayat Bhawan — orange-colored building',
  },

  // ─── Water / Infrastructure ───
  {
    file: 'IMG-20260725-WA0008.webp', imageId: 'img_well_construction',
    category: 'infrastructure.water.well',
    hiCaption: 'कुआं निर्माण — गोल ईंटों का कुआं बनाते हुए दो पुरुष',
    enCaption: 'Well construction — two men building a circular brick well',
  },
  {
    file: 'IMG-20260725-WA0018.webp', imageId: 'img_water_tanker_1',
    category: 'infrastructure.water.tanker',
    hiCaption: 'जल टैंकर से पानी भरते हुए ग्रामीण — प्रयागराज',
    enCaption: 'Villagers filling water from tanker truck — Prayagraj',
  },
  {
    file: 'IMG-20260725-WA0019.webp', imageId: 'img_water_tanker_2',
    category: 'infrastructure.water.tanker',
    hiCaption: 'नीले जल टैंकर के पास एकत्रित लोग',
    enCaption: 'People gathered around blue water tanker',
  },
  {
    file: 'IMG-20260725-WA0020.webp', imageId: 'img_water_tanker_3',
    category: 'infrastructure.water.tanker',
    hiCaption: 'जल टैंकर से पानी लेती महिलाएं एवं बच्चे',
    enCaption: 'Women and children collecting water from tanker',
  },
  {
    file: 'IMG-20260725-WA0027.webp', imageId: 'img_handpump',
    category: 'infrastructure.water.handpump',
    hiCaption: 'हैंडपंप एवं सफेद पानी की टंकी',
    enCaption: 'Hand pump and white water tank',
  },

  // ─── School / Education ───
  {
    file: 'IMG-20260725-WA0009.webp', imageId: 'img_mdm_meal',
    category: 'education.mid_day_meal',
    hiCaption: 'मध्यान्ह भोजन — छात्र प्लेटों में भोजन करते हुए',
    enCaption: 'Mid-day meal — students eating from metal plates',
  },
  {
    file: 'IMG-20260725-WA0011.webp', imageId: 'img_school_building',
    category: 'education.school_building',
    hiCaption: 'प्राथमिक विद्यालय भवन — चित्रों से सजी दीवारें',
    enCaption: 'Primary school building — walls decorated with murals',
  },
  {
    file: 'IMG-20260725-WA0012.webp', imageId: 'img_school_entrance',
    category: 'education.school_entrance',
    hiCaption: 'विद्यालय प्रवेश द्वार पर महिला — फलों एवं जानवरों के चित्र',
    enCaption: 'Woman at school entrance — murals of fruits and animals',
  },
  {
    file: 'IMG-20260725-WA0021.webp', imageId: 'img_classroom_teaching_1',
    category: 'education.classroom',
    hiCaption: 'कक्षा में शिक्षक ग्रीन बोर्ड पर लिखते हुए — छात्र बैठे',
    enCaption: 'Teacher writing on green chalkboard — students seated',
  },
  {
    file: 'IMG-20260725-WA0022.webp', imageId: 'img_classroom_teaching_2',
    category: 'education.classroom',
    hiCaption: 'शिक्षक बोर्ड पर लिखते हुए — चार छात्र देख रहे',
    enCaption: 'Teacher writing on board — four students watching',
  },
  {
    file: 'IMG-20260725-WA0024.webp', imageId: 'img_classroom_teaching_3',
    category: 'education.classroom',
    hiCaption: 'कक्षा — शिक्षक बोर्ड पर, छात्राएं बैठी हुई',
    enCaption: 'Classroom — teacher at board, female students seated',
  },
  {
    file: 'IMG-20260725-WA0025.webp', imageId: 'img_classroom_desk',
    category: 'education.classroom',
    hiCaption: 'शिक्षक डेस्क पर — पांच छात्र फर्श पर बैठे, वर्णमाला चार्ट',
    enCaption: 'Teacher at desk — five students on floor, alphabet chart',
  },

  // ─── Community / Events ───
  {
    file: 'IMG-20260725-WA0014.webp', imageId: 'img_garland_ceremony',
    category: 'community.ceremony',
    hiCaption: 'समारोह — लड़की को माला पहनाते हुए, बच्चे देख रहे',
    enCaption: 'Ceremony — garlanding a girl, children watching',
  },
  {
    file: 'IMG-20260725-WA0015.webp', imageId: 'img_document_signing',
    category: 'community.admin',
    hiCaption: 'दस्तावेज़ पर हस्ताक्षर — महिला टेबल पर लिख रही',
    enCaption: 'Document signing — woman writing at table',
  },
  {
    file: 'IMG-20260725-WA0016.webp', imageId: 'img_document_signing_2',
    category: 'community.admin',
    hiCaption: 'दस्तावेज़ पर हस्ताक्षर — गुलाबी साड़ी में महिला',
    enCaption: 'Document signing — woman in pink sari',
  },
  {
    file: 'IMG-20260725-WA0047.webp', imageId: 'img_children_activity',
    category: 'community.children',
    hiCaption: 'बच्चों की पंक्ति — विद्यालय में गतिविधि/नृत्य',
    enCaption: 'Children in line — school activity or dance',
  },
  {
    file: 'IMG-20260725-WA0053.webp', imageId: 'img_flag_child',
    category: 'community.independence_day',
    hiCaption: 'बच्चा भारतीय ध्वज लिए — स्वतंत्रता दिवस',
    enCaption: 'Child holding Indian flag — Independence Day',
  },
  {
    file: 'IMG-20260725-WA0057.webp', imageId: 'img_flag_hoisting',
    category: 'community.flag_hoisting',
    hiCaption: 'ध्वजारोहण — बच्चे एवं वयस्क ध्वज स्तंभ के सामने',
    enCaption: 'Flag hoisting — children and adults near flagpole',
  },

  // ─── Construction / Infrastructure ───
  {
    file: 'IMG-20260725-WA0042.webp', imageId: 'img_well_construction_2',
    category: 'infrastructure.construction.well',
    hiCaption: 'कुआं निर्माण — गोल ईंटों का गड्ढा, ग्रामीण क्षेत्र',
    enCaption: 'Well construction — circular brick pit, rural area',
  },
  {
    file: 'IMG-20260725-WA0045.webp', imageId: 'img_building_construction',
    category: 'infrastructure.construction.building',
    hiCaption: 'अधूरी लाल ईंटों की इमारत — निर्माणाधीन',
    enCaption: 'Unfinished red brick building — under construction',
  },
  {
    file: 'IMG-20260725-WA0056.webp', imageId: 'img_building_construction_2',
    category: 'infrastructure.construction.building',
    hiCaption: 'आंशिक निर्मित ईंट भवन — लकड़ी के सहारे',
    enCaption: 'Partially constructed brick building — wooden supports',
  },
  {
    file: 'IMG-20260725-WA0058.webp', imageId: 'img_water_tank_roof',
    category: 'infrastructure.water.tank',
    hiCaption: 'सफेद पानी की टंकी — भवन की छत पर',
    enCaption: 'White water tank — on building roof',
  },
  {
    file: 'IMG-20260725-WA0046.webp', imageId: 'img_streetlight',
    category: 'infrastructure.streetlight',
    hiCaption: 'स्ट्रीट लाइट — रात में चमकती हुई',
    enCaption: 'Street light — shining at night',
  },

  // ─── Village Life ───
  {
    file: 'IMG-20260725-WA0017.webp', imageId: 'img_village_gathering',
    category: 'community.gathering',
    hiCaption: 'ग्रामीण बैठे — भवन के बाहर, ईंट संरचना',
    enCaption: 'Villagers seated — outside building, brick structure',
  },
  {
    file: 'IMG-20260725-WA0023.webp', imageId: 'img_kitchen_cooking',
    category: 'community.kitchen',
    hiCaption: 'रसोई में खाना बनाती महिला — हरी साड़ी',
    enCaption: 'Woman cooking in kitchen — green sari',
  },
  {
    file: 'IMG-20260725-WA0026.webp', imageId: 'img_kitchen_2',
    category: 'community.kitchen',
    hiCaption: 'रसोई — हरी साड़ी में महिला, बोरी पर बैठी',
    enCaption: 'Kitchen — woman in green sari, seated on sack',
  },
  {
    file: 'IMG-20260725-WA0041.webp', imageId: 'img_safety_training',
    category: 'community.training',
    hiCaption: 'सुरक्षा प्रशिक्षण — पीले हेलमेट एवं नारंगी जैकेट में लोग',
    enCaption: 'Safety training — people in yellow helmets and orange vests',
  },
  {
    file: 'IMG-20260725-WA0043.webp', imageId: 'img_sprayer',
    category: 'agriculture.spraying',
    hiCaption: 'कीटनाशक छिड़काव — नीले स्प्रेयर के साथ पुरुष',
    enCaption: 'Pesticide spraying — man with blue backpack sprayer',
  },
  {
    file: 'IMG-20260725-WA0051.webp', imageId: 'img_courtyard',
    category: 'community.courtyard',
    hiCaption: 'आंगन — नीली साड़ी में महिला, अधूरी इमारत',
    enCaption: 'Courtyard — woman in blue sari, unfinished building',
  },
  {
    file: 'IMG-20260725-WA0052.webp', imageId: 'img_elder_gathering',
    category: 'community.elderly',
    hiCaption: 'वृद्ध पुरुष बैठे — लकड़ी की छड़ी, चाय कप',
    enCaption: 'Elderly man seated — with cane, tea cups',
  },
  {
    file: 'IMG-20260725-WA0055.webp', imageId: 'img_tea_gathering',
    category: 'community.gathering',
    hiCaption: 'चाय की मेज पर बैठे दो पुरुष — बाहर बैठक',
    enCaption: 'Two men at tea table — outdoor seating',
  },
  {
    file: 'IMG-20260725-WA0040.webp', imageId: 'img_dirt_road',
    category: 'infrastructure.road',
    hiCaption: 'कच्ची सड़क — नीली धातु की गेट तक',
    enCaption: 'Dirt road — leading to blue metal gate',
  },
  {
    file: 'IMG-20260725-WA0044.webp', imageId: 'img_trench',
    category: 'infrastructure.construction.trench',
    hiCaption: 'खुदी हुई खाई — सड़क के पास, साइकिल',
    enCaption: 'Dug trench — near road, bicycle parked',
  },
]

async function main() {
  console.log('🌱 Seeding VLM-verified images...')
  let created = 0
  let skipped = 0

  for (const img of VERIFIED) {
    const existing = await db.imageAsset.findUnique({ where: { imageId: img.imageId } }).catch(() => null)
    if (existing) { skipped++; continue }

    await db.imageAsset.create({
      data: {
        imageId: img.imageId,
        filename: img.file,
        url: `/whatsapp-optimized/${img.file}`,
        category: img.category,
        subcategory: img.category.split('.').pop(),
        hiCaption: img.hiCaption,
        enCaption: img.enCaption,
        purpose: 'gallery',
        scrollSection: 'gallery',
        isPublic: true,
        confidence: 0.95, // VLM-verified
      },
    }).catch(() => { skipped++ })
    created++
  }

  const total = await db.imageAsset.count()
  console.log(`  ✓ ${created} verified images created, ${skipped} skipped`)
  console.log(`  Total ImageAsset records: ${total}`)
  console.log('✅ Verified image seed complete.')
}

main().catch(e => { console.error('FATAL', e); process.exit(1) }).finally(() => db.$disconnect())
