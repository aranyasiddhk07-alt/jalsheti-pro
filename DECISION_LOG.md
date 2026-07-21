# JalSheti Pro — Decision Log

**Last updated:** July 13, 2026
**Status:** All open decisions resolved

---

## Pre-M1 Decisions (from pre-implementation review)

**[Pre-M1] Auth linkage** — `public.users.id` enforced equal to `auth.uid()` via database trigger on `auth.users` insert, not by client-side convention.

**[Pre-M1] Secrets handling** — No secret (Azure key, WATI token, supplier admin code, Razorpay webhook secret) ever `VITE_`-prefixed. All proxied through Edge Functions.

**[Pre-M1] Money tables** — `commission_wallet`, `subscriptions`, `savings_log` append-only / server-write-only. Never accept client-side writes.

**[Pre-M1] Supplier reassignment** — `supplier_assignment_history` table added, closing gap between business strategy and original schema.

**[Pre-M1] WATI templates** — Submitted as Utility category, not Marketing, for all advisory/notification content.

**[Pre-M1] Engine folders** — `src/engines/{fertilizer,pest,weed,geometry,crop,commission,savings}/` adopted before Phase 11.

**[Pre-M1] Milestone 0** — Foundation hardening inserted before original Phase 1.

---

## M0 Decisions

**[M0] Single field per consumer** — `fields` table gets `UNIQUE (consumer_id)` constraint. Multi-field support deferred; revisit after first real user cohort.

**[M0] Admin-panel language** — Marathi throughout. All screens including `/admin/*` use the `MR` dictionary.

**[M0] DLT + OTP** — DLT entity registration started in parallel with M0 coding. International/ILDO-route OTP provider (Twilio Verify) used as interim until DLT clears.

---

## Confirmed Decisions — July 13, 2026

**[D1] Pricing — Rs.99/month multi-tier with Tai voice in Basic**
Rationale: Tai voice is the strongest retention mechanism. Putting it behind a paywall at Rs.199 would increase churn risk for Basic-tier users. Premium AI features (photo diagnosis, yield estimation) will be added to higher tiers later.

Tiers:
- Basic (Rs.99/month): Water tracking + Marathi advisory + Tai voice + Pani Dakhla + Pest alerts
- Smart (Rs.199/month): All Basic + Advanced AI advisory + Crop calendar + Yield tips + Weather integration
- Premium (Rs.299/month): All Smart + Photo diagnosis + Insurance docs + Priority support

**[D2] Commission — 20% per tier (percentage-based)**
Rationale: Percentage-based commission aligns supplier incentive with premium plan upsell. A flat Rs.20 per consumer regardless of plan would remove supplier motivation to recommend higher-value plans.

Rates: Basic: Rs.20/mo (20%), Smart: Rs.40/mo (20%), Premium: Rs.60/mo (20%)

**[D3] Farmer referrals — Year 2**
Rationale: Supplier referrals are the primary acquisition channel for Year 1. Farmer-to-farmer referrals will be enabled in Year 2 after product-market fit is validated with the initial supplier-driven cohort. This creates a second independent growth loop.

**[D4] OTP — DLT registration + Twilio Verify in parallel**
Rationale: DLT registration is legally required for domestic SMS in India. Since it takes 1-3 weeks, Twilio Verify (international route) will be used as interim bypass for OTP specifically. Switch to domestic DLT-registered route once registration clears.

**[D5] Push notifications — Web Push for MVP, FCM later**
Rationale: Web Push avoids adding Firebase as a fifth external platform during MVP. FCM will be adopted when scale demands it (better delivery reliability, richer notification features). Reduces operational surface area for solo maintainer.

**[D6] Admin language — Marathi throughout**
Rationale: Consistent with the Marathi-first vision. Founder reads Marathi natively, so this adds no barrier. All screen labels, buttons, and admin-specific strings use the `MR` dictionary's `admin:` namespace.
