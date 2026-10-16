# Chandra

**A web portal for Gram Panchayat Chandra (Shankargarh block, Prayagraj, Uttar Pradesh).**

Villagers file a complaint in Hindi or English, get a tracking ID, and check its status. The
panchayat office works through complaints in an admin panel with roles (pradhan, secretary,
viewer). The site also carries notices, announcements, government schemes with an eligibility
checker, polls, a village marketplace and weather. An AI phone line (Vapi) and WhatsApp alerts are
optional.

Status: runs locally; not deployed yet.

## Run it locally

Node 20+.

```bash
git clone https://github.com/HarshDubey23/chandra.git
cd chandra
npm install
cp .env.example .env            # Windows PowerShell: copy .env.example .env
npx prisma db push              # creates prisma/dev.db
npx tsx src/lib/seed.ts         # sample data; prints the admin password once
npm run dev                     # http://localhost:3000
```

Set `ADMIN_PASSWORD` before seeding to choose the admin password instead.

- **Citizen:** *File Complaint* → note the tracking ID → *Track Complaint*.
- **Office:** *Admin* (top bar) → sign in as `pradhan@chandra-gp.in`.

## Production

```bash
npm run build      # also copies static files into .next/standalone
npm start          # needs SESSION_SECRET (16+ random characters) in the environment
```

The app uses SQLite, so it needs a host with a persistent disk (not serverless functions).
Without WhatsApp keys, alerts are only logged. Without Vapi keys, the phone line is off.

## Checks

```bash
npm run typecheck    # 0 errors
npm run build
```

## Limits

- No automated tests yet.
- `npm run lint` reports 20 React `set-state-in-effect` warnings-as-errors (data-loading
  effects) and one ref read during render in `AIVoiceButton`; none breaks the build.
- `mini-services/vapi-webhook` is an optional Bun service for the phone line; the main app
  already has the `/api/vapi/*` routes.
