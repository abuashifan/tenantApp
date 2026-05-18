Kita masuk ke Phase 4H project TenantAppDevelopment.

NAMA PHASE:
Phase 4H — Source Link Standard

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
- Phase 4H tidak membuat invoice, journal, purchase, cash bank, inventory, COA, atau stock movement table.
- Phase 4H hanya membuat standar source link agar modul-modul nanti bisa melacak asal-usul efek transaksi.

STATUS SEBELUM PHASE 4H:
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
- permission seperti sales.create, sales.edit, journal.post, inventory.manage, reports.view

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
- TransactionPolicyService
- TransactionPolicyResult
- TransactionAction
- TransactionModule

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

Phase 4G sudah/akan membuat:
- config/document_numbers.php
- document_numbering_settings
- document_number_sequences
- DocumentType
- DocumentNumberFormat
- DocumentNumberService
- fiscal-year-aware numbering

TUJUAN PHASE 4H:
Membuat standar source link agar setiap efek turunan dari transaksi bisa dilacak balik ke dokumen sumbernya.

Contoh:
Sales Invoice SI-2026-000015
menghasilkan:
- Journal Entry
- Stock Movement
- Audit Log
- Cash/Payment effect nanti

Semua efek tersebut harus menyimpan informasi:
- sumbernya dari transaksi apa
- nomor sumbernya apa
- revision sumber ke berapa
- module sumber apa
- apakah efek ini system-generated
- apakah efek ini sudah obsolete karena source transaction diedit
- apakah berasal dari import batch

Phase ini hanya membuat:
- source type constants
- source module constants
- source link value object/helper
- reusable trait HasSourceLink
- helper untuk membaca/membuat source link
- tests
- documentation

Phase ini TIDAK membuat transaksi nyata.

KEPUTUSAN BISNIS WAJIB:
1. Posted transaction boleh diedit jika policy mengizinkan dan tidak ada dependency.
2. Edit posted transaction tidak mengubah efek lama secara langsung.
3. Saat transaksi diedit:
   - source transaction revision naik
   - efek lama harus bisa ditandai void/obsolete
   - efek baru dibuat dengan source_revision terbaru
4. Saat transaksi di-void:
   - semua efek terkait source_type + source_id harus bisa ditemukan
   - semua efek terkait nanti ikut void
5. Void transaction hidden by default dari UI client.
6. Void/obsolete effect tidak masuk laporan normal.
7. Buku besar harus clean.
8. Import batch harus bisa dilacak lewat source_batch_id atau import_batch_id.
9. Phase 4H belum membuat import engine, tetapi source link harus siap untuk import batch.
10. Phase 4H belum membuat journal/stock movement, tetapi trait/helper harus siap dipakai oleh model-model itu nanti.
11. Source link harus generic, tidak hardcode hanya untuk sales invoice.
12. Source link tidak boleh bergantung khusus SQLite.

CONTOH SOURCE LINK:
Sales Invoice:
- id = 15
- document_number = SI-2026-000015
- revision_no = 2
- module = sales

Journal Entry hasil invoice:
- source_type = sales_invoice
- source_id = 15
- source_number = SI-2026-000015
- source_revision = 2
- source_module = sales
- source_batch_id = null
- is_system_generated = true
- is_obsolete = false

Jika invoice diedit lagi ke revision 3:
- Journal Entry revision 2 bisa ditandai is_obsolete = true atau status void/obsolete sesuai lifecycle.
- Journal Entry baru dibuat dengan source_revision = 3.

REVIEW DAN PERBAIKAN PHASE SEBELUMNYA:
Sebelum mengerjakan Phase 4H, cek hasil Phase 4G.

Jika Phase 4G sudah punya DocumentType:
- Gunakan document type constants dari Phase 4G jika relevan.
- Jangan membuat constants yang konflik.
- SourceType boleh berbeda dari DocumentType, tetapi mapping harus jelas.
  Contoh:
  document_type: sales_invoice
  source_type: sales_invoice

Jika Phase 4C sudah punya TransactionStatus/TransactionLifecycle:
- Jangan membuat status lifecycle baru.
- Source link hanya menyimpan relasi asal, bukan menggantikan lifecycle.

Jika Phase 4I belum ada:
- Phase 4H tetap boleh membuat source_revision field standard.
- Revision tracking detail akan dibuat di Phase 4I.
- Jangan implementasi revision service di Phase 4H.

Jika Phase 4E dependency checker sudah ada:
- Dokumentasikan bahwa dependency checker nanti dapat memakai source link untuk mencari transaksi turunan.
- Jangan refactor besar TransactionDependencyService kecuali perlu menambahkan helper ringan.

SCOPE YANG HARUS DIKERJAKAN:
1. Buat config source_links.php.
2. Buat SourceType support class.
3. Buat SourceModule support class.
4. Buat SourceLink value object/helper.
5. Buat SourceLinkFactory atau SourceLinkBuilder jika diperlukan.
6. Buat HasSourceLink trait.
7. Buat helper methods untuk source link arrays.
8. Buat unit test SourceLinkTest.
9. Buat dokumentasi docs/phase-4h-source-link-standard.md.
10. Update docs Phase 4E/4G jika perlu untuk menyebut source link standard.

JANGAN MENGERJAKAN:
- sales invoice table
- purchase invoice table
- journal entry table
- cash bank transaction table
- stock movement table
- chart of accounts
- actual transaction create endpoint
- frontend UI
- import engine
- void transaction endpoint
- edit transaction endpoint
- source effect voiding implementation
- revision tracking service detail
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

FILE BARU:
- backend/config/source_links.php
- backend/app/Support/SourceLink/SourceType.php
- backend/app/Support/SourceLink/SourceModule.php
- backend/app/Support/SourceLink/SourceLink.php
- backend/app/Support/SourceLink/SourceLinkFactory.php
- backend/app/Traits/HasSourceLink.php
- backend/tests/Unit/SourceLinkTest.php
- docs/phase-4h-source-link-standard.md

Jika folder belum ada, buat:
- backend/app/Support/SourceLink
- backend/tests/Unit

FILE YANG BOLEH DIUBAH:
- docs/phase-4e-transaction-dependency-foundation.md
- docs/phase-4g-document-numbering-foundation.md
- docs/phase-4c-transaction-lifecycle-standard.md jika perlu referensi source link

JANGAN UBAH:
- frontend/*
- backend/routes/api.php
- migration transaksi nyata
- endpoint tenant/company management public
- journal/invoice/purchase/inventory module
- fiscal year/date guard services kecuali tidak perlu

CONFIG source_links.php:
Buat backend/config/source_links.php

Isi minimal:

return [
    'source_types' => [
        'manual_journal',
        'opening_balance',
        'closing_entry',
        'sales_invoice',
        'sales_payment',
        'sales_return',
        'purchase_invoice',
        'purchase_payment',
        'purchase_return',
        'cash_receipt',
        'cash_payment',
        'bank_transfer',
        'stock_adjustment',
        'stock_movement',
        'stock_opname',
        'inventory_transfer',
        'import_batch',
        'system',
    ],

    'source_modules' => [
        'journal',
        'sales',
        'purchase',
        'cash_bank',
        'inventory',
        'closing',
        'opening_balance',
        'import',
        'system',
    ],

    'system_generated_effects' => [
        'journal_entry',
        'stock_movement',
        'cash_bank_transaction',
        'audit_log',
    ],
];

SOURCE TYPE:
Buat backend/app/Support/SourceLink/SourceType.php

Constants:
- MANUAL_JOURNAL = 'manual_journal'
- OPENING_BALANCE = 'opening_balance'
- CLOSING_ENTRY = 'closing_entry'
- SALES_INVOICE = 'sales_invoice'
- SALES_PAYMENT = 'sales_payment'
- SALES_RETURN = 'sales_return'
- PURCHASE_INVOICE = 'purchase_invoice'
- PURCHASE_PAYMENT = 'purchase_payment'
- PURCHASE_RETURN = 'purchase_return'
- CASH_RECEIPT = 'cash_receipt'
- CASH_PAYMENT = 'cash_payment'
- BANK_TRANSFER = 'bank_transfer'
- STOCK_ADJUSTMENT = 'stock_adjustment'
- STOCK_MOVEMENT = 'stock_movement'
- STOCK_OPNAME = 'stock_opname'
- INVENTORY_TRANSFER = 'inventory_transfer'
- IMPORT_BATCH = 'import_batch'
- SYSTEM = 'system'

Methods:
- all(): array
- exists(string $sourceType): bool

SOURCE MODULE:
Buat backend/app/Support/SourceLink/SourceModule.php

Constants:
- JOURNAL = 'journal'
- SALES = 'sales'
- PURCHASE = 'purchase'
- CASH_BANK = 'cash_bank'
- INVENTORY = 'inventory'
- CLOSING = 'closing'
- OPENING_BALANCE = 'opening_balance'
- IMPORT = 'import'
- SYSTEM = 'system'

Methods:
- all(): array
- exists(string $sourceModule): bool

SOURCE LINK VALUE OBJECT:
Buat backend/app/Support/SourceLink/SourceLink.php

Properties:
- string $sourceType
- int|string|null $sourceId
- ?string $sourceNumber
- ?int $sourceRevision
- ?string $sourceModule
- ?string $sourceBatchId
- bool $isSystemGenerated
- bool $isObsolete
- array $metadata

Static constructors:
- make(
    string $sourceType,
    int|string|null $sourceId = null,
    ?string $sourceNumber = null,
    ?int $sourceRevision = null,
    ?string $sourceModule = null,
    ?string $sourceBatchId = null,
    bool $isSystemGenerated = true,
    bool $isObsolete = false,
    array $metadata = []
  ): self

- fromArray(array $data): self

Methods:
- toArray(): array
- markObsolete(): self
- withRevision(int $revision): self
- withBatch(?string $batchId): self
- isFrom(string $sourceType): bool
- isSameSource(SourceLink $other): bool

toArray format:
[
  'source_type' => 'sales_invoice',
  'source_id' => 15,
  'source_number' => 'SI-2026-000015',
  'source_revision' => 2,
  'source_module' => 'sales',
  'source_batch_id' => null,
  'is_system_generated' => true,
  'is_obsolete' => false,
  'metadata' => [],
]

Validation:
- source_type harus dikenal jika strict mode memungkinkan.
- source_module boleh nullable, tapi jika ada harus dikenal.
- Jangan terlalu keras sampai menghambat future source type.
- Jika pilih strict validation, dokumentasikan.

SOURCE LINK FACTORY:
Buat backend/app/Support/SourceLink/SourceLinkFactory.php

Tujuan:
Membuat SourceLink dari model/array transaksi sumber.

Methods minimal:
- fromSource(
    string $sourceType,
    mixed $source,
    ?string $sourceModule = null,
    ?string $sourceBatchId = null,
    bool $isSystemGenerated = true
  ): SourceLink

- fromArray(array $data): SourceLink

fromSource harus bisa membaca source dari:
1. Eloquent model/object:
   - id
   - document_number
   - number
   - invoice_number
   - journal_number
   - revision_no
2. array:
   - id
   - document_number
   - number
   - invoice_number
   - journal_number
   - revision_no

Priority untuk source_number:
- document_number
- invoice_number
- journal_number
- number
- null

Default source_revision:
- revision_no jika ada
- 1 jika tidak ada

HAS SOURCE LINK TRAIT:
Buat backend/app/Traits/HasSourceLink.php

Trait untuk model efek sistem nanti seperti journal_entries, stock_movements, cash_bank_transactions.

Scopes:
- scopeForSource($query, string $sourceType, int|string $sourceId)
- scopeForSourceNumber($query, string $sourceNumber)
- scopeForSourceRevision($query, int $revision)
- scopeForSourceModule($query, string $module)
- scopeForSourceBatch($query, string $batchId)
- scopeSystemGenerated($query)
- scopeNotObsolete($query)
- scopeObsolete($query)

Methods:
- sourceLink(): SourceLink
- isSystemGenerated(): bool
- isObsolete(): bool
- markAsObsolete(): bool
- belongsToSource(string $sourceType, int|string $sourceId): bool

Assume model using trait has columns:
- source_type
- source_id
- source_number
- source_revision
- source_module
- source_batch_id
- is_system_generated
- is_obsolete
- metadata optional

Do not require actual model/table in Phase 4H.

CATATAN UNTUK MIGRATION MASA DEPAN:
Phase 4H tidak membuat migration transaksi.
Tetapi dokumentasi harus memberikan standar kolom yang wajib ditambahkan di tabel efek sistem nanti:

For system generated effect tables:
- source_type nullable/string
- source_id nullable
- source_number nullable/string
- source_revision nullable/integer
- source_module nullable/string
- source_batch_id nullable/string
- is_system_generated boolean default false
- is_obsolete boolean default false

Tabel yang nanti wajib mengikuti:
- journal_entries
- stock_movements
- cash_bank_transactions
- audit_logs jika relevan
- attachments jika relevan
- import logs jika relevan

TEST:
Buat backend/tests/Unit/SourceLinkTest.php

Test minimal:
1. source type list contains sales_invoice
2. source module list contains sales
3. SourceLink make returns expected array
4. SourceLink fromArray works
5. SourceLink markObsolete returns/link sets is_obsolete true
6. SourceLink withRevision changes source_revision
7. SourceLink withBatch sets source_batch_id
8. SourceLink isFrom returns true for matching source type
9. SourceLink isSameSource returns true for same source_type and source_id
10. SourceLink isSameSource returns false for different source_id
11. SourceLinkFactory from array reads document_number
12. SourceLinkFactory from array reads invoice_number fallback
13. SourceLinkFactory from array reads journal_number fallback
14. SourceLinkFactory default revision is 1 when revision_no missing
15. SourceLinkFactory reads revision_no when provided
16. SourceLink toArray includes is_system_generated and is_obsolete

Testing notes:
- Jangan membuat tabel transaksi nyata.
- Jangan membuat model invoice/journal nyata.
- Gunakan array atau anonymous object/stdClass untuk test factory.
- Jangan bergantung pada database.

DOKUMENTASI:
Buat docs/phase-4h-source-link-standard.md

Isi wajib:
- tujuan Phase 4H
- konsep source link
- kenapa source link penting
- hubungan source transaction dengan generated effects
- field standar source link
- source_type list
- source_module list
- source_batch_id/import batch concept
- is_system_generated
- is_obsolete
- contoh sales invoice menghasilkan journal dan stock movement
- contoh edit posted transaction:
  - source revision lama obsolete
  - efek baru source_revision terbaru
- contoh void transaction:
  - cari effects by source_type + source_id
  - semua effects ikut void
- contoh import batch salah:
  - semua dokumen punya source_batch_id
  - batch bisa ditelusuri
- hubungan dengan Phase 4C lifecycle
- hubungan dengan Phase 4E dependency service
- hubungan dengan Phase 4G document numbering
- hubungan dengan Phase 4I revision tracking
- migration column standard untuk tabel masa depan
- batasan scope
- command test
- notes commit

Jelaskan secara eksplisit:
- Phase 4H belum membuat invoice/journal/stock movement.
- Phase 4H belum membuat import engine.
- Phase 4H belum membuat void/edit endpoint.
- Phase 4H hanya menyediakan helper/trait/value object/standard.
- Source link tidak menggantikan lifecycle.
- Source link tidak menggantikan revision tracking.
- Source link dipakai agar lifecycle/revision/dependency bisa bekerja konsisten.

COMMAND YANG DIJALANKAN:
Jika environment memungkinkan:
- php artisan test --filter=SourceLinkTest

Jika environment tidak bisa menjalankan command, tulis jujur di final summary.

ACCEPTANCE CRITERIA:
Phase 4H selesai jika:
1. config/source_links.php dibuat
2. SourceType support class dibuat
3. SourceModule support class dibuat
4. SourceLink value object dibuat
5. SourceLinkFactory dibuat
6. HasSourceLink trait dibuat
7. SourceLinkTest dibuat
8. Dokumentasi Phase 4H dibuat
9. SourceLink bisa dibuat dari array
10. SourceLink bisa dibuat dari object/stdClass
11. source_number fallback document_number/invoice_number/journal_number/number bekerja
12. source_revision default 1 jika missing
13. mark obsolete bekerja
14. batch id support ada
15. trait scopes tersedia
16. Dokumentasi menyebut standard kolom untuk tabel masa depan
17. Tidak ada tabel invoice/journal/purchase/cash_bank/inventory dibuat
18. Tidak ada route API baru dibuat
19. Tidak ada frontend dibuat
20. Tidak ada SQLite-specific logic dibuat
21. Tidak ada import engine dibuat
22. Tidak ada void/edit endpoint dibuat

FINAL SUMMARY:
Sertakan:
- file dibuat
- file diubah jika ada
- test yang dibuat
- command yang berhasil dijalankan
- command yang gagal/tidak bisa dijalankan
- catatan bahwa Phase 4H hanya source link foundation
- catatan bahwa invoice/journal/stock movement/import engine belum dibuat
- catatan bahwa source link akan dipakai oleh Phase 4I revision tracking dan modul transaksi nanti

COMMIT MESSAGE:
add source link foundation

COMMIT BODY:
Phase 4H: add source link foundation with source type/module constants, SourceLink value object, factory, reusable trait, tests, and documentation. This standardizes how generated effects link back to source transactions without adding accounting modules, transaction tables, or API routes.