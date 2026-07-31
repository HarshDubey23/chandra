// Global search API — searches across announcements, notices, posts, schemes,
// complaints (by tracking ID), FAQ entries, and representatives.
// Master doc §5.4. Returns ranked results with type + section anchor.
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim().toLowerCase()
  if (!q || q.length < 2) return NextResponse.json({ results: [] })

  const results: { type: string; title: string; subtitle: string; href: string; icon: string }[] = []

  // 1. Announcements
  try {
    const anns = await db.announcement.findMany({ take: 50 })
    for (const a of anns) {
      if (a.titleHi.toLowerCase().includes(q) || a.titleEn.toLowerCase().includes(q) || a.bodyHi.toLowerCase().includes(q) || a.bodyEn.toLowerCase().includes(q)) {
        results.push({ type: 'announcement', title: a.titleHi, subtitle: a.bodyHi.slice(0, 80), href: '#announcements', icon: 'bell' })
      }
    }
  } catch { /* ignore */ }

  // 2. Notices
  try {
    const notices = await db.notice.findMany({ take: 50 })
    for (const n of notices) {
      if (n.titleHi.toLowerCase().includes(q) || n.titleEn.toLowerCase().includes(q) || n.bodyHi.toLowerCase().includes(q)) {
        results.push({ type: 'notice', title: n.titleHi, subtitle: n.bodyHi.slice(0, 80), href: '#announcements', icon: 'file' })
      }
    }
  } catch { /* ignore */ }

  // 3. Posts (published only)
  try {
    const posts = await db.post.findMany({ where: { status: 'published' }, take: 50 })
    for (const p of posts) {
      if (p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q)) {
        results.push({ type: 'post', title: p.title, subtitle: p.excerpt.slice(0, 80), href: '#blog', icon: 'newspaper' })
      }
    }
  } catch { /* ignore */ }

  // 4. Complaints (by tracking ID or name)
  try {
    const complaints = await db.complaint.findMany({ take: 100 })
    for (const c of complaints) {
      if (c.trackingId.toLowerCase().includes(q) || c.callerName.toLowerCase().includes(q) || c.callReason.toLowerCase().includes(q)) {
        results.push({ type: 'complaint', title: `${c.trackingId} — ${c.callerName}`, subtitle: c.callReason.slice(0, 80), href: 'complaints', icon: 'message' })
      }
    }
  } catch { /* ignore */ }

  // 5. Marketplace items
  try {
    const items = await db.marketplaceItem.findMany({ where: { isApproved: true }, take: 50 })
    for (const m of items) {
      if (m.titleHi.toLowerCase().includes(q) || m.titleEn.toLowerCase().includes(q)) {
        results.push({ type: 'marketplace', title: m.titleHi, subtitle: `₹${m.price || 'free'} • ${m.category}`, href: '#marketplace', icon: 'store' })
      }
    }
  } catch { /* ignore */ }

  // 6. Static content — schemes, FAQ, representatives (keyword match)
  const STATIC_KEYWORDS = [
    { kw: ['pmay', 'आवास', 'housing', 'मकान'], title: 'PMAY-G आवास योजना', subtitle: 'प्रधानमंत्री आवास योजना ग्रामीण', href: '#schemes', icon: 'home', type: 'scheme' },
    { kw: ['mgnrega', 'मनरेगा', 'नरेगा', 'employment'], title: 'MGNREGA योजना', subtitle: 'महात्मा गांधी राष्ट्रीय ग्रामीण रोजगार गारंटी अधिनियम', href: '#schemes', icon: 'briefcase', type: 'scheme' },
    { kw: ['pension', 'पेंशन', 'वृद्धा', 'विधवा', 'दिव्यांग'], title: 'पेंशन योजनाएँ', subtitle: 'वृद्धा/विधवा/दिव्यांग पेंशन', href: '#schemes', icon: 'wallet', type: 'scheme' },
    { kw: ['water', 'जल', 'हैंडपंप', 'handpump', 'पानी'], title: 'जल आपूर्ति / Water Supply', subtitle: 'हैंडपंप, पाइपलाइन, जल जीवन मिशन', href: '#infrastructure', icon: 'droplet', type: 'infrastructure' },
    { kw: ['road', 'सड़क', 'पक्का', 'pmgsy'], title: 'सड़क निर्माण / Roads', subtitle: 'पीएमजीएसवाई पक्की सड़कें', href: '#infrastructure', icon: 'road', type: 'infrastructure' },
    { kw: ['school', 'विद्यालय', 'शिक्षा', 'education'], title: 'विद्यालय / Education', subtitle: 'प्राथमिक विद्यालय, शिक्षा', href: '#education', icon: 'graduation', type: 'education' },
    { kw: ['health', 'स्वास्थ्य', 'आंगनवाड़ी', 'anganwadi'], title: 'स्वास्थ्य / Health', subtitle: 'आंगनवाड़ी, स्वास्थ्य केंद्र', href: '#health', icon: 'heart', type: 'health' },
    { kw: ['pradhan', 'प्रधान', 'sangita', 'संगीता', 'mishra', 'मिश्रा'], title: 'श्रीमती संगीता मिश्रा — ग्राम प्रधान', subtitle: '2021-2026 कार्यकाल, बी.ए. बी.टी.सी.', href: '#representatives', icon: 'user', type: 'representative' },
    { kw: ['gpa', 'अधिकारी', 'balwant', 'बलवंत', 'chauhan', 'चौहान'], title: 'श्री बलवंत चौहान — ग्राम पंचायत अधिकारी', subtitle: 'प्रशासनिक अधिकारी', href: '#representatives', icon: 'user', type: 'representative' },
    { kw: ['budget', 'बजट', 'gpdp'], title: 'पंचायत बजट', subtitle: 'GPDP बजट एवं व्यय', href: '#budget', icon: 'rupee', type: 'budget' },
    { kw: ['rti', 'सूचना अधिकार'], title: 'सूचना का अधिकार अधिनियम (RTI)', subtitle: 'RTI 2005 आवेदन', href: '#rti', icon: 'scale', type: 'rti' },
    { kw: ['poll', 'सर्वेक्षण', 'vote', 'मतदान'], title: 'नागरिक सर्वेक्षण / Polls', subtitle: 'अपनी राय दें', href: '#polls', icon: 'vote', type: 'poll' },
    { kw: ['marketplace', 'बाजार', 'बिक्री', 'बाजार'], title: 'ग्राम बाजार', subtitle: 'कृषि उत्पाद एवं सेवाएँ', href: '#marketplace', icon: 'store', type: 'marketplace' },
    { kw: ['gallery', 'गैलरी', 'फोटो', 'photos'], title: 'फोटो गैलरी', subtitle: '88 वास्तविक ग्राम चित्र', href: '#gallery', icon: 'image', type: 'gallery' },
    { kw: ['video', 'वीडियो', ' clips'], title: 'वीडियो गैलरी', subtitle: '3 वास्तविक ग्राम वीडियो', href: '#videos', icon: 'video', type: 'video' },
    { kw: ['blog', 'ब्लॉग', 'समाचार', 'news'], title: 'ब्लॉग एवं समाचार', subtitle: 'पंचायत प्रकाशन', href: '#blog', icon: 'newspaper', type: 'post' },
    { kw: ['ward', 'वार्ड'], title: 'वार्ड नक्शा', subtitle: '10 वार्ड विवरण', href: '#wards', icon: 'map', type: 'ward' },
    { kw: ['timeline', 'इतिहास', 'history'], title: 'ग्राम इतिहास टाइमलाइन', subtitle: 'ऐतिहासिक मील के पत्थर', href: '#timeline', icon: 'clock', type: 'timeline' },
    { kw: ['faq', 'सहायता', 'help', 'प्रश्न'], title: 'अक्सर पूछे जाने वाले प्रश्न (FAQ)', subtitle: 'सहायता एवं मार्गदर्शन', href: '#faq', icon: 'help', type: 'faq' },
  ]
  for (const s of STATIC_KEYWORDS) {
    if (s.kw.some(k => k.includes(q) || q.includes(k))) {
      results.push({ type: s.type, title: s.title, subtitle: s.subtitle, href: s.href, icon: s.icon })
    }
  }

  // Dedupe by title, limit to 20
  const seen = new Set<string>()
  const deduped = results.filter(r => {
    if (seen.has(r.title)) return false
    seen.add(r.title)
    return true
  }).slice(0, 20)

  return NextResponse.json({ results: deduped, query: q })
}
