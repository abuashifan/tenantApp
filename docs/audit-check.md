TASK TITLE:
Audit Frontend Implementation and Backend-Frontend Integration Gap Report

PROJECT:
TenantAppDevelopment / tenantApp

TUJUAN:
Lakukan audit menyeluruh terhadap project frontend dan koneksi backend-frontend, lalu buat laporan markdown rapi berisi:

1. Apa saja fitur frontend yang sudah diimplementasikan.
2. Apa saja fitur frontend yang belum diimplementasikan.
3. Apa saja endpoint/backend module yang sudah ada tetapi belum terhubung ke frontend.
4. Apa saja halaman/menu/sidebar/route frontend yang belum sesuai dengan backend.
5. Apa saja form/list/workspace yang masih dummy, belum memakai API, atau masih memakai state sementara.
6. Apa saja integrasi API yang error, belum memakai Authorization Bearer token, atau belum memakai X-Company-ID.
7. Rekomendasi prioritas implementasi berikutnya dalam bentuk task list.

KONTEKS PROJECT:
Project ini adalah aplikasi akuntansi multi-tenant.

Stack utama:

- Backend: Laravel API
- Frontend utama saat ini: Vue frontend jika folder frontend-vue ada dan aktif
- Frontend lama/alternatif: Next.js jika folder frontend masih ada
- Database: SQLite development/MVP
- Auth: Laravel Sanctum Bearer token
- Tenant context: X-Company-ID
- 1 company = 1 tenant database

ROADMAP STATUS REFERENSI:
Berdasarkan roadmap terbaru:

- Phase 0–9 sudah selesai.
- Phase 10 Purchase Workflow & AP Backend sedang aktif / berikutnya.
- Phase 11 Cash Bank Backend belum dimulai.
- Phase 12 Inventory Backend belum dimulai.
- Phase 13 Accounting Frontend MVP belum selesai sepenuhnya.
- Phase 14 Sales Frontend MVP belum dimulai.
- Phase 15 Purchase Frontend MVP belum dimulai.
- Phase 16 Cash Bank Frontend MVP belum dimulai.
- Phase 17 Inventory Frontend MVP belum dimulai.

CATATAN PENTING:
Backend sudah jauh lebih lengkap daripada frontend.
Audit harus fokus mencari gap antara backend API yang tersedia dengan frontend UI yang belum dibuat / belum terhubung.

WAJIB:

- Jangan mengubah kode aplikasi.
- Jangan refactor.
- Jangan membuat fitur baru.
- Jangan memperbaiki bug dalam task ini.
- Task ini hanya audit dan membuat laporan.
- Jika menemukan bug, tulis di laporan.
- Jika menemukan mismatch route/API, tulis di laporan.
- Jika menemukan state dummy/temporary, tulis di laporan.
- Jika menemukan endpoint belum dipakai frontend, tulis di laporan.
- Jika menemukan halaman frontend belum ada, tulis di laporan.

GUARDRAIL WAJIB:

- Jangan merusak fitur/design yang sudah fix.
- Jangan refactor besar tanpa alasan.
- Jangan mengubah kontrak API.
- Jangan mengubah state management existing.
- Jangan mengubah komponen reusable yang sudah berjalan.
- Jangan menghapus menu, route, atau komponen.
- Jangan mengubah file backend kecuali hanya dibaca untuk audit.
- Jangan mengubah file frontend kecuali membuat file laporan markdown.
- Lakukan regression check area yang sudah selesai secara pasif melalui audit.
- Final summary wajib menyebutkan bahwa tidak ada kode aplikasi yang diubah.

FOLDER YANG HARUS DIAUDIT:
Audit sesuai folder yang ada di repo.

Backend:

- backend/routes/api.php
- backend/app/Http/Controllers/Api
- backend/app/Services
- backend/app/Models/Tenant
- backend/config/permissions.php
- backend/config/document_numbers.php jika ada
- backend/docs atau docs terkait phase jika ada

Frontend Vue jika ada:

- frontend-vue/src
- frontend-vue/src/router
- frontend-vue/src/stores
- frontend-vue/src/services
- frontend-vue/src/pages
- frontend-vue/src/components
- frontend-vue/src/layouts

Frontend Next.js jika masih ada:

- frontend/app
- frontend/components
- frontend/lib
- frontend/features
- frontend/types

DOKUMEN ROADMAP / MEMORY YANG HARUS DIBACA JIKA ADA:

- update-roadmap.md
- docs/Roadmap_Revisi_System_Policy_Accounting_Foundation.md
- docs/phase-\*.md
- .copilot/project-context.md
- project-plan.md
- roadmap-frontend-vuejs-tenantappdevelopment.md

AUDIT DETAIL YANG HARUS DILAKUKAN:

A. Audit Backend Endpoint Map
Buat daftar endpoint backend dari backend/routes/api.php.

Kelompokkan endpoint berdasarkan module:

- Auth
- Company / Tenant Context
- Company Settings
- Master Data
- Chart of Accounts
- Contacts
- Units
- Product Categories
- Products
- Warehouses
- Account Mappings
- Departments
- Projects
- Journal Entries
- General Ledger
- Trial Balance
- Profit Loss
- Balance Sheet
- Cash Flow
- Financial Summary
- Fiscal Closing
- Period Locking
- Sales Quotation
- Sales Order
- Delivery Order
- Proforma Invoice
- Sales Invoice
- Billing Invoice
- Sales Receipt
- Customer Deposit
- Sales Return
- AR Subsidiary Ledger
- AR Aging
- Purchase module jika sudah ada
- Cash Bank module jika sudah ada
- Inventory module jika sudah ada
- Reports advanced jika sudah ada
- Audit log jika sudah ada

Untuk setiap endpoint catat:

- HTTP method
- URL
- controller/action jika bisa ditemukan
- permission middleware jika ada
- status: ada / tidak ada / perlu dicek
- frontend route/page terkait jika ada
- frontend service terkait jika ada

B. Audit Frontend Route Map
Buat daftar route/page frontend yang tersedia.

Untuk Vue:

- baca router config
- baca pages folder
- baca layout/menu/navigation config
- baca Pinia stores
- baca service API

Untuk Next.js:

- baca app route structure
- baca AppShell/menu/navigation
- baca lib/api.ts
- baca feature navigation files
- baca service/client files

Untuk setiap page catat:

- route frontend
- module
- apakah ada di sidebar/menu
- apakah halaman list ada
- apakah form create ada
- apakah form edit ada
- apakah detail page ada
- apakah sudah terhubung API
- apakah masih dummy/static/temporary Pinia state
- apakah sudah permission-aware
- apakah sudah memakai virtual tabs/workspace state
- status implementasi:
  - Done
  - Partial
  - Dummy
  - Missing
  - Broken / Needs Review

C. Audit API Client Integration
Cek:

- apakah frontend memakai base URL dari env
- apakah Authorization Bearer token otomatis dikirim
- apakah X-Company-ID otomatis dikirim
- apakah 401 ditangani
- apakah 403 ditangani
- apakah 422 validation error ditangani form
- apakah network error ditangani
- apakah logout clear token dan company context
- apakah switch company clear/reload data yang benar
- apakah API response mengikuti format backend

D. Audit Sidebar/Menu vs Backend
Cek apakah sidebar/menu frontend sesuai endpoint backend.

Cari:

- menu yang ada tapi endpoint belum ada
- endpoint yang ada tapi menu belum ada
- menu salah URL
- menu salah module grouping
- menu belum permission-aware
- menu mengarah ke page dummy
- menu mengarah ke route yang belum dibuat
- menu create/edit yang belum memakai virtual tabs

E. Audit Workspace List
Cek semua workspace/list page.

Untuk setiap workspace list:

- apakah memakai reusable WorkspaceList component
- apakah search berfungsi
- apakah filter tanggal berfungsi
- apakah filter status berfungsi
- apakah pagination berfungsi
- apakah sorting berfungsi
- apakah row selection berfungsi
- apakah checkbox bulk select berfungsi
- apakah bulk void/action berfungsi
- apakah create button membuka secondary virtual tab
- apakah edit button membuka secondary virtual tab
- apakah data dari API atau dummy state
- apakah loading/empty/error state ada
- apakah responsive cukup aman
- apakah style konsisten dengan design system

F. Audit Form Input
Cek semua form input:

- Chart of Accounts
- Contacts
- Units
- Product Categories
- Products
- Warehouses
- Departments
- Projects
- Journals
- Sales documents jika ada
- Purchase documents jika ada
- Cash Bank jika ada
- Inventory jika ada

Untuk setiap form:

- create form ada/tidak
- edit form ada/tidak
- validation ada/tidak
- submit ke API atau belum
- update ke API atau belum
- error 422 tampil atau belum
- dropdown terhubung ke API atau dummy
- product/customer/account selector berfungsi atau tidak
- form state tersimpan saat pindah virtual tab atau tidak
- unsaved draft state aman atau tidak
- action approve/post/void tersedia atau tidak
- permission-aware atau tidak

G. Audit Virtual Tabs / Workspace State
Cek:

- primary virtual tabs berjalan
- secondary virtual tabs muncul untuk list/form
- list tab icon-only
- create tab muncul saat create
- edit tab muncul saat edit
- state form tidak hilang saat pindah tab
- dirty state ada
- close tab confirmation ada
- close all tabs handling ada
- state per primary tab independen
- tidak ada tab duplicate untuk edit entity yang sama
- tab list tidak bisa ditutup
- dashboard tidak menampilkan secondary tabs

H. Audit Module Gap Berdasarkan Roadmap
Buat gap report berdasarkan roadmap.

Minimal kelompokkan:

1. Accounting Frontend MVP

- Chart of Accounts
- Contacts
- Units
- Product Categories
- Products
- Warehouses
- Departments
- Projects
- Journal Entries
- General Ledger
- Trial Balance
- Profit Loss
- Balance Sheet
- Cash Flow
- Financial Summary
- Fiscal Closing / Period Locking

2. Sales Frontend MVP

- Sales Quotation
- Sales Order
- Delivery Order
- Proforma Invoice
- Sales Invoice
- Billing Invoice
- Sales Receipt
- Customer Deposit
- Sales Return
- AR Subsidiary Ledger
- AR Aging

3. Purchase Frontend MVP

- Purchase Request
- Purchase Order
- Goods Receipt
- Vendor Bill
- Vendor Payment
- Vendor Deposit
- Purchase Return
- AP Subsidiary Ledger
- AP Aging

4. Cash Bank Frontend MVP

- Cash In
- Cash Out
- Bank Transfer
- Bank Reconciliation
- Cash Bank Reports

5. Inventory Frontend MVP

- Stock List
- Product Stock Detail
- Warehouse Stock
- Stock Movement
- Stock Adjustment
- Stock Opname
- Inventory Valuation
- Stock Card

I. Audit Dummy / Temporary State
Cari semua indikasi:

- dummy data
- temporary data
- mock data
- sample state
- hardcoded array
- fake API
- TODO connect API
- local-only state yang seharusnya API
- Pinia temporary store yang seharusnya diganti API

Laporkan:

- file path
- module
- apa data dummy-nya
- endpoint backend yang seharusnya dipakai
- prioritas penggantian

J. Audit Missing Backend-Frontend Connection
Buat tabel khusus:
Backend endpoint tersedia tetapi frontend belum memakai.

Kolom:

- Module
- Backend endpoint
- Backend status
- Frontend page
- Frontend service
- Connection status
- Gap
- Priority
- Recommended task

Contoh status:

- Connected
- Page exists but API not connected
- Service exists but page not using it
- API client missing
- Frontend page missing
- Endpoint missing
- Needs verification

K. Audit Broken / Risky Integration
Cari potensi risiko:

- endpoint URL salah
- method GET/POST/PATCH salah
- request payload tidak cocok backend
- response mapping salah
- field name backend berbeda dengan frontend
- selector dropdown kosong karena mapping field salah
- permission key mismatch
- route guard kurang
- X-Company-ID tidak ikut
- bearer token tidak ikut
- table filter query param tidak cocok backend
- pagination format tidak cocok backend

OUTPUT LAPORAN:
Buat file:

docs/frontend-audit-gap-report.md

Format markdown wajib:

# Frontend Audit & Backend Integration Gap Report

## 1. Executive Summary

Isi:

- kondisi umum frontend
- kondisi umum integrasi backend
- risiko utama
- prioritas implementasi berikutnya

## 2. Audit Scope

Task list:

- [ ] Backend endpoint map audited
- [ ] Frontend route map audited
- [ ] Sidebar/menu audited
- [ ] API client audited
- [ ] Workspace list audited
- [ ] Forms audited
- [ ] Virtual tabs audited
- [ ] Dummy state audited
- [ ] Backend-frontend connection audited

## 3. Backend Endpoint Map

Buat tabel:
| Module | Method | Endpoint | Controller/Action | Permission | Frontend Status |

## 4. Frontend Route Map

Buat tabel:
| Module | Frontend Route | Page/File | Menu Status | API Status | Implementation Status |

## 5. Backend Endpoint Not Connected to Frontend

Buat task list per module:

### Accounting

- [ ] Endpoint ... belum terhubung ke page ...
- [ ] Endpoint ... sudah ada service tapi belum dipakai page ...

### Sales

- [ ] ...

### Purchase

- [ ] ...

### Cash Bank

- [ ] ...

### Inventory

- [ ] ...

## 6. Frontend Pages Missing

Buat task list:

- [ ] Buat page ...
- [ ] Buat workspace list ...
- [ ] Buat create/edit form ...
- [ ] Hubungkan ke endpoint ...

## 7. Pages Still Using Dummy / Temporary State

Buat tabel:
| Module | File | Dummy/Temporary Data | Required Endpoint | Recommended Fix |

## 8. Sidebar/Menu Mismatch

Buat task list:

- [ ] Menu ... mengarah ke route yang belum ada
- [ ] Endpoint ... belum punya menu
- [ ] Menu ... tidak permission-aware
- [ ] Menu ... salah grouping

## 9. Workspace List Audit

Buat tabel:
| Module | List Page | API Connected | Search | Filter | Pagination | Bulk Action | Status |

## 10. Form Input Audit

Buat tabel:
| Module | Form | Create | Edit | Validation | Submit API | Dropdown API | Draft State | Status |

## 11. Virtual Tabs & Draft State Audit

Buat task list:

- [ ] Primary tabs ...
- [ ] Secondary tabs ...
- [ ] Create tab ...
- [ ] Edit tab ...
- [ ] Draft state ...
- [ ] Dirty state ...
- [ ] Close all ...

## 12. API Client & Error Handling Audit

Buat task list:

- [ ] Bearer token otomatis
- [ ] X-Company-ID otomatis
- [ ] 401 handling
- [ ] 403 handling
- [ ] 422 validation handling
- [ ] Network error handling
- [ ] Pagination response mapping
- [ ] Field mapping consistency

## 13. Priority Implementation Plan

Buat prioritas:

### Priority 1 — Fix Critical Integration

- [ ] ...

### Priority 2 — Connect Existing Backend to Existing Frontend

- [ ] ...

### Priority 3 — Build Missing Accounting Frontend

- [ ] ...

### Priority 4 — Build Sales Frontend

- [ ] ...

### Priority 5 — Prepare Purchase/Cash Bank/Inventory Frontend

- [ ] ...

## 14. Recommended Next Codex Tasks

Buat prompt-ready task list:

- [ ] Task 1: ...
- [ ] Task 2: ...
- [ ] Task 3: ...

## 15. Final Checklist

- [ ] Tidak ada kode aplikasi yang diubah
- [ ] Tidak ada backend contract yang diubah
- [ ] Tidak ada frontend design yang diubah
- [ ] Audit selesai
- [ ] Gap report dibuat di docs/frontend-audit-gap-report.md
- [ ] Laporan siap dipakai sebagai dasar prompt implementasi berikutnya

FORMAT PENULISAN:

- Gunakan bahasa Indonesia.
- Gunakan markdown rapi.
- Gunakan checklist sebanyak mungkin.
- Gunakan tabel untuk mapping.
- Jangan terlalu singkat.
- Sertakan path file yang ditemukan.
- Sertakan status setiap item.
- Jika tidak yakin, tulis "Needs verification", jangan mengarang.
- Jika folder/module belum ada, tulis "Missing".
- Jika endpoint belum ditemukan, tulis "Endpoint not found".
- Jika frontend belum ditemukan, tulis "Frontend page missing".

COMMAND YANG BOLEH DIJALANKAN:
Untuk audit boleh jalankan:

- php artisan route:list jika backend dependency siap
- npm run lint jika frontend dependency siap
- npm run build jika environment memungkinkan
- npm run typecheck jika tersedia
- grep/rg untuk mencari route, dummy, mock, TODO, endpoint, service
- cat/sed untuk membaca file relevan

JANGAN menjalankan migrate, seed, atau command yang mengubah database.

FINAL RESPONSE CODEX:
Setelah selesai, berikan summary:

1. File laporan yang dibuat.
2. Jumlah endpoint backend yang ditemukan.
3. Jumlah frontend route/page yang ditemukan.
4. Jumlah endpoint belum terhubung.
5. Jumlah page missing.
6. Jumlah page masih dummy/temporary.
7. Top 10 prioritas perbaikan.
8. Command yang dijalankan.
9. Command yang gagal/tidak bisa dijalankan.
10. Konfirmasi tidak ada kode aplikasi yang diubah.

TAMBAHAN INSTRUKSI WAJIB UNTUK CODEX:

MODE KERJA:
READ-ONLY AUDIT MODE.

Tugas ini hanya:

1. Membaca project.
2. Mengecek struktur frontend.
3. Mengecek route/backend endpoint.
4. Mengecek koneksi backend-frontend.
5. Membuat satu file laporan markdown.

BATASAN MUTLAK:
Codex TIDAK BOLEH mengedit file aplikasi apa pun.

DILARANG MENGUBAH:

- backend/\*
- frontend/\*
- frontend-vue/\*
- package.json
- package-lock.json
- pnpm-lock.yaml
- yarn.lock
- composer.json
- composer.lock
- vite.config.\*
- tsconfig.\*
- eslint config
- tailwind config
- env file
- migration
- controller
- service
- model
- route
- store
- component
- page
- layout
- API client
- permission file
- navigation file
- CSS file
- config file aplikasi apa pun

FILE YANG BOLEH DIBUAT:
Hanya boleh membuat:

docs/frontend-audit-gap-report.md

Jika file docs/frontend-audit-gap-report.md sudah ada:

- boleh overwrite file itu saja,
- atau update file itu saja,
- tetapi tetap tidak boleh mengubah file lain.

COMMAND YANG BOLEH DIJALANKAN:
Read-only command saja:

- git status --short
- find
- ls
- cat
- sed
- grep
- rg
- php artisan route:list
- npm run lint hanya jika tidak menghasilkan auto-fix
- npm run typecheck jika tersedia dan tidak mengubah file
- npm run build hanya jika yakin tidak mengubah source file

COMMAND YANG DILARANG:
Jangan menjalankan command yang bisa mengubah project, database, dependency, cache besar, atau generated file:

- npm install
- npm update
- npm audit fix
- npm run format
- npm run lint -- --fix
- prettier --write
- eslint --fix
- composer install
- composer update
- php artisan migrate
- php artisan db:seed
- php artisan migrate:fresh
- php artisan optimize
- php artisan config:cache
- php artisan route:cache
- php artisan view:cache
- php artisan storage:link
- command generate file seperti make:controller, make:model, make:migration
- command apa pun yang membuat/merubah file selain report markdown

ATURAN SEBELUM MULAI:

1. Jalankan:
   git status --short

2. Catat kondisi awal working tree di laporan.

3. Setelah audit selesai, jalankan lagi:
   git status --short

4. Pastikan perubahan hanya:
   docs/frontend-audit-gap-report.md

5. Jika ada perubahan file lain:
   - jangan commit,
   - jangan lanjut modifikasi,
   - tulis di final summary bahwa ada perubahan tidak diharapkan,
   - kembalikan perubahan tersebut jika perubahan itu dibuat oleh Codex.

ATURAN OUTPUT:
Laporan wajib dibuat di:

docs/frontend-audit-gap-report.md

Isi laporan tetap sesuai instruksi audit:

- endpoint backend map
- frontend route map
- backend endpoint belum terhubung ke frontend
- page frontend missing
- page masih dummy/temporary
- sidebar/menu mismatch
- workspace list audit
- form input audit
- virtual tabs audit
- API client/error handling audit
- priority implementation plan
- recommended next Codex tasks
- final checklist

FINAL RESPONSE CODEX WAJIB MENYEBUTKAN:

1. File report yang dibuat.
2. Konfirmasi tidak mengubah source code.
3. Hasil git status sebelum audit.
4. Hasil git status setelah audit.
5. Daftar file yang berubah.
6. Jika hanya docs/frontend-audit-gap-report.md yang berubah, tulis:
   "Audit completed in read-only mode. Only report file was created/updated."
7. Jika ada file lain berubah, tulis:
   "WARNING: unexpected file changes detected" dan sebutkan file-nya.

PRINSIP UTAMA:
Lebih baik laporan kurang lengkap daripada Codex mengubah file aplikasi.
Jangan memperbaiki bug.
Jangan membuat service.
Jangan membuat page.
Jangan membuat component.
Jangan mengubah route.
Jangan mengubah state.
Jangan mengubah design.
HANYA AUDIT + REPORT.

COMMIT MESSAGE:
Jika diminta commit:
docs: add frontend audit and backend integration gap report
