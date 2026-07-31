# Vapi Full Setup Guide — Gram Panchayat Chandra

This guide configures your Vapi phone number (+1 618 221 8137) for:
1. **Inbound calls** — citizens call → AI assistant answers
2. **Outbound calls** — AI assistant calls citizens (complaint filing)
3. **Call transfer** — AI transfers to department officers
4. **SMS notifications** — messages sent from your Vapi number

---

## STEP 1: Get Your Vapi API Key

1. Go to https://dashboard.vapi.ai → Account (top-right) → API Keys
2. Copy your **API Key** (starts with a long string)
3. Put it in `.env`:
```
VAPI_API_KEY=your-api-key-here
```

---

## STEP 2: Configure Your Phone Number

Your phone number: **+1 (618) 221 8137** (ID: `0aa4db7a-f837-4213-97aa-83f0cbdb67da`)

### In Vapi Dashboard → Phone Numbers → +1 618 221 8137:

1. **Phone Number Label**: `Chandra Panchayat` (for easy identification)
2. **Server URL**: Set to your production URL:
   - For local dev: `http://localhost:3003/function-call`
   - For production: `https://your-domain.com/function-call?XTransformPort=3003`
   - **Important**: This is where Vapi sends function-call requests
3. **Timeout**: `20` seconds (default is fine)
4. **Inbound Settings → Assistant**: Select `Hindi Inbound Support Agent` (already done)
5. **Fallback Destination**: Set to Pradhan's number: `919651035021` (in case AI is unavailable)

---

## STEP 3: Configure the transferCall Tool

You have a transferCall tool (ID: `d2e87d24-8821-4673-8835-efc9df688b5d`).

### In Vapi Dashboard → Tools → transfer_call_tool:

1. **Tool Name**: `transferCall` (already set)
2. **Description**: `Transfer the call to a department officer. Use when the citizen wants to speak directly to an officer or when the complaint requires immediate officer attention.`
3. **Destinations** — Click "Add Destination" for each officer:

| Label | Number | Notes |
|-------|--------|-------|
| Pradhan (Sangita Mishra) | +919651035021 | Pradhan office |
| GPA (Balwant Chauhan) | +919839312578 | Secretary/Water/Roads/Electricity |
| ANM (Archana Singh) | +919528667723 | Health |
| Headmaster (Altaaf) | +917054306848 | Education |
| Sanitation (Daya Shankar) | +916392167328 | Sanitation |
| Pension (Rajendra Mishra) | +918931943436 | Pension |
| SHO Bara (Emergency) | +919454402820 | Emergency/Police |

4. **Messages** — Configure what AI says during transfer:
   - **Pre-transfer**: `कृपया रुकिए, मैं आपको सही अधिकारी से जोड़ रही हूँ।` (Please hold, I'm connecting you to the right officer.)
   - **Post-transfer (failed)**: `क्षमा करें, अभी अधिकारी उपलब्ध नहीं हैं। मैं आपकी शिकायत दर्ज कर देती हूँ।` (Sorry, the officer isn't available right now. I'll register your complaint.)

---

## STEP 4: Configure the apiRequest Tool (optional — for complaint registration)

You have an apiRequest tool (ID: `f68c1f78-fd45-4000-9bac-3ec3545d5c6e`).

### In Vapi Dashboard → Tools → apiRequest tool:

1. **Tool Name**: `registerComplaint`
2. **Description**: `Register a new citizen complaint with name, phone, category, description, and department. Call this after collecting all information from the citizen.`
3. **Request URL**: `https://your-domain.com/function-call?XTransformPort=3003`
   - For local: `http://localhost:3003/function-call`
4. **Request HTTP Method**: `POST`
5. **Authorization → HTTP Headers**:
   - Key: `Content-Type`, Value: `application/json`
6. **Request Body** — Add these properties:
   - `name` (string, required) — Citizen's full name
   - `phone` (string, required) — Citizen's 10-digit mobile
   - `category` (string, required) — Complaint category code (water_supply, road_damage, electricity, etc.)
   - `description` (string, required) — Detailed complaint description
   - `departmentCode` (string, required) — Department code (water, roads, health, etc.)
   - `priority` (string, required) — Priority level (low, medium, high, critical, emergency)
   - `village` (string) — Village name
   - `ward` (number) — Ward number 1-11
7. **Response Body** — Extract these variables:
   - `trackingId` (string) — The complaint tracking ID
   - `ok` (boolean) — Success status

---

## STEP 5: Configure the Assistant

### In Vapi Dashboard → Assistants → Your Assistant (b3bcf257-175c-48d3-b333-365baa4eaaab):

1. **Model**: `gpt-4o` (already set)
2. **Voice**: 11labs, voiceId `pNInz6obpgDQGcFmaJgB` (already set)
3. **System Prompt**: Copy from `/home/z/my-project/src/lib/vapi-system-prompt.ts` (the `VAPI_SYSTEM_PROMPT` constant)
4. **First Message**: `नमस्ते! मैं चंद्रा सहायक हूँ, ग्राम पंचायत चंद्रा की AI असिस्टेंट। मैं आपकी शिकायत दर्ज करने में मदद करूँगी। क्या आप हिंदी में बात करना चाहेंगे या अंग्रेजी में?`
5. **Transcriber**: Deepgram nova-2, language `hi`
6. **Tools**: Attach both tools:
   - `transferCall` (transfer_call_tool)
   - `registerComplaint` (apiRequest tool)
7. **Server URL**: Same as phone number — `https://your-domain.com/function-call?XTransformPort=3003`
8. **Server Messages**: Enable `function-call`, `call-end`, `transcript`
9. **Recording**: Enabled (for complaint audit trail)
10. **Publish** — Click the Publish button!

---

## STEP 6: SMS Notifications (via Vapi phone number)

When someone registers or a complaint is filed, SMS is sent from your Vapi number (+1 618 221 8137) to:
- Admin (Pradhan): 919651035021
- Officer (based on complaint department)

### How it works:
1. Citizen registers → webhook calls `POST https://api.vapi.ai/sms`
2. Vapi sends SMS from +16182218137 to +91XXXXXXXXXX
3. Recipient gets SMS from your Vapi number

### Required env vars (already in .env):
```
VAPI_API_KEY=          ← GET THIS from dashboard.vapi.ai → Account → API Keys
VAPI_PHONE_NUMBER=+16182218137   ← already set
ADMIN_PHONE=919651035021         ← already set
```

---

## STEP 7: Call Transfer Flow (how it works end-to-end)

1. Citizen clicks "AI सहायक" button on the portal
2. Vapi SDK starts a call to the assistant (b3bcf257...)
3. AI greets: "नमस्ते! मैं चंद्रा सहायक हूँ..."
4. Citizen describes problem (e.g., "पानी नहीं आ रहा")
5. AI collects: name, phone, ward, description
6. AI calls `registerComplaint` → webhook creates complaint → returns tracking ID
7. AI says: "आपकी शिकायत दर्ज हो गई। ट्रैकिंग आईडी: GPCH-XXXXX"
8. If citizen wants to talk to officer → AI calls `transferCall`
9. Vapi dials the officer's number and bridges the call
10. SMS sent to officer + Pradhan about the complaint

---

## STEP 8: Test Everything

### Test SMS:
```bash
# After setting VAPI_API_KEY in .env, restart webhook:
cd mini-services/vapi-webhook && bash start.sh

# Check status:
curl http://localhost:3003/whatsapp-status

# Should show: "configured": true, "activeProvider": "vapi-sms"
```

### Test call transfer:
1. Open the portal → click "AI सहायक"
2. Say: "मेरा नाम राहुल है, फोन 9876543210, पानी नहीं आ रहा, वार्ड 3"
3. AI should register complaint + give tracking ID
4. Say: "मुझे अधिकारी से बात करनी है"
5. AI should transfer to GPA (9839312578)

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| SMS not arriving | Check `VAPI_API_KEY` is set in `.env` + restart webhook |
| Call transfer fails | Ensure officer numbers are added as destinations in transferCall tool |
| Assistant not responding | Publish the assistant in Vapi dashboard |
| Function-call errors | Check Server URL is correct + webhook running on port 3003 |
| "Meeting ended" errors | Normal — Vapi SDK noise, already filtered in code |

---

## Your Vapi IDs (reference)

| Item | ID |
|------|-----|
| Assistant | b3bcf257-175c-48d3-b333-365baa4eaaab |
| Phone Number | 0aa4db7a-f837-4213-97aa-83f0cbdb67da |
| transferCall Tool | d2e87d24-8821-4673-8835-efc9df688b5d |
| apiRequest Tool | f68c1f78-fd45-4000-9bac-3ec3545d5c6e |
| Phone Number (E.164) | +16182218137 |
| Public Key | 3df5c626-6216-47ac-85f6-d0a6b683cbb2 |

---

## Summary: What YOU need to do

1. ✅ Phone number purchased (+1 618 221 8137)
2. ⬜ Get API Key from Vapi dashboard → put in `.env` as `VAPI_API_KEY=`
3. ⬜ Set Server URL on phone number + assistant
4. ⬜ Add officer numbers as destinations in transferCall tool
5. ⬜ Configure apiRequest tool for registerComplaint
6. ⬜ Publish the assistant
7. ⬜ Restart webhook: `cd mini-services/vapi-webhook && bash start.sh`

Done! Everything will be live.
