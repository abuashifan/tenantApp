# Phase 7D — Shared Report Filters & Utilities (DONE)

Status: **completed**

## Scope completed
- Shared report DTO: date range, dimension filter, meta, totals, response wrapper.
- Shared report services: filter normalization/validation, fiscal year resolver (graceful), base reportable journal lines query helpers, response builder.
- Request concerns untuk mengurangi duplikasi rules.
- Unit tests untuk shared utilities.
- Dokumentasi Phase 7D.
- Update catatan singkat pada docs Phase 7A/7B/7C terkait standardisasi di Phase 7D.

## Files created
- `backend/app/Data/Reports/ReportDateRange.php`
- `backend/app/Data/Reports/ReportDimensionFilter.php`
- `backend/app/Data/Reports/ReportMeta.php`
- `backend/app/Data/Reports/ReportTotals.php`
- `backend/app/Data/Reports/ReportResponse.php`
- `backend/app/Services/Reports/ReportFilterService.php`
- `backend/app/Services/Reports/ReportPeriodResolver.php`
- `backend/app/Services/Reports/ReportQueryService.php`
- `backend/app/Services/Reports/ReportResponseBuilder.php`
- `backend/app/Http/Requests/Concerns/HasReportDateFilters.php`
- `backend/app/Http/Requests/Concerns/HasReportDimensionFilters.php`
- `backend/tests/Unit/Reports/ReportFilterServiceTest.php`
- `backend/tests/Unit/Reports/ReportResponseBuilderTest.php`
- `docs/phase-7d-shared-report-filters-utilities.md`
- `docs/prompt_phase-7d.md`
- `docs/progress-list/phase-7d-done.md`

## Files changed
- `backend/app/Http/Requests/Reports/GeneralLedgerRequest.php` (reuse concerns)
- `backend/app/Http/Requests/Reports/AccountLedgerDetailRequest.php` (reuse concerns)
- `backend/app/Http/Requests/Reports/TrialBalanceRequest.php` (reuse concerns)
- `backend/app/Services/Reports/ReportQueryService.php` (date filter DB-agnostic)
- `docs/phase-7a-general-ledger-query-foundation.md` (note Phase 7D)
- `docs/phase-7b-account-ledger-detail.md` (note Phase 7D)
- `docs/phase-7c-trial-balance.md` (note Phase 7D)

## Commands run
- `php artisan test --filter=ReportFilterServiceTest` (passed)
- `php artisan test --filter=ReportResponseBuilderTest` (passed)
- `php artisan test --filter=GeneralLedgerQueryServiceTest` (passed)
- `php artisan test --filter=AccountLedgerDetailServiceTest` (passed)
- `php artisan test --filter=TrialBalanceServiceTest` (passed)
- `php artisan route:list` (ok)

## Known limitations
- Phase 7D tidak menambah report baru dan tidak mengubah response shape existing reports secara paksa.
- Export PDF/Excel belum dibuat (hanya struktur response/meta “export-ready”).
- Financial Statements belum dibuat (Phase 8).

## Next phase recommendation
- Phase 8 — Financial Statements Basic

