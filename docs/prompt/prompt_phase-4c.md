Kita masuk ke Phase 4C project TenantAppDevelopment.

NAMA PHASE:
Phase 4C — Transaction Lifecycle Standard

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
SQLite hanya database development/MVP awal.
Jangan membuat desain Phase 4C yang bergantung khusus pada SQLite.
Konsep 1 company = 1 tenant database tetap dipertahankan, tetapi production nanti bisa menggunakan database driver lain.
Jangan membuat logic file SQLite archive.
Jangan membuat database split/archive logic.
Jangan mengubah arsitektur tenant menjadi semua company dalam satu database transaksi.

STATUS SEBELUM PHASE 4C:
Phase 2 sudah membuat:
- auth:sanctum
- login/register/logout/me
- GET /api/companies
- POST /api/companies/select
- middleware company.access
- TenantContext service
- GET /api/tenant-context-test
- validasi user hanya bisa akses company miliknya
- validasi X-Company-ID
- tidak ada public create company
- tidak ada public create tenant

Phase 4A seharusnya membuat:
- company_accounting_settings
- company_module_settings
- CompanySettingService
- CompanySettingController
- GET /api/settings/company
- PATCH /api/settings/company/accounting
- PATCH /api/settings/company/modules
- semua route settings memakai auth:sanctum + company.access

Phase 4B seharusnya membuat:
- config/permissions.php dengan granular permissions
- PermissionService
- EnsurePermission middleware
- GET /api/auth/permissions
- permission dibaca dari TenantContext user_role
- design extensible untuk Phase 14 dynamic/manual user permissions

PERUBAHAN TERBARU YANG WAJIB DIIKUTI:
1. Tenant tetap 1 company = 1 tenant database.
2. 1 company = 1 tenant database tidak harus SQLite.
3. SQLite hanya untuk development/MVP awal.
4. Tutup buku tetap dalam satu tenant database, tidak membuat database baru.
5. Reminder closing hanya untuk tutup buku tahunan/fiscal year, bukan bulanan.
6. Tidak ada reminder closing bulanan.
7. Tidak ada blocking input transaksi bulanan.
8. Blocking input hanya berlaku saat masuk fiscal year baru jika fiscal year sebelumnya belum closed.
9. Setelah fiscal year closed, semua transaksi pada fiscal year tersebut tetap bisa diakses tetapi read-only.
10. Transaksi closed fiscal year tetap visible untuk histori/laporan.
11. Transaksi void hidden by default dari UI client.
12. Void tidak masuk laporan normal.
13. Buku besar harus clean: hanya posted active journal dan tidak obsolete.
14. Posted transaction tetap boleh diedit secara lifecycle, tetapi tetap tunduk ke setting, permission, dependency, fiscal year, period lock, dan date guard.
15. Hard delete transaksi tidak ada.
16. Delete diganti void.

INSTRUKSI REVIEW DAN PERBAIKAN PHASE SEBELUMNYA:
Sebelum mengerjakan Phase 4C, cek hasil Phase 4A dan Phase 4B yang sudah ada di project.

Jika hasil Phase 4A belum sesuai perubahan terbaru, lakukan perbaikan minimal berikut:
1. Pastikan company_accounting_settings memiliki field:
   - block_outside_current_fiscal_year boolean default true
   - date_warning_enabled boolean default true
   - user_permission_mode string default role_template

2. Jika field di atas belum ada:
   - buat migration tambahan baru
   - JANGAN edit migration lama jika sudah pernah dijalankan
   - update model CompanyAccountingSetting fillable/casts
   - update UpdateCompanyAccountingSettingRequest validation jika file itu ada
   - update CompanySettingService default/serialization jika diperlukan
   - update docs/phase-4a-company-settings-foundation.md

3. user_permission_mode allowed values:
   - role_template
   - manual_per_user

4. Untuk Phase 4C, manual_per_user belum diimplementasikan penuh.
   Field ini hanya disiapkan untuk Phase 14.

5. Jangan menambahkan default account mapping di Phase 4C.
   Account mapping menunggu Chart of Accounts tersedia.

Jika hasil Phase 4B belum sesuai perubahan terbaru, lakukan perbaikan minimal berikut:
1. Pastikan permission naming sudah granular.
2. Jangan hanya memakai permission kasar seperti:
   - manage_sales
   - manage_purchases
   - manage_inventory
   - edit_transaction
   - void_transaction

3. Jika masih ada permission kasar, jangan hapus besar-besaran jika sudah dipakai.
   Tetapi tambahkan permission granular yang benar dan update docs.

4. Permission granular minimal harus mencakup:
   - dashboard.view
   - settings.company.view
   - settings.company.edit
   - settings.users.view
   - settings.users.manage
   - settings.permissions.view
   - settings.permissions.manage
   - coa.view
   - coa.create
   - coa.edit
   - coa.deactivate
   - contacts.view
   - contacts.create
   - contacts.edit
   - contacts.deactivate
   - products.view
   - products.create
   - products.edit
   - products.deactivate
   - journal.view
   - journal.create
   - journal.edit
   - journal.void
   - journal.approve
   - journal.post
   - sales.view
   - sales.create
   - sales.edit
   - sales.void
   - sales.approve
   - sales.post
   - purchase.view
   - purchase.create
   - purchase.edit
   - purchase.void
   - purchase.approve
   - purchase.post
   - cash_bank.view
   - cash_bank.create
   - cash_bank.edit
   - cash_bank.void
   - cash_bank.approve
   - cash_bank.post
   - inventory.view
   - inventory.manage
   - reports.view
   - reports.export
   - audit.view

5. Pastikan PermissionService tidak terlalu kaku.
   PermissionService harus mudah diperluas nanti untuk Phase 14 dynamic/manual permission per user tenant.

6. Pastikan PermissionService memakai TenantContext user_role, bukan request body.

7. Pastikan route settings memakai permission:
   - GET /api/settings/company => settings.company.view
   - PATCH /api/settings/company/accounting => settings.company.edit
   - PATCH /api/settings/company/modules => settings.company.edit

8. Jika belum sesuai, update secara minimal.
   Jangan membuat database custom role di Phase 4C.
   Jangan membuat UI role management di Phase 4C.

TUJUAN PHASE 4C:
Membuat standar lifecycle transaksi yang akan dipakai semua modul transaksi nanti:
- journal
- sales invoice
- purchase invoice
- cash bank
- inventory
- stock movement
- fixed asset nanti

Phase ini hanya membuat:
- config
- helper/support class
- reusable trait
- unit test
- dokumentasi

Phase ini TIDAK membuat transaksi nyata seperti invoice atau jurnal.

KEPUTUSAN BISNIS WAJIB PHASE 4C:
1. Hard delete transaksi tidak ada.
2. Delete diganti void.
3. Void transaction hidden by default dari UI client.
4. UI nanti boleh punya toggle "tampilkan transaksi void", tapi Phase 4C tidak membuat UI.
5. Transaksi void tidak boleh masuk laporan normal.
6. Buku besar nanti harus clean.
7. Buku besar hanya membaca journal_entries status posted aktif dan tidak obsolete.
8. Posted transaction tetap boleh diedit secara lifecycle jika setting mengizinkan dan tidak ada dependency.
9. Status posted bukan pengunci utama.
10. Status void adalah terminal/read-only.
11. Closed fiscal year/closed period membuat transaksi read-only walaupun status posted editable secara lifecycle.
12. Closed fiscal year transaction tetap visible untuk histori/laporan.
13. Void transaction hidden by default.
14. Reminder closing hanya tahunan/fiscal year, bukan bulanan.
15. Tidak ada monthly closing reminder.
16. Tidak ada monthly transaction blocking.
17. Entry fiscal year baru nanti diblok jika fiscal year sebelumnya belum closed.
18. Phase 4C belum membuat FiscalYearService, PeriodLockService, TransactionDateGuardService, atau Closing Wizard.
19. Phase 4F nanti membuat fiscal year, period lock, date guard, dan annual closing gate.
20. Phase 8A nanti membuat closing wizard implementation.

FLOW EDIT POSTED TRANSACTION YANG HARUS DIDOKUMENTASIKAN:
Edit posted transaction nanti dilakukan dengan pola:
1. cek permission
2. cek company setting
3. cek dependency
4. cek fiscal year / period lock
5. cek transaction date guard
6. void/obsolete accounting effect lama
7. update transaksi utama
8. generate accounting effect baru
9. post ulang jika perlu
10. simpan revision/audit

Phase 4C hanya mendokumentasikan flow ini.
Jangan implementasikan edit posted transaction di Phase 4C.

SCOPE YANG HARUS DIKERJAKAN:
1. Buat config transaction_lifecycle.php
2. Buat Support class TransactionStatus
3. Buat Support class TransactionLifecycle
4. Buat trait HasTransactionLifecycle
5. Buat unit test TransactionLifecycleTest
6. Buat dokumentasi docs/phase-4c-transaction-lifecycle-standard.md
7. Revisi docs Phase 4A jika field setting terbaru ditambahkan
8. Revisi docs Phase 4B jika permission granular/extensible design belum disebut
9. Jangan membuat route API baru untuk lifecycle

JANGAN MENGERJAKAN:
- sales invoice
- purchase invoice
- journal entry
- stock movement
- chart of accounts
- actual transaction table migration
- transaction dependency service
- transaction policy service
- fiscal year service
- period lock service
- transaction date guard service
- closing wizard
- document numbering service
- report
- frontend UI
- delete transaction endpoint
- void transaction endpoint
- edit transaction endpoint
- create company endpoint
- create tenant endpoint
- migrate tenant endpoint
- assign user endpoint public
- archive database
- SQLite-specific archive logic
- custom role database
- permission override database
- role management UI

FILE BARU PHASE 4C:
- backend/config/transaction_lifecycle.php
- backend/app/Support/Transaction/TransactionStatus.php
- backend/app/Support/Transaction/TransactionLifecycle.php
- backend/app/Traits/HasTransactionLifecycle.php
- backend/tests/Unit/TransactionLifecycleTest.php
- docs/phase-4c-transaction-lifecycle-standard.md

Jika folder belum ada, buat:
- backend/app/Support/Transaction
- backend/tests/Unit

FILE YANG BOLEH DIUBAH JIKA PERLU:
- docs/phase-4a-company-settings-foundation.md
- docs/phase-4b-permission-foundation-basic.md
- backend/app/Models/CompanyAccountingSetting.php hanya jika field Phase 4A tambahan dibuat
- backend/app/Http/Requests/Settings/UpdateCompanyAccountingSettingRequest.php hanya jika field Phase 4A tambahan dibuat
- backend/app/Services/Settings/CompanySettingService.php hanya jika field Phase 4A tambahan dibuat
- backend/config/permissions.php hanya jika permission granular Phase 4B belum sesuai
- backend/app/Services/Permissions/PermissionService.php hanya jika extensible design Phase 4B belum sesuai
- backend/routes/api.php hanya jika route settings belum diproteksi permission granular sesuai Phase 4B

FILE YANG JANGAN DIUBAH:
- frontend/*
- backend routes untuk tenant create/migrate
- endpoint company/tenant management public
- migration tenant accounting modules
- migration journal/invoice/stock movement

REVISI PHASE 4A FIELD JIKA BELUM ADA:
Jika company_accounting_settings belum punya:
- block_outside_current_fiscal_year
- date_warning_enabled
- user_permission_mode

Maka buat migration baru:
backend/database/migrations/central/xxxx_xx_xx_xxxxxx_add_policy_fields_to_company_accounting_settings_table.php

Fields:
- block_outside_current_fiscal_year boolean default true
- date_warning_enabled boolean default true
- user_permission_mode string default role_template

Validation:
- block_outside_current_fiscal_year nullable|boolean
- date_warning_enabled nullable|boolean
- user_permission_mode nullable|in:role_template,manual_per_user

Casts:
- block_outside_current_fiscal_year => boolean
- date_warning_enabled => boolean

CONFIG transaction_lifecycle.php:
Buat backend/config/transaction_lifecycle.php dengan isi:

return [
    'statuses' => [
        'draft',
        'approved',
        'posted',
        'void',
    ],

    'effect_statuses' => [
        'draft',
        'posted',
        'void',
        'obsolete',
    ],

    'visible_statuses' => [
        'draft',
        'approved',
        'posted',
    ],

    'reportable_journal_statuses' => [
        'posted',
    ],

    'hidden_statuses' => [
        'void',
    ],

    'terminal_statuses' => [
        'void',
    ],

    'editable_statuses' => [
        'draft',
        'approved',
        'posted',
    ],

    'voidable_statuses' => [
        'draft',
        'approved',
        'posted',
    ],
];

PENTING:
- posted termasuk editable_statuses sesuai keputusan project
- void tidak boleh editable
- void tidak boleh voidable
- obsolete hanya untuk accounting/system effect, bukan status utama transaksi user
- closed fiscal year/closed period bukan status transaksi
- fiscal year/period closed adalah guard/policy terpisah di Phase 4F
- closed fiscal year membuat transaksi read-only, tetapi data tetap visible

TRANSACTION STATUS CLASS:
Buat backend/app/Support/Transaction/TransactionStatus.php

Isi minimal:
- const DRAFT = 'draft'
- const APPROVED = 'approved'
- const POSTED = 'posted'
- const VOID = 'void'
- const OBSOLETE = 'obsolete'
- static transactionStatuses(): array
- static effectStatuses(): array

TRANSACTION LIFECYCLE CLASS:
Buat backend/app/Support/Transaction/TransactionLifecycle.php

Methods minimal:
- isValidStatus(string $status): bool
- isValidEffectStatus(string $status): bool
- isVisible(string $status): bool
- isEditableStatus(string $status): bool
- isVoidableStatus(string $status): bool
- isTerminal(string $status): bool
- isReportableJournalStatus(string $status, bool $isObsolete = false): bool

Behavior:
- isValidStatus hanya valid untuk draft/approved/posted/void
- isValidEffectStatus valid untuk draft/posted/void/obsolete
- isVisible false untuk void
- isVisible true untuk draft/approved/posted
- isEditableStatus true untuk draft/approved/posted
- isEditableStatus false untuk void
- isVoidableStatus true untuk draft/approved/posted
- isVoidableStatus false untuk void
- isTerminal true untuk void
- isReportableJournalStatus true hanya jika status posted dan isObsolete false
- void tidak reportable
- obsolete tidak reportable

TRAIT:
Buat backend/app/Traits/HasTransactionLifecycle.php

Methods/scopes minimal:
- scopeVisible($query): status != void
- scopeVoided($query): status = void
- scopePosted($query): status = posted
- scopeNotVoided($query): status != void
- isDraft(): bool
- isApproved(): bool
- isPosted(): bool
- isVoided(): bool

Gunakan TransactionStatus constants.
Trait ini belum perlu dipakai di model nyata karena model transaksi belum ada.

UNIT TEST:
Buat backend/tests/Unit/TransactionLifecycleTest.php

Test minimal:
1. draft is valid transaction status
2. approved is valid transaction status
3. posted is valid transaction status
4. void is valid transaction status
5. obsolete is not valid main transaction status
6. obsolete is valid effect status
7. invalid status is rejected
8. void is not visible
9. posted is visible
10. draft is editable
11. approved is editable
12. posted is editable
13. void is not editable
14. draft is voidable
15. approved is voidable
16. posted is voidable
17. void is not voidable
18. void is terminal
19. posted journal is reportable when not obsolete
20. posted journal is not reportable when obsolete
21. void journal is not reportable
22. obsolete effect is not reportable

DOKUMENTASI PHASE 4C:
Buat docs/phase-4c-transaction-lifecycle-standard.md

Isi wajib:
- tujuan Phase 4C
- keputusan bisnis lifecycle
- status transaksi utama
- status accounting effect
- hard delete tidak ada
- void sebagai pengganti delete
- void hidden by default
- toggle tampilkan void nanti di UI
- void tidak masuk laporan normal
- buku besar harus clean
- buku besar hanya membaca posted active journal
- posted transaction boleh diedit secara lifecycle
- closed fiscal year/closed period akan membuat transaksi read-only
- reminder closing hanya tahunan/fiscal year, bukan bulanan
- tidak ada monthly closing reminder
- tidak ada monthly transaction blocking
- entry fiscal year baru nanti diblok jika fiscal year sebelumnya belum closed
- closed fiscal year transaction tetap visible read-only
- flow edit posted transaction
- flow void transaction
- metadata standar transaksi
- source link standard ringkas
- visible scope standard
- report visibility standard
- batasan scope
- command test
- notes commit

METADATA STANDAR YANG HARUS DIDOKUMENTASIKAN:
Semua transaksi utama nanti wajib mempertimbangkan field:
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
- edit_reason
- void_reason

Accounting/system-generated effect nanti wajib mempertimbangkan:
- source_type
- source_id
- source_number
- source_revision
- source_module
- source_batch_id
- is_system_generated
- is_obsolete

TAMBAHKAN CATATAN FISCAL YEAR:
Jelaskan bahwa Phase 4C tidak membuat fiscal year/period lock.
Phase 4F nanti akan membuat:
- fiscal_years
- accounting_periods
- FiscalYearService
- PeriodLockService
- TransactionDateGuardService
- block outside current fiscal year
- annual closing gate
- read-only closed fiscal year

TAMBAHKAN CATATAN CLOSING:
- Closing reminder hanya untuk tutup buku tahunan/fiscal year.
- Tidak ada reminder closing bulanan.
- Tidak ada blocking transaksi bulanan.
- Jika fiscal year sebelumnya belum closed, input fiscal year baru nanti harus diblok.
- Setelah fiscal year closed, data tahun itu tetap bisa dibuka, tapi read-only.
- Tutup buku tetap di tenant database yang sama, tidak membuat database baru.

COMMAND YANG DIJALANKAN:
Jika environment memungkinkan:
- php artisan migrate
- php artisan test --filter=TransactionLifecycleTest

Jika environment tidak bisa menjalankan command, tulis jujur di final summary.

ACCEPTANCE CRITERIA:
Phase 4C selesai jika:
1. config/transaction_lifecycle.php dibuat
2. TransactionStatus dibuat
3. TransactionLifecycle dibuat
4. HasTransactionLifecycle trait dibuat
5. Unit test TransactionLifecycleTest dibuat
6. Dokumentasi Phase 4C dibuat
7. posted termasuk editable status
8. void tidak editable
9. void tidak visible
10. void tidak reportable
11. obsolete tidak valid sebagai main transaction status
12. obsolete valid sebagai effect status
13. reportable journal hanya posted dan not obsolete
14. Dokumentasi menyebut closed fiscal year membuat transaksi read-only
15. Dokumentasi menyebut annual closing reminder, bukan monthly
16. Dokumentasi menyebut tidak ada monthly transaction blocking
17. Dokumentasi menyebut entry fiscal year baru diblok jika fiscal year sebelumnya belum closed
18. Dokumentasi menyebut 1 company = 1 tenant database tetap dipertahankan
19. Dokumentasi menyebut SQLite hanya development/MVP dan production bisa driver lain
20. Jika Phase 4A field terbaru belum ada, migration/model/request/docs diperbaiki secara minimal
21. Jika Phase 4B permission masih terlalu kasar, config/docs diperbaiki secara minimal ke granular/extensible
22. Tidak ada transaction table dibuat
23. Tidak ada route API lifecycle baru dibuat
24. Tidak ada frontend dibuat
25. Tidak ada hard delete endpoint dibuat
26. Tidak ada modul akuntansi dibuat
27. Tidak ada SQLite-specific archive logic dibuat
28. Tidak ada database baru untuk closing dibuat

FINAL SUMMARY:
Sertakan:
- file dibuat
- file diubah jika ada
- migration tambahan jika ada untuk revisi Phase 4A
- revisi Phase 4B jika ada
- test yang dibuat
- command yang berhasil dijalankan
- command yang gagal/tidak bisa dijalankan
- catatan bahwa Phase 4C hanya lifecycle foundation, belum membuat modul transaksi nyata
- catatan bahwa fiscal year/date guard/annual closing gate akan dibuat di Phase 4F/8A
- catatan bahwa tidak ada monthly closing reminder dan tidak ada monthly transaction blocking
- catatan bahwa tenant tetap 1 company = 1 tenant database dan tidak bergantung pada SQLite

COMMIT MESSAGE:
add transaction lifecycle foundation

COMMIT BODY:
Phase 4C: add transaction lifecycle config, status helpers, lifecycle helper, reusable trait, unit tests, and documentation. This establishes standard draft/approved/posted/void behavior, hidden void transactions, editable posted transactions, clean report visibility rules, annual closing expectations, and read-only closed fiscal year expectations without adding accounting modules or transaction routes.