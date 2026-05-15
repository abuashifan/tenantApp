Kita masuk ke Phase 3D project TenantAppDevelopment.

KONTEKS PROJECT
Project ini adalah aplikasi akuntansi multi-tenant dengan stack:
- Backend: Laravel API
- Frontend: Next.js
- Styling: TailwindCSS
- Database: SQLite

Arsitektur tenant:
- central.sqlite = database pusat
- 1 perusahaan = 1 file SQLite tenant
- user bisa punya akses ke banyak perusahaan
- user memilih perusahaan aktif setelah login
- request tenant memakai header X-Company-ID
- tenant database berada di backend/database/tenants
- tenant database connection name adalah tenant

STATUS SEBELUM PHASE 3D
Phase 2 sudah selesai:
- Sanctum auth API
- register/login/logout/me
- GET /api/companies
- POST /api/companies/select
- middleware company.access
- TenantContext service
- GET /api/tenant-context-test
- frontend login/register/select-company/dashboard
- user hanya bisa melihat company miliknya
- user hanya bisa memilih company miliknya
- tenant-context-test wajib auth:sanctum dan company.access
- tidak ada create company
- tidak ada create tenant
- tidak ada public endpoint tenant creation

Phase 3A diasumsikan sudah selesai:
- Ada internal Artisan command tenant:create
- Command membuat company baru
- Command membuat file SQLite tenant di database/tenants
- Command membuat record tenant_databases
- Command membuat record company_users
- Tidak ada frontend/API public untuk create tenant

Phase 3B diasumsikan sudah selesai:
- Ada internal Artisan command tenant:migrate
- Bisa migrate satu tenant dengan --company-id
- Bisa migrate semua tenant aktif dengan --all
- Migration hanya memakai connection tenant
- Migration hanya dari database/migrations/tenant
- Tidak ada frontend/API public untuk migrate tenant

Phase 3C diasumsikan sudah selesai:
- Ada internal Artisan command company:assign-user
- Ada internal Artisan command company:seed-demo
- Assignment user-company hanya lewat command internal
- Tidak ada frontend/API public untuk assign user ke company

ATURAN SECURITY WAJIB
Client/user biasa TIDAK BOLEH create tenant/company/migrate tenant/assign user.

Untuk MVP:
- Jangan buat endpoint public POST /api/companies
- Jangan buat endpoint public POST /api/tenants
- Jangan buat endpoint public migrate tenant
- Jangan buat endpoint public assign user ke company
- Jangan buat halaman frontend manage tenant/company users
- Jangan buat tombol create/migrate/manage tenant
- Jangan buat internal admin panel
- Tenant creation, migration, and assignment tetap command internal only

TUJUAN PHASE 3D
Buat automated backend tests untuk memastikan tenant isolation berjalan benar.

Phase ini hanya testing dan dokumentasi.
Jangan membuat fitur baru.

TEST FILE YANG HARUS DIBUAT
Buat:
backend/tests/Feature/Tenant/TenantIsolationTest.php

Buat dokumentasi:
docs/phase-3d-tenant-isolation-testing.md

Jika folder backend/tests/Feature/Tenant belum ada, buat folder tersebut.

BATASAN SCOPE
Jangan mengerjakan:
- frontend UI
- endpoint API baru
- endpoint API create company
- endpoint API create tenant
- endpoint API migrate tenant
- endpoint API assign user
- internal admin panel
- Chart of Accounts
- Journal Entry
- Sales
- Purchase
- Cash & Bank
- Inventory
- report/laporan keuangan
- role permission detail transaksi
- logic debit kredit
- posting jurnal
- dashboard baru
- perubahan flow login/select-company/dashboard

FILE YANG BOLEH DIBUAT/DIUBAH
- backend/tests/Feature/Tenant/TenantIsolationTest.php
- docs/phase-3d-tenant-isolation-testing.md

Jika test membutuhkan factory kecil dan factory sudah ada, boleh menyesuaikan factory existing secara minimal.

FILE YANG TIDAK BOLEH DIUBAH KECUALI ADA BUG SECURITY NYATA
- frontend/*
- backend/routes/api.php
- backend/app/Http/Controllers/*
- backend/app/Http/Middleware/EnsureCompanyAccess.php
- backend/app/Services/Tenant/TenantContext.php
- backend/app/Services/Tenant/TenantProvisioningService.php
- backend/app/Services/Tenant/TenantMigrationService.php
- backend/app/Services/Companies/CompanyUserAssignmentService.php

Jika menemukan bug security nyata saat test gagal:
- fix seminimal mungkin
- jelaskan di final summary
- jangan refactor besar

TEST YANG WAJIB ADA DI TenantIsolationTest

1. unauthenticated user cannot access tenant context
Endpoint:
GET /api/tenant-context-test
Expected:
401

2. authenticated user cannot access tenant context without X-Company-ID
Endpoint:
GET /api/tenant-context-test
Header:
Authorization Bearer token atau actingAs Sanctum
Expected:
422

3. authenticated user can access assigned company tenant context
Setup:
User A
Company A active
TenantDatabase A active
CompanyUser User A -> Company A active role owner
Tenant SQLite file exists if required by existing code
Request:
GET /api/tenant-context-test
Header:
X-Company-ID: Company A id
Expected:
200
Response contains company_id Company A id

4. authenticated user cannot access another user's company tenant context
Setup:
User A assigned to Company A
User B assigned to Company B
Request as User A:
GET /api/tenant-context-test
Header:
X-Company-ID: Company B id
Expected:
403

5. GET /api/companies only returns companies assigned to authenticated user
Setup:
User A assigned to Company A
User B assigned to Company B
Request as User A:
GET /api/companies
Expected:
200
Response contains Company A
Response does not contain Company B

6. authenticated user cannot select another user's company
Setup:
User A assigned to Company A
User B assigned to Company B
Request as User A:
POST /api/companies/select
Body:
company_id = Company B id
Expected:
403

7. inactive tenant database is rejected
Setup:
User A assigned to Company A
Company A active
TenantDatabase A status inactive
Request as User A:
GET /api/tenant-context-test
Header:
X-Company-ID: Company A id
Expected:
422

8. forbidden public tenant management routes do not exist
Assert route collection does not contain forbidden public routes:
POST /api/companies
POST /api/tenants
POST /api/tenant/migrate
POST /api/company-users
POST /api/companies/{id}/users

CATATAN TEST DATA
Gunakan data minimal:
- User A
- User B
- Company A
- Company B
- TenantDatabase A
- TenantDatabase B
- CompanyUser assignments

Jangan bergantung hanya pada admin@example.com.
Tenant isolation harus membuktikan antar user berbeda.

CATATAN SQLITE TESTING
Project memakai SQLite.
Gunakan RefreshDatabase jika compatible.
Jika RefreshDatabase tidak compatible dengan struktur project, gunakan setup manual sesuai pola test existing.

Jika test perlu file tenant SQLite:
- buat file sementara di database/tenants
- gunakan nama aman seperti company_000101.sqlite dan company_000102.sqlite
- jangan commit file SQLite
- hapus file sementara di teardown jika dibuat manual

Jangan menjalankan tenant migrations kompleks di test ini kecuali benar-benar diperlukan oleh existing code.
Untuk tenant-context-test, biasanya cukup metadata tenant database aktif dan file SQLite ada.

DOKUMENTASI
Buat docs/phase-3d-tenant-isolation-testing.md berisi:
- tujuan Phase 3D
- daftar test yang dibuat
- security behavior yang divalidasi
- manual test command
- route security check
- batasan scope
- notes commit

MANUAL TEST DI DOKUMENTASI
Tuliskan:

1. Jalankan test khusus:
php artisan test --filter=TenantIsolationTest

2. Jalankan semua test:
php artisan test

3. Cek route:
php artisan route:list

Pastikan tidak ada:
POST /api/companies
POST /api/tenants
POST /api/tenant/migrate
POST /api/company-users
POST /api/companies/{id}/users

ACCEPTANCE CRITERIA
Phase 3D dianggap selesai jika:
1. TenantIsolationTest dibuat
2. Test unauthenticated request menghasilkan 401
3. Test tanpa X-Company-ID menghasilkan 422
4. Test valid company access menghasilkan 200
5. Test user tidak bisa akses company user lain menghasilkan 403
6. Test GET /api/companies hanya return company milik user
7. Test POST /api/companies/select menolak company milik user lain
8. Test inactive tenant database ditolak
9. Test forbidden route public create/migrate/assign tenant tidak ada
10. Tidak ada perubahan frontend
11. Tidak ada endpoint API baru
12. Dokumentasi Phase 3D dibuat

JALANKAN CHECK YANG MEMUNGKINKAN
- php artisan test --filter=TenantIsolationTest
- php artisan test
- php artisan route:list

Jika environment Codex tidak bisa menjalankan sebagian command, tulis secara jujur di final summary.

NOTES COMMIT UNTUK FINAL SUMMARY
Setelah selesai, sertakan notes commit berikut:

Commit message:
add tenant isolation tests

Commit notes:
PHASE 3D COMPLETED — Tenant Isolation Testing

Scope completed:
- Added TenantIsolationTest feature test
- Added tests for unauthenticated tenant-context access
- Added tests for missing X-Company-ID validation
- Added tests for valid tenant context access
- Added tests preventing users from accessing another user's company
- Added tests for GET /api/companies company isolation
- Added tests for POST /api/companies/select authorization
- Added tests for inactive tenant database rejection
- Added route security assertion for forbidden public tenant/company management routes
- Added docs/phase-3d-tenant-isolation-testing.md

Security preserved:
- No frontend changes
- No new API endpoints
- No public create company endpoint
- No public create tenant endpoint
- No public tenant migration endpoint
- No public company user assignment endpoint
- Tenant creation/migration/assignment remains internal command-only

Important behavior verified:
- auth:sanctum required for tenant context
- X-Company-ID required for tenant context
- company.access middleware blocks unauthorized company access
- users only see companies assigned to them
- users cannot select companies they are not assigned to
- inactive tenant databases are rejected
- route list does not expose forbidden tenant management endpoints

Manual checks:
- php artisan test --filter=TenantIsolationTest
- php artisan test
- php artisan route:list
- Confirm no public tenant/company management routes exist