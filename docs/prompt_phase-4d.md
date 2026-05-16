Kita masuk ke Phase 4D project TenantAppDevelopment.

NAMA PHASE:
Phase 4D — Transaction Policy Service

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
- Jangan mengubah arsitektur menjadi semua transaksi company dalam satu database.
- SQLite hanya database development/MVP, jangan hardcode logic khusus SQLite.
- Phase 4D tidak membuat tabel transaksi nyata.
- Phase 4D tidak membuat invoice, journal, purchase, cash bank, inventory, atau COA.
- Phase 4D hanya membuat service policy yang nanti digunakan semua modul transaksi.

STATUS SEBELUM PHASE 4D:
Phase 4A seharusnya sudah/akan membuat:
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
- setting user_permission_mode

Phase 4B seharusnya sudah/akan membuat:
- config/permissions.php granular
- PermissionService
- EnsurePermission middleware
- GET /api/auth/permissions
- permission naming seperti sales.create, sales.edit, sales.void, journal.post, dst.

Phase 4C seharusnya sudah/akan membuat:
- config/transaction_lifecycle.php
- TransactionStatus
- TransactionLifecycle
- HasTransactionLifecycle trait
- TransactionLifecycleTest
- lifecycle rule:
  - draft/approved/posted/void
  - void hidden by default
  - posted editable secara lifecycle
  - void terminal/read-only
  - journal reportable hanya posted dan not obsolete

TUJUAN PHASE 4D:
Membuat TransactionPolicyService sebagai pusat keputusan apakah suatu aksi transaksi boleh dilakukan.

Service ini nantinya akan dipakai oleh semua modul:
- journal
- sales invoice
- purchase invoice
- cash bank
- inventory
- stock movement
- fixed asset nanti

Phase 4D belum membuat transaksi nyata.
Phase 4D hanya membuat policy layer/foundation.

KEPUTUSAN BISNIS WAJIB:
1. Hard delete transaksi tidak ada.
2. Delete diganti void.
3. Void boleh jika:
   - company setting allow_void_transactions true
   - user punya permission module.void
   - status lifecycle voidable
   - tidak ada dependency
   - fiscal year/period tidak closed
4. Edit boleh, termasuk posted, jika:
   - company setting allow_edit_transactions true
   - jika posted, allow_edit_posted_transactions true
   - user punya permission module.edit
   - status lifecycle editable
   - tidak ada dependency
   - fiscal year/period tidak closed
5. Posted transaction secara lifecycle tetap editable.
6. Status void tidak boleh edit, void, approve, post ulang.
7. Closed fiscal year/period nanti membuat transaksi read-only.
8. Reminder closing hanya tahunan/fiscal year, bukan bulanan.
9. Tidak ada monthly closing reminder.
10. Tidak ada monthly transaction blocking.
11. Entry fiscal year baru nanti diblok jika fiscal year sebelumnya belum closed.
12. Phase 4D belum membuat FiscalYearService/PeriodLockService/DateGuardService, tapi harus menyediakan placeholder agar nanti Phase 4F bisa disambungkan tanpa refactor besar.
13. Phase 4D belum membuat TransactionDependencyService final, tapi harus menyediakan placeholder agar nanti Phase 4E bisa disambungkan tanpa refactor besar.

REVIEW DAN PERBAIKAN PHASE SEBELUMNYA:
Sebelum membuat Phase 4D, cek apakah file Phase 4A/4B/4C sudah ada.

Jika Phase 4A belum memiliki setting berikut, jangan refactor besar:
- block_outside_current_fiscal_year
- date_warning_enabled
- user_permission_mode

Jika belum ada dan migration lama sudah pernah dijalankan:
- Buat migration tambahan baru.
- Jangan edit migration lama yang sudah pernah dijalankan.
- Update model/fillable/cast/request/service/docs seperlunya.
- Jika environment tidak memungkinkan, dokumentasikan sebagai pending.

Jika Phase 4B permission masih memakai permission kasar seperti:
- manage_sales
- manage_purchases
- edit_transaction
- void_transaction

Maka:
- Jangan hapus besar-besaran jika sudah dipakai.
- Tambahkan dukungan permission granular.
- Pastikan TransactionPolicyService memakai permission granular:
  - sales.create
  - sales.edit
  - sales.void
  - sales.approve
  - sales.post
  - purchase.create
  - purchase.edit
  - journal.post
  - dst.

Jika Phase 4C belum ada:
- Buat Phase 4D tetap menggunakan defensive fallback constants sederhana bila perlu.
- Tapi lebih baik gunakan App\Support\Transaction\TransactionLifecycle dan TransactionStatus jika sudah tersedia.
- Jangan membuat ulang class lifecycle dengan nama berbeda.

SCOPE YANG HARUS DIKERJAKAN:
1. Buat TransactionPolicyResult value object/helper.
2. Buat TransactionAction constants/helper.
3. Buat TransactionModule constants/helper.
4. Buat TransactionPolicyService.
5. Buat placeholder interface untuk dependency checking.
6. Buat placeholder interface untuk period/date guard checking.
7. Buat unit test TransactionPolicyService.
8. Buat dokumentasi docs/phase-4d-transaction-policy-service.md.

JANGAN MENGERJAKAN:
- sales invoice
- purchase invoice
- journal entry
- stock movement
- chart of accounts
- actual transaction table migration
- transaction dependency service detail
- fiscal year service detail
- period lock service detail
- transaction date guard service detail
- closing wizard
- document numbering service
- report
- frontend UI
- delete transaction endpoint
- void transaction endpoint
- edit transaction endpoint
- create transaction endpoint
- create company endpoint
- create tenant endpoint
- migrate tenant endpoint
- assign user endpoint public
- archive database
- SQLite-specific archive logic
- custom role database
- permission override database
- role management UI

FILE BARU:
- backend/app/Support/Transaction/TransactionAction.php
- backend/app/Support/Transaction/TransactionModule.php
- backend/app/Support/Transaction/TransactionPolicyResult.php
- backend/app/Services/Transactions/TransactionPolicyService.php
- backend/app/Contracts/Transactions/TransactionDependencyChecker.php
- backend/app/Contracts/Transactions/TransactionDateGuard.php
- backend/tests/Unit/TransactionPolicyServiceTest.php
- docs/phase-4d-transaction-policy-service.md

Jika folder belum ada, buat:
- backend/app/Services/Transactions
- backend/app/Contracts/Transactions
- backend/app/Support/Transaction
- backend/tests/Unit

FILE YANG BOLEH DIUBAH JIKA PERLU:
- backend/app/Providers/AppServiceProvider.php
  Hanya jika perlu bind default placeholder dependency/date guard.
- backend/config/permissions.php
  Hanya jika permission granular belum lengkap.
- docs/phase-4a-company-settings-foundation.md
- docs/phase-4b-permission-foundation-basic.md
- docs/phase-4c-transaction-lifecycle-standard.md

JANGAN UBAH:
- frontend/*
- backend/routes/api.php kecuali benar-benar tidak diperlukan; Phase 4D tidak butuh route baru.
- migration transaksi
- migration journal/invoice/stock movement
- endpoint tenant/company management public

TRANSACTION ACTION:
Buat backend/app/Support/Transaction/TransactionAction.php

Isi constants:
- CREATE = 'create'
- EDIT = 'edit'
- VOID = 'void'
- APPROVE = 'approve'
- POST = 'post'
- VIEW = 'view'

Method:
- all(): array

TRANSACTION MODULE:
Buat backend/app/Support/Transaction/TransactionModule.php

Isi constants:
- JOURNAL = 'journal'
- SALES = 'sales'
- PURCHASE = 'purchase'
- CASH_BANK = 'cash_bank'
- INVENTORY = 'inventory'
- MASTER_DATA = 'master_data'

Method:
- all(): array
- permissionFor(string $module, string $action): string

Mapping permission:
- journal + create => journal.create
- journal + edit => journal.edit
- journal + void => journal.void
- journal + approve => journal.approve
- journal + post => journal.post
- journal + view => journal.view
- sales + create => sales.create
- sales + edit => sales.edit
- sales + void => sales.void
- sales + approve => sales.approve
- sales + post => sales.post
- sales + view => sales.view
- purchase + create => purchase.create
- purchase + edit => purchase.edit
- purchase + void => purchase.void
- purchase + approve => purchase.approve
- purchase + post => purchase.post
- purchase + view => purchase.view
- cash_bank + create => cash_bank.create
- cash_bank + edit => cash_bank.edit
- cash_bank + void => cash_bank.void
- cash_bank + approve => cash_bank.approve
- cash_bank + post => cash_bank.post
- cash_bank + view => cash_bank.view
- inventory + view => inventory.view
- inventory + edit/create/void boleh map sesuai permission inventory.manage atau granular adjustment jika diperlukan

Jika module/action tidak dikenal:
- throw InvalidArgumentException
atau
- return module.action dengan validasi ketat
Pilih cara yang paling aman dan konsisten.

TRANSACTION POLICY RESULT:
Buat backend/app/Support/Transaction/TransactionPolicyResult.php

Tujuan:
Mewakili hasil policy:
- allowed
- blocked
- warning

Properties minimal:
- bool $allowed
- bool $warning
- ?string $code
- string $message
- array $reasons
- array $meta

Static constructors:
- allow(string $message = 'Allowed', array $meta = []): self
- deny(string $code, string $message, array $reasons = [], array $meta = []): self
- warning(string $code, string $message, array $reasons = [], array $meta = []): self

Methods:
- allowed(): bool
- denied(): bool
- warning(): bool
- toArray(): array

toArray format:
[
  'allowed' => true/false,
  'warning' => true/false,
  'code' => null/string,
  'message' => string,
  'reasons' => [],
  'meta' => [],
]

ERROR/WARNING CODES:
Gunakan code konsisten:
- TRANSACTION_ALLOWED
- TRANSACTION_STATUS_NOT_EDITABLE
- TRANSACTION_STATUS_NOT_VOIDABLE
- TRANSACTION_ALREADY_VOID
- COMPANY_SETTING_EDIT_DISABLED
- COMPANY_SETTING_EDIT_POSTED_DISABLED
- COMPANY_SETTING_VOID_DISABLED
- PERMISSION_DENIED
- TRANSACTION_HAS_DEPENDENCY
- TRANSACTION_DATE_BLOCKED
- TRANSACTION_DATE_WARNING
- FISCAL_PERIOD_CLOSED
- UNKNOWN_TRANSACTION_MODULE
- UNKNOWN_TRANSACTION_ACTION

CONTRACT: TransactionDependencyChecker
Buat backend/app/Contracts/Transactions/TransactionDependencyChecker.php

Methods:
- hasBlockingDependencies(mixed $transaction, string $action, string $module): bool
- blockingReasons(mixed $transaction, string $action, string $module): array

Untuk Phase 4D, buat default implementation sederhana jika diperlukan:
- NoopTransactionDependencyChecker
yang selalu return false dan reasons [].

Jika membuat Noop implementation, simpan di:
- backend/app/Services/Transactions/NoopTransactionDependencyChecker.php

Atau boleh di test saja jika tidak ingin bind sekarang.

CONTRACT: TransactionDateGuard
Buat backend/app/Contracts/Transactions/TransactionDateGuard.php

Methods:
- check(?string $transactionDate, string $action, string $module): TransactionPolicyResult

Untuk Phase 4D, buat default implementation sederhana jika diperlukan:
- NoopTransactionDateGuard
yang selalu return TransactionPolicyResult::allow()

Jika membuat Noop implementation, simpan di:
- backend/app/Services/Transactions/NoopTransactionDateGuard.php

Catatan:
Phase 4F nanti akan mengganti Noop dengan implementasi nyata:
- fiscal year aktif
- period closed
- block outside active fiscal year
- annual closing gate
- date warning

TRANSACTION POLICY SERVICE:
Buat backend/app/Services/Transactions/TransactionPolicyService.php

Dependencies:
- CompanySettingService jika sudah ada
- PermissionService jika sudah ada
- TransactionLifecycle
- TransactionDependencyChecker
- TransactionDateGuard
- TenantContext jika dibutuhkan untuk active company

Methods minimal:
- canView(string $module, mixed $transaction = null): TransactionPolicyResult
- canCreate(string $module, ?string $transactionDate = null): TransactionPolicyResult
- canEdit(string $module, mixed $transaction): TransactionPolicyResult
- canVoid(string $module, mixed $transaction): TransactionPolicyResult
- canApprove(string $module, mixed $transaction): TransactionPolicyResult
- canPost(string $module, mixed $transaction): TransactionPolicyResult
- check(string $module, string $action, mixed $transaction = null, ?string $transactionDate = null): TransactionPolicyResult

Policy harus mengecek berurutan:
1. Valid module/action.
2. Permission granular module.action.
3. Company setting yang relevan.
4. Lifecycle status jika transaction diberikan.
5. Dependency checker jika transaction diberikan.
6. Date guard / fiscal period guard.
7. Return allow jika semua lolos.

DETAIL POLICY:

CREATE:
- permission: module.create
- cek date guard jika transactionDate ada
- tidak perlu cek lifecycle karena transaction belum ada
- tidak perlu cek dependency
- jika date guard warning, return warning
- jika date guard blocked, return deny

VIEW:
- permission: module.view
- boleh view transaksi void/closed jika user punya view permission
- policy view tidak memblok hanya karena status void
- void hidden default adalah query/UI concern, bukan canView blocking

EDIT:
- permission: module.edit
- transaction wajib punya status
- jika status void => deny TRANSACTION_ALREADY_VOID
- cek TransactionLifecycle::isEditableStatus(status)
- jika false => deny TRANSACTION_STATUS_NOT_EDITABLE
- cek company setting allow_edit_transactions
- jika false => deny COMPANY_SETTING_EDIT_DISABLED
- jika status posted, cek allow_edit_posted_transactions
- jika false => deny COMPANY_SETTING_EDIT_POSTED_DISABLED
- cek dependency
- jika ada dependency => deny TRANSACTION_HAS_DEPENDENCY dengan reasons
- cek date guard berdasarkan transaction.transaction_date jika ada
- jika date guard warning, return warning
- jika blocked, return deny
- jika lolos, allow

VOID:
- permission: module.void
- transaction wajib punya status
- jika status void => deny TRANSACTION_ALREADY_VOID
- cek TransactionLifecycle::isVoidableStatus(status)
- jika false => deny TRANSACTION_STATUS_NOT_VOIDABLE
- cek company setting allow_void_transactions
- jika false => deny COMPANY_SETTING_VOID_DISABLED
- cek dependency
- cek date guard
- jika lolos, allow

APPROVE:
- permission: module.approve
- status void tidak boleh approve
- approved/posted behavior:
  - jika sudah approved atau posted, boleh deny dengan code TRANSACTION_STATUS_NOT_APPROVABLE
  - tambahkan code ini jika diperlukan
- cek date guard
- allow jika lolos

POST:
- permission: module.post
- status void tidak boleh post
- status posted tidak perlu post ulang kecuali explicit repost nanti
- untuk Phase 4D, deny jika status posted dengan code TRANSACTION_ALREADY_POSTED
- cek date guard
- allow jika lolos

COMPANY SETTING FALLBACK:
Jika CompanySettingService belum ada atau setting record belum ada:
Gunakan default aman:
- allow_edit_transactions = true
- allow_edit_posted_transactions = true
- allow_void_transactions = true
- auto_post_transactions = true
- date_warning_enabled = true
- block_outside_current_fiscal_year = true

Jangan crash hanya karena setting belum ada.
Tetapi jika project sudah punya getOrCreate settings, gunakan itu.

TRANSACTION OBJECT:
TransactionPolicyService harus bisa membaca transaction secara fleksibel:
- object dengan property status / transaction_date
- Eloquent model dengan attribute status / transaction_date
- array dengan key status / transaction_date

Buat helper internal:
- getTransactionStatus(mixed $transaction): ?string
- getTransactionDate(mixed $transaction): ?string

Jika status dibutuhkan tapi tidak ada:
- deny dengan code TRANSACTION_STATUS_NOT_EDITABLE / TRANSACTION_STATUS_NOT_VOIDABLE atau TRANSACTION_STATUS_MISSING
- Lebih baik tambahkan code TRANSACTION_STATUS_MISSING

PERMISSION SERVICE FALLBACK:
Jika PermissionService belum ada:
- Jangan membuat duplicate besar.
- Buat type dependency optional atau resolve via container.
- Untuk tests, bisa mock/stub PermissionService.
- Jika PermissionService ada, gunakan method can($permission).

TEST:
Buat backend/tests/Unit/TransactionPolicyServiceTest.php

Gunakan fake/stub dependencies agar tidak perlu database berat.

Test minimal:
1. can create sales when user has sales.create permission
2. cannot create sales without sales.create permission
3. can edit draft transaction when settings allow and permission exists
4. can edit posted transaction when allow_edit_posted_transactions true
5. cannot edit posted transaction when allow_edit_posted_transactions false
6. cannot edit void transaction
7. can void posted transaction when settings allow and permission exists
8. cannot void when allow_void_transactions false
9. cannot void transaction with dependencies
10. can view void transaction if user has module.view permission
11. posted transaction is editable by lifecycle but can still be blocked by company setting
12. date guard warning is returned as warning result
13. date guard blocked returns deny result
14. unknown module/action is denied or throws expected exception consistently
15. policy result toArray returns expected structure

Fake transaction examples:
- ['status' => 'draft', 'transaction_date' => '2026-05-17']
- ['status' => 'posted', 'transaction_date' => '2026-05-17']
- ['status' => 'void', 'transaction_date' => '2026-05-17']

DOKUMENTASI:
Buat docs/phase-4d-transaction-policy-service.md

Isi:
- tujuan Phase 4D
- TransactionPolicyService sebagai pusat keputusan transaksi
- hubungan dengan Phase 4A Company Settings
- hubungan dengan Phase 4B PermissionService
- hubungan dengan Phase 4C TransactionLifecycle
- placeholder untuk Phase 4E DependencyService
- placeholder untuk Phase 4F FiscalYear/DateGuard
- rule create
- rule edit
- rule void
- rule approve
- rule post
- rule view
- hard delete tidak ada
- posted transaction boleh edit secara lifecycle
- void terminal/read-only
- closed fiscal year read-only nanti di Phase 4F
- annual closing reminder nanti di Phase 8A/4F, bukan monthly
- error/warning codes
- contoh result allowed/denied/warning
- batasan scope
- command test
- notes commit

COMMAND YANG DIJALANKAN:
Jika environment memungkinkan:
- php artisan test --filter=TransactionPolicyServiceTest

Jika ada migration tambahan dari revisi Phase 4A:
- php artisan migrate

Jika environment tidak bisa menjalankan command, tulis jujur di final summary.

ACCEPTANCE CRITERIA:
Phase 4D selesai jika:
1. TransactionAction dibuat
2. TransactionModule dibuat
3. TransactionPolicyResult dibuat
4. TransactionPolicyService dibuat
5. TransactionDependencyChecker contract dibuat
6. TransactionDateGuard contract dibuat
7. Unit test TransactionPolicyServiceTest dibuat
8. Dokumentasi Phase 4D dibuat
9. canCreate mengecek permission module.create
10. canEdit mengecek permission, setting, lifecycle, dependency, date guard
11. canEdit posted diperbolehkan jika allow_edit_posted_transactions true
12. canEdit posted ditolak jika allow_edit_posted_transactions false
13. canEdit void ditolak
14. canVoid mengecek permission, setting, lifecycle, dependency, date guard
15. canVoid void ditolak
16. canView tidak memblok hanya karena status void
17. Date guard warning bisa mengembalikan warning result
18. Date guard blocked mengembalikan deny result
19. Tidak ada transaction table dibuat
20. Tidak ada route API baru dibuat
21. Tidak ada frontend dibuat
22. Tidak ada hard delete endpoint dibuat
23. Tidak ada modul akuntansi dibuat
24. Tidak ada SQLite-specific logic dibuat
25. Tidak ada monthly closing reminder dibuat

FINAL SUMMARY:
Sertakan:
- file dibuat
- file diubah jika ada
- migration tambahan jika ada untuk revisi Phase 4A
- revisi Phase 4B jika ada
- test yang dibuat
- command yang berhasil dijalankan
- command yang gagal/tidak bisa dijalankan
- catatan bahwa Phase 4D hanya policy foundation
- catatan bahwa dependency detail akan dibuat di Phase 4E
- catatan bahwa fiscal year/date guard detail akan dibuat di Phase 4F
- catatan bahwa tidak ada modul transaksi nyata dibuat
- catatan bahwa tidak ada monthly closing reminder

COMMIT MESSAGE:
add transaction policy foundation

COMMIT BODY:
Phase 4D: add transaction policy foundation with action/module helpers, policy result object, TransactionPolicyService, dependency/date guard contracts, unit tests, and documentation. The policy combines permission, company settings, lifecycle status, dependency placeholders, and date guard placeholders without adding accounting modules or transaction routes.