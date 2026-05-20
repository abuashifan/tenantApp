# ROADMAP BUILD APLIKASI AKUNTANSI — REVISI SYSTEM POLICY, ACCOUNTING FOUNDATION, BACKEND-FIRST

Dokumen ini adalah versi roadmap yang sudah dirapikan berdasarkan sesi diskusi terbaru.

Keputusan utama revisi ini:

```text
1. Strategi utama tetap backend-first.
2. Frontend awal hanya dipakai untuk login, select company, tenant context, dan validasi flow minimum.
3. Frontend modul accounting utama tidak dikerjakan sebelum backend accounting core stabil.
4. Phase 9 tetap Sales / Faktur Penjualan Backend.
5. Phase 9 tidak diganti menjadi frontend.
6. Frontend besar dibuat setelah backend accounting core dan backend business modules lebih siap.
7. System Policy & Accounting Foundation tetap harus berada sebelum master data, jurnal, invoice, purchase, cash bank, inventory, dan report.
```

---

# 1. Stack dan Arsitektur

Stack:

```text
Backend  : Laravel API
Frontend : Next.js
Styling  : TailwindCSS
Database : SQLite untuk MVP/development
Tenant   : 1 company = 1 file SQLite tenant
Domain   : 1 domain aplikasi
```

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
Phase 9J selesai: AR subsidiary ledger, open invoices, aging buckets, and GL AR reconciliation implemented.
Phase 9K selesai: Sales workflow integration tests dan final documentation completed.
Phase 9 — Sales Workflow & Accounts Receivable Backend: completed.
Next phase: Phase 10 — Purchase & Accounts Payable Backend.
Phase 10 project memory prepared: backend-first Purchase Workflow & Accounts Payable, mengikuti pola Phase 9 Sales & AR.
Phase 10 bukan frontend; frontend purchase masuk Phase 15.
Phase 10 tidak membuat Stock Movement Engine, inventory valuation, stock card, warehouse stock update, landed cost, FIFO, atau moving average.
Goods Receipt Phase 10 hanya dokumen penerimaan barang; Vendor Bill langsung belum membuat stock movement.
Vendor Deposit diinput dari Purchase Order tetapi disimpan sebagai vendor_deposits; Vendor Bill hanya apply posted vendor deposit.
Buku besar pembantu hutang masuk Phase 10H dan wajib reconcile dengan GL Accounts Payable.
Phase 10A selesai: purchase workflow foundation, calculation/source-chain/status/account-mapping services, permissions granular, document numbering purchase modules, account mapping aliases, docs, dan unit test calculation. Phase 10A tidak membuat CRUD purchase, frontend, stock movement, atau inventory valuation.
Phase 10B selesai: Purchase Request backend tenant-aware, migration/model/service/request/controller/routes/tests/docs; no journal, no AP, no stock movement.
Phase 10C selesai: Purchase Order backend + minimal Vendor Deposit entry dari Purchase Order; Purchase Order bisa langsung atau dari Purchase Request; no AP journal, no stock movement, no inventory valuation.
Phase 10D selesai: Goods Receipt backend sebagai dokumen penerimaan; direct/from Purchase Order, partial/multiple receipt, update received_quantity PO, no journal, no stock movement.
Phase 10E selesai: Vendor Bill backend; direct/from Purchase Order/from Goods Receipt, AP/expense/input tax journal, optional vendor deposit allocation, no stock movement/inventory valuation.
Phase 10F selesai: Vendor Deposit dan Vendor Payment backend; deposit post/refund/allocation journal, bill payment journal, 1 payment to 1 bill MVP, overpayment blocked.
Phase 10G selesai: Purchase Return backend; return dari Vendor Bill/Goods Receipt/direct, AP/purchase return/input tax journal, update returned amount/quantity, no stock movement.
Phase 10H selesai: AP subsidiary ledger, open bills, AP aging buckets, dan GL Accounts Payable reconciliation.
Phase 10I selesai: Purchase workflow integration tests dan final documentation completed.
Phase 10 — Purchase Workflow & Accounts Payable Backend: completed.
Next phase: Phase 11 — Cash Bank Backend.

Phase 11 project memory:
Phase 11 — Cash Bank Backend adalah backend-first.
Phase 11 bukan frontend; frontend cash bank masuk Phase 16.
Phase 11 fokus cash movement dan bank transaction management.
Phase 11 belum membuat auto bank feed integration, AI/import statement parser, multi currency penuh, dan advanced cash flow report (target Phase 19/22).

Phase 12 project memory:
Phase 12 — Inventory Backend adalah backend-first.
Phase 12 bukan frontend; frontend inventory masuk Phase 17.
Phase 12 mengaktifkan stock movement engine.
Delivery Order (Phase 9) dan Goods Receipt (Phase 10) akan dihubungkan ke stock movement pada Phase 12E.
Valuation method MVP: moving average (average cost).
Phase 12 belum membuat FIFO/LIFO, batch/serial tracking, landed cost advanced, export PDF/Excel, atau UI inventory.


Arsitektur:

```text
https://app.akuntansiku.com
↓
Next.js Frontend
↓
Laravel API
↓
central.sqlite
↓
tenant database per company
```

Contoh struktur database:

```text
backend/database/central.sqlite
backend/database/tenants/company_000001.sqlite
backend/database/tenants/company_000002.sqlite
```

Konsep tenant:

```text
central.sqlite = database pusat
company_*.sqlite = database perusahaan/tenant
user bisa punya akses ke banyak company
user memilih active company setelah login
request tenant wajib membawa X-Company-ID
backend memvalidasi akses company user
backend menentukan koneksi tenant dari company aktif
```

Aturan security permanen:

```text
Client / user biasa TIDAK BOLEH create company/tenant.
Client / user biasa TIDAK BOLEH migrate tenant.
Client / user biasa TIDAK BOLEH assign user ke company.
Client / user biasa TIDAK BOLEH melihat semua tenant.

Tenant/company creation hanya boleh lewat internal command / staff internal / owner aplikasi.
Tidak boleh ada public endpoint:
- POST /api/companies
- POST /api/tenants
- POST /api/tenant/migrate
- POST /api/company-users
- POST /api/companies/{id}/users
```

---

# 2. Prinsip Roadmap Baru

```text
Yang berdampak ke hampir semua modul → dimajukan ke awal.
Yang hanya fitur lanjutan / opsional → tetap di belakang.
Backend accounting engine diselesaikan dulu.
Frontend besar dibuat setelah API dan business logic stabil.
```

Alasan backend-first:

```text
1. Accounting logic lebih penting daripada tampilan awal.
2. UI yang dibuat terlalu cepat berisiko sering dirombak karena API berubah.
3. Journal, ledger, report, fiscal closing, dan transaction policy harus matang dulu.
4. Sales/Purchase/Cash Bank/Inventory membutuhkan foundation accounting yang stabil.
5. Frontend accounting akan lebih cepat dibuat setelah endpoint dan response contract jelas.
```

Frontend yang tetap boleh ada di awal:

```text
Phase 0  = setup Next.js, Tailwind, API client, health check
Phase 2B = login, register, select company, dashboard tenant context, company switcher
Phase 8F = optional UI ringan untuk closing wizard jika sudah dibuat
```

Frontend yang belum dianggap dikerjakan:

```text
- input jurnal
- chart of accounts UI lengkap
- master data UI lengkap
- general ledger UI
- trial balance UI
- profit loss UI
- balance sheet UI
- cash flow UI
- sales invoice UI
- purchase invoice UI
- cash bank UI
- inventory UI
```

---

# 3. Status Saat Ini Berdasarkan Sesi Chat

Catatan penting:

```text
Status di bawah adalah status roadmap/diskusi sesi chat.
Tetap perlu cek repo, jalankan test, dan validasi commit untuk memastikan implementasi teknis benar-benar selesai.
```

Selesai / sudah dibahas sampai tuntas dalam roadmap sesi:

```text
[✓] Phase 0  — Setup Project Foundation
[✓] Phase 1  — Central Database Schema + Demo Foundation
[✓] Phase 2A — Backend Authentication & Company Access
[✓] Phase 2B — Minimal Frontend Auth & Company Selection
[✓] Phase 3  — Internal Tenant Generator & Tenant Isolation Foundation
[✓] Phase 4  — System Policy & Accounting Foundation
[✓] Phase 5  — Master Data Akuntansi
[✓] Phase 6  — Journal Entry Engine
[✓] Phase 6A — Analytical Dimensions Foundation
[✓] Phase 7  — General Ledger & Trial Balance
[✓] Phase 8A — Profit & Loss Statement API
[✓] Phase 8B — Balance Sheet API
[✓] Phase 8C — Simple Cash Flow API
[✓] Phase 8D — Financial Statement Integration & Consistency Tests
[✓] Phase 8E — Fiscal Closing Foundation
[✓] Phase 8F — Closing Wizard & Period Locking API/UI ringan
```

Next phase:

```text
[ ] Phase 9 — Sales & Accounts Receivable Backend
```

---

# 4. Roadmap Final Ringkas

```text
Stage 1 — Foundation
Phase 0  — Setup Project Foundation
Phase 1  — Central Database Schema + Demo Foundation
Phase 2A — Backend Authentication & Company Access
Phase 2B — Minimal Frontend Auth & Company Selection
Phase 3  — Internal Tenant Generator & Tenant Isolation
Phase 4  — System Policy & Accounting Foundation
Phase 5  — Master Data Akuntansi

Stage 2 — Backend Accounting Core
Phase 6  — Journal Entry Engine
Phase 6A — Analytical Dimensions: Department & Project
Phase 7  — General Ledger & Trial Balance
Phase 8A — Profit & Loss Statement API
Phase 8B — Balance Sheet API
Phase 8C — Simple Cash Flow API
Phase 8D — Financial Statement Integration & Consistency Tests
Phase 8E — Fiscal Closing Foundation
Phase 8F — Closing Wizard & Period Locking API/UI ringan

Stage 3 — Backend Business Modules
Phase 9  — Sales & Accounts Receivable Backend
Phase 10 — Purchase & Accounts Payable Backend
Phase 11 — Cash Bank Backend
Phase 12 — Inventory Backend

Stage 4 — Frontend Application
Phase 13 — Accounting Frontend MVP
Phase 14 — Sales Frontend MVP
Phase 15 — Purchase Frontend MVP
Phase 16 — Cash Bank Frontend MVP
Phase 17 — Inventory Frontend MVP

Stage 5 — Advanced, Admin, Export, Deployment
Phase 18 — Role, Permission & User Management Advanced
Phase 19 — Reports Advanced, Export PDF/Excel, Print View
Phase 20 — Audit Log Advanced UI
Phase 21 — Backup & Restore Tools
Phase 22 — Advanced Accounting & Operational Modules
Phase 23 — Fixed Asset
Phase 24 — Testing Hardening
Phase 25 — Deployment to VPS & Production Hardening
```

---

# 5. Stage 1 — Foundation

## Phase 0 — Setup Project Foundation

Status:

```text
[✓] Selesai
```

Scope:

```text
[✓] Setup Laravel backend
[✓] Setup Next.js frontend
[✓] Setup TailwindCSS
[✓] Setup central.sqlite
[✓] Setup folder database/tenants
[✓] Setup API health check
[✓] Setup CORS
[✓] Setup Sanctum foundation
[✓] Setup TenantConnectionManager
[✓] Setup frontend health check
[✓] Setup .gitignore agar .env dan .sqlite tidak ikut Git
```

Catatan:

```text
Frontend Phase 0 hanya foundation, bukan UI aplikasi accounting lengkap.
```

## Phase 1 — Central Database Schema + Demo Foundation

Status:

```text
[✓] Selesai
```

Central tables:

```text
users
companies
company_users
tenant_databases
plans
subscriptions
company_invitations
activity_logs
```

Demo data:

```text
admin@example.com / password

PT Maju Jaya
- role: owner
- tenant: company_000001.sqlite

CV Sumber Rejeki
- role: admin
- tenant: company_000002.sqlite
```

## Phase 2A — Backend Authentication & Company Access

Status:

```text
[✓] Selesai secara implementasi
[ ] Tetap perlu test lokal end-to-end jika belum dijalankan
```

Scope:

```text
[✓] Register
[✓] Login
[✓] Logout
[✓] Get current user
[✓] Get companies milik user login
[✓] Select active company
[✓] Middleware company.access
[✓] TenantContext service
[✓] Endpoint tenant-context-test
[✓] Disable demo route hardcode
```

## Phase 2B — Minimal Frontend Auth & Company Selection

Status:

```text
[✓] Selesai sebagai frontend minimum
```

Scope:

```text
[✓] Login page
[✓] Register page
[✓] Select company page
[✓] Dashboard tenant context sederhana
[✓] Company switcher sederhana
[✓] Logout
[✓] API client support Bearer token
[✓] API client support X-Company-ID
```

Catatan:

```text
Ini bukan frontend accounting utama.
Ini hanya frontend minimum agar auth dan tenant context bisa dipakai.
```

## Phase 3 — Internal Tenant Generator & Tenant Isolation

Status:

```text
[✓] Selesai dalam roadmap sesi
```

Subphase:

```text
Phase 3A — Tenant Create Command
Phase 3B — Tenant Migration Command
Phase 3C — Tenant User Assignment & Demo Seed Command
Phase 3D — Tenant Isolation Testing
```

Rule:

```text
Tenant creation, migration, dan assignment tetap command internal only.
Tidak ada public API untuk create/migrate/assign tenant.
```

## Phase 4 — System Policy & Accounting Foundation

Status:

```text
[✓] Selesai dalam roadmap sesi
```

Subphase:

```text
4A — Company Settings Foundation
4B — Permission Foundation Basic
4C — Transaction Lifecycle Standard
4D — Transaction Policy Service
4E — Transaction Dependency Foundation
4F — Period, Fiscal Year & Lock Foundation
4G — Document Numbering Foundation
4H — Source Link Standard
4I — Revision Tracking Foundation
4J — Audit Log Basic
4K — Report Visibility Standard
4L — Opening Balance Standard
4M — Account Mapping Foundation
4N — Standard API Error Code
4O — Placeholder Desain Fitur Lanjutan
```

Tujuan:

```text
Mengunci aturan global sebelum master data, jurnal, invoice, purchase, cash bank, inventory, dan laporan dibuat.
```

## Phase 5 — Master Data Akuntansi

Status:

```text
[✓] Selesai dalam roadmap sesi
```

Scope:

```text
Chart of Accounts
Contacts
Products
Product Categories
Units
Warehouses
Account Mappings
```

Rule:

```text
Semua master data tenant masuk tenant database.
Inactive master data tidak muncul di dropdown transaksi baru.
Data histori tetap bisa menampilkan master data yang sudah inactive.
```

---

# 6. Stage 2 — Backend Accounting Core

## Phase 6 — Journal Entry Engine

Status:

```text
[✓] Selesai dalam roadmap sesi
```

Scope:

```text
journal_entries
journal_entry_lines
manual journal
system generated journal
validasi debit = kredit
draft / approved / posted / void
nomor jurnal otomatis
source link
revision support
permission guard
period lock guard
```

Rule:

```text
Laporan hanya membaca journal posted aktif.
Journal void/obsolete tidak masuk report normal.
Manual journal dan system-generated journal punya policy edit berbeda.
```

## Phase 6A — Analytical Dimensions Foundation

Status:

```text
[✓] Selesai dalam roadmap sesi
```

Scope:

```text
departments
projects
optional department_id dan project_id di journal_entry_lines
validasi department/project untuk journal lines
permission departments/projects
API CRUD department/project
```

Rule:

```text
Dimension disimpan di journal_entry_lines, bukan hanya journal_entries.
Department/project optional.
Inactive department tidak boleh dipakai untuk jurnal baru.
Project yang boleh dipakai untuk jurnal baru harus active dan status active.
Cost Center, Branch, Location ditunda.
```

## Phase 7 — General Ledger & Trial Balance

Status:

```text
[✓] Selesai dalam roadmap sesi
```

Scope:

```text
General Ledger
Account Ledger Detail
Trial Balance
opening balance dari opening journal
mutasi debit/kredit
ending balance
filter date/fiscal year/department/project jika tersedia
```

Rule:

```text
Ambil journal_entries status posted aktif saja.
Exclude void.
Exclude obsolete.
Buku besar harus clean.
```

## Phase 8A — Profit & Loss Statement API

Status:

```text
[✓] Selesai dalam roadmap sesi
```

Scope:

```text
Revenue
Expense
Net Profit/Loss
Filter start_date/end_date/fiscal_year
Filter department/project
Posted only
Exclude void/obsolete
```

## Phase 8B — Balance Sheet API

Status:

```text
[✓] Selesai dalam roadmap sesi
```

Scope:

```text
Asset
Liability
Equity
Current Year Profit/Loss masuk Equity
Total Asset = Liability + Equity
Posted only
Exclude void/obsolete
```

## Phase 8C — Simple Cash Flow API

Status:

```text
[✓] Selesai dalam roadmap sesi
```

Scope MVP:

```text
Opening Cash Balance
Cash In
Cash Out
Ending Cash Balance
Berdasarkan COA is_cash_bank = true
```

Catatan:

```text
Belum advanced cash flow operating/investing/financing secara penuh.
```

## Phase 8D — Financial Statement Integration & Consistency Tests

Status:

```text
[✓] Selesai dalam roadmap sesi
```

Scope:

```text
Financial summary endpoint
Cross-report consistency test
Profit Loss net profit = Current Year Profit/Loss di Balance Sheet
Balance Sheet balanced
Cash Flow ending balance sesuai saldo akun cash/bank
Trial Balance debit = credit
Void/obsolete/draft/approved tidak masuk laporan
Department/project filter konsisten
```

## Phase 8E — Fiscal Closing Foundation

Status:

```text
[✓] Selesai dalam roadmap sesi
```

Scope:

```text
FiscalYearClosingService
fiscal_year_closings table
retained earnings calculation
closing preview API
close API
reopen API
transaction date locking foundation
audit log integration
```

## Phase 8F — Closing Wizard & Period Locking API/UI ringan

Status:

```text
[✓] Selesai dalam roadmap sesi
```

Scope:

```text
closing checklist endpoint
period locking endpoint
closing warning/error response
reopen workflow refinement
transaction blocking refinement
audit events
lightweight frontend closing page jika dibuat
```

Catatan:

```text
Phase 8F boleh punya UI ringan untuk closing wizard.
Tetapi frontend report besar tetap belum dibuat.
```

---

# 7. Stage 3 — Backend Business Modules

## Phase 9 — Sales & Accounts Receivable Backend

Status:

```text
[ ] NEXT PHASE
```

Keputusan final:

```text
Phase 9 tetap Sales / Faktur Penjualan Backend.
Phase 9 bukan Accounting Frontend MVP.
```

Tujuan:

```text
Membuat fondasi transaksi penjualan dan piutang yang bisa menghasilkan jurnal otomatis.
```

Subphase:

```text
Phase 9A — Sales Foundation & Sales Invoice Schema
Phase 9B — Sales Invoice API & Auto Journal Posting
Phase 9C — Customer Payment / Receive Payment Foundation
Phase 9D — Accounts Receivable Ledger & Aging Basic
Phase 9E — Sales Backend Integration Tests & Documentation
```

Catatan:

```text
Frontend sales invoice belum dibuat di Phase 9.
Frontend sales masuk Phase 14.
```

### Phase 9A — Sales Foundation & Sales Invoice Schema

Scope:

```text
sales_invoices
sales_invoice_lines
SalesInvoice model
SalesInvoiceLine model
status invoice
document numbering untuk sales_invoice
validasi customer/product/account mapping
SalesInvoiceService skeleton
Sales docs
```

Status invoice:

```text
draft
approved
posted
partially_paid
paid
void
```

Rule awal:

```text
draft          = belum masuk jurnal
approved       = siap posting
posted         = sudah generate journal
partially_paid = sudah ada pembayaran sebagian
paid           = lunas
void           = dibatalkan
```

Auto journal posting invoice:

```text
Dr Accounts Receivable
    Cr Sales Revenue
```

Jika tax basic aktif:

```text
Dr Accounts Receivable
    Cr Sales Revenue
    Cr Output Tax Payable
```

Jika inventory aktif nanti:

```text
Dr Cost of Goods Sold
    Cr Inventory
```

Tidak dikerjakan di Phase 9A:

```text
payment / receive payment penuh
aging receivable
frontend UI besar
sales return
tax complex
discount complex
inventory stock movement
delivery order
recurring invoice
PDF invoice
email invoice
```

### Phase 9B — Sales Invoice API & Auto Journal Posting

Scope:

```text
SalesInvoiceController
StoreSalesInvoiceRequest
UpdateSalesInvoiceRequest
Approve/Post/Void action
Auto generate journal via JournalEntryService
Source link sales_invoice
Revision support
Period lock guard
Permission guard
Audit log
```

### Phase 9C — Customer Payment / Receive Payment Foundation

Scope:

```text
Receive payment untuk sales invoice
payment allocation minimal 1 payment ke 1 invoice
update paid_amount dan balance_due
update status partially_paid / paid
jurnal penerimaan piutang
```

Posting:

```text
Dr Cash/Bank
    Cr Accounts Receivable
```

Catatan:

```text
Advanced payment allocation 1 payment ke banyak invoice bisa ditunda.
```

### Phase 9D — Accounts Receivable Ledger & Aging Basic

Scope:

```text
AR ledger per customer
open invoice list
aging receivable basic
filter customer/date/status
```

### Phase 9E — Sales Backend Integration Tests & Documentation

Scope:

```text
sales invoice test
posting test
void test
payment dependency test
period lock test
permission test
AR aging test
docs phase 9
```

## Phase 10 — Purchase & Accounts Payable Backend

Status:

```text
[✓] Phase 10A-10I selesai; backend Purchase Workflow & Accounts Payable completed
```

Subphase:

```text
10A Purchase Workflow Foundation
10B Purchase Request
10C Purchase Order + Vendor Deposit Entry
10D Goods Receipt
10E Vendor Bill / Purchase Invoice
10F Vendor Payment & Vendor Deposit
10G Purchase Return
10H AP Subsidiary Ledger & Aging
10I Integration Tests & Documentation
```

Global rules:

```text
Phase 10 backend-first dan bukan frontend.
Frontend purchase masuk Phase 15.
Semua tabel purchase masuk tenant database.
Semua endpoint purchase wajib auth:sanctum + company.access + permission granular.
Semua dokumen purchase tenant-aware, source-chain-aware, audit-aware, period-lock-aware, dan tidak hard delete.
Purchase Order tidak membuat journal/AP/stock movement.
Goods Receipt hanya dokumen penerimaan barang dan tidak membuat stock movement.
Vendor Bill langsung belum membuat stock movement atau inventory valuation.
Vendor Deposit adalah asset/advance payment: Dr Vendor Deposit, Cr Cash/Bank.
Apply Vendor Deposit ke Vendor Bill: Dr Accounts Payable, Cr Vendor Deposit.
AP subsidiary ledger Phase 10H wajib reconcile dengan GL Accounts Payable.
Stock movement, inventory valuation, stock card, warehouse stock balance, landed cost, FIFO, dan moving average ditunda ke Phase 12.
```

Posting pembelian kredit:

```text
Dr Inventory / Expense
Dr Input Tax Payable jika tax aktif
    Cr Accounts Payable
```

Supplier payment:

```text
Dr Accounts Payable
    Cr Cash/Bank
```

Purchase return:

```text
Dr Accounts Payable
    Cr Purchase Return / Expense Reduction
    Cr Input Tax jika tax aktif
```

Final Phase 10 notes:

```text
Purchase Return tidak membuat stock movement atau inventory return journal.
AP subsidiary ledger membaca posted vendor bills, vendor payments, vendor deposit allocations, dan purchase returns.
AP ledger balance wajib reconcile dengan GL Accounts Payable.
Known limitations tetap: no frontend purchase, no stock movement, no inventory valuation, no stock card, no advanced payment allocation, no overpayment, no advanced tax, no landed cost, no FIFO/moving average.
Next phase: Phase 11 — Cash Bank Backend.
```

## Phase 11 — Cash Bank Backend

Status:

```text
[ ] Belum mulai
```

Subphase:

```text
11A Cash/Bank Account Foundation
11B Cash In / Cash Out API
11C Bank Transfer API
11D Payment Allocation Refinement
11E Bank Reconciliation Basic
11F Cash Bank Tests & Docs
```

## Phase 12 — Inventory Backend

Status:

```text
[ ] Belum mulai
```

Subphase:

```text
12A Inventory Schema
12B Stock Movement Engine
12C Stock Adjustment
12D Average Cost Valuation Basic
12E COGS Integration
12F Inventory Tests & Docs
```

---

# 8. Stage 4 — Frontend Application

Catatan prinsip:

```text
Frontend besar dimulai setelah backend accounting core dan backend business modules lebih stabil.
Frontend tidak dimasukkan ke Phase 9 agar Phase 9 tetap konsisten sebagai Sales Backend.
```

## Phase 13 — Accounting Frontend MVP

Status:

```text
[ ] Belum mulai
```

Subphase:

```text
13A Frontend Layout & Navigation Refinement
13B Chart of Accounts Frontend
13C Master Data Frontend
13D Journal Entry Frontend
13E Reports Frontend
13F Fiscal Closing Frontend Finalization
```

### Phase 13A — Frontend Layout & Navigation Refinement

Scope:

```text
AppShell final
Sidebar menu
Topbar
Company switcher final
User menu
Breadcrumb
Permission-aware menu
Loading state
Error state
Empty state
Table component
Form pattern
Modal pattern
```

### Phase 13B — Chart of Accounts Frontend

Scope:

```text
COA list
COA create/edit form
COA active/inactive
account type filter
search
```

### Phase 13C — Master Data Frontend

Scope:

```text
Contacts
Products
Units
Product Categories
Warehouses
Account Mappings
Departments
Projects
```

### Phase 13D — Journal Entry Frontend

Scope:

```text
Journal list
Journal detail
Create journal form
Edit draft journal
Add/remove journal lines
Debit/credit balancing indicator
Select COA
Select department/project
Post journal
Void journal
```

### Phase 13E — Reports Frontend

Scope:

```text
General Ledger page
Trial Balance page
Profit & Loss page
Balance Sheet page
Cash Flow page
Financial Summary page
Filter date/fiscal year
Filter department/project
```

Tidak termasuk:

```text
Export PDF
Export Excel
Advanced chart/dashboard analytics
```

### Phase 13F — Fiscal Closing Frontend Finalization

Scope:

```text
Closing status page
Closing checklist
Closing preview
Period lock status
Reopen workflow
```

## Phase 14 — Sales Frontend MVP

Scope:

```text
Sales invoice list
Create sales invoice
Sales invoice detail
Post sales invoice
Void sales invoice
Receive payment
AR aging page
```

## Phase 15 — Purchase Frontend MVP

Scope:

```text
Purchase invoice list
Create purchase invoice
Purchase invoice detail
Post purchase invoice
Void purchase invoice
Supplier payment
AP aging page
```

## Phase 16 — Cash Bank Frontend MVP

Scope:

```text
Cash bank dashboard
Cash in
Cash out
Bank transfer
Cash/bank ledger
Bank reconciliation basic UI
```

## Phase 17 — Inventory Frontend MVP

Scope:

```text
Stock list
Stock movement
Stock adjustment
Inventory valuation
Product stock card
```

---

# 9. Stage 5 — Advanced, Admin, Export, Deployment

## Phase 18 — Role, Permission & User Management Advanced

Scope:

```text
UI manage users
UI manage roles
Custom role per company
Custom permission per role
Invite user
Remove/deactivate user from company
Role change audit log
Permission template
```

Catatan:

```text
Permission middleware dan role-permission basic sudah ada lebih awal.
Phase 18 hanya advanced management UI.
```

## Phase 19 — Reports Advanced, Export PDF/Excel, Print View

Scope:

```text
Laporan Penjualan
Laporan Pembelian
Laporan Piutang
Laporan Utang
Laporan Persediaan
Kartu stok
Rekap pelanggan
Rekap supplier
Export PDF
Export Excel
Print view
```

## Phase 20 — Audit Log Advanced UI

Scope:

```text
Audit viewer UI
Filter audit by user/module/action/date
Detail old_value/new_value
Void transaction history
Revision history viewer
Export audit log
```

## Phase 21 — Backup & Restore Tools

Scope:

```text
Backup central.sqlite
Backup tenant database per company
Download backup file
Restore tenant database
Auto backup harian
Backup log
Restore log
```

## Phase 22 — Advanced Accounting & Operational Modules

Scope:

```text
Multi-currency penuh
Advanced tax
Credit note
Debit note
Bank reconciliation advanced
Overpayment
Customer credit
Supplier deposit
Branch/location
Cost center
Data import
External integrations
Attachment upload UI
Advanced payment allocation
```

Catatan:

```text
Department dan Project sudah dimajukan ke Phase 6A.
Cost Center, Branch, Location tetap advanced.
```

## Phase 23 — Fixed Asset

Scope:

```text
Fixed asset master
Asset acquisition
Depreciation method
Depreciation schedule
Monthly depreciation journal
Asset disposal
Asset revaluation jika dibutuhkan
```

## Phase 24 — Testing Hardening

Scope:

```text
Backend feature test
Backend unit test
Frontend basic test
Tenant switching test
Accounting balance test
Business module integration test
Regression test
Manual test checklist
```

Important tests:

```text
User A tidak bisa akses company User B
Company switch mengganti tenant context
Permission middleware bekerja
Period lock mencegah edit/void/post
Edit posted transaksi membuat revision baru
Edit posted transaksi void effect lama + post effect baru
Void transaksi hidden dari UI default
Void journal tidak masuk buku besar
Buku besar hanya ambil posted aktif
Journal debit credit harus balance
Posted system-generated journal tidak diedit langsung
File SQLite tenant tidak bisa diakses publik
Tidak ada public route create/migrate/delete tenant
```

## Phase 25 — Deployment to VPS & Production Hardening

Scope:

```text
Setup VPS Ubuntu
Install Nginx
Install PHP
Install Composer
Install Node.js
Install SQLite extension
Deploy Laravel backend
Deploy Next.js frontend
Setup domain
Setup SSL
Setup supervisor/PM2
Setup backup otomatis
Setup permission folder SQLite
APP_DEBUG=false
APP_ENV=production
Nginx block akses .sqlite
Log rotation
Monitoring basic
```

---

# 10. MVP Priority Baru

Prioritas backend MVP:

```text
1. Login/Register
2. Company access
3. Internal create company/tenant command
4. Generate SQLite tenant
5. Select Company
6. Tenant resolver
7. System Policy & Accounting Foundation
8. Chart of Accounts
9. Opening Balance
10. Journal Entry
11. General Ledger
12. Trial Balance
13. Profit Loss
14. Balance Sheet
15. Cash Flow Basic
16. Fiscal Closing / Period Locking
17. Sales Backend
18. Purchase Backend
19. Cash Bank Backend
20. Inventory Backend
```

Prioritas frontend MVP:

```text
1. Login/Register
2. Select Company
3. Dashboard tenant context
4. Accounting Frontend MVP
5. Sales Frontend MVP
6. Purchase Frontend MVP
7. Cash Bank Frontend MVP
8. Inventory Frontend MVP
```

---

# 11. Yang Sengaja Tidak Dimajukan

```text
Multi-currency penuh
Advanced tax
Credit note/debit note
Bank reconciliation advanced
Overpayment/customer credit/supplier deposit
Branch/location
Cost center
Data import
External integrations
Attachment upload UI
Advanced payment allocation
Fixed asset
Audit viewer advanced
Backup/restore UI
Export PDF/Excel
```

Tetapi beberapa placeholder/setting tetap disiapkan sejak Phase 4 agar nanti tidak refactor besar.

---

# 12. Ringkasan Perubahan Nomor Phase

```text
Phase 0  — Setup Project Foundation
Phase 1  — Central Database + Demo Foundation
Phase 2A — Backend Authentication & Company Access
Phase 2B — Minimal Frontend Auth & Company Selection
Phase 3  — Internal Tenant Generator & Tenant Isolation
Phase 4  — System Policy & Accounting Foundation
Phase 5  — Master Data Akuntansi
Phase 6  — Journal Entry Engine
Phase 6A — Analytical Dimensions Foundation
Phase 7  — General Ledger & Trial Balance
Phase 8A — Profit & Loss Statement API
Phase 8B — Balance Sheet API
Phase 8C — Simple Cash Flow API
Phase 8D — Financial Statement Integration & Consistency Tests
Phase 8E — Fiscal Closing Foundation
Phase 8F — Closing Wizard & Period Locking API/UI ringan
Phase 9  — Sales & Accounts Receivable Backend
Phase 10 — Purchase & Accounts Payable Backend
Phase 11 — Cash Bank Backend
Phase 12 — Inventory Backend
Phase 13 — Accounting Frontend MVP
Phase 14 — Sales Frontend MVP
Phase 15 — Purchase Frontend MVP
Phase 16 — Cash Bank Frontend MVP
Phase 17 — Inventory Frontend MVP
Phase 18 — Role, Permission & User Management Advanced
Phase 19 — Reports Advanced, Export PDF/Excel, Print View
Phase 20 — Audit Log Advanced UI
Phase 21 — Backup & Restore Tools
Phase 22 — Advanced Accounting & Operational Modules
Phase 23 — Fixed Asset
Phase 24 — Testing Hardening
Phase 25 — Deployment to VPS & Production Hardening
```

---

# 13. Catatan Konsistensi Roadmap

Keputusan yang dikunci:

```text
Phase 9 tetap Sales Backend.
Frontend besar tidak dipindahkan ke Phase 9.
Accounting Frontend MVP masuk Phase 13.
Sales Frontend MVP masuk Phase 14.
Backend-first tetap menjadi strategi utama.
```

Alasan:

```text
1. Kita sudah membangun backend accounting core sampai Phase 8.
2. Modul sales adalah kelanjutan alami setelah laporan dan closing selesai.
3. Frontend accounting tetap penting, tetapi lebih aman dibuat setelah API accounting stabil.
4. Frontend sales dibuat setelah Sales Backend selesai.
5. Roadmap tidak boleh berganti arah tanpa catatan revisi eksplisit.
```

---

# 14. Langkah Berikutnya

Next action:

```text
Masuk Phase 9A — Sales Foundation & Sales Invoice Schema.
```

Phase 9A harus fokus pada backend:

```text
sales_invoices
sales_invoice_lines
SalesInvoice model
SalesInvoiceLine model
SalesInvoiceService skeleton
document numbering sales invoice
status invoice
basic validation
sales docs
tests jika memungkinkan
```

Jangan masuk frontend sales dulu.
Jangan membuat UI input invoice di Phase 9A.
Jangan membuat payment penuh di Phase 9A.
Jangan membuat inventory movement di Phase 9A.
Jangan membuat PDF/email invoice di Phase 9A.

---

# 15. Kesimpulan Final

```text
Roadmap final memakai pendekatan backend-first.
Phase 0–8F membangun foundation dan backend accounting core.
Phase 9–12 membangun backend business modules.
Phase 13–17 baru membangun frontend application secara serius.
Phase 18+ masuk advanced/admin/export/deployment.
```

Dengan susunan ini, project tidak bolak-balik antara backend dan frontend secara tidak terkontrol, dan Phase 9 tetap konsisten sebagai Sales / Faktur Penjualan Backend.
