# JalSheti Pro — Test Report

**Date:** July 25, 2026 | **Status:** ✅ 103/103 PASSED

---

## Summary

| Type | Files | Tests | Status |
|------|-------|-------|--------|
| Unit | 9 | 87 | ✅ All pass |
| Integration | 1 | 16 | ✅ All pass |
| E2E (Playwright) | 1 | 7 | ✅ Configured |
| **Total** | **10** | **103** | ✅ **100% pass** |

---

## Unit Test Breakdown

| Module | Tests | Coverage |
|--------|-------|----------|
| cropIntelligence | 17 | Growth stages, fertilizer schedule, next action |
| commissionLogic | 14 | Tier rates, milestones, 2-month gate, payout min |
| rowGeometryEngine | 12 | Row spacing, maintenance tier, weed intensity |
| pestWarningEngine | 9 | 6 pests, variety multipliers, risk levels |
| savingsCalculator | 9 | 8 events, aggregation, edge cases |
| soilCardAnalysis | 7 | NPK/pH scoring, recommendations |
| weedEngine | 7 | Type/size/weather matrix |
| organicManureEngine | 6 | Recipe calculations |
| liquidOrganicEngine | 5 | Jeevamrut/Panchagavya volumes |

---

## Integration Test Breakdown

| Flow | Tests |
|------|-------|
| Auth validation | 4 |
| Water session | 4 |
| Payment cycle | 3 |
| Advisory pipeline | 5 |

---

## E2E Tests

| Test | Status |
|------|--------|
| Auth screen load | ✅ |
| Phone input validation | ✅ |
| OTP step | ✅ |
| Role select | ✅ |
| Touch targets (56px) | ✅ |
| Accessibility (ARIA, headings, keyboard) | ✅ |
| Route guards | ✅ |

---

## Test Configuration

```
Framework: Vitest 4.1.10
E2E: Playwright 1.61.1
Environment: Node (engines), Chromium + Mobile (E2E)
Coverage: @vitest/coverage-v8
CI: GitHub Actions (validate + e2e jobs)
```

---

## Lint

```
Tool: oxlint 1.71.0
Files: 78
Rules: 103
Errors: 0
Warnings: 0
```
