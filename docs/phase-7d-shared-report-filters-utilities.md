# Phase 7D — Shared Report Filters & Utilities

Phase 7D menambahkan **shared report foundation** agar semua report accounting backend memakai pola yang konsisten untuk:
- Date range filter
- Department/Project dimension filters
- Account type filter (untuk report yang butuh)
- Validasi filter yang konsisten
- Base query rule “reportable journal lines”
- Response metadata standar (export-ready structure, tanpa export di phase ini)

Phase 7D **tidak membuat report baru besar**, **tidak membuat financial statements**, **tidak membuat frontend UI**, dan **tidak membuat export PDF/Excel**.

## Kenapa dibuat
Phase 7A/7B/7C sudah memiliki report query masing-masing. Phase 7D merapikan utilitas bersama untuk:
- mengurangi duplikasi code,
- memudahkan penambahan report berikutnya,
- menyiapkan Phase 8 (Financial Statements basic) agar response & filter konsisten.

## Reportable journal line rule (shared)
Semua report accounting normal membaca journal lines yang:
- `journal_entries.status = posted`
- `journal_entries.is_obsolete = false`

Secara otomatis mengecualikan:
- `void`
- `draft`, `approved`
- `obsolete`

Closed fiscal year tetap **visible** sebagai histori (read-only) karena tidak ada filter yang menyembunyikan data posted pada fiscal year closed.

## Shared DTO
- `ReportDateRange`: menyimpan `start_date`/`end_date`, normalisasi date string, dan helper opening vs period query.
- `ReportDimensionFilter`: menyimpan `department_id`/`project_id`.
- `ReportMeta`, `ReportTotals`, `ReportResponse`: standar response wrapper untuk report.

## Shared services
- `ReportFilterService`
  - normalisasi filter (date/dimensions)
  - validasi date range
  - validasi department/project existence (jika environment support)
  - validasi `account_type`
  - helper build common filters array
- `ReportPeriodResolver`
  - resolve metadata fiscal year untuk response meta jika `FiscalYearService` tersedia
  - tidak mem-block report jika fiscal year service tidak tersedia
- `ReportQueryService`
  - base query reportable journal lines pada tenant DB
  - apply date range (opening vs period)
  - apply dimension filters
  - optional apply account/account_type filters untuk reuse di report services
- `ReportResponseBuilder`
  - membangun response standar: `meta`, `data`, `totals`

## Request concerns
Untuk mengurangi duplikasi rules di FormRequest:
- `HasReportDateFilters`
- `HasReportDimensionFilters`

Jika ada refactor ringan yang aman, report requests dapat memakai concerns ini tanpa mengubah output API.

## Standard response format
Semua report yang memakai `ReportResponseBuilder` dapat mengikuti format:
```json
{
  "meta": {
    "report_name": "trial_balance",
    "generated_at": "2026-05-19T00:00:00.000000Z",
    "filters": {},
    "dimensions": {},
    "fiscal_year": null,
    "notes": []
  },
  "data": {},
  "totals": {}
}
```

## Hubungan dengan Phase 7A/7B/7C
- Phase 7A (General Ledger): bisa reuse `ReportQueryService` + `ReportFilterService` untuk filter & base query.
- Phase 7B (Account Ledger Detail): bisa reuse dimensi/date normalization & response meta.
- Phase 7C (Trial Balance): bisa reuse dimensi/date normalization & response meta.

Phase 7D **tidak** mengubah rule bisnis dari Phase 7A/7B/7C (tetap posted & not obsolete).

## Tests
Phase 7D menambahkan unit tests untuk shared utilities:
- `ReportFilterServiceTest`
- `ReportResponseBuilderTest`

## Commands
Jika environment memungkinkan:
- `php artisan test --filter=ReportFilterServiceTest`
- `php artisan test --filter=ReportResponseBuilderTest`
- optional regression:
  - `php artisan test --filter=GeneralLedgerQueryServiceTest`
  - `php artisan test --filter=AccountLedgerDetailServiceTest`
  - `php artisan test --filter=TrialBalanceServiceTest`

## Batasan scope
- Tidak menambah modul report baru besar.
- Tidak membuat Profit & Loss, Balance Sheet, Cash Flow.
- Tidak membuat PDF/Excel export.
- Tidak membuat frontend UI.

