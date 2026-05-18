Kita masuk ke Phase 4G project TenantAppDevelopment.

NAMA PHASE:
Phase 4G — Document Numbering Foundation

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

PENTING TENTANG DATABASE:
- Tetap pertahankan konsep 1 company = 1 tenant database.
- SQLite hanya database development/MVP awal.
- Production nanti bisa MySQL/MariaDB/PostgreSQL.
- Jangan membuat logic yang hanya bergantung pada SQLite.
- Jangan mengubah arsitektur menjadi semua transaksi company dalam satu database transaksi.
- Phase 4G tidak membuat invoice, journal, purchase, cash bank, inventory, atau COA.
- Phase 4G hanya membuat fondasi nomor dokumen.

STATUS SEBELUM PHASE 4G:
Phase 4A sudah/akan membuat:
- company_accounting_settings
- company_module_settings
- CompanySettingService
- setting transaction_workflow_mode
- setting auto_post_transactions
- setting allow_edit_transactions
- setting allow_edit_posted_transactions
- setting allow_void_transactions
- setting hide_voided_transactions
- setting require_void_reason
- setting block_outside_current_fiscal_year
- setting date_warning_enabled

Phase 4B sudah/akan membuat:
- config/permissions.php granular
- PermissionService
- EnsurePermission middleware
- permission seperti settings.company.view, settings.company.edit, journal.create, sales.create, purchase.create, cash_bank.create, inventory.manage, reports.view

Phase 4C sudah/akan membuat:
- config/transaction_lifecycle.php
- TransactionStatus
- TransactionLifecycle
- HasTransactionLifecycle
- lifecycle draft/approved/posted/void
- void hidden by default
- posted editable secara lifecycle
- void terminal/read-only
- report normal exclude void/obsolete

Phase 4D sudah/akan membuat:
- TransactionAction
- TransactionModule
- TransactionPolicyResult
- TransactionPolicyService
- dependency/date guard placeholder

Phase 4E sudah/akan membuat:
- TransactionDependencyService
- DependencyCheckResult
- checker placeholder per module

Phase 4F sudah/akan membuat:
- fiscal_years
- accounting_periods
- FiscalYearService
- PeriodLockService
- AnnualClosingGateService
- TransactionDateGuardService
- active fiscal year
- fiscal year closed read-only
- date guard block outside active fiscal year
- annual closing only, not monthly

TUJUAN PHASE 4G:
Membuat fondasi nomor dokumen otomatis dan konsisten untuk semua modul transaksi nanti:
- journal entry
- sales invoice
- purchase invoice
- cash receipt
- cash payment
- bank transfer
- stock adjustment
- stock movement
- stock opname
- opening balance
- closing entry

Phase ini hanya membuat:
- document numbering config
- document numbering settings
- document number sequence
- DocumentNumberService
- default setting generator
- validation manual number
- preview number
- tests
- documentation

Phase ini TIDAK membuat transaksi nyata seperti invoice/journal/purchase/cash bank/inventory.

KEPUTUSAN BISNIS WAJIB:
1. Nomor dokumen berlaku per company.
2. Default reset nomor adalah per fiscal year.
3. Format default adalah:
   {PREFIX}-{YEAR}-{NUMBER}
   Contoh:
   SI-2026-000001
   JV-2026-000001
   PI-2026-000001
4. Nomor dibuat saat transaksi pertama kali disimpan.
5. Nomor tidak boleh dipakai ulang walaupun transaksi void.
6. Edit transaksi tidak mengubah nomor dokumen.
7. Edit transaksi hanya menaikkan revision_no, bukan membuat nomor baru.
8. Manual number boleh disiapkan, tetapi default mode adalah auto.
9. Duplicate document number tidak boleh secara default.
10. Sequence/counter dipisah dari setting format.
11. Numbering harus fiscal-year aware.
12. Nomor harus mengikuti document_date / transaction_date, bukan tanggal input.
13. Jika fiscal year untuk tanggal dokumen closed, date guard nanti menolak transaksi sebelum nomor dibuat.
14. DocumentNumberService tidak boleh bergantung khusus SQLite.
15. Generate nomor harus transaction-safe sebisa mungkin.
16. Preview nomor tidak boleh dianggap final karena user lain bisa menyimpan duluan.
17. Phase 4G tidak membuat UI.
18. Phase 4G tidak membuat endpoint transaksi.
19. Phase 4G tidak membuat modul akuntansi.

REVIEW DAN PERBAIKAN PHASE SEBELUMNYA:
Sebelum mengerjakan Phase 4G, cek hasil Phase 4A sampai 4F.

Jika Phase 4F belum memiliki FiscalYearService:
- Jangan membuat ulang dengan nama berbeda jika service sudah ada.
- Jika belum ada, DocumentNumberService boleh memakai fallback year dari document_date.
- Dokumentasikan bahwa integrasi penuh fiscal year menunggu Phase 4F.

Jika TransactionModule dari Phase 4D sudah ada:
- Gunakan constants dari TransactionModule jika relevan.
- Jangan membuat class module duplikat dengan makna berbeda.
- Tetapi document type tidak harus sama 100% dengan transaction module.
  Contoh:
  module sales punya document_type sales_invoice.
  module cash_bank punya document_type cash_receipt, cash_payment, bank_transfer.

Jika Phase 4A belum memiliki company settings untuk numbering:
- Jangan taruh semua numbering di company_accounting_settings.
- Buat tabel khusus document_numbering_settings dan document_number_sequences di Phase 4G.
- Jangan membuat field numbering besar di company_accounting_settings.

Jika migration lama sudah pernah dijalankan:
- Jangan edit migration lama.
- Buat migration baru.

SCOPE YANG HARUS DIKERJAKAN:
1. Buat config document_numbers.php.
2. Buat migration document_numbering_settings.
3. Buat migration document_number_sequences.
4. Buat model DocumentNumberingSetting.
5. Buat model DocumentNumberSequence.
6. Tambahkan relasi di Company model.
7. Buat Support class DocumentType.
8. Buat Support class DocumentNumberFormat.
9. Buat DocumentNumberService.
10. Buat default numbering settings per company.
11. Buat method generate nomor dokumen.
12. Buat method preview nomor dokumen.
13. Buat method validate manual number.
14. Buat method reserve/increment sequence secara transaction-safe.
15. Buat tests.
16. Buat dokumentasi docs/phase-4g-document-numbering-foundation.md.

JANGAN MENGERJAKAN:
- sales invoice table
- purchase invoice table
- journal entry table
- cash bank transaction table
- stock movement table
- chart of accounts
- actual transaction create endpoint
- frontend UI
- document numbering settings UI
- fiscal closing wizard
- closing journal generation
- opening balance journal generation
- report
- create company endpoint public
- create tenant endpoint public
- migrate tenant endpoint public
- assign user endpoint public
- archive database
- SQLite-specific archive logic
- custom role UI
- permission override UI

LOKASI DATABASE:
Tabel document_numbering_settings dan document_number_sequences disimpan di central database.

Alasan:
- Ini setting/metadata per company.
- Bisa dibaca sebelum koneksi tenant penuh.
- Berlaku untuk company aktif.
- Sequence per company dan fiscal year bisa dikelola dari central.
- Data transaksi tetap di tenant database.

Catatan:
- Walaupun nomor dokumen metadata ada di central, dokumen transaksi tetap disimpan di tenant database.
- Nomor yang dihasilkan dipakai oleh transaksi di tenant database.

FILE BARU:
- backend/config/document_numbers.php
- backend/database/migrations/central/xxxx_xx_xx_xxxxxx_create_document_numbering_settings_table.php
- backend/database/migrations/central/xxxx_xx_xx_xxxxxx_create_document_number_sequences_table.php
- backend/app/Models/DocumentNumberingSetting.php
- backend/app/Models/DocumentNumberSequence.php
- backend/app/Support/DocumentNumbering/DocumentType.php
- backend/app/Support/DocumentNumbering/DocumentNumberFormat.php
- backend/app/Services/DocumentNumbering/DocumentNumberService.php
- backend/tests/Feature/DocumentNumbering/DocumentNumberServiceTest.php
- docs/phase-4g-document-numbering-foundation.md

Jika folder belum ada, buat:
- backend/app/Support/DocumentNumbering
- backend/app/Services/DocumentNumbering
- backend/tests/Feature/DocumentNumbering

FILE YANG BOLEH DIUBAH:
- backend/app/Models/Company.php
- backend/app/Services/Accounting/FiscalYearService.php hanya jika butuh method kecil dan aman
- docs/phase-4f-fiscal-year-period-lock-date-guard.md jika perlu catatan numbering fiscal-year aware

JANGAN UBAH:
- frontend/*
- backend/routes/api.php kecuali tidak perlu; Phase 4G tidak wajib endpoint baru
- migration transaksi nyata
- endpoint tenant/company management public
- journal/invoice/purchase/inventory module

CONFIG document_numbers.php:
Buat backend/config/document_numbers.php

Isi minimal:

return [
    'default_format' => '{PREFIX}-{YEAR}-{NUMBER}',

    'default_reset_period' => 'fiscal_year',

    'default_padding' => 6,

    'default_mode' => 'auto',

    'allow_manual_number_default' => false,

    'allow_duplicate_number_default' => false,

    'document_types' => [
        'journal_entry' => [
            'prefix' => 'JV',
            'name' => 'Journal Entry',
        ],
        'sales_invoice' => [
            'prefix' => 'SI',
            'name' => 'Sales Invoice',
        ],
        'purchase_invoice' => [
            'prefix' => 'PI',
            'name' => 'Purchase Invoice',
        ],
        'cash_receipt' => [
            'prefix' => 'CR',
            'name' => 'Cash Receipt',
        ],
        'cash_payment' => [
            'prefix' => 'CP',
            'name' => 'Cash Payment',
        ],
        'bank_transfer' => [
            'prefix' => 'BT',
            'name' => 'Bank Transfer',
        ],
        'stock_adjustment' => [
            'prefix' => 'SA',
            'name' => 'Stock Adjustment',
        ],
        'stock_movement' => [
            'prefix' => 'SM',
            'name' => 'Stock Movement',
        ],
        'stock_opname' => [
            'prefix' => 'SO',
            'name' => 'Stock Opname',
        ],
        'opening_balance' => [
            'prefix' => 'OB',
            'name' => 'Opening Balance',
        ],
        'closing_entry' => [
            'prefix' => 'CL',
            'name' => 'Closing Entry',
        ],
    ],
];

DOCUMENT TYPES:
Buat backend/app/Support/DocumentNumbering/DocumentType.php

Constants:
- JOURNAL_ENTRY = 'journal_entry'
- SALES_INVOICE = 'sales_invoice'
- PURCHASE_INVOICE = 'purchase_invoice'
- CASH_RECEIPT = 'cash_receipt'
- CASH_PAYMENT = 'cash_payment'
- BANK_TRANSFER = 'bank_transfer'
- STOCK_ADJUSTMENT = 'stock_adjustment'
- STOCK_MOVEMENT = 'stock_movement'
- STOCK_OPNAME = 'stock_opname'
- OPENING_BALANCE = 'opening_balance'
- CLOSING_ENTRY = 'closing_entry'

Methods:
- all(): array
- exists(string $documentType): bool
- defaultPrefix(string $documentType): ?string

MIGRATION: document_numbering_settings
Buat tabel document_numbering_settings di central database.

Fields:
- id
- company_id
- document_type string
- name string nullable
- prefix string
- format string default {PREFIX}-{YEAR}-{NUMBER}
- reset_period string default fiscal_year
- padding unsignedTinyInteger default 6
- mode string default auto
- allow_manual_number boolean default false
- allow_duplicate_number boolean default false
- is_active boolean default true
- metadata json/text nullable
- timestamps

Indexes/constraints:
- company_id index
- company_id + document_type unique
- foreign company_id references companies.id cascadeOnDelete jika style project mendukung

Allowed reset_period:
- never
- fiscal_year
- monthly

Default:
- fiscal_year

Allowed mode:
- auto
- manual

Default:
- auto

Catatan:
- monthly disiapkan untuk future, tapi default fiscal_year.
- allow_duplicate_number default false.
- allow_duplicate_number sebaiknya tidak true untuk transaksi accounting.

MIGRATION: document_number_sequences
Buat tabel document_number_sequences di central database.

Fields:
- id
- company_id
- document_type string
- fiscal_year_id nullable
- period_key string
- last_number unsignedBigInteger default 0
- metadata json/text nullable
- timestamps

Indexes/constraints:
- company_id index
- document_type index
- fiscal_year_id index nullable
- company_id + document_type + period_key unique
- foreign company_id references companies.id cascadeOnDelete jika style project mendukung
- foreign fiscal_year_id references fiscal_years.id nullOnDelete jika fiscal_years table exists and style supports it

period_key examples:
- reset fiscal_year: 2026
- reset monthly: 2026-05
- reset never: all

Catatan:
- fiscal_year_id nullable agar service tetap bisa jalan jika Phase 4F belum lengkap.
- Jika fiscal_year_id tersedia, isi.
- Jika tidak, gunakan year dari document_date.

MODEL: DocumentNumberingSetting
Buat backend/app/Models/DocumentNumberingSetting.php

Fillable:
- company_id
- document_type
- name
- prefix
- format
- reset_period
- padding
- mode
- allow_manual_number
- allow_duplicate_number
- is_active
- metadata

Casts:
- padding integer
- allow_manual_number boolean
- allow_duplicate_number boolean
- is_active boolean
- metadata array/json jika supported

Relations:
- company()

Helpers:
- isAuto(): bool
- isManual(): bool
- allowsManualNumber(): bool
- allowsDuplicateNumber(): bool

MODEL: DocumentNumberSequence
Buat backend/app/Models/DocumentNumberSequence.php

Fillable:
- company_id
- document_type
- fiscal_year_id
- period_key
- last_number
- metadata

Casts:
- last_number integer
- metadata array/json jika supported

Relations:
- company()
- fiscalYear() jika FiscalYear model exists

COMPANY RELATIONS:
Tambahkan di Company model:
- documentNumberingSettings()
- documentNumberSequences()

DOCUMENT NUMBER FORMAT:
Buat backend/app/Support/DocumentNumbering/DocumentNumberFormat.php

Responsibilities:
- format number berdasarkan template
- support placeholders:
  - {PREFIX}
  - {YEAR}
  - {MONTH}
  - {NUMBER}
  - {DOCUMENT_TYPE}

Methods:
- format(string $format, array $tokens): string
- padNumber(int $number, int $padding): string

Example:
format:
{PREFIX}-{YEAR}-{NUMBER}

tokens:
PREFIX = SI
YEAR = 2026
NUMBER = 000001

result:
SI-2026-000001

DOCUMENT NUMBER SERVICE:
Buat backend/app/Services/DocumentNumbering/DocumentNumberService.php

Dependencies:
- FiscalYearService jika tersedia
- TenantContext jika dibutuhkan active company
- DB facade untuk transaction
- DocumentNumberFormat

Methods minimal:
- getOrCreateSetting(Company $company, string $documentType): DocumentNumberingSetting
- ensureDefaultSettings(Company $company): void
- generate(Company $company, string $documentType, string $documentDate): string
- preview(Company $company, string $documentType, string $documentDate): string
- validateManualNumber(Company $company, string $documentType, string $documentNumber): bool
- nextSequence(Company $company, string $documentType, string $documentDate, bool $increment = true): int
- periodKeyFor(DocumentNumberingSetting $setting, string $documentDate, ?FiscalYear $fiscalYear = null): string
- fiscalYearForDate(Company $company, string $documentDate): ?FiscalYear

Behavior:
1. getOrCreateSetting:
   - Jika setting document type belum ada untuk company, buat dari config default.
   - Jika document type tidak dikenal, throw InvalidArgumentException atau return error jelas.

2. ensureDefaultSettings:
   - Buat default setting untuk semua document_types di config.
   - Jangan duplicate jika sudah ada.

3. generate:
   - Ambil setting.
   - Jika setting inactive, boleh throw exception.
   - Ambil fiscal year berdasarkan documentDate jika FiscalYearService tersedia.
   - Tentukan period_key berdasarkan reset_period.
   - Dalam DB transaction:
     - ambil sequence row atau buat jika belum ada
     - lock row jika database support
     - increment last_number
     - format document number
     - return string
   - Jangan reuse nomor.
   - Jangan decrement nomor jika transaksi nanti void.

4. preview:
   - Sama seperti generate tapi tidak increment last_number.
   - Harus diberi catatan di docs bahwa preview tidak final.

5. validateManualNumber:
   - Untuk Phase 4G belum ada tabel transaksi nyata untuk cek duplicate.
   - Jadi validasi manual number hanya:
     - cek setting allow_manual_number
     - cek allow_duplicate_number
     - menyediakan hook/placeholder untuk module nanti
   - Return true jika manual number diizinkan dan duplicate check belum tersedia.
   - Dokumentasikan bahwa saat modul transaksi dibuat, duplicate check harus dilakukan di tabel transaksi module.
   - Jika allow_manual_number false, return false.
   - Jika allow_duplicate_number false, service harus menyediakan method placeholder assertManualNumberAvailable().
   - Jangan membuat query ke tabel transaksi yang belum ada.

6. periodKeyFor:
   - reset never => all
   - reset fiscal_year => fiscal year year jika ada, else year(documentDate)
   - reset monthly => YYYY-MM

7. fiscalYearForDate:
   - Jika FiscalYearService ada, gunakan.
   - Jika tidak ada, fallback year dari documentDate.
   - Jangan crash hanya karena FiscalYearService belum ada.

CONCURRENCY / TRANSACTION SAFETY:
- Gunakan DB::transaction saat generate nomor.
- Jika query builder/model support lockForUpdate, gunakan lockForUpdate saat ambil sequence.
- Tetap jaga agar tidak SQLite-specific.
- Jika SQLite tidak mendukung lockForUpdate seperti database lain, DB transaction tetap digunakan.
- Dokumentasikan bahwa production DB akan lebih kuat untuk row-level lock.

ERROR HANDLING:
Gunakan exception yang jelas atau policy result jika project sudah punya standard error.
Minimal:
- Unknown document type
- Inactive numbering setting
- Manual number not allowed
- Duplicate manual number not allowed placeholder

DEFAULT SETTINGS:
Saat ensureDefaultSettings dipanggil, buat setting:
- journal_entry => JV
- sales_invoice => SI
- purchase_invoice => PI
- cash_receipt => CR
- cash_payment => CP
- bank_transfer => BT
- stock_adjustment => SA
- stock_movement => SM
- stock_opname => SO
- opening_balance => OB
- closing_entry => CL

Default:
- format = {PREFIX}-{YEAR}-{NUMBER}
- reset_period = fiscal_year
- padding = 6
- mode = auto
- allow_manual_number = false
- allow_duplicate_number = false
- is_active = true

TEST:
Buat backend/tests/Feature/DocumentNumbering/DocumentNumberServiceTest.php

Test minimal:
1. ensureDefaultSettings creates settings for all default document types
2. getOrCreateSetting creates sales invoice setting with prefix SI
3. generate sales invoice number returns SI-2026-000001
4. second generated sales invoice number returns SI-2026-000002
5. purchase invoice uses different prefix PI
6. journal entry uses prefix JV
7. numbering resets per fiscal year
   - SI-2026-000001
   - SI-2027-000001
8. numbering does not reset within same fiscal year
9. monthly reset period produces period_key YYYY-MM if setting changed to monthly
10. never reset period uses period_key all
11. preview does not increment sequence
12. generate after preview still returns same number previewed if no one generated before it
13. void/reuse behavior documented by test name or service behavior:
    - generated number is not reused because sequence only increments
14. manual number validation returns false when allow_manual_number false
15. manual number validation returns true when allow_manual_number true and duplicate check placeholder passes
16. unknown document type throws expected exception
17. inactive setting blocks generate
18. sequence row is created when missing
19. sequence row is updated after generate
20. padding works:
    - padding 4 => SI-2026-0001

Testing notes:
- Gunakan factories/model existing jika tersedia.
- Jika FiscalYearService dari Phase 4F ada, gunakan fiscal year test data.
- Jika FiscalYearService belum ada, fallback year dari documentDate harus membuat test tetap jalan.
- Jangan membuat tabel invoice/journal nyata hanya untuk test.
- Jangan bergantung pada data demo admin@example.com.

DOKUMENTASI:
Buat docs/phase-4g-document-numbering-foundation.md

Isi wajib:
- tujuan Phase 4G
- konsep document numbering per company
- document type list
- default prefix list
- format default {PREFIX}-{YEAR}-{NUMBER}
- reset per fiscal year sebagai default
- sequence dipisah dari setting
- nomor dibuat saat transaksi pertama kali disimpan
- nomor tidak dipakai ulang walaupun void
- edit transaksi tidak mengubah nomor
- revision_no yang berubah saat edit
- manual number policy
- duplicate number policy
- preview number bukan final
- transaction-safe generation
- hubungan dengan FiscalYearService Phase 4F
- hubungan dengan Source Link Phase 4H
- hubungan dengan Revision Tracking Phase 4I
- batasan scope
- command test
- notes commit

Jelaskan secara eksplisit:
- Phase 4G belum membuat invoice/journal/purchase/inventory.
- Phase 4G belum bisa cek duplicate manual number ke tabel transaksi nyata karena tabel belum ada.
- Saat modul transaksi dibuat, masing-masing module wajib menambahkan unique constraint/validation document_number.
- Document number disimpan di transaksi tenant nanti.
- Setting dan sequence disimpan di central database.
- SQLite hanya development; production DB row locking lebih kuat.

COMMAND YANG DIJALANKAN:
Jika environment memungkinkan:
- php artisan migrate
- php artisan test --filter=DocumentNumberServiceTest

Jika environment tidak bisa menjalankan command, tulis jujur di final summary.

ACCEPTANCE CRITERIA:
Phase 4G selesai jika:
1. config/document_numbers.php dibuat
2. document_numbering_settings migration dibuat
3. document_number_sequences migration dibuat
4. DocumentNumberingSetting model dibuat
5. DocumentNumberSequence model dibuat
6. Company relation ditambahkan
7. DocumentType support class dibuat
8. DocumentNumberFormat support class dibuat
9. DocumentNumberService dibuat
10. ensureDefaultSettings membuat semua default document types
11. generate menghasilkan nomor format PREFIX-YEAR-NUMBER
12. sequence increment berjalan
13. fiscal year reset berjalan atau fallback year berjalan jika FiscalYearService belum tersedia
14. preview tidak increment sequence
15. manual number validation placeholder tersedia
16. unknown document type ditangani jelas
17. inactive setting memblok generate
18. tests dibuat
19. dokumentasi Phase 4G dibuat
20. tidak ada tabel invoice/journal/purchase/cash_bank/inventory dibuat
21. tidak ada route API baru wajib dibuat
22. tidak ada frontend dibuat
23. tidak ada SQLite-specific logic dibuat
24. tidak ada create tenant/company public endpoint dibuat

FINAL SUMMARY:
Sertakan:
- file dibuat
- file diubah
- migration dibuat
- test yang dibuat
- command yang berhasil dijalankan
- command yang gagal/tidak bisa dijalankan
- catatan bahwa Phase 4G hanya document numbering foundation
- catatan bahwa invoice/journal/purchase/inventory belum dibuat
- catatan bahwa duplicate manual number ke tabel transaksi nyata akan ditambahkan saat modul transaksi dibuat
- catatan bahwa numbering tidak bergantung khusus SQLite

COMMIT MESSAGE:
add document numbering foundation

COMMIT BODY:
Phase 4G: add document numbering foundation with numbering settings, sequence tracking, document type helpers, formatting service, generation/preview/manual validation logic, tests, and documentation. This prepares fiscal-year-aware document numbers without adding accounting transaction modules or frontend UI.