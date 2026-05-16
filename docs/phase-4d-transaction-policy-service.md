# Phase 4D — Transaction Policy Service

Phase 4D membuat **TransactionPolicyService** sebagai pusat keputusan apakah suatu aksi transaksi boleh dilakukan. Phase ini tidak membuat tabel transaksi nyata maupun endpoint transaksi (create/edit/void).

## Tujuan

- Menyatukan rule permission + company settings + lifecycle + dependency + date guard dalam satu service.
- Menjadi fondasi reusable untuk modul transaksi:
  - journal
  - sales
  - purchase
  - cash bank
  - inventory
  - fixed asset (nanti)

## Hubungan dengan Phase Sebelumnya

- Phase 4A (Company Settings):
  - dipakai untuk flag seperti `allow_edit_transactions`, `allow_edit_posted_transactions`, `allow_void_transactions`, dll.
- Phase 4B (Permissions):
  - memakai permission granular `module.action` (contoh: `sales.edit`, `journal.post`).
- Phase 4C (Lifecycle):
  - memakai `TransactionLifecycle` untuk menentukan status editable/voidable/terminal.

## Konsep Kunci

- Hard delete tidak ada → delete diganti void.
- Void terminal/read-only.
- Posted transaction **boleh** editable secara lifecycle, tetapi tetap tunduk ke:
  - company settings
  - permissions
  - dependency
  - fiscal year / period lock / date guard (Phase 4F)
- Void hidden by default adalah concern UI/query (bukan blocking di `canView`).

## File yang Ditambahkan (Phase 4D)

- Support:
  - `backend/app/Support/Transaction/TransactionAction.php`
  - `backend/app/Support/Transaction/TransactionModule.php`
  - `backend/app/Support/Transaction/TransactionPolicyResult.php`
- Contracts (placeholder):
  - `backend/app/Contracts/Transactions/TransactionDependencyChecker.php`
  - `backend/app/Contracts/Transactions/TransactionDateGuard.php`
- Noop placeholder implementations:
  - `backend/app/Services/Transactions/NoopTransactionDependencyChecker.php`
  - `backend/app/Services/Transactions/NoopTransactionDateGuard.php`
- Service:
  - `backend/app/Services/Transactions/TransactionPolicyService.php`
- Test:
  - `backend/tests/Unit/TransactionPolicyServiceTest.php`

## Permission Mapping

`TransactionModule::permissionFor($module, $action)` menghasilkan permission:
- `journal.create` / `journal.edit` / `journal.void` / `journal.approve` / `journal.post` / `journal.view`
- `sales.create` / `sales.edit` / `sales.void` / `sales.approve` / `sales.post` / `sales.view`
- `purchase.create` / `purchase.edit` / `purchase.void` / `purchase.approve` / `purchase.post` / `purchase.view`
- `cash_bank.create` / `cash_bank.edit` / `cash_bank.void` / `cash_bank.approve` / `cash_bank.post` / `cash_bank.view`
- inventory:
  - `inventory.view` untuk view
  - `inventory.manage` untuk create/edit/void (placeholder hingga granular inventory adjustment dibuat)

Jika module/action tidak dikenal, policy akan deny dengan code:
- `UNKNOWN_TRANSACTION_MODULE`
- `UNKNOWN_TRANSACTION_ACTION`

## Policy Order (Standard)

TransactionPolicyService mengecek berurutan:
1. validasi module/action
2. permission granular `module.action`
3. company setting yang relevan
4. lifecycle status (jika ada transaksi)
5. dependency checker (placeholder Phase 4E)
6. date guard / fiscal period guard (placeholder Phase 4F)
7. allow jika semua lolos

## Rule Summary

### CREATE
- permission: `module.create`
- date guard check (jika `transactionDate` ada)
- return warning jika date guard warning
- deny jika blocked

### VIEW
- permission: `module.view`
- tidak memblok hanya karena status `void` (void hidden default adalah UI/query concern)

### EDIT
- permission: `module.edit`
- status `void` → deny `TRANSACTION_ALREADY_VOID`
- lifecycle editable? jika tidak → deny `TRANSACTION_STATUS_NOT_EDITABLE`
- setting `allow_edit_transactions` harus true
- jika status `posted`, `allow_edit_posted_transactions` harus true
- deny jika ada dependency
- date guard check dari `transaction_date`

### VOID
- permission: `module.void`
- status `void` → deny `TRANSACTION_ALREADY_VOID`
- lifecycle voidable? jika tidak → deny `TRANSACTION_STATUS_NOT_VOIDABLE`
- setting `allow_void_transactions` harus true
- deny jika ada dependency
- date guard check dari `transaction_date`

### APPROVE / POST
- status `void` ditolak
- untuk Phase 4D:
  - posted tidak boleh post ulang → deny `TRANSACTION_ALREADY_POSTED`
  - approve untuk `approved/posted` → deny `TRANSACTION_STATUS_NOT_APPROVABLE`

## Placeholder (Phase 4E/4F)

- Phase 4E: TransactionDependencyService akan menggantikan `NoopTransactionDependencyChecker`.
- Phase 4F: FiscalYear/PeriodLock/DateGuard akan menggantikan `NoopTransactionDateGuard`.

## Error/Warning Codes

Beberapa code yang dipakai:
- `TRANSACTION_ALLOWED`
- `PERMISSION_DENIED`
- `TRANSACTION_STATUS_MISSING`
- `TRANSACTION_STATUS_NOT_EDITABLE`
- `TRANSACTION_STATUS_NOT_VOIDABLE`
- `TRANSACTION_ALREADY_VOID`
- `COMPANY_SETTING_EDIT_DISABLED`
- `COMPANY_SETTING_EDIT_POSTED_DISABLED`
- `COMPANY_SETTING_VOID_DISABLED`
- `TRANSACTION_HAS_DEPENDENCY`
- `TRANSACTION_DATE_WARNING`
- `TRANSACTION_DATE_BLOCKED`
- `UNKNOWN_TRANSACTION_MODULE`
- `UNKNOWN_TRANSACTION_ACTION`

## Batasan Scope

- Tidak ada endpoint transaksi (create/edit/void/post/approve)
- Tidak ada tabel transaksi nyata
- Tidak ada dependency engine final
- Tidak ada fiscal year / period lock / date guard final
- Tidak ada modul akuntansi

## Command Test

- `cd backend`
- `php artisan test --filter=TransactionPolicyServiceTest`

## Notes Commit

Commit message:
`add transaction policy service foundation`

