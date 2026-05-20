Kita masuk ke Phase 3C project TenantAppDevelopment.

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
- format tenant database: company_000001.sqlite, company_000002.sqlite, dst.
- tenant migration path adalah backend/database/migrations/tenant
- tenant database connection name adalah tenant

STATUS SEBELUM PHASE 3C
Phase 2 sudah selesai:
- Sanctum auth API
- login/register/logout/me
- GET /api/companies
- POST /api/companies/select
- middleware company.access
- TenantContext service
- GET /api/tenant-context-test
- frontend login/register/select-company/dashboard
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

ATURAN SECURITY WAJIB
Client/user biasa TIDAK BOLEH create tenant/company/migrate tenant/assign user.

Untuk MVP:
- Jangan buat endpoint public POST /api/companies
- Jangan buat endpoint public POST /api/tenants
- Jangan buat endpoint public assign user ke company
- Jangan buat endpoint public manage company users
- Jangan buat halaman frontend create/migrate/manage tenant
- Jangan buat tombol create/migrate/manage tenant
- Jangan buat internal admin panel
- Company assignment hanya lewat Artisan command internal
- Command ini hanya untuk owner aplikasi/staf internal/operator server

TUJUAN PHASE 3C
Buat internal company assignment dan demo seeder via Artisan command Laravel.

Command wajib:
1. php artisan company:assign-user
2. php artisan company:seed-demo

Phase 3C fokus untuk:
- assign user ke company
- update role user di company
- reactivate assignment inactive
- seed demo data development secara idempotent

BATASAN SCOPE
Phase 3C hanya internal company assignment dan demo seeder.

Jangan mengerjakan:
- frontend UI
- endpoint API create company
- endpoint API create tenant
- endpoint API migrate tenant
- endpoint API assign user
- endpoint API manage company users
- internal admin panel
- invitation system
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

FILE/FOLDER YANG BOLEH DIBUAT
Buat file berikut:
- backend/app/Services/Companies/CompanyUserAssignmentService.php
- backend/app/Console/Commands/AssignCompanyUserCommand.php
- backend/app/Console/Commands/SeedDemoCompaniesCommand.php
- docs/phase-3c-company-assignment.md

Jika folder backend/app/Services/Companies belum ada, buat folder tersebut.

FILE YANG BOLEH DIUBAH
- backend/app/Services/Companies/CompanyUserAssignmentService.php
- backend/app/Console/Commands/AssignCompanyUserCommand.php
- backend/app/Console/Commands/SeedDemoCompaniesCommand.php
- docs/phase-3c-company-assignment.md

Jika Laravel project membutuhkan registration command manual, boleh ubah file console registration sesuai struktur Laravel yang ada.

FILE YANG TIDAK BOLEH DIUBAH KECUALI BENAR-BENAR PERLU
- frontend/*
- backend/routes/api.php
- backend/app/Http/Controllers/Api/Auth/AuthController.php
- backend/app/Http/Controllers/Api/Companies/CompanyController.php
- backend/app/Http/Middleware/EnsureCompanyAccess.php
- backend/app/Services/Tenant/TenantContext.php
- backend/app/Services/Tenant/TenantMigrationService.php
- backend/app/Services/Tenant/TenantProvisioningService.php

Jangan ubah frontend sama sekali.

SERVICE YANG HARUS DIBUAT
Buat service:
App\Services\Companies\CompanyUserAssignmentService

Tanggung jawab service:
- assign user ke company
- validate user exists
- validate company exists
- validate company active jika field status tersedia
- validate tenant database exists
- validate tenant database active jika field status tersedia
- validate role
- create/update company_users
- if assignment exists, update role and status active
- if assignment does not exist, create company_users record
- return result yang bisa ditampilkan command

Role valid untuk MVP:
- owner
- admin
- staff
- viewer

Jangan buat permission detail per module.

COMMAND 1: company:assign-user
Buat command:
App\Console\Commands\AssignCompanyUserCommand

Signature:
company:assign-user

Options:
--company-id=
--email=
--role=

Behavior:
- Jika option kosong, tanya secara interaktif via ask() atau choice()
- company-id harus integer
- email harus valid
- role harus salah satu dari owner/admin/staff/viewer
- Call CompanyUserAssignmentService
- Jika user belum ada di company_users, create record baru
- Jika user sudah ada di company_users, update role dan status menjadi active
- Tampilkan output sukses/gagal yang jelas
- Return Command::SUCCESS jika sukses
- Return Command::FAILURE jika gagal

Contoh:
php artisan company:assign-user --company-id=3 --email="admin@example.com" --role="owner"

Output sukses:
User assigned to company successfully.

Company ID: {company_id}
Company Name: {company_name}
User ID: {user_id}
User Email: {email}
Role: {role}
Status: active

COMMAND 2: company:seed-demo
Buat command:
App\Console\Commands\SeedDemoCompaniesCommand

Signature:
company:seed-demo

Behavior:
Command ini harus idempotent. Jika dijalankan berkali-kali, tidak boleh membuat data duplicate.

Command harus:
1. Pastikan user admin@example.com ada
2. Jika belum ada, buat user:
   - name: Admin Demo
   - email: admin@example.com
   - password: password
3. Pastikan company PT Maju Jaya ada
   - slug: pt-maju-jaya
   - status: active jika field status tersedia
4. Pastikan company CV Sumber Rejeki ada
   - slug: cv-sumber-rejeki
   - status: active jika field status tersedia
5. Pastikan tenant_database untuk PT Maju Jaya ada:
   - database_name: company_000001.sqlite
   - status: active jika field status tersedia
6. Pastikan tenant_database untuk CV Sumber Rejeki ada:
   - database_name: company_000002.sqlite
   - status: active jika field status tersedia
7. Pastikan file SQLite berikut ada:
   - database/tenants/company_000001.sqlite
   - database/tenants/company_000002.sqlite
8. Assign admin@example.com ke PT Maju Jaya sebagai owner
9. Assign admin@example.com ke CV Sumber Rejeki sebagai admin

PENTING:
- Jangan jalankan tenant migration di company:seed-demo
- Jangan call php artisan tenant:migrate dari command ini
- Migration tetap tanggung jawab Phase 3B
- File SQLite boleh dibuat kosong jika belum ada
- Jangan hapus file SQLite jika sudah ada
- Jangan overwrite tenant database yang sudah ada

VALIDASI WAJIB UNTUK company:assign-user
- company-id wajib ada / diminta
- company-id harus integer
- email wajib ada / diminta
- email harus valid
- role wajib ada / diminta
- role harus owner/admin/staff/viewer
- user email harus ada di users
- company harus ada
- company harus active jika field status ada
- tenant_database untuk company harus ada
- tenant_database harus active jika field status ada

VALIDASI WAJIB UNTUK company:seed-demo
- Tidak boleh membuat duplikat user
- Tidak boleh membuat duplikat company
- Tidak boleh membuat duplikat tenant_database
- Tidak boleh membuat duplikat company_users
- File SQLite tenant dibuat hanya jika belum ada
- Tidak menjalankan tenant migration
- Tidak membuat endpoint API

CATATAN MODEL/TABEL
Gunakan model yang sudah ada jika tersedia:
- User
- Company
- TenantDatabase
- CompanyUser

Jika model tidak ada atau relasi tidak jelas, boleh pakai DB::table() agar scope tidak melebar.

Jangan membuat migration baru untuk central.
Jangan mengubah schema central.
Jika field aktual berbeda, ikuti schema aktual project.

Asumsi field umum:

users:
- id
- name
- email
- password
- created_at
- updated_at

companies:
- id
- name
- slug
- status
- created_at
- updated_at

tenant_databases:
- id
- company_id
- database_name
- database_path
- status
- created_at
- updated_at

company_users:
- id
- company_id
- user_id
- role
- status
- created_at
- updated_at

Jika ada database_path di tenant_databases, isi dengan path relatif atau sesuai pola existing project.
Jika tidak ada database_path, cukup gunakan database_name sesuai schema aktual.

DOKUMENTASI
Buat docs/phase-3c-company-assignment.md berisi:
- tujuan Phase 3C
- command company:assign-user
- command company:seed-demo
- contoh assign user
- contoh seed demo
- daftar role MVP
- batasan security
- daftar yang tidak boleh dikerjakan
- validasi yang dilakukan command
- manual testing checklist
- notes commit

MANUAL TEST DI DOKUMENTASI
Tuliskan checklist ini:

1. Cek command:
php artisan list | grep company

2. Jalankan seed demo:
php artisan company:seed-demo

3. Jalankan seed demo lagi untuk cek idempotent:
php artisan company:seed-demo

Expected:
- tidak ada duplicate user
- tidak ada duplicate company
- tidak ada duplicate tenant_database
- tidak ada duplicate company_users

4. Assign user:
php artisan company:assign-user --company-id=1 --email="admin@example.com" --role="owner"

5. Update role:
php artisan company:assign-user --company-id=1 --email="admin@example.com" --role="admin"

6. Cek central database via tinker:
DB::table('users')->where('email', 'admin@example.com')->first();
DB::table('companies')->get();
DB::table('tenant_databases')->get();
DB::table('company_users')->get();

7. Cek route:
php artisan route:list

Pastikan tidak ada:
POST /api/companies
POST /api/tenants
POST /api/company-users
POST /api/companies/{id}/users

8. Cek flow Phase 2:
- login admin@example.com / password
- GET /api/companies
- PT Maju Jaya tampil
- CV Sumber Rejeki tampil
- select company
- dashboard tenant context tampil

ACCEPTANCE CRITERIA
Phase 3C dianggap selesai jika:
1. php artisan company:assign-user --help berjalan
2. php artisan company:seed-demo --help berjalan
3. company:assign-user bisa assign user ke company
4. company:assign-user bisa update role existing assignment
5. company:assign-user mengaktifkan kembali assignment inactive dengan status active
6. company:seed-demo bisa dijalankan berkali-kali tanpa data duplicate
7. admin@example.com dibuat jika belum ada
8. PT Maju Jaya dan CV Sumber Rejeki tersedia
9. company_000001.sqlite dan company_000002.sqlite tersedia jika belum ada
10. admin@example.com assigned ke PT Maju Jaya sebagai owner
11. admin@example.com assigned ke CV Sumber Rejeki sebagai admin
12. Tidak ada endpoint API assign user/create tenant/create company
13. Tidak ada perubahan frontend
14. Dokumentasi Phase 3C dibuat

JALANKAN CHECK YANG MEMUNGKINKAN
- php artisan list | grep company
- php artisan company:assign-user --help
- php artisan company:seed-demo --help
- php artisan company:seed-demo
- php artisan route:list
- php artisan test jika tersedia dan memungkinkan

Jika environment Codex tidak bisa menjalankan sebagian command, tulis secara jujur di final summary.

NOTES COMMIT UNTUK FINAL SUMMARY
Setelah selesai, sertakan notes commit berikut:

Commit message:
add internal company assignment commands

Commit notes:
PHASE 3C COMPLETED — Internal Company Assignment & Demo Seeder

Scope completed:
- Added internal Artisan command php artisan company:assign-user
- Added internal Artisan command php artisan company:seed-demo
- Added CompanyUserAssignmentService
- Added validation for company, user, tenant database, and role
- Added idempotent demo company/user seeding
- Added admin@example.com demo access to PT Maju Jaya and CV Sumber Rejeki
- Added docs/phase-3c-company-assignment.md

Security preserved:
- No frontend changes
- No public API endpoint for assigning company users
- No public API endpoint for creating tenant/company
- No public POST /api/companies
- No public POST /api/tenants
- No client-accessible user assignment feature
- Company assignment remains internal server/operator command only

Important behavior:
- company:assign-user creates or updates company_users
- company:assign-user reactivates inactive assignments by setting status active
- company:seed-demo is idempotent
- company:seed-demo does not run tenant migrations
- tenant migrations remain handled by php artisan tenant:migrate
- role options are limited to owner, admin, staff, viewer

Manual checks:
- php artisan list | grep company
- php artisan company:seed-demo
- php artisan company:seed-demo again to confirm idempotency
- php artisan company:assign-user --company-id=1 --email="admin@example.com" --role="owner"
- php artisan route:list
- Confirm no public tenant/company/user-assignment routes exist