# Prompt 04 — Phase 13D Journal Entry UI

```text
Kita lanjut Phase 13D project TenantAppDevelopment.

NAMA SUBPHASE:
Phase 13D — Journal Entry UI

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
Membuat UI journal entry untuk draft, edit, approve, post, void, dan revision/history dasar sesuai backend Phase 6.

WAJIB BACA:
- hasil Phase 13A-13C
- frontend/lib/api.ts
- backend/routes/api.php bagian journal
- backend/app/Http/Controllers/Api/Journal/JournalEntryController.php
- backend/app/Http/Requests/Journal/*
- backend/app/Models/Tenant/JournalEntry.php
- backend/app/Models/Tenant/JournalEntryLine.php
- backend/config/permissions.php

SCOPE:
1. Journal list page.
2. Journal detail page.
3. Create journal form.
4. Edit draft journal form.
5. Dynamic journal lines.
6. Debit/credit total validator UI.
7. Account selector.
8. Department/project selector optional.
9. Status badge.
10. Approve/post/void action buttons sesuai permission.
11. Warning period lock jika backend menolak.
12. Error display per line.

FRONTEND ROUTES:
- /accounting/journals
- /accounting/journals/new
- /accounting/journals/[id]
- /accounting/journals/[id]/edit

FORM RULE:
- total debit harus sama dengan total credit sebelum submit/post
- minimum 2 lines
- account wajib di setiap line
- debit/credit salah satu saja per line
- department/project optional
- jika backend menolak karena period lock, tampilkan pesan jelas

JANGAN:
- membuat recurring journal
- membuat import journal
- membuat auto journal dari sales/purchase/cashbank/inventory
- membuat backend posting logic baru

ACCEPTANCE:
- create draft journal bekerja
- edit draft journal bekerja
- approve/post/void action tersedia sesuai permission
- unbalanced journal diberi warning UI
- backend error ditampilkan jelas
- docs update

COMMANDS:
- npm run lint
- npm run build

COMMIT MESSAGE:
add journal entry frontend
```
