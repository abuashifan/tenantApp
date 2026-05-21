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

## Phase 14B — Sales Quotation UI

Implemented quotation workflow UI:

- Routes:
  - `/sales/quotations`
  - `/sales/quotations/new`
  - `/sales/quotations/[id]`
  - `/sales/quotations/[id]/edit`
- Components:
  - `QuotationList`
  - `QuotationForm`
  - `QuotationDetail`
  - shared `SalesDocumentForm` and frontend-only sales total preview.
- API endpoints used:
  - `GET /api/sales/quotations`
  - `POST /api/sales/quotations`
  - `GET /api/sales/quotations/{id}`
  - `PATCH /api/sales/quotations/{id}`
  - `PATCH /api/sales/quotations/{id}/send`
  - `PATCH /api/sales/quotations/{id}/approve`
  - `PATCH /api/sales/quotations/{id}/accept`
  - `PATCH /api/sales/quotations/{id}/reject`
  - `PATCH /api/sales/quotations/{id}/cancel`
- Permissions:
  - `sales.quotations.view`
  - `sales.quotations.create`
  - `sales.quotations.edit`
  - `sales.quotations.approve`
  - `sales.quotations.cancel`
  - `sales.orders.convert` for conversion entry point.

Notes:

- List filtering supports status via backend and search/date filtering locally on loaded rows.
- Create/edit forms support customer, dates, notes, line products, quantities, discounts, taxes, warehouse, department, and project.
- Frontend totals are non-authoritative; backend remains the calculation source of truth.
- Cancelled/rejected/expired/converted quotations do not expose edit action.

## Phase 14C — Sales Order UI

Implemented sales order workflow UI:

- Routes:
  - `/sales/orders`
  - `/sales/orders/new`
  - `/sales/orders/from-quotation/[quotationId]`
  - `/sales/orders/[id]`
  - `/sales/orders/[id]/edit`
- Components:
  - `SalesOrderList`
  - `SalesOrderForm`
  - `SalesOrderDetail`
  - shared `SalesDocumentForm` with down payment section.
- API endpoints used:
  - `GET /api/sales/orders`
  - `POST /api/sales/orders`
  - `GET /api/sales/orders/{id}`
  - `PATCH /api/sales/orders/{id}`
  - `POST /api/sales/orders/from-quotation/{quotationId}`
  - `PATCH /api/sales/orders/{id}/approve`
  - `PATCH /api/sales/orders/{id}/confirm`
  - `PATCH /api/sales/orders/{id}/cancel`
  - `PATCH /api/sales/orders/{id}/close`
  - `POST /api/sales/delivery-orders/from-sales-order/{salesOrderId}`
  - `POST /api/sales/invoices/from-sales-order/{salesOrderId}`
- Permissions:
  - `sales.orders.view`
  - `sales.orders.create`
  - `sales.orders.edit`
  - `sales.orders.convert`
  - `sales.orders.approve`
  - `sales.orders.confirm`
  - `sales.orders.cancel`
  - `sales.delivery_orders.create`
  - `sales.invoices.create`

Notes:

- Direct order and quotation conversion flows are supported.
- Down payment form fields send nested `down_payment` payload and explain that DP is stored as Customer Deposit.
- Detail page shows delivered, invoiced, and returned quantities when backend returns them.
- Delivery order and sales invoice conversion actions call existing backend endpoints and redirect to their module placeholders.
- No stock movement UI, inventory valuation UI, PDF/email invoice, or advanced payment allocation was added.

## Phase 14D — Delivery Order UI

Implemented delivery order workflow UI:

- Routes:
  - `/sales/delivery-orders`
  - `/sales/delivery-orders/new`
  - `/sales/delivery-orders/from-sales-order/[salesOrderId]`
  - `/sales/delivery-orders/[id]`
  - `/sales/delivery-orders/[id]/edit`
- Components:
  - `DeliveryOrderList`
  - `DeliveryOrderForm`
  - `DeliveryOrderDetail`
- API endpoints used:
  - `GET /api/sales/delivery-orders`
  - `POST /api/sales/delivery-orders`
  - `GET /api/sales/delivery-orders/{id}`
  - `PATCH /api/sales/delivery-orders/{id}`
  - `POST /api/sales/delivery-orders/from-sales-order/{salesOrderId}`
  - `PATCH /api/sales/delivery-orders/{id}/ready`
  - `PATCH /api/sales/delivery-orders/{id}/ship`
  - `PATCH /api/sales/delivery-orders/{id}/deliver`
  - `PATCH /api/sales/delivery-orders/{id}/cancel`
  - `PATCH /api/sales/delivery-orders/{id}/void`
- Permissions:
  - `sales.delivery_orders.view`
  - `sales.delivery_orders.create`
  - `sales.delivery_orders.edit`
  - `sales.delivery_orders.ship`
  - `sales.delivery_orders.deliver`
  - `sales.delivery_orders.cancel`
  - `sales.delivery_orders.void`

Notes:

- Delivery form supports direct delivery and source-linked delivery from Sales Order.
- Basic remaining quantity validation is shown when source order quantities are available.
- Detail view shows shipped and delivered timestamps.
- UI explicitly states that stock movement controls are not part of Phase 14.

## Phase 14E — Proforma & Sales Invoice UI

Implemented proforma and sales invoice workflow UI:

- Routes:
  - `/sales/proformas`
  - `/sales/proformas/new`
  - `/sales/proformas/[id]`
  - `/sales/proformas/[id]/edit`
  - `/sales/invoices`
  - `/sales/invoices/new`
  - `/sales/invoices/from-sales-order/[salesOrderId]`
  - `/sales/invoices/from-delivery-order/[deliveryOrderId]`
  - `/sales/invoices/from-proforma/[proformaId]`
  - `/sales/invoices/[id]`
  - `/sales/invoices/[id]/edit`
- Components:
  - `ProformaList`
  - `ProformaForm`
  - `ProformaDetail`
  - `SalesInvoiceList`
  - `SalesInvoiceForm`
  - `SalesInvoiceDetail`
- API endpoints used:
  - `GET|POST /api/sales/proformas`
  - `GET|PATCH /api/sales/proformas/{id}`
  - `POST /api/sales/proformas/from-quotation/{quotationId}`
  - `POST /api/sales/proformas/from-sales-order/{salesOrderId}`
  - `PATCH /api/sales/proformas/{id}/issue`
  - `PATCH /api/sales/proformas/{id}/accept`
  - `PATCH /api/sales/proformas/{id}/cancel`
  - `GET|POST /api/sales/invoices`
  - `GET|PATCH /api/sales/invoices/{id}`
  - `POST /api/sales/invoices/from-sales-order/{salesOrderId}`
  - `POST /api/sales/invoices/from-delivery-order/{deliveryOrderId}`
  - `POST /api/sales/invoices/from-proforma/{proformaId}`
  - `PATCH /api/sales/invoices/{id}/approve`
  - `PATCH /api/sales/invoices/{id}/post`
  - `PATCH /api/sales/invoices/{id}/void`
- Permissions:
  - `sales.proformas.view/create/edit/convert/issue/cancel`
  - `sales.invoices.view/create/edit/approve/post/void`

Notes:

- Proforma UI states that proforma is non-accounting until converted.
- Invoice form includes Customer Deposit application amount and does not create a new down payment.
- Invoice detail shows paid amount, balance due, returned amount, and journal entry ID when returned by backend.
- No COGS/stock movement UI, PDF/email invoice, advanced tax, or advanced payment allocation was added.

## Phase 14B–14E Validation

- `npm run lint` passed.
- `npm run build` passed.
- `npm test` was not run because `frontend/package.json` does not define a `test` script.

## Phase 14F — Customer Deposit & Sales Receipt UI

Implemented payment collection UI:

- Routes:
  - `/sales/deposits`
  - `/sales/deposits/new`
  - `/sales/deposits/[id]`
  - `/sales/receipts`
  - `/sales/receipts/new`
  - `/sales/receipts/from-invoice/[invoiceId]`
  - `/sales/receipts/[id]`
- Components:
  - `CustomerDepositList`
  - `CustomerDepositDetail`
  - `SalesReceiptList`
  - `SalesReceiptDetail`
  - shared `SalesPaymentForm`
- API endpoints used:
  - `GET|POST /api/sales/customer-deposits`
  - `GET /api/sales/customer-deposits/{id}`
  - `PATCH /api/sales/customer-deposits/{id}/post`
  - `PATCH /api/sales/customer-deposits/{id}/void`
  - `PATCH /api/sales/customer-deposits/{id}/refund`
  - `GET|POST /api/sales/receipts`
  - `GET /api/sales/receipts/{id}`
  - `PATCH /api/sales/receipts/{id}/post`
  - `PATCH /api/sales/receipts/{id}/void`
- Permissions:
  - `sales.deposits.view/create/post/void/refund`
  - `sales.receipts.view/create/post/void`

Notes:

- Receipt flow supports invoice ID entry and `/sales/receipts/from-invoice/[invoiceId]`.
- Customer Deposit and Receipt screens do not create a general Cash Bank UI.
- Advanced multi-invoice payment allocation is intentionally excluded.

## Phase 14G — Sales Return UI

Implemented sales return UI:

- Routes:
  - `/sales/returns`
  - `/sales/returns/new`
  - `/sales/returns/from-invoice/[invoiceId]`
  - `/sales/returns/from-delivery-order/[deliveryOrderId]`
  - `/sales/returns/[id]`
  - `/sales/returns/[id]/edit`
- Components:
  - `SalesReturnList`
  - `SalesReturnForm`
  - `SalesReturnDetail`
- API endpoints used:
  - `GET|POST /api/sales/returns`
  - `GET|PATCH /api/sales/returns/{id}`
  - `POST /api/sales/returns/from-invoice/{invoiceId}`
  - `POST /api/sales/returns/from-delivery-order/{deliveryOrderId}`
  - `PATCH /api/sales/returns/{id}/approve`
  - `PATCH /api/sales/returns/{id}/post`
  - `PATCH /api/sales/returns/{id}/void`
- Permissions:
  - `sales.returns.view/create/approve/post/void`

Notes:

- Return quantity checks are performed in the UI when source quantity is available.
- Return detail shows AR impact summary fields returned by backend.
- No stock return/stock movement UI is rendered.

## Phase 14H — AR Ledger & Aging UI

Implemented read-only AR reporting UI:

- Routes:
  - `/sales/ar-ledger`
  - `/sales/ar-ledger/customers/[customerId]`
  - `/sales/ar-ledger/invoices/[invoiceId]`
  - `/sales/open-invoices`
  - `/sales/ar-aging`
  - `/sales/ar-reconciliation`
- Components:
  - `ARLedgerSummary`
  - `CustomerLedgerPage`
  - `InvoiceLedgerPage`
  - `OpenInvoicesPage`
  - `ARAgingPage`
  - `ARReconciliationPage`
- API endpoints used:
  - `GET /api/sales/ar/customer-summary`
  - `GET /api/sales/ar/customers/{customerId}/ledger`
  - `GET /api/sales/ar/invoices/{invoiceId}/ledger`
  - `GET /api/sales/ar/open-invoices`
  - `GET /api/sales/ar/aging`
  - `GET /api/sales/ar/reconciliation`
- Permissions:
  - `sales.ar.view`
  - `sales.ar.reconcile`

Notes:

- AR pages are read-only except navigation to receipt creation where permission allows.
- Browser print-friendly display is available naturally, but no PDF/Excel export engine was added.

## Phase 14I — Sales Frontend Tests & Documentation

Final integration review:

- Sales route tree now covers quotation, order, delivery, proforma, invoice, customer deposit, receipt, return, AR ledger, open invoices, aging, and reconciliation MVP pages.
- All sales pages use `SalesPageGate`, which checks authentication, active company, and permissions.
- Sales API calls use the shared API client, which sends `Authorization` and `X-Company-ID`.
- Mutation actions are permission-aware and use confirmations for risky actions.
- Forms surface backend validation errors through `getApiErrorMessage`.
- Loading, error, empty, status badge, totals, and source chain patterns are reused.
- Manual responsive checklist:
  - list/filter pages fit mobile through horizontal table overflow,
  - forms stack on small screens,
  - action bars wrap,
  - detail cards stack before two-column layout.
- Next phase: Phase 15 — Purchase Frontend MVP.

## Phase 14 Final Validation

- `npm run lint` passed.
- `npm run build` passed.
- `npm test` was not run because `frontend/package.json` does not define a `test` script.
