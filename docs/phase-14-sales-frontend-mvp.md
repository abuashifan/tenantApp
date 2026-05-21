# Phase 14 — Sales Frontend MVP

## Status

Phase 14 dimulai setelah Phase 13 Accounting Frontend MVP selesai. Phase ini memakai backend Sales & Accounts Receivable dari Phase 9 dan tidak menambah backend sales business logic baru.

## Scope Phase 14

- Sales frontend navigation.
- Sales document pages for quotations, orders, delivery orders, proformas, invoices, deposits, receipts, returns.
- Accounts Receivable ledger and aging UI.
- Permission-aware pages and actions.
- Tenant-aware API calls using existing token and `X-Company-ID`.
- Loading, error, empty, status, source chain, totals, filters, and action patterns.

## Out of Scope

- Purchase UI: Phase 15.
- Cash Bank UI: Phase 16.
- Inventory UI: Phase 17.
- Stock movement UI.
- Inventory valuation UI.
- Backend sales module rewrite.
- Export PDF/Excel.
- Advanced tax, advanced payment allocation, promo/tiered discount, and full multi-currency.

## Phase 14A — Sales Frontend Foundation

Implemented foundation:

- Sales navigation metadata in `frontend/features/sales/navigation.ts`.
- Tenant-aware sales API wrapper in `frontend/features/sales/api/salesApi.ts`.
- Sales type definitions in `frontend/features/sales/types.ts`.
- Sales page guard in `frontend/features/sales/SalesPageGate.tsx`.
- Shared sales components:
  - `SalesStatusBadge`
  - `SalesSourceChain`
  - `SalesTotalsCard`
  - `SalesLineItemsTable`
  - `SalesActionBar`
  - `SalesFilters`
  - `SalesSelectors`
  - `SalesModulePlaceholder`
- `AppShell` updated to show Sales menu based on sales permissions.

Frontend routes created:

- `/sales`
- `/sales/quotations`
- `/sales/orders`
- `/sales/delivery-orders`
- `/sales/proformas`
- `/sales/invoices`
- `/sales/deposits`
- `/sales/receipts`
- `/sales/returns`
- `/sales/ar-ledger`
- `/sales/ar-aging`

## Backend Endpoints Prepared For

- `GET|POST /api/sales/quotations`
- `GET|POST /api/sales/orders`
- `GET|POST /api/sales/delivery-orders`
- `GET|POST /api/sales/proformas`
- `GET|POST /api/sales/invoices`
- `GET|POST /api/sales/customer-deposits`
- `GET|POST /api/sales/receipts`
- `GET|POST /api/sales/returns`
- `GET /api/sales/ar/customer-summary`
- `GET /api/sales/ar/customers/{customerId}/ledger`
- `GET /api/sales/ar/invoices/{invoiceId}/ledger`
- `GET /api/sales/ar/open-invoices`
- `GET /api/sales/ar/aging`
- `GET /api/sales/ar/reconciliation`

## Permission Mapping

- `sales.quotations.*`
- `sales.orders.*`
- `sales.delivery_orders.*`
- `sales.proformas.*`
- `sales.invoices.*`
- `sales.deposits.*`
- `sales.receipts.*`
- `sales.returns.*`
- `sales.ar.view`
- `sales.ar.reconcile`

## Test Commands

```bash
cd frontend
npm run lint
npm run build
```

`frontend/package.json` does not currently define a dedicated `test` script.

## Known Limitations

- Phase 14A creates foundation and placeholder module pages only.
- Document CRUD/detail flows start in Phase 14B onward.
- No purchase, cash bank, or inventory frontend was added.
- No stock movement, valuation, PDF, Excel, or email invoice feature was added.

## Phase 14A Validation

- `npm run lint` passed.
- `npm run build` passed.
- `npm test` was not run because `frontend/package.json` does not define a `test` script.
