# Phase 11B — Cash In Transaction

Phase 11B menambahkan backend transaksi **Cash In / penerimaan kas-bank** sebagai transaksi generik cash/bank (bukan UI).

## Endpoint

- `GET /api/cash-bank/cash-receipts`
  - Middleware: `auth:sanctum`, `company.access`, `permission:cash_bank.view`
- `POST /api/cash-bank/cash-receipts`
  - Middleware: `auth:sanctum`, `company.access`, `permission:cash_bank.create`
- `GET /api/cash-bank/cash-receipts/{id}`
  - Middleware: `auth:sanctum`, `company.access`, `permission:cash_bank.view`
- `PATCH /api/cash-bank/cash-receipts/{id}/post`
  - Middleware: `auth:sanctum`, `company.access`, `permission:cash_bank.post`
- `PATCH /api/cash-bank/cash-receipts/{id}/void`
  - Middleware: `auth:sanctum`, `company.access`, `permission:cash_bank.void`

## Data Source (Tenant DB)

- `cash_receipts`
- `cash_receipt_lines`
- `journal_entries` dan `journal_entry_lines` (saat posting)
- `chart_of_accounts` (cash/bank marker memakai `is_cash_bank`)

## Posting Rule (Journal)

Saat `post`:
- Membuat `journal_entries` status `posted` dan `is_system_generated = true`.
- Journal lines:
  - Dr `cash_bank_account_id` sebesar total `amount`.
  - Cr per baris `cash_receipt_lines.account_id` sebesar `cash_receipt_lines.amount`.

## Notes

- Phase 11B fokus foundation Cash In. Cash Out dan transfer disiapkan di subphase berikutnya.
- Phase 11 tetap backend-first (frontend cash/bank masuk Phase 16).

## Test

```bash
cd backend
php artisan test --filter=CashReceiptTest
php artisan route:list | grep cash-bank
```

