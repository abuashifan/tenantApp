# Prompt 05 — Phase 13E Ledger & Trial Balance UI

```text
Kita lanjut Phase 13E project TenantAppDevelopment.

NAMA SUBPHASE:
Phase 13E — Ledger & Trial Balance UI

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
Membuat UI untuk General Ledger, Account Ledger Detail, dan Trial Balance dari backend Phase 7.

WAJIB BACA:
- hasil Phase 13A-13D
- backend/routes/api.php bagian reports/ledger/trial-balance
- services/controllers report Phase 7 jika ada
- frontend/lib/api.ts
- backend/config/permissions.php

SCOPE:
1. General Ledger page.
2. Account Ledger Detail page.
3. Trial Balance page.
4. Filter:
   - start_date
   - end_date
   - fiscal_year jika endpoint support
   - account_id
   - department_id
   - project_id
   - include_zero_balance jika endpoint support
5. Table display:
   - account code/name
   - opening balance
   - debit
   - credit
   - ending balance
6. Detail drilldown ke journal jika memungkinkan.
7. Trial balance debit/credit total summary.
8. Print-friendly layout basic tanpa export.

FRONTEND ROUTES:
- /accounting/reports/general-ledger
- /accounting/reports/account-ledger
- /accounting/reports/trial-balance

JANGAN:
- membuat PDF/Excel export
- membuat advanced analytics
- membuat backend report calculation baru kecuali endpoint adapter kecil diperlukan

ACCEPTANCE:
- report bisa difilter dan tampil
- total debit/credit terlihat
- empty/error/loading states ada
- permission reports.view dicek
- docs update

COMMANDS:
- npm run lint
- npm run build

COMMIT MESSAGE:
add ledger and trial balance frontend
```
