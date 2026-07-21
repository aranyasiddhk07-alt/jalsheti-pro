# JalSheti Pro — Master Project Blueprint

**Version:** 1.0.0
**Date:** July 13, 2026
**Target Model:** GLM 5.2
**Purpose:** Complete implementation blueprint for generating the production codebase

---

## 1. PROJECT IDENTITY

**JalSheti Pro** (जलशेती प्रो) is a production-grade B2B2C Progressive Web Application for sugarcane irrigation management serving Maharashtra, India's sugarcane belt. The application spans 5 core districts: Kolhapur, Sangli, Satara, Pune, Ahmednagar.

**Tagline:** "ऊसासाठी स्मार्ट पाणी व्यवस्थापन" (Smart Water Management for Sugarcane)

**Business Model:**
```
Superadmin (platform owner)
    ↓
Supplier (FREE — earns commission) → recruits and manages
    ↓
Consumer/Farmer (PAYS ₹99/month subscription)
```

The supplier is NOT a paying customer. The supplier is a commission-earning distribution agent who recruits farmers. The farmer is the revenue source.

---

## 2. BUSINESS MODEL SPECIFICATION

### 2.1 Pricing Tiers

| Tier | Monthly Price | Razorpay Amount (paise) | Features |
|---|---|---|---|
| Basic | ₹99 | 9900 | Water tracking, Marathi advisory, Tai voice, Pani Dakhla, Pest alerts |
| Smart | ₹199 | 19900 | All Basic + Advanced AI advisory, Crop calendar, Yield tips, Weather integration |
| Premium | ₹299 | 29900 | All Smart + Photo diagnosis, Insurance docs, Priority support |

**Tai voice is included in Basic tier** — it is a retention mechanism, not an upsell.

### 2.2 Commission Rules (EXACT)

| Plan | Supplier Commission | Percentage |
|---|---|---|
| Basic | ₹20 per consumer per month | 20% |
| Smart | ₹40 per consumer per month | 20% |
| Premium | ₹60 per consumer per month | 20% |

Commission is credited ONLY on successful payment (razorpay-webhook Edge Function with HMAC verification). No credit on trials.

### 2.3 Milestone Cashback Ladder (EXACT)

Supplier receives cumulative cashback for reaching consumer milestones:

| Consumers Connected | Cumulative Cashback |
|---|---|
| 5 | ₹150 |
| 10 | ₹200 (additional) |
| 15 | ₹250 (additional) |
| 20 | ₹400 (additional) |
| **Total at 20** | **₹1,000** |

**Fraud gate:** Each tier releases only after the relevant consumers complete TWO CONSECUTIVE PAID MONTHS. This makes register-and-abandon fraud a net-negative trade.

### 2.4 Unit Economics (20-consumer supplier, 5-month season)

| Item | Calculation | Amount |
|---|---|---|
| Gross revenue | 20 × ₹99 × 5 | ₹9,900 |
| Commission out | 20 × ₹20 × 5 | −₹1,500 |
| Cashback out | Cumulative | −₹1,000 |
| **Platform net** | | **₹7,400** |
| **Supplier total** | | **₹2,500** |

### 2.5 Minimum Payout

Suppliers can request payout when wallet balance ≥ **₹200**.

---

## 3. USER ROLES

### 3.1 superadmin
- Single platform owner account
- Manages payout approvals (commission + referral cashback)
- Manages market rates (FRP rates, factory opening dates)
- Sends broadcast messages to all users or by district
- Views audit logs
- Accesses all data (RLS bypass via service_role in Edge Functions)

### 3.2 supplier
- Free account, earns commission
- Links consumers via phone number
- Sets water schedules for each consumer
- Receives realtime notifications when consumers start/stop water
- Views earnings dashboard (monthly, total, pending)
- Refers other suppliers for ₹1,000 milestone cashback
- Requests payouts when balance ≥ ₹200
- Dashboard shows: earnings widget, farmer count, active today, realtime activity feed, inactive alerts

### 3.3 consumer
- Paid subscription (₹99-299/month)
- 7-day free trial on registration
- Links to one supplier via phone number
- Single field per consumer (UNIQUE constraint on fields.consumer_id)
- Logs water sessions (START/STOP)
- Receives crop advisory after water session
- Hears Tai voice advisory (auto-play)
- Views savings counter (prominent on dashboard)
- Completes Soil Card (15-question wizard)
- Downloads Pani Dakhla PDF (GPS-tagged water receipt)
- Views pest alerts, crop calendar, government schemes
- Manages subscription (Razorpay UPI Autopay mandate)

---

## 4. TECHNOLOGY STACK

### 4.1 EXACT Versions

```
Frontend:    React 18 + TypeScript (strict) + Vite 8
Styling:     Tailwind CSS v4 + shadcn/ui
State:       Zustand v5
Validation:  Zod v3
Routing:     react-router-dom v7
Forms:       react-hook-form v7
Backend:     Supabase (PostgreSQL 15 + Auth + Realtime + Storage)
Voice:       Azure Cognitive Services TTS (mr-IN-AarohiNeural)
Payments:    Razorpay UPI Autopay (e-Mandate)
WhatsApp:    WATI WhatsApp Business API
Weather:     OpenWeatherMap API (free tier)
PDF:         jsPDF v4 + html2canvas v1
PWA:         VitePWA v1 + Workbox
Deploy:      Vercel (frontend) + Supabase (backend)
CI/CD:       GitHub Actions
IaC:         vercel.json + supabase/config.toml
```

### 4.2 npm Dependencies (EXACT)

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2",
    "@tailwindcss/vite": "^4",
    "@hookform/resolvers": "^5",
    "clsx": "^2",
    "jspdf": "^4",
    "html2canvas": "^1",
    "react": "^18",
    "react-dom": "^18",
    "react-hook-form": "^7",
    "react-router-dom": "^7",
    "tailwind-merge": "^3",
    "tailwindcss": "^4",
    "zod": "^3",
    "zustand": "^5"
  },
  "devDependencies": {
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@types/node": "^24",
    "@vitejs/plugin-react": "^6",
    "typescript": "~5.5",
    "vite": "^8",
    "vite-plugin-pwa": "^1"
  }
}
```

### 4.3 Supabase Project Configuration

```
Region:  ap-south-1 (Mumbai) — MANDATORY
Plan:    Free → Pro (≥200 concurrent realtime connections)
Auth:    Phone OTP (SMS) with 6-digit code, 5-minute expiry
Realtime: water_sessions, notifications, pest_alerts tables
Storage: insurance-photos bucket, crop-diagnosis bucket (10MB limit, JPEG/PNG/WebP)
```

---

## 5. CODING PHILOSOPHY

### 5.1 Production-Grade Mandate
- NO placeholders, TODOs, mock data, or pseudocode
- Every function must be complete and correct
- Every business rule from this document must be implemented exactly
- Every Marathi string must come from the MR dictionary

### 5.2 Tai Persona
The voice/UI persona is "Tai" (elder sister). Rules:
- Validates before suggesting ("You already know this, but...")
- Never commands — suggests
- Uses warm, informal Kolhapur-dialect Marathi
- Addresses farmer as "काका" (uncle)
- Uses "तुम्ही" (formal "you")

### 5.3 Design Tokens
```
Button minimum height: 56px (farm-worker-friendly touch targets)
Body font size: 16px (outdoor readability)
Heading font size: 22px
CTA font size: 18px
Font family: 'Noto Sans Devanagari', sans-serif
Number font: 'Roboto', sans-serif
Line height: 1.6 minimum for Marathi text (Devanagari matras/ligatures need room)
```

### 5.4 Accessibility
- Color contrast: WCAG AA minimum (4.5:1 normal, 3:1 large)
- Touch target spacing: 24px minimum between interactive elements
- `prefers-reduced-motion` support — disable all animations when set
- `aria-label` on all interactive Marathi elements (in Marathi AND English)

---

## 6. DESIGN PRINCIPLES

### 6.1 Separation of Concerns
- **Engine files:** Pure functions only. No DB access. No side effects. Deterministic outputs for given inputs. Located in `src/engines/`.
- **Service files:** Orchestration logic calling engines and Supabase. Located in `src/services/`.
- **Screen files:** React components. UI only. Call services for data. Located in `src/screens/`.

### 6.2 Single Responsibility
Each file has ONE reason to change:
- `cropIntelligence.ts` — growth stages + fertilizer scheduling (NOT pest, NOT savings)
- `pestWarningEngine.ts` — disease risk evaluation (NOT fertilizer, NOT weed)
- `commissionLogic.ts` — earnings calculations (NOT payment processing)

### 6.3 Loose Coupling
- Engines import ONLY types from `src/types/index.ts`
- Engines NEVER import Supabase client
- Screens import services, NOT engines directly
- Edge Functions are independent Deno modules

### 6.4 RLS as Primary Access Control
- ALL tables have RLS enabled
- Money tables (commission_wallet, subscriptions, savings_log) have NO client INSERT/UPDATE/DELETE policies — writes ONLY via Edge Functions with service_role key
- This is a DELIBERATE architecture decision, not an assumption

---

## 7. NAMING CONVENTIONS

| Element | Convention | Example |
|---|---|---|
| React components | PascalCase | `ConsumerDashboard` |
| TypeScript types/interfaces | PascalCase | `WaterSession`, `PestRisk` |
| Enums | PascalCase | `UserRole`, `RiskLevel` |
| Functions | camelCase | `getGrowthStage`, `evaluatePestRisks` |
| Variables | camelCase | `currentUser`, `fieldAreaAcres` |
| Constants | UPPER_SNAKE | `COMMISSION_RULES`, `SAVINGS_EVENTS` |
| Files (components) | PascalCase.tsx | `ConsumerDashboard.tsx` |
| Files (utilities) | camelCase.ts | `cropIntelligence.ts` |
| Files (SQL) | NNN_description.sql | `001_initial_schema.sql` |
| Database tables | snake_case | `water_sessions` |
| Database columns | snake_case | `linked_supplier_id` |
| Environment variables | VITE_ prefix (public only) | `VITE_SUPABASE_URL` |
| Secrets | Server-side only, no prefix rules | `SUPPLIER_ADMIN_CODE` |

---

## 8. ERROR HANDLING PHILOSOPHY

1. **Never silent failure** — every error is caught and communicated
2. **Marathi error messages** — all user-facing errors in Marathi
3. **Graceful degradation** — TTS down → show text-only advisory. WATI down → queue messages, show in-app notification. Weather API down → show cached data with banner.
4. **Circuit breakers** — after 5 consecutive failures to external service in 1 minute, fail fast for 30 seconds
5. **Retry with backoff** — 1s → 4s → 16s for transient failures
6. **Offline-first** — water sessions queued in IndexedDB when offline, synced on reconnect
7. **Error Boundary** — React ErrorBoundary component wraps all routes, catches unhandled errors

---

## 9. SECURITY PHILOSOPHY

1. **Zero VITE_ secrets** — never prefix any secret with VITE_ (bundled into public JS)
2. **All external API calls proxied** — Azure, WATI, supplier code validation all through Edge Functions
3. **HMAC webhook verification** — razorpay-webhook verifies Razorpay signature before processing
4. **RLS on all 22 tables** — data access at the database row level
5. **Money tables append-only** — commission_wallet, subscriptions, savings_log: no client writes
6. **Audit logging** — admin actions logged to `audit_log` table
7. **OTP security** — 6-digit code, 5-minute expiry, 5-attempt lockout with 15-minute cooldown

---

## 10. PERFORMANCE PHILOSOPHY

1. **Measure before optimizing** — run EXPLAIN ANALYZE on hot queries
2. **Lazy loading** — split bundles by role (auth/consumer/supplier/admin)
3. **Materialized views** — pre-compute dashboard aggregations for suppliers with many consumers
4. **Per-taluka weather caching** — 1-hour TTL via weather-fetch Edge Function, one fetch per taluka serves all consumers in that taluka
5. **Batched WATI sends** — morning-message sends in batches of 50 with 1-second delay
6. **Notification TTL** — auto-delete notifications older than 90 days
7. **FCP target** — < 1.5 seconds on 4G throttling

---

## 11. SCALABILITY PHILOSOPHY

1. **Partition water_sessions by month** — largest table, millions of rows expected
2. **PgBouncer** — connection pooling for Edge Function DB connections
3. **Materialized views** — for supplier dashboard at scale (>200 consumers per supplier)
4. **Supabase plan triggers** — Free → Pro at 200 concurrent realtime connections, Pro → Team for read replicas
5. **Cost tracking** — COGS per consumer = (Supabase + Azure + WATI + Vercel cost) / active_consumers
6. **Design for 300,000 consumers** — schema, indexes, and architecture must support full SAM

---

## 12. KEY BUSINESS RULES (NON-NEGOTIABLE)

1. Supplier pays NOTHING — subscription_status = 'free'
2. Consumer gets 7-day free trial on registration
3. Commission credited ONLY after payment.captured webhook (NOT on mandate registration)
4. UPI mandate ≠ payment confirmed (RBI requires 24-hour pre-debit notification)
5. Milestone cashback requires 2 consecutive paid months per qualifying consumer
6. Minimum payout request: ₹200
7. Single field per consumer (UNIQUE constraint on fields.consumer_id)
8. All WATI templates submitted under UTILITY category (not Marketing)
9. DLT registration required before sending SMS in India
10. Scientific disclaimer on all advisory outputs: "हा सल्ला माहितीसाठी आहे. स्थानिक कृषी तज्ज्ञांचा सल्ला घ्या."
