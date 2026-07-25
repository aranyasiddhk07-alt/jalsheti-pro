# JalSheti Pro — Launch Checklist

**Version:** v1.0.0 | **Date:** July 25, 2026

---

## ✅ Code & Build

- [x] TypeScript 0 errors (strict mode)
- [x] Lint 0 warnings, 0 errors
- [x] 103/103 tests passing
- [x] Production build: 848 KB, 24 precache entries
- [x] Dependencies audited (`npm audit`)
- [x] No secrets in source code
- [x] All `any` types removed from production code

## ✅ Infrastructure

- [x] Supabase project created (ap-south-1/Mumbai)
- [x] 5 database migrations applied
- [x] 22 tables, 37 indexes, 31 RLS policies
- [x] 3 materialized views created
- [x] 2 storage buckets created (insurance-photos, crop-diagnosis)
- [x] pg_cron extension enabled (1.6.4)
- [x] pg_net extension enabled (0.20.4)
- [x] pest-check-daily cron job scheduled (6 AM daily)

## ✅ Authentication

- [x] Phone OTP enabled (Twilio)
- [x] OTP send verified (SMS to +918669078869)
- [x] OTP verify screen loads on production
- [x] Age gate checkbox implemented
- [x] DPDP consent with timestamp
- [x] Admin self-registration blocked
- [x] Route guards active

## ✅ Edge Functions

- [x] generate-advisory deployed
- [x] pest-check deployed
- [x] razorpay-webhook deployed
- [x] weather-fetch deployed
- [x] morning-message deployed
- [x] job-processor deployed
- [x] reconcile-payments deployed
- [x] tts-proxy deployed
- [x] validate-supplier-code deployed
- [x] wati-send deployed
- [x] send-sms-hook deployed
- [x] 9/11 Edge Function secrets configured

## ✅ Deployment

- [x] GitHub repository synced (aranyasiddhk07-alt/jalsheti-pro)
- [x] Vercel project linked, auto-deploy on push
- [x] 5/5 Vercel environment variables set
- [x] Production URL live (https://jalsheti-pro.vercel.app)
- [x] CI/CD pipeline configured (GitHub Actions)

## ✅ Frontend

- [x] Landing page renders at /
- [x] Auth screen loads at /auth
- [x] Documentation renders at /documentation
- [x] PRODUCT.md rendered at /documentation/product
- [x] IMPLEMENTATION.md rendered at /documentation/implementation
- [x] Route guards working (consumer, supplier, admin)
- [x] Marathi UI (all labels, buttons, placeholders)
- [x] PWA manifest (Marathi name, icons 192/512px)
- [x] Service Worker activated (24 precache entries)

## ✅ Security

- [x] CSP header includes fonts.googleapis.com
- [x] HSTS max-age=31536000; includeSubDomains; preload
- [x] X-Frame-Options: DENY
- [x] X-Content-Type-Options: nosniff
- [x] Referrer-Policy: strict-origin-when-cross-origin
- [x] RLS verified (money tables blocked for anon writes)
- [x] Zero console errors on production
- [x] No VITE_ prefixed secrets

## ⏳ Post-Launch

- [ ] Set real Azure TTS key (for Tai voice)
- [ ] Set real WATI key (for WhatsApp notifications)
- [ ] Verify OpenWeatherMap key activation
- [ ] Load test with 1000 concurrent users
- [ ] Lighthouse audit (FCP < 1.5s, TTI < 3.5s)
- [ ] Farmer UAT with 5 Marathi-speaking users
- [ ] Enable pg_cron net.http_post verification
- [ ] Monitor Edge Function error rates (week 1)
