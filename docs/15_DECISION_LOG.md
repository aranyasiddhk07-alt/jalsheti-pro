# JalSheti Pro — Decision Log

| # | Date | Decision | Rationale | Status |
|---|---|---|---|---|
| Pre-M1 | 2026 | Auth linkage: public.users.id = auth.uid() via DB trigger | Database-enforced invariant, prevents RLS mismatch | ✅ Implemented |
| Pre-M1 | 2026 | All secrets server-side via Edge Functions | VITE_ prefix inlines into public JS bundle | ✅ Implemented |
| Pre-M1 | 2026 | Money tables append-only, Edge Function writes only | Immutable financial audit trail | ✅ Implemented |
| Pre-M1 | 2026 | supplier_assignment_history table for reassignment | De-risk supplier dependency, track changes | ✅ Implemented |
| Pre-M1 | 2026 | WATI templates as Utility category | ~80-90% cheaper than Marketing, faster approval | ✅ Implemented |
| Pre-M1 | 2026 | Engine folder structure: src/engines/{domain}/ | Separation of concerns, testability | ✅ Implemented |
| Pre-M1 | 2026 | Milestone 0 hardening before feature phases | Security and stability foundation first | ✅ Implemented |
| M0 | 2026 | Single field per consumer: UNIQUE(consumer_id) | MVP targets single-plot farmers | ✅ Implemented |
| M0 | 2026 | Admin language: Marathi throughout | 100% of admin users are Marathi speakers | ✅ Implemented |
| M0 | 2026 | DLT reg + Twilio Verify parallel track | 1-3 week DLT lead time blocks SMS onboarding | ⏳ DLT pending |
| D1 | Jul 13 | ₹99/month multi-tier. Tai voice in Basic tier | Tai is retention mechanism, not upsell | ✅ Implemented |
| D2 | Jul 13 | 20% commission per tier (₹20/40/60) | Aligns supplier incentive with premium plan upsell | ✅ Implemented |
| D3 | Jul 13 | Farmer referrals deferred to Year 2 | Supplier channel primary for Year 1 growth | 📅 Year 2 |
| D4 | Jul 13 | Twilio Verify OTP while DLT processes | Can't block launch on DLT approval | ✅ Implemented |
| D5 | Jul 13 | Web Push for MVP, FCM at scale (>5000 DAU) | Fewer vendor dependencies for solo maintainer | ✅ Implemented |
| D6 | Jul 13 | Marathi admin throughout | Consistent with Marathi-first vision | ✅ Implemented |
