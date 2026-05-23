# Phase 13 — Accounting Frontend MVP

## Status

Phase 13 dimulai sebagai frontend MVP untuk modul accounting. Phase 12 Inventory Backend sudah selesai, tetapi UI Sales, Purchase, Cash Bank, dan Inventory tetap dipisah ke Phase 14-17.

## Scope Phase 13

- Menu accounting dan permission-aware navigation.
- Chart of Accounts UI.
- Master data accounting UI.
- Journal Entry UI.
- Ledger dan Trial Balance UI.
- Financial Statements UI.
- Fiscal Closing UI refinement.
- Loading, error, empty, and permission states.

## Out of Scope

- Sales Frontend: Phase 14.
- Purchase Frontend: Phase 15.
- Cash Bank Frontend: Phase 16.
- Inventory Frontend: Phase 17.
- Public tenant/company creation UI.
- Backend business logic besar.
- Export PDF/Excel.

## Phase 13A — Accounting Frontend Foundation

Implemented foundation:

- `frontend/app/accounting/page.tsx`
- Accounting navigation metadata in `frontend/features/accounting/navigation.ts`
- Permission helpers in `frontend/lib/permissions.ts`
- Formatting helpers in `frontend/lib/formatters.ts`
- Shared UI states:
  - `LoadingState`
  - `ErrorState`
  - `EmptyState`
  - `PageHeader`
  - `DataTable`
  - `StatusBadge`
  - `PermissionGuard`
- Accounting types in `frontend/types/accounting.ts`
- `AppShell` navigation updated to show accounting routes based on permissions.

## Phase 13B — Chart of Accounts UI

Implemented Chart of Accounts MVP:

- `GET /master-data/chart-of-accounts` list with local search/filter.
- `POST /master-data/chart-of-accounts` create form.
- `GET /master-data/chart-of-accounts/{id}` detail page.
- `PATCH /master-data/chart-of-accounts/{id}` edit form.
- `PATCH /master-data/chart-of-accounts/{id}/deactivate` deactivate action.
- `PATCH /master-data/chart-of-accounts/{id}/activate` activate action.

Frontend routes:

- `/accounting/chart-of-accounts`
- `/accounting/chart-of-accounts/new`
- `/accounting/chart-of-accounts/[id]`
- `/accounting/chart-of-accounts/[id]/edit`

## Tenant & Permission Rules

- Frontend API requests use the stored bearer token and `active_company_id` as `X-Company-ID`.
- Accounting pages redirect to login if token is missing.
- Accounting pages redirect to company selection if active company is missing.
- Permission checks use `/api/auth/permissions` and local cached permissions.
- Mutation buttons are hidden when the active role does not include the required permission.

## Test Commands

```bash
cd frontend
npm run lint
npm run build
```

## Known Limitations

- No Sales/Purchase/Cash Bank/Inventory UI in Phase 13.
- No import/export.
- No opening balance UI.
- Chart of Accounts tree is a simple parent/type display, not a full drag-and-drop hierarchy editor.

## Phase 13C — Master Data Accounting UI

Implemented master data pages:

- `/accounting/master-data`
- `/accounting/master-data/contacts`
- `/accounting/master-data/units`
- `/accounting/master-data/product-categories`
- `/accounting/master-data/products`
- `/accounting/master-data/warehouses`
- `/accounting/master-data/account-mappings`
- `/accounting/master-data/departments`
- `/accounting/master-data/projects`

Notes:

- CRUD uses the existing tenant-aware `master-data` API endpoints.
- Activate/deactivate buttons are permission-aware.
- Account mappings use a cautious select-based update flow because they affect posting behavior.
- Products and warehouses remain master data only; no inventory UI was added.

## Phase 13D — Journal Entry UI

Implemented journal routes:

- `/accounting/journals`
- `/accounting/journals/new`
- `/accounting/journals/[id]`
- `/accounting/journals/[id]/edit`

Features:

- Journal list with status/date/search filters.
- Create and edit journal forms with dynamic lines.
- Account, department, and project selectors.
- Debit/credit totals and client-side balance validation before submit.
- Detail page with approve, post, and void actions guarded by permissions.
- Backend validation and period-lock errors are displayed from the API response.

## Phase 13E — Ledger & Trial Balance UI

Implemented report routes:

- `/accounting/reports/general-ledger`
- `/accounting/reports/account-ledger`
- `/accounting/reports/trial-balance`

Features:

- Date, account, department, project, account type, and zero-balance filters where supported.
- General ledger account summary and account-line drilldown.
- Account ledger running balance display with journal drilldown links.
- Trial balance debit/credit totals and balance check status.
- Print-friendly basic table layout without export.

## Phase 13F — Financial Statements UI

Implemented financial statement routes:

- `/accounting/reports/financial-statements`
- `/accounting/reports/profit-loss`
- `/accounting/reports/balance-sheet`
- `/accounting/reports/cash-flow`
- `/accounting/reports/financial-summary`

Features:

- Financial statement landing page.
- Profit & Loss summary cards and section tables.
- Balance Sheet assets/liabilities/equity sections with balanced status.
- Simple Cash Flow summary and account breakdown.
- Financial Summary cross-statement cards.
- No PDF/Excel export, advanced analytics, or frontend dashboard was added.

## Phase 13G — Fiscal Closing UI Refinement

Refined fiscal closing route:

- `/accounting/fiscal-closing`

Features:

- Closing status cards for active fiscal year, checklist readiness, and period lock status.
- Closing checklist with warnings and blocking errors.
- Closing preview panel with net profit/loss, retained earnings mapping, and posted journal count.
- Permission-aware close, reopen, and period lock management actions.
- Reopen requires a reason through the existing dialog.
- Close button remains disabled when checklist/preview is invalid.

## Phase 13H — Tests & Documentation

Frontend test stack note:

- `frontend/package.json` has no dedicated `test` script or frontend test framework.
- Phase 13H uses lint/build plus manual smoke checklist instead of adding a new test framework.

Commands:

```bash
cd frontend
npm run lint
npm run build
```

Manual smoke checklist:

- [ ] Accounting landing page renders and redirects unauthenticated users to login.
- [ ] Missing active company redirects to company selection.
- [ ] Permission-aware accounting menu hides unavailable items.
- [ ] Chart of Accounts list/create/detail/edit pages render.
- [ ] Master Data landing and resource pages render loading, empty, error, and table states.
- [ ] Account Mapping page warns users and updates mappings only with settings edit permission.
- [ ] Journal list renders; journal form blocks unbalanced debit/credit totals.
- [ ] Journal detail shows approve/post/void actions according to permissions.
- [ ] General Ledger, Account Ledger, and Trial Balance pages render filters and tables.
- [ ] Profit & Loss, Balance Sheet, Cash Flow, and Financial Summary pages render report data.
- [ ] Fiscal Closing page shows checklist, preview, period lock, close, and reopen controls.
- [ ] Backend API validation/period-lock errors are displayed clearly in the UI.

## Backend Endpoints Used

- `GET/POST/PATCH /api/master-data/chart-of-accounts`
- `GET/POST/PATCH /api/master-data/contacts`
- `GET/POST/PATCH /api/master-data/units`
- `GET/POST/PATCH /api/master-data/product-categories`
- `GET/POST/PATCH /api/master-data/products`
- `GET/POST/PATCH /api/master-data/warehouses`
- `GET/PATCH /api/master-data/account-mappings`
- `GET/POST/PATCH /api/master-data/departments`
- `GET/POST/PATCH /api/master-data/projects`
- `GET/POST/PATCH /api/journals`
- `POST /api/journals/{id}/approve`
- `POST /api/journals/{id}/post`
- `POST /api/journals/{id}/void`
- `GET /api/reports/general-ledger`
- `GET /api/reports/account-ledger/{account}`
- `GET /api/reports/trial-balance`
- `GET /api/reports/profit-loss`
- `GET /api/reports/balance-sheet`
- `GET /api/reports/cash-flow`
- `GET /api/reports/financial-summary`
- `GET /api/accounting/period-locks/status`
- `PATCH /api/accounting/period-locks`
- `GET /api/accounting/fiscal-years/{id}/closing-checklist`
- `GET /api/accounting/fiscal-years/{id}/closing-preview`
- `POST /api/accounting/fiscal-years/{id}/close`
- `POST /api/accounting/fiscal-years/{id}/reopen`

## Permission Mapping

- `coa.*` for Chart of Accounts.
- `contacts.*`, `units.*`, `products.*`, `warehouses.*`, `departments.*`, `projects.*` for master data.
- `settings.company.view/edit` for account mappings.
- `journal.*` for journal list, create/edit, approve, post, and void.
- `reports.view` for ledger, trial balance, and financial statements.
- `fiscal_year.view`, `fiscal_year.close`, `fiscal_year.reopen`, and `fiscal_year.lock_manage` for fiscal closing.

## Phase Boundary

- Phase 13 is now ready to close as Accounting Frontend MVP.
- Phase 14 remains Sales Frontend MVP.
- Phase 15 remains Purchase Frontend MVP.
- Phase 16 remains Cash Bank Frontend MVP.
- Phase 17 remains Inventory Frontend MVP.
