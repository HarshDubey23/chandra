# FEATURE_INVENTORY.md — Gram Panchayat Chandra Portal

> Phase 0 deliverable. Compiled by Task ID 0 (general-purpose recon agent).
> **Contract guarantee**: every feature listed below MUST survive the Awwwards redesign. NO feature may be deleted, merged away, or have its public API broken in later phases.
>
> Scope: `/home/z/my-project/src/` + `mini-services/vapi-webhook/` + `public/` + `messages/` + `prisma/`.
> Source state at audit time: Phase 0 kickoff, post-migration from `chandra` repo.

---

## 0. Project Skeleton (single-route SPA)

```
src/
├── app/
│   ├── api/                       # 40+ route handlers (Next.js 16 App Router)
│   ├── globals.css                # 67 KB HSL-token Tailwind v4 theme (to be rewritten OKLCH in Phase 2)
│   ├── layout.tsx                 # Root layout — Inter + Noto Devanagari + DM Serif + Geist Mono fonts
│   ├── page.tsx                   # The single "/" route — view-switcher via Zustand `useUI`
│   └── page.tsx.bak               # Backup of the original Next.js scaffold page (NOT loaded)
├── components/
│   ├── admin/                     # 17 admin panel components + lib.ts
│   ├── auth/                      # 4 auth components (Landing, OTP, Forgot, CitizenDashboard)
│   ├── portal/                    # 60 public-portal components (40+ user-visible sections + 20 chrome/utility)
│   └── ui/                        # 49 shadcn/ui primitives (untouched in redesign)
├── data/panchayat.ts              # Single-source-of-truth: PRADHAN, GPA, PANCHAYAT, IMPORTANT_NUMBERS
├── hooks/                         # use-mobile.ts, use-toast.ts
└── lib/                           # auth, db, audit, vapi, vapi-system-prompt, ui-store, auth-store,
                                   #   i18n, theme-store, notification-store, use-count-up, utils,
                                   #   seed.ts + 6 seed-* helper scripts
```

### Single `/` route & view states

The application is a **single-route SPA**. `src/app/page.tsx` reads `view` from the Zustand `useUI` store (in `src/lib/ui-store.ts`) and renders one of four view states:

| `view` value   | Component rendered              | Gate                                                                    |
| -------------- | ------------------------------- | ----------------------------------------------------------------------- |
| `home`         | `<PublicPortal />`              | `isAuthenticated \|\| isGuest` (otherwise LandingPage shown)           |
| `complaints`   | `<ComplaintTracking />`         | same                                                                    |
| `admin`        | `<AdminPanel />`                | same                                                                    |
| `dashboard`    | `<CitizenDashboard />`          | same — also auto-shown when role==='viewer' AND view is `home/dashboard`|

If `!showPortal` (not authenticated AND not guest), the entire SPA collapses to `<LandingPage />` (the cinematic loader → login/OTP/guest-entry screen).

`setView(v)` also smooth-scrolls to top. `scrollTarget` is a separate store slot for in-page navigation.

### Always-mounted chrome (regardless of view)
`TopBar`, `Header`, `Footer`, `ScrollProgress`, `BackToTop`, `ServiceWorkerRegister`, `InstallPrompt`, `<Toaster/>` (sonner + radix toasts from layout).

Conditionally mounted (page.tsx):
- `AnnouncementTicker` — only on `home`
- `AIVoiceButton`, `SimulateCallPanel`, `EmergencyQuickDial` — every view EXCEPT `admin`
- `QuickStats` — only on `home` AND not on citizen dashboard

---

## 1. Public Portal Components (`src/components/portal/`) — 60 files

Every file is `'use client'`. Order below mirrors the order they are mounted in `PublicPortal.tsx` (lines 59–101) followed by the floating/chrome components mounted in `page.tsx`. Component purpose + Prisma models touched + API routes called are listed.

### 1a. Sections mounted inside `<PublicPortal />` (in render order)

| # | File | Purpose | Prisma models / API routes touched |
|---|------|---------|------------------------------------|
| 1 | `Hero.tsx` | Cinematic hero with rotating real WhatsApp photos (flag-hoisting, school, gathering, water tanker, well), animated stat counters, CTAs to complaints/schemes, AI-voice call button | `SiteSettings` via `GET /api/profile?key=site_config`; calls `startVapiCall()` from `@/lib/vapi` |
| 2 | `ComplaintDashboard.tsx` | Live AI-Voice-Complaint-Pipeline transparency dashboard: counts, 7-day trend, resolution rate, category breakdown, department performance, ward distribution, pie chart | `GET /api/stats`, `GET /api/vapi/departments` |
| 3 | `RecentComplaints.tsx` | Transparency widget: total/pending/in-progress/resolved counts + AI-adoption % + list of last 5 public complaints (no PII) | `GET /api/stats`, `GET /api/complaints/list?limit=5&public=1` |
| 4 | `About.tsx` | Panchayat identity banner: code, block, district, photo of panchayat bhawan with flag hoisting, location tagline | static (`PANCHAYAT` constant from `src/data/panchayat.ts`) |
| 5 | `RepresentativesSection.tsx` | Pradhan + GPA cards with photo, name, designation, education, tenure, bio, contact buttons (call/WhatsApp) | static (`PRADHAN`, `GPA` constants) |
| 6 | `Schemes.tsx` | Government schemes accordion (MGNREGA, PMAY-G, JJM, SBM-G, ICDS, NSAP, PM-Kisan, GPDP) with OSINT scraped data inline | `GET /api/schemes`, `GET /api/scraped?portal=nrega`, `?portal=pmayg`, `?portal=jjm` |
| 7 | `SchemeEligibilityChecker.tsx` | Multi-step wizard: pick scheme → answer questions → see eligibility % + next steps. Covers PMAY-G, widow pension, old-age pension, PM-Kisan, MGNREGA, disability pension | static (no API) |
| 8 | `VillageStats.tsx` | Census-style stat cards (population, households, wards, literacy, sex ratio, workers) + scheme coverage donut | `GET /api/stats`, `GET /api/images`, `GET /api/content/schemes_coverage` |
| 9 | `VillageMap.tsx` | Static map image of Chandra village with key landmarks pinned (panchayat bhawan, school, handpumps, well) | `GET /api/profile?key=site_config` |
| 10 | `CensusSection.tsx` | Detailed 2011-census-style breakdown (SC/ST/OBC/Gen, main/marginal/non-workers, amenities) with disambiguation note | static |
| 11 | `VillageResources.tsx` | Civic amenities directory: panchayat bhawan, community hall, playground, cremation ground, handpumps, taps, street lights, solar panels | static |
| 12 | `WardMap.tsx` | 10-ward interactive map with population, households, representative name per ward | `GET /api/stats` |
| 13 | `StaffDirectory.tsx` | Searchable directory of all panchayat staff (Pradhan, GPA, ANM, headmaster, sanitation worker, panchayat assistant, SHO) with click-to-call | static |
| 14 | `DepartmentDirectory.tsx` | 11-department directory with officer name, phone, SLA, complaint categories routed to each | `GET /api/vapi/departments` |
| 15 | `BudgetSection.tsx` | GPDP budget allocation vs expenditure across 14th/15th finance commission grants, MGNREGA, PMAY-G, SBM with bar chart | static |
| 16 | `EducationSection.tsx` | Primary school info: enrolment, teachers, mid-day meal stats, infrastructure (classrooms, toilets, drinking water), results | `GET /api/content/education` |
| 17 | `MidDayMealMenu.tsx` | Weekly Monday–Saturday mid-day-meal menu card with Hindi day names | static |
| 18 | `SHGDirectory.tsx` | Self-Help Group directory: name, members, savings, activity, meeting day | static |
| 19 | `HealthSanitationSection.tsx` | Anganwadi + ANM + ASHA + sanitation (IHHL, public toilets, SBM coverage) stats | `GET /api/content/health` |
| 20 | `Infrastructure.tsx` | Roads, water, power, civic infrastructure cards with real WhatsApp photos as evidence | `GET /api/images` |
| 21 | `LocationMap.tsx` | Embedded OpenStreetMap iframe pointing at Chandra coords (25.187°N, 81.612°E) | static (external iframe) |
| 22 | `EmergencyContacts.tsx` | 100 / 108 / 112 + Pradhan / GPA / ANM / Headmaster / SHO / Fire / Women helpline / Child helpline cards with click-to-call | static |
| 23 | `WeatherAgriSection.tsx` | Live weather (Open-Meteo) + 7-day forecast + 30-day rainfall history + dry-spell + agri advisory | `GET /api/weather` (Open-Meteo upstream) |
| 24 | `VillageMarketplace.tsx` | Browse local produce/livestock/handcraft/equipment/services with category filter, seller info, click-to-call | `GET /api/marketplace` (public mode) |
| 25 | `GrievanceSection.tsx` | Grievance redressal mechanism explainer: 3-level escalation (Pradhan → BDO → DM), SLA per category, channels (AI voice, web form, WhatsApp, in-person), 4-step process | `GET /api/stats` |
| 26 | `CitizenServiceTracker.tsx` | Service-application tracker: birth/death cert, pension, PMAY, MGNREGA jobcard — bilingual step-by-step | static |
| 27 | `EventsCalendarSection.tsx` | Gram Sabha dates + Independence Day + Republic Day + other events calendar | static |
| 28 | `GramSabha.tsx` | Gram Sabha explainer: what it is, powers, meeting schedule, attendance, decisions, role of citizens | static |
| 29 | `PollsSection.tsx` | Citizen polls: active polls, vote once (localStorage flag + server voterKey), results as horizontal bars | `GET /api/polls`, `POST /api/polls/[id]/vote` |
| 30 | `RTISection.tsx` | RTI Act 2005 explainer: how to file, PIO, First Appellate Authority, fees, Section 4(1)(b) mandatory disclosures accordion | static |
| 31 | `DownloadsSection.tsx` | Downloadable government forms (birth/death cert, income/caste/domicile cert, PMAY, pension) with print + .txt download | static |
| 32 | `SuccessStories.tsx` | Beneficiary success stories: PMAY-G house completion, pension approval, MGNREGA employment, water connection | static |
| 33 | `FAQSection.tsx` | Bilingual FAQ accordion covering services, schemes, complaints, RTI, contact | static |
| 34 | `PhotoGallery.tsx` | Filterable photo gallery of real WhatsApp images (88 photos) with category filter + lightbox | `GET /api/images` |
| 35 | `VideoGallery.tsx` | 3 real WhatsApp videos with custom thumbnail + play in modal | static (reads `/public/whatsapp/VID-*.mp4`) |
| 36 | `VillageTimeline.tsx` | Historical timeline of Gram Chandra (1996 panchayat formation → 2021 election → 2026 AI portal launch) | static |
| 37 | `Announcements.tsx` | Latest announcements (pinned first, non-expired) + notices accordion | `GET /api/announcements`, `GET /api/notices` |
| 38 | `BlogSection.tsx` | Blog post cards (published only, with cover image, category, author, tags) | `GET /api/posts?limit=20` |
| 39 | `PortalFeedback.tsx` | Homepage satisfaction-pulse widget: 1-5 star rating + optional comment, persisted to localStorage (anonymous, no PII) | localStorage only (no API) |
| 40 | `AboutPortal.tsx` | About-the-portal card: tech stack, OSINT-verified badge, DPDP 2023 compliance, zero-budget open-source | static |
| 41 | `ContactUsSection.tsx` | Contact form (name, phone, message) that creates a complaint + panchayat office address + map link | `POST /api/complaints/create` |
| 42 | `WhatsAppShareButton.tsx` | Fixed-position WhatsApp share FAB that opens `wa.me/?text=…` | static |

### 1b. Chrome / utility / floating components (mounted in `page.tsx` or `Header`)

| File | Purpose | API / store touch |
|------|---------|-------------------|
| `TopBar.tsx` | Slim utility strip above header: live Hindi date/time clock, panchayat location, Pradhan + GPA phone numbers. Hydration-safe. | static + interval timer |
| `Header.tsx` | Sticky main header: tricolor logo, language switcher, dark-mode toggle, export-report dropdown, global-search (Ctrl+K), mobile sheet nav, admin/dashboard/login/logout buttons, AI-voice call CTA | `useUI`, `useAuth`, `useI18n`, `useTheme` stores; `startVapiCall()` |
| `Footer.tsx` | Footer with quick links, important numbers, government portal links (eGramSwaraj, NREGA, PMAY-G, JJM), DPDP compliance note, AI-voice call CTA | static |
| `AnnouncementTicker.tsx` | Premium horizontal marquee of latest announcements below header. Pauses on hover. Dismissible per session. | `GET /api/announcements` |
| `ScrollProgress.tsx` | Saffron→green gradient progress bar fixed at top showing reading progress | static |
| `BackToTop.tsx` | Floating arrow FAB that appears after 1 viewport of scroll, smooth-scrolls to top | static |
| `AIVoiceButton.tsx` | Floating mic FAB + call-detail panel. Starts/stops Vapi call, shows live call state, detected category, live transfer info, call duration, post-call summary with tracking ID + "Track Complaint" CTA | `startVapiCall()`, `stopVapiCall()`, `subscribeCallState()`, `onVapiEvent('error'|'function-call')`, `sendFunctionCallResult()`; `POST /function-call?XTransformPort=3003` (proxied to mini-service) |
| `SimulateCallPanel.tsx` | 7-step wizard dialog that simulates a Vapi voice call (collects name/phone/village/ward/category/description/priority → calls `registerComplaint` function → displays tracking ID + routing). Used when Vapi assistant is unavailable. | `POST /function-call?XTransformPort=3003` |
| `EmergencyQuickDial.tsx` | Expandable FAB with quick-dial buttons for Police/Ambulance/Fire/Women/Child/Poison-Control/Electricity/Water | static (`tel:` links) |
| `QuickStats.tsx` | Compact KPI strip that slides up from bottom after hero is scrolled past. Dismissible per session. Hidden on mobile. | `GET /api/content/village_stats`, `GET /api/stats` |
| `ServiceWorkerRegister.tsx` | Registers `/sw.js`, polls for updates every 60 min, shows a "new version available" toast | `navigator.serviceWorker` |
| `InstallPrompt.tsx` | PWA install banner (beforeinstallprompt event). 7-day dismiss persistence. | `localStorage` |
| `LanguageSwitcher.tsx` | HI/EN dropdown toggle in header | `useI18n` store |
| `DarkModeToggle.tsx` | Light/Dark/Auto dropdown toggle in header | `useTheme` store |
| `ExportReport.tsx` | Dropdown in header: "Print/PDF" (browser print dialog) + "Copy summary" (clipboard) | static |
| `GlobalSearch.tsx` | Ctrl+K / Cmd+K dialog with debounced search across announcements, notices, posts, complaints, marketplace, schemes, FAQ, representatives, etc. | `GET /api/search?q=…` |
| `BlurImage.tsx` | Reusable blur-up image component (used in galleries) | static |
| `ImageLightbox.tsx` | Modal lightbox for full-size image view with caption | static |
| `ScrollReveal.tsx` | Reusable wrapper that reveals children on scroll into view (IntersectionObserver + framer-motion) | static |
| `ComplaintLiveStatus.tsx` | (Re-exported / merged into ComplaintDashboard — component file still exists as a sub-implementation; the live-status KPI cards) | `GET /api/stats` |
| `ComplaintTracking.tsx` | The full "Track a Complaint" view (`view='complaints'`). Tracking-ID lookup, web-complaint form, post-resolution feedback, notification subscription, print receipt, AI-voice CTA | `POST /api/complaints/create`, `GET /api/complaints/track?id=…`, `POST /api/feedback`, `POST /api/notifications/subscribe`; `startVapiCall()` |
| `CitizenFeedback.tsx` | 1-5 star post-resolution feedback widget with optional comment. Persists to localStorage if API unreachable. | `POST /api/feedback`; localStorage fallback |
| `NotificationSubscription.tsx` | Subscribe to status updates for a tracking ID (phone + channel: SMS/WhatsApp/Both) | `POST /api/notifications/subscribe` |
| `DocumentChecklist.tsx` | Reference card listing documents required for various services (identity, residence, income, caste, birth, death, etc.) with copy & print | static |
| `SchemeDataCards.tsx` | OSINT data cards: NREGA / PMAY-G / JJM with stats from scraped data | `GET /api/scraped?portal=nrega\|pmayg\|jjm` |
| `VillageResources.tsx` | (already listed above) |  |
| `PublicPortal.tsx` | The composition root: imports + renders all 42 sections above in order. Includes print-only header for PDF export. | (none directly) |

### 1c. Component count summary
- Sections mounted in `PublicPortal.tsx`: **42**
- Chrome/floating/utility components: **18**
- Total files in `src/components/portal/`: **60** (all `'use client'`)

---

## 2. Admin Components (`src/components/admin/`) — 17 files

All mounted as tabs inside `<AdminPanel />`. RBAC rules: `admin` (full), `secretary` (content + complaints), `viewer` (read-only).

| File | Purpose | RBAC | API routes / Prisma models touched |
|------|---------|------|------------------------------------|
| `AdminPanel.tsx` | Login gate + sticky-tabbed admin shell. Renders login form if unauthenticated; otherwise renders `<Tabs>` with role-filtered tabs. | all (gate) | `GET /api/admin/me`, `POST /api/admin/login`, `POST /api/admin/logout` |
| `Dashboard.tsx` | Stats overview: complaint KPIs, 7-day trend, category breakdown, ward analytics, feedback distribution, performance goals | viewer+ | `GET /api/stats`, `GET /api/complaints/list`, `GET /api/feedback/stats`, `GET /api/complaints/stats`, `GET /api/analytics/wards` |
| `ComplaintManager.tsx` | Full complaint CRUD: list/filter/search, status update, bulk-update (up to 50), assign to user, resolution note, send WhatsApp to citizen, export CSV | secretary+ | `GET /api/complaints/list`, `POST /api/complaints/update`, `POST /api/complaints/bulk-update`, `POST /api/admin/send-whatsapp`, `GET /api/complaints/export` |
| `AnnouncementsManager.tsx` | Create/delete announcements (bilingual title/body, pin, expiry), notices listing | secretary+ (create), admin (delete) | `GET /api/announcements`, `POST /api/announcements`, `DELETE /api/announcements?id=…` |
| `FeedbackDashboard.tsx` | Paginated citizen-feedback list with rating filter + trackingId filter | viewer+ | `GET /api/feedback?page=…&limit=…` |
| `NotificationBell.tsx` | Admin notification bell with unread badge + dropdown panel showing latest complaints/feedback/poll-votes | all | `GET /api/admin/notifications?since=…`, EventSource `/api/sse/notifications` |
| `ProfileEditor.tsx` | Edit Pradhan / Secretary / Site-config JSON blobs (name, photo, education, bio, contact, address, panchayat codes) | secretary+ | `GET /api/profile`, `POST /api/profile` |
| `ContentEditor.tsx` | Edit dynamic `ContentSection` JSON blobs (village_stats, infrastructure, education, health, schemes_coverage) | admin | `GET /api/content/[key]`, `PUT /api/content/[key]` |
| `PollsManager.tsx` | Create bilingual polls (2-6 options), close/reopen, edit question, delete (cascades options + votes) | admin | `GET /api/polls`, `POST /api/polls`, `PATCH /api/polls/[id]`, `DELETE /api/polls/[id]` |
| `ImageManager.tsx` | Image gallery management: list, filter by category, edit captions/category, toggle public | secretary+ | `GET /api/images`, `PATCH /api/images` |
| `ImageUploadDialog.tsx` | Upload dialog: multipart form → Sharp WebP conversion (1600×1600 max, q=82) → ImageAsset row | secretary+ | `POST /api/images/upload` |
| `UserManagement.tsx` | List users, create new (admin/secretary/viewer), edit role/name/phone, reset password, delete (self-delete & self-demotion blocked) | admin | `GET /api/admin/users`, `POST /api/admin/users`, `PATCH /api/admin/users/[id]`, `DELETE /api/admin/users/[id]` |
| `MarketplaceManager.tsx` | Approve/reject/mark-sold pending marketplace items, edit fields, delete | admin | `GET /api/marketplace?admin=true`, `PATCH /api/marketplace/[id]`, `DELETE /api/marketplace/[id]` |
| `BlogManager.tsx` | List/create/edit/delete blog posts (draft/publish/archive, category, tags, cover image, rich content) | secretary+ | `GET /api/posts?limit=50`, `POST /api/posts`, `PATCH /api/posts/[slug]`, `DELETE /api/posts/[slug]` |
| `CsvUpload.tsx` | CSV bulk upload with PII detection (Aadhaar/Bank/IFSC/Mobile/PAN), preview mode + confirm mode, PII auto-redaction on insert | admin | `POST /api/admin/csv-upload` (multipart) |
| `ActivityLog.tsx` | Immutable admin activity log viewer + CSV export | admin | `GET /api/admin/activity?limit=…`, `GET /api/admin/activity/export` |
| `SendWhatsAppTool.tsx` | Send arbitrary WhatsApp message to any number (real-or-mock via mini-service) | secretary+ | `POST /api/admin/send-whatsapp` |
| `lib.ts` | Shared types (`SessionUser`), complaint statuses/categories, image taxonomy (30 dot-notation categories), CSV portal list, badge palettes, locale-aware date formatters, bilingual labels | n/a | (shared lib) |

---

## 3. Auth Components (`src/components/auth/`) — 4 files

| File | Purpose | API routes touched |
|------|---------|--------------------|
| `LandingPage.tsx` | Cinematic loading screen → login form (email/password) + "Continue as Guest" + "Login with Phone OTP" + signup link + forgot-password link. Shows live stats counters + hero photo. | `POST /api/admin/login` (via `useAuth.login`), `GET /api/announcements` (ticker) |
| `OTPLogin.tsx` | Phone-based OTP login: send OTP → 6-digit input grid (auto-advance) → verify. Creates new viewer account if phone unknown. | `POST /api/auth/otp-send`, `POST /api/auth/otp-verify` (via `useAuth.sendOtp` / `verifyOtp`) |
| `ForgotPasswordModal.tsx` | Email-based password reset request — generates secure token, stored in SiteSettings, returned to UI in demo mode. | `POST /api/auth/forgot-password` (via `useAuth.forgotPassword`) |
| `CitizenDashboard.tsx` | Citizen dashboard (role='viewer'): shows user info, lists their complaints (lookup by phone), tracks each. | `POST /api/complaints/mine` |

---

## 4. API Endpoints (`src/app/api/`) — 40 routes

Method, path, Zod-validation status, Prisma models touched.

> **Zod validation status**: NONE of the routes use Zod. The codebase imports `zod` (`^4.0.2`) in `package.json` but no `z.object` / `z.string` / `z.number` calls exist anywhere in `src/`. All input validation is manual (typeof checks + `.includes()` allowlists + `.trim().slice(N)` length caps). See BACKEND_AUDIT.md §2 for the full action-required list.

### 4a. Auth routes (`src/app/api/auth/`)

| Method | Path | Validated? | Prisma models | Notes |
|--------|------|-----------|---------------|-------|
| POST | `/api/auth/signup` | manual | `User` | Creates viewer; password ≥8 chars; email uniqueness check; sets session cookie |
| POST | `/api/auth/otp-send` | manual | `User`, `SiteSettings` | 10-digit phone normalized; OTP stored in SiteSettings with 5-min expiry; **demo mode returns OTP in response body** |
| POST | `/api/auth/otp-verify` | manual | `User`, `SiteSettings` | Verifies OTP, creates viewer if phone unknown, random password, deletes OTP row |
| POST | `/api/auth/forgot-password` | manual | `User`, `SiteSettings` | 1-hour reset token; **demo mode returns token in response body** |

### 4b. Admin routes (`src/app/api/admin/`)

| Method | Path | Validated? | Prisma models | Notes |
|--------|------|-----------|---------------|-------|
| POST | `/api/admin/login` | manual | `User`, `AdminActivityLog` | Rate-limit: 5/min per IP via AdminActivityLog count; sets httpOnly cookie |
| POST | `/api/admin/logout` | n/a | none | Deletes cookie |
| GET | `/api/admin/me` | n/a | `User` (via getSessionUser) | Returns session user or null |
| GET | `/api/admin/users` | n/a | `User` | admin-only |
| POST | `/api/admin/users` | manual | `User`, `AdminActivityLog` | admin-only; password ≥6 chars |
| PATCH | `/api/admin/users/[id]` | manual | `User`, `AdminActivityLog` | admin-only; self-demotion blocked |
| DELETE | `/api/admin/users/[id]` | n/a | `User`, `AdminActivityLog` | admin-only; self-delete blocked |
| GET | `/api/admin/notifications` | n/a | `Complaint`, `CitizenFeedback`, `PollVote` | auth-required; `?since=ISO` for delta |
| POST | `/api/admin/send-whatsapp` | manual | `AdminActivityLog` | secretary+; proxies to vapi-webhook:3003 |
| GET | `/api/admin/activity` | n/a | `AdminActivityLog` | auth-required; `?limit=N` (max 500) |
| GET | `/api/admin/activity/export` | n/a | `AdminActivityLog` | admin-only; CSV download |
| POST | `/api/admin/csv-upload` | manual | `ScrapedData`, `AdminActivityLog` | multipart; PII auto-redact; preview + confirm modes |

### 4c. Complaint routes (`src/app/api/complaints/`)

| Method | Path | Validated? | Prisma models | Notes |
|--------|------|-----------|---------------|-------|
| POST | `/api/complaints/create` | manual | `Complaint` | Public (no auth); in-memory rate-limit 5/10min per IP; phone hashed to `MOB_<sha256-first-16>` for DPDP |
| GET | `/api/complaints/list` | n/a | `Complaint` | `?public=1` returns public-safe fields (no phone, no transcript); `?limit=N` (max 50). Authenticated mode returns full fields |
| GET | `/api/complaints/track?id=…` | n/a | `Complaint` | Public; strips sensitive fields |
| POST | `/api/complaints/mine` | manual | `Complaint` | Public; lookup by phone digits |
| POST | `/api/complaints/update` | manual | `Complaint`, `AdminActivityLog` | secretary+; appends timeline; sends WhatsApp to citizen + Pradhan |
| POST | `/api/complaints/bulk-update` | manual | `Complaint`, `AdminActivityLog` | secretary+; max 50 items |
| GET | `/api/complaints/stats` | n/a | `Complaint` | viewer+; 6-month trend |
| GET | `/api/complaints/export` | n/a | `Complaint` | auth; CSV with priority field |

### 4d. Content & announcements

| Method | Path | Validated? | Prisma models | Notes |
|--------|------|-----------|---------------|-------|
| GET | `/api/announcements` | n/a | `Announcement` | Public; non-expired only |
| POST | `/api/announcements` | manual | `Announcement`, `AdminActivityLog` | secretary+ |
| DELETE | `/api/announcements?id=…` | n/a | `Announcement`, `AdminActivityLog` | admin |
| GET | `/api/notices` | n/a | `Notice` | Public |
| GET | `/api/posts` | n/a | `Post` | Public=published only; auth=all |
| POST | `/api/posts` | manual | `Post`, `AdminActivityLog` | secretary+; auto-slug from title |
| GET | `/api/posts/[slug]` | n/a | `Post` | Public=published only |
| PATCH | `/api/posts/[slug]` | manual | `Post`, `AdminActivityLog` | secretary+ |
| DELETE | `/api/posts/[slug]` | n/a | `Post`, `AdminActivityLog` | admin |
| GET | `/api/content/[key]` | n/a | `ContentSection` | Public |
| PUT | `/api/content/[key]` | manual | `ContentSection`, `AdminActivityLog` | admin |
| GET | `/api/profile?key=…` | n/a | `SiteSettings` | Public; pradhan/secretary/site_config |
| POST | `/api/profile` | manual | `SiteSettings`, `AdminActivityLog` | auth; allowlist `['pradhan','secretary','site_config']` |

### 4e. Vapi / Voice pipeline

| Method | Path | Validated? | Prisma models | Notes |
|--------|------|-----------|---------------|-------|
| GET | `/api/vapi/config` | n/a | none | Returns assistant config + system prompt + 24 categories |
| GET | `/api/vapi/departments` | n/a | `Department`, `RoutingRule` | Public |
| POST | `/api/vapi/departments` | manual | `Department` | **No auth check — ACTION REQUIRED** (see audit) |
| GET | `/api/vapi/routing` | n/a | `RoutingRule`, `Department` | Public |
| POST | `/api/vapi/routing` | manual | `RoutingRule`, `Department` | **No auth check — ACTION REQUIRED** (see audit) |
| POST | `/api/vapi/call-end` | manual | `CallRecord`, `Complaint`, `Escalation`, `Department` | **No auth check — ACTION REQUIRED**; legacy stub — superseded by mini-service `/function-call` |

### 4f. Other public/admin routes

| Method | Path | Validated? | Prisma models | Notes |
|--------|------|-----------|---------------|-------|
| GET | `/api/stats` | n/a | `Complaint`, `ImageAsset`, `ScrapedData`, `CitizenFeedback` | Public; 7-day trends, category breakdown, 5-year performance, goals tracker, DB file size |
| GET | `/api/schemes` | n/a | `ScrapedData` | Public; group by portal |
| GET | `/api/scraped?portal=…&recordType=…` | n/a | `ScrapedData` | Public; max 100 records |
| GET | `/api/weather` | n/a | none | Open-Meteo upstream (current + 7-day forecast + 30-day rainfall archive) |
| GET | `/api/search?q=…` | n/a | `Announcement`, `Notice`, `Post`, `Complaint`, `MarketplaceItem` | Public; min 2 chars; dedupes; max 20 results |
| GET | `/api/images` | n/a | `ImageAsset` | Public=isPublic only; auth=all |
| PATCH | `/api/images` | manual | `ImageAsset`, `AdminActivityLog` | auth |
| POST | `/api/images/upload` | multipart | `ImageAsset`, `AdminActivityLog` | auth; Sharp WebP; 10 MB max; JPEG/PNG/WebP/GIF/BMP |
| GET | `/api/marketplace` | n/a | `MarketplaceItem` | Public=approved+active; `?admin=true`=all (auth) |
| POST | `/api/marketplace` | manual | `MarketplaceItem` | Public submissions auto-unapproved; admin submissions auto-approved |
| PATCH | `/api/marketplace/[id]` | manual | `MarketplaceItem` | admin; actions: approve, reject, mark-sold, edit |
| DELETE | `/api/marketplace/[id]` | n/a | `MarketplaceItem` | admin |
| GET | `/api/polls` | n/a | `Poll`, `PollOption`, `PollVote` | Public |
| POST | `/api/polls` | manual | `Poll`, `PollOption`, `AdminActivityLog` | admin; 2-6 options |
| PATCH | `/api/polls/[id]` | manual | `Poll`, `AdminActivityLog` | admin; close/reopen/edit |
| DELETE | `/api/polls/[id]` | n/a | `Poll`, `PollOption`, `PollVote`, `AdminActivityLog` | admin; cascades |
| POST | `/api/polls/[id]/vote` | manual | `Poll`, `PollOption`, `PollVote` | Public; voterKey=sha256(ip+ua+pollId); unique constraint |
| POST | `/api/feedback` | manual | `CitizenFeedback`, `Complaint` | Public; 1-5 rating; verifies trackingId exists |
| GET | `/api/feedback?page=…&limit=…&trackingId=…` | n/a | `CitizenFeedback` | viewer+ |
| GET | `/api/feedback/stats` | n/a | `CitizenFeedback` | viewer+; distribution + avg |
| GET | `/api/notifications/subscribe?trackingId=…` | n/a | `NotificationSubscription` | Public |
| POST | `/api/notifications/subscribe` | manual | `NotificationSubscription`, `Complaint` | Public |
| DELETE | `/api/notifications/subscribe?id=…` | n/a | `NotificationSubscription` | Public |
| GET | `/api/sse/notifications` | n/a | `Complaint`, `Announcement` | SSE stream; 10s poll; 30s heartbeat |
| GET | `/api/sse/complaints` | n/a | `Complaint` | SSE stream; 3s poll; 25s heartbeat |
| GET | `/api/analytics/wards` | n/a | `MarketplaceItem` | viewer+ |
| GET | `/api/server-url` | n/a | none | Public; returns Vapi server URL for dashboard paste |
| GET | `/api/route` | n/a | none | Scaffold hello-world route (vestigial) |

**Total**: 47 distinct route handlers across 40 files (some files export multiple HTTP methods).

---

## 5. Server Actions / Client Stores / Hooks / Lib Utilities

### 5a. Zustand stores (`src/lib/*-store.ts` + `i18n.ts`)

| Store | File | Persistence | Purpose |
|-------|------|-------------|---------|
| `useUI` | `src/lib/ui-store.ts` | none | `view: 'home'\|'complaints'\|'admin'\|'dashboard'`, `setView`, `scrollTarget` |
| `useAuth` | `src/lib/auth-store.ts` | none | user, isAuthenticated, isGuest, otpSent, otpPhone, otpDemoCode, resetToken. Actions: login, signup, sendOtp, verifyOtp, forgotPassword, logout, setGuestMode, checkSession |
| `useI18n` | `src/lib/i18n.ts` | `localStorage 'gpchandra-locale'` | `locale: 'hi' \| 'en'`, `setLocale`, `toggle`, helper `t(hi, en, locale)` |
| `useTheme` | `src/lib/theme-store.ts` | `localStorage 'gpchandra-theme'` | `theme: 'light' \| 'dark' \| 'auto'`, `resolved`, `setTheme`, `toggle`, `applyInitialTheme`. Light→Dark→Auto→Light cycle. |
| `useNotificationStore` | `src/lib/notification-store.ts` | `localStorage 'gp-chandra-notifications'` | Admin notification badge: unread counts (complaints/feedback/pollVotes), notifications array, markAllAsRead, clearAll, resetFromApi |

### 5b. Hooks (`src/hooks/`)

| Hook | File | Purpose |
|------|------|---------|
| `useIsMobile` | `src/hooks/use-mobile.ts` | True if `window.innerWidth < 768`. Listens to `(max-width: 767px)` media query. |
| `useToast` / `toast` | `src/hooks/use-toast.ts` | Radix-toast-based toast manager (TOAST_LIMIT=1, TOAST_REMOVE_DELAY=1000000ms) |
| `useCountUp` | `src/lib/use-count-up.ts` | Animates a number from 0 to `end` over `duration` ms. Starts when element enters viewport (IntersectionObserver, threshold 0.3). Ease-out cubic. |

### 5c. Lib utilities (`src/lib/`)

| File | Purpose |
|------|---------|
| `db.ts` | Prisma client singleton (cached on `globalThis`). Forces fresh client if schema changed. Logs queries in dev. |
| `auth.ts` | scrypt password hashing (per-user random 16-byte salt, keylen=64). Backward-compatible legacy SHA-256 fallback. HMAC-signed session tokens (7-day expiry, constant-time compare). RBAC helpers `requireRole(cookieHeader, role)`. Throws in production if `SESSION_SECRET` missing. |
| `auth-store.ts` | (see 5a) |
| `audit.ts` | `logActivity({adminId, action, entityType, entityId, before, after, ip, userAgent})` → immutable insert into `AdminActivityLog`. Never throws — errors only `console.error`. |
| `vapi.ts` | Vapi SDK wrapper. Monkey-patches `console.error` at module-load to filter "Meeting ended" noise. `startVapiCall(assistantId?)`, `startVapiCallWithConfig(config)`, `stopVapiCall()`, `subscribeCallState(cb)`, `onVapiEvent(event, handler)`, `sendFunctionCallResult(callId, result)`, `isCallActive()`. Installs global `unhandledrejection` filter for Vapi SDK noise. |
| `vapi-system-prompt.ts` | The full bilingual Hindi-first system prompt (8 sections: language style, panchayat info, call workflow, classification, function-calling, rules). `VAPI_ASSISTANT_CONFIG` (OpenAI gpt-4o + ElevenLabs Hindi voice + Deepgram nova-2 hi transcriber + 4 functions). `COMPLAINT_CATEGORIES` array of 24 codes → department map. |
| `ui-store.ts` | (see 5a) |
| `i18n.ts` | (see 5a) |
| `theme-store.ts` | (see 5a) |
| `notification-store.ts` | (see 5a) |
| `utils.ts` | `cn(...inputs)` — `tailwind-merge(clsx(inputs))` |
| `use-count-up.ts` | (see 5b) |
| `seed.ts` | Main DB seed (run via `bun run src/lib/seed.ts`). See §10. |
| `seed-content-sections.ts` | Seeds ContentSection rows: village_stats, infrastructure, education, health, schemes_coverage. |
| `seed-content.ts` | Seeds MarketplaceItem (6 approved items) + Post (3 published blog posts). |
| `seed-vapi.ts` | Seeds Department (11 depts: water, roads, secretary, pradhan, health, education, sanitation, pension, electricity, emergency, general) + RoutingRule (24 rich categories → dept code, priority, SLA). |
| `seed-polls.ts` | Seeds 3 active polls with options + sample votes. |
| `seed-images.ts` | Seeds ImageAsset rows from `whatsapp-image-mapping.json` + `public/whatsapp/` JPG files. |
| `seed-images-verified.ts` | VLM-verified image seed (uses `scripts/vlm-one.ts` outputs). |
| `seed-all-images.ts` | Bulk-seed all images from `public/whatsapp-optimized/` with VLM metadata. |

### 5d. Data constants

| File | Purpose |
|------|---------|
| `src/data/panchayat.ts` | Single source of truth for `PRADHAN`, `GPA`, `PANCHAYAT`, `IMPORTANT_NUMBERS`, `OFFICE_ADDRESS`. All real phone numbers (+91 96510 35021 Pradhan, +91 98393 12578 GPA, etc.) live here. |

---

## 6. Prisma Models (`prisma/schema.prisma`) — 20 models

Provider: SQLite. JSON stored as String. 20 tables generated.

| Model | Purpose | Key fields |
|-------|---------|-----------|
| `User` | Auth + RBAC. `admin` (Pradhan) / `secretary` (GPA) / `viewer` (citizen) | email (unique), passwordHash (scrypt$salt$hash), phone (hashed) |
| `SiteSettings` | Key/value JSON blob store for editable entities | key (PK): `pradhan` / `secretary` / `site_config` / `gpdp_year` / `otp_<phone>` / `reset_<email>` |
| `Announcement` | Bilingual pinned announcements with expiry | titleHi/En, bodyHi/En, imageUrl, pdfUrl, pinned, expiresAt |
| `Notice` | Bilingual notices (general/scheme/meeting/tender) | titleHi/En, bodyHi/En, pdfUrl, category |
| `ImageAsset` | Image library (gallery + evidence). 30+ dot-notation categories | imageId (unique), sha256, category, facesDetected, piiFlag, isPublic, chatContext JSON, exif JSON, geoInferred JSON |
| `Complaint` | Citizen complaints (voice or web). 7 short categories, 4 statuses | trackingId (unique), vapiCallId, callerName, callerPhone (hashed), callReason, rawTranscript, timeline JSON |
| `ScrapedData` | OSINT-verified records from 9 government portals | portal, sourceUrl, recordType, data JSON, contentHash, piiRedactions, isOverridden, overrideValue/Reason/By/At |
| `ScrapeAudit` | Per-attempt scrape audit log (§3.6) | attemptId (unique), portal, httpStatus, contentHashSha256, recordsExtracted, durationMs, userAgent, robotsAllowed |
| `AdminActivityLog` | IMMUTABLE insert-only audit log of every admin mutation | adminId, action (update/delete/override/upload/login/logout/create/send_whatsapp/send_message), entityType, entityId, before JSON, after JSON, ip, userAgent |
| `CitizenFeedback` | 1-5 star post-resolution feedback linked to trackingId | trackingId, rating (1-5), comment, language |
| `Poll` | Bilingual citizen polls | questionHi/En, descriptionHi/En, status (active/closed), startDate, endDate, createdBy |
| `PollOption` | Poll options (2-6 per poll) | pollId, textHi/En, order |
| `PollVote` | Anonymous vote (voterKey = sha256(ip+ua+pollId), unique per poll) | pollId, optionId, voterKey |
| `MarketplaceItem` | Village marketplace listings (6 categories, 4 price types) | titleHi/En, sellerNameHi/En, sellerPhone, sellerWard, price, priceType, isApproved, status |
| `Post` | Blog/CMS posts (5 categories, 3 statuses) | title, slug (unique), excerpt, content (HTML), coverImage, tags JSON, authorId, publishedAt |
| `ContentSection` | Dynamic JSON blobs for admin-editable portal data | key (PK), data JSON, updatedBy |
| `NotificationSubscription` | Citizen subscription to complaint status updates | trackingId, phone, channel (sms/whatsapp/both), active |
| `Department` | Vapi department directory (11 codes) | code (unique), nameHi/En, officerName, officerPhone, headPhone |
| `RoutingRule` | Complaint category → department routing + SLA | category (unique), departmentCode, priority (low/medium/high/critical/emergency), slaHours, escalationLevel |
| `CallRecord` | Vapi call records (rich metadata) | vapiCallId (unique), callerPhone, citizenName, villageName, wardNumber, category, priority, departmentCode, transferTarget, transferStatus, complaintId, transcript, recordingUrl, duration, aiConfidence, suggestedAction, language, status |
| `Escalation` | Complaint/call escalations (levels 1-5) | complaintId, callId, level, reason, notifiedTo, status |

**Total**: 20 models (initial worklog said "16+" — actually 20).

---

## 7. Vapi / WhatsApp Pipeline — Full Trace

### 7a. End-to-end voice-complaint flow

```
[Citizen on home page]
   │
   │ clicks AIVoiceButton FAB  (src/components/portal/AIVoiceButton.tsx)
   ▼
[startVapiCall()]  (src/lib/vapi.ts:133)
   │
   │ imports @vapi-ai/web SDK dynamically, instantiates Vapi(publicKey)
   │ installs console.error monkey-patch + unhandledrejection filter
   │ to swallow "Meeting ended" noise from Vapi SDK
   ▼
[vapi.start(assistantId)]  → Vapi cloud (gpt-4o + 11labs Hindi voice + Deepgram nova-2 hi)
   │
   │ AI runs VAPI_SYSTEM_PROMPT (src/lib/vapi-system-prompt.ts)
   │   - 8-step workflow: greeting → citizen info → classify → details
   │     → priority → department routing → transfer or register → closing
   │   - 24 complaint categories mapped to 11 departments
   │   - 4 functions: registerComplaint, transferCall, getRoutingInfo, endCall
   ▼
[AI emits function-call event]  → AIVoiceButton's onVapiEvent('function-call') handler
   │
   │ POST /function-call?XTransformPort=3003   ← routed by Caddy gateway to mini-service
   │ body: { toolCallId, functionCall: { name, parameters } }
   ▼
[mini-services/vapi-webhook/index.ts:handleFunctionCall]  (port 3003)
   │
   │ switch(fnName):
   │   - registerComplaint → handleRegisterComplaint
   │   - transferCall      → handleTransferCall
   │   - getRoutingInfo    → handleGetRoutingInfo
   │   - endCall           → handleEndCall
   ▼
[Prisma Client → SQLite at db/custom.db]
   │
   │ inserts/updates: Complaint, CallRecord, Department lookup, RoutingRule lookup, Escalation
   ▼
[WhatsApp dispatch]  (dispatchWhatsApp)
   │
   │ if WHATSAPP_TOKEN + WHATSAPP_PHONE_ID set:
   │   POST https://graph.facebook.com/v25.0/<phoneId>/messages
   │   (Bearer token, text message)
   │ else:
   │   mock — append to whatsapp-outbox.log + console.log
   ▼
[Recipients] (deduped by phone digits)
   │
   │ 1. Pradhan (ADMIN_WHATSAPP env, default 9651035021)
   │ 2. Department officer (Department.officerPhone)
   │ 3. Department head (Department.headPhone, if different)
   │ 4. Citizen (callerPhone) — confirmation message with tracking ID
   ▼
[Broadcast event]  (broadcastEvent)
   │
   │ appends JSON line to broadcast.log: { event, payload, ts }
   │ (consumed by /api/sse/complaints for live admin dashboard updates)
   ▼
[Response]  → AIVoiceButton
   │
   │ sendFunctionCallResult(toolCallId, result)  → vapi.send({type:'function-call-result', callId, result})
   │ updates UI: detectedCategory, callSummary{trackingId, department, officer}, liveTransfer
   ▼
[Call ends]
   │
   │ vapi 'call-end' event → setState('idle')
   │ post-call summary panel with tracking ID + "Track Complaint" CTA
   │ → setView('complaints') navigates to tracking page
```

### 7b. Vapi end-of-call-report webhook (alternative entry point)

When Vapi's dashboard is configured with the Server URL (`/api/server-url` returns it), Vapi POSTs the end-of-call-report directly to the mini-service:

```
POST /vapi-webhook?XTransformPort=3003   (gateway-routed)
   │
   │ 1. IP allowlist check (VAPI_IP_ALLOWLIST env, comma-separated)
   │ 2. Read raw body, preserve for HMAC
   │ 3. HMAC-SHA256 verify (x-vapi-signature header, VAPI_SECRET)
   │    - DEV MODE (VAPI_SECRET unset or 'dev-secret') → SKIPPED with warning
   │ 4. Parse JSON: message.call.{id, customer.number, transcript, analysis.structuredData}
   │ 5. Idempotency: if Complaint exists with this vapiCallId → return deduped
   │ 6. Insert Complaint + CallRecord (+ Escalation if transfer failed)
   │ 7. WhatsApp dispatch (Pradhan + officer + head + citizen)
   │ 8. Broadcast event 'complaint:new'
   ▼
{ ok: true, trackingId, complaintId, callRecordId }
```

### 7c. Mini-service endpoints (port 3003, hardcoded)

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/health` | Liveness probe → `{ok:true, service:'vapi-webhook', port:3003, ts}` |
| `GET` | `/` | HTML documentation page (with curl examples + back-to-portal link) |
| `POST` | `/vapi-webhook` (also `/webhook`) | Main Vapi end-of-call-report handler (IP allowlist + HMAC + dedupe + insert + WhatsApp) |
| `POST` | `/function-call` | Dispatch a Vapi function-call payload to the right handler (called by AIVoiceButton + SimulateCallPanel) |
| `POST` | `/send-whatsapp` | Send arbitrary WhatsApp message `{to, message}` (called by `/api/admin/send-whatsapp` and `/api/complaints/update`) |
| `POST` | `/broadcast` | Internal broadcast hook (writes to `broadcast.log` for SSE polling) |

### 7d. WhatsApp dispatch behavior

- **Real mode**: when `WHATSAPP_TOKEN` + `WHATSAPP_PHONE_ID` env vars set → POST to `https://graph.facebook.com/v25.0/<phoneId>/messages` with `Bearer <token>` auth, `messaging_product: 'whatsapp'`, `type: 'text'`, body text.
- **Mock mode** (current sandbox): both env vars empty → `dispatchWhatsApp` calls `sendWhatsAppCloudApi` which returns false → message is appended to `whatsapp-outbox.log` + console.log with `[mock]` tag.
- **Audit trail**: every dispatch (sent OR mock) is logged to `whatsapp-outbox.log` with timestamp, tag, recipient, and message body.
- **Deduplication**: recipients deduped by phone digits within a single complaint registration (Pradhan who is also dept head gets ONE message).

### 7e. Vapi assistant configuration (`src/lib/vapi-system-prompt.ts`)

```ts
VAPI_ASSISTANT_CONFIG = {
  name: "Chandra Sahayak — चंद्रा सहायक",
  model: { provider: 'openai', model: 'gpt-4o', temperature: 0.3, maxTokens: 500 },
  voice: { provider: '11labs', voiceId: 'pNInz6obpgDQGcFmaJgB', speed: 0.95 },
  firstMessage: "नमस्ते! मैं चंद्रा सहायक हूँ…",
  transcriber: { provider: 'deepgram', model: 'nova-2', language: 'hi' },
  serverMessages: ['transcript', 'function-call', 'hang', 'call-end', 'speech-end'],
  recordingEnabled: true,
  functions: [registerComplaint, transferCall, getRoutingInfo, endCall],
}
```

Assistant ID: `b3bcf257-175c-48d3-b333-365baa4eaaab` (env `NEXT_PUBLIC_VAPI_ASSISTANT_ID`)
Public key: `3df5c626-6216-47ac-85f6-d0a6b683cbb2` (env `NEXT_PUBLIC_VAPI_PUBLIC_KEY`)

---

## 8. PWA Assets

### 8a. `public/manifest.json`
- `name`: "ग्राम पंचायत चंद्रा — डिजिटल शासन पोर्टल"
- `short_name`: "GP Chandra"
- `start_url`: "/"
- `display`: "standalone"
- `orientation`: "portrait-primary"
- `background_color`: "#fbf7f0"
- `theme_color`: "#c2410c"
- `lang`: "hi", `dir`: "ltr"
- `categories`: ["government", "civic", "productivity"]
- `icons`: `/logo.svg` (any size, SVG)
- `shortcuts`: Track Complaint, View Schemes, View Budget

### 8b. `public/sw.js` (Service Worker v3)
- **Precache app shell**: `/`, `/manifest.json`, `/logo.svg`, `/offline.html`
- **Image cache** (`gpchandra-images-v1`): cache-first for WebP/JPG/PNG/SVG/GIF
- **API requests** (`/api/*`): network-first, fall back to cache, return 503 JSON if offline
- **Other GET requests**: stale-while-revalidate, navigation requests fall back to `/offline.html`
- Skips non-GET and cross-origin requests
- Activate event: deletes old caches (keeps current SW_VERSION + IMAGE_CACHE)

### 8c. `public/offline.html`
- Bilingual OKLCH-styled offline page
- Tricolor bar + "ग्रा" logo + "आप अभी ऑफ़लाइन हैं" message
- Reconnect button (reloads page)
- 4 info cards: Panchayat office phone, panchayat code, address, emergency numbers
- Auto-reloads when `online` event fires

### 8d. Install prompt
- `src/components/portal/InstallPrompt.tsx`
- Listens for `beforeinstallprompt` event
- 7-day dismiss persistence in `localStorage 'gpchandra-install-dismissed'`
- Hides if `display-mode: standalone` (already installed)

### 8e. Service worker registration
- `src/components/portal/ServiceWorkerRegister.tsx`
- Registers `/sw.js` on mount
- Polls for updates every 60 minutes
- Shows "new version available" toast when update found (reload on next `beforeunload`)

---

## 9. i18n System

### 9a. Architecture
- Custom Zustand store (`src/lib/i18n.ts`) — NOT `next-intl` (despite being a dependency)
- `locale: 'hi' | 'en'`, default `'hi'` (Hindi-first per master doc §8.1)
- Persisted to `localStorage 'gpchandra-locale'` via `zustand/middleware/persist`
- `t(hi, en, locale)` helper for picking a localized string inline
- `<html lang>` attribute kept in sync with locale via `useEffect` in `page.tsx`

### 9b. Message catalogs
- `messages/en.json` — 156 lines, 7 top-level keys: `meta`, `nav`, `hero`, `sections`, `about`, `schemes`, `gallery`, `complaints`, `admin`, `footer`, `common`
- `messages/hi.json` — 156 lines, parallel structure
- Both files are reference catalogs — most components actually use inline `t(hiStr, enStr, locale)` calls rather than reading from the JSON. The JSON is used primarily by `LandingPage.tsx` and a few chrome components.

### 9c. Language toggle
- `LanguageSwitcher.tsx` in header — HI/EN dropdown
- `useI18n.toggle()` flips locale

---

## 10. Seed Data (`src/lib/seed.ts` + 6 helper seeds)

### 10a. Main seed (`bun run src/lib/seed.ts`) — 545 lines

1. **Users** (2): `pradhan@chandra-gp.in` / `chandra2026` (admin), `gpa@chandra-gp.in` / `secretary2026` (secretary). Phones stored as `MOB_<sha256-first-10>`.
2. **SiteSettings** (3 keys): `pradhan` (name, photo, education, mobile_hashed, mobile_last4, email, tenure, bio), `secretary` (name, photo, designation, mobile_hashed, email), `site_config` (panchayat_code 3145021064, block_code, district_code, state_code, names, tehsil, fin_year, vehicle_prefix, coords, gpdp_year, office_address, total_wards 11, villages_under_gp 1, population_ref note).
3. **ImageAssets** (88+): real WhatsApp photographs from `public/whatsapp/IMG-*.jpg`. Curated `KNOWN` mapping for 18 photos (Pradhan portrait, school building, gram sabha, water tanker, well, etc.). Bulk round-robin across 10 categories (infrastructure.road, water.handpump, scheme.mgnrega, scheme.pmay-g, event.gram-sabha, health.anganwadi, infrastructure.school, infrastructure.civic, infrastructure.agriculture, scheme.pension). Each row has sha256, hiCaption, enCaption, schemeLogos JSON, chatContext JSON, exif JSON, geoInferred JSON, facesDetected, confidence 0.95.
4. **ScrapedData** (10 records): NREGA (3 — panchayat_profile, jobcard, fto), eGramSwaraj (gp_profile), PMAY-G (beneficiary), LG Directory (profile), PB2 (pradhan_profile), JJM (water_status), Census (village_directory), ICDS (anganwadi). All with sourceUrl provenance, contentHash, piiRedactions count, piiRedactionTypes JSON.
5. **ScrapeAudit** (10 entries): one per scraped record, with attemptId, httpStatus 200, durationMs random 800-3800, userAgent Chrome/Linux, robotsAllowed true.
6. **Complaints** (3 sample): `GPCH-DEMO001` (water, InProgress), `GPCH-DEMO002` (housing, Resolved with ₹40,000 3rd installment note), `GPCH-DEMO003` (road, Pending). All with full timeline JSON.
7. **Announcements** (3): Independence Day flag hoisting, Gram Sabha meeting, PMAY-G beneficiary list.
8. **Notices** (2): Water supply interruption, road repair notice.

### 10b. Helper seed scripts

| Script | Run with | What it adds |
|--------|----------|--------------|
| `src/lib/seed-content-sections.ts` | `bun run src/lib/seed-content-sections.ts` | 5 ContentSection rows: `village_stats` (population 1247, households 187, literacy 67.8%, sex ratio 912), `infrastructure` (roads, water, power, civic, sanitation), `education` (school stats), `health` (anganwadi, ANM, ASHA), `schemes_coverage` (MGNREGA, PMAY-G, JJM, SBM, ICDS, NSAP, PM-Kisan, GPDP coverage %) |
| `src/lib/seed-vapi.ts` | `bun run src/lib/seed-vapi.ts` | 11 Department rows (water, roads, secretary, pradhan, health, education, sanitation, pension, electricity, emergency, general) + 24 RoutingRule rows (one per COMPLAINT_CATEGORIES code, with priority + SLA hours) |
| `src/lib/seed-polls.ts` | `bun run src/lib/seed-polls.ts` | 3 active Polls (development priority, sanitation feedback, water supply timing) with 4 options each + sample PollVote rows |
| `src/lib/seed-content.ts` | `bun run src/lib/seed-content.ts` | 6 MarketplaceItem rows (tomatoes, wheat flour, goat milk, clay pots, equipment rental, tailoring) + 3 Post rows (published blog posts) |
| `src/lib/seed-images.ts` | `bun run src/lib/seed-images.ts` | Seeds ImageAsset from `whatsapp-image-mapping.json` if present, else infers captions |
| `src/lib/seed-images-verified.ts` | `bun run src/lib/seed-images-verified.ts` | VLM-verified image seed (uses `scripts/vlm-one.ts` outputs to set accurate category + caption) |
| `src/lib/seed-all-images.ts` | `bun run src/lib/seed-all-images.ts` | Bulk-seed all WebP images from `public/whatsapp-optimized/` with VLM metadata from mapping JSON |

---

## 11. Build & Runtime Configuration

### 11a. `package.json` scripts
- `dev`: `next dev -p 3000 2>&1 | tee dev.log`
- `build`: `next build && cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/`
- `start`: `NODE_ENV=production bun .next/standalone/server.js 2>&1 | tee server.log`
- `lint`: `eslint .`
- `db:push`: `prisma db push --accept-data-loss`
- `db:generate`: `prisma generate`
- `db:migrate`: `prisma migrate dev`
- `db:reset`: `prisma migrate reset`

### 11b. `next.config.ts`
- `output: 'standalone'`
- `typescript.ignoreBuildErrors: true` ⚠️ (Phase 2 will harden)
- `reactStrictMode: false` ⚠️ (Phase 2 will enable)
- `allowedDevOrigins`: `preview-chat-*.space-z.ai`, `*.space-z.ai`, `localhost`, `127.0.0.1`

### 11c. `tsconfig.json`
- `strict: true` but `noImplicitAny: false`
- `target: ES2017`, `module: esnext`, `moduleResolution: bundler`
- Path alias: `@/* → ./src/*`

### 11d. Fonts (`src/app/layout.tsx`)
- `Inter` (Latin, `--font-inter`)
- `Noto_Sans_Devanagari` (Devanagari, weights 400/500/600/700, `--font-devanagari`)
- `DM_Serif_Display` (Latin, weight 400, `--font-dm-serif`)
- `Geist_Mono` (Latin mono, `--font-geist-mono`)

### 11e. Tailwind / styling
- Tailwind v4 (`@import "tailwindcss"` in `globals.css`)
- `tailwind.config.ts` is largely vestigial — references `tailwindcss-animate` (v3 plugin). Tokens live in `globals.css` `@theme inline` block. Both must be kept in sync.
- `globals.css` is 67 KB with HSL tokens (to be rewritten to OKLCH in Phase 2 without breaking existing class references).
- shadcn/ui components in `src/components/ui/` (49 primitives) — untouched by redesign.

### 11f. Other config files
- `postcss.config.mjs`, `eslint.config.mjs`, `components.json` (shadcn config), `Caddyfile` (gateway: routes `/vapi-webhook?XTransformPort=3003` to port 3003)

---

## 12. Static Public Assets (`public/`)

| Asset | Purpose |
|-------|---------|
| `/logo.svg` | PWA icon, favicon, apple-touch-icon |
| `/manifest.json` | PWA manifest |
| `/sw.js` | Service worker v3 |
| `/offline.html` | Offline fallback page |
| `/robots.txt` | SEO robots |
| `/pradhan-portrait.png` | Pradhan portrait (alternative to webp) |
| `/uploads/<uuid>.webp` | Admin-uploaded images (Sharp-processed) |
| `/whatsapp/IMG-*.jpg` (88 files) | Original WhatsApp photos (JPG) |
| `/whatsapp/VID-*.mp4` (3 files) + `*-thumb.jpg` | Original WhatsApp videos + thumbnails |
| `/whatsapp-optimized/IMG-*.webp` (88 files) | Optimized WebP versions for fast loading |
| `/whatsapp-optimized/VID-*-thumb.webp` | WebP video thumbnails |

---

## 13. Feature Inventory Summary

| Category | Count |
|----------|-------|
| Routes (single `/`) | 1 route, 4 view states |
| Public portal components (sections) | 42 |
| Public portal components (chrome/utility) | 18 |
| Total `src/components/portal/` files | 60 |
| Admin components | 17 (incl. `lib.ts`) |
| Auth components | 4 |
| shadcn/ui primitives | 49 |
| API route handlers | 47 handlers across 40 files |
| Zustand stores | 5 |
| Hooks | 3 (use-mobile, use-toast, use-count-up) |
| Lib utilities | 16 files |
| Prisma models | 20 |
| Mini-service endpoints (port 3003) | 6 |
| Seed scripts | 7 |
| PWA assets | 4 (manifest, sw, offline, install prompt) |
| i18n catalogs | 2 (en.json, hi.json, 156 lines each) |
| Public static image assets | 88 JPG + 88 WebP + 3 MP4 + 3 WebP thumbs |

**ZERO features may be deleted in subsequent phases.** This inventory is the contract.
