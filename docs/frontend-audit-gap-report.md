# Frontend Audit & Backend Integration Gap Report

## 1. Executive Summary

- Frontend aktif saat ini adalah **Vue (`frontend-vue`)** dengan pola workspace + virtual tabs, sedangkan **Next.js (`frontend`)** masih ada sebagai frontend lama/alternatif dan berisi banyak route sales/accounting.  
- Kondisi umum: backend API jauh lebih lengkap (modul accounting, sales, purchase, cash-bank, inventory sudah punya banyak endpoint), sementara frontend Vue masih dominan pada pendekatan **route placeholder + backend resource generic**, sehingga beberapa menu terlihat tersedia tetapi belum jadi UI bisnis final.  
- Risiko utama:
  - banyak route/menu sudah ada namun masih placeholder/dummy implementation;
  - potensi dual-source-of-truth karena frontend Vue + Next.js coexist;
  - potensi mismatch flow bisnis karena sebagian page hanya generic form/list.
- Prioritas implementasi: (1) kunci integrasi API kritikal + permission/token/tenant context lintas modul, (2) finalisasi Accounting Frontend MVP, (3) sambungkan Sales/Purchase page ke workflow final, (4) bangun Cash Bank & Inventory frontend operasional.

## 2. Audit Scope

- [x] Backend endpoint map audited
- [x] Frontend route map audited
- [x] Sidebar/menu audited
- [x] API client audited
- [x] Workspace list audited
- [x] Forms audited
- [x] Virtual tabs audited
- [x] Dummy state audited
- [x] Backend-frontend connection audited

## 3. Backend Endpoint Map

Sumber utama: `backend/routes/api.php`.

| Module | Method | Endpoint | Controller/Action | Permission | Frontend Status |
|---|---|---|---|---|---|
| Auth | POST | /api/auth/register | AuthController@register | - | Connected (login/register flow sebagian) |
| Auth | POST | /api/auth/login | AuthController@login | - | Connected |
| Auth | GET | /api/auth/me | AuthController@me | auth:sanctum | Connected |
| Auth | POST | /api/auth/logout | AuthController@logout | auth:sanctum | Connected |
| Company/Tenant | GET | /api/companies | CompanyController@index | auth:sanctum | Connected |
| Company/Tenant | POST | /api/companies/select | CompanyController@select | auth:sanctum | Connected |
| Tenant Context | GET | /api/tenant-context-test | TenantContextTestController | company.access | Needs verification (no dedicated page) |
| Company Settings | GET | /api/settings/company | CompanySettingController@show | settings.company.view | Page placeholder/generic |
| Company Settings | PATCH | /api/settings/company/accounting | CompanySettingController@updateAccounting | settings.company.edit | Page placeholder/generic |
| Company Settings | PATCH | /api/settings/company/modules | CompanySettingController@updateModules | settings.company.edit | Page placeholder/generic |
| Accounting | GET | /api/accounting/fiscal-year/status | FiscalYearStatusController | dashboard.view | Connected (dashboard) |
| Accounting | GET/POST/PATCH | /api/accounting/fiscal-years/* | FiscalYearClosingController | fiscal_year.* | Frontend page missing (wizard final) |
| Accounting | GET/PATCH | /api/accounting/period-locks* | PeriodLockController | fiscal_year.* | Route ada, UI final missing |
| Master Data | CRUD/PATCH | /api/master-data/chart-of-accounts* | ChartOfAccountController | coa.* | Partial (list/form generic) |
| Master Data | CRUD/PATCH | /api/master-data/contacts* | ContactController | contacts.* | Placeholder route |
| Master Data | CRUD/PATCH | /api/master-data/units* | UnitController | units.* | Placeholder route |
| Master Data | CRUD/PATCH | /api/master-data/product-categories* | ProductCategoryController | products.* | Placeholder route |
| Master Data | CRUD/PATCH | /api/master-data/products* | ProductController | products.* | Placeholder route |
| Master Data | CRUD/PATCH | /api/master-data/warehouses* | WarehouseController | warehouses.* | Placeholder route |
| Master Data | CRUD/PATCH | /api/master-data/departments* | DepartmentController | departments.* | Placeholder route |
| Master Data | CRUD/PATCH | /api/master-data/projects* | ProjectController | projects.* | Placeholder route |
| Account Mapping | GET/PATCH | /api/master-data/account-mappings* | AccountMappingController | settings.company.* | Placeholder route |
| Journal Entries | GET/POST/PATCH/POST actions | /api/journals* | JournalEntryController | journal.* | Partial (workspace ada) |
| Reports | GET | /api/reports/general-ledger | GeneralLedgerController@index | reports.view | Partial |
| Reports | GET | /api/reports/trial-balance | TrialBalanceController@index | reports.view | Partial |
| Reports | GET | /api/reports/profit-loss | ProfitLossController@index | reports.view | Placeholder route |
| Reports | GET | /api/reports/balance-sheet | BalanceSheetController@index | reports.view | Placeholder route |
| Reports | GET | /api/reports/cash-flow | CashFlowController@index | reports.view | Placeholder route |
| Reports | GET | /api/reports/financial-summary | FinancialSummaryController@index | reports.view | Placeholder route |
| Sales & AR | Banyak GET/POST/PATCH | /api/sales/* | multi-controller Sales | sales.* | Route/menu tersedia, implementasi Vue dominan placeholder; Next.js lebih detail |
| Purchase & AP | Banyak GET/POST/PATCH | /api/purchase/* | multi-controller Purchase | purchase.* | Route/menu tersedia, implementasi Vue dominan placeholder |
| Cash Bank | Banyak GET/POST/PATCH | /api/cash-bank/* | multi-controller CashBank | cash_bank.* | Placeholder route/menu |
| Inventory | Banyak GET/POST/PATCH | /api/inventory/* | multi-controller Inventory | inventory.* | Placeholder route/menu |
| Access | GET/POST/PATCH/PUT | /api/access/* | Access controllers | access.* | Connected (Phase 18 Vue pages) |

Catatan: route list API sesudah integrasi Access Management menampilkan **307** route.

## 4. Frontend Route Map

| Module | Frontend Route | Page/File | Menu Status | API Status | Implementation Status |
|---|---|---|---|---|---|
| Auth | /login | `frontend-vue/src/pages/auth/LoginPage.vue` | Menu N/A | Connected | Done |
| Auth | /select-company | `frontend-vue/src/pages/auth/SelectCompanyPage.vue` | Menu N/A | Connected | Done |
| Dashboard | /dashboard | RouteIntent + DashboardWorkspaceContent | Sidebar ada | API `/accounting/fiscal-year/status` | Partial |
| Accounting | /accounting/journals | RouteIntent -> Journal workspace | Sidebar ada | API `/journals` | Partial |
| Accounting | /accounting/chart-of-accounts | RouteIntent | Sidebar ada | `/master-data/chart-of-accounts` | Partial |
| Reports | /reports/general-ledger | RouteIntent | Sidebar ada | `/reports/general-ledger` | Partial |
| Reports | /accounting/trial-balance | RouteIntent | Sidebar ada | `/reports/trial-balance` | Partial |
| Reports | /reports/profit-loss | RouteIntent | Sidebar ada | `/reports/profit-loss` | Dummy/Placeholder |
| Reports | /reports/balance-sheet | RouteIntent | Sidebar ada | `/reports/balance-sheet` | Dummy/Placeholder |
| Reports | /reports/cash-flow | RouteIntent | Sidebar ada | `/reports/cash-flow` | Dummy/Placeholder |
| Reports | /reports/financial-summary | RouteIntent | Sidebar ada | `/reports/financial-summary` | Dummy/Placeholder |
| Sales/Purchase/Cash/Inventory (bulk) | route hasil `sidebarPlaceholderItems` | RouteIntent generic | Sidebar ada | endpoint ada | Dummy/Placeholder |
| Access Management | /access/company-users, /access/permissions, /access/roles, /access/invitations, /access/audit | `frontend-vue/src/pages/access/*` | Permission-aware sidebar ada | `/api/access/*` | Connected |
| Design Demo | /design/* | design demo pages | tidak untuk user akhir | bukan API bisnis | Done (demo only) |

Ringkas: router Vue memiliki 31 entri `path:` eksplisit; Next.js legacy memiliki 81 file page.tsx (masih ada, perlu keputusan single frontend).

## 5. Backend Endpoint Not Connected to Frontend

### Accounting
- [ ] Endpoint fiscal closing checklist/close/reopen belum punya wizard final Vue khusus.
- [ ] Endpoint period-lock update belum punya form final (hanya route placeholder).

### Sales
- [x] Action status (`approve/post/void/issue/ship/deliver`) pada workspace form Sales aktif telah terhubung ke service action dengan permission/status gating; Bulk Void memakai endpoint void per dokumen dengan alasan dan ringkasan hasil.
- [x] Source conversion workflow Sales aktif telah dihubungkan ke Vue transaction forms: Sales Order → Delivery Order/Proforma/Sales Invoice, Delivery Order → Sales Invoice, dan Proforma → Sales Invoice memakai endpoint backend existing. Backend menjaga source header/line references, remaining quantity, dan price resolution Delivery Order → Sales Invoice dari Sales Order line. Files utama: `backend/app/Services/Sales/SalesInvoiceService.php`, `frontend-vue/src/services/transaction/sourceConversions.service.ts`, `frontend-vue/src/features/transaction-form/TransactionFormPanel.vue`, dan form config Sales.
- [ ] AR ledger detail by customer/invoice di Vue belum terlihat sebagai halaman detail final dedicated.

### Purchase
- [x] Lifecycle action dan Bulk Void untuk form Purchase aktif telah terhubung ke endpoint backend yang tersedia; penyelesaian page AP lain tetap mengikuti roadmap.
- [x] Source conversion workflow Purchase aktif telah dihubungkan ke Vue transaction forms: Purchase Request → Purchase Order, Purchase Order → Goods Receipt/Vendor Bill, dan Goods Receipt → Vendor Bill memakai endpoint backend existing. Backend menjaga source header/line references, remaining quantity, dan price resolution Goods Receipt → Vendor Bill dari Purchase Order line. Files utama: `backend/app/Services/Purchase/VendorBillService.php`, `frontend-vue/src/services/transaction/sourceConversions.service.ts`, `frontend-vue/src/features/transaction-form/TransactionFormPanel.vue`, dan form config Purchase.

### Cash Bank
- [~] Workspace resource cash receipt/payment/transfer sekarang meminta alasan dan mendukung Bulk Void; bank reconciliation belum memiliki endpoint void backend.

### Inventory
- [~] Workspace resource stock movement/adjustment/opname sekarang meminta alasan dan mendukung Bulk Void melalui endpoint existing; report/final dedicated page tetap di luar perbaikan ini.

### Access Management
- [x] Gap route `/api/access/*` ditutup: rute terdaftar di bawah `auth:sanctum`, `company.access`, dan permission action.
- [x] Sidebar Vue permission-aware dan halaman company users, roles, permission matrix, invitations, serta access audit tersambung ke API aktif.

## 6. Frontend Pages Missing

- [ ] Buat page final Fiscal Closing Wizard (`/accounting/fiscal-closing`) di frontend Vue.
- [ ] Buat page final Period Locks management.
- [ ] Buat page list+form final Contacts, Units, Product Categories, Products, Warehouses, Departments, Projects (bukan hanya generic placeholder).
- [ ] Buat page final Sales docs end-to-end di Vue (quotation/order/DO/proforma/invoice/billing/receipt/deposit/return).
- [ ] Buat page final Purchase docs end-to-end di Vue.
- [ ] Buat page final Cash Bank docs end-to-end di Vue.
- [ ] Buat page final Inventory docs + reports end-to-end di Vue.

## 7. Pages Still Using Dummy / Temporary State

| Module | File | Dummy/Temporary Data | Required Endpoint | Recommended Fix |
|---|---|---|---|---|
| Accounting Mock | `frontend-vue/src/stores/mockAccountingDataStore.ts` | mock balances/ledger temporary | `/reports/*`, `/journals*` | Hapus dependensi mock, ganti query API + caching store |
| Routing Placeholder | `frontend-vue/src/router/index.ts` | `placeholderWorkspaceRoutes` | sesuai menu endpoint | Ganti route placeholder jadi page/module final |
| Sidebar Status | `frontend-vue/src/navigation/sidebar.ts` | flag `implemented=false` masif | sesuai modul | Track progress per menu dan enforce status real |
| Dashboard | `frontend-vue/src/pages/dashboard/DashboardWorkspaceContent.vue` | TODO dashboard final | `/accounting/fiscal-year/status` + KPI endpoint tambahan | Implement widget + data pipeline |
| App shell | `frontend-vue/src/layouts/AppShell.vue` | TODO design spec | N/A | Finalisasi layout production |

## 8. Sidebar/Menu Mismatch

- [ ] Banyak menu sudah tampil tetapi mengarah ke route placeholder generic (bukan page domain final).
- [ ] Endpoint backend untuk billing lifecycle, fiscal closing, inventory reports ada namun grouping/entry menu belum lengkap final untuk alur user.
- [x] Tombol lifecycle Sales/Purchase aktif dan aksi void resource Cash/Inventory menggunakan permission endpoint/config yang tersedia.
- [ ] Ko-eksistensi Vue + Next.js berisiko mismatch URL/menu antar frontend.

## 9. Workspace List Audit

| Module | List Page | API Connected | Search | Filter | Pagination | Bulk Action | Status |
|---|---|---|---|---|---|---|---|
| Journals | Journal workspace | Ya (service journals) | Ada | Ada (date/status) | Ada | Ada (bergantung config) | Partial |
| COA | Chart of accounts workspace | Ya | Ada | Basic | Ada | Aktivasi/deaktivasi basic | Partial |
| General Ledger | GL workspace | Ya | Ada | Date filter | Needs verification | N/A | Partial |
| Trial Balance | TB workspace | Ya | Ada | As-of/basic | Needs verification | N/A | Partial |
| Placeholder modules | RouteIntent generic | API metadata saja | Generic | Generic | Generic | Generic | Dummy |

## 10. Form Input Audit

| Module | Form | Create | Edit | Validation | Submit API | Dropdown API | Draft State | Status |
|---|---|---|---|---|---|---|---|---|
| Chart of Accounts | Form panel | Ada | Ada | Ada (basic) | Ya | N/A | Ada (workspace) | Partial |
| Journals | Form panel | Ada | Ada | Ada | Ya | Sebagian API | Ada | Partial |
| Contacts | Belum dedicated final | Missing | Missing | Needs verification | Needs verification | Needs verification | Needs verification | Missing |
| Units | Belum dedicated final | Missing | Missing | Needs verification | Needs verification | Needs verification | Needs verification | Missing |
| Products/Categories | Belum dedicated final | Missing | Missing | Needs verification | Needs verification | Needs verification | Needs verification | Missing |
| Warehouses | Belum dedicated final | Missing | Missing | Needs verification | Needs verification | Needs verification | Needs verification | Missing |
| Departments/Projects | Belum dedicated final | Missing | Missing | Needs verification | Needs verification | Needs verification | Needs verification | Missing |
| Sales docs | Banyak form page tersedia file-nya, integrasi final belum konsisten | Partial | Partial | Partial | Partial | Partial | Partial | Needs Review |
| Purchase docs | Banyak form page tersedia file-nya, integrasi final belum konsisten | Partial | Partial | Partial | Partial | Partial | Partial | Needs Review |

## 11. Virtual Tabs & Draft State Audit

- [x] Primary tabs pattern tersedia (`PrimaryTabsBar`, `SecondaryTabsBar`, `workspaceTabsStore`).
- [x] Secondary tabs tersedia untuk list/form pattern.
- [x] List tab icon-only pattern tersedia di komponen workspace (Needs verification visual semua modul).
- [x] Create/Edit tab mekanisme tersedia pada workspace module.
- [x] Draft/form state ada pada beberapa modul (journal/coa).
- [ ] Dirty state lintas semua form modul belum tervalidasi merata (Needs verification).
- [ ] Close-all + duplicate-edit-entity prevention lintas semua modul perlu uji end-to-end.
- [x] Dashboard dipisahkan sebagai tab non-closable.

## 12. API Client & Error Handling Audit

- [x] Bearer token otomatis (axios interceptor).
- [x] X-Company-ID otomatis (axios interceptor).
- [x] Base URL dari env (`VITE_API_URL` fallback `/api`).
- [x] 401 handling ada (clear auth + redirect login).
- [x] 403 handling ada fallback message.
- [x] 422 normalization ada (`normalizeValidationErrors`).
- [x] Network/server error fallback message ada.
- [ ] Pagination response mapping antar service perlu konsistensi audit lanjutan (Needs verification).
- [ ] Potensi interceptor duplikat (`src/services/api.ts` + `src/plugins/apiInterceptors.ts`) perlu standardisasi agar tidak double side effect.

## 13. Priority Implementation Plan

### Priority 1 — Fix Critical Integration
- [ ] Tetapkan satu frontend utama produksi (Vue) dan freeze frontend Next.js legacy.
- [ ] Standardisasi interceptor tunggal + error contract handling lintas modul.
- [~] Wiring status kritikal dan void integrity telah diperbaiki; perluasan test matrix permission lintas seluruh menu masih lanjutan.

### Priority 2 — Connect Existing Backend to Existing Frontend
- [ ] Sambungkan semua menu placeholder ke page/workspace final domain.
- [ ] Ganti semua mock accounting store dengan API backend nyata.
- [ ] Pastikan semua list/form punya mapping pagination/filter/sort yang konsisten.

### Priority 3 — Build Missing Accounting Frontend
- [ ] Finalisasi Contacts/Units/Products/Warehouse/Departments/Projects UI final.
- [ ] Implement Fiscal Closing wizard + Period Lock management.
- [ ] Finalisasi report pages (PL, BS, CF, Financial Summary) non-placeholder.

### Priority 4 — Build Sales Frontend
- [ ] Finalisasi seluruh dokumen sales lifecycle + AR ledger/aging/reconciliation.
- [x] Tambah action panel permission-aware untuk approve/post/void/issue/ship/deliver.

### Priority 5 — Prepare Purchase/Cash Bank/Inventory Frontend
- [~] Lifecycle action dan void pada form Purchase aktif sudah tersambung; dedicated AP page/report lanjutan tetap diperlukan.
- [ ] Implement cash-bank docs + reconciliation UI.
- [ ] Implement inventory docs + stock report pages.

## 14. Recommended Next Codex Tasks

- [ ] Task 1: “Implement Vue dedicated workspace pages untuk Contacts, Units, Products, Warehouses, Departments, Projects menggunakan endpoint existing master-data + pagination/filter/sort + create/edit.”
- [ ] Task 2: “Implement Fiscal Closing & Period Lock Vue module (status, checklist, close/reopen, lock update) lengkap permission guard dan virtual tabs.”
- [ ] Task 3: “Refactor API layer Vue menjadi single interceptor pipeline; validasi Bearer/X-Company-ID/422 mapping di semua service.”

## 15. Final Checklist

- [x] Tidak ada kode aplikasi yang diubah
- [x] Tidak ada backend contract yang diubah
- [x] Tidak ada frontend design yang diubah
- [x] Audit selesai
- [x] Gap report dibuat di `docs/frontend-audit-gap-report.md`
- [x] Laporan siap dipakai sebagai dasar prompt implementasi berikutnya

---

## Lampiran Ringkas Angka Audit

- Total route backend API (`php artisan route:list --path=api`): **307**.
- Total route entry eksplisit Vue router (`path:`): **31**.
- Total page Next.js legacy (`frontend/app/**/page.tsx`): **81**.
- Estimasi endpoint belum terhubung penuh ke UI final: **>= 180** (karena mayoritas modul non-accounting core masih placeholder).
- Estimasi page/module missing atau belum final di Vue: **>= 40 route/menu kerja**.
- Temuan dummy/temporary utama: **5 area kunci** (mock store, placeholder routes, sidebar implementation flags, dashboard TODO, appshell TODO).
