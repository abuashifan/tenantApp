Kita masuk ke Phase 7A project TenantAppDevelopment.

NAMA PHASE:
Phase 7A — General Ledger Query Foundation

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
- Phase 7A hanya membuat fondasi query General Ledger.
- Phase 7A tidak membuat frontend UI.
- Phase 7A tidak membuat Trial Balance final.
- Phase 7A tidak membuat Financial Statements.
- Phase 7A tidak membuat Sales/Purchase/Cash/Inventory module.
- Phase 7A hanya read/report query, tidak mengubah transaksi.

STATUS SEBELUM PHASE 7A:
Phase 5 sudah selesai:

- chart_of_accounts tenant table
- ChartOfAccount model
- master data COA API
- account_mappings
- products, contacts, units, warehouses

Phase 6 sudah selesai:

- journal_entries tenant table
- journal_entry_lines tenant table
- JournalEntry model
- JournalEntryLine model
- Journal Entry Engine
- manual journal API
- posting journal
- void journal
- status draft/approved/posted/void
- source link fields
- is_obsolete
- permission journal.\*

Phase 6A sudah selesai:

- departments tenant table
- projects tenant table
- Department model
- Project model
- optional department_id/project_id on journal_entry_lines
- department/project validation in journal line
- permission departments/projects

Phase 4K sudah/akan membuat:

- ReportVisibilityService
- rule report hanya mengambil posted dan not obsolete
- void/obsolete tidak masuk laporan normal
- closed fiscal year tetap visible read-only

TUJUAN PHASE 7A:
Membuat fondasi query General Ledger / Buku Besar berdasarkan jurnal yang sudah posted.

Phase 7A harus menghasilkan service/query layer yang bisa:

1. Mengambil journal lines yang reportable
2. Menghitung opening balance sebelum periode filter
3. Menghitung mutasi debit/credit dalam periode
4. Menghitung running balance per akun
5. Mendukung filter account
6. Mendukung filter date range
7. Mendukung filter department/project jika tersedia
8. Mengabaikan journal void
9. Mengabaikan journal obsolete
10. Mengabaikan journal draft/approved
11. Tetap bisa membaca data fiscal year closed sebagai histori read-only

KEPUTUSAN BISNIS WAJIB:

1. General Ledger hanya membaca journal_entries.status = posted.
2. General Ledger harus exclude journal_entries.status = void.
3. General Ledger harus exclude journal_entries.is_obsolete = true.
4. General Ledger tidak membaca draft/approved journal.
5. General Ledger tidak mengubah data.
6. General Ledger harus support closed fiscal year sebagai data historis.
7. Closed fiscal year bukan hidden.
8. Void journal hidden dari report normal.
9. Obsolete journal hidden dari report normal.
10. Opening balance dihitung dari semua posted active journal sebelum start_date.
11. Period mutation dihitung dari posted active journal antara start_date dan end_date.
12. Ending balance = opening balance + movement sesuai normal balance akun.
13. Untuk akun normal debit:
    - balance = debit - credit
14. Untuk akun normal credit:
    - balance = credit - debit
15. Running balance harus mengikuti normal_balance account.
16. Department/project filter berlaku pada journal_entry_lines.
17. Jika filter department/project diberikan, opening balance dan mutation juga harus difilter dengan dimensi yang sama.
18. Jika account_id diberikan, report hanya untuk akun tersebut.
19. Jika account_id tidak diberikan, service boleh return ledger grouped by account atau list accounts summary sesuai method.
20. Phase 7A fokus query foundation, bukan UI.

PENTING UNTUK HEMAT TOKEN CODEX:
Jangan relisting seluruh repository.
Baca hanya file/folder berikut sebelum mulai:

1. Routing:

- backend/routes/api.php

2. Tenant context / middleware:

- backend/bootstrap/app.php
- backend/app/Http/Middleware/EnsureCompanyAccess.php
- backend/app/Http/Middleware/EnsurePermission.php
- backend/app/Services/Tenant/TenantContext.php

3. Journal existing:

- backend/app/Models/Tenant/JournalEntry.php
- backend/app/Models/Tenant/JournalEntryLine.php
- backend/database/migrations/tenant/_journal_
- backend/app/Services/Journal/JournalValidationService.php
- backend/app/Services/Journal/JournalEntryService.php
- backend/app/Http/Controllers/Api/Journal/JournalEntryController.php

4. COA existing:

- backend/app/Models/Tenant/ChartOfAccount.php
- backend/app/Services/MasterData/ChartOfAccountService.php
- backend/database/migrations/tenant/_chart_of_accounts_

5. Analytical dimensions if available:

- backend/app/Models/Tenant/Department.php
- backend/app/Models/Tenant/Project.php
- backend/database/migrations/tenant/_departments_
- backend/database/migrations/tenant/_projects_
- backend/database/migrations/tenant/_journal_entry_lines_

6. Report visibility:

- backend/app/Services/Reports/ReportVisibilityService.php
- backend/config/report_visibility.php

7. API response:

- backend/app/Support/Api/ApiResponseBuilder.php
- backend/app/Support/Api/ApiErrorCode.php
- backend/app/Traits/ApiResponse.php if used

8. Permissions:

- backend/config/permissions.php
- backend/app/Services/Permissions/PermissionService.php

Jangan membaca seluruh backend/app atau seluruh repository kecuali benar-benar perlu.

SCOPE PHASE 7A:
A. Support / DTO:

- LedgerFilter
- LedgerLineData
- LedgerAccountSummaryData optional

B. Services:

- GeneralLedgerQueryService
- LedgerBalanceCalculator
- LedgerFilterValidator

C. Controller:

- GeneralLedgerController

D. Request:

- GeneralLedgerRequest

E. Route:

- GET /api/reports/general-ledger

F. Tests:

- GeneralLedgerQueryServiceTest
- GeneralLedgerApiTest

G. Documentation:

- docs/phase-7a-general-ledger-query-foundation.md

JANGAN MENGERJAKAN:

- Trial Balance final
- Account Ledger UI
- Financial Statements
- PDF export
- Excel export
- Frontend UI
- Dashboard widgets
- Sales report
- Purchase report
- Inventory report
- Cash bank report
- Journal Entry mutation/edit/post logic
- New transaction modules
- Closing wizard
- Public tenant/company management endpoints
- SQLite-specific logic

FILE BARU:

- backend/app/Data/Reports/LedgerFilter.php
- backend/app/Data/Reports/LedgerLineData.php
- backend/app/Data/Reports/LedgerAccountSummaryData.php optional
- backend/app/Services/Reports/GeneralLedgerQueryService.php
- backend/app/Services/Reports/LedgerBalanceCalculator.php
- backend/app/Services/Reports/LedgerFilterValidator.php
- backend/app/Http/Requests/Reports/GeneralLedgerRequest.php
- backend/app/Http/Controllers/Api/Reports/GeneralLedgerController.php
- backend/tests/Feature/Reports/GeneralLedgerApiTest.php
- backend/tests/Unit/Reports/GeneralLedgerQueryServiceTest.php
- docs/phase-7a-general-ledger-query-foundation.md

Jika folder belum ada:

- backend/app/Data/Reports
- backend/app/Http/Requests/Reports
- backend/app/Http/Controllers/Api/Reports
- backend/tests/Feature/Reports
- backend/tests/Unit/Reports

FILE YANG BOLEH DIUBAH:

- backend/routes/api.php
- backend/config/permissions.php jika reports.view belum ada
- backend/app/Models/Tenant/JournalEntry.php hanya jika perlu scope reportable sederhana
- backend/app/Models/Tenant/JournalEntryLine.php hanya jika perlu relations/account/department/project
- docs/phase-6-journal-entry-engine.md jika perlu catatan report source
- docs/phase-6a-analytical-dimensions-foundation.md jika perlu catatan filter report

JANGAN UBAH:

- frontend/\*
- journal migration lama kecuali tidak perlu
- journal posting/edit/void behavior
- master data existing behavior
- company/tenant public management endpoints

LEDGER FILTER DATA:
Buat backend/app/Data/Reports/LedgerFilter.php

Properties:

- ?string $startDate
- ?string $endDate
- ?int $accountId
- ?int $departmentId
- ?int $projectId
- bool $includeOpeningBalance
- bool $includeZeroBalance
- ?string $sortBy
- string $sortDirection

Static:

- fromArray(array $data): self

Methods:

- toArray(): array
- hasDateRange(): bool
- hasAccount(): bool
- hasDepartment(): bool
- hasProject(): bool

Defaults:

- includeOpeningBalance = true
- includeZeroBalance = false
- sortBy = journal_date
- sortDirection = asc

VALIDATION REQUEST:
Buat backend/app/Http/Requests/Reports/GeneralLedgerRequest.php

Rules:

- start_date nullable|date
- end_date nullable|date|after_or_equal:start_date
- account_id nullable|integer
- department_id nullable|integer
- project_id nullable|integer
- include_opening_balance nullable|boolean
- include_zero_balance nullable|boolean
- sort_by nullable|in:journal_date,journal_number,account_code
- sort_direction nullable|in:asc,desc

After validation / service validation:

- account_id must exist in tenant chart_of_accounts if provided
- department_id must exist if table/model exists and value provided
- project_id must exist if table/model exists and value provided

LEDGER BALANCE CALCULATOR:
Buat backend/app/Services/Reports/LedgerBalanceCalculator.php

Methods:

- signedAmount(float|string|int $debit, float|string|int $credit, string $normalBalance): float
- openingBalance(float|string|int $debitTotal, float|string|int $creditTotal, string $normalBalance): float
- endingBalance(float $openingBalance, float|string|int $periodDebit, float|string|int $periodCredit, string $normalBalance): float
- runningBalance(float $currentBalance, float|string|int $debit, float|string|int $credit, string $normalBalance): float

Rules:

- normalBalance debit:
  signed = debit - credit
- normalBalance credit:
  signed = credit - debit
- opening/ending/running follows same rule
- If normalBalance missing/unknown, fallback debit but document or throw. Recommended: throw InvalidArgumentException.

GENERAL LEDGER QUERY SERVICE:
Buat backend/app/Services/Reports/GeneralLedgerQueryService.php

Dependencies:

- LedgerBalanceCalculator
- LedgerFilterValidator
- ReportVisibilityService if available

Methods minimal:

- getLedger(LedgerFilter $filter): array
- getAccountLedger(int $accountId, LedgerFilter $filter): array
- getOpeningBalance(int $accountId, LedgerFilter $filter): array
- getPeriodMovements(int $accountId, LedgerFilter $filter): array
- getLedgerLines(int $accountId, LedgerFilter $filter): array
- baseReportableJournalQuery()
- applyFilters($query, LedgerFilter $filter, bool $forOpening = false)

Core query rule:

- Join journal_entry_lines to journal_entries
- Join chart_of_accounts for account data
- journal_entries.status = posted
- journal_entries.is_obsolete = false
- Exclude void
- Exclude draft/approved
- Do not filter out closed fiscal year data
- Date range:
  - opening balance: journal_date < start_date
  - period lines: journal_date between start_date and end_date
  - if start_date missing, opening balance = 0
  - if end_date missing, use no upper bound or current date? Recommended: no upper bound unless provided.
- account_id filter applies to journal_entry_lines.account_id
- department_id filter applies to journal_entry_lines.department_id if column exists
- project_id filter applies to journal_entry_lines.project_id if column exists

Output getAccountLedger:
[
'account' => [
'id' => ...,
'account_code' => ...,
'account_name' => ...,
'account_type' => ...,
'normal_balance' => ...
],
'filter' => [...],
'opening_balance' => [
'debit' => ...,
'credit' => ...,
'balance' => ...
],
'period_totals' => [
'debit' => ...,
'credit' => ...,
'balance' => ...
],
'ending_balance' => ...,
'lines' => [
[
'journal_entry_id' => ...,
'journal_number' => ...,
'journal_date' => ...,
'description' => ...,
'account_id' => ...,
'debit' => ...,
'credit' => ...,
'running_balance' => ...,
'department_id' => ...,
'department_name' => ... optional,
'project_id' => ...,
'project_name' => ... optional,
'source_type' => ...,
'source_number' => ...,
'source_module' => ...
]
]
]

Output getLedger when no account_id:

- Return grouped accounts summary:
  [
  'filter' => [...],
  'accounts' => [
  [
  'account' => [...],
  'opening_balance' => ...,
  'period_debit' => ...,
  'period_credit' => ...,
  'ending_balance' => ...
  ]
  ]
  ]

Important:

- For Phase 7A, it is acceptable for /general-ledger to require account_id OR return account summaries if account_id missing.
- Prefer support both:
  - with account_id => detail ledger lines
  - without account_id => summary per account
- Trial Balance final remains Phase 7C.

LEDGER FILTER VALIDATOR:
Buat backend/app/Services/Reports/LedgerFilterValidator.php

Methods:

- validate(LedgerFilter $filter): array
- accountExists(?int $accountId): bool
- departmentExists(?int $departmentId): bool
- projectExists(?int $projectId): bool

Return:
[
'valid' => true/false,
'errors' => []
]

Rules:

- account_id if provided must exist
- department_id/project_id if provided must exist only if models/table exist
- if department/project columns do not exist, return error when filter is used
- do not silently ignore department/project filter

CONTROLLER:
Buat backend/app/Http/Controllers/Api/Reports/GeneralLedgerController.php

Method:

- index(GeneralLedgerRequest $request)

Behavior:

1. Build LedgerFilter from validated request.
2. Call GeneralLedgerQueryService->getLedger($filter).
3. Return success response with data.
4. Use ApiResponseBuilder if available.
5. Do not accept company_id from body/query.
6. Tenant context comes from company.access.

ROUTE:
Update backend/routes/api.php

Add import:
use App\Http\Controllers\Api\Reports\GeneralLedgerController;

Add route:
Route::middleware(['auth:sanctum', 'company.access'])
->prefix('reports')
->group(function () {
Route::get('/general-ledger', [GeneralLedgerController::class, 'index'])
->middleware('permission:reports.view');
});

If there is already reports group, add route there.
Do not create public route.
Do not disturb existing master-data/journal routes.

PERMISSION:
Use existing permission:

- reports.view

If reports.view does not exist in config/permissions.php:

- add reports.view
- owner/admin should have it
- finance/accountant should have it
- viewer may have reports.view if current role template allows reports
  Do not create custom role database.

MODEL RELATION UPDATES:
If not already present, update JournalEntryLine:

- account() relation to ChartOfAccount
- journalEntry() relation
- department() relation if Department model exists
- project() relation if Project model exists

If JournalEntry already has lines relation, do not duplicate.

OPTIONAL MODEL SCOPES:
If safe, add to JournalEntry:

- scopePosted($query)
- scopeNotObsolete($query)
- scopeReportable($query) => posted + not obsolete

If existing traits already provide this, do not duplicate conflicting methods.

TESTS:
Buat backend/tests/Unit/Reports/GeneralLedgerQueryServiceTest.php

Test minimal:

1. debit normal account signedAmount debit-credit
2. credit normal account signedAmount credit-debit
3. opening balance before start_date is calculated
4. period debit/credit between start_date/end_date is calculated
5. ending balance is opening + movement according to normal balance
6. running balance increments correctly for debit normal account
7. running balance increments correctly for credit normal account
8. void journal is excluded
9. draft journal is excluded
10. approved journal is excluded
11. obsolete journal is excluded
12. posted not obsolete journal is included
13. department filter applies if department/project available
14. project filter applies if department/project available

Buat backend/tests/Feature/Reports/GeneralLedgerApiTest.php

Test minimal:

1. unauthenticated cannot access general ledger => 401
2. missing X-Company-ID rejected => 422
3. user without reports.view rejected => 403
4. user with reports.view can access general ledger
5. account_id filter returns one account ledger
6. date range filter works
7. void/obsolete journals do not appear
8. closed fiscal year posted journal still appears if date range includes it
9. department/project filter works if Phase 6A exists
10. user cannot access another company tenant ledger

Testing notes:

- Use tenant test setup.
- Create ChartOfAccount records.
- Create JournalEntry posted records and JournalEntryLine records.
- Do not rely only on demo admin@example.com.
- If Phase 6A dimensions not available in local branch, skip department/project tests with clear conditional or document pending.
- Do not create Sales/Purchase modules.

DOCUMENTATION:
Buat docs/phase-7a-general-ledger-query-foundation.md

Isi wajib:

- tujuan Phase 7A
- data source journal_entries/journal_entry_lines
- reportable journal rule
- posted only
- exclude void
- exclude obsolete
- closed fiscal year still visible
- opening balance logic
- period movement logic
- ending balance logic
- running balance logic
- debit normal vs credit normal formula
- filters:
  - account
  - date range
  - department
  - project
- API endpoint GET /api/reports/general-ledger
- response format
- limitations:
  - Trial Balance final belum dibuat
  - Financial Statements belum dibuat
  - frontend UI belum dibuat
  - export belum dibuat
- tests
- notes commit

DOCUMENT FORMULA:
Normal debit account:
balance = debit - credit

Normal credit account:
balance = credit - debit

Opening balance:
sum all posted, not obsolete journal lines before start_date

Period movement:
sum posted, not obsolete journal lines between start_date and end_date

Ending balance:
opening + period movement

COMMAND YANG DIJALANKAN:
Jika environment memungkinkan:

- php artisan test --filter=GeneralLedgerQueryServiceTest
- php artisan test --filter=GeneralLedgerApiTest
- php artisan route:list

Jika environment tidak bisa menjalankan command, tulis jujur di final summary.

ACCEPTANCE CRITERIA:
Phase 7A selesai jika:

1. LedgerFilter dibuat
2. LedgerLineData dibuat
3. LedgerBalanceCalculator dibuat
4. GeneralLedgerQueryService dibuat
5. LedgerFilterValidator dibuat
6. GeneralLedgerRequest dibuat
7. GeneralLedgerController dibuat
8. GET /api/reports/general-ledger route dibuat
9. Route memakai auth:sanctum + company.access + permission:reports.view
10. Query hanya membaca posted journals
11. Query exclude void journals
12. Query exclude obsolete journals
13. Opening balance sebelum start_date dihitung
14. Period debit/credit dihitung
15. Ending balance dihitung
16. Running balance dihitung
17. Account filter bekerja
18. Date range filter bekerja
19. Department/project filter didukung jika Phase 6A tersedia
20. Closed fiscal year posted journal tetap bisa tampil
21. Tests dibuat
22. Dokumentasi dibuat
23. Tidak ada Trial Balance final dibuat
24. Tidak ada Financial Statements dibuat
25. Tidak ada frontend UI dibuat
26. Tidak ada Sales/Purchase/Cash/Inventory dibuat
27. Tidak ada SQLite-specific logic dibuat
28. Tidak ada public tenant/company management endpoint dibuat

FINAL SUMMARY:
Sertakan:

- file dibuat
- file diubah
- endpoint ditambahkan
- services dibuat
- tests dibuat
- command yang berhasil dijalankan
- command yang gagal/tidak bisa dijalankan
- catatan bahwa Phase 7A hanya General Ledger Query Foundation
- catatan bahwa Trial Balance dan Financial Statements belum dibuat
- catatan bahwa report hanya membaca posted and not obsolete journals
- catatan bahwa closed fiscal year tetap visible sebagai histori

COMMIT MESSAGE:
add general ledger query foundation

COMMIT BODY:
Phase 7A: add general ledger query foundation with ledger filters, balance calculator, reportable journal queries, account/date/department/project filters, API endpoint, tests, and documentation. This reads posted non-obsolete journal data for ledger reporting without adding trial balance, financial statements, frontend UI, or transaction modules.
