# Phase 4E — Transaction Dependency Foundation

Phase 4E menambahkan fondasi dependency checking agar semua modul transaksi nanti punya cara standar untuk memblok edit/void bila transaksi sudah memiliki hubungan dengan record lain.

## Tujuan

- Hard delete tidak ada → delete diganti void.
- Edit/void boleh hanya jika tidak ada blocking dependency.
- Dependency checker harus bisa mengembalikan alasan yang jelas (bukan hanya true/false).
- Desain extensible per module (sales/purchase/journal/cash_bank/inventory).

## Yang Dibuat

### DependencyCheckResult
File: `backend/app/Support/Transaction/DependencyCheckResult.php`

Hasil check:
- `blocked` true/false
- `reasons` array
- `dependencies` array (detail record terkait)
- `meta` array

### TransactionDependencyChecker contract
File: `backend/app/Contracts/Transactions/TransactionDependencyChecker.php`

Methods:
- `check()` → `DependencyCheckResult`
- `hasBlockingDependencies()`
- `blockingReasons()`

### TransactionDependencyService (registry)
File: `backend/app/Services/Transactions/TransactionDependencyService.php`

Responsibilities:
- resolve checker berdasarkan module
- fallback ke `NoopTransactionDependencyChecker`
- expose `check/hasBlockingDependencies/blockingReasons`

### Placeholder Checkers
Folder: `backend/app/Services/Transactions/Checkers`

Checker tersedia:
- `SalesTransactionDependencyChecker`
- `PurchaseTransactionDependencyChecker`
- `JournalTransactionDependencyChecker`
- `CashBankTransactionDependencyChecker`
- `InventoryTransactionDependencyChecker`

Saat ini semua checker masih return clear() karena tabel transaksi nyata belum ada, tetapi sudah berisi TODO dependency yang harus dicek saat modul dibuat.

## Integrasi ke TransactionPolicyService

`TransactionPolicyService` memakai dependency checker untuk `edit/void`:
- Jika blocked → deny code `TRANSACTION_HAS_DEPENDENCY`
- message: `"Transaction has related records and cannot be modified."`
- reasons diambil dari `TransactionDependencyService`

## Testing

Jalankan:
- `cd backend`
- `php artisan test --filter=TransactionDependencyServiceTest`

## Batasan Scope

- Tidak membuat tabel transaksi nyata (invoice/payment/return/stock movement)
- Tidak melakukan query dependency ke tabel yang belum ada
- Tidak membuat endpoint transaksi

