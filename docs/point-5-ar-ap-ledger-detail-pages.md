# Point 5 — AR/AP Ledger Detail Pages

## Problem From Audit

Backend AR/AP subsidiary ledger endpoints were active, but Vue did not expose clear ledger detail surfaces. Customer/vendor summary and open invoice/bill menu items existed, but they used generic placeholder pages and did not provide drilldown to customer, vendor, invoice, or bill ledger movements.

## Backend Endpoints Verified

All endpoints are read-only and protected by `auth:sanctum`, `company.access`, and AR/AP permissions:

- `GET /api/sales/ar/customer-summary` — `sales.ar.view`
- `GET /api/sales/ar/customers/{customerId}/ledger` — `sales.ar.view`
- `GET /api/sales/ar/invoices/{invoiceId}/ledger` — `sales.ar.view`
- `GET /api/sales/ar/open-invoices` — `sales.ar.view`
- `GET /api/sales/ar/aging` — `sales.ar.view`
- `GET /api/sales/ar/reconciliation` — `sales.ar.reconcile`
- `GET /api/purchase/ap/vendor-summary` — `purchase.ap.view`
- `GET /api/purchase/ap/vendors/{vendorId}/ledger` — `purchase.ap.view`
- `GET /api/purchase/ap/bills/{billId}/ledger` — `purchase.ap.view`
- `GET /api/purchase/ap/open-bills` — `purchase.ap.view`
- `GET /api/purchase/ap/aging` — `purchase.ap.view`
- `GET /api/purchase/ap/reconciliation` — `purchase.ap.reconcile`

No backend route or business logic changes were required.

## Frontend Routes Added

- `/sales/ar/customers/:customerId/ledger`
- `/sales/ar/invoices/:invoiceId/ledger`
- `/purchase/ap/vendors/:vendorId/ledger`
- `/purchase/ap/bills/:billId/ledger`

Dynamic ledger routes use the real route path as the primary tab id and `workspaceRegistryKey` metadata to render the correct workspace component inside the existing virtual tab shell.

## Service Mapping

- `frontend-vue/src/services/sales/ar.service.ts`
  - `getCustomerSummary`
  - `getCustomerLedger`
  - `getInvoiceLedger`
  - `getOpenInvoices`
  - `getAging`
  - `getReconciliation`
- `frontend-vue/src/services/purchase/ap.service.ts`
  - `getVendorSummary`
  - `getVendorLedger`
  - `getBillLedger`
  - `getOpenBills`
  - `getAging`
  - `getReconciliation`

Both services use the existing API client, so Bearer token and `X-Company-ID` behavior remains unchanged.

## AR Ledger Detail Behavior

- Customer summary page now renders real AR balances and links each customer to its ledger detail.
- Open invoices page now renders real open invoices and links to invoice and customer ledger detail.
- Customer ledger detail supports `start_date` and `end_date` filters.
- Invoice ledger detail loads document-specific movement rows from the backend.
- The ledger table shows date, document, description, debit, credit, and running balance.

## AP Ledger Detail Behavior

- Vendor summary page now renders real AP balances and links each vendor to its ledger detail.
- Open bills page now renders real open bills and links to bill and vendor ledger detail.
- Vendor ledger detail supports `start_date` and `end_date` filters.
- Bill ledger detail loads document-specific movement rows from the backend.
- The ledger table shows date, document, description, debit, credit, and running balance.

## Permissions

- AR pages require `sales.ar.view`.
- AP pages require `purchase.ap.view`.
- Reconciliation endpoints remain protected by their existing reconcile permissions.
- Backend remains authoritative for permission enforcement.

## Filters

- Customer/vendor ledger detail supports `start_date` and `end_date`, matching backend service filters.
- Invoice/bill ledger detail endpoints are document-specific and currently do not accept date filters.
- Summary/open pages include local search for quick navigation; backend pagination/filter hardening remains a separate roadmap item.

## Definition Of Done

- [x] AR customer ledger endpoint verified.
- [x] AR invoice ledger endpoint verified.
- [x] AP vendor ledger endpoint verified.
- [x] AP bill ledger endpoint verified.
- [x] Vue services use real backend endpoints.
- [x] Customer/vendor summary pages render real rows and drilldown links.
- [x] Open invoice/bill pages render real rows and drilldown links.
- [x] Ledger detail pages render loading, error, empty, summary, filter, and movement table states.
- [x] Dynamic ledger tabs work inside the existing workspace shell.
- [x] No transaction mutation added.
- [x] Frontend type-check, lint, and build pass.
- [x] Backend AR/AP/Ledger focused tests and full suite pass.

## Manual QA Checklist

- Log in and select a company.
- Open Sales & AR → Customer Summary and drill into a customer ledger.
- Open Sales & AR → Open Invoices and drill into an invoice ledger.
- Open Purchase & AP → Vendor Summary and drill into a vendor ledger.
- Open Purchase & AP → Open Bills and drill into a bill ledger.
- Confirm date filters work on customer/vendor ledgers.
- Confirm direct routes return 403 for users without `sales.ar.view` or `purchase.ap.view`.
- Confirm Dashboard, Master Data, Journals, Fiscal Closing, Access Management, Sales/Purchase, Cash Bank, and Inventory menus still open.
- Confirm Product History remains under Products and not Product Category.

## Known Limitations

- Backend ledger detail responses do not include explicit opening balance rows; the page shows opening balance as zero and uses backend running balances for movement rows.
- Summary/open pages use local search over loaded rows. Server-side pagination/filter/sort hardening is out of scope for Point 5.
