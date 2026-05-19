# Phase 7C — Done

Status: **completed**

## Scope completed
- Trial Balance (opening, period, ending) per account.
- Balance check (is_balanced + difference).
- Filters: date range, account_type, include_zero_balance, include_inactive_accounts, department/project.
- Tenant isolation via `X-Company-ID`.

## Files created
- `backend/app/Data/Reports/TrialBalanceFilter.php`
- `backend/app/Data/Reports/TrialBalanceAccountData.php`
- `backend/app/Services/Reports/TrialBalanceCalculator.php`
- `backend/app/Services/Reports/TrialBalanceService.php`
- `backend/app/Http/Requests/Reports/TrialBalanceRequest.php`
- `backend/app/Http/Controllers/Api/Reports/TrialBalanceController.php`
- `backend/tests/Unit/Reports/TrialBalanceServiceTest.php`
- `backend/tests/Feature/Reports/TrialBalanceApiTest.php`
- `docs/phase-7c-trial-balance.md`
- `docs/prompt_phase-7c.md`

## Files changed
- `backend/routes/api.php`

## Endpoint added
- `GET /api/reports/trial-balance` (permission `reports.view`)

## Tests added
- `TrialBalanceServiceTest`
- `TrialBalanceApiTest`

## Commands run
```bash
cd backend
php artisan test --filter=TrialBalanceServiceTest
php artisan test --filter=TrialBalanceApiTest
php artisan route:list
```

## Known limitations
- Financial Statements belum dibuat.
- Frontend UI belum dibuat.
- Export PDF/Excel belum dibuat.

