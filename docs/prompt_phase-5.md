Kita masuk ke Phase 5 project TenantAppDevelopment.

NAMA PHASE:
Phase 5 — Master Data Akuntansi

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
- Data master akuntansi berada di tenant database, bukan central database
- Data antar company tidak boleh dicampur dalam satu tenant database yang sama

PENTING:
- Tetap pertahankan konsep 1 company = 1 tenant database.
- SQLite hanya database development/MVP awal.
- Production nanti bisa MySQL/MariaDB/PostgreSQL.
- Jangan membuat logic yang hanya bergantung pada SQLite.
- Jangan mengubah arsitektur menjadi semua transaksi company dalam satu database transaksi.
- Phase 5 mulai membuat tabel bisnis nyata di tenant database.
- Phase 5 belum membuat transaksi journal/sales/purchase/cash/inventory movement.
- Phase 5 fokus pada master data:
  1. Chart of Accounts
  2. Contacts
  3. Units
  4. Product Categories
  5. Products
  6. Warehouses
  7. Account Mappings implementation awal setelah COA tersedia

STATUS SEBELUM PHASE 5:
Phase 2 sudah/akan membuat:
- auth:sanctum
- company.access middleware
- TenantContext
- validasi X-Company-ID
- user hanya bisa akses company miliknya

Phase 3 sudah/akan membuat:
- tenant database generator
- tenant migration command
- tenant database connection manager
- tenant isolation testing

Phase 4A sudah/akan membuat:
- company_accounting_settings
- company_module_settings
- CompanySettingService

Phase 4B sudah/akan membuat:
- granular permissions
- PermissionService
- EnsurePermission middleware

Phase 4C sudah/akan membuat:
- TransactionLifecycle
- status draft/approved/posted/void

Phase 4D sudah/akan membuat:
- TransactionPolicyService

Phase 4F sudah/akan membuat:
- FiscalYearService
- TransactionDateGuardService

Phase 4G sudah/akan membuat:
- DocumentNumberService

Phase 4H sudah/akan membuat:
- SourceLink standard

Phase 4K sudah/akan membuat:
- ReportVisibilityService

Phase 4L sudah/akan membuat:
- OpeningBalance foundation

Phase 4M sudah/akan membuat:
- AccountMapping foundation
- config/account_mappings.php
- AccountMappingKey
- AccountMappingService skeleton

Phase 4N sudah/akan membuat:
- Standard API error codes

TUJUAN PHASE 5:
Membuat master data akuntansi pertama di tenant database agar phase berikutnya seperti Journal Entry, General Ledger, Sales, Purchase, Cash Bank, dan Inventory punya data dasar yang valid.

Phase 5 harus membuat:
1. Tenant migrations
2. Tenant models
3. Backend API CRUD master data
4. Validation requests
5. Services
6. Permissions
7. Tests
8. Documentation

Phase 5 tidak membuat frontend UI besar.
Frontend UI master data bisa dibuat nanti atau setelah API stabil.

KEPUTUSAN BISNIS WAJIB:
1. Semua master data masuk tenant database.
2. Tidak ada master data akuntansi yang masuk central database.
3. Chart of Accounts menjadi dasar semua posting jurnal.
4. Opening balance tidak disimpan sebagai angka mati di COA.
5. Opening balance tetap lewat opening journal sesuai Phase 4L.
6. COA boleh punya flag is_cash_bank untuk menandai akun kas/bank.
7. is_cash_bank bukan tipe akun baru; account_type tetap asset.
8. Akun dengan is_cash_bank true harus account_type asset.
9. Master data tidak di-hard delete jika sudah dipakai nanti.
10. Untuk Phase 5, delete master data sebaiknya berupa deactivate/nonaktif.
11. Inactive master data tidak muncul di dropdown transaksi baru.
12. Data lama tetap bisa menampilkan master data inactive.
13. Contacts menggunakan satu tabel fleksibel, bukan customer/supplier terpisah.
14. Satu contact bisa menjadi customer dan supplier sekaligus.
15. Products mendukung goods/service/non_inventory.
16. Stock item harus punya unit.
17. Warehouse dibuat sederhana dulu.
18. Account mapping final mulai dibuat di Phase 5 karena COA sudah tersedia.
19. Account mapping menunjuk ke chart_of_accounts di tenant database.
20. Account mapping tidak boleh disimpan di central database.
21. Semua endpoint Phase 5 wajib auth:sanctum + company.access.
22. Semua endpoint Phase 5 wajib memakai permission granular.
23. Tidak ada endpoint create tenant/company dibuat di Phase 5.

SCOPE PHASE 5:
A. Tenant database migrations:
- chart_of_accounts
- contacts
- units
- product_categories
- products
- warehouses
- account_mappings

B. Tenant models:
- ChartOfAccount
- Contact
- Unit
- ProductCategory
- Product
- Warehouse
- AccountMapping

C. Backend services:
- ChartOfAccountService
- ContactService
- UnitService
- ProductService
- WarehouseService
- AccountMappingStorageService

D. Backend controllers:
- ChartOfAccountController
- ContactController
- UnitController
- ProductCategoryController
- ProductController
- WarehouseController
- AccountMappingController

E. Requests:
- Store/Update ChartOfAccount
- Store/Update Contact
- Store/Update Unit
- Store/Update ProductCategory
- Store/Update Product
- Store/Update Warehouse
- UpdateAccountMappingRequest

F. Routes:
- API routes under auth:sanctum + company.access + permission middleware

G. Tests:
- Feature tests for each master data endpoint
- Tenant isolation tests for master data
- Account mapping tests

H. Documentation:
- docs/phase-5-master-data-akuntansi.md

JANGAN MENGERJAKAN:
- Journal Entry Engine
- journal_entries
- journal_entry_lines
- General Ledger
- Trial Balance
- Financial Statements
- Sales Invoice
- Purchase Invoice
- Cash Bank transaction
- Stock Movement
- Stock Adjustment
- Stock Opname
- Opening Balance UI
- Closing Wizard
- Frontend UI besar
- Role management UI
- Create company endpoint public
- Create tenant endpoint public
- Migrate tenant endpoint public
- Assign user endpoint public
- Archive/purge engine
- SQLite-specific logic

TENANT MIGRATION 1: chart_of_accounts
Buat migration tenant:
backend/database/migrations/tenant/xxxx_xx_xx_xxxxxx_create_chart_of_accounts_table.php

Table:
chart_of_accounts

Fields:
- id
- account_code string
- account_name string
- account_type string
- parent_account_id nullable unsignedBigInteger
- normal_balance string
- is_cash_bank boolean default false
- is_active boolean default true
- is_system_default boolean default false
- description text nullable
- metadata json/text nullable
- timestamps

Indexes/constraints:
- account_code unique
- account_type index
- parent_account_id index
- is_cash_bank index
- is_active index
- parent_account_id references chart_of_accounts.id nullOnDelete jika style project mendukung

Allowed account_type:
- asset
- liability
- equity
- revenue
- expense

Allowed normal_balance:
- debit
- credit

Business rules:
- asset normal_balance default debit
- expense normal_balance default debit
- liability normal_balance default credit
- equity normal_balance default credit
- revenue normal_balance default credit
- is_cash_bank true hanya boleh jika account_type asset
- account_code wajib unique dalam tenant database
- parent account tidak boleh menjadi dirinya sendiri
- parent-child account harus valid
- account yang sudah dipakai nanti tidak boleh hard delete, hanya deactivate
- Phase 5 belum punya transaction usage check detail, tapi service harus memakai deactivate, bukan destroy hard delete

TENANT MIGRATION 2: contacts
Buat migration tenant:
backend/database/migrations/tenant/xxxx_xx_xx_xxxxxx_create_contacts_table.php

Table:
contacts

Fields:
- id
- contact_code string nullable
- name string
- contact_type string default other
- is_customer boolean default false
- is_supplier boolean default false
- is_employee boolean default false
- phone string nullable
- email string nullable
- address text nullable
- tax_number string nullable
- notes text nullable
- is_active boolean default true
- metadata json/text nullable
- timestamps

Indexes/constraints:
- contact_code nullable unique if supported; jika SQLite sulit, boleh index saja dan validasi service
- name index
- contact_type index
- is_customer index
- is_supplier index
- is_employee index
- is_active index

Allowed contact_type:
- customer
- supplier
- employee
- other

Business rules:
- name wajib
- satu contact boleh customer dan supplier sekaligus
- contact inactive tidak muncul di dropdown transaksi baru
- contact lama tetap bisa tampil di histori transaksi
- delete hard tidak dibuat; gunakan deactivate

TENANT MIGRATION 3: units
Buat migration tenant:
backend/database/migrations/tenant/xxxx_xx_xx_xxxxxx_create_units_table.php

Table:
units

Fields:
- id
- code string
- name string
- precision unsignedTinyInteger default 0
- is_active boolean default true
- metadata json/text nullable
- timestamps

Indexes/constraints:
- code unique
- is_active index

Examples:
- PCS
- KG
- GR
- LTR
- MTR
- BOX
- PACK

Business rules:
- code wajib unique
- precision untuk quantity decimal
- inactive unit tidak muncul di dropdown produk baru
- unit lama tetap bisa tampil di histori

TENANT MIGRATION 4: product_categories
Buat migration tenant:
backend/database/migrations/tenant/xxxx_xx_xx_xxxxxx_create_product_categories_table.php

Table:
product_categories

Fields:
- id
- name string
- parent_category_id nullable unsignedBigInteger
- is_active boolean default true
- metadata json/text nullable
- timestamps

Indexes:
- name index
- parent_category_id index
- is_active index

Business rules:
- category boleh nested sederhana
- parent tidak boleh dirinya sendiri
- inactive category tidak muncul untuk produk baru

TENANT MIGRATION 5: products
Buat migration tenant:
backend/database/migrations/tenant/xxxx_xx_xx_xxxxxx_create_products_table.php

Table:
products

Fields:
- id
- product_code string nullable
- product_name string
- product_type string default goods
- product_category_id nullable unsignedBigInteger
- unit_id nullable unsignedBigInteger
- is_stock_item boolean default false
- is_active boolean default true
- description text nullable
- metadata json/text nullable
- timestamps

Optional account fields for future flexibility:
- sales_account_id nullable unsignedBigInteger
- purchase_account_id nullable unsignedBigInteger
- inventory_account_id nullable unsignedBigInteger
- cogs_account_id nullable unsignedBigInteger

Indexes/constraints:
- product_code nullable unique if supported; if SQLite compatibility issue, validate in service
- product_name index
- product_type index
- product_category_id index
- unit_id index
- is_stock_item index
- is_active index
- foreign product_category_id references product_categories.id nullOnDelete if supported
- foreign unit_id references units.id nullOnDelete if supported
- account fields references chart_of_accounts.id nullOnDelete if supported

Allowed product_type:
- goods
- service
- non_inventory

Business rules:
- product_name wajib
- goods bisa stock item
- service default is_stock_item false
- non_inventory default is_stock_item false
- is_stock_item true wajib punya unit_id
- stock item nanti dipakai inventory
- inactive product tidak muncul di transaksi baru
- product lama tetap bisa tampil di histori transaksi

TENANT MIGRATION 6: warehouses
Buat migration tenant:
backend/database/migrations/tenant/xxxx_xx_xx_xxxxxx_create_warehouses_table.php

Table:
warehouses

Fields:
- id
- code string
- name string
- address text nullable
- is_default boolean default false
- is_active boolean default true
- metadata json/text nullable
- timestamps

Indexes:
- code unique
- is_default index
- is_active index

Business rules:
- minimal satu default warehouse bisa dibuat nanti seeder
- hanya satu default warehouse secara logic service
- warehouse inactive tidak muncul untuk transaksi inventory baru

TENANT MIGRATION 7: account_mappings
Buat migration tenant:
backend/database/migrations/tenant/xxxx_xx_xx_xxxxxx_create_account_mappings_table.php

Table:
account_mappings

Fields:
- id
- mapping_key string
- module string
- account_id unsignedBigInteger nullable
- is_required boolean default false
- is_active boolean default true
- metadata json/text nullable
- timestamps

Indexes/constraints:
- mapping_key unique
- module index
- account_id index
- is_required index
- is_active index
- foreign account_id references chart_of_accounts.id nullOnDelete if supported

Business rules:
- mapping_key mengikuti config/account_mappings.php dari Phase 4M
- account_id harus menunjuk ke chart_of_accounts tenant
- required mapping harus dilengkapi sebelum module terkait bisa post
- mapping tidak boleh menunjuk akun inactive saat dipakai untuk posting
- mapping tidak boleh menunjuk akun dengan account_type yang tidak sesuai requirement

TENANT MODELS:
Buat model di:
backend/app/Models/Tenant

Models:
1. ChartOfAccount
2. Contact
3. Unit
4. ProductCategory
5. Product
6. Warehouse
7. AccountMapping

Semua model:
- protected $connection = 'tenant';
- fillable sesuai field
- casts boolean/integer/array
- scopes:
  - active()
  - inactive()

ChartOfAccount relations:
- parent()
- children()
- accountMappings()
- productSalesAccounts()
- productPurchaseAccounts()
- productInventoryAccounts()
- productCogsAccounts()

ChartOfAccount helpers:
- isAsset()
- isLiability()
- isEquity()
- isRevenue()
- isExpense()
- isDebitNormal()
- isCreditNormal()
- isCashBank()
- isActive()

Contact helpers:
- isCustomer()
- isSupplier()
- isEmployee()
- isActive()

ProductCategory relations:
- parent()
- children()
- products()

Product relations:
- category()
- unit()
- salesAccount()
- purchaseAccount()
- inventoryAccount()
- cogsAccount()

Product helpers:
- isGoods()
- isService()
- isNonInventory()
- isStockItem()
- isActive()

Warehouse helpers:
- isDefault()
- isActive()

AccountMapping relations:
- account()

AccountMapping helpers:
- isRequired()
- isActive()

SERVICES:
Buat folder jika belum ada:
backend/app/Services/MasterData

Services:
1. ChartOfAccountService
2. ContactService
3. UnitService
4. ProductCategoryService
5. ProductService
6. WarehouseService
7. AccountMappingStorageService

Common service behavior:
- list with filters
- create
- update
- deactivate
- activate if needed
- no hard delete for Phase 5 unless safe and unused; prefer deactivate

ChartOfAccountService:
Methods:
- list(array $filters = [])
- create(array $data): ChartOfAccount
- update(ChartOfAccount $account, array $data): ChartOfAccount
- deactivate(ChartOfAccount $account): ChartOfAccount
- activate(ChartOfAccount $account): ChartOfAccount
- validateNormalBalance(string $accountType, ?string $normalBalance): string
- validateCashBank(string $accountType, bool $isCashBank): void

Rules:
- normal_balance auto-default if not provided
- is_cash_bank only allowed for asset
- account_code unique
- cannot set parent_account_id to self
- cannot deactivate parent if children active? For Phase 5, either block or document. Recommended: block if active children exist.

ContactService:
- create/update/deactivate
- validate contact type/flags

UnitService:
- create/update/deactivate
- code unique

ProductCategoryService:
- create/update/deactivate
- prevent parent self

ProductService:
- create/update/deactivate
- if is_stock_item true, unit_id required
- if product_type service, is_stock_item must false
- validate optional account ids if provided

WarehouseService:
- create/update/deactivate
- setDefault(Warehouse $warehouse)
- ensure only one default warehouse

AccountMappingStorageService:
- syncDefaultMappingsFromConfig()
- list()
- updateMapping(string $key, ?int $accountId)
- validateMappingAccountType(string $key, ChartOfAccount $account)
- requiredMappingsComplete(?string $module = null): bool
- missingRequiredMappings(?string $module = null): array

Use AccountMappingService/Validator from Phase 4M if available.
Do not duplicate config logic.

REQUESTS:
Buat folder jika belum ada:
backend/app/Http/Requests/MasterData

Requests:
- StoreChartOfAccountRequest
- UpdateChartOfAccountRequest
- StoreContactRequest
- UpdateContactRequest
- StoreUnitRequest
- UpdateUnitRequest
- StoreProductCategoryRequest
- UpdateProductCategoryRequest
- StoreProductRequest
- UpdateProductRequest
- StoreWarehouseRequest
- UpdateWarehouseRequest
- UpdateAccountMappingRequest

Validation details:

ChartOfAccount:
- account_code required|string|max:50
- account_name required|string|max:255
- account_type required|in:asset,liability,equity,revenue,expense
- parent_account_id nullable|integer
- normal_balance nullable|in:debit,credit
- is_cash_bank nullable|boolean
- is_active nullable|boolean
- description nullable|string

Additional after validation:
- if is_cash_bank true and account_type != asset => error

Contact:
- contact_code nullable|string|max:50
- name required|string|max:255
- contact_type nullable|in:customer,supplier,employee,other
- is_customer nullable|boolean
- is_supplier nullable|boolean
- is_employee nullable|boolean
- phone nullable|string|max:50
- email nullable|email|max:255
- address nullable|string
- tax_number nullable|string|max:100
- notes nullable|string
- is_active nullable|boolean

Unit:
- code required|string|max:30
- name required|string|max:100
- precision nullable|integer|min:0|max:8
- is_active nullable|boolean

ProductCategory:
- name required|string|max:255
- parent_category_id nullable|integer
- is_active nullable|boolean

Product:
- product_code nullable|string|max:50
- product_name required|string|max:255
- product_type nullable|in:goods,service,non_inventory
- product_category_id nullable|integer
- unit_id nullable|integer
- is_stock_item nullable|boolean
- is_active nullable|boolean
- description nullable|string
- sales_account_id nullable|integer
- purchase_account_id nullable|integer
- inventory_account_id nullable|integer
- cogs_account_id nullable|integer

After validation:
- if is_stock_item true and unit_id missing => error
- if product_type service and is_stock_item true => error

Warehouse:
- code required|string|max:50
- name required|string|max:255
- address nullable|string
- is_default nullable|boolean
- is_active nullable|boolean

AccountMapping:
- account_id nullable|integer

CONTROLLERS:
Buat folder jika belum ada:
backend/app/Http/Controllers/Api/MasterData

Controllers:
- ChartOfAccountController
- ContactController
- UnitController
- ProductCategoryController
- ProductController
- WarehouseController
- AccountMappingController

Common methods:
- index
- store
- show
- update
- deactivate
- activate optional

Do not implement hard delete endpoints for master data in Phase 5.
Use deactivate route.

Example routes:
GET /api/master-data/chart-of-accounts
POST /api/master-data/chart-of-accounts
GET /api/master-data/chart-of-accounts/{id}
PATCH /api/master-data/chart-of-accounts/{id}
PATCH /api/master-data/chart-of-accounts/{id}/deactivate
PATCH /api/master-data/chart-of-accounts/{id}/activate

Similar for:
- contacts
- units
- product-categories
- products
- warehouses

Account mappings:
GET /api/master-data/account-mappings
PATCH /api/master-data/account-mappings/{mappingKey}

ROUTES:
Tambahkan di backend/routes/api.php:

Route group:
- auth:sanctum
- company.access

Apply permission middleware:
Chart of Accounts:
- GET/show: permission:coa.view
- POST: permission:coa.create
- PATCH: permission:coa.edit
- deactivate: permission:coa.deactivate

Contacts:
- GET/show: permission:contacts.view
- POST: permission:contacts.create
- PATCH: permission:contacts.edit
- deactivate: permission:contacts.deactivate

Products:
- GET/show: permission:products.view
- POST: permission:products.create
- PATCH: permission:products.edit
- deactivate: permission:products.deactivate

Units:
- GET/show: permission:units.view
- POST: permission:units.create
- PATCH: permission:units.edit
- deactivate: permission:units.deactivate

Warehouses:
- GET/show: permission:warehouses.view
- POST: permission:warehouses.create
- PATCH: permission:warehouses.edit
- deactivate: permission:warehouses.deactivate

Account mappings:
- GET: permission:settings.company.view or coa.view
- PATCH: permission:settings.company.edit or coa.edit
Recommended:
- GET account mappings: permission:settings.company.view
- PATCH account mappings: permission:settings.company.edit

Do not create public routes without auth/company.access.

API RESPONSE:
Use ApiResponse/ApiResponseBuilder from Phase 4N if available.
If not available, follow existing response format:
{
  "success": true,
  "message": "...",
  "data": ...
}

Errors should use standard code if available.

SEEDER / DEFAULT DATA:
Phase 5 should include default tenant seeders if project structure supports tenant seeders.

Create optional:
backend/database/seeders/tenant/DefaultMasterDataSeeder.php
or follow existing tenant seeder convention.

Default data recommended:
Units:
- PCS / Pieces / precision 0
- KG / Kilogram / precision 3
- GR / Gram / precision 3
- LTR / Liter / precision 3
- MTR / Meter / precision 2

Warehouse:
- MAIN / Gudang Utama / is_default true

Default COA minimal:
Assets:
- 1000 Assets
- 1010 Cash
- 1020 Bank
- 1100 Accounts Receivable
- 1200 Inventory

Liabilities:
- 2000 Liabilities
- 2100 Accounts Payable
- 2200 Output Tax Payable

Equity:
- 3000 Equity
- 3100 Owner Capital
- 3200 Retained Earnings
- 3300 Current Year Earnings
- 3900 Opening Balance Equity

Revenue:
- 4000 Revenue
- 4100 Sales Revenue
- 4200 Sales Return
- 4300 Sales Discount

Expenses:
- 5000 Cost of Goods Sold
- 5100 COGS
- 6000 Expenses
- 6100 Bank Admin Fee
- 6900 Inventory Adjustment Loss

Important:
- Parent accounts can be created as header accounts.
- If no header flag exists, use normal accounts but document.
- is_system_default true for default COA.

Default account mappings:
- sales.accounts_receivable => Accounts Receivable
- sales.revenue => Sales Revenue
- sales.discount => Sales Discount
- sales.return => Sales Return
- sales.tax_output => Output Tax Payable
- purchase.accounts_payable => Accounts Payable
- purchase.default_purchase => Inventory or Expense depending chosen default; recommended Inventory for stock-enabled, otherwise Expense placeholder
- inventory.asset => Inventory
- inventory.cogs => COGS
- inventory.adjustment_loss => Inventory Adjustment Loss
- cash_bank.default_cash => Cash
- cash_bank.default_bank => Bank
- cash_bank.bank_admin_fee => Bank Admin Fee
- opening_balance.equity => Opening Balance Equity
- closing.retained_earnings => Retained Earnings
- closing.current_year_earnings => Current Year Earnings

If default seeder is too much for Phase 5A, document and create minimal seeder:
- units
- main warehouse
- default COA
- mappings

TESTS:
Buat feature tests:
backend/tests/Feature/MasterData/ChartOfAccountTest.php
backend/tests/Feature/MasterData/ContactTest.php
backend/tests/Feature/MasterData/UnitTest.php
backend/tests/Feature/MasterData/ProductTest.php
backend/tests/Feature/MasterData/WarehouseTest.php
backend/tests/Feature/MasterData/AccountMappingTest.php

Test rules:
- Use auth:sanctum
- Use X-Company-ID
- Ensure tenant connection active
- Do not rely only on demo admin@example.com
- Use test company/user if possible
- Ensure user cannot access another company tenant master data
- Ensure permission required where possible

ChartOfAccountTest minimal:
1. unauthenticated cannot list COA => 401
2. missing X-Company-ID rejected => 422
3. user can create asset account
4. normal_balance auto/default works
5. is_cash_bank true allowed for asset
6. is_cash_bank true rejected for revenue/expense/liability/equity
7. duplicate account_code rejected
8. can update account
9. can deactivate account
10. inactive account excluded by active filter if implemented

ContactTest:
1. create customer
2. create supplier
3. contact can be customer and supplier
4. update contact
5. deactivate contact

UnitTest:
1. create unit
2. duplicate code rejected
3. update unit
4. deactivate unit

ProductTest:
1. create goods product with unit
2. create service product
3. service product cannot be stock item
4. stock item requires unit
5. update product
6. deactivate product

WarehouseTest:
1. create warehouse
2. code unique
3. set default warehouse ensures only one default
4. deactivate warehouse

AccountMappingTest:
1. sync default mappings from config
2. list account mappings
3. update mapping to valid account
4. reject mapping to wrong account type
5. required mapping completeness works

If full feature tests are heavy due tenant setup, create as many as possible and document limitations honestly.

DOCUMENTATION:
Buat docs/phase-5-master-data-akuntansi.md

Isi wajib:
- tujuan Phase 5
- tabel tenant yang dibuat
- Chart of Accounts design
- fungsi is_cash_bank
- Contacts design
- Products/Units/Warehouses design
- Account Mappings implementation
- default COA
- default units
- default warehouse
- default account mappings
- API endpoints
- permissions
- validation rules
- relationship ERD ringkas
- batasan scope
- command migration/test
- notes commit

Jelaskan secara eksplisit:
- Phase 5 tidak membuat jurnal transaksi.
- Phase 5 tidak membuat invoice.
- Phase 5 tidak membuat GL/Trial Balance.
- Opening balance tetap lewat opening journal nanti.
- Account mapping menunjuk ke COA tenant.
- Master data inactive tidak muncul di transaksi baru tapi tetap bisa dipakai untuk histori.
- Hard delete master data tidak dipakai di Phase 5; gunakan deactivate.

COMMAND YANG DIJALANKAN:
Jika environment memungkinkan:
- php artisan tenant:migrate --company=<id>
  atau command tenant migration sesuai project Phase 3
- php artisan test --filter=ChartOfAccountTest
- php artisan test --filter=ContactTest
- php artisan test --filter=UnitTest
- php artisan test --filter=ProductTest
- php artisan test --filter=WarehouseTest
- php artisan test --filter=AccountMappingTest
- php artisan route:list

Jika environment tidak bisa menjalankan command, tulis jujur di final summary.

ACCEPTANCE CRITERIA:
Phase 5 selesai jika:
1. Tenant migration chart_of_accounts dibuat
2. Tenant migration contacts dibuat
3. Tenant migration units dibuat
4. Tenant migration product_categories dibuat
5. Tenant migration products dibuat
6. Tenant migration warehouses dibuat
7. Tenant migration account_mappings dibuat
8. Tenant models dibuat
9. Tenant model relationships dibuat
10. Services master data dibuat
11. Requests validation dibuat
12. Controllers dibuat
13. Routes dibuat dengan auth:sanctum + company.access
14. Permission middleware granular digunakan
15. COA create/update/deactivate bekerja
16. is_cash_bank hanya valid untuk asset
17. Contacts create/update/deactivate bekerja
18. Units create/update/deactivate bekerja
19. Products create/update/deactivate bekerja
20. Warehouses create/update/deactivate bekerja
21. Account mapping update dan validation bekerja
22. Default master data seeder dibuat jika scope memungkinkan
23. Feature tests dibuat
24. Dokumentasi Phase 5 dibuat
25. Tidak ada journal_entries dibuat
26. Tidak ada sales/purchase/cash/inventory transaction dibuat
27. Tidak ada frontend UI besar dibuat
28. Tidak ada public tenant/company management endpoint dibuat
29. Tidak ada SQLite-specific logic dibuat

FINAL SUMMARY:
Sertakan:
- file dibuat
- file diubah
- tenant migrations dibuat
- models dibuat
- relationships dibuat
- endpoints ditambahkan
- permissions digunakan
- seeders jika dibuat
- tests dibuat
- command yang berhasil dijalankan
- command yang gagal/tidak bisa dijalankan
- catatan bahwa Phase 5 hanya master data tenant
- catatan bahwa journal/invoice/report belum dibuat
- catatan bahwa opening balance tetap melalui opening journal nanti

COMMIT MESSAGE:
add tenant master data foundation

COMMIT BODY:
Phase 5: add tenant master data foundation with Chart of Accounts, contacts, units, product categories, products, warehouses, account mapping storage, services, validation, API controllers, tests, and documentation. This prepares tenant accounting master data without adding journal, invoice, cash bank, inventory transaction modules, or frontend UI.