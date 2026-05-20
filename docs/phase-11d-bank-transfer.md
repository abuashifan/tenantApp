# Phase 11D — Bank Transfer

Phase 11D menambahkan backend transaksi **transfer antar cash/bank account**.

## Endpoint

- `GET /api/cash-bank/bank-transfers` (`cash_bank.view`)
- `POST /api/cash-bank/bank-transfers` (`cash_bank.transfer`)
- `GET /api/cash-bank/bank-transfers/{id}` (`cash_bank.view`)
- `PATCH /api/cash-bank/bank-transfers/{id}/post` (`cash_bank.post`)
- `PATCH /api/cash-bank/bank-transfers/{id}/void` (`cash_bank.void`)

Middleware semua endpoint: `auth:sanctum`, `company.access`.

## Posting Rule (Journal)

Saat `post` (MVP):
- Dr `to_cash_bank_account_id` sebesar `amount`.
- Cr `from_cash_bank_account_id` sebesar `amount`.

## Test

```bash
cd backend
php artisan test --filter=BankTransferTest
```

