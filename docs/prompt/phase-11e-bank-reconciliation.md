# Phase 11E — Bank Reconciliation Foundation

Phase 11E menambahkan foundation **bank reconciliation** berbasis per cash/bank account.

## Tenant tables

- `bank_reconciliations`
- `bank_reconciliation_lines`

`bank_reconciliation_lines` diisi dari jurnal posted yang menyentuh cash/bank account dalam rentang statement.

## Endpoints

Semua endpoint memakai middleware `auth:sanctum`, `company.access`.

- `GET /api/cash-bank/bank-reconciliations` (`cash_bank.view`)
- `POST /api/cash-bank/bank-reconciliations` (`cash_bank.create`)
- `GET /api/cash-bank/bank-reconciliations/{id}` (`cash_bank.view`)
- `PATCH /api/cash-bank/bank-reconciliations/{id}` (`cash_bank.edit`)
- `POST /api/cash-bank/bank-reconciliations/{id}/refresh-lines` (`cash_bank.edit`)
- `POST /api/cash-bank/bank-reconciliations/{id}/mark-lines` (`cash_bank.edit`)

## Notes

- Phase 11E masih foundation: belum ada import statement / bank feed / matching canggih.
- Reconciliation lines di-generate dari jurnal posted, not obsolete (konsisten dengan reporting rule).

## Test

```bash
cd backend
php artisan test --filter=BankReconciliationTest
```

