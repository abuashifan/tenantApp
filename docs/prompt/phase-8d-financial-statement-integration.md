# Phase 8D — Financial Statement Integration & Consistency Tests

Phase 8D menambahkan integrasi antar laporan Phase 8A/8B/8C dan memastikan konsistensi business rules melalui test lintas laporan.

Scope Phase 8D:
- Integrasi Profit & Loss (8A), Balance Sheet (8B), Cash Flow (8C)
- Endpoint ringkasan `financial-summary`
- Cross-report consistency tests
- Update dokumentasi Phase 8

Tidak termasuk:
- Closing wizard / fiscal closing
- Export PDF/Excel
- Frontend UI
- Sales/Purchase/Cash Bank/Inventory modules
- Advanced cash flow classification (operating/investing/financing, direct/indirect method)

## Endpoint
`GET /api/reports/financial-summary`

Middleware:
- `auth:sanctum`
- `company.access`
- `permission:reports.view`

Query params:
- `start_date` (required)
- `end_date` (required)
- `as_of_date` (optional, default = `end_date`)
- `department_id` (optional)
- `project_id` (optional)

Isi ringkasan:
- Profit & Loss: `net_profit_or_loss`
- Balance Sheet: `total_assets`, `total_liabilities`, `total_equity`, `is_balanced`, `current_year_profit_or_loss`
- Cash Flow: `opening_cash_balance`, `cash_in`, `cash_out`, `ending_cash_balance`

## Consistency rules (tested)
- Profit & Loss `net_profit_or_loss` konsisten dengan Balance Sheet `current_year_profit_or_loss` (filter sama).
- Balance Sheet balanced untuk data jurnal yang lengkap.
- Cash Flow `ending_cash_balance` konsisten dengan saldo akun cash/bank pada akhir periode.
- Trial Balance `is_balanced` true untuk jurnal balanced.
- Void/obsolete tidak masuk semua laporan.
- Draft/approved tidak masuk semua laporan.
- Department/project filter konsisten antar PL, BS, CF.

## Tests
- `backend/tests/Feature/Reports/FinancialIntegrationConsistencyTest.php`

## Commands
Jika environment memungkinkan:
- `cd backend`
- `php artisan test --filter=FinancialIntegrationConsistencyTest`
- `php artisan route:list`

