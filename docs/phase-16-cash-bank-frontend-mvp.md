# Phase 16 — Cash Bank Frontend MVP

Phase 16 adds a tenant-aware and permission-aware Cash Bank frontend that consumes the existing Phase 11 Cash Bank backend. It does not add backend endpoints or accounting logic.

## Routes

- `/cash-bank`
- `/cash-bank/cash-in`
- `/cash-bank/cash-in/create`
- `/cash-bank/cash-in/{id}`
- `/cash-bank/cash-out`
- `/cash-bank/cash-out/create`
- `/cash-bank/cash-out/{id}`
- `/cash-bank/transfers`
- `/cash-bank/transfers/create`
- `/cash-bank/transfers/{id}`
- `/cash-bank/reconciliation`
- `/cash-bank/reconciliation/create`
- `/cash-bank/reconciliation/{id}`
- `/cash-bank/reports`

## API Dependencies

- `/api/cash-bank/accounts`
- `/api/cash-bank/cash-receipts`
- `/api/cash-bank/cash-payments`
- `/api/cash-bank/bank-transfers`
- `/api/cash-bank/bank-reconciliations`
- `/api/cash-bank/reports/account-statement`

## Permissions

- `cash_bank.view`
- `cash_bank.create`
- `cash_bank.edit`
- `cash_bank.transfer`
- `cash_bank.post`
- `cash_bank.void`

## Implemented Flow

- Cash In/Cash Out list, create, detail, post, and void.
- Bank Transfer list, create, detail, post, and void.
- Basic Bank Reconciliation list, create, detail, refresh lines, and line toggle.
- Cash Bank Reports account statement browser view.

## Known Limitations

- No backend changes.
- No PDF/Excel export.
- No bank statement import, OCR, bank feed integration, or advanced auto matching.
- Reconciliation detail actions depend on backend line availability.

## Manual Testing Checklist

- Open each Cash Bank route with an active company.
- Confirm permission-aware menu/action behavior.
- Confirm create forms validate account/date/amount.
- Confirm backend validation and period lock errors remain visible.

## Commands

```bash
cd frontend
npm run lint
npm run build
```
