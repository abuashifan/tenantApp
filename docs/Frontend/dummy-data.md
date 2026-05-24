TASK TITLE:
Create One-Month Dummy Accounting Cycle Data for Financial Statement Testing

PROJECT:
TenantAppDevelopment

CONTEXT:
Project ini adalah aplikasi akuntansi multi-tenant dengan backend Laravel API dan tenant database per company.

Tujuan task ini adalah membuat data dummy lengkap untuk 1 bulan transaksi akuntansi agar sistem bisa diuji dari awal sampai menghasilkan laporan keuangan:

- General Ledger
- Trial Balance
- Profit & Loss
- Balance Sheet
- Cash Flow sederhana
- AR Aging
- AP Aging jika modul purchase tersedia
- Closing preview jika endpoint sudah tersedia

IMPORTANT:
Data dummy ini untuk testing/development.
Jangan membuat fitur baru.
Jangan mengubah business rule accounting.
Jangan mengubah arsitektur tenant.
Jangan membuat frontend.
Jangan hardcode khusus hanya untuk satu mesin lokal.

TARGET:
Buat seed/demo command yang menghasilkan siklus akuntansi lengkap selama 1 bulan, misalnya periode:

2026-01-01 sampai 2026-01-31

Gunakan company demo existing jika tersedia.
Gunakan tenant database aktif dari company demo.

OUTPUT YANG DIHARAPKAN:
Setelah dummy data dijalankan, user bisa membuka laporan dan melihat:

1. Saldo awal
2. Transaksi penjualan
3. Penerimaan kas dari customer
4. Transaksi pembelian / beban
5. Pembayaran ke vendor
6. Beban operasional
7. Penyusutan / adjustment sederhana
8. Jurnal penyesuaian akhir bulan
9. Trial Balance balance
10. Profit & Loss menghasilkan laba/rugi
11. Balance Sheet balance
12. Cash Flow menunjukkan cash in/cash out
13. Semua journal yang masuk laporan harus status posted

SCOPE:
Buat data dummy minimal tapi lengkap.

Data master:

- Chart of Accounts sudah ada jika seeder existing tersedia
- Contacts:
  - minimal 3 customer
  - minimal 3 vendor
- Products:
  - minimal 3 produk jasa/barang
- Departments:
  - Operasional
  - Sales
  - Finance
- Projects:
  - Project Januari 2026
  - Project Internal

Opening balance:
Buat jurnal saldo awal di tanggal 2026-01-01.

Contoh saldo awal:

- Cash / Bank
- Accounts Receivable
- Inventory jika akun tersedia
- Fixed Asset
- Accumulated Depreciation
- Accounts Payable
- Capital / Owner Equity
- Retained Earnings jika tersedia

Transaksi bulan berjalan:
Buat transaksi dengan tanggal tersebar dari 2026-01-02 sampai 2026-01-31.

Minimal transaksi:

A. Sales / Revenue

- 5 transaksi penjualan tunai
- 5 transaksi penjualan kredit
- 2 customer receipt untuk pelunasan piutang sebagian
- 1 customer deposit / uang muka jika modul sales deposit tersedia
- 1 sales return jika modul tersedia

B. Purchase / Expense

- 3 transaksi pembelian kredit / vendor bill jika modul purchase tersedia
- 2 pembayaran vendor
- 1 vendor deposit jika modul tersedia
- Jika purchase module belum tersedia, gunakan manual journal untuk beban dan hutang usaha.

C. Cash Bank

- 3 cash out untuk beban operasional:
  - listrik
  - internet
  - transport
- 2 cash in non-sales:
  - tambahan modal
  - pendapatan lain-lain
- 1 bank transfer internal jika cash bank module tersedia

D. Adjusting Entries

- Beban penyusutan aset tetap
- Beban gaji masih harus dibayar / accrued salary
- Beban sewa dibayar dimuka yang diamortisasi jika akun tersedia
- Penyesuaian revenue/expense sederhana

E. Closing readiness

- Semua jurnal transaksi utama harus posted.
- Draft journal boleh dibuat 1 contoh, tapi jangan ikut laporan.
- Void journal boleh dibuat 1 contoh, tapi pastikan tidak ikut laporan.
- Pastikan laporan hanya mengambil journal posted dan exclude void.

ACCOUNTING RULES:

1. Total debit harus selalu sama dengan total credit.
2. Jangan simpan balance di chart of accounts.
3. Saldo laporan harus dihitung dari posted journal lines.
4. Posted journal immutable.
5. Void journal tidak boleh masuk laporan.
6. Draft/approved journal tidak boleh masuk laporan.
7. Gunakan department_id dan project_id pada sebagian journal lines jika analytical dimensions tersedia.
8. Gunakan document number service jika project sudah punya.
9. Gunakan service existing jika tersedia.
10. Jangan membuat logic accounting baru yang bertentangan dengan service existing.

IMPLEMENTATION OPTIONS:
Pilih pendekatan paling sesuai dengan struktur project existing:

Option A:
Buat Artisan Command:
backend/app/Console/Commands/SeedOneMonthAccountingCycleCommand.php

Command:
php artisan demo:seed-accounting-cycle --company-id=1 --period=2026-01

Option B:
Buat Seeder:
backend/database/seeders/OneMonthAccountingCycleSeeder.php

Command:
php artisan db:seed --class=OneMonthAccountingCycleSeeder

Preferred:
Gunakan Artisan Command agar bisa memilih company dan periode.

COMMAND REQUIREMENTS:
Command harus menerima:

- --company-id=
- --period=YYYY-MM
- --reset-demo-data optional

Contoh:
php artisan demo:seed-accounting-cycle --company-id=1 --period=2026-01

Jika --reset-demo-data diberikan:

- Hapus hanya data dummy yang dibuat oleh command ini.
- Jangan hapus data asli.
- Gunakan metadata flag:
  metadata.demo_seed = "one_month_accounting_cycle"
  metadata.demo_period = "2026-01"

DATA TAGGING:
Semua data dummy yang dibuat wajib memiliki metadata penanda jika tabel mendukung metadata.

Contoh:
metadata: {
"demo_seed": "one_month_accounting_cycle",
"demo_period": "2026-01",
"generated_by": "SeedOneMonthAccountingCycleCommand"
}

Jika tabel tidak punya metadata:

- Gunakan notes/internal_notes dengan prefix:
  [DEMO-ACCOUNTING-CYCLE-2026-01]

FILES TO READ FIRST:
Jangan relisting seluruh repository.
Baca file yang relevan saja:

Backend tenant and command:

- backend/routes/api.php
- backend/app/Services/Tenant/TenantContext.php
- backend/app/Services/Tenant/TenantConnectionManager.php
- backend/app/Console/Commands existing tenant/demo commands

Accounting:

- backend/app/Models/Tenant/ChartOfAccount.php
- backend/app/Models/Tenant/JournalEntry.php
- backend/app/Models/Tenant/JournalEntryLine.php
- backend/app/Services/Journal/JournalEntryService.php
- backend/app/Services/Journal/JournalValidationService.php
- backend/app/Services/DocumentNumbering/DocumentNumberService.php

Master Data:

- backend/app/Models/Tenant/Contact.php
- backend/app/Models/Tenant/Product.php
- backend/app/Models/Tenant/Unit.php
- backend/app/Models/Tenant/Department.php
- backend/app/Models/Tenant/Project.php
- backend/app/Models/Tenant/AccountMapping.php

Reports:

- backend/app/Services/Reports or backend/app/Services/Report
- ProfitLossService
- BalanceSheetService
- CashFlowService
- TrialBalanceService

Sales/Purchase if available:

- backend/app/Models/Tenant/SalesInvoice.php
- backend/app/Models/Tenant/SalesReceipt.php
- backend/app/Models/Tenant/CustomerDeposit.php
- backend/app/Models/Tenant/VendorBill.php
- backend/app/Models/Tenant/VendorPayment.php
- backend/app/Models/Tenant/VendorDeposit.php

DO NOT:

- Jangan membuat migration baru kecuali benar-benar diperlukan.
- Jangan mengubah struktur tabel existing.
- Jangan mengubah report calculation.
- Jangan mengubah journal posting rules.
- Jangan membuat frontend.
- Jangan membuat endpoint baru.
- Jangan membuat tenant/company creation public.
- Jangan membuat data dummy global di central database selain jika memang butuh company demo.

ACCOUNT SELECTION RULE:
Jangan hardcode account ID.
Cari akun berdasarkan account code/name/type/mapping.

Priority:

1. Gunakan AccountMapping jika tersedia.
2. Jika tidak ada, cari berdasarkan account code standar.
3. Jika tetap tidak ada, cari berdasarkan account type dan name.
4. Jika akun wajib tidak ditemukan, tampilkan error jelas dan hentikan command.

Required account categories:

- cash/bank
- accounts receivable
- sales revenue
- sales return
- sales discount if available
- accounts payable
- purchase/expense
- operating expense
- salary expense
- rent expense
- utilities expense
- fixed asset
- accumulated depreciation
- depreciation expense
- capital/equity
- retained earnings if available
- tax payable/input tax/output tax if available

JOURNAL EXAMPLES:
Buat jurnal dengan format service existing.

1. Opening balance:
   Dr Cash/Bank
   Dr Accounts Receivable
   Dr Inventory / Asset if available
   Dr Fixed Asset
   Cr Accumulated Depreciation
   Cr Accounts Payable
   Cr Capital
   Cr Retained Earnings if needed

2. Credit sales:
   Dr Accounts Receivable
   Cr Sales Revenue
   Cr Output Tax if taxable

3. Cash sales:
   Dr Cash/Bank
   Cr Sales Revenue
   Cr Output Tax if taxable

4. Customer receipt:
   Dr Cash/Bank
   Cr Accounts Receivable

5. Vendor bill / expense payable:
   Dr Expense / Inventory / Purchase Expense
   Dr Input Tax if taxable
   Cr Accounts Payable

6. Vendor payment:
   Dr Accounts Payable
   Cr Cash/Bank

7. Operating expense cash payment:
   Dr Utilities Expense / Internet Expense / Transport Expense
   Cr Cash/Bank

8. Salary accrual:
   Dr Salary Expense
   Cr Salary Payable / Accounts Payable

9. Depreciation:
   Dr Depreciation Expense
   Cr Accumulated Depreciation

10. Owner capital injection:
    Dr Cash/Bank
    Cr Capital

11. Void example:
    Create one posted journal then void it using existing service if available, or create void-status journal only if project supports it.
    This journal must not affect reports.

12. Draft example:
    Create one draft journal.
    This journal must not affect reports.

EXPECTED NUMERIC RESULT:
Gunakan angka yang realistis dan sederhana.
Pastikan:

- Company menghasilkan laba bersih positif.
- Cash ending tidak negatif.
- AR ending masih ada sebagian.
- AP ending masih ada sebagian.
- Balance Sheet tetap balance.

Suggested rough total:

- Opening cash: 50,000,000
- Sales revenue total: 120,000,000
- Cash collected: 80,000,000
- Expenses total: 55,000,000
- Net profit: positive, around 40,000,000 to 70,000,000 depending tax/adjustment
- Ending cash: positive

VALIDATION AFTER SEED:
Setelah data dibuat, command harus menjalankan validasi sederhana:

1. Total debit = total credit untuk setiap journal.
2. Semua posted journal balanced.
3. Trial Balance total debit = total credit.
4. Profit Loss bisa dihitung.
5. Balance Sheet bisa dihitung.
6. Balance Sheet balanced.
7. Cash Flow bisa dihitung.
8. Draft journal tidak masuk laporan.
9. Void journal tidak masuk laporan.

Jika service report bisa dipanggil dari command, panggil dan tampilkan summary:

- total revenue
- total expense
- net profit
- total assets
- total liabilities
- total equity
- is_balanced
- opening cash
- cash in
- cash out
- ending cash

TESTS:
Buat test jika memungkinkan:

backend/tests/Feature/Demo/OneMonthAccountingCycleSeedTest.php

Test minimal:

- command can run for demo company
- creates contacts/products/departments/projects if missing
- creates posted journals
- every posted journal is balanced
- trial balance balanced
- profit loss returns net profit
- balance sheet balanced
- draft journal excluded from reports
- void journal excluded from reports

DOCUMENTATION:
Buat dokumentasi:

docs/demo-one-month-accounting-cycle.md

Isi:

- tujuan dummy data
- command yang digunakan
- periode default
- jenis data yang dibuat
- contoh ringkasan transaksi
- cara reset dummy data
- cara cek laporan setelah seed
- catatan bahwa data ini development only

ACCEPTANCE CRITERIA:
Task selesai jika:

[ ] Command/seeder untuk dummy accounting cycle 1 bulan tersedia.
[ ] Bisa memilih company-id dan period.
[ ] Data dummy masuk tenant database yang benar.
[ ] Semua transaksi utama posted.
[ ] Draft dan void example tersedia tapi tidak mempengaruhi laporan.
[ ] Debit credit setiap journal balance.
[ ] Trial Balance balance.
[ ] Profit Loss menghasilkan net profit/loss.
[ ] Balance Sheet balanced.
[ ] Cash Flow menghasilkan opening cash, cash in, cash out, ending cash.
[ ] AR ending dan AP ending realistis jika akun tersedia.
[ ] Data dummy ditandai metadata/notes agar bisa di-reset.
[ ] Tidak ada perubahan frontend.
[ ] Tidak ada perubahan API contract.
[ ] Tidak ada perubahan schema kecuali benar-benar diperlukan.
[ ] Dokumentasi dibuat.
[ ] Test dibuat jika memungkinkan.

COMMANDS TO RUN:
Jika environment memungkinkan:

cd backend
php artisan demo:seed-accounting-cycle --company-id=1 --period=2026-01
php artisan test --filter=OneMonthAccountingCycleSeedTest
php artisan route:list

Jika command tidak bisa dijalankan karena environment, jelaskan di final summary.

FINAL SUMMARY REQUIRED:
Setelah selesai, berikan summary:

- File dibuat
- File diubah
- Command yang dibuat
- Data master yang dibuat
- Jurnal/transaksi yang dibuat
- Ringkasan angka laporan
- Validasi debit credit
- Validasi trial balance
- Validasi profit loss
- Validasi balance sheet
- Validasi cash flow
- Command yang berhasil
- Command yang gagal/tidak dijalankan
- Catatan scope yang tidak dikerjakan

COMMIT MESSAGE:
add one month accounting cycle demo seed
