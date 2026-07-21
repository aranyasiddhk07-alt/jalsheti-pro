# JalSheti Pro — Security Guide

**Version:** 1.0.0 | **Target:** GLM 5.2

---

## 1. SECRET MANAGEMENT

**ABSOLUTE RULE: No VITE_ prefix for any secret.** VITE_ prefixed variables are inlined into the JavaScript bundle shipped to every browser.

| Secret | Location | Accessed By |
|---|---|---|
| SUPPLIER_ADMIN_CODE | Supabase Edge Function secret | validate-supplier-code EF |
| AZURE_TTS_KEY | Supabase Edge Function secret | tts-proxy EF |
| AZURE_TTS_REGION | Supabase Edge Function secret | tts-proxy EF |
| WATI_API_TOKEN | Supabase Edge Function secret | wati-send EF |
| WATI_API_ENDPOINT | Supabase Edge Function secret | wati-send EF |
| RAZORPAY_WEBHOOK_SECRET | Supabase Edge Function secret | razorpay-webhook EF |
| RAZORPAY_KEY_ID (secret) | Supabase Edge Function secret | reconcile-payments EF |
| RAZORPAY_KEY_SECRET | Supabase Edge Function secret | reconcile-payments EF |
| OPENWEATHER_API_KEY | Supabase Edge Function secret | weather-fetch EF |
| SUPABASE_SERVICE_ROLE_KEY | Supabase Edge Function secret | All business-logic EFs |

**Public (VITE_ prefixed):**
| Variable | Purpose |
|---|---|
| VITE_SUPABASE_URL | Supabase project URL |
| VITE_SUPABASE_ANON_KEY | Supabase anonymous key (safe by RLS design) |
| VITE_RAZORPAY_KEY_ID | Razorpay publishable key (safe for client) |
| VITE_OPENWEATHER_KEY | OpenWeatherMap API key (used via weather-fetch EF only, kept here for future) |
| VITE_FCM_VAPID_KEY | Firebase VAPID key (public by design) |

---

## 2. AUTHENTICATION

### 2.1 Phone OTP
- 6-digit numeric code
- 5-minute expiry from generation
- Maximum 5 attempts per phone number per 15 minutes
- Account lockout: 15-minute cooldown after 5 failed attempts

### 2.2 Session Management
- JWT managed by Supabase Auth
- Auto-refresh enabled (Supabase SDK default)
- Session timeout: 30 minutes of idle time
- Force re-authentication for: payout request, subscription change, account deletion

---

## 3. AUTHORIZATION (RLS)

All 22 tables have RLS enabled. Access control:

| Table | Consumer | Supplier | Admin | Edge Functions |
|---|---|---|---|---|
| users | SELECT own, UPDATE own | SELECT linked consumers + own | — | service_role ALL |
| fields | ALL own | SELECT linked | — | service_role ALL |
| soil_cards | ALL own | — | — | service_role ALL |
| water_sessions | ALL own | SELECT + acknowledge UPDATE | — | service_role ALL |
| commission_wallet | — | SELECT own | — | service_role INSERT |
| subscriptions | SELECT own | — | — | service_role INSERT/UPDATE |
| savings_log | SELECT own | — | — | service_role INSERT |

**Money tables:** NO client INSERT/UPDATE/DELETE. Writes via Edge Functions with service_role only. If RLS is enabled and no INSERT policy exists, the default behavior is DENY. This is a DELIBERATE architecture decision.

---

## 4. API SECURITY

### 4.1 Edge Function Rate Limiting

| Function | Limit | Window |
|---|---|---|
| validate-supplier-code | 10 | per IP per minute |
| tts-proxy | 30 | per user per minute |
| wati-send | 5 | per user per minute |
| razorpay-webhook | 100 | per minute |

### 4.2 Webhook Verification
- `razorpay-webhook`: HMAC-SHA256 signature verification is MANDATORY. Compute HMAC of raw body with `RAZORPAY_WEBHOOK_SECRET`. Compare against `X-Razorpay-Signature` header. IF MISMATCH → return 401 immediately.

---

## 5. SECURITY HEADERS

Configured in `vercel.json`:

```
Content-Security-Policy:
  default-src 'self'
  script-src 'self' 'unsafe-inline' https://checkout.razorpay.com
  style-src 'self' 'unsafe-inline'
  img-src 'self' data: https: blob:
  connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.openweathermap.org https://*.azure.com https://*.razorpay.com https://*.wati.io
  font-src 'self' https://fonts.gstatic.com
  frame-src https://api.razorpay.com https://checkout.razorpay.com
  worker-src 'self' blob:

Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(self)
```

---

## 6. DATA PRIVACY (DPDP Act Compliance)

- Consent screen: Implemented at Step 3 of auth flow
- Consent timestamp: `users.consent_granted_at` records when consent was given
- Right to erasure: Account deletion flow with cascading soft-delete (is_active = false), hard delete after 30 days
- Right to access: Data export endpoint returning all user data as JSON
- Data retention: GPS-tagged Pani Dakhla records kept for active accounts, deleted on account closure
- Scientific disclaimer: "हा सल्ला माहितीसाठी आहे. स्थानिक कृषी तज्ज्ञांचा सल्ला घ्या." on all advisory outputs
- Age gate: "I am 18+ years old" checkbox during consent flow

---

## 7. AUDIT LOGGING

`audit_log` table captures:
- Admin payout approvals
- Market rate changes
- Supplier code validations
- Failed authentication attempts
- Profile changes
- Payment reconciliation discrepancies

---

## 8. INPUT VALIDATION

- Client-side: Zod schemas for ALL form inputs
- Server-side: Edge Functions validate inputs before processing
- WATI template parameters sanitized (special characters stripped, length enforced)
- Supabase SDK parameterized queries prevent SQL injection

---

## 9. OWASP TOP 10 COVERAGE

| # | Vulnerability | Mitigation |
|---|---|---|
| A1 | Broken Access Control | RLS on all tables, route guards, role-based rendering |
| A2 | Cryptographic Failures | TLS 1.3 for all external calls, HMAC-SHA256 for webhooks, AES-256 at rest (Supabase) |
| A3 | Injection | Parameterized queries (Supabase SDK), Zod input validation, WATI template sanitization |
| A5 | Security Misconfiguration | CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy headers |
| A6 | Vulnerable Components | npm audit in CI, Dependabot for automated updates |
| A7 | Auth Failures | 6-digit OTP, 5-min expiry, 5-attempt lockout, session timeout |
| A8 | Software Integrity | CI pipeline verifies build before deploy, commit signing recommended |
