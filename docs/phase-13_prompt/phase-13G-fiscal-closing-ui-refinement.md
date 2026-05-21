# Prompt 07 — Phase 13G Fiscal Closing UI Refinement

```text
Kita lanjut Phase 13G project TenantAppDevelopment.

NAMA SUBPHASE:
Phase 13G — Fiscal Closing UI Refinement

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
Merapikan UI fiscal closing dari Phase 8F agar menyatu dengan Accounting Frontend MVP.

WAJIB BACA:
- hasil Phase 13A-13F
- frontend/app/accounting/fiscal-closing/page.tsx jika sudah ada
- backend/routes/api.php bagian fiscal closing/period locks
- FiscalYearClosingController jika ada
- PeriodLockController jika ada
- backend/config/permissions.php

SCOPE:
1. Fiscal closing page refinement.
2. Closing status card.
3. Closing checklist UI.
4. Closing preview panel.
5. Period lock status panel.
6. Reopen dialog dengan reason.
7. Disable close button jika checklist gagal.
8. Warning/error display jelas.
9. Permission-aware close/reopen/lock buttons.
10. Link dari Accounting menu.

FRONTEND ROUTES:
- /accounting/fiscal-closing

JANGAN:
- membuat inventory closing
- membuat tax closing
- membuat fixed asset closing
- membuat multi-level approval
- membuat backend closing logic baru kecuali bug kecil

ACCEPTANCE:
- fiscal closing page terlihat sebagai bagian accounting module
- checklist dan warning jelas
- close/reopen permission-aware
- period lock status terlihat
- docs update

COMMANDS:
- npm run lint
- npm run build

COMMIT MESSAGE:
refine fiscal closing frontend
```
