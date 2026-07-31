// Seed polls — Gram Panchayat Chandra
// Adds 3 active citizen polls with options + sample votes
// Run: bun run src/lib/seed-polls.ts
import { db } from '@/lib/db'

async function main() {
  console.log('🌱 Seeding polls...')

  // Get admin user for createdBy
  const admin = await db.user.findUnique({ where: { email: 'pradhan@chandra-gp.in' } })
  if (!admin) {
    console.error('Admin user not found. Run seed.ts first.')
    process.exit(1)
  }

  const now = new Date()
  const in30days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  const in7days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  // Poll 1 — development priority
  const p1 = await db.poll.upsert({
    where: { id: 'poll-priority-2026' },
    update: {},
    create: {
      id: 'poll-priority-2026',
      questionHi: 'ग्राम चंद्रा के विकास के लिए अगली प्राथमिकता क्या होनी चाहिए?',
      questionEn: 'What should be the next development priority for Chandra village?',
      descriptionHi: 'ग्राम सभा के निर्णय के अनुसार, नागरिकों की राय जानी जा रही है। आपका वोट महत्वपूर्ण है।',
      descriptionEn: 'As per Gram Sabha decision, citizen opinion is being collected. Your vote matters.',
      status: 'active',
      startDate: now,
      endDate: in30days,
      createdBy: admin.id,
    },
  })

  const p1opts = await Promise.all([
    db.pollOption.create({ data: { pollId: p1.id, textHi: 'सड़क निर्माण/मरम्मत', textEn: 'Road construction/repair', order: 0 } }),
    db.pollOption.create({ data: { pollId: p1.id, textHi: 'पेय जल व्यवस्था', textEn: 'Drinking water supply', order: 1 } }),
    db.pollOption.create({ data: { pollId: p1.id, textHi: 'विद्यालय सुविधाएं', textEn: 'School facilities', order: 2 } }),
    db.pollOption.create({ data: { pollId: p1.id, textHi: 'स्वास्थ्य केंद्र', textEn: 'Health centre', order: 3 } }),
  ])

  // Poll 2 — sanitation
  const p2 = await db.poll.upsert({
    where: { id: 'poll-sanitation-2026' },
    update: {},
    create: {
      id: 'poll-sanitation-2026',
      questionHi: 'गांव में सफाई व्यवस्था कैसी है?',
      questionEn: 'How is the cleanliness system in the village?',
      descriptionHi: 'स्वच्छ भारत मिशन के तहत नागरिक प्रतिक्रिया।',
      descriptionEn: 'Citizen feedback under Swachh Bharat Mission.',
      status: 'active',
      startDate: now,
      endDate: in7days,
      createdBy: admin.id,
    },
  })

  const p2opts = await Promise.all([
    db.pollOption.create({ data: { pollId: p2.id, textHi: 'बहुत अच्छी', textEn: 'Very good', order: 0 } }),
    db.pollOption.create({ data: { pollId: p2.id, textHi: 'ठीक है', textEn: 'Okay', order: 1 } }),
    db.pollOption.create({ data: { pollId: p2.id, textHi: 'सुधार आवश्यक', textEn: 'Needs improvement', order: 2 } }),
    db.pollOption.create({ data: { pollId: p2.id, textHi: 'बहुत खराब', textEn: 'Very poor', order: 3 } }),
  ])

  // Poll 3 — gram sabha timing
  const p3 = await db.poll.upsert({
    where: { id: 'poll-gramsabha-time' },
    update: {},
    create: {
      id: 'poll-gramsabha-time',
      questionHi: 'ग्राम सभा बैठक किस समय आयोजित की जाए?',
      questionEn: 'What time should Gram Sabha meetings be held?',
      descriptionHi: 'अधिकतम नागरिकों की भागीदारी के लिए समय चयन।',
      descriptionEn: 'Time selection for maximum citizen participation.',
      status: 'active',
      startDate: now,
      endDate: in30days,
      createdBy: admin.id,
    },
  })

  const p3opts = await Promise.all([
    db.pollOption.create({ data: { pollId: p3.id, textHi: 'सुबह 10 बजे', textEn: '10 AM', order: 0 } }),
    db.pollOption.create({ data: { pollId: p3.id, textHi: 'दोपहर 2 बजे', textEn: '2 PM', order: 1 } }),
    db.pollOption.create({ data: { pollId: p3.id, textHi: 'शाम 5 बजे', textEn: '5 PM', order: 2 } }),
  ])

  // Seed sample votes (anonymized voter keys)
  const sampleVotes = [
    { pollId: p1.id, optionId: p1opts[0].id, voterKey: 'voter-seed-001' },
    { pollId: p1.id, optionId: p1opts[0].id, voterKey: 'voter-seed-002' },
    { pollId: p1.id, optionId: p1opts[1].id, voterKey: 'voter-seed-003' },
    { pollId: p1.id, optionId: p1opts[2].id, voterKey: 'voter-seed-004' },
    { pollId: p1.id, optionId: p1opts[1].id, voterKey: 'voter-seed-005' },
    { pollId: p2.id, optionId: p2opts[0].id, voterKey: 'voter-seed-006' },
    { pollId: p2.id, optionId: p2opts[1].id, voterKey: 'voter-seed-007' },
    { pollId: p2.id, optionId: p2opts[2].id, voterKey: 'voter-seed-008' },
    { pollId: p3.id, optionId: p3opts[0].id, voterKey: 'voter-seed-009' },
    { pollId: p3.id, optionId: p3opts[2].id, voterKey: 'voter-seed-010' },
    { pollId: p3.id, optionId: p3opts[2].id, voterKey: 'voter-seed-011' },
  ]

  for (const v of sampleVotes) {
    await db.pollVote.upsert({
      where: { pollId_voterKey: { pollId: v.pollId, voterKey: v.voterKey } },
      update: {},
      create: v,
    }).catch(() => {}) // ignore duplicates
  }

  console.log('  ✓ 3 polls seeded with options + sample votes')
  console.log('✅ Polls seed complete.')
}

main().catch(e => { console.error('FATAL', e); process.exit(1) }).finally(() => db.$disconnect())
