# Point 9 — Lengkapi Company Settings Edit Surface

## TASK TITLE
Complete Company Settings Edit Surface

## PROJECT
TenantAppDevelopment / tenantApp

## FOCUS POINT
Point 9 — Lengkapi company settings edit surface

## MAIN GOAL
Lengkapi halaman frontend Vue untuk melihat dan mengubah company settings yang sudah tersedia di backend.

Audit menemukan endpoint settings ada:

```text
GET /api/settings/company
PATCH /api/settings/company/accounting
PATCH /api/settings/company/modules
```

Tetapi Vue belum menyediakan edit surface operasional lengkap.

Task ini fokus pada membuat halaman settings yang usable untuk accounting settings dan module settings tanpa mengubah desain global atau kontrak backend.

---

## STRICT GUARDRAILS — DO NOT BREAK EXISTING FIXED AREAS

### DO NOT

- Do not create public company creation endpoint.
- Do not allow client user to create tenant/company.
- Do not change tenant architecture.
- Do not redesign full settings area.
- Do not change AppShell/sidebar globally.
- Do not change auth/company selection flow.
- Do not change transaction modules.
- Do not change accounting calculation services.
- Do not change Product History location.
- Do not hardcode company IDs.
- Do not bypass permission middleware.
- Do not change backend contract unless endpoint response mismatch is clearly broken.
- Do not add unrelated admin features.
- Do not run destructive commands.

### PRESERVE

- Existing company access rules.
- Existing active company flow.
- Existing settings permissions.
- Existing frontend design style.
- Existing API client behavior.
- Existing workspace shell/virtual tabs.

---

## READ FIRST

### Docs

```text
docs/frontend-audit-gap-report.md
docs/update-roadmap.md
docs/phase-4*.md if exists
docs/company-settings*.md if exists
```

### Backend

```text
backend/routes/api.php
backend/app/Http/Controllers/Api/Settings/*
backend/app/Services/Settings/*
backend/config/permissions.php
backend/app/Http/Middleware/EnsurePermission.php
backend/app/Http/Middleware/EnsureCompanyAccess.php
```

### Frontend Vue

```text
frontend-vue/src/router/index.ts
frontend-vue/src/navigation/sidebar.ts
frontend-vue/src/services/api.ts
frontend-vue/src/services/*settings*
frontend-vue/src/pages/settings/*
frontend-vue/src/components/form/*
frontend-vue/src/components/ui/*
frontend-vue/src/stores/company.store.ts
```

Search terms:

```text
settings/company
company settings
accounting settings
module settings
settings.company
```

---

## BACKEND ENDPOINT VERIFICATION

Verify:

```text
GET /api/settings/company
PATCH /api/settings/company/accounting
PATCH /api/settings/company/modules
```

All must be protected by:

```text
auth:sanctum
company.access
permission middleware
```

Do not change backend unless route/middleware is missing or clearly broken.

---

## FRONTEND REQUIREMENTS

Create or update service:

```text
frontend-vue/src/services/settings/companySettings.service.ts
```

Create or update page:

```text
frontend-vue/src/pages/settings/CompanySettingsPage.vue
```

Use existing naming if different.

Route:

```text
/settings/company
```

Sidebar/menu:

```text
Settings → Company Settings
```

Permission-aware:

```text
settings.company.view
settings.company.edit
```

Use actual backend permission keys if different.

---

## PAGE SECTIONS

### 1. Company Info Read-only Section

Show basic company info from GET endpoint if available:

```text
company name
timezone
currency
status
active modules summary
```

Do not add company creation/edit unless backend endpoint supports it.

### 2. Accounting Settings Form

PATCH endpoint:

```text
PATCH /api/settings/company/accounting
```

Fields depend on backend response. Do not invent unsupported fields.

Possible fields if present:

```text
fiscal_year_start_month
default_currency
allow_backdated_transactions
require_journal_approval
allow_negative_cash
allow_negative_inventory
posting_policy
closing_policy
```

Render only fields returned/supported by backend.

### 3. Module Settings Form

PATCH endpoint:

```text
PATCH /api/settings/company/modules
```

Possible toggles:

```text
accounting
sales
purchase
cash_bank
inventory
reports
```

Use backend-supported keys only.

### 4. Save Behavior

```text
[ ] Separate save for accounting settings.
[ ] Separate save for module settings.
[ ] Show loading state per section.
[ ] Show success notification.
[ ] Show 422 validation errors.
[ ] Show 403 permission denied clearly.
[ ] Refresh settings after save.
```

---

## UI REQUIREMENTS

Keep design consistent:

```text
[ ] Clean card layout.
[ ] No large redesign.
[ ] Labels clear in Indonesian/English consistent with existing app.
[ ] Loading state.
[ ] Error state.
[ ] Empty/missing settings state.
[ ] Permission-aware edit buttons.
```

If user has view but not edit:

```text
show read-only settings
hide or disable save buttons
```

---

## ACCEPTANCE CRITERIA

```text
[ ] /settings/company route exists.
[ ] Sidebar Settings → Company Settings points to real route.
[ ] Page loads GET /api/settings/company.
[ ] Accounting settings can be saved using PATCH /accounting.
[ ] Module settings can be saved using PATCH /modules.
[ ] Bearer token is sent.
[ ] X-Company-ID is sent.
[ ] Permission-aware view/edit behavior works.
[ ] 422 validation errors show properly.
[ ] 403 permission error shows properly.
[ ] No create tenant/company UI is added.
[ ] Existing company switch still works.
```

---

## TESTING

Backend:

```bash
php artisan route:list --path=api
php artisan test --filter=CompanySetting
php artisan test --filter=Settings
```

Frontend:

```bash
cd frontend-vue
npm run typecheck
npm run lint
npm run build
```

Manual QA:

```text
[ ] Open /settings/company with permitted user.
[ ] Settings load.
[ ] Save accounting settings.
[ ] Save module settings.
[ ] Reload and confirm values persist.
[ ] Try with unauthorized user and confirm 403/read-only.
[ ] Confirm no create company/tenant appears.
```

---

## DOCUMENTATION

Create/update:

```text
docs/point-9-company-settings-edit-surface.md
```

Update `docs/frontend-audit-gap-report.md` with point 9 status.

---

## FINAL SUMMARY REQUIRED

Report:

```text
1. Endpoint status.
2. Service/page created or updated.
3. Fields supported.
4. Permissions used.
5. Validation/error handling.
6. Files changed.
7. Commands run and result.
8. Regression checklist.
```

---

## COMMIT AND PUSH REQUIRED

```bash
git status --short
git add <relevant files only>
git commit -m "complete company settings edit surface"
git push origin main
```

If current branch is not main:

```bash
git push origin HEAD
```

Final response must include commit hash and push result.
