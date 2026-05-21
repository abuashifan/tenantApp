# Prompt 00 — Phase 13 Global Rules

```text
Kita masuk Phase 13 project TenantAppDevelopment.

NAMA PHASE:
Phase 13 — Accounting Frontend MVP

WAJIB SIMPAN KE PROJECT MEMORY / DOCS:
Sebelum coding, baca dan update dokumen roadmap/project memory yang relevan:
- docs/Roadmap_Revisi_System_Policy_Accounting_Foundation.md
- docs/phase-13-accounting-frontend-mvp.md jika sudah ada
- .copilot/project-context.md jika ada
- project-plan.md jika ada
- update-roadmap.md jika ada

Tambahkan catatan:
- Phase 12 Inventory Backend sudah selesai.
- Phase 13 dimulai sebagai Accounting Frontend MVP.
- Phase 13 tidak membuat Sales/Purchase/Cash Bank/Inventory UI.
- Sales Frontend masuk Phase 14.
- Purchase Frontend masuk Phase 15.
- Cash Bank Frontend masuk Phase 16.
- Inventory Frontend masuk Phase 17.

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


SUBPHASE PHASE 13:
- Phase 13A — Accounting Frontend Foundation
- Phase 13B — Chart of Accounts UI
- Phase 13C — Master Data Accounting UI
- Phase 13D — Journal Entry UI
- Phase 13E — Ledger & Trial Balance UI
- Phase 13F — Financial Statements UI
- Phase 13G — Fiscal Closing UI Refinement
- Phase 13H — Accounting Frontend Tests & Documentation

ACCEPTANCE GLOBAL:
Phase 13 selesai jika frontend MVP support:
- menu accounting
- permission-aware navigation
- COA UI
- master data accounting UI
- journal entry UI
- ledger & trial balance UI
- financial statement UI
- fiscal closing UI refinement
- loading/error/empty states
- smoke tests dan dokumentasi

Jangan coding fitur subphase sekarang kecuali prompt ini digabung dengan instruksi subphase.
Tugas prompt ini hanya menyimpan global rules Phase 13 dan update docs/project memory.
```
