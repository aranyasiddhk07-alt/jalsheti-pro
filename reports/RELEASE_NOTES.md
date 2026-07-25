# JalSheti Pro — Release Notes v1.0.0

**Release Date:** July 25, 2026 | **Commit:** `ae835e5`

---

## Overview

JalSheti Pro v1.0.0 is the production release of the Marathi-first, AI-powered sugarcane irrigation management PWA for Maharashtra's 9.5 million sugarcane farmers.

---

## New Features

### Authentication
- 6-step Marathi OTP authentication (Phone → OTP → Consent → Age Gate → Role → Dashboard)
- DPDP Act compliance with consent timestamp
- Role-based route guards (Consumer, Supplier, Admin)

### Dashboards
- **Consumer Dashboard:** Water START/STOP with live timer, 5-second undo, Tai voice button, savings counter, fertilizer window, pest alerts
- **Supplier Dashboard:** Earnings cards, realtime water session feed, inactive farmer alerts, referral system
- **Admin Dashboard:** MRR/ARR metrics, payout approvals, market rate management, broadcast messaging, audit log

### AI Engines (11 engines, 103 tests)
- Crop Intelligence: 5 growth stages, 6-split fertilizer schedule
- Pest Warning: 6 pests × 15 rules × variety multipliers
- Savings Calculator: 8 event types with ₹ attribution
- Commission Engine: 20% commission, ₹1000 milestone cashback ladder
- Soil, Weed, Fertilizer, Geometry engines

### Edge Functions (11 Deno functions)
- `generate-advisory`: Post-session advisory + pest + savings
- `pest-check`: Daily cron for pest risk scanning
- `razorpay-webhook`: Payment capture → commission credit
- `weather-fetch`: OpenWeatherMap proxy
- `tts-proxy`: Azure TTS (mr-IN-AarohiNeural)
- Plus: morning-message, job-processor, reconcile-payments, validate-supplier-code, wati-send, send-sms-hook

### PWA & Offline
- Service Worker with 24 precache entries
- Offline queue with IndexedDB persistence
- Background sync on reconnect
- Installable PWA (standalone display)

### Landing Page & Documentation
- Professional landing page with hero, stats, features, tech stack, roadmap
- Documentation section with react-markdown and Mermaid diagrams
- PRODUCT.md and IMPLEMENTATION.md rendered in-app

### Security
- CSP, HSTS, X-Frame-Options, X-Content-Type-Options headers
- RLS on all 22 database tables (31 policies)
- Append-only money tables, zero client writes
- Zod validation, HMAC-SHA256 webhook verification

---

## Database

- 22 tables, 37 indexes, 31 RLS policies, 5 triggers
- 3 materialized views for dashboard performance
- pg_cron + pg_net extensions installed
- pest-check-daily cron job scheduled at 6 AM IST

---

## Deployment

- **Frontend:** Vercel (https://jalsheti-pro.vercel.app)
- **Backend:** Supabase (ap-south-1 / Mumbai)
- **CI/CD:** GitHub Actions (typecheck → test → build → audit)
- **Auth:** Phone OTP via Twilio

---

## Known Limitations

| # | Issue | Workaround |
|---|-------|------------|
| 1 | OpenWeatherMap key activation (2-24h) | Key already set, weather features will auto-activate |
| 2 | Azure TTS key placeholder | Set real key in Supabase Secrets for Tai voice |
| 3 | WATI key placeholder | Set real key in Supabase Secrets for WhatsApp |
| 4 | Twilio trial account | Upgrade before production scale |

---

## What's Next (v1.1)

- ML pest detection (TensorFlow.js on-device)
- Insurance claim flow (camera → PDF → submit)
- Government schemes catalog
- Factory rate comparison (district-wise FRP)
- Auto-payout when wallet ≥ ₹200
