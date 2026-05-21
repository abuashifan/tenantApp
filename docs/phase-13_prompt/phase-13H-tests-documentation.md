# Prompt 08 — Phase 13H Accounting Frontend Tests & Documentation

```text
Kita lanjut Phase 13H project TenantAppDevelopment.

NAMA SUBPHASE:
Phase 13H — Accounting Frontend Tests & Documentation

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
Mengunci kualitas Phase 13 dengan smoke tests, permission tests basic, dan dokumentasi final.

WAJIB BACA:
- hasil Phase 13A-13G
- frontend/package.json
- existing test setup frontend jika ada
- docs/phase-13-accounting-frontend-mvp.md

SCOPE TEST:
Buat/rapikan test sesuai test stack existing. Jika belum ada test framework, buat checklist manual di docs dan jangan menambah framework besar tanpa alasan.

Test minimal:
1. accounting landing page render
2. COA page smoke test
3. master data landing/page smoke test
4. journal list smoke test
5. journal form validation basic
6. general ledger page smoke test
7. trial balance page smoke test
8. financial statements page smoke test
9. fiscal closing page smoke test
10. unauthenticated redirect
11. missing active company redirect
12. permission-aware menu/action visibility
13. API error state renders
14. loading state renders
15. empty state renders

DOKUMENTASI FINAL:
Update:
- docs/phase-13-accounting-frontend-mvp.md

Isi:
- tujuan Phase 13
- halaman yang dibuat
- route frontend
- endpoint backend yang dipakai
- permission mapping
- auth/company guard
- error handling
- known limitations
- manual testing checklist
- future Phase 14-17 boundary

ROADMAP:
Update update-roadmap.md / roadmap docs jika ada:
- Phase 12 = selesai
- Phase 13 = selesai jika semua subphase done
- Next Phase 14 = Sales Frontend MVP

COMMANDS:
- npm run lint
- npm run build
- npm test jika tersedia

ACCEPTANCE:
- docs final lengkap
- tests/checklist tersedia
- no backend business logic change
- no Sales/Purchase/Cash Bank/Inventory UI
- Phase 13 siap ditutup

COMMIT MESSAGE:
finalize accounting frontend mvp
```
