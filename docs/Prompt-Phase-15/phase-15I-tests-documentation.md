# Prompt 09 — Phase 15I Purchase Frontend Tests & Documentation

```text
Kita lanjut Phase 15I — Purchase Frontend Tests & Documentation project TenantAppDevelopment.

NAMA SUBPHASE:
Phase 15I — Purchase Frontend Tests & Documentation

KONTEKS PROJECT:
Project TenantAppDevelopment adalah aplikasi akuntansi multi-tenant:
- Backend: Laravel API
- Frontend: Next.js + TailwindCSS
- Database MVP/development: SQLite
- 1 company = 1 tenant database
- Request tenant memakai Bearer token + X-Company-ID
- Frontend sudah punya auth, company selection, AppShell, api client, Accounting Frontend MVP dari Phase 13, dan Sales Frontend MVP dari Phase 14.
- Backend Purchase & Accounts Payable sudah selesai di Phase 10.
- Backend Cash Bank dan Inventory diasumsikan sudah selesai sampai Phase 12 sesuai roadmap.

ATURAN GLOBAL PHASE 15:
- Phase 15 adalah Purchase Frontend MVP.
- Fokus frontend purchase/AP, bukan backend business logic baru.
- Jangan membuat endpoint backend besar kecuali adapter kecil yang benar-benar dibutuhkan UI dan wajib dijelaskan.
- Jangan membuat Cash Bank/Inventory UI; itu Phase 16-17.
- Jangan membuat Sales UI baru; Sales Frontend sudah Phase 14.
- Jangan membuat create tenant/company UI publik.
- Semua request tenant-aware memakai active_company_id / X-Company-ID.
- Semua halaman harus permission-aware.
- Semua mutation harus menampilkan error backend apa adanya dengan pesan UI yang jelas.
- Gunakan existing AppShell, api client, auth guard, company selector, TailwindCSS pattern, reusable UI dari Phase 13, dan pattern document workflow dari Phase 14.
- Jangan menambah state management library baru kecuali sudah ada di project.
- UI MVP harus functional, rapi, dan aman, bukan dashboard kompleks.
- Jangan mengubah arsitektur tenant.
- Jangan membuat stock movement UI di Phase 15.
- Jangan membuat inventory valuation UI di Phase 15.
- Jangan membuat PDF/email vendor bill, advanced tax, landed cost, advanced payment allocation, atau multi-currency penuh.
- Goods Receipt UI di Phase 15 hanya menampilkan dokumen penerimaan barang dari backend Phase 10; stock movement tetap area Phase 17.

TUJUAN:
Merapikan integrasi akhir Phase 15, menambah smoke tests, memastikan permission-aware behavior, memastikan API error handling konsisten, dan menyelesaikan dokumentasi final Purchase Frontend MVP.

WAJIB BACA FILE TERBATAS:
- seluruh hasil Phase 15A-15H
- frontend/package.json
- frontend/lib/api.ts
- frontend/features/purchase/*
- frontend/app/purchase/**/*
- backend/routes/api.php bagian /api/purchase
- backend/config/permissions.php
- docs/phase-15-purchase-frontend-mvp.md
- update-roadmap.md atau roadmap docs terkait

JANGAN:
- relisting seluruh repository
- membuat backend module baru kecuali adapter kecil yang benar-benar dibutuhkan dan harus dijelaskan
- membuat Sales/Cash Bank/Inventory UI baru
- membuat create tenant/company UI publik
- membuat stock movement UI
- membuat inventory valuation UI
- membuat export PDF/Excel

SCOPE:
1. Review semua purchase routes agar tidak broken.
2. Review menu Purchase permission-aware.
3. Review semua list/detail/create/edit pages.
4. Pastikan semua mutation menampilkan loading state.
5. Pastikan semua mutation menampilkan error backend.
6. Pastikan empty state jelas.
7. Pastikan source document links bekerja.
8. Pastikan status badges konsisten.
9. Pastikan posted/void/cancelled document read-only sesuai rule.
10. Tambahkan smoke tests sesuai test stack project.
11. Tambahkan dokumentasi final Phase 15.
12. Update roadmap status jika diminta oleh project convention.

TEST MINIMAL:
Jika test stack tersedia, buat:
- purchase menu smoke test
- purchase request page smoke test
- purchase order page smoke test
- goods receipt page smoke test
- vendor bill page smoke test
- vendor deposit/payment page smoke test
- purchase return page smoke test
- AP ledger page smoke test
- AP aging page smoke test
- permission-aware action rendering test
- API error handling test
- loading state test
- empty state test

MANUAL CHECKLIST:
Tambahkan ke docs:
- login sebagai user dengan purchase permission
- pilih company aktif
- buka Purchase menu
- create Purchase Request
- convert/create Purchase Order
- create Goods Receipt
- create Vendor Bill
- post Vendor Bill jika backend/test data memungkinkan
- create Vendor Payment
- create Purchase Return
- cek AP Aging
- cek AP Ledger
- test user tanpa permission tidak melihat action
- test tanpa active company redirect/error sesuai pattern

DOKUMENTASI FINAL:
Update/buat docs/phase-15-purchase-frontend-mvp.md dengan:
- tujuan Phase 15
- route frontend
- komponen reusable
- API endpoints yang dipakai
- permission map
- UI flow
- limitation
- testing checklist
- future improvements Phase 16/17/19

BATASAN YANG HARUS TERTULIS DI DOCS:
- Phase 15 tidak membuat stock movement UI.
- Phase 15 tidak membuat inventory valuation UI.
- Phase 15 tidak membuat Cash Bank full UI.
- Phase 15 tidak membuat export PDF/Excel.
- Phase 15 tidak membuat backend purchase logic baru.
- Phase 15 memakai backend Purchase/AP Phase 10.

COMMANDS:
Jalankan jika environment memungkinkan:
- npm run lint
- npm run test jika tersedia
- npm run build jika feasible

FINAL SUMMARY WAJIB:
Sertakan:
- file dibuat
- file diubah
- halaman/route frontend ditambahkan
- komponen dibuat
- API client/types/hooks dibuat
- permission guard yang dipakai
- tests dibuat
- docs dibuat/update
- command berhasil/gagal
- catatan scope yang sengaja tidak dikerjakan

COMMIT MESSAGE:
complete purchase frontend mvp
```
