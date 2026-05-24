# Frontend API Sidebar Map

## Backend Route Scan Summary

Source inspected:

- `backend/routes/api.php`
- `backend/bootstrap/app.php`
- `backend/app/Http/Middleware/EnsureCompanyAccess.php`
- `backend/app/Http/Middleware/EnsurePermission.php`
- `backend/config/permissions.php`
- API controller folders under `backend/app/Http/Controllers/Api`

Command executed:

```bash
cd backend
php artisan route:list --path=api --json
```

The command returned 280 API routes. Tenant-scoped resources use `auth:sanctum` and
`company.access`; sidebar resources listed below additionally use the indicated
permission middleware.

| Module | Route Count | List / Landing Endpoints Found | Status |
| --- | ---: | --- | --- |
| Dashboard / Accounting Control | 7 | `GET /api/accounting/fiscal-year/status`, `GET /api/accounting/period-locks/status` | Dashboard page available; fiscal management pages not yet exposed |
| Authentication | 5 | `GET /api/auth/me`, `GET /api/auth/permissions` | Auth flow only, not sidebar |
| Company | 2 | `GET /api/companies` | Company selector only, not sidebar |
| Master Data | 50 | COA, contacts, units, product categories, products, warehouses, departments, projects, account mappings | COA page available; other resources use shared list workspace |
| Journals | 7 | `GET /api/journals` | Page available |
| Reports | 7 | General ledger, trial balance, profit/loss, balance sheet, cash flow, financial summary | General ledger and trial balance pages available; others use shared list workspace |
| Sales & AR | 80 | Quotations, orders, delivery orders, proformas, invoices, billings, receipts, deposits, returns, AR summaries | Menu enabled with shared workspaces |
| Purchase & AP | 61 | Requests, orders, goods receipts, bills, payments, deposits, returns, AP summaries | Menu enabled with shared workspaces |
| Cash & Bank | 23 | Accounts, receipts, payments, transfers, reconciliations, account statement | Menu enabled with shared workspaces |
| Inventory | 33 | Stock balances, movements, adjustments, opnames, valuation, reports | Menu enabled with shared workspaces |
| Settings | 3 | `GET /api/settings/company` | Menu enabled with shared workspace |
| Internal / Health | 2 | `GET /api/health`, `GET /api/tenant-context-test` | Never a workspace menu |

## Backend Resource Candidates

This table records list or landing resources that can become workspace menu pages.
Action endpoints such as `approve`, `post`, `void`, `cancel`, `close`, `finalize`,
and configuration updates are deliberately not individual sidebar entries.

| Module | Method | Endpoint | Controller | Permission | Sidebar Menu Candidate | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Dashboard | GET | `/api/accounting/fiscal-year/status` | `FiscalYearStatusController` | `dashboard.view` | Dashboard | Displayed |
| Accounting | GET | `/api/journals` | `JournalEntryController@index` | `journal.view` | Journal Entries | Displayed |
| Master Data | GET | `/api/master-data/chart-of-accounts` | `ChartOfAccountController@index` | `coa.view` | Chart of Accounts | Displayed |
| Reports | GET | `/api/reports/general-ledger` | `GeneralLedgerController@index` | `reports.view` | General Ledger | Displayed |
| Reports | GET | `/api/reports/trial-balance` | `TrialBalanceController@index` | `reports.view` | Trial Balance | Displayed |
| Master Data | GET | `/api/master-data/contacts` | `ContactController@index` | `contacts.view` | Contacts | Displayed: shared list |
| Master Data | GET | `/api/master-data/units` | `UnitController@index` | `units.view` | Units | Displayed: shared list |
| Master Data / Inventory UI | GET | `/api/master-data/product-categories` | `ProductCategoryController@index` | `products.view` | Product Categories | Displayed under Inventory: shared list |
| Master Data / Inventory UI | GET | `/api/master-data/products` | `ProductController@index` | `products.view` | Products | Displayed under Inventory: shared list |
| Master Data / Inventory UI | GET | `/api/master-data/warehouses` | `WarehouseController@index` | `warehouses.view` | Warehouses | Displayed under Inventory: shared list |
| Master Data | GET | `/api/master-data/departments` | `DepartmentController@index` | `departments.view` | Departments | Displayed: shared list |
| Master Data | GET | `/api/master-data/projects` | `ProjectController@index` | `projects.view` | Projects | Displayed: shared list |
| Settings | GET | `/api/master-data/account-mappings` | `AccountMappingController@index` | `settings.company.view` | Account Mappings | Displayed: shared list |
| Reports | GET | `/api/reports/profit-loss` | `ProfitLossController@index` | `reports.view` | Profit & Loss | Displayed: shared report |
| Reports | GET | `/api/reports/balance-sheet` | `BalanceSheetController@index` | `reports.view` | Balance Sheet | Displayed: shared report |
| Reports | GET | `/api/reports/cash-flow` | `CashFlowController@index` | `reports.view` | Cash Flow | Displayed: shared report |
| Reports | GET | `/api/reports/financial-summary` | `FinancialSummaryController@index` | `reports.view` | Financial Summary | Displayed: shared report |
| Sales & AR | GET | `/api/sales/quotations` | `SalesQuotationController@index` | `sales.quotations.view` | Sales Quotations | Displayed: shared list |
| Sales & AR | GET | `/api/sales/orders` | `SalesOrderController@index` | `sales.orders.view` | Sales Orders | Displayed: shared list |
| Sales & AR | GET | `/api/sales/delivery-orders` | `DeliveryOrderController@index` | `sales.delivery_orders.view` | Delivery Orders | Displayed: shared list |
| Sales & AR | GET | `/api/sales/proformas` | `ProformaInvoiceController@index` | `sales.proformas.view` | Proforma Invoices | Displayed: shared list |
| Sales & AR | GET | `/api/sales/invoices` | `SalesInvoiceController@index` | `sales.invoices.view` | Sales Invoices | Displayed: shared list |
| Sales & AR | GET | `/api/sales/billings` | `BillingInvoiceController@index` | `sales.billings.view` | Billing Invoices | Displayed: shared list |
| Sales & AR | GET | `/api/sales/receipts` | `SalesReceiptController@index` | `sales.receipts.view` | Sales Receipts | Displayed: shared list |
| Sales & AR | GET | `/api/sales/customer-deposits` | `CustomerDepositController@index` | `sales.deposits.view` | Customer Deposits | Displayed: shared list |
| Sales & AR | GET | `/api/sales/returns` | `SalesReturnController@index` | `sales.returns.view` | Sales Returns | Displayed: shared list |
| Sales & AR | GET | `/api/sales/ar/aging` | `AccountsReceivableController@aging` | `sales.ar.view` | AR Aging | Displayed: shared report |
| Purchase & AP | GET | `/api/purchase/requests` | `PurchaseRequestController@index` | `purchase.requests.view` | Purchase Requests | Displayed: shared list |
| Purchase & AP | GET | `/api/purchase/orders` | `PurchaseOrderController@index` | `purchase.orders.view` | Purchase Orders | Displayed: shared list |
| Purchase & AP | GET | `/api/purchase/goods-receipts` | `GoodsReceiptController@index` | `purchase.goods_receipts.view` | Goods Receipts | Displayed: shared list |
| Purchase & AP | GET | `/api/purchase/bills` | `VendorBillController@index` | `purchase.bills.view` | Vendor Bills | Displayed: shared list |
| Purchase & AP | GET | `/api/purchase/payments` | `VendorPaymentController@index` | `purchase.payments.view` | Vendor Payments | Displayed: shared list |
| Purchase & AP | GET | `/api/purchase/vendor-deposits` | `VendorDepositController@index` | `purchase.deposits.view` | Vendor Deposits | Displayed: shared list |
| Purchase & AP | GET | `/api/purchase/returns` | `PurchaseReturnController@index` | `purchase.returns.view` | Purchase Returns | Displayed: shared list |
| Purchase & AP | GET | `/api/purchase/ap/aging` | `AccountsPayableController@aging` | `purchase.ap.view` | AP Aging | Displayed: shared report |
| Cash & Bank | GET | `/api/cash-bank/cash-receipts` | `CashReceiptController@index` | `cash_bank.view` | Cash Receipts | Displayed: shared list |
| Cash & Bank | GET | `/api/cash-bank/cash-payments` | `CashPaymentController@index` | `cash_bank.view` | Cash Payments | Displayed: shared list |
| Cash & Bank | GET | `/api/cash-bank/bank-transfers` | `BankTransferController@index` | `cash_bank.view` | Bank Transfers | Displayed: shared list |
| Cash & Bank | GET | `/api/cash-bank/bank-reconciliations` | `BankReconciliationController@index` | `cash_bank.view` | Bank Reconciliation | Displayed: shared list |
| Inventory | GET | `/api/inventory/stock-balances` | `StockBalanceController@index` | `inventory.stock.view` | Stock Balances | Displayed: shared list |
| Inventory | GET | `/api/inventory/stock-movements` | `StockMovementController@index` | `inventory.movements.view` | Stock Movements | Displayed: shared list |
| Inventory | GET | `/api/inventory/stock-adjustments` | `StockAdjustmentController@index` | `inventory.adjustments.view` | Stock Adjustments | Displayed: shared list |
| Inventory | GET | `/api/inventory/stock-opnames` | `StockOpnameController@index` | `inventory.opname.view` | Stock Opname | Displayed: shared list |
| Inventory | GET | `/api/inventory/valuation` | `InventoryValuationController@current` | `inventory.valuation.view` | Inventory Valuation | Displayed: shared report |
| Settings | GET | `/api/settings/company` | `CompanySettingController@show` | `settings.company.view` | Company Settings | Displayed: shared landing |

## Sidebar Mapping

All backend-backed menu candidates below are present when the user has their
permission. `Dashboard` remains the fixed workspace entry. A group with no permitted
children is not rendered. Items without final Vue modules open a reusable API-backed
list workspace using the real endpoint.

| Sidebar Group | Items Enabled | Page Status |
| --- | --- | --- |
| Dashboard | Dashboard | Implemented |
| Master Data | Chart of Accounts; Contacts; Units; Departments; Projects | COA implemented; others shared lists |
| Accounting | Journal Entries; Period Locks | Journal implemented; period locks shared landing |
| Reports | General Ledger; Trial Balance; Profit & Loss; Balance Sheet; Cash Flow; Financial Summary | Ledger/trial balance implemented; others shared lists |
| Sales & AR | Sales Quotations; Sales Orders; Delivery Orders; Proforma Invoices; Sales Invoices; Billing Invoices; Customer Deposits; Sales Receipts; Sales Returns; Customer Summary; Open Invoices; AR Aging; AR Reconciliation | Shared lists/reports |
| Purchase & AP | Purchase Requests; Purchase Orders; Goods Receipts; Vendor Bills; Vendor Deposits; Vendor Payments; Purchase Returns; Vendor Summary; Open Bills; AP Aging; AP Reconciliation | Shared lists/reports |
| Cash & Bank | Cash & Bank Accounts; Cash Receipts; Cash Payments; Bank Transfers; Bank Reconciliation | Shared lists |
| Inventory | Product Categories; Products; Warehouses; Stock Balances; Stock Movements; Stock Adjustments; Stock Opname; Inventory Valuation | Shared lists/reports; catalogue resources retain `/api/master-data/*` endpoints |
| Inventory Reports | Stock Balance Report; Stock Movement Report; Valuation Report; Low Stock Report; Negative Stock Report | Shared reports |
| Settings | Company Settings; Account Mappings | Shared landing/list |

## Hidden / Not Displayed Endpoints

| Endpoint | Reason |
| --- | --- |
| `/api/auth/*`, `/api/companies*` | Authentication and company-selection flow, not workspace lists |
| `/api/tenant-context-test`, `/api/health` | Internal/health endpoints |
| Resource `POST`, `PATCH`, approve/post/void/cancel/close endpoints | Actions inside future pages, not list menu entries |
| `/api/accounting/fiscal-years/{id}/*` | Requires fiscal-year context; not a standalone list workspace |
| Detail endpoints containing an entity identifier | Accessed from future module detail UI, not standalone sidebar entries |
| `/api/cash-bank/reports/account-statement` | Requires selected cash/bank account; future drill-down page |
| `/api/inventory/reports/stock-card` | Requires selected product; future drill-down page |

## Remaining Designed Pages

| Scope | Current Coverage | Remaining Work |
| --- | --- | --- |
| Resources without specific designs | API-backed shared workspace list | Module-specific forms, workflow actions and refined columns after design approval |

## Menu Not Displayed

| Candidate | Reason |
| --- | --- |
| Role & Permission | `/api/auth/permissions` supplies authorization context; no user/role management resource endpoint is available |

## Integration Notes

- Sidebar configuration is defined in `frontend-vue/src/navigation/sidebar.ts`.
- Resources without specific designs render through `BackendResourceWorkspace.vue`
  using `WorkspaceListPage` and the existing Axios client.
- `Product Categories`, `Products`, and `Warehouses` are grouped under Inventory
  for navigation while retaining their `/master-data/*` API endpoints and permissions.
- Sidebar clicks still call `workspaceTabsStore.openPrimaryTab`, so active primary
  tabs and secondary draft tabs are preserved.
- Existing Axios/auth/company/tenant request behavior was not changed.
- No backend endpoint or permission definition was changed.
