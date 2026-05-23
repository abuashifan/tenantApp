Kita masuk Phase V0 project TenantAppDevelopment.

NAMA PHASE:
Phase V0 — Vue Frontend Project Setup & Library Installation

KONTEKS PROJECT:
Project TenantAppDevelopment adalah aplikasi akuntansi multi-tenant.

Backend existing:

- Laravel API
- Auth menggunakan Sanctum token
- Request tenant memakai header X-Company-ID
- User bisa akses banyak company
- 1 company = 1 tenant database
- Backend sudah punya endpoint auth, companies, select company, dan tenant-context-test.

Frontend existing saat ini:

- Next.js frontend masih ada.
- Vue frontend akan dibuat sebagai jalur evaluasi serius.
- Jika Vue terbukti lebih cocok dari sisi development experience, performa, form besar, table besar, virtual tabs, dan mobile access, Vue dapat dipilih menjadi frontend utama.

PENTING:
Phase ini hanya setup Vue project dan dependency.
Jangan membuat dashboard.
Jangan membuat sidebar.
Jangan membuat AppShell.
Jangan membuat virtual tabs.
Jangan membuat form jurnal.
Jangan membuat table bisnis.
Jangan membuat halaman bisnis.
Jangan mengubah backend.
Jangan menghapus frontend Next.js existing.

DESIGN-FIRST RULE:
Codex tidak boleh membuat desain UI sendiri.
Layout dashboard, sidebar, form, table, virtual tabs, dan design system akan dibuat dulu di canvas/prototype.
Setelah design spec disetujui, baru Codex boleh implementasi UI.

Jika ada kebutuhan UI yang belum punya design spec:

- gunakan placeholder minimal
- jangan berkreasi sendiri
- tulis TODO bahwa desain menunggu approval canvas

TARGET:
Buat project Vue baru di root repository dengan nama:

frontend-vue

Struktur akhir root repository kira-kira:

tenantApp
├── backend
├── frontend
├── frontend-vue
└── docs

frontend = Next.js existing, jangan dihapus.
frontend-vue = Vue frontend baru.

STACK YANG WAJIB DIPAKAI:

- Vue 3 latest
- Vite latest
- TypeScript
- Vue Router 4
- Pinia
- TailwindCSS
- Axios
- TanStack Table for Vue
- VeeValidate
- Zod
- @vee-validate/zod
- ESLint
- Prettier

PACKAGE YANG HARUS DIINSTALL:
Core:

- vue
- vue-router
- pinia

HTTP:

- axios

Table:

- @tanstack/vue-table

Form & validation:

- vee-validate
- zod
- @vee-validate/zod

Styling:

- tailwindcss
- @tailwindcss/vite jika cocok dengan versi Tailwind terbaru
- postcss jika dibutuhkan
- autoprefixer jika dibutuhkan

Development:

- typescript
- vite
- vue-tsc
- eslint
- prettier

SETUP COMMAND RECOMMENDED:
Gunakan create-vue agar scaffold Vue resmi dan bersih.

Command utama:

npm create vue@latest frontend-vue

Saat prompt muncul, pilih:

- TypeScript: Yes
- JSX: No
- Vue Router: Yes
- Pinia: Yes
- Vitest: No untuk sekarang, kecuali project template memudahkan
- End-to-End Testing: No
- ESLint: Yes
- Prettier: Yes

Setelah project dibuat:

cd frontend-vue
npm install
npm install axios @tanstack/vue-table vee-validate zod @vee-validate/zod

Jika Tailwind belum terinstall dari scaffold:
Install dan setup Tailwind sesuai versi terbaru yang kompatibel dengan Vite.

ENVIRONMENT:
Buat file:

frontend-vue/.env.example

Isi:

VITE_API_URL=http://127.0.0.1:8000/api

Buat juga:

frontend-vue/.env.local

Isi sama untuk development lokal:

VITE_API_URL=http://127.0.0.1:8000/api

GITIGNORE:
Pastikan frontend-vue tidak commit file sensitif.

frontend-vue/.gitignore harus mengabaikan:

- node_modules
- dist
- .env
- .env.local
- .env.\*.local

Tapi tetap izinkan:

- .env.example

STRUKTUR FOLDER YANG HARUS DIBUAT:
Di dalam frontend-vue/src, buat struktur folder berikut:

src/
├── assets/
├── components/
│ ├── layout/
│ ├── navigation/
│ ├── table/
│ ├── form/
│ ├── dialog/
│ └── ui/
├── composables/
│ ├── useApiError.ts
│ ├── useDebounce.ts
│ ├── usePermission.ts
│ └── useTabDraft.ts
├── layouts/
│ ├── AuthLayout.vue
│ └── AppShell.vue
├── pages/
│ ├── auth/
│ ├── dashboard/
│ ├── accounting/
│ ├── sales/
│ ├── purchase/
│ ├── cash-bank/
│ ├── inventory/
│ └── settings/
├── router/
│ └── index.ts
├── services/
│ ├── api.ts
│ ├── auth.service.ts
│ ├── company.service.ts
│ └── tenant.service.ts
├── stores/
│ ├── auth.store.ts
│ ├── company.store.ts
│ ├── permissions.store.ts
│ ├── workspace.store.ts
│ └── ui.store.ts
├── types/
│ ├── api.ts
│ ├── auth.ts
│ ├── company.ts
│ ├── navigation.ts
│ └── workspace.ts
└── utils/

PENTING:
Untuk Phase V0, file boleh berisi placeholder minimal agar build tidak error.
Jangan implementasikan logic besar.
Jangan membuat UI final.

API CLIENT PLACEHOLDER:
Buat src/services/api.ts dengan Axios instance minimal.

Behavior:

- baseURL dari import.meta.env.VITE_API_URL
- Accept application/json
- Content-Type application/json
- request interceptor membaca localStorage:
  - auth_token
  - active_company_id
- jika token ada, kirim Authorization: Bearer TOKEN
- jika active_company_id ada, kirim X-Company-ID

Jangan buat flow login lengkap di Phase V0.
Cukup siapkan API client foundation minimal.

TYPES:
Buat src/types/api.ts berisi type dasar:

ApiResponse<T>
ApiError
ValidationErrors

Contoh struktur:

- success: boolean
- message: string
- data?: T
- errors?: Record<string, string[]>

ROUTER:
Pastikan Vue Router aktif.
Buat route minimal saja:

/login
/select-company
/dashboard

Gunakan placeholder page sangat sederhana.
Jangan desain final.

PLACEHOLDER PAGES:
Buat placeholder minimal:

src/pages/auth/LoginPage.vue
src/pages/auth/SelectCompanyPage.vue
src/pages/dashboard/DashboardPage.vue

Isi cukup teks sederhana seperti:

- Login Page Placeholder
- Select Company Placeholder
- Dashboard Placeholder

Jangan buat desain login final.
Jangan buat card modern.
Jangan buat dashboard widget.
Design final akan dibuat di canvas dulu.

LAYOUT PLACEHOLDER:
AuthLayout.vue dan AppShell.vue boleh minimal.

AuthLayout:

- render slot/router-view saja

AppShell:

- render slot/router-view saja
- jangan buat sidebar final
- jangan buat topbar final
- tulis TODO bahwa layout menunggu approved canvas design

PINIA STORES:
Buat store minimal tanpa logic kompleks:

auth.store.ts:

- token
- user
- isAuthenticated computed/getter sederhana
- setToken()
- clearAuth()

company.store.ts:

- activeCompanyId
- activeCompany
- setActiveCompany()
- clearCompany()

permissions.store.ts:

- permissions array
- setPermissions()
- hasPermission()

workspace.store.ts:

- placeholder untuk future virtual tabs
- jangan implementasi virtual tabs penuh di Phase V0
- tambahkan TODO: implement in Phase V7 after canvas design approval

ui.store.ts:

- sidebarCollapsed placeholder boolean
- jangan buat behavior layout final

COMPOSABLES:
Buat file placeholder minimal:

- useApiError.ts
- useDebounce.ts
- usePermission.ts
- useTabDraft.ts

Untuk useTabDraft.ts:

- jangan implementasi penuh dulu
- tulis TODO: integrate with workspace store in virtual tabs phase

DOCUMENTATION:
Buat file:

frontend-vue/README.md

Isi:

- stack yang dipakai
- cara install
- cara run dev
- env yang dibutuhkan
- catatan bahwa UI final menunggu design canvas
- catatan bahwa Vue bisa menjadi frontend utama jika hasil evaluasi lebih cocok

Buat atau update docs:

docs/frontend-vue-phase-v0-setup.md

Isi:

- tujuan Phase V0
- dependency yang diinstall
- struktur folder
- command yang dipakai
- env setup
- batasan scope
- next phase: V1 API Client Foundation dan V5 Design System Specification

VALIDATION COMMAND:
Jalankan jika environment memungkinkan:

cd frontend-vue
npm install
npm run dev
npm run build
npm run type-check
npm run lint

Jika ada command yang gagal karena environment, dependency, atau script tidak tersedia:

- jangan menebak
- tulis penyebabnya di final summary
- jangan hapus konfigurasi tanpa alasan

PACKAGE.JSON:
Pastikan scripts minimal ada:

- dev
- build
- preview
- type-check jika scaffold menyediakan
- lint jika scaffold menyediakan
- format jika scaffold menyediakan

ACCEPTANCE CRITERIA:
Phase V0 selesai jika:

[ ] folder frontend-vue dibuat
[ ] Vue 3 + Vite + TypeScript aktif
[ ] Vue Router 4 aktif
[ ] Pinia aktif
[ ] TailwindCSS aktif
[ ] Axios terinstall dan api.ts dibuat
[ ] @tanstack/vue-table terinstall
[ ] vee-validate terinstall
[ ] zod terinstall
[ ] @vee-validate/zod terinstall
[ ] .env.example dibuat
[ ] struktur folder src dibuat
[ ] placeholder route /login, /select-company, /dashboard ada
[ ] tidak ada dashboard/sidebar/form/table final yang dibuat sendiri
[ ] backend tidak diubah
[ ] frontend Next.js existing tidak dihapus/diubah
[ ] dokumentasi Phase V0 dibuat
[ ] npm run build berhasil, atau jika gagal dijelaskan jelas

FINAL SUMMARY:
Di akhir pekerjaan, laporkan:

1. File/folder dibuat
2. Dependency yang ditambahkan
3. Script package.json yang tersedia
4. Command yang berhasil dijalankan
5. Command yang gagal dan alasannya
6. Batasan yang sengaja tidak dikerjakan
7. Konfirmasi:
   - backend tidak diubah
   - frontend Next.js tidak dihapus
   - UI final belum dibuat karena menunggu canvas design

COMMIT MESSAGE:
init vue frontend project
