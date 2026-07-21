# JalSheti Pro — Implementation Order for GLM 5.2

**Version:** 1.0.0 | **Target:** GLM 5.2

This document defines the EXACT order in which GLM 5.2 must generate files. Each phase has a clear goal, file list, completion criteria, and validation checklist. Files MUST be generated in this exact order.

---

## PHASE 1: PROJECT SCAFFOLD

**Goal:** Create the Vite + React + TypeScript project with all dependencies.

### Files to Create (6 files)

| # | File | Purpose |
|---|---|---|
| 1 | `package.json` | All dependencies (see MASTER_PROJECT_BLUEPRINT §4.2) |
| 2 | `tsconfig.json` | Project references to tsconfig.app.json and tsconfig.node.json |
| 3 | `tsconfig.app.json` | strict:true, module:esnext, moduleResolution:bundler, jsx:react-jsx, noEmit:true |
| 4 | `tsconfig.node.json` | For vite.config.ts |
| 5 | `vite.config.ts` | React + Tailwind v4 + VitePWA plugins, path alias @/ → src/, Workbox caching |
| 6 | `index.html` | Vite entry with `<link>` to Google Fonts (Noto Sans Devanagari, Roboto) |

### Completion Criteria
- `npm install` succeeds with 0 errors
- `npm run dev` starts Vite dev server
- `localhost:5173` shows default Vite page

---

## PHASE 2: TYPES & CONFIGURATION

**Goal:** Define all TypeScript types and project configuration.

### Files to Create (5 files)

| # | File | Lines | Purpose |
|---|---|---|---|
| 7 | `.env.local.example` | 5 | VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_RAZORPAY_KEY_ID, VITE_OPENWEATHER_KEY, VITE_FCM_VAPID_KEY |
| 8 | `.gitignore` | 30 | node_modules, dist, .env.local, .env.*.local |
| 9 | `src/types/index.ts` | 348 | ALL interfaces (26), enums (18), constants (SUBSCRIPTION_PLANS, COMMISSION_RULES) |
| 10 | `src/types/database.ts` | 31 | Supabase Database type with 22 table definitions |
| 11 | `src/index.css` | 45 | Tailwind v4 imports, custom theme tokens, skeleton animation, reduced-motion |

### Completion Criteria
- `npx tsc --noEmit` compiles types without errors
- All interfaces from DATABASE_MASTER_SPEC are covered

---

## PHASE 3: CORE LIBRARIES

**Goal:** Create Supabase client, auth helpers, and Marathi dictionary.

### Files to Create (3 files)

| # | File | Lines | Purpose |
|---|---|---|---|
| 12 | `src/lib/supabase.ts` | 165 | createClient, 15 query helpers, 2 realtime subscriptions |
| 13 | `src/lib/auth.ts` | 110 | sendOTP, verifyOTP, updateUserProfile, registerConsumer, registerSupplier, signOut, getSession |
| 14 | `src/i18n/marathi.ts` | 1400 | Complete MR dictionary with 50+ namespaces, flat aliases, mr export |

### Completion Criteria
- `npx tsc --noEmit` passes
- MR dictionary has no TODOs or placeholder strings

---

## PHASE 4: STATE, VALIDATION, HOOKS

**Goal:** Create Zustand store, Zod schemas, and route guard.

### Files to Create (3 files)

| # | File | Lines | Purpose |
|---|---|---|---|
| 15 | `src/store/useAppStore.ts` | 100 | Zustand store: currentUser, currentField, water session tracking, notifications, offline queue, 15 actions |
| 16 | `src/schemas/index.ts` | 52 | Zod: phone, otp, supplierRegister, consumerRegister, fieldSetup, waterSchedule |
| 17 | `src/hooks/index.ts` | 21 | useRouteGuard(allowedRoles[]) |

### Completion Criteria
- All Zod schemas use v3 API (z.object({field: z.string()}))
- Zustand store has no side effects in reducers

---

## PHASE 5: ENGINES — CORE AGRONOMY

**Goal:** Create the 4 core agronomy engine modules with pure functions.

### Files to Create (4 files)

| # | File | Lines | Purpose | Key Functions |
|---|---|---|---|---|
| 18 | `src/engines/crop/cropIntelligence.ts` | 225 | Growth stages, fertilizer schedule, weather gates | getGrowthStage, getFertilizerSchedule, getNextFertilizerAction |
| 19 | `src/engines/crop/soilCardAnalysis.ts` | 311 | 15-question Marathi quiz, scoring algorithm | SOIL_QUESTIONS, analyzeSoilCard |
| 20 | `src/engines/pest/pestWarningEngine.ts` | 160 | 6 diseases with weather+variant triggers | evaluatePestRisks, getVarietyRiskMultiplier |
| 21 | `src/engines/savings/savingsCalculator.ts` | 75 | 8 savings event types, total calculation | SAVINGS_EVENTS, calculateTotalSavings |

### Completion Criteria
- All functions are pure: no DB access, no side effects, deterministic
- All imports come ONLY from `../../types` (no Supabase, no React)
- Each function documented with TypeScript return types

---

## PHASE 6: ENGINES — FERTILIZER & WEED

**Goal:** Create fertilizer (4 modules), weed, and geometry engines.

### Files to Create (6 files)

| # | File | Lines | Key Functions |
|---|---|---|---|
| 22 | `src/engines/fertilizer/solidFertilizerEngine.ts` | 45 | re-exports, getBrandRecommendations, getChemicalReductionPercent |
| 23 | `src/engines/fertilizer/liquidFertilizerEngine.ts` | 57 | getLiquidBoosterSuggestion (N deficiency + between solids + no rain) |
| 24 | `src/engines/fertilizer/organicManureEngine.ts` | 68 | getPrimaryManureRecommendation (resource matching: cattle→FYM, factory→press mud) |
| 25 | `src/engines/fertilizer/liquidOrganicEngine.ts` | 104 | getLiquidOrganicTiers (6 tiers), getCombinedChemicalReduction (capped 35%) |
| 26 | `src/engines/weed/weedEngine.ts` | 66 | getWeedRecommendation (5 types → 4 products, weather gate) |
| 27 | `src/engines/geometry/rowGeometryEngine.ts` | 69 | getMaintenanceTier, weedIntensity, airflowMultiplier, intercrop |

### Completion Criteria
- `npx tsc --noEmit` passes for all engine files
- No circular dependencies between engines
- Organic reduction cap at 35% verified in code

---

## PHASE 7: ENGINES — BUSINESS LOGIC

**Goal:** Create commission and savings engines with EXACT math.

### Files to Create (1 file)

| # | File | Lines | Key Functions |
|---|---|---|---|
| 28 | `src/engines/commission/commissionLogic.ts` | 83 | calculateSupplierEarnings (plan breakdown, milestone ladder) |

### Commission Math (EXACT — Must Be Verified by Tests)
```
Basic:    20/month × activeMonths × consumerCount
Smart:    40/month × activeMonths × consumerCount
Premium:  60/month × activeMonths × consumerCount
Cashback: 5→150, 10→200, 15→250, 20→400 (cumulative ₹1000)
Min Payout: ₹200
Paid Gate: 2 consecutive months per consumer for cashback release
```

### Completion Criteria
- Commission formula matches exactly
- Milestone ladder uses cumulative calculation (not per-tier)

---

## PHASE 8: DATABASE MIGRATIONS

**Goal:** Create all 4 SQL migration files with complete schema, triggers, indexes, and RLS.

### Files to Create (4 files)

| # | File | Purpose |
|---|---|---|
| 29 | `supabase/migrations/001_initial_schema.sql` | 22 CREATE TABLE, CHECK constraints, FK with CASCADE/SET NULL, RLS enable, Realtime publication |
| 30 | `supabase/migrations/002_auth_trigger.sql` | handle_new_user trigger, generate_referral_code, reassign_supplier function |
| 31 | `supabase/migrations/003_indexes.sql` | 30+ CREATE INDEX for all hot query paths |
| 32 | `supabase/migrations/004_rls_policies.sql` | 31 CREATE POLICY statements, 2 storage bucket policies |

### Completion Criteria
- `npx supabase db reset` succeeds (if Supabase CLI available)
- All 22 tables have RLS enabled
- Money tables have NO client INSERT/UPDATE/DELETE policies

---

## PHASE 9: EDGE FUNCTIONS

**Goal:** Create all 10 Edge Functions + shared CORS module.

### Files to Create (11 files)

| # | File | Type | Auth | Rate Limit |
|---|---|---|---|---|
| 33 | `supabase/functions/_shared/cors.ts` | Shared | — | — |
| 34 | `supabase/functions/validate-supplier-code/index.ts` | Security Proxy | None | 10/IP/min |
| 35 | `supabase/functions/tts-proxy/index.ts` | Security Proxy | JWT | 30/user/min |
| 36 | `supabase/functions/wati-send/index.ts` | Security Proxy | JWT + allowlist | 5/user/min |
| 37 | `supabase/functions/razorpay-webhook/index.ts` | Business | HMAC | 100/min |
| 38 | `supabase/functions/weather-fetch/index.ts` | Business | None | 1/taluka/hr |
| 39 | `supabase/functions/generate-advisory/index.ts` | Business | service_role | — |
| 40 | `supabase/functions/morning-message/index.ts` | Cron | service_role | Batched 50/s |
| 41 | `supabase/functions/pest-check/index.ts` | Cron | service_role | — |
| 42 | `supabase/functions/job-processor/index.ts` | Cron | service_role | — |
| 43 | `supabase/functions/reconcile-payments/index.ts` | Cron | service_role | — |

### Completion Criteria
- Every Edge Function has Deno imports from `https://deno.land/std@0.177.0/http/server.ts`
- Security proxy functions verify JWT before calling external APIs
- Cron functions use service_role key for DB access

---

## PHASE 10: REACT SCREENS

**Goal:** Create App shell, ErrorBoundary, Auth, and all 3 dashboard screens.

### Files to Create (6 files)

| # | File | Lines | Purpose |
|---|---|---|---|
| 44 | `src/main.tsx` | 12 | React 18 createRoot with BrowserRouter |
| 45 | `src/App.tsx` | 69 | Router (19 routes), ErrorBoundary, online/offline listener |
| 46 | `src/screens/Shared/ErrorBoundary.tsx` | 50 | Class component for React error catching |
| 47 | `src/screens/Auth/AuthScreen.tsx` | 360 | 6-step auth flow state machine |
| 48 | `src/screens/Consumer/ConsumerDashboard.tsx` | 372 | Water log, Tai voice, savings, pest, fertilizer |
| 49 | `src/screens/Supplier/SupplierDashboard.tsx` | 281 | Earnings, farmer list, realtime, referral |
| 50 | `src/screens/Admin/AdminDashboard.tsx` | 309 | Payouts, rates, broadcast, audit |

### Completion Criteria
- All screens import `{ mr } from '../../i18n/marathi'` (NOT `{ MR as mr }`)
- All user-facing text via MR dictionary
- Buttons minimum 56px height
- Noto Sans Devanagari font applied

---

## PHASE 11: DEPLOYMENT & CI/CD

**Goal:** Create deployment configuration and CI pipeline.

### Files to Create (2 files)

| # | File | Purpose |
|---|---|---|
| 51 | `vercel.json` | CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, SPA rewrites |
| 52 | `.github/workflows/ci.yml` | lint → typecheck → build → audit |

---

## PHASE 12: FINAL VERIFICATION

**Goal:** Verify the complete build compiles and all 52 files are correct.

### Commands to Run
```bash
npm install
npm run typecheck    # tsc -b --noEmit → 0 errors
npm run build        # tsc -b && vite build → 0 errors
```

### Final File Count: 52 source files
### Build Output: ~147 modules, ~336KB JS, ~20KB CSS

---

## TOKEN ESTIMATE PER PHASE

| Phase | Files | Estimated Tokens |
|---|---|---|
| 1: Scaffold | 6 | 2,000 |
| 2: Types | 5 | 6,000 |
| 3: Core Libs | 3 | 20,000 |
| 4: State/Validation | 3 | 4,000 |
| 5: Core Engines | 4 | 12,000 |
| 6: Extended Engines | 6 | 10,000 |
| 7: Business Engines | 1 | 3,000 |
| 8: Migrations | 4 | 18,000 |
| 9: Edge Functions | 11 | 25,000 |
| 10: Screens | 6 | 30,000 |
| 11: Deploy/CI | 2 | 3,000 |
| 12: Verify | 0 | 1,000 |
| **Total** | **52** | **~134,000** |
