# JalSheti Pro — System Architecture

**Version:** 1.0.0 | **Target:** GLM 5.2

---

## 1. LAYERED ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│ CLIENT LAYER (Vercel CDN)                                       │
│                                                                 │
│  PWA Shell                                                      │
│  ├── Service Worker (offline cache, background sync)             │
│  ├── React 18 App Shell                                          │
│  │   ├── ErrorBoundary (wraps all routes)                       │
│  │   ├── Router (19 routes, role guards)                        │
│  │   ├── Zustand Store (global state)                           │
│  │   ├── Screens (4 role-specific bundles, lazy loaded)         │
│  │   └── Services (orchestration layer)                         │
│  └── Engines (pure function modules, no DB access)              │
├─────────────────────────────────────────────────────────────────┤
│ EDGE LAYER (Supabase Edge Functions — Deno)                     │
│                                                                 │
│  Security Proxies:                                              │
│  ├── validate-supplier-code (hides admin code)                  │
│  ├── tts-proxy (hides Azure TTS key)                            │
│  └── wati-send (hides WATI token, template allowlist)           │
│                                                                 │
│  Business Logic (service_role):                                 │
│  ├── razorpay-webhook (HMAC verified → credit commission)       │
│  ├── generate-advisory (post-session crop advisory)             │
│  └── weather-fetch (per-taluka cache, 1hr TTL)                  │
│                                                                 │
│  Cron Jobs (Supabase pg_cron):                                  │
│  ├── morning-message (6 AM IST → batched WATI sends)            │
│  ├── pest-check (daily → weather-triggered pest alerts)         │
│  ├── job-processor (every 1 min → processes job_queue)          │
│  └── reconcile-payments (midnight → cross-checks Razorpay)      │
├─────────────────────────────────────────────────────────────────┤
│ DATA LAYER (Supabase PostgreSQL 15)                             │
│                                                                 │
│  Schema: 22 tables + auth.users (Supabase managed)              │
│  RLS: 31 policies, all tables protected                         │
│  Indexes: 30+ covering all hot query paths                      │
│  Triggers: handle_new_user, generate_referral_code,             │
│           reassign_supplier, auto-updated_at                     │
│  Realtime: water_sessions, notifications, pest_alerts           │
│  Storage: insurance-photos, crop-diagnosis buckets              │
├─────────────────────────────────────────────────────────────────┤
│ EXTERNAL SERVICES                                               │
│                                                                 │
│  Azure TTS (mr-IN-AarohiNeural) ← tts-proxy EF                 │
│  Razorpay UPI Autopay ← razorpay-webhook EF (HMAC)             │
│  WATI WhatsApp API ← wati-send EF (template allowlist)          │
│  OpenWeatherMap ← weather-fetch EF (cached per taluka)          │
│  Twilio Verify ← send-otp (direct or via EF, DLT-gated)        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. COMPLETE FOLDER STRUCTURE

```
jalsheti-pro/
│
├── public/
│   ├── favicon.svg
│   └── icons/              # PWA icons (192px, 512px)
│
├── src/
│   ├── main.tsx            # React 18 createRoot, BrowserRouter
│   ├── App.tsx             # Router + ErrorBoundary + online listener
│   ├── index.css           # Tailwind v4 imports, theme tokens, skeleton animation
│   │
│   ├── types/
│   │   ├── index.ts        # All interfaces, enums, constants (26 interfaces, 18 enums)
│   │   └── database.ts     # Supabase Database type (22 table Row/Insert/Update)
│   │
│   ├── lib/
│   │   ├── supabase.ts     # Typed Supabase client, 15 query helpers, 2 realtime subs
│   │   └── auth.ts         # sendOTP, verifyOTP, registerConsumer, registerSupplier
│   │
│   ├── store/
│   │   └── useAppStore.ts  # Zustand global store (15 actions, offline queue)
│   │
│   ├── schemas/
│   │   └── index.ts        # Zod validation: phone, OTP, supplier/consumer registration, field, schedule
│   │
│   ├── hooks/
│   │   └── index.ts        # useRouteGuard(role[]) → redirect logic
│   │
│   ├── i18n/
│   │   └── marathi.ts      # Complete MR dictionary (50+ namespaces, 1300+ lines)
│   │
│   ├── engines/
│   │   ├── crop/
│   │   │   ├── cropIntelligence.ts     # getGrowthStage, getFertilizerSchedule, getNextFertilizerAction
│   │   │   └── soilCardAnalysis.ts     # SOIL_QUESTIONS, analyzeSoilCard
│   │   ├── pest/
│   │   │   └── pestWarningEngine.ts    # evaluatePestRisks (6 diseases), getVarietyRiskMultiplier
│   │   ├── weed/
│   │   │   └── weedEngine.ts           # getWeedRecommendation (5 types → 4 products)
│   │   ├── fertilizer/
│   │   │   ├── solidFertilizerEngine.ts # Re-exports + brand tables + organic reduction
│   │   │   ├── liquidFertilizerEngine.ts# getLiquidBoosterSuggestion
│   │   │   ├── organicManureEngine.ts  # getPrimaryManureRecommendation (resource matching)
│   │   │   └── liquidOrganicEngine.ts  # getLiquidOrganicTiers (6 tiers), getCombinedChemicalReduction
│   │   ├── geometry/
│   │   │   └── rowGeometryEngine.ts    # getMaintenanceTier, weedIntensity, airflowMultiplier
│   │   ├── commission/
│   │   │   └── commissionLogic.ts      # calculateSupplierEarnings, milestone ladder
│   │   └── savings/
│   │       └── savingsCalculator.ts    # SAVINGS_EVENTS (8 types), calculateTotalSavings
│   │
│   ├── services/           # Orchestration layer (deferred to M2)
│   │
│   └── screens/
│       ├── Shared/
│       │   └── ErrorBoundary.tsx       # React class component, catches unhandled errors
│       ├── Auth/
│       │   └── AuthScreen.tsx          # 6-step state machine (phone→OTP→consent→role→register→done)
│       ├── Consumer/
│       │   └── ConsumerDashboard.tsx   # Water log, Tai voice, savings, pest alerts, fertilizer
│       ├── Supplier/
│       │   └── SupplierDashboard.tsx   # Earnings widget, farmer list, realtime feed, referral
│       └── Admin/
│           └── AdminDashboard.tsx      # Payout approvals, market rates, broadcast, audit
│
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql     # 22 tables + RLS enable + Realtime publication
│   │   ├── 002_auth_trigger.sql       # handle_new_user, generate_referral_code, reassign_supplier
│   │   ├── 003_indexes.sql            # 30+ performance indexes
│   │   └── 004_rls_policies.sql       # 31 RLS policies + 2 storage bucket policies
│   │
│   └── functions/
│       ├── _shared/
│       │   └── cors.ts                # CORS headers constant
│       ├── validate-supplier-code/    # POST {adminCode} → {valid: boolean}
│       ├── tts-proxy/                 # POST {text} → audio/mpeg (Azure TTS proxy)
│       ├── wati-send/                 # POST {phone, templateName, params} → WATI API
│       ├── razorpay-webhook/          # Razorpay POST → HMAC verify → credit commission
│       ├── weather-fetch/             # GET ?taluka&district → cached weather data
│       ├── generate-advisory/         # POST {sessionId} → advisory + pest + savings
│       ├── morning-message/           # Cron 6AM → batched WATI sends to all active consumers
│       ├── pest-check/                # Cron daily → evaluate pest risks for all fields
│       ├── job-processor/             # Cron 1min → process job_queue with retry
│       └── reconcile-payments/        # Cron midnight → cross-check Razorpay payments
│
├── .github/workflows/
│   └── ci.yml                         # lint → typecheck → build → audit
│
├── vercel.json                        # CSP, HSTS, security headers, SPA rewrites
├── package.json                       # Dependencies and scripts
├── vite.config.ts                     # React + Tailwind v4 + VitePWA plugins
├── tsconfig.json                      # Project references
├── tsconfig.app.json                  # TypeScript config (strict, react-jsx, noEmit)
├── tsconfig.node.json                 # Vite config TypeScript
├── .env.local.example                 # 5 public env vars (no secrets)
├── .gitignore
├── index.html                         # Vite entry, Noto Sans Devanagari font link
├── DECISION_LOG.md
└── README.md
```

---

## 3. MODULE INTERACTION MAP

```
App.tsx
├── imports: ErrorBoundary, AuthScreen, ConsumerDashboard, SupplierDashboard, AdminDashboard
├── imports: useAppStore (Zustand), getCurrentUser (supabase.ts)
│
├── ErrorBoundary │ wraps all Routes
│
├── AuthScreen
│   ├── imports: useForm (react-hook-form), zodResolver (@hookform/resolvers/zod)
│   ├── imports: sendOTP, verifyOTP, registerConsumer, registerSupplier (auth.ts)
│   ├── imports: useAppStore (setUser, user), supabase (getSession)
│   ├── imports: mr (marathi.ts)
│   └── imports: zod schemas (schemas/index.ts)
│
├── ConsumerDashboard
│   ├── imports: useAppStore (currentUser, isOnline, setField, addNotification)
│   ├── imports: supabase (query helpers: getField, getActiveWaterSession, etc.)
│   ├── imports: mr (marathi.ts)
│   ├── imports: getGrowthStage (engines/crop/cropIntelligence.ts)
│   ├── imports: evaluatePestRisks (engines/pest/pestWarningEngine.ts)
│   ├── imports: calculateTotalSavings (engines/savings/savingsCalculator.ts)
│   └── calls: tts-proxy Edge Function (for Tai voice playback)
│
├── SupplierDashboard
│   ├── imports: useAppStore, supabase, mr
│   ├── imports: calculateSupplierEarnings (engines/commission/commissionLogic.ts)
│   ├── imports: subscribeToWaterSessions (supabase.ts — realtime)
│   └── calls: wati-send Edge Function (for supplier notifications)
│
└── AdminDashboard
    ├── imports: useAppStore, supabase, mr
    └── calls: validate-supplier-code, razorpay-webhook Edge Functions
```

---

## 4. DATA FLOW DIAGRAMS

### 4.1 Water Session Flow (Primary User Journey)

```
Consumer taps "पाणी सुरू केले" (START)
  → ConsumerDashboard.handleStartWater()
  → INSERT water_sessions { status: 'started', actual_start_time: now() }
  → Supabase Realtime → supplier receives INSERT notification
  → SupplierDashboard shows: "रामेश पाटील — पाणी सुरू 9:42 AM"
  → ConsumerDashboard shows: live elapsed timer (pulsing red STOP button)

Consumer taps "पाणी बंद केले" (STOP)
  → ConsumerDashboard.handleStopWater()
  → UPDATE water_sessions { status: 'completed', actual_stop_time: now(), duration_minutes }
  → Supabase Realtime → supplier receives UPDATE notification
  → ConsumerDashboard calls generate-advisory Edge Function

generate-advisory Edge Function (async):
  1. Read session + field + consumer from DB
  2. Call getGrowthStage(plantingDate) → growth stage info
  3. Call getFertilizerSchedule() → check if fertilizer due
  4. Call evaluatePestRisks(weather, stage, days, month, variety) → pest risks
  5. Call calculateTotalSavings() → check for savings events
  6. INSERT crop_advisories (advisory_marathi text)
  7. IF pest risk HIGH/CRITICAL → INSERT pest_alerts
  8. IF savings event → INSERT savings_log
  9. UPDATE water_sessions.advisory_generated = true
  10. Return advisory to client

Client receives advisory:
  1. ConsumerDashboard shows advisory card
  2. ConsumerDashboard plays Tai voice (calls tts-proxy Edge Function → Azure TTS)
  3. Savings counter updates if event triggered
  4. Pest alert badge appears if new alert
```

### 4.2 Payment Flow

```
Consumer subscribes (in app):
  1. Create Razorpay customer (phone number)
  2. Create Razorpay subscription (plan ID, billing cycle)
  3. Razorpay checkout opens → user enters UPI PIN
  4. Mandate registered (NOT = payment confirmed)
  5. INSERT subscriptions { status: 'pending_first_debit', razorpay_subscription_id }
  
24+ hours later (RBI pre-debit notice period):
  6. Razorpay debits UPI → payment.captured event
  7. Razorpay POSTs to razorpay-webhook Edge Function
  8. Edge Function verifies HMAC-SHA256 signature
  
IF HMAC VALID:
  9. Find subscription by razorpay_subscription_id
  10. UPDATE subscriptions { status: 'active', next_billing_at }
  11. Calculate commission: basic→2000, smart→4000, premium→6000 (paise)
  12. INSERT commission_wallet { amount, transaction_type: 'consumer_commission' }
  13. UPDATE users { subscription_status: 'active' }
  14. Enqueue job for supplier WhatsApp notification
  15. INSERT audit_log
  16. Return 200 OK
  
IF HMAC INVALID:
  17. Return 401 Unauthorized
```

### 4.3 Morning Message Flow

```
Supabase cron triggers morning-message Edge Function at 6:00 AM IST:

1. Query all active consumers (subscription_status = 'active' or 'trial')
2. For each consumer:
   a. Get their field (planting_date, sugarcane_variety)
   b. Call getGrowthStage(planting_date) → growth stage
   c. Call weather-fetch Edge Function (cached per taluka)
   d. Generate Marathi morning message:
      "नमस्कार {name} काका! तुमचा ऊस {dayNumber} दिवसांचा — {stageMarathi} टप्पा.
       आजचे हवामान: {temp}°C, आर्द्रता {humidity}%."
3. Batch send via wati-send Edge Function:
   a. Group messages into batches of 50
   b. Send batch → wait 1 second → next batch
   c. On failure: enqueue to job_queue for retry
4. Log completion to job_queue
```

---

## 5. ROUTE DESIGN (19 routes)

| Path | Component | Guard | Description |
|---|---|---|---|
| `/auth` | AuthScreen | None | 6-step auth flow |
| `/consumer/dashboard` | ConsumerDashboard | consumer only | Home screen |
| `/consumer/history` | WaterHistory | consumer only | Past water sessions |
| `/consumer/pani-dakhla` | PaniDakhla | consumer only | PDF water receipt |
| `/consumer/soil-card` | SoilCard | consumer only | 15-question wizard |
| `/consumer/pest-alerts` | PestAlerts | consumer only | Active pest risks |
| `/consumer/crop-calendar` | CropCalendar | consumer only | Monthly action plan |
| `/consumer/gov-schemes` | GovSchemes | consumer only | PM-KISAN, PMFBY, KCC |
| `/consumer/factory-rates` | FactoryRates | consumer only | FRP + opening dates |
| `/consumer/profile` | Profile | consumer only | Name, field, subscription |
| `/supplier/dashboard` | SupplierDashboard | supplier only | Earnings + farmer feed |
| `/supplier/farmers` | FarmerList | supplier only | All linked consumers |
| `/supplier/wallet` | CommissionWallet | supplier only | Earnings breakdown |
| `/supplier/referrals` | ReferralPanel | supplier only | Referral code + tracking |
| `/supplier/notifications` | Notifications | supplier only | Activity feed |
| `/admin/dashboard` | AdminDashboard | superadmin only | Platform metrics |
| `/admin/payouts` | PayoutApprovals | superadmin only | Approval queue |
| `/admin/rates` | MarketRates | superadmin only | FRP management |
| `*` | Navigate → /auth | Fallback | Redirect all unknown |

---

## 6. COMPONENT TREE

```
<BrowserRouter>
  <App>
    <ErrorBoundary>
      <Routes>
        <Route path="/auth">
          <AuthScreen>
            ├── PhoneEntry (phone input + country code + send OTP button)
            ├── OTPVerify (6-digit input + verify button + resend timer)
            ├── ConsentScreen (DPDP consent text + checkbox + continue)
            ├── RoleSelect (3 card buttons: Farmer/Supplier/Admin)
            ├── SupplierRegister (5 fields: name, village, taluka, adminCode, referralCode)
            └── ConsumerRegister (3 fields: name, village, taluka, supplierPhone)
          </AuthScreen>
        </Route>
        
        <Route path="/consumer/*">
          <ConsumerDashboard>
            ├── Header (greeting + notification badge + online dot)
            ├── GrowthStageCard (crop day + stage name + next irrigation)
            ├── WaterButtons (START green 56px / STOP red 56px + elapsed timer)
            ├── TaiVoiceButton ("ताईचा सल्ला ऐका" + audio player)
            ├── SavingsCounter (total saved + last event amount)
            ├── FertilizerCard (dosage, brands, weather gate warning)
            ├── PestAlertBanner (if active alerts)
            └── BottomNav (Home, Calendar, History, Schemes, Profile)
          </ConsumerDashboard>
        </Route>
        
        <Route path="/supplier/*">
          <SupplierDashboard>
            ├── Header (title + notification badge + online dot)
            ├── EarningsWidget (monthly + total + pending payout)
            ├── QuickStats (farmer count + active today)
            ├── WaterScheduleCTA ("पाणी वेळापत्रक द्या" button)
            ├── RealtimeFeed (live water session activity)
            ├── InactiveAlerts (farmers with 3+ days no log)
            ├── ReferralCTA ("रेफरल करा → ₹१,००० मिळवा")
            └── BottomNav (Dashboard, Farmers, Wallet, Referrals, Notifications)
          </SupplierDashboard>
        </Route>
        
        <Route path="/admin/*">
          <AdminDashboard>
            ├── Header (title)
            ├── MetricsCards (MRR, ARR, active users, trials)
            ├── TabNav (Payouts | Market Rates | Broadcast | Audit)
            ├── PayoutApprovalList (pending payouts + approve/reject buttons)
            ├── MarketRateForm (district selector + FRP input + date picker)
            ├── BroadcastComposer (textarea + target selector + send button)
            └── AuditLogViewer (actor, action, table, timestamp)
          </AdminDashboard>
        </Route>
      </Routes>
    </ErrorBoundary>
  </App>
</BrowserRouter>
```

---

## 7. ENGINE DEPENDENCY MAP (Pure functions only)

```
cropIntelligence.ts
  ├── exports: getGrowthStage, getFertilizerSchedule, getNextFertilizerAction
  ├── imports: WeatherData (from types/index.ts)
  └── consumed by: ConsumerDashboard, generate-advisory EF, morning-message EF

pestWarningEngine.ts
  ├── exports: evaluatePestRisks, getVarietyRiskMultiplier
  ├── imports: WeatherData, GrowthStage (from types/index.ts)
  ├── cross-linked: getAirflowDiseaseMultiplier (from rowGeometryEngine.ts)
  └── consumed by: PestAlerts, pest-check EF, generate-advisory EF

weedEngine.ts
  ├── exports: getWeedRecommendation
  ├── imports: WeatherData (from types/index.ts)
  ├── cross-linked: getWeedIntensityMultiplier (from rowGeometryEngine.ts)
  └── consumed by: WeedID component, CropCalendar

solidFertilizerEngine.ts
  ├── exports: (re-exports from cropIntelligence), getBrandRecommendations, getChemicalReductionPercent
  └── consumed by: FertilizerCard

liquidFertilizerEngine.ts
  ├── exports: getLiquidBoosterSuggestion
  ├── imports: SoilCardResult, FertilizerStage, WeatherData (from types/index.ts)
  └── consumed by: FertilizerCard

organicManureEngine.ts
  ├── exports: getPrimaryManureRecommendation
  └── consumed by: FertilizerCard, FieldSetup

liquidOrganicEngine.ts
  ├── exports: getLiquidOrganicTiers, getCombinedChemicalReduction
  └── consumed by: FertilizerCard

rowGeometryEngine.ts
  ├── exports: getMaintenanceTier, getWeedIntensityMultiplier, getAirflowDiseaseMultiplier, getIntercropSuggestion
  └── consumed by: FieldSetup, weedEngine, pestWarningEngine

commissionLogic.ts
  ├── exports: calculateSupplierEarnings
  └── consumed by: SupplierDashboard, razorpay-webhook EF

savingsCalculator.ts
  ├── exports: SAVINGS_EVENTS, calculateTotalSavings
  └── consumed by: ConsumerDashboard, generate-advisory EF

soilCardAnalysis.ts
  ├── exports: SOIL_QUESTIONS, analyzeSoilCard
  └── consumed by: SoilCard wizard
```

---

## 8. EXTERNAL SERVICE BOUNDARIES

| Service | Client Access | Proxy Through | Auth Method | Rate Limit |
|---|---|---|---|---|
| Supabase DB | Direct (anon key) | — | RLS + JWT | Supabase managed |
| Supabase Auth | Direct (anon key) | — | Phone OTP | Supabase managed |
| Supabase Realtime | Direct (anon key) | — | RLS + JWT | 200 concurrent (free) |
| Supabase Storage | Direct (anon key) | — | RLS + JWT | 10MB/file |
| Azure TTS | NEVER direct | tts-proxy EF | JWT + server-side key | 30 req/user/min |
| WATI WhatsApp | NEVER direct | wati-send EF | JWT + template allowlist | 5 req/user/min |
| Razorpay (client) | Direct (publishable key) | — | Razorpay SDK | Managed |
| Razorpay (server) | NEVER direct | razorpay-webhook EF | HMAC-SHA256 | 100 req/min |
| OpenWeatherMap | NEVER direct | weather-fetch EF | Server-side key | 1 req/taluka/hr |
| SMS/OTP | NEVER direct | send-otp EF | Server-side key | 5 req/phone/15min |
