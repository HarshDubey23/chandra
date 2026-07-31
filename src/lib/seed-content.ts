// Content seed script — adds marketplace items + blog posts for richer initial content.
// Run: bun run src/lib/seed-content.ts
import { db } from '@/lib/db'

async function main() {
  console.log('🌱 Seeding marketplace items + blog posts...')

  // ── Marketplace items (approved, active) ──
  const marketItems = [
    {
      titleHi: 'ताजा टमाटर', titleEn: 'Fresh Tomatoes',
      descHi: 'ग्राम चंद्रा के खेत से ताजा जैविक टमाटर', descEn: 'Fresh organic tomatoes from Chandra village fields',
      category: 'produce', price: 40, priceType: 'fixed', quantity: '10 kg',
      sellerNameHi: 'श्री रामप्रसाद', sellerNameEn: 'Shri Ramprasad', sellerPhone: '9876543210', sellerWard: 1,
      imageUrl: '/whatsapp-optimized/IMG-20260725-WA0065.webp', isApproved: true, status: 'active',
    },
    {
      titleHi: 'गेहूं आटा', titleEn: 'Wheat Flour',
      descHi: 'घर पर पिसा गया शुद्ध गेहूं आटा', descEn: 'Home-ground pure wheat flour',
      category: 'produce', price: 45, priceType: 'fixed', quantity: '5 kg',
      sellerNameHi: 'श्रीमती सरोज देवी', sellerNameEn: 'Smt. Saroj Devi', sellerPhone: '9876543211', sellerWard: 2,
      imageUrl: null, isApproved: true, status: 'active',
    },
    {
      titleHi: 'बकरी का दूध', titleEn: 'Goat Milk',
      descHi: 'ग्राम चंद्रा की देसी बकरी का ताजा दूध', descEn: 'Fresh milk from indigenous goats',
      category: 'livestock', price: 60, priceType: 'negotiable', quantity: '2 लीटर/day',
      sellerNameHi: 'श्री मोहन लाल', sellerNameEn: 'Shri Mohan Lal', sellerPhone: '9876543212', sellerWard: 3,
      imageUrl: null, isApproved: true, status: 'active',
    },
    {
      titleHi: 'मिट्टी के बर्तन', titleEn: 'Clay Pots',
      descHi: 'हस्तनिर्मित मिट्टी के बर्तन, सेट में', descEn: 'Handcrafted clay pots, set of 5',
      category: 'handcraft', price: 350, priceType: 'fixed', quantity: '1 सेट',
      sellerNameHi: 'श्री विजय कुमार', sellerNameEn: 'Shri Vijay Kumar', sellerPhone: '9876543213', sellerWard: 4,
      imageUrl: null, isApproved: true, status: 'active',
    },
    {
      titleHi: 'कृषि उपकरण किराये पर', titleEn: 'Farm Equipment Rental',
      descHi: 'ट्रैक्टर एवं कृषि उपकरण किराये पर, प्रति घंटा', descEn: 'Tractor and farm equipment rental, per hour',
      category: 'equipment', price: 300, priceType: 'negotiable', quantity: 'प्रति घंटा',
      sellerNameHi: 'श्री अरुण कुमार', sellerNameEn: 'Shri Arun Kumar', sellerPhone: '9876543214', sellerWard: 6,
      imageUrl: '/whatsapp-optimized/IMG-20260725-WA0042.webp', isApproved: true, status: 'active',
    },
    {
      titleHi: 'दर्जी सेवा', titleEn: 'Tailoring Service',
      descHi: 'ग्राम चंद्रा में दर्जी सेवा, घर पर सिलाई', descEn: 'Tailoring service in village Chandra',
      category: 'services', price: 50, priceType: 'fixed', quantity: 'प्रति वस्त्र',
      sellerNameHi: 'श्रीमती पुष्पा देवी', sellerNameEn: 'Smt. Pushpa Devi', sellerPhone: '9876543215', sellerWard: 8,
      imageUrl: null, isApproved: true, status: 'active',
    },
    {
      titleHi: 'शहद', titleEn: 'Honey',
      descHi: 'ग्राम चंद्रा के शुद्ध और प्राकृतिक शहद', descEn: 'Pure and natural honey from Chandra village',
      category: 'produce', price: 400, priceType: 'fixed', quantity: '1 kg',
      sellerNameHi: 'श्री सुनील तिवारी', sellerNameEn: 'Shri Sunil Tiwari', sellerPhone: '9876543216', sellerWard: 7,
      imageUrl: null, isApproved: true, status: 'active',
    },
    {
      titleHi: 'धान (चावल)', titleEn: 'Paddy (Rice)',
      descHi: 'इस वर्ष की ताजा धान, बेची जाएगी', descEn: 'This year fresh paddy for sale',
      category: 'produce', price: 2200, priceType: 'negotiable', quantity: '1 क्विंटल',
      sellerNameHi: 'श्री देवेंद्र यादव', sellerNameEn: 'Shri Devendra Yadav', sellerPhone: '9876543217', sellerWard: 9,
      imageUrl: '/whatsapp-optimized/IMG-20260725-WA0065.webp', isApproved: true, status: 'active',
    },
  ]

  for (const item of marketItems) {
    await db.marketplaceItem.upsert({
      where: { itemId: item.titleEn.toLowerCase().replace(/\s+/g, '-') },
      update: {},
      create: { ...item, itemId: item.titleEn.toLowerCase().replace(/\s+/g, '-') },
    })
  }
  console.log(`  ✓ ${marketItems.length} marketplace items seeded (approved, active)`)

  // ── Blog posts (published) ──
  const admin = await db.user.findUnique({ where: { email: 'pradhan@chandra-gp.in' } })
  const posts = [
    {
      title: 'PMAY-G आवास योजना: 38 परिवारों को मिला लाभ',
      slug: 'pmay-g-housing-38-families-benefited',
      excerpt: 'प्रधानमंत्री आवास योजना ग्रामीण के तहत ग्राम चंद्रा में 38 परिवारों को आवास का लाभ मिला है।',
      content: '<p>प्रधानमंत्री आवास योजना ग्रामीण (PMAY-G) के तहत ग्राम पंचायत चंद्रा में <strong>38 परिवारों</strong> को आवास का लाभ प्रदान किया गया है। इनमें से 24 घर पूर्ण रूप से निर्मित हो चुके हैं, 9 निर्माणाधीन हैं, और 5 का कार्य शीघ्र प्रारंभ होगा।</p><h2>प्रगति का विवरण</h2><ul><li>पहली किस्त: 38 लाभार्थियों को मिल चुकी</li><li>दूसरी किस्त: 28 लाभार्थियों को मिल चुकी</li><li>तीसरी किस्त: 18 लाभार्थियों को मिल चुकी</li><li>चौथी किस्त: 8 लाभार्थियों को मिल चुकी</li></ul><p>सादा क्षेत्र में ₹1,20,000 की सहायता राशि दी जाती है। पंचायत कार्यालय में आवेदन फॉर्म उपलब्ध हैं।</p><blockquote>प्रधान श्रीमती संगीता मिश्रा का संदेश: "मेरा लक्ष्य है कि 2026 तक ग्राम चंद्रा में कोई भी परिवार कच्चे घर में न रहे।"</blockquote>',
      coverImage: '/whatsapp-optimized/IMG-20260725-WA0011.webp',
      category: 'scheme', status: 'published', tags: JSON.stringify(['PMAY-G', 'housing', '2026']),
      authorId: admin?.id, publishedAt: new Date(Date.now() - 2 * 86400000),
    },
    {
      title: 'मनरेगा: 4820 मानव-दिन उत्पन्न, ₹11.84 लाख व्यय',
      slug: 'mgnrega-4820-persondays-11-84-lakh-expenditure',
      excerpt: 'वित्त वर्ष 2026-27 में मनरेगा के तहत 4820 मानव-दिन उत्पन्न हुए एवं कुल व्यय ₹11,84,500 रहा।',
      content: '<p>महात्मा गांधी राष्ट्रीय ग्रामीण रोजगार गारंटी अधिनियम (MGNREGA) के तहत ग्राम पंचायत चंद्रा में वित्त वर्ष 2026-27 की प्रगति:</p><ul><li><strong>कुल जॉब कार्ड:</strong> 187</li><li><strong>सक्रिय जॉब कार्ड:</strong> 142</li><li><strong>कुल मजदूर:</strong> 312</li><li><strong>मानव-दिन उत्पन्न:</strong> 4,820</li><li><strong>कुल व्यय:</strong> ₹11,84,500</li><li><strong>FTO संसाधित:</strong> 8 (₹4,82,000)</li></ul><h2>चल रहे कार्य</h2><p>वर्तमान में ग्राम चंद्रा में मनरेगा के तहत निम्नलिखित कार्य चल रहे हैं:</p><ul><li>पक्की नाली निर्माण (वार्ड 3, 5, 7)</li><li>ग्रामीण सड़क मरम्मत (वार्ड 1, 2)</li><li>कुआँ निर्माण (रामपुर टोला)</li><li>तालाब गहरीकरण</li></ul>',
      coverImage: '/whatsapp-optimized/IMG-20260725-WA0042.webp',
      category: 'scheme', status: 'published', tags: JSON.stringify(['MGNREGA', 'employment', '2026-27']),
      authorId: admin?.id, publishedAt: new Date(Date.now() - 5 * 86400000),
    },
    {
      title: 'स्वतंत्रता दिवस 2026: पंचायत भवन पर भव्य समारोह',
      slug: 'independence-day-2026-grand-celebration',
      excerpt: '15 अगस्त 2026 को पंचायत भवन पर स्वतंत्रता दिवस भव्यता से मनाया गया। झंडारोहण, सांस्कृतिक कार्यक्रम एवं वितरण समारोह।',
      content: '<p>15 अगस्त 2026 को ग्राम पंचायत चंद्रा में <strong>80वां स्वतंत्रता दिवस</strong> भव्यता से मनाया गया। प्रधान श्रीमती संगीता मिश्रा ने पंचायत भवन पर राष्ट्रीय ध्वज फहराया।</p><h2>कार्यक्रम की मुख्य बातें</h2><ul><li>प्रातः 8 बजे झंडारोहण</li><li>विद्यालय बच्चों द्वारा देशभक्ति गीत</li><li>सांस्कृतिक नृत्य प्रस्तुति</li><li>विद्यालय बैग वितरण</li><li>स्वच्छता अभियान प्रतिज्ञा</li></ul><blockquote>"हमारे गाँव का विकास ही हमारे देश का विकास है।" — प्रधान श्रीमती संगीता मिश्रा</blockquote><p>कार्यक्रम में ग्राम के लगभग 200 से अधिक लोगों ने भाग लिया। विकसित भारत संकल्प यात्रा के तहत भी विशेष प्रदर्शनी लगाई गई।</p>',
      coverImage: '/whatsapp-optimized/IMG-20260725-WA0072.webp',
      category: 'news', status: 'published', tags: JSON.stringify(['independence-day', 'event', '2026']),
      authorId: admin?.id, publishedAt: new Date(Date.now() - 7 * 86400000),
    },
    {
      title: 'जल जीवन मिशन: हर घर नल से जल',
      slug: 'jal-jeevan-mission-tap-water-every-home',
      excerpt: 'जल जीवन मिशन के तहत ग्राम चंद्रा के 187 घरों में से 156 को नल जल कनेक्शन मिल चुका है (83%)।',
      content: '<p>जल जीवन मिशन (JJM) के तहत ग्राम पंचायत चंद्रा की प्रगति उत्साहजनक है। <strong>187 घरों में से 156 घरों (83%)</strong> को नल जल कनेक्शन प्रदान किया जा चुका है।</p><h2>अवशेष लक्ष्य</h2><p>31 दिसंबर 2026 तक शेष 31 घरों को भी कनेक्शन दिया जाएगा। वर्तमान में ओवरहेड टंकी निर्माण एवं पाइपलाइन विस्तार का कार्य चल रहा है।</p><h2>जल स्रोत</h2><ul><li>बोरवेल + ओवरहेड टंकी (मुख्य)</li><li>हैंडपंप (आपातकालीन प्रतिस्थापन)</li><li>जल टंकी आपूर्ति (गर्मी में पूरक)</li></ul>',
      coverImage: '/whatsapp-optimized/IMG-20260725-WA0020.webp',
      category: 'scheme', status: 'published', tags: JSON.stringify(['JJM', 'water', 'infrastructure']),
      authorId: admin?.id, publishedAt: new Date(Date.now() - 10 * 86400000),
    },
  ]

  for (const p of posts) {
    await db.post.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    })
  }
  console.log(`  ✓ ${posts.length} blog posts seeded (published)`)

  console.log('\n✅ Content seed complete.')
}

main().catch(e => { console.error('FATAL', e); process.exit(1) })
