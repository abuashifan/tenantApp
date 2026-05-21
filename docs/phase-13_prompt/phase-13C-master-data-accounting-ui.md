# Prompt 03 — Phase 13C Master Data Accounting UI

```text
Kita lanjut Phase 13C project TenantAppDevelopment.

NAMA SUBPHASE:
Phase 13C — Master Data Accounting UI

KONTEKS PROJECT:
Project TenantAppDevelopment adalah aplikasi akuntansi multi-tenant:
- Backend: Laravel API
- Frontend: Next.js + TailwindCSS
- Database MVP/development: SQLite
- 1 company = 1 tenant database
- Request tenant memakai Bearer token + X-Company-ID
- Frontend sudah punya auth/company selection foundation
- Backend accounting core Phase 6-8, Sales/Purchase/Cash Bank/Inventory backend Phase 9-12 diasumsikan sudah selesai.

ATURAN GLOBAL PHASE 13:
- Phase 13 adalah Accounting Frontend MVP.
- Fokus frontend accounting, bukan backend business logic baru.
- Jangan membuat endpoint backend besar kecuali adapter kecil untuk kebutuhan UI yang benar-benar hilang.
- Jangan membuat Sales/Purchase/Cash Bank/Inventory UI; itu Phase 14-17.
- Jangan membuat create tenant/company UI publik.
- Semua request tenant-aware memakai active_company_id / X-Company-ID.
- Semua halaman harus permission-aware.
- Semua mutation harus menampilkan error backend apa adanya dengan bahasa UI yang jelas.
- Gunakan existing AppShell, api client, auth guard, company selector, TailwindCSS pattern.
- Jangan menambah state management library baru kecuali sudah ada di project.
- UI MVP harus functional, rapi, dan aman, bukan dashboard kompleks.
- Jangan mengubah arsitektur tenant.


TUJUAN:
Membuat UI master data accounting yang sudah dipakai modul akuntansi.

WAJIB BACA:
- hasil Phase 13A-13B
- frontend/lib/api.ts
- backend/routes/api.php bagian master-data
- backend/config/permissions.php
- model/controller existing untuk Contacts, Units, Product Categories, Products, Warehouses, Account Mappings, Departments, Projects

SCOPE:
Buat UI minimal untuk:
1. Contacts
2. Units
3. Product Categories
4. Products
5. Warehouses
6. Account Mappings
7. Departments
8. Projects

FRONTEND ROUTES:
- /accounting/master-data
- /accounting/master-data/contacts
- /accounting/master-data/units
- /accounting/master-data/product-categories
- /accounting/master-data/products
- /accounting/master-data/warehouses
- /accounting/master-data/account-mappings
- /accounting/master-data/departments
- /accounting/master-data/projects

RULE:
- UI boleh reusable CRUD pattern.
- Fokus MVP: list, create, edit, detail, activate/deactivate jika tersedia.
- Account Mapping UI harus hati-hati karena berdampak ke posting jurnal.
- Jangan membuat inventory UI/detail stock; product/warehouse hanya master data.

ACCEPTANCE:
- semua master data accounting bisa dibuka
- CRUD basic berjalan sesuai endpoint
- permission-aware actions
- loading/error/empty state
- docs update

COMMANDS:
- npm run lint
- npm run build

COMMIT MESSAGE:
add accounting master data frontend
```
