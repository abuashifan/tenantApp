TASK TITLE:
Fix Point 8 — Configure Remote Pagination, Filter, and Sort for Generic Backend Workspaces

PROJECT:
TenantAppDevelopment / tenantApp

FOCUS POINT:
Point 8 — Harden generic workspace pagination/filter/sort

PRIMARY GOAL:
Selesaikan gap audit Point 8.

Audit terbaru menyatakan:

- `BackendResourceWorkspace.vue` sudah punya kemampuan mengirim remote query params.
- `backendResource.service.ts` sudah bisa membaca metadata pagination dari beberapa bentuk response.
- Namun `resourceCapability()` masih default `paginationMode: 'local'`.
- Tidak ada resource yang terverifikasi mengaktifkan `paginationMode: 'remote'`.
- Akibatnya banyak generic workspace masih mengambil dataset lalu filter/sort/paginate di frontend.
- Ini berisiko lambat dan tidak akurat ketika dataset besar atau backend sudah paginated.

Tugas ini:

1. Audit generic backend workspace resources.
2. Petakan endpoint list mana yang sudah mendukung pagination/filter/sort remote.
3. Aktifkan remote mode pada resource yang aman dan didukung backend.
4. Pastikan query param mapping cocok dengan backend Laravel.
5. Pastikan pagination metadata dibaca benar.
6. Pastikan fallback local tetap aman untuk resource yang belum mendukung remote.
7. Tambahkan test atau minimal manual QA checklist.
8. Update dokumentasi dan audit report.

IMPORTANT:
Jangan mengubah desain workspace.
Jangan refactor besar.
Jangan mengubah kontrak backend tanpa alasan kuat.
Prioritas: konfigurasi remote capability map + validasi query param.

====================================================================
STRICT GUARDRAILS — DO NOT BREAK EXISTING FIXED AREAS
====================================================================

DO NOT:

- Do not redesign workspace.
- Do not change workspace visual style.
- Do not change table density/style.
- Do not change form layout.
- Do not change virtual tabs behavior.
- Do not change secondary virtual tabs behavior.
- Do not change AppShell.
- Do not change sidebar design.
- Do not change auth flow.
- Do not change company selection flow.
- Do not remove Authorization Bearer handling.
- Do not remove X-Company-ID handling.
- Do not change API response shape globally unless needed and backward compatible.
- Do not rewrite all workspace components.
- Do not remove local fallback mode.
- Do not force remote mode for endpoints that do not support it.
- Do not change Sales/Purchase source conversion in this task.
- Do not change bulk void/lifecycle action logic in this task.
- Do not change Fiscal Closing, AR/AP Ledger, Cash Bank Statement, Dashboard, Company Settings, or Access Management unless directly impacted by compile errors.
- Do not move Product History.
- Do not put Product History under Product Category.
- Do not hardcode company ID or tenant ID.
- Do not run destructive database commands.
- Do not run migrate:fresh.
- Do not run seeders that overwrite data.

PRESERVE:

- Existing working pages from points 3–7 and 9–10.
- Existing master data workspace behavior.
- Existing transaction workspace behavior.
- Existing generic backend resource fallback behavior.
- Existing loading/error/empty states.
- Existing bulk selection behavior.
- Existing selected rows clearing when filter/page/sort changes.
- Existing API error normalization from point 10.
- Existing build success.

REGRESSION CHECK REQUIRED:
After implementation, verify:

- Login still works.
- Company selection still works.
- X-Company-ID still sent.
- Master Data pages still open.
- Journal pages still open.
- Sales/Purchase/Cash Bank/Inventory pages still open.
- Fiscal Closing page still opens.
- AR/AP ledger pages still open.
- Cash Bank Account Statement still opens.
- Dashboard still opens.
- Company Settings still opens.
- Access Management still opens.
- Product History remains under Products.
- Generic workspace local fallback still works for unsupported endpoints.
- `npm run build` still passes.

====================================================================
READ FIRST
====================================================================

Before editing, read:

Audit report:

- docs/post-implementation-audit-check.md
- docs/frontend-audit-gap-report.md

Frontend Vue workspace:

- frontend-vue/src/features/workspace/backend-resource/BackendResourceWorkspace.vue
- frontend-vue/src/features/workspace/backend-resource/backendResource.service.ts
- frontend-vue/src/features/workspace/backend-resource/backendResource.config.ts
- frontend-vue/src/features/workspace/backend-resource/backendResource.form.config.ts
- frontend-vue/src/features/workspace/backend-resource/\*
- frontend-vue/src/components/workspace/WorkspaceModule.vue
- frontend-vue/src/components/workspace/\*
- frontend-vue/src/composables/useWorkspaceList.ts if used
- frontend-vue/src/workspace/registry.ts
- frontend-vue/src/navigation/sidebar.ts
- frontend-vue/src/services/api.ts
- frontend-vue/src/types/api.ts

Backend route/controllers for list endpoints:

- backend/routes/api.php
- backend/app/Http/Controllers/Api/MasterData/\*
- backend/app/Http/Controllers/Api/Sales/\*
- backend/app/Http/Controllers/Api/Purchase/\*
- backend/app/Http/Controllers/Api/CashBank/\*
- backend/app/Http/Controllers/Api/Inventory/\*
- backend/app/Http/Controllers/Api/Access/\*
- backend/app/Http/Controllers/Api/Settings/\*
- backend/app/Http/Controllers/Api/Reports/\* if generic reports are listed through workspace

Search terms:

- resourceCapability
- paginationMode
- filterMode
- sortMode
- effectiveRemote
- page
- per_page
- search
- status
- include_void
- sort_by
- sort_direction
- current_page
- last_page
- total
- from
- to
- meta
- pagination
- BackendResourceWorkspace
- backendResource.service
- useWorkspaceList

====================================================================
CURRENT AUDIT FINDINGS TO FIX
====================================================================

Audit finding:

1. `BackendResourceWorkspace.vue` can send remote query params:

- page
- per_page
- search
- status
- start_date
- end_date
- include_void
- sort_by
- sort_direction

2. `backendResource.service.ts` can extract pagination metadata from:

- top-level response
- `meta`
- `pagination`
- nested `data`
- nested metadata structures

3. But:

- `resourceCapability()` defaults `paginationMode: 'local'`
- no checked capability entry currently sets `paginationMode: 'remote'`
- many generic workspaces may still fetch full datasets and filter locally

4. Also:

- `useWorkspaceList.ts` has a helper with page/per_page/sort params,
- but one endpoint branch builds params manually and may not include page/per_page/sort,
- verify whether this path is still used and fix if relevant.

====================================================================
IMPLEMENTATION STRATEGY
====================================================================

Implement in a safe, incremental way:

1. Keep local fallback default.
2. Add explicit capability configuration for resources that backend supports.
3. Do not enable remote mode blindly for all resources.
4. Verify each enabled resource endpoint accepts the query params.
5. If backend endpoint ignores unsupported params safely, remote mode is acceptable only if response is paginated or list is limited.
6. If backend endpoint does not support pagination metadata, keep local mode and document follow-up.

Recommended capability structure:

type ResourceCapability = {
paginationMode: 'local' | 'remote'
filterMode: 'local' | 'remote'
sortMode: 'local' | 'remote'
searchParam?: string
pageParam?: string
perPageParam?: string
sortByParam?: string
sortDirectionParam?: string
statusParam?: string
dateFromParam?: string
dateToParam?: string
includeVoidParam?: string
supportedFilters?: string[]
}

Use existing type if already exists.
Do not duplicate types if they already exist.

====================================================================
PHASE 1 — AUDIT RESOURCE CAPABILITY MAP
====================================================================

List all generic backend resource keys from:

- backendResource.config.ts
- backendResource.form.config.ts
- workspace registry
- sidebar navigation fallback routes

For each resource, identify:

- resource key
- module
- list endpoint
- current capability mode
- backend controller index/list method
- pagination support
- search support
- status filter support
- date filter support
- include_void support
- sorting support
- response metadata shape

Classify each resource as:

A. Remote Ready
Backend supports pagination metadata and query filters/sort.

B. Remote Partial
Backend supports page/per_page and maybe search, but not all filters/sort.

C. Local Only
Backend does not support pagination/filter/sort or response has no metadata.

D. Needs Verification
Could not confirm from code.

Create internal table in final summary.

====================================================================
PHASE 2 — ENABLE REMOTE MODE FOR SAFE RESOURCES
====================================================================

Enable remote capability for resources whose backend list endpoint is safely remote-ready.

Likely candidate groups to check:

- master-data contacts
- master-data units
- master-data product-categories
- master-data products
- master-data warehouses
- master-data departments
- master-data projects
- account mappings if list supports pagination
- sales quotations/orders/delivery-orders/proformas/invoices/billings/receipts/deposits/returns
- purchase requests/orders/goods-receipts/vendor-bills/payments/deposits/returns
- cash receipts/payments/transfers/reconciliations if generic
- inventory stock movements/adjustments/opname if generic
- access users/roles/invitations/audit if using generic workspace

Do not assume. Verify controller/service first.

For each enabled remote resource:

- set paginationMode remote
- set filterMode remote if filters are supported
- set sortMode remote if sorting is supported
- configure param names exactly:
  - page
  - per_page
  - search
  - status
  - start_date / end_date or date_from / date_to according to backend
  - include_void if supported
  - sort_by
  - sort_direction
- configure supported filters only if backend supports them.

If endpoint supports only search but not status:

- enable search remote,
- keep unsupported filters local or hide/disable them if existing pattern allows.

If endpoint supports pagination but not sorting:

- set paginationMode remote,
- filterMode according to support,
- sortMode local or disabled.

====================================================================
PHASE 3 — BACKEND QUERY PARAM COMPATIBILITY
====================================================================

Audit backend index/list methods.

If most endpoints already accept query params:

- align frontend capability to existing backend.

If a high-priority generic endpoint lacks pagination but is expected to handle large data:

- add minimal backend support only if safe and consistent.
- Do not change response shape in a breaking way.
- Prefer returning Laravel paginator response wrapped in existing API format.

Backend list endpoints should ideally support:

- page
- per_page
- search
- status
- start_date
- end_date
- include_void
- sort_by
- sort_direction

But do not force every endpoint to support every filter.

Important:

- Sorting must whitelist allowed columns.
- Never pass arbitrary sort_by directly to query without validation.
- Search must be scoped to safe columns.
- Filters must respect tenant/company access.
- Void/obsolete visibility must respect report visibility rules if applicable.

If backend support is added, add tests for the specific endpoint.

====================================================================
PHASE 4 — PAGINATION METADATA NORMALIZATION
====================================================================

Verify `backendResource.service.ts` correctly returns normalized pagination metadata.

Expected normalized metadata:

- currentPage
- perPage
- total
- lastPage
- from
- to

It must support existing Laravel/API response shapes such as:

Shape A:
{
data: [...],
meta: {
current_page,
per_page,
total,
last_page,
from,
to
}
}

Shape B:
{
data: {
data: [...],
current_page,
per_page,
total,
last_page
}
}

Shape C:
{
data: [...],
pagination: {
page,
per_page,
total,
last_page
}
}

Do not break current response consumers.

If metadata is missing:

- fallback to local metadata,
- do not crash.

====================================================================
PHASE 5 — UI BEHAVIOR
====================================================================

Generic workspace UI must behave correctly in remote mode.

Required behavior:

- Changing page triggers API reload with `page`.
- Changing per page triggers API reload with `per_page` and resets page to 1.
- Changing search triggers API reload and resets page to 1.
- Changing status filter triggers API reload and resets page to 1.
- Changing date filter triggers API reload and resets page to 1.
- Changing include void triggers API reload and resets page to 1.
- Changing sort triggers API reload with `sort_by` and `sort_direction`.
- Selection is cleared when page/filter/sort changes.
- Loading state appears during fetch.
- Error state appears on API failure.
- Empty state appears when remote returns no rows.
- Pagination total uses backend total, not current page length.
- Sorting indicator matches current remote sort.
- Local fallback still works for local resources.

Do not change the look unless needed for a small bug fix.

====================================================================
PHASE 6 — FIX useWorkspaceList.ts IF STILL USED
====================================================================

Audit `useWorkspaceList.ts`.

The audit said:

- it has a requestParams helper with page/per_page/sort,
- but an endpoint branch manually builds params and may omit page/per_page/sort.

If this composable is used by active pages:

- fix it so all API paths include page/per_page/sort/filter params consistently.
- preserve current behavior.
- avoid breaking pages not using backendResource workspace.

If this composable is legacy/unused:

- do not refactor it heavily.
- document it as follow-up if not relevant.

====================================================================
PHASE 7 — TESTING
====================================================================

Frontend tests if available:

- remote page change calls service with page param.
- remote per-page change calls service with per_page param.
- remote search calls service with search param and page 1.
- remote sort calls service with sort_by/sort_direction.
- selection clears after filter/page/sort change.
- local mode still paginates locally.

If frontend test setup is not available:

- add manual QA checklist in docs.

Backend tests if backend list support is added:

- endpoint returns paginated response.
- search filters result.
- status filters result.
- date filters result if applicable.
- sort_by/sort_direction works only for allowed columns.
- invalid sort column rejected or ignored safely.
- tenant isolation preserved.

Commands:

- npm run build
- npm run lint if available
- php artisan test for touched backend endpoint tests if any
- php artisan route:list --path=api if backend touched

====================================================================
PHASE 8 — DOCUMENTATION
====================================================================

Create/update:

docs/generic-workspace-remote-pagination-filter-sort.md

Include:

- problem found from audit
- local vs remote mode explanation
- resource capability table
- enabled remote resources
- local-only resources
- query parameter mapping
- pagination metadata shape
- manual QA checklist
- known limitations/follow-up

Update:

docs/post-implementation-audit-check.md

Add a short update under Point 8:

- remote capability map configured,
- which resources are remote-enabled,
- which remain local/needs verification,
- remaining follow-up if any.

====================================================================
ACCEPTANCE CRITERIA
====================================================================

Point 8 is complete when:

Capability:

- [ ] Resource capability map explicitly marks remote-ready resources.
- [ ] Unsupported resources remain local.
- [ ] Query param names match backend.
- [ ] No endpoint is forced into remote mode without support.

Remote behavior:

- [ ] Page change fetches remote page.
- [ ] Per-page change fetches remote data.
- [ ] Search uses backend search where supported.
- [ ] Status/date/include_void use backend filters where supported.
- [ ] Sorting uses backend sorting where supported.
- [ ] Pagination total comes from backend metadata.
- [ ] Selection clears on page/filter/sort change.
- [ ] Loading/error/empty states still work.

Fallback:

- [ ] Local pagination/filter/sort still works for local resources.
- [ ] No runtime crash if pagination metadata missing.
- [ ] Legacy/unused list composable is not broken.

Regression:

- [ ] Master Data generic pages still work.
- [ ] Sales/Purchase generic pages still work.
- [ ] Cash Bank generic pages still work.
- [ ] Inventory generic pages still work.
- [ ] Access pages still work.
- [ ] Fiscal Closing still works.
- [ ] AR/AP Ledger pages still work.
- [ ] Dashboard still works.
- [ ] Company Settings still works.
- [ ] API interceptor still works.
- [ ] Virtual tabs still work.
- [ ] Product History remains under Products.
- [ ] `npm run build` passes.

====================================================================
COMMANDS TO RUN
====================================================================

Before changes:

- git status --short

Frontend:
From `frontend-vue`:

- npm run build
- npm run lint if available
- npm run typecheck if available

Backend if backend touched:

- php artisan route:list --path=api
- php artisan test --filter=<RelevantTestName>
- php artisan test

If commands fail:

- report exact error.
- do not fake success.

DO NOT RUN:

- php artisan migrate:fresh
- destructive seeders
- npm audit fix
- global eslint --fix
- global prettier --write

====================================================================
FINAL SUMMARY REQUIRED
====================================================================

At the end, report:

1. Root cause of Point 8 partial status.
2. Resource capability map changes.
3. Resources enabled for remote pagination/filter/sort.
4. Resources kept local and why.
5. Query param mapping.
6. Pagination metadata handling changes.
7. `useWorkspaceList.ts` status/fix if applicable.
8. Frontend files changed.
9. Backend files changed if any.
10. Tests added/updated.
11. Commands run and results.
12. Regression checklist result.
13. Remaining limitations/follow-up.

====================================================================
COMMIT AND PUSH REQUIRED
====================================================================

After implementation and checks:

1. Run:
   git status --short

2. Review changed files.
   Make sure only relevant Point 8 files are changed.

3. Commit:
   git add <relevant files only>
   git commit -m "configure remote pagination filter sort for generic workspaces"

4. Push:
   git push origin main

If current branch is not main:

- git push origin HEAD

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
