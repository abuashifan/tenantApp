# Prompt Codex — Point 4: Fiscal Closing + Period Locking Workspace

```text
TASK TITLE:
Build Fiscal Closing + Period Locking Workspace for Vue Frontend

PROJECT:
TenantAppDevelopment / tenantApp

FOCUS POINT:
Point 4 — Buat Fiscal Closing + Period Locking workspace

MAIN GOAL:
Buat workspace operasional di frontend Vue untuk Fiscal Closing dan Period Locking yang terhubung ke backend API existing.

Task ini fokus pada:
1. Membuat/memperbaiki halaman Fiscal Closing workspace di Vue.
2. Menampilkan status fiscal year aktif.
3. Menampilkan closing preview.
4. Menampilkan closing checklist / warning / blocking error.
5. Menjalankan close fiscal year jika valid.
6. Menjalankan reopen fiscal year dengan reason jika user punya permission.
7. Menampilkan period lock status.
8. Mengubah period lock jika user punya permission.
9. Menjaga semua behavior tenant-aware, permission-aware, dan tidak merusak fitur lain.

IMPORTANT CONTEXT:
Backend Phase 8 sudah memiliki financial statements, fiscal closing, dan period locking foundation.
Frontend audit menunjukkan fiscal closing dan period locking UI belum lengkap / belum menjadi workspace operasional yang jelas.

This task is Point 4 only.
Do not work on:
- Point 5 AR/AP ledger detail pages
- Point 6 Cash Bank Account Statement
- Point 7 Dashboard API real data
- Point 8 Generic pagination/filter/sort hardening
- Point 9 Company settings edit surface
- Point 10 API interceptor cleanup
- Sales/Purchase source conversion
- Bulk void wiring
- Phase 18 Access API/navigation

====================================================================
STRICT GUARDRAILS — DO NOT BREAK EXISTING FIXED AREAS
====================================================================

DO NOT:
- Do not redesign the whole app.
- Do not change AppShell layout.
- Do not change sidebar visual design.
- Do not change primary virtual tabs behavior.
- Do not change secondary virtual tabs behavior.
- Do not change workspace table design globally.
- Do not change transaction form layout.
- Do not change Sales/Purchase/Cash Bank/Inventory business logic.
- Do not change journal posting logic unless required only to respect existing period lock read state.
- Do not change source conversion workflow.
- Do not change bulk void workflow.
- Do not change Product History location.
- Do not move Product History back to Product Category.
- Do not create public tenant/company endpoints.
- Do not expose tenant generator to client users.
- Do not bypass permission middleware.
- Do not bypass period lock backend validation.
- Do not make frontend manually change fiscal status without backend API.
- Do not hardcode fiscal year ID, company ID, tenant ID, or user ID.
- Do not add heavy UI libraries.
- Do not run destructive commands.
- Do not run migrate:fresh.
- Do not run seeders that overwrite tenant data.

PRESERVE:
- Existing login flow.
- Existing company selection flow.
- Existing API client behavior.
- Existing Authorization Bearer token behavior.
- Existing X-Company-ID behavior.
- Existing permission-aware sidebar behavior.
- Existing workspace/virtual tab behavior.
- Existing master data pages.
- Existing journal pages.
- Existing reports pages.
- Existing Sales/Purchase/Cash Bank/Inventory pages.
- Existing Product History under Products.
- Existing design tokens and UI density.

REGRESSION CHECK REQUIRED:
After implementation, verify:
- Login still works.
- Company selection still works.
- API requests still include Authorization Bearer token.
- API requests still include X-Company-ID.
- Dashboard still opens.
- Master Data pages still open.
- Journal pages still open.
- Report pages still open.
- Sales/Purchase/Cash Bank/Inventory menus still open.
- Virtual tabs still work.
- Secondary virtual tabs still work.
- Product History remains under Products.
- Product Category does not contain Product History.

====================================================================
READ FIRST
====================================================================

Before editing, read these files:

Docs:
- docs/frontend-audit-gap-report.md
- docs/update-roadmap.md
- docs/phase-8-financial-statements-basic.md if exists
- docs/phase-8d-financial-statement-integration.md if exists
- docs/phase-8e-fiscal-closing-foundation.md if exists
- docs/phase-8f-closing-wizard-period-locking.md if exists
- docs/fiscal-year*.md if exists
- .copilot/project-context.md if exists
- project-plan.md if exists

Backend:
- backend/routes/api.php
- backend/config/permissions.php
- backend/app/Http/Controllers/Api/Accounting/FiscalYearStatusController.php if exists
- backend/app/Http/Controllers/Api/Accounting/FiscalYearClosingController.php if exists
- backend/app/Http/Controllers/Api/Accounting/PeriodLockController.php if exists
- backend/app/Services/Accounting/FiscalYearClosingService.php if exists
- backend/app/Services/Transactions/TransactionDateGuardService.php
- backend/app/Services/Audit/AuditLogService.php
- backend/app/Services/Reports/*
- backend/app/Services/Journal/*
- backend/app/Models/Tenant/*Fiscal*
- backend/app/Models/Tenant/*AccountingPeriod*
- backend/app/Models/Tenant/*Closing*

Frontend Vue:
- frontend-vue/src/router/index.ts
- frontend-vue/src/navigation/sidebar.ts
- frontend-vue/src/services/api.ts
- frontend-vue/src/services/*
- frontend-vue/src/pages/accounting/*
- frontend-vue/src/pages/reports/*
- frontend-vue/src/features/workspace/backend-resource/*
- frontend-vue/src/components/workspace/*
- frontend-vue/src/stores/permissions.store.ts
- frontend-vue/src/stores/company.store.ts
- frontend-vue/src/stores/workspaceTabsStore.ts
- frontend-vue/src/workspace/registry.ts if route/workspace registry is used

Search terms:
- fiscal-year
- fiscal years
- fiscal closing
- closing-preview
- closing-checklist
- close
- reopen
- period-locks
- lock_until
- accounting/fiscal-year/status
- accounting/period-locks/status
- retained earnings
- trial balance balanced
- can_close
- warnings
- errors

====================================================================
BACKEND API EXPECTATION
====================================================================

First verify actual backend routes.
Do not invent endpoint paths if they already exist.
Use actual route names/methods from `php artisan route:list --path=api`.

Expected possible endpoints:

Fiscal Year Status:
- GET /api/accounting/fiscal-year/status

Fiscal Closing:
- GET /api/accounting/fiscal-years/{id}/closing-preview
- GET /api/accounting/fiscal-years/{id}/closing-checklist
- POST /api/accounting/fiscal-years/{id}/close
- POST /api/accounting/fiscal-years/{id}/reopen

Period Locking:
- GET /api/accounting/period-locks/status
- PATCH /api/accounting/period-locks

If actual endpoint names differ, use actual backend endpoints.

If a needed backend route/service already exists:
- use it.
- do not duplicate.

If backend controller/service exists but route missing:
- register route with correct middleware.

If backend feature is incomplete:
- implement minimal safe backend integration only if required for the workspace to function.
- do not redesign closing engine.

====================================================================
BACKEND REQUIREMENTS
====================================================================

Backend must ensure:

1. All accounting closing/locking endpoints require:
- auth:sanctum
- company.access
- correct permission middleware

2. Fiscal closing endpoints must be tenant-aware.
They must operate only on active company tenant database.

3. Closing preview must not mutate data.
It only reads and returns preview.

4. Closing checklist must return:
- can_close: boolean
- errors: array
- warnings: array
- checks: array

Recommended check object:
{
  "key": "trial_balance_balanced",
  "status": "passed|warning|failed",
  "message": "Trial balance is balanced"
}

5. Close fiscal year must:
- require permission,
- require preview/checklist validation,
- block if can_close is false,
- block if trial balance is not balanced,
- block if required retained earnings account is missing,
- block if period already closed,
- be transactional,
- write audit log,
- respect existing FiscalYearClosingService behavior.

6. Reopen fiscal year must:
- require permission,
- require reason,
- be transactional,
- write audit log,
- not delete historical closing data,
- follow existing reopen policy.

7. Period lock status must:
- show current fiscal year status,
- show locked periods or lock_until date,
- show whether mutation is currently blocked,
- remain read-only for users without lock manage permission.

8. Period lock update must:
- require permission,
- require valid lock_until/date fields according to existing backend request,
- write audit log,
- not block historical report reading,
- only block mutation transaction input.

9. Do not bypass TransactionDateGuardService.
Transaction mutation protection must remain backend-controlled.

====================================================================
PERMISSIONS
====================================================================

Use existing permission names from `backend/config/permissions.php`.

If missing, add minimal permissions according to existing naming style:

Recommended:
- fiscal_year.view
- fiscal_year.closing_wizard
- fiscal_year.close
- fiscal_year.reopen
- fiscal_year.lock_manage
- accounting.period_locks.view
- accounting.period_locks.manage

If existing permissions use different names, use existing ones.
Do not rename old permissions.
Do not break existing role permission mapping.

Default access:
- owner/admin should have full access if project has default permission mapping.
- accountant/finance may view/operate according to existing policy.
- regular staff should not manage closing/locks unless permission exists.

Frontend must hide/disable actions according to permissions.
Backend must enforce permissions regardless of frontend.

====================================================================
FRONTEND WORKSPACE REQUIREMENTS
====================================================================

Create or fix a Vue workspace/page for Fiscal Closing + Period Locking.

Recommended route:
- /accounting/fiscal-closing

Alternative route is acceptable if existing route already exists.
Use existing route/navigation convention.

Recommended page/components:
- FiscalClosingWorkspace.vue
- ClosingStatusCard.vue
- ClosingChecklistPanel.vue
- ClosingPreviewPanel.vue
- PeriodLockPanel.vue
- ClosingActionPanel.vue
- ReopenFiscalYearDialog.vue

If project prefers a single page first, minimal split is acceptable.
Do not over-engineer.

Frontend workspace must show:

1. Current fiscal year status
- fiscal year name/code
- start date
- end date
- status open/closed
- closed_at if closed
- closed_by if provided

2. Closing checklist
- list checks
- status badge passed/warning/failed
- can_close true/false
- blocking errors
- warnings

3. Closing preview
- retained earnings preview if provided
- net profit/loss if provided
- trial balance balanced status if provided
- report consistency summary if provided
- any backend preview fields shown in readable cards/table

4. Period lock status
- lock_until date if provided
- current lock state
- explanation: transaction mutations blocked / reports remain readable
- user permission state

5. Actions
- Refresh status
- Generate preview / reload preview
- Close fiscal year
- Reopen fiscal year
- Update period lock

6. Dialogs/forms
Close fiscal year:
- show confirmation.
- show checklist result.
- block close button if can_close false.
- require confirmation text if existing UX pattern supports it.

Reopen fiscal year:
- require reason.
- show warning.
- call backend reopen endpoint.

Update period lock:
- date input for lock_until or fields required by backend.
- confirmation.
- clear validation errors.

====================================================================
FRONTEND API SERVICE
====================================================================

Create or update service:
- frontend-vue/src/services/accounting/fiscalClosing.service.ts
or use existing service folder convention.

Service methods should include:
- getFiscalYearStatus()
- getClosingPreview(fiscalYearId)
- getClosingChecklist(fiscalYearId)
- closeFiscalYear(fiscalYearId, payload?)
- reopenFiscalYear(fiscalYearId, payload)
- getPeriodLockStatus()
- updatePeriodLock(payload)

Use existing API client.
Do not hardcode `/api` twice.
Do not bypass interceptors.
Bearer token and X-Company-ID must be sent automatically by existing API client.

====================================================================
FRONTEND NAVIGATION
====================================================================

Add or fix sidebar/navigation item only if route exists.

Recommended menu location:
Accounting → Fiscal Closing
or
Accounting → Closing & Period Locking

Permission-aware menu:
- visible if user has fiscal_year.view or fiscal_year.closing_wizard or equivalent.

Do not add fake menu item to missing route.
Do not remove existing accounting/report menu items.

====================================================================
WORKSPACE / VIRTUAL TABS INTEGRATION
====================================================================

The page must work inside existing AppShell/workspace behavior.

Rules:
- Do not create a new shell.
- Do not bypass virtual tabs if existing route system handles it.
- Do not break current primary/secondary tabs.
- If page is a workspace route, register it in workspace registry according to existing pattern.
- Closing workspace should behave like a normal work page, not a modal-only hidden feature.

====================================================================
ERROR HANDLING
====================================================================

Handle:
- 401 unauthenticated
- 403 forbidden
- 422 validation error
- 409 conflict if backend uses it for closing/lock conflicts
- 404 fiscal year not found
- 500 backend error
- network error

Messages must be clear:
- Period is locked.
- Fiscal year already closed.
- Fiscal year cannot be closed because checklist failed.
- Trial balance is not balanced.
- Retained earnings account is not configured.
- Reopen reason is required.
- You do not have permission.

Do not show only generic "Failed".

====================================================================
TESTING REQUIREMENTS
====================================================================

Backend tests if missing or if routes are changed:
- closing status endpoint requires auth/company access.
- closing preview returns data and does not mutate.
- closing checklist returns can_close/checks/errors/warnings.
- close blocks if checklist fails.
- close blocks locked/closed invalid state.
- close writes audit log.
- reopen requires reason.
- reopen writes audit log.
- period lock status works.
- period lock update requires permission.
- period lock blocks transaction mutation through existing guard if existing tests cover this.

Frontend tests if setup exists:
- fiscal closing page loads.
- status service called.
- checklist rendered.
- close button disabled when can_close false.
- reopen dialog requires reason.
- period lock update calls service.
- permission controls action visibility.

If frontend tests are not set up:
- add manual QA checklist in docs.

====================================================================
DOCUMENTATION
====================================================================

Create or update:
- docs/point-4-fiscal-closing-period-locking-workspace.md

Content:
- purpose
- backend endpoints used
- frontend route/page
- permission keys
- close fiscal year workflow
- reopen workflow
- period lock workflow
- transaction mutation lock behavior
- reports remain readable rule
- manual QA checklist
- known limitations/follow-up

Also update:
- docs/frontend-audit-gap-report.md

Add note under Fiscal Closing / Period Locking gap:
- fixed or partially fixed
- route/page/service added
- remaining limitations if any

====================================================================
ACCEPTANCE CRITERIA
====================================================================

Backend:
- [ ] Fiscal year status endpoint verified/working.
- [ ] Closing preview endpoint verified/working.
- [ ] Closing checklist endpoint verified/working.
- [ ] Close fiscal year endpoint verified/working.
- [ ] Reopen fiscal year endpoint verified/working if backend supports it.
- [ ] Period lock status endpoint verified/working.
- [ ] Period lock update endpoint verified/working.
- [ ] All endpoints require auth and company access.
- [ ] Permission middleware enforced.
- [ ] Closing/reopen/lock mutations write audit log if existing audit service supports it.

Frontend:
- [ ] Fiscal Closing workspace route exists.
- [ ] Sidebar navigation points to existing route.
- [ ] Page loads current fiscal year status.
- [ ] Page loads closing checklist.
- [ ] Page loads closing preview.
- [ ] Page displays warnings/errors clearly.
- [ ] Close action calls backend and refreshes status.
- [ ] Reopen action requires reason and calls backend.
- [ ] Period lock status is displayed.
- [ ] Period lock update calls backend.
- [ ] Actions are permission-aware.
- [ ] API client still sends Bearer token.
- [ ] API client still sends X-Company-ID.
- [ ] 401/403/422 errors are handled.
- [ ] Existing workspace/virtual tabs are not broken.

Regression:
- [ ] Login works.
- [ ] Company selection works.
- [ ] Dashboard opens.
- [ ] Master Data opens.
- [ ] Journal pages open.
- [ ] Reports pages open.
- [ ] Sales/Purchase/Cash Bank/Inventory menus still open.
- [ ] Product History remains under Products.
- [ ] No unrelated design changes.

====================================================================
COMMANDS TO RUN
====================================================================

Before changes:
- git status --short

Backend:
- php artisan route:list --path=api
- php artisan test --filter=Fiscal
- php artisan test --filter=Closing
- php artisan test --filter=PeriodLock
- php artisan test

Frontend:
From `frontend-vue`:
- npm run typecheck if available
- npm run lint
- npm run build

If command fails due to environment/dependency issue:
- do not fake success.
- report exact error.

DO NOT RUN:
- php artisan migrate:fresh
- destructive seeders
- commands that wipe tenant database
- npm audit fix
- global prettier write
- global eslint fix

====================================================================
FINAL SUMMARY REQUIRED
====================================================================

At the end, report:

1. Root cause found for Fiscal Closing / Period Locking gap.
2. Backend endpoints verified/fixed.
3. Backend files changed.
4. Frontend services added/fixed.
5. Frontend routes added/fixed.
6. Sidebar/navigation changes.
7. Workspace/page/components added/fixed.
8. Permission keys used/added.
9. Closing preview/checklist status.
10. Close/reopen workflow status.
11. Period lock workflow status.
12. Tests added/updated.
13. Commands run and results.
14. Regression checklist result.
15. Known limitations/follow-up.
16. Changed files summary.

====================================================================
COMMIT AND PUSH REQUIRED
====================================================================

After implementation and checks:

1. Run:
   git status --short

2. Review changed files.
   Make sure only relevant Point 4 / Fiscal Closing + Period Locking files are changed.

3. Commit:
   git add <relevant files only>
   git commit -m "add fiscal closing period locking workspace"

4. Push to remote:
   git push origin main

If current branch is not main:
- push current branch:
  git push origin HEAD

If push fails:
- do not retry blindly.
- report exact error.
- include whether commit was created successfully.

Final response must include:
- commit hash,
- branch pushed,
- remote push result,
- changed files summary,
- commands executed,
- tests/build result.
```
