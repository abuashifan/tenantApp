Kita masuk ke Phase 3B project TenantAppDevelopment.

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

STATUS SEBELUM PHASE 3B
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

ATURAN SECURITY WAJIB
Client/user biasa TIDAK BOLEH create tenant/company/migrate tenant.

Untuk MVP:
- Jangan buat endpoint public POST /api/companies
- Jangan buat endpoint public POST /api/tenants
- Jangan buat endpoint public untuk migrate tenant
- Jangan buat halaman frontend create/migrate tenant
- Jangan buat tombol create/migrate tenant
- Jangan buat internal admin panel
- Tenant migration hanya lewat Artisan command internal
- Command ini hanya untuk owner aplikasi/staf internal/operator server

TUJUAN PHASE 3B
Buat Tenant Migration Runner internal via Artisan command Laravel.

Command utama:
php artisan tenant:migrate

Command harus mendukung:
1. Migrate satu tenant berdasarkan company_id:
php artisan tenant:migrate --company-id=3

2. Migrate semua tenant aktif:
php artisan tenant:migrate --all

BATASAN SCOPE
Phase 3B hanya membuat runner migration tenant.

Jangan mengerjakan:
- frontend UI
- endpoint API create company
- endpoint API create tenant
- endpoint API migrate tenant
- internal admin panel
- Chart of Accounts final
- Journal Entry final
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
- backend/app/Services/Tenant/TenantMigrationService.php
- backend/app/Console/Commands/MigrateTenantCommand.php
- docs/phase-3b-tenant-migration-runner.md

FILE YANG BOLEH DIUBAH
- backend/app/Services/Tenant/TenantMigrationService.php
- backend/app/Console/Commands/MigrateTenantCommand.php
- docs/phase-3b-tenant-migration-runner.md

Jika Laravel project membutuhkan registration command manual, boleh ubah file console registration sesuai struktur Laravel yang ada.

FILE YANG TIDAK BOLEH DIUBAH KECUALI BENAR-BENAR PERLU
- frontend/*
- backend/routes/api.php
- backend/app/Http/Controllers/Api/Auth/AuthController.php
- backend/app/Http/Controllers/Api/Companies/CompanyController.php
- backend/app/Http/Middleware/EnsureCompanyAccess.php
- backend/app/Services/Tenant/TenantContext.php

Jangan ubah frontend sama sekali.

SERVICE YANG HARUS DIBUAT
Buat service:
App\Services\Tenant\TenantMigrationService

Tanggung jawab service:
- resolve tenant database berdasarkan company_id
- resolve semua tenant database aktif untuk --all
- validasi company aktif
- validasi tenant_database aktif
- validasi file SQLite tenant ada
- validasi file SQLite tenant writable
- validasi migration path database/migrations/tenant ada
- connect ke file tenant SQLite via TenantConnectionManager jika service itu sudah ada
- fallback set config database.connections.tenant.database jika diperlukan
- jalankan migration hanya untuk connection tenant
- jalankan migration hanya dari path database/migrations/tenant
- disconnect tenant setelah selesai
- return hasil success/failure yang bisa ditampilkan command

Gunakan Artisan::call('migrate') dengan parameter:
--database=tenant
--path=database/migrations/tenant
--force=true

PENTING:
Jangan menjalankan migration central.
Jangan menjalankan migration default database/migrations.
Jangan menjalankan migrate:fresh.
Jangan drop table tenant.
Jangan hapus data tenant.

COMMAND YANG HARUS DIBUAT
Buat command:
App\Console\Commands\MigrateTenantCommand

Signature:
tenant:migrate
Options:
--company-id=
--all

Behavior:
- Jika --company-id diisi, migrate tenant untuk company itu saja
- Jika --all dipakai, migrate semua tenant_database active
- Jika dua-duanya kosong, tampilkan error dan return Command::FAILURE
- Jika --company-id dan --all dipakai bersamaan, tampilkan error dan return Command::FAILURE
- Jangan pakai prompt interaktif untuk Phase 3B

VALIDASI WAJIB UNTUK --company-id
- company_id wajib numeric/integer
- company harus ditemukan
- company.status harus active jika field status tersedia
- tenant_databases untuk company harus ditemukan
- tenant_databases.status harus active jika field status tersedia
- database_name tidak boleh kosong
- file SQLite tenant harus ada
- file SQLite tenant harus writable
- migration path database/migrations/tenant harus ada

VALIDASI WAJIB UNTUK --all
- ambil hanya tenant_databases active jika field status tersedia
- jika tidak ada tenant aktif, tampilkan pesan jelas
- jalankan migration satu per satu
- tampilkan summary total/success/failed
- command return FAILURE jika minimal satu tenant gagal
- command return SUCCESS jika semua tenant sukses

OUTPUT SUKSES UNTUK 1 TENANT
Tampilkan:

Tenant migration completed successfully.

Company ID: {id}
Company Name: {name}
Tenant Database: {database_name}
Migration Path: database/migrations/tenant

OUTPUT UNTUK --all
Tampilkan:

Tenant migration completed.

Total tenants: {total}
Success: {success}
Failed: {failed}

[OK] Company ID {id} - {database_name}
[FAILED] Company ID {id} - {database_name}
Reason: {reason}

CATATAN MODEL/TABEL
Gunakan model yang sudah ada jika tersedia:
- Company
- TenantDatabase

Jika model tidak ada atau relasi tidak jelas, boleh pakai DB::table() agar scope tidak melebar.

Jangan membuat migration baru untuk central.
Jangan mengubah schema central.
Jika field aktual berbeda, ikuti schema aktual project.

Asumsi field umum:
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

Jika ada database_path di tenant_databases, gunakan itu.
Jika tidak ada database_path, gunakan:
database_path('tenants/' . database_name)

DOKUMENTASI
Buat docs/phase-3b-tenant-migration-runner.md berisi:
- tujuan Phase 3B
- command yang tersedia
- contoh migrate 1 tenant
- contoh migrate semua tenant aktif
- migration path yang digunakan
- batasan security
- daftar yang tidak boleh dikerjakan
- validasi yang dilakukan command
- manual testing checklist
- notes commit

MANUAL TEST DI DOKUMENTASI
Tuliskan checklist ini:

1. Pastikan tenant sudah dibuat Phase 3A:
php artisan tenant:create --name="PT Contoh Baru" --slug="pt-contoh-baru" --owner-email="admin@example.com"

2. Jalankan migration tenant tertentu:
php artisan tenant:migrate --company-id=3

3. Jalankan migration semua tenant aktif:
php artisan tenant:migrate --all

4. Cek route:
php artisan route:list

Pastikan tidak ada:
POST /api/companies
POST /api/tenants
POST /api/tenant/migrate

5. Cek table migrations di tenant database via tinker.

ACCEPTANCE CRITERIA
Phase 3B dianggap selesai jika:
1. php artisan tenant:migrate --help berjalan
2. php artisan tenant:migrate --company-id=1 berjalan untuk tenant valid
3. php artisan tenant:migrate --all berjalan untuk semua tenant aktif
4. Command hanya menjalankan migration dari database/migrations/tenant
5. Command hanya memakai database connection tenant
6. Command tidak migrate central database
7. Command tidak drop/hapus table tenant
8. Command validasi file tenant SQLite ada dan writable
9. Output command jelas
10. Tidak ada endpoint API create/migrate tenant
11. Tidak ada perubahan frontend
12. Dokumentasi Phase 3B dibuat

JALANKAN CHECK YANG MEMUNGKINKAN
- php artisan list | grep tenant
- php artisan tenant:migrate --help
- php artisan route:list
- php artisan test jika tersedia dan memungkinkan

Jika environment Codex tidak bisa menjalankan sebagian command, tulis secara jujur di final summary.

NOTES COMMIT UNTUK FINAL SUMMARY
Setelah selesai, sertakan notes commit berikut:

Commit message:
add tenant migration runner command

Commit notes:
PHASE 3B COMPLETED — Tenant Migration Runner

Scope completed:
- Added internal Artisan command php artisan tenant:migrate
- Added support for migrating one tenant by --company-id
- Added support for migrating all active tenants by --all
- Added TenantMigrationService
- Tenant migration uses database connection: tenant
- Tenant migration path restricted to database/migrations/tenant
- Added tenant database validation before migration
- Added clear console output for success/failure
- Added docs/phase-3b-tenant-migration-runner.md

Security preserved:
- No frontend changes
- No public API endpoint for tenant migration
- No public POST /api/companies
- No public POST /api/tenants
- No client-accessible tenant migration feature
- Tenant migration remains internal server/operator command only

Important behavior:
- central.sqlite is not migrated by this command
- default database/migrations is not migrated by this command
- only database/migrations/tenant is migrated
- company must be active
- tenant_database must be active
- SQLite tenant file must exist and be writable

Manual checks:
- php artisan tenant:migrate --help
- php artisan tenant:migrate --company-id=1
- php artisan tenant:migrate --all
- php artisan route:list
- Confirm no public tenant creation/migration routes exist