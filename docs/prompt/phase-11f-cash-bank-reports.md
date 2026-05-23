# Phase 11F — Cash Bank Reports

Phase 11F menambahkan laporan cash/bank backend berbasis jurnal posted.

## Endpoint

Semua endpoint memakai middleware `auth:sanctum`, `company.access`.

- `GET /api/cash-bank/reports/account-statement`
  - Permission: `cash_bank.view`
  - Query:
    - `cash_bank_account_id` (required)
    - `start_date` (optional)
    - `end_date` (optional)

## Output (ringkas)

- `opening_balance` (sebelum `start_date`, jika ada)
- `period_totals` (debit/credit dalam periode)
- `ending_balance`
- `lines[]` dengan running balance

## Notes

- Rules konsisten: hanya jurnal `posted` dan `is_obsolete=false`.
- Phase 11F belum membuat export PDF/Excel dan belum ada UI.

## Test

```bash
cd backend
php artisan test --filter=CashBankAccountStatementTest
```

