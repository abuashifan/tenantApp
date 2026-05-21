# Prompt 09 — Phase 14I Sales Frontend Tests & Documentation

```text
Kita lanjut Phase 14I — Sales Frontend Tests & Documentation project TenantAppDevelopment.

NAMA SUBPHASE:
Phase 14I — Sales Frontend Tests & Documentation


KONTEKS PROJECT:
Project TenantAppDevelopment adalah aplikasi akuntansi multi-tenant:
- Backend: Laravel API
- Frontend: Next.js + TailwindCSS
- Database MVP/development: SQLite
- 1 company = 1 tenant database
- Request tenant memakai Bearer token + X-Company-ID
- Frontend sudah punya auth, company selection, AppShell, api client, dan Accounting Frontend MVP dari Phase 13.
- Backend Sales & Accounts Receivable sudah selesai di Phase 9.
- Backend Purchase/Cash Bank/Inventory diasumsikan sudah selesai sampai Phase 12 sesuai roadmap.

ATURAN GLOBAL PHASE 14:
- Phase 14 adalah Sales Frontend MVP.
- Fokus frontend sales, bukan backend business logic baru.
- Jangan membuat endpoint backend besar kecuali adapter kecil yang benar-benar dibutuhkan UI dan wajib dijelaskan.
- Jangan membuat Purchase/Cash Bank/Inventory UI; itu Phase 15-17.
- Jangan membuat create tenant/company UI publik.
- Semua request tenant-aware memakai active_company_id / X-Company-ID.
- Semua halaman harus permission-aware.
- Semua mutation harus menampilkan error backend apa adanya dengan pesan UI yang jelas.
- Gunakan existing AppShell, api client, auth guard, company selector, TailwindCSS pattern, dan reusable UI dari Phase 13.
- Jangan menambah state management library baru kecuali sudah ada di project.
- UI MVP harus functional, rapi, dan aman, bukan dashboard kompleks.
- Jangan mengubah arsitektur tenant.
- Jangan membuat stock movement UI di Phase 14.
- Jangan membuat inventory valuation UI di Phase 14.
- Jangan membuat PDF/email invoice, advanced tax, advanced payment allocation, promo/tiered discount, atau multi-currency penuh.

TUJUAN:
Merapikan integrasi akhir Phase 14, menambah smoke tests, memastikan permission-aware behavior, memastikan API error handling konsisten, dan menyelesaikan dokumentasi final Sales Frontend MVP.

WAJIB BACA FILE TERBATAS:
- seluruh hasil Phase 14A-14H
- frontend/package.json
- frontend/lib/api.ts
- frontend/features/sales/*
- frontend/app/sales/**/*
- backend/routes/api.php bagian /api/sales
- backend/config/permissions.php
- docs/phase-14-sales-frontend-mvp.md
- update-roadmap.md atau roadmap docs terkait

JANGAN:
- relisting seluruh repository
- membuat backend module baru kecuali adapter kecil yang benar-benar dibutuhkan dan harus dijelaskan
- membuat Purchase/Cash Bank/Inventory UI
- membuat create tenant/company UI publik
- membuat stock movement UI
- membuat inventory valuation UI
- membuat export PDF/Excel

SCOPE:
1. Review semua route /sales.
2. Pastikan semua page protected by auth dan active company.
3. Pastikan semua request memakai X-Company-ID via api client.
4. Pastikan semua action button permission-aware.
5. Pastikan loading/error/empty state tersedia.
6. Pastikan validation error backend tampil di form.
7. Pastikan status badge konsisten.
8. Pastikan source chain display konsisten.
9. Tambah smoke tests untuk halaman utama.
10. Tambah test API error handling jika framework tersedia.
11. Tambah manual responsive checklist.
12. Finalisasi docs/phase-14-sales-frontend-mvp.md.
13. Update roadmap status: Phase 14 selesai, Phase 15 berikutnya Purchase Frontend MVP.
14. Jangan mengubah backend kecuali bug kecil UI contract dan harus dijelaskan.

FRONTEND ROUTES:
Review semua route:
- /sales
- /sales/quotations
- /sales/orders
- /sales/delivery-orders
- /sales/proformas
- /sales/invoices
- /sales/deposits
- /sales/receipts
- /sales/returns
- /sales/ar-ledger
- /sales/ar-aging
- /sales/ar-reconciliation

KOMPONEN / FILE YANG DISARANKAN:
- frontend/features/sales/__tests__ jika test pattern ada
- frontend/app/sales terkait jika butuh minor cleanup
- docs/phase-14-sales-frontend-mvp.md
- update-roadmap.md atau roadmap docs jika ada
- .copilot/project-context.md jika ada
- project-plan.md jika ada

UI/UX RULES:
- Gunakan AppShell existing.
- Gunakan pattern TailwindCSS existing.
- Semua halaman wajib loading state, error state, empty state.
- Semua action mutation wajib confirmation untuk aksi berisiko seperti approve/post/void/cancel.
- Semua tombol action wajib permission-aware.
- Semua form wajib menampilkan validation error dari backend.
- Semua list wajib punya filter/search minimal sesuai kebutuhan.
- Semua detail dokumen wajib menampilkan status badge, nomor dokumen, tanggal, customer, total, source chain, dan audit/action timestamp jika tersedia.
- Jangan membuat desain yang terlalu kompleks; MVP functional lebih penting.

TESTS:
TEST MINIMAL:
- sales landing page smoke test
- quotations page smoke test
- orders page smoke test
- delivery orders page smoke test
- proformas page smoke test
- invoices page smoke test
- deposits page smoke test
- receipts page smoke test
- returns page smoke test
- AR ledger page smoke test
- AR aging page smoke test
- permission-aware action rendering test
- API error handling test
- loading state test
- empty state test
- active company guard test jika pattern tersedia

DOKUMENTASI:
Update docs/phase-14-sales-frontend-mvp.md:
- Tambahkan section Phase 14I — Sales Frontend Tests & Documentation
- Tulis route/page yang dibuat
- Tulis component utama
- Tulis API endpoint yang dipakai
- Tulis permission yang dipakai
- Tulis batasan scope
Dokumentasi final wajib berisi:
- Overview Phase 14
- Route list
- Component list
- API endpoint usage
- Permission list
- Sales workflow UI
- Known limitations
- Manual testing checklist
- Next phase: Phase 15 Purchase Frontend MVP

COMMANDS:
Jalankan jika environment memungkinkan:
- npm run lint
- npm run build
- npm test jika tersedia

FINAL SUMMARY:
Sertakan:
- file dibuat
- file diubah
- routes/pages dibuat
- components dibuat
- tests dibuat
- command berhasil/gagal
- catatan scope yang sengaja tidak dikerjakan

COMMIT MESSAGE:
complete sales frontend MVP
```
