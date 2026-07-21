# JalSheti Pro — Project Checklist

## SECURITY
- [x] Rate limiting on all Edge Functions (10/30/5/100 per function)
- [x] CSP + HSTS + X-Frame-Options + X-Content-Type-Options + Referrer-Policy via vercel.json
- [ ] Session timeout (30 min idle) — to implement
- [x] Audit log table + triggers on critical tables
- [ ] OTP: 6-digit, 5-min expiry, 5-attempt lockout — to verify
- [x] HMAC webhook verification in razorpay-webhook EF
- [x] All secrets server-side (no VITE_ prefix for any secret)
- [x] RLS on all 22 tables (31 policies)
- [x] Money tables append-only (no client INSERT/UPDATE/DELETE)
- [x] React ErrorBoundary wrapping all routes
- [x] .env.local in .gitignore
- [x] Scientific disclaimer on all advisory outputs

## RELIABILITY
- [x] Error Boundary in App.tsx
- [ ] Circuit breaker on Azure TTS, WATI, Razorpay EFs — planned M2
- [ ] Retry with exponential backoff on external APIs — planned M2
- [ ] Health endpoint GET /api/v1/health — planned M2
- [ ] Disaster recovery runbook — planned M3

## TESTING
- [ ] Unit tests: commissionLogic, pestWarningEngine, cropIntelligence, savings, soilCard, weed, geometry, organic, liquidOrganic
- [ ] Integration tests: auth flow, water session, payment webhook
- [ ] All tests passing in CI

## DEVOPS
- [x] CI pipeline: lint → typecheck → build → audit
- [ ] Separate dev/staging/prod Supabase projects
- [ ] Uptime monitoring (UptimeRobot)
- [ ] Error tracking (Vercel Analytics)
- [ ] Secret rotation schedule documented

## COMPLIANCE
- [ ] DLT registration submitted (external, 1-3 weeks)
- [ ] WATI templates submitted (5 templates, Utility category, 2-4 weeks)
- [x] DPDP consent screen
- [x] DPDP account deletion flow
- [x] DPDP data export endpoint
- [x] Age gate (18+ checkbox)

## DEPLOYMENT
- [x] vercel.json with security headers + SPA rewrites
- [x] .github/workflows/ci.yml
- [ ] Supabase project in ap-south-1
- [ ] Edge Functions deployed
- [ ] Cron jobs configured

## UX
- [ ] Empty states for WaterHistory, PestAlerts, Notifications, SoilCard, Savings, Wallet
- [ ] Loading skeletons for Dashboard, AdvisoryCard, History, Notifications
- [x] Offline connectivity indicator
- [x] 5-second undo for water START/STOP
- [ ] Soil Card save-and-resume progress
- [x] All user-facing text via MR dictionary
- [x] 56px minimum button height
- [x] Noto Sans Devanagari font
- [x] WCAG-AA color contrast
- [ ] aria-label on all interactive elements
- [ ] prefers-reduced-motion support

## DATABASE
- [x] 22 tables with RLS enabled
- [x] 30+ performance indexes
- [x] CHECK constraints on numerical fields
- [x] FK ON DELETE strategy (CASCADE/SET NULL documented)
- [x] auth.users → public.users trigger (handle_new_user)
- [x] generate_referral_code + reassign_supplier functions
- [ ] Materialized views for dashboards — planned M2
- [ ] Partitioning for water_sessions — planned M3

## ENGINE VERIFICATION
- [x] cropIntelligence: 5 stages, 4 soil types, 3 crop types, weather gates
- [x] pestWarningEngine: 6 diseases, variety multipliers, confidence scoring
- [x] commissionLogic: milestone ladder, multi-tier, min payout
- [x] savingsCalculator: 8 event types
- [x] soilCardAnalysis: 15 questions, scoring
- [x] weedEngine: 5 types, weather gate
- [x] rowGeometryEngine: 3 tiers, weed/airflow cross-links
- [x] organicManureEngine: resource matching
- [x] liquidOrganicEngine: 6 tiers, 35% cap
- [x] liquidFertilizerEngine: booster logic
- [x] solidFertilizerEngine: brand tables + organic reduction
