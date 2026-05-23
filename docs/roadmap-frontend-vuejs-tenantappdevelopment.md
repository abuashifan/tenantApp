# Roadmap Frontend VueJS — TenantAppDevelopment

Dokumen ini adalah roadmap resmi untuk memulai frontend VueJS pada project **TenantAppDevelopment**.

Vue frontend ini dimulai sebagai **lab pembanding yang serius**, tetapi tidak dibatasi hanya sebagai eksperimen. Jika setelah proses desain, prototype, uji performa, uji mobile, dan evaluasi developer experience hasilnya Vue terbukti lebih cocok daripada Next.js, maka Vue dapat dipilih menjadi **frontend utama** project TenantAppDevelopment.

---

# 1. Tujuan Utama

Membangun frontend VueJS modern yang terhubung ke backend Laravel API existing, lalu membandingkannya secara objektif dengan frontend Next.js.

## Tujuan evaluasi

```text
[ ] Menguji kenyamanan development Vue dibanding Next.js
[ ] Menguji performa form besar
[ ] Menguji performa table besar
[ ] Menguji virtual tabs ERP
[ ] Menguji draft state form yang belum disimpan
[ ] Menguji akses dari handphone
[ ] Menguji kemudahan build/deploy
[ ] Menentukan apakah Vue lebih cocok menjadi frontend utama
```

## Backend tetap

```text
Laravel API
Authorization Bearer token
X-Company-ID
Tenant database per company
```

---

# 2. Prinsip Design-First

Frontend Vue tidak boleh langsung dibangun oleh Codex berdasarkan imajinasi layout.

Sebelum implementasi kode, desain harus dibuat dan disetujui dulu di canvas/prototype.

## Aturan utama

```text
[ ] Codex tidak boleh mendesain layout sendiri
[ ] Codex tidak boleh membuat dashboard sendiri
[ ] Codex tidak boleh membuat sidebar sendiri tanpa desain
[ ] Codex tidak boleh membuat form sendiri tanpa desain
[ ] Codex tidak boleh membuat table style sendiri tanpa desain
[ ] Codex hanya boleh mengimplementasikan design spec yang sudah disetujui
```

## Alur resmi

```text
1. Design dulu di canvas
2. Kunci design system
3. Buat dokumen design spec
4. Baru Codex implementasi Vue
5. Codex wajib mengikuti desain, bukan berkreasi sendiri
```

---

# 3. Stack Awal yang Dipilih

```text
Framework     : Vue 3 latest
Build Tool    : Vite
Language      : TypeScript
Router        : Vue Router
State         : Pinia
Style         : TailwindCSS
HTTP Client   : Axios
Table         : TanStack Table
Form          : VeeValidate
Validation    : Zod
Testing       : Vitest optional setelah prototype stabil
```

## Pembagian fungsi

```text
Axios          = HTTP client ke Laravel API
TanStack Table = Data table reusable
VeeValidate   = Form handling utama
Zod           = Schema validation
Pinia         = Auth, company, permission, workspace, virtual tabs, draft state
Vue Router    = Routing halaman
TailwindCSS   = Styling sesuai design token
```

---

# 4. Struktur Project yang Disarankan

Jika masih satu repository:

```text
tenantApp
├── backend
├── frontend
└── frontend-vue
```

Atau jika ingin aman sebagai project terpisah:

```text
tenantApp-vue
```

Rekomendasi awal:

```text
frontend-vue
```

Agar mudah dibandingkan dengan frontend Next.js existing.

---

# 5. Struktur Folder Vue

```text
src/
├── assets/
├── components/
│   ├── layout/
│   ├── navigation/
│   ├── table/
│   ├── form/
│   ├── dialog/
│   └── ui/
├── composables/
│   ├── useApiError.ts
│   ├── useDebounce.ts
│   ├── usePermission.ts
│   └── useTabDraft.ts
├── layouts/
│   ├── AuthLayout.vue
│   └── AppShell.vue
├── pages/
│   ├── auth/
│   ├── dashboard/
│   ├── accounting/
│   ├── sales/
│   ├── purchase/
│   ├── cash-bank/
│   ├── inventory/
│   └── settings/
├── router/
│   └── index.ts
├── services/
│   ├── api.ts
│   ├── auth.service.ts
│   ├── company.service.ts
│   └── tenant.service.ts
├── stores/
│   ├── auth.store.ts
│   ├── company.store.ts
│   ├── permissions.store.ts
│   ├── workspace.store.ts
│   └── ui.store.ts
├── types/
│   ├── api.ts
│   ├── auth.ts
│   ├── company.ts
│   ├── navigation.ts
│   └── workspace.ts
└── utils/
```

---

# 6. Phase V0 — Project Setup

## Tujuan

Membuat project Vue modern yang siap dipakai untuk prototype frontend utama.

## Task

```text
[ ] Buat project Vue terbaru
[ ] Aktifkan TypeScript
[ ] Aktifkan Vue Router
[ ] Aktifkan Pinia
[ ] Aktifkan ESLint
[ ] Aktifkan Prettier
[ ] Install TailwindCSS
[ ] Install Axios
[ ] Install TanStack Table
[ ] Install VeeValidate
[ ] Install Zod
[ ] Buat .env.example
[ ] Buat struktur folder dasar
```

## Command awal

```bash
npm create vue@latest frontend-vue
cd frontend-vue
npm install
npm install axios
npm install @tanstack/vue-table
npm install vee-validate zod @vee-validate/zod
npm run dev
```

## Environment

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

## Acceptance Criteria

```text
[ ] Vue dev server berjalan
[ ] TailwindCSS aktif
[ ] Router aktif
[ ] Pinia aktif
[ ] Axios siap
[ ] Project struktur rapi
```

---

# 7. Phase V1 — API Client Foundation

## Tujuan

Membuat satu pintu komunikasi ke Laravel API.

## Task

```text
[ ] Buat src/services/api.ts
[ ] Setup Axios baseURL
[ ] Tambahkan Authorization Bearer token otomatis
[ ] Tambahkan X-Company-ID otomatis
[ ] Handle 401 unauthenticated
[ ] Handle 403 forbidden
[ ] Handle 422 validation error
[ ] Handle network error
[ ] Buat type ApiResponse dan ApiError
```

## API behavior

```text
Authorization: Bearer TOKEN
X-Company-ID: ACTIVE_COMPANY_ID
Accept: application/json
Content-Type: application/json
```

## Acceptance Criteria

```text
[ ] GET /health berhasil
[ ] Request otomatis membawa token jika login
[ ] Request otomatis membawa X-Company-ID jika company aktif
[ ] Error Laravel 422 bisa dibaca form
[ ] Error 401 bisa redirect ke login
```

---

# 8. Phase V2 — Auth Flow

## Tujuan

Membuat flow login yang sama dengan backend Laravel API existing.

## Endpoint

```text
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
```

## Task

```text
[ ] Login page
[ ] Register page optional
[ ] Auth store Pinia
[ ] Simpan token
[ ] Ambil current user
[ ] Logout
[ ] Route guard auth
[ ] Redirect jika belum login
```

## Store

```text
auth.store.ts
- token
- user
- isAuthenticated
- login()
- fetchMe()
- logout()
```

## Acceptance Criteria

```text
[ ] User bisa login
[ ] Token tersimpan
[ ] User bisa logout
[ ] Tanpa token redirect ke /login
[ ] Setelah login redirect ke /select-company atau /dashboard
```

---

# 9. Phase V3 — Company Selection & Tenant Context

## Tujuan

Membuat flow multi-company dan tenant context.

## Endpoint

```text
GET  /api/companies
POST /api/companies/select
GET  /api/tenant-context-test
```

## Task

```text
[ ] Select company page
[ ] Company store Pinia
[ ] Simpan active_company_id
[ ] Simpan active_company
[ ] Kirim X-Company-ID otomatis
[ ] Dashboard fetch tenant context
[ ] Switch company
```

## Store

```text
company.store.ts
- companies
- activeCompanyId
- activeCompany
- fetchCompanies()
- selectCompany(companyId)
- switchCompany(companyId)
- clearCompany()
```

## Acceptance Criteria

```text
[ ] User bisa melihat daftar company miliknya
[ ] User bisa pilih company
[ ] active_company_id tersimpan
[ ] Dashboard bisa memanggil tenant-context-test
[ ] Switch company tidak bocor data
```

---

# 10. Phase V4 — Router & Route Guard

## Tujuan

Merapikan routing Vue agar cocok untuk aplikasi ERP.

## Route awal

```text
/login
/register
/select-company
/dashboard

/accounting/journals
/accounting/chart-of-accounts
/accounting/general-ledger
/accounting/trial-balance
/accounting/profit-loss
/accounting/balance-sheet
/accounting/cash-flow

/sales/invoices
/purchase/orders
/cash-bank
/inventory
/settings/company
```

## Guard

```text
[ ] guestOnly
[ ] requiresAuth
[ ] requiresCompany
[ ] permission guard
[ ] redirect unauthorized
```

## Acceptance Criteria

```text
[ ] Belum login tidak bisa akses dashboard
[ ] Sudah login tidak perlu balik login
[ ] Belum pilih company diarahkan ke select-company
[ ] Permission bisa mengontrol menu/page
```

---

# 11. Phase V5 — Design System Specification

## Tujuan

Mendokumentasikan design system sebelum Codex implementasi UI besar.

## Dokumen yang dibuat

```text
docs/frontend-vue-design-system.md
docs/frontend-vue-interaction-rules.md
```

## Isi design system

```text
[ ] Color palette
[ ] Typography scale
[ ] Spacing scale
[ ] Border radius
[ ] Shadow
[ ] Layout grid
[ ] Sidebar rules
[ ] Virtual tabs rules
[ ] Form pattern
[ ] Table pattern
[ ] Button pattern
[ ] Badge pattern
[ ] Modal/dialog pattern
[ ] Empty/loading/error states
[ ] Mobile behavior
```

## Acceptance Criteria

```text
[ ] Codex punya acuan desain
[ ] Warna tidak dikarang sendiri
[ ] Layout tidak dikarang sendiri
[ ] Komponen UI punya pattern jelas
```

---

# 12. Phase V6 — AppShell Layout Foundation

## Tujuan

Membuat layout ERP berdasarkan desain canvas yang sudah disetujui.

## Komponen

```text
AppShell.vue
Sidebar.vue
FloatingSubmenu.vue
Topbar.vue
UserMenu.vue
CompanySwitcher.vue
PrimaryVirtualTabs.vue
SecondaryVirtualTabs.vue
ContentArea.vue
```

## Task

```text
[ ] Sidebar full mode
[ ] Sidebar collapsed mode
[ ] Floating submenu
[ ] Topbar
[ ] Active company display
[ ] User menu
[ ] Logout button
[ ] Content area
[ ] Responsive mobile basic
```

## Acceptance Criteria

```text
[ ] Layout sama dengan desain canvas
[ ] Sidebar behavior sesuai interaction rules
[ ] Company aktif terlihat
[ ] User menu berfungsi
[ ] Logout bekerja
[ ] Tidak ada dashboard widget karangan Codex
```

---

# 13. Phase V7 — Virtual Tabs Foundation

## Tujuan

Menguji apakah Vue + Pinia lebih nyaman untuk virtual tabs ERP.

## Konsep

```text
Primary tabs = halaman kerja utama
Secondary tabs = list/create/edit/detail dalam halaman tersebut
```

## Store

```text
workspace.store.ts
- primaryTabs
- activePrimaryTabId
- secondaryTabsByPrimaryId
- activeSecondaryTabIdByPrimaryId
- draftStateBySecondaryTabId
- dirtyStateBySecondaryTabId
```

## Task

```text
[ ] Open primary tab dari sidebar
[ ] Dashboard tab tidak bisa ditutup
[ ] Setiap primary tab punya list secondary tab
[ ] Create tab Data Baru
[ ] Edit tab berdasarkan entity ID
[ ] Dirty state
[ ] Close tab confirmation
[ ] Close all tabs
[ ] Restore active secondary tab saat pindah primary tab
```

## Acceptance Criteria

```text
[ ] Buka Journal
[ ] Klik Data Baru
[ ] Isi form dummy
[ ] Pindah ke Sales Invoice
[ ] Balik ke Journal
[ ] Data Baru masih aktif
[ ] Input dummy tidak hilang
```

---

# 14. Phase V8 — Form Draft State

## Tujuan

Membuktikan form state Vue + Pinia bisa stabil untuk ERP.

## Task

```text
[ ] Buat composable useTabDraft()
[ ] Draft state per secondary tab
[ ] Dirty flag otomatis
[ ] Reset draft
[ ] Save placeholder
[ ] Unsaved warning
```

## Acceptance Criteria

```text
[ ] Setiap create tab punya draft sendiri
[ ] Dua Data Baru tidak saling menimpa
[ ] Edit tab entity berbeda punya state berbeda
[ ] Dirty tab terdeteksi saat close
```

---

# 15. Phase V9 — Reusable Form System

## Tujuan

Membuat sistem form reusable berbasis VeeValidate + Zod.

## Komponen

```text
TextInput.vue
NumberInput.vue
CurrencyInput.vue
DateInput.vue
SelectInput.vue
SearchableSelect.vue
TextareaInput.vue
CheckboxInput.vue
FormSection.vue
FormActions.vue
FormErrorSummary.vue
```

## Task

```text
[ ] Setup VeeValidate
[ ] Setup Zod schema
[ ] Buat base form components
[ ] Handle Laravel validation error 422
[ ] Handle dirty state
[ ] Handle submit loading
```

## Acceptance Criteria

```text
[ ] Login form pakai VeeValidate + Zod
[ ] Master data form bisa reuse input component
[ ] Error Laravel tampil rapi
[ ] Submit loading state jelas
```

---

# 16. Phase V10 — Reusable Table System

## Tujuan

Membuat table reusable berbasis TanStack Table.

## Komponen

```text
DataTable.vue
DataTableToolbar.vue
DataTablePagination.vue
DataTableColumnHeader.vue
DataTableEmptyState.vue
DataTableLoadingState.vue
```

## Task

```text
[ ] Setup TanStack Table
[ ] Server-side pagination
[ ] Server-side search
[ ] Server-side sorting
[ ] Loading state
[ ] Empty state
[ ] Error state
[ ] Debounce search
```

## Acceptance Criteria

```text
[ ] Table tidak fetch semua data
[ ] Search tidak spam request
[ ] Pagination berjalan
[ ] Sorting berjalan
[ ] UI tetap ringan
```

---

# 17. Phase V11 — Journal Entry Prototype

## Tujuan

Membuat satu form berat untuk pembanding performa dan state.

## Scope

Belum perlu full production. Fokus ke UX, state, dan performa.

## Task

```text
[ ] Journal list page
[ ] Create journal secondary tab
[ ] Journal form table debit/kredit
[ ] Tambah line
[ ] Hapus line
[ ] Hitung total debit
[ ] Hitung total kredit
[ ] Balance indicator
[ ] Department selector placeholder/API ready
[ ] Project selector placeholder/API ready
[ ] Save draft state
```

## Acceptance Criteria

```text
[ ] Form tetap responsif
[ ] Kalkulasi debit/kredit instan
[ ] State tidak hilang saat pindah tab
[ ] Bisa membuka lebih dari satu journal create/edit
```

---

# 18. Phase V12 — Permission-aware Navigation

## Tujuan

Membuat menu mengikuti permission dari backend.

## Task

```text
[ ] Fetch permissions
[ ] Simpan ke permissions.store.ts
[ ] Hide menu tanpa permission
[ ] Hide button action tanpa permission
[ ] Route guard permission
```

## Acceptance Criteria

```text
[ ] Menu hanya tampil jika user punya permission
[ ] Route tanpa permission ditolak
[ ] Button create/edit/post bisa disembunyikan
```

---

# 19. Phase V13 — Mobile Responsiveness Test

## Tujuan

Menguji apakah Vue frontend nyaman di HP.

## Task

```text
[ ] Login mobile
[ ] Select company mobile
[ ] Dashboard mobile
[ ] Sidebar drawer mobile
[ ] Journal form mobile
[ ] Table mobile
[ ] Virtual tabs mobile
```

## Acceptance Criteria

```text
[ ] Input angka nyaman di HP
[ ] Table tidak rusak
[ ] Sidebar tidak menutupi form
[ ] Tab masih usable di layar kecil
```

---

# 20. Phase V14 — Build & Deploy Static Test

## Tujuan

Membuktikan Vue bisa di-build static dan di-host murah.

## Task

```text
[ ] npm run build
[ ] Preview build
[ ] Deploy static ke subfolder/subdomain
[ ] Test refresh route
[ ] Setup fallback index.html
```

## Command

```bash
npm run build
npm run preview
```

## Production target

```text
vue.akuntansiku.com → Vue frontend
api.akuntansiku.com → Laravel API
```

## Acceptance Criteria

```text
[ ] Build sukses
[ ] Preview sukses
[ ] Refresh route tidak 404
[ ] API tetap terkoneksi
```

---

# 21. Phase V15 — Comparison Report & Frontend Decision

## Tujuan

Membuat keputusan final berbasis pengalaman nyata.

## Bandingkan

```text
Next.js frontend existing
vs
Vue frontend prototype
```

## Metrik evaluasi

```text
[ ] Dev server startup
[ ] HMR saat edit form
[ ] Compile delay saat pindah halaman
[ ] Bundle size production
[ ] Kemudahan auth flow
[ ] Kemudahan company context
[ ] Kemudahan virtual tabs
[ ] Kemudahan form draft state
[ ] Performa table
[ ] Performa HP
[ ] Kemudahan deploy
[ ] Kenyamanan coding pribadi
```

## Output

```text
docs/frontend-framework-comparison.md
```

## Kemungkinan keputusan

```text
[ ] Tetap Next.js sebagai frontend utama
[ ] Migrasi ke Vue sebagai frontend utama
[ ] Lanjutkan Vue hanya untuk module tertentu
[ ] Tunda keputusan sampai prototype lebih lengkap
```

---

# 22. Roadmap Ringkas

```text
[ ] V0  — Project Setup
[ ] V1  — API Client Foundation
[ ] V2  — Auth Flow
[ ] V3  — Company Selection & Tenant Context
[ ] V4  — Router & Route Guard
[ ] V5  — Design System Specification
[ ] V6  — AppShell Layout Foundation
[ ] V7  — Virtual Tabs Foundation
[ ] V8  — Form Draft State
[ ] V9  — Reusable Form System
[ ] V10 — Reusable Table System
[ ] V11 — Journal Entry Prototype
[ ] V12 — Permission-aware Navigation
[ ] V13 — Mobile Responsiveness Test
[ ] V14 — Build & Deploy Static Test
[ ] V15 — Comparison Report & Frontend Decision
```

---

# 23. Urutan Paling Aman

```text
1. Setup Vue project
2. API client
3. Login
4. Select company
5. Dashboard tenant context
6. Design AppShell di canvas
7. Implement AppShell sesuai desain
8. Virtual tabs
9. Journal Entry prototype
10. Table prototype
11. Mobile test
12. Comparison report
13. Keputusan final frontend utama
```

---

# 24. Guardrail Prompt untuk Codex

Gunakan setiap kali meminta Codex implementasi frontend Vue:

```text
IMPORTANT DESIGN-FIRST RULE:
Do not invent UI design.
Do not redesign layout.
Do not create dashboard/sidebar/form/table styles by yourself.
You must implement only the approved design from the canvas/design spec.

Before coding, read:
- docs/frontend-vue-design-system.md
- docs/frontend-vue-interaction-rules.md if exists
- the specific phase prompt

If a layout, component, color, spacing, or interaction is not specified, do not invent a new one.
Use minimal placeholder and add TODO comment asking for design clarification.

The goal is implementation fidelity, not creative redesign.
```

---

# 25. Catatan Final

Vue frontend ini bukan sekadar percobaan kecil.

Vue frontend ini adalah **jalur evaluasi resmi** untuk menentukan apakah Vue lebih cocok menjadi frontend utama TenantAppDevelopment.

Keputusan akhir tidak dibuat berdasarkan asumsi, tetapi berdasarkan:

```text
[ ] Prototype nyata
[ ] Performa nyata
[ ] Kemudahan coding nyata
[ ] Stabilitas virtual tabs
[ ] Kenyamanan form besar
[ ] Pengalaman akses mobile
```
