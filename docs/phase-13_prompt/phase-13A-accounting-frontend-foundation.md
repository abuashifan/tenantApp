# Prompt 01 — Phase 13A Accounting Frontend Foundation

```text
Kita lanjut Phase 13A project TenantAppDevelopment.

NAMA SUBPHASE:
Phase 13A — Accounting Frontend Foundation

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
Menyiapkan fondasi UI accounting agar subphase 13B-13H konsisten.

WAJIB BACA FILE TERBATAS:
- frontend/lib/api.ts
- frontend/types/api.ts
- frontend/components/layout/AppShell.tsx
- frontend/app/dashboard/page.tsx
- frontend/app/login/page.tsx
- frontend/app/select-company/page.tsx
- frontend/package.json
- backend/routes/api.php sebagai referensi endpoint
- backend/config/permissions.php sebagai referensi permission

JANGAN:
- relisting seluruh repo
- membuat backend module baru
- membuat Sales/Purchase/Cash Bank/Inventory UI
- membuat create tenant/company UI

SCOPE:
1. Buat struktur folder frontend accounting.
2. Buat route group/page accounting dasar.
3. Buat menu Accounting di AppShell.
4. Buat permission-aware navigation helper.
5. Buat reusable UI states:
   - LoadingState
   - ErrorState
   - EmptyState
   - PageHeader
   - DataTable shell sederhana
   - StatusBadge
   - PermissionGuard
6. Buat helper formatter:
   - currency
   - date
   - debit/credit
   - accounting status
7. Buat docs Phase 13 utama.

FILE YANG DIBUAT/DIUBAH:
- frontend/app/accounting/page.tsx
- frontend/features/accounting/*
- frontend/components/ui/*
- frontend/lib/formatters.ts
- frontend/lib/permissions.ts
- frontend/types/accounting.ts
- frontend/components/layout/AppShell.tsx
- docs/phase-13-accounting-frontend-mvp.md

MENU MINIMAL:
Accounting
- Chart of Accounts
- Master Data
- Journal Entries
- General Ledger
- Trial Balance
- Financial Statements
- Fiscal Closing

ACCEPTANCE:
- /accounting bisa dibuka setelah login dan active company dipilih
- menu Accounting tampil di AppShell
- permission helper tersedia
- reusable UI states tersedia
- belum ada CRUD besar di 13A
- docs dibuat/update

COMMANDS:
Jalankan jika memungkinkan:
- npm run lint
- npm run build

FINAL SUMMARY:
Sertakan file dibuat/diubah, UI route, helper, command status, dan batasan scope.

COMMIT MESSAGE:
add accounting frontend foundation
```
