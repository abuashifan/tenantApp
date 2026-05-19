# Phase 7A — General Ledger Query Foundation

Phase 7A menambahkan fondasi **query General Ledger / Buku Besar** berbasis jurnal yang sudah ada, khususnya **journal posted** di **tenant database**.

Scope Phase 7A:
- Read/report query only (tidak mengubah transaksi).
- Tidak membuat Trial Balance final.
- Tidak membuat Financial Statements.
- Tidak membuat frontend UI.
- Tidak membuat export PDF/Excel.
- Tidak menambah modul transaksi (Sales/Purchase/Cash/Inventory).

## Data source (tenant)
Sumber data report:
- `journal_entries`
- `journal_entry_lines`
- `chart_of_accounts`
- (jika ada) `departments`, `projects`

## Reportable journal rule
General Ledger hanya membaca jurnal yang:
- `journal_entries.status = posted`
- `journal_entries.is_obsolete = false`

Dan otomatis mengecualikan:
- `draft`, `approved`
- `void`
- `obsolete`

Closed fiscal year tetap **visible** sebagai histori (read-only) karena Phase 7A tidak menyembunyikan data posted.

## Formula & logic
Normal balance:
- Akun normal **debit**: `balance = debit - credit`
- Akun normal **credit**: `balance = credit - debit`

Opening balance:
- Menjumlah semua journal lines **reportable** sebelum `start_date`
  - kondisi: `journal_date < start_date`
  - jika `start_date` tidak diberikan, opening balance = 0

Period movement:
- Menjumlah semua journal lines **reportable** dalam periode
  - `journal_date >= start_date` (jika ada)
  - `journal_date <= end_date` (jika ada)

Ending balance:
- `ending = opening + movement` (mengikuti normal balance akun)

Running balance:
- dimulai dari opening balance
- setiap line menambah signed amount sesuai normal balance akun

## Filters
Ledger mendukung filter:
- `account_id` (opsional)
- `start_date`, `end_date` (opsional)
- `department_id` (opsional, pada `journal_entry_lines.department_id`)
- `project_id` (opsional, pada `journal_entry_lines.project_id`)

Catatan:
- Jika filter department/project dipakai, opening balance dan period movement juga difilter dengan dimensi yang sama.
- Jika environment tidak punya kolom department/project, request dengan filter tersebut akan ditolak (tidak diabaikan diam-diam).

## API Endpoint (Phase 7A)
`GET /api/reports/general-ledger`

Middleware:
- `auth:sanctum`
- `company.access` (tenant isolation via `X-Company-ID`)
- `permission:reports.view`

Query params:
- `start_date` (nullable|date)
- `end_date` (nullable|date|after_or_equal:start_date)
- `account_id` (nullable|integer)
- `department_id` (nullable|integer)
- `project_id` (nullable|integer)
- `include_opening_balance` (nullable|boolean, default true)
- `include_zero_balance` (nullable|boolean, default false)
- `sort_by` (nullable|in:journal_date,journal_number,account_code)
- `sort_direction` (nullable|in:asc,desc)

Response (ringkas):
- Jika `account_id` diberikan: detail ledger + lines + running balance.
- Jika `account_id` kosong: summary per account (opening/period/ending).

## Limitations (Phase 7A)
- Trial Balance final belum dibuat (Phase 7C).
- Financial Statements belum dibuat.
- Tidak ada UI.
- Tidak ada export.

## Test commands
```bash
cd backend
php artisan test --filter=GeneralLedgerQueryServiceTest
php artisan test --filter=GeneralLedgerApiTest
php artisan route:list
```

