# JalSheti Pro — UI/UX Master Specification

**Version:** 1.0.0 | **Target:** GLM 5.2

---

## 1. DESIGN TOKENS (NON-NEGOTIABLE)

```
Button minimum height: 56px
Body font size: 16px
Heading font size: 22px  
CTA font size: 18px
Label font size: 13px
Hero font size: 28px
Card padding: 16px
Section gap: 24px
Font family (Marathi): 'Noto Sans Devanagari', sans-serif
Font family (Numbers): 'Roboto', sans-serif
Line height (Marathi text): 1.6 minimum
Color scheme: Primary green (#2E7D32), secondary blue (#1565C0), warning amber (#FF6F00), danger red (#C62828)
Background: #F1F8E9 (light green), Card: #FFFFFF (white)
```

---

## 2. AUTH FLOW (6-STEP STATE MACHINE)

### Step 1: PhoneEntry
- App logo + tagline
- Phone number input with +91 prefix
- 56px "OTP पाठवा" button
- Zod validation: 10-digit Indian mobile number
- Loading spinner while OTP is being sent
- Error message in Marathi below input

### Step 2: OTPVerify
- "तुमच्या मोबाइलवर आलेला 6 अंकी OTP टाका" heading
- 6 separate digit input boxes (auto-advance on input)
- 56px "OTP तपासा" button
- Resend OTP link with 30-second countdown timer
- "नंबर बदला" link to go back to Step 1
- Error: "OTP चुकला — पुन्हा टाका"

### Step 3: ConsentScreen
- DPDP consent title in Marathi
- Consent text explaining data usage (GPS, photos, water logs)
- Checkbox: "मला वरील अटी मान्य आहेत"
- 56px "पुढे" button (disabled until checkbox checked)
- Error if submitted without consent: "पुढे जाण्यासाठी संमती द्यावी लागेल"

### Step 4: RoleSelect
- "तुम्ही कोण आहात?" heading
- 3 large cards with icons:
  - शेतकरी (Farmer) — "तुमच्या शेतीची माहिती, सल्ला आणि योजना"
  - पुरवठादार (Supplier) — "पाणी वेळापत्रक, शेतकरी व्यवस्थापन, कमाई"
  - प्रशासक (Admin) — "व्यवस्थापकीय कामे"

### Step 5: SupplierRegister
- Fields: name, village, taluka, district (default Kolhapur), admin code, optional referral code
- All inputs in Marathi with Marathi placeholders
- 56px "नोंदणी पूर्ण करा" button
- Zod validation: all fields required (except referral)
- Admin code validated server-side via Edge Function

### Step 6: ConsumerRegister
- Fields: name, village, taluka, district, supplier phone number
- 56px "नोंदणी पूर्ण करा" button
- Supplier phone validated: must exist and have role='supplier'

---

## 3. CONSUMER DASHBOARD

### Layout (top to bottom)
1. **Header:** "नमस्कार, {name} काका!" + notification bell with unread badge + online/offline dot
2. **Growth Stage Card:** Crop day number, stage name in Marathi, next irrigation date
3. **Water Control:** Two 56px buttons:
   - START: Green (#4CAF50) "पाणी सुरू केले" 
   - STOP: Red (#C62828) "पाणी बंद केले" (pulsing animation when water is running)
   - Live elapsed timer between buttons: "⏱ 45 मिनिटे 32 सेकंद"
4. **Tai Voice:** "🔊 ताईचा सल्ला ऐका" button (plays audio, shows replay if already played)
5. **Savings Counter:** "💰 तुम्ही वाचवले: ₹X,XXX" (prominent, green, updates with animation)
6. **Fertilizer Card:** Shown only when fertilizer window is open. Shows dosage, brands, weather gate warning, "खत टाका" CTA
7. **Pest Alert Banner:** Shown only when active HIGH/CRITICAL pest risks. Amber background, pest name, action text.
8. **Bottom Nav:** 5 tabs — Home, Calendar, History, Schemes, Profile

### Interactions
- START tap → timer begins, button disabled, STOP button enabled with pulse
- STOP tap → timer stops, advisory card appears, Tai voice auto-plays
- 5-second undo snackbar after STOP: "पाणी बंद केले — बदलायचे? [रद्द करा]"

### States
- **Loading:** Skeleton cards matching component shapes
- **Empty (no field):** "अजून शेत जोडलेले नाही — शेत सेटअप करा" with CTA
- **Empty (no water sessions):** "अजून पाण्याची नोंद नाही — पहिलं पाणी सुरू करा"
- **Offline:** Persistent banner "🔴 इंटरनेट नाही — पाणी लॉग जतन केले जातील"
- **Error:** "काहीतरी चूक झाली — पुन्हा प्रयत्न करा" with retry button

---

## 4. SUPPLIER DASHBOARD

### Layout
1. **Header:** "जलशेती प्रो — पुरवठादार" + notification badge
2. **Earnings Widget:** Monthly commission, total earned, pending payout amount
3. **Quick Stats:** Farmer count, active today count
4. **Primary CTA:** 56px "पाणी वेळापत्रक द्या" button
5. **Realtime Feed:** Live water session activity from linked consumers with timestamps
6. **Inactive Alerts:** Consumers with 3+ days no water log, highlighted with warning icon
7. **Referral CTA:** "🔗 रेफरल करा → ₹१,००० मिळवा" with share button
8. **Bottom Nav:** Dashboard, Farmers, Wallet, Referrals, Notifications

---

## 5. ADMIN DASHBOARD

### Layout
1. **Header:** "जलशेती प्रो — प्रशासक"
2. **Metrics Cards:** MRR, ARR, active consumers, active suppliers, active trials
3. **Tab Navigation:** Payouts | Market Rates | Broadcast | Audit
4. **Payouts Tab:** Pending payout list with supplier name, amount, approve/reject buttons, empty state "कोणतीही प्रलंबित पेमेंट नाही"
5. **Market Rates Tab:** District selector, FRP rate input, factory opening date, sugar recovery rate, "अपडेट करा" button
6. **Broadcast Tab:** Marathi textarea, target selector (all/consumers/suppliers/by district), "प्रसारण पाठवा" button, success toast "प्रसारण पाठवले!"
7. **Audit Tab:** Table of audit log entries: actor, action, table, timestamp

---

## 6. ACCESSIBILITY REQUIREMENTS

- All interactive elements: `min-height: 56px`
- Touch target spacing: 24px minimum between elements
- Color contrast: WCAG AA (4.5:1 normal text, 3:1 large text)
- `aria-label` on all interactive Marathi elements (in Marathi)
- `prefers-reduced-motion`: disable all animations (pulsing STOP, savings counter)
- `role` attributes on cards (`role="region"`), dialogs (`role="dialog"`), navigation (`role="navigation"`)

---

## 7. MARATHI UI RULES

- ALL user-facing text MUST come from `MR` dictionary via `{mr.keyName}`
- NEVER hardcode Marathi strings in JSX
- Use `mr` import: `import { mr } from '../../i18n/marathi'`
- Tai persona in voice/UI: validates before suggesting, never commands, uses "काका"
