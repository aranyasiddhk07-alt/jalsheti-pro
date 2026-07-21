# JalSheti Pro — Testing Master Plan

**Version:** 1.0.0

---

## 1. UNIT TESTS (Vitest)

**Framework:** Vitest (Vite-native, compatible with Jest APIs)

**Coverage target:** 100% of pure functions, >80% overall

| Engine | Test File | Key Tests |
|---|---|---|
| commissionLogic | `src/engines/commission/commissionLogic.test.ts` | 0/5/10/15/20 consumers, multi-tier plans, milestone ladder edge cases, min payout gate |
| cropIntelligence | `src/engines/crop/cropIntelligence.test.ts` | All 5 stage boundaries, fertilizer schedule for 4 soil types × 3 crop types, weather gate trigger/no-trigger, area scaling |
| soilCardAnalysis | `src/engines/crop/soilCardAnalysis.test.ts` | All 15 question answer combos, black cotton/laterite/alluvial detection, pH/N level scoring |
| pestWarningEngine | `src/engines/pest/pestWarningEngine.test.ts` | Each of 6 diseases trigger/no-trigger, all variety multipliers, confidence scoring, airflow cross-link |
| weedEngine | `src/engines/weed/weedEngine.test.ts` | All 5 weed types × weather gate, sedge special case |
| rowGeometryEngine | `src/engines/geometry/rowGeometryEngine.test.ts` | All 3 tiers, weed intensity combos, airflow multiplier, intercrop |
| savingsCalculator | `src/engines/savings/savingsCalculator.test.ts` | All 8 event types, total calc, empty log |
| organicManureEngine | `src/engines/fertilizer/organicManureEngine.test.ts` | All resource combos, press mud top rec, dose ranges |
| liquidOrganicEngine | `src/engines/fertilizer/liquidOrganicEngine.test.ts` | All 6 tiers, combined reduction cap at 35%, fresh dung warning |

---

## 2. INTEGRATION TESTS

| Flow | Test Cases |
|---|---|
| Auth | Register consumer → verify public.users created via trigger, id = auth.uid(), trial subscription status set |
| Water Session | START → verify session INSERTED → STOP → verify advisory generated, pest checked, savings logged, notification sent |
| Payment Webhook | Send verified HMAC payload → verify commission credited, subscription updated, supplier wallet increased |
| Supplier | Register supplier → add consumer → set schedule → consumer sees schedule |

---

## 3. E2E TESTS (Playwright — Year 2)

Three critical user journeys via Playwright on staging environment:
1. Consumer onboarding: register → field setup → soil card → dashboard → water START/STOP
2. Supplier management: register → link consumer → set schedule → realtime notification → check earnings
3. Payment: register → trial → subscribe → view subscription status

---

## 4. OFFLINE TESTS

- Go offline → log water session → verify queued in IndexedDB
- Go online → verify sync triggered → verify session in DB
- Two devices → both log offline for same field → online → verify conflict resolution

---

## 5. CI/CD INTEGRATION

```yaml
# .github/workflows/ci.yml
- run: npx vitest run          # Unit tests
- run: npm run typecheck        # TypeScript
- run: npm run build            # Production build
- run: npm audit --audit-level=high  # Security
```
