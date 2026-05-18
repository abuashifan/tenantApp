Kita masuk ke Phase 4I project TenantAppDevelopment.

NAMA PHASE:
Phase 4I — Revision Tracking Foundation

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
- Data transaksi dan revision history milik company harus berada di tenant database

PENTING TENTANG DATABASE:
- Tetap pertahankan konsep 1 company = 1 tenant database.
- SQLite hanya database development/MVP awal.
- Production nanti bisa MySQL/MariaDB/PostgreSQL.
- Jangan membuat logic yang hanya bergantung pada SQLite.
- Jangan mengubah arsitektur menjadi semua transaksi company dalam satu database transaksi.
- Phase 4I tidak membuat invoice, journal, purchase, cash bank, inventory, COA, atau stock movement table.
- Phase 4I hanya membuat fondasi revision tracking untuk transaksi.
- Revision tracking data harus disimpan di tenant database, bukan central database, karena revision berisi detail perubahan transaksi milik company.

STATUS SEBELUM PHASE 4I:
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
- permission seperti sales.edit, sales.void, journal.post, purchase.edit, inventory.manage

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
- policy canEdit/canVoid/canPost/canApprove/canCreate

Phase 4E sudah/akan membuat:
- TransactionDependencyService
- DependencyCheckResult
- checker placeholder per module
- edit/void blocked jika transaksi punya dependency

Phase 4F sudah/akan membuat:
- fiscal_years
- accounting_periods
- FiscalYearService
- PeriodLockService
- AnnualClosingGateService
- TransactionDateGuardService
- fiscal year closed read-only
- date guard block outside active fiscal year
- annual closing only, not monthly

Phase 4G sudah/akan membuat:
- config/document_numbers.php
- document_numbering_settings
- document_number_sequences
- DocumentType
- DocumentNumberFormat
- DocumentNumberService
- fiscal-year-aware numbering
- nomor dokumen tidak berubah saat transaksi diedit

Phase 4H sudah/akan membuat:
- config/source_links.php
- SourceType
- SourceModule
- SourceLink
- SourceLinkFactory
- HasSourceLink
- source_type/source_id/source_number/source_revision/source_module/source_batch_id
- is_system_generated
- is_obsolete

TUJUAN PHASE 4I:
Membuat fondasi revision tracking agar transaksi yang diedit, termasuk posted transaction, tetap bisa dilacak riwayat perubahannya.

Phase 4I harus menyediakan standar:
- revision_no pada transaksi utama
- transaction_revisions table di tenant database
- TransactionRevisionService
- HasRevisionTracking trait
- RevisionSnapshot helper
- standar old_values/new_values/changed_fields
- standar edit_reason dan void_reason
- standar hubungan revision dengan source link
- test dan dokumentasi

Phase ini TIDAK membuat transaksi nyata seperti invoice/journal/purchase/cash bank/inventory.

KEPUTUSAN BISNIS WAJIB:
1. Posted transaction boleh diedit jika policy mengizinkan, tidak ada dependency, dan fiscal year belum closed.
2. Edit posted transaction tidak mengubah nomor dokumen.
3. Edit posted transaction menaikkan revision_no.
4. Nomor dokumen tetap sama.
5. Revision number yang berubah.
6. Revision history disimpan di transaction_revisions.
7. Satu row transaksi utama tetap aktif.
8. Jangan menduplikasi row transaksi utama per revision.
9. Old/new values disimpan sebagai snapshot JSON di transaction_revisions.
10. Effect lama seperti journal/stock movement nanti akan ditandai obsolete/void berdasarkan source_revision lama.
11. Effect baru nanti dibuat dengan source_revision terbaru.
12. Void tidak wajib menaikkan revision_no.
13. Void harus bisa dicatat sebagai revision action = void.
14. Approve/post tidak wajib menaikkan revision_no.
15. Edit data substansial menaikkan revision_no.
16. Edit posted wajib memiliki edit_reason.
17. Revision history tidak boleh dihapus/diedit oleh user tenant biasa.
18. Phase 4I belum membuat audit log final; audit log basic ada di Phase 4J.
19. Revision tracking berbeda dengan audit log:
    - revision = detail perubahan data
    - audit log = aktivitas user/action/IP/user agent
20. Transaction revisions harus berada di tenant database karena berisi detail transaksi tenant.

CONTOH:
Sales Invoice SI-2026-000015:
- id = 15
- document_number = SI-2026-000015
- revision_no = 1
- status = posted

Invoice menghasilkan journal:
- source_type = sales_invoice
- source_id = 15
- source_number = SI-2026-000015
- source_revision = 1
- is_obsolete = false

Invoice diedit:
- document_number tetap SI-2026-000015
- revision_no naik ke 2
- transaction_revisions menyimpan old_values dan new_values
- effect lama source_revision 1 nanti ditandai obsolete/void
- effect baru nanti source_revision 2

REVIEW DAN PERBAIKAN PHASE SEBELUMNYA:
Sebelum mengerjakan Phase 4I, cek hasil Phase 4H.

Jika Phase 4H sudah punya SourceLink dan HasSourceLink:
- Gunakan SourceLink untuk mengisi source_type/source_id/source_number/source_module.
- Jangan membuat source link class duplikat.
- Jangan membuat format source link baru yang konflik.

Jika Phase 4G sudah punya DocumentType:
- Gunakan document/source type yang konsisten.
- Jangan mengganti nomor dokumen saat revision naik.

Jika Phase 4C sudah punya TransactionStatus:
- Gunakan lifecycle status yang ada.
- Jangan membuat status baru untuk revision.
- revision_no bukan status.

Jika Phase 4D/4E/4F belum lengkap:
- Tetap buat revision foundation.
- Dokumentasikan bahwa policy/dependency/date guard harus dipanggil sebelum TransactionRevisionService dipakai untuk edit nyata.
- Jangan membuat ulang TransactionPolicyService.

Jika belum ada tenant migration folder:
- Gunakan folder tenant migration sesuai struktur project.
- Biasanya backend/database/migrations/tenant.
- Jangan menaruh transaction_revisions di central migration.

SCOPE YANG HARUS DIKERJAKAN:
1. Buat tenant migration untuk transaction_revisions.
2. Buat model TransactionRevision dengan connection tenant.
3. Buat Support class TransactionRevisionAction.
4. Buat Support class RevisionSnapshot.
5. Buat TransactionRevisionService.
6. Buat HasRevisionTracking trait.
7. Buat tests.
8. Buat dokumentasi docs/phase-4i-revision-tracking-foundation.md.
9. Update docs Phase 4H jika perlu untuk menyebut source_revision digunakan oleh revision tracking.

JANGAN MENGERJAKAN:
- sales invoice table
- purchase invoice table
- journal entry table
- cash bank transaction table
- stock movement table
- chart of accounts
- actual transaction edit endpoint
- actual transaction void endpoint
- generated journal obsolete implementation
- generated stock movement obsolete implementation
- audit log final
- frontend UI
- revision history UI
- transaction API endpoint
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
- backend/database/migrations/tenant/xxxx_xx_xx_xxxxxx_create_transaction_revisions_table.php
- backend/app/Models/Tenant/TransactionRevision.php
- backend/app/Support/Revision/TransactionRevisionAction.php
- backend/app/Support/Revision/RevisionSnapshot.php
- backend/app/Services/Transactions/TransactionRevisionService.php
- backend/app/Traits/HasRevisionTracking.php
- backend/tests/Unit/TransactionRevisionServiceTest.php
- docs/phase-4i-revision-tracking-foundation.md

Jika folder belum ada, buat:
- backend/app/Models/Tenant
- backend/app/Support/Revision
- backend/app/Services/Transactions
- backend/tests/Unit

FILE YANG BOLEH DIUBAH:
- docs/phase-4h-source-link-standard.md
- docs/phase-4c-transaction-lifecycle-standard.md
- docs/phase-4d-transaction-policy-service.md
- docs/phase-4e-transaction-dependency-foundation.md

JANGAN UBAH:
- frontend/*
- backend/routes/api.php
- central migrations kecuali tidak perlu
- endpoint tenant/company management public
- journal/invoice/purchase/inventory module
- fiscal year/date guard services
- source link classes kecuali perlu import/use

TENANT MIGRATION: transaction_revisions
Buat migration di:
backend/database/migrations/tenant/xxxx_xx_xx_xxxxxx_create_transaction_revisions_table.php

Table:
transaction_revisions

Fields:
- id
- source_type string
- source_id string atau unsignedBigInteger nullable
- source_number string nullable
- source_module string nullable
- source_revision_from unsignedInteger nullable
- source_revision_to unsignedInteger nullable
- action string
- reason text nullable
- old_values json/text nullable
- new_values json/text nullable
- changed_fields json/text nullable
- edited_by unsignedBigInteger nullable
- edited_at timestamp nullable
- metadata json/text nullable
- timestamps

Indexes:
- source_type + source_id
- source_number
- source_module
- source_revision_to
- action
- edited_by
- edited_at

Catatan:
- Gunakan tipe JSON jika project/database mendukung.
- Karena SQLite development bisa memiliki keterbatasan, boleh gunakan text untuk JSON jika style project sebelumnya begitu.
- Model harus cast old_values/new_values/changed_fields/metadata ke array.
- edited_by adalah user id dari central users.
- Jangan foreign key ke central users jika tenant database tidak bisa refer central database.
- Cukup simpan edited_by sebagai unsignedBigInteger nullable.

PENTING:
transaction_revisions masuk tenant database, bukan central database.

MODEL: TransactionRevision
Buat backend/app/Models/Tenant/TransactionRevision.php

Connection:
- protected $connection = 'tenant';

Table:
- protected $table = 'transaction_revisions';

Fillable:
- source_type
- source_id
- source_number
- source_module
- source_revision_from
- source_revision_to
- action
- reason
- old_values
- new_values
- changed_fields
- edited_by
- edited_at
- metadata

Casts:
- source_revision_from integer
- source_revision_to integer
- old_values array
- new_values array
- changed_fields array
- edited_at datetime
- metadata array

Helpers:
- isEdit(): bool
- isVoid(): bool
- isCorrection(): bool
- hasChangedField(string $field): bool

TRANSACTION REVISION ACTION:
Buat backend/app/Support/Revision/TransactionRevisionAction.php

Constants:
- EDIT = 'edit'
- VOID = 'void'
- CORRECTION = 'correction'
- SYSTEM_REBUILD = 'system_rebuild'

Methods:
- all(): array
- exists(string $action): bool

Makna:
- edit = perubahan data transaksi
- void = transaksi dibatalkan
- correction = koreksi terkait transaksi, terutama setelah closed fiscal year nanti
- system_rebuild = sistem rebuild effect karena revision berubah

REVISION SNAPSHOT:
Buat backend/app/Support/Revision/RevisionSnapshot.php

Responsibilities:
- normalize old/new values
- compare changed fields
- filter ignored fields
- capture snapshot dari array/object/model

Methods minimal:
- from(mixed $source, array $only = [], array $except = []): array
- changedFields(array $oldValues, array $newValues): array
- hasChanges(array $oldValues, array $newValues): bool
- diff(array $oldValues, array $newValues): array

Behavior:
- Bisa menerima array.
- Bisa menerima object/model dengan toArray().
- Jika $only diberikan, hanya field itu yang disimpan.
- Jika $except diberikan, field itu dikeluarkan.
- Default ignored fields:
  - updated_at
  - created_at
  - metadata internal yang tidak substansial jika ada

changedFields output:
[
  'field_name' => [
    'old' => oldValue,
    'new' => newValue
  ]
]

TRANSACTION REVISION SERVICE:
Buat backend/app/Services/Transactions/TransactionRevisionService.php

Responsibilities:
- menentukan revision berikutnya
- capture snapshot
- record edit revision
- record void revision
- record correction/system rebuild jika dibutuhkan
- membantu trait menaikkan revision

Methods minimal:
- nextRevisionNumber(mixed $transaction): int
- currentRevisionNumber(mixed $transaction): int
- captureSnapshot(mixed $transaction, array $only = [], array $except = []): array
- recordEdit(
    string $sourceType,
    int|string|null $sourceId,
    ?string $sourceNumber,
    ?string $sourceModule,
    ?int $revisionFrom,
    ?int $revisionTo,
    array $oldValues,
    array $newValues,
    ?string $reason = null,
    ?int $editedBy = null,
    array $metadata = []
  ): TransactionRevision

- recordVoid(
    string $sourceType,
    int|string|null $sourceId,
    ?string $sourceNumber,
    ?string $sourceModule,
    ?int $revision,
    ?string $reason = null,
    ?int $editedBy = null,
    array $oldValues = [],
    array $metadata = []
  ): TransactionRevision

- record(
    string $action,
    string $sourceType,
    int|string|null $sourceId,
    ?string $sourceNumber,
    ?string $sourceModule,
    ?int $revisionFrom,
    ?int $revisionTo,
    array $oldValues = [],
    array $newValues = [],
    ?string $reason = null,
    ?int $editedBy = null,
    array $metadata = []
  ): TransactionRevision

Behavior:
- nextRevisionNumber:
  - membaca revision_no dari transaction
  - jika tidak ada, anggap current = 1
  - return current + 1

- currentRevisionNumber:
  - membaca revision_no dari array/object/model
  - jika missing/null, return 1

- recordEdit:
  - action edit
  - changed_fields dihitung dari old_values vs new_values
  - source_revision_from = revisionFrom
  - source_revision_to = revisionTo
  - reason disimpan
  - edited_at = now()
  - edited_by disimpan

- recordVoid:
  - action void
  - source_revision_from = revision
  - source_revision_to = revision
  - void tidak wajib menaikkan revision_no
  - reason disimpan sebagai void reason
  - old_values boleh diisi snapshot transaksi sebelum void

- record:
  - validasi action exists
  - simpan TransactionRevision

PENTING:
- TransactionRevisionService tidak melakukan policy check.
- Policy check dilakukan oleh TransactionPolicyService sebelum service ini dipakai.
- TransactionRevisionService tidak melakukan dependency check.
- Dependency check dilakukan oleh TransactionDependencyService.
- TransactionRevisionService tidak melakukan date guard.
- Date guard dilakukan oleh TransactionDateGuardService.
- TransactionRevisionService tidak melakukan obsolete generated effect secara nyata.
- Itu nanti dilakukan di modul transaksi/journal/stock movement.
- Phase 4I hanya menyediakan metadata dan pola revision.

HAS REVISION TRACKING TRAIT:
Buat backend/app/Traits/HasRevisionTracking.php

Assume model memiliki field:
- revision_no

Methods:
- currentRevision(): int
- nextRevision(): int
- incrementRevision(): int
- setRevision(int $revision): self
- hasRevision(): bool

Behavior:
- currentRevision return revision_no jika ada, else 1
- nextRevision return currentRevision + 1
- incrementRevision menaikkan revision_no pada model instance, tapi tidak harus save otomatis
- setRevision set revision_no
- jangan paksa save agar controller/service modul bisa mengatur transaction DB

Optional:
- getRevisionColumn(): string default 'revision_no'

TEST:
Buat backend/tests/Unit/TransactionRevisionServiceTest.php

Karena belum ada transaksi nyata, gunakan array/stdClass/fake object.

Test minimal:
1. currentRevisionNumber returns 1 when revision_no missing
2. currentRevisionNumber reads revision_no from array
3. currentRevisionNumber reads revision_no from object
4. nextRevisionNumber returns current + 1
5. RevisionSnapshot from array returns expected fields
6. RevisionSnapshot excludes ignored fields
7. RevisionSnapshot only option works
8. RevisionSnapshot except option works
9. changedFields detects changed values
10. changedFields ignores unchanged values
11. hasChanges false when no changes
12. recordEdit creates transaction revision with action edit
13. recordEdit stores source_type/source_id/source_number/source_module
14. recordEdit stores revision_from and revision_to
15. recordEdit stores changed_fields
16. recordVoid creates transaction revision with action void
17. recordVoid does not require revision_to greater than revision_from
18. record with invalid action throws expected exception
19. TransactionRevision model casts old_values/new_values/changed_fields to arrays if database test supports it
20. HasRevisionTracking trait currentRevision returns 1 by default
21. HasRevisionTracking trait incrementRevision increments revision_no

Testing notes:
- Jika unit test perlu database tenant connection, pastikan test setup bisa memakai tenant connection.
- Jangan membuat invoice/journal table untuk test.
- Untuk recordEdit/recordVoid, boleh test dengan TransactionRevision model jika tenant database migration tersedia.
- Jika environment test tenant connection sulit, tetap buat test untuk RevisionSnapshot dan trait, lalu dokumentasikan keterbatasan.
- Jangan bergantung pada data demo admin@example.com.

DOKUMENTASI:
Buat docs/phase-4i-revision-tracking-foundation.md

Isi wajib:
- tujuan Phase 4I
- alasan revision tracking diperlukan
- posted transaction boleh diedit
- document number tetap sama
- revision_no yang naik
- satu row transaksi utama tetap aktif
- transaction_revisions sebagai history
- transaction_revisions berada di tenant database
- perbedaan revision tracking vs audit log
- old_values/new_values/changed_fields
- edit_reason
- void_reason
- void tidak wajib menaikkan revision
- approve/post tidak wajib menaikkan revision
- edit posted wajib reason
- hubungan dengan Phase 4H Source Link
- hubungan dengan Phase 4C Lifecycle
- hubungan dengan Phase 4D TransactionPolicyService
- hubungan dengan Phase 4E DependencyService
- hubungan dengan Phase 4F FiscalYear/DateGuard
- hubungan dengan Phase 4J AuditLog
- flow edit posted transaction
- flow void transaction
- standard field yang harus dimiliki transaksi utama nanti
- standard field yang harus dimiliki generated effect nanti
- batasan scope
- command test
- notes commit

Jelaskan flow edit posted:
1. Policy canEdit
2. Dependency clear
3. Fiscal year/date guard clear
4. Capture old snapshot
5. Update transaction
6. revision_no naik
7. Save transaction revision
8. Mark old generated effects obsolete/void by source_revision lama
9. Generate new effects by source_revision baru
10. Audit log

Jelaskan flow void:
1. Policy canVoid
2. Dependency clear
3. Fiscal year/date guard clear
4. Capture snapshot
5. Set transaction status void
6. Record transaction revision action void
7. Void related generated effects by source link
8. Audit log

STANDARD FIELD TRANSAKSI UTAMA NANTI:
- document_number
- status
- revision_no
- transaction_date
- created_by
- updated_by
- approved_by
- posted_by
- voided_by
- created_at
- updated_at
- approved_at
- posted_at
- voided_at
- edit_reason optional
- void_reason optional

STANDARD FIELD GENERATED EFFECT NANTI:
- source_type
- source_id
- source_number
- source_revision
- source_module
- source_batch_id
- is_system_generated
- is_obsolete
- status

COMMAND YANG DIJALANKAN:
Jika environment memungkinkan:
- php artisan migrate --path=database/migrations/tenant
  atau command tenant migration sesuai project jika sudah ada
- php artisan test --filter=TransactionRevisionServiceTest

Jika environment tidak bisa menjalankan command, tulis jujur di final summary.

ACCEPTANCE CRITERIA:
Phase 4I selesai jika:
1. Tenant migration transaction_revisions dibuat
2. TransactionRevision model dibuat dengan connection tenant
3. TransactionRevisionAction support class dibuat
4. RevisionSnapshot support class dibuat
5. TransactionRevisionService dibuat
6. HasRevisionTracking trait dibuat
7. Unit test TransactionRevisionServiceTest dibuat
8. Dokumentasi Phase 4I dibuat
9. currentRevision default 1
10. nextRevision current + 1
11. recordEdit menyimpan old_values/new_values/changed_fields
12. recordEdit menyimpan source revision from/to
13. recordVoid menyimpan action void tanpa wajib menaikkan revision
14. RevisionSnapshot bisa diff changed fields
15. Dokumentasi menjelaskan revision vs audit log
16. Dokumentasi menjelaskan source_revision dan obsolete effect
17. Tidak ada invoice/journal/purchase/cash_bank/inventory table dibuat
18. Tidak ada route API baru dibuat
19. Tidak ada frontend dibuat
20. Tidak ada edit/void endpoint dibuat
21. Tidak ada audit log final dibuat
22. Tidak ada SQLite-specific logic dibuat
23. Tidak ada closing wizard dibuat

FINAL SUMMARY:
Sertakan:
- file dibuat
- file diubah jika ada
- tenant migration dibuat
- test yang dibuat
- command yang berhasil dijalankan
- command yang gagal/tidak bisa dijalankan
- catatan bahwa Phase 4I hanya revision tracking foundation
- catatan bahwa transaksi nyata dan generated effect belum dibuat
- catatan bahwa audit log basic akan dibuat di Phase 4J
- catatan bahwa transaction_revisions berada di tenant database

COMMIT MESSAGE:
add revision tracking foundation

COMMIT BODY:
Phase 4I: add revision tracking foundation with tenant transaction revisions table, revision action helpers, snapshot diff helper, revision service, reusable trait, tests, and documentation. This supports editable posted transactions through revision history without adding accounting transaction modules, API routes, or frontend UI.