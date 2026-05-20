Kita masuk ke Phase 4K project TenantAppDevelopment.

NAMA PHASE:
Phase 4K — Report Visibility Standard

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
- Data transaksi, generated effects, revision history, dan tenant audit log berada di tenant database

PENTING TENTANG DATABASE:
- Tetap pertahankan konsep 1 company = 1 tenant database.
- SQLite hanya database development/MVP awal.
- Production nanti bisa MySQL/MariaDB/PostgreSQL.
- Jangan membuat logic yang hanya bergantung pada SQLite.
- Jangan mengubah arsitektur menjadi semua transaksi company dalam satu database transaksi.
- Phase 4K tidak membuat General Ledger, Trial Balance, Financial Statements, invoice, journal, purchase, cash bank, inventory, COA, atau stock movement table.
- Phase 4K hanya membuat standar visibility/query helper agar modul laporan dan UI nanti konsisten.

STATUS SEBELUM PHASE 4K:
Phase 4A sudah/akan membuat:
- company_accounting_settings
- setting hide_voided_transactions default true
- setting allow_void_transactions
- setting allow_edit_transactions
- setting allow_edit_posted_transactions

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

Phase 4F sudah/akan membuat:
- fiscal_years
- accounting_periods
- fiscal year closed read-only
- annual closing gate
- date guard

Phase 4H sudah/akan membuat:
- SourceLink
- HasSourceLink
- source_revision
- is_system_generated
- is_obsolete

Phase 4I sudah/akan membuat:
- transaction_revisions
- revision_no
- TransactionRevisionService
- edit posted transaction menaikkan revision
- effect lama bisa obsolete

Phase 4J sudah/akan membuat:
- tenant_audit_logs
- AuditLogService
- audit view nanti bisa include void/obsolete

TUJUAN PHASE 4K:
Membuat standar visibility untuk:
- UI transaksi normal
- UI dengan toggle tampilkan void
- laporan normal
- buku besar
- trial balance
- financial statements
- audit/revision view

Phase ini mencegah modul-modul berikutnya membuat query visibility berbeda-beda yang dapat menyebabkan:
- void transaction masuk laporan
- obsolete journal masuk buku besar
- buku besar double count setelah transaksi diedit
- trial balance salah
- financial statements salah
- closed fiscal year disembunyikan padahal harus tetap visible read-only

KEPUTUSAN BISNIS WAJIB:
1. Transaksi void hidden by default dari UI client.
2. UI nanti boleh memiliki toggle "tampilkan void".
3. Transaksi void jika ditampilkan harus read-only.
4. Void transaction tidak masuk laporan normal.
5. Void journal tidak masuk buku besar.
6. Obsolete generated effect tidak masuk laporan normal.
7. Buku besar harus clean.
8. Buku besar hanya membaca journal_entries status posted dan is_obsolete false.
9. Trial balance hanya membaca journal_entries status posted dan is_obsolete false.
10. Financial statements hanya membaca journal_entries status posted dan is_obsolete false.
11. Sales/Purchase/Cash/Inventory reports normal tidak menghitung void.
12. Closed fiscal year berbeda dari void.
13. Closed fiscal year tetap visible untuk histori/laporan.
14. Closed fiscal year read-only, bukan hidden.
15. Audit view boleh include void dan obsolete.
16. Revision view boleh include obsolete effects.
17. Setting hide_voided_transactions hanya memengaruhi UI list default, bukan laporan accounting.
18. Walaupun hide_voided_transactions false, laporan normal tetap exclude void.
19. Phase 4K tidak membuat laporan nyata.
20. Phase 4K hanya membuat helper/service/trait/test/docs.

DEFINISI PENTING:
Void:
- transaksi dibatalkan
- status = void
- hidden dari UI normal
- tidak masuk laporan normal
- hanya muncul di audit/void history jika diminta

Obsolete:
- generated effect lama yang diganti oleh revision baru
- is_obsolete = true
- tidak masuk laporan normal
- boleh muncul di revision/audit view

Closed fiscal year:
- data valid historis
- tetap visible
- tetap masuk laporan historis
- read-only
- bukan hidden
- bukan void
- bukan obsolete

CONTOH WAJIB DIPAHAMI:
1. Sales invoice posted diedit:
   - invoice revision_no naik
   - journal lama source_revision 1 menjadi is_obsolete true
   - journal baru source_revision 2 is_obsolete false
   - buku besar hanya mengambil journal baru

2. Sales invoice di-void:
   - invoice status void
   - generated journal status void
   - stock movement status void
   - laporan normal tidak menghitung semuanya
   - audit view boleh menampilkan

3. Fiscal year 2026 closed:
   - invoice 2026 status posted tetap terlihat
   - laporan 2026 tetap bisa dibuka
   - invoice 2026 read-only
   - bukan hidden dari UI historis

REVIEW DAN PERBAIKAN PHASE SEBELUMNYA:
Sebelum mengerjakan Phase 4K, cek hasil Phase 4C dan 4H.

Jika Phase 4C TransactionLifecycle sudah memiliki isReportableJournalStatus():
- Gunakan atau selaraskan logic dengan ReportVisibilityService.
- Jangan membuat aturan yang bertentangan.
- Pastikan posted + not obsolete = reportable.
- Pastikan void = not reportable.
- Pastikan obsolete = not reportable.

Jika Phase 4C docs belum menegaskan closed fiscal year visible read-only:
- Update docs Phase 4C secara minimal.

Jika Phase 4H HasSourceLink sudah memiliki scopeNotObsolete():
- Jangan membuat scope yang konflik.
- Report visibility trait boleh memiliki scopeReportableEffect() yang memakai status posted + is_obsolete false.

Jika Phase 4A setting hide_voided_transactions belum ada:
- Jangan refactor besar.
- Dokumentasikan bahwa UI default akan memakai true sebagai fallback.
- Jika mudah, tambahkan field di Phase 4A migration tambahan, tapi Phase 4K tidak wajib mengubah setting table.

SCOPE YANG HARUS DIKERJAKAN:
1. Buat config report_visibility.php.
2. Buat ReportVisibilityMode support class.
3. Buat ReportVisibilityService.
4. Buat HasReportVisibility trait.
5. Buat optional ReportVisibilityResult helper jika dibutuhkan.
6. Buat unit test ReportVisibilityServiceTest.
7. Buat dokumentasi docs/phase-4k-report-visibility-standard.md.
8. Update docs Phase 4C/4H/4I jika perlu untuk menyebut ReportVisibilityService sebagai acuan laporan.

JANGAN MENGERJAKAN:
- General Ledger
- Trial Balance
- Financial Statements
- Sales report
- Purchase report
- Inventory report
- Audit viewer UI
- Frontend toggle tampilkan void
- invoice table
- journal table
- journal lines table
- purchase table
- cash bank table
- stock movement table
- actual report endpoints
- transaction endpoints
- fiscal closing wizard
- closing journal generation
- opening balance generation
- create company endpoint public
- create tenant endpoint public
- migrate tenant endpoint public
- assign user endpoint public
- archive database
- SQLite-specific archive logic

FILE BARU:
- backend/config/report_visibility.php
- backend/app/Support/Reports/ReportVisibilityMode.php
- backend/app/Services/Reports/ReportVisibilityService.php
- backend/app/Traits/HasReportVisibility.php
- backend/tests/Unit/ReportVisibilityServiceTest.php
- docs/phase-4k-report-visibility-standard.md

Opsional jika dibutuhkan:
- backend/app/Support/Reports/ReportVisibilityResult.php

Jika folder belum ada, buat:
- backend/app/Support/Reports
- backend/app/Services/Reports
- backend/tests/Unit

FILE YANG BOLEH DIUBAH:
- docs/phase-4c-transaction-lifecycle-standard.md
- docs/phase-4h-source-link-standard.md
- docs/phase-4i-revision-tracking-foundation.md
- docs/phase-4j-audit-log-basic.md

JANGAN UBAH:
- frontend/*
- backend/routes/api.php
- transaction migrations
- journal/invoice/purchase/inventory module
- endpoint tenant/company management public
- fiscal year/date guard service kecuali tidak perlu

CONFIG report_visibility.php:
Buat backend/config/report_visibility.php

Isi minimal:

return [
    'transaction_visible_statuses' => [
        'draft',
        'approved',
        'posted',
    ],

    'transaction_hidden_statuses' => [
        'void',
    ],

    'reportable_transaction_statuses' => [
        'posted',
    ],

    'reportable_journal_statuses' => [
        'posted',
    ],

    'excluded_report_statuses' => [
        'draft',
        'approved',
        'void',
    ],

    'audit_visible_statuses' => [
        'draft',
        'approved',
        'posted',
        'void',
    ],

    'default_hide_voided_transactions' => true,

    'exclude_obsolete_from_reports' => true,

    'closed_fiscal_year_visible' => true,

    'closed_fiscal_year_read_only' => true,
];

PENTING:
- closed fiscal year visible true
- closed fiscal year read only true
- void hidden default true
- obsolete excluded from reports true

REPORT VISIBILITY MODE:
Buat backend/app/Support/Reports/ReportVisibilityMode.php

Constants:
- NORMAL = 'normal'
- WITH_VOID = 'with_void'
- AUDIT = 'audit'
- REPORT = 'report'
- REVISION = 'revision'

Methods:
- all(): array
- exists(string $mode): bool

Makna:
- normal = UI biasa, hide void
- with_void = UI dengan toggle tampilkan void
- audit = audit view, boleh include void/obsolete
- report = laporan normal, exclude void/obsolete, posted only untuk jurnal
- revision = revision history, boleh include obsolete

REPORT VISIBILITY SERVICE:
Buat backend/app/Services/Reports/ReportVisibilityService.php

Methods minimal:
- isTransactionVisible(?string $status, bool $includeVoid = false): bool
- isTransactionReportable(?string $status): bool
- isJournalReportable(?string $status, bool $isObsolete = false): bool
- isEffectReportable(?string $status, bool $isObsolete = false): bool
- isVisibleInAudit(?string $status, bool $isObsolete = false): bool
- isVisibleInRevision(?string $status, bool $isObsolete = false): bool
- shouldHideVoidedTransactions(?object $companySetting = null): bool
- isClosedFiscalYearVisible(): bool
- isClosedFiscalYearReadOnly(): bool

Behavior:
1. isTransactionVisible:
   - if status null => false
   - if includeVoid true => true untuk draft/approved/posted/void
   - if includeVoid false => false untuk void, true untuk draft/approved/posted
   - unknown status false

2. isTransactionReportable:
   - true hanya posted
   - false untuk draft/approved/void
   - unknown false

3. isJournalReportable:
   - true hanya status posted dan isObsolete false
   - false jika isObsolete true
   - false untuk draft/approved/void/null/unknown

4. isEffectReportable:
   - sama dengan journal reportable untuk generated effects
   - true hanya posted dan not obsolete

5. isVisibleInAudit:
   - true untuk draft/approved/posted/void
   - obsolete boleh true karena audit boleh melihat obsolete
   - unknown false

6. isVisibleInRevision:
   - true untuk posted/void/draft/approved jika dibutuhkan
   - obsolete boleh true karena revision view perlu melihat old effects
   - unknown false

7. shouldHideVoidedTransactions:
   - jika companySetting punya hide_voided_transactions, return nilainya
   - jika tidak ada, return config default true
   - ini hanya untuk UI/list behavior, bukan report behavior

8. isClosedFiscalYearVisible:
   - return true dari config

9. isClosedFiscalYearReadOnly:
   - return true dari config

HAS REPORT VISIBILITY TRAIT:
Buat backend/app/Traits/HasReportVisibility.php

Trait ini untuk model masa depan yang punya kolom:
- status
- is_obsolete optional

Scopes:
- scopeVisibleForClient($query)
  => where status != void

- scopeWithVoided($query)
  => no status filter atau include all lifecycle statuses

- scopeReportableTransaction($query)
  => where status = posted

- scopeReportableJournal($query)
  => where status = posted and is_obsolete = false

- scopeReportableEffect($query)
  => where status = posted and is_obsolete = false

- scopeNotObsolete($query)
  => where is_obsolete = false

- scopeObsolete($query)
  => where is_obsolete = true

- scopeAuditVisible($query)
  => no void/obsolete exclusion by default

Methods:
- isVisibleForClient(bool $includeVoid = false): bool
- isReportableTransaction(): bool
- isReportableJournal(): bool
- isReportableEffect(): bool
- isAuditVisible(): bool
- isRevisionVisible(): bool

Implementation:
- Use ReportVisibilityService internally if practical.
- Or use TransactionStatus constants if service injection is not practical in trait.
- Avoid hard dependency that makes model boot fail.

PENTING UNTUK TRAIT:
- Karena tidak semua future models punya is_obsolete, scopeReportableJournal/scopeReportableEffect assumes column exists.
- Dokumentasikan bahwa model yang memakai scope obsolete harus punya is_obsolete column.
- Jangan pakai trait pada model yang belum punya kolom terkait.

OPTIONAL REPORT VISIBILITY RESULT:
Jika dibuat backend/app/Support/Reports/ReportVisibilityResult.php:
Properties:
- bool $visible
- bool $reportable
- bool $readOnly
- string|null $reason
- array $meta

Tetapi ini optional. Jangan over-engineer jika tidak dibutuhkan.

TEST:
Buat backend/tests/Unit/ReportVisibilityServiceTest.php

Test minimal:
1. draft transaction visible by default
2. approved transaction visible by default
3. posted transaction visible by default
4. void transaction hidden by default
5. void transaction visible when includeVoid true
6. posted transaction reportable
7. draft transaction not reportable
8. approved transaction not reportable
9. void transaction not reportable
10. posted journal reportable when not obsolete
11. posted journal not reportable when obsolete
12. void journal not reportable
13. draft journal not reportable
14. obsolete effect not reportable
15. audit view can include void
16. audit view can include obsolete
17. revision view can include obsolete
18. shouldHideVoidedTransactions returns company setting value when provided
19. shouldHideVoidedTransactions returns default true when setting missing
20. closed fiscal year visible returns true
21. closed fiscal year read-only returns true
22. unknown status is not visible/reportable

Testing notes:
- Unit test tidak perlu database.
- Jangan membuat report table.
- Jangan membuat journal table.
- Test service pure logic saja.

DOKUMENTASI:
Buat docs/phase-4k-report-visibility-standard.md

Isi wajib:
- tujuan Phase 4K
- masalah yang diselesaikan
- void vs obsolete vs closed fiscal year
- UI transaction visibility default
- toggle tampilkan void nanti di UI
- report normal rule
- general ledger rule
- trial balance rule
- financial statement rule
- audit view rule
- revision view rule
- closed fiscal year visible/read-only
- hide_voided_transactions hanya untuk UI default, bukan laporan
- contoh edit posted invoice dan obsolete journal lama
- contoh void invoice
- contoh fiscal year closed
- ReportVisibilityService methods
- HasReportVisibility trait
- query standard masa depan
- hubungan dengan Phase 4C lifecycle
- hubungan dengan Phase 4H source link
- hubungan dengan Phase 4I revision
- hubungan dengan Phase 4J audit log
- batasan scope
- command test
- notes commit

Standard query documentation:
Transaction list default:
WHERE status != 'void'

Transaction list include void:
WHERE status IN ('draft', 'approved', 'posted', 'void')

General Ledger:
WHERE journal_entries.status = 'posted'
AND journal_entries.is_obsolete = false

Trial Balance:
WHERE journal_entries.status = 'posted'
AND journal_entries.is_obsolete = false

Financial Statements:
Use posted journal entries only
Exclude void
Exclude obsolete

Audit View:
Can include void
Can include obsolete

Revision View:
Can include obsolete by source_revision

Jelaskan secara eksplisit:
- Phase 4K belum membuat report.
- Phase 4K belum membuat query GL nyata.
- Phase 4K belum membuat UI toggle.
- Phase 4K hanya standard/helper/trait/test/docs.
- Closed fiscal year bukan hidden.
- Closed fiscal year adalah valid historical data yang read-only.
- Void adalah cancelled data yang hidden from normal UI and excluded from reports.
- Obsolete adalah replaced generated effect that must be excluded from reports.

COMMAND YANG DIJALANKAN:
Jika environment memungkinkan:
- php artisan test --filter=ReportVisibilityServiceTest

Jika environment tidak bisa menjalankan command, tulis jujur di final summary.

ACCEPTANCE CRITERIA:
Phase 4K selesai jika:
1. config/report_visibility.php dibuat
2. ReportVisibilityMode support class dibuat
3. ReportVisibilityService dibuat
4. HasReportVisibility trait dibuat
5. ReportVisibilityServiceTest dibuat
6. Dokumentasi Phase 4K dibuat
7. void hidden by default dari service
8. void visible jika includeVoid true
9. posted transaction reportable
10. draft/approved/void transaction not reportable
11. posted journal reportable hanya jika not obsolete
12. obsolete journal/effect not reportable
13. audit view can include void/obsolete
14. revision view can include obsolete
15. closed fiscal year visible true
16. closed fiscal year read-only true
17. hide_voided_transactions fallback true
18. Tidak ada report nyata dibuat
19. Tidak ada journal/invoice/purchase/cash_bank/inventory table dibuat
20. Tidak ada route API baru dibuat
21. Tidak ada frontend dibuat
22. Tidak ada SQLite-specific logic dibuat
23. Tidak ada public tenant/company management endpoint dibuat

FINAL SUMMARY:
Sertakan:
- file dibuat
- file diubah jika ada
- test yang dibuat
- command yang berhasil dijalankan
- command yang gagal/tidak bisa dijalankan
- catatan bahwa Phase 4K hanya report visibility foundation
- catatan bahwa GL/Trial Balance/Financial Statements belum dibuat
- catatan bahwa void/obsolete exclusion akan dipakai oleh modul report nanti
- catatan bahwa closed fiscal year tetap visible read-only

COMMIT MESSAGE:
add report visibility foundation

COMMIT BODY:
Phase 4K: add report visibility foundation with visibility config, mode helpers, ReportVisibilityService, reusable trait, tests, and documentation. This standardizes hidden void transactions, excluded obsolete effects, clean report rules, and visible read-only closed fiscal year data without adding report modules or UI.