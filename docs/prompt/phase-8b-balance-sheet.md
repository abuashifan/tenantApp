# Phase 8B — Balance Sheet

Phase 8B menambahkan laporan **Balance Sheet / Neraca** berbasis jurnal **posted** pada tenant database.

Scope Phase 8B:
- Read/report only (tidak mengubah transaksi).
- Tidak membuat Cash Flow (ada di Phase 8C).
- Tidak membuat export PDF/Excel.
- Tidak membuat frontend UI besar.
- Tidak membuat Closing Wizard.

## Endpoint
`GET /api/reports/balance-sheet`

Middleware:
- `auth:sanctum`
- `company.access`
- `permission:reports.view`

## Data source (tenant)
- `journal_entries`
- `journal_entry_lines`
- `chart_of_accounts`

## Reportable journal rule
Hanya menghitung journal lines yang:
- `journal_entries.status = posted`
- `journal_entries.is_obsolete = false`

Mengecualikan:
- `void`
- `draft`, `approved`
- `obsolete`

Closed fiscal year tetap **visible** sebagai histori (read-only).

## Filters (required)
Query params:
- `as_of_date` (required, `date`)
- `department_id` (nullable, integer)
- `project_id` (nullable, integer)
- `include_zero_balance` (nullable, boolean, default `false`)
- `include_inactive_accounts` (nullable, boolean, default `false`)
- `group_by` (nullable, `account_type|none`, default `account_type`)

## Business rules
- Mengambil akun dengan `chart_of_accounts.account_type`:
  - `asset`, `liability`, `equity`
- Amount dihitung berdasarkan `normal_balance`:
  - Normal **debit**: `amount = debit - credit`
  - Normal **credit**: `amount = credit - debit`
- Mengambil jurnal sampai `as_of_date` (inclusive).
- Current Year Profit / Loss:
  - dihitung dari akun `revenue` dan `expense` sampai `as_of_date`
  - untuk MVP: cumulative until `as_of_date` (tanpa fiscal year boundary jika belum dipakai)
  - ditampilkan sebagai line system-generated di section equity
- Balance check:
  - `is_balanced = abs(total_assets - (total_liabilities + total_equity)) < 0.01`

## Response (data)
`data` berisi:
- `valid`
- `filter`
- `sections` (asset/liability/equity, atau single section bila `group_by=none`)
- `totals`:
  - `total_assets`
  - `total_liabilities`
  - `total_equity`
  - `total_liabilities_and_equity`
  - `current_year_profit_or_loss`
  - `difference`
  - `is_balanced`

## Tests
- `backend/tests/Feature/Reports/BalanceSheetReportTest.php`

## Commands
Jika environment memungkinkan:
- `cd backend`
- `php artisan test --filter=BalanceSheetReportTest`
- `php artisan route:list`

