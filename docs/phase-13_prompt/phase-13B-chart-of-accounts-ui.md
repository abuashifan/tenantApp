# Prompt 02 — Phase 13B Chart of Accounts UI

```text
Kita lanjut Phase 13B project TenantAppDevelopment.

NAMA SUBPHASE:
Phase 13B — Chart of Accounts UI

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
Membuat UI Chart of Accounts untuk melihat, membuat, mengedit, dan deactivate akun.

WAJIB BACA:
- hasil Phase 13A
- frontend/lib/api.ts
- frontend/features/accounting/*
- backend/routes/api.php bagian chart-of-accounts
- backend/app/Http/Controllers/Api/MasterData/ChartOfAccountController.php jika ada
- backend/app/Models/Tenant/ChartOfAccount.php
- backend/config/permissions.php

SCOPE:
1. Halaman list COA.
2. Search/filter COA.
3. Tree/group display sederhana berdasarkan parent atau account type jika endpoint mendukung.
4. Form create/edit COA.
5. Detail drawer/page sederhana.
6. Deactivate/activate action.
7. Permission-aware buttons.
8. Loading/error/empty states.

ROUTES FRONTEND:
- /accounting/chart-of-accounts
- /accounting/chart-of-accounts/new
- /accounting/chart-of-accounts/[id]
- /accounting/chart-of-accounts/[id]/edit

UI FIELD MINIMAL:
- code
- name
- account_type
- normal_balance
- parent_id
- is_active
- is_cash_bank jika ada
- description jika ada

JANGAN:
- mengubah struktur COA backend besar-besaran
- membuat import/export
- membuat report
- membuat opening balance UI jika belum ada endpoint

ACCEPTANCE:
- list COA tampil dari API
- create/edit bekerja
- deactivate/activate bekerja jika endpoint tersedia
- error backend tampil jelas
- no tenant leak
- no Sales/Purchase UI

COMMANDS:
- npm run lint
- npm run build

FINAL SUMMARY:
Sertakan pages/components dibuat, endpoint yang dipakai, command status.

COMMIT MESSAGE:
add chart of accounts frontend
```
