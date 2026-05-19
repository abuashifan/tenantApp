# Phase 8A — Profit & Loss Statement

Phase 8A menambahkan laporan **Laba Rugi / Profit & Loss** berbasis jurnal **posted** pada tenant database.

Scope Phase 8A:
- Read/report only (tidak mengubah transaksi).
- Tidak membuat Balance Sheet.
- Tidak membuat Cash Flow.
- Tidak membuat Closing Wizard.
- Tidak membuat export PDF/Excel.
- Tidak membuat frontend UI besar.

## Endpoint
`GET /api/reports/profit-loss`

Middleware:
- `auth:sanctum`
- `company.access`
- `permission:reports.view`

## Data source (tenant)
Membaca:
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

Closed fiscal year tetap **visible** sebagai histori (read-only) karena report tidak menyembunyikan data posted.

## Formula
Menggunakan `normal_balance` akun untuk menghitung saldo period:
- Normal **debit**: `amount = debit - credit`
- Normal **credit**: `amount = credit - debit`

Untuk default COA:
- Revenue umumnya normal **credit**
- Expense umumnya normal **debit**

Net Profit / Loss:
- `net_profit_or_loss = total_revenue - total_expense`
- Jika `net_profit_or_loss > 0`:
  - `net_profit = net_profit_or_loss`
  - `net_loss = 0`
- Jika `net_profit_or_loss < 0`:
  - `net_profit = 0`
  - `net_loss = abs(net_profit_or_loss)`

## Filters (required)
Query params:
- `start_date` (required, `date`)
- `end_date` (required, `date`, `after_or_equal:start_date`)
- `department_id` (nullable, integer)
- `project_id` (nullable, integer)
- `include_zero_balance` (nullable, boolean, default `false`)
- `include_inactive_accounts` (nullable, boolean, default `false`)
- `group_by` (nullable, `account_type|none`, default `account_type`)

Catatan:
- Department/project filter berlaku pada `journal_entry_lines`.
- Account type menggunakan `chart_of_accounts.account_type` dan untuk MVP Phase 8A memakai `revenue` & `expense`.

## Response format (data)
`data` berisi:
- `valid`
- `filter`
- `sections` (minimal: `revenue` dan `expense` ketika `group_by=account_type`)
- `totals` (minimal: `total_revenue`, `total_expense`, `net_profit`, `net_loss`, `net_profit_or_loss`)

## Tests
- `backend/tests/Feature/Reports/ProfitLossReportTest.php`

## Commands
Jika environment memungkinkan:
- `cd backend`
- `php artisan test --filter=ProfitLossReportTest`
- `php artisan route:list`

