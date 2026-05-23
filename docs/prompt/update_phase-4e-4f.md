Selesai mengerjakan Phase 4E dan Phase 4F sesuai prompt.

Yang beresin bug penting

Fix fatal error di DependencyCheckResult (method static/instance bentrok) → sekarang pakai isBlocked() / isClear().
File dibuat (baru)

backend/app/Support/Transaction/DependencyCheckResult.php
backend/app/Services/Transactions/TransactionDependencyService.php
backend/app/Services/Transactions/TransactionDateGuardService.php
backend/app/Services/Transactions/Checkers/BaseTransactionDependencyChecker.php
backend/app/Services/Transactions/Checkers/SalesTransactionDependencyChecker.php
backend/app/Services/Transactions/Checkers/PurchaseTransactionDependencyChecker.php
backend/app/Services/Transactions/Checkers/JournalTransactionDependencyChecker.php
backend/app/Services/Transactions/Checkers/CashBankTransactionDependencyChecker.php
backend/app/Services/Transactions/Checkers/InventoryTransactionDependencyChecker.php
backend/app/Models/FiscalYear.php
backend/app/Models/AccountingPeriod.php
backend/app/Services/Accounting/FiscalYearService.php
backend/app/Services/Accounting/PeriodLockService.php
backend/app/Services/Accounting/AnnualClosingGateService.php
backend/database/migrations/central/2026_05_17_000002_create_fiscal_years_table.php
backend/database/migrations/central/2026_05_17_000003_create_accounting_periods_table.php
backend/app/Http/Controllers/Api/Accounting/FiscalYearStatusController.php
backend/tests/Unit/TransactionDependencyServiceTest.php
backend/tests/Feature/Accounting/FiscalYearDateGuardTest.php
docs/phase-4e-transaction-dependency-foundation.md
docs/phase-4f-fiscal-year-period-lock-date-guard.md
File diubah

backend/app/Contracts/Transactions/TransactionDependencyChecker.php
backend/app/Services/Transactions/NoopTransactionDependencyChecker.php
backend/app/Services/Transactions/TransactionPolicyService.php
backend/app/Providers/AppServiceProvider.php
backend/app/Models/Company.php
backend/routes/api.php
backend/tests/Unit/TransactionPolicyServiceTest.php
Catatan implementasi penting

Phase 4E: TransactionDependencyService sebagai registry checker per module + placeholder checkers.
Phase 4F:
Central tables: fiscal_years, accounting_periods.
FiscalYearService sekarang memblok pembuatan fiscal year baru jika fiscal year sebelumnya belum closed.
TransactionDateGuardService mengembalikan block (deny) dan warning sesuai setting.
Sesuai rule prompt: tidak ada monthly transaction blocking (status accounting_periods tidak dipakai untuk memblok transaksi di Phase 4F).
Endpoint minimal: GET /api/accounting/fiscal-year/status (route sudah ada di backend/routes/api.php).
Command yang perlu kamu jalankan

cd backend
composer dump-autoload
php artisan migrate
php artisan test
Checklist yang perlu kamu cek

Migrations central jalan dan tabel fiscal_years + accounting_periods terbentuk.
php artisan test hijau (87 tests passed).
Endpoint GET /api/accounting/fiscal-year/status bisa diakses sesuai middleware/permission yang sudah ada di project.
Catatan untuk Phase berikutnya

Placeholder dependency checkers (sales/purchase/journal/cash_bank/inventory) masih return “clear” sampai modul transaksinya benar-benar dibuat.
Mekanisme “warning needs confirmation UI” belum ada (baru foundation result/warning di backend).
