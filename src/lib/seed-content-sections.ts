// Seed dynamic content sections — master doc §4.3
// Stores JSON data for village_stats, infrastructure, education, health,
// schemes_coverage so admin can edit without code changes.
// Run: bun run src/lib/seed-content-sections.ts
import { db } from '@/lib/db'

async function main() {
  console.log('🌱 Seeding dynamic content sections...')

  const sections: { key: string; data: unknown }[] = [
    {
      key: 'village_stats',
      data: {
        population: 1247,
        households: 187,
        wards: 10,
        area_ha: 285,
        literacy_rate: 67.8,
        sex_ratio: 912,
        population_male: 651,
        population_female: 596,
        population_sc: 198,
        population_st: 0,
        population_obc: 612,
        population_general: 437,
        main_workers: 383,
        marginal_workers: 162,
        non_workers: 702,
        source: 'Census 2011 (projected 2026)',
      },
    },
    {
      key: 'infrastructure',
      data: {
        roads: { pucca_km: 8.5, kuccha_km: 3.2, pmgsy_covered: true, drains_km: 6.4 },
        water: { handpumps: 14, tap_connections: 156, total_households: 187, jjm_coverage_pct: 83, overhead_tank: true, tanker_supply_summer: true },
        power: { household_electrified: 187, total_households: 187, coverage_pct: 100, solar_panels: 2, street_lights: 38 },
        civic: { panchayat_bhawan: true, community_hall: true, playground: 1, cremation_ground: 2 },
        sanitation: { ihhl_built: 174, total_households: 187, sbm_coverage_pct: 93, public_toilets: 2 },
      },
    },
    {
      key: 'education',
      data: {
        primary_school: { name: 'प्राथमिक विद्यालय चंद्रा', name_en: 'Primary School Chandra', teachers: 4, students: 86, rooms: 5, medium: 'Hindi' },
        anganwadi: { centers: 2, children_enrolled: 38, workers: 3, helpers: 2 },
        literacy: { male: 78.2, female: 56.4, overall: 67.8 },
        enrollment: { boys: 47, girls: 39, total: 86 },
        mid_day_meal: { active: true, students_served: 86 },
        scholarships: { sc_st: 12, obc: 8, general: 3, total: 23 },
      },
    },
    {
      key: 'health',
      data: {
        sub_center: { name: 'उपकेंद्र चंद्रा', distance_km: 0, staff: 1 },
        phc: { name: 'PHC शंकरगढ़', distance_km: 8 },
        anganwadi_centers: 2,
        immunization_coverage_pct: 94,
        maternal_care: { anc_registered: 14, institutional_deliveries: 12 },
        sanitation: { ihhl_built: 174, coverage_pct: 93 },
        health_workers: { anm: 1, asha: 3, anganwadi_workers: 3 },
      },
    },
    {
      key: 'schemes_coverage',
      data: {
        mgnrega: { active_jobcards: 142, total_jobcards: 187, coverage_pct: 76, persondays: 4820, expenditure_rs: 1184500, fto_count: 8 },
        pmay_g: { completed: 24, total: 38, coverage_pct: 63, assistance_plain_rs: 120000, installments_paid: 4 },
        jjm: { tap_connections: 156, total_households: 187, coverage_pct: 83, target_date: '2026-12-31' },
        pension: { old_age: 34, widow: 18, divyang: 7, total: 59 },
        sbm_g: { toilets_built: 174, total_households: 187, coverage_pct: 93 },
      },
    },
    {
      key: 'shg_directory',
      data: {
        groups: [
          { name: 'चंद्रा महिला समूह', name_en: 'Chandra Women Group', members: 12, ward: 1, activity: 'सिलाई / Tailoring', savings: 18500 },
          { name: 'गंगा स्व-सहायता समूह', name_en: 'Ganga Self-Help Group', members: 10, ward: 3, activity: 'बकरी पालन / Goat farming', savings: 12000 },
          { name: 'सरस्वती समूह', name_en: 'Saraswati Group', members: 11, ward: 5, activity: 'कृषि / Agriculture', savings: 22300 },
          { name: 'दुर्गा महिला मंडल', name_en: 'Durga Women Mandal', members: 9, ward: 7, activity: 'मिट्टी के बर्तन / Pottery', savings: 9800 },
        ],
        total_groups: 4,
        total_members: 42,
        total_savings: 62600,
      },
    },
    {
      key: 'emergency_contacts',
      data: {
        contacts: [
          { name_hi: 'प्रधान (संगीता मिश्रा)', name_en: 'Pradhan (Sangita Mishra)', phone: '9651035021', category: 'panchayat', available: '24x7' },
          { name_hi: 'GPA (बलवंत चौहान)', name_en: 'GPA (Balwant Chauhan)', phone: '9839312578', category: 'panchayat', available: '10-5' },
          { name_hi: 'पुलिस थाना शंकरगढ़', name_en: 'Police Station Shankargarh', phone: '100', category: 'police', available: '24x7' },
          { name_hi: 'एम्बुलेंस', name_en: 'Ambulance', phone: '108', category: 'medical', available: '24x7' },
          { name_hi: 'अग्निशमन', name_en: 'Fire Brigade', phone: '101', category: 'fire', available: '24x7' },
          { name_hi: 'PHC शंकरगढ़', name_en: 'PHC Shankargarh', phone: '0533-229XXX', category: 'medical', available: '9-5' },
          { name_hi: 'बी.डी.ओ. शंकरगढ़', name_en: 'BDO Shankargarh', phone: '0533-229XXX', category: 'admin', available: '10-5' },
          { name_hi: 'विद्युत विभाग', name_en: 'Electricity Dept', phone: '1912', category: 'utility', available: '24x7' },
          { name_hi: 'जल शिकायत', name_en: 'Water Complaint', phone: '1916', category: 'utility', available: '24x7' },
        ],
      },
    },
  ]

  for (const s of sections) {
    await db.contentSection.upsert({
      where: { key: s.key },
      update: {},
      create: { key: s.key, data: JSON.stringify(s.data) },
    })
  }
  console.log(`  ✓ ${sections.length} content sections seeded`)
  console.log('✅ Content sections seed complete.')
}

main().catch(e => { console.error('FATAL', e); process.exit(1) })
