Kita masuk ke Phase 4F project TenantAppDevelopment.

NAMA PHASE:
Phase 4F — Fiscal Year, Period Lock & Transaction Date Guard Foundation

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
- Data transaksi antar company tidak boleh dicampur dalam satu tenant database yang sama

PENTING:
- Tetap pertahankan konsep 1 company = 1 tenant database.
- Jangan mengubah arsitektur menjadi semua transaksi company dalam satu database transaksi.
- SQLite hanya database development/MVP awal.
- Jangan hardcode logic khusus SQLite.
- Production nanti bisa tetap database-per-company menggunakan MySQL/MariaDB/PostgreSQL.
- Phase 4F tidak membuat invoice, journal, purchase, cash bank, inventory, atau COA.
- Phase 4F hanya membuat fondasi fiscal year, accounting periods, period lock, annual closing gate, dan transaction date guard.

STATUS SEBELUM PHASE 4F:
Phase 4A sudah/akan membuat:
- company_accounting_settings
- company_module_settings
- CompanySettingService
- setting allow_backdated_transactions
- setting max_backdate_days
- setting allow_future_transactions
- setting max_future_days
- setting block_outside_current_fiscal_year
- setting date_warning_enabled
- setting transaction_workflow_mode
- setting auto_post_transactions

Phase 4B sudah/akan membuat:
- config/permissions.php granular
- PermissionService
- EnsurePermission middleware
- GET /api/auth/permissions

Phase 4C sudah/akan membuat:
- config/transaction_lifecycle.php
- TransactionStatus
- TransactionLifecycle
- HasTransactionLifecycle
- lifecycle rule:
  - draft/approved/posted/void
  - posted editable secara lifecycle
  - void terminal/read-only
  - void hidden by default
  - closed fiscal year membuat transaksi read-only secara policy

Phase 4D sudah/akan membuat:
- TransactionPolicyService
- TransactionPolicyResult
- TransactionDateGuard contract placeholder
- TransactionPolicyService memakai date guard placeholder

Phase 4E sudah/akan membuat:
- TransactionDependencyService
- DependencyCheckResult
- checker placeholder per module
- TransactionPolicyService memakai dependency service

TUJUAN PHASE 4F:
Membuat fondasi fiscal year, accounting period, period lock, annual closing gate, dan transaction date guard agar modul transaksi nanti aman dari salah tanggal dan tidak bisa mengubah data tahun buku yang sudah ditutup.

Phase ini belum membuat closing wizard penuh.
Phase ini belum membuat jurnal penutup.
Phase ini belum membuat opening journal.
Closing wizard dan implementasi tutup buku penuh nanti ada di Phase 8A.

KEPUTUSAN BISNIS WAJIB:
1. Reminder closing hanya untuk tutup buku tahunan/fiscal year.
2. Tidak ada reminder closing bulanan.
3. Tidak ada blocking transaksi bulanan.
4. Accounting period bulanan boleh ada untuk filter/report/struktur periode, tapi tidak boleh memaksa closing bulanan.
5. Entry fiscal year baru harus diblok jika fiscal year sebelumnya belum closed.
6. Setelah fiscal year closed, semua transaksi dalam fiscal year tersebut tetap bisa diakses tetapi read-only.
7. Transaksi fiscal year closed tetap visible untuk histori/laporan.
8. Transaksi fiscal year closed tidak bisa edit.
9. Transaksi fiscal year closed tidak bisa void.
10. Transaksi fiscal year closed tidak bisa approve/post ulang.
11. Jika ada koreksi setelah fiscal year closed, user harus membuat jurnal koreksi di fiscal year berjalan, bukan mengubah transaksi lama.
12. Date guard harus block tanggal di luar active fiscal year jika setting block_outside_current_fiscal_year true.
13. max_backdate_days null = tidak dibatasi selama masih dalam active fiscal year open.
14. max_future_days null = tidak dibatasi selama masih dalam active fiscal year open.
15. Tanggal future atau beda periode dalam active fiscal year boleh menghasilkan warning jika date_warning_enabled true.
16. Warning bukan block, tetapi nanti frontend harus minta konfirmasi user.
17. Phase 4F cukup membuat mekanisme warning result; UI modal konfirmasi nanti di frontend phase.
18. Tutup buku tetap dalam tenant database yang sama.
19. Tidak membuat database baru saat closing.
20. Jangan membuat archive database logic.

CONTOH DATE GUARD:
Active fiscal year: 2026
Fiscal year 2026 status: open

Input 17 Mei 2026:
- allowed

Input 17 Mei 2025:
- blocked karena di luar active fiscal year

Input 17 Mei 2027:
- blocked karena di luar active fiscal year

Input 17 Juni 2026:
- allowed with warning jika date_warning_enabled true dan dianggap future/different period

Fiscal year 2026 status closed:
- semua transaksi 2026 read-only
- edit/void/post/approve blocked

Fiscal year 2026 belum closed, user input tanggal 2027:
- blocked karena fiscal year sebelumnya belum closed / outside active fiscal year

REVIEW DAN PERBAIKAN PHASE SEBELUMNYA:
Sebelum mengerjakan Phase 4F, cek hasil Phase 4A sampai 4E.

Jika Phase 4A belum punya field:
- block_outside_current_fiscal_year
- date_warning_enabled

Maka:
- Buat migration tambahan baru.
- Jangan edit migration lama yang sudah pernah dijalankan.
- Update CompanyAccountingSetting model fillable/casts.
- Update UpdateCompanyAccountingSettingRequest validation jika ada.
- Update CompanySettingService default/serialization jika perlu.
- Update docs Phase 4A.

Jika Phase 4D sudah punya TransactionDateGuard contract:
- Gunakan contract tersebut.
- Jangan membuat contract duplikat dengan namespace/nama berbeda.
- Implementasikan DateGuard service sesuai contract Phase 4D jika memungkinkan.
- Jika contract terlalu sederhana, perluas secara backward-compatible.

Jika Phase 4D menggunakan NoopTransactionDateGuard:
- Ganti binding/service agar memakai TransactionDateGuardService dari Phase 4F.
- Jangan refactor besar.

Jika TransactionPolicyService dari Phase 4D sudah ada:
- Integrasikan TransactionDateGuardService agar canCreate/canEdit/canVoid/canApprove/canPost memakai date guard.
- Jangan membuat policy service baru dengan nama berbeda.

Jika Phase 4C docs belum menyebut annual closing only:
- Update docs Phase 4C secara minimal.
- Pastikan tertulis:
  - tidak ada monthly closing reminder
  - tidak ada monthly transaction blocking
  - closing reminder hanya annual/fiscal year
  - closed fiscal year read-only

SCOPE YANG HARUS DIKERJAKAN:
1. Buat migration central untuk fiscal_years.
2. Buat migration central untuk accounting_periods.
3. Buat model FiscalYear.
4. Buat model AccountingPeriod.
5. Tambahkan relasi ke Company model.
6. Buat FiscalYearService.
7. Buat PeriodLockService.
8. Buat TransactionDateGuardService.
9. Buat AnnualClosingGateService.
10. Integrasikan TransactionDateGuardService ke TransactionPolicyService jika Phase 4D ada.
11. Buat controller/endpoint minimal untuk membaca fiscal year status jika aman dan diperlukan.
12. Buat tests.
13. Buat dokumentasi docs/phase-4f-fiscal-year-period-lock-date-guard.md.

CATATAN TENTANG LOKASI DATABASE:
Fiscal year dan accounting periods sebaiknya disimpan di central database karena:
- terkait company metadata
- perlu dicek sebelum/di awal request
- berlaku untuk active company
- bisa dibaca tanpa harus menjalankan query transaksi tenant

Namun data transaksi tetap di tenant database masing-masing company.

JANGAN MENGERJAKAN:
- closing wizard UI
- closing journal
- opening journal
- financial statement
- general ledger
- trial balance
- sales invoice
- purchase invoice
- journal entry
- stock movement
- chart of accounts
- actual transaction table migration
- report
- frontend UI
- monthly closing reminder
- monthly transaction blocking
- archive database
- SQLite-specific archive logic
- create tenant endpoint
- migrate tenant endpoint
- assign user endpoint public
- create company endpoint public

FILE BARU:
- backend/database/migrations/central/xxxx_xx_xx_xxxxxx_create_fiscal_years_table.php
- backend/database/migrations/central/xxxx_xx_xx_xxxxxx_create_accounting_periods_table.php
- backend/app/Models/FiscalYear.php
- backend/app/Models/AccountingPeriod.php
- backend/app/Services/Accounting/FiscalYearService.php
- backend/app/Services/Accounting/PeriodLockService.php
- backend/app/Services/Accounting/AnnualClosingGateService.php
- backend/app/Services/Transactions/TransactionDateGuardService.php
- backend/tests/Feature/Accounting/FiscalYearDateGuardTest.php
- docs/phase-4f-fiscal-year-period-lock-date-guard.md

FILE YANG MUNGKIN DIBUAT JIKA BELUM ADA:
- backend/app/Contracts/Transactions/TransactionDateGuard.php
  Hanya jika Phase 4D belum membuatnya.

FILE YANG BOLEH DIUBAH:
- backend/app/Models/Company.php
- backend/app/Models/CompanyAccountingSetting.php jika field Phase 4A tambahan dibuat
- backend/app/Http/Requests/Settings/UpdateCompanyAccountingSettingRequest.php jika field Phase 4A tambahan dibuat
- backend/app/Services/Settings/CompanySettingService.php jika perlu default field baru
- backend/app/Services/Transactions/TransactionPolicyService.php untuk integrasi date guard
- backend/app/Providers/AppServiceProvider.php jika perlu binding
- backend/routes/api.php jika menambahkan endpoint status fiscal year minimal
- docs/phase-4a-company-settings-foundation.md
- docs/phase-4c-transaction-lifecycle-standard.md
- docs/phase-4d-transaction-policy-service.md

FILE YANG JANGAN DIUBAH:
- frontend/*
- endpoint public company/tenant management
- tenant migration module yang tidak terkait
- migration transaksi nyata
- journal/invoice/purchase/inventory module

MIGRATION: fiscal_years
Buat table fiscal_years di central database.

Fields:
- id
- company_id
- year integer
- start_date date
- end_date date
- status string default open
- is_active boolean default false
- closing_required_at timestamp nullable
- closing_started_at timestamp nullable
- closed_at timestamp nullable
- closed_by foreignId nullable references users.id
- metadata json/text nullable
- timestamps

Indexes/constraints:
- company_id index
- company_id + year unique
- company_id + is_active index
- foreign company_id references companies.id cascadeOnDelete jika style project mendukung

Status allowed:
- open
- closing_required
- closing_in_progress
- closed

Catatan:
- is_active true hanya boleh satu per company secara logic service.
- SQLite mungkin tidak mendukung partial unique dengan mudah, jadi enforce di service untuk MVP.

MIGRATION: accounting_periods
Buat table accounting_periods di central database.

Fields:
- id
- company_id
- fiscal_year_id
- period_year integer
- period_month integer
- start_date date
- end_date date
- status string default open
- closed_at timestamp nullable
- closed_by foreignId nullable references users.id
- metadata json/text nullable
- timestamps

Indexes/constraints:
- company_id index
- fiscal_year_id index
- company_id + period_year + period_month unique
- foreign company_id references companies.id cascadeOnDelete jika style project mendukung
- foreign fiscal_year_id references fiscal_years.id cascadeOnDelete jika style project mendukung

Status allowed:
- open
- closed

PENTING:
- Accounting periods tidak digunakan untuk monthly reminder.
- Accounting periods tidak digunakan untuk monthly transaction blocking.
- Accounting periods dipakai untuk:
  - filter/report
  - mengetahui periode transaksi
  - read-only jika period closed
  - struktur fiscal year
- Untuk MVP, closing gate hanya annual/fiscal year.

MODEL: FiscalYear
Buat backend/app/Models/FiscalYear.php

Fillable:
- company_id
- year
- start_date
- end_date
- status
- is_active
- closing_required_at
- closing_started_at
- closed_at
- closed_by
- metadata

Casts:
- start_date date
- end_date date
- is_active boolean
- closing_required_at datetime
- closing_started_at datetime
- closed_at datetime
- metadata array/json jika supported

Relations:
- company()
- periods()
- closedBy()

Helpers:
- isOpen()
- isClosingRequired()
- isClosingInProgress()
- isClosed()
- containsDate($date)

MODEL: AccountingPeriod
Buat backend/app/Models/AccountingPeriod.php

Fillable:
- company_id
- fiscal_year_id
- period_year
- period_month
- start_date
- end_date
- status
- closed_at
- closed_by
- metadata

Casts:
- start_date date
- end_date date
- closed_at datetime
- metadata array/json jika supported

Relations:
- company()
- fiscalYear()
- closedBy()

Helpers:
- isOpen()
- isClosed()
- containsDate($date)

COMPANY RELATIONS:
Tambahkan di Company model:
- fiscalYears()
- activeFiscalYear()
- accountingPeriods()

Jika relasi activeFiscalYear dengan where is_active true terlalu kompleks untuk SQLite, boleh buat method sederhana:
- fiscalYears()->where('is_active', true)

FISCAL YEAR SERVICE:
Buat backend/app/Services/Accounting/FiscalYearService.php

Responsibilities:
- get active fiscal year untuk company
- create fiscal year jika belum ada
- create monthly periods untuk fiscal year
- determine fiscal year by date
- check if date inside active fiscal year
- mark fiscal year as closing_required
- mark fiscal year as closing_in_progress
- mark fiscal year as closed
- enforce only one active fiscal year per company
- block creation of next fiscal year transaction if previous fiscal year not closed

Methods minimal:
- getActiveFiscalYear(Company $company): ?FiscalYear
- getOrCreateActiveFiscalYear(Company $company, ?int $year = null): FiscalYear
- createFiscalYear(Company $company, int $year, ?string $startDate = null, ?string $endDate = null): FiscalYear
- createPeriodsForFiscalYear(FiscalYear $fiscalYear): void
- fiscalYearForDate(Company $company, string $date): ?FiscalYear
- isDateInsideActiveFiscalYear(Company $company, string $date): bool
- markClosingRequired(FiscalYear $fiscalYear): FiscalYear
- markClosingInProgress(FiscalYear $fiscalYear): FiscalYear
- closeFiscalYear(FiscalYear $fiscalYear, ?int $userId = null): FiscalYear
- canStartNextFiscalYear(Company $company): bool

Default fiscal year:
- year = current year
- start_date = YYYY-01-01
- end_date = YYYY-12-31

Catatan:
- Custom fiscal year start month bisa nanti.
- Untuk Phase 4F, gunakan Jan-Dec default.
- Jangan over-engineer custom fiscal year dahulu, tapi struktur mendukung start_date/end_date.

PERIOD LOCK SERVICE:
Buat backend/app/Services/Accounting/PeriodLockService.php

Responsibilities:
- cek apakah tanggal berada dalam fiscal year closed
- cek apakah tanggal berada dalam accounting period closed
- return read-only/blocking result

Methods minimal:
- isFiscalYearClosed(Company $company, string $date): bool
- isPeriodClosed(Company $company, string $date): bool
- isDateReadOnly(Company $company, string $date): bool
- blockingReasonForDate(Company $company, string $date): ?string

Rules:
- Jika fiscal year closed => read-only/block
- Jika accounting period closed => read-only/block
- Period closed tidak harus berarti monthly reminder.
- Period closed hanya berarti data di periode itu read-only.

ANNUAL CLOSING GATE SERVICE:
Buat backend/app/Services/Accounting/AnnualClosingGateService.php

Responsibilities:
- menentukan apakah annual closing reminder diperlukan
- menentukan apakah entry fiscal year baru harus diblok
- tidak melakukan monthly reminder/blocking

Methods minimal:
- closingRequired(Company $company, ?string $currentDate = null): bool
- blockingFiscalYear(Company $company, ?string $transactionDate = null): ?FiscalYear
- canEnterDate(Company $company, string $transactionDate): bool
- blockingReason(Company $company, string $transactionDate): ?string

Rules:
- Jika transactionDate berada di fiscal year setelah active fiscal year dan active fiscal year belum closed => block.
- Jika current date sudah melewati active fiscal year end_date dan active fiscal year belum closed => closing reminder required.
- Reminder hanya annual/fiscal year.
- Jangan generate reminder bulanan.
- Jangan block transaksi bulan baru dalam fiscal year yang sama.
- Jika transactionDate masih dalam active fiscal year open => allowed, kecuali period/fiscal year closed.

Contoh:
Active fiscal year 2026 open:
- transactionDate 2026-06-10 => allowed
- transactionDate 2027-01-01 => blocked
- currentDate 2027-01-02 => closingRequired true untuk fiscal year 2026

Active fiscal year 2026 closed:
- transactionDate 2026-05-10 => blocked/read-only
- new fiscal year 2027 can be active/created

TRANSACTION DATE GUARD SERVICE:
Buat backend/app/Services/Transactions/TransactionDateGuardService.php

Jika Contract TransactionDateGuard sudah ada dari Phase 4D, implementasikan contract tersebut.

Method sesuai contract:
- check(?string $transactionDate, string $action, string $module): TransactionPolicyResult

Jika butuh company:
- Ambil active company dari TenantContext.
- Jangan ambil company_id dari request body.
- Jika TenantContext belum tersedia dalam unit test, izinkan injection company optional atau buat method tambahan:
  - checkForCompany(Company $company, ?string $transactionDate, string $action, string $module): TransactionPolicyResult

Rules:
1. Jika transactionDate null:
   - return allow, karena beberapa action view mungkin tidak perlu date.
   - Untuk create/edit/post actual module nanti boleh require date di request validation module.

2. Jika tanggal tidak valid:
   - deny code TRANSACTION_DATE_INVALID.

3. Jika date berada dalam fiscal year closed:
   - deny code FISCAL_YEAR_CLOSED.
   - message: "Fiscal year is closed. Transaction is read-only."

4. Jika date berada dalam accounting period closed:
   - deny code ACCOUNTING_PERIOD_CLOSED.
   - message: "Accounting period is closed. Transaction is read-only."

5. Jika block_outside_current_fiscal_year true dan date di luar active fiscal year:
   - deny code TRANSACTION_DATE_OUTSIDE_ACTIVE_FISCAL_YEAR.
   - message: "Transaction date is outside the active fiscal year."

6. Jika date masuk next fiscal year sementara active fiscal year belum closed:
   - deny code PREVIOUS_FISCAL_YEAR_NOT_CLOSED.
   - message: "Previous fiscal year must be closed before entering transactions in the next fiscal year."

7. Jika allow_backdated_transactions false dan date < today:
   - deny code BACKDATED_TRANSACTION_NOT_ALLOWED.

8. Jika max_backdate_days tidak null dan date mundur lebih dari max_backdate_days:
   - deny code BACKDATED_TRANSACTION_TOO_FAR.

9. Jika allow_future_transactions false dan date > today:
   - deny code FUTURE_TRANSACTION_NOT_ALLOWED.

10. Jika max_future_days tidak null dan date maju lebih dari max_future_days:
   - deny code FUTURE_TRANSACTION_TOO_FAR.

11. Jika date_warning_enabled true dan date > today tapi masih allowed:
   - return warning code FUTURE_TRANSACTION_DATE_WARNING.

12. Jika date_warning_enabled true dan date beda bulan/periode dari today tapi masih dalam active fiscal year:
   - return warning code DIFFERENT_PERIOD_DATE_WARNING.

13. Jika semua lolos:
   - return allow.

PENTING:
- Warning bukan deny.
- TransactionPolicyService harus bisa meneruskan warning result ke caller.
- Frontend nanti akan meminta konfirmasi user jika warning.
- Phase 4F tidak membuat frontend modal.

ERROR/WARNING CODES:
Gunakan code:
- TRANSACTION_DATE_INVALID
- FISCAL_YEAR_CLOSED
- ACCOUNTING_PERIOD_CLOSED
- TRANSACTION_DATE_OUTSIDE_ACTIVE_FISCAL_YEAR
- PREVIOUS_FISCAL_YEAR_NOT_CLOSED
- BACKDATED_TRANSACTION_NOT_ALLOWED
- BACKDATED_TRANSACTION_TOO_FAR
- FUTURE_TRANSACTION_NOT_ALLOWED
- FUTURE_TRANSACTION_TOO_FAR
- FUTURE_TRANSACTION_DATE_WARNING
- DIFFERENT_PERIOD_DATE_WARNING

INTEGRASI KE TRANSACTION POLICY SERVICE:
Jika TransactionPolicyService sudah ada:
- canCreate harus memakai TransactionDateGuardService jika transactionDate diberikan.
- canEdit harus memakai transaction_date dari transaction jika ada.
- canVoid harus memakai transaction_date dari transaction jika ada.
- canApprove harus memakai transaction_date jika ada.
- canPost harus memakai transaction_date jika ada.

Jika DateGuard result warning:
- TransactionPolicyService return warning result, bukan allow biasa.

Jika DateGuard result deny:
- TransactionPolicyService return deny.

Jika DateGuard allow:
- policy lanjut/allow.

CONTROLLER/ENDPOINT MINIMAL:
Phase 4F boleh menambahkan endpoint minimal untuk status fiscal year dan closing reminder jika scope aman.

Tambahkan:
GET /api/accounting/fiscal-year/status

Middleware:
- auth:sanctum
- company.access

Permission:
- dashboard.view atau reports.view
- Jika permission middleware tersedia, gunakan dashboard.view.
- Jika belum stabil, minimal auth:sanctum + company.access.

Response contoh:
{
  "success": true,
  "message": "Fiscal year status retrieved successfully",
  "data": {
    "active_fiscal_year": {
      "year": 2026,
      "start_date": "2026-01-01",
      "end_date": "2026-12-31",
      "status": "open",
      "is_active": true
    },
    "closing_required": false,
    "annual_closing_only": true,
    "monthly_closing_reminder": false
  }
}

Jika current date sudah melewati end_date active fiscal year dan fiscal year belum closed:
closing_required true.

JANGAN membuat endpoint:
- POST close fiscal year
- POST generate closing journal
- POST opening balance
- POST closing wizard
Itu Phase 8A.

Jika menambah endpoint, buat:
- backend/app/Http/Controllers/Api/Accounting/FiscalYearStatusController.php

Jika kamu menilai endpoint belum perlu, boleh tidak dibuat, tetapi dokumentasikan. Namun lebih baik dibuat karena dashboard nanti butuh reminder tahunan.

ROUTES:
Jika endpoint dibuat:
GET /api/accounting/fiscal-year/status

Middleware:
- auth:sanctum
- company.access
- permission:dashboard.view jika permission middleware stabil

Jangan buat route lain.

TEST:
Buat backend/tests/Feature/Accounting/FiscalYearDateGuardTest.php

Test minimal:
1. getOrCreateActiveFiscalYear creates Jan-Dec fiscal year
2. createPeriodsForFiscalYear creates 12 accounting periods
3. date inside active fiscal year is allowed
4. date before active fiscal year is blocked
5. date after active fiscal year is blocked
6. null max_backdate_days allows backdate inside active fiscal year
7. null max_future_days allows future date inside active fiscal year
8. future date inside active fiscal year returns warning when date_warning_enabled true
9. different period inside active fiscal year returns warning when date_warning_enabled true
10. closed fiscal year date is blocked/read-only
11. closed accounting period date is blocked/read-only
12. next fiscal year date is blocked if active fiscal year not closed
13. annual closing gate requires closing after fiscal year end date
14. annual closing gate does not require closing monthly
15. TransactionPolicyService canCreate returns date warning if guard warning and service exists
16. TransactionPolicyService canEdit denies if transaction date is in closed fiscal year and service exists

Testing notes:
- Gunakan factories/model existing jika tersedia.
- Jangan membuat transaction table.
- Untuk transaction object gunakan array:
  ['status' => 'posted', 'transaction_date' => '2026-05-17']
- Jika test butuh Company/User, buat data central minimal.
- Jangan bergantung pada data demo admin@example.com saja.

DOKUMENTASI:
Buat docs/phase-4f-fiscal-year-period-lock-date-guard.md

Isi:
- tujuan Phase 4F
- fiscal year foundation
- accounting period foundation
- annual closing only
- tidak ada monthly closing reminder
- tidak ada monthly transaction blocking
- fiscal year status
- accounting period status
- read-only fiscal year closed
- transaction date guard rules
- max_backdate_days null behavior
- max_future_days null behavior
- block outside active fiscal year
- warning future date/different period
- entry next fiscal year blocked until previous fiscal year closed
- hubungan dengan Phase 4D TransactionPolicyService
- hubungan dengan Phase 8A Closing Wizard
- endpoint fiscal year status jika dibuat
- batasan scope
- command test
- notes commit

Jelaskan:
- Closing wizard penuh tidak dibuat di Phase 4F.
- Jurnal penutup tidak dibuat di Phase 4F.
- Opening balance tidak dibuat di Phase 4F.
- Phase 4F hanya gate/date guard/fiscal year foundation.
- Tutup buku tetap dalam tenant database yang sama.
- Tidak membuat database baru saat closing.

COMMAND YANG DIJALANKAN:
Jika environment memungkinkan:
- php artisan migrate
- php artisan test --filter=FiscalYearDateGuardTest
- php artisan test --filter=TransactionPolicyServiceTest
- php artisan route:list

Jika environment tidak bisa menjalankan command, tulis jujur di final summary.

ACCEPTANCE CRITERIA:
Phase 4F selesai jika:
1. fiscal_years migration dibuat
2. accounting_periods migration dibuat
3. FiscalYear model dibuat
4. AccountingPeriod model dibuat
5. Company relations ditambahkan
6. FiscalYearService dibuat
7. PeriodLockService dibuat
8. AnnualClosingGateService dibuat
9. TransactionDateGuardService dibuat
10. Date guard block tanggal luar active fiscal year
11. Date guard block closed fiscal year
12. Date guard block closed accounting period
13. Date guard warning future date dalam active fiscal year
14. Date guard warning different period dalam active fiscal year
15. max_backdate_days null berarti tidak dibatasi selama fiscal year open
16. max_future_days null berarti tidak dibatasi selama fiscal year open
17. Annual closing gate hanya tahunan
18. Tidak ada monthly closing reminder
19. Tidak ada monthly transaction blocking
20. Next fiscal year entry diblok jika previous/active fiscal year belum closed
21. TransactionPolicyService terintegrasi dengan TransactionDateGuardService jika Phase 4D ada
22. Endpoint GET /api/accounting/fiscal-year/status dibuat atau alasan tidak dibuat didokumentasikan
23. Tests dibuat
24. Dokumentasi Phase 4F dibuat
25. Tidak ada closing journal dibuat
26. Tidak ada opening journal dibuat
27. Tidak ada closing wizard dibuat
28. Tidak ada modul transaksi nyata dibuat
29. Tidak ada frontend dibuat
30. Tidak ada SQLite-specific archive/database split logic dibuat

FINAL SUMMARY:
Sertakan:
- file dibuat
- file diubah
- migration dibuat
- endpoint ditambahkan jika ada
- integration ke TransactionPolicyService jika dilakukan
- test yang dibuat
- command yang berhasil dijalankan
- command yang gagal/tidak bisa dijalankan
- catatan bahwa Phase 4F hanya fiscal year/date guard foundation
- catatan bahwa closing wizard dan jurnal penutup akan dibuat di Phase 8A
- catatan bahwa reminder hanya tahunan, bukan bulanan
- catatan bahwa tidak ada monthly transaction blocking
- catatan bahwa tenant tetap 1 company = 1 tenant database dan tidak bergantung pada SQLite

COMMIT MESSAGE:
add fiscal year date guard foundation

COMMIT BODY:
Phase 4F: add fiscal year, accounting period, period lock, annual closing gate, and transaction date guard foundation with services, tests, and documentation. This enforces read-only closed fiscal years, blocks dates outside the active fiscal year, supports warning results for future/different-period dates, and avoids monthly closing reminders or monthly transaction blocking.