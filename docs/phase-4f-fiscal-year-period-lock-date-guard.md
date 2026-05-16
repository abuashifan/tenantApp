# Phase 4F — Fiscal Year, Period Lock & Transaction Date Guard Foundation

Phase 4F menambahkan fondasi **fiscal year** dan **date guard** agar transaksi tidak bisa dibuat/diubah pada tanggal yang salah, dan agar transaksi pada fiscal year yang sudah **closed** menjadi **read-only**.

Catatan penting: **Tidak ada monthly closing reminder** dan **tidak ada monthly transaction blocking**. Accounting period bulanan disediakan untuk struktur/filter/report (dan future expansion), tetapi Phase 4F hanya memblok perubahan berdasarkan **annual closing (fiscal year closed)**.

## Tujuan

- Menyimpan fiscal year & accounting period sebagai metadata company di **central database**.
- Memastikan:
  - Transaksi di fiscal year yang sudah `closed` menjadi read-only (edit/void/approve/post blocked).
  - Tanggal transaksi di luar active fiscal year diblok jika `block_outside_current_fiscal_year = true`.
  - Tanggal “next fiscal year” diblok jika fiscal year aktif sebelumnya belum `closed` (annual closing gate).
  - Warning (bukan block) untuk tanggal future / beda periode bila `date_warning_enabled = true`.

## Central Database Schema

### `fiscal_years`
File migration: `backend/database/migrations/central/2026_05_17_000002_create_fiscal_years_table.php`

Kolom penting:
- `company_id`
- `year`, `start_date`, `end_date`
- `status`: `open`, `closing_required`, `closing_in_progress`, `closed`
- `is_active`
- `closed_at`, `closed_by`
- `metadata` (json)

Rules:
- Unique: `(company_id, year)`
- Active fiscal year: `is_active = true` (maksimal satu per company)

### `accounting_periods`
File migration: `backend/database/migrations/central/2026_05_17_000003_create_accounting_periods_table.php`

Kolom penting:
- `company_id`, `fiscal_year_id`
- `period_year`, `period_month`
- `start_date`, `end_date`
- `status`: `open`, `closed` (dipakai untuk struktur/report; tidak memblok transaksi di Phase 4F)
- `metadata` (json)

Rules:
- Unique: `(company_id, period_year, period_month)`

## Model

- `backend/app/Models/FiscalYear.php`
- `backend/app/Models/AccountingPeriod.php`

Relasi (di `backend/app/Models/Company.php`):
- `Company::fiscalYears()`, `Company::activeFiscalYear()`
- `Company::accountingPeriods()`

## Services

### `FiscalYearService`
File: `backend/app/Services/Accounting/FiscalYearService.php`

Fungsi utama:
- `getOrCreateActiveFiscalYear()` membuat fiscal year aktif (default Jan–Dec) bila belum ada.
- `createPeriodsForFiscalYear()` membuat 12 accounting periods.
- Gate: membuat fiscal year baru untuk tahun berikutnya **diblok** jika fiscal year sebelumnya belum `closed`.

### `AnnualClosingGateService`
File: `backend/app/Services/Accounting/AnnualClosingGateService.php`

Fungsi:
- Menentukan apakah closing tahunan diperlukan (setelah melewati `end_date` fiscal year aktif).
- Memblok tanggal transaksi yang masuk “tahun berikutnya” bila fiscal year aktif belum `closed`.

### `PeriodLockService`
File: `backend/app/Services/Accounting/PeriodLockService.php`

Catatan scope:
- Phase 4F hanya memakai status `fiscal_years.status = closed` sebagai **read-only gate**.
- Accounting period lock bulanan tidak dipakai untuk memblok transaksi (sesuai keputusan bisnis “no monthly blocking”).

### `TransactionDateGuardService`
File: `backend/app/Services/Transactions/TransactionDateGuardService.php`

Rules yang di-apply:
- Block jika fiscal year pada tanggal tersebut sudah `closed`.
- Block jika `block_outside_current_fiscal_year = true` dan tanggal tidak termasuk active fiscal year.
- Block jika masuk “next fiscal year” sementara fiscal year aktif belum `closed` (annual gate).
- Block/backdate/future mengikuti settings:
  - `allow_backdated_transactions`, `max_backdate_days`
  - `allow_future_transactions`, `max_future_days`
- Warning (bukan block) jika `date_warning_enabled = true`:
  - tanggal future
  - tanggal beda periode (bulan berbeda) tetapi masih dalam active fiscal year

Integrasi:
- `TransactionPolicyService` memanggil date guard untuk `create/edit/void/approve/post`.

Binding:
- `backend/app/Providers/AppServiceProvider.php` melakukan binding `TransactionDateGuard` → `TransactionDateGuardService`.

## Endpoint (Minimal)

- `GET /api/accounting/fiscal-year/status`
  - Middleware: `auth:sanctum`, `company.access`, dan `permission:dashboard.view`
  - Mengembalikan active fiscal year + flag `annual_closing_only`.
  - File: `backend/app/Http/Controllers/Api/Accounting/FiscalYearStatusController.php`

## Testing

Jalankan:
- `cd backend`
- `php artisan test --filter=FiscalYearDateGuardTest`

## Batasan Scope

Phase 4F tidak membuat:
- closing wizard UI
- jurnal penutup / opening journal
- tabel transaksi (invoice/journal/stock movement)
- monthly closing reminder / monthly transaction blocking

