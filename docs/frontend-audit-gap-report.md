# Frontend Audit & Backend Integration Gap Report

Tanggal audit: 2026-05-25
Project: `TenantAppDevelopment / tenantApp`
Frontend utama yang diaudit: `frontend-vue` (Vue 3 + Vite + Pinia + Axios)
Frontend alternatif yang ditemukan: `frontend` (Next.js, dibaca sebagai referensi legacy, bukan basis status Vue)

## 1. Executive Summary

### Kesimpulan utama

- Backend Laravel sudah memiliki cakupan API luas: `280` route API aktif berdasarkan `php artisan route:list --path=api --json`.
- Roadmap aktual di [`docs/update-roadmap.md`](update-roadmap.md) menandai Phase 10 sampai Phase 17 sudah selesai dan Phase 18 aktif. Ini berbeda dari status referensi pada prompt audit yang menyatakan Phase 10-17 belum selesai.
- Frontend Vue sudah memiliki auth, pemilihan company, shell workspace, primary/secondary virtual tabs, master data, journal list, financial reports, form Sales/Purchase, serta workspace generic untuk Cash Bank dan Inventory.
- Sebagian besar menu non-khusus dirender melalui fallback API-connected [`BackendResourceWorkspace.vue`](../frontend-vue/src/features/workspace/backend-resource/BackendResourceWorkspace.vue), bukan halaman dummy.
- Risiko tertinggi bukan ketiadaan semua halaman, melainkan endpoint action dan workflow lanjutan yang ada di backend tetapi belum dipanggil oleh UI aktif Vue.

### Angka audit

| Metric | Jumlah | Dasar Hitung |
| --- | ---: | --- |
| Route API backend aktif | 280 | `php artisan route:list --path=api --json` |
| Group prefix API | 13 | Output route list dikelompokkan berdasarkan prefix pertama |
| Item menu sidebar Vue | 57 | Pemanggilan `item(...)` di `frontend-vue/src/navigation/sidebar.ts` |
| Destination navigation termasuk Dashboard | 58 | 57 item menu + dashboard group |
| Route record Vue yang terbentuk | 66 | Route eksplisit, route placeholder dinamis, design routes, auth/redirect |
| Binding konten workspace khusus | 35 | Key di `frontend-vue/src/workspace/registry.ts` |
| Config form generic backend resource | 33 | Key di `backendResource.form.config.ts` |
| Endpoint aktif dengan gap UI terkonfirmasi | 89 | 37 endpoint tanpa surface langsung + 52 lifecycle/action Sales/Purchase tidak dirender oleh UI aktif |
| Surface frontend utama yang missing/partial kritis | 8 | Fiscal closing, account-ledger, cash statement, AR ledger, AP ledger, company settings edit, access matrix, dashboard data |
| Page production yang jelas masih placeholder | 1 | Dashboard workspace |

### Risiko utama

1. **Broken integration - bulk Void transaksi Sales/Purchase.** [`WorkspaceModule.vue`](../frontend-vue/src/components/workspace/WorkspaceModule.vue) memancarkan event `void`, tetapi [`TransactionWorkspacePage.vue`](../frontend-vue/src/features/transaction-form/TransactionWorkspacePage.vue) tidak menangani event tersebut. Tombol dapat tampil tanpa menjalankan endpoint.
2. **Lifecycle actions Sales/Purchase tidak tampil pada form aktif.** Service/action config tersedia, tetapi [`TransactionFormPanel.vue`](../frontend-vue/src/features/transaction-form/TransactionFormPanel.vue) hanya merender tombol `Save`.
3. **Phase 18 access frontend tidak dapat dipakai.** Komponen/service Vue dan controller Laravel ditemukan, tetapi `/api/access/*` tidak muncul dalam route list aktif dan route/menu Vue menuju halaman access juga tidak ditemukan.
4. **Settings dan fiscal closing hanya sebagian tersambung.** Endpoint update/closing ada, tetapi Vue belum menyediakan surface operasional lengkap.
5. **Pagination/sorting/filter remote perlu verifikasi.** Generic backend workspace mengambil data sekali lalu menyaring client-side; ini berisiko tidak lengkap untuk dataset paginated.

### Prioritas berikutnya

- [ ] Perbaiki wiring bulk void dan lifecycle action pada workspace transaksi Sales/Purchase.
- [ ] Hubungkan conversion/source-chain endpoint Sales/Purchase.
- [ ] Tutup mismatch Phase 18: registrasi backend route dan navigation Vue untuk access matrix.
- [ ] Buat UI fiscal closing/period locking Vue yang memakai endpoint existing.
- [ ] Lengkapi AR/AP ledger detail dan cash-bank account statement.
- [ ] Audit kontrak pagination/filter/sort generic workspace terhadap response backend.

## 2. Audit Scope

### Area yang diperiksa

- [x] Backend endpoint map audited: [`backend/routes/api.php`](../backend/routes/api.php) dan runtime route list.
- [x] Controller/service backend dibaca secara struktural pada `backend/app/Http/Controllers/Api` dan `backend/app/Services`.
- [x] Permission dan document number config dibaca: [`permissions.php`](../backend/config/permissions.php), [`document_numbers.php`](../backend/config/document_numbers.php).
- [x] Roadmap aktual dibaca: [`update-roadmap.md`](update-roadmap.md), [`roadmap-frontend-vuejs-tenantappdevelopment.md`](roadmap-frontend-vuejs-tenantappdevelopment.md), prompt Phase 13/14, dan Phase 18.
- [x] Frontend route map audited: [`router/index.ts`](../frontend-vue/src/router/index.ts).
- [x] Sidebar/menu audited: [`navigation/sidebar.ts`](../frontend-vue/src/navigation/sidebar.ts).
- [x] API client audited: [`services/api.ts`](../frontend-vue/src/services/api.ts), [`plugins/apiInterceptors.ts`](../frontend-vue/src/plugins/apiInterceptors.ts).
- [x] Workspace list/form audited: `frontend-vue/src/components/workspace`, `features/workspace`, `features/transaction-form`.
- [x] Virtual tabs/draft state audited: [`workspaceTabsStore.ts`](../frontend-vue/src/stores/workspaceTabsStore.ts).
- [x] Dummy/temporary markers audited dengan `rg`.
- [x] Backend-frontend connection compared.
- [x] Next.js folder dicatat sebagai frontend alternatif; status implementasi utama dinilai dari Vue.

### Kondisi working tree sebelum audit

```text
## main...origin/main
?? docs/Frontend/header-form.md
?? docs/audit-check.md
```

Kedua file tersebut sudah ada sebelum laporan dibuat dan tidak dimodifikasi dalam audit ini.

### Metode status

| Status | Arti |
| --- | --- |
| Done | Page/service aktif ditemukan dan memanggil endpoint backend terkait. |
| Partial | API dasar terhubung, tetapi action, workflow, filter, atau UX penting belum lengkap. |
| Generic Connected | Endpoint ditampilkan melalui `BackendResourceWorkspace`, bukan page khusus. |
| Broken / Needs Review | Kode mengindikasikan event/path tidak mencapai endpoint atau route mismatch. |
| Missing | Tidak ditemukan surface frontend untuk endpoint aktif. |
| Needs verification | Perlu runtime/manual/authenticated test untuk memastikan kontrak data. |

## 3. Backend Endpoint Map

### Ringkasan runtime route list

| Prefix Module | Route Aktif | Auth / Tenant Policy Umum | Status Backend |
| --- | ---: | --- | --- |
| `health` | 1 | Public | Ada |
| `auth` | 5 | Login/register public; me/logout protected; permissions tenant-aware | Ada |
| `companies` | 2 | `auth:sanctum` | Ada |
| `tenant-context-test` | 1 | `auth:sanctum`, `company.access` | Ada, internal/test |
| `settings` | 3 | `auth:sanctum`, `company.access`, permission settings | Ada |
| `accounting` | 7 | `auth:sanctum`, `company.access`, fiscal permission | Ada |
| `master-data` | 50 | `auth:sanctum`, `company.access`, module permission | Ada |
| `journals` | 7 | `auth:sanctum`, `company.access`, journal permission | Ada |
| `reports` | 7 | `auth:sanctum`, `company.access`, `reports.view` | Ada |
| `sales` | 80 | `auth:sanctum`, `company.access`, sales permission | Ada |
| `purchase` | 61 | `auth:sanctum`, `company.access`, purchase permission | Ada |
| `cash-bank` | 23 | `auth:sanctum`, `company.access`, `cash_bank.*` | Ada |
| `inventory` | 33 | `auth:sanctum`, `company.access`, inventory permission | Ada |
| **Total** | **280** |  |  |

### Endpoint map terkelompok

Notasi `{CRUD}` berarti route list/show/create/update yang nyata ditemukan; action setelah titik koma adalah route tambahan nyata. Kolom frontend mengacu pada Vue aktif.

| Module | Method / Endpoint Aktif | Controller / Action | Permission | Frontend Status |
| --- | --- | --- | --- | --- |
| Health | `GET /api/health` | `HealthController@index` | Public | Missing UI, acceptable operational endpoint |
| Auth | `POST /api/auth/register`, `POST /login`, `GET /me`, `POST /logout`, `GET /permissions` | `AuthController`, `PermissionController` | Mixed auth/company | Login/logout/permissions Done; register/me Needs verification |
| Company | `GET /api/companies`, `POST /api/companies/select` | `CompanyController` | Auth | Done via `companyApi.ts` |
| Settings | `GET /api/settings/company`; `PATCH /accounting`, `/modules` | `CompanySettingController` | `settings.company.*` | GET Generic Connected; PATCH Missing |
| Fiscal Status | `GET /api/accounting/fiscal-year/status` | `FiscalYearStatusController` | `dashboard.view` | Metadata exists; dashboard does not call API |
| Fiscal Closing | `GET /fiscal-years/{id}/closing-preview`, `GET /closing-checklist`, `POST /close`, `POST /reopen` | `FiscalYearClosingController` | `fiscal_year.*` | Missing in Vue |
| Period Locks | `GET /api/accounting/period-locks/status`, `PATCH /period-locks` | `PeriodLockController` | `fiscal_year.*` | GET Generic Connected; PATCH Missing |
| COA | `{CRUD} /api/master-data/chart-of-accounts`; `PATCH /activate`, `/deactivate` | `ChartOfAccountController` | `coa.*` | Done via dedicated workspace/service |
| Contacts | `{CRUD} /api/master-data/contacts`; activate/deactivate | `ContactController` | `contacts.*` | Generic Connected |
| Units | `{CRUD} /api/master-data/units`; activate/deactivate | `UnitController` | `units.*` | Generic Connected |
| Product Categories | `{CRUD} /api/master-data/product-categories`; activate/deactivate | `ProductCategoryController` | `products.*` | Generic Connected |
| Products | `{CRUD} /api/master-data/products`; activate/deactivate | `ProductController` | `products.*` | Generic Connected; history added to product detail |
| Warehouses | `{CRUD} /api/master-data/warehouses`; activate/deactivate | `WarehouseController` | `warehouses.*` | Generic Connected |
| Departments | `{CRUD} /api/master-data/departments`; activate/deactivate | `DepartmentController` | `departments.*` | Generic Connected |
| Projects | `{CRUD} /api/master-data/projects`; activate/deactivate | `ProjectController` | `projects.*` | Generic Connected |
| Account Mappings | `GET /api/master-data/account-mappings`, `PATCH /{mappingKey}` | `AccountMappingController` | settings permission | Generic Connected |
| Journals | `{CRUD} /api/journals`; `POST /approve`, `/post`, `/void` | `JournalEntryController` | `journal.*` | List/void Done; form/action needs verification |
| General Ledger | `GET /api/reports/general-ledger` | `GeneralLedgerController@index` | `reports.view` | Done |
| Account Ledger | `GET /api/reports/account-ledger/{account}` | `AccountLedgerDetailController@show` | `reports.view` | Service exists; no Vue route/page |
| Trial Balance | `GET /api/reports/trial-balance` | `TrialBalanceController@index` | `reports.view` | Done |
| Profit & Loss | `GET /api/reports/profit-loss` | `ProfitLossController@index` | `reports.view` | Done |
| Balance Sheet | `GET /api/reports/balance-sheet` | `BalanceSheetController@index` | `reports.view` | Done |
| Cash Flow | `GET /api/reports/cash-flow` | `CashFlowController@index` | `reports.view` | Done |
| Financial Summary | `GET /api/reports/financial-summary` | `FinancialSummaryController@index` | `reports.view` | Done |
| Sales Quotation | `{CRUD} /api/sales/quotations`; send/approve/accept/reject/cancel | `SalesQuotationController` | `sales.quotations.*` | CRUD Done; actions not rendered by active form |
| Sales Order | `{CRUD} /api/sales/orders`; `POST /from-quotation/{id}`; approve/confirm/cancel/close | `SalesOrderController` | `sales.orders.*` | CRUD Done; action/conversion gap |
| Delivery Order | `{CRUD} /api/sales/delivery-orders`; from-sales-order; ready/ship/deliver/cancel/void | `DeliveryOrderController` | `sales.delivery_orders.*` | CRUD Done; action/conversion gap |
| Proforma Invoice | `{CRUD} /api/sales/proformas`; from-quotation/from-sales-order; issue/accept/cancel | `ProformaInvoiceController` | `sales.proformas.*` | CRUD Done; action/conversion gap |
| Sales Invoice | `{CRUD} /api/sales/invoices`; from DO/proforma/SO; approve/post/void | `SalesInvoiceController` | `sales.invoices.*` | CRUD Done; action/conversion gap |
| Billing Invoice | list/create/show; from-sales-invoice; issue/cancel | `BillingInvoiceController` | `sales.billings.*` | Basic create/show Done; action/conversion gap |
| Customer Deposit | list/create/show; post/void/refund; allocate-to-invoice | `CustomerDepositController` | `sales.deposits.*` | Basic CRUD Done; action/allocation gap |
| Sales Receipt | list/create/show; post/void | `SalesReceiptController` | `sales.receipts.*` | Basic CRUD Done; action gap |
| Sales Return | `{CRUD}`; from-invoice/from-delivery-order; approve/post/void | `SalesReturnController` | `sales.returns.*` | CRUD Done; action/conversion gap |
| AR Reports | customer-summary, customer/invoice ledger, open-invoices, aging, reconciliation | `AccountsReceivableController` | `sales.ar.*` | Summary/open/aging/reconciliation Generic Connected; ledger detail Missing |
| Purchase Request | `{CRUD}`; submit/approve/reject/cancel | `PurchaseRequestController` | `purchase.requests.*` | CRUD Done; actions not rendered |
| Purchase Order | `{CRUD}`; from-request; approve/confirm/cancel/close | `PurchaseOrderController` | `purchase.orders.*` | CRUD Done; action/conversion gap |
| Goods Receipt | `{CRUD}`; from-purchase-order; receive/cancel/void | `GoodsReceiptController` | `purchase.goods_receipts.*` | CRUD Done; action/conversion gap |
| Vendor Bill | `{CRUD}`; from-PO/from-GR; approve/post/void | `VendorBillController` | `purchase.bills.*` | CRUD Done; action/conversion gap |
| Vendor Deposit | list/create/show; post/void/refund; allocate-to-bill | `VendorDepositController` | `purchase.deposits.*` | Basic CRUD Done; action/allocation gap |
| Vendor Payment | list/create/show; post/void | `VendorPaymentController` | `purchase.payments.*` | Basic CRUD Done; action gap |
| Purchase Return | `{CRUD}`; from-bill/from-GR; approve/post/void | `PurchaseReturnController` | `purchase.returns.*` | CRUD Done; action/conversion gap |
| AP Reports | vendor-summary, vendor/bill ledger, open-bills, aging, reconciliation | `AccountsPayableController` | `purchase.ap.*` | Summary/open/aging/reconciliation Generic Connected; ledger detail Missing |
| Cash Bank Accounts | `GET /api/cash-bank/accounts` | `CashBankAccountController@index` | `cash_bank.view` | Generic Connected, list-only |
| Cash Receipt | list/create/show; post/void | `CashReceiptController` | `cash_bank.*` | Generic Connected including actions |
| Cash Payment | list/create/show; post/void | `CashPaymentController` | `cash_bank.*` | Generic Connected including actions |
| Bank Transfer | list/create/show; post/void | `BankTransferController` | `cash_bank.*` | Generic Connected including actions |
| Bank Reconciliation | list/create/show/update; refresh-lines/mark-lines | `BankReconciliationController` | `cash_bank.*` | Generic Connected; mark-lines Needs verification |
| Cash Bank Report | `GET /api/cash-bank/reports/account-statement` | `CashBankReportController` | `cash_bank.view` | Missing menu/page |
| Stock Balance | `GET /api/inventory/stock-balances`; by-product/by-warehouse | `StockBalanceController` | `inventory.stock.view` | Base list Generic Connected; drilldowns Missing |
| Stock Movement | list/create/show; post/void | `StockMovementController` | `inventory.movements.*` | Generic Connected |
| Stock Adjustment | `{CRUD}`; approve/post/void | `StockAdjustmentController` | `inventory.adjustments.*` | Generic Connected |
| Stock Opname | list/create/show; generate-lines/update-line/counted/finalize/void | `StockOpnameController` | `inventory.opname.*` | Generic Connected; line editing Needs verification |
| Inventory Reports | stock-balances, stock-movements, stock-card, valuation, low-stock, negative-stock | `InventoryReportController` | `inventory.reports.view` | Report menus Generic Connected; stock-card connected from Product Detail |
| Inventory Valuation | current, as-of, by-product, by-warehouse | `InventoryValuationController` | `inventory.valuation.view` | Current Generic Connected; drilldowns/as-of Missing |

### Backend route gap khusus Access / Phase 18

Controller ditemukan pada:

- `backend/app/Http/Controllers/Api/Access/RoleAccessController.php`
- `backend/app/Http/Controllers/Api/Access/CompanyUserAccessController.php`
- `backend/app/Http/Controllers/Api/Access/PermissionCatalogController.php`
- `backend/app/Http/Controllers/Api/Access/CompanyInvitationAccessController.php`

Namun `php artisan route:list --path=api --json` tidak menampilkan route `/api/access/*`, walaupun Vue memiliki service pada `frontend-vue/src/services/access/*` dan page pada `frontend-vue/src/pages/access/*`.

Status: **Broken / Needs Review**. Controller yang ada bukan endpoint aktif sampai route didaftarkan.

## 4. Frontend Route Map

### Arsitektur routing Vue

- [`router/index.ts`](../frontend-vue/src/router/index.ts) mendefinisikan auth routes, workspace shell, route khusus Accounting/Reports, route design, dan `placeholderWorkspaceRoutes`.
- `placeholderWorkspaceRoutes` bukan otomatis dummy UI: active content jatuh ke [`BackendResourceWorkspaceContent.vue`](../frontend-vue/src/pages/workspace/BackendResourceWorkspaceContent.vue) melalui [`WorkspaceContentArea.vue`](../frontend-vue/src/workspace/WorkspaceContentArea.vue) dan memanggil API.
- [`workspace/registry.ts`](../frontend-vue/src/workspace/registry.ts) mengganti fallback untuk halaman khusus Sales, Purchase, Reports, Journal, COA, dan access.

### Route/page utama

| Module | Frontend Route | Page / Registry Content | Menu Status | API Status | Implementation Status |
| --- | --- | --- | --- | --- | --- |
| Auth | `/login` | `pages/auth/LoginPage.vue` | Public | `/auth/login`, `/auth/logout` | Done |
| Company | `/select-company` | `pages/auth/SelectCompanyPage.vue` | Auth flow | `/companies`, `/companies/select`, `/auth/permissions` | Done |
| Dashboard | `/dashboard` | `DashboardWorkspaceContent.vue` | Ada | Metadata endpoint ada, UI placeholder | Dummy / Partial |
| Journals | `/accounting/journals` | `JournalWorkspaceContent.vue` | Ada | `/journals`, `/void` | Done / Needs action review |
| COA | `/accounting/chart-of-accounts` | `ChartOfAccountsWorkspaceContent.vue` | Ada | Master data COA | Done |
| General Ledger | `/reports/general-ledger` | `GeneralLedgerWorkspaceContent.vue` | Ada | `/reports/general-ledger` | Done |
| Trial Balance | `/accounting/trial-balance` | `TrialBalanceWorkspaceContent.vue` | Ada | `/reports/trial-balance` | Done |
| Profit & Loss | `/reports/profit-loss` | `FinancialStatementWorkspace.vue` | Ada | `/reports/profit-loss` | Done |
| Balance Sheet | `/reports/balance-sheet` | `FinancialStatementWorkspace.vue` | Ada | `/reports/balance-sheet` | Done |
| Cash Flow | `/reports/cash-flow` | `FinancialStatementWorkspace.vue` | Ada | `/reports/cash-flow` | Done |
| Financial Summary | `/reports/financial-summary` | `FinancialStatementWorkspace.vue` | Ada | `/reports/financial-summary` | Done |
| Contacts / Units / Dimensions | `/master-data/*` | generic backend resource | Ada | CRUD base endpoints | Generic Connected |
| Categories / Products / Warehouses | `/master-data/*` | generic backend resource | Ada | CRUD base endpoints | Generic Connected |
| Product History | Product detail internal tab | `InventoryHistoryPanel.vue` | Internal tab | `/inventory/reports/stock-card` | Done / product-only |
| Sales documents | `/sales/*` | transaction form pages | Ada | list/create/show/update | Partial: lifecycle missing |
| Sales AR summaries | `/sales/ar/*` | generic backend resource wrappers | Ada | report endpoints | Generic Connected / ledger missing |
| Purchase documents | `/purchase/*` | transaction form pages | Ada | list/create/show/update | Partial: lifecycle missing |
| Purchase AP summaries | `/purchase/ap/*` | generic backend resource wrappers | Ada | report endpoints | Generic Connected / ledger missing |
| Cash & Bank | `/cash-bank/*` | generic backend resource | Ada | CRUD/action base | Generic Connected |
| Inventory operations | `/inventory/*` | generic backend resource | Ada | CRUD/action base | Generic Connected / Needs verification |
| Inventory reports | `/inventory/reports/*` | generic backend resource | Ada | report endpoints | Generic Connected |
| Settings | `/settings/*` | generic backend resource | Ada | read endpoint | Partial |
| Access matrix | No router/sidebar route found | pages exist in registry | Tidak ada | Backend route absent | Broken / inaccessible |

## 5. Backend Endpoint Not Connected to Frontend

Hitungan berikut mencakup endpoint aktif backend yang secara statis terkonfirmasi tidak memiliki invocation UI aktif atau memiliki service/config tetapi panel aktif tidak merender action.

### Accounting - 9 endpoint

- [ ] `GET /api/accounting/fiscal-year/status` belum dipakai oleh dashboard yang masih placeholder.
- [ ] Empat endpoint fiscal closing belum memiliki Vue page: `closing-preview`, `closing-checklist`, `close`, `reopen`.
- [ ] `PATCH /api/accounting/period-locks` belum memiliki editor Vue.
- [ ] Dua update company settings (`/accounting`, `/modules`) belum memiliki form operasional Vue.
- [ ] `GET /api/reports/account-ledger/{account}` memiliki function service, tetapi tidak memiliki route/page Vue.

### Sales - 43 endpoint

- [ ] `GET /api/sales/ar/customers/{customerId}/ledger` dan `/ar/invoices/{invoiceId}/ledger` belum memiliki page detail Vue.
- [ ] Sepuluh conversion/source endpoints belum terlihat dipanggil dari UI aktif: order from quotation, delivery from order, proforma from quotation/order, invoice from delivery/proforma/order, billing from invoice, return from invoice/delivery.
- [ ] `POST /api/sales/customer-deposits/{id}/allocate-to-invoice/{invoiceId}` belum terekspos.
- [ ] Tiga puluh lifecycle endpoint terkonfigurasi di backend/service tetapi `TransactionFormPanel.vue` hanya menampilkan `Save`, sehingga send/approve/issue/post/void/cancel/refund/deliver/close belum menjadi aksi UI aktif.

### Purchase - 31 endpoint

- [ ] `GET /api/purchase/ap/vendors/{vendorId}/ledger` dan `/ap/bills/{billId}/ledger` belum memiliki page detail Vue.
- [ ] Enam conversion/source endpoints belum terlihat dipanggil: order from request, receipt from PO, bill from PO/GR, return from bill/GR.
- [ ] `POST /api/purchase/vendor-deposits/{id}/allocate-to-bill/{billId}` belum terekspos.
- [ ] Dua puluh dua lifecycle endpoint service/config belum dirender sebagai aksi pada form transaksi aktif.

### Cash Bank - 1 endpoint

- [ ] `GET /api/cash-bank/reports/account-statement` belum memiliki menu/page/service Vue yang ditemukan.

### Inventory - 5 endpoint

- [ ] Stock balance drilldown `GET .../stock-balances/product/{productId}` belum memiliki direct UI call.
- [ ] Stock balance drilldown `GET .../stock-balances/warehouse/{warehouseId}` belum memiliki direct UI call.
- [ ] Inventory valuation `GET .../valuation/as-of`, `/products/{productId}`, `/warehouses/{warehouseId}` belum memiliki direct UI call.

### Di luar hitungan endpoint aktif: Access / Phase 18

- [ ] Vue memanggil `/access/company-users`, `/access/roles`, `/access/permission-catalog`, dan permission override endpoints, tetapi endpoint tersebut **tidak aktif dalam backend route list**. Ini perlu registrasi route backend atau penghapusan surface sampai endpoint aktif, melalui task implementasi terpisah.

## 6. Frontend Pages Missing

| Prioritas | Surface Frontend Missing / Tidak Operasional | Backend Tersedia | Catatan |
| --- | --- | --- | --- |
| Critical | Access / Permission Matrix navigation dan API aktif | Controller ditemukan, route tidak aktif | UI ada tetapi tidak dapat dijangkau/dipakai secara valid |
| High | Fiscal Closing workspace | Ya, 4 endpoint closing | Tidak ada menu/page Vue |
| High | Transaction lifecycle/action bar Sales & Purchase | Ya | Form aktif hanya `Save` |
| High | Bulk Void Sales/Purchase wiring | Ya pada banyak dokumen | Tombol/event tidak mencapai handler |
| Medium | Account Ledger Detail | Ya | Service ada, page/menu tidak ditemukan |
| Medium | AR customer/invoice ledger detail | Ya | Summary/report generic ada, drilldown tidak ada |
| Medium | AP vendor/bill ledger detail | Ya | Summary/report generic ada, drilldown tidak ada |
| Medium | Cash Bank Account Statement | Ya | Page/menu tidak ditemukan |
| Medium | Company Settings edit / modules configuration | Ya | Menu generic hanya read/list |
| Medium | Inventory valuation/stock balance drilldown views | Ya | Halaman ringkas generic ada |

## 7. Pages Still Using Dummy / Temporary State

| Module | File | Dummy / Temporary Data | Required Endpoint / Direction | Recommended Fix |
| --- | --- | --- | --- | --- |
| Dashboard | `frontend-vue/src/pages/dashboard/DashboardWorkspaceContent.vue` | Tiga metric bernilai `Rp 0` dan teks placeholder | `/api/accounting/fiscal-year/status` dan agregat/report yang disetujui | Implement widget hanya setelah design/API scope dikunci |
| Accounting legacy store | `frontend-vue/src/stores/mockAccountingDataStore.ts` | Mock COA, journal, ledger, trial balance | Endpoint accounting/report existing | Hapus atau isolasi dari production setelah memastikan tidak diimport; saat audit tidak ditemukan consumer lain |
| AR service | `frontend-vue/src/services/sales/ar.service.ts` | File service kosong bertanda placeholder | `/api/sales/ar/*` | Buat typed service dan page detail untuk ledger |
| AP service | `frontend-vue/src/services/purchase/ap.service.ts` | File service kosong bertanda placeholder | `/api/purchase/ap/*` | Buat typed service dan page detail untuk ledger |
| Workspace fallback dormant | `frontend-vue/src/pages/workspace/PlaceholderWorkspaceContent.vue` | Teks "halaman frontend belum diimplementasi" | N/A | Konfirmasi masih diperlukan; fallback aktif saat ini menggunakan backend resource |
| Design routes | `frontend-vue/src/pages/design/*.vue` | Placeholder action/data eksplisit | N/A, route development only | Tidak dianggap defect production bila dibatasi permission dev |

Page production yang jelas menampilkan data placeholder saat runtime normal: **1 (`Dashboard`)**. Artifact temporary/supporting yang terdeteksi: **5 area tambahan** sebagaimana tabel.

## 8. Sidebar/Menu Mismatch

- [x] Sidebar Vue bersifat permission-aware: item difilter melalui permission user pada `AppWorkspaceShell.vue`.
- [x] Semua menu Sales, Purchase, Cash Bank, Inventory utama mempunyai endpoint dasar aktif di backend.
- [ ] Tidak ada menu `Fiscal Closing` meskipun endpoint fiscal closing backend aktif.
- [ ] Tidak ada menu/page `Account Ledger Detail`; hanya General Ledger dan Trial Balance tersedia.
- [ ] Tidak ada menu untuk `Cash Bank Account Statement`.
- [ ] Tidak ada menu drilldown AR customer/invoice ledger dan AP vendor/bill ledger.
- [ ] Tidak ada navigation item `/access/users` atau `/access/roles`, walaupun registry/page Vue sudah dibuat.
- [ ] Access services mengarah ke `/access/*`, tetapi backend runtime tidak memiliki route prefix tersebut.
- [ ] `implemented` bernilai `false` untuk 49 sidebar items walaupun banyak item sudah dapat memakai generic backend workspace; flag ini membingungkan status implementasi dan perlu diselaraskan dalam task dokumentasi/cleanup, bukan di audit ini.

## 9. Workspace List Audit

| Module | List Page / Component | API Connected | Search / Filter | Pagination / Sorting | Bulk Action | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Journals | `JournalListPage.vue` | Ya | Ya | Needs verification | Bulk void handler ada | Done / Review |
| COA | `ChartOfAccountsWorkspace.vue` | Ya | Ya | Needs verification | N/A | Done |
| Reports | Dedicated report workspaces | Ya | Date/filter local + apply API | N/A | N/A | Done |
| Master Data generic | `BackendResourceWorkspace.vue` | Ya | Client-side setelah load | Tidak terbukti server-driven | N/A (`selectable: false`) | Partial |
| Sales documents | `TransactionWorkspacePage.vue` + `WorkspaceModule.vue` | Ya | Remote basic | Pagination/sorting state tidak terlihat terkirim dari page | Void event tanpa handler | Broken / Needs Review |
| Purchase documents | Sama seperti Sales | Ya | Remote basic | Needs verification | Void event tanpa handler | Broken / Needs Review |
| AR / AP summary menus | Generic backend resource | Ya | Client-side generic | Needs verification | N/A | Generic Connected |
| Cash Bank | Generic backend resource | Ya | Client-side generic | Needs verification | N/A | Generic Connected |
| Inventory | Generic backend resource | Ya | Client-side generic | Needs verification | N/A | Generic Connected |
| Settings | Generic backend resource | GET saja efektif | Minimal | N/A | N/A | Partial |

### Finding workspace berisiko

- [`TransactionWorkspacePage.vue`](../frontend-vue/src/features/transaction-form/TransactionWorkspacePage.vue) menggunakan `<WorkspaceModule ... @create="openCreate">` tanpa `@void`.
- [`WorkspaceModule.vue`](../frontend-vue/src/components/workspace/WorkspaceModule.vue) selalu menampilkan Void secara default dan memancarkan `emit('void', selectedIds)`.
- Dampak: untuk list transaksi Sales/Purchase, user dapat melihat action Void namun tidak ada bukti endpoint bulk/individual dijalankan dari event tersebut.
- [`WorkspaceModule.vue`](../frontend-vue/src/components/workspace/WorkspaceModule.vue) juga masih merender `WorkspaceSelectionActions` terpisah untuk `Edit first selected`; perlu review terhadap design standard toolbar yang telah dikunci.

## 10. Form Input Audit

| Module | Form | Create | Edit / Detail | Validation | Submit API | Dropdown API | Draft State | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| COA | `ChartOfAccountFormPanel.vue` | Ya | Ya | VeeValidate | Ya | N/A | Ya | Done |
| Contacts, Units, Categories, Products, Warehouses, Departments, Projects | `BackendResourceForm.vue` | Ya | Ya | Generic form | Ya | Mostly plain/select config | Ya | Generic Connected |
| Product Inventory History | `InventoryHistoryPanel.vue` dalam Product detail | N/A | Detail only | N/A | GET stock-card | Warehouse API | N/A | Done / read-only |
| Journals | Journal form/resource config | Ya | Ya | Ada secara struktur | API config ada | Needs verification | Ya | Partial |
| Sales Quotation/Order/DO/Proforma/Invoice/Billing/Deposit/Receipt/Return | `TransactionFormPanel.vue` | Ya | Ya | Zod/VeeValidate | Create/update API | Partner/product lookup API | Ya | Partial: lifecycle/source actions missing |
| Purchase Request/Order/GR/Bill/Deposit/Payment/Return | `TransactionFormPanel.vue` | Ya | Ya | Zod/VeeValidate | Create/update API | Vendor/product lookup API | Ya | Partial: lifecycle/source actions missing |
| Cash Bank documents | `BackendResourceForm.vue` | Ya | Ya | Generic | API | Basic fields | Ya | Generic Connected / Review |
| Inventory operations | `BackendResourceForm.vue` | Ya where backend supports | Ya | Generic | API | Basic fields | Ya | Generic Connected / Review |
| Settings Company | None usable for PATCH | Tidak ditemukan | Tidak ditemukan | Tidak | GET only via generic | N/A | N/A | Missing edit |

### Form action gap

- `frontend-vue/src/features/sales/forms/*.ts` dan `features/purchase/forms/*.ts` mendefinisikan service dan validation untuk save.
- `TransactionFormPanel.vue` tidak merender lifecycle action berdasarkan `config.actions`; hanya tombol `Save`.
- Generic `backendResource.form.config.ts` memang mencantumkan lifecycle action, tetapi Sales/Purchase active route di-registry ke transaction form khusus, sehingga config generic tersebut tidak menjadi bukti action UI aktif.

## 11. Virtual Tabs & Draft State Audit

- [x] Primary tab store tersedia: [`workspaceTabsStore.ts`](../frontend-vue/src/stores/workspaceTabsStore.ts).
- [x] Secondary list tab dibuat per primary tab dan tidak closable.
- [x] List tab tampil icon-only melalui [`SecondaryTabsBar.vue`](../frontend-vue/src/components/navigation/SecondaryTabsBar.vue).
- [x] Create tab dapat membuka beberapa tab independen dengan ID berbasis timestamp.
- [x] Edit/detail tab mencegah duplikasi entity yang sama melalui ID berbasis entity.
- [x] Dirty state tersimpan pada secondary tab dan indikator dot dirender.
- [x] Draft state disimpan per secondary tab melalui `draftStateBySecondaryTabId`.
- [x] Close dirty tab memicu dialog unsaved changes pada `AppWorkspaceShell.vue`.
- [x] `closeAllTabs()` tersedia di store.
- [x] Dashboard tidak menampilkan secondary tab.
- [ ] Perilaku save dari dialog close dirty perlu runtime verification: handler `saveCloseSecondary()` menutup tab setelah menghapus dirty flag tanpa terlihat memanggil submit form aktif.
- [ ] Draft persistence belum diuji manual lintas refresh/browser; store yang dibaca adalah memory Pinia, bukan persistence jangka panjang.

## 12. API Client & Error Handling Audit

| Check | Status | Bukti / Catatan |
| --- | --- | --- |
| Base URL dari env | Done | `VITE_API_URL || '/api'` di `services/api.ts` |
| Authorization Bearer otomatis | Done | Request interceptor membaca auth store/localStorage |
| `X-Company-ID` otomatis | Done | Request interceptor membaca active company |
| 401 handling | Done | Clear auth + redirect login; interceptor plugin juga membersihkan company |
| 403 handling | Partial | Pesan fallback tersedia pada `toApiError`, tidak ada flow global khusus |
| 422 validation handling | Partial / Done per form | Generic backend form mengekstrak Laravel errors; transaction form menggunakan validation helper |
| Network/server error | Partial | Normalisasi error ada; UX berbeda antar workspace |
| Logout clear token | Done | `authStore.clearAuth()` dan logout flow |
| Switch company context | Partial | Active company dipersist dan header berubah; invalidasi seluruh cached tab/list perlu runtime verification |
| ApiResponse unwrap | Done | `services/apiResponse.ts`/`unwrap()` digunakan luas |
| Pagination mapping | Needs verification | Workspace generic mengekstrak array dan menyaring client-side, metadata pagination tidak konsisten terlihat |
| Permission-aware menu | Done | Menu difilter pada shell berdasarkan permission |
| Permission-aware action | Partial | Generic actions memakai `can`; transaction form action belum dirender |

### Risiko API yang ditemukan

- [`services/api.ts`](../frontend-vue/src/services/api.ts) sudah memasang interceptor secara langsung, sementara [`plugins/apiInterceptors.ts`](../frontend-vue/src/plugins/apiInterceptors.ts) memasang interceptor tambahan pada instance sama melalui re-export [`api.ts`](../frontend-vue/src/api.ts). Ini bukan kehilangan Bearer/X-Company-ID, tetapi duplikasi interceptor perlu review agar 401 redirect/error representation konsisten.
- `BackendResourceWorkspace.vue` menjalankan filtering search/status/date pada hasil yang sudah dimuat, bukan mengirim semua filter/pagination ke backend. Untuk list besar atau response paginated, hasil visual dapat tidak mewakili seluruh dataset.

## 13. Broken / Risky Integration Findings

| Severity | Finding | File Evidence | Impact |
| --- | --- | --- | --- |
| High | Bulk Void Sales/Purchase terlihat tetapi tidak ditangani parent transaction workspace | `WorkspaceModule.vue`, `TransactionWorkspacePage.vue` | Action user tidak memanggil API |
| High | Endpoint lifecycle Sales/Purchase belum dirender di form aktif | `TransactionFormPanel.vue`, form/service configs | Approve/post/void/cancel workflow tidak dapat dijalankan dari UI form |
| High | Access Vue services/pages tidak memiliki backend routes aktif | `services/access/*`, `pages/access/*`, route list backend | Phase 18 UI unusable |
| Medium | Conversion/source endpoints Sales/Purchase tidak memiliki invocation UI terlihat | backend routes dan transaction form | Workflow antar dokumen terputus |
| Medium | Dashboard menunjukkan metric placeholder meski status endpoint ada | `DashboardWorkspaceContent.vue` | User melihat data non-real |
| Medium | Fiscal closing dan period-lock update belum lengkap | backend routes/sidebar/config | Operasi akhir periode tidak tersedia dari Vue |
| Medium | Generic workspace client-side filter/pagination risk | `BackendResourceWorkspace.vue` | Data parsial/tidak akurat pada volume besar |
| Medium | Duplicate interceptor registration | `services/api.ts`, `plugins/apiInterceptors.ts` | Error handling ganda/tidak konsisten |
| Low | `Endpoint belum tersedia` masih menjadi fallback error generic | `BackendResourceForm.vue`, COA/Journal list | Error network bisa disalahartikan endpoint absent |

## 14. Priority Implementation Plan

### Priority 1 - Fix Critical Integration

- [ ] Hubungkan tombol Void workspace Sales/Purchase ke handler yang benar atau sembunyikan hanya jika action memang tidak didukung; pertahankan selected row semantics.
- [ ] Implement lifecycle action rendering untuk form transaksi aktif berdasarkan permission/status existing.
- [ ] Putuskan status Phase 18: daftarkan route `/api/access/*` yang aman atau cabut registry/service UI yang belum dapat dipakai sampai backend aktif.
- [ ] Ganti dashboard placeholder dengan data API nyata atau beri status jelas bahwa dashboard belum operasional.

### Priority 2 - Connect Existing Backend to Existing Frontend

- [ ] Implement source conversion Sales: Quotation -> Order, Order -> Delivery/Proforma/Invoice, Invoice -> Billing, source Return.
- [ ] Implement source conversion Purchase: Request -> Order, Order -> Goods Receipt/Bill, source Return.
- [ ] Implement Customer Deposit/Vendor Deposit allocation workflow.
- [ ] Buat route/page Account Ledger Detail memakai `getAccountLedger()` yang sudah ada.
- [ ] Hubungkan AR/AP ledger drilldowns dari summary/open items.

### Priority 3 - Complete Accounting Operations

- [ ] Buat Fiscal Closing workspace dengan preview, checklist, close, dan reopen.
- [ ] Buat editor Period Lock yang memanggil `PATCH /api/accounting/period-locks`.
- [ ] Buat Company Settings form untuk endpoint accounting/modules.
- [ ] Standardisasi error state agar tidak menggunakan fallback "Endpoint belum tersedia" untuk kegagalan umum.

### Priority 4 - Complete Cash Bank and Inventory Views

- [ ] Buat Cash Bank Account Statement page.
- [ ] Tambahkan Stock Balance drilldown per product dan warehouse bila dibutuhkan navigasi operasional.
- [ ] Tambahkan valuation as-of/product/warehouse views.
- [ ] Uji fungsi detail/form generic untuk stock opname lines dan reconciliation marking.

### Priority 5 - Hardening

- [ ] Selaraskan `implemented` sidebar flag dengan status real generic workspace.
- [ ] Audit kontrak server-side pagination/sorting/filter semua list.
- [ ] Konsolidasikan interceptor API dan behavior 401/403/422.
- [ ] Tambahkan integration/smoke tests untuk route-menu-endpoint contract Vue.

## 15. Recommended Next Codex Tasks

- [ ] **Task 1: Fix transaction workspace lifecycle and bulk void wiring.** Audit `TransactionWorkspacePage`, render status-aware actions, sambungkan existing endpoint/service, dan uji checkbox selection/bulk void.
- [ ] **Task 2: Implement Sales/Purchase source conversion workflows.** Tambah UI source selector/action yang memanggil endpoint conversion existing tanpa mengubah API contract.
- [ ] **Task 3: Activate Phase 18 Access API and Vue navigation.** Audit controller existing, daftarkan protected routes sesuai permission, lalu hubungkan menu `/access/users` dan `/access/roles`.
- [ ] **Task 4: Implement Vue Fiscal Closing and Period Lock workspace.** Pakai endpoint accounting existing dan permission `fiscal_year.*`.
- [ ] **Task 5: Add AR/AP ledger detail pages.** Sambungkan endpoint customer/vendor dan invoice/bill ledger ke drilldown report.
- [ ] **Task 6: Implement Cash Bank Account Statement.** Pakai endpoint report existing dan pattern report Vue.
- [ ] **Task 7: Replace Dashboard placeholder with API-backed cards.** Gunakan hanya metrics yang kontraknya tersedia/disetujui.
- [ ] **Task 8: Harden generic workspace server filtering/pagination.** Selaraskan query params dan response metadata backend.
- [ ] **Task 9: Complete settings edit surfaces.** Hubungkan company accounting/module settings dan account mapping secara eksplisit.
- [ ] **Task 10: Consolidate API interceptors and error messaging.** Pertahankan Bearer/X-Company-ID, hilangkan duplikasi dan fallback menyesatkan.

## 16. Passive Regression Review

- [x] Auth token dan tenant header tetap terlihat pada API client; audit tidak mengubah kode.
- [x] Virtual tabs, secondary attached tabs, draft map, dan dirty indicator ditemukan tetap ada.
- [x] Product history berada di Product detail, bukan Product Category detail, pada kode saat audit.
- [x] Financial reports Vue memakai endpoint backend nyata, bukan dummy rows.
- [x] Sales/Purchase create/edit forms memakai resource service/API nyata untuk save.
- [x] Sidebar menyembunyikan menu berdasarkan permission frontend.
- [ ] Workflow browser authenticated belum dijalankan karena pekerjaan ini read-only source audit.
- [ ] Akurasi response runtime/pagination memerlukan test implementasi terpisah.

## 17. Commands Executed

Command read-only yang dijalankan:

```bash
git status --short --branch
git log -5 --oneline --decorate
sed -n ... docs/audit-check.md
find ... docs roadmap dan folder frontend/backend
rg --files ... backend frontend frontend-vue
php artisan route:list --path=api --json
jq ... /tmp/tenantapp-api-routes.json
sed -n ... backend/routes/api.php backend/config/permissions.php backend/config/document_numbers.php
sed -n ... frontend-vue/src/router/index.ts frontend-vue/src/navigation/sidebar.ts
sed -n ... frontend-vue/src/services frontend-vue/src/features frontend-vue/src/components frontend-vue/src/stores
rg -n ... frontend-vue/src backend/routes/api.php
```

Tidak dijalankan:

- `npm run lint`, `npm run typecheck`, dan `npm run build`: audit ini tidak mengubah source code; validasi compile bukan syarat untuk membuat temuan koneksi statis dan menghindari generated output.
- Backend test suite: tidak ada perubahan backend dan task dibatasi sebagai read-only audit.
- Manual authenticated browser flow: tidak tersedia sesi interaktif login/company dalam audit sumber statis ini.

## 18. Final Checklist

- [x] Tidak ada kode aplikasi yang diubah.
- [x] Tidak ada backend contract yang diubah.
- [x] Tidak ada frontend design yang diubah.
- [x] Backend endpoint map audited.
- [x] Frontend route/menu/workspace/form audited.
- [x] Dummy dan temporary state dicatat.
- [x] Gap backend-frontend dicatat.
- [x] Risiko auth/company context diperiksa secara pasif.
- [x] Gap report dibuat di `docs/frontend-audit-gap-report.md`.
- [x] Laporan siap dipakai sebagai dasar prompt implementasi berikutnya.
