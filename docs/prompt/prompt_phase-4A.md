Kita masuk ke Phase 4A project TenantAppDevelopment.

NAMA PHASE:
Phase 4A — Company Settings Foundation

KONTEKS PROJECT:
Project ini adalah aplikasi akuntansi multi-tenant dengan stack:
- Backend: Laravel API
- Frontend: Next.js
- Styling: TailwindCSS
- Database: SQLite
- Arsitektur:
  - central.sqlite = database pusat
  - 1 perusahaan = 1 file SQLite tenant
  - user bisa punya akses ke banyak perusahaan
  - user memilih perusahaan aktif setelah login
  - request tenant memakai header X-Company-ID

STATUS SEBELUM PHASE 4A:
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

Phase 3 diasumsikan menjaga:
- tenant creation internal command only
- tenant migration internal command only
- user-company assignment internal command only
- tidak ada public endpoint tenant/company management

TUJUAN PHASE 4A:
Membuat fondasi pengaturan perusahaan di central database agar modul akuntansi berikutnya tidak hardcode rule.

Phase ini hanya Company Settings Foundation.
Jangan membuat permission middleware detail, jangan membuat transaksi, jangan membuat COA, jangan membuat jurnal, jangan membuat invoice.

SCOPE YANG HARUS DIKERJAKAN:
1. Buat migration central untuk company_accounting_settings
2. Buat migration central untuk company_module_settings
3. Buat model CompanyAccountingSetting
4. Buat model CompanyModuleSetting
5. Tambahkan relasi di Company model:
   - accountingSetting
   - moduleSetting
6. Buat CompanySettingService
7. Buat request validation:
   - UpdateCompanyAccountingSettingRequest
   - UpdateCompanyModuleSettingRequest
8. Buat CompanySettingController
9. Buat endpoint:
   - GET /api/settings/company
   - PATCH /api/settings/company/accounting
   - PATCH /api/settings/company/modules
10. Semua endpoint wajib memakai middleware:
   - auth:sanctum
   - company.access
11. Endpoint wajib membaca active company dari TenantContext, bukan dari body request.
12. Buat default settings jika record belum ada.
13. Buat backend feature test dasar.
14. Buat dokumentasi:
   docs/phase-4a-company-settings-foundation.md

DATABASE:
Semua tabel Phase 4A masuk central.sqlite, bukan tenant database.

TABLE 1:
company_accounting_settings

Fields:
- id
- company_id
- base_currency string default IDR
- amount_precision unsignedTinyInteger default 2
- quantity_precision unsignedTinyInteger default 4
- rounding_method string default half_up
- transaction_workflow_mode string default simple_auto_post
- auto_post_transactions boolean default true
- allow_edit_transactions boolean default true
- allow_edit_posted_transactions boolean default true
- allow_void_transactions boolean default true
- hide_voided_transactions boolean default true
- require_void_reason boolean default true
- approval_enabled boolean default false
- tax_enabled boolean default false
- allow_backdated_transactions boolean default true
- max_backdate_days integer nullable
- allow_future_transactions boolean default false
- max_future_days integer nullable default 0
- timestamps

Index/constraint:
- company_id unique
- company_id foreign key references companies.id cascadeOnDelete if compatible with existing project style

TABLE 2:
company_module_settings

Fields:
- id
- company_id
- sales_enabled boolean default true
- purchase_enabled boolean default true
- cash_bank_enabled boolean default true
- inventory_enabled boolean default false
- warehouse_enabled boolean default false
- fixed_asset_enabled boolean default false
- approval_enabled boolean default false
- tax_enabled boolean default false
- reports_enabled boolean default true
- timestamps

Index/constraint:
- company_id unique
- company_id foreign key references companies.id cascadeOnDelete if compatible with existing project style

PENTING:
Jangan membuat company_default_account_settings di Phase 4A karena Chart of Accounts belum ada. Account mapping akan dibuat setelah COA tersedia.

MODEL:
CompanyAccountingSetting:
- fillable sesuai fields
- casts boolean dan integer
- belongsTo Company

CompanyModuleSetting:
- fillable sesuai fields
- casts boolean
- belongsTo Company

Company model:
- accountingSetting()
- moduleSetting()

SERVICE:
Buat:
backend/app/Services/Settings/CompanySettingService.php

Methods minimal:
- getOrCreateAccountingSetting(Company $company): CompanyAccountingSetting
- getOrCreateModuleSetting(Company $company): CompanyModuleSetting
- getSettings(Company $company): array
- updateAccountingSetting(Company $company, array $data): CompanyAccountingSetting
- updateModuleSetting(Company $company, array $data): CompanyModuleSetting

Service harus normalize consistency:
1. Jika transaction_workflow_mode = simple_auto_post, auto_post_transactions harus true.
2. Jika transaction_workflow_mode = draft_approve_post, approval_enabled harus true.
3. Jika approval_enabled false, transaction_workflow_mode tidak boleh draft_approve_post.
4. tax_enabled di accounting dan module sebaiknya tetap konsisten.
5. approval_enabled di accounting dan module sebaiknya tetap konsisten.

VALIDATION:
UpdateCompanyAccountingSettingRequest:
- base_currency nullable|string|size:3
- amount_precision nullable|integer|min:0|max:6
- quantity_precision nullable|integer|min:0|max:8
- rounding_method nullable|in:half_up,half_down,bankers,floor,ceil
- transaction_workflow_mode nullable|in:simple_auto_post,draft_then_post,draft_approve_post
- auto_post_transactions nullable|boolean
- allow_edit_transactions nullable|boolean
- allow_edit_posted_transactions nullable|boolean
- allow_void_transactions nullable|boolean
- hide_voided_transactions nullable|boolean
- require_void_reason nullable|boolean
- approval_enabled nullable|boolean
- tax_enabled nullable|boolean
- allow_backdated_transactions nullable|boolean
- max_backdate_days nullable|integer|min:0|max:3650
- allow_future_transactions nullable|boolean
- max_future_days nullable|integer|min:0|max:3650

Tambahkan validation after hook atau logic setara:
- transaction_workflow_mode simple_auto_post tidak boleh auto_post_transactions false
- transaction_workflow_mode draft_approve_post harus approval_enabled true
- approval_enabled false tidak boleh transaction_workflow_mode draft_approve_post

UpdateCompanyModuleSettingRequest:
Semua nullable boolean:
- sales_enabled
- purchase_enabled
- cash_bank_enabled
- inventory_enabled
- warehouse_enabled
- fixed_asset_enabled
- approval_enabled
- tax_enabled
- reports_enabled

CONTROLLER:
Buat:
backend/app/Http/Controllers/Api/Settings/CompanySettingController.php

Methods:
- show()
- updateAccounting()
- updateModules()

Controller harus:
- mengambil active company dari TenantContext
- tidak menerima company_id dari body
- memakai CompanySettingService
- return ApiResponse format existing jika project punya trait ApiResponse
- jika tidak ada trait, ikuti format response existing:
  success, message, data

ROUTES:
Tambahkan di routes/api.php di group middleware auth:sanctum + company.access:

GET /api/settings/company
PATCH /api/settings/company/accounting
PATCH /api/settings/company/modules

JANGAN BUAT ROUTE:
- POST /api/companies
- DELETE /api/companies/{id}
- POST /api/tenants
- POST /api/tenant/migrate
- POST /api/company-users
- POST /api/companies/{id}/users

TEST:
Buat:
backend/tests/Feature/Settings/CompanySettingTest.php

Test minimal:
1. unauthenticated user cannot get company settings
Expected 401

2. authenticated user cannot get company settings without X-Company-ID
Expected 422

3. authenticated user can get default company settings
Expected 200
Response contains:
- base_currency IDR
- transaction_workflow_mode simple_auto_post
- auto_post_transactions true
- hide_voided_transactions true
- sales_enabled true
- inventory_enabled false

4. user cannot access another company settings
Expected 403

5. authenticated user can update accounting settings
Update:
- transaction_workflow_mode draft_then_post
- auto_post_transactions false
Expected 200

6. invalid workflow mode rejected
Expected 422

7. invalid rounding method rejected
Expected 422

8. simple_auto_post with auto_post_transactions false rejected
Expected 422

9. draft_approve_post with approval_enabled false rejected
Expected 422

10. authenticated user can update module settings
Update:
- inventory_enabled true
- warehouse_enabled true
Expected 200

DOKUMENTASI:
Buat:
docs/phase-4a-company-settings-foundation.md

Isi dokumentasi:
- tujuan Phase 4A
- tabel yang dibuat
- field settings
- endpoint API
- validation rules
- default values
- business rules
- testing command
- batasan scope
- notes commit

BATASAN SCOPE:
Jangan mengerjakan:
- frontend UI besar
- permission middleware
- role management
- transaction policy
- dependency service
- period lock
- document numbering engine
- chart of accounts
- journal entry
- ledger
- sales invoice
- purchase invoice
- cash bank
- inventory
- fixed asset
- report
- backup restore
- advanced audit viewer
- create company endpoint
- create tenant endpoint
- tenant migrate endpoint
- assign user endpoint

COMMAND YANG DIJALANKAN:
Jika environment memungkinkan:
- php artisan migrate
- php artisan test --filter=CompanySettingTest
- php artisan route:list

Jika environment tidak bisa menjalankan command, tulis jujur di final summary.

ACCEPTANCE CRITERIA:
Phase 4A selesai jika:
1. Migration company_accounting_settings dibuat
2. Migration company_module_settings dibuat
3. Model dan relasi dibuat
4. CompanySettingService dibuat
5. Request validation dibuat
6. CompanySettingController dibuat
7. Endpoint GET/PATCH settings aktif
8. Endpoint memakai auth:sanctum dan company.access
9. Endpoint membaca active company dari TenantContext
10. Default settings bisa dibuat/dibaca
11. Update setting bekerja
12. Validation conflict bekerja
13. User tidak bisa akses setting company lain
14. Test CompanySettingTest dibuat
15. Dokumentasi dibuat
16. Tidak ada endpoint public create/migrate/assign tenant/company
17. Tidak ada modul akuntansi dibuat

FINAL SUMMARY:
Sertakan:
- file dibuat
- file diubah
- endpoint ditambahkan
- test yang dibuat
- command yang berhasil dijalankan
- command yang gagal/tidak bisa dijalankan
- catatan security bahwa tidak ada public tenant/company management endpoint dibuat

COMMIT MESSAGE:
add company settings foundation

COMMIT BODY:
Phase 4A: add company accounting and module settings foundation with tenant-safe settings endpoints, default values, validation rules, backend tests, and documentation. No accounting modules, frontend UI, or public tenant/company management endpoints were added.