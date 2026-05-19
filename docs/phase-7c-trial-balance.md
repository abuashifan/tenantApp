# Phase 7C — Trial Balance (Neraca Saldo)

Phase 7C menambahkan **Trial Balance / Neraca Saldo** berbasis jurnal yang sudah **posted** dan **tidak obsolete** di tenant database.

Scope Phase 7C:
- Read/report query only (tidak mengubah transaksi).
- Tidak membuat Financial Statements (P&L / Balance Sheet / Cash Flow).
- Tidak membuat frontend UI.
- Tidak membuat export PDF/Excel.

## Data source (tenant)
Sumber data:
- `journal_entries`
- `journal_entry_lines`
- `chart_of_accounts`
- (jika ada) `departments`, `projects`

## Reportable journal rule
Trial Balance hanya membaca jurnal:
- `journal_entries.status = posted`
- `journal_entries.is_obsolete = false`

Mengecualikan:
- `void`
- `draft`, `approved`
- `obsolete`

Closed fiscal year tetap visible sebagai histori (read-only) karena phase ini tidak menyembunyikan posted journals.

## Formula
Normal debit account:
- `balance = debit - credit`
- balance positif tampil di sisi debit, negatif tampil di sisi credit

Normal credit account:
- `balance = credit - debit`
- balance positif tampil di sisi credit, negatif tampil di sisi debit

Opening:
- sum posted non-obsolete sebelum `start_date` (`journal_date < start_date`)
- jika `start_date` kosong, opening = 0

Period:
- sum posted non-obsolete dalam periode:
  - `journal_date >= start_date` (jika ada)
  - `journal_date <= end_date` (jika ada)

Ending:
- `ending_balance = opening_balance + movement_balance`
- ending debit/credit ditampilkan sesuai aturan normal balance di atas

Balance check:
- `is_balanced = total_ending_debit == total_ending_credit` (tolerance kecil)
- `difference = total_ending_debit - total_ending_credit`

## Filters
- Date range: `start_date`, `end_date`
- `account_type` (asset|liability|equity|revenue|expense)
- `department_id`, `project_id` (berlaku pada `journal_entry_lines`)
- `include_zero_balance` (default false)
- `include_inactive_accounts` (default false)
- Sorting: `sort_by` (account_code|account_name|account_type), `sort_direction` (asc|desc)

Catatan:
- Jika filter department/project dipakai, opening dan period juga terfilter.
- Jika environment tidak mendukung kolom dimensi, filter ditolak (tidak diabaikan diam-diam).

## API Endpoint (Phase 7C)
`GET /api/reports/trial-balance`

Middleware:
- `auth:sanctum`
- `company.access` (tenant isolation via `X-Company-ID`)
- `permission:reports.view`

Response (ringkas):
- `filter`
- `accounts[]` (opening, period, ending per account)
- `totals` (opening/period/ending totals + is_balanced + difference)

## Limitations (Phase 7C)
- Financial Statements belum dibuat.
- Frontend UI belum dibuat.
- Export belum dibuat.

## Test commands
```bash
cd backend
php artisan test --filter=TrialBalanceServiceTest
php artisan test --filter=TrialBalanceApiTest
php artisan route:list
```

