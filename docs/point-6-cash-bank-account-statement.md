# Point 6 - Cash Bank Account Statement

## Endpoint Used

- `GET /api/cash-bank/accounts` loads active cash/bank account options.
- `GET /api/cash-bank/reports/account-statement` loads posted account movements and balances.
- Both endpoints use the existing API client, including `Authorization: Bearer` and `X-Company-ID` headers.

## Frontend Integration

- Route: `/cash-bank/account-statement`
- Page: `frontend-vue/src/pages/cash-bank/CashBankAccountStatementPage.vue`
- Service: `frontend-vue/src/services/cash-bank/cashBankReport.service.ts`
- Sidebar: `Cash & Bank > Account Statement`
- Permission: `cash_bank.view`

## Filter Params

The statement page sends only parameters supported by the backend contract:

| Parameter | Required | Source |
|---|---|---|
| `cash_bank_account_id` | Yes | Selected account |
| `start_date` | No | Start Date filter |
| `end_date` | No | End Date filter |

The response is not paginated. Client-side search filters loaded statement lines by document number, memo, or source reference.

## Page Behavior

- Shows opening balance, period debit/cash in, period credit/cash out, and ending balance returned by the backend.
- Renders posted journal lines with backend-calculated running balance.
- Provides account selection, date range, Apply, Reset, Refresh, and text search.
- Handles loading, empty account/empty movement, validation, forbidden, missing endpoint, expired session, and network failure states.

## Manual QA Checklist

- Sign in, select a company, and open `Cash & Bank > Account Statement`.
- Confirm a user without `cash_bank.view` cannot see or open the page.
- Confirm the account selector loads only active cash/bank accounts.
- Apply a date range and verify summary totals and running balances against posted cash receipt/payment/transfer journals.
- Confirm Reset restores the current-month range and first available account.
- Confirm an empty period displays the empty table state.
- Confirm backend validation errors display when an invalid range/account is sent.
- Confirm existing Cash Bank workspaces and workspace tabs still open normally.

## Known Limitations

- The existing endpoint returns all lines without server-side pagination.
- The report includes posted journal movements only, as defined by backend reporting logic.
- Export and print-specific report actions are outside this point's scope.
