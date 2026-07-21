# JalSheti Pro — Coding Standard

**Version:** 1.0.0 | **Target:** GLM 5.2

---

## 1. TYPESCRIPT RULES

### 1.1 Strict Mode
`tsconfig.app.json` MUST include:
```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### 1.2 Type Annotations
- All function parameters MUST have explicit types
- All function returns MUST have explicit return types
- NEVER use `any` except in explicit `as any` casts for external library compatibility
- Use `interface` for object shapes, `type` for unions/primitives

### 1.3 Imports
- Type-only imports: NOT required (verbatimModuleSyntax is disabled)
- Import order: React → Third-party → Internal modules → Types → Styles
- Use path alias `@/` for `src/` imports

---

## 2. REACT RULES

### 2.1 Component Conventions
- Use functional components with named exports
- File name matches component name: `ConsumerDashboard.tsx` exports `ConsumerDashboard`
- One component per file maximum
- Props defined as interface directly above the component

### 2.2 Hooks
- `useState` for local state, `useAppStore` (Zustand) for global state
- `useEffect` MUST have cleanup functions for subscriptions/timers
- Custom hooks in `src/hooks/` only

### 2.3 JSX
- Self-closing tags for empty elements: `<div />`
- Conditional rendering: `{condition && <Component />}`
- Map rendering: `{items.map(item => <Item key={item.id} />)}`
- NEVER use index as key

---

## 3. NAMING CONVENTIONS

| Element | Case | Example |
|---|---|---|
| Component files | PascalCase.tsx | `ConsumerDashboard.tsx` |
| Hook files | camelCase.ts | `useRouteGuard.ts` |
| Engine files | camelCase.ts | `cropIntelligence.ts` |
| Utility files | camelCase.ts | `supabase.ts` |
| Type files | camelCase.ts | `index.ts` |
| SQL files | NNN_description.sql | `001_initial_schema.sql` |
| React components | PascalCase | `function ConsumerDashboard()` |
| Interfaces | PascalCase | `interface WaterSession` |
| Type aliases | PascalCase | `type RiskLevel = 'low' | ...` |
| Enums | PascalCase | `enum UserRole` |
| Functions | camelCase | `getGrowthStage()` |
| Variables | camelCase | `const fieldArea` |
| Constants | UPPER_SNAKE | `const MAX_RETRIES = 3` |
| URL paths | kebab-case | `/consumer/pani-dakhla` |

---

## 4. FORMATTING

- Indentation: 2 spaces (NEVER tabs)
- Line length: 120 characters maximum
- Semicolons: Required
- Quotes: Single quotes for strings, backticks for templates
- Trailing commas: Required in multi-line objects/arrays
- Braces: Opening brace on same line (K&R style)

---

## 5. DOCUMENTATION

- Every exported function MUST have JSDoc: `@param`, `@returns`, description
- Engine files: Document the algorithm and scientific basis
- Complex business logic: Inline comment explaining WHY, not WHAT
- NO placeholder comments like `// TODO` or `// FIXME`

---

## 6. ERROR HANDLING

- All async functions MUST have try/catch
- Error messages in Marathi for user-facing errors
- NEVER: `catch (e) {}` (silent failure)
- ALWAYS: log the error, return a meaningful response

---

## 7. IMPORT RULES

- Engines: Import ONLY from `../../types`
- lib/supabase.ts: Import ONLY `@supabase/supabase-js`
- lib/auth.ts: Import ONLY from `./supabase`
- Screens: Import from `../../lib/*`, `../../store/*`, `../../i18n/*`, `../../engines/*`
- NEVER: Circular imports between engines

---

## 8. ENVIRONMENT VARIABLES

- Public: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_RAZORPAY_KEY_ID`, `VITE_OPENWEATHER_KEY`, `VITE_FCM_VAPID_KEY`
- Secrets (Edge Function only): `SUPPLIER_ADMIN_CODE`, `AZURE_TTS_KEY`, `WATI_API_TOKEN`, `RAZORPAY_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENWEATHER_API_KEY`
- NEVER prefix a secret with `VITE_`

---

## 9. DATABASE RULES

- All table names: snake_case, plural where it makes sense
- All column names: snake_case
- Primary keys: `id UUID PRIMARY KEY DEFAULT gen_random_uuid()` (EXCEPT `users.id` which equals `auth.uid()`)
- Foreign keys: `referenced_table_column`, e.g. `linked_supplier_id REFERENCES users(id)`
- Timestamps: `TIMESTAMPTZ DEFAULT now()`
- All tables have `created_at`, mutable tables also have `updated_at`
- CHECK constraints on all enum-like columns
- NEVER: Drop a column in a migration — add new column, migrate data, then drop old column in separate migration

---

## 10. TESTING RULES

- Unit tests for all engine pure functions
- Test file alongside source: `cropIntelligence.test.ts` in `src/engines/crop/`
- Framework: Vitest
- Coverage target: 100% of pure functions, >80% overall
- Test naming: `describe('module') → it('should behave when condition')`
