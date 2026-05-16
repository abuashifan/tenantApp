Kita masuk ke Phase 4E project TenantAppDevelopment.

NAMA PHASE:
Phase 4E — Transaction Dependency Foundation

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
- SQLite hanya database development/MVP, jangan hardcode logic khusus SQLite.
- Phase 4E tidak membuat tabel transaksi nyata.
- Phase 4E tidak membuat invoice, journal, purchase, cash bank, inventory, atau COA.
- Phase 4E hanya membuat fondasi dependency checking agar semua modul transaksi nanti punya cara standar untuk memblok edit/void jika transaksi sudah terhubung ke transaksi lain.

STATUS SEBELUM PHASE 4E:
Phase 4A sudah/akan membuat:
- company_accounting_settings
- company_module_settings
- CompanySettingService
- setting allow_edit_transactions
- setting allow_edit_posted_transactions
- setting allow_void_transactions
- setting block_outside_current_fiscal_year
- setting date_warning_enabled

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
  - report normal exclude void/obsolete

Phase 4D sudah/akan membuat:
- TransactionAction
- TransactionModule
- TransactionPolicyResult
- TransactionPolicyService
- TransactionDependencyChecker contract
- TransactionDateGuard contract
- TransactionPolicyService memakai dependency checker placeholder

TUJUAN PHASE 4E:
Membuat fondasi TransactionDependencyService agar sistem punya standar untuk menentukan apakah sebuah transaksi boleh diedit atau di-void berdasarkan hubungan/dependency dengan transaksi lain.

Phase ini penting karena rule bisnis project:
- Edit transaksi boleh, termasuk posted transaction.
- Void transaksi boleh.
- Tetapi edit/void hanya boleh jika transaksi tidak punya dependency.
- Hard delete transaksi tidak ada.
- Delete diganti void.

CONTOH DEPENDENCY:
Sales invoice tidak boleh edit/void jika:
- sudah ada payment
- sudah ada return
- sudah ada credit note
- sudah masuk rekonsiliasi bank
- stock movement sudah dipakai proses lanjutan
- sudah menjadi sumber dokumen lain

Purchase invoice tidak boleh edit/void jika:
- sudah ada payment
- sudah ada return/debit note
- sudah masuk rekonsiliasi bank
- stock movement sudah dipakai proses lanjutan
- sudah menjadi sumber dokumen lain

Journal tidak boleh edit/void jika:
- system-generated dari source transaction dan harus diedit dari source-nya
- sudah masuk fiscal year closed nanti di Phase 4F
- sudah menjadi source adjustment lanjutan jika nanti ada

Inventory movement tidak boleh edit/void jika:
- sudah dipakai costing lanjutan
- sudah masuk stock opname final
- sudah menjadi dasar HPP penjualan berikutnya
- sudah masuk fiscal year closed nanti di Phase 4F

KEPUTUSAN BISNIS WAJIB:
1. Hard delete transaksi tidak ada.
2. Delete diganti void.
3. Edit/void hanya boleh jika tidak ada blocking dependency.
4. Dependency checker harus memberi alasan yang jelas, bukan hanya true/false.
5. Dependency checker harus extensible per module.
6. Phase 4E belum membuat tabel invoice/payment/return/stock movement nyata.
7. Karena tabel transaksi nyata belum ada, dependency checker detail per module dibuat sebagai placeholder / registry / contract.
8. Nanti saat Sales/Purchase/CashBank/Inventory dibuat, masing-masing modul menambahkan checker-nya sendiri.
9. TransactionPolicyService dari Phase 4D harus bisa memakai TransactionDependencyService ini.
10. Phase 4E tidak boleh membuat modul transaksi nyata hanya untuk test.

REVIEW DAN PERBAIKAN PHASE SEBELUMNYA:
Sebelum mengerjakan Phase 4E, cek hasil Phase 4D.

Jika Phase 4D sudah punya contract:
- App\Contracts\Transactions\TransactionDependencyChecker

Maka:
- Jangan buat contract duplikat dengan nama berbeda.
- Gunakan contract yang sudah ada.
- Implementasikan TransactionDependencyService sesuai contract tersebut.
- Jika contract Phase 4D terlalu sederhana, boleh perluas secara backward-compatible.

Jika Phase 4D belum punya contract:
- Buat contract sesuai spesifikasi di bawah.

Jika TransactionPolicyService Phase 4D masih memakai NoopTransactionDependencyChecker:
- Ubah binding/service agar memakai TransactionDependencyService.
- Jangan refactor besar.
- Pastikan test Phase 4D tetap bisa jalan.

Jika Phase 4D belum ada:
- Tetap buat Phase 4E secara mandiri dengan contract/service.
- Dokumentasikan bahwa integrasi penuh ke TransactionPolicyService menunggu Phase 4D.

SCOPE YANG HARUS DIKERJAKAN:
1. Buat/rapikan TransactionDependencyChecker contract.
2. Buat DependencyCheckResult value object/helper.
3. Buat TransactionDependencyService.
4. Buat BaseTransactionDependencyChecker abstract class atau interface helper jika diperlukan.
5. Buat Null/Noop dependency checker untuk fallback.
6. Buat registry mekanisme dependency checker per module.
7. Buat placeholder checker untuk:
   - sales
   - purchase
   - journal
   - cash_bank
   - inventory
8. Integrasikan TransactionDependencyService ke TransactionPolicyService jika Phase 4D ada.
9. Buat unit test TransactionDependencyServiceTest.
10. Buat dokumentasi docs/phase-4e-transaction-dependency-foundation.md.

JANGAN MENGERJAKAN:
- sales invoice table
- sales payment table
- sales return table
- purchase invoice table
- purchase payment table
- journal entry table
- stock movement table
- chart of accounts
- actual dependency query ke tabel yang belum ada
- fiscal year service
- period lock service
- transaction date guard detail
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
- role management UI

FILE BARU:
- backend/app/Support/Transaction/DependencyCheckResult.php
- backend/app/Services/Transactions/TransactionDependencyService.php
- backend/app/Services/Transactions/NoopTransactionDependencyChecker.php
- backend/app/Services/Transactions/Checkers/SalesTransactionDependencyChecker.php
- backend/app/Services/Transactions/Checkers/PurchaseTransactionDependencyChecker.php
- backend/app/Services/Transactions/Checkers/JournalTransactionDependencyChecker.php
- backend/app/Services/Transactions/Checkers/CashBankTransactionDependencyChecker.php
- backend/app/Services/Transactions/Checkers/InventoryTransactionDependencyChecker.php
- backend/tests/Unit/TransactionDependencyServiceTest.php
- docs/phase-4e-transaction-dependency-foundation.md

FILE YANG MUNGKIN DIBUAT JIKA BELUM ADA:
- backend/app/Contracts/Transactions/TransactionDependencyChecker.php

FILE YANG BOLEH DIUBAH:
- backend/app/Services/Transactions/TransactionPolicyService.php
  Hanya untuk mengganti Noop dependency checker menjadi TransactionDependencyService atau memakai contract yang sama.
- backend/app/Providers/AppServiceProvider.php
  Jika perlu binding TransactionDependencyChecker ke TransactionDependencyService.
- docs/phase-4d-transaction-policy-service.md
  Jika perlu update catatan bahwa Phase 4E sudah menyediakan dependency service.

JANGAN UBAH:
- frontend/*
- backend/routes/api.php
- endpoint tenant/company management public
- migration transaksi nyata
- migration journal/invoice/stock movement
- tenant migration system

CONTRACT: TransactionDependencyChecker
Jika belum ada, buat:
backend/app/Contracts/Transactions/TransactionDependencyChecker.php

Interface:
- check(mixed $transaction, string $action, string $module): DependencyCheckResult
- hasBlockingDependencies(mixed $transaction, string $action, string $module): bool
- blockingReasons(mixed $transaction, string $action, string $module): array

Jika contract dari Phase 4D sudah ada dan belum memiliki check():
- Tambahkan method check() hanya jika tidak memecah implementasi lama.
- Jika berisiko memecah test, biarkan contract lama dan buat TransactionDependencyService menyediakan check() sendiri.
- Jangan membuat breaking changes besar.

DEPENDENCY CHECK RESULT:
Buat backend/app/Support/Transaction/DependencyCheckResult.php

Properties:
- bool $blocked
- array $reasons
- array $dependencies
- array $meta

Static constructors:
- clear(array $meta = []): self
- blocked(array $reasons, array $dependencies = [], array $meta = []): self

Methods:
- blocked(): bool
- clear(): bool
- reasons(): array
- dependencies(): array
- toArray(): array

toArray format:
[
  'blocked' => true/false,
  'reasons' => [],
  'dependencies' => [],
  'meta' => [],
]

Contoh dependencies:
[
  [
    'type' => 'payment',
    'module' => 'sales',
    'record_id' => 10,
    'record_number' => 'PAY-00010',
    'message' => 'Invoice sudah memiliki pembayaran.'
  ]
]

NOOP CHECKER:
Buat backend/app/Services/Transactions/NoopTransactionDependencyChecker.php

Behavior:
- check() return DependencyCheckResult::clear()
- hasBlockingDependencies() return false
- blockingReasons() return []

Tujuan:
- fallback jika module belum punya checker
- Phase 4E belum punya tabel transaksi nyata

PLACEHOLDER CHECKERS:
Buat folder:
backend/app/Services/Transactions/Checkers

Buat checker:
1. SalesTransactionDependencyChecker
2. PurchaseTransactionDependencyChecker
3. JournalTransactionDependencyChecker
4. CashBankTransactionDependencyChecker
5. InventoryTransactionDependencyChecker

Karena tabel transaksi belum ada, semua checker ini untuk Phase 4E boleh return clear().
Tetapi wajib berisi komentar/todo yang jelas tentang dependency yang harus dicek nanti.

Sales checker TODO:
- sales payments
- sales returns
- credit notes
- bank reconciliation
- stock movements used by costing
- fiscal year closed handled by Phase 4F/date guard

Purchase checker TODO:
- purchase payments
- purchase returns/debit notes
- bank reconciliation
- stock movements used by costing
- fiscal year closed handled by Phase 4F/date guard

Journal checker TODO:
- system-generated journals should be edited from source transaction
- linked adjustment/reversal journals
- fiscal year closed handled by Phase 4F/date guard

CashBank checker TODO:
- reconciliation
- allocation to invoices
- transfer pair transaction
- fiscal year closed handled by Phase 4F/date guard

Inventory checker TODO:
- stock opname finalized
- cost layers already used
- sales COGS generated from movement
- fiscal year closed handled by Phase 4F/date guard

TRANSACTION DEPENDENCY SERVICE:
Buat backend/app/Services/Transactions/TransactionDependencyService.php

Responsibilities:
- menjadi central dependency checker
- resolve checker berdasarkan module
- fallback ke NoopTransactionDependencyChecker jika module belum ada checker
- return DependencyCheckResult
- expose hasBlockingDependencies()
- expose blockingReasons()
- bisa menerima transaction object/array/model

Methods minimal:
- check(mixed $transaction, string $action, string $module): DependencyCheckResult
- hasBlockingDependencies(mixed $transaction, string $action, string $module): bool
- blockingReasons(mixed $transaction, string $action, string $module): array
- registerChecker(string $module, TransactionDependencyChecker $checker): void
- checkerFor(string $module): TransactionDependencyChecker

Default checker map:
- sales => SalesTransactionDependencyChecker
- purchase => PurchaseTransactionDependencyChecker
- journal => JournalTransactionDependencyChecker
- cash_bank => CashBankTransactionDependencyChecker
- inventory => InventoryTransactionDependencyChecker
- fallback => NoopTransactionDependencyChecker

Jika menggunakan Laravel container:
- Boleh inject checker lewat constructor.
- Atau buat map internal sederhana.
- Jangan over-engineer.

MODULE NAMES:
Gunakan TransactionModule dari Phase 4D jika sudah ada:
- sales
- purchase
- journal
- cash_bank
- inventory

Jika TransactionModule belum ada:
- gunakan string constants lokal minimal.
- Jangan membuat class duplikat jika sudah ada.

ACTION NAMES:
Gunakan TransactionAction dari Phase 4D jika sudah ada:
- edit
- void
- approve
- post
- create
- view

Dependency check terutama dipakai untuk:
- edit
- void
- post jika nanti diperlukan

INTEGRASI KE TRANSACTION POLICY SERVICE:
Jika TransactionPolicyService Phase 4D ada:
- Pastikan canEdit() memakai TransactionDependencyService.
- Pastikan canVoid() memakai TransactionDependencyService.
- Jika dependency blocked, TransactionPolicyService harus return deny:
  code: TRANSACTION_HAS_DEPENDENCY
  message: "Transaction has related records and cannot be modified."
  reasons: dependency reasons dari TransactionDependencyService

Jangan refactor besar TransactionPolicyService.
Cukup ganti dependency checker lama/noop ke service baru.

POLICY BEHAVIOR:
- Dependency clear => policy lanjut ke check berikutnya.
- Dependency blocked => edit/void ditolak.
- Dependency reasons harus disertakan di result.
- Dependency tidak memblok view.
- Dependency tidak dipakai untuk create karena transaksi belum ada.
- Dependency bisa dipakai untuk post nanti jika module membutuhkan, tapi untuk Phase 4E fokus edit/void.

TEST:
Buat backend/tests/Unit/TransactionDependencyServiceTest.php

Gunakan fake checker agar tidak butuh tabel database.

Test minimal:
1. default no dependency returns clear result
2. hasBlockingDependencies returns false when clear
3. blockingReasons returns empty array when clear
4. registered checker can block transaction
5. blocked checker returns reasons
6. blocked checker returns dependencies detail
7. service resolves sales checker
8. service resolves purchase checker
9. service resolves journal checker
10. service resolves cash_bank checker
11. service resolves inventory checker
12. unknown module uses noop checker
13. TransactionPolicyService canEdit denies when dependency blocked if TransactionPolicyService exists
14. TransactionPolicyService canVoid denies when dependency blocked if TransactionPolicyService exists
15. Dependency check does not block view if tested through policy

Fake blocked checker:
- return DependencyCheckResult::blocked(
    ['Invoice sudah memiliki pembayaran.'],
    [
      [
        'type' => 'payment',
        'module' => 'sales',
        'record_id' => 1,
        'record_number' => 'PAY-0001',
        'message' => 'Invoice sudah memiliki pembayaran.'
      ]
    ]
  )

DOKUMENTASI:
Buat docs/phase-4e-transaction-dependency-foundation.md

Isi:
- tujuan Phase 4E
- alasan dependency foundation dibuat sebelum invoice/journal/purchase/inventory
- rule edit/void hanya boleh jika tidak ada dependency
- hard delete tidak ada
- void sebagai pengganti delete
- dependency checker central
- dependency result format
- checker per module
- placeholder checker saat tabel modul belum ada
- integrasi dengan TransactionPolicyService Phase 4D
- contoh dependency sales invoice
- contoh dependency purchase invoice
- contoh dependency journal
- contoh dependency cash bank
- contoh dependency inventory
- batasan scope
- command test
- notes commit

PENTING DALAM DOKUMENTASI:
Jelaskan bahwa:
- Phase 4E belum melakukan query ke tabel sales_payments, sales_returns, stock_movements, dll karena tabel belum dibuat.
- Saat modul Sales/Purchase/CashBank/Inventory dibuat, checker placeholder harus diisi dengan query nyata.
- Fiscal year/period closed bukan tanggung jawab Phase 4E; itu Phase 4F.
- Dependency service hanya menjawab apakah transaksi punya hubungan ke record lain.
- Date/fiscal year guard menjawab apakah tanggal/periode mengizinkan perubahan.

COMMAND YANG DIJALANKAN:
Jika environment memungkinkan:
- php artisan test --filter=TransactionDependencyServiceTest
- php artisan test --filter=TransactionPolicyServiceTest

Jika environment tidak bisa menjalankan command, tulis jujur di final summary.

ACCEPTANCE CRITERIA:
Phase 4E selesai jika:
1. DependencyCheckResult dibuat
2. TransactionDependencyService dibuat
3. TransactionDependencyChecker contract tersedia atau digunakan dari Phase 4D
4. NoopTransactionDependencyChecker dibuat
5. Placeholder checker sales dibuat
6. Placeholder checker purchase dibuat
7. Placeholder checker journal dibuat
8. Placeholder checker cash_bank dibuat
9. Placeholder checker inventory dibuat
10. TransactionDependencyService resolve checker berdasarkan module
11. Unknown module fallback ke noop checker
12. Blocked dependency mengembalikan reasons
13. Blocked dependency mengembalikan dependency detail
14. TransactionPolicyService canEdit memakai dependency service jika Phase 4D ada
15. TransactionPolicyService canVoid memakai dependency service jika Phase 4D ada
16. Test TransactionDependencyServiceTest dibuat
17. Dokumentasi Phase 4E dibuat
18. Tidak ada tabel transaksi nyata dibuat
19. Tidak ada route API baru dibuat
20. Tidak ada frontend dibuat
21. Tidak ada hard delete endpoint dibuat
22. Tidak ada modul akuntansi dibuat
23. Tidak ada SQLite-specific logic dibuat
24. Tidak ada fiscal year/date guard detail dibuat
25. Tidak ada monthly closing reminder dibuat

FINAL SUMMARY:
Sertakan:
- file dibuat
- file diubah jika ada
- integrasi ke TransactionPolicyService jika dilakukan
- test yang dibuat
- command yang berhasil dijalankan
- command yang gagal/tidak bisa dijalankan
- catatan bahwa Phase 4E hanya dependency foundation
- catatan bahwa checker module masih placeholder sampai tabel modul dibuat
- catatan bahwa fiscal year/date guard akan dibuat di Phase 4F
- catatan bahwa tidak ada modul transaksi nyata dibuat

COMMIT MESSAGE:
add transaction dependency foundation

COMMIT BODY:
Phase 4E: add transaction dependency foundation with dependency result helper, central dependency service, checker contract/fallback, module placeholder checkers, policy integration, unit tests, and documentation. This prepares edit/void blocking based on related records without adding accounting modules or transaction tables.