Kita masuk ke Phase 4M project TenantAppDevelopment.

NAMA PHASE:
Phase 4M — Account Mapping Foundation

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
- Data transaksi, chart of accounts, jurnal, account mapping, dan laporan berada di tenant database

PENTING TENTANG DATABASE:
- Tetap pertahankan konsep 1 company = 1 tenant database.
- SQLite hanya database development/MVP awal.
- Production nanti bisa MySQL/MariaDB/PostgreSQL.
- Jangan membuat logic yang hanya bergantung pada SQLite.
- Jangan mengubah arsitektur menjadi semua transaksi company dalam satu database transaksi.
- Phase 4M tidak membuat Chart of Accounts table.
- Phase 4M tidak membuat account mapping table final dengan account_id karena COA belum ada.
- Phase 4M hanya membuat fondasi/kontrak/standard mapping agar Phase 5 bisa mengimplementasikan account mapping setelah COA tersedia.

STATUS SEBELUM PHASE 4M:
Phase 4A sudah/akan membuat:
- company_accounting_settings
- company_module_settings
- auto_post_transactions
- tax_enabled
- inventory_enabled
- sales_enabled
- purchase_enabled
- cash_bank_enabled

Phase 4B sudah/akan membuat:
- PermissionService
- granular permission seperti settings.company.edit, coa.create, sales.post, purchase.post, inventory.manage

Phase 4D sudah/akan membuat:
- TransactionPolicyService
- canCreate/canEdit/canVoid/canApprove/canPost

Phase 4G sudah/akan membuat:
- DocumentNumberService

Phase 4H sudah/akan membuat:
- SourceLink standard

Phase 4L sudah/akan membuat:
- OpeningBalance foundation
- source_type opening_balance
- opening balance harus masuk lewat opening journal

TUJUAN PHASE 4M:
Membuat fondasi account mapping agar semua modul transaksi nanti tidak hardcode account_id.

Contoh:
Sales Invoice perlu tahu:
- Debit Piutang Usaha
- Kredit Penjualan
- Kredit PPN Keluaran jika tax aktif

Purchase Invoice perlu tahu:
- Debit Persediaan / Beban
- Debit PPN Masukan jika tax aktif
- Kredit Utang Usaha

Inventory perlu tahu:
- Debit HPP
- Kredit Persediaan

Semua akun tersebut harus berasal dari account mapping per tenant/company, bukan hardcode.

KEPUTUSAN BISNIS WAJIB:
1. Account mapping harus berada di tenant database karena menunjuk ke chart_of_accounts tenant.
2. Namun Phase 4M belum membuat table final account_mappings karena chart_of_accounts belum ada.
3. Phase 4M hanya membuat:
   - mapping key constants
   - mapping module constants
   - mapping requirement definitions
   - config/account_mappings.php
   - AccountMappingService skeleton
   - AccountMappingValidator skeleton
   - tests helper
   - documentation
4. Table account_mappings final dibuat di Phase 5 setelah chart_of_accounts tersedia.
5. Jangan menyimpan tenant account_id di central database.
6. Jangan hardcode account_id.
7. Jika mapping wajib belum ada, posting transaksi nanti harus ditolak dengan pesan jelas.
8. Jika auto_post_transactions ON dan mapping belum lengkap, transaksi tidak boleh diposting otomatis.
9. Jika auto_post_transactions OFF, transaksi boleh disimpan draft, tetapi tidak boleh post sampai mapping lengkap.
10. Suspense account boleh disiapkan sebagai mapping key, tetapi tidak boleh dipakai otomatis sembarangan.
11. Account mapping harus fleksibel key-value, bukan banyak kolom kaku.
12. Mapping key format memakai module.purpose, contoh sales.accounts_receivable.

SCOPE YANG HARUS DIKERJAKAN:
1. Buat config/account_mappings.php.
2. Buat AccountMappingModule support class.
3. Buat AccountMappingKey support class.
4. Buat AccountMappingRequirement value object/helper.
5. Buat AccountMappingService skeleton.
6. Buat AccountMappingValidator.
7. Buat tests untuk mapping keys, requirement, dan validator.
8. Buat dokumentasi docs/phase-4m-account-mapping-foundation.md.
9. Update docs Phase 4L jika perlu untuk menjelaskan opening_balance.equity / closing.retained_earnings mapping.

JANGAN MENGERJAKAN:
- chart_of_accounts table
- account_mappings table final dengan account_id
- foreign key ke chart_of_accounts
- COA seeder
- Journal Entry Engine
- Sales Invoice
- Purchase Invoice
- Inventory
- Cash Bank
- Tax advanced
- Account Mapping UI
- frontend UI
- posting journal otomatis
- create company endpoint public
- create tenant endpoint public
- migrate tenant endpoint public
- assign user endpoint public

FILE BARU:
- backend/config/account_mappings.php
- backend/app/Support/AccountMapping/AccountMappingModule.php
- backend/app/Support/AccountMapping/AccountMappingKey.php
- backend/app/Support/AccountMapping/AccountMappingRequirement.php
- backend/app/Services/AccountMapping/AccountMappingService.php
- backend/app/Services/AccountMapping/AccountMappingValidator.php
- backend/tests/Unit/AccountMappingServiceTest.php
- docs/phase-4m-account-mapping-foundation.md

Jika folder belum ada, buat:
- backend/app/Support/AccountMapping
- backend/app/Services/AccountMapping
- backend/tests/Unit

FILE YANG BOLEH DIUBAH:
- docs/phase-4l-opening-balance-standard.md
- docs/phase-5-master-data-akuntansi.md jika sudah ada

JANGAN UBAH:
- frontend/*
- backend/routes/api.php
- tenant migrations untuk COA
- transaction modules
- journal modules
- public tenant/company management endpoints

CONFIG account_mappings.php:
Buat backend/config/account_mappings.php

Isi minimal:

return [
    'modules' => [
        'sales',
        'purchase',
        'inventory',
        'cash_bank',
        'journal',
        'opening_balance',
        'closing',
        'tax',
    ],

    'required_mappings' => [
        'sales.accounts_receivable' => [
            'module' => 'sales',
            'label' => 'Accounts Receivable',
            'required' => true,
            'account_types' => ['asset'],
            'description' => 'Default receivable account for sales invoices.',
        ],
        'sales.revenue' => [
            'module' => 'sales',
            'label' => 'Sales Revenue',
            'required' => true,
            'account_types' => ['revenue'],
            'description' => 'Default revenue account for sales invoices.',
        ],
        'sales.discount' => [
            'module' => 'sales',
            'label' => 'Sales Discount',
            'required' => false,
            'account_types' => ['expense', 'revenue'],
            'description' => 'Default sales discount account.',
        ],
        'sales.return' => [
            'module' => 'sales',
            'label' => 'Sales Return',
            'required' => false,
            'account_types' => ['revenue'],
            'description' => 'Default sales return account.',
        ],
        'sales.tax_output' => [
            'module' => 'sales',
            'label' => 'Output Tax',
            'required' => false,
            'account_types' => ['liability'],
            'description' => 'Default output tax account.',
        ],

        'purchase.accounts_payable' => [
            'module' => 'purchase',
            'label' => 'Accounts Payable',
            'required' => true,
            'account_types' => ['liability'],
            'description' => 'Default payable account for purchase invoices.',
        ],
        'purchase.default_purchase' => [
            'module' => 'purchase',
            'label' => 'Default Purchase / Expense',
            'required' => true,
            'account_types' => ['asset', 'expense'],
            'description' => 'Default purchase or expense account.',
        ],
        'purchase.tax_input' => [
            'module' => 'purchase',
            'label' => 'Input Tax',
            'required' => false,
            'account_types' => ['asset'],
            'description' => 'Default input tax account.',
        ],

        'inventory.asset' => [
            'module' => 'inventory',
            'label' => 'Inventory Asset',
            'required' => true,
            'account_types' => ['asset'],
            'description' => 'Default inventory asset account.',
        ],
        'inventory.cogs' => [
            'module' => 'inventory',
            'label' => 'Cost of Goods Sold',
            'required' => true,
            'account_types' => ['expense'],
            'description' => 'Default COGS account.',
        ],
        'inventory.adjustment_gain' => [
            'module' => 'inventory',
            'label' => 'Inventory Adjustment Gain',
            'required' => false,
            'account_types' => ['revenue', 'expense'],
            'description' => 'Default gain account for positive stock adjustment.',
        ],
        'inventory.adjustment_loss' => [
            'module' => 'inventory',
            'label' => 'Inventory Adjustment Loss',
            'required' => false,
            'account_types' => ['expense'],
            'description' => 'Default loss account for negative stock adjustment.',
        ],

        'cash_bank.default_cash' => [
            'module' => 'cash_bank',
            'label' => 'Default Cash',
            'required' => true,
            'account_types' => ['asset'],
            'description' => 'Default cash account.',
        ],
        'cash_bank.default_bank' => [
            'module' => 'cash_bank',
            'label' => 'Default Bank',
            'required' => true,
            'account_types' => ['asset'],
            'description' => 'Default bank account.',
        ],
        'cash_bank.bank_admin_fee' => [
            'module' => 'cash_bank',
            'label' => 'Bank Admin Fee',
            'required' => false,
            'account_types' => ['expense'],
            'description' => 'Default bank admin fee account.',
        ],
        'cash_bank.bank_interest_income' => [
            'module' => 'cash_bank',
            'label' => 'Bank Interest Income',
            'required' => false,
            'account_types' => ['revenue'],
            'description' => 'Default bank interest income account.',
        ],

        'opening_balance.equity' => [
            'module' => 'opening_balance',
            'label' => 'Opening Balance Equity',
            'required' => true,
            'account_types' => ['equity'],
            'description' => 'Default balancing equity account for opening balances if needed.',
        ],

        'closing.retained_earnings' => [
            'module' => 'closing',
            'label' => 'Retained Earnings',
            'required' => true,
            'account_types' => ['equity'],
            'description' => 'Default retained earnings account for fiscal closing.',
        ],
        'closing.current_year_earnings' => [
            'module' => 'closing',
            'label' => 'Current Year Earnings',
            'required' => true,
            'account_types' => ['equity'],
            'description' => 'Default current year earnings account.',
        ],

        'journal.suspense' => [
            'module' => 'journal',
            'label' => 'Suspense Account',
            'required' => false,
            'account_types' => ['asset', 'liability', 'equity', 'expense', 'revenue'],
            'description' => 'Suspense account for temporary classification. Use carefully.',
        ],
    ],
];

ACCOUNT MAPPING MODULE:
Buat backend/app/Support/AccountMapping/AccountMappingModule.php

Constants:
- SALES = 'sales'
- PURCHASE = 'purchase'
- INVENTORY = 'inventory'
- CASH_BANK = 'cash_bank'
- JOURNAL = 'journal'
- OPENING_BALANCE = 'opening_balance'
- CLOSING = 'closing'
- TAX = 'tax'

Methods:
- all(): array
- exists(string $module): bool

ACCOUNT MAPPING KEY:
Buat backend/app/Support/AccountMapping/AccountMappingKey.php

Constants minimal:
Sales:
- SALES_ACCOUNTS_RECEIVABLE = 'sales.accounts_receivable'
- SALES_REVENUE = 'sales.revenue'
- SALES_DISCOUNT = 'sales.discount'
- SALES_RETURN = 'sales.return'
- SALES_TAX_OUTPUT = 'sales.tax_output'

Purchase:
- PURCHASE_ACCOUNTS_PAYABLE = 'purchase.accounts_payable'
- PURCHASE_DEFAULT_PURCHASE = 'purchase.default_purchase'
- PURCHASE_TAX_INPUT = 'purchase.tax_input'

Inventory:
- INVENTORY_ASSET = 'inventory.asset'
- INVENTORY_COGS = 'inventory.cogs'
- INVENTORY_ADJUSTMENT_GAIN = 'inventory.adjustment_gain'
- INVENTORY_ADJUSTMENT_LOSS = 'inventory.adjustment_loss'

Cash Bank:
- CASH_BANK_DEFAULT_CASH = 'cash_bank.default_cash'
- CASH_BANK_DEFAULT_BANK = 'cash_bank.default_bank'
- CASH_BANK_ADMIN_FEE = 'cash_bank.bank_admin_fee'
- CASH_BANK_INTEREST_INCOME = 'cash_bank.bank_interest_income'

Opening/Closing:
- OPENING_BALANCE_EQUITY = 'opening_balance.equity'
- CLOSING_RETAINED_EARNINGS = 'closing.retained_earnings'
- CLOSING_CURRENT_YEAR_EARNINGS = 'closing.current_year_earnings'

Journal:
- JOURNAL_SUSPENSE = 'journal.suspense'

Methods:
- all(): array
- exists(string $key): bool
- moduleFor(string $key): ?string
- requiredKeys(): array
- optionalKeys(): array
- keysForModule(string $module): array

ACCOUNT MAPPING REQUIREMENT:
Buat backend/app/Support/AccountMapping/AccountMappingRequirement.php

Properties:
- string $key
- string $module
- string $label
- bool $required
- array $accountTypes
- ?string $description

Static:
- fromConfig(string $key, array $config): self

Methods:
- toArray(): array
- allowsAccountType(?string $accountType): bool
- isRequired(): bool

ACCOUNT MAPPING SERVICE:
Buat backend/app/Services/AccountMapping/AccountMappingService.php

Responsibilities:
- membaca daftar mapping requirement dari config
- menyediakan key/module helper
- skeleton untuk get mapping value nanti setelah table account_mappings ada
- validasi mapping lengkap
- tidak query chart_of_accounts karena belum ada

Methods minimal:
- allRequirements(): array
- requirement(string $key): ?AccountMappingRequirement
- requirementsForModule(string $module): array
- requiredKeys(?string $module = null): array
- optionalKeys(?string $module = null): array
- exists(string $key): bool
- isRequired(string $key): bool
- allowedAccountTypes(string $key): array
- validateRequiredKeys(array $providedMappingKeys, ?string $module = null): array
- validateAccountTypeForKey(string $key, ?string $accountType): array

Return validateRequiredKeys:
[
  'valid' => true/false,
  'missing' => [],
  'errors' => [],
]

Return validateAccountTypeForKey:
[
  'valid' => true/false,
  'errors' => [],
]

Skeleton future methods:
- getAccountId(string $key): ?int
- requireAccountId(string $key): int
- mappingCompleteForModule(string $module): bool

For Phase 4M:
- these future methods may throw RuntimeException with clear message:
  "Account mapping storage is not implemented until Chart of Accounts is available."

ACCOUNT MAPPING VALIDATOR:
Buat backend/app/Services/AccountMapping/AccountMappingValidator.php

Methods:
- validateProvidedMappings(array $mappings): array
- validateModuleRequirements(string $module, array $providedMappingKeys): array
- validateAccountType(string $mappingKey, ?string $accountType): array

Behavior:
- Unknown mapping key => error.
- Missing required mapping => error.
- Account type not allowed => error.
- Optional mapping missing => no error.
- Unknown module => error.

TEST:
Buat backend/tests/Unit/AccountMappingServiceTest.php

Test minimal:
1. allRequirements returns configured mappings
2. sales.accounts_receivable exists
3. sales.accounts_receivable is required
4. sales.discount is optional
5. moduleFor sales.revenue returns sales
6. keysForModule sales contains sales.revenue
7. requiredKeys for sales contains sales.accounts_receivable and sales.revenue
8. validateRequiredKeys passes when required keys provided
9. validateRequiredKeys fails when required keys missing
10. validateAccountTypeForKey accepts asset for sales.accounts_receivable
11. validateAccountTypeForKey rejects expense for sales.accounts_receivable
12. validateAccountTypeForKey accepts revenue for sales.revenue
13. unknown mapping key returns error
14. unknown module returns error
15. future getAccountId method throws clear RuntimeException until table exists

DOKUMENTASI:
Buat docs/phase-4m-account-mapping-foundation.md

Isi wajib:
- tujuan Phase 4M
- kenapa account mapping dibutuhkan
- kenapa tidak boleh hardcode account_id
- kenapa mapping final harus di tenant database
- kenapa Phase 4M belum membuat account_mappings table
- hubungan dengan Phase 5 COA
- hubungan dengan Phase 6 Journal Engine
- hubungan dengan Sales/Purchase/Inventory/CashBank/Closing
- daftar mapping modules
- daftar mapping keys
- required vs optional mapping
- account type validation
- behavior jika mapping belum lengkap
- auto_post ON dan mapping belum lengkap harus ditolak saat posting nanti
- auto_post OFF boleh draft tetapi tidak boleh post tanpa mapping
- suspense account warning
- batasan scope
- command test
- notes commit

Jelaskan secara eksplisit:
- Phase 4M belum membuat COA.
- Phase 4M belum membuat table account_mappings final.
- Phase 4M belum membuat UI settings.
- Phase 4M hanya standard/helper/service skeleton.
- Implementasi penyimpanan account_id dilakukan setelah COA tersedia.

COMMAND YANG DIJALANKAN:
Jika environment memungkinkan:
- php artisan test --filter=AccountMappingServiceTest

Jika environment tidak bisa menjalankan command, tulis jujur di final summary.

ACCEPTANCE CRITERIA:
Phase 4M selesai jika:
1. config/account_mappings.php dibuat
2. AccountMappingModule dibuat
3. AccountMappingKey dibuat
4. AccountMappingRequirement dibuat
5. AccountMappingService dibuat
6. AccountMappingValidator dibuat
7. AccountMappingServiceTest dibuat
8. Dokumentasi Phase 4M dibuat
9. Required mapping bisa dibaca
10. Optional mapping bisa dibaca
11. Required mapping validation bekerja
12. Account type validation bekerja
13. Unknown key/module ditangani jelas
14. Tidak ada COA table dibuat
15. Tidak ada account_mappings table final dibuat
16. Tidak ada route API baru dibuat
17. Tidak ada frontend dibuat
18. Tidak ada posting journal dibuat
19. Tidak ada public tenant/company management endpoint dibuat

FINAL SUMMARY:
Sertakan:
- file dibuat
- file diubah jika ada
- test yang dibuat
- command yang berhasil dijalankan
- command yang gagal/tidak bisa dijalankan
- catatan bahwa Phase 4M hanya account mapping foundation
- catatan bahwa table mapping final menunggu COA di Phase 5
- catatan bahwa tidak ada COA/journal/module transaksi dibuat

COMMIT MESSAGE:
add account mapping foundation

COMMIT BODY:
Phase 4M: add account mapping foundation with mapping config, mapping keys/modules, requirement helpers, validator, service skeleton, tests, and documentation. This defines default account mapping requirements without creating COA, account mapping storage, journal posting, or UI.