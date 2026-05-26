# Point 6 — Tambah Cash Bank Account Statement Page

## TASK TITLE
Implement Cash Bank Account Statement Page

## PROJECT
TenantAppDevelopment / tenantApp

## FOCUS POINT
Point 6 — Tambah Cash Bank Account Statement page

## MAIN GOAL
Tambahkan halaman frontend Vue untuk **Cash Bank Account Statement** yang memakai endpoint backend existing:

```text
GET /api/cash-bank/reports/account-statement
```

Halaman ini harus menampilkan mutasi rekening kas/bank dalam periode tertentu, termasuk opening balance, debit/in, credit/out, running balance, dan ending balance jika backend menyediakan data tersebut.

Task ini fokus pada integrasi UI + service + route + sidebar/menu. Jangan membuat modul Cash Bank baru dari nol.

---

## STRICT GUARDRAILS — DO NOT BREAK EXISTING FIXED AREAS

### DO NOT

- Do not redesign AppShell.
- Do not redesign sidebar.
- Do not change existing workspace table style globally.
- Do not change existing form layout.
- Do not change virtual tabs behavior.
- Do not change secondary virtual tabs behavior.
- Do not change Sales/Purchase workflow.
- Do not change bulk void wiring.
- Do not change source conversion workflow.
- Do not change Product History location.
- Do not move Product History to Product Category.
- Do not change backend accounting logic unless endpoint is clearly broken.
- Do not create duplicate Cash Bank report engine.
- Do not create new unrelated endpoints.
- Do not hardcode account IDs or company IDs.
- Do not bypass Authorization Bearer token.
- Do not bypass X-Company-ID.
- Do not add heavy UI libraries.
- Do not run destructive commands.

### PRESERVE

- Existing login flow.
- Existing company selection flow.
- Existing API client.
- Existing permission-aware sidebar.
- Existing workspace shell.
- Existing Cash Bank list/workspace pages.
- Existing report pages.
- Existing virtual tabs.
- Existing design tokens and UI style.

---

## READ FIRST

Read these files before editing:

### Docs

```text
docs/frontend-audit-gap-report.md
docs/update-roadmap.md
docs/phase-16-cash-bank-frontend-mvp.md if exists
docs/phase-11-cash-bank*.md if exists
```

### Backend

```text
backend/routes/api.php
backend/app/Http/Controllers/Api/CashBank/*
backend/app/Services/CashBank/*
backend/config/permissions.php
backend/app/Http/Middleware/EnsurePermission.php
backend/app/Http/Middleware/EnsureCompanyAccess.php
```

### Frontend Vue

```text
frontend-vue/src/router/index.ts
frontend-vue/src/navigation/sidebar.ts
frontend-vue/src/services/api.ts
frontend-vue/src/services/*cash*
frontend-vue/src/pages/cash-bank/*
frontend-vue/src/features/workspace/backend-resource/*
frontend-vue/src/components/workspace/*
frontend-vue/src/stores/workspaceTabsStore.ts
```

Search terms:

```text
account-statement
cash-bank/reports
cash bank report
bank statement
running balance
cash_bank.view
```

---

## BACKEND VERIFICATION

Verify endpoint is active:

```bash
php artisan route:list --path=api | grep cash-bank
```

Expected endpoint:

```text
GET /api/cash-bank/reports/account-statement
```

If endpoint exists, do not change backend.

If endpoint is missing but controller/service exists, register route carefully with:

```text
auth:sanctum
company.access
permission:cash_bank.view or existing cash bank report permission
```

If endpoint does not exist at all, document as follow-up and do not build fake frontend data.

---

## FRONTEND REQUIREMENTS

Create or fix:

```text
frontend-vue/src/services/cash-bank/cashBankReport.service.ts
frontend-vue/src/pages/cash-bank/CashBankAccountStatementPage.vue
```

Use existing folder naming if different. Do not duplicate service/page if already present.

### Page route

Add Vue route if missing:

```text
/cash-bank/account-statement
```

Route must require:

```text
auth
active company
cash_bank.view permission or existing equivalent
```

### Sidebar navigation

Add menu item under Cash Bank:

```text
Account Statement / Mutasi Rekening
```

Permission-aware:

```text
cash_bank.view
```

Use actual permission key from backend config if different.

---

## UI REQUIREMENTS

The page should have:

```text
[ ] Title: Cash Bank Account Statement / Mutasi Rekening Kas Bank
[ ] Account selector
[ ] Date range filter
[ ] Apply filter button
[ ] Reset filter button
[ ] Loading state
[ ] Error state
[ ] Empty state
[ ] Summary cards if backend returns values
[ ] Table of transactions
[ ] Running balance column if backend returns it or can be safely derived from response
```

Suggested columns:

```text
Date
Document No
Description / Memo
Source Type
Debit / Cash In
Credit / Cash Out
Running Balance
Status
```

Do not make the page taller than necessary. Keep table density consistent with existing workspace style.

---

## API PARAMS

Support query params based on backend contract. Verify actual names first.

Likely params:

```text
account_id
start_date
end_date
include_void
```

Do not invent params if backend does not support them.

If backend response is paginated, preserve pagination. If not paginated, render returned rows.

---

## ERROR HANDLING

Handle:

```text
401 unauthenticated
403 forbidden
422 validation error
404 endpoint not found
network error
```

Show meaningful message. Do not crash page.

---

## ACCEPTANCE CRITERIA

```text
[ ] Route /cash-bank/account-statement exists.
[ ] Sidebar Cash Bank contains Account Statement menu.
[ ] Menu appears only for permitted users.
[ ] Page calls GET /api/cash-bank/reports/account-statement.
[ ] Bearer token is sent.
[ ] X-Company-ID is sent.
[ ] Account selector works or displays clear message if account list endpoint is unavailable.
[ ] Date range filter works.
[ ] Statement table renders backend data.
[ ] Running balance displays if available.
[ ] Loading/error/empty states work.
[ ] Existing Cash Bank pages still work.
[ ] Existing virtual tabs still work.
[ ] Existing workspace design is not broken.
```

---

## TESTING

Backend:

```bash
php artisan route:list --path=api
php artisan test --filter=CashBank
```

Frontend from `frontend-vue`:

```bash
npm run typecheck
npm run lint
npm run build
```

If a command is unavailable, report the exact error.

---

## DOCUMENTATION

Create or update:

```text
docs/point-6-cash-bank-account-statement.md
```

Include:

```text
endpoint used
frontend route
sidebar menu
permission key
filter params
manual QA checklist
known limitations
```

Update `docs/frontend-audit-gap-report.md` with a short note that Cash Bank Account Statement gap is fixed or partially fixed.

---

## FINAL SUMMARY REQUIRED

Report:

```text
1. Backend endpoint status.
2. Frontend service created/updated.
3. Frontend route created/updated.
4. Sidebar menu added/updated.
5. Page behavior.
6. Files changed.
7. Commands run and result.
8. Regression checklist.
9. Known limitations/follow-up.
```

---

## COMMIT AND PUSH REQUIRED

After checks:

```bash
git status --short
git add <relevant files only>
git commit -m "add cash bank account statement page"
git push origin main
```

If current branch is not main:

```bash
git push origin HEAD
```

Final response must include commit hash and push result.
