# Point 7 — Ganti Dashboard Placeholder dengan Data API Nyata

## TASK TITLE
Replace Dashboard Placeholder with Real API Data

## PROJECT
TenantAppDevelopment / tenantApp

## FOCUS POINT
Point 7 — Ganti Dashboard placeholder dengan data API nyata

## MAIN GOAL
Ganti dashboard Vue yang masih placeholder/angka `Rp 0` menjadi dashboard yang mengambil data dari API nyata yang sudah ada, tanpa membuat dashboard analytics besar dan tanpa mengubah desain global.

Audit menemukan dashboard workspace masih placeholder. Task ini membuat dashboard minimal tetapi nyata, memakai endpoint existing seperti:

```text
GET /api/accounting/fiscal-year/status
GET /api/reports/financial-summary
GET /api/reports/profit-loss
GET /api/reports/balance-sheet
GET /api/reports/cash-flow
```

Gunakan endpoint yang sudah ada. Jangan membuat report engine baru.

---

## STRICT GUARDRAILS — DO NOT BREAK EXISTING FIXED AREAS

### DO NOT

- Do not redesign full dashboard layout from scratch.
- Do not add chart library unless already installed and used.
- Do not create advanced analytics dashboard.
- Do not change backend report calculations.
- Do not change report endpoint contracts.
- Do not change AppShell/sidebar/virtual tabs.
- Do not change master data pages.
- Do not change transaction modules.
- Do not change Product History location.
- Do not hardcode financial numbers.
- Do not use dummy dashboard numbers.
- Do not use fake API.
- Do not run destructive commands.

### PRESERVE

- Existing dashboard route.
- Existing app shell.
- Existing workspace design language.
- Existing auth and company selection flow.
- Existing API client with Bearer token and X-Company-ID.
- Existing reports pages.

---

## READ FIRST

### Docs

```text
docs/frontend-audit-gap-report.md
docs/update-roadmap.md
docs/phase-8-financial-statements*.md if exists
docs/phase-13-accounting-frontend-mvp.md if exists
```

### Backend

```text
backend/routes/api.php
backend/app/Http/Controllers/Api/Reports/*
backend/app/Http/Controllers/Api/Accounting/*
backend/app/Services/Reports/*
backend/app/Services/Accounting/*
backend/config/permissions.php
```

### Frontend Vue

```text
frontend-vue/src/router/index.ts
frontend-vue/src/pages/dashboard/*
frontend-vue/src/pages/Dashboard*.vue
frontend-vue/src/services/api.ts
frontend-vue/src/services/reports/*
frontend-vue/src/stores/company.store.ts
frontend-vue/src/components/*
frontend-vue/src/components/workspace/*
```

Search terms:

```text
Dashboard
financial-summary
fiscal-year/status
Rp 0
placeholder
dummy
mock
```

---

## BACKEND ENDPOINT VERIFICATION

Verify available endpoints:

```bash
php artisan route:list --path=api
```

Preferred data sources:

```text
GET /api/reports/financial-summary
GET /api/accounting/fiscal-year/status
GET /api/reports/profit-loss
GET /api/reports/balance-sheet
GET /api/reports/cash-flow
```

If `financial-summary` exists, prioritize it for dashboard cards.
If not, compose from other existing report endpoints.
Do not create new dashboard endpoint unless existing endpoints are insufficient and project style clearly supports it.

---

## FRONTEND REQUIREMENTS

Create/update dashboard service:

```text
frontend-vue/src/services/dashboard.service.ts
```

Or use existing report services if already present.

Dashboard should show real data:

```text
[ ] Active company name
[ ] Fiscal year / fiscal period status
[ ] Net profit/loss
[ ] Total assets
[ ] Total liabilities
[ ] Total equity
[ ] Cash ending balance
[ ] Cash in / cash out if available
[ ] Balance sheet balanced status if available
```

Optional if data exists:

```text
[ ] Latest report period displayed
[ ] Warning if fiscal year is closed/locked
[ ] Empty state if no posted journal/report data
```

Do not show fake 0 values unless backend truly returns 0.
If API fails, show error state.
If no data, show empty state.

---

## FILTER / PARAMS

Dashboard may default to current fiscal year or current date range.
Use backend-supported params only.

Likely params:

```text
start_date
end_date
fiscal_year
```

If fiscal year status endpoint gives active fiscal year, use it to build default filters.
If not available, default to current year date range but make it clear in code.

---

## UI REQUIREMENTS

Keep dashboard simple:

```text
[ ] Header with company/fiscal status
[ ] 4–6 summary cards
[ ] compact report health/status section
[ ] loading state
[ ] error state
[ ] empty state
[ ] refresh button
```

No need for charts in this task unless already implemented.

---

## ERROR HANDLING

Handle:

```text
401 unauthenticated
403 forbidden
422 validation error
network error
empty report data
```

Do not crash if one endpoint fails. Show partial data if safe and clear error message for missing section.

---

## ACCEPTANCE CRITERIA

```text
[ ] Dashboard no longer displays hardcoded placeholder Rp 0 values.
[ ] Dashboard fetches real API data.
[ ] Bearer token is sent.
[ ] X-Company-ID is sent.
[ ] Financial summary displays if endpoint available.
[ ] Fiscal year status displays if endpoint available.
[ ] Loading/error/empty states work.
[ ] Refresh button works.
[ ] Existing report pages are not broken.
[ ] Existing virtual tabs are not broken.
[ ] Existing sidebar is not broken.
```

---

## TESTING

Backend:

```bash
php artisan route:list --path=api
php artisan test --filter=FinancialSummary
php artisan test --filter=Report
```

Frontend:

```bash
cd frontend-vue
npm run typecheck
npm run lint
npm run build
```

---

## DOCUMENTATION

Create/update:

```text
docs/point-7-dashboard-real-api-data.md
```

Update `docs/frontend-audit-gap-report.md` with dashboard gap status.

---

## FINAL SUMMARY REQUIRED

Report:

```text
1. Placeholder root cause.
2. API endpoints used.
3. Frontend service/page changed.
4. Dashboard data fields now real.
5. Error/empty/loading behavior.
6. Files changed.
7. Commands run and result.
8. Regression checklist.
```

---

## COMMIT AND PUSH REQUIRED

```bash
git status --short
git add <relevant files only>
git commit -m "replace dashboard placeholder with api data"
git push origin main
```

If current branch is not main:

```bash
git push origin HEAD
```

Final response must include commit hash and push result.
