# Prompt 06 — Phase 13F Financial Statements UI

```text
Kita lanjut Phase 13F project TenantAppDevelopment.

NAMA SUBPHASE:
Phase 13F — Financial Statements UI

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
Membuat UI laporan keuangan dasar dari Phase 8: Profit & Loss, Balance Sheet, Cash Flow, dan Financial Summary.

WAJIB BACA:
- hasil Phase 13A-13E
- backend/routes/api.php bagian reports
- services/controllers report Phase 8 jika ada
- frontend/lib/api.ts
- backend/config/permissions.php

SCOPE:
1. Financial Statements landing page.
2. Profit & Loss page.
3. Balance Sheet page.
4. Simple Cash Flow page.
5. Financial Summary page jika endpoint ada.
6. Filter:
   - start_date
   - end_date
   - as_of_date untuk balance sheet
   - fiscal_year
   - department_id
   - project_id
7. Summary cards.
8. Hierarchical report table basic.
9. Print-friendly basic.

FRONTEND ROUTES:
- /accounting/reports/financial-statements
- /accounting/reports/profit-loss
- /accounting/reports/balance-sheet
- /accounting/reports/cash-flow
- /accounting/reports/financial-summary

JANGAN:
- membuat export PDF/Excel
- membuat chart kompleks
- membuat advanced cash flow
- membuat dashboard analytics besar

ACCEPTANCE:
- semua laporan dasar tampil
- filter berjalan sesuai endpoint
- balance sheet balanced status terlihat
- financial summary tampil jika endpoint tersedia
- docs update

COMMANDS:
- npm run lint
- npm run build

COMMIT MESSAGE:
add financial statements frontend
```
