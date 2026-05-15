ROADMAP BUILD APLIKASI AKUNTANSI

Stack:
- Laravel API
- Next.js Frontend
- TailwindCSS
- SQLite
- Multi-tenant sederhana: 1 perusahaan = 1 file SQLite
- 1 domain aplikasi
- 1 user bisa punya banyak perusahaan
- User pilih perusahaan setelah login

Arsitektur:
- central.sqlite = database pusat
- tenant_xxx.sqlite = database perusahaan
- backend menentukan database tenant berdasarkan company yang aktif

Contoh domain:
https://app.akuntansiku.com

Contoh struktur database:
backend/database/central.sqlite
backend/database/tenants/company_000001.sqlite
backend/database/tenants/company_000002.sqlite


==================================================
PHASE 0 — SETUP PROJECT FOUNDATION
==================================================

Status:
SELESAI

Target:
[ ] Laravel backend berhasil jalan
[ ] Next.js frontend berhasil jalan
[ ] TailwindCSS aktif
[ ] SQLite central siap
[ ] Folder tenant database siap
[ ] Struktur project rapi dari awal
[ ] Laravel dan Next.js bisa saling komunikasi
[ ] Git repository siap
[ ] File .env dan .sqlite tidak ikut Git

Scope:
[ ] Setup folder root accounting-app
[ ] Setup backend Laravel
[ ] Setup frontend Next.js
[ ] Setup TailwindCSS
[ ] Setup central.sqlite
[ ] Setup folder database/tenants
[ ] Setup API health check
[ ] Setup CORS
[ ] Setup Laravel Sanctum
[ ] Setup struktur folder services/controllers/requests
[ ] Setup config tenant
[ ] Setup koneksi tenant di config/database.php
[ ] Setup TenantConnectionManager
[ ] Setup halaman frontend test API
[ ] Setup dokumentasi awal

Struktur target:
accounting-app
├── backend
│   ├── app
│   │   ├── Http
│   │   │   └── Controllers
│   │   │       └── Api
│   │   ├── Services
│   │   │   ├── Auth
│   │   │   ├── Tenant
│   │   │   ├── Accounting
│   │   │   ├── Report
│   │   │   ├── Database
│   │   │   └── Backup
│   │   ├── Support
│   │   └── Traits
│   ├── config
│   │   └── tenant.php
│   ├── database
│   │   ├── central.sqlite
│   │   ├── tenants
│   │   └── migrations
│   │       ├── central
│   │       └── tenant
│   └── routes
│       └── api.php
│
├── frontend
│   ├── app
│   ├── components
│   ├── features
│   ├── hooks
│   ├── lib
│   ├── store
│   └── types
│
├── docs
├── backups
├── README.md
└── .gitignore

Checklist Phase 0:
[ ] Laravel jalan di http://127.0.0.1:8000
[ ] Next.js jalan di http://localhost:3000
[ ] GET /api/health berhasil
[ ] Frontend bisa fetch /api/health
[ ] API Status: ok tampil di frontend
[ ] database/central.sqlite tersedia
[ ] database/tenants tersedia
[ ] .env tidak ikut Git
[ ] .sqlite tidak ikut Git


==================================================
PHASE 1A — CENTRAL DATABASE SCHEMA + MODEL RELATIONS
==================================================

Status:
SELESAI

Target:
[ ] Struktur central database dibuat
[ ] Model central dibuat
[ ] Relasi antar model dibuat
[ ] Belum membuat login/register
[ ] Belum membuat frontend
[ ] Belum membuat modul akuntansi

Central database:
backend/database/central.sqlite

Tabel central:
[ ] users
[ ] companies
[ ] company_users
[ ] tenant_databases
[ ] plans
[ ] subscriptions
[ ] company_invitations
[ ] activity_logs

Fungsi tabel:
users = akun login user
companies = data perusahaan
company_users = relasi user dengan perusahaan
tenant_databases = metadata file SQLite tenant
plans = paket langganan
subscriptions = status langganan perusahaan
company_invitations = undangan user ke perusahaan
activity_logs = log aktivitas central

File dibuat:
backend/database/migrations/2026_05_15_000001_create_companies_table.php
backend/database/migrations/2026_05_15_000002_create_company_users_table.php
backend/database/migrations/2026_05_15_000003_create_tenant_databases_table.php
backend/database/migrations/2026_05_15_000004_create_plans_table.php
backend/database/migrations/2026_05_15_000005_create_subscriptions_table.php
backend/database/migrations/2026_05_15_000006_create_company_invitations_table.php
backend/database/migrations/2026_05_15_000007_create_activity_logs_table.php

backend/app/Models/Company.php
backend/app/Models/CompanyUser.php
backend/app/Models/TenantDatabase.php
backend/app/Models/Plan.php
backend/app/Models/Subscription.php
backend/app/Models/CompanyInvitation.php
backend/app/Models/ActivityLog.php

File diubah:
backend/database/migrations/0001_01_01_000000_create_users_table.php
backend/app/Models/User.php

Perubahan users:
[ ] phone
[ ] avatar
[ ] status
[ ] last_login_at

Relasi User:
[ ] companies
[ ] companyUsers
[ ] ownedCompanies
[ ] invitationsSent

Relasi Company:
[ ] creator
[ ] users
[ ] companyUsers
[ ] tenantDatabase
[ ] subscriptions
[ ] activeSubscription
[ ] invitations

Catatan:
[ ] Status dan role memakai string, bukan enum
[ ] Lebih aman untuk SQLite
[ ] central.sqlite lokal dan di-ignore Git

Command testing:
cd backend
composer dump-autoload
php artisan migrate:fresh --force
php artisan migrate:status

Checklist:
[ ] migrate:fresh --force berhasil
[ ] migrate:status semua migration Ran
[ ] tidak ada duplicate migration personal_access_tokens
[ ] model autoload berhasil


==================================================
PHASE 1B — SEEDER, DEMO DATA, ENDPOINT DEMO, FRONTEND DEMO, DOKUMENTASI
==================================================

Status:
SELESAI

Target:
[ ] Seeder plan dibuat
[ ] Seeder demo central data dibuat
[ ] 2 company dummy dibuat
[ ] 2 tenant database metadata dibuat
[ ] 2 file SQLite tenant dummy dibuat
[ ] Endpoint demo /api/my-companies-demo dibuat
[ ] Halaman frontend /companies-demo dibuat
[ ] Dokumentasi central database dibuat
[ ] Checklist Phase 1 dibuat

Data dummy:
User:
- name: Admin Demo
- email: admin@example.com
- password: password
- status: active

Company 1:
- name: PT Maju Jaya
- legal_name: PT Maju Jaya
- slug: pt-maju-jaya
- code: CMP-000001
- role: owner
- tenant database: company_000001.sqlite

Company 2:
- name: CV Sumber Rejeki
- legal_name: CV Sumber Rejeki
- slug: cv-sumber-rejeki
- code: CMP-000002
- role: admin
- tenant database: company_000002.sqlite

Tenant dummy:
backend/database/tenants/company_000001.sqlite
backend/database/tenants/company_000002.sqlite

File dibuat:
backend/database/seeders/PlanSeeder.php
backend/database/seeders/DemoCentralSeeder.php
backend/app/Http/Controllers/Api/Companies/MyCompaniesController.php
frontend/app/companies-demo/page.tsx
docs/central-database-schema.md
docs/phase-1-checklist.md

File diubah:
backend/database/seeders/DatabaseSeeder.php
backend/routes/api.php

Endpoint demo:
GET /api/my-companies-demo

Frontend demo:
http://localhost:3000/companies-demo

Command testing:
cd backend
composer dump-autoload
php artisan migrate:fresh --seed
php artisan migrate:status
php artisan serve

Cek API:
http://127.0.0.1:8000/api/my-companies-demo

Frontend:
cd frontend
npm run dev

Cek frontend:
http://localhost:3000/companies-demo

Checklist:
[ ] php artisan migrate:fresh --seed berhasil
[ ] User admin@example.com ada
[ ] Company PT Maju Jaya ada
[ ] Company CV Sumber Rejeki ada
[ ] Relasi admin@example.com ke PT Maju Jaya role owner ada
[ ] Relasi admin@example.com ke CV Sumber Rejeki role admin ada
[ ] tenant_databases berisi company_000001.sqlite
[ ] tenant_databases berisi company_000002.sqlite
[ ] File company_000001.sqlite ada
[ ] File company_000002.sqlite ada
[ ] File .sqlite tidak masuk Git
[ ] GET /api/my-companies-demo return 2 company
[ ] Halaman /companies-demo menampilkan 2 card

Catatan wajib dibersihkan di Phase 2:
[ ] Route GET /api/my-companies-demo masih demo
[ ] MyCompaniesController masih hardcode admin@example.com
[ ] Nanti harus diganti auth()->user()
[ ] Nanti harus pakai middleware auth:sanctum
[ ] Nanti harus validasi akses company user asli


==================================================
PHASE 2 — AUTHENTICATION & COMPANY ACCESS
==================================================

Status:
BELUM MULAI

Target:
[ ] Register user
[ ] Login user
[ ] Logout user
[ ] Get current user
[ ] Get companies milik user login
[ ] Select active company
[ ] Middleware validasi X-Company-ID
[ ] Cek user punya akses ke company_id
[ ] Tenant context test
[ ] Frontend login
[ ] Frontend company selection
[ ] Frontend company switcher sederhana

Backend Auth:
[ ] Buat AuthController
[ ] Buat RegisterRequest
[ ] Buat LoginRequest
[ ] Endpoint POST /api/auth/register
[ ] Endpoint POST /api/auth/login
[ ] Endpoint POST /api/auth/logout
[ ] Endpoint GET /api/auth/me
[ ] Generate token Sanctum saat login
[ ] Revoke token saat logout
[ ] Update last_login_at saat login
[ ] Validasi user status active

Company Access:
[ ] Endpoint GET /api/companies
[ ] Endpoint POST /api/companies/select
[ ] Endpoint GET /api/tenant-context-test
[ ] Ganti hardcode admin@example.com menjadi auth()->user()
[ ] Hapus atau nonaktifkan /api/my-companies-demo
[ ] Validasi user hanya bisa melihat company miliknya
[ ] Validasi user hanya bisa memilih company miliknya
[ ] Return 403 jika user akses company yang bukan miliknya

Middleware:
[ ] Buat EnsureCompanyAccess middleware
[ ] Middleware membaca X-Company-ID
[ ] Middleware cek user login
[ ] Middleware cek company aktif
[ ] Middleware cek company_users
[ ] Middleware cek tenant_databases
[ ] Middleware simpan active company context ke request/container
[ ] Jika invalid, return 403

Tenant Context:
[ ] Buat service TenantContext
[ ] Simpan company_id aktif
[ ] Simpan company model aktif
[ ] Simpan role user di company aktif
[ ] Simpan tenant database metadata
[ ] Siapkan integrasi ke TenantConnectionManager

Frontend Auth:
[ ] Buat halaman login
[ ] Buat halaman register
[ ] Simpan token login
[ ] Buat auth state sederhana
[ ] Buat API client support Authorization Bearer token
[ ] Buat protected route sederhana
[ ] Setelah login ambil daftar companies
[ ] Jika company user hanya 1, auto select
[ ] Jika company user lebih dari 1, tampilkan select company
[ ] Simpan active_company_id
[ ] Set X-Company-ID di setiap request setelah company dipilih

Frontend Company Selection:
[ ] Halaman /select-company
[ ] Menampilkan PT Maju Jaya dan CV Sumber Rejeki untuk user demo
[ ] User bisa pilih PT Maju Jaya
[ ] User bisa pilih CV Sumber Rejeki
[ ] Setelah pilih, masuk dashboard
[ ] Dashboard menampilkan active company
[ ] Company switcher sederhana di topbar

Testing utama:
Login:
admin@example.com
password

Flow test:
login admin@example.com
↓
muncul 2 company
↓
pilih PT Maju Jaya
↓
tenant context menunjukkan company_000001.sqlite
↓
switch ke CV Sumber Rejeki
↓
tenant context menunjukkan company_000002.sqlite

Expected endpoint tenant context:
GET /api/tenant-context-test

Response company 1:
company_id: 1
company_name: PT Maju Jaya
database_name: company_000001.sqlite
user_role: owner

Response company 2:
company_id: 2
company_name: CV Sumber Rejeki
database_name: company_000002.sqlite
user_role: admin

Catatan:
[ ] Tenant database belum perlu punya tabel akuntansi
[ ] Yang diuji hanya company context dan access validation
[ ] Tenant resolver final akan diperkuat di Phase 3


==================================================
PHASE 3 — TENANT DATABASE GENERATOR & TENANT MIGRATION SYSTEM
==================================================

Status:
BELUM MULAI

Target:
[ ] Sistem bisa membuat file SQLite tenant otomatis
[ ] Sistem bisa menjalankan migration tenant
[ ] Sistem bisa menjalankan seed tenant
[ ] Sistem bisa migrate semua tenant
[ ] Sistem bisa migrate tenant tertentu
[ ] Sistem bisa cek status database tenant
[ ] Sistem bisa update metadata tenant database

Service:
[ ] CreateTenantDatabaseService
[ ] TenantMigrationService
[ ] TenantSeederService
[ ] TenantDatabaseHealthService
[ ] TenantConnectionManager diperkuat

Command:
[ ] php artisan tenant:create {company_id}
[ ] php artisan tenant:migrate
[ ] php artisan tenant:migrate --company=1
[ ] php artisan tenant:seed
[ ] php artisan tenant:seed --company=1
[ ] php artisan tenant:fresh --company=1
[ ] php artisan tenant:status
[ ] php artisan tenant:check-storage

Migration folder:
database/migrations/tenant

Tenant metadata:
[ ] database_name
[ ] database_path
[ ] status
[ ] migration_version
[ ] last_migrated_at
[ ] last_backup_at
[ ] size_bytes
[ ] metadata

Flow create company nanti:
User create company
↓
Insert companies di central.sqlite
↓
Insert company_users role owner
↓
Generate file SQLite tenant
↓
Run tenant migration
↓
Run default tenant seed
↓
Insert tenant_databases metadata
↓
Create subscription trial

Checklist:
[ ] File tenant dibuat otomatis
[ ] Tidak overwrite file lama
[ ] Path tenant aman
[ ] File SQLite tidak berada di public folder
[ ] Migration tenant bisa dijalankan per company
[ ] Migration tenant bisa dijalankan semua company
[ ] Jika migration gagal, status tenant menjadi failed
[ ] Jika sukses, status tenant menjadi active


==================================================
PHASE 4 — MASTER DATA AKUNTANSI
==================================================

Status:
BELUM MULAI

Target:
[ ] Chart of Accounts
[ ] Contacts
[ ] Products
[ ] Units
[ ] Warehouses

Chart of Accounts:
[ ] Tabel chart_of_accounts
[ ] Account code
[ ] Account name
[ ] Account type
[ ] Parent account
[ ] Normal balance
[ ] Is cash/bank
[ ] Is active
[ ] Opening balance
[ ] Create account
[ ] Edit account
[ ] Nonaktif account
[ ] Parent-child account
[ ] Akun default

Account types:
[ ] Asset
[ ] Liability
[ ] Equity
[ ] Revenue
[ ] Expense

Contacts:
[ ] customers
[ ] suppliers
[ ] employees
[ ] other_contacts

Products:
[ ] products
[ ] product_categories
[ ] units
[ ] warehouses

Tenant only:
[ ] Semua tabel master data masuk ke tenant database
[ ] Tidak masuk central.sqlite


==================================================
PHASE 5 — JOURNAL ENTRY ENGINE
==================================================

Status:
BELUM MULAI

Target:
[ ] Jurnal umum
[ ] Journal entries
[ ] Journal entry lines
[ ] Validasi debit kredit
[ ] Draft
[ ] Posted
[ ] Void
[ ] Nomor jurnal otomatis

Tables:
[ ] journal_entries
[ ] journal_entry_lines

Journal entries:
[ ] id
[ ] journal_number
[ ] journal_date
[ ] description
[ ] status draft/posted/void
[ ] source_type
[ ] source_id
[ ] created_by
[ ] posted_by
[ ] posted_at
[ ] voided_by
[ ] voided_at

Journal entry lines:
[ ] journal_entry_id
[ ] account_id
[ ] description
[ ] debit
[ ] credit

Validasi:
[ ] Total debit = total kredit
[ ] Akun wajib ada
[ ] Tanggal wajib ada
[ ] Nomor jurnal unik
[ ] Posted journal tidak boleh diedit langsung
[ ] Void journal tidak boleh diposting ulang
[ ] Debit dan kredit tidak boleh dua-duanya isi dalam satu line
[ ] Minimal 2 line

Flow:
Draft journal
↓
Validate balance
↓
Post journal
↓
Lock journal
↓
Masuk laporan buku besar


==================================================
PHASE 6 — GENERAL LEDGER & TRIAL BALANCE
==================================================

Status:
BELUM MULAI

Target:
[ ] Buku besar
[ ] Detail ledger per akun
[ ] Neraca saldo
[ ] Saldo awal
[ ] Mutasi debit/kredit
[ ] Saldo akhir

Reports:
[ ] General Ledger
[ ] Account Ledger Detail
[ ] Trial Balance

Logic:
[ ] Ambil journal posted saja
[ ] Filter tanggal
[ ] Group by account
[ ] Hitung opening balance
[ ] Hitung debit period
[ ] Hitung credit period
[ ] Hitung ending balance

Urutan laporan:
Jurnal Umum
↓
Buku Besar
↓
Neraca Saldo
↓
Laba Rugi
↓
Neraca


==================================================
PHASE 7 — FINANCIAL STATEMENTS BASIC
==================================================

Status:
BELUM MULAI

Target:
[ ] Laporan Laba Rugi
[ ] Laporan Neraca
[ ] Laporan Arus Kas sederhana

Laba Rugi:
[ ] Revenue
[ ] Cost of Goods Sold jika inventory sudah ada
[ ] Expense
[ ] Net Profit/Loss

Neraca:
[ ] Asset
[ ] Liability
[ ] Equity
[ ] Current period profit masuk equity
[ ] Total asset = total liability + equity

Arus Kas:
[ ] Operating activities
[ ] Investing activities
[ ] Financing activities
[ ] Bisa dibuat sederhana dulu dari akun cash/bank

Filter:
[ ] Start date
[ ] End date
[ ] Period
[ ] Export PDF nanti
[ ] Export Excel nanti


==================================================
PHASE 8 — SALES MODULE
==================================================

Status:
BELUM MULAI

Target:
[ ] Sales invoice
[ ] Sales invoice detail
[ ] Customer
[ ] Item/product
[ ] Tax
[ ] Discount
[ ] Payment status
[ ] Posting otomatis ke jurnal

Tables:
[ ] sales_invoices
[ ] sales_invoice_lines
[ ] sales_payments nanti bisa di kas/bank

Sales invoice:
[ ] invoice_number
[ ] invoice_date
[ ] due_date
[ ] customer_id
[ ] subtotal
[ ] discount
[ ] tax
[ ] total
[ ] paid_amount
[ ] balance_due
[ ] status draft/posted/paid/void

Posting invoice:
Debit  : Piutang Usaha
Kredit : Penjualan
Kredit : PPN Keluaran jika ada

Jika inventory aktif:
Debit  : HPP
Kredit : Persediaan

Validasi:
[ ] Customer wajib ada
[ ] Minimal 1 item/line
[ ] Total invoice benar
[ ] Posted invoice membuat jurnal
[ ] Void invoice membuat jurnal reversal


==================================================
PHASE 9 — PURCHASE MODULE
==================================================

Status:
BELUM MULAI

Target:
[ ] Purchase invoice
[ ] Purchase invoice detail
[ ] Supplier
[ ] Tax
[ ] Discount
[ ] Payment status
[ ] Posting otomatis ke jurnal

Tables:
[ ] purchase_invoices
[ ] purchase_invoice_lines

Posting pembelian kredit:
Debit  : Persediaan / Beban
Debit  : PPN Masukan jika ada
Kredit : Utang Usaha

Validasi:
[ ] Supplier wajib ada
[ ] Minimal 1 line
[ ] Total purchase benar
[ ] Posted purchase membuat jurnal
[ ] Void purchase membuat jurnal reversal


==================================================
PHASE 10 — CASH & BANK
==================================================

Status:
BELUM MULAI

Target:
[ ] Cash accounts
[ ] Bank accounts
[ ] Receive payment
[ ] Make payment
[ ] Transfer antar kas/bank
[ ] Rekonsiliasi sederhana

Features:
[ ] Penerimaan pembayaran piutang
[ ] Pembayaran utang
[ ] Penerimaan kas lainnya
[ ] Pengeluaran kas lainnya
[ ] Transfer antar kas/bank

Posting penerimaan piutang:
Debit  : Kas/Bank
Kredit : Piutang Usaha

Posting pembayaran utang:
Debit  : Utang Usaha
Kredit : Kas/Bank

Transfer antar kas/bank:
Debit  : Bank tujuan
Kredit : Bank asal


==================================================
PHASE 11 — INVENTORY
==================================================

Status:
BELUM MULAI

Target:
[ ] Stock items
[ ] Warehouses
[ ] Stock movements
[ ] Stock adjustment
[ ] Stock opname
[ ] COGS/HPP
[ ] Average cost
[ ] Stock card

Tables:
[ ] stock_movements
[ ] stock_adjustments
[ ] stock_opnames
[ ] item_costs

Movement types:
[ ] purchase_in
[ ] sales_out
[ ] adjustment_in
[ ] adjustment_out
[ ] transfer_in
[ ] transfer_out
[ ] opening_stock

Costing:
[ ] Average cost awal
[ ] Hitung HPP saat penjualan
[ ] Posting HPP otomatis

Flow inventory:
Pembelian barang
↓
Barang masuk stok
↓
Penjualan barang
↓
Barang keluar stok
↓
Hitung HPP
↓
Posting jurnal HPP


==================================================
PHASE 12 — REPORTS ADVANCED
==================================================

Status:
BELUM MULAI

Target:
[ ] Laporan Penjualan
[ ] Laporan Pembelian
[ ] Laporan Piutang
[ ] Laporan Utang
[ ] Laporan Persediaan
[ ] Kartu stok
[ ] Rekap pelanggan
[ ] Rekap supplier
[ ] Export PDF
[ ] Export Excel
[ ] Print view

Reports:
[ ] Sales by customer
[ ] Sales by product
[ ] Purchase by supplier
[ ] Accounts receivable aging
[ ] Accounts payable aging
[ ] Inventory valuation
[ ] Stock card
[ ] Cash/bank mutation

Filter:
[ ] Date range
[ ] Customer
[ ] Supplier
[ ] Product
[ ] Warehouse
[ ] Account
[ ] Status


==================================================
PHASE 13 — ROLE & PERMISSION
==================================================

Status:
BELUM MULAI

Target:
[ ] Role per company
[ ] Permission per module
[ ] Middleware permission
[ ] UI hide/show menu berdasarkan permission

Roles:
[ ] owner
[ ] admin
[ ] finance
[ ] accountant
[ ] sales
[ ] purchasing
[ ] warehouse
[ ] viewer

Permissions:
[ ] view_dashboard
[ ] manage_accounts
[ ] create_journal
[ ] post_journal
[ ] void_journal
[ ] manage_sales
[ ] manage_purchases
[ ] manage_inventory
[ ] manage_cash_bank
[ ] view_reports
[ ] export_reports
[ ] manage_users
[ ] manage_company_settings

Rules:
[ ] Owner bisa semua
[ ] Admin hampir semua
[ ] Finance fokus jurnal, kas bank, laporan
[ ] Sales fokus sales
[ ] Purchasing fokus purchase
[ ] Warehouse fokus inventory
[ ] Viewer hanya lihat


==================================================
PHASE 14 — FRONTEND DASHBOARD & UI SYSTEM
==================================================

Status:
BELUM MULAI

Target:
[ ] Dashboard layout
[ ] Sidebar
[ ] Topbar
[ ] Company switcher
[ ] User menu
[ ] Breadcrumb
[ ] Responsive mobile layout
[ ] Responsive tablet layout
[ ] Responsive desktop layout
[ ] Table component
[ ] Form component
[ ] Modal component
[ ] Empty state
[ ] Loading state
[ ] Error state

Pages:
[ ] Login
[ ] Register
[ ] Select Company
[ ] Dashboard
[ ] Chart of Accounts
[ ] Journal Entries
[ ] General Ledger
[ ] Trial Balance
[ ] Sales Invoice
[ ] Purchase Invoice
[ ] Cash & Bank
[ ] Inventory
[ ] Reports
[ ] Settings
[ ] Users & Roles

Responsive target:
[ ] Smartphone
[ ] Tablet
[ ] Laptop
[ ] Desktop monitor besar


==================================================
PHASE 15 — BACKUP & RESTORE SQLITE
==================================================

Status:
BELUM MULAI

Target:
[ ] Backup central.sqlite
[ ] Backup tenant database per perusahaan
[ ] Download backup file
[ ] Restore tenant database
[ ] Auto backup harian
[ ] Simpan backup dengan timestamp
[ ] Backup log
[ ] Restore log

Backup structure:
backups
├── central
│   └── central_2026_05_15.sqlite
└── tenants
    ├── company_000001_2026_05_15.sqlite
    └── company_000002_2026_05_15.sqlite

Commands:
[ ] php artisan backup:central
[ ] php artisan backup:tenant --company=1
[ ] php artisan backup:all-tenants
[ ] php artisan restore:tenant --company=1 --file=...

Safety:
[ ] Jangan restore tanpa backup sebelumnya
[ ] Jangan restore file tenant ke company yang salah
[ ] Validasi path file backup
[ ] Validasi ukuran file
[ ] Log semua proses backup/restore


==================================================
PHASE 16 — AUDIT LOG
==================================================

Status:
BELUM MULAI

Target:
[ ] Log user login
[ ] Log create transaksi
[ ] Log update transaksi
[ ] Log delete/void transaksi
[ ] Log posting jurnal
[ ] Log export laporan
[ ] Log backup/restore
[ ] Log switch company
[ ] Log invite user
[ ] Log role change

Central audit:
[ ] login
[ ] logout
[ ] create company
[ ] invite user
[ ] subscription changed
[ ] tenant database created
[ ] tenant migration failed

Tenant audit:
[ ] create COA
[ ] update COA
[ ] create journal
[ ] post journal
[ ] void journal
[ ] create invoice
[ ] receive payment
[ ] export report

Fields:
[ ] user_id
[ ] company_id
[ ] action
[ ] module
[ ] record_type
[ ] record_id
[ ] old_value
[ ] new_value
[ ] ip_address
[ ] user_agent
[ ] created_at


==================================================
PHASE 17 — TESTING
==================================================

Status:
BELUM MULAI

Target:
[ ] Backend feature test
[ ] Backend unit test
[ ] Frontend basic test
[ ] Manual test checklist
[ ] Migration test
[ ] Tenant switching test
[ ] Accounting balance test

Backend tests:
[ ] Test register
[ ] Test login
[ ] Test current user
[ ] Test get companies
[ ] Test select company
[ ] Test reject company not owned by user
[ ] Test tenant context
[ ] Test create COA
[ ] Test create journal balanced
[ ] Test reject journal unbalanced
[ ] Test post journal
[ ] Test ledger
[ ] Test trial balance
[ ] Test laba rugi
[ ] Test neraca

Important tests:
[ ] User A tidak bisa akses company User B
[ ] Company switch mengganti tenant context
[ ] Journal debit credit harus balance
[ ] Posted journal tidak bisa diedit langsung
[ ] Void journal tidak hilang dari audit
[ ] File SQLite tenant tidak bisa diakses publik


==================================================
PHASE 18 — DEPLOYMENT TO VPS
==================================================

Status:
BELUM MULAI

Target:
[ ] Setup VPS Ubuntu
[ ] Install Nginx
[ ] Install PHP
[ ] Install Composer
[ ] Install Node.js
[ ] Install SQLite extension
[ ] Deploy Laravel backend
[ ] Deploy Next.js frontend
[ ] Setup domain
[ ] Setup SSL
[ ] Setup supervisor/PM2
[ ] Setup backup otomatis
[ ] Setup permission folder SQLite

Production structure:
1 VPS
├── Nginx
├── Laravel backend
├── Next.js frontend
├── central.sqlite
├── tenant databases
└── backups

Domain:
https://app.akuntansiku.com

Security:
[ ] .env tidak public
[ ] database SQLite tidak public
[ ] storage permission benar
[ ] Nginx block akses .sqlite
[ ] HTTPS aktif
[ ] APP_DEBUG=false
[ ] APP_ENV=production
[ ] Backup otomatis aktif
[ ] Log rotation aktif

Deployment checklist:
[ ] git pull
[ ] composer install --no-dev
[ ] php artisan migrate --force
[ ] php artisan config:cache
[ ] php artisan route:cache
[ ] php artisan queue:restart jika pakai queue
[ ] npm install
[ ] npm run build
[ ] restart PHP-FPM
[ ] restart Nginx
[ ] restart PM2 jika Next.js pakai PM2


==================================================
MVP PRIORITY
==================================================

Untuk versi MVP, jangan langsung semua modul.

Prioritas utama:
[ ] Login/Register
[ ] Create Company
[ ] Generate SQLite tenant
[ ] Select Company
[ ] Chart of Accounts
[ ] Journal Entry
[ ] General Ledger
[ ] Trial Balance
[ ] Laba Rugi
[ ] Neraca

Jika 10 item ini stabil, aplikasi sudah punya fondasi akuntansi yang benar.

Urutan MVP:
1. Setup Laravel API
2. Setup Next.js + TailwindCSS
3. Setup central.sqlite
4. Authentication
5. Company management
6. Tenant database generator
7. Tenant resolver
8. Chart of Accounts
9. Journal Entry
10. General Ledger
11. Trial Balance
12. Financial Statements
13. Sales
14. Purchase
15. Cash & Bank
16. Inventory


==================================================
CURRENT PROJECT STATUS
==================================================

Selesai:
[✓] Phase 0 — Setup Project Foundation
[✓] Phase 1A — Central Database Schema + Model Relations
[✓] Phase 1B — Seeder + Demo Data + Endpoint Demo + Frontend Demo + Docs

Belum mulai:
[ ] Phase 2 — Authentication & Company Access
[ ] Phase 3 — Tenant Database Generator & Migration System
[ ] Phase 4 — Master Data Akuntansi
[ ] Phase 5 — Journal Entry Engine
[ ] Phase 6 — General Ledger & Trial Balance
[ ] Phase 7 — Financial Statements Basic
[ ] Phase 8 — Sales Module
[ ] Phase 9 — Purchase Module
[ ] Phase 10 — Cash & Bank
[ ] Phase 11 — Inventory
[ ] Phase 12 — Reports Advanced
[ ] Phase 13 — Role & Permission
[ ] Phase 14 — Frontend Dashboard & UI System
[ ] Phase 15 — Backup & Restore SQLite
[ ] Phase 16 — Audit Log
[ ] Phase 17 — Testing
[ ] Phase 18 — Deployment to VPS

Data demo saat ini:
admin@example.com
password

Company demo:
PT Maju Jaya
- role: owner
- tenant: company_000001.sqlite

CV Sumber Rejeki
- role: admin
- tenant: company_000002.sqlite

Endpoint demo sementara:
GET /api/my-companies-demo

Frontend demo sementara:
GET /companies-demo

Catatan penting untuk Phase 2:
[ ] Hapus/ganti endpoint demo /api/my-companies-demo
[ ] Ganti hardcode admin@example.com menjadi auth()->user()
[ ] Tambahkan auth:sanctum
[ ] Tambahkan validasi company access
[ ] Tambahkan active company context
[ ] Tambahkan company switcher