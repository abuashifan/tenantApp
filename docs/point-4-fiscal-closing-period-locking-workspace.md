# Point 4 — Fiscal Closing + Period Locking Workspace

## Purpose

Point 4 adds an operational Vue workspace for annual fiscal closing and period locking. The frontend does not calculate accounting results itself; it calls the existing Laravel APIs and renders the backend status, checklist, preview, close/reopen actions, and period lock state.

## Backend Endpoints Used

All endpoints are tenant-aware through the shared API client with `Authorization: Bearer ...` and `X-Company-ID`.

- `GET /api/accounting/fiscal-year/status`
- `GET /api/accounting/fiscal-years/{id}/closing-checklist`
- `GET /api/accounting/fiscal-years/{id}/closing-preview`
- `POST /api/accounting/fiscal-years/{id}/close`
- `POST /api/accounting/fiscal-years/{id}/reopen`
- `GET /api/accounting/period-locks/status`
- `PATCH /api/accounting/period-locks`

The route list verifies these routes are active under `auth:sanctum`, `company.access`, and fiscal year permission middleware.

## Frontend Route And Page

- Route: `/accounting/fiscal-closing`
- Legacy redirect: `/accounting/period-locks` redirects to `/accounting/fiscal-closing`
- Workspace component: `frontend-vue/src/pages/accounting/fiscal-closing/FiscalClosingWorkspace.vue`
- Service: `frontend-vue/src/services/accounting/fiscalClosing.service.ts`
- Workspace registry key: `/accounting/fiscal-closing`

The page opens through the existing workspace shell and primary virtual tabs. No new shell or global layout behavior was added.

## Permission Keys

The implementation uses existing permission keys:

- `fiscal_year.view` — sidebar visibility and read access
- `fiscal_year.closing_wizard` — backend checklist access
- `fiscal_year.close` — close action
- `fiscal_year.reopen` — reopen action
- `fiscal_year.lock_manage` — period lock update

The backend keeps enforcing permissions even when the frontend hides or disables actions.

## Close Fiscal Year Workflow

1. Page loads active fiscal year and period lock status.
2. Page loads closing checklist and closing preview for the active fiscal year.
3. Checklist shows passed, warning, and failed checks.
4. Close button is disabled unless checklist can close, preview is valid, and the user has `fiscal_year.close`.
5. Close action sends optional `closing_notes`.
6. Backend performs validation, writes closing/audit data, marks the fiscal year closed, and sets the lock date.

## Reopen Workflow

1. Reopen action is shown only for closed fiscal years and users with `fiscal_year.reopen`.
2. User must enter a reopen reason.
3. Frontend posts `reopen_reason`.
4. Backend reopens the fiscal year and writes audit history without deleting closing history.

## Period Lock Workflow

1. Page displays current `locked_until`.
2. Users with `fiscal_year.lock_manage` can update or clear `lock_until`.
3. Optional `override_reason` is sent to the backend.
4. Backend writes audit history.

## Transaction Mutation Lock Behavior

Transaction mutation blocking remains backend-controlled by `TransactionDateGuardService` and `PeriodLockService`. The frontend only displays current state and sends update requests. Reports remain readable for closed or locked periods.

## Manual QA Checklist

- Log in and select a company.
- Confirm the Accounting menu shows Fiscal Closing for a user with `fiscal_year.view`.
- Open `/accounting/fiscal-closing` and confirm it opens in the existing workspace tab flow.
- Confirm current fiscal year status renders.
- Confirm checklist and preview render.
- Confirm close is disabled when checklist fails or preview is invalid.
- Confirm close calls the backend for a permitted user.
- Confirm reopen requires a reason.
- Confirm period lock update calls the backend for `fiscal_year.lock_manage`.
- Confirm 401/403/422 backend errors show readable messages.
- Confirm dashboard, master data, journals, reports, sales, purchase, cash-bank, and inventory menus still open.
- Confirm Product History remains under Products and not Product Category.

## Known Limitations

- The current backend closing preview stores a lightweight `last_closing_preview_at` marker because close requires preview before execution. The Vue workspace treats preview as an explicit operational step and does not perform accounting mutations itself.
- Frontend automated tests are not configured for this workspace. Verification relies on backend tests, TypeScript, lint, build, and manual QA.
