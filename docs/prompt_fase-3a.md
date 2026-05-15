Kita masuk ke Phase 3A project TenantAppDevelopment.

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

STATUS SEBELUM PHASE 3A
Phase 2A backend sudah selesai:
- Sanctum auth API
- register/login/logout/me
- GET /api/companies
- POST /api/companies/select
- middleware company.access
- TenantContext service
- GET /api/tenant-context-test
- user hanya bisa melihat/memilih company yang sudah di-assign
- tidak ada create company
- tidak ada create tenant
- tidak ada public endpoint tenant creation

Phase 2B frontend sudah selesai:
- login page
- register page
- select company page
- dashboard tenant context
- AppShell company switcher
- API client support Bearer token dan X-Company-ID
- tidak ada menu create company
- tidak ada UI create tenant

ATURAN SECURITY WAJIB
Client/user biasa TIDAK BOLEH create tenant/company.

Untuk MVP:
- Jangan buat endpoint public POST /api/companies
- Jangan buat endpoint public POST /api/tenants
- Jangan buat halaman frontend create company
- Jangan buat tombol create company
- Jangan buat internal admin panel
- Tenant/company creation hanya lewat Artisan command internal
- Command ini hanya untuk owner aplikasi/staf internal/operator server

TUJUAN PHASE 3A
Buat Tenant Database Generator internal via Artisan command Laravel.

Command utama:
php artisan tenant:create

Command harus bisa berjalan dalam 2 mode:

1. Mode interaktif:
php artisan tenant:create

Lalu menanyakan:
- Company name
- Company slug
- Owner user email

2. Mode non-interaktif:
php artisan tenant:create --name="PT Contoh Baru" --slug="pt-contoh-baru" --owner-email="admin@example.com"

HASIL YANG HARUS DIBUAT COMMAND
Saat berhasil, command harus:
1. Membuat record company baru di central database
2. Membuat file SQLite tenant baru di backend/database/tenants
3. Membuat record tenant_databases untuk company tersebut
4. Membuat record company_users untuk menghubungkan owner user ke company
5. Set role user sebagai owner
6. Set status company dan tenant database sebagai active
7. Output informasi sukses di console

FORMAT DATABASE TENANT
Gunakan format:
company_000001.sqlite
company_000002.sqlite
company_000003.sqlite

Gunakan company.id sebagai basis nomor.
Contoh:
company id = 3
database_name = company_000003.sqlite

Jangan menghitung dari jumlah file karena rawan bentrok.

FILE/FOLDER YANG BOLEH DIBUAT
Buat file berikut jika belum ada:
- backend/app/Services/Tenant/TenantProvisioningService.php
- backend/app/Console/Commands/CreateTenantCommand.php
- docs/phase-3a-tenant-generator.md

FILE YANG BOLEH DIUBAH
- backend/app/Console/Commands/CreateTenantCommand.php
- backend/app/Services/Tenant/TenantProvisioningService.php
- docs/phase-3a-tenant-generator.md

Boleh menyesuaikan registration command jika Laravel project ini membutuhkannya.

FILE YANG TIDAK BOLEH DIUBAH KECUALI BENAR-BENAR PERLU
- frontend/*
- backend/routes/api.php
- backend/app/Http/Controllers/Api/Companies/CompanyController.php
- backend/app/Http/Controllers/Api/Auth/AuthController.php
- backend/app/Http/Middleware/EnsureCompanyAccess.php
- backend/app/Services/Tenant/TenantContext.php

Jangan ubah frontend sama sekali.

LARANGAN SCOPE
Jangan mengerjakan:
- frontend UI
- create company page
- create tenant page
- endpoint API create company
- endpoint API create tenant
- internal admin panel
- Chart of Accounts
- Journal Entry
- Sales
- Purchase
- Cash & Bank
- Inventory
- report/laporan keuangan
- role permission detail transaksi
- tenant migration runner kompleks
- logic debit kredit
- posting jurnal

Phase 3A hanya tenant provisioning internal command.

SERVICE YANG HARUS DIBUAT
Buat service:
App\Services\Tenant\TenantProvisioningService

Service ini bertanggung jawab untuk:
- menerima input name, slug, owner_email
- validasi owner email ada di users
- validasi slug company unik
- validasi folder tenant database ada dan writable
- create company
- generate database name dari company.id
- create file SQLite tenant
- create tenant_databases record
- create company_users record
- rollback file SQLite jika proses gagal
- return data hasil provisioning ke command

COMMAND YANG HARUS DIBUAT
Buat command:
App\Console\Commands\CreateTenantCommand

Signature:
tenant:create
Options:
--name=
--slug=
--owner-email=

Jika option kosong, pakai ask() untuk input interaktif.

Contoh:
php artisan tenant:create --name="PT Contoh Baru" --slug="pt-contoh-baru" --owner-email="admin@example.com"

VALIDASI WAJIB
Validasi:
- name wajib diisi
- slug wajib diisi
- owner-email wajib diisi
- owner-email harus format email valid
- owner-email harus ada di tabel users
- slug belum ada di tabel companies
- database/tenants harus ada
- database/tenants harus writable
- generated database_name belum ada di tenant_databases
- file tenant database belum ada

Jika validasi gagal, command harus menampilkan pesan error jelas dan return Command::FAILURE.

TRANSAKSI DAN ROLLBACK
Gunakan DB transaction untuk central database.

Jika file SQLite sudah dibuat tetapi proses setelahnya gagal:
- rollback database transaction
- hapus file SQLite yang tadi dibuat
- tampilkan error jelas

Jangan biarkan orphan file atau orphan record.

CATATAN MODEL/TABEL
Gunakan model yang sudah ada jika tersedia:
- User
- Company
- TenantDatabase
- CompanyUser

Jika model tidak ada, boleh pakai DB::table() agar tidak membuat scope melebar.

Jangan membuat migration baru kecuali tabel benar-benar belum ada. Jika tabel/field berbeda, sesuaikan dengan schema aktual project.

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

company_users:
- id
- company_id
- user_id
- role
- status
- created_at
- updated_at

Jika field aktual berbeda, pakai field aktual yang sudah ada di project.

OUTPUT SUKSES COMMAND
Setelah berhasil, tampilkan:

Tenant created successfully.

Company ID: {id}
Company Name: {name}
Company Slug: {slug}
Owner Email: {owner_email}
Tenant Database: {database_name}
Tenant Path: {relative/path/to/database}

DOKUMENTASI
Buat docs/phase-3a-tenant-generator.md berisi:
- tujuan Phase 3A
- command yang tersedia
- contoh mode interaktif
- contoh mode non-interaktif
- hasil yang dibuat command
- batasan security
- daftar yang tidak boleh dikerjakan
- checklist manual test
- rollback behavior

MANUAL TEST YANG HARUS DIJELASKAN DI DOKUMENTASI
1. Jalankan:
php artisan tenant:create --name="PT Contoh Baru" --slug="pt-contoh-baru" --owner-email="admin@example.com"

2. Cek file:
ls -la database/tenants

3. Cek database central:
php artisan tinker

DB::table('companies')->where('slug', 'pt-contoh-baru')->first();
DB::table('tenant_databases')->where('database_name', 'company_000003.sqlite')->first();
DB::table('company_users')->where('company_id', 3)->first();

4. Cek login flow Phase 2:
- login admin@example.com
- GET /api/companies
- company baru harus muncul
- select company baru
- dashboard tenant context harus bisa membaca metadata tenant

ACCEPTANCE CRITERIA
Phase 3A dianggap selesai jika:
1. php artisan tenant:create bisa berjalan interaktif
2. php artisan tenant:create dengan option bisa berjalan
3. Company baru tersimpan di central database
4. Tenant database record tersimpan
5. Company user owner tersimpan
6. File SQLite tenant tercipta di backend/database/tenants
7. Nama file mengikuti format company_000003.sqlite
8. Jika error, tidak ada orphan file SQLite
9. Tidak ada endpoint API create tenant/company
10. Tidak ada perubahan frontend
11. Flow Phase 2 tetap tidak rusak
12. Dokumentasi Phase 3A dibuat

Jalankan pengecekan yang memungkinkan di environment Codex:
- php artisan list | grep tenant
- php artisan tenant:create --help
- php artisan test jika tersedia dan memungkinkan
- php artisan route:list untuk memastikan tidak ada public POST /api/companies atau POST /api/tenants baru

Jika environment Codex tidak bisa menjalankan sebagian command, tulis secara jujur di final summary.