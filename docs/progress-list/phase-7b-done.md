# Phase 7B — Done

Status: **completed**

## Scope completed
- Account Ledger Detail endpoint (read-only) untuk 1 account.
- Opening balance, period totals, ending balance, running balance.
- Optional include source info + dimensions.
- Filter: date range + department/project (jika tersedia).
- Tenant isolation via `X-Company-ID`.

## Files created
- `backend/app/Data/Reports/AccountLedgerFilter.php`
- `backend/app/Data/Reports/AccountLedgerLineData.php`
- `backend/app/Services/Reports/AccountLedgerDetailService.php`
- `backend/app/Http/Requests/Reports/AccountLedgerDetailRequest.php`
- `backend/app/Http/Controllers/Api/Reports/AccountLedgerDetailController.php`
- `backend/tests/Unit/Reports/AccountLedgerDetailServiceTest.php`
- `backend/tests/Feature/Reports/AccountLedgerDetailApiTest.php`
- `docs/phase-7b-account-ledger-detail.md`
- `docs/prompt_phase-7b.md`

## Files changed
- `backend/routes/api.php`

## Endpoint added
- `GET /api/reports/account-ledger/{account}` (permission `reports.view`)

## Tests added
- `AccountLedgerDetailServiceTest`
- `AccountLedgerDetailApiTest`

## Commands run
```bash
cd backend
php artisan test --filter=AccountLedgerDetailServiceTest
php artisan test --filter=AccountLedgerDetailApiTest
php artisan route:list
```

## Known limitations
- Trial Balance final belum dibuat (next: Phase 7C).
- Financial Statements belum dibuat.
- Frontend UI belum dibuat.
- Export PDF/Excel belum dibuat.

## Next recommendation
- Phase 7C — Trial Balance

