# JalSheti Pro — Edge Function Master Specification

**Version:** 1.0.0 | **Target:** GLM 5.2

Every Edge Function is a Deno TypeScript module. All functions use `https://deno.land/std@0.177.0/http/server.ts` for the `serve` function and `https://esm.sh/@supabase/supabase-js@2` for the Supabase client.

---

## SHARED MODULE

### `supabase/functions/_shared/cors.ts`

```typescript
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
```

---

## FUNCTION 1: `validate-supplier-code`

**Purpose:** Verify supplier admin code server-side. Code NEVER exposed to client.

**HTTP Method:** POST
**Auth Required:** None (but rate limited)
**Rate Limit:** 10 requests per IP per minute

**Request:**
```json
{ "adminCode": "string" }
```

**Response (200):**
```json
{ "valid": true }
```

**Response (429):**
```json
{ "error": "Too many requests" }
```

**Logic:**
1. Extract IP from `x-forwarded-for` header
2. Check rate limit Map — if over threshold, return 429
3. Compare `adminCode` against `Deno.env.get("SUPPLIER_ADMIN_CODE")`
4. Return `{ valid: true/false }`

---

## FUNCTION 2: `tts-proxy`

**Purpose:** Proxy Azure TTS calls. Hides AZURE_TTS_KEY from client.

**HTTP Method:** POST
**Auth Required:** JWT (Supabase auth)
**Rate Limit:** 30 requests per user per minute

**Request:**
```json
{ "text": "नमस्कार काका!..." }
```

**Response (200):** `audio/mpeg` binary stream

**Logic:**
1. Validate JWT via `supabase.auth.getUser(jwt)`
2. Check rate limit per user ID
3. Build SSML: `<speak version='1.0' xml:lang='mr-IN'><voice name='mr-IN-AarohiNeural'>${text}</voice></speak>`
4. POST to `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1` with `Ocp-Apim-Subscription-Key: ${AZURE_TTS_KEY}`
5. Return audio stream

**Secrets required:** `AZURE_TTS_KEY`, `AZURE_TTS_REGION` (default: `centralindia`)

---

## FUNCTION 3: `wati-send`

**Purpose:** Send WhatsApp messages via WATI API. Hides WATI_API_TOKEN.

**HTTP Method:** POST
**Auth Required:** JWT
**Rate Limit:** 5 requests per user per minute
**Template Allowlist:** `["morning_advisory", "pest_alert", "water_schedule", "savings_event", "fertilizer_window", "payment_reminder", "general_broadcast"]`

**Request:**
```json
{
  "phone": "919876543210",
  "templateName": "morning_advisory",
  "parameters": [
    { "name": "farmer_name", "value": "रामेश" },
    { "name": "stage", "value": "फुटवे टप्पा" }
  ]
}
```

**Response (200):** WATI API response JSON

**Logic:**
1. Validate JWT
2. Check rate limit
3. Assert `templateName` is in allowlist
4. POST to `${WATI_API_ENDPOINT}/v1/sendTemplateMessage?whatsappNumber=${phone}`
5. Headers: `Authorization: Bearer ${WATI_API_TOKEN}`
6. Return WATI response

**Secrets required:** `WATI_API_TOKEN`, `WATI_API_ENDPOINT`

---

## FUNCTION 4: `razorpay-webhook`

**Purpose:** Process Razorpay payment events. CRITICAL: HMAC verification.

**HTTP Method:** POST (called by Razorpay, not by client)
**Auth Required:** HMAC-SHA256 signature verification
**Rate Limit:** 100 requests per minute

**Request:** Raw Razorpay webhook JSON body + `X-Razorpay-Signature` header

**Logic:**
1. Read raw body bytes
2. Compute HMAC-SHA256: `crypto.createHmac('sha256', RAZORPAY_WEBHOOK_SECRET).update(rawBody).digest('hex')`
3. Compare computed signature with `X-Razorpay-Signature` header
4. **IF MISMATCH:** Return 401 immediately. DO NOT PROCESS.
5. Parse `event` from body
6. **IF `event === 'payment.captured'`:**
   a. Extract `subscription_id` from payment notes
   b. Query `subscriptions` table by `razorpay_subscription_id`
   c. Update: `status = 'active'`, `next_billing_at = now() + 30 days`
   d. Calculate commission: basic→2000, smart→4000, premium→6000 (paise)
   e. INSERT `commission_wallet` row: `{ supplier_id, amount: commission, transaction_type: 'consumer_commission', status: 'pending' }`
   f. UPDATE `users` SET `subscription_status = 'active'`
   g. INSERT `audit_log` row
   h. Enqueue job for supplier WhatsApp notification
7. Return 200 `{ "status": "ok" }`

**Secrets required:** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_WEBHOOK_SECRET`

---

## FUNCTION 5: `weather-fetch`

**Purpose:** Cache OpenWeatherMap data per taluka to avoid rate limits.

**HTTP Method:** GET
**Auth Required:** None
**Rate Limit:** Self-throttling via cache (1 fetch per taluka per hour)

**Query Parameters:** `?taluka=Hatakanagle&district=Kolhapur`

**Response (200):**
```json
{
  "temp": 32.5,
  "humidity": 78,
  "rainfall": 0,
  "windSpeed": 12,
  "cached": true
}
```

**Logic:**
1. Build cache key: `${district}_${taluka}`
2. Check in-memory Map: if `Date.now() - entry.timestamp < 3600000` → return cached
3. Call `https://api.openweathermap.org/data/2.5/weather?q=${taluka},${district},IN&appid=${OPENWEATHER_API_KEY}&units=metric`
4. Parse response, cache in Map with timestamp
5. Return weather data

**Secrets required:** `OPENWEATHER_API_KEY`

---

## FUNCTION 6: `generate-advisory`

**Purpose:** Generate crop advisory after water session completion.

**HTTP Method:** POST
**Auth Required:** Supabase service_role (called internally, not by client)

**Request:**
```json
{ "sessionId": "uuid" }
```

**Logic:**
1. Read `water_sessions` row by `sessionId`
2. Read `fields` row by `field_id`
3. Read `users` row by `consumer_id`
4. Call `getGrowthStage(fields.planting_date)` → growth stage
5. Call `getFertilizerSchedule(fields.field_area_acres, fields.soil_type, fields.crop_type)`
6. Call `evaluatePestRisks(weather, growthStage, daysSincePlanting, month, fields.sugarcane_variety)`
7. Call `calculateTotalSavings()` with current session context
8. Generate Marathi advisory text based on duration, time-of-day, and stage
9. INSERT `crop_advisories` row
10. IF pest risk HIGH/CRITICAL → INSERT `pest_alerts` row
11. IF savings event triggered → INSERT `savings_log` row
12. UPDATE `water_sessions.advisory_generated = true`
13. Return advisory data

---

## FUNCTION 7: `morning-message`

**Purpose:** Cron job at 6 AM IST — send daily advisory to all active consumers.

**Trigger:** Supabase pg_cron — `0 0 * * *` (UTC = 5:30 AM IST, or adjust for 6 AM)

**Logic:**
1. Query all active consumers (`subscription_status IN ('trial','active') AND is_active = true`)
2. For each consumer:
   a. Get field by `consumer_id`
   b. Call `getGrowthStage(fields.planting_date)` 
   c. Call `weather-fetch` Edge Function for their taluka
   d. Build Marathi morning message
3. Group into batches of 50
4. For each batch:
   a. Call `wati-send` Edge Function for each consumer in batch
   b. Wait 1 second between batches
5. On WATI send failure: enqueue to `job_queue` for retry
6. Log completion

---

## FUNCTION 8: `pest-check`

**Purpose:** Cron job (daily) — evaluate pest risks for all active fields.

**Logic:**
1. Query all active fields with recent water activity (last 30 days)
2. For each field:
   a. Get current weather via `weather-fetch` Edge Function
   b. Call `evaluatePestRisks(weather, growthStage, daysSincePlanting, currentMonth, variety)`
   c. IF any risk is HIGH or CRITICAL:
      - INSERT `pest_alerts` row
      - Enqueue WATI notification to consumer via `job_queue`
      - INSERT `notifications` row (in-app)

---

## FUNCTION 9: `job-processor`

**Purpose:** Cron job (every 1 minute) — process pending jobs from queue.

**Logic:**
1. SELECT pending jobs from `job_queue` WHERE `status = 'pending' AND next_retry_at <= now()`
2. For each job:
   a. UPDATE `status = 'processing'`
   b. Execute job by type:
      - `wati_send`: call WATI API
      - `push_notification`: call Web Push API
      - `commission_credit`: insert commission_wallet row
   c. ON SUCCESS: UPDATE `status = 'completed'`
   d. ON FAILURE:
      - `attempts += 1`
      - IF `attempts < max_attempts` (3): set `next_retry_at = now() + ${2^attempts}s` (exponential: 1s, 4s, 16s)
      - IF `attempts >= max_attempts`: set `status = 'dead'`

---

## FUNCTION 10: `reconcile-payments`

**Purpose:** Cron job (midnight) — cross-check Razorpay payments against local DB.

**Logic:**
1. Query Razorpay API for all payments in past 24 hours
2. For each captured payment:
   a. Find matching subscription in DB by `razorpay_subscription_id`
   b. IF not found → INSERT `audit_log` (missing subscription)
   c. IF found but status mismatch → INSERT `audit_log` (status discrepancy)
   d. IF found but amount mismatch → INSERT `audit_log` (amount discrepancy)
3. Return reconciliation summary

**Secrets required:** `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
