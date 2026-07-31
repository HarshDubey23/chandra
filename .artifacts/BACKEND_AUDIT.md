# BACKEND_AUDIT.md — Gram Panchayat Chandra Portal

> Phase 0 deliverable. Compiled by Task ID 0 (general-purpose recon agent).
> Security + correctness audit of the Chandra backend (Next.js 16 API routes + Prisma + Vapi webhook mini-service + auth + i18n + PWA).
> **No source code was modified.** This is a pure read-only audit. Findings feed Phase 5 (production hardening) and must be resolved before any production deploy.

---

## 1. Environment Variables

### 1a. Complete inventory (`process.env.*` references)

Grep across `src/` + `mini-services/vapi-webhook/`:

| Variable | Public? | Used in | Purpose |
|----------|---------|---------|---------|
| `DATABASE_URL` | secret | `prisma/schema.prisma`, `mini-services/vapi-webhook/index.ts:37-39`, `src/app/api/stats/route.ts:120` (via `process.cwd()` join, not env) | SQLite file path. Hardcoded fallback in mini-service: `file:<SERVICE_DIR>/../../db/custom.db` |
| `SESSION_SECRET` | secret | `src/lib/auth.ts:18, 22, 27` | HMAC secret for session tokens. Throws in production if <16 chars. Dev fallback: `'gpchandra-dev-fallback-secret-please-change'` |
| `NEXT_PUBLIC_VAPI_PUBLIC_KEY` | **public** (exposed to client) | `src/lib/vapi.ts:63`, `src/app/api/vapi/config/route.ts:18` | Vapi SDK public key |
| `NEXT_PUBLIC_VAPI_ASSISTANT_ID` | **public** (exposed to client) | `src/lib/vapi.ts:137`, `src/app/api/vapi/config/route.ts:19` | Vapi assistant ID |
| `VAPI_SECRET` | secret | `mini-services/vapi-webhook/index.ts:41` | HMAC secret for Vapi webhook signature verification |
| `VAPI_WEBHOOK_BASE` | secret (server-side) | `src/app/api/complaints/update/route.ts:10` | Mini-service base URL (default `http://localhost:3003`) |
| `VAPI_IP_ALLOWLIST` | secret | `mini-services/vapi-webhook/index.ts:42` | Comma-separated IP allowlist for webhook |
| `WHATSAPP_TOKEN` | secret | `mini-services/vapi-webhook/index.ts:183`, `src/app/api/vapi/call-end/route.ts:193` | Meta WhatsApp Cloud API bearer token |
| `WHATSAPP_PHONE_ID` | secret | `mini-services/vapi-webhook/index.ts:184`, `src/app/api/vapi/call-end/route.ts:194` | Meta WhatsApp phone ID |
| `ADMIN_WHATSAPP` | secret (but contains phone PII) | `mini-services/vapi-webhook/index.ts:46`, `src/app/api/complaints/update/route.ts:11`, `src/app/api/vapi/call-end/route.ts:195` | Pradhan's WhatsApp number (default `9651035021`) |
| `NODE_ENV` | public | `src/lib/db.ts:17,20`, `src/lib/auth.ts:22`, `src/components/portal/ServiceWorkerRegister.tsx:15` | Standard Node env flag |

### 1b. `.env` file contents (CONFIRMED EXISTS at `/home/z/my-project/.env`)

```
DATABASE_URL=file:/home/z/my-project/db/custom.db
SESSION_SECRET=chandra-dev-secret-replace-in-production-9f3a7c2e
NEXT_PUBLIC_VAPI_PUBLIC_KEY=3df5c626-6216-47ac-85f6-d0a6b683cbb2
NEXT_PUBLIC_VAPI_ASSISTANT_ID=b3bcf257-175c-48d3-b333-365baa4eaaab
VAPI_SECRET=dev-secret
VAPI_WEBHOOK_BASE=http://localhost:3003
WHATSAPP_TOKEN=
WHATSAPP_PHONE_ID=
ADMIN_WHATSAPP=919651035021
VAPI_IP_ALLOWLIST=
```

**Findings:**
- ✅ `.env` exists at project root.
- ✅ `.gitignore` line 34: `.env*` — excludes `.env`, `.env.local`, `.env.production`, etc.
- ✅ Public vars correctly prefixed with `NEXT_PUBLIC_`.
- ⚠️ `VAPI_SECRET=dev-secret` — HMAC verification SKIPPED in dev mode (`DEV_MODE = VAPI_SECRET === '' || VAPI_SECRET === 'dev-secret'`). **ACTION REQUIRED**: set a strong secret before production.
- ⚠️ `WHATSAPP_TOKEN=` and `WHATSAPP_PHONE_ID=` empty — WhatsApp runs in MOCK mode (logs to `whatsapp-outbox.log`). Acceptable for sandbox; required for production.
- ⚠️ `VAPI_IP_ALLOWLIST=` empty — webhook accepts requests from ANY IP in dev mode (with warning). **ACTION REQUIRED**: set to Vapi egress IPs before production.
- ⚠️ `SESSION_SECRET=chandra-dev-secret-replace-in-production-9f3a7c2e` — flagged as dev. The auth.ts code does enforce ≥16 chars in production, but this is still a weak hardcoded dev secret. **ACTION REQUIRED**: rotate before production.

### 1c. `.gitignore` review (full file)

```
node_modules
/.pnp
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/versions
/coverage
/.next/
/out/
/build
.DS_Store
*.pem
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*
.env*                ← ✅ excludes .env, .env.local, etc.
.vercel
*.tsbuildinfo
next-env.d.ts
local-*
.claude
.z-ai-config
*.log                ← ✅ covers dev.log, server.log, service.log, whatsapp-outbox.log, broadcast.log
dev.log
dev.out.log
test
prompt
server.log
/skills/
```

**Findings:**
- ✅ `.env*` excluded
- ✅ `node_modules` excluded
- ✅ `/.next/` excluded
- ✅ `*.log` covers all log files (dev.log, server.log, service.log, whatsapp-outbox.log, broadcast.log)
- ✅ `*.pem` excluded (private keys)
- ✅ `.vercel`, `.claude`, `.z-ai-config`, `/skills/` excluded
- ❌ **`db/*.db` NOT excluded** — SQLite database file `db/custom.db` is NOT in `.gitignore`. Currently untracked but would be committed on `git add .`. **CRITICAL ACTION REQUIRED**: add `db/*.db` and `db/*.db-journal` to `.gitignore`. The DB contains password hashes, complaint PII, etc.
- ❌ `whatsapp-image-mapping.json` NOT excluded (contains real chat context metadata — may have minor PII from WhatsApp sender numbers)

---

## 2. Zod Validation Status

### 2a. Summary

**ZERO API routes use Zod.** Despite `zod@^4.0.2` being in `package.json` dependencies, grep for `z.object`, `z.string`, `z.number`, `zod` across `src/` returns **no matches**. All input validation is manual:

- `typeof body.field === 'string'` checks
- `['admin', 'secretary', 'viewer'].includes(body.role)` allowlists
- `.trim().slice(0, N)` length caps
- `Number.isInteger(n) && n >= 1 && n <= 5` range checks
- `if (!field) return 400` presence checks

### 2b. Routes that LACK validation (ACTION REQUIRED)

These routes either skip validation entirely or do minimal ad-hoc checks:

| Route | Issue |
|-------|-------|
| `POST /api/admin/login` | Only checks `!email \|\| !password` — no email format validation, no password length floor |
| `POST /api/admin/logout` | No body expected — OK |
| `GET /api/admin/me` | No body — OK |
| `GET /api/admin/notifications` | `?since=ISO` not validated as date — `new Date(undefined)` becomes Invalid Date but query still runs (returns all rows) |
| `POST /api/auth/otp-send` | Phone not regex-validated beyond digit count |
| `POST /api/auth/otp-verify` | No length cap on `name` field when creating new user |
| `POST /api/auth/signup` | No email format validation, no phone format validation, password ≥8 chars only |
| `POST /api/auth/forgot-password` | No email format validation |
| `POST /api/complaints/create` | Manual validation OK but `callerName.slice(0, 100)` happens AFTER `!callerName` check (trims first, so empty string passes) |
| `POST /api/complaints/update` | No type validation on `assignedToId` (could be object/array), `resolutionNote` not length-capped |
| `POST /api/complaints/bulk-update` | `trackingIds` not validated as array of strings (just `Array.isArray`); no per-item type check |
| `POST /api/complaints/mine` | Phone digit-stripping OK, but no length floor beyond 7 digits |
| `POST /api/vapi/call-end` | Accepts arbitrary `body` keys, no validation — `mapCategoryToComplaint` falls back to 'other' for unknown |
| `POST /api/vapi/departments` | **No auth check** + minimal field validation — anyone can create departments |
| `POST /api/vapi/routing` | **No auth check** + minimal validation — anyone can create routing rules |
| `POST /api/announcements` | Field presence checks but no length caps on body fields |
| `POST /api/profile` | `value` object not schema-validated — any JSON blob accepted |
| `PUT /api/content/[key]` | `body.data` only checked as `typeof object` — no schema per `key` |
| `POST /api/polls` | Options array validation OK; `questionHi` capped at 1000 chars in PATCH but NOT in POST |
| `POST /api/polls/[id]/vote` | `optionId` validated by DB lookup but not format-validated upfront |
| `POST /api/feedback` | Manual validation OK (trackingId, rating 1-5, comment ≤1000 chars) |
| `POST /api/marketplace` | Comprehensive manual validation — best in class but still no Zod |
| `PATCH /api/marketplace/[id]` | Field-by-field typeof checks — no schema |
| `POST /api/images/upload` | Multipart — file type allowlist + 10MB cap OK; no Sharp bomb protection (large dimensions) |
| `PATCH /api/images` | Spreads body fields directly into Prisma update if `!== undefined` — potential mass-assignment risk |
| `POST /api/notifications/subscribe` | Phone digit-strip OK; channel allowlist OK; `trackingId` not format-validated |
| `POST /api/admin/csv-upload` | Multipart — PII detection runs but CSV parser is naive (no quoted-comma handling) |
| `POST /api/admin/users` | Manual validation OK; password ≥6 chars (lower than signup's ≥8) |
| `PATCH /api/admin/users/[id]` | Role allowlist OK; password length check inside conditional |
| `GET /api/search?q=…` | q length ≥2 check OK |
| `POST /api/admin/send-whatsapp` | Phone digit-strip + length ≥7 + message length 1-4000 — OK |
| `POST /api/posts` | Title/content presence checks; slug auto-generated |
| `PATCH /api/posts/[slug]` | Spreads body fields — minor mass-assignment risk |

### 2c. Routes with NO authentication (intentional or otherwise)

| Route | Auth | Notes |
|-------|------|-------|
| `POST /api/vapi/departments` | ❌ none | **ACTION REQUIRED** — anyone can create departments. Should be admin-only. |
| `POST /api/vapi/routing` | ❌ none | **ACTION REQUIRED** — anyone can create routing rules. Should be admin-only. |
| `POST /api/vapi/call-end` | ❌ none | **ACTION REQUIRED** — no signature/auth check. Should require Vapi HMAC OR admin auth. (Note: this route is a legacy stub superseded by the mini-service; consider deleting.) |
| `POST /api/complaints/create` | ✅ none (intentional) | Public citizen complaint filing — rate-limited 5/10min per IP |
| `GET /api/complaints/track` | ✅ none (intentional) | Public tracking — strips sensitive fields |
| `GET /api/complaints/list?public=1` | ✅ none (intentional) | Public mode strips phone/transcript |
| `POST /api/complaints/mine` | ✅ none (intentional) | Lookup by phone (no PII leaked beyond what was searched) |
| `POST /api/feedback` | ✅ none (intentional) | Public feedback — must verify trackingId exists |
| `POST /api/polls/[id]/vote` | ✅ none (intentional) | Public vote — voterKey=sha256(ip+ua+pollId) |
| `GET /api/polls` | ✅ none (intentional) | Public poll listing |
| `GET /api/announcements`, `/api/notices`, `/api/schemes`, `/api/scraped`, `/api/weather`, `/api/search`, `/api/server-url`, `/api/stats`, `/api/sse/*` | ✅ none (intentional) | Public read endpoints |
| `GET /api/marketplace` | ✅ none (intentional) | Public=approved+active; `?admin=true` requires auth |
| `POST /api/marketplace` | ⚠️ optional auth | Citizens can submit (auto-unapproved); admins auto-approve. Should at least rate-limit. |
| `GET /api/profile?key=…` | ✅ none (intentional) | Public pradhan/secretary/site_config |
| `GET /api/content/[key]` | ✅ none (intentional) | Public content sections |
| `GET /api/images` | ✅ none (intentional) | Public=isPublic only; auth=all |
| `GET /api/posts` | ✅ none (intentional) | Public=published only |
| `GET /api/posts/[slug]` | ✅ none (intentional) | Public=published only |
| `GET /api/notifications/subscribe` | ✅ none (intentional) | Subscription status check |
| `POST /api/notifications/subscribe` | ✅ none (intentional) | Subscribe to tracking ID updates |
| `DELETE /api/notifications/subscribe` | ✅ none (intentional) | Unsubscribe |

---

## 3. Prisma Parameterization

### 3a. Raw query usage

Grep for `$queryRawUnsafe`, `$executeRawUnsafe`, `$queryRaw(`, `$executeRaw(` across the entire codebase (`src/` + `mini-services/`): **NO MATCHES**.

✅ **PASS** — All database access is via Prisma's typed client methods (`findMany`, `findUnique`, `create`, `update`, `delete`, `upsert`, `groupBy`, `aggregate`, `count`, `updateMany`). Prisma parameterizes all inputs by default. No SQL injection risk via Prisma.

### 3b. SQL injection surface

The only places raw SQL could leak in:
- `db.$queryRaw` — not used
- `db.$executeRaw` — not used
- Prisma `where` clauses with raw strings — all use Prisma's filter object syntax, no string interpolation into SQL

### 3c. NoSQL-ish injection via Prisma filters

Two minor concerns:
- `src/app/api/complaints/mine/route.ts:25-28` — uses `callerPhone: { contains: phone }` where `phone` is user-controlled. Prisma safely parameterizes this, but the `contains` filter on a hashed phone field is a substring match — a citizen could enumerate phones by submitting partial hashes. **Low risk** (phone is hashed to `MOB_<sha256-first-16>` for web complaints but stored raw for Vapi-filed complaints).
- `src/app/api/admin/activity/route.ts:9` — `parseInt(req.nextUrl.searchParams.get('limit') || '50', 10)` then `Math.min(limit, 500)` — properly capped.

---

## 4. Secrets in Code (Hardcoded)

Grep for `password`, `secret`, `token`, `api[_-]?key` (case-insensitive) across all non-`.md` files:

### 4a. Hardcoded credentials (intentional — demo/seed data)

| File:Line | Secret | Risk |
|-----------|--------|------|
| `src/lib/seed.ts:27` | `hashPassword('chandra2026')` — admin demo password | ⚠️ Intentional seed. **ACTION REQUIRED**: rotate before production. |
| `src/lib/seed.ts:39` | `hashPassword('secretary2026')` — secretary demo password | ⚠️ Same as above. |
| `src/lib/seed.ts:533-534` | `console.log('Admin login: pradhan@chandra-gp.in / chandra2026')` | ⚠️ Logs credentials to stdout on seed. OK for dev seed script. |
| `src/components/admin/AdminPanel.tsx:214-215` | UI shows demo credentials `pradhan@chandra-gp.in / chandra2026` and `gpa@chandra-gp.in / secretary2026` in a help box | ⚠️ **ACTION REQUIRED**: remove the demo credential help box in production builds. |
| `mini-services/vapi-webhook/start.sh:6` | `export VAPI_SECRET='dev-secret'` | ⚠️ Hardcoded dev secret in shell launcher. **ACTION REQUIRED**: source from `.env` instead. |

### 4b. Hardcoded phone numbers (PII — but these are PUBLIC panchayat office numbers)

| File:Line | Number | Owner |
|-----------|--------|-------|
| `src/data/panchayat.ts:17` | `9651035021` | Pradhan (Sangita Mishra) — public office number |
| `src/data/panchayat.ts:37` | `9839312578` | GPA (Balwant Chauhan) — public office number |
| `src/lib/vapi-system-prompt.ts:40-46` | 6 phone numbers | Pradhan, GPA, ANM, Headmaster, Sanitation, Panchayat Assistant, SHO Bara |
| `src/lib/seed-vapi.ts:24-25, 32-33, 39-40, 47-48, 55-56, 63-64` | Officer phones for each department | All public office numbers |
| `mini-services/vapi-webhook/index.ts:46` | `PRADHAN_WHATSAPP` default `9651035021` | Same as panchayat.ts |
| `src/app/api/complaints/update/route.ts:11` | `PRADHAN_WHATSAPP` default `9651035021` | Same |
| `public/offline.html:142` | `+91 96510 35021` | Same |
| `src/lib/seed.ts:28, 40, 58, 80, 411, 424, 440` | Hashed phone strings (`MOB_<sha256>`) for seed users/complaints | ✅ Already hashed |

**Assessment**: All hardcoded phone numbers are PUBLIC panchayat office numbers published on the panchayat's official notice board — appropriate to display. No citizen personal phones are hardcoded.

### 4c. Hardcoded Vapi credentials

| File:Line | Credential | Risk |
|-----------|-----------|------|
| `.env:8-9` | `NEXT_PUBLIC_VAPI_PUBLIC_KEY=3df5c626-...`, `NEXT_PUBLIC_VAPI_ASSISTANT_ID=b3bcf257-...` | ✅ These are PUBLIC by design (Vapi public keys are safe to expose to the browser, like Stripe publishable keys) |
| `src/app/api/server-url/route.ts:52` | `b3bcf257-175c-48d3-b333-365baa4eaaab` (assistant ID in instructions text) | ⚠️ Hardcoded in response instructions — should reference env var instead |

### 4d. No hardcoded API keys found

- No AWS keys, no Google API keys, no Meta app secrets, no JWT secrets in source.
- The only "token" reference is `WHATSAPP_TOKEN` from env (correctly read from process.env).

---

## 5. console.log Audit (PII Risk)

### 5a. PII-leaking console.logs (ACTION REQUIRED)

| File:Line | What's logged | Severity |
|-----------|---------------|----------|
| `mini-services/vapi-webhook/index.ts:154-156` | `WhatsApp (${tag}) → ${to}:` + full message body (contains citizen name, phone, complaint text) | 🔴 HIGH — logs citizen PII to stdout + `whatsapp-outbox.log` |
| `mini-services/vapi-webhook/index.ts:206` | `WhatsApp API error ${res.status} (to=${cleaned}):` + full Meta API response | 🟡 MEDIUM — logs phone + API response (may contain message IDs) |
| `mini-services/vapi-webhook/index.ts:209` | `WhatsApp sent OK (to=${cleaned}):` + full Meta API response | 🟡 MEDIUM — logs phone + API response |
| `mini-services/vapi-webhook/index.ts:446-448` | `registerComplaint OK — trackingId=… category=… dept=… priority=…` | 🟢 LOW — no PII (tracking ID is a public ID) |
| `mini-services/vapi-webhook/index.ts:544-546` | `transferCall OK — dept=… officer=… phone=${finalOfficerPhone}` | 🟡 MEDIUM — logs officer phone (but it's public office number) |
| `mini-services/vapi-webhook/index.ts:674-676` | `endCall OK — toolCallId=… trackingId=…` | 🟢 LOW |
| `mini-services/vapi-webhook/index.ts:702` | `/function-call → ${fnName} (toolCallId=…)` | 🟢 LOW |
| `mini-services/vapi-webhook/index.ts:838` | `DEDUPED — complaint already exists for vapiCallId=…` | 🟢 LOW |
| `mini-services/vapi-webhook/index.ts:978-980` | `complaint inserted: trackingId=… vapiCallId=… category=… dept=… priority=…` | 🟢 LOW |
| `mini-services/vapi-webhook/index.ts:1095` | `DATABASE_URL=${process.env.DATABASE_URL}` | 🟡 MEDIUM — logs DB file path on startup |
| `mini-services/vapi-webhook/index.ts:1096` | `Pradhan WhatsApp: ${PRADHAN_WHATSAPP}` | 🟡 MEDIUM — logs Pradhan phone on startup (but it's public) |
| `src/app/api/vapi/call-end/route.ts:198-201` | `[WhatsApp Stub] Notification to ${phone}:` + name + trackingId + category + priority | 🔴 HIGH — logs citizen phone + name + tracking ID. **Note**: this is in the legacy `call-end` stub which is superseded by the mini-service. |
| `src/app/api/vapi/call-end/route.ts:276` | `[WhatsApp] Notification sent to ${phone}:` + full Meta API response | 🔴 HIGH — same legacy stub |
| `src/components/portal/AIVoiceButton.tsx:94` | `function-call → ${fnName}` + `fnParams` (which contains `name`, `phone`, `category`, `description` from the citizen) | 🔴 HIGH — logs citizen PII to browser console. **ACTION REQUIRED**: strip PII before logging or remove in production. |
| `src/components/portal/AIVoiceButton.tsx:103` | `/function-call result → ${result}` (contains trackingId, department info) | 🟡 MEDIUM — tracking ID is public-ish, but department officer phone may be in result |
| `src/lib/seed.ts:533-534` | `Admin login: pradhan@chandra-gp.in / chandra2026` | 🟡 MEDIUM — logs credentials (only on seed run, acceptable) |
| `src/lib/seed.ts:540` | `Seed failed: ${e}` (may include DB connection errors with file path) | 🟢 LOW |

### 5b. Non-PII console.logs (acceptable)

All `console.error('[xxx] Error:', error)` patterns in API routes are acceptable — they log stack traces, not user data. Examples:
- `src/app/api/vapi/departments/route.ts:39,77`
- `src/app/api/vapi/routing/route.ts:47,93`
- `src/app/api/vapi/config/route.ts:23`
- `src/app/api/images/upload/route.ts:86`
- `src/app/api/complaints/update/route.ts:24`
- `src/app/api/complaints/mine/route.ts:47`
- `src/app/api/complaints/create/route.ts:88`
- `src/app/api/weather/route.ts:197`
- `src/app/api/admin/send-whatsapp/route.ts:74`
- `src/lib/audit.ts:31`
- `src/lib/vapi.ts:216` (warn)

### 5c. Seed script console.logs

All seed scripts (`seed*.ts`) log progress (`🌱 Seeding…`, `✓ N records seeded`, `✅ Seed complete`). These are acceptable for CLI scripts.

### 5d. Vapi console.error monkey-patch

`src/lib/vapi.ts:32-53` monkey-patches `console.error` at module load time to filter "Meeting ended" noise from the Vapi SDK. This is intentional and documented. **CAUTION**: any future `console.error('Meeting ended')` call from anywhere in the app will be silently swallowed. The filter is narrow (regex-based) so risk is low, but it's a global side effect.

---

## 6. Auth Security Review

### 6a. Password hashing (`src/lib/auth.ts`)

✅ **PASS** — Production-grade.

- **Algorithm**: scrypt (Node built-in, OWASP-recommended). N=16384, r=8, p=1 (Node defaults), keylen=64.
- **Salt**: random 16-byte per-user salt (`crypto.randomBytes(16).toString('hex')`).
- **Storage format**: `scrypt$<salt>$<hash>` — easily parseable, version-prefixed.
- **Verification**: constant-time compare via `crypto.timingSafeEqual`.
- **Legacy fallback**: SHA-256 with static salt `gpchandra-salt-v1` for backward compat — auto-upgrades to scrypt on next successful login (`isLegacyHash` check in `authenticate`).
- **No plaintext passwords** anywhere in source.

### 6b. Session tokens (`src/lib/auth.ts`)

✅ **PASS** with caveats.

- **Format**: `<base64url(payload)>.<base64url(HMAC-SHA256(payload, SECRET))>` — JWT-like but custom.
- **Payload**: `{id, email, name, role, exp: Date.now() + 7 days}`.
- **Verification**: constant-time signature compare (charCode XOR loop). Expiry checked.
- **Cookie**: `gpchandra_session`, `httpOnly: true`, `sameSite: 'lax'`, `maxAge: 7 days`, `path: '/'`.
- ⚠️ **Missing `secure: true`** — cookie sent over HTTP in production. **ACTION REQUIRED**: add `secure: process.env.NODE_ENV === 'production'` to all cookie `set` calls (`/api/admin/login`, `/api/auth/otp-verify`, `/api/auth/signup`).
- ⚠️ **No CSRF token** — relies on `sameSite: 'lax'` for CSRF protection. Acceptable for same-origin mutations but `lax` allows top-level GET navigations with cookies. Since this app uses POST for all mutations and sameSite=lax blocks cross-origin POSTs, this is OK.
- ⚠️ **No session revocation list** — a stolen token is valid until 7-day expiry. **ACTION REQUIRED for production**: implement a session table or revocation list.
- ⚠️ **Payload contains user info** (email, name, role) — base64url-encoded (not encrypted). Anyone with the cookie can read it. Acceptable but worth noting.

### 6c. Session secret

- `SESSION_SECRET` env var, ≥16 chars enforced in production (`auth.ts:19-24` throws if missing).
- Dev fallback: `'gpchandra-dev-fallback-secret-please-change'` with loud warning.
- ⚠️ Current `.env` value `chandra-dev-secret-replace-in-production-9f3a7c2e` is 47 chars (passes the ≥16 check) but is a recognizable dev string. **ACTION REQUIRED**: generate a random 32+ byte secret for production.

### 6d. OTP flow (`src/app/api/auth/otp-send.ts` + `otp-verify.ts`)

⚠️ **ACTION REQUIRED** — multiple weaknesses.

- ✅ OTP is 6 digits, generated via `crypto.randomInt(100000, 999999)` (cryptographically secure).
- ✅ OTP stored in `SiteSettings` table (not in-memory), keyed by `otp_<phone>`, with 5-minute expiry.
- ✅ OTP deleted after successful verification.
- ✅ Failed verification does NOT delete the OTP (allows retry within expiry window).
- 🔴 **CRITICAL**: `POST /api/auth/otp-send` returns the OTP in the response body as `demoOtp` field. The frontend (`src/lib/auth-store.ts:127`) stores it as `otpDemoCode` and the `OTPLogin.tsx` component DISPLAYS it to the user. **This bypasses the entire OTP security model.** It's labeled "Demo only — remove in production" but is currently active. **ACTION REQUIRED**: gate behind `process.env.NODE_ENV !== 'production'`.
- ⚠️ No rate limit on OTP send — an attacker could spam OTPs to any phone number (Cost amplification if real SMS is ever wired up).
- ⚠️ No max-verification-attempts limit — attacker can brute-force the 6-digit OTP (1M combinations) within the 5-minute window. With no rate limit, this is feasible. **ACTION REQUIRED**: cap at 5 verification attempts per OTP, then force re-send.
- ⚠️ `findFirst({ where: { phone: { contains: normalizedPhone } } })` — substring match. If user A has phone `9876543210` and user B has phone `987654321`, both could match. Low risk in practice but should be exact match.

### 6e. Forgot-password flow (`src/app/api/auth/forgot-password/route.ts`)

⚠️ Same pattern as OTP — demo mode returns the reset token in the response body as `demoToken`. **ACTION REQUIRED**: gate behind `NODE_ENV !== 'production'`.

- ✅ Token: `crypto.randomBytes(32).toString('hex')` (64 hex chars, 256 bits) — cryptographically secure.
- ✅ 1-hour expiry.
- ✅ Stored in `SiteSettings` as `reset_<email>`.
- ✅ Response does NOT reveal whether email exists ("If this email is registered, a reset link has been sent.") — BUT then immediately contradicts itself by returning `demoToken` only when user exists. **ACTION REQUIRED**: in production, always return the same response shape regardless of email existence.
- ⚠️ **No actual password reset endpoint exists** — only `forgot-password` generates the token. There's no `POST /api/auth/reset-password` route that consumes the token and sets a new password. The token is generated, displayed in demo mode, and... never used. **ACTION REQUIRED**: implement the reset-password endpoint or remove the forgot-password flow.

### 6f. RBAC enforcement (`src/lib/auth.ts:requireRole`)

✅ **PASS** — Consistently applied.

- `requireRole(cookieHeader, 'admin' | 'secretary' | 'viewer')` helper used in 18 routes.
- Role hierarchy: `viewer (0) < secretary (1) < admin (2)`.
- Self-demotion and self-deletion blocked in `/api/admin/users/[id]`.
- AdminPanel.tsx client-side filters tabs by role (defense in depth — server enforces too).

### 6g. Rate limiting

- ✅ `POST /api/admin/login`: 5/min per IP via `AdminActivityLog.count` query (DB-backed, survives restarts).
- ✅ `POST /api/complaints/create`: 5/10min per IP via in-memory `Map<ip, number[]>` (resets on server restart — acceptable for sandbox).
- ❌ All other routes: NO rate limiting. **ACTION REQUIRED** for production: add rate limits to `/api/auth/otp-send`, `/api/auth/otp-verify`, `/api/auth/forgot-password`, `/api/auth/signup`, `/api/feedback`, `/api/polls/[id]/vote`, `/api/notifications/subscribe`, `/api/marketplace` (POST).

---

## 7. CORS / Webhook Security

### 7a. Mini-service HMAC verification (`mini-services/vapi-webhook/index.ts`)

✅ **PASS** (in non-dev mode).

- **Algorithm**: HMAC-SHA256 with `VAPI_SECRET`, constant-time compare via `timingSafeEqual`.
- **Header**: `x-vapi-signature`.
- **Raw body preserved**: `await req.text()` before JSON parse — required for HMAC.
- **Verification flow** (`handleWebhook`, lines 751-779):
  1. IP allowlist check (if `VAPI_IP_ALLOWLIST` set)
  2. Read raw body
  3. HMAC verify (SKIPPED in dev mode with warning)
  4. Parse JSON
  5. Validate `message.call.id` exists
  6. Idempotency check on `vapiCallId`
- ⚠️ **Dev mode bypass**: `DEV_MODE = VAPI_SECRET === '' || VAPI_SECRET === 'dev-secret'` — when in dev mode, HMAC is SKIPPED entirely. Current `.env` has `VAPI_SECRET=dev-secret` so HMAC is currently disabled. **ACTION REQUIRED**: set a strong secret before production.
- ⚠️ **IP allowlist empty**: `VAPI_IP_ALLOWLIST=` in `.env` — webhook accepts requests from ANY IP (with console warning). **ACTION REQUIRED**: set to Vapi egress IPs.

### 7b. Function-call endpoint (`/function-call`)

⚠️ **ACTION REQUIRED** — No authentication at all.

The `/function-call` endpoint (called by `AIVoiceButton.tsx` from the browser) has NO auth check, NO HMAC, NO rate limit. Anyone can POST a function-call payload and trigger:
- `registerComplaint` — creates a fake complaint + sends WhatsApp to Pradhan + officer + citizen
- `transferCall` — sends WhatsApp to an arbitrary officer phone
- `getRoutingInfo` — reads department routing info (low risk, public data)
- `endCall` — auto-registers a complaint from a call summary

**Risk**: An attacker could:
1. Spam the Pradhan's WhatsApp with fake complaints
2. DoS the WhatsApp Cloud API quota
3. Create fake tracking IDs that pollute the admin dashboard

**Mitigation**: The endpoint is currently reachable via the gateway at `/function-call?XTransformPort=3003`. **ACTION REQUIRED**:
- Add HMAC verification (same as `/vapi-webhook`) OR
- Add a one-time CSRF token issued by the Next.js server to the browser on page load OR
- At minimum, add rate limiting (5 calls/min per IP)

### 7c. `/send-whatsapp` endpoint

⚠️ **ACTION REQUIRED** — No authentication.

The `/send-whatsapp` endpoint accepts `{to, message}` and sends a WhatsApp message. It's called server-side from:
- `src/app/api/admin/send-whatsapp/route.ts` (admin auth required ✅)
- `src/app/api/complaints/update/route.ts` (secretary auth required ✅)

But the mini-service itself has NO auth — anyone who can reach `localhost:3003/send-whatsapp` directly can send arbitrary WhatsApp messages. In the sandbox this is OK (port 3003 not exposed externally), but in production if the port is reachable, this is a spam vector. **ACTION REQUIRED**: add a shared-secret header check between Next.js and the mini-service.

### 7d. CORS headers

- `src/app/api/server-url/route.ts:60` sets `access-control-allow-origin: *` — acceptable (the endpoint returns non-sensitive Vapi config).
- No other API routes set CORS headers. Default Same-Origin Policy applies. ✅

### 7e. Caddyfile gateway

The `Caddyfile` (root) routes `/vapi-webhook?XTransformPort=3003` and `/function-call?XTransformPort=3003` to port 3003. The gateway handles TLS termination. No additional auth at the gateway layer.

---

## 8. Summary Checklist

| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | `.env` exists and is gitignored | ✅ PASS | `.gitignore:34` `.env*` |
| 2 | `db/*.db` gitignored | ❌ **ACTION REQUIRED** | Add `db/*.db` + `db/*.db-journal` to `.gitignore` |
| 3 | `node_modules` gitignored | ✅ PASS | |
| 4 | `.next/` gitignored | ✅ PASS | |
| 5 | `*.log` gitignored | ✅ PASS | Covers dev.log, server.log, service.log, whatsapp-outbox.log |
| 6 | Zod validation on all API routes | ❌ **ACTION REQUIRED** | Zero routes use Zod. Phase 5 should add Zod schemas to all POST/PATCH/PUT routes. |
| 7 | Prisma parameterized queries | ✅ PASS | No `$queryRawUnsafe` / `$executeRawUnsafe` usage anywhere. |
| 8 | No hardcoded production API keys | ✅ PASS | Only demo credentials + public panchayat office numbers. |
| 9 | Demo credentials flagged for rotation | ⚠️ ACTION REQUIRED | `chandra2026` / `secretary2026` in seed + shown in AdminPanel UI help box. |
| 10 | `SESSION_SECRET` strong in production | ⚠️ ACTION REQUIRED | Current value is dev-marked. Generate 32+ byte random secret. |
| 11 | `VAPI_SECRET` set to strong value | ⚠️ ACTION REQUIRED | Currently `dev-secret` → HMAC disabled. |
| 12 | `VAPI_IP_ALLOWLIST` set | ⚠️ ACTION REQUIRED | Currently empty → all IPs allowed. |
| 13 | `WHATSAPP_TOKEN` + `WHATSAPP_PHONE_ID` set | ⚠️ ACTION REQUIRED | Currently empty → WhatsApp in mock mode. |
| 14 | Cookies `secure: true` in production | ❌ **ACTION REQUIRED** | All 3 cookie-set routes (`/api/admin/login`, `/api/auth/otp-verify`, `/api/auth/signup`) missing `secure` flag. |
| 15 | OTP not returned in API response | ❌ **CRITICAL ACTION REQUIRED** | `demoOtp` field returned in production. Gate behind `NODE_ENV !== 'production'`. |
| 16 | Forgot-password token not returned in production | ❌ **CRITICAL ACTION REQUIRED** | `demoToken` field returned. Same gate. |
| 17 | Reset-password endpoint exists | ❌ **ACTION REQUIRED** | `forgot-password` generates token but no endpoint consumes it. |
| 18 | OTP rate-limited | ❌ **ACTION REQUIRED** | No rate limit on `/api/auth/otp-send` or `/api/auth/otp-verify`. |
| 19 | OTP max-attempt lockout | ❌ **ACTION REQUIRED** | No max-verification-attempts — brute-force feasible. |
| 20 | `/api/vapi/departments` POST auth | ❌ **ACTION REQUIRED** | No auth — anyone can create departments. |
| 21 | `/api/vapi/routing` POST auth | ❌ **ACTION REQUIRED** | No auth — anyone can create routing rules. |
| 22 | `/api/vapi/call-end` POST auth | ❌ **ACTION REQUIRED** | No auth, no HMAC. Consider deleting (superseded by mini-service). |
| 23 | `/function-call` (mini-service) auth | ❌ **ACTION REQUIRED** | No auth, no HMAC, no rate limit. Browser-callable. |
| 24 | `/send-whatsapp` (mini-service) auth | ❌ **ACTION REQUIRED** | No auth. Add shared-secret header. |
| 25 | Rate limiting on public mutation routes | ❌ **ACTION REQUIRED** | Only `/api/admin/login` + `/api/complaints/create` are rate-limited. Add to OTP, signup, feedback, vote, subscribe, marketplace POST. |
| 26 | PII in console.logs (mini-service) | ❌ **ACTION REQUIRED** | `index.ts:154-156` logs full WhatsApp message body (citizen name + phone + complaint). Mask in production. |
| 27 | PII in console.logs (AIVoiceButton) | ❌ **ACTION REQUIRED** | `AIVoiceButton.tsx:94` logs `fnParams` which contains citizen name/phone/complaint. |
| 28 | PII in console.logs (legacy call-end) | ❌ **ACTION REQUIRED** | `call-end/route.ts:198-201, 276` logs citizen phone. Delete or gate the legacy stub. |
| 29 | Password hashing algorithm | ✅ PASS | scrypt with per-user random salt, keylen=64, constant-time compare. |
| 30 | Session token signing | ✅ PASS | HMAC-SHA256, constant-time compare, 7-day expiry. |
| 31 | RBAC enforcement | ✅ PASS | `requireRole` helper used consistently. Self-demotion/delete blocked. |
| 32 | Audit log immutability | ✅ PASS | `AdminActivityLog` is insert-only (no update/delete in code). |
| 33 | Complaint phone hashing (web form) | ✅ PASS | `hashPhone()` in `/api/complaints/create` stores `MOB_<sha256-first-16>`. |
| 34 | Complaint phone storage (Vapi) | ⚠️ PARTIAL | Vapi-filed complaints store raw `callerPhone` (not hashed) — schema comment says "hashed per DPDP" but mini-service stores raw. **ACTION REQUIRED**: hash before insert. |
| 35 | PII auto-redaction in CSV upload | ✅ PASS | Aadhaar/Bank/IFSC/Mobile/PAN detected + replaced with `<TYPE>_REDACTED_<sha256-8>`. |
| 36 | `typescript.ignoreBuildErrors` | ❌ **ACTION REQUIRED** | `next.config.ts:7` — set to `false` in Phase 2. |
| 37 | `reactStrictMode` | ❌ **ACTION REQUIRED** | `next.config.ts:9` — set to `true` in Phase 2. |
| 38 | `noImplicitAny: false` | ⚠️ ACTION REQUIRED | `tsconfig.json:14` — set to `true` for stricter typing. |
| 39 | Image upload bomb protection | ⚠️ ACTION REQUIRED | `/api/images/upload` caps file size at 10MB but no pixel-dimension cap. Sharp could OOM on a 10MB image with extreme dimensions. Add `limitInputPixels` to Sharp pipeline. |
| 40 | Mass-assignment risk | ⚠️ ACTION REQUIRED | `PATCH /api/images` and `PATCH /api/posts/[slug]` spread body fields into Prisma update — allowlist fields explicitly. |

---

## 9. Critical Findings (Priority Order)

### 🔴 P0 — Fix before ANY production deploy

1. **OTP returned in API response** (`/api/auth/otp-send` → `demoOtp`). Gate behind `NODE_ENV !== 'production'`. Anyone can log in as anyone by reading the API response.
2. **Reset token returned in API response** (`/api/auth/forgot-password` → `demoToken`). Same gate.
3. **`/function-call` mini-service endpoint has no auth**. Browser-callable. Spam vector for Pradhan WhatsApp + fake complaint creation.
4. **`/api/vapi/departments` + `/api/vapi/routing` POST have no auth**. Anyone can create departments and routing rules.
5. **Cookies missing `secure: true`** — session cookies sent over HTTP in production.
6. **`db/*.db` not in `.gitignore`** — database file (with password hashes + complaint PII) at risk of being committed.

### 🟡 P1 — Fix before user-facing production

7. **`VAPI_SECRET=dev-secret`** — HMAC verification disabled. Set strong secret.
8. **`VAPI_IP_ALLOWLIST` empty** — webhook accepts any IP.
9. **Demo credentials shown in AdminPanel UI** — remove help box in production.
10. **OTP not rate-limited + no max-attempt lockout** — brute-force feasible.
11. **No reset-password endpoint** — forgot-password flow is incomplete.
12. **`/send-whatsapp` mini-service endpoint has no auth** — add shared-secret header.
13. **Vapi-filed complaints store raw phone** (mini-service `registerComplaint`) — hash before insert per DPDP.
14. **PII in console.logs** (mini-service WhatsApp dispatch + AIVoiceButton function-call) — mask citizen PII.
15. **No rate limiting** on signup, feedback, vote, subscribe, marketplace POST.

### 🟢 P2 — Hardening (Phase 5)

16. **Add Zod schemas** to all POST/PATCH/PUT routes for type-safe validation.
17. **`typescript.ignoreBuildErrors: false`** + **`reactStrictMode: true`** + **`noImplicitAny: true`**.
18. **Mass-assignment allowlists** on `PATCH /api/images` and `PATCH /api/posts/[slug]`.
19. **Image upload pixel-dimension cap** (Sharp `limitInputPixels`).
20. **Session revocation list** (DB table of revoked tokens).
21. **`SESSION_SECRET` rotation** — generate 32+ byte random secret.
22. **Legacy `/api/vapi/call-end` route** — delete or document as deprecated.
23. **`start.sh` hardcodes `VAPI_SECRET='dev-secret'`** — source from `.env`.

---

## 10. Audit Methodology

- **Read** all 47 API route handlers in `src/app/api/` (full file contents).
- **Read** `prisma/schema.prisma` (20 models, 403 lines).
- **Read** `src/lib/auth.ts`, `src/lib/db.ts`, `src/lib/audit.ts`, `src/lib/vapi.ts`, `src/lib/vapi-system-prompt.ts`, all 5 Zustand stores.
- **Read** `mini-services/vapi-webhook/index.ts` (1109 lines, full).
- **Read** `.env`, `.gitignore`, `next.config.ts`, `tsconfig.json`, `package.json`, `layout.tsx`.
- **Grep** for `process.env.*` (15 matches), `console.log/error/warn/info` (60+ matches), `zod|z\.object|z\.string` (0 matches), `$queryRawUnsafe|$executeRawUnsafe|$queryRaw(|$executeRaw(` (0 matches), `password|secret|token|api[_-]?key` (60+ matches, all reviewed).
- **Read** representative portal/admin/auth components to confirm API touch points.
- **Verified** `.env` exists at `/home/z/my-project/.env` (538 bytes).
- **Verified** `db/custom.db` exists and is NOT in `.gitignore` (currently untracked but at risk).
- **Verified** `dev.log`, `server.log`, `service.log` exist and are covered by `*.log` gitignore pattern.

No build/test commands were run. No source files were modified.
