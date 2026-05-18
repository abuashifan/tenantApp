Kita masuk ke Phase 4O project TenantAppDevelopment.

NAMA PHASE:
Phase 4O — Data Retention & Archive Policy Foundation

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
- transaksi tiap company berada di tenant database masing-masing
- data void, audit, revision, dan laporan historis harus tetap aman

PENTING TENTANG DATABASE:
- Tetap pertahankan konsep 1 company = 1 tenant database.
- SQLite hanya database development/MVP awal.
- Production nanti bisa MySQL/MariaDB/PostgreSQL.
- Jangan membuat archive logic yang hanya bergantung pada file SQLite.
- Jangan membuat database baru otomatis untuk closing.
- Tutup buku tetap dalam tenant database yang sama.
- Phase 4O hanya membuat policy/foundation, bukan purge/archive engine penuh.

TUJUAN PHASE 4O:
Membuat fondasi data retention dan archive policy agar sistem punya aturan tentang:
- transaksi void yang menumpuk
- data lama
- import batch yang salah
- audit log retention
- revision history retention
- kapan data boleh diarsipkan
- kapan data tidak boleh dihapus
- bagaimana mencegah database aktif penuh tanpa melanggar audit trail

KEPUTUSAN BISNIS WAJIB:
1. Hard delete transaksi aktif tidak ada.
2. Delete transaksi diganti void.
3. Void tetap disimpan untuk audit.
4. Void hidden dari UI normal dan tidak masuk laporan normal.
5. Data fiscal year closed tetap visible read-only.
6. Fiscal year closed bukan archive otomatis.
7. Archive/purge advanced tidak dibuat sekarang.
8. Purge permanen tidak dibuat di MVP.
9. Jika purge nanti dibuat, harus:
   - backup dulu
   - audit log
   - preview jumlah data
   - otorisasi tinggi
   - tidak berjalan otomatis sembarangan
10. Salah import harus dilacak dengan import_batch_id/source_batch_id.
11. Salah import batch dapat di-void per batch nanti, bukan hard delete langsung.
12. Data retention policy tidak boleh SQLite-specific.
13. Archive database/file adalah fitur advanced di Phase 18, bukan Phase 4O.
14. Phase 4O hanya membuat policy, constants, service skeleton, validator, docs, dan tests.

SCOPE YANG HARUS DIKERJAKAN:
1. Buat config/data_retention.php.
2. Buat DataRetentionPolicy support class.
3. Buat RetentionAction support class.
4. Buat RetentionDecision value object/helper.
5. Buat DataRetentionService skeleton.
6. Buat DataRetentionValidator.
7. Buat tests.
8. Buat dokumentasi docs/phase-4o-data-retention-archive-policy-foundation.md.
9. Update docs Phase 4C/4K/4J jika perlu untuk menyebut void retention.

JANGAN MENGERJAKAN:
- archive database engine
- purge engine
- delete transaction endpoint
- hard delete transaction
- archive UI
- purge UI
- backup engine
- restore engine
- import engine
- sales invoice table
- journal table
- report table
- SQLite file archive
- create company endpoint public
- create tenant endpoint public
- migrate tenant endpoint public
- assign user endpoint public

FILE BARU:
- backend/config/data_retention.php
- backend/app/Support/DataRetention/DataRetentionPolicy.php
- backend/app/Support/DataRetention/RetentionAction.php
- backend/app/Support/DataRetention/RetentionDecision.php
- backend/app/Services/DataRetention/DataRetentionService.php
- backend/app/Services/DataRetention/DataRetentionValidator.php
- backend/tests/Unit/DataRetentionServiceTest.php
- docs/phase-4o-data-retention-archive-policy-foundation.md

Jika folder belum ada:
- backend/app/Support/DataRetention
- backend/app/Services/DataRetention
- backend/tests/Unit

FILE YANG BOLEH DIUBAH:
- docs/phase-4c-transaction-lifecycle-standard.md
- docs/phase-4j-audit-log-basic.md
- docs/phase-4k-report-visibility-standard.md

JANGAN UBAH:
- frontend/*
- routes/api.php
- transaction modules
- tenant/company public management endpoints
- backup/restore implementation
- archive engine implementation

CONFIG data_retention.php:
Buat backend/config/data_retention.php

Isi minimal:

return [
    'default_policy' => [
        'void_transaction_retention_days' => null,
        'auto_archive_voided_transactions' => false,
        'archive_voided_after_days' => 365,

        'active_data_retention_years' => 5,
        'auto_archive_closed_fiscal_years' => false,
        'archive_closed_fiscal_year_after_years' => 5,

        'allow_purge_archived_data' => false,
        'purge_archived_after_years' => null,

        'audit_log_retention_years' => null,
        'revision_history_retention_years' => null,
    ],

    'rules' => [
        'hard_delete_active_transactions' => false,
        'purge_requires_backup' => true,
        'purge_requires_audit_log' => true,
        'purge_requires_preview' => true,
        'archive_requires_closed_fiscal_year' => true,
        'archive_must_not_affect_reports' => true,
    ],

    'record_types' => [
        'transaction',
        'journal',
        'stock_movement',
        'audit_log',
        'revision',
        'import_batch',
    ],
];

DATA RETENTION POLICY:
Buat backend/app/Support/DataRetention/DataRetentionPolicy.php

Properties:
- ?int $voidTransactionRetentionDays
- bool $autoArchiveVoidedTransactions
- ?int $archiveVoidedAfterDays
- int $activeDataRetentionYears
- bool $autoArchiveClosedFiscalYears
- ?int $archiveClosedFiscalYearAfterYears
- bool $allowPurgeArchivedData
- ?int $purgeArchivedAfterYears
- ?int $auditLogRetentionYears
- ?int $revisionHistoryRetentionYears

Static:
- defaults(): self
- fromArray(array $data): self

Methods:
- toArray(): array
- allowsPurge(): bool
- autoArchiveVoidsEnabled(): bool
- autoArchiveClosedFiscalYearsEnabled(): bool

RETENTION ACTION:
Buat backend/app/Support/DataRetention/RetentionAction.php

Constants:
- KEEP = 'keep'
- HIDE = 'hide'
- ARCHIVE_ELIGIBLE = 'archive_eligible'
- ARCHIVE = 'archive'
- PURGE_ELIGIBLE = 'purge_eligible'
- PURGE = 'purge'
- BLOCK = 'block'

Methods:
- all(): array
- exists(string $action): bool

RETENTION DECISION:
Buat backend/app/Support/DataRetention/RetentionDecision.php

Properties:
- string $action
- bool $allowed
- string $code
- string $message
- array $reasons
- array $meta

Static:
- keep(string $message = 'Keep data.', array $meta = []): self
- hide(string $message = 'Hide from normal UI.', array $meta = []): self
- archiveEligible(string $message, array $reasons = [], array $meta = []): self
- purgeEligible(string $message, array $reasons = [], array $meta = []): self
- block(string $code, string $message, array $reasons = [], array $meta = []): self

Methods:
- toArray(): array
- allowed(): bool
- blocked(): bool

DATA RETENTION SERVICE:
Buat backend/app/Services/DataRetention/DataRetentionService.php

Responsibilities:
- menentukan decision untuk void transaction
- menentukan decision untuk closed fiscal year data
- menentukan apakah archive eligible
- menentukan apakah purge eligible
- tidak menjalankan archive/purge nyata
- tidak hard delete data

Methods minimal:
- policy(array $override = []): DataRetentionPolicy
- decideForVoidedTransaction(array|object $record, ?DataRetentionPolicy $policy = null): RetentionDecision
- decideForClosedFiscalYear(array|object $fiscalYear, ?DataRetentionPolicy $policy = null): RetentionDecision
- canPurge(array|object $record, ?DataRetentionPolicy $policy = null): RetentionDecision
- requiresBackupBeforePurge(): bool
- requiresAuditLogBeforePurge(): bool
- requiresPreviewBeforePurge(): bool

Behavior:
1. Voided transaction:
   - default action hide/keep
   - if autoArchiveVoidedTransactions false => keep/hide
   - if enabled and older than archiveVoidedAfterDays => archiveEligible
   - never purge active void transaction in Phase 4O

2. Closed fiscal year:
   - default keep visible read-only
   - if autoArchiveClosedFiscalYears false => keep
   - if enabled and older than configured years => archiveEligible
   - archive must not affect reports

3. Purge:
   - if allowPurgeArchivedData false => block
   - if record not archived => block
   - if no backup/audit/preview => block by policy
   - Phase 4O does not execute purge

4. Import batch:
   - service may provide policy notes only
   - wrong import should be voided by batch using source_batch_id/import_batch_id later
   - no hard delete

DATA RETENTION VALIDATOR:
Buat backend/app/Services/DataRetention/DataRetentionValidator.php

Methods:
- validatePolicy(array $data): array
- validatePurgeRequest(array $data): array
- validateArchiveRequest(array $data): array

Validation:
- retention days nullable integer min 0
- years nullable integer min 0
- allow_purge_archived_data boolean
- purge must require backup confirmation
- purge must require preview confirmation
- purge must require audit reason

Return:
[
  'valid' => true/false,
  'errors' => [],
  'warnings' => [],
]

TEST:
Buat backend/tests/Unit/DataRetentionServiceTest.php

Test minimal:
1. default policy disables auto archive voided transactions
2. default policy disables purge
3. voided transaction default decision is keep/hide
4. voided transaction older than archive days is not archive eligible when auto archive disabled
5. voided transaction older than archive days is archive eligible when auto archive enabled
6. closed fiscal year default decision is keep
7. closed fiscal year older than retention years is not archive eligible when auto archive disabled
8. closed fiscal year older than retention years is archive eligible when enabled
9. purge blocked when allow_purge_archived_data false
10. purge blocked when record is not archived
11. purge requires backup
12. purge requires audit log
13. purge requires preview
14. validator rejects negative retention days
15. validator accepts null retention days
16. RetentionDecision toArray returns expected structure

Use arrays/objects only.
Do not create real transaction tables.

DOKUMENTASI:
Buat docs/phase-4o-data-retention-archive-policy-foundation.md

Isi wajib:
- tujuan Phase 4O
- masalah transaksi void menumpuk
- void vs archive vs purge
- hard delete transaksi aktif tidak ada
- void tetap disimpan untuk audit
- void hidden dari UI normal
- data closed fiscal year tetap visible read-only
- archive advanced tidak dibuat sekarang
- purge tidak dibuat di MVP
- purge jika nanti dibuat harus backup/audit/preview/otorisasi tinggi
- salah import batch harus memakai source_batch_id/import_batch_id
- salah import batch nanti di-void per batch, bukan hard delete
- policy default
- service decisions
- hubungan dengan Phase 4C lifecycle
- hubungan dengan Phase 4H source link
- hubungan dengan Phase 4J audit log
- hubungan dengan Phase 4K report visibility
- hubungan dengan Phase 16 backup
- hubungan dengan Phase 18 advanced archive/purge
- batasan scope
- command test
- notes commit

Jelaskan secara eksplisit:
- Phase 4O tidak membuat archive engine.
- Phase 4O tidak membuat purge engine.
- Phase 4O tidak membuat UI.
- Phase 4O tidak membuat SQLite archive file.
- Production database bisa MySQL/PostgreSQL, jadi archive policy harus database-agnostic.

COMMAND YANG DIJALANKAN:
Jika environment memungkinkan:
- php artisan test --filter=DataRetentionServiceTest

Jika environment tidak bisa menjalankan command, tulis jujur di final summary.

ACCEPTANCE CRITERIA:
Phase 4O selesai jika:
1. config/data_retention.php dibuat
2. DataRetentionPolicy dibuat
3. RetentionAction dibuat
4. RetentionDecision dibuat
5. DataRetentionService dibuat
6. DataRetentionValidator dibuat
7. DataRetentionServiceTest dibuat
8. Dokumentasi Phase 4O dibuat
9. Default policy tidak auto archive void
10. Default policy tidak allow purge
11. Void default keep/hide
12. Archive eligible hanya policy decision, bukan eksekusi archive
13. Purge selalu diblok jika policy tidak mengizinkan
14. Purge membutuhkan backup/audit/preview secara policy
15. Tidak ada hard delete transaksi dibuat
16. Tidak ada archive engine dibuat
17. Tidak ada purge engine dibuat
18. Tidak ada UI dibuat
19. Tidak ada SQLite-specific archive logic dibuat
20. Tidak ada public tenant/company management endpoint dibuat

FINAL SUMMARY:
Sertakan:
- file dibuat
- file diubah jika ada
- test yang dibuat
- command yang berhasil dijalankan
- command yang gagal/tidak bisa dijalankan
- catatan bahwa Phase 4O hanya retention/archive policy foundation
- catatan bahwa archive/purge engine tidak dibuat
- catatan bahwa hard delete transaksi tetap tidak ada
- catatan bahwa advanced archive/purge nanti di Phase 18 atau phase advanced

COMMIT MESSAGE:
add data retention policy foundation

COMMIT BODY:
Phase 4o: add data retention and archive policy foundation with retention config, policy/action/decision helpers, service, validator, tests, and documentation. This defines void retention, closed fiscal year data policy, archive eligibility, and purge safeguards without adding archive engines, purge execution, UI, or hard delete transaction behavior.