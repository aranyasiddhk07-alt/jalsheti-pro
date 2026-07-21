# JalSheti Pro — AI Engine Specification

**Version:** 1.0.0 | **Target:** GLM 5.2

This document specifies every algorithm, business rule, calculation, and decision tree used by the agronomy intelligence engines. GLM 5.2 MUST implement these exactly as specified.

---

## 1. ENGINE ARCHITECTURE RULES

**ALL engines are pure functions.** They:
- Accept typed inputs (from `src/types/index.ts`)
- Return typed outputs
- Have ZERO database access
- Have ZERO side effects
- Are deterministic for the same inputs
- Import ONLY from `../../types` (no Supabase, no React, no Zustand)

---

## 2. CROP INTELLIGENCE ENGINE (`src/engines/crop/cropIntelligence.ts`)

### 2.1 `getGrowthStage(plantingDate: Date) → GrowthStage`

Sugarcane growth stages for Maharashtra:

| Stage | Days After Planting | Irrigation Interval | Criticality (1-10) |
|---|---|---|---|
| germination | 0–35 | Every 7 days | 7 |
| tillering | 36–100 | Every 8–10 days | **10 (MOST CRITICAL)** |
| grandGrowth | 101–270 | Every 10–12 days | 8 |
| maturity | 211–330 | Every 15 days | 5 |
| harvest | 270+ | Stop irrigation | 3 |

**Algorithm:**
```
dayNumber = floor((Date.now() - plantingDate.getTime()) / 86400000)
if dayNumber <= 35 → germination, 7d, criticality 7
if dayNumber <= 100 → tillering, 8d, criticality 10
if dayNumber <= 270 → grandGrowth, 10d, criticality 8
if dayNumber <= 330 → maturity, 15d, criticality 5
else → harvest, 0d, criticality 3
```

**Return type:** `{ stage: string, stageMarathi: string, dayNumber: number, irrigationIntervalDays: number, criticalityLevel: number }`

### 2.2 `getFertilizerSchedule(fieldAreaAcres: number, soilType: string, cropType: string) → FertilizerStage[]`

**Base doses per acre (N:P:K = 3:1:2):**
- Urea: 130 kg/acre (46% N)
- DAP: 52 kg/acre
- MOP: 40 kg/acre

**Application windows:**

| Window | Timing (days after planting) | Content |
|---|---|---|
| Basal | 0 DAP (at planting) | Full DAP + full MOP + 1/3 Urea + 5 kg Zinc Sulfate + biofertilizer (Azotobacter+PSB) on setts |
| Top-dress 1 | 30 DAP | 1/3 Urea |
| Top-dress 2 | 60 DAP (peak tillering — MOST CRITICAL) | 1/3 Urea (+ extra N if tillering count low) |
| Top-dress 3 | 90 DAP (Adsali/ratoon ONLY) | Supplemental Urea |

**Gypsum:** 200 kg/acre once per season, timed with basal or TD1 on alkaline/black soils.

**Soil-Type Modifiers:**

| Soil Type | Modifier |
|---|---|
| black_cotton (काळी कसदार) | Reduce MOP 20% (high native K). Split each urea dose into 2 smaller applications 7-10 days apart. Add gypsum if alkaline. |
| red_laterite (लाल माती) | Keep full MOP. Often Zn-deficient → ensure Zinc Sulfate. Add lime 2 weeks before basal if acidic. |
| sandy (वाळूयुक्त) | Split Urea into 4 smaller doses (poor N retention). Tighten rain window. |
| alluvial (गाळाची) | Standard schedule, no modifier. |

**Scaling:** All kg values multiplied by `fieldAreaAcres`.

### 2.3 `getNextFertilizerAction(schedule: FertilizerStage[], daysSincePlanting: number, weather: WeatherData) → FertilizerAction`

**Weather gate:** If `weather.rainfall > 30mm` forecast within 48 hours → return `{ status: 'hold_for_rain', savingsEvent: 'UREA_RAIN_DELAY' }`.

UREA_RAIN_DELAY savings amount: **₹400** per avoided wasted urea bag.

**High temp warning:** If `weather.temp > 35°C` with no irrigation planned within 24 hours → warn about ammonia volatilization.

---

## 3. SOIL CARD ENGINE (`src/engines/crop/soilCardAnalysis.ts`)

### 3.1 `SOIL_QUESTIONS` constant

Array of 15 question objects. Each question:
```
{ id: number, questionMarathi: string, options: { value: number, labelMarathi: string }[] }
```

Questions cover: soil color, texture (dry), texture (wet), previous crop, drainage speed, organic matter (smell), cracking, depth, salinity taste, pH feel, yield history, earthworm count, manure recency, slope, lab report availability.

### 3.2 `analyzeSoilCard(answers: number[]) → SoilCardResult`

**Scoring algorithm:**

```
soilType detection:
  if answers[0] == 0 AND answers[3] <= 1 → black_cotton
  if answers[0] == 1 → red_laterite
  if answers[0] == 2 → sandy
  else → alluvial

phEstimate:
  if answers[9] == 0 → acidic (add lime)
  if answers[0] == 0 → neutral (excellent)
  else → slightly acidic

nitrogenLevel:
  if answers[7] <= 1 → medium-high
  if answers[7] >= 2 → low (add urea)
  else → medium

waterRetention:
  if answers[4] <= 1 → low (fast drainage)
  if answers[4] == 2 → medium
  else → high (slow drainage)
```

**Return type:** `{ soilType, phEstimate, nitrogenLevel, waterRetention, recommendations: string[], fertilizerDosage: Record<string, string> }`

---

## 4. PEST WARNING ENGINE (`src/engines/pest/pestWarningEngine.ts`)

### 4.1 `evaluatePestRisks(weather, growthStage, daysSincePlanting, currentMonth, variety) → PestRisk[]`

**6 diseases evaluated:**

| # | Disease | Marathi | Trigger Conditions |
|---|---|---|---|
| 1 | Early Shoot Borer | लोंबी किड | days 15-90, temp 25-30°C, humidity >70%, month 3-6 |
| 2 | Red Rot | लाल कूज | rainfall >50mm, humidity >85%, days >90 |
| 3 | Smut | काणी रोग | month in (5,6,10,11), humidity >75% |
| 4 | Internode Borer | आंतरगाठ किड | days >120, temp >28°C |
| 5 | Wilt | मर रोग | >10 days no irrigation, non-resistant variety |
| 6 | Top Borer | शेंडा पोखर किड | days >120, temp >28°C |

**Each PestRisk includes:**
```
{
  pestName: string,
  pestNameMarathi: string,
  riskLevel: 'low' | 'medium' | 'high' | 'critical',
  advisory: string,        // English trigger explanation
  treatment: string,       // Marathi treatment recommendation
  urgency: string,         // Marathi urgency message
  confidence: number,      // 0-100 based on condition match count
  explanation: string      // Why this risk is elevated
}
```

### 4.2 `getVarietyRiskMultiplier(variety: string, disease: string) → number`

| Variety | Red Rot | Smut | Wilt | Top Borer |
|---|---|---|---|---|
| Co86032 (निरा) | 0.6 | 0.5 | 0.7 | 1.0 |
| CoM0265 | 0.6 | 0.5 | 1.0 | 1.0 |
| Co94012 | 0.7 | 1.0 | 1.0 | 1.0 |
| Co0238 | **1.8** | 1.0 | 1.3 | **1.6** |
| other/unknown | 1.0 | 1.0 | 1.0 | 1.0 |

**Risk level mapping after multiplier:**
```
Multiply base risk score by variety multiplier.
Map to risk level:
  score > 0.8 → 'critical'
  score > 0.6 → 'high'
  score > 0.3 → 'medium'
  else       → 'low'
```

---

## 5. WEED ENGINE (`src/engines/weed/weedEngine.ts`)

### 5.1 `getWeedRecommendation(weedType, cropDay, weather) → WeedRecommendation`

| Weed Type | Product | Active Ingredient | Brand |
|---|---|---|---|
| grassy_broadleaf_new | Atrazine 50% WP | Atrazine | Strike |
| broadleaf_medium | Metribuzin 70% WP | Metribuzin | Tata Metri / Sencor |
| mixed | Metribuzin + 2,4-D | Combination | Nakshatra |
| broadleaf_old | 2,4-D Amine 58% SL | 2,4-D | Dhanuka / Rallis |
| sedge | — | — | Hand-weeding (herbicides weak on sedge) |

**Weather gate:** No spray if rain forecast within 24 hours → `canSprayNow: false`
**Savings event on rain delay:** HERBICIDE_RAIN_DELAY (₹200)

---

## 6. FERTILIZER ENGINES

### 6.1 Solid Fertilizer (`src/engines/fertilizer/solidFertilizerEngine.ts`)

Re-exports from cropIntelligence. Brand recommendation lookup:

| Nutrient | Product | Brands |
|---|---|---|
| Urea (46% N) | Commodity, subsidized | IFFCO, Coromandel, RCF, NFL — brand-agnostic |
| DAP | DAP | IFFCO DAP |
| MOP | MOP | Mahadhan MOP |
| NPK blend (single-bag) | NPK complex | Mahadhan 10:26:26, Coromandel Gromor 12:32:16 |
| Zinc | Zinc Sulfate 21% | Mahadhan Zinc, Tata Zinc Sulphate |
| Gypsum | Gypsum | Commodity (local agri-input) |

`getChemicalReductionPercent(organicInputApplied: boolean) → number`: Returns **25** if true, **0** if false.

### 6.2 Liquid Fertilizer (`src/engines/fertilizer/liquidFertilizerEngine.ts`)

`getLiquidBoosterSuggestion(soilCardResult, fertilizerSchedule, daysSincePlanting, weather) → LiquidBoosterSuggestion | null`

**Trigger conditions (ALL must hold):**
1. `soilCardResult.nitrogenLevel === 'low'` (or other deficiency)
2. Current day falls between two solid fertilizer windows
3. `weather.rainfall < 2mm` in next 24 hours (foliar needs dry leaf)

**Products (Maharashtra availability):**
- Nano Urea (IFFCO, via PACS): 2-4ml/L, ~500ml-1L/acre, ~₹150-250
- Nano DAP (IFFCO): Similar rate
- NPK 19:19:19 water-soluble: 5g/L

**Framing:** "बूस्टर" — small, optional, between main doses. NEVER as solid fertilizer replacement.

### 6.3 Organic Manure (`src/engines/fertilizer/organicManureEngine.ts`)

`getPrimaryManureRecommendation(resources: FarmResources) → ManureRecommendation`

**Resource matching (zero-marginal-cost first):**

| Resource | Recommendation | Dose (RANGE, never single number) |
|---|---|---|
| hasCattle | FYM (Farmyard Manure) | 5-20 t/acre |
| hasPoultry | Poultry manure (aged) | ~half FYM rate |
| hasGoatSheep | Goat/sheep manure | Similar to FYM |
| hasBiogasPlant | Biogas slurry | Apply what's produced |
| nearSugarFactory | Press mud (HIGHEST LEVERAGE) | 1-2 t/acre dried OR 4-10 t/acre fresh |
| none | Vermicompost | 1-2 t/acre (most concentrated) |

**Always display doses as ranges with "स्थानिक कृषी केंद्राकडून खात्री करा" verification note.**

### 6.4 Liquid Organic (`src/engines/fertilizer/liquidOrganicEngine.ts`)

`getLiquidOrganicTiers(resources) → LiquidOrganicTier[]`

**6 tiers, ordered by effort/cost:**

| Tier | Product | Gate | Key Info |
|---|---|---|---|
| 0 | Biogas slurry | has_biogas_plant | Already produced, zero marginal cost |
| 1 | Matka Khad | has_cattle | Simplest: dung + urine + jaggery + water in earthen pot, 7-8 days |
| 2 | Jeevamrut (FLAGSHIP) | has_cattle | 10kg dung + 10L urine + 1.5kg jaggery + 1.5kg besan + soil, 5-7 days, stir 2x daily. Most research-validated. |
| 2b | Beejamrut | has_cattle | Thinner variant for sett dip before planting. Cross-links to pest prevention. |
| 3 | Vermiwash | has_cattle + effort | One-time earthworm setup, passive ongoing output. NEVER fresh dung (kills worms). |
| 4 | Panchagavya | has_cattle + investment | Dung + ghee + urine + milk + curd + banana + coconut water, 18-21 days. Optional upgrade. |

**CRITICAL GUARDRAIL: `getCombinedChemicalReduction(solidOrganicApplied, liquidOrganicRegular) → number`**

Returns percentage capped at **35%**:
- Solid organic applied: 25%
- Liquid organic regular: +10%
- Combined cap: **35%** (hard ceiling)

**Scientific basis:** Complete replacement of chemical fertilizer with Jeevamrut reduces staple-crop yields by up to ~30% (*Nature Sustainability*). Organic inputs are supplements, never replacements.

---

## 7. ROW GEOMETRY ENGINE (`src/engines/geometry/rowGeometryEngine.ts`)

### 7.1 `getMaintenanceTier(spacingFeet: number) → 'simplified' | 'standard' | 'advanced'`

```
if spacingFeet <= 3.5 → 'simplified' (higher cane density, less management post-canopy)
if spacingFeet <= 4.0 → 'standard' (balanced default, research sweet spot)
else → 'advanced' (room for intercropping + mechanization)
```

### 7.2 `getWeedIntensityMultiplier(tier, daysSincePlanting, hasIntercrop) → number`

```
simplified + days <= 60 → 1.3 (push hard early)
simplified + days > 60  → 0.5 (canopy self-shading)
advanced + !hasIntercrop → 1.4 (open gap all season)
advanced + hasIntercrop  → 0.8 (intercrop suppresses weeds)
standard                 → 1.0
```

### 7.3 `getAirflowDiseaseMultiplier(tier) → number`

```
simplified → 1.1 (denser canopy = higher humidity = more fungal pressure)
standard   → 1.0
advanced   → 0.95 (better airflow = less fungal pressure)
```

---

## 8. COMMISSION ENGINE (`src/engines/commission/commissionLogic.ts`)

### 8.1 `calculateSupplierEarnings(consumerCount, planBreakdown, monthsActive, suppliersReferred) → Earnings`

**EXACT CALCULATION:**

```
monthlyEarning = 
  (basicCount × 20 + smartCount × 40 + premiumCount × 60) × monthsActive

referralBonus = calculateMilestoneCashback(suppliersReferred)
  − 5 referred  → 150
  − 10 referred → +200 (cumulative 350)
  − 15 referred → +250 (cumulative 600)
  − 20 referred → +400 (cumulative 1000)

total = monthlyEarning + referralBonus
```

**Fraud gate:** Cashback tiers release only after referred consumers complete **2 consecutive paid months**.

**Minimum payout:** ₹200

---

## 9. SAVINGS CALCULATOR (`src/engines/savings/savingsCalculator.ts`)

### 9.1 `SAVINGS_EVENTS` constant

| Event Key | Amount (₹) | Marathi Reason |
|---|---|---|
| RAIN_AVOIDED_IRRIGATION | 220 | पावसामुळे पाणी वाचवले |
| CORRECT_FERTILIZER_TIMING | 800 | योग्य वेळी खत टाकले |
| PEST_WARNING_ACTED | 15,000 | वेळेत कीड नियंत्रण |
| OPTIMAL_IRRIGATION | 180 | इष्टतम सिंचन |
| UREA_RAIN_DELAY | 400 | पावसामुळे युरिया वाचला |
| HERBICIDE_RAIN_DELAY | 200 | पावसामुळे तणनाशक वाचले |
| INSURANCE_CLAIM_DOCUMENTED | 0 (variable) | विमा दावा कागदपत्रे |
| GOVT_SCHEME_CLAIMED | 2,000 | सरकारी योजनेचा लाभ |

### 9.2 `calculateTotalSavings(savingsLog: SavingsLogEntry[]) → number`

Sum of all `event.amount` for each entry in savingsLog, using `SAVINGS_EVENTS[entry.eventKey]` lookup.

---

## 10. ENGINE TESTING REQUIREMENTS

Every engine MUST have unit tests verifying:

1. `cropIntelligence`: All 5 growth stage boundaries, fertilizer schedule for all 4 soil types × 3 crop types, weather gate (rain/no rain), area scaling
2. `soilCardAnalysis`: All 15 questions, black cotton detection, pH estimate, nitrogen level scoring
3. `pestWarningEngine`: Each of 6 diseases with trigger/no-trigger conditions, all variety multipliers, confidence scoring
4. `commissionLogic`: Earnings with 0/5/10/15/20 consumers, multi-tier plans, milestone ladder, minimum payout gate
5. `savingsCalculator`: All 8 event types, total calculation with empty log
6. `weedEngine`: All 5 weed types × crop stages, weather gate, sedge special case
7. `rowGeometryEngine`: All 3 tiers, weed intensity for all combinations, airflow multiplier
8. `organicManureEngine`: All resource combinations, press mud as top recommendation
9. `liquidOrganicEngine`: All 6 tiers, combined reduction cap at 35%, fresh dung warning
