# Phase 8C — Simple Cash Flow Statement

Phase 8C menambahkan laporan **Simple Cash Flow** (MVP) berbasis akun kas/bank pada tenant database.

Scope Phase 8C:
- Read/report only (tidak mengubah transaksi).
- Tidak membuat klasifikasi operating/investing/financing.
- Tidak membuat direct/indirect method.
- Tidak membuat export PDF/Excel.
- Tidak membuat frontend UI besar.
- Tidak membuat modul transaksi cash bank.

## Endpoint
`GET /api/reports/cash-flow`

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

## Cash/bank account marker
Menggunakan:
- `chart_of_accounts.is_cash_bank = true`

## Filters (required)
Query params:
- `start_date` (required, `date`)
- `end_date` (required, `date`, `after_or_equal:start_date`)
- `department_id` (nullable, integer)
- `project_id` (nullable, integer)
- `include_account_breakdown` (nullable, boolean, default `true`)

## Business rules
Simple cash flow dihitung dari akun kas/bank:
- Opening Cash Balance:
  - saldo akun kas/bank sebelum `start_date`
- Cash In / Cash Out / Net Cash Flow dalam periode
- Ending Cash Balance:
  - `opening + net_cash_flow`

Untuk akun normal **debit** (umum untuk kas/bank):
- `cash_in += debit`
- `cash_out += credit`
- `net = debit - credit`

Untuk akun normal **credit**:
- `cash_in += credit`
- `cash_out += debit`
- `net = credit - debit`

## Response (data)
`data` berisi:
- `valid`
- `filter`
- `summary`:
  - `opening_cash_balance`
  - `cash_in`
  - `cash_out`
  - `net_cash_flow`
  - `ending_cash_balance`
- `accounts` (opsional, tergantung `include_account_breakdown`)

## Tests
- `backend/tests/Feature/Reports/CashFlowReportTest.php`

## Commands
Jika environment memungkinkan:
- `cd backend`
- `php artisan test --filter=CashFlowReportTest`
- `php artisan route:list`

