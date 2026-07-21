# JalSheti Pro — Deployment Guide

**Version:** 1.0.0

---

## 1. ENVIRONMENTS

| Environment | Supabase Project | Vercel | Purpose |
|---|---|---|---|
| Development | `jalsheti-dev` | Local (`npm run dev`) | Local development |
| Staging | `jalsheti-staging` | Preview deployments (PR) | Pre-production validation |
| Production | `jalsheti-prod` | `jalsheti-pro.vercel.app` | Live users |

---

## 2. SETUP SEQUENCE

### 2.1 Supabase
1. Create project in `ap-south-1` (Mumbai) region
2. Enable Phone Auth provider in Authentication settings
3. Run migrations in order: 001 → 002 → 003 → 004
4. Set Edge Function secrets: SUPPLIER_ADMIN_CODE, AZURE_TTS_KEY, AZURE_TTS_REGION=centralindia, WATI_API_TOKEN, WATI_API_ENDPOINT, RAZORPAY_WEBHOOK_SECRET, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, OPENWEATHER_API_KEY, SUPABASE_SERVICE_ROLE_KEY
5. Deploy Edge Functions: `npx supabase functions deploy`
6. Configure Supabase cron jobs for: morning-message (6 AM IST), pest-check (daily), job-processor (every 1 min), reconcile-payments (midnight)

### 2.2 Vercel
1. Connect GitHub repository
2. Set environment variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_RAZORPAY_KEY_ID, VITE_OPENWEATHER_KEY
3. Deploy: automatic on main branch push
4. Configure custom domain + SSL (auto via Vercel)

---

## 3. CI/CD PIPELINE

```yaml
# .github/workflows/ci.yml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run typecheck
      - run: npm run build
      - run: npm audit --audit-level=high
```

---

## 4. SECRET ROTATION

| Secret | Rotation Schedule | Procedure |
|---|---|---|
| WATI_API_TOKEN | Quarterly | Generate new token in WATI dashboard, update Supabase secret, verify |
| RAZORPAY_WEBHOOK_SECRET | Quarterly | Generate in Razorpay dashboard, update both Razorpay and Supabase simultaneously |
| AZURE_TTS_KEY | 6 months | Rotate in Azure Portal, update Supabase secret |
| SUPPLIER_ADMIN_CODE | On-demand | Update Supabase secret, notify existing suppliers |

---

## 5. ROLLBACK PROCEDURE

1. **Vercel:** Instant rollback to previous deployment via Vercel dashboard or CLI (`vercel rollback`)
2. **Database:** Forward-only migrations — deploy fix migration rather than rolling back
3. **Edge Functions:** Redeploy previous version via `supabase functions deploy`

---

## 6. MONITORING

- **Uptime:** UptimeRobot pinging health endpoint every 5 minutes
- **Errors:** Vercel Analytics (RUM) for frontend errors
- **API:** Supabase Logs for Edge Function errors
- **Alerting:** Email + WhatsApp to founder on: error rate >5%, payment failure >10%, DB CPU >80%, EF failures >3 consecutive
