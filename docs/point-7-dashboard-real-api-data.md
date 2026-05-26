# Point 7 - Dashboard Real API Data

## Placeholder Root Cause

`frontend-vue/src/pages/dashboard/DashboardWorkspaceContent.vue` sebelumnya hanya merender teks pengantar dan tiga metric statis `Rp 0`; tidak ada request API untuk data dashboard.

## Endpoints Used

- `GET /api/accounting/fiscal-year/status`
  - Permission: `dashboard.view`
  - Provides active fiscal year, date range, closing status, and annual closing reminder.
- `GET /api/reports/financial-summary`
  - Permission: `reports.view`
  - Provides net profit/loss, balance sheet totals/status, and cash flow summary.

Requests use the existing API client, including `Authorization: Bearer` and `X-Company-ID` headers.

## Frontend Integration

- Route retained: `/dashboard`
- Page updated: `frontend-vue/src/pages/dashboard/DashboardWorkspaceContent.vue`
- Service added: `frontend-vue/src/services/dashboard.service.ts`

The service builds report parameters only from the active fiscal year response:

| Parameter | Value |
|---|---|
| `start_date` | Active fiscal year `start_date` |
| `end_date` | Active fiscal year `end_date` |
| `as_of_date` | Active fiscal year `end_date` |

## Displayed Data

- Active company name from the selected company store.
- Active fiscal year and reporting date range.
- Fiscal year status and closing-required warning.
- Net profit/loss.
- Total assets, liabilities, and equity.
- Cash in, cash out, and ending cash balance.
- Balanced/unbalanced balance sheet health status.

Financial metric cards appear only after the financial summary endpoint returns data. A backend-provided zero remains visible as a valid report value; no placeholder values are generated.

## Permission And Failure Behavior

- Dashboard users always load fiscal status through the existing `dashboard.view` route guard.
- Financial summary is requested only when the user has `reports.view`.
- If financial summary is not permitted or fails, fiscal status remains usable and the report health area explains why metrics are unavailable.
- Handles loading, expired session, forbidden response, validation response, network errors, and missing fiscal/report-period data.

## Manual QA Checklist

- Open `/dashboard` after login and company selection; confirm the company name and fiscal status are populated from API data.
- As a user with `reports.view`, verify metric values match `/reports/financial-summary` for the active fiscal year date range.
- Confirm the balanced/unbalanced badge reflects the backend response.
- Confirm a closed or closing-required fiscal year shows a warning.
- As a user without `reports.view`, confirm fiscal status still renders and no financial cards are shown.
- Trigger Refresh and confirm both sections are reloaded.
- Confirm reports pages, sidebar navigation, and virtual tabs are unchanged.

## Known Limitations

- The dashboard intentionally uses only the existing financial summary and fiscal status endpoints; it does not add charts, aging widgets, drilldowns, or new backend analytics.
- The financial summary response does not expose a separate transaction-count flag, so valid zero balances returned by the backend are displayed as report values rather than inferred as an empty ledger.
