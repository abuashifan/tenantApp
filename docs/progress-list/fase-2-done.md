NOTES PENYELESAIAN PHASE 2 — AUTHENTICATION & COMPANY ACCESS

Project:
TenantAppDevelopment — Aplikasi Akuntansi Multi-Tenant

Stack:
- Backend: Laravel API
- Frontend: Next.js
- Styling: TailwindCSS
- Database: SQLite
- Arsitektur tenant:
  - central.sqlite = database pusat
  - 1 perusahaan = 1 file SQLite tenant
  - user bisa punya akses ke banyak perusahaan
  - user memilih perusahaan aktif setelah login
  - request tenant memakai header X-Company-ID

==================================================
STATUS PHASE 2
==================================================

Phase 2A — Backend:
SELESAI

Phase 2B — Frontend:
SELESAI

Kesimpulan:
Phase 2 secara development sudah selesai, tetapi masih perlu dites lokal end-to-end di mesin development karena sebelumnya Codex tidak bisa menjalankan npm run dev / npm run lint.

==================================================
PHASE 2A — BACKEND SELESAI
==================================================

Scope yang sudah selesai:
- Auth API menggunakan Laravel Sanctum
- Register user
- Login user
- Logout user
- Get current user
- Get companies milik user login
- Select active company
- Middleware validasi X-Company-ID
- Validasi user punya akses ke company_id
- TenantContext service
- Endpoint tenant context test
- Route demo /api/my-companies-demo dinonaktifkan

File dibuat:
- backend/app/Http/Requests/Auth/RegisterRequest.php
- backend/app/Http/Requests/Auth/LoginRequest.php
- backend/app/Http/Controllers/Api/Auth/AuthController.php
- backend/app/Services/Tenant/TenantContext.php
- backend/app/Http/Middleware/EnsureCompanyAccess.php
- backend/app/Http/Controllers/Api/Companies/CompanyController.php
- backend/app/Http/Controllers/Api/Tenant/TenantContextTestController.php

File diubah:
- backend/bootstrap/app.php
  - menambahkan alias middleware company.access

- backend/app/Providers/AppServiceProvider.php
  - bind TenantContext sebagai singleton

- backend/routes/api.php
  - menambahkan route auth
  - menambahkan route companies
  - menambahkan route tenant-context-test
  - menonaktifkan route demo /api/my-companies-demo

Route aktif:
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me
- POST /api/auth/logout
- GET /api/companies
- POST /api/companies/select
- GET /api/tenant-context-test

Middleware:
- auth:sanctum
- company.access

Validasi backend:
- Tanpa token → 401 Unauthenticated
- Tanpa X-Company-ID → 422 "X-Company-ID wajib dikirim."
- Company tidak ditemukan → 404
- User tidak punya akses company → 403
- Tenant database tidak aktif / tidak ditemukan → 422
- User hanya bisa melihat company miliknya
- User hanya bisa memilih company miliknya

Catatan penting:
- Tidak ada fitur create company.
- Tidak ada fitur create tenant.
- Tidak ada endpoint tenant creation publik.
- Tidak ada perubahan migration/model field di Phase 2A.
- User tetap memakai HasApiTokens.
- Relasi Phase 1 tetap dipertahankan.
- Demo route /api/my-companies-demo sudah dinonaktifkan.
- Tidak ada route aktif yang masih hardcode admin@example.com.

==================================================
PHASE 2B — FRONTEND SELESAI
==================================================

Scope yang sudah selesai:
- Login page
- Register page
- Select company page
- Dashboard tenant-context
- API client support Bearer token
- API client support X-Company-ID
- AppShell company switcher
- Logout clear localStorage
- .env.example frontend

File dibuat:
- frontend/.env.example
- frontend/types/auth.ts
- frontend/types/company.ts
- frontend/app/login/page.tsx
- frontend/app/register/page.tsx
- frontend/app/select-company/page.tsx

File diubah:
- frontend/lib/api.ts
  - support Bearer token
  - support X-Company-ID
  - getStoredToken()
  - getStoredCompanyId()

- frontend/types/api.ts
  - tetap ApiResponse / ApiError

- frontend/components/layout/AppShell.tsx
  - client component
  - tampil active company
  - switch company
  - logout clear localStorage

- frontend/app/dashboard/page.tsx
  - redirect guard
  - fetch GET /tenant-context-test
  - debug panel tenant context

- frontend/app/page.tsx
  - jika ada token redirect /dashboard
  - jika tidak ada token tampil tombol Login/Register + health check

Halaman baru:
- GET /login
- GET /register
- GET /select-company

Catatan penting:
- Tidak mengubah backend.
- Tidak membuat create company.
- Tidak membuat modul akuntansi.
- Tidak memakai state management library tambahan.
- Token dan active company sementara disimpan di localStorage.

==================================================
FLOW YANG HARUS BERHASIL DI UI
==================================================

Data demo:
- email: admin@example.com
- password: password

Company demo:
1. PT Maju Jaya
   - role: owner
   - tenant database: company_000001.sqlite

2. CV Sumber Rejeki
   - role: admin
   - tenant database: company_000002.sqlite

Flow utama:
1. User buka /login
2. Login dengan admin@example.com / password
3. Backend return token Sanctum
4. Frontend simpan auth_token
5. Frontend request GET /api/companies
6. Karena user punya 2 company, redirect ke /select-company
7. User pilih PT Maju Jaya
8. Frontend simpan active_company_id = 1
9. Frontend simpan active_company
10. Redirect ke /dashboard
11. Dashboard request GET /api/tenant-context-test dengan:
    - Authorization: Bearer TOKEN
    - X-Company-ID: 1
12. Dashboard menampilkan:
    - Active Company: PT Maju Jaya
    - Tenant Database: company_000001.sqlite
    - User Role: owner
13. User klik Switch Company
14. User pilih CV Sumber Rejeki
15. Dashboard berubah menjadi:
    - Active Company: CV Sumber Rejeki
    - Tenant Database: company_000002.sqlite
    - User Role: admin
16. User logout
17. localStorage dibersihkan
18. Redirect ke /login

==================================================
TEST BACKEND MANUAL
==================================================

Jalankan backend:
cd backend
php artisan serve

Login:
POST http://127.0.0.1:8000/api/auth/login

Body:
{
  "email": "admin@example.com",
  "password": "password"
}

Expected:
- success true
- token ada
- user email admin@example.com

Get current user:
GET http://127.0.0.1:8000/api/auth/me

Header:
Authorization: Bearer TOKEN

Expected:
- success true
- user aktif tampil

Get companies:
GET http://127.0.0.1:8000/api/companies

Header:
Authorization: Bearer TOKEN

Expected:
- success true
- data berisi PT Maju Jaya
- data berisi CV Sumber Rejeki
- masing-masing ada user_role
- masing-masing ada tenant_database

Select company:
POST http://127.0.0.1:8000/api/companies/select

Header:
Authorization: Bearer TOKEN

Body:
{
  "company_id": 1
}

Expected:
- active_company tampil
- user_role owner
- tenant database company_000001.sqlite

Tenant context company 1:
GET http://127.0.0.1:8000/api/tenant-context-test

Header:
Authorization: Bearer TOKEN
X-Company-ID: 1

Expected:
- company_id: 1
- company_name: PT Maju Jaya
- database_name: company_000001.sqlite
- user_role: owner

Tenant context company 2:
GET http://127.0.0.1:8000/api/tenant-context-test

Header:
Authorization: Bearer TOKEN
X-Company-ID: 2

Expected:
- company_id: 2
- company_name: CV Sumber Rejeki
- database_name: company_000002.sqlite
- user_role: admin

Negative test:
- Tanpa token → 401
- Tanpa X-Company-ID → 422
- X-Company-ID tidak valid → 403 / 404 sesuai kondisi
- User tidak punya akses company → 403

==================================================
TEST FRONTEND MANUAL
==================================================

Pastikan file frontend/.env.local ada:

NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api

Jalankan backend:
cd backend
php artisan serve

Jalankan frontend:
cd frontend
npm run dev

Buka:
http://localhost:3000/login

Login:
email: admin@example.com
password: password

Expected:
- redirect ke /select-company
- tampil PT Maju Jaya
- tampil CV Sumber Rejeki

Pilih PT Maju Jaya:
Expected:
- redirect ke /dashboard
- dashboard tampil PT Maju Jaya
- tenant database company_000001.sqlite
- role owner
- debug panel JSON tampil

Switch company:
Expected:
- kembali ke /select-company

Pilih CV Sumber Rejeki:
Expected:
- dashboard tampil CV Sumber Rejeki
- tenant database company_000002.sqlite
- role admin

Logout:
Expected:
- auth_token hilang
- auth_user hilang
- active_company_id hilang
- active_company hilang
- redirect ke /login

Guard:
- Buka /dashboard tanpa token → redirect /login
- Buka /dashboard dengan token tapi tanpa active_company_id → redirect /select-company

==================================================
BATASAN PHASE 2
==================================================

Phase 2 belum mengerjakan:
- create company
- create tenant
- tenant database generator
- tenant migration system
- internal admin panel
- Chart of Accounts
- Journal Entry
- Sales
- Purchase
- Cash & Bank
- Inventory
- Permission detail transaksi
- Role permission per module
- Logic debit kredit
- Posting jurnal
- Laporan keuangan

Phase 2 hanya menyelesaikan:
- user login
- user melihat company yang sudah di-assign
- user memilih company aktif
- backend validasi akses company
- backend tahu tenant database aktif
- frontend bisa switch company

==================================================
ATURAN SECURITY YANG SUDAH DISEPAKATI
==================================================

Client / user biasa TIDAK BOLEH create tenant/company.

Yang boleh create tenant/company nanti:
- owner aplikasi
- staf internal
- operator internal yang punya akses server/VPS

Untuk MVP:
- tenant/company creation tidak dibuat di UI client
- tidak ada endpoint public POST /api/companies
- tidak ada endpoint public POST /api/tenants
- tidak ada menu create company untuk client
- tenant generator di Phase 3 dibuat via Artisan command internal

Client hanya boleh:
- login
- melihat company yang sudah diberikan akses
- memilih company aktif
- switch company
- mengakses data tenant yang sudah diizinkan

Client tidak boleh:
- create company
- create tenant
- generate SQLite tenant
- migrate tenant
- melihat semua tenant
- mengakses admin internal

==================================================
KESIMPULAN
==================================================

Phase 2 sudah selesai secara implementasi:
- Phase 2A backend selesai
- Phase 2B frontend selesai

Langkah berikutnya sebelum masuk Phase 3:
1. Jalankan backend lokal
2. Jalankan frontend lokal
3. Test login admin@example.com / password
4. Test select company
5. Test dashboard tenant context
6. Test switch company
7. Test logout
8. Test negative case tanpa token dan tanpa X-Company-ID
9. Jika UI dan API sudah benar, commit hasil Phase 2
10. Baru lanjut Phase 3

Command commit setelah semua test lolos:
git status
git add backend frontend docs
git commit -m "complete phase 2 authentication and company access"