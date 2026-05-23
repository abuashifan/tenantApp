# Phase 11C — Cash Out Transaction

Phase 11C menambahkan backend transaksi **Cash Out / pengeluaran kas-bank**.

## Endpoint

- `GET /api/cash-bank/cash-payments` (`cash_bank.view`)
- `POST /api/cash-bank/cash-payments` (`cash_bank.create`)
- `GET /api/cash-bank/cash-payments/{id}` (`cash_bank.view`)
- `PATCH /api/cash-bank/cash-payments/{id}/post` (`cash_bank.post`)
- `PATCH /api/cash-bank/cash-payments/{id}/void` (`cash_bank.void`)

Middleware semua endpoint: `auth:sanctum`, `company.access`.

## Posting Rule (Journal)

Saat `post`:
- Dr per baris `cash_payment_lines.account_id` sebesar `amount`.
- Cr `cash_bank_account_id` sebesar total `amount`.

## Test

```bash
cd backend
php artisan test --filter=CashPaymentTest
```

