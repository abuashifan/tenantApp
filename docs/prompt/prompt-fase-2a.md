Kamu bekerja pada project aplikasi akuntansi multi-tenant sederhana.

STACK PROJECT:
- Backend: Laravel API
- Frontend: Next.js
- Styling: TailwindCSS
- Database: SQLite
- Arsitektur tenant:
  - central.sqlite = database pusat
  - 1 perusahaan = 1 file SQLite tenant
  - 1 user bisa punya banyak perusahaan
  - user memilih perusahaan aktif setelah login
  - request setelah company dipilih wajib membawa X-Company-ID

STATUS PROJECT SAAT INI:
Phase 0 sudah selesai.
Phase 1A sudah selesai.
Phase 1B sudah selesai.

Data demo yang sudah ada:
- User:
  - email: admin@example.com
  - password: password
  - status: active

Company demo:
1. PT Maju Jaya
   - role user: owner
   - tenant database: company_000001.sqlite

2. CV Sumber Rejeki
   - role user: admin
   - tenant database: company_000002.sqlite

Endpoint demo sementara yang harus diganti:
- GET /api/my-companies-demo

Catatan penting:
- Endpoint /api/my-companies-demo masih demo.
- Controller demo masih hardcode admin@example.com.
- Di Phase 2 semua hardcode admin@example.com harus diganti auth()->user().
- Semua endpoint company asli harus pakai auth:sanctum.
- User hanya boleh melihat dan memilih company miliknya.
- Jika user mengakses company yang bukan miliknya, return 403.
- Tenant database belum perlu punya tabel akuntansi.
- Yang diuji hanya login, company access, dan tenant context.

TUJUAN PROMPT INI:
Kerjakan HANYA bagian BACKEND Phase 2:
1. Authentication API
2. Company access API
3. Middleware validasi X-Company-ID
4. TenantContext service
5. Endpoint tenant context test
6. Nonaktifkan endpoint demo /api/my-companies-demo

JANGAN KERJAKAN:
- Jangan buat frontend.
- Jangan buat halaman login frontend.
- Jangan buat dashboard frontend.
- Jangan buat create company.
- Jangan buat tenant database generator.
- Jangan buat migration tenant akuntansi.
- Jangan buat Chart of Accounts.
- Jangan buat Journal Entry.
- Jangan buat modul laporan.
- Jangan ubah arsitektur database utama.
- Jangan pindahkan project ke database selain SQLite.
- Jangan install package baru kecuali memang benar-benar dibutuhkan.
- Jangan refactor besar di luar scope Phase 2 backend.

==================================================
BAGIAN 1 — BUAT AUTH REQUEST
==================================================

Buat file:
- app/Http/Requests/Auth/RegisterRequest.php
- app/Http/Requests/Auth/LoginRequest.php

RegisterRequest rules:
- name: required|string|max:255
- email: required|email|max:255|unique:users,email
- password: required|string|min:8|confirmed
- phone: nullable|string|max:50

LoginRequest rules:
- email: required|email
- password: required|string

Pastikan authorize() return true.

==================================================
BAGIAN 2 — BUAT AUTH CONTROLLER
==================================================

Buat controller:
- app/Http/Controllers/Api/Auth/AuthController.php

AuthController harus punya method:
1. register
2. login
3. me
4. logout

Gunakan:
- App\Traits\ApiResponse jika trait sudah ada
- App\Models\User
- Illuminate\Support\Facades\Hash
- Illuminate\Validation\ValidationException
- Illuminate\Http\Request

REGISTER:
Endpoint nanti:
POST /api/auth/register

Behavior:
- Validasi pakai RegisterRequest.
- Create user baru.
- Field user:
  - name
  - email
  - password hash
  - phone nullable
  - status = active
- Generate Sanctum token:
  - $user->createToken('api-token')->plainTextToken
- Response success 201:
  - user
  - token
  - token_type = Bearer

LOGIN:
Endpoint nanti:
POST /api/auth/login

Behavior:
- Validasi pakai LoginRequest.
- Cari user by email.
- Jika user tidak ada atau password salah:
  - throw ValidationException dengan pesan "Email atau password salah."
- Jika user status bukan active:
  - return error response 403 dengan pesan "Akun tidak aktif."
- Jika login berhasil:
  - update last_login_at = now()
  - generate Sanctum token
  - return user, token, token_type Bearer

ME:
Endpoint nanti:
GET /api/auth/me
Middleware:
auth:sanctum

Behavior:
- Return user login dari $request->user()

LOGOUT:
Endpoint nanti:
POST /api/auth/logout
Middleware:
auth:sanctum

Behavior:
- Hapus current access token:
  - $request->user()->currentAccessToken()?->delete()
- Return success "Logout berhasil"

==================================================
BAGIAN 3 — PASTIKAN USER MODEL SIAP
==================================================

Update app/Models/User.php jika perlu.

Pastikan fillable minimal berisi:
- name
- email
- password
- phone
- avatar
- status
- last_login_at

Pastikan casts berisi:
- email_verified_at => datetime
- last_login_at => datetime
- password => hashed

Jangan hapus relasi yang sudah ada dari Phase 1.
Jangan ubah relasi companies, companyUsers, ownedCompanies, invitationsSent jika sudah ada.

==================================================
BAGIAN 4 — BUAT TENANT CONTEXT SERVICE
==================================================

Buat file:
- app/Services/Tenant/TenantContext.php

Service ini menyimpan context company aktif selama request berjalan.

Class:
App\Services\Tenant\TenantContext

Property protected nullable:
- ?Company $company = null
- ?CompanyUser $companyUser = null
- ?TenantDatabase $tenantDatabase = null

Method:
1. set(Company $company, CompanyUser $companyUser, TenantDatabase $tenantDatabase): void
2. company(): ?Company
3. companyUser(): ?CompanyUser
4. tenantDatabase(): ?TenantDatabase
5. companyId(): ?int
6. role(): ?string
7. databaseName(): ?string
8. databasePath(): ?string

Import model:
- App\Models\Company
- App\Models\CompanyUser
- App\Models\TenantDatabase

Fungsi:
- companyId return $this->company?->id
- role return $this->companyUser?->role
- databaseName return $this->tenantDatabase?->database_name
- databasePath return $this->tenantDatabase?->database_path

==================================================
BAGIAN 5 — BUAT MIDDLEWARE ENSURE COMPANY ACCESS
==================================================

Buat middleware:
- app/Http/Middleware/EnsureCompanyAccess.php

Middleware ini wajib:
1. Membaca user login dari $request->user()
2. Membaca header X-Company-ID
3. Validasi user login ada
4. Validasi X-Company-ID dikirim
5. Validasi company ada
6. Validasi user punya akses aktif di company_users
7. Validasi tenant_databases company tersebut aktif
8. Simpan context ke TenantContext service
9. Simpan juga ke request attributes

Detail behavior:
- Jika user tidak login:
  - return JSON 401
  - success false
  - message "Unauthenticated."

- Jika X-Company-ID kosong:
  - return JSON 422
  - success false
  - message "X-Company-ID wajib dikirim."

- Jika company tidak ditemukan:
  - return JSON 404
  - success false
  - message "Company tidak ditemukan."

- Jika user tidak punya akses aktif:
  - return JSON 403
  - success false
  - message "Anda tidak punya akses ke company ini."

- Jika tenant database tidak ditemukan atau tidak aktif:
  - return JSON 422
  - success false
  - message "Tenant database belum aktif."

Company access check:
- table company_users
- where company_id = selected company id
- where user_id = current user id
- where status = active

Tenant database check:
- table tenant_databases
- where company_id = selected company id
- where status = active

Set TenantContext:
app(TenantContext::class)->set($company, $companyUser, $tenantDatabase)

Set request attributes:
- active_company
- active_company_user
- active_tenant_database

==================================================
BAGIAN 6 — DAFTARKAN MIDDLEWARE ALIAS
==================================================

Daftarkan middleware alias:
- company.access => App\Http\Middleware\EnsureCompanyAccess::class

Jika project memakai Laravel 11/12 style:
- edit bootstrap/app.php
- gunakan withMiddleware
- tambahkan alias company.access

Jika project memakai Kernel.php:
- edit app/Http/Kernel.php
- tambahkan ke middlewareAliases

Jangan merusak konfigurasi middleware yang sudah ada.

==================================================
BAGIAN 7 — BUAT COMPANY CONTROLLER
==================================================

Buat controller:
- app/Http/Controllers/Api/Companies/CompanyController.php

Method:
1. index
2. select

INDEX:
Endpoint nanti:
GET /api/companies
Middleware:
auth:sanctum

Behavior:
- Ambil user dari $request->user()
- Return hanya companies yang dimiliki user login melalui company_users.
- Hanya company_users status active.
- Include role user di company tersebut sebagai user_role.
- Include tenantDatabase.
- Jangan hardcode admin@example.com.

Response data setiap company:
- id
- name
- legal_name
- slug
- code
- status
- user_role
- tenant_database:
  - database_name
  - status

SELECT:
Endpoint nanti:
POST /api/companies/select
Middleware:
auth:sanctum

Input:
- company_id required|integer|exists:companies,id

Behavior:
- Validasi user login punya akses aktif ke company_id.
- Jika tidak punya akses, return 403.
- Ambil company dengan tenantDatabase.
- Jika tenantDatabase tidak ada atau status bukan active:
  - return 422
  - message "Tenant database company belum aktif."
- Return active_company.

Response active_company:
- id
- name
- legal_name
- slug
- code
- user_role
- tenant_database:
  - database_name
  - database_path
  - status

Catatan:
- Endpoint select tidak perlu menyimpan active_company ke database.
- Untuk sekarang active company disimpan frontend sebagai active_company_id.
- Backend tetap validasi melalui X-Company-ID pada request berikutnya.

==================================================
BAGIAN 8 — BUAT TENANT CONTEXT TEST CONTROLLER
==================================================

Buat controller:
- app/Http/Controllers/Api/Tenant/TenantContextTestController.php

Controller invokable:
- method __invoke(TenantContext $tenantContext)

Endpoint nanti:
GET /api/tenant-context-test

Middleware:
- auth:sanctum
- company.access

Response data:
- company_id
- company_name
- database_name
- database_path
- user_role

Ambil data dari TenantContext:
- companyId()
- company()?->name
- databaseName()
- databasePath()
- role()

==================================================
BAGIAN 9 — UPDATE ROUTES API
==================================================

Update:
- routes/api.php

Routes yang wajib ada:

GET /api/health
- tetap jalan seperti sebelumnya.

Auth routes:
POST /api/auth/register
POST /api/auth/login

Protected auth routes:
middleware auth:sanctum:
GET /api/auth/me
POST /api/auth/logout

Protected company routes:
middleware auth:sanctum:
GET /api/companies
POST /api/companies/select

Protected tenant context route:
middleware auth:sanctum + company.access:
GET /api/tenant-context-test

Nonaktifkan endpoint demo:
- Hapus atau comment route GET /api/my-companies-demo
- Jangan hapus file controllernya jika tidak perlu, cukup jangan dipakai route.
- Pastikan tidak ada route aktif yang masih hardcode admin@example.com.

==================================================
BAGIAN 10 — TESTING BACKEND WAJIB
==================================================

Setelah implementasi, jalankan:

composer dump-autoload
php artisan route:list
php artisan migrate:status
php artisan serve

Test endpoint manual:

1. Login demo:
POST http://127.0.0.1:8000/api/auth/login
Body JSON:
{
  "email": "admin@example.com",
  "password": "password"
}

Expected:
- success true
- token ada
- user email admin@example.com

2. Auth me:
GET http://127.0.0.1:8000/api/auth/me
Header:
Authorization: Bearer TOKEN

Expected:
- success true
- user email admin@example.com

3. Get companies:
GET http://127.0.0.1:8000/api/companies
Header:
Authorization: Bearer TOKEN

Expected:
- success true
- data berisi 2 company:
  - PT Maju Jaya
  - CV Sumber Rejeki

4. Select company 1:
POST http://127.0.0.1:8000/api/companies/select
Header:
Authorization: Bearer TOKEN
Body:
{
  "company_id": 1
}

Expected:
- active_company name PT Maju Jaya
- user_role owner
- tenant_database database_name company_000001.sqlite

5. Tenant context company 1:
GET http://127.0.0.1:8000/api/tenant-context-test
Header:
Authorization: Bearer TOKEN
X-Company-ID: 1

Expected:
- company_id 1
- company_name PT Maju Jaya
- database_name company_000001.sqlite
- user_role owner

6. Tenant context company 2:
GET http://127.0.0.1:8000/api/tenant-context-test
Header:
Authorization: Bearer TOKEN
X-Company-ID: 2

Expected:
- company_id 2
- company_name CV Sumber Rejeki
- database_name company_000002.sqlite
- user_role admin

7. Tenant context tanpa X-Company-ID:
GET /api/tenant-context-test
Header:
Authorization: Bearer TOKEN

Expected:
- status 422
- message X-Company-ID wajib dikirim.

8. Tenant context tanpa token:
GET /api/tenant-context-test
Header:
X-Company-ID: 1

Expected:
- status 401

==================================================
OUTPUT YANG DIHARAPKAN DARI CODEX
==================================================

Setelah selesai, berikan ringkasan:
1. File yang dibuat
2. File yang diubah
3. Route baru
4. Cara test login
5. Cara test companies
6. Cara test tenant context
7. Catatan jika ada migration/model field yang tidak cocok

JANGAN melanjutkan ke frontend.
JANGAN melanjutkan ke Phase 3.
Berhenti setelah backend Phase 2 selesai.