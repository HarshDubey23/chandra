# Setup Guide — Making WhatsApp + Vapi Call Transfer LIVE

This guide explains EXACTLY what you need to do to make WhatsApp messages and Vapi call transfer work in production. The code is ready — you just need to add API keys.

---

## 1. WhatsApp Messages (choose ONE provider)

Right now WhatsApp is in "mock mode" — messages are logged to a file but not actually sent. To make them real, choose ONE of these:

### Option A: Meta Cloud API (Recommended — Free for first 1000 conversations/month)

1. Go to https://developers.facebook.com/apps/ → Create New App → Business
2. Add WhatsApp product to the app
3. Go to WhatsApp → API Setup tab
4. Copy the **Permanent Access Token** → put in `.env` as `WHATSAPP_TOKEN=`
5. Copy the **Phone Number ID** → put in `.env` as `WHATSAPP_PHONE_ID=`
6. Add your test recipients in the WhatsApp Manager (or verify your business for production)

### Option B: Twilio WhatsApp

1. Go to https://console.twilio.com/ → Create account
2. Enable WhatsApp Sandbox (or buy a WhatsApp Business number)
3. Copy **Account SID** → put in `.env` as `TWILIO_ACCOUNT_SID=`
4. Copy **Auth Token** → put in `.env` as `TWILIO_AUTH_TOKEN=`
5. Copy the WhatsApp sender number (e.g. whatsapp:+14155238886) → put in `.env` as `TWILIO_WHATSAPP_FROM=`

After adding credentials, restart the webhook:
```bash
cd mini-services/vapi-webhook && bash start.sh
```

Check status: `curl http://localhost:3003/whatsapp-status` — should show `"activeProvider": "meta"` or `"twilio"` instead of `"mock"`.

---

## 2. Vapi Call Transfer

For the AI assistant to transfer calls to officers' phones, you need:

### Step 1: Buy/Import a Vapi Phone Number
1. Go to https://dashboard.vapi.ai/ → Phone Numbers
2. Buy a number (≈$1-2/month) OR import an existing number
3. This number is what Vapi uses to dial officers when transferring

### Step 2: Configure the Assistant for Transfer
1. Go to https://dashboard.vapi.ai/ → Assistants → Your assistant (ID: b3bcf257-175c-48d3-b333-365baa4eaaab)
2. Under **Functions**, ensure `transferCall` is defined with:
   - `name`: `transferCall`
   - `parameters`: `departmentCode`, `officerName`, `officerPhone`, `reason`
3. Under **Transfer** or **Handoff**, enable call transfer
4. The function response now includes a `number` field (E.164 format like `+919839312578`) — Vapi will dial this number when the function is called

### Step 3: Set the Webhook URL
1. In Vapi dashboard → Your assistant → Server URL
2. Set it to your production webhook URL: `https://your-domain.com/vapi-webhook` (via gateway: `https://your-domain.com/vapi-webhook?XTransformPort=3003`)
3. For local testing, use the current `http://localhost:3003/vapi-webhook`

### How Call Transfer Works (flow):
1. Citizen clicks "AI सहायक" → Vapi call starts
2. AI collects complaint info in Hindi
3. AI calls `transferCall(departmentCode="water", officerPhone="9839312578")`
4. Webhook processes → returns `{ number: "+919839312578" }`
5. Vapi dials +919839312578 and bridges the call
6. WhatsApp notification sent to officer + Pradhan

### The `shareNumber` Function (NEW)
If the citizen just needs a number (no live transfer), AI calls `shareNumber` — Vapi speaks the number aloud: "आप [officer] जी को [phone] पर कॉल कर सकते हैं।"

---

## 3. Department Phone Numbers (already configured)

These are seeded in the database and the AI knows them:

| Department | Code | Officer | Phone |
|-----------|------|---------|-------|
| Water | water | GPA (बलवंत चौहान) | 9839312578 |
| Roads | roads | GPA | 9839312578 |
| Secretary | secretary | GPA | 9839312578 |
| Pradhan | pradhan | संगीता मिश्रा | 9651035021 |
| Health | health | अर्चना सिंह (ANM) | 8528667723 |
| Education | education | अल्ताफ मोहम्मद | 7054306848 |
| Sanitation | sanitation | दया शंकर | 6392167328 |
| Pension | pension | राजेंद्र मिश्र | 8931943436 |
| Emergency | emergency | SHO Bara | 9454402820 |
| Electricity | electricity | GPA | 9839312578 |
| General | general | GPA | 9839312578 |

---

## 4. Signup Notification (already working)

When a citizen registers, the webhook sends a WhatsApp to ADMIN_WHATSAPP (919651035021) with their name, email, and phone. This works NOW (in mock mode) and will send real WhatsApp when credentials are added.

---

## Quick Checklist

- [ ] WhatsApp: Add Meta OR Twilio credentials to `.env`
- [ ] Restart webhook: `cd mini-services/vapi-webhook && bash start.sh`
- [ ] Verify: `curl http://localhost:3003/whatsapp-status` → activeProvider should be "meta" or "twilio"
- [ ] Vapi: Buy a phone number in Vapi dashboard
- [ ] Vapi: Set Server URL to your production webhook
- [ ] Vapi: Ensure transferCall function is configured in assistant
- [ ] Test: Click "AI सहायक" → file a complaint → AI should transfer to the correct officer
