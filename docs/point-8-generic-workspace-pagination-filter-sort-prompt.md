# Point 8 — Harden Generic Workspace Pagination / Filter / Sort

## TASK TITLE
Harden Generic Workspace Remote Pagination, Filter, and Sort

## PROJECT
TenantAppDevelopment / tenantApp

## FOCUS POINT
Point 8 — Harden generic workspace pagination/filter/sort

## MAIN GOAL
Perbaiki generic backend resource workspace agar pagination, filter, search, dan sorting tidak hanya client-side ketika endpoint backend mendukung query server-side.

Audit menemukan bahwa generic backend workspace mengambil data sekali lalu menyaring client-side. Ini berisiko salah untuk dataset besar atau response paginated.

Task ini harus membuat generic workspace lebih aman untuk data besar dengan tetap menjaga desain dan reusable pattern yang sudah fix.

---

## STRICT GUARDRAILS — DO NOT BREAK EXISTING FIXED AREAS

### DO NOT

- Do not redesign workspace UI.
- Do not replace reusable workspace architecture.
- Do not rewrite all module pages.
- Do not change transaction business logic.
- Do not change backend endpoints unless a minor query param compatibility fix is required.
- Do not break virtual tabs.
- Do not break secondary tabs.
- Do not break bulk selection.
- Do not break existing table design.
- Do not break master data forms.
- Do not change Product History location.
- Do not add heavy table libraries if current one works.
- Do not hardcode module-specific logic inside generic component unless config-driven.
- Do not run destructive commands.

### PRESERVE

- Existing workspace visual style.
- Existing reusable workspace components.
- Existing module configs.
- Existing action buttons.
- Existing search/filter UI where already fixed.
- Existing checkbox bulk select behavior.
- Existing API client contract.

---

## READ FIRST

### Docs

```text
docs/frontend-audit-gap-report.md
docs/Reusable Workspace List Design.txt if exists
docs/update-roadmap.md
```

### Frontend Vue

```text
frontend-vue/src/features/workspace/backend-resource/BackendResourceWorkspace.vue
frontend-vue/src/features/workspace/backend-resource/*
frontend-vue/src/components/workspace/WorkspaceModule.vue
frontend-vue/src/components/workspace/*
frontend-vue/src/services/api.ts
frontend-vue/src/workspace/registry.ts
frontend-vue/src/stores/workspaceTabsStore.ts
```

### Backend

```text
backend/routes/api.php
backend/app/Http/Controllers/Api/MasterData/*
backend/app/Http/Controllers/Api/Sales/*
backend/app/Http/Controllers/Api/Purchase/*
backend/app/Http/Controllers/Api/CashBank/*
backend/app/Http/Controllers/Api/Inventory/*
```

Search terms:

```text
pagination
per_page
page
sort
sort_by
sort_direction
search
filters
client-side
BackendResourceWorkspace
WorkspaceModule
```

---

## PROBLEM TO FIX

Current risk:

```text
Backend returns paginated result, but frontend filters/sorts only current loaded rows.
If dataset has 500 records and frontend loaded first 15, client-side filter may hide valid records from other pages.
```

Expected:

```text
Search/filter/sort/pagination should be sent to backend query params when backend supports them.
Frontend table should reflect backend pagination metadata.
```

---

## IMPLEMENTATION REQUIREMENTS

### 1. Detect backend response shape

Support common response shapes:

```text
{ data: [...] }
{ data: { data: [...], meta: {...}, links: {...} } }
Laravel paginator shape:
{ data: { current_page, data, total, per_page, last_page } }
```

Do not assume only one format.

### 2. Add remote query state to generic workspace

Generic workspace must maintain:

```text
page
perPage
search
sortBy
sortDirection
filters
status filters
date range filters
include void toggle if configured
```

### 3. Send query params to API

Use config-driven param names if needed.

Default query params:

```text
page
per_page
search
sort_by
sort_direction
status
start_date
end_date
include_void
```

If a module config defines different names, use config.

### 4. Preserve local fallback

If endpoint is not paginated or does not support remote filters:

```text
[ ] still render data
[ ] optionally use local filtering as fallback
[ ] mark in code/config as local mode
```

But default for backend resource workspace should be remote-safe if endpoint supports it.

### 5. Debounce search

Search should be debounced to avoid too many requests.
Use existing debounce composable if available.
Do not add new dependency just for debounce.

### 6. Reset page on filter/search change

When search/filter/date/status changes:

```text
page = 1
fetch again
```

### 7. Sorting

Click column sort should:

```text
set sort_by
set sort_direction
fetch again
```

If column is not sortable, do not send sort param.

### 8. Pagination UI

Use existing pagination UI if available.
Must support:

```text
current page
total items if available
last page if available
per page
next/previous
```

### 9. Selection handling

When page/filter changes:

```text
[ ] clear selection by default unless current workspace intentionally persists selection
[ ] header checkbox must reflect visible rows correctly
[ ] selected count must match selected row IDs
```

Do not break fixed bulk select behavior.

---

## CONFIG-DRIVEN REQUIREMENT

Avoid module-specific if/else in generic component.

Extend backend resource config if needed:

```ts
paginationMode: 'remote' | 'local' | 'none'
queryParamMap?: {
  page?: string
  perPage?: string
  search?: string
  sortBy?: string
  sortDirection?: string
  status?: string
  startDate?: string
  endDate?: string
}
remoteFilters?: boolean
remoteSort?: boolean
remoteSearch?: boolean
```

Use existing TypeScript style.

---

## ACCEPTANCE CRITERIA

```text
[ ] Generic workspace sends page/per_page to backend when remote mode is enabled.
[ ] Search sends query param to backend and resets page.
[ ] Status/date filters send query params to backend and reset page.
[ ] Sorting sends sort params to backend.
[ ] Pagination metadata from backend is rendered correctly.
[ ] Local fallback still works for non-paginated endpoints.
[ ] Bulk selection remains accurate after page/filter changes.
[ ] Header checkbox selects visible/current page rows correctly.
[ ] Existing workspace design remains unchanged.
[ ] Master data workspaces still work.
[ ] Sales/Purchase generic workspaces still work.
[ ] Cash Bank/Inventory generic workspaces still work.
```

---

## TESTING

Frontend:

```bash
cd frontend-vue
npm run typecheck
npm run lint
npm run build
```

Backend if needed:

```bash
php artisan route:list --path=api
php artisan test
```

Manual QA:

```text
[ ] Open Contacts, search term not on first page.
[ ] Confirm backend fetch includes search param.
[ ] Change status filter and confirm page resets to 1.
[ ] Sort a column and confirm backend fetch includes sort params.
[ ] Change page and confirm data reloads.
[ ] Select rows, change filter, confirm selection clears or stays consistent.
[ ] Header checkbox works only for visible rows.
```

---

## DOCUMENTATION

Create/update:

```text
docs/point-8-generic-workspace-pagination-filter-sort.md
```

Include:

```text
problem
new remote query behavior
supported query params
config options
fallback local mode
manual QA checklist
```

Update `docs/frontend-audit-gap-report.md` with point 8 status.

---

## FINAL SUMMARY REQUIRED

Report:

```text
1. Root cause.
2. Workspace files changed.
3. Config changes.
4. Query params supported.
5. Response shapes supported.
6. Pagination/filter/sort behavior.
7. Bulk selection regression result.
8. Commands run and result.
9. Known limitations.
```

---

## COMMIT AND PUSH REQUIRED

```bash
git status --short
git add <relevant files only>
git commit -m "harden generic workspace pagination filter sort"
git push origin main
```

If current branch is not main:

```bash
git push origin HEAD
```

Final response must include commit hash and push result.
