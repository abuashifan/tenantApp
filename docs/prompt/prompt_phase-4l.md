Kita masuk ke Phase 4L project TenantAppDevelopment.

NAMA PHASE:
Phase 4L — Opening Balance Standard

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
- Data akuntansi, transaksi, jurnal, saldo awal, revision, dan audit tenant berada di tenant database

PENTING TENTANG DATABASE:
- Tetap pertahankan konsep 1 company = 1 tenant database.
- SQLite hanya database development/MVP awal.
- Production nanti bisa MySQL/MariaDB/PostgreSQL.
- Jangan membuat logic yang hanya bergantung pada SQLite.
- Jangan mengubah arsitektur menjadi semua transaksi company dalam satu database transaksi.
- Phase 4L tidak membuat Chart of Accounts penuh.
- Phase 4L tidak membuat Journal Entry Engine penuh.
- Phase 4L hanya membuat standar/fondasi saldo awal agar nanti COA dan jurnal mengikuti pola yang benar.

STATUS SEBELUM PHASE 4L:
Phase 4A sudah/akan membuat:
- company_accounting_settings
- company_module_settings
- CompanySettingService
- base_currency
- amount_precision
- transaction_workflow_mode
- auto_post_transactions
- allow_edit_transactions
- allow_void_transactions

Phase 4C sudah/akan membuat:
- TransactionStatus
- TransactionLifecycle
- lifecycle draft/approved/posted/void
- posted editable secara lifecycle
- void hidden by default
- void tidak masuk laporan normal

Phase 4F sudah/akan membuat:
- fiscal_years
- accounting_periods
- FiscalYearService
- fiscal year closed read-only
- active fiscal year
- date guard

Phase 4G sudah/akan membuat:
- DocumentNumberService
- document type opening_balance
- prefix OB
- fiscal-year-aware numbering

Phase 4H sudah/akan membuat:
- SourceType
- SourceModule
- SourceLink
- source_type/source_id/source_number/source_revision/source_module
- source_type opening_balance

Phase 4I sudah/akan membuat:
- TransactionRevisionService
- revision_no standard

Phase 4J sudah/akan membuat:
- AuditLogService
- tenant_audit_logs

Phase 4K sudah/akan membuat:
- ReportVisibilityService
- report rule posted and not obsolete
- closed fiscal year visible read-only
- void/obsolete excluded from reports

TUJUAN PHASE 4L:
Menetapkan standar saldo awal agar saldo awal tidak disimpan sebagai angka mati di Chart of Accounts, tetapi masuk ke sistem akuntansi melalui opening journal.

Prinsip:
- Saldo awal harus masuk buku besar.
- Saldo awal harus bisa diaudit.
- Saldo awal harus punya source_type = opening_balance.
- Saldo awal harus menggunakan jurnal pembuka.
- COA boleh menampilkan saldo awal, tetapi sumber accounting tetap journal.
- Phase ini belum membuat Journal Entry Engine penuh, tetapi menyiapkan fondasi agar nanti Journal Engine bisa membuat opening journal dengan benar.

KEPUTUSAN BISNIS WAJIB:
1. Opening balance tidak boleh hanya disimpan sebagai angka di chart_of_accounts.
2. Opening balance harus masuk melalui opening journal.
3. Opening journal harus menjadi sumber saldo awal di General Ledger dan Trial Balance.
4. Opening balance menggunakan source_type = opening_balance.
5. Opening balance harus punya document number dengan document_type opening_balance.
6. Default prefix opening balance adalah OB.
7. Opening balance dibuat untuk fiscal year awal perusahaan.
8. Opening balance harus balance: total debit = total credit.
9. Opening balance hanya boleh dibuat/diubah selama fiscal year belum closed.
10. Jika fiscal year sudah closed, opening balance read-only.
11. Opening balance normalnya dibuat sekali saat setup awal perusahaan.
12. Jika perlu koreksi setelah berjalan, gunakan jurnal koreksi, bukan mengubah opening balance tahun lama.
13. Opening balance tidak masuk laporan laba rugi sebagai transaksi operasional.
14. Opening balance menjadi saldo awal akun riil.
15. Untuk akun nominal revenue/expense, opening balance biasanya nol kecuali ada skenario khusus migrasi data.
16. Phase 4L belum membuat Chart of Accounts table.
17. Phase 4L belum membuat journal_entries table.
18. Phase 4L hanya membuat standard, helper, DTO/value object, service skeleton, tests, dan dokumentasi.
19. Implementasi posting opening journal penuh dilakukan saat Journal Entry Engine tersedia di Phase 6 atau saat Opening Balance UI dibuat.

REVIEW DAN PERBAIKAN PHASE SEBELUMNYA:
Sebelum mengerjakan Phase 4L, cek hasil Phase 4G dan 4H.

Jika Phase 4G belum punya document type opening_balance:
- Tambahkan opening_balance ke config/document_numbers.php.
- Tambahkan DocumentType::OPENING_BALANCE jika belum ada.
- Prefix default: OB.
- Jangan refactor besar numbering service.

Jika Phase 4H belum punya SourceType::OPENING_BALANCE:
- Tambahkan source_type opening_balance ke config/source_links.php.
- Tambahkan SourceType::OPENING_BALANCE jika belum ada.
- Tambahkan SourceModule::OPENING_BALANCE jika belum ada.
- Jangan refactor besar source link.

Jika Phase 4F belum ada FiscalYearService:
- OpeningBalanceService boleh memiliki fallback sederhana dengan year dari opening_date.
- Dokumentasikan bahwa fiscal year integration penuh menunggu Phase 4F.

Jika Phase 4K belum ada ReportVisibilityService:
- Dokumentasikan bahwa opening journal nanti harus mengikuti report rule posted and not obsolete.
- Jangan membuat report visibility service duplikat.

SCOPE YANG HARUS DIKERJAKAN:
1. Buat config opening_balance.php.
2. Buat Support class OpeningBalanceType.
3. Buat Support class OpeningBalanceStatus jika diperlukan.
4. Buat OpeningBalanceLine value object/helper.
5. Buat OpeningBalanceBatch value object/helper.
6. Buat OpeningBalanceValidator.
7. Buat OpeningBalanceService skeleton/foundation.
8. Buat tests.
9. Buat dokumentasi docs/phase-4l-opening-balance-standard.md.
10. Update docs Phase 4G/4H jika perlu untuk memastikan opening_balance document type/source type tersedia.

JANGAN MENGERJAKAN:
- Chart of Accounts table
- journal_entries table
- journal_entry_lines table
- actual opening balance table jika belum diperlukan
- opening balance UI
- opening balance API endpoint
- posting opening journal nyata
- General Ledger
- Trial Balance
- Financial Statements
- sales invoice
- purchase invoice
- cash bank module
- inventory module
- frontend UI
- create company endpoint public
- create tenant endpoint public
- migrate tenant endpoint public
- assign user endpoint public
- SQLite-specific archive logic

FILE BARU:
- backend/config/opening_balance.php
- backend/app/Support/OpeningBalance/OpeningBalanceType.php
- backend/app/Support/OpeningBalance/OpeningBalanceLine.php
- backend/app/Support/OpeningBalance/OpeningBalanceBatch.php
- backend/app/Services/OpeningBalance/OpeningBalanceValidator.php
- backend/app/Services/OpeningBalance/OpeningBalanceService.php
- backend/tests/Unit/OpeningBalanceServiceTest.php
- docs/phase-4l-opening-balance-standard.md

Opsional jika dibutuhkan:
- backend/app/Support/OpeningBalance/OpeningBalanceStatus.php

Jika folder belum ada, buat:
- backend/app/Support/OpeningBalance
- backend/app/Services/OpeningBalance
- backend/tests/Unit

FILE YANG BOLEH DIUBAH:
- backend/config/document_numbers.php jika opening_balance belum ada
- backend/app/Support/DocumentNumbering/DocumentType.php jika OPENING_BALANCE belum ada
- backend/config/source_links.php jika opening_balance belum ada
- backend/app/Support/SourceLink/SourceType.php jika OPENING_BALANCE belum ada
- backend/app/Support/SourceLink/SourceModule.php jika OPENING_BALANCE belum ada
- docs/phase-4g-document-numbering-foundation.md
- docs/phase-4h-source-link-standard.md
- docs/phase-4k-report-visibility-standard.md

JANGAN UBAH:
- frontend/*
- backend/routes/api.php
- journal/invoice/purchase/inventory modules
- tenant/company public management endpoints
- fiscal year/date guard services kecuali tidak perlu

CONFIG opening_balance.php:
Buat backend/config/opening_balance.php

Isi minimal:

return [
    'source_type' => 'opening_balance',

    'source_module' => 'opening_balance',

    'document_type' => 'opening_balance',

    'default_document_prefix' => 'OB',

    'default_status' => 'posted',

    'require_balanced_entry' => true,

    'allow_unbalanced_opening_balance' => false,

    'allow_nominal_accounts_opening_balance' => false,

    'real_account_types' => [
        'asset',
        'liability',
        'equity',
    ],

    'nominal_account_types' => [
        'revenue',
        'expense',
    ],

    'normal_balances' => [
        'asset' => 'debit',
        'expense' => 'debit',
        'liability' => 'credit',
        'equity' => 'credit',
        'revenue' => 'credit',
    ],
];

Catatan:
- Account type mengikuti rencana COA Phase 5:
  asset, liability, equity, revenue, expense.
- Opening balance default hanya untuk akun riil: asset, liability, equity.
- Revenue/expense default tidak boleh punya opening balance kecuali nanti ada mode migrasi khusus.

OPENING BALANCE TYPE:
Buat backend/app/Support/OpeningBalance/OpeningBalanceType.php

Constants:
- STANDARD = 'standard'
- MIGRATION = 'migration'
- CORRECTION = 'correction'

Methods:
- all(): array
- exists(string $type): bool

Makna:
- standard = saldo awal setup awal
- migration = saldo awal hasil migrasi dari sistem lama
- correction = koreksi saldo awal jika diperlukan, tapi jangan untuk closed fiscal year

OPENING BALANCE LINE:
Buat backend/app/Support/OpeningBalance/OpeningBalanceLine.php

Properties:
- int|string|null $accountId
- ?string $accountCode
- ?string $accountName
- ?string $accountType
- float|string|int $debit
- float|string|int $credit
- ?string $description
- array $metadata

Static:
- make(
    int|string|null $accountId,
    ?string $accountCode,
    ?string $accountName,
    ?string $accountType,
    float|int|string $debit = 0,
    float|int|string $credit = 0,
    ?string $description = null,
    array $metadata = []
  ): self

Methods:
- toArray(): array
- debitAmount(): float
- creditAmount(): float
- isDebit(): bool
- isCredit(): bool
- isZero(): bool
- hasBothDebitAndCredit(): bool

Validation rules for line:
- Debit and credit cannot both be greater than zero.
- Debit and credit cannot both be negative.
- Zero line should be ignored or invalid depending validator.
- Account id/code is required for real implementation, but Phase 4L may allow nullable for pure unit tests.

OPENING BALANCE BATCH:
Buat backend/app/Support/OpeningBalance/OpeningBalanceBatch.php

Properties:
- ?string $documentNumber
- ?string $openingDate
- ?int $fiscalYear
- string $type
- array $lines
- ?string $description
- array $metadata

Methods:
- addLine(OpeningBalanceLine $line): self
- lines(): array
- totalDebit(): float
- totalCredit(): float
- difference(): float
- isBalanced(): bool
- toArray(): array

Behavior:
- totalDebit sum debitAmount
- totalCredit sum creditAmount
- isBalanced true jika totalDebit == totalCredit within precision tolerance
- precision tolerance can be small, e.g. 0.0001, or use bc math if available
- Jangan over-engineer currency precision

OPENING BALANCE VALIDATOR:
Buat backend/app/Services/OpeningBalance/OpeningBalanceValidator.php

Methods:
- validateBatch(OpeningBalanceBatch $batch): array
- isBalanced(OpeningBalanceBatch $batch): bool
- validateLine(OpeningBalanceLine $line): array
- validateAccountType(?string $accountType): array
- canUseAccountType(?string $accountType): bool

Return format validateBatch:
[
  'valid' => true/false,
  'errors' => [],
  'warnings' => [],
]

Validation:
1. Batch must have at least 2 non-zero lines.
2. Total debit must equal total credit.
3. Each line cannot have both debit and credit.
4. Each line cannot have negative debit/credit.
5. Account type should be asset/liability/equity by default.
6. Revenue/expense opening balance should be rejected or warning based on config allow_nominal_accounts_opening_balance.
7. Opening date should exist if provided.
8. Fiscal year should exist if provided.
9. If account type unknown in Phase 4L, return warning not fatal unless strict.

OPENING BALANCE SERVICE:
Buat backend/app/Services/OpeningBalance/OpeningBalanceService.php

Responsibilities:
- create opening balance batch object
- validate opening balance batch
- prepare journal payload for future Journal Entry Engine
- provide source link data for opening balance
- provide document type/source type constants
- NOT post journal yet

Dependencies optional:
- DocumentNumberService if available
- FiscalYearService if available
- SourceLinkFactory if available

Methods minimal:
- makeBatch(array $data): OpeningBalanceBatch
- validate(OpeningBalanceBatch $batch): array
- prepareJournalPayload(OpeningBalanceBatch $batch): array
- sourceData(?string $documentNumber = null, ?int $revision = 1): array
- defaultDocumentType(): string
- defaultSourceType(): string

prepareJournalPayload output:
[
  'document_type' => 'opening_balance',
  'source_type' => 'opening_balance',
  'source_module' => 'opening_balance',
  'document_number' => 'OB-2026-000001',
  'journal_date' => '2026-01-01',
  'description' => 'Opening balance',
  'status' => 'posted',
  'lines' => [
    [
      'account_id' => 1,
      'account_code' => '101',
      'description' => 'Opening balance',
      'debit' => 1000000,
      'credit' => 0
    ],
    ...
  ],
  'metadata' => []
]

PENTING:
- prepareJournalPayload hanya menyiapkan payload.
- Jangan insert ke journal_entries karena tabel belum ada.
- Jangan membuat journal engine.
- Jangan generate document number jika service belum tersedia; boleh menerima document_number dari input.
- Jika DocumentNumberService tersedia, boleh sediakan helper preview/generate, tapi jangan wajib.

SOURCE LINK INTEGRATION:
Jika SourceLinkFactory dari Phase 4H tersedia:
- sourceData boleh memakai SourceLink::make atau SourceLinkFactory.
- source_type = opening_balance
- source_module = opening_balance
- source_revision = 1

Jika belum tersedia:
- return array source link standar.

DOCUMENT NUMBERING INTEGRATION:
Jika DocumentNumberService dari Phase 4G tersedia:
- OpeningBalanceService boleh punya method previewDocumentNumber(company, openingDate)
- Tapi jangan wajib karena Phase 4L unit test harus bisa jalan tanpa database berat.

FISCAL YEAR INTEGRATION:
Jika FiscalYearService dari Phase 4F tersedia:
- OpeningBalanceService boleh membantu menentukan fiscal year dari openingDate.
- Jika tidak tersedia, fallback year dari openingDate.
- Jangan membuat fiscal year service duplikat.

TEST:
Buat backend/tests/Unit/OpeningBalanceServiceTest.php

Test minimal:
1. OpeningBalanceLine toArray works
2. debit line detected as debit
3. credit line detected as credit
4. line with both debit and credit is invalid
5. negative debit is invalid
6. negative credit is invalid
7. OpeningBalanceBatch totalDebit sums lines
8. OpeningBalanceBatch totalCredit sums lines
9. balanced batch is balanced
10. unbalanced batch is not balanced
11. validator accepts balanced asset/liability/equity batch
12. validator rejects unbalanced batch
13. validator rejects both debit and credit on same line
14. validator rejects nominal account type by default
15. validator warns or rejects unknown account type according to implementation
16. service makeBatch builds batch from array
17. service prepareJournalPayload returns source_type opening_balance
18. service prepareJournalPayload returns document_type opening_balance
19. service prepareJournalPayload returns status posted
20. service prepareJournalPayload includes lines
21. sourceData returns source_type opening_balance and source_module opening_balance

Testing notes:
- Unit test tidak perlu database.
- Jangan membuat COA table.
- Jangan membuat journal table.
- Gunakan arrays/value objects only.

DOKUMENTASI:
Buat docs/phase-4l-opening-balance-standard.md

Isi wajib:
- tujuan Phase 4L
- opening balance tidak boleh hanya angka di COA
- opening balance harus masuk lewat opening journal
- kenapa opening journal penting untuk GL/Trial Balance
- source_type opening_balance
- document_type opening_balance
- prefix OB
- opening balance untuk fiscal year awal
- saldo awal akun riil asset/liability/equity
- revenue/expense default nol
- batch harus balance debit = credit
- opening balance tidak masuk laba rugi sebagai transaksi operasional
- COA boleh menampilkan saldo awal tetapi sumber accounting tetap journal
- hubungan dengan Phase 4F Fiscal Year
- hubungan dengan Phase 4G Document Numbering
- hubungan dengan Phase 4H Source Link
- hubungan dengan Phase 6 Journal Entry Engine
- hubungan dengan Phase 7 GL/Trial Balance
- batasan scope
- command test
- notes commit

Jelaskan secara eksplisit:
- Phase 4L belum membuat COA.
- Phase 4L belum membuat journal_entries.
- Phase 4L belum posting opening journal.
- Phase 4L hanya menyiapkan standard/helper/service skeleton.
- Implementasi nyata akan dilakukan setelah COA dan Journal Engine tersedia.
- Jika fiscal year closed, opening balance read-only dan koreksi harus melalui jurnal koreksi di tahun berjalan.

COMMAND YANG DIJALANKAN:
Jika environment memungkinkan:
- php artisan test --filter=OpeningBalanceServiceTest

Jika environment tidak bisa menjalankan command, tulis jujur di final summary.

ACCEPTANCE CRITERIA:
Phase 4L selesai jika:
1. config/opening_balance.php dibuat
2. OpeningBalanceType dibuat
3. OpeningBalanceLine dibuat
4. OpeningBalanceBatch dibuat
5. OpeningBalanceValidator dibuat
6. OpeningBalanceService dibuat
7. OpeningBalanceServiceTest dibuat
8. Dokumentasi Phase 4L dibuat
9. Batch balanced validation bekerja
10. Unbalanced batch ditolak
11. Line debit+credit sekaligus ditolak
12. Nominal account opening balance ditolak by default
13. prepareJournalPayload menghasilkan source_type opening_balance
14. prepareJournalPayload menghasilkan document_type opening_balance
15. prepareJournalPayload menghasilkan status posted
16. Tidak ada COA table dibuat
17. Tidak ada journal table dibuat
18. Tidak ada route API baru dibuat
19. Tidak ada frontend dibuat
20. Tidak ada posting jurnal nyata dibuat
21. Tidak ada SQLite-specific logic dibuat
22. Tidak ada public tenant/company management endpoint dibuat

FINAL SUMMARY:
Sertakan:
- file dibuat
- file diubah jika ada
- test yang dibuat
- command yang berhasil dijalankan
- command yang gagal/tidak bisa dijalankan
- catatan bahwa Phase 4L hanya opening balance foundation
- catatan bahwa COA dan Journal Engine belum dibuat
- catatan bahwa opening journal nyata akan dibuat setelah Phase 5/6
- catatan bahwa opening balance harus masuk via journal, bukan angka mati di COA

COMMIT MESSAGE:
add opening balance foundation

COMMIT BODY:
Phase 4L: add opening balance foundation with opening balance config, value objects, validator, service skeleton, tests, and documentation. This standardizes opening balances as future opening journal payloads instead of static COA amounts without adding COA, journal tables, API routes, or frontend UI.