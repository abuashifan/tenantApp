Kamu bekerja pada project aplikasi akuntansi multi-tenant sederhana.

STACK PROJECT:
- Backend: Laravel API
- Frontend: Next.js App Router
- Styling: TailwindCSS
- Database: SQLite
- Arsitektur tenant:
  - central.sqlite = database pusat
  - 1 perusahaan = 1 file SQLite tenant
  - 1 user bisa punya banyak perusahaan
  - user memilih perusahaan aktif setelah login
  - setelah company dipilih, setiap request membawa X-Company-ID

STATUS PROJECT:
Backend Phase 2 sudah selesai atau diasumsikan sudah tersedia.

Endpoint backend yang tersedia:
1. POST /api/auth/register
2. POST /api/auth/login
3. GET /api/auth/me
4. POST /api/auth/logout
5. GET /api/companies
6. POST /api/companies/select
7. GET /api/tenant-context-test

Auth:
- Backend memakai Laravel Sanctum token.
- Login return token Bearer.
- Frontend menyimpan token di localStorage untuk sementara.

Demo login:
- email: admin@example.com
- password: password

Company demo:
1. PT Maju Jaya
   - role: owner
   - tenant database: company_000001.sqlite

2. CV Sumber Rejeki
   - role: admin
   - tenant database: company_000002.sqlite

TUJUAN PROMPT INI:
Kerjakan HANYA bagian FRONTEND Phase 2:
1. API client support token dan X-Company-ID
2. Type auth dan company
3. Halaman login
4. Halaman register sederhana
5. Halaman select company
6. Dashboard menampilkan tenant context aktif
7. Company switcher sederhana
8. Logout local state

JANGAN KERJAKAN:
- Jangan ubah backend.
- Jangan buat migration.
- Jangan buat create company.
- Jangan buat tenant database generator.
- Jangan buat Chart of Accounts.
- Jangan buat Journal Entry.
- Jangan buat laporan.
- Jangan buat role permission detail.
- Jangan install state management library baru.
- Jangan pakai Redux/Zustand dulu kecuali sudah ada sebelumnya.
- Jangan ubah arsitektur besar frontend.
- Jangan buat UI dashboard final.
- Jangan buat sidebar kompleks.
- Jangan keluar dari scope auth dan company selection.

==================================================
BAGIAN 1 — CEK ENV FRONTEND
==================================================

Pastikan frontend punya:

.env.local:
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api

Jika .env.example ada, pastikan juga:
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api

Jangan commit .env.local.

==================================================
BAGIAN 2 — UPDATE API CLIENT
==================================================

Update atau buat file:
- frontend/lib/api.ts

API client harus support:
- method GET/POST/PUT/PATCH/DELETE
- token Authorization Bearer
- X-Company-ID
- JSON body
- error response dari backend
- helper getStoredToken()
- helper getStoredCompanyId()

ApiOptions:
- method optional
- token optional
- companyId optional
- body optional

Header default:
- Accept: application/json
- Content-Type: application/json

Jika token ada:
Authorization: Bearer TOKEN

Jika companyId ada:
X-Company-ID: companyId

Fetch ke:
`${NEXT_PUBLIC_API_URL}${path}`

Jika response tidak ok:
- baca message dari response JSON
- throw Error(message)

Helper:
getStoredToken:
- jika window undefined return null
- return localStorage.getItem("auth_token")

getStoredCompanyId:
- jika window undefined return null
- return localStorage.getItem("active_company_id")

==================================================
BAGIAN 3 — BUAT TYPES
==================================================

Buat atau update:
- frontend/types/api.ts
- frontend/types/auth.ts
- frontend/types/company.ts

types/api.ts:
ApiResponse<T>:
- success: boolean
- message: string
- data: T

ApiError:
- success: false
- message: string
- errors optional

types/auth.ts:
User:
- id number
- name string
- email string
- phone optional nullable string
- avatar optional nullable string
- status string
- last_login_at optional nullable string

LoginResponse:
- user User
- token string
- token_type "Bearer"

types/company.ts:
Company:
- id number
- name string
- legal_name optional nullable string
- slug string
- code string
- status string
- user_role string
- tenant_database optional nullable:
  - database_name string
  - status string

ActiveCompany:
- id number
- name string
- legal_name optional nullable string
- slug string
- code string
- user_role string
- tenant_database:
  - database_name string
  - database_path string
  - status string

TenantContextTest:
- company_id number
- company_name string
- database_name string
- database_path string
- user_role string

==================================================
BAGIAN 4 — BUAT HALAMAN LOGIN
==================================================

Buat:
- frontend/app/login/page.tsx

Gunakan client component.

UI sederhana:
- card di tengah layar
- title Accounting App
- heading Login
- input email
- input password
- button Login
- tampilkan error jika gagal
- loading state

Default value untuk memudahkan testing:
- email: admin@example.com
- password: password

Saat submit:
1. POST /auth/login
2. Simpan token ke localStorage:
   - auth_token
3. Simpan user ke localStorage:
   - auth_user
4. Setelah login, request:
   - GET /companies
   - pakai token
5. Jika companies.length === 0:
   - tampilkan error "User ini belum punya company."
6. Jika companies.length === 1:
   - simpan active_company_id
   - optional simpan active_company jika sudah tersedia
   - redirect /dashboard
7. Jika companies.length > 1:
   - redirect /select-company

Gunakan useRouter dari next/navigation.

Jangan pakai cookie dulu.
Jangan pakai server action dulu.
Jangan pakai NextAuth.

==================================================
BAGIAN 5 — BUAT HALAMAN REGISTER SEDERHANA
==================================================

Buat:
- frontend/app/register/page.tsx

Gunakan client component.

Form:
- name
- email
- password
- password_confirmation
- button Register
- loading state
- error state

Saat submit:
- POST /auth/register
- simpan auth_token
- simpan auth_user
- redirect ke /select-company

Catatan:
- User baru mungkin belum punya company.
- Jika nanti /select-company kosong, tampilkan empty state.
- Jangan buat create company di prompt ini.

==================================================
BAGIAN 6 — BUAT HALAMAN SELECT COMPANY
==================================================

Buat:
- frontend/app/select-company/page.tsx

Gunakan client component.

Behavior:
1. Ambil token dari localStorage.
2. Jika token tidak ada:
   - redirect /login
3. GET /companies dengan token.
4. Tampilkan daftar company dalam card.
5. Setiap card menampilkan:
   - company.name
   - company.legal_name
   - company.user_role
   - company.tenant_database.database_name
6. Saat user klik company:
   - POST /companies/select
   - body: company_id
   - header Authorization Bearer token
7. Jika berhasil:
   - simpan active_company_id ke localStorage
   - simpan active_company ke localStorage
   - redirect /dashboard

UI:
- background slate
- max width sekitar 4xl
- card company responsive grid
- hover state sederhana
- loading state
- error state
- empty state jika tidak ada company:
  "Belum ada company untuk user ini."

Jangan buat create company button dulu, cukup empty state.

==================================================
BAGIAN 7 — UPDATE APPSHELL / LAYOUT DASHBOARD
==================================================

Update atau buat:
- frontend/components/layout/AppShell.tsx

Gunakan client component.

Fungsi:
- Menampilkan header dashboard.
- Menampilkan active company dari localStorage active_company.
- Tombol atau button company switcher:
  - klik redirect ke /select-company
- Tombol logout:
  - hapus localStorage:
    - auth_token
    - auth_user
    - active_company_id
    - active_company
  - redirect ke /login

UI:
- header putih
- border bawah
- title Accounting App
- label Dashboard
- active company card kecil di header
- button logout

Jangan buat sidebar final.
Jangan buat layout kompleks.
Jangan buat menu modul akuntansi dulu.

==================================================
BAGIAN 8 — UPDATE DASHBOARD PAGE
==================================================

Update:
- frontend/app/dashboard/page.tsx

Gunakan client component.

Behavior:
1. Ambil token dari localStorage.
2. Ambil active_company_id dari localStorage.
3. Jika token tidak ada:
   - redirect /login
4. Jika active_company_id tidak ada:
   - redirect /select-company
5. Request:
   - GET /tenant-context-test
   - Authorization Bearer token
   - X-Company-ID active_company_id
6. Tampilkan data tenant context.

Dashboard card:
1. Active Company
   - context.company_name
2. Tenant Database
   - context.database_name
3. User Role
   - context.user_role

Tambahkan panel debug:
- title Tenant Context Test
- tampilkan JSON.stringify(context, null, 2)

Error:
- tampilkan error box merah jika gagal.

Jangan buat dashboard finansial.
Jangan buat chart.
Jangan buat sidebar.
Jangan buat modul akuntansi.

==================================================
BAGIAN 9 — OPTIONAL: UPDATE HOME PAGE
==================================================

Jika perlu, update:
- frontend/app/page.tsx

Behavior sederhana:
- Jika token ada, arahkan ke /dashboard
- Jika token tidak ada, tampilkan link/button ke /login

Atau boleh tetap menampilkan API health check jika sudah ada.
Jangan hapus health check jika masih berguna.

==================================================
BAGIAN 10 — TESTING FRONTEND WAJIB
==================================================

Jalankan backend:
cd backend
php artisan serve

Jalankan frontend:
cd frontend
npm run dev

Test manual:

1. Buka:
http://localhost:3000/login

2. Login:
email: admin@example.com
password: password

Expected:
- login berhasil
- token tersimpan di localStorage
- karena user punya 2 company, redirect ke /select-company

3. Di /select-company:
Expected:
- tampil PT Maju Jaya
- tampil CV Sumber Rejeki
- masing-masing menampilkan role dan tenant database

4. Pilih PT Maju Jaya:
Expected:
- redirect ke /dashboard
- dashboard menampilkan:
  - Active Company: PT Maju Jaya
  - Tenant Database: company_000001.sqlite
  - User Role: owner

5. Klik company switcher:
Expected:
- redirect ke /select-company

6. Pilih CV Sumber Rejeki:
Expected:
- redirect ke /dashboard
- dashboard menampilkan:
  - Active Company: CV Sumber Rejeki
  - Tenant Database: company_000002.sqlite
  - User Role: admin

7. Klik logout:
Expected:
- localStorage auth_token hilang
- active_company_id hilang
- redirect ke /login

8. Buka /dashboard tanpa token:
Expected:
- redirect ke /login

9. Buka /dashboard dengan token tapi tanpa active_company_id:
Expected:
- redirect ke /select-company

==================================================
OUTPUT YANG DIHARAPKAN DARI CODEX
==================================================

Setelah selesai, berikan ringkasan:
1. File yang dibuat
2. File yang diubah
3. Halaman baru
4. Cara test frontend
5. Catatan error jika ada
6. Hal yang belum dikerjakan karena bukan scope prompt ini

JANGAN melanjutkan ke Phase 3.
JANGAN buat create company.
JANGAN buat modul akuntansi.
Berhenti setelah frontend Phase 2 selesai.