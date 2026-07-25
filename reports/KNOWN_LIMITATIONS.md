# JalSheti Pro — Known Limitations & Release Notes

## Known Limitations

| # | Limitation | Impact | Mitigation | Resolution |
|---|-----------|--------|------------|------------|
| 1 | **Phone OTP needs Dashboard Save** | Auth blocked until click | Manual action (10 sec) | One-time config |
| 2 | **OpenWeatherMap key activating** | Weather EF returns 401 | New keys take 2-24h | Automatic |
| 3 | **Azure TTS key (placeholder)** | Tai voice unavailable | Get key from Azure Portal | 5 min setup |
| 4 | **WATI key (placeholder)** | WhatsApp notifications unavailable | Get key from WATI Dashboard | 5 min setup |
| 5 | **Edge Function cold starts** | ~200ms first advisory | Cron warmers every 5 min | Infrastructure |
| 6 | **`net` extension not available** | http_post uses pg_net instead | pg_net installed | Done |

---

## Release Notes — v1.0.0

### What's Included
- Marathi-first PWA with Phone OTP authentication
- 3 role dashboards: Consumer, Supplier, Admin
- 11 pure TypeScript AI engines (103 tests)
- 11 Edge Functions (Deno, zero mocks)
- PWA with offline mode + Service Worker (24 precache entries)
- Professional landing page with documentation section
- Full security: CSP, HSTS, RLS on 22 tables, audit logs
- Database: 22 tables, 37 indexes, 31 RLS policies
- Storage: 2 buckets (insurance-photos, crop-diagnosis)
- CI/CD: GitHub Actions (typecheck → test → build → audit)
- pg_cron: pest-check-daily scheduled at 6 AM

### What's Coming
- v1.1: ML pest detection, insurance claims, govt schemes
- v2.0: Voice commands, soil OCR, yield prediction
- Enterprise: White-label, carbon credits, agri-fintech
