# जलशेती प्रो — JalSheti Pro

> **Smart Irrigation Management for Maharashtra's Sugarcane Farmers**
>
> A production-grade B2B2C Progressive Web Application with AI-driven agronomic intelligence, Marathi-first voice UX, and automated financial operations.

---

## 🚀 Quick Links

| Resource | URL |
|----------|-----|
| **Live App** | [jalsheti-pro.vercel.app](https://jalsheti-pro.vercel.app) |
| **Documentation** | [jalsheti-pro.vercel.app/documentation](https://jalsheti-pro.vercel.app/documentation) |
| **Product Spec** | [MVP/PRODUCT.md](MVP/PRODUCT.md) |
| **Technical Spec** | [MVP/IMPLEMENTATION.md](MVP/IMPLEMENTATION.md) |

---

## 📊 Project Overview

JalSheti Pro transforms sugarcane irrigation management in Maharashtra by combining **AI-driven agronomic intelligence**, **real-time water control**, **Marathi-first voice UX**, and **automated financial operations** into a single offline-capable PWA.

### Key Metrics

| Metric | Value |
|--------|-------|
| **Build** | 165 modules, 660 KB, 19 precache entries |
| **Tests** | 103/103 passing (87 unit + 16 integration) |
| **TypeScript** | 0 errors (strict mode) |
| **Lint** | 0 errors, 0 warnings |
| **Database** | 22 tables, 37 indexes, 31 RLS policies |
| **Edge Functions** | 10 Deployed (all responding) |
| **AI Engines** | 11 Pure TypeScript engines |
| **Production** | Deployed via Vercel + Supabase (ap-south-1) |

---

## 🎯 What It Does

### For Farmers (Consumers)
- One-tap water START/STOP with live elapsed timer and 5-second undo
- Growth-stage based irrigation scheduling with weather gate (skip if rain forecast)
- 6-pest prediction engine with 7-10 day early warning
- **Tai** — Marathi neural voice assistant (mr-IN-AarohiNeural)
- Real-time savings counter with event attribution
- PWA — install on home screen, works offline

### For Suppliers (Water Distributors)
- Realtime water session feed for all linked farmers
- Commission wallet: 20% of subscription (₹20/40/60 per farmer/month)
- Milestone cashback: ₹150 → ₹200 → ₹250 → ₹400 (at 5/10/15/20 farmers)
- Inactive farmer alerts with schedule creation
- Referral codes with WhatsApp share

### For Administrators
- Platform metrics (MRR, ARR, active users, trials)
- Payout approval queue with audit logging
- District-wise market rate (FRP) management
- Broadcast messaging to farmers/suppliers

---

## 🏗 Architecture

```
Client (React 19 PWA) → Vercel Edge (CDN + CSP) → Supabase (ap-south-1)
                                                    ├── PostgreSQL (22 tables)
                                                    ├── Auth (Phone OTP)
                                                    ├── Realtime (WebSocket)
                                                    ├── Storage (2 buckets)
                                                    └── Edge Functions (10 Deno)
                                                         ├── generate-advisory
                                                         ├── pest-check
                                                         ├── razorpay-webhook
                                                         ├── tts-proxy
                                                         ├── wati-send
                                                         └── 5 more
```

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19 · TypeScript 6 · Vite 8 · Tailwind 4 · Zustand · React Router 7 |
| **Backend** | Supabase · PostgreSQL 15 · Edge Functions (Deno) |
| **AI** | 11 Pure TypeScript Engines (Crop · Pest · Savings · Commission · Soil · Fertilizer) |
| **Voice** | Azure Cognitive Services · Neural TTS (mr-IN-AarohiNeural) |
| **Payments** | Razorpay UPI · Subscription Mandate · Webhook (HMAC-SHA256) |
| **Notifications** | Supabase Realtime · WATI (WhatsApp) · FCM (Web Push) |
| **Security** | CSP · HSTS · RLS (31 policies) · Append-only money tables |
| **Testing** | Vitest (103 tests) · Playwright (7 E2E) · oxlint |
| **Deployment** | Vercel Edge · GitHub Actions CI/CD · Supabase ap-south-1 |

---

## 📂 Repository Structure

```
jalsheti-pro/
├── src/
│   ├── components/        # 9 shared UI components
│   ├── engines/           # 11 pure AI engines (all tested)
│   ├── screens/           # 5 lazy-loaded routes + landing page + docs
│   ├── services/          # 8 service modules (Supabase abstraction)
│   ├── lib/               # Supabase client + Auth helpers
│   ├── i18n/              # Marathi dictionary (1296 lines, 68 aliases)
│   └── store/             # Zustand + persist middleware
├── supabase/
│   ├── functions/         # 10 Edge Functions + _shared utilities
│   └── migrations/        # 5 SQL migration files
├── MVP/                   # Product & Implementation documentation
├── docs/                  # 16 engineering specification documents
├── e2e/                   # Playwright E2E tests
└── ...config files
```

---

## 🧪 Running Locally

```bash
npm install
npm run dev          # Start dev server (http://localhost:5173)
npm run test         # Run 103 tests
npm run typecheck    # TypeScript validation
npm run lint         # Lint check
npm run build        # Production build
```

---

## 📖 Documentation

- [**PRODUCT.md**](MVP/PRODUCT.md) — Vision, problem, solution, users, features, AI, business model, roadmap
- [**IMPLEMENTATION.md**](MVP/IMPLEMENTATION.md) — Architecture, database, Edge Functions, AI engines, security, performance, deployment
- [**Live Docs**](https://jalsheti-pro.vercel.app/documentation) — Interactive documentation with Mermaid diagrams

---

## 🏆 Production Readiness

| Check | Status |
|-------|--------|
| TypeScript Strict | ✅ 0 errors |
| Tests | ✅ 103/103 |
| Lint | ✅ 0 errors, 0 warnings |
| Build | ✅ 165 modules, 660 KB |
| Database | ✅ 22 tables, 37 indexes, 31 RLS |
| Edge Functions | ✅ 10/10 deployed |
| PWA | ✅ Service Worker activated |
| Security | ✅ CSP/HSTS/X-Frame/Rate Limit |
| CI/CD | ✅ GitHub Actions |

---

## 📄 License

MIT

---

*Built with ♥ for Maharashtra's 9.5 million sugarcane farmers.*
