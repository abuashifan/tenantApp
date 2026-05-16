Kita masuk ke Phase 4B project TenantAppDevelopment.

NAMA PHASE:
Phase 4B — Permission Foundation Basic, Extensible for Dynamic User Permissions

KONTEKS PROJECT:
Project ini adalah aplikasi akuntansi multi-tenant dengan stack:
- Backend: Laravel API
- Frontend: Next.js
- Styling: TailwindCSS
- Database: SQLite

Arsitektur:
- central.sqlite = database pusat
- 1 perusahaan = 1 file SQLite tenant
- user bisa punya akses ke banyak perusahaan
- user memilih perusahaan aktif setelah login
- request tenant memakai header X-Company-ID
- company_users berada di central.sqlite
- role user per company berada di company_users.role
- TenantContext menyimpan active company dan user_role

STATUS SEBELUM PHASE 4B:
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

Phase 4A diasumsikan sudah membuat:
- company_accounting_settings
- company_module_settings
- CompanySettingService
- CompanySettingController
- GET /api/settings/company
- PATCH /api/settings/company/accounting
- PATCH /api/settings/company/modules
- semua route settings memakai auth:sanctum + company.access

TUJUAN PHASE 4B:
Membuat fondasi permission dasar untuk mengamankan endpoint backend berdasarkan role user di company aktif.

Phase ini menggunakan static role-permission map dari config sebagai template awal.

PENTING:
Static permission di Phase 4B BUKAN desain final.
Phase 4B harus dibuat extensible agar Phase 14 nanti bisa mendukung dynamic/manual permission per user tenant lewat UI.

Di Phase 14 nanti:
- tenant owner/admin bisa mengatur permission user secara manual
- user tenant tidak harus terbatas pada role finance/sales/purchasing/warehouse
- satu user bisa diberi akses sales + purchase + warehouse sekaligus
- permission bisa granular: view/create/edit/void/approve/post/export
- custom role atau permission override per user akan dibuat di Phase 14

Jadi di Phase 4B:
- jangan hardcode permission terlalu kaku
- jangan desain PermissionService yang sulit diganti sumber datanya
- middleware cukup bertanya ke PermissionService::can($permission)
- static config hanya source awal/fallback
- siapkan struktur permission name yang granular sejak sekarang

SCOPE YANG HARUS DIKERJAKAN:
1. Revisi kecil Phase 4A jika diperlukan:
   - tambahkan field user_permission_mode ke company_accounting_settings jika belum ada
   - default: role_template
   - allowed values: role_template, manual_per_user
   - update model fillable/cast jika field dibuat
   - update validation request jika Phase 4A request ada
   - update docs Phase 4A jika field dibuat
2. Buat config/permissions.php
3. Buat PermissionService
4. Buat EnsurePermission middleware
5. Daftarkan alias middleware permission
6. Buat PermissionController
7. Buat endpoint GET /api/auth/permissions
8. Endpoint permission wajib auth:sanctum + company.access
9. Permission harus dibaca berdasarkan TenantContext user_role, bukan dari request body
10. PermissionService harus dibuat extensible untuk Phase 14 dynamic permissions
11. Proteksi route company settings dari Phase 4A dengan permission settings.company.edit jika route tersebut sudah ada
12. Buat backend feature test
13. Buat dokumentasi docs/phase-4b-permission-foundation-basic.md

JANGAN MENGERJAKAN:
- frontend UI role management
- custom role database
- custom permission database
- permission override database
- invite user
- assign user endpoint public
- create company endpoint
- create tenant endpoint
- migrate tenant endpoint
- chart of accounts
- journal
- invoice
- purchase
- cash bank
- inventory
- period lock
- transaction policy
- dependency service
- document numbering
- advanced audit viewer

REVISI PHASE 4A JIKA DIPERLUKAN:
Jika company_accounting_settings belum memiliki field user_permission_mode, tambahkan migration baru, jangan edit migration lama jika sudah pernah dijalankan.

Field:
- user_permission_mode string default role_template

Allowed values:
- role_template
- manual_per_user

Makna:
- role_template = permission mengikuti role/template static config
- manual_per_user = disiapkan untuk Phase 14 agar permission bisa diatur manual per user tenant

Untuk Phase 4B, manual_per_user belum diimplementasikan penuh.
Jika mode manual_per_user dipilih di Phase 4B, PermissionService boleh tetap fallback ke role_template sampai Phase 14 selesai, tetapi beri komentar/dokumentasi jelas.

ROLE AWAL SEBAGAI TEMPLATE:
Gunakan role template:
- owner
- admin
- finance
- accountant
- sales
- purchasing
- warehouse
- viewer

Catatan:
Role ini hanya template awal.
Nanti Phase 14 tenant admin bisa mengatur permission manual per user.

PERMISSION NAMING WAJIB GRANULAR:
Jangan gunakan permission kasar seperti manage_sales saja sebagai permission utama.
Gunakan namespace permission granular seperti:

Dashboard:
- dashboard.view

Settings:
- settings.company.view
- settings.company.edit
- settings.users.view
- settings.users.manage
- settings.permissions.view
- settings.permissions.manage

Master Data:
- master_data.view
- master_data.manage
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
- units.view
- units.create
- units.edit
- units.deactivate
- warehouses.view
- warehouses.create
- warehouses.edit
- warehouses.deactivate

Journal:
- journal.view
- journal.create
- journal.edit
- journal.void
- journal.approve
- journal.post

Sales:
- sales.view
- sales.create
- sales.edit
- sales.void
- sales.approve
- sales.post

Purchase:
- purchase.view
- purchase.create
- purchase.edit
- purchase.void
- purchase.approve
- purchase.post

Cash Bank:
- cash_bank.view
- cash_bank.create
- cash_bank.edit
- cash_bank.void
- cash_bank.approve
- cash_bank.post
- cash_bank.transfer

Inventory:
- inventory.view
- inventory.manage
- inventory.adjustment.create
- inventory.adjustment.edit
- inventory.adjustment.void
- inventory.transfer
- inventory.stock_opname

Reports:
- reports.view
- reports.export

Audit:
- audit.view

PERMISSION LIST MINIMAL DI CONFIG:
Masukkan semua permission di atas ke config/permissions.php dalam key permissions.

ROLE PERMISSION MAP:
Buat di config/permissions.php.

owner:
- wildcard '*'

admin:
- semua tenant-level permissions di config, boleh gunakan '*'
- Tapi ingat: '*' hanya untuk permission tenant-level dalam company aktif.
- '*' tidak boleh berarti owner aplikasi global.
- '*' tidak boleh membuat tenant, migrate tenant, create company, atau assign user lewat public endpoint.

finance:
- dashboard.view
- settings.company.view
- master_data.view
- coa.view
- coa.create
- coa.edit
- contacts.view
- contacts.create
- contacts.edit
- journal.view
- journal.create
- journal.edit
- journal.void
- journal.approve
- journal.post
- cash_bank.view
- cash_bank.create
- cash_bank.edit
- cash_bank.void
- cash_bank.approve
- cash_bank.post
- cash_bank.transfer
- reports.view
- reports.export
- audit.view

accountant:
- dashboard.view
- master_data.view
- coa.view
- coa.create
- coa.edit
- contacts.view
- contacts.create
- contacts.edit
- journal.view
- journal.create
- journal.edit
- journal.void
- journal.approve
- journal.post
- reports.view
- reports.export
- audit.view

sales:
- dashboard.view
- contacts.view
- contacts.create
- contacts.edit
- products.view
- sales.view
- sales.create
- sales.edit
- sales.void
- reports.view

purchasing:
- dashboard.view
- contacts.view
- contacts.create
- contacts.edit
- products.view
- purchase.view
- purchase.create
- purchase.edit
- purchase.void
- reports.view

warehouse:
- dashboard.view
- products.view
- units.view
- warehouses.view
- inventory.view
- inventory.manage
- inventory.adjustment.create
- inventory.adjustment.edit
- inventory.adjustment.void
- inventory.transfer
- inventory.stock_opname
- reports.view

viewer:
- dashboard.view
- reports.view

PENTING:
Permission tenant-level tidak boleh dipakai untuk:
- create tenant
- migrate tenant
- create company
- delete company
- assign user ke company via public endpoint
- akses internal admin global

Owner company hanya owner di company tersebut, bukan owner aplikasi global.

FILE BARU:
- backend/config/permissions.php
- backend/app/Services/Permissions/PermissionService.php
- backend/app/Http/Middleware/EnsurePermission.php
- backend/app/Http/Controllers/Api/Auth/PermissionController.php
- backend/tests/Feature/Permissions/PermissionTest.php
- docs/phase-4b-permission-foundation-basic.md

FILE DIUBAH:
- backend/bootstrap/app.php
- backend/routes/api.php
- backend/app/Models/CompanyAccountingSetting.php jika user_permission_mode ditambahkan
- backend/app/Http/Requests/Settings/UpdateCompanyAccountingSettingRequest.php jika user_permission_mode ditambahkan
- docs/phase-4a-company-settings-foundation.md jika user_permission_mode ditambahkan

Jika perlu migration tambahan:
- backend/database/migrations/central/xxxx_xx_xx_xxxxxx_add_user_permission_mode_to_company_accounting_settings_table.php

Jangan edit migration lama yang sudah ada jika project sudah pernah migrate.

CONFIG permissions.php:
Struktur minimal:

return [
    'permissions' => [
        'dashboard.view',
        'settings.company.view',
        'settings.company.edit',
        ...
    ],

    'roles' => [
        'owner' => ['*'],
        'admin' => ['*'],
        'finance' => [...],
        'accountant' => [...],
        'sales' => [...],
        'purchasing' => [...],
        'warehouse' => [...],
        'viewer' => [...],
    ],
];

PERMISSION SERVICE:
Buat:
backend/app/Services/Permissions/PermissionService.php

Methods minimal:
- allPermissions(): array
- permissionsForRole(?string $role): array
- roleHasPermission(?string $role, string $permission): bool
- userPermissions(): array
- can(string $permission): bool
- cannot(string $permission): bool

Service harus:
- membaca role dari TenantContext
- mendukung wildcard '*'
- return empty array untuk unknown/null role
- tidak membaca role dari request body
- tidak membaca company_id dari request body
- tidak membuat query custom role database dulu
- diberi struktur internal yang mudah diperluas nanti

Tambahkan komentar di service:
- Phase 4B uses config-based role templates.
- Phase 14 will add company-level custom roles and user permission overrides.
- Do not put permission logic directly in controllers.

Suggested internal design:
- protected function resolveRolePermissions(?string $role): array
- protected function resolveUserOverrides(): array
  Untuk Phase 4B return empty array.
  Ini placeholder untuk Phase 14.
- public function userPermissions(): array
  Gabungkan role permission + user overrides.
  Untuk Phase 4B override masih kosong.

ENSURE PERMISSION MIDDLEWARE:
Buat:
backend/app/Http/Middleware/EnsurePermission.php

Behavior:
- menerima parameter permission, contoh:
  permission:sales.create
  permission:settings.company.edit
- memakai PermissionService
- jika user tidak punya permission, return 403
- response format:
{
  "success": false,
  "code": "PERMISSION_DENIED",
  "message": "You do not have permission to perform this action."
}
- jika punya permission, lanjutkan request

ALIAS MIDDLEWARE:
Daftarkan di backend/bootstrap/app.php:
permission => App\Http\Middleware\EnsurePermission::class

Jangan menghapus alias middleware existing seperti company.access.

PERMISSION CONTROLLER:
Buat:
backend/app/Http/Controllers/Api/Auth/PermissionController.php

Method:
- index()

Response:
{
  "success": true,
  "message": "Permissions retrieved successfully",
  "data": {
    "role": "admin",
    "permission_mode": "role_template",
    "permissions": [...]
  }
}

Controller harus:
- membaca role dari TenantContext
- membaca permissions dari PermissionService
- jika company_accounting_settings ada, sertakan user_permission_mode sebagai permission_mode
- jika setting belum ada, permission_mode default role_template
- jangan membaca role/company_id dari request body

ROUTES:
Tambahkan route:
GET /api/auth/permissions

Middleware:
- auth:sanctum
- company.access

Jika route settings dari Phase 4A sudah ada, tambahkan permission middleware:
- GET /api/settings/company pakai permission:settings.company.view
- PATCH /api/settings/company/accounting pakai permission:settings.company.edit
- PATCH /api/settings/company/modules pakai permission:settings.company.edit

Jangan gunakan permission lama manage_company_settings.

JANGAN BUAT ROUTE:
- POST /api/companies
- DELETE /api/companies/{id}
- POST /api/tenants
- POST /api/tenant/migrate
- POST /api/company-users
- POST /api/companies/{id}/users

TEST:
Buat:
backend/tests/Feature/Permissions/PermissionTest.php

Test minimal:
1. unauthenticated user cannot get permissions
Expected 401

2. authenticated user cannot get permissions without X-Company-ID
Expected 422

3. owner role receives wildcard permission
Expected 200
Assert role owner
Assert permissions contains '*'

4. admin role receives wildcard permission or settings.company.edit
Expected true for settings.company.edit

5. viewer does not have settings.company.edit
Expected false

6. sales has sales.create but does not have purchase.create
Expected true for sales.create
Expected false for purchase.create

7. purchasing has purchase.create but does not have sales.create
Expected true for purchase.create
Expected false for sales.create

8. warehouse has inventory.manage but does not have sales.create
Expected true for inventory.manage
Expected false for sales.create

9. viewer is forbidden from updating company settings
If Phase 4A route exists:
PATCH /api/settings/company/accounting
Expected 403

10. admin can access protected company settings route
If Phase 4A route exists:
PATCH /api/settings/company/accounting with valid payload
Expected not 403

11. user cannot get permissions for another user's company
Expected 403

12. unknown role has no permission
Expected false

13. permission endpoint includes permission_mode
Expected data.permission_mode exists
Default role_template

Jika testing route settings sulit karena Phase 4A belum merge, tetap buat tests untuk PermissionService dan middleware dengan test route sementara di test file jika project style memungkinkan.

DOKUMENTASI:
Buat:
docs/phase-4b-permission-foundation-basic.md

Isi:
- tujuan Phase 4B
- static role-permission map hanya template awal
- Phase 14 nanti akan membuat dynamic/manual permission per user tenant
- alasan permission dibuat granular
- daftar role template
- daftar permission granular
- role-permission matrix
- endpoint GET /api/auth/permissions
- permission_mode role_template/manual_per_user
- middleware permission usage
- response 403 permission denied
- batasan scope
- command test
- notes commit

Tambahkan bagian "Design for Phase 14":
Jelaskan bahwa Phase 14 nanti akan menambahkan:
- custom role per company
- user-specific allow permission
- user-specific deny permission
- UI checklist permission per user
- audit log perubahan permission
- tenant admin bisa memberi akses lintas modul ke satu user

COMMAND YANG DIJALANKAN:
Jika environment memungkinkan:
- php artisan migrate
- php artisan test --filter=PermissionTest
- php artisan route:list

Jika environment tidak bisa menjalankan command, tulis jujur di final summary.

ACCEPTANCE CRITERIA:
Phase 4B selesai jika:
1. config/permissions.php dibuat dengan granular permissions
2. PermissionService dibuat
3. PermissionService membaca role dari TenantContext
4. PermissionService mendukung wildcard '*'
5. PermissionService punya placeholder/struktur untuk Phase 14 user overrides
6. EnsurePermission middleware dibuat
7. Alias middleware permission terdaftar
8. GET /api/auth/permissions aktif
9. Endpoint permission wajib auth:sanctum + company.access
10. Endpoint permission return role, permission_mode, permissions
11. settings route Phase 4A diproteksi settings.company.view/edit jika route tersedia
12. Viewer tidak punya settings.company.edit
13. Admin/owner punya settings.company.edit
14. Sales punya sales.create tapi tidak punya purchase.create
15. Purchasing punya purchase.create tapi tidak punya sales.create
16. Warehouse punya inventory.manage tapi tidak punya sales.create
17. Unknown role tidak punya permission
18. Test PermissionTest dibuat
19. Dokumentasi Phase 4B dibuat
20. Jika user_permission_mode ditambahkan, migration/model/request/docs Phase 4A ikut diperbarui
21. Tidak ada custom role database
22. Tidak ada UI role management
23. Tidak ada endpoint public create/migrate/assign tenant/company
24. Tidak ada modul akuntansi dibuat

FINAL SUMMARY:
Sertakan:
- file dibuat
- file diubah
- migration tambahan jika ada
- endpoint ditambahkan
- middleware ditambahkan
- test yang dibuat
- command yang berhasil dijalankan
- command yang gagal/tidak bisa dijalankan
- catatan security bahwa permission tenant-level tidak membuka akses create tenant/company/migrate/assign user
- catatan bahwa Phase 4B static permission hanya template awal dan Phase 14 akan menambahkan dynamic/manual permission per user tenant

COMMIT MESSAGE:
add extensible permission foundation

COMMIT BODY:
Phase 4B: add granular static permission foundation with PermissionService, permission middleware, current company permissions endpoint, backend tests, and documentation. The design is extensible for Phase 14 dynamic per-user tenant permissions. No custom role database, role management UI, accounting modules, or public tenant/company management endpoints were added.