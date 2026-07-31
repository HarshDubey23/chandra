/**
 * Vapi System Seed Data
 * Seeds departments and routing rules for the Gram Panchayat Chandra AI Voice System.
 *
 * Run: bun run src/lib/seed-vapi.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({ log: ['query'] })

async function main() {
  console.log('🌱 Seeding Vapi system data...\n')

  // ────────────────────────────────────────────────────────────────────────────
  // DEPARTMENTS
  // ────────────────────────────────────────────────────────────────────────────
  const departments = [
    {
      code: 'water',
      nameHi: 'जल विभाग',
      nameEn: 'Water Department',
      officerName: 'श्री बलवंत चौहान (GPA)',
      officerPhone: '9839312578',
      headPhone: '9651035021',
    },
    {
      code: 'roads',
      nameHi: 'सड़क विभाग',
      nameEn: 'Roads Department',
      officerName: 'श्री बलवंत चौहान (GPA)',
      officerPhone: '9839312578',
      headPhone: '9651035021',
    },
    {
      code: 'secretary',
      nameHi: 'सचिव विभाग',
      nameEn: 'Secretary Department',
      officerName: 'श्री बलवंत चौहान (GPA)',
      officerPhone: '9839312578',
      headPhone: '9651035021',
    },
    {
      code: 'pradhan',
      nameHi: 'प्रधान विभाग',
      nameEn: 'Pradhan Office',
      officerName: 'श्रीमती संगीता मिश्रा (प्रधान)',
      officerPhone: '9651035021',
      headPhone: '9651035021',
    },
    {
      code: 'health',
      nameHi: 'स्वास्थ्य विभाग',
      nameEn: 'Health Department',
      officerName: 'अर्चना सिंह (ANM)',
      officerPhone: '8528667723',
      headPhone: '9651035021',
    },
    {
      code: 'education',
      nameHi: 'शिक्षा विभाग',
      nameEn: 'Education Department',
      officerName: 'अल्ताफ मोहम्मद (Headmaster)',
      officerPhone: '7054306848',
      headPhone: '9651035021',
    },
    {
      code: 'sanitation',
      nameHi: 'सफाई विभाग',
      nameEn: 'Sanitation Department',
      officerName: 'दया शंकर (सफाई कर्मी)',
      officerPhone: '6392167328',
      headPhone: '9651035021',
    },
    {
      code: 'pension',
      nameHi: 'पेंशन विभाग',
      nameEn: 'Pension Department',
      officerName: 'पुष्प लता तिवारी (पंचायत सहायिका)',
      officerPhone: '8931943436',
      headPhone: '9651035021',
    },
    {
      code: 'emergency',
      nameHi: 'आपातकालीन विभाग',
      nameEn: 'Emergency Department',
      officerName: 'SHO Bara',
      officerPhone: '9454402820',
      headPhone: '9454402820',
    },
    {
      code: 'electricity',
      nameHi: 'बिजली विभाग',
      nameEn: 'Electricity Department',
      officerName: 'श्री बलवंत चौहान (GPA)',
      officerPhone: '9839312578',
      headPhone: '9651035021',
    },
    {
      code: 'general',
      nameHi: 'सामान्य विभाग',
      nameEn: 'General Department',
      officerName: 'श्री बलवंत चौहान (GPA)',
      officerPhone: '9839312578',
      headPhone: '9651035021',
    },
  ]

  for (const dept of departments) {
    const result = await prisma.department.upsert({
      where: { code: dept.code },
      update: {
        nameHi: dept.nameHi,
        nameEn: dept.nameEn,
        officerName: dept.officerName,
        officerPhone: dept.officerPhone,
        headPhone: dept.headPhone,
        isActive: true,
      },
      create: dept,
    })
    console.log(`  ✅ Department: ${dept.nameEn} (${dept.code})`)
  }

  // ────────────────────────────────────────────────────────────────────────────
  // ROUTING RULES
  // ────────────────────────────────────────────────────────────────────────────
  const routingRules = [
    // Water
    { category: 'water_supply', departmentCode: 'water', priority: 'high', slaHours: 24, escalationLevel: 1 },
    // Roads
    { category: 'road_damage', departmentCode: 'roads', priority: 'high', slaHours: 48, escalationLevel: 1 },
    { category: 'drainage', departmentCode: 'roads', priority: 'medium', slaHours: 72, escalationLevel: 0 },
    // Electricity
    { category: 'electricity', departmentCode: 'electricity', priority: 'critical', slaHours: 4, escalationLevel: 2 },
    { category: 'street_lights', departmentCode: 'electricity', priority: 'medium', slaHours: 72, escalationLevel: 0 },
    // Sanitation
    { category: 'garbage_collection', departmentCode: 'sanitation', priority: 'medium', slaHours: 48, escalationLevel: 0 },
    // Certificates
    { category: 'birth_certificate', departmentCode: 'secretary', priority: 'low', slaHours: 168, escalationLevel: 0 },
    { category: 'death_certificate', departmentCode: 'secretary', priority: 'medium', slaHours: 72, escalationLevel: 0 },
    { category: 'family_register', departmentCode: 'secretary', priority: 'low', slaHours: 168, escalationLevel: 0 },
    // Housing
    { category: 'pm_awas_yojana', departmentCode: 'pradhan', priority: 'medium', slaHours: 168, escalationLevel: 0 },
    { category: 'cm_awas_yojana', departmentCode: 'pradhan', priority: 'medium', slaHours: 168, escalationLevel: 0 },
    // Pension
    { category: 'pension', departmentCode: 'pension', priority: 'medium', slaHours: 168, escalationLevel: 0 },
    { category: 'widow_pension', departmentCode: 'pension', priority: 'medium', slaHours: 168, escalationLevel: 0 },
    { category: 'old_age_pension', departmentCode: 'pension', priority: 'medium', slaHours: 168, escalationLevel: 0 },
    { category: 'disability_pension', departmentCode: 'pension', priority: 'high', slaHours: 72, escalationLevel: 1 },
    // Employment
    { category: 'mnrega', departmentCode: 'secretary', priority: 'medium', slaHours: 72, escalationLevel: 0 },
    // Land
    { category: 'land_records', departmentCode: 'secretary', priority: 'low', slaHours: 168, escalationLevel: 0 },
    // Schemes
    { category: 'government_schemes', departmentCode: 'pradhan', priority: 'low', slaHours: 168, escalationLevel: 0 },
    // Health
    { category: 'health_services', departmentCode: 'health', priority: 'high', slaHours: 24, escalationLevel: 1 },
    { category: 'anganwadi', departmentCode: 'health', priority: 'medium', slaHours: 72, escalationLevel: 0 },
    // Education
    { category: 'primary_school', departmentCode: 'education', priority: 'medium', slaHours: 72, escalationLevel: 0 },
    // Emergency
    { category: 'emergency', departmentCode: 'emergency', priority: 'emergency', slaHours: 1, escalationLevel: 3 },
    // General
    { category: 'general', departmentCode: 'general', priority: 'low', slaHours: 168, escalationLevel: 0 },
    { category: 'other', departmentCode: 'general', priority: 'low', slaHours: 168, escalationLevel: 0 },
  ]

  for (const rule of routingRules) {
    const result = await prisma.routingRule.upsert({
      where: { category: rule.category },
      update: {
        departmentCode: rule.departmentCode,
        priority: rule.priority,
        slaHours: rule.slaHours,
        escalationLevel: rule.escalationLevel,
        isActive: true,
      },
      create: rule,
    })
    console.log(`  ✅ Routing: ${rule.category} → ${rule.departmentCode} (${rule.priority}, ${rule.slaHours}h SLA)`)
  }

  console.log('\n🎉 Vapi system seed complete!')
  console.log(`  ${departments.length} departments seeded`)
  console.log(`  ${routingRules.length} routing rules seeded`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
