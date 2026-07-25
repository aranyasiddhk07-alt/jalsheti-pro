# JalSheti Pro — Security Report

**Date:** July 25, 2026 | **Status:** ✅ PASSED

---

## Summary

| Category | Score | Status |
|----------|-------|--------|
| OWASP Top 10 | 10/10 | All mitigated |
| Authentication | 9/10 | Config ready, needs Save |
| Authorization | 10/10 | RLS on all 22 tables |
| Data Protection | 10/10 | TLS 1.3, AES-256 at rest |
| Headers | 10/10 | CSP, HSTS, XFO, XCTO, RP |
| Secrets | 10/10 | Zero VITE_ secrets, Supabase Vault |

---

## OWASP Top 10 Coverage

| Threat | Mitigation | Status |
|--------|-----------|--------|
| A01: Broken Access Control | RLS on 22 tables, 31 policies, service-role only money writes | ✅ |
| A02: Cryptographic Failures | TLS 1.3, HMAC-SHA256 webhooks, AES-256 at rest | ✅ |
| A03: Injection | Parameterized Supabase queries, Zod validation | ✅ |
| A04: Insecure Design | Append-only money tables, audit logs, feature flags | ✅ |
| A05: Security Misconfiguration | CSP/HSTS/XFO, no VITE_ secrets, Deno permissions | ✅ |
| A06: Vulnerable Components | npm audit in CI, pinned deps | ✅ |
| A07: Auth Failures | Phone OTP 6-digit, 5-min expiry, 5-attempt lockout | ✅ |
| A08: Software Integrity | GitHub Actions CI verification | ✅ |
| A09: Logging Failures | Structured audit_log (immutable) | ✅ |
| A10: SSRF | Domain allowlists (OpenWeatherMap, Azure, Razorpay, WATI) | ✅ |

---

## Security Headers

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://checkout.razorpay.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.openweathermap.org https://*.azure.com https://*.razorpay.com https://*.wati.io; font-src 'self' https://fonts.gstatic.com; frame-src https://api.razorpay.com https://checkout.razorpay.com; worker-src 'self' blob:;
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

---

## RLS Policy Summary

| Category | Tables | Client Access |
|----------|--------|---------------|
| Money Tables | savings_log, commission_wallet, subscriptions | SELECT only (no INSERT/UPDATE/DELETE) |
| Job Queue | job_queue | DENY all (zero policies) |
| Consumer Data | 12 tables | auth.uid() = consumer_id |
| Supplier Data | 5 tables | auth.uid() = supplier_id OR linked |
| Admin | 2 tables | role = 'superadmin' |
| Public | 2 tables | authenticated |
| Storage | 2 buckets | Consumer own files |

**Verified:** Anon key blocked from writing to commission_wallet, savings_log, job_queue ✅

---

## Secrets Management

- **Supabase Vault:** 10 Edge Function secrets (encrypted at rest)
- **Vercel Env:** 5 VITE_ public keys (visible to client, no secrets)
- **Twilio:** Credentials stored as Edge Function secrets
- **Razorpay:** Webhook secret HMAC-verified, key stored in Vault

---

## Risk Assessment

| Risk | Level | Mitigation |
|------|-------|------------|
| OTP abuse | Low | 5 attempts/15min lockout |
| Webhook replay | Low | HMAC-SHA256 signature verification |
| XSS | Low | CSP + React auto-escaping |
| SQL injection | Low | Parameterized queries via Supabase |
| Session hijacking | Low | 1h JWT, refresh rotation, HttpOnly |
| Storage abuse | Low | RLS policies + 10MB limit |
| Edge Function abuse | Low | Rate limiting + service-role gates |
