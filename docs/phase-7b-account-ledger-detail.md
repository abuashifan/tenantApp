# Phase 7B — Account Ledger Detail

Phase 7B menambahkan **Account Ledger Detail**: detail mutasi untuk **satu akun** dalam periode tertentu. Endpoint ini disiapkan agar UI detail akun (future) bisa memakai struktur response yang sudah rapi dan “export-ready”, tanpa membuat export PDF/Excel di phase ini.

## Beda Phase 7A vs 7B
- Phase 7A: fondasi query general ledger (summary per akun atau ledger basic).
- Phase 7B: fokus **detail ledger satu akun**, termasuk running balance per line, source info, dan dimension info.

## Data source (tenant)
Membaca:
- `journal_entries`
- `journal_entry_lines`
- `chart_of_accounts`
- (jika tersedia) `departments`, `projects`

## Reportable rule
Account ledger detail hanya membaca jurnal:
- `journal_entries.status = posted`
- `journal_entries.is_obsolete = false`

Mengecualikan otomatis:
- `void`
- `draft`, `approved`
- `obsolete`

Closed fiscal year tetap visible sebagai histori (read-only) karena phase ini tidak menyembunyikan posted journals.

## Formula
Normal balance:
- Akun normal **debit**: `balance = debit - credit`
- Akun normal **credit**: `balance = credit - debit`

Opening balance:
- Sum posted non-obsolete sebelum `start_date` (`journal_date < start_date`)
- Jika `start_date` kosong, opening balance = 0

Period totals:
- Sum posted non-obsolete dalam periode:
  - `journal_date >= start_date` (jika ada)
  - `journal_date <= end_date` (jika ada)

Ending balance:
- `ending = opening + movement` (mengikuti normal balance akun)

Running balance:
- start dari opening balance
- tiap line menambah signed amount sesuai normal balance akun

## Endpoint (Phase 7B)
`GET /api/reports/account-ledger/{account}`

Middleware:
- `auth:sanctum`
- `company.access` (tenant isolation via `X-Company-ID`)
- `permission:reports.view`

Query params:
- `start_date` (nullable|date)
- `end_date` (nullable|date|after_or_equal:start_date)
- `department_id` (nullable|integer)
- `project_id` (nullable|integer)
- `include_opening_balance` (nullable|boolean, default true)
- `include_zero_balance` (nullable|boolean, default true)
- `include_source_info` (nullable|boolean, default true)
- `include_dimensions` (nullable|boolean, default true)
- `sort_direction` (nullable|in:asc,desc)

## Dimension filters
Jika `department_id` / `project_id` dipakai:
- opening balance dan period totals ikut terfilter dengan dimensi yang sama
- jika environment tidak mendukung kolom dimensi, filter ditolak (tidak diabaikan diam-diam)

## Response format (ringkas)
Response sukses selalu berisi:
- `account`
- `filter`
- `opening_balance`
- `period_totals`
- `ending_balance`
- `lines` (array, bisa kosong)

## Limitations (Phase 7B)
- Trial Balance final belum dibuat.
- Financial Statements belum dibuat.
- Frontend UI belum dibuat.
- Export PDF/Excel belum dibuat.

## Test commands
```bash
cd backend
php artisan test --filter=AccountLedgerDetailServiceTest
php artisan test --filter=AccountLedgerDetailApiTest
php artisan route:list
```

