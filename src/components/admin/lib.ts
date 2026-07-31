'use client'
// Shared types, constants, and helpers for the admin panel.
// §4.4 taxonomy + complaint status palette + locale-aware formatters.

import type { Locale } from '@/lib/i18n'

export interface SessionUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'secretary' | 'viewer'
}

// ────────────────────────────────────────────────────────────────────────────
// Complaint taxonomy (mirrors prisma schema categories)
// ────────────────────────────────────────────────────────────────────────────
export type ComplaintStatus = 'Pending' | 'InProgress' | 'Resolved' | 'Rejected'

export const COMPLAINT_STATUSES: ComplaintStatus[] = [
  'Pending',
  'InProgress',
  'Resolved',
  'Rejected',
]

export const COMPLAINT_CATEGORIES = [
  'water',
  'road',
  'school',
  'housing',
  'pension',
  'mgnrega',
  'other',
] as const

// ────────────────────────────────────────────────────────────────────────────
// Image category taxonomy (§4.4 — hierarchical dot-notation)
// ────────────────────────────────────────────────────────────────────────────
export const IMAGE_CATEGORIES = [
  'representatives.pradhan',
  'representatives.office',
  'representatives.secretary',
  'infrastructure.panchayat_bhawan',
  'infrastructure.water.well',
  'infrastructure.water.handpump',
  'infrastructure.water.tanker',
  'infrastructure.water.tank',
  'infrastructure.water.pipeline',
  'infrastructure.construction.well',
  'infrastructure.construction.building',
  'infrastructure.construction.trench',
  'infrastructure.road',
  'infrastructure.streetlight',
  'education.school_building',
  'education.school_entrance',
  'education.classroom',
  'education.mid_day_meal',
  'community.ceremony',
  'community.admin',
  'community.children',
  'community.independence_day',
  'community.flag_hoisting',
  'community.gathering',
  'community.kitchen',
  'community.training',
  'community.courtyard',
  'community.elderly',
  'agriculture.spraying',
  'agriculture.farming',
] as const

// ────────────────────────────────────────────────────────────────────────────
// CSV upload portal options
// ────────────────────────────────────────────────────────────────────────────
export const CSV_PORTALS = [
  'nrega',
  'egramswaraj',
  'pmayg',
  'lgdirectory',
  'pb2',
  'census',
  'jjm',
  'udise',
  'icds',
  'csv_upload',
] as const

// ────────────────────────────────────────────────────────────────────────────
// Status badge palette (uses warm Indian palette — saffron, green, terracotta)
// ────────────────────────────────────────────────────────────────────────────
export function statusBadgeClass(status: string): string {
  switch (status) {
    case 'Pending':
      return 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-900/40 dark:text-amber-100 dark:border-amber-700'
    case 'InProgress':
      return 'bg-orange-100 text-orange-900 border-orange-300 dark:bg-orange-900/40 dark:text-orange-100 dark:border-orange-700'
    case 'Resolved':
      return 'bg-green-100 text-green-900 border-green-300 dark:bg-green-900/40 dark:text-green-100 dark:border-green-700'
    case 'Rejected':
      return 'bg-red-100 text-red-900 border-red-300 dark:bg-red-900/40 dark:text-red-100 dark:border-red-700'
    default:
      return 'bg-muted text-muted-foreground border-border'
  }
}

// Activity log action palette (per task spec: login=blue→we use saffron/amber
// to stay in palette, update=green, delete=red, upload=purple, override=orange,
// create=green). NOTE: spec says login=blue but palette forbids blue — we use
// a cyan-teal that reads as blue-ish while staying in the warm/green palette.
export function actionBadgeClass(action: string): string {
  switch (action) {
    case 'login':
    case 'logout':
      return 'bg-teal-100 text-teal-900 border-teal-300 dark:bg-teal-900/40 dark:text-teal-100 dark:border-teal-700'
    case 'update':
    case 'create':
      return 'bg-green-100 text-green-900 border-green-300 dark:bg-green-900/40 dark:text-green-100 dark:border-green-700'
    case 'delete':
      return 'bg-red-100 text-red-900 border-red-300 dark:bg-red-900/40 dark:text-red-100 dark:border-red-700'
    case 'upload':
      return 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-900/40 dark:text-purple-100 dark:border-purple-700'
    case 'override':
      return 'bg-orange-100 text-orange-900 border-orange-300 dark:bg-orange-900/40 dark:text-orange-100 dark:border-orange-700'
    default:
      return 'bg-muted text-muted-foreground border-border'
  }
}

// PII type label (bilingual)
export function piiTypeLabel(type: string, locale: Locale): string {
  const map: Record<string, { hi: string; en: string }> = {
    AADHAAR: { hi: 'आधार', en: 'Aadhaar' },
    BANK_AC: { hi: 'बैंक खाता', en: 'Bank A/C' },
    IFSC: { hi: 'IFSC', en: 'IFSC' },
    MOBILE: { hi: 'मोबाइल', en: 'Mobile' },
    PAN: { hi: 'PAN', en: 'PAN' },
  }
  return (map[type]?.[locale]) || type
}

// ────────────────────────────────────────────────────────────────────────────
// Locale-aware formatters
// ────────────────────────────────────────────────────────────────────────────
export function formatDateTime(iso: string | Date | null | undefined, locale: Locale): string {
  if (!iso) return '—'
  const d = typeof iso === 'string' ? new Date(iso) : iso
  if (isNaN(d.getTime())) return '—'
  try {
    return new Intl.DateTimeFormat(locale === 'hi' ? 'hi-IN' : 'en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(d)
  } catch {
    return d.toISOString()
  }
}

export function formatDate(iso: string | Date | null | undefined, locale: Locale): string {
  if (!iso) return '—'
  const d = typeof iso === 'string' ? new Date(iso) : iso
  if (isNaN(d.getTime())) return '—'
  try {
    return new Intl.DateTimeFormat(locale === 'hi' ? 'hi-IN' : 'en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(d)
  } catch {
    return d.toISOString()
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Bilingual category labels
// ────────────────────────────────────────────────────────────────────────────
export function categoryLabel(category: string, locale: Locale): string {
  const map: Record<string, { hi: string; en: string }> = {
    water: { hi: 'पानी', en: 'Water' },
    road: { hi: 'सड़क', en: 'Road' },
    school: { hi: 'विद्यालय', en: 'School' },
    housing: { hi: 'आवास', en: 'Housing' },
    pension: { hi: 'पेंशन', en: 'Pension' },
    mgnrega: { hi: 'मनरेगा', en: 'MGNREGA' },
    other: { hi: 'अन्य', en: 'Other' },
  }
  return (map[category]?.[locale]) || category
}

export function statusLabel(status: string, locale: Locale): string {
  const map: Record<string, { hi: string; en: string }> = {
    Pending: { hi: 'लंबित', en: 'Pending' },
    InProgress: { hi: 'प्रगति पर', en: 'In Progress' },
    Resolved: { hi: 'हल', en: 'Resolved' },
    Rejected: { hi: 'अस्वीकृत', en: 'Rejected' },
  }
  return (map[status]?.[locale]) || status
}

export function actionLabel(action: string, locale: Locale): string {
  const map: Record<string, { hi: string; en: string }> = {
    login: { hi: 'लॉगिन', en: 'Login' },
    logout: { hi: 'लॉगआउट', en: 'Logout' },
    update: { hi: 'अपडेट', en: 'Update' },
    create: { hi: 'निर्माण', en: 'Create' },
    delete: { hi: 'हटाना', en: 'Delete' },
    upload: { hi: 'अपलोड', en: 'Upload' },
    override: { hi: 'ओवरराइड', en: 'Override' },
  }
  return (map[action]?.[locale]) || action
}

export function entityTypeLabel(entityType: string, locale: Locale): string {
  const map: Record<string, { hi: string; en: string }> = {
    auth: { hi: 'प्रमाणीकरण', en: 'Auth' },
    pradhan: { hi: 'प्रधान', en: 'Pradhan' },
    secretary: { hi: 'सचिव', en: 'Secretary' },
    announcement: { hi: 'घोषणा', en: 'Announcement' },
    complaint: { hi: 'शिकायत', en: 'Complaint' },
    scraped_data: { hi: 'स्क्रैप्ड डेटा', en: 'Scraped Data' },
    image: { hi: 'छवि', en: 'Image' },
    site_config: { hi: 'साइट कॉन्फ़िग', en: 'Site Config' },
  }
  return (map[entityType]?.[locale]) || entityType
}
