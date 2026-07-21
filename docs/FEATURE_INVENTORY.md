# JalSheti Pro — Complete Feature Inventory

**Version:** 1.0.0 | **Date:** July 13, 2026 | **Status:** Milestone 0.5 + M1 Complete

---

## FEATURE CLASSIFICATION

| Icon | Meaning |
|---|---|
| ✅ | Fully implemented with production code |
| ⚡ | Implemented, not yet verified by tests |
| 🔧 | Partially implemented |
| 📅 | Planned (Milestone 2+) |
| 🔮 | Future (Year 2+) |

---

## 1. AUTHENTICATION & ONBOARDING

### 1.1 Phone OTP Authentication ✅
- Phone number entry with +91 country code prefix
- 6-digit SMS OTP delivery via Twilio Verify (international route while DLT processes)
- DLT entity registration submitted in parallel for domestic SMS
- OTP auto-read on supported Android devices
- 5-minute OTP expiry
- 5-attempt lockout with 15-minute cooldown
- Resend OTP with 30-second countdown timer
- "Change number" link to return to phone entry
- Supabase Auth integration (phone sign-in with OTP)

### 1.2 DPDP Consent Screen ✅
- Full Marathi consent text explaining data usage (GPS location, photos, water logs, personal data)
- Mandatory checkbox: "मला वरील अटी मान्य आहेत"
- "पुढे" button disabled until consent checkbox is checked
- `users.consent_granted_at` timestamp recorded on consent
- Age verification: "I am 18+ years old" checkbox
- Links to privacy policy and terms of service
- Scientific disclaimer: "हा सल्ला माहितीसाठी आहे. स्थानिक कृषी तज्ज्ञांचा सल्ला घ्या."

### 1.3 Role Selection ✅
- Three role cards with Marathi labels and descriptions:
  - शेतकरी (Farmer): "तुमच्या शेतीची माहिती, सल्ला आणि योजना"
  - पुरवठादार (Supplier): "पाणी वेळापत्रक, शेतकरी व्यवस्थापन, कमाई"
  - प्रशासक (Admin): "व्यवस्थापकीय कामे"
- Large icon-based card design, single-tap selection
- Proceed to role-specific registration form

### 1.4 Supplier Registration ✅
- Fields: full name, village, taluka, district (default: Kolhapur), admin code, optional referral code
- Admin code validation via `validate-supplier-code` Edge Function (server-side, never exposed in client bundle)
- `generate_referral_code()` trigger auto-creates 8-character unique uppercase referral code on supplier registration
- Optional referral code links to referring supplier
- Zod validation with Marathi error messages on all fields
- Subscription status set to 'free' (suppliers never pay)
- Redirect to `/supplier` dashboard on success

### 1.5 Consumer Registration ✅
- Fields: full name, village, taluka, district (default: Kolhapur), supplier phone number
- Supplier phone validated: must exist with role='supplier'
- Consumer linked to supplier via `linked_supplier_id`
- 7-day free trial automatically started (`trial_ends_at = now() + 7 days`)
- `subscription_status` set to 'trial'
- Redirect to `/consumer` dashboard on success with field setup prompt

### 1.6 Account Management ✅
- Profile update (name, village, taluka, district)
- Account deletion with cascading soft-delete (DPDP right to erasure)
- Data export endpoint (`GET /api/v1/user/export`) returning all user data as JSON
- 30-day grace period before hard delete
- Session timeout: 30-minute idle → force re-authentication for sensitive actions

---

## 2. CONSUMER FEATURES

### 2.1 Field Setup Wizard ✅
- 4-step onboarding wizard on first consumer login:
  - **Step 1:** Field area (acres), sugarcane variety selector (Co 86032 / CoM 0265 / Co 94012 / Co 0238 / Other), planting date, crop type (Suru / Adsali / Pre-seasonal)
  - **Step 2:** Row spacing selector (3.5ft / 4ft ⭐ / 4.5ft / 5+ft / Unknown), framed as management style not capability judgment
  - **Step 3:** Organic resources checklist (Cattle / Poultry / Goat-Sheep / Biogas plant / Sugar factory member / None)
  - **Step 4:** Soil Card (15-question Marathi wizard, 1 question per screen, large tap targets)

### 2.2 Water Session Logging ✅
- Green "पाणी सुरू केले" button (56px, #4CAF50)
- Red "पाणी बंद केले" button (56px, #C62828, pulsing animation when water running)
- Live elapsed timer display (HH:MM:SS)
- GPS coordinates captured on START
- Timestamp precision: exact start/stop to the second
- Duration auto-calculated in minutes
- Crop day at session calculated from planting date
- Growth stage auto-detected from crop day
- Water sufficiency assessment: insufficient / optimal / overwatered
- 5-second undo snackbar after STOP: "पाणी बंद केले — बदलायचे? [रद्द करा]"
- Offline queue: session logged locally when offline, synced on reconnect

### 2.3 Tai Voice Advisory ✅
- Azure Cognitive Services TTS: voice `mr-IN-AarohiNeural` (female, natural Marathi)
- Server-side proxy via `tts-proxy` Edge Function (hides `AZURE_TTS_KEY`)
- Auto-plays after water session STOP
- Manual replay button: "🔊 ताईचा सल्ला ऐका"
- SSML-based speech with proper Marathi pronunciation
- Tai persona: validates before suggesting, never commands, uses "काका" honorific, informal Kolhapur dialect
- Script variants based on water sufficiency:
  - Optimal: "सांगाड्याचं काम केलंत! शेत छान वाढतंय काका 🌾"
  - Insufficient: "पाण्याचा वेळ थोडा कमी झाला. उद्या थोडं जास्त वेळ पाणी द्या."
  - Overwatered: "पाणी जरा जास्त झालं. मुळांना हवा लागते."

### 2.4 Crop Advisory Intelligence ✅
- Post-session advisory auto-generated by `generate-advisory` Edge Function
- Stage-specific advisory text in Marathi for all 5 growth stages
- Duration-based sufficiency assessment
- Time-of-day awareness (morning optimal, afternoon = 40% evaporation loss warning, evening = fungal risk)
- Next irrigation date auto-calculated based on growth stage interval
- Fertilizer action reminder if within application window
- Pest watch flag if weather conditions indicate elevated risk
- Fertilizer brand suggestions as expandable section

### 2.5 Savings Counter ✅
- Prominent display on consumer dashboard: "💰 तुम्ही वाचवले: ₹X,XXX"
- Real-time update after savings events trigger
- 8 savings event types:
  | Event | Saving (₹) |
  |---|---|
  | Rain avoided irrigation | 220 |
  | Correct fertilizer timing | 800 |
  | Pest warning acted upon | 15,000 |
  | Optimal irrigation | 180 |
  | Urea rain delay (avoided wash-off) | 400 |
  | Herbicide rain delay | 200 |
  | Insurance claim documented | variable |
  | Government scheme claimed | 2,000 |
- Season total accumulation
- Animated counter update on new savings
- Detailed savings history view

### 2.6 Pani Dakhla (Water Proof Certificate) ✅
- GPS-tagged, timestamped PDF water receipt
- Digital hash for document authenticity
- Contains: farmer name, village, taluka, field ID, water start/stop times, duration, supplier acknowledgment
- Download as PDF button
- Share via WhatsApp button
- Legal validity note: "हा दाखला ग्रामपंचायत, WUA, न्यायालयासाठी वैध आहे."
- Generated using jsPDF + html2canvas

### 2.7 Soil Card System ✅
- 15-question Marathi wizard covering: soil color, texture (dry + wet), water retention, cracking, drainage, previous yield, fertilizer response, leaf color, root appearance, weed type, crop history, irrigation source, water taste, manure history, soil hardness
- Large option buttons (56px minimum), 1 question per screen
- Progress indicator: "प्रश्न ३ / १५"
- Results: soil type detected (काळी कसदार / लाल माती / वाळूयुक्त / गाळाची), pH estimate, nitrogen level, water retention capacity
- Fertilizer dosage recommendations per acre
- Shareable PDF result card with "प्रमाणित स्मार्ट शेतकरी" certification
- `question_set_version` column for future question set updates

### 2.8 Fertilizer Intelligence Engine ✅
- **Solid Fertilizer Schedule:** Base doses (130kg Urea + 52kg DAP + 40kg MOP per acre), 4 application windows (Basal + TD1 + TD2 + TD3 for Adsali), soil-type modifiers (black cotton: -20% MOP, split urea; sandy: 4 urea splits; red: full MOP + zinc; alluvial: standard)
- **Weather Gating:** >30mm rain forecast in 48 hours → hold urea → savings event `UREA_RAIN_DELAY` (₹400). High temp >35°C → ammonia volatilization warning.
- **Brand Recommendations:** IFFCO / Coromandel / RCF / NFL (urea), IFFCO DAP, Mahadhan MOP, Mahadhan 10:26:26 / Coromandel Gromor 12:32:16 (NPK blends), Mahadhan Zinc / Tata Zinc Sulphate
- **Liquid Booster:** Nano Urea / Nano DAP / NPK 19:19:19 suggestions triggered only when N deficiency flagged AND between solid doses AND no rain in 24 hours
- **Organic Solid Manure:** Resource-matching logic (hasCattle→FYM 5-20t/acre, hasPoultry→aged poultry manure, hasBiogas→slurry, nearSugarFactory→press mud [HIGHEST LEVERAGE, often free])
- **Organic Liquid:** 6-tier system (Tier 0: biogas slurry, Tier 1: Matka Khad, Tier 2: Jeevamrut [FLAGSHIP, most validated], Tier 2b: Beejamrut [seed treatment], Tier 3: Vermiwash [one-time setup, passive], Tier 4: Panchagavya [optional upgrade])
- **Chemical Reduction:** Combined cap at 35% (25% solid + 10% liquid organic)
- **NEVER FRESH DUNG** safety warning for vermiwash

### 2.9 Pest & Disease Warning Engine ✅
- 6 diseases evaluated dynamically:
  | Disease | Marathi | Key Triggers |
  |---|---|---|
  | Early Shoot Borer | लोंबी किड | 15-90 days, 25-30°C, humidity >70%, Mar-Jun |
  | Red Rot | लाल कूज | Rainfall >50mm, humidity >85%, >90 days |
  | Smut | काणी रोग | May-Jun or Oct-Nov, humidity >75% |
  | Internode Borer | आंतरगाठ किड | >120 days, temperature >28°C |
  | Wilt | मर रोग | >10 days no irrigation, non-resistant variety |
  | Top Borer | शेंडा पोखर किड | >120 days, temperature >28°C |
- Variety-specific risk multipliers (Co86032: redRot 0.6, smut 0.5; Co0238: redRot 1.8, topBorer 1.6)
- Smell-based differential diagnosis for Red Rot vs Wilt
- Confidence scoring (0-100) based on condition match count
- Row-spacing airflow disease multiplier (narrow→denser canopy→marginally higher fungal pressure)
- Marathi treatment recommendations with urgency levels
- Daily cron-based pest check for all active fields
- Active pest alerts shown on consumer dashboard as amber banner

### 2.10 Weed Management Engine ✅
- Mini-quiz identification: weed type (grassy / broadleaf / sedge / mixed), weed size (new / medium / old)
- 5-type → 4-product recommendation table
- Weather gating: no spray within 24 hours of rain → savings event `HERBICIDE_RAIN_DELAY` (₹200)
- Sedge/Motha: standard herbicides weak → recommend hand-weeding, local Krishi Seva Kendra
- Row-spacing weed intensity multiplier (simplified tier: 1.3 early → 0.5 after canopy; advanced without intercrop: 1.4 all season; with intercrop: 0.8)
- Auto-populated in Crop Calendar at relevant DAP windows (0-5, 15-25, 20-30, 30-40)

### 2.11 Row Spacing & Field Geometry ✅
- 4ft default with ⭐ marker (research-backed sweet spot across independent trials)
- Maintenance tier classification: simplified (≤3.5ft) / standard (4ft) / advanced (≥4.5ft)
- Intercrop suggestions for advanced tier: sunnhemp/dhaincha (doubles as green manure), groundnut, soybean, greengram
- Weed intensity multiplier cross-linked to weed engine
- Airflow disease multiplier cross-linked to pest engine

### 2.12 Crop Calendar ✅
- Monthly action plan based on growth stage
- Auto-populated weed windows (0-5, 15-25, 20-30, 30-40 DAP)
- Fertilizer application windows marked
- Pest risk periods highlighted
- Weather-gated actions marked with status icons

### 2.13 Government Schemes ✅
- PM-KISAN: payment tracking, eligibility, "तुमचे पैसे येणार" notification
- PMFBY (Pradhan Mantri Fasal Bima Yojana): crop insurance information
- KCC (Kisan Credit Card): renewal reminders
- Soil Health Card scheme awareness
- Scheme-specific Marathi descriptions and eligibility criteria
- "आत्ता अर्ज करा" CTA with link to official portals

### 2.14 Factory / FRP Tracker ✅
- FRP (Fair and Remunerative Price) rate display per district
- Factory opening dates for harvest planning
- Sugar recovery rate tracking
- Harvest slot booking availability indicator
- Updated by admin through Market Rates management panel

### 2.15 Insurance Claim Documentation ✅
- Photo upload for crop damage documentation (JPEG/PNG/WebP, max 10MB)
- GPS location tagging on damage photos
- Water session history linked as evidence
- Weather data at time of damage captured
- Crop stage at damage recorded
- Claim amount requested field
- Status tracking: draft → filed → reviewing → approved → rejected → settled
- Generate claim report as shareable document

### 2.16 Season Report ✅
- Annual PDF report: "तुमच्या उसाची कहाणी" (Your Sugarcane's Story)
- Water session summary (total sessions, total duration, average duration)
- Savings accumulated over season
- Growth stage journey timeline
- Pest alerts encountered and actions taken
- Fertilizer application log
- Shareable artifact for household budget discussions

### 2.17 Profile & Settings ✅
- Personal information display and edit
- Field details view
- Subscription status and plan information
- Subscription management (upgrade/downgrade)
- Connected supplier information
- Notification preferences

---

## 3. SUPPLIER FEATURES

### 3.1 Supplier Dashboard ✅
- Personalized greeting
- Earnings widget showing: this month's commission, total earned, pending payout amount
- Quick stats: total farmers connected, active today count
- Primary CTA: "पाणी वेळापत्रक द्या" button
- Real-time activity feed: water session START/STOP events from all linked consumers with farmer name and timestamp
- Inactive farmer alerts: consumers with 3+ days of no water log highlighted with warning icon
- Referral CTA: "रेफरल करा → ₹१,००० मिळवा" with share button

### 3.2 Water Schedule Management ✅
- Set irrigation schedule per consumer: date + start time + end time
- View all upcoming schedules by date
- Edit/reschedule if rain or conflict
- Mark as completed / missed / rescheduled
- Consumer sees schedule on their dashboard: "📅 पुढचे पाणी: २५ जुलै (३ दिवस)"

### 3.3 Real-time Notifications ✅
- Supabase Realtime subscription to `water_sessions` for all linked consumers
- Instant notification on consumer water START: "रामेश पाटील — पाणी सुरू 9:42 AM"
- Instant notification on consumer water STOP: "रामेश पाटील — पाणी बंद 11:15 AM (93 मिनिटे)"
- Notification badge with unread count
- WhatsApp fallback via WATI templates (when approved)
- In-app notification history with read/unread tracking

### 3.4 Commission Wallet ✅
- Real-time balance display
- Per-consumer monthly commission tracking (₹20/40/60 by plan tier)
- Milestone cashback progress tracking (5→150, 10→200, 15→250, 20→400)
- Referral cashback tracking
- Payout request functionality (minimum ₹200)
- Payout status tracking: pending → approved → paid → rejected
- Monthly earnings breakdown

### 3.5 Farmer Management ✅
- Complete list of all linked consumers
- Per-farmer statistics: last water session, total sessions, crop stage, days since planting
- Inactive farmer flagging (3+ days without logging)
- Farmer details drill-down view
- Direct WhatsApp contact link to each farmer

### 3.6 Referral Program ✅
- Unique referral code auto-generated on registration
- Share referral code/link via WhatsApp
- Track referred suppliers: pending / approved / paid / rejected status
- Milestone cashback ladder:
  | Referrals | Cumulative Cashback |
  |---|---|
  | 5 | ₹150 |
  | 10 | ₹350 |
  | 15 | ₹600 |
  | 20 | ₹1,000 |
- Fraud gate: 2 consecutive paid months per referred supplier before cashback releases

---

## 4. ADMIN FEATURES

### 4.1 Platform Metrics Dashboard ✅
- MRR (Monthly Recurring Revenue) card
- ARR (Annual Run Rate) card
- Active consumers count
- Active suppliers count
- Active trials count
- Revenue growth trends

### 4.2 Payout Approvals ✅
- Pending commission payout queue
- Supplier name, amount, breakdown (commission + referral)
- Approve / Reject / Hold action buttons with notes field
- Bulk approval for trusted suppliers
- Auto-validation: minimum ₹200 threshold, 2-month active consumer gate
- Payout history with filtering by status
- `audit_log` entries for all approval actions

### 4.3 Market Rate Management ✅
- District selector dropdown (Kolhapur, Sangli, Satara, Pune, Ahmednagar)
- FRP rate input (₹ per quintal)
- Factory name and opening date fields
- Sugar recovery rate tracking
- Harvest slot booking open/closed toggle
- Notes in Marathi for farmer communication
- All changes logged to `audit_log`

### 4.4 Broadcast Messaging ✅
- Marathi textarea for message composition
- Target audience selector: all users / all consumers / all suppliers / by district
- Send broadcast button with confirmation
- Success toast: "प्रसारण पाठवले!"
- Error handling: "संदेश आवश्यक आहे" validation
- Delivery via push notification (Web Push) + in-app notification

### 4.5 Audit Log Viewer ✅
- View all admin actions: actor, action type, table affected, record ID, timestamp
- Old values / new values for changed records
- IP address and user agent tracking
- Filterable by action type and table name
- Immutable audit trail

---

## 5. PLATFORM INFRASTRUCTURE

### 5.1 Database Architecture ✅
- 22 tables + `auth.users` (Supabase managed)
- 30+ performance indexes covering all hot query paths
- 31 RLS policies providing row-level access control
- 4 database functions: `handle_new_user`, `generate_referral_code`, `reassign_supplier`, auto-updated_at triggers
- CHECK constraints on all enum-like and numerical columns
- FK ON DELETE strategy: CASCADE for hard children, SET NULL for optional references
- Realtime publication on `water_sessions`, `notifications`, `pest_alerts`
- Storage buckets: `insurance-photos`, `crop-diagnosis` (10MB limit, JPEG/PNG/WebP only)
- `feature_flags` table for A/B testing and gradual rollout
- `job_queue` table for async job processing with exponential backoff retry
- `engine_feedback` table for AI feedback loop data collection
- `supplier_assignment_history` for supplier change audit trail

### 5.2 Edge Functions (10 Functions) ✅
| Function | Type | Auth | Rate Limit |
|---|---|---|---|
| validate-supplier-code | Security Proxy | None | 10/IP/min |
| tts-proxy | Security Proxy | JWT | 30/user/min |
| wati-send | Security Proxy | JWT + allowlist | 5/user/min |
| razorpay-webhook | Business Logic | HMAC-SHA256 | 100/min |
| weather-fetch | Business Logic | None | 1/taluka/hr (cache) |
| generate-advisory | Business Logic | service_role | — |
| morning-message | Cron Job (6 AM IST) | service_role | Batched 50/s |
| pest-check | Cron Job (daily) | service_role | — |
| job-processor | Cron Job (every 1 min) | service_role | — |
| reconcile-payments | Cron Job (midnight) | service_role | — |

### 5.3 Progressive Web App ✅
- Service worker with Workbox (generateSW mode)
- Offline page caching: all app shells cached for offline access
- API caching strategies:
  - Weather API: StaleWhileRevalidate, 1-hour expiry
  - Supabase API: NetworkFirst
  - Azure TTS: NetworkFirst
- Installable PWA: standalone display, portrait orientation
- PWA manifest: Marathi app name, green theme color (#2E7D32)
- Background sync for offline-queued water sessions

### 5.4 Security Infrastructure ✅
- All secrets server-side via Edge Functions (zero VITE_ prefixed secrets)
- HMAC-SHA256 webhook verification for Razorpay
- Content Security Policy (CSP) header
- HTTP Strict Transport Security (HSTS) with preload
- X-Frame-Options: DENY, X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- React ErrorBoundary wrapping all routes
- .env.local excluded from git
- RLS on all 22 tables (31 policies)
- Money tables append-only by design (no client write policies)
- OTP: 6-digit, 5-minute expiry, 5-attempt lockout

### 5.5 CI/CD Pipeline ✅
- GitHub Actions workflow: lint → typecheck → build → security audit
- Vercel deployment on main branch push
- Vercel preview deployments for pull requests
- `vercel.json` with security headers and SPA rewrites

---

## 6. BUSINESS LOGIC

### 6.1 Pricing Engine ✅
- 3-tier subscription model:
  | Plan | Price | Razorpay (paise) | Features |
  |---|---|---|---|
  | Basic | ₹99/mo | 9900 | Water tracking, Marathi advisory, Tai voice, Pani Dakhla, Pest alerts |
  | Smart | ₹199/mo | 19900 | All Basic + Advanced AI advisory, Crop calendar, Yield tips, Weather integration |
  | Premium | ₹299/mo | 29900 | All Smart + Photo diagnosis, Insurance docs, Priority support |
- 7-day free trial on all new consumer registrations
- Harvest-anchored annual billing support (12 months for price of 8, collected at factory payment time)

### 6.2 Commission Engine ✅
- Percentage-based commission per tier: 20% (₹20/40/60)
- Monthly recurring commission for each active consumer
- Milestone cashback ladder for supplier referrals (5→150, 10→200, 15→250, 20→400)
- Commission credited ONLY after verified payment webhook (HMAC confirmed)
- UPI mandate ≠ payment confirmed (RBI 24-hour pre-debit rule respected)
- Minimum payout threshold: ₹200
- Fraud gate: 2 consecutive paid months required for cashback release

### 6.3 Unit Economics (per 20-consumer supplier, 5-month season)
| Item | Amount |
|---|---|
| Gross revenue (20 × ₹99 × 5) | ₹9,900 |
| Commission out (20 × ₹20 × 5) | −₹1,500 |
| Cashback out (cumulative) | −₹1,000 |
| **Platform net** | **₹7,400** |
| **Supplier total** | **₹2,500** |

---

## 7. MARKETPLACE & EXTERNAL INTEGRATIONS

### 7.1 Razorpay Payments ✅
- UPI Autopay e-Mandate subscription
- Razorpay customer creation linked to phone number
- Subscription creation with plan-based amounts
- Razorpay checkout integration
- Webhook endpoint with HMAC-SHA256 signature verification
- Payment reconciliation via daily cron
- Commission auto-credit on payment capture

### 7.2 WATI WhatsApp Business API ✅
- Edge Function proxy for all WATI calls
- Template allowlist enforcement (7 approved templates)
- Utility category templates (not Marketing — 80-90% cheaper)
- Morning advisory messages (batched, 50/second)
- Pest alert notifications
- Water schedule reminders
- Payment confirmations to suppliers
- 5 templates pending Meta approval

### 7.3 OpenWeatherMap Integration ✅
- Per-taluka weather caching (1-hour TTL)
- Temperature, humidity, rainfall, wind speed data
- Used by pest warning engine for disease risk evaluation
- Used by fertilizer engine for weather gating
- Used by weed engine for spray timing
- Used by morning message for daily weather update
- Single cached fetch per taluka serves all consumers in that area

### 7.4 Azure Cognitive Services TTS ✅
- Voice: `mr-IN-AarohiNeural` (female Marathi neural voice)
- Central India region for low latency
- Server-side proxy through Edge Function
- SSML-based speech synthesis with proper Marathi pronunciation
- Auto-play after water session completion
- Manual replay via dedicated button

---

## 8. MARATHI LOCALIZATION

### 8.1 Complete MR Dictionary ✅
- 50+ namespaces covering all app domains
- 1,300+ Marathi strings
- 68 flat-screen aliases for component compatibility
- Namespaces: app, auth, consumer, soil, pest (6 diseases), fertilizer, weed, spacing, supplier, admin, schemes, factory, paniDakhla, streak, cropCalendar, notifications, insurance, profile, common, empty, error, offline, agronomyPhases (7 phases), adminSpecific, nav_

### 8.2 Tai Voice Persona ✅
- Warm elder-sister character
- Kolhapur-dialect informal Marathi
- Uses "काका" honorific for farmers
- Uses "तुम्ही" (formal you)
- Validates before suggesting: "हे तुम्हाला माहीतच आहे, पण..."
- Never commands — always suggests
- Shares information as "news" rather than "instruction"

### 8.3 Co 0238 Advisory Text ✅
- Gentle, validation-first warning for farmers growing declining Co 0238 variety
- "Co-0238 चांगले उत्पादन देते — हे तुम्हाला माहीतच आहे. पण एक गोष्ट सांगायची: या जातीत अलीकडे लाल कूज आणि शेंडा किडीचा धोका थोडा जास्त असतो."
- Suggests Co 86032 or CoM 0265 for next planting cycle — never alarmist

---

## 9. STATE MANAGEMENT & OFFLINE

### 9.1 Zustand Global Store ✅
- 15 actions managing user, field, water session, notifications, offline queue
- Supplier realtime feed (max 50 items)
- Online/offline connectivity tracking via `navigator.onLine` + event listeners
- Offline queue with action + payload + timestamp
- Sync status tracking: idle → syncing → error
- Initial state reset on logout

### 9.2 Offline-First Architecture ✅
- Water session queued in IndexedDB/offline queue when offline
- Persistent connectivity indicator in header (🟢 online / 🔴 offline / 🟡 syncing)
- Service worker: app shell + API caching
- Background sync on reconnect
- Conflict resolution for multi-device scenarios (timestamp-based)

---

## 10. PLANNED FEATURES (Future Milestones)

### 10.1 Photo-Based Crop Diagnosis 🔮
- Image upload with pre-processing (resize, normalize, WebP conversion)
- AI-based first-pass analysis: leaf color → nitrogen status, visible damage → pest type
- Human review fallback
- Integration with `image_diagnosis` table

### 10.2 Two-Way Marathi Voice Assistant 🔮
- Speech-to-Text (Azure mr-IN) for farmer questions
- NLU: intent extraction (water query, pest query, fertilizer query, scheme query)
- LLM-based Marathi response generation (GPT-4o with crop knowledge base)
- TTS response via existing Azure pipeline

### 10.3 Yield Estimation 🔮
- Combine field area, variety, growth stage, water history, fertilizer compliance
- Statistical yield range estimation
- Pre-harvest yield projection for financial planning

### 10.4 Predictive Pest Outbreak 🔮
- Aggregate pest alert data across all farmers in a taluka
- Predict outbreak spread direction and timing
- Wind + humidity pattern analysis
- Early warning to neighboring villages

### 10.5 Farmer Referral Program 🔮
- Referral link generation for existing consumers
- "Refer a farmer, get 1 month free" incentive
- Tracking codes and anti-fraud measures
- Independent consumer viral loop

### 10.6 Marketplace 🔮
- Fertilizer and equipment purchasing
- Insurance product integration
- Connecting farmers with input suppliers
- Commission on marketplace transactions

### 10.7 Government API Integration 🔮
- Direct PM-KISAN status API integration
- PMFBY claim status checking
- KCC application tracking
- Real-time scheme eligibility verification

### 10.8 Multi-Language Expansion 🔮
- Hindi, Kannada, Telugu support for neighboring states
- Shared engine logic, localized dictionaries
- Per-state variant of agronomy recommendations
