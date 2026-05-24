# Frontend Endpoint Workspace Map

## Backend Scan

Sources read:

- `backend/routes/api.php`
- `backend/config/permissions.php`
- `backend/app/Http/Controllers/Api/**` where resource behavior needed confirmation

Command run:

```bash
cd backend
php artisan route:list --path=api --json
```

Laravel exposes 280 API routes. This map covers tenant-facing list or landing
resources; action URLs and entity-specific drill-down URLs are not separate menu
workspaces.

## Implementation Pattern

Existing designed workspace pages are retained:

| Frontend Route | Page / Feature | API Resource | Status |
| --- | --- | --- | --- |
| `/dashboard` | `pages/dashboard/DashboardWorkspaceContent.vue` | `/accounting/fiscal-year/status` | Existing |
| `/accounting/chart-of-accounts` | `features/accounting/chart-of-accounts/ChartOfAccountsWorkspace.vue` | `/master-data/chart-of-accounts` | Existing |
| `/accounting/journals` | `features/accounting/journals/JournalListPage.vue` | `/journals` | Existing |
| `/reports/general-ledger` | `features/reports/general-ledger/GeneralLedgerWorkspace.vue` | `/reports/general-ledger` | Existing |
| `/accounting/trial-balance` | `features/reports/trial-balance/TrialBalanceWorkspace.vue` | `/reports/trial-balance` | Existing |

Resources without a final designed page are implemented through:

| File | Purpose |
| --- | --- |
| `src/features/workspace/backend-resource/BackendResourceWorkspace.vue` | Shared Journal-style API-backed list workspace and virtual-tab actions |
| `src/features/workspace/backend-resource/backendResource.config.ts` | Resource columns, filters, action capability and permission configuration |
| `src/features/workspace/backend-resource/backendResource.service.ts` | Generic list request using the existing Axios API client |
| `src/pages/workspace/BackendResourceWorkspaceContent.vue` | Registry content component for configured routes |

## Master Data And Settings

Product catalogue endpoints remain in backend `master-data`, while the sidebar
groups them under Inventory.

| Sidebar Group | Menu | Frontend Route | API Endpoint | Permission | Status |
| --- | --- | --- | --- | --- | --- |
| Master Data | Chart of Accounts | `/accounting/chart-of-accounts` | `/master-data/chart-of-accounts` | `coa.view` | Existing |
| Master Data | Contacts | `/master-data/contacts` | `/master-data/contacts` | `contacts.view` | Shared list |
| Master Data | Units | `/master-data/units` | `/master-data/units` | `units.view` | Shared list |
| Master Data | Departments | `/master-data/departments` | `/master-data/departments` | `departments.view` | Shared list |
| Master Data | Projects | `/master-data/projects` | `/master-data/projects` | `projects.view` | Shared list |
| Inventory | Product Categories | `/master-data/product-categories` | `/master-data/product-categories` | `products.view` | Shared list |
| Inventory | Products | `/master-data/products` | `/master-data/products` | `products.view` | Shared list |
| Inventory | Warehouses | `/master-data/warehouses` | `/master-data/warehouses` | `warehouses.view` | Shared list |
| Settings | Company Settings | `/settings/company` | `/settings/company` | `settings.company.view` | Shared landing |
| Settings | Account Mappings | `/settings/account-mappings` | `/master-data/account-mappings` | `settings.company.view` | Shared list |

## Accounting And Reports

| Menu | Frontend Route | API Endpoint | Permission | Status |
| --- | --- | --- | --- | --- |
| Journal Entries | `/accounting/journals` | `/journals` | `journal.view` | Existing |
| Period Locks | `/accounting/period-locks` | `/accounting/period-locks/status` | `fiscal_year.view` | Shared landing |
| General Ledger | `/reports/general-ledger` | `/reports/general-ledger` | `reports.view` | Existing |
| Trial Balance | `/accounting/trial-balance` | `/reports/trial-balance` | `reports.view` | Existing |
| Profit & Loss | `/reports/profit-loss` | `/reports/profit-loss` | `reports.view` | Shared list |
| Balance Sheet | `/reports/balance-sheet` | `/reports/balance-sheet` | `reports.view` | Shared list |
| Cash Flow | `/reports/cash-flow` | `/reports/cash-flow` | `reports.view` | Shared list |
| Financial Summary | `/reports/financial-summary` | `/reports/financial-summary` | `reports.view` | Shared list |

## Sales And AR

| Menu | API Endpoint | Permission | Status |
| --- | --- | --- | --- |
| Sales Quotations | `/sales/quotations` | `sales.quotations.view` | Shared list |
| Sales Orders | `/sales/orders` | `sales.orders.view` | Shared list |
| Delivery Orders | `/sales/delivery-orders` | `sales.delivery_orders.view` | Shared list |
| Proforma Invoices | `/sales/proformas` | `sales.proformas.view` | Shared list |
| Sales Invoices | `/sales/invoices` | `sales.invoices.view` | Shared list |
| Billing Invoices | `/sales/billings` | `sales.billings.view` | Shared list |
| Customer Deposits | `/sales/customer-deposits` | `sales.deposits.view` | Shared list |
| Sales Receipts | `/sales/receipts` | `sales.receipts.view` | Shared list |
| Sales Returns | `/sales/returns` | `sales.returns.view` | Shared list |
| Customer Summary | `/sales/ar/customer-summary` | `sales.ar.view` | Shared report |
| Open Invoices | `/sales/ar/open-invoices` | `sales.ar.view` | Shared list |
| AR Aging | `/sales/ar/aging` | `sales.ar.view` | Shared report |
| AR Reconciliation | `/sales/ar/reconciliation` | `sales.ar.reconcile` | Shared report |

## Purchase And AP

| Menu | API Endpoint | Permission | Status |
| --- | --- | --- | --- |
| Purchase Requests | `/purchase/requests` | `purchase.requests.view` | Shared list |
| Purchase Orders | `/purchase/orders` | `purchase.orders.view` | Shared list |
| Goods Receipts | `/purchase/goods-receipts` | `purchase.goods_receipts.view` | Shared list |
| Vendor Bills | `/purchase/bills` | `purchase.bills.view` | Shared list |
| Vendor Deposits | `/purchase/vendor-deposits` | `purchase.deposits.view` | Shared list |
| Vendor Payments | `/purchase/payments` | `purchase.payments.view` | Shared list |
| Purchase Returns | `/purchase/returns` | `purchase.returns.view` | Shared list |
| Vendor Summary | `/purchase/ap/vendor-summary` | `purchase.ap.view` | Shared report |
| Open Bills | `/purchase/ap/open-bills` | `purchase.ap.view` | Shared list |
| AP Aging | `/purchase/ap/aging` | `purchase.ap.view` | Shared report |
| AP Reconciliation | `/purchase/ap/reconciliation` | `purchase.ap.reconcile` | Shared report |

## Cash And Bank

| Menu | API Endpoint | Permission | Status |
| --- | --- | --- | --- |
| Cash & Bank Accounts | `/cash-bank/accounts` | `cash_bank.view` | Shared list |
| Cash Receipts | `/cash-bank/cash-receipts` | `cash_bank.view` | Shared list |
| Cash Payments | `/cash-bank/cash-payments` | `cash_bank.view` | Shared list |
| Bank Transfers | `/cash-bank/bank-transfers` | `cash_bank.view` | Shared list |
| Bank Reconciliation | `/cash-bank/bank-reconciliations` | `cash_bank.view` | Shared list |

## Inventory

| Menu | API Endpoint | Permission | Status |
| --- | --- | --- | --- |
| Stock Balances | `/inventory/stock-balances` | `inventory.stock.view` | Shared list |
| Stock Movements | `/inventory/stock-movements` | `inventory.movements.view` | Shared list |
| Stock Adjustments | `/inventory/stock-adjustments` | `inventory.adjustments.view` | Shared list |
| Stock Opname | `/inventory/stock-opnames` | `inventory.opname.view` | Shared list |
| Inventory Valuation | `/inventory/valuation` | `inventory.valuation.view` | Shared report |
| Stock Balance Report | `/inventory/reports/stock-balances` | `inventory.reports.view` | Shared report |
| Stock Movement Report | `/inventory/reports/stock-movements` | `inventory.reports.view` | Shared report |
| Valuation Report | `/inventory/reports/valuation` | `inventory.reports.view` | Shared report |
| Low Stock Report | `/inventory/reports/low-stock` | `inventory.reports.view` | Shared report |
| Negative Stock Report | `/inventory/reports/negative-stock` | `inventory.reports.view` | Shared report |

## Virtual Tabs And Actions

- List resources with backend create permission expose Create and open a create
  secondary tab backed by the shared transaction form renderer when the endpoint
  has create/update/detail support.
- Detail/edit secondary tabs are exposed where capability configuration maps
  existing backend resource operations and permissions.
- Form coverage is documented in `docs/frontend-transaction-form-map.md`.
- Read-only report resources do not expose Create.
- Posting, approval, cancellation, reconciliation refresh and finalization actions
  are wired only where the backend route already exists.

## Intentionally Skipped

| Endpoint Group | Reason |
| --- | --- |
| `/accounting/fiscal-years/{id}/closing-*`, close, reopen | Fiscal-year context workflow; no standalone list endpoint |
| `/reports/account-ledger/{account}` | General Ledger drill-down |
| AR/AP entity ledger endpoints | Require selected customer/vendor/document |
| Inventory product/warehouse stock parameter endpoints | Stock Balance drill-down |
| `/cash-bank/reports/account-statement` | Requires selected `cash_bank_account_id`; drill-down from cash/bank account |
| `/inventory/reports/stock-card` | Requires selected `product_id`; drill-down from products or stock balance |
| Lifecycle/conversion endpoints | Row/form workflow actions rather than list resources |
| Auth/company/health/tenant-context endpoints | Application context/internal APIs |
