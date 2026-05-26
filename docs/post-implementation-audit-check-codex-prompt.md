# Prompt Codex — Post-Implementation Audit Check

## TASK TITLE

Post-Implementation Audit Check — Frontend, Backend, Integration, Regression, and Remaining Gap Report

## PROJECT

TenantAppDevelopment / tenantApp

## PRIMARY GOAL

Lakukan audit ulang setelah implementasi hasil audit sebelumnya selesai.

Tujuan audit ini adalah memastikan:

1. Perbaikan point 3–10 benar-benar sudah terimplementasi.
2. Tidak ada fitur lama yang rusak.
3. Tidak ada regression pada frontend Vue, backend Laravel, auth, tenant context, virtual tabs, workspace, dan desain yang sudah fix.
4. Backend endpoint yang sebelumnya belum terhubung sekarang sudah tersambung ke frontend.
5. Masih ada gap atau bug sisa yang perlu dibuatkan prompt lanjutan.
6. Laporan audit baru dibuat dalam Markdown yang rapi dan siap dipakai sebagai dasar task berikutnya.

## IMPORTANT MODE

READ-ONLY AUDIT MODE.

Codex hanya boleh:

- membaca project,
- menjalankan command read-only / verification,
- membuat atau meng-update satu file laporan audit,
- tidak memperbaiki bug,
- tidak mengubah source code aplikasi.

## OUTPUT FILE

Buat atau update file:

```text
docs/post-implementation-audit-check.md
```

Jika file sudah ada, boleh overwrite/update file ini saja.

## ABSOLUTE FILE CHANGE RULE

Codex TIDAK BOLEH mengubah file aplikasi apa pun.

Yang boleh berubah hanya:

```text
docs/post-implementation-audit-check.md
```

Jika ingin mencatat hasil tambahan, tetap masukkan ke file report tersebut.

## DO NOT MODIFY

Dilarang mengubah:

```text
backend/*
frontend/*
frontend-vue/*
package.json
package-lock.json
pnpm-lock.yaml
yarn.lock
composer.json
composer.lock
vite.config.*
tsconfig.*
eslint config
tailwind config
.env
.env.*
migration
controller
service
model
route
store
component
page
layout
API client
permission config
navigation config
CSS file
any application source code
```

## ALLOWED COMMANDS

Boleh menjalankan command read-only:

```bash
git status --short
git branch --show-current
git log --oneline -n 10

find
ls
cat
sed
grep
rg

php artisan route:list --path=api
php artisan route:list --path=api --json

php artisan test --filter=Access
php artisan test --filter=Permission
php artisan test --filter=Role
php artisan test --filter=Fiscal
php artisan test --filter=Closing
php artisan test --filter=Ledger
php artisan test --filter=CashBank
php artisan test --filter=Settings
php artisan test --filter=Api
php artisan test
```

Frontend read-only verification:

```bash
cd frontend-vue
npm run typecheck
npm run lint
npm run build
```

Hanya jalankan command frontend jika dependency tersedia.

## FORBIDDEN COMMANDS

Jangan menjalankan command yang bisa mengubah project, database, dependency, cache besar, atau generated file:

```bash
npm install
npm update
npm audit fix
npm run format
npm run lint -- --fix
prettier --write
eslint --fix

composer install
composer update

php artisan migrate
php artisan migrate:fresh
php artisan db:seed
php artisan optimize
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan storage:link

php artisan make:*
```

Jangan menjalankan command yang mengubah tenant database atau central database.

## BEFORE AUDIT

1. Jalankan:

```bash
git status --short
git branch --show-current
git log --oneline -n 10
```

2. Catat hasilnya dalam report.

3. Jika working tree sudah punya perubahan sebelum audit, catat sebagai **pre-existing changes**.

4. Jangan sentuh perubahan tersebut.

## AFTER AUDIT

1. Jalankan lagi:

```bash
git status --short
```

2. Pastikan perubahan hanya:

```text
docs/post-implementation-audit-check.md
```

3. Jika ada file lain berubah, tulis warning:

```text
WARNING: unexpected file changes detected
```

4. Jika perubahan tidak sengaja dibuat oleh Codex, revert perubahan itu.

5. Jangan commit kecuali diminta eksplisit oleh user.

## AUDIT BACKGROUND

Sebelumnya audit menemukan daftar prioritas:

```text
3. Benahi Phase 18 Access API + Vue navigation
4. Buat Fiscal Closing + Period Locking workspace
5. Tambah AR/AP ledger detail pages
6. Tambah Cash Bank Account Statement page
7. Ganti Dashboard placeholder dengan data API nyata
8. Harden generic workspace pagination/filter/sort
9. Lengkapi company settings edit surface
10. Rapikan API interceptor dan error handling
```

Task implementasi point 3–10 diasumsikan sudah dijalankan.

Audit ulang ini harus mengecek apakah semua point tersebut sudah benar-benar selesai dan tidak merusak area lain.

## FILES / AREAS TO READ

### Docs

Baca jika ada:

```text
docs/frontend-audit-gap-report.md
docs/post-implementation-audit-check.md
docs/phase-18-access-api-vue-navigation.md
docs/point-4-fiscal-closing-period-locking-workspace.md
docs/point-5-ar-ap-ledger-detail-pages.md
docs/point-6-cash-bank-account-statement-page.md
docs/point-7-dashboard-real-api-data.md
docs/point-8-generic-workspace-pagination-filter-sort.md
docs/point-9-company-settings-edit-surface.md
docs/point-10-api-interceptor-error-handling.md
docs/update-roadmap.md
docs/phase-18*.md
docs/phase-8*.md
docs/phase-9*.md
docs/phase-10*.md
```

Jika file berbeda namanya, gunakan `rg` untuk mencari:

```bash
rg "Phase 18|Access API|Fiscal Closing|Period Locking|Account Statement|Dashboard|pagination|Company Settings|Interceptor|Error Handling" docs
```

### Backend

Baca area relevan:

```text
backend/routes/api.php
backend/config/permissions.php
backend/config/api_errors.php
backend/config/transaction_lifecycle.php if exists

backend/app/Http/Middleware/EnsurePermission.php
backend/app/Http/Middleware/EnsureCompanyAccess.php

backend/app/Http/Controllers/Api/Access/*
backend/app/Http/Controllers/Api/Accounting/*
backend/app/Http/Controllers/Api/Reports/*
backend/app/Http/Controllers/Api/CashBank/*
backend/app/Http/Controllers/Api/Settings/*
backend/app/Http/Controllers/Api/Sales/*
backend/app/Http/Controllers/Api/Purchase/*

backend/app/Services/Permissions/*
backend/app/Services/Access/* if exists
backend/app/Services/Accounting/*
backend/app/Services/Reports/*
backend/app/Services/CashBank/*
backend/app/Services/Settings/*
backend/app/Services/Audit/*
backend/app/Services/Tenant/*
```

### Frontend Vue

Baca area relevan:

```text
frontend-vue/src/services/api.ts
frontend-vue/src/plugins/apiInterceptors.ts if exists
frontend-vue/src/router/index.ts
frontend-vue/src/navigation/sidebar.ts
frontend-vue/src/workspace/registry.ts

frontend-vue/src/services/access/*
frontend-vue/src/services/accounting/*
frontend-vue/src/services/reports/*
frontend-vue/src/services/cash-bank/*
frontend-vue/src/services/settings/*
frontend-vue/src/services/workspace/* if exists

frontend-vue/src/pages/access/*
frontend-vue/src/pages/accounting/*
frontend-vue/src/pages/reports/*
frontend-vue/src/pages/cash-bank/*
frontend-vue/src/pages/settings/*
frontend-vue/src/pages/dashboard/*
frontend-vue/src/features/dashboard/*
frontend-vue/src/features/workspace/*
frontend-vue/src/components/workspace/*
frontend-vue/src/stores/*
```

## AUDIT SECTION 1 — POINT 3: PHASE 18 ACCESS API + VUE NAVIGATION

Cek apakah point 3 sudah selesai.

### Backend checks

Pastikan route aktif:

```bash
php artisan route:list --path=api | grep access
```

Expected route group:

```text
/api/access/users
/api/access/company-users
/api/access/roles
/api/access/permissions/catalog
/api/access/roles/{id}/permissions
/api/access/invitations
/api/access/audit
```

Tidak semua harus ada jika memang belum didukung, tapi report harus menjelaskan statusnya.

Cek:

```text
[ ] /api/access/* routes aktif
[ ] auth:sanctum dipakai
[ ] company.access dipakai untuk company-scoped route
[ ] permission middleware dipakai
[ ] permission keys terdaftar
[ ] no public access route
[ ] no public tenant/company create route
```

### Frontend checks

Cek:

```text
[ ] Access Management muncul di sidebar untuk user dengan permission
[ ] Access Management hidden untuk user tanpa permission
[ ] service endpoint sesuai backend route
[ ] Vue route ada dan valid
[ ] page Users/Company Users usable
[ ] page Roles usable
[ ] Permission Matrix usable
[ ] Invitations usable jika endpoint tersedia
[ ] Access Audit usable jika endpoint tersedia
[ ] 401/403/422 ditangani
```

### Report status

Berikan status:

```text
Done / Partial / Missing / Broken / Needs verification
```

## AUDIT SECTION 2 — POINT 4: FISCAL CLOSING + PERIOD LOCKING WORKSPACE

Cek apakah workspace fiscal closing dan period locking sudah usable.

### Backend endpoint checks

Cek route:

```text
GET /api/accounting/fiscal-year/status
GET /api/accounting/fiscal-years/{id}/closing-preview
GET /api/accounting/fiscal-years/{id}/closing-checklist
POST /api/accounting/fiscal-years/{id}/close
POST /api/accounting/fiscal-years/{id}/reopen
GET /api/accounting/period-locks/status
PATCH /api/accounting/period-locks
```

Gunakan route aktual jika berbeda.

### Frontend checks

Cek:

```text
[ ] menu Fiscal Closing / Period Locking ada jika permission sesuai
[ ] workspace/page tersedia
[ ] current fiscal year status tampil
[ ] closing checklist tampil
[ ] closing preview tampil
[ ] warning/error closing tampil
[ ] close fiscal year action tersedia jika permission/status sesuai
[ ] reopen fiscal year action tersedia jika permission/status sesuai
[ ] period lock status tampil
[ ] update period lock surface tersedia
[ ] period lock warning tidak merusak transaksi lain
```

### Safety checks

```text
[ ] close tidak bisa tanpa checklist/preview jika policy mewajibkan
[ ] locked period memblokir mutation
[ ] historical report tetap bisa dibaca
[ ] audit log dicatat untuk close/reopen/lock
```

## AUDIT SECTION 3 — POINT 5: AR/AP LEDGER DETAIL PAGES

Cek apakah AR/AP ledger detail pages sudah ditambahkan dan terhubung API.

### Backend route checks

Cek:

```text
GET /api/sales/ar/customer/{customer}/ledger
GET /api/sales/ar/invoice/{invoice}/ledger
GET /api/purchase/ap/vendor/{vendor}/ledger
GET /api/purchase/ap/bill/{bill}/ledger
```

Gunakan route aktual jika berbeda.

### Frontend checks

```text
[ ] AR customer ledger detail page ada
[ ] AR invoice ledger detail page ada jika endpoint tersedia
[ ] AP vendor ledger detail page ada
[ ] AP bill ledger detail page ada jika endpoint tersedia
[ ] menu/navigation/link dari AR/AP summary menuju detail tersedia
[ ] filter date range/status ada jika endpoint mendukung
[ ] loading/error/empty state ada
[ ] data debit/credit/balance atau invoice/payment allocation tampil benar
[ ] route params valid
[ ] API service sesuai backend endpoint
```

## AUDIT SECTION 4 — POINT 6: CASH BANK ACCOUNT STATEMENT PAGE

Cek apakah Cash Bank Account Statement page sudah ada dan API-connected.

### Backend route checks

Cek:

```text
GET /api/cash-bank/reports/account-statement
```

### Frontend checks

```text
[ ] menu/page Account Statement tersedia
[ ] filter account tersedia
[ ] filter date range tersedia
[ ] opening balance tampil
[ ] cash in/debit tampil
[ ] cash out/credit tampil
[ ] running balance tampil
[ ] ending balance tampil
[ ] loading/error/empty state ada
[ ] API service sesuai endpoint
[ ] pagination/sort/filter jika endpoint mendukung
[ ] no dummy data
```

## AUDIT SECTION 5 — POINT 7: DASHBOARD REAL API DATA

Cek apakah dashboard placeholder sudah diganti data API nyata.

### Backend route checks

Cari endpoint dashboard/summary yang dipakai:

```bash
rg "dashboard|financial-summary|summary|fiscal-year/status|reports" backend/routes backend/app/Http/Controllers/Api
```

### Frontend checks

```text
[ ] dashboard tidak lagi menampilkan angka hardcoded Rp 0
[ ] dashboard mengambil data dari API
[ ] data tenant-aware via X-Company-ID
[ ] menampilkan loading state
[ ] menampilkan error state
[ ] menampilkan empty state jika data kosong
[ ] summary cards menggunakan angka dari API
[ ] fiscal year status / financial summary / report summary tampil jika tersedia
[ ] tidak ada dummy/mock placeholder yang dianggap production
```

Cari marker:

```bash
rg "placeholder|dummy|mock|Rp 0|0\.00|TODO|hardcoded" frontend-vue/src/pages frontend-vue/src/features frontend-vue/src/components
```

Jangan otomatis menganggap semua TODO salah; klasifikasikan.

## AUDIT SECTION 6 — POINT 8: GENERIC WORKSPACE PAGINATION / FILTER / SORT

Cek apakah generic workspace sudah memakai server-side pagination/filter/sort jika backend mendukung.

### Frontend checks

```text
[ ] workspace tidak hanya fetch all lalu filter client-side untuk dataset besar
[ ] query params dikirim ke backend
[ ] page/per_page dikirim
[ ] search dikirim
[ ] date range dikirim
[ ] status filter dikirim
[ ] sort field/order dikirim
[ ] response pagination dibaca benar
[ ] table menampilkan total/current page/per page
[ ] filter reset bekerja
[ ] apply filter bekerja
[ ] sort bekerja
[ ] changing page fetches new data
[ ] loading state ketika fetch
[ ] error state ketika fetch gagal
```

### Backend compatibility checks

Cek beberapa endpoint generic:

```text
master-data/*
sales/*
purchase/*
cash-bank/*
inventory/*
```

Laporan harus menyebut jika ada endpoint yang belum mendukung query params secara lengkap.

### Risk check

Pastikan tidak terjadi:

```text
[ ] double filtering client + server yang bikin data hilang
[ ] page count salah
[ ] selected row tidak clear saat filter berubah
[ ] bulk action memakai selected rows dari halaman sebelumnya
```

## AUDIT SECTION 7 — POINT 9: COMPANY SETTINGS EDIT SURFACE

Cek apakah company settings edit surface sudah lengkap.

### Backend route checks

```text
GET /api/settings/company
PATCH /api/settings/company/accounting
PATCH /api/settings/company/modules
```

### Frontend checks

```text
[ ] company settings page/menu tersedia
[ ] data settings di-load dari API
[ ] accounting settings bisa diedit
[ ] module settings bisa diedit
[ ] form validation error 422 tampil
[ ] save success notification
[ ] permission-aware action
[ ] loading/error/empty state
[ ] no dummy settings
[ ] no accidental tenant/company creation feature
```

## AUDIT SECTION 8 — POINT 10: API INTERCEPTOR AND ERROR HANDLING

Cek API client/interceptor.

### Required checks

```text
[ ] baseURL dari env
[ ] Authorization Bearer token dikirim otomatis
[ ] X-Company-ID dikirim otomatis
[ ] Accept application/json
[ ] Content-Type application/json where appropriate
[ ] 401 handling jelas
[ ] 403 handling jelas
[ ] 422 validation handling jelas
[ ] 404 handling jelas
[ ] 409 conflict handling jika dipakai backend
[ ] 500/server error handling jelas
[ ] network error handling jelas
[ ] logout/session expired flow tidak loop
[ ] company switch tidak bocor data lama
[ ] validation errors bisa dibaca form
[ ] global toast/error tidak spam
```

### Regression risk

Pastikan interceptor tidak:

```text
[ ] menghapus X-Company-ID
[ ] redirect ke login saat 403 biasa
[ ] membuat infinite redirect loop
[ ] menelan error sehingga form tidak tahu validasi
[ ] mengubah response shape tanpa kompatibilitas
```

## AUDIT SECTION 9 — CROSS-MODULE REGRESSION CHECK

Cek area lama yang harus tetap aman.

```text
[ ] Auth/login
[ ] Register jika masih ada
[ ] Select company
[ ] Company switch
[ ] Dashboard open
[ ] Sidebar open/collapse
[ ] Floating submenu jika ada
[ ] Primary virtual tabs
[ ] Secondary virtual tabs
[ ] Close tab/close all if available
[ ] Master Data list/form
[ ] Chart of Accounts list/form
[ ] Contacts list/form
[ ] Products list/form
[ ] Product History remains under Products
[ ] Product Category does not show Product History
[ ] Journal list/form
[ ] General Ledger
[ ] Trial Balance
[ ] Profit Loss
[ ] Balance Sheet
[ ] Cash Flow
[ ] Sales workspace
[ ] Purchase workspace
[ ] Cash Bank workspace
[ ] Inventory workspace
[ ] Workspace list design consistency
[ ] Bulk selection checkbox state
[ ] Bulk action still safe
```

## AUDIT SECTION 10 — SEARCH FOR LEFTOVER DUMMY / TODO / BROKEN MARKERS

Run searches:

```bash
rg "dummy|mock|placeholder|TODO|FIXME|temporary|hardcoded|not implemented|coming soon|lorem|Rp 0|TODO:" frontend-vue/src backend/app docs
```

Classify findings:

```text
Production blocker
Needs follow-up
Acceptable comment
Test/mock only
Documentation only
```

Do not edit findings; only report.

## AUDIT SECTION 11 — REPORT FORMAT

Create/update:

```text
docs/post-implementation-audit-check.md
```

Use this structure:

```markdown
# Post-Implementation Audit Check

Tanggal audit:
Branch:
Latest commits:
Working tree before audit:
Working tree after audit:

## 1. Executive Summary

- Overall status:
- Biggest remaining risks:
- Recommended next action:

## 2. Scope Checked

- [x] Point 3 — Phase 18 Access API + Vue Navigation
- [x] Point 4 — Fiscal Closing + Period Locking Workspace
- [x] Point 5 — AR/AP Ledger Detail Pages
- [x] Point 6 — Cash Bank Account Statement Page
- [x] Point 7 — Dashboard Real API Data
- [x] Point 8 — Generic Workspace Pagination/Filter/Sort
- [x] Point 9 — Company Settings Edit Surface
- [x] Point 10 — API Interceptor & Error Handling
- [x] Cross-module regression check
- [x] Dummy/TODO marker scan

## 3. Status Matrix

| Point | Area | Status | Evidence | Remaining Gap | Priority |
| --- | --- | --- | --- | --- | --- |
| 3 | Access API + Vue Navigation | Done/Partial/Broken | ... | ... | P0/P1/P2 |
| 4 | Fiscal Closing + Period Locking | ... | ... | ... | ... |
| 5 | AR/AP Ledger Detail | ... | ... | ... | ... |
| 6 | Cash Bank Account Statement | ... | ... | ... | ... |
| 7 | Dashboard Real API Data | ... | ... | ... | ... |
| 8 | Workspace Pagination/Filter/Sort | ... | ... | ... | ... |
| 9 | Company Settings Edit Surface | ... | ... | ... | ... |
| 10 | API Interceptor/Error Handling | ... | ... | ... | ... |

## 4. Point 3 Detailed Audit — Access API + Vue Navigation

### Backend Routes
### Middleware / Permissions
### Frontend Services
### Vue Routes
### Sidebar Navigation
### Findings
### Verdict

## 5. Point 4 Detailed Audit — Fiscal Closing + Period Locking

### Backend Routes
### Frontend Workspace
### Close/Reopen Flow
### Period Lock Flow
### Findings
### Verdict

## 6. Point 5 Detailed Audit — AR/AP Ledger Detail Pages

### AR Ledger
### AP Ledger
### Navigation Links
### Findings
### Verdict

## 7. Point 6 Detailed Audit — Cash Bank Account Statement

### API Connection
### Filters
### Statement Table
### Running Balance
### Findings
### Verdict

## 8. Point 7 Detailed Audit — Dashboard Real API Data

### API Used
### Placeholder Removal
### Loading/Error/Empty State
### Findings
### Verdict

## 9. Point 8 Detailed Audit — Generic Workspace Pagination/Filter/Sort

### Query Params
### Pagination Response
### Sorting
### Filters
### Selection/Bulk Action Safety
### Findings
### Verdict

## 10. Point 9 Detailed Audit — Company Settings Edit Surface

### GET Settings
### PATCH Accounting Settings
### PATCH Module Settings
### Validation
### Findings
### Verdict

## 11. Point 10 Detailed Audit — API Interceptor & Error Handling

### Token/Header Handling
### 401/403/422/500 Handling
### Network Error Handling
### Regression Risk
### Findings
### Verdict

## 12. Cross-Module Regression Checklist

- [ ] Login
- [ ] Company selection
- [ ] Tenant header
- [ ] Sidebar
- [ ] Virtual tabs
- [ ] Master data
- [ ] Product history location
- [ ] Journals
- [ ] Reports
- [ ] Sales
- [ ] Purchase
- [ ] Cash Bank
- [ ] Inventory

## 13. Dummy/TODO/Broken Marker Scan

| File | Marker | Classification | Notes |
| --- | --- | --- | --- |

## 14. Commands Run

| Command | Result | Notes |
| --- | --- | --- |

## 15. Remaining Issues by Priority

### P0 — Must Fix Before Continue
- [ ] ...

### P1 — Important
- [ ] ...

### P2 — Follow-up
- [ ] ...

## 16. Recommended Next Codex Prompts

- [ ] Prompt 1: ...
- [ ] Prompt 2: ...
- [ ] Prompt 3: ...

## 17. Final Checklist

- [ ] Audit completed in read-only mode
- [ ] Only report file was created/updated
- [ ] No application source code changed
- [ ] All point 3–10 checked
- [ ] Regression checklist completed
- [ ] Remaining gaps listed
```

## STATUS DEFINITIONS

Use these statuses:

```text
Done
Partial
Broken
Missing
Needs verification
Not applicable
```

Definitions:

```text
Done = implementation exists, route/service/page wired, checks pass.
Partial = some pieces work but important behavior missing.
Broken = exists but likely fails due to route mismatch, event mismatch, service mismatch, or build error.
Missing = not found.
Needs verification = code exists but cannot confirm without runtime/manual auth test.
Not applicable = feature not relevant or backend does not support it.
```

## PRIORITY DEFINITIONS

```text
P0 = blocker / can break user workflow / security issue
P1 = important functional gap
P2 = improvement / follow-up
```

## FINAL RESPONSE FROM CODEX

At the end, Codex must respond with:

1. Report file path.
2. Confirmation audit was read-only.
3. Git status before audit.
4. Git status after audit.
5. Changed files.
6. Overall status summary.
7. P0 issues count.
8. P1 issues count.
9. P2 issues count.
10. Commands run and results.

Required sentence if only report changed:

```text
Audit completed in read-only mode. Only docs/post-implementation-audit-check.md was created/updated.
```

If unexpected files changed:

```text
WARNING: unexpected file changes detected
```

List the files.

## IMPORTANT FINAL RULE

Lebih baik laporan kurang lengkap daripada Codex mengubah source code aplikasi.

Do not fix.
Do not refactor.
Do not redesign.
Do not commit.
Do not push.

Only audit and report.
