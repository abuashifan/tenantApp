# Phase 8E — Closing Wizard & Fiscal Closing Implementation

Phase 8E menambahkan fondasi **fiscal year closing** (year-end closing) untuk aplikasi accounting multi-tenant (1 company = 1 tenant database).

Fokus Phase 8E:
- Closing per fiscal year (per company/tenant)
- Retained earnings calculation (summary)
- Fiscal year lock (transaction blocking)
- Preview/check sebelum execute closing
- Reopen terbatas
- Audit trail

Tidak termasuk:
- Frontend wizard besar
- Approval workflow multi-level
- Scheduled closing automation
- Budgeting / tax / inventory / fixed asset closing
- Export PDF/Excel

## Konsep closing (MVP)
Closing **tidak menghapus atau me-rewrite** journal history. Closing adalah:
- validasi laporan & rule bisnis,
- menghitung net profit/loss tahun berjalan,
- menyimpan summary retained earnings,
- menandai fiscal year sebagai closed sehingga transaksi menjadi read-only pada periode tersebut.

Historical report tetap readable (General Ledger, Trial Balance, Profit & Loss, dll).

## Data & migrations

### Tenant DB
Menambah table:
- `fiscal_year_closings` (1 row per fiscal year)

Field penting:
- `fiscal_year_id` (integer, refer ke central fiscal_years id)
- `retained_earnings_account_id`
- `retained_earnings_amount`
- `closed_at`, `reopened_at`
- `metadata`

### Central DB
Menambah kolom di `fiscal_years` (additive):
- `is_closed`
- `reopened_at`
- `locked_until`

Status utama tetap memakai `fiscal_years.status` (`open|closed|...`), tetapi `is_closed` disediakan untuk kebutuhan integrasi/visibility.

## Retained earnings
Retained earnings dihitung dari jurnal posted pada periode fiscal year:
- `retained_earnings = total_revenue - total_expense`
- memakai rule reportable journal: `posted` dan `not obsolete`

Account retained earnings diambil dari account mapping tenant:
- `closing.retained_earnings`

## Transaction locking behavior
Setelah fiscal year `closed`:
- create journal ditolak
- edit journal ditolak
- void journal ditolak

Blocking dilakukan melalui `TransactionDateGuardService` yang mengecek fiscal year status pada `transaction_date`.

## Preview & validation flow
Closing harus melalui preview:
1. `GET closing-preview`
2. user review hasil preview
3. `POST close` (execute)

Jika user mencoba `close` tanpa preview, API return validation error.

Checklist minimal (validate closing):
- fiscal year exists dan open
- trial balance balanced untuk range fiscal year
- retained earnings account mapping configured

## Reopen flow
Reopen hanya untuk fiscal year yang closed dan wajib ada reason:
- `POST reopen` dengan `reopen_reason`
- audit log event dicatat

Reopen tidak menghapus `fiscal_year_closings` history.

## API endpoints
Semua endpoint:
- `auth:sanctum`
- `company.access`

### Preview
`GET /api/accounting/fiscal-years/{id}/closing-preview`
- Permission: `fiscal_year.view`

### Close
`POST /api/accounting/fiscal-years/{id}/close`
- Permission: `fiscal_year.close`
- Body: `closing_notes` (optional)

### Reopen
`POST /api/accounting/fiscal-years/{id}/reopen`
- Permission: `fiscal_year.reopen`
- Body: `reopen_reason` (required)

## Permissions
Ditambahkan:
- `fiscal_year.view`
- `fiscal_year.close`
- `fiscal_year.reopen`
- `fiscal_year.lock_override` (reserved for future)

## Tests
Feature tests:
- `backend/tests/Feature/Accounting/FiscalYearClosingTest.php`
- `backend/tests/Feature/Accounting/FiscalYearReopenTest.php`
- `backend/tests/Feature/Accounting/FiscalYearLockingTest.php`

## Commands
Jika environment memungkinkan:
- `cd backend`
- `php artisan test --filter=FiscalYearClosingTest`
- `php artisan test --filter=FiscalYearReopenTest`
- `php artisan test --filter=FiscalYearLockingTest`
- `php artisan route:list`

## Limitations / future improvements
- Cross-DB transactional atomicity (central + tenant) masih best-effort.
- Belum membuat auto opening balance journal.
- Belum membuat UI closing wizard (akan di Phase 8F).

