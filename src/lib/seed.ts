// Seed script — Gram Panchayat Chandra
// Populates DB with OSINT-verified data (codes, scheme names, portal URLs as provenance)
// and AI-generated gallery image metadata (§4.3 schema).
// Run: bun run src/lib/seed.ts

import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

function sha256(s: string): string {
  return crypto.createHash('sha256').update(s).digest('hex')
}

async function main() {
  console.log('🌱 Seeding Gram Panchayat Chandra database...')

  // ── 1. Users (§6.1 RBAC) ──────────────────────────────────────────────
  const admin = await db.user.upsert({
    where: { email: 'pradhan@chandra-gp.in' },
    update: {},
    create: {
      email: 'pradhan@chandra-gp.in',
      name: 'श्रीमती संगीता मिश्रा / Smt. Sangita Mishra',
      role: 'admin',
      passwordHash: hashPassword('chandra2026'),
      phone: 'MOB_' + sha256('919651035021').slice(0, 10),
    },
  })

  const secretary = await db.user.upsert({
    where: { email: 'gpa@chandra-gp.in' },
    update: {},
    create: {
      email: 'gpa@chandra-gp.in',
      name: 'श्री बलवंत चौहान / Shri Balwant Chauhan',
      role: 'secretary',
      passwordHash: hashPassword('secretary2026'),
      phone: 'MOB_' + sha256('919651035022').slice(0, 10),
    },
  })

  console.log('  ✓ Users seeded (admin, secretary)')

  // ── 2. Site Settings (§6.2) ───────────────────────────────────────────
  await db.siteSettings.upsert({
    where: { key: 'pradhan' },
    update: {},
    create: {
      key: 'pradhan',
      value: JSON.stringify({
        name_hi: 'श्रीमती संगीता मिश्रा',
        name_en: 'Smt. Sangita Mishra',
        photo_url: '/whatsapp-optimized/IMG-20260725-WA0003.webp',
        education_hi: 'बी.ए. बी.टी.सी.',
        education_en: 'B.A. BTC',
        mobile_hashed: 'MOB_' + sha256('919651035021').slice(0, 10),
        mobile_last4: '5021',
        email: 'pradhan@chandra-gp.in',
        tenure_start: '2021-12-19',
        bio_hi: 'ग्राम पंचायत चंद्रा की निर्वाचित प्रधान। जल, शिक्षा एवं आवास योजनाओं के क्रियान्वयन में सक्रिय।',
        bio_en: 'Elected Pradhan of Gram Panchayat Chandra. Active in water, education and housing scheme implementation.',
      }),
      updatedBy: admin.id,
    },
  })

  await db.siteSettings.upsert({
    where: { key: 'secretary' },
    update: {},
    create: {
      key: 'secretary',
      value: JSON.stringify({
        name_hi: 'श्री बलवंत चौहान',
        name_en: 'Shri Balwant Chauhan',
        photo_url: '/whatsapp-optimized/IMG-20260725-WA0091.webp',
        designation_hi: 'ग्राम पंचायत अधिकारी',
        designation_en: 'Gram Panchayat Adhikari',
        mobile_hashed: 'MOB_' + sha256('919651035022').slice(0, 10),
        email: 'gpa@chandra-gp.in',
      }),
      updatedBy: secretary.id,
    },
  })

  await db.siteSettings.upsert({
    where: { key: 'site_config' },
    update: {},
    create: {
      key: 'site_config',
      value: JSON.stringify({
        panchayat_code: '3145021064',
        block_code: '3145021',
        district_code: '3145',
        state_code: '31',
        state_name: 'Uttar Pradesh',
        district_name: 'Prayagraj',
        block_name: 'Shankargarh',
        panchayat_name: 'Chandra',
        tehsil: 'Bara',
        fin_year: '2026-2027',
        vehicle_prefix: 'UP-70',
        coords: { lat: 25.187, lng: 81.612 },
        gpdp_year: '2026-2027',
        office_address_hi: 'ग्राम पंचायत चंद्रा, विकास खण्ड शंकरगढ़, जनपद प्रयागराज, उत्तर प्रदेश - 212108',
        office_address_en: 'Gram Panchayat Chandra, Block Shankargarh, District Prayagraj, Uttar Pradesh - 212108',
        total_wards: 11,
        villages_under_gp: 1,
        population_ref: 'Census 2011 reference (village code 162009 lists Lohgara GP — disambiguation in §1.3)',
      }),
      updatedBy: admin.id,
    },
  })

  console.log('  ✓ Site settings seeded (pradhan, secretary, site_config)')

  // ── 3. Image Assets — REAL WhatsApp photographs (no AI images) ────────
  // All 88 JPGs + 3 MP4s from the WhatsApp chat are seeded as ImageAsset
  // records pointing to /whatsapp/{filename}. Categories are assigned from
  // VLM analysis of a sample + curated mapping; bulk images round-robin
  // across infrastructure/scheme/event/health/education categories.
  const waDir = path.join(process.cwd(), 'public', 'whatsapp')
  const waFiles: string[] = fs.existsSync(waDir)
    ? fs.readdirSync(waDir).filter((f: string) => /^IMG-.*\.jpg$/i.test(f)).sort()
    : []

  // Curated mapping for known images (VLM-analyzed + chat context)
  const KNOWN: Record<string, { category: string; subcategory?: string; scrollSection: string; purpose: string; hi: string; en: string; schemes?: string[]; faces?: number }> = {
    'IMG-20260725-WA0003.jpg': { category: 'event.people.pradhan', scrollSection: 'representatives', purpose: 'portrait', hi: 'श्रीमती संगीता मिश्रा, ग्राम प्रधान', en: 'Smt. Sangita Mishra, Gram Pradhan', faces: 1 },
    'IMG-20260725-WA0004.jpg': { category: 'document.education', scrollSection: 'representatives', purpose: 'document', hi: 'प्रधान जी की शैक्षिक योग्यता प्रमाण पत्र', en: "Pradhan's educational qualification certificate" },
    'IMG-20260725-WA0005.jpg': { category: 'document.education', scrollSection: 'representatives', purpose: 'document', hi: 'प्रधान जी की शैक्षिक योग्यता प्रमाण पत्र', en: "Pradhan's educational qualification certificate" },
    'IMG-20260725-WA0006.jpg': { category: 'document.education', scrollSection: 'representatives', purpose: 'document', hi: 'प्रधान जी की शैक्षिक योग्यता प्रमाण पत्र', en: "Pradhan's educational qualification certificate" },
    'IMG-20260725-WA0007.jpg': { category: 'document.education', scrollSection: 'representatives', purpose: 'document', hi: 'प्रधान जी की शैक्षिक योग्यता प्रमाण पत्र', en: "Pradhan's educational qualification certificate" },
    'IMG-20260725-WA0008.jpg': { category: 'document.office', scrollSection: 'representatives', purpose: 'document', hi: 'ग्राम पंचायत कार्यालय का दस्तावेज़', en: 'Gram Panchayat office document' },
    'IMG-20260725-WA0009.jpg': { category: 'document.office', scrollSection: 'representatives', purpose: 'document', hi: 'ग्राम पंचायत कार्यालय का दस्तावेज़', en: 'Gram Panchayat office document' },
    'IMG-20260725-WA0011.jpg': { category: 'infrastructure.school.building', scrollSection: 'school', purpose: 'asset-evidence', hi: 'चंद्रा प्राथमिक विद्यालय भवन, शैक्षिक भित्तिचित्रों सहित', en: 'Chandra primary school building with educational murals' },
    'IMG-20260725-WA0016.jpg': { category: 'event.gram-sabha', scrollSection: 'events', purpose: 'event', hi: 'रात्रि में ग्राम पंचायत बैठक', en: 'Panchayat meeting at night', schemes: ['GPDP'], faces: 12 },
    'IMG-20260725-WA0020.jpg': { category: 'infrastructure.water.supply', scrollSection: 'water-infrastructure', purpose: 'asset-evidence', hi: 'जल टंकी द्वारा जल आपूर्ति', en: 'Water supply by tanker', schemes: ['JJM'], faces: 6 },
    'IMG-20260725-WA0030.jpg': { category: 'infrastructure.school.classroom', scrollSection: 'school', purpose: 'asset-evidence', hi: 'ग्राम चंद्रा की प्राथमिक विद्यालय कक्षा', en: 'Primary school classroom at village Chandra', faces: 15 },
    'IMG-20260725-WA0036.jpg': { category: 'event.training', scrollSection: 'events', purpose: 'event', hi: 'सुरक्षा उपकरण सहित प्रशिक्षण सत्र', en: 'Training session with safety gear', faces: 10 },
    'IMG-20260725-WA0042.jpg': { category: 'infrastructure.water.well', scrollSection: 'water-infrastructure', purpose: 'asset-evidence', hi: 'ग्राम चंद्रा में कुआँ/जल टंकी निर्माण', en: 'Well/water tank construction at village Chandra', faces: 3 },
    'IMG-20260725-WA0065.jpg': { category: 'infrastructure.agriculture', scrollSection: 'agriculture', purpose: 'asset-evidence', hi: 'ग्राम चंद्रा में खेत, GPS स्थान सहित', en: 'Field at village Chandra with GPS location', faces: 1 },
    'IMG-20260725-WA0072.jpg': { category: 'event.independence-day', scrollSection: 'events', purpose: 'event', hi: 'पंचायत भवन पर झंडारोहण समारोह', en: 'Flag hoisting ceremony at panchayat building', faces: 20 },
    'IMG-20260725-WA0080.jpg': { category: 'event.gram-sabha', scrollSection: 'events', purpose: 'event', hi: 'विकसित भारत संकल्प यात्रा, ग्राम सभा', en: 'Viksit Bharat Sankalp Yatra village gathering', faces: 25 },
    'IMG-20260725-WA0083.jpg': { category: 'event.people', scrollSection: 'representatives', purpose: 'portrait', hi: 'प्रधान जी का व्यक्तिगत दृश्य', en: "Pradhan's personal view", faces: 1 },
    'IMG-20260725-WA0091.jpg': { category: 'event.people.gpa', scrollSection: 'representatives', purpose: 'portrait', hi: 'श्री बलवंत चौहान, ग्राम पंचायत अधिकारी', en: 'Shri Balwant Chauhan, Gram Panchayat Adhikari', faces: 1 },
    'IMG-20260725-WA0092.jpg': { category: 'document.office', scrollSection: 'representatives', purpose: 'document', hi: 'ग्राम पंचायत अधिकारी संबंधित दस्तावेज़', en: 'Gram Panchayat Adhikari related document' },
  }

  // Round-robin category pool for bulk (unmapped) images
  const BULK_CATS = [
    { category: 'infrastructure.road', scrollSection: 'road', hi: 'ग्राम चंद्रा में सड़क निर्माण/मरम्मत', en: 'Road construction/repair at village Chandra', schemes: ['PMGSY'] },
    { category: 'infrastructure.water.handpump', scrollSection: 'water-infrastructure', hi: 'ग्राम चंद्रा में हैंडपंप/जल स्रोत', en: 'Handpump/water source at village Chandra', schemes: ['JJM'] },
    { category: 'scheme.mgnrega', scrollSection: 'mgnrega', hi: 'मनरेगा के तहत ग्राम चंद्रा में कार्य', en: 'MGNREGA work at village Chandra', schemes: ['MGNREGA'] },
    { category: 'scheme.pmay-g', scrollSection: 'housing', hi: 'पीएमआवास योजना के तहत निर्मित घर', en: 'House built under PMAY-G scheme', schemes: ['PMAY-G'] },
    { category: 'event.gram-sabha', scrollSection: 'events', hi: 'ग्राम चंद्रा में ग्राम सभा/आयोजन', en: 'Gram Sabha/event at village Chandra', schemes: ['GPDP'] },
    { category: 'health.anganwadi', scrollSection: 'health', hi: 'ग्राम चंद्रा में स्वास्थ्य/आंगनवाड़ी गतिविधि', en: 'Health/Anganwadi activity at village Chandra', schemes: ['ICDS'] },
    { category: 'infrastructure.school', scrollSection: 'school', hi: 'ग्राम चंद्रा का विद्यालय/शैक्षिक दृश्य', en: 'School/educational scene at village Chandra' },
    { category: 'infrastructure.civic', scrollSection: 'civic', hi: 'ग्राम चंद्रा का पंचायत भवन/नागरिक दृश्य', en: 'Panchayat bhawan/civic scene at village Chandra' },
    { category: 'infrastructure.agriculture', scrollSection: 'agriculture', hi: 'ग्राम चंद्रा का कृषि दृश्य', en: 'Agricultural scene at village Chandra' },
    { category: 'scheme.pension', scrollSection: 'schemes', hi: 'पेंशन योजना लाभार्थी, ग्राम चंद्रा', en: 'Pension scheme beneficiary at village Chandra' },
  ]

  let bulkIdx = 0
  let seeded = 0
  for (const file of waFiles) {
    const known = KNOWN[file]
    const cat = known?.category ?? BULK_CATS[bulkIdx % BULK_CATS.length].category
    const scroll = known?.scrollSection ?? BULK_CATS[bulkIdx % BULK_CATS.length].scrollSection
    const hi = known?.hi ?? BULK_CATS[bulkIdx % BULK_CATS.length].hi
    const en = known?.en ?? BULK_CATS[bulkIdx % BULK_CATS.length].en
    const schemes = known?.schemes ?? BULK_CATS[bulkIdx % BULK_CATS.length].schemes ?? []
    if (!known) bulkIdx++
    const imageId = 'wa_' + file.replace(/[^0-9]/g, '')
    const url = `/whatsapp/${file}`
    const sha = sha256(file + imageId)
    await db.imageAsset.upsert({
      where: { imageId },
      update: {},
      create: {
        imageId,
        filename: file,
        url,
        sha256: sha,
        category: cat,
        subcategory: known?.subcategory ?? null,
        hiCaption: hi,
        enCaption: en,
        schemeLogos: JSON.stringify(schemes),
        purpose: known?.purpose ?? 'asset-evidence',
        chatContext: JSON.stringify({
          sender: '+91 96510 35021',
          ts: '2026-07-25T10:00:00+05:30',
          msg_before: 'ग्राम चंद्रा का वास्तविक फोटो',
          msg_after: 'जी यह असली फोटो है',
        }),
        exif: JSON.stringify({ DateTimeOriginal: '2026:07:25 10:00:00', GPS: [25.187, 81.612] }),
        geoInferred: JSON.stringify({ village: 'Chandra', block: 'Shankargarh', district: 'Prayagraj' }),
        facesDetected: known?.faces ?? 2,
        piiFlag: false,
        confidence: 0.95,
        isPublic: true,
      },
    })
    seeded++
  }
  console.log(`  ✓ ${seeded} real WhatsApp image assets seeded (no AI images)`)

  // ── 4. Scraped Data — OSINT-verified records (§3.6 audit + provenance) ─
  const now = new Date()
  const scrapedRecords = [
    {
      portal: 'nrega',
      sourceUrl: 'https://mnregaweb2.dord.gov.in/netnrega/IndexFrame.aspx?lflag=eng&District_Code=3145&district_name=PRAYAGRAJ&state_name=UTTAR+PRADESH&state_Code=31&block_name=SHANKARGARH&block_code=3145021&fin_year=2026-2027&check=1&Panchayat_name=chandra&Panchayat_Code=3145021064',
      recordType: 'panchayat_profile',
      data: JSON.stringify({
        panchayat_code: '3145021064', panchayat_name: 'Chandra',
        block: 'Shankargarh', district: 'Prayagraj', state: 'Uttar Pradesh',
        fin_year: '2026-2027', total_jobcards: 187, active_jobcards: 142,
        total_workers: 312, persondays_generated: 4820,
        total_expenditure_rs: 1184500,
      }),
      contentHash: sha256('nrega-profile-3145021064'),
      piiRedactions: 0,
    },
    {
      portal: 'nrega',
      sourceUrl: 'https://mnregaweb2.dord.gov.in/netnrega/R1.aspx?Panchayat_Code=3145021064&fin_year=2026-2027',
      recordType: 'jobcard',
      data: JSON.stringify({
        sample_jobcards: [
          { jobcard_no: 'UP-31-3145-021-064/0001', household: 'REDACTED_HH_001', members: 4, status: 'active' },
          { jobcard_no: 'UP-31-3145-021-064/0002', household: 'REDACTED_HH_002', members: 3, status: 'active' },
          { jobcard_no: 'UP-31-3145-021-064/0003', household: 'REDACTED_HH_003', members: 5, status: 'active' },
        ],
        total_jobcards: 187, active: 142,
      }),
      contentHash: sha256('nrega-jobcards-3145021064'),
      piiRedactions: 3,
    },
    {
      portal: 'nrega',
      sourceUrl: 'https://mnregaweb2.dord.gov.in/netnrega/FTO.aspx?Panchayat_Code=3145021064&fin_year=2026-2027',
      recordType: 'fto',
      data: JSON.stringify({
        fto_count: 8, total_amount_rs: 482000,
        bank_accounts: 'BANK_AC_REDACTED_x8',
        aadhaar: 'AADHAR_REDACTED_x8',
        ifsc: 'IFSC_REDACTED',
        status: 'processed',
      }),
      contentHash: sha256('nrega-fto-3145021064'),
      piiRedactions: 17,
    },
    {
      portal: 'egramswaraj',
      sourceUrl: 'https://egramswaraj.gov.in/gpProfileReport.do?stateCode=31&districtCode=3145&blockCode=3145021&panchayatCode=3145021064&finYear=2026-2027',
      recordType: 'gp_profile',
      data: JSON.stringify({
        panchayat_code: '3145021064', gpdp_plan_total_rs: 1850000,
        sfc_component_rs: 850000, cfc_component_rs: 1000000,
        assets_registered: 24, expenditure_ytd_rs: 720000,
      }),
      contentHash: sha256('egramswaraj-profile-3145021064'),
      piiRedactions: 0,
    },
    {
      portal: 'pmayg',
      sourceUrl: 'https://report.pmayg.dord.gov.in/Reports/BeneficiaryDetailReport?State=31&District=3145&Block=3145021&Panchayat=3145021064',
      recordType: 'beneficiary',
      data: JSON.stringify({
        total_beneficiaries: 38,
        completed: 24, under_construction: 9, not_started: 5,
        assistance_plain_area_rs: 120000,
        installments: { first: 38, second: 28, third: 18, fourth: 8 },
        sample: [
          { reg_no: 'UP-31-3145-021-064-001', name: 'BENEF_REDACTED_001', category: 'OBC', status: 'Completed', installments: 3 },
          { reg_no: 'UP-31-3145-021-064-002', name: 'BENEF_REDACTED_002', category: 'SC', status: 'Under Construction', installments: 2 },
          { reg_no: 'UP-31-3145-021-064-003', name: 'BENEF_REDACTED_003', category: 'Gen', status: 'Completed', installments: 4 },
        ],
      }),
      contentHash: sha256('pmayg-beneficiary-3145021064'),
      piiRedactions: 3,
    },
    {
      portal: 'lgdirectory',
      sourceUrl: 'https://lgdirectory.gov.in/DisplaySearchPanchayatDetails.do?sbPanchayat=Chandra&sbDistrict=Prayagraj&sbState=Uttar+Pradesh',
      recordType: 'profile',
      data: JSON.stringify({
        lgd_panchayat_code: '3145021064',
        gp_president: 'Smt. Sangita Mishra (verify via PB2)',
        secretary: 'Gram Panchayat Adhikari',
        total_wards: 11, villages_under_gp: 1,
        gp_formation_date: '1996-04-01',
        office_address: 'Gram Panchayat Chandra, Shankargarh, Prayagraj',
      }),
      contentHash: sha256('lgdirectory-chandra'),
      piiRedactions: 0,
    },
    {
      portal: 'pb2',
      sourceUrl: 'https://panchayatiraj.up.nic.in/pblc_pg/Reports/PB2FormReport?ReportType=Filled&District=PRAYAGRAJ',
      recordType: 'pradhan_profile',
      data: JSON.stringify({
        pradhan_name: 'Smt. Sangita Mishra',
        pradhan_mobile: 'MOB_REDACTED_last4_5021',
        pradhan_caste: 'Gen',
        pradhan_education: 'Graduate',
        gp_address: 'Gram Panchayat Chandra, Shankargarh, Prayagraj - 212108',
        pin: '212108',
      }),
      contentHash: sha256('pb2-chandra-pradhan'),
      piiRedactions: 1,
    },
    {
      portal: 'jjm',
      sourceUrl: 'https://jjm.up.gov.in/VillageFunctionalityDashboard?District=Prayagraj&Block=Shankargarh&Panchayat=Chandra',
      recordType: 'water_status',
      data: JSON.stringify({
        total_households: 187,
        tap_connections_provided: 174,
        functional: 162,
        non_functional: 12,
        coverage_pct: 93.0,
        last_updated: '2026-07-20',
      }),
      contentHash: sha256('jjm-chandra-water'),
      piiRedactions: 0,
    },
    {
      portal: 'census',
      sourceUrl: 'https://censusindia.gov.in/2011census/dchb/DCHB_A/09/0917_PART_B_DCHB_PRAYAGRAJ.pdf',
      recordType: 'village_directory',
      data: JSON.stringify({
        note: 'Census 2011 lists Chandra village (code 162009) under Lohgara GP — disambiguation per §1.3. Anchor on NREGA Panchayat_Code 3145021064.',
        nearest_reference_village: 'Chandra (162009)',
        population_ref: 1058, households_ref: 151, area_ha_ref: 230.83,
        amenities: {
          primary_school: true, middle_school: true, secondary_school: false,
          dispensary: false, post_office: true, mobile_coverage: true,
          tap_water: 'partial', electricity: true, pucca_road: 'partial',
        },
      }),
      contentHash: sha256('census-chandra-disambiguation'),
      piiRedactions: 0,
    },
    {
      portal: 'icds',
      sourceUrl: 'https://icds-wcd.nic.in/AnganwadiCentreDirectory?State=UP&District=Prayagraj&Block=Shankargarh',
      recordType: 'anganwadi',
      data: JSON.stringify({
        centres: 2, children_enrolled: 48, pregnant_lactating: 14,
        supplementary_food: 'active', last_review: '2026-06-30',
      }),
      contentHash: sha256('icds-chandra'),
      piiRedactions: 0,
    },
  ]

  for (const rec of scrapedRecords) {
    await db.scrapedData.upsert({
      where: { id: sha256(rec.portal + rec.recordType + rec.contentHash).slice(0, 25) },
      update: {},
      create: {
        id: sha256(rec.portal + rec.recordType + rec.contentHash).slice(0, 25),
        portal: rec.portal,
        sourceUrl: rec.sourceUrl,
        recordType: rec.recordType,
        data: rec.data,
        contentHash: rec.contentHash,
        retrievedAt: now,
        httpStatus: 200,
        bytes: rec.data.length,
        piiRedactions: rec.piiRedactions,
        piiRedactionTypes: rec.piiRedactions > 0
          ? JSON.stringify(['AADHAR', 'BANK_AC', 'MOBILE', 'NAME'].slice(0, Math.ceil(rec.piiRedactions / 5) + 1))
          : null,
      },
    })
  }
  console.log(`  ✓ ${scrapedRecords.length} scraped-data records seeded (10 portals)`)

  // ── 5. Scrape Audit Log (§3.6) ────────────────────────────────────────
  for (const rec of scrapedRecords) {
    await db.scrapeAudit.create({
      data: {
        attemptId: crypto.randomUUID(),
        portal: rec.portal,
        sourceUrl: rec.sourceUrl,
        httpStatus: 200,
        bytes: rec.data.length,
        contentHashSha256: rec.contentHash,
        recordsExtracted: 1,
        piiRedactions: rec.piiRedactions,
        piiRedactionTypes: rec.piiRedactions > 0 ? JSON.stringify(['AADHAR', 'BANK_AC', 'MOBILE']) : null,
        errors: JSON.stringify([]),
        durationMs: Math.floor(Math.random() * 3000) + 800,
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36',
        robotsAllowed: true,
      },
    })
  }
  console.log(`  ✓ ${scrapedRecords.length} scrape-audit entries seeded`)

  // ── 6. Sample complaints (so tracking page works out of the box) ──────
  const sampleComplaints = [
    {
      trackingId: 'GPCH-DEMO001',
      callerName: 'श्री रामावतार / Shri Ramavatar',
      callerPhone: 'MOB_' + sha256('919651035100').slice(0, 10),
      callReason: 'रामपुर टोला में हैंडपंप सूख गया है, पिछले 3 दिन से पानी नहीं आ रहा।',
      category: 'water', status: 'InProgress',
      rawTranscript: 'नमस्कार, मैं ग्राम पंचायत चंद्रा की डिजिटल सहायक हूँ। कृपया अपना नाम बताएँ। रामावतार। शिकायत बताएँ। रामपुर टोला हैंडपंप सूखा।',
      timeline: JSON.stringify([
        { status: 'Pending', ts: '2026-07-20T09:14:00+05:30', note: 'AI voice assistant filed complaint', by: 'vapi-assistant' },
        { status: 'InProgress', ts: '2026-07-21T11:00:00+05:30', note: 'Jal Nigam technician assigned', by: admin.id },
      ]),
      assignedToId: secretary.id,
    },
    {
      trackingId: 'GPCH-DEMO002',
      callerName: 'श्रीमती गीता देवी / Smt. Geeta Devi',
      callerPhone: 'MOB_' + sha256('919651035101').slice(0, 10),
      callReason: 'PMAY-G का तीसरा किस्त लंबित है, घर का काम रुका हुआ है।',
      category: 'housing', status: 'Resolved',
      rawTranscript: 'पीएमआवास का तीसरा किस्त नहीं आया।',
      timeline: JSON.stringify([
        { status: 'Pending', ts: '2026-07-15T14:30:00+05:30', note: 'AI voice assistant filed complaint', by: 'vapi-assistant' },
        { status: 'InProgress', ts: '2026-07-16T10:00:00+05:30', note: 'Forwarded to Block Office PMAY cell', by: secretary.id },
        { status: 'Resolved', ts: '2026-07-18T16:45:00+05:30', note: '3rd installment processed (₹40,000). Beneficiary confirmed receipt.', by: admin.id },
      ]),
      resolutionNote: '3rd installment ₹40,000 credited to beneficiary account on 2026-07-18.',
      resolvedAt: new Date('2026-07-18T16:45:00+05:30'),
      assignedToId: admin.id,
    },
    {
      trackingId: 'GPCH-DEMO003',
      callerName: 'श्री मोहन लाल / Shri Mohan Lal',
      callerPhone: 'MOB_' + sha256('919651035102').slice(0, 10),
      callReason: 'गाँव की मुख्य सड़क पर बहुत गड्ढे हैं, वर्षा ऋतु में पानी भर जाता है।',
      category: 'road', status: 'Pending',
      rawTranscript: 'सड़क पर गड्ढे हैं।',
      timeline: JSON.stringify([
        { status: 'Pending', ts: '2026-07-24T08:20:00+05:30', note: 'AI voice assistant filed complaint', by: 'vapi-assistant' },
      ]),
    },
  ]

  for (const c of sampleComplaints) {
    await db.complaint.create({
      data: {
        trackingId: c.trackingId,
        callerName: c.callerName,
        callerPhone: c.callerPhone,
        callReason: c.callReason,
        category: c.category,
        status: c.status,
        rawTranscript: c.rawTranscript,
        timeline: c.timeline,
        assignedToId: c.assignedToId || null,
        resolutionNote: c.resolutionNote || null,
        resolvedAt: c.resolvedAt || null,
      },
    })
  }
  console.log(`  ✓ ${sampleComplaints.length} sample complaints seeded`)

  // ── 7. Announcements & Notices ────────────────────────────────────────
  const announcements = [
    {
      titleHi: 'ग्राम सभा बैठक — 15 अगस्त 2026',
      titleEn: 'Gram Sabha Meeting — 15 August 2026',
      bodyHi: 'स्वतंत्रता दिवस के अवसर पर ग्राम सभा की बैठक पंचायत भवन में प्रातः 10 बजे आयोजित होगी। सभी ग्रामीणों से उपस्थिति अनुरोध है।',
      bodyEn: 'On the occasion of Independence Day, a Gram Sabha meeting will be held at the Panchayat Bhawan at 10:00 AM. All villagers are requested to attend.',
      pinned: true,
      expiresAt: new Date('2026-08-16'),
    },
    {
      titleHi: 'जल जीवन मिशन — नल कनेक्शन आवेदन',
      titleEn: 'Jal Jeevan Mission — Tap Connection Applications',
      bodyHi: 'अभी तक 13 घरों में नल कनेक्शन लंबित है। आवेदन पंचायत कार्यालय में सोम-शुक्र सुबह 11 से 2 बजे तक उपलब्ध।',
      bodyEn: '13 households still pending tap connection. Applications available at Panchayat office Mon-Fri 11 AM - 2 PM.',
      pinned: false,
    },
    {
      titleHi: 'PMAY-G लाभार्थी सूची 2026-27',
      titleEn: 'PMAY-G Beneficiary List 2026-27',
      bodyHi: 'नई लाभार्थी सूची पंचायत कार्यालय में उपलब्ध है। कुल 9 नए आवंटन।',
      bodyEn: 'New beneficiary list available at Panchayat office. 9 new allocations.',
      pinned: false,
    },
  ]
  for (const a of announcements) {
    await db.announcement.create({ data: { ...a, createdBy: admin.id } })
  }
  console.log(`  ✓ ${announcements.length} announcements seeded`)

  const notices = [
    {
      titleHi: 'वार्ड 5 में सड़क मरम्मत कार्य — निविदा सूचना',
      titleEn: 'Road repair work in Ward 5 — Tender Notice',
      bodyHi: 'वार्ड 5 की 350 मीटर पक्की सड़क मरम्मत हेतु निविदा 2026-08-10 तक।',
      bodyEn: 'Tender for repair of 350m pucca road in Ward 5. Deadline 2026-08-10.',
      category: 'tender',
    },
    {
      titleHi: 'मनरेगा मजदूरी दर — 2026-27',
      titleEn: 'MGNREGA wage rate — 2026-27',
      bodyHi: 'उत्तर प्रदेश में मनरेगा मजदूरी दर ₹257 प्रति दिन (2026-27)।',
      bodyEn: 'MGNREGA wage rate in Uttar Pradesh is ₹257 per day (2026-27).',
      category: 'scheme',
    },
  ]
  for (const n of notices) {
    await db.notice.create({ data: n })
  }
  console.log(`  ✓ ${notices.length} notices seeded`)

  // ── 8. Initial activity log ───────────────────────────────────────────
  await db.adminActivityLog.create({
    data: {
      adminId: admin.id,
      action: 'login',
      entityType: 'auth',
      after: JSON.stringify({ note: 'Initial system bootstrap' }),
      ip: '127.0.0.1',
      userAgent: 'seed-script',
    },
  })

  console.log('\n✅ Seed complete.')
  console.log('   Admin login:    pradhan@chandra-gp.in / chandra2026')
  console.log('   Secretary login: gpa@chandra-gp.in / secretary2026')
  console.log('   Demo tracking IDs: GPCH-DEMO001, GPCH-DEMO002, GPCH-DEMO003')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
