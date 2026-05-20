# ROADMAP BUILD APLIKASI AKUNTANSI — REVISI SYSTEM POLICY & ACCOUNTING FOUNDATION

Stack:
- Laravel API
- Next.js Frontend
- TailwindCSS
- SQLite
- Multi-tenant sederhana: 1 perusahaan = 1 file SQLite tenant
- 1 domain aplikasi
- 1 user bisa punya banyak perusahaan
- User pilih perusahaan setelah login

Phase 9 project memory:
```text
Phase 9 — Sales Workflow & Accounts Receivable adalah backend-first.
Phase 9 bukan frontend; frontend sales masuk Phase 14.
Phase 9 tidak membuat Stock Movement Engine.
Stock Movement Engine tetap Phase 12B/12E.
Delivery Order Phase 9 hanya dokumen pengiriman.
Sales Invoice langsung Phase 9 belum membuat stock movement.
COGS journal ditunda ke Phase 12.
Buku besar pembantu piutang masuk Phase 9J.
Phase 9A selesai: sales workflow foundation, calculation/source-chain services, permissions, numbering, docs.
Phase 9B selesai: Sales Quotation backend tenant-aware; no journal, no AR, no stock movement.
Phase 9C selesai: Sales Order backend + minimal Customer Deposit entry dari Sales Order; no AR journal, no stock movement.
Phase 9D selesai: Delivery Order backend sebagai dokumen pengiriman; updates delivered quantity; no stock movement/COGS.
Phase 9E selesai: Proforma Invoice backend sebagai dokumen non-accounting; no AR/revenue journal, no stock movement.
Phase 9F selesai: Sales Invoice backend dengan AR/revenue/tax journal dan DP allocation journal; no stock movement/COGS.
Phase 9G selesai: Billing Invoice optional foundation implemented; linked billing does not create double AR/revenue.
Phase 9H selesai: Customer Deposit, deposit allocation, refund, and Sales Receipt backend; no full Cash Bank module.
Phase 9I selesai: Sales Return backend dengan contra revenue/AR journal; no stock movement/inventory journal.
```

Arsitektur:
- central.sqlite = database pusat
- tenant_xxx.sqlite = database perusahaan
- backend menentukan database tenant berdasarkan company yang aktif
- request tenant memakai header X-Company-ID

Contoh domain:
https://app.akuntansiku.com

Contoh struktur database:
```text
backend/database/central.sqlite
backend/database/tenants/company_000001.sqlite
backend/database/tenants/company_000002.sqlite
```

Prinsip revisi roadmap:
```text
Yang berdampak ke hampir semua modul → dimajukan ke awal.
Yang hanya fitur lanjutan / opsional → tetap di belakang.
```

Perubahan utama:
```text
Phase 4 lama: Master Data Akuntansi
Phase 4 baru: System Policy & Accounting Foundation
Master Data Akuntansi digeser menjadi Phase 5.
Semua phase setelahnya ikut bergeser.
Role & Permission basic, Audit Log basic, Period Lock, Document Numbering, Source Link, Revision Tracking, Transaction Policy, dan Report Visibility dimajukan ke Phase 4 agar tidak refactor besar saat modul transaksi sudah dibuat.
```

==================================================
PHASE 0 — SETUP PROJECT FOUNDATION
==================================================

Status:
SELESAI

Target:
```text
[✓] Laravel backend berhasil jalan
[✓] Next.js frontend berhasil jalan
[✓] TailwindCSS aktif
[✓] SQLite central siap
[✓] Folder tenant database siap
[✓] Struktur project rapi dari awal
[✓] Laravel dan Next.js bisa saling komunikasi
[✓] Git repository siap
[✓] File .env dan .sqlite tidak ikut Git
```

Scope:
```text
[✓] Setup folder root accounting-app
[✓] Setup backend Laravel
[✓] Setup frontend Next.js
[✓] Setup TailwindCSS
[✓] Setup central.sqlite
[✓] Setup folder database/tenants
[✓] Setup API health check
[✓] Setup CORS
[✓] Setup Laravel Sanctum
[✓] Setup struktur folder services/controllers/requests
[✓] Setup config tenant
[✓] Setup koneksi tenant di config/database.php
[✓] Setup TenantConnectionManager
[✓] Setup halaman frontend test API
[✓] Setup dokumentasi awal
```

Struktur target:
```text
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
```

Checklist Phase 0:
```text
[✓] Laravel jalan di http://127.0.0.1:8000
[✓] Next.js jalan di http://localhost:3000
[✓] GET /api/health berhasil
[✓] Frontend bisa fetch /api/health
[✓] API Status: ok tampil di frontend
[✓] database/central.sqlite tersedia
[✓] database/tenants tersedia
[✓] .env tidak ikut Git
[✓] .sqlite tidak ikut Git
```

==================================================
PHASE 1 — CENTRAL DATABASE SCHEMA + DEMO FOUNDATION
==================================================

Status:
SELESAI

Phase ini menggabungkan Phase 1A dan Phase 1B dari roadmap lama.

Target:
```text
[✓] Struktur central database dibuat
[✓] Model central dibuat
[✓] Relasi antar model dibuat
[✓] Seeder plan dibuat
[✓] Seeder demo central data dibuat
[✓] 2 company dummy dibuat
[✓] 2 tenant database metadata dibuat
[✓] 2 file SQLite tenant dummy dibuat
[✓] Endpoint demo /api/my-companies-demo dibuat untuk Phase 1
[✓] Halaman frontend /companies-demo dibuat untuk Phase 1
[✓] Dokumentasi central database dibuat
```

Central database:
```text
backend/database/central.sqlite
```

Tabel central:
```text
[✓] users
[✓] companies
[✓] company_users
[✓] tenant_databases
[✓] plans
[✓] subscriptions
[✓] company_invitations
[✓] activity_logs
```

Fungsi tabel:
```text
users = akun login user
companies = data perusahaan
company_users = relasi user dengan perusahaan
tenant_databases = metadata file SQLite tenant
plans = paket langganan
subscriptions = status langganan perusahaan
company_invitations = undangan user ke perusahaan
activity_logs = log aktivitas central basic
```

Data demo:
```text
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
```

Tenant dummy:
```text
backend/database/tenants/company_000001.sqlite
backend/database/tenants/company_000002.sqlite
```

Catatan penting:
```text
[✓] Status dan role memakai string, bukan enum
[✓] Lebih aman untuk SQLite
[✓] central.sqlite lokal dan di-ignore Git
[✓] activity_logs sudah ada sebagai fondasi audit basic
```

Catatan wajib dibersihkan di Phase 2:
```text
[✓] Route GET /api/my-companies-demo dinonaktifkan/diganti
[✓] MyCompaniesController hardcode admin@example.com diganti auth()->user()
[✓] auth:sanctum ditambahkan
[✓] validasi akses company user asli ditambahkan
```

==================================================
PHASE 2 — AUTHENTICATION & COMPANY ACCESS
==================================================

Status:
SELESAI SECARA IMPLEMENTASI
Perlu test lokal end-to-end di environment development.

Target:
```text
[✓] Register user
[✓] Login user
[✓] Logout user
[✓] Get current user
[✓] Get companies milik user login
[✓] Select active company
[✓] Middleware validasi X-Company-ID
[✓] Cek user punya akses ke company_id
[✓] Tenant context test
[✓] Frontend login
[✓] Frontend company selection
[✓] Frontend company switcher sederhana
```

Backend Auth:
```text
[✓] AuthController
[✓] RegisterRequest
[✓] LoginRequest
[✓] Endpoint POST /api/auth/register
[✓] Endpoint POST /api/auth/login
[✓] Endpoint POST /api/auth/logout
[✓] Endpoint GET /api/auth/me
[✓] Generate token Sanctum saat login
[✓] Revoke token saat logout
[✓] Update last_login_at saat login
[✓] Validasi user status active
```

Company Access:
```text
[✓] Endpoint GET /api/companies
[✓] Endpoint POST /api/companies/select
[✓] Endpoint GET /api/tenant-context-test
[✓] Ganti hardcode admin@example.com menjadi auth()->user()
[✓] Hapus atau nonaktifkan /api/my-companies-demo
[✓] Validasi user hanya bisa melihat company miliknya
[✓] Validasi user hanya bisa memilih company miliknya
[✓] Return 403 jika user akses company yang bukan miliknya
```

Middleware:
```text
[✓] EnsureCompanyAccess middleware
[✓] Middleware membaca X-Company-ID
[✓] Middleware cek user login
[✓] Middleware cek company aktif
[✓] Middleware cek company_users
[✓] Middleware cek tenant_databases
[✓] Middleware simpan active company context ke request/container
[✓] Jika invalid, return 403/422 sesuai kondisi
```

Tenant Context:
```text
[✓] TenantContext service
[✓] Simpan company_id aktif
[✓] Simpan company model aktif
[✓] Simpan role user di company aktif
[✓] Simpan tenant database metadata
[✓] Siapkan integrasi ke TenantConnectionManager
```

Frontend Auth:
```text
[✓] Halaman login
[✓] Halaman register
[✓] Simpan token login
[✓] API client support Authorization Bearer token
[✓] API client support X-Company-ID
[✓] Protected route sederhana
[✓] Setelah login ambil daftar companies
[✓] Jika company user hanya 1, auto select
[✓] Jika company user lebih dari 1, tampilkan select company
[✓] Simpan active_company_id
[✓] Set X-Company-ID di setiap request setelah company dipilih
```

Aturan security yang sudah disepakati:
```text
Client / user biasa TIDAK BOLEH create tenant/company.

Yang boleh create tenant/company nanti:
- owner aplikasi
- staf internal
- operator internal yang punya akses server/VPS

Untuk MVP:
- tenant/company creation tidak dibuat di UI client
- tidak ada endpoint public POST /api/companies
- tidak ada endpoint public POST /api/tenants
- tidak ada menu create company untuk client
- tenant generator di Phase 3 dibuat via Artisan command internal

Client hanya boleh:
- login
- melihat company yang sudah diberikan akses
- memilih company aktif
- switch company
- mengakses data tenant yang sudah diizinkan

Client tidak boleh:
- create company
- create tenant
- generate SQLite tenant
- migrate tenant
- melihat semua tenant
- mengakses admin internal
```

Flow test utama:
```text
login admin@example.com / password
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
```

==================================================
PHASE 3 — TENANT DATABASE GENERATOR & TENANT MIGRATION SYSTEM
==================================================

Status:
BELUM MULAI / DALAM RANCANGAN

Target besar:
```text
[ ] Sistem bisa membuat file SQLite tenant otomatis
[ ] Sistem bisa menjalankan migration tenant
[ ] Sistem bisa menjalankan seed tenant
[ ] Sistem bisa migrate semua tenant
[ ] Sistem bisa migrate tenant tertentu
[ ] Sistem bisa cek status database tenant
[ ] Sistem bisa update metadata tenant database
[ ] Sistem punya test isolasi tenant
[ ] Tidak ada endpoint public create/migrate/assign tenant
```

--------------------------------------------------
PHASE 3A — Tenant Create Command
--------------------------------------------------

Target:
```text
[ ] Internal command tenant:create
[ ] Membuat company di central.sqlite
[ ] Membuat company_users owner/admin
[ ] Membuat file SQLite tenant di database/tenants
[ ] Membuat tenant_databases metadata
[ ] Tidak overwrite file lama
[ ] Path tenant aman
[ ] File SQLite tidak berada di public folder
[ ] Tidak ada endpoint public create tenant
[ ] Tidak ada UI create tenant untuk client
```

Service:
```text
[ ] CreateTenantDatabaseService
[ ] TenantDatabaseHealthService
[ ] TenantConnectionManager diperkuat
```

Command:
```text
[ ] php artisan tenant:create {company_id}
[ ] php artisan tenant:check-storage
```

Flow create company internal:
```text
Owner/staf internal menjalankan command
↓
Insert companies di central.sqlite
↓
Insert company_users role owner/admin
↓
Generate file SQLite tenant
↓
Run tenant migration
↓
Run default tenant seed
↓
Insert tenant_databases metadata
↓
Create subscription trial jika dibutuhkan
```

--------------------------------------------------
PHASE 3B — Tenant Migration Command
--------------------------------------------------

Target:
```text
[ ] Internal command tenant:migrate
[ ] Bisa migrate satu tenant dengan --company-id
[ ] Bisa migrate semua tenant aktif dengan --all
[ ] Migration hanya memakai connection tenant
[ ] Migration hanya dari database/migrations/tenant
[ ] Jika migration gagal, status tenant menjadi failed
[ ] Jika sukses, status tenant menjadi active
[ ] Tidak ada endpoint public migrate tenant
```

Command:
```text
[ ] php artisan tenant:migrate
[ ] php artisan tenant:migrate --company=1
[ ] php artisan tenant:migrate --all
[ ] php artisan tenant:fresh --company=1
[ ] php artisan tenant:status
```

--------------------------------------------------
PHASE 3C — Tenant User Assignment & Demo Seed Command
--------------------------------------------------

Target:
```text
[ ] Internal command company:assign-user
[ ] Internal command company:seed-demo
[ ] Assign user ke company via command internal
[ ] Seed demo tenant
[ ] Tidak ada endpoint public assign user
[ ] Tidak ada UI manage tenant/company user untuk client biasa
```

Command:
```text
[ ] php artisan company:assign-user
[ ] php artisan company:seed-demo
[ ] php artisan tenant:seed
[ ] php artisan tenant:seed --company=1
```

--------------------------------------------------
PHASE 3D — Tenant Isolation Testing
--------------------------------------------------

Target:
```text
[ ] Backend test only
[ ] Feature test untuk middleware company.access
[ ] Feature test untuk GET /api/companies
[ ] Feature test untuk POST /api/companies/select
[ ] Feature test untuk GET /api/tenant-context-test
[ ] Test user tidak bisa akses company milik user lain
[ ] Test tanpa token ditolak 401
[ ] Test tanpa X-Company-ID ditolak 422
[ ] Test X-Company-ID invalid ditolak
[ ] Test tenant database inactive ditolak
[ ] Test company inactive ditolak jika logic existing mendukung
[ ] Test route list tidak punya public create/migrate/assign tenant endpoint
[ ] Dokumentasi docs/phase-3d-tenant-isolation-testing.md
```

Tidak boleh ada route public:
```text
POST /api/companies
POST /api/tenants
POST /api/tenant/migrate
POST /api/company-users
POST /api/companies/{id}/users
DELETE /api/companies/{id}
DELETE /api/tenants/{id}
```

Acceptance criteria Phase 3:
```text
[ ] File tenant dibuat otomatis
[ ] Tidak overwrite file lama
[ ] Path tenant aman
[ ] File SQLite tidak berada di public folder
[ ] Migration tenant bisa dijalankan per company
[ ] Migration tenant bisa dijalankan semua company
[ ] Assignment user-company hanya command internal
[ ] Tenant isolation test lolos
[ ] Tidak ada public endpoint create/migrate/assign tenant
```

==================================================
PHASE 4 — SYSTEM POLICY & ACCOUNTING FOUNDATION
==================================================

Status:
BELUM MULAI

Phase ini adalah phase baru yang wajib dibuat sebelum Master Data Akuntansi.

Tujuan:
```text
Mengunci aturan global aplikasi sebelum masuk master data, jurnal, invoice, purchase, cash bank, inventory, stock movement, fixed asset, dan laporan.
```

Alasan dimajukan:
```text
Jika rule, permission, period lock, numbering, source link, audit, dan report visibility dibuat belakangan, semua modul transaksi harus di-refactor.
```

--------------------------------------------------
4A — Company Settings Foundation
--------------------------------------------------

Target:
```text
[ ] company_accounting_settings
[ ] company_module_settings
[ ] company_numbering_settings
[ ] company_default_account_settings
[ ] company setting API internal tenant-safe
[ ] Backend membaca setting berdasarkan active company
```

Setting wajib:
```text
base_currency
amount_precision
quantity_precision
rounding_method
transaction_workflow_mode
auto_post_transactions
allow_edit_transactions
allow_edit_posted_transactions
allow_void_transactions
hide_voided_transactions
show_voided_toggle_enabled
require_void_reason
period_lock_enabled
approval_enabled
tax_enabled
inventory_enabled
purchase_enabled
sales_enabled
cash_bank_enabled
```

Default rekomendasi:
```text
base_currency = IDR
amount_precision = 2
quantity_precision = 4
rounding_method = half_up
transaction_workflow_mode = simple_auto_post
auto_post_transactions = true
allow_edit_transactions = true
allow_edit_posted_transactions = true
allow_void_transactions = true
hide_voided_transactions = true
show_voided_toggle_enabled = true
require_void_reason = true
period_lock_enabled = true
approval_enabled = false
tax_enabled = false
inventory_enabled = false
purchase_enabled = true
sales_enabled = true
cash_bank_enabled = true
```

Opsi transaction_workflow_mode:
```text
simple_auto_post
- cocok untuk UMKM kecil
- transaksi langsung posted sesuai setting auto post

draft_then_post
- user input draft
- user post manual

draft_approve_post
- user input draft
- user approve
- user post
```

Yang tidak dimasukkan penuh di Phase 4:
```text
multi_currency penuh
advanced tax
advanced branch/project tracking
advanced workflow approval
```

Cukup disiapkan field dasar agar tidak hardcode.

--------------------------------------------------
4B — Permission Foundation Basic
--------------------------------------------------

Target:
```text
[ ] PermissionService
[ ] Permission middleware
[ ] Role-permission map awal
[ ] Permission check berdasarkan TenantContext user_role
[ ] Backend block action berdasarkan permission
[ ] Frontend bisa menerima daftar permission
[ ] UI hide/show menu berdasarkan permission dasar
```

Role awal:
```text
owner
admin
finance
accountant
sales
purchasing
warehouse
viewer
```

Permission awal:
```text
view_dashboard
manage_company_settings
manage_master_data
create_transaction
edit_transaction
void_transaction
approve_transaction
post_transaction
view_reports
export_reports
```

Contoh role-permission map awal:
```text
owner:
- *

admin:
- view_dashboard
- manage_company_settings
- manage_master_data
- create_transaction
- edit_transaction
- void_transaction
- approve_transaction
- post_transaction
- view_reports
- export_reports

finance:
- view_dashboard
- manage_master_data
- create_transaction
- edit_transaction
- void_transaction
- post_transaction
- view_reports
- export_reports

accountant:
- view_dashboard
- manage_master_data
- create_transaction
- edit_transaction
- void_transaction
- approve_transaction
- post_transaction
- view_reports
- export_reports

sales:
- view_dashboard
- create_transaction
- edit_transaction
- void_transaction
- view_reports

purchasing:
- view_dashboard
- create_transaction
- edit_transaction
- void_transaction
- view_reports

warehouse:
- view_dashboard
- create_transaction
- edit_transaction
- void_transaction
- view_reports

viewer:
- view_dashboard
- view_reports
```

Catatan penting:
```text
Frontend hide/show hanya bantuan UI.
Backend permission tetap pengaman utama.
```

--------------------------------------------------
4C — Transaction Lifecycle Standard
--------------------------------------------------

Target:
```text
[ ] Standar status transaksi
[ ] Standar status jurnal
[ ] Standar status stock movement
[ ] Standar field metadata transaksi
```

Status standar:
```text
draft
approved
posted
void
```

Rule final:
```text
Hard delete transaksi tidak ada.
Void adalah pengganti delete.
Edit transaksi boleh, termasuk posted.
Edit dan void hanya boleh jika tidak ada dependency.
Void hidden by default dari UI client.
Transaksi void bisa ditampilkan hanya jika toggle "Tampilkan transaksi void" aktif.
Transaksi void read-only.
```

Metadata standar semua transaksi:
```text
created_by
updated_by
approved_by
posted_by
voided_by
created_at
updated_at
approved_at
posted_at
voided_at
void_reason
edit_reason
```

--------------------------------------------------
4D — Transaction Policy Service
--------------------------------------------------

Target:
```text
[ ] TransactionPolicyService
[ ] canCreate
[ ] canEdit
[ ] canVoid
[ ] canApprove
[ ] canPost
[ ] canView
```

Validasi gabungan:
```text
Company setting
+
User permission
+
Transaction dependency
+
Period lock
+
Transaction status
```

Rule penting:
```text
Status posted tidak otomatis mengunci transaksi.
Posted tetap boleh diedit jika setting mengizinkan dan tidak ada dependency.
```

Flow edit posted transaction:
```text
Cek permission
Cek company setting
Cek dependency
Cek period lock
Void accounting effect lama
Update transaksi utama
Generate ulang accounting effect
Post ulang jika perlu
Simpan audit log
```

Yang di-void saat edit:
```text
Bukan transaksi utama.
Yang di-void adalah generated accounting effects lama seperti journal entries, journal lines, stock movements, dan efek terkait lain.
```

--------------------------------------------------
4E — Transaction Dependency Foundation
--------------------------------------------------

Target:
```text
[ ] TransactionDependencyService
[ ] Dependency contract per module
[ ] getBlockingReasons()
[ ] canEdit()
[ ] canVoid()
```

Contoh blocking reason:
```text
Invoice sudah memiliki pembayaran.
Invoice sudah memiliki retur.
Transaksi sudah masuk rekonsiliasi bank.
Transaksi berada pada periode terkunci.
Stock movement sudah dipakai proses lanjutan.
```

Rule umum edit/void:
```text
Transaksi hanya boleh edit/void jika tidak ada transaksi lain yang dependent terhadap transaksi tersebut.
```

Contoh sales invoice tidak boleh edit/void jika:
```text
[ ] sudah ada sales payment
[ ] sudah ada sales return
[ ] sudah masuk bank reconciliation
[ ] sudah masuk tax report final
[ ] period locked/closed
```

Contoh purchase invoice tidak boleh edit/void jika:
```text
[ ] sudah ada supplier payment
[ ] sudah ada purchase return/debit note
[ ] sudah masuk bank reconciliation
[ ] stock movement sudah dipakai proses lanjutan
[ ] period locked/closed
```

Phase ini belum membuat semua dependency detail, tapi menyiapkan kerangka agar nanti tiap modul tinggal menambahkan checker.

--------------------------------------------------
4F — Period, Fiscal Year & Lock Foundation
--------------------------------------------------

Target:
```text
[ ] company fiscal year setting
[ ] accounting_periods
[ ] period status open/locked/closed
[ ] PeriodLockService
[ ] Validasi tanggal transaksi terhadap periode
[ ] Cegah edit/void/post jika periode locked/closed
```

Field penting:
```text
fiscal_year_start_month
period_start
period_end
status
locked_at
locked_by
closed_at
closed_by
```

Status periode:
```text
open
locked
closed
```

Rule:
```text
Jika periode locked/closed:
- transaksi tidak boleh edit
- transaksi tidak boleh void
- transaksi tidak boleh post
- jurnal tidak boleh diubah
- laporan periode tersebut dianggap final
```

Catatan:
```text
Ini wajib dimajukan. Kalau dibuat setelah invoice/jurnal/purchase/stock movement, semua modul harus di-refactor untuk cek periode.
```

--------------------------------------------------
4G — Document Numbering Foundation
--------------------------------------------------

Target:
```text
[ ] document_numbering_settings
[ ] DocumentNumberService
[ ] Prefix per module
[ ] Running number per company
[ ] Running number per period/tahun
[ ] Cegah nomor duplicate
[ ] Support auto/manual mode
```

Module awal yang disiapkan:
```text
journal
sales_invoice
purchase_invoice
cash_receipt
cash_payment
stock_adjustment
stock_movement
opening_balance
```

Setting:
```text
document_number_mode = auto/manual
allow_duplicate_document_number = false
```

Rule:
```text
Default auto number.
Nomor tidak boleh duplicate per company per module.
Manual number boleh jika setting mengizinkan, tetap validasi duplicate.
```

--------------------------------------------------
4H — Source Link Standard
--------------------------------------------------

Target:
```text
[ ] Standar source_type
[ ] Standar source_id
[ ] Standar source_number
[ ] Standar source_revision
[ ] Standar source_module
```

Wajib dipakai oleh:
```text
journal_entries
stock_movements
cash_bank_transactions
audit_logs
attachments
```

Contoh:
```text
source_type = sales_invoice
source_id = 15
source_number = INV-00015
source_revision = 2
source_module = sales
```

Tujuan:
```text
Saat transaksi diedit/void, sistem tahu jurnal, stock movement, cash movement, dan efek lain mana yang harus ikut diproses.
```

--------------------------------------------------
4I — Revision Tracking Foundation
--------------------------------------------------

Target:
```text
[ ] revision_no di transaksi utama
[ ] source_revision di journal/stock movement
[ ] TransactionRevisionService
[ ] Simpan ringkasan perubahan
[ ] edited_by
[ ] edited_at
[ ] edit_reason
```

Rule:
```text
User melihat nomor dokumen tetap sama.
Sistem menyimpan revision internal.
```

Contoh:
```text
INV-001 revision 1
INV-001 revision 2
INV-001 revision 3
```

Saat edit transaksi:
```text
[ ] revision_no bertambah
[ ] accounting effect lama dibuat void/obsolete
[ ] accounting effect baru dibuat dengan source_revision terbaru
[ ] audit log mencatat perubahan
```

--------------------------------------------------
4J — Audit Log Basic
--------------------------------------------------

Target:
```text
[ ] AuditLogService basic
[ ] Log create
[ ] Log update/edit
[ ] Log void
[ ] Log approve
[ ] Log post
[ ] Log switch company
[ ] Log company setting update
[ ] Log permission denied penting
```

Event naming standard:
```text
sales_invoice.created
sales_invoice.updated
sales_invoice.voided
sales_invoice.posted
purchase_invoice.created
purchase_invoice.updated
purchase_invoice.voided
purchase_invoice.posted
journal.created
journal.posted
journal.voided
period.locked
period.closed
company_setting.updated
permission.denied
```

Audit log advanced tetap di belakang, tapi basic audit harus ada dari awal.

--------------------------------------------------
4K — Report Visibility Standard
--------------------------------------------------

Target:
```text
[ ] Standar query laporan
[ ] Standar visible scope transaksi
[ ] Standar hidden void
```

Rule final:
```text
UI transaksi default: status != void
Toggle: tampilkan transaksi void
Transaksi void read-only
Buku besar: hanya journal_entries status posted aktif
Laporan normal: tidak menghitung void/obsolete
Audit view: boleh menampilkan void dan revision history
```

Query standar:
```text
Transaction list default:
status != void

Transaction list with toggle:
include status void

General ledger:
journal_entries.status = posted
AND is_obsolete = false

Stock report:
stock_movements.status = posted
AND is_obsolete = false

Audit view:
include posted, void, obsolete, revision history
```

Catatan:
```text
Buku besar harus clean.
Jangan tampilkan jurnal void/reversal sampah di buku besar normal.
Jika transaksi diedit, buku besar hanya membaca accounting effect terbaru yang posted aktif.
```

--------------------------------------------------
4L — Opening Balance Standard
--------------------------------------------------

Target:
```text
[ ] Opening balance method ditentukan
[ ] Opening balance memakai journal pembuka
[ ] source_type = opening_balance
[ ] Tidak simpan saldo awal hanya di COA sebagai angka mati
```

Rule:
```text
Saldo awal masuk buku besar lewat opening journal.
COA boleh menampilkan opening balance, tapi sumber accounting tetap journal.
```

--------------------------------------------------
4M — Account Mapping Foundation
--------------------------------------------------

Target:
```text
[ ] default_accounts_receivable_id
[ ] default_accounts_payable_id
[ ] default_sales_account_id
[ ] default_purchase_account_id
[ ] default_inventory_account_id
[ ] default_cogs_account_id
[ ] default_cash_account_id
[ ] default_bank_account_id
[ ] default_tax_output_account_id
[ ] default_tax_input_account_id
```

Catatan:
```text
COA-nya baru dibuat di Phase 5, tapi konsep account mapping harus masuk Phase 4 agar sales/purchase/inventory tidak hardcode akun.
```

--------------------------------------------------
4N — Standard API Error Code
--------------------------------------------------

Target:
```text
[ ] Error code standard
[ ] Dependency error format
[ ] Permission error format
[ ] Period lock error format
```

Contoh:
```json
{
  "success": false,
  "code": "TRANSACTION_HAS_DEPENDENCY",
  "message": "Transaksi tidak bisa diedit.",
  "errors": {
    "dependencies": [
      "Invoice sudah memiliki pembayaran."
    ]
  }
}
```

Contoh kode error:
```text
PERMISSION_DENIED
TRANSACTION_HAS_DEPENDENCY
PERIOD_LOCKED
COMPANY_SETTING_DISABLED
INVALID_TRANSACTION_STATUS
DOCUMENT_NUMBER_DUPLICATE
TENANT_ACCESS_DENIED
```

--------------------------------------------------
4O — Placeholder Desain Fitur Lanjutan
--------------------------------------------------

Target:
```text
[ ] Siapkan desain agar tidak hardcode dan tidak buntu nanti
[ ] Tidak implementasi penuh fitur lanjutan
```

Placeholder yang cukup disiapkan:
```text
multi_currency_enabled = false
currency_code minimal siap di setting
advanced_tax_enabled = false
inventory_costing_method = average
allow_negative_stock = false/true sesuai setting
allow_backdated_transactions
max_backdate_days
allow_future_transactions
max_future_days
```

Tidak dikerjakan penuh di Phase 4:
```text
Multi-currency penuh
Advanced tax
Credit/debit note
Bank reconciliation
Overpayment/customer credit/supplier deposit
Branch/location
Department/project/cost center
Data import
External integrations
Attachment upload UI
Advanced payment allocation
Fixed asset
```

==================================================
PHASE 5 — MASTER DATA AKUNTANSI
==================================================

Status:
BELUM MULAI

Sebelumnya Phase 4, sekarang digeser ke Phase 5.

Target:
```text
[ ] Chart of Accounts
[ ] Contacts
[ ] Products
[ ] Units
[ ] Warehouses
[ ] Tax basic
```

Tenant only:
```text
[ ] Semua tabel master data masuk ke tenant database
[ ] Tidak masuk central.sqlite kecuali setting company global yang memang central
```

--------------------------------------------------
Chart of Accounts
--------------------------------------------------

Target:
```text
[ ] Tabel chart_of_accounts
[ ] account_code
[ ] account_name
[ ] account_type
[ ] parent_account_id
[ ] normal_balance
[ ] is_cash_bank
[ ] is_active
[ ] is_system_default
[ ] create account
[ ] edit account
[ ] nonaktif account
[ ] parent-child account
[ ] akun default
[ ] default accounts mapping
```

Account types:
```text
Asset
Liability
Equity
Revenue
Expense
```

Catatan perubahan:
```text
Opening balance tidak menjadi angka utama di COA.
Opening balance dibuat lewat opening journal.
```

--------------------------------------------------
Contacts
--------------------------------------------------

Target:
```text
[ ] contacts
[ ] contact_type customer/supplier/employee/other
[ ] customers
[ ] suppliers
[ ] employees
[ ] other_contacts
[ ] is_active
```

--------------------------------------------------
Products, Units, Warehouses
--------------------------------------------------

Target:
```text
[ ] products
[ ] product_categories
[ ] units
[ ] warehouses
[ ] is_active
```

Rule visibility:
```text
Inactive master data tidak muncul di dropdown transaksi baru.
Data lama tetap bisa menampilkan master data yang sudah inactive.
```

==================================================
PHASE 6 — JOURNAL ENTRY ENGINE
==================================================

Status:
BELUM MULAI

Sebelumnya Phase 5.

Target:
```text
[ ] Jurnal umum
[ ] journal_entries
[ ] journal_entry_lines
[ ] manual journal
[ ] system generated journal
[ ] Validasi debit kredit
[ ] Draft
[ ] Approved
[ ] Posted
[ ] Void
[ ] Nomor jurnal otomatis
[ ] source link standard
[ ] revision support
[ ] permission guard
[ ] period lock guard
```

Tables:
```text
journal_entries
journal_entry_lines
```

Journal entries:
```text
id
journal_number
journal_date
description
status draft/approved/posted/void
source_type
source_id
source_number
source_revision
source_module
is_system_generated
is_obsolete
created_by
approved_by
posted_by
voided_by
created_at
approved_at
posted_at
voided_at
void_reason
```

Journal entry lines:
```text
journal_entry_id
account_id
description
debit
credit
```

Validasi:
```text
[ ] Total debit = total kredit
[ ] Akun wajib ada
[ ] Tanggal wajib ada
[ ] Nomor jurnal unik
[ ] Debit dan kredit tidak boleh dua-duanya isi dalam satu line
[ ] Minimal 2 line
[ ] Period tidak locked/closed
[ ] Void tidak masuk laporan normal
```

Revisi rule penting:
```text
Posted journal system-generated tidak diedit langsung oleh user.
Jika transaksi sumber diedit, sistem melakukan void accounting effect lama lalu generate/post ulang accounting effect baru.
Manual journal punya policy edit sendiri.
```

Flow manual journal:
```text
Draft journal
↓
Validate balance
↓
Approve jika workflow aktif
↓
Post journal
↓
Masuk laporan buku besar
```

==================================================
PHASE 7 — GENERAL LEDGER & TRIAL BALANCE
==================================================

Status:
BELUM MULAI

Sebelumnya Phase 6.

Target:
```text
[ ] Buku besar
[ ] Detail ledger per akun
[ ] Neraca saldo
[ ] Saldo awal dari opening journal
[ ] Mutasi debit/kredit
[ ] Saldo akhir
```

Reports:
```text
General Ledger
Account Ledger Detail
Trial Balance
```

Logic:
```text
[ ] Ambil journal posted aktif saja
[ ] Jangan ambil journal void
[ ] Jangan ambil journal obsolete
[ ] Filter tanggal
[ ] Group by account
[ ] Hitung opening balance dari opening journal dan mutasi sebelum periode
[ ] Hitung debit period
[ ] Hitung credit period
[ ] Hitung ending balance
```

Rule wajib:
```text
Buku besar harus clean.
Jurnal void/obsolete tidak muncul di buku besar normal.
```

Urutan laporan:
```text
Jurnal Umum
↓
Buku Besar
↓
Neraca Saldo
↓
Laba Rugi
↓
Neraca
```

==================================================
PHASE 8 — FINANCIAL STATEMENTS BASIC
==================================================

Status:
BELUM MULAI

Sebelumnya Phase 7.

Target:
```text
[ ] Laporan Laba Rugi
[ ] Laporan Neraca
[ ] Laporan Arus Kas sederhana
[ ] Filter period
[ ] Filter start date / end date
```

Laba Rugi:
```text
[ ] Revenue
[ ] Cost of Goods Sold jika inventory sudah ada
[ ] Expense
[ ] Net Profit/Loss
```

Neraca:
```text
[ ] Asset
[ ] Liability
[ ] Equity
[ ] Current period profit masuk equity
[ ] Total asset = total liability + equity
```

Arus Kas:
```text
[ ] Operating activities
[ ] Investing activities
[ ] Financing activities
[ ] Bisa dibuat sederhana dulu dari akun cash/bank
```

Rule:
```text
Laporan hanya membaca journal posted aktif.
Void/obsolete tidak dihitung.
Closed period dianggap final.
```

==================================================
PHASE 9 — SALES MODULE
==================================================

Status:
BELUM MULAI

Sebelumnya Phase 8.

Target:
```text
[ ] Sales invoice
[ ] Sales invoice detail
[ ] Customer
[ ] Item/product
[ ] Tax basic
[ ] Discount
[ ] Payment status
[ ] Posting otomatis ke jurnal sesuai company setting
[ ] Edit posted invoice via void old effect + repost updated effect
[ ] Void invoice hidden by default
```

Tables:
```text
sales_invoices
sales_invoice_lines
sales_payments nanti di Cash & Bank
```

Sales invoice:
```text
invoice_number
invoice_date
due_date
customer_id
subtotal
discount
tax
total
paid_amount
balance_due
status draft/approved/posted/paid/partial/void
revision_no
source fields jika diperlukan
metadata created_by/posted_by/voided_by
```

Posting invoice:
```text
Debit  : Piutang Usaha
Kredit : Penjualan
Kredit : PPN Keluaran jika tax aktif

Jika inventory aktif:
Debit  : HPP
Kredit : Persediaan
```

Validasi:
```text
[ ] Customer wajib ada
[ ] Minimal 1 item/line
[ ] Total invoice benar
[ ] Posted invoice membuat jurnal
[ ] Auto post mengikuti company setting
[ ] Void invoice membuat generated journal/stock movement ikut void
[ ] Edit invoice posted melakukan void effect lama + generate/post effect baru
```

Dependency awal:
```text
Tidak boleh edit/void jika:
[ ] sudah ada payment
[ ] sudah ada return
[ ] sudah rekonsiliasi
[ ] period locked/closed
```

UI rule:
```text
Void sales invoice hidden by default.
Toggle "Tampilkan transaksi void" boleh menampilkan invoice void sebagai read-only.
```

==================================================
PHASE 10 — PURCHASE MODULE
==================================================

Status:
BELUM MULAI

Sebelumnya Phase 9.

Target:
```text
[ ] Purchase invoice
[ ] Purchase invoice detail
[ ] Supplier
[ ] Tax basic
[ ] Discount
[ ] Payment status
[ ] Posting otomatis ke jurnal sesuai company setting
[ ] Edit posted purchase via void old effect + repost updated effect
[ ] Void purchase hidden by default
```

Tables:
```text
purchase_invoices
purchase_invoice_lines
```

Posting pembelian kredit:
```text
Debit  : Persediaan / Beban
Debit  : PPN Masukan jika tax aktif
Kredit : Utang Usaha
```

Validasi:
```text
[ ] Supplier wajib ada
[ ] Minimal 1 line
[ ] Total purchase benar
[ ] Posted purchase membuat jurnal
[ ] Auto post mengikuti company setting
[ ] Void purchase membuat generated journal/stock movement ikut void
[ ] Edit posted purchase melakukan void effect lama + generate/post effect baru
```

Dependency awal:
```text
Tidak boleh edit/void jika:
[ ] sudah ada payment
[ ] sudah ada return/debit note
[ ] sudah rekonsiliasi
[ ] stock movement sudah dipakai proses lanjutan
[ ] period locked/closed
```

==================================================
PHASE 11 — CASH & BANK
==================================================

Status:
BELUM MULAI

Sebelumnya Phase 10.

Target:
```text
[ ] Cash accounts
[ ] Bank accounts
[ ] Receive payment
[ ] Make payment
[ ] Transfer antar kas/bank
[ ] Payment allocation basic
[ ] Cash/bank mutation report
```

Features:
```text
[ ] Penerimaan pembayaran piutang
[ ] Pembayaran utang
[ ] Penerimaan kas lainnya
[ ] Pengeluaran kas lainnya
[ ] Transfer antar kas/bank
```

Posting penerimaan piutang:
```text
Debit  : Kas/Bank
Kredit : Piutang Usaha
```

Posting pembayaran utang:
```text
Debit  : Utang Usaha
Kredit : Kas/Bank
```

Transfer antar kas/bank:
```text
Debit  : Bank tujuan
Kredit : Bank asal
```

Payment allocation basic:
```text
[ ] 1 payment bisa dialokasikan ke 1 invoice untuk MVP
[ ] Struktur disiapkan agar nanti bisa 1 payment ke banyak invoice
```

Dependency:
```text
Payment yang sudah terkait invoice akan membuat invoice tidak boleh edit/void.
Payment yang sudah rekonsiliasi nanti tidak boleh edit/void.
```

Advanced reconciliation tetap di belakang.

==================================================
PHASE 12 — INVENTORY
==================================================

Status:
BELUM MULAI

Sebelumnya Phase 11.

Target:
```text
[ ] Stock items
[ ] Warehouses
[ ] Stock movements
[ ] Stock adjustment
[ ] Stock opname
[ ] COGS/HPP
[ ] Average cost
[ ] Stock card
[ ] Inventory valuation
```

Tables:
```text
stock_movements
stock_adjustments
stock_opnames
item_costs
```

Setting yang dibaca dari Phase 4:
```text
inventory_enabled
inventory_costing_method = average
allow_negative_stock
```

Movement types:
```text
purchase_in
sales_out
adjustment_in
adjustment_out
transfer_in
transfer_out
opening_stock
```

Costing:
```text
[ ] Average cost awal
[ ] Hitung HPP saat penjualan
[ ] Posting HPP otomatis
```

Flow inventory:
```text
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
```

Rule:
```text
Stock movement void/obsolete tidak masuk laporan stok normal.
Stock movement yang sudah dipakai proses lanjutan menjadi dependency blocker untuk edit/void transaksi sumber.
```

==================================================
PHASE 13 — REPORTS ADVANCED
==================================================

Status:
BELUM MULAI

Sebelumnya Phase 12.

Target:
```text
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
```

Reports:
```text
Sales by customer
Sales by product
Purchase by supplier
Accounts receivable aging
Accounts payable aging
Inventory valuation
Stock card
Cash/bank mutation
```

Filter:
```text
Date range
Customer
Supplier
Product
Warehouse
Account
Status
```

Rule:
```text
Default report tidak menampilkan void.
Void/obsolete tidak dihitung di laporan normal.
Filter include void hanya untuk audit/admin jika diperlukan.
```

==================================================
PHASE 14 — ROLE, PERMISSION & USER MANAGEMENT ADVANCED
==================================================

Status:
BELUM MULAI

Sebelumnya Phase 13, tetapi permission basic sudah dimajukan ke Phase 4.

Target:
```text
[ ] UI manage users
[ ] UI manage roles
[ ] Custom role per company
[ ] Custom permission per role
[ ] Invite user
[ ] Remove/deactivate user from company
[ ] Role change audit log
[ ] Permission template
```

Catatan:
```text
Permission middleware dan role-permission basic sudah ada di Phase 4.
Phase 14 hanya membuat versi advanced dan UI manajemen.
```

Tetap tidak boleh:
```text
Client create tenant.
Client migrate tenant.
Client melihat semua tenant.
Client delete tenant.
```

Rules lanjutan:
```text
Owner bisa semua dalam company, kecuali fitur internal aplikasi.
Admin hampir semua dalam company.
Finance/accountant fokus jurnal, kas bank, laporan.
Sales fokus sales.
Purchasing fokus purchase.
Warehouse fokus inventory.
Viewer hanya lihat.
```

==================================================
PHASE 15 — FRONTEND DASHBOARD & UI SYSTEM
==================================================

Status:
BELUM MULAI

Sebelumnya Phase 14.

Target:
```text
[ ] Dashboard layout final
[ ] Sidebar
[ ] Topbar
[ ] Company switcher final
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
```

Pages:
```text
[ ] Login
[ ] Register
[ ] Select Company
[ ] Dashboard
[ ] Settings
[ ] Users & Roles
[ ] Chart of Accounts
[ ] Contacts
[ ] Products
[ ] Journal Entries
[ ] General Ledger
[ ] Trial Balance
[ ] Sales Invoice
[ ] Purchase Invoice
[ ] Cash & Bank
[ ] Inventory
[ ] Reports
```

Responsive target:
```text
Smartphone
Tablet
Laptop
Desktop monitor besar
```

Catatan:
```text
UI bisa dibuat bertahap per module.
Phase ini untuk merapikan design system final.
```

==================================================
PHASE 16 — BACKUP & RESTORE SQLITE
==================================================

Status:
BELUM MULAI

Sebelumnya Phase 15.

Target:
```text
[ ] Backup central.sqlite
[ ] Backup tenant database per perusahaan
[ ] Download backup file
[ ] Restore tenant database
[ ] Auto backup harian
[ ] Simpan backup dengan timestamp
[ ] Backup log
[ ] Restore log
```

Backup structure:
```text
backups
├── central
│   └── central_2026_05_15.sqlite
└── tenants
    ├── company_000001_2026_05_15.sqlite
    └── company_000002_2026_05_15.sqlite
```

Commands:
```text
[ ] php artisan backup:central
[ ] php artisan backup:tenant --company=1
[ ] php artisan backup:all-tenants
[ ] php artisan restore:tenant --company=1 --file=...
```

Safety:
```text
[ ] Jangan restore tanpa backup sebelumnya
[ ] Jangan restore file tenant ke company yang salah
[ ] Validasi path file backup
[ ] Validasi ukuran file
[ ] Log semua proses backup/restore
```

==================================================
PHASE 17 — AUDIT LOG ADVANCED
==================================================

Status:
BELUM MULAI

Sebelumnya Phase 16, tetapi Audit Log basic sudah dimajukan ke Phase 4.

Target:
```text
[ ] Audit viewer UI
[ ] Filter audit by user
[ ] Filter audit by module
[ ] Filter audit by action
[ ] Filter audit by date
[ ] Detail old_value/new_value
[ ] Void transaction history
[ ] Revision history viewer
[ ] Export audit log
```

Central audit advanced:
```text
login
logout
create company internal
invite user
subscription changed
tenant database created
tenant migration failed
role changed
permission denied
```

Tenant audit advanced:
```text
create COA
update COA
create journal
post journal
void journal
create invoice
edit invoice
void invoice
receive payment
export report
```

Fields:
```text
user_id
company_id
action
module
record_type
record_id
old_value
new_value
ip_address
user_agent
created_at
```

Catatan:
```text
AuditLogService basic sudah ada di Phase 4.
Phase 17 hanya viewer, filter, export, dan audit detail advanced.
```

==================================================
PHASE 18 — ADVANCED ACCOUNTING & OPERATIONAL MODULES
==================================================

Status:
BELUM MULAI

Phase baru untuk fitur yang tidak wajib dimajukan.

Isi fitur yang tidak dimajukan ke awal, tetapi tetap disiapkan desain/placeholder-nya di Phase 4:
```text
[ ] Multi-currency penuh
[ ] Advanced tax
[ ] Credit note
[ ] Debit note
[ ] Bank reconciliation
[ ] Overpayment
[ ] Customer credit
[ ] Supplier deposit
[ ] Branch/location
[ ] Department/project/cost center
[ ] Data import
[ ] External reference / integration field
[ ] Attachment upload UI
[ ] Advanced payment allocation
```

Catatan:
```text
Phase 4 hanya menyiapkan placeholder/setting dasar.
Implementasi penuh tetap di Phase 18 agar MVP tidak terlalu berat.
```

==================================================
PHASE 19 — FIXED ASSET
==================================================

Status:
BELUM MULAI

Phase baru, jangan dimasukkan terlalu awal.

Target:
```text
[ ] Fixed asset master
[ ] Asset acquisition
[ ] Depreciation method
[ ] Depreciation schedule
[ ] Monthly depreciation journal
[ ] Asset disposal
[ ] Asset revaluation jika dibutuhkan
```

Alasan tidak dimajukan:
```text
Fixed asset butuh journal, period lock, numbering, source link, audit, dan report foundation.
Jadi lebih aman setelah Journal, Ledger, Financial Statement, dan policy foundation stabil.
```

==================================================
PHASE 20 — TESTING
==================================================

Status:
BELUM MULAI

Sebelumnya Phase 17.

Target:
```text
[ ] Backend feature test
[ ] Backend unit test
[ ] Frontend basic test
[ ] Manual test checklist
[ ] Migration test
[ ] Tenant switching test
[ ] Accounting balance test
```

Backend tests:
```text
[ ] Test register
[ ] Test login
[ ] Test current user
[ ] Test get companies
[ ] Test select company
[ ] Test reject company not owned by user
[ ] Test tenant context
[ ] Test permission middleware
[ ] Test company setting read/write
[ ] Test period lock
[ ] Test document numbering
[ ] Test create COA
[ ] Test create journal balanced
[ ] Test reject journal unbalanced
[ ] Test post journal
[ ] Test ledger
[ ] Test trial balance
[ ] Test laba rugi
[ ] Test neraca
```

Important tests:
```text
[ ] User A tidak bisa akses company User B
[ ] Company switch mengganti tenant context
[ ] Permission middleware bekerja
[ ] Period lock mencegah edit/void/post
[ ] Edit posted transaksi membuat revision baru
[ ] Edit posted transaksi void effect lama + post effect baru
[ ] Void transaksi hidden dari UI default
[ ] Void journal tidak masuk buku besar
[ ] Buku besar hanya ambil posted aktif
[ ] Journal debit credit harus balance
[ ] Posted system-generated journal tidak diedit langsung
[ ] File SQLite tenant tidak bisa diakses publik
[ ] Tidak ada public route create/migrate/delete tenant
```

Catatan:
```text
Beberapa test sudah dibuat sejak Phase 3D dan harus terus diperluas.
```

==================================================
PHASE 21 — DEPLOYMENT TO VPS
==================================================

Status:
BELUM MULAI

Sebelumnya Phase 18.

Target:
```text
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
```

Production structure:
```text
1 VPS
├── Nginx
├── Laravel backend
├── Next.js frontend
├── central.sqlite
├── tenant databases
└── backups
```

Domain:
```text
https://app.akuntansiku.com
```

Security:
```text
[ ] .env tidak public
[ ] database SQLite tidak public
[ ] storage permission benar
[ ] Nginx block akses .sqlite
[ ] HTTPS aktif
[ ] APP_DEBUG=false
[ ] APP_ENV=production
[ ] Backup otomatis aktif
[ ] Log rotation aktif
```

Deployment checklist:
```text
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
```

==================================================
MVP PRIORITY BARU
==================================================

Prioritas utama:
```text
[ ] Login/Register
[ ] Company access
[ ] Internal create company/tenant command
[ ] Generate SQLite tenant
[ ] Select Company
[ ] Tenant resolver
[ ] System Policy & Accounting Foundation
[ ] Chart of Accounts
[ ] Opening Balance
[ ] Journal Entry
[ ] General Ledger
[ ] Trial Balance
[ ] Laba Rugi
[ ] Neraca
```

Urutan MVP baru:
```text
1. Setup Laravel API
2. Setup Next.js + TailwindCSS
3. Setup central.sqlite
4. Authentication
5. Company access
6. Tenant database generator
7. Tenant resolver
8. System Policy & Accounting Foundation
9. Chart of Accounts
10. Opening Balance
11. Journal Entry
12. General Ledger
13. Trial Balance
14. Financial Statements Basic
15. Sales
16. Purchase
17. Cash & Bank
18. Inventory
```

Perubahan paling penting:
```text
System Policy & Accounting Foundation wajib masuk sebelum Chart of Accounts dan Journal Entry.
```

==================================================
YANG SENGAJA TIDAK DIMAJUKAN
==================================================

Supaya roadmap tidak terlalu berat, ini tetap di belakang:
```text
[ ] Multi-currency penuh
[ ] Advanced tax
[ ] Credit note/debit note
[ ] Bank reconciliation
[ ] Overpayment/customer credit/supplier deposit
[ ] Branch/location
[ ] Department/project/cost center
[ ] Data import
[ ] External integrations
[ ] Attachment upload UI
[ ] Advanced payment allocation
[ ] Fixed asset
[ ] Audit viewer advanced
[ ] Backup/restore UI
```

Tetapi Phase 4 tetap menyiapkan placeholder dan standar field agar nanti tidak refactor besar.

==================================================
RINGKASAN PERUBAHAN NOMOR PHASE
==================================================

```text
Phase 0  tetap  Setup Project Foundation
Phase 1  tetap  Central Database + Demo Foundation
Phase 2  tetap  Authentication & Company Access
Phase 3  tetap  Tenant Generator & Migration System

Phase 4  BARU   System Policy & Accounting Foundation
Phase 5  geser  Master Data Akuntansi
Phase 6  geser  Journal Entry Engine
Phase 7  geser  General Ledger & Trial Balance
Phase 8  geser  Financial Statements Basic
Phase 9  geser  Sales Module
Phase 10 geser  Purchase Module
Phase 11 geser  Cash & Bank
Phase 12 geser  Inventory
Phase 13 geser  Reports Advanced
Phase 14 revisi Role, Permission & User Management Advanced
Phase 15 geser  Frontend Dashboard & UI System
Phase 16 geser  Backup & Restore SQLite
Phase 17 revisi Audit Log Advanced
Phase 18 BARU   Advanced Accounting & Operational Modules
Phase 19 BARU   Fixed Asset
Phase 20 geser  Testing
Phase 21 geser  Deployment to VPS
```

==================================================
CURRENT PROJECT STATUS — REVISI
==================================================

Selesai:
```text
[✓] Phase 0 — Setup Project Foundation
[✓] Phase 1 — Central Database Schema + Demo Foundation
[✓] Phase 2A — Backend Authentication & Company Access
[✓] Phase 2B — Frontend Authentication & Company Access
```

Perlu test lokal:
```text
[ ] Phase 2 end-to-end local test
```

Belum mulai:
```text
[ ] Phase 3 — Tenant Database Generator & Tenant Migration System
[ ] Phase 4 — System Policy & Accounting Foundation
[ ] Phase 5 — Master Data Akuntansi
[ ] Phase 6 — Journal Entry Engine
[ ] Phase 7 — General Ledger & Trial Balance
[ ] Phase 8 — Financial Statements Basic
[ ] Phase 9 — Sales Module
[ ] Phase 10 — Purchase Module
[ ] Phase 11 — Cash & Bank
[ ] Phase 12 — Inventory
[ ] Phase 13 — Reports Advanced
[ ] Phase 14 — Role, Permission & User Management Advanced
[ ] Phase 15 — Frontend Dashboard & UI System
[ ] Phase 16 — Backup & Restore SQLite
[ ] Phase 17 — Audit Log Advanced
[ ] Phase 18 — Advanced Accounting & Operational Modules
[ ] Phase 19 — Fixed Asset
[ ] Phase 20 — Testing
[ ] Phase 21 — Deployment to VPS
```

Data demo saat ini:
```text
admin@example.com
password
```

Company demo:
```text
PT Maju Jaya
- role: owner
- tenant: company_000001.sqlite

CV Sumber Rejeki
- role: admin
- tenant: company_000002.sqlite
```

Catatan penting untuk langkah berikutnya:
```text
1. Test lokal Phase 2 end-to-end.
2. Selesaikan Phase 3A-3D.
3. Jangan masuk Master Data dulu.
4. Buat Phase 4 System Policy & Accounting Foundation.
5. Setelah Phase 4 stabil, baru lanjut Phase 5 Master Data Akuntansi.
```

==================================================
KESIMPULAN FINAL
==================================================

```text
Phase 4 jangan langsung Master Data.
Phase 4 harus menjadi System Policy & Accounting Foundation.
Master Data masuk Phase 5.
Semua modul transaksi dibangun setelah rule, permission, period lock, numbering, source link, revision, audit basic, dan report visibility standard siap.
```

Dengan susunan ini, saat masuk invoice, jurnal, purchase, cash bank, inventory, stock movement, dan fixed asset, desain tidak perlu dibongkar ulang besar-besaran.
