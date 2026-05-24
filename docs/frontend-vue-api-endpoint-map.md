# Frontend Vue API Endpoint Map

Generated from `backend/routes/api.php` and verified with `php artisan route:list --path=api`.

All tenant-scoped requests require:

- `Authorization: Bearer TOKEN`
- `X-Company-ID: ACTIVE_COMPANY_ID`
- `Accept: application/json`
- `Content-Type: application/json`

Frontend API foundation:

- API client: `frontend-vue/src/services/api.ts`
- Compatibility export: `frontend-vue/src/api.ts`
- Shared CRUD/action helper: `frontend-vue/src/services/resource.service.ts`
- Generic workspace list integration: `frontend-vue/src/features/workspace/backend-resource/*`
- Virtual tabs store: `frontend-vue/src/stores/workspaceTabsStore.ts`

No backend `DELETE` route is exposed for accounting, sales, purchase, cash-bank, or inventory transactions. UI must use lifecycle actions such as `void`, `cancel`, `close`, `deactivate`, or `activate` only when the route exists.

## Auth, Company, Settings

| Module | Methods and paths | Controller/action | Permission | Frontend route | Service method | Supported actions | Notes |
|---|---|---|---|---|---|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout` | `AuthController` | auth for `me/logout` | `/login` | existing auth services | register, login, me, logout | not tenant-scoped except company selection flow |
| Permissions | `GET /api/auth/permissions` | `PermissionController@index` | authenticated company user | app shell | permissions service | list | used for menu/action gating |
| Companies | `GET /api/companies`, `POST /api/companies/select` | `CompanyController@index/select` | authenticated | `/select-company` | company service | list, select | selection establishes active company |
| Company settings | `GET /api/settings/company`, `PATCH /api/settings/company/accounting`, `PATCH /api/settings/company/modules` | `CompanySettingController@show/updateAccounting/updateModules` | `settings.company.view`, `settings.company.edit` | `/settings/company` | `get`, `updateAccounting`, `updateModules` | read, update | no delete |
| Dashboard fiscal status | `GET /api/accounting/fiscal-year/status` | `FiscalYearStatusController` | `dashboard.view` | `/dashboard` | dashboard/fiscal status | read | read-only |

## Master Data and Dimensions

| Module | Methods and paths | Controller/action | Permission | Frontend route | Service method | Supported actions | Notes |
|---|---|---|---|---|---|---|---|
| Chart of Accounts | `GET/POST /api/master-data/chart-of-accounts`, `GET/PATCH /api/master-data/chart-of-accounts/{id}`, `PATCH /{id}/activate`, `PATCH /{id}/deactivate` | `ChartOfAccountController@index/store/show/update/activate/deactivate` | `coa.view/create/edit/deactivate` | `/accounting/chart-of-accounts` | `chartOfAccountsService.list/get/create/update/activate/deactivate` | create, edit, detail, activate, deactivate | no hard delete |
| Contacts | `GET/POST /api/master-data/contacts`, `GET/PATCH /api/master-data/contacts/{id}`, `PATCH /{id}/activate`, `PATCH /{id}/deactivate` | `ContactController@index/store/show/update/activate/deactivate` | `contacts.view/create/edit/deactivate` | `/master-data/contacts` | `contactsService.*` | create, edit, detail, activate, deactivate | no hard delete |
| Units | `GET/POST /api/master-data/units`, `GET/PATCH /api/master-data/units/{id}`, `PATCH /{id}/activate`, `PATCH /{id}/deactivate` | `UnitController@index/store/show/update/activate/deactivate` | `units.view/create/edit/deactivate` | `/master-data/units` | `unitsService.*` | create, edit, detail, activate, deactivate | no hard delete |
| Product Categories | `GET/POST /api/master-data/product-categories`, `GET/PATCH /api/master-data/product-categories/{id}`, `PATCH /{id}/activate`, `PATCH /{id}/deactivate` | `ProductCategoryController@index/store/show/update/activate/deactivate` | `products.view/create/edit/deactivate` | `/master-data/product-categories` | `productCategoriesService.*` | create, edit, detail, activate, deactivate | no hard delete |
| Products | `GET/POST /api/master-data/products`, `GET/PATCH /api/master-data/products/{id}`, `PATCH /{id}/activate`, `PATCH /{id}/deactivate` | `ProductController@index/store/show/update/activate/deactivate` | `products.view/create/edit/deactivate` | `/master-data/products` | `productsService.*` | create, edit, detail, activate, deactivate | no hard delete |
| Warehouses | `GET/POST /api/master-data/warehouses`, `GET/PATCH /api/master-data/warehouses/{id}`, `PATCH /{id}/activate`, `PATCH /{id}/deactivate` | `WarehouseController@index/store/show/update/activate/deactivate` | `warehouses.view/create/edit/deactivate` | `/master-data/warehouses` | `warehousesService.*` | create, edit, detail, activate, deactivate | no hard delete |
| Departments | `GET/POST /api/master-data/departments`, `GET/PATCH /api/master-data/departments/{id}`, `PATCH /{id}/activate`, `PATCH /{id}/deactivate` | `DepartmentController@index/store/show/update/activate/deactivate` | `departments.view/create/edit/deactivate` | `/master-data/departments` | `departmentsService.*` | create, edit, detail, activate, deactivate | analytical dimension |
| Projects | `GET/POST /api/master-data/projects`, `GET/PATCH /api/master-data/projects/{id}`, `PATCH /{id}/activate`, `PATCH /{id}/deactivate` | `ProjectController@index/store/show/update/activate/deactivate` | `projects.view/create/edit/deactivate` | `/master-data/projects` | `projectsService.*` | create, edit, detail, activate, deactivate | analytical dimension |
| Account Mappings | `GET /api/master-data/account-mappings`, `PATCH /api/master-data/account-mappings/{mappingKey}` | `AccountMappingController@index/update` | `settings.company.view/edit` | `/settings/account-mappings` | account mappings service pending | read, update | no create/delete route |

## Accounting

| Module | Methods and paths | Controller/action | Permission | Frontend route | Service method | Supported actions | Notes |
|---|---|---|---|---|---|---|---|
| Journals | `GET/POST /api/journals`, `GET/PATCH /api/journals/{id}`, `POST /{id}/approve`, `POST /{id}/post`, `POST /{id}/void` | `JournalEntryController@index/store/show/update/approve/post/void` | `journal.view/create/edit/approve/post/void` | `/accounting/journals` | `journalsService.list/get/create/update/approve/post/void` | draft create, edit draft, approve, post, void | no hard delete |
| Fiscal closing | `GET /api/accounting/fiscal-years/{id}/closing-preview`, `GET /closing-checklist`, `POST /close`, `POST /reopen` | `FiscalYearClosingController@preview/checklist/close/reopen` | `fiscal_year.view/closing_wizard/close/reopen` | fiscal closing page pending | fiscal years service pending | preview, checklist, close, reopen | warning/error UI required |
| Period locks | `GET /api/accounting/period-locks/status`, `PATCH /api/accounting/period-locks` | `PeriodLockController@status/update` | `fiscal_year.view/lock_manage` | `/accounting/period-locks` | period locks service pending | read, update | no delete |

## Reports

| Module | Methods and paths | Controller/action | Permission | Frontend route | Service method | Supported actions | Notes |
|---|---|---|---|---|---|---|---|
| General Ledger | `GET /api/reports/general-ledger` | `GeneralLedgerController@index` | `reports.view` | `/reports/general-ledger` | general ledger service | read | read-only |
| Account Ledger Detail | `GET /api/reports/account-ledger/{account}` | `AccountLedgerDetailController@show` | `reports.view` | detail drilldown pending | account ledger service | read | read-only |
| Trial Balance | `GET /api/reports/trial-balance` | `TrialBalanceController@index` | `reports.view` | `/accounting/trial-balance` | trial balance service | read | read-only |
| Profit Loss | `GET /api/reports/profit-loss` | `ProfitLossController@index` | `reports.view` | `/reports/profit-loss` | report service | read | read-only, date range required |
| Balance Sheet | `GET /api/reports/balance-sheet` | `BalanceSheetController@index` | `reports.view` | `/reports/balance-sheet` | report service | read | read-only, as-of date required |
| Cash Flow | `GET /api/reports/cash-flow` | `CashFlowController@index` | `reports.view` | `/reports/cash-flow` | report service | read | read-only, date range required |
| Financial Summary | `GET /api/reports/financial-summary` | `FinancialSummaryController@index` | `reports.view` | `/reports/financial-summary` | report service | read | read-only |

## Sales and AR

| Module | Methods and paths | Controller/action | Permission | Frontend route | Service method | Supported actions | Notes |
|---|---|---|---|---|---|---|---|
| Sales Quotations | `GET/POST /api/sales/quotations`, `GET/PATCH /{id}`, `PATCH /{id}/send`, `PATCH /approve`, `PATCH /accept`, `PATCH /reject`, `PATCH /cancel` | `SalesQuotationController` | `sales.quotations.*` | `/sales/quotations` | `salesQuotationsService.*` | create, edit, detail, send, approve, accept, reject, cancel | no hard delete |
| Sales Orders | `GET/POST /api/sales/orders`, `GET/PATCH /{id}`, `POST /from-quotation/{quotationId}`, `PATCH /approve`, `PATCH /confirm`, `PATCH /cancel`, `PATCH /close` | `SalesOrderController` | `sales.orders.*` | `/sales/orders` | `salesOrdersService.*` | create, edit, detail, convert, approve, confirm, cancel, close | no hard delete |
| Delivery Orders | `GET/POST /api/sales/delivery-orders`, `GET/PATCH /{id}`, `POST /from-sales-order/{salesOrderId}`, `PATCH /ready`, `PATCH /ship`, `PATCH /deliver`, `PATCH /cancel`, `PATCH /void` | `DeliveryOrderController` | `sales.delivery_orders.*` | `/sales/delivery-orders` | `deliveryOrdersService.*` | create, edit, detail, convert, ready, ship, deliver, cancel, void | no hard delete |
| Proforma Invoices | `GET/POST /api/sales/proformas`, `GET/PATCH /{id}`, `POST /from-quotation/{quotationId}`, `POST /from-sales-order/{salesOrderId}`, `PATCH /issue`, `PATCH /accept`, `PATCH /cancel` | `ProformaInvoiceController` | `sales.proformas.*` | `/sales/proformas` | `proformaInvoicesService.*` | create, edit, detail, convert, issue, accept, cancel | no hard delete |
| Sales Invoices | `GET/POST /api/sales/invoices`, `GET/PATCH /{id}`, conversion routes, `PATCH /approve`, `PATCH /post`, `PATCH /void` | `SalesInvoiceController` | `sales.invoices.*` | `/sales/invoices` | `salesInvoicesService.*` | create, edit draft, detail, convert, approve, post, void | no hard delete |
| Billing Invoices | `GET/POST /api/sales/billings`, `GET /{id}`, `POST /from-sales-invoice/{salesInvoiceId}`, `PATCH /issue`, `PATCH /cancel` | `BillingInvoiceController` | `sales.billings.*` | `/sales/billings` | billing service pending | create, detail, convert, issue, cancel | no update route |
| Customer Deposits | `GET/POST /api/sales/customer-deposits`, `GET /{id}`, `PATCH /post`, `PATCH /void`, `PATCH /refund`, `POST /allocate-to-invoice/{invoiceId}` | `CustomerDepositController` | `sales.deposits.*` | `/sales/customer-deposits` | `customerDepositsService.*` | create, detail, post, void, refund, allocate | no update route |
| Sales Receipts | `GET/POST /api/sales/receipts`, `GET /{id}`, `PATCH /post`, `PATCH /void` | `SalesReceiptController` | `sales.receipts.*` | `/sales/receipts` | `salesReceiptsService.*` | create, detail, post, void | no update route |
| Sales Returns | `GET/POST /api/sales/returns`, `GET/PATCH /{id}`, conversion routes, `PATCH /approve`, `PATCH /post`, `PATCH /void` | `SalesReturnController` | `sales.returns.*` | `/sales/returns` | `salesReturnsService.*` | create, edit, detail, convert, approve, post, void | no hard delete |
| AR reports | `GET /api/sales/ar/customer-summary`, `/customers/{customerId}/ledger`, `/invoices/{invoiceId}/ledger`, `/open-invoices`, `/aging`, `/reconciliation` | `AccountsReceivableController` | `sales.ar.view`, `sales.ar.reconcile` | `/sales/ar/*` | AR service pending | read | reports/read-only |

## Purchase and AP

| Module | Methods and paths | Controller/action | Permission | Frontend route | Service method | Supported actions | Notes |
|---|---|---|---|---|---|---|---|
| Purchase Requests | `GET/POST /api/purchase/requests`, `GET/PATCH /{id}`, `PATCH /submit`, `PATCH /approve`, `PATCH /reject`, `PATCH /cancel` | `PurchaseRequestController` | `purchase.requests.*` | `/purchase/requests` | `purchaseRequestsService.*` | create, edit, detail, submit, approve, reject, cancel | no hard delete |
| Purchase Orders | `GET/POST /api/purchase/orders`, `GET/PATCH /{id}`, `POST /from-request/{purchaseRequestId}`, `PATCH /approve`, `PATCH /confirm`, `PATCH /cancel`, `PATCH /close` | `PurchaseOrderController` | `purchase.orders.*` | `/purchase/orders` | `purchaseOrdersService.*` | create, edit, detail, convert, approve, confirm, cancel, close | no hard delete |
| Goods Receipts | `GET/POST /api/purchase/goods-receipts`, `GET/PATCH /{id}`, `POST /from-purchase-order/{purchaseOrderId}`, `PATCH /receive`, `PATCH /cancel`, `PATCH /void` | `GoodsReceiptController` | `purchase.goods_receipts.*` | `/purchase/goods-receipts` | `goodsReceiptsService.*` | create, edit, detail, convert, receive, cancel, void | no hard delete |
| Vendor Bills | `GET/POST /api/purchase/bills`, `GET/PATCH /{id}`, conversion routes, `PATCH /approve`, `PATCH /post`, `PATCH /void` | `VendorBillController` | `purchase.bills.*` | `/purchase/bills` | `vendorBillsService.*` | create, edit, detail, convert, approve, post, void | no hard delete |
| Vendor Deposits | `GET/POST /api/purchase/vendor-deposits`, `GET /{id}`, `PATCH /post`, `PATCH /void`, `PATCH /refund`, `POST /allocate-to-bill/{billId}` | `VendorDepositController` | `purchase.deposits.*` | `/purchase/vendor-deposits` | `vendorDepositsService.*` | create, detail, post, void, refund, allocate | no update route |
| Vendor Payments | `GET/POST /api/purchase/payments`, `GET /{id}`, `PATCH /post`, `PATCH /void` | `VendorPaymentController` | `purchase.payments.*` | `/purchase/payments` | `vendorPaymentsService.*` | create, detail, post, void | no update route |
| Purchase Returns | `GET/POST /api/purchase/returns`, `GET/PATCH /{id}`, conversion routes, `PATCH /approve`, `PATCH /post`, `PATCH /void` | `PurchaseReturnController` | `purchase.returns.*` | `/purchase/returns` | `purchaseReturnsService.*` | create, edit, detail, convert, approve, post, void | no hard delete |
| AP reports | `GET /api/purchase/ap/vendor-summary`, `/vendors/{vendorId}/ledger`, `/bills/{billId}/ledger`, `/open-bills`, `/aging`, `/reconciliation` | `AccountsPayableController` | `purchase.ap.view`, `purchase.ap.reconcile` | `/purchase/ap/*` | AP service pending | read | reports/read-only |

## Cash Bank

| Module | Methods and paths | Controller/action | Permission | Frontend route | Service method | Supported actions | Notes |
|---|---|---|---|---|---|---|---|
| Cash Bank Accounts | `GET /api/cash-bank/accounts` | `CashBankAccountController@index` | `cash_bank.view` | `/cash-bank/accounts` | cash bank service pending | read | read-only list currently |
| Cash Receipts | `GET/POST /api/cash-bank/cash-receipts`, `GET /{id}`, `PATCH /post`, `PATCH /void` | `CashReceiptController` | `cash_bank.view/create/post/void` | `/cash-bank/cash-receipts` | cash bank service pending | create, detail, post, void | no update/delete |
| Cash Payments | `GET/POST /api/cash-bank/cash-payments`, `GET /{id}`, `PATCH /post`, `PATCH /void` | `CashPaymentController` | `cash_bank.view/create/post/void` | `/cash-bank/cash-payments` | cash bank service pending | create, detail, post, void | no update/delete |
| Bank Transfers | `GET/POST /api/cash-bank/bank-transfers`, `GET /{id}`, `PATCH /post`, `PATCH /void` | `BankTransferController` | `cash_bank.view/transfer/post/void` | `/cash-bank/bank-transfers` | cash bank service pending | create, detail, post, void | no update/delete |
| Bank Reconciliation | `GET/POST /api/cash-bank/bank-reconciliations`, `GET/PATCH /{id}`, `POST /refresh-lines`, `POST /mark-lines` | `BankReconciliationController` | `cash_bank.view/create/edit` | `/cash-bank/bank-reconciliations` | cash bank service pending | create, edit, detail, refresh lines, mark lines | no post/void route |
| Account Statement | `GET /api/cash-bank/reports/account-statement` | `CashBankReportController@accountStatement` | `cash_bank.view` | report page pending | cash bank report service pending | read | read-only |

## Inventory

| Module | Methods and paths | Controller/action | Permission | Frontend route | Service method | Supported actions | Notes |
|---|---|---|---|---|---|---|---|
| Stock Balances | `GET /api/inventory/stock-balances`, `GET /product/{productId}`, `GET /warehouse/{warehouseId}` | `StockBalanceController@index/byProduct/byWarehouse` | `inventory.stock.view` | `/inventory/stock-balances` | inventory service pending | read | read-only quantity |
| Stock Movements | `GET/POST /api/inventory/stock-movements`, `GET /{id}`, `PATCH /post`, `PATCH /void` | `StockMovementController` | `inventory.movements.*` | `/inventory/stock-movements` | inventory service pending | create, detail, post, void | no update route |
| Stock Adjustments | `GET/POST /api/inventory/stock-adjustments`, `GET/PATCH /{id}`, `PATCH /approve`, `PATCH /post`, `PATCH /void` | `StockAdjustmentController` | `inventory.adjustments.*` | `/inventory/stock-adjustments` | inventory service pending | create, edit, detail, approve, post, void | no hard delete |
| Stock Opname | `GET/POST /api/inventory/stock-opnames`, `GET /{id}`, `POST /generate-lines`, `PATCH /lines/{lineId}`, `PATCH /counted`, `PATCH /finalize`, `PATCH /void` | `StockOpnameController` | `inventory.opname.*` | `/inventory/stock-opnames` | inventory service pending | create, detail, generate lines, update line, counted, finalize, void | no hard delete |
| Valuation | `GET /api/inventory/valuation`, `/valuation/as-of`, `/valuation/products/{productId}`, `/valuation/warehouses/{warehouseId}` | `InventoryValuationController` | `inventory.valuation.view` | `/inventory/valuation` | inventory valuation service pending | read | read-only |
| Inventory Reports | `GET /api/inventory/reports/stock-balances`, `/stock-movements`, `/stock-card`, `/valuation`, `/low-stock`, `/negative-stock` | `InventoryReportController` | `inventory.reports.view` | `/inventory/reports/*` | inventory reports service pending | read | read-only |

## Current Frontend Coverage

Implemented in this pass:

- Tenant-aware Axios client with auth/company headers and normalized 401/403/422/404/500 handling.
- Shared API types and lifecycle types.
- Thin services for Priority 1 master data/dimensions/journals.
- Thin services for key sales and purchase document endpoints.
- Generic workspace list continues to load from real backend endpoints.
- Generic row action buttons now call real lifecycle endpoints configured per module.

Still pending by design:

- Full VeeValidate/Zod module forms for every resource.
- Specialized fiscal closing, account mappings, AR/AP drilldown, cash-bank, and inventory services.
- Conversion workflows with required source document selectors.
