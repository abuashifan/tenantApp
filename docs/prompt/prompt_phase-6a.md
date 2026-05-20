Kita masuk ke Phase 6A project TenantAppDevelopment.

NAMA PHASE:
Phase 6A — Analytical Dimensions Foundation

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
- Data master, jurnal, transaksi, dan analytical dimensions berada di tenant database
- Data antar company tidak boleh dicampur dalam satu tenant database yang sama

PENTING:

- Tetap pertahankan konsep 1 company = 1 tenant database.
- SQLite hanya database development/MVP awal.
- Production nanti bisa MySQL/MariaDB/PostgreSQL.
- Jangan membuat logic yang hanya bergantung pada SQLite.
- Jangan mengubah arsitektur menjadi semua transaksi company dalam satu database transaksi.
- Phase 6A disisipkan setelah Phase 6 Journal Entry Engine.
- Phase 6A tidak membuat General Ledger, Trial Balance, Financial Statements, Sales, Purchase, Cash Bank, Inventory, atau frontend UI besar.
- Phase 6A fokus pada analytical dimensions: Departments dan Projects.
- Cost Center, Branch, Location ditunda ke advanced phase.

STATUS SEBELUM PHASE 6A:
Phase 5 sudah ada di repo:

- master-data routes sudah ada di backend/routes/api.php
- tenant model ChartOfAccount, Contact, Unit, Product, ProductCategory, Warehouse, AccountMapping sudah ada
- tenant migrations master data sudah ada
- services/controllers master data sudah ada

Phase 6 sedang/sudah dikerjakan:

- journal_entries tenant table
- journal_entry_lines tenant table
- JournalEntry model
- JournalEntryLine model
- Journal services
- Journal routes
- Journal tests
- docs phase 6

PENTING UNTUK PHASE 6A:
Sebelum mulai, jangan relisting seluruh repository.
Baca hanya file yang diperlukan:

1. Routing:

- backend/routes/api.php

2. Middleware dan tenant context:

- backend/bootstrap/app.php
- backend/app/Http/Middleware/EnsureCompanyAccess.php
- backend/app/Http/Middleware/EnsurePermission.php
- backend/app/Services/Tenant/TenantContext.php

3. Existing master data pattern:

- backend/app/Http/Controllers/Api/MasterData/UnitController.php
- backend/app/Http/Controllers/Api/MasterData/WarehouseController.php
- backend/app/Services/MasterData/UnitService.php
- backend/app/Services/MasterData/WarehouseService.php
- backend/app/Models/Tenant/Unit.php
- backend/app/Models/Tenant/Warehouse.php
- backend/app/Http/Requests/MasterData/StoreUnitRequest.php
- backend/app/Http/Requests/MasterData/UpdateUnitRequest.php
- backend/app/Http/Requests/MasterData/StoreWarehouseRequest.php
- backend/app/Http/Requests/MasterData/UpdateWarehouseRequest.php

4. Existing journal files:

- backend/app/Models/Tenant/JournalEntry.php
- backend/app/Models/Tenant/JournalEntryLine.php
- backend/database/migrations/tenant/_journal_
- backend/app/Services/Journal/JournalValidationService.php
- backend/app/Services/Journal/JournalEntryService.php
- backend/app/Services/Journal/JournalLineNormalizer.php
- backend/app/Http/Controllers/Api/Journal/JournalEntryController.php
- backend/app/Http/Requests/Journal/StoreJournalEntryRequest.php
- backend/app/Http/Requests/Journal/UpdateJournalEntryRequest.php

5. Existing permission/config:

- backend/config/permissions.php
- backend/app/Services/Permissions/PermissionService.php

6. Existing docs:

- docs/phase-5-master-data-akuntansi.md
- docs/phase-6-journal-entry-engine.md if exists

JANGAN membaca semua file/folder project.
Jangan menjalankan tree/listing besar.

TUJUAN PHASE 6A:
Membuat fondasi analytical dimensions agar jurnal dan laporan nanti bisa dianalisis berdasarkan:

1. Department
2. Project

Contoh penggunaan:

- Beban listrik untuk Department Operasional
- Beban iklan untuk Project Campaign Lebaran
- Pendapatan dari Project Pembangunan X
- Biaya bahan untuk Project A
- Laporan laba rugi bisa difilter per project/departement nanti

Phase 6A harus menambahkan:

1. Master data Department
2. Master data Project
3. Relasi optional department_id dan project_id di journal_entry_lines
4. Validasi optional department/project pada journal lines
5. Permission granular untuk departments/projects
6. API CRUD backend untuk department/project
7. Test
8. Dokumentasi

KEPUTUSAN BISNIS WAJIB:

1. Department dan Project berada di tenant database.
2. Department dan Project adalah analytical dimensions, bukan transaksi.
3. Department dan Project boleh optional di journal line.
4. Dimension disimpan di journal_entry_lines, bukan hanya di journal_entries.
5. Alasannya: satu jurnal bisa punya beberapa line dengan department/project berbeda.
6. Department inactive tidak boleh dipakai untuk journal line baru.
7. Project inactive/completed/cancelled tidak boleh dipakai untuk journal line baru.
8. Data jurnal lama tetap bisa menampilkan department/project yang sudah inactive.
9. Tidak ada hard delete untuk department/project di Phase 6A.
10. Gunakan deactivate.
11. Project status minimal:
    - active
    - completed
    - on_hold
    - cancelled
12. Hanya project status active yang boleh dipakai untuk input jurnal baru.
13. Department/project tidak wajib diisi.
14. Jika diisi, harus valid dan aktif.
15. Cost Center tidak dibuat di Phase 6A.
16. Branch/Location tidak dibuat di Phase 6A.
17. Department/project report filter belum dibuat di Phase 6A; itu nanti Phase 7/Reports.
18. Phase 6A tidak membuat frontend UI besar.

SCOPE PHASE 6A:
A. Tenant migrations:

- create_departments_table
- create_projects_table
- add_dimensions_to_journal_entry_lines_table

B. Tenant models:

- Department
- Project
- Update JournalEntryLine relation

C. Backend services:

- DepartmentService
- ProjectService
- Update JournalValidationService / JournalLineNormalizer / JournalEntryService as needed

D. Backend controllers:

- DepartmentController
- ProjectController

E. Requests:

- StoreDepartmentRequest
- UpdateDepartmentRequest
- StoreProjectRequest
- UpdateProjectRequest
- Update journal Store/Update requests to accept department_id/project_id in lines

F. Routes:

- /api/master-data/departments
- /api/master-data/projects

G. Permission:

- departments.view
- departments.create
- departments.edit
- departments.deactivate
- projects.view
- projects.create
- projects.edit
- projects.deactivate

H. Tests:

- DepartmentTest
- ProjectTest
- JournalDimensionTest

I. Documentation:

- docs/phase-6a-analytical-dimensions-foundation.md
- update docs/phase-6-journal-entry-engine.md if exists

JANGAN MENGERJAKAN:

- Cost Center
- Branch
- Location
- General Ledger
- Trial Balance
- Financial Statements
- Sales Invoice
- Purchase Invoice
- Cash Bank transaction
- Inventory stock movement
- Stock Adjustment
- Report endpoints
- Frontend UI besar
- Dashboard UI
- User role management UI
- Create company endpoint public
- Create tenant endpoint public
- Migrate tenant endpoint public
- Assign user endpoint public
- Archive/purge engine
- SQLite-specific logic

TENANT MIGRATION 1: departments
Buat tenant migration:
backend/database/migrations/tenant/xxxx_xx_xx_xxxxxx_create_departments_table.php

Table:
departments

Fields:

- id
- code string
- name string
- description text nullable
- is_active boolean default true
- metadata json/text nullable
- timestamps

Indexes/constraints:

- code unique
- name index
- is_active index

Business rules:

- code wajib unique dalam tenant database
- name wajib
- inactive department tidak muncul untuk transaksi baru
- department lama tetap bisa tampil di histori jurnal
- tidak ada hard delete di Phase 6A

TENANT MIGRATION 2: projects
Buat tenant migration:
backend/database/migrations/tenant/xxxx_xx_xx_xxxxxx_create_projects_table.php

Table:
projects

Fields:

- id
- code string
- name string
- description text nullable
- start_date date nullable
- end_date date nullable
- status string default active
- is_active boolean default true
- metadata json/text nullable
- timestamps

Indexes/constraints:

- code unique
- name index
- status index
- is_active index
- start_date index
- end_date index

Allowed status:

- active
- completed
- on_hold
- cancelled

Business rules:

- code wajib unique dalam tenant database
- name wajib
- project yang boleh dipakai untuk jurnal baru harus:
  - is_active = true
  - status = active
- project completed/on_hold/cancelled tidak boleh dipakai untuk journal line baru
- project lama tetap bisa tampil di histori jurnal
- tidak ada hard delete di Phase 6A

TENANT MIGRATION 3: add dimensions to journal_entry_lines
Buat tenant migration:
backend/database/migrations/tenant/xxxx_xx_xx_xxxxxx_add_dimensions_to_journal_entry_lines_table.php

Table:
journal_entry_lines

Add nullable fields:

- department_id unsignedBigInteger nullable after account_id if possible
- project_id unsignedBigInteger nullable after department_id if possible

Indexes:

- department_id index
- project_id index

Foreign keys:

- department_id references departments.id nullOnDelete if style supports it
- project_id references projects.id nullOnDelete if style supports it

Important:

- Jika migration journal_entry_lines belum ada karena Phase 6 belum selesai, jangan gagal tanpa penjelasan.
- Jika journal_entry_lines belum ada, buat dokumentasi pending dan/atau buat migration dengan asumsi table akan ada setelah Phase 6.
- Jika migration order perlu disesuaikan, gunakan timestamp setelah journal_entry_lines migration.
- Jangan mengubah migration journal_entry_lines lama jika sudah dibuat.
- Buat migration tambahan.

MODEL: Department
Buat:
backend/app/Models/Tenant/Department.php

Connection:

- protected $connection = 'tenant';

Fillable:

- code
- name
- description
- is_active
- metadata

Casts:

- is_active boolean
- metadata array

Scopes:

- active()
- inactive()

Relations:

- journalEntryLines() jika JournalEntryLine model ada

Helpers:

- isActive(): bool

MODEL: Project
Buat:
backend/app/Models/Tenant/Project.php

Connection:

- protected $connection = 'tenant';

Fillable:

- code
- name
- description
- start_date
- end_date
- status
- is_active
- metadata

Casts:

- start_date date
- end_date date
- is_active boolean
- metadata array

Scopes:

- active()
- inactive()
- usable()
  => is_active true and status active

Relations:

- journalEntryLines() jika JournalEntryLine model ada

Helpers:

- isActive(): bool
- isUsable(): bool
- isCompleted(): bool
- isOnHold(): bool
- isCancelled(): bool

UPDATE MODEL: JournalEntryLine
Jika backend/app/Models/Tenant/JournalEntryLine.php sudah ada:
Tambahkan fillable:

- department_id
- project_id

Tambahkan casts integer jika style project menggunakan.

Tambahkan relations:

- department()
- project()

Tambahkan helper:

- hasDepartment(): bool
- hasProject(): bool

Jika JournalEntryLine belum ada:

- Jangan membuat duplicate model jika Phase 6 belum merge.
- Buat catatan di dokumentasi bahwa relasi harus ditambahkan setelah JournalEntryLine ada.
- Jika Phase 6 sedang aktif di branch yang sama dan file ada, update file tersebut.

SERVICE: DepartmentService
Buat:
backend/app/Services/MasterData/DepartmentService.php

Methods:

- list(array $filters = [])
- find(int|string $id): Department
- create(array $data): Department
- update(Department $department, array $data): Department
- deactivate(Department $department): Department
- activate(Department $department): Department

Behavior:

- list support filters:
  - search
  - is_active
- create validate code unique via request/service
- deactivate set is_active false, no hard delete
- activate set is_active true

SERVICE: ProjectService
Buat:
backend/app/Services/MasterData/ProjectService.php

Methods:

- list(array $filters = [])
- find(int|string $id): Project
- create(array $data): Project
- update(Project $project, array $data): Project
- deactivate(Project $project): Project
- activate(Project $project): Project
- markCompleted(Project $project): Project
- markOnHold(Project $project): Project
- cancel(Project $project): Project

Behavior:

- list support filters:
  - search
  - status
  - is_active
- deactivate set is_active false
- activate set is_active true
- markCompleted set status completed
- markOnHold set status on_hold
- cancel set status cancelled
- no hard delete

REQUESTS:
Buat folder jika belum ada:
backend/app/Http/Requests/MasterData

Department requests:

- StoreDepartmentRequest
- UpdateDepartmentRequest

Validation:
StoreDepartmentRequest:

- code required|string|max:50
- name required|string|max:255
- description nullable|string
- is_active nullable|boolean

UpdateDepartmentRequest:

- code sometimes|required|string|max:50
- name sometimes|required|string|max:255
- description nullable|string
- is_active nullable|boolean

Project requests:

- StoreProjectRequest
- UpdateProjectRequest

Validation:
StoreProjectRequest:

- code required|string|max:50
- name required|string|max:255
- description nullable|string
- start_date nullable|date
- end_date nullable|date|after_or_equal:start_date
- status nullable|in:active,completed,on_hold,cancelled
- is_active nullable|boolean

UpdateProjectRequest:

- code sometimes|required|string|max:50
- name sometimes|required|string|max:255
- description nullable|string
- start_date nullable|date
- end_date nullable|date|after_or_equal:start_date
- status nullable|in:active,completed,on_hold,cancelled
- is_active nullable|boolean

Update journal requests:
Jika StoreJournalEntryRequest dan UpdateJournalEntryRequest ada:
Tambahkan untuk lines:

- lines.\*.department_id nullable|integer
- lines.\*.project_id nullable|integer

Validation keberadaan/aktifnya department/project boleh di JournalValidationService, bukan wajib di FormRequest.

CONTROLLERS:
Buat folder jika belum ada:
backend/app/Http/Controllers/Api/MasterData

Controllers:

- DepartmentController
- ProjectController

DepartmentController methods:

- index
- store
- show
- update
- deactivate
- activate

ProjectController methods:

- index
- store
- show
- update
- deactivate
- activate
- complete optional
- hold optional
- cancel optional

Untuk Phase 6A, minimal:

- index
- store
- show
- update
- deactivate
- activate

Jika membuat complete/hold/cancel routes, pastikan permission projects.edit.

Use existing response style:

- ApiResponseBuilder if available
- otherwise existing ApiResponse trait

ROUTES:
Update backend/routes/api.php.

Tambahkan import:

- DepartmentController
- ProjectController

Tambahkan dalam group:
Route::middleware(['auth:sanctum', 'company.access'])->prefix('master-data')->group(...)

Departments:
GET /api/master-data/departments
permission:departments.view

POST /api/master-data/departments
permission:departments.create

GET /api/master-data/departments/{id}
permission:departments.view

PATCH /api/master-data/departments/{id}
permission:departments.edit

PATCH /api/master-data/departments/{id}/deactivate
permission:departments.deactivate

PATCH /api/master-data/departments/{id}/activate
permission:departments.edit

Projects:
GET /api/master-data/projects
permission:projects.view

POST /api/master-data/projects
permission:projects.create

GET /api/master-data/projects/{id}
permission:projects.view

PATCH /api/master-data/projects/{id}
permission:projects.edit

PATCH /api/master-data/projects/{id}/deactivate
permission:projects.deactivate

PATCH /api/master-data/projects/{id}/activate
permission:projects.edit

Do not create public route without auth/company.access.

PERMISSIONS:
Update backend/config/permissions.php.

Add permission list:

- departments.view
- departments.create
- departments.edit
- departments.deactivate
- projects.view
- projects.create
- projects.edit
- projects.deactivate

Role template recommendation:
owner:

- wildcard already covers

admin:

- wildcard or add all

finance:

- departments.view
- projects.view

accountant:

- departments.view
- departments.create
- departments.edit
- projects.view
- projects.create
- projects.edit

sales:

- projects.view
- departments.view

purchasing:

- projects.view
- departments.view

warehouse:

- projects.view
- departments.view

viewer:

- no need, or view only if current style gives reports only
  Recommended: viewer does not need department/project management. If config pattern uses read access, add departments.view/projects.view only if consistent.

Important:

- Jangan membuat custom role database.
- Dynamic permission tetap Phase 14.

JOURNAL VALIDATION INTEGRATION:
Update JournalValidationService if exists.

Rules for journal lines:

1. department_id nullable.
2. if department_id provided:
   - department must exist in tenant database
   - department must be active for new journal/create/update
3. project_id nullable.
4. if project_id provided:
   - project must exist
   - project is_active true
   - project status active
5. Historical journals can still display inactive/completed projects, but create/update should use active/usable only.

Methods to add if suitable:

- validateDimensions(array $lines): array
- validateDepartment(?int $departmentId): array
- validateProject(?int $projectId): array

If JournalValidationService is not yet available:

- Do not create duplicate service.
- Document pending integration.
- Add tests only if service exists.

JOURNAL LINE NORMALIZER INTEGRATION:
If JournalLineNormalizer exists:

- Ensure department_id and project_id are preserved in normalized lines.
- Do not strip them.

JOURNAL ENTRY SERVICE INTEGRATION:
If JournalEntryService creates lines:

- Ensure department_id and project_id are saved to journal_entry_lines.
- If service replaces lines on update, preserve department/project from request.

If JournalEntryService not available:

- Document pending integration.

TESTS:
Buat tests:

1. backend/tests/Feature/MasterData/DepartmentTest.php
2. backend/tests/Feature/MasterData/ProjectTest.php
3. backend/tests/Feature/Journal/JournalDimensionTest.php if Journal Phase 6 exists

DepartmentTest minimal:

1. unauthenticated cannot list departments => 401
2. missing X-Company-ID rejected => 422
3. user with departments.create can create department
4. duplicate code rejected
5. user can update department
6. user can deactivate department
7. inactive department not returned when active filter true
8. user without permission cannot create department
9. user cannot access another company tenant department

ProjectTest minimal:

1. unauthenticated cannot list projects => 401
2. missing X-Company-ID rejected => 422
3. user with projects.create can create project
4. duplicate code rejected
5. end_date before start_date rejected
6. user can update project
7. user can deactivate project
8. active project usable
9. completed project not usable for new journal line
10. user without permission cannot create project

JournalDimensionTest minimal if journal exists:

1. create journal line with department_id works
2. create journal line with project_id works
3. inactive department rejected
4. inactive project rejected
5. completed project rejected
6. journal line stores department_id and project_id
7. JournalEntryLine relation department works
8. JournalEntryLine relation project works

Testing notes:

- Use tenant test setup.
- Use auth:sanctum and X-Company-ID.
- Do not rely only on demo admin@example.com.
- If Journal Phase 6 is not merged, skip JournalDimensionTest and document pending integration honestly.

DOCUMENTATION:
Buat:
docs/phase-6a-analytical-dimensions-foundation.md

Isi wajib:

- tujuan Phase 6A
- kenapa departments/projects diperlukan
- kenapa dimension ada di journal_entry_lines, bukan hanya journal_entries
- tabel departments
- tabel projects
- update journal_entry_lines department_id/project_id
- permission departments/projects
- API endpoints
- validation rules
- relationship ERD ringkas
- integration with Journal Entry Engine
- integration with future General Ledger/Trial Balance filters
- batasan scope
- command test
- notes commit

Update docs/phase-6-journal-entry-engine.md jika ada:
Tambahkan bagian:

- Analytical Dimensions akan ditangani Phase 6A
- journal_entry_lines mendukung optional department_id/project_id setelah Phase 6A
- GL/Trial Balance nanti bisa filter by department/project

Jelaskan secara eksplisit:

- Phase 6A tidak membuat Cost Center.
- Phase 6A tidak membuat Branch/Location.
- Phase 6A tidak membuat report.
- Phase 6A tidak membuat frontend UI besar.
- Phase 6A hanya backend foundation untuk analytical dimensions.

COMMAND YANG DIJALANKAN:
Jika environment memungkinkan:

- php artisan tenant:migrate --company=<id>
  atau command tenant migration sesuai project Phase 3
- php artisan test --filter=DepartmentTest
- php artisan test --filter=ProjectTest
- php artisan test --filter=JournalDimensionTest
- php artisan route:list

Jika environment tidak bisa menjalankan command, tulis jujur di final summary.

ACCEPTANCE CRITERIA:
Phase 6A selesai jika:

1. Tenant migration departments dibuat
2. Tenant migration projects dibuat
3. Tenant migration add department_id/project_id to journal_entry_lines dibuat atau pending dijelaskan jika Phase 6 belum merge
4. Department model dibuat
5. Project model dibuat
6. JournalEntryLine relation department/project ditambahkan jika file ada
7. DepartmentService dibuat
8. ProjectService dibuat
9. Department requests dibuat
10. Project requests dibuat
11. DepartmentController dibuat
12. ProjectController dibuat
13. Routes departments/projects dibuat dengan auth:sanctum + company.access
14. Permission departments/projects ditambahkan
15. Department CRUD backend bekerja
16. Project CRUD backend bekerja
17. No hard delete, hanya deactivate
18. Journal validation menerima optional department_id/project_id jika journal service ada
19. Journal line menyimpan department_id/project_id jika journal service ada
20. Tests dibuat
21. Dokumentasi Phase 6A dibuat
22. Tidak ada Cost Center dibuat
23. Tidak ada Branch/Location dibuat
24. Tidak ada report dibuat
25. Tidak ada frontend UI besar dibuat
26. Tidak ada public tenant/company management endpoint dibuat
27. Tidak ada SQLite-specific logic dibuat

FINAL SUMMARY:
Sertakan:

- file dibuat
- file diubah
- tenant migrations dibuat
- models dibuat
- services dibuat
- endpoints ditambahkan
- permissions ditambahkan
- journal integration dilakukan atau pending jika Phase 6 belum merge
- tests dibuat
- command yang berhasil dijalankan
- command yang gagal/tidak bisa dijalankan
- catatan bahwa Phase 6A hanya analytical dimensions foundation
- catatan bahwa cost center/branch/location tidak dibuat
- catatan bahwa report filter by department/project akan dilakukan di Phase 7+

COMMIT MESSAGE:
add analytical dimensions foundation

COMMIT BODY:
Phase 6A: add analytical dimensions foundation with tenant departments and projects, optional journal line dimension fields, services, validation, API controllers, permissions, tests, and documentation. This prepares department/project tracking for future reports without adding cost centers, branches, report modules, or frontend UI.
