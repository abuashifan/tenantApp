Kita masuk ke Phase 7D project TenantAppDevelopment.

NAMA PHASE:
Phase 7D — Shared Report Filters & Utilities

KONTEKS PROJECT:
Project ini adalah aplikasi akuntansi multi-tenant dengan stack:
- Backend: Laravel API
- Frontend: Next.js
- Styling: TailwindCSS
- Database development/MVP awal: SQLite
- Production database nanti bisa MySQL / MariaDB / PostgreSQL

ARSITEKTUR TENANT:
- central database = database pusat
- 1 company = 1 tenant database
- user bisa punya akses ke banyak company
- user memilih active company setelah login
- request tenant memakai header X-Company-ID
- company access divalidasi via auth:sanctum + company.access
- TenantContext menyimpan active company dan user_role
- Data jurnal, COA, department, project, dan report source berada di tenant database
- Data antar company tidak boleh dicampur dalam satu tenant database yang sama

PENTING:
- Tetap pertahankan konsep 1 company = 1 tenant database.
- SQLite hanya database development/MVP awal.
- Production nanti bisa MySQL/MariaDB/PostgreSQL.
- Jangan membuat logic yang hanya bergantung pada SQLite.
- Jangan mengubah arsitektur menjadi semua transaksi company dalam satu database transaksi.
- Phase 7D bukan membuat laporan baru besar.
- Phase 7D hanya merapikan shared report utilities agar Phase 7A/7B/7C dan Phase 8 bisa memakai pola filter/response yang konsisten.
- Phase 7D tidak membuat Financial Statements.
- Phase 7D tidak membuat frontend UI.
- Phase 7D tidak membuat export PDF/Excel.
- Phase 7D tidak mengubah transaksi.

STATUS SEBELUM PHASE 7D:
Phase 7A sudah selesai:
- General Ledger Query Foundation
- LedgerFilter
- LedgerLineData
- LedgerBalanceCalculator
- LedgerFilterValidator
- GeneralLedgerQueryService
- GET /api/reports/general-ledger

Phase 7B sudah selesai:
- Account Ledger Detail
- AccountLedgerDetailService
- GET /api/reports/account-ledger/{account}
- account-specific opening balance
- period totals
- running balance
- department/project filters

Phase 7C sudah selesai:
- Trial Balance
- TrialBalanceService
- GET /api/reports/trial-balance
- opening totals
- period debit/credit
- ending debit/credit
- balance check
- department/project filters

TUJUAN PHASE 7D:
Membuat shared report foundation agar semua laporan backend menggunakan standar yang sama untuk:
1. Date range filter
2. Fiscal year/period metadata
3. Department/project filters
4. Account type filters
5. Include zero balance
6. Include inactive accounts
7. Report response metadata
8. Balance formatting/normalization
9. Export-ready structure
10. Consistent validation
11. Consistent reportable journal query rule

Phase 7D akan mengurangi duplikasi logic di Phase 7A/7B/7C dan menyiapkan Phase 8 Financial Statements.

KEPUTUSAN BISNIS WAJIB:
1. Semua laporan accounting harus membaca posted journals dan not obsolete.
2. Semua laporan normal exclude void.
3. Closed fiscal year tetap visible sebagai histori.
4. Report tidak mengubah data.
5. Department/project filter harus konsisten antar report.
6. Date range harus konsisten antar report.
7. Response metadata harus konsisten agar frontend mudah consume.
8. Export-ready structure disiapkan, tapi export PDF/Excel belum dibuat.
9. Phase 7D tidak boleh membuat Profit and Loss, Balance Sheet, Cash Flow.
10. Phase 7D tidak boleh membuat frontend UI.

SCOPE PHASE 7D:
A. Shared Data/DTO:
- ReportDateRange
- ReportDimensionFilter
- ReportMeta
- ReportTotals
- ReportResponse

B. Shared Services:
- ReportFilterService
- ReportPeriodResolver
- ReportQueryService
- ReportResponseBuilder

C. Shared Request trait/helper:
- HasReportDateFilters
- HasReportDimensionFilters

E. Tests:
- ReportFilterServiceTest
- ReportResponseBuilderTest

F. Documentation:
- docs/phase-7d-shared-report-filters-utilities.md

G. Prompt and progress docs:
- Save this prompt to docs/prompt_phase-7d.md
- Create/update docs/progress-list/phase-7d-done.md after implementation

FILE BARU:
- backend/app/Data/Reports/ReportDateRange.php
- backend/app/Data/Reports/ReportDimensionFilter.php
- backend/app/Data/Reports/ReportMeta.php
- backend/app/Data/Reports/ReportTotals.php
- backend/app/Data/Reports/ReportResponse.php
- backend/app/Services/Reports/ReportFilterService.php
- backend/app/Services/Reports/ReportPeriodResolver.php
- backend/app/Services/Reports/ReportQueryService.php
- backend/app/Services/Reports/ReportResponseBuilder.php
- backend/app/Http/Requests/Concerns/HasReportDateFilters.php
- backend/app/Http/Requests/Concerns/HasReportDimensionFilters.php
- backend/tests/Unit/Reports/ReportFilterServiceTest.php
- backend/tests/Unit/Reports/ReportResponseBuilderTest.php
- docs/phase-7d-shared-report-filters-utilities.md
- docs/prompt_phase-7d.md
- docs/progress-list/phase-7d-done.md

COMMAND YANG DIJALANKAN:
Jika environment memungkinkan:
- php artisan test --filter=ReportFilterServiceTest
- php artisan test --filter=ReportResponseBuilderTest
- php artisan test --filter=GeneralLedgerQueryServiceTest
- php artisan test --filter=AccountLedgerDetailServiceTest
- php artisan test --filter=TrialBalanceServiceTest
- php artisan route:list

COMMIT DAN PUSH:
Setelah semua perubahan selesai dan test yang memungkinkan dijalankan:
1. git status
2. git add backend docs
3. git commit -m "add shared report utilities" -m "<commit body>"
4. git push

