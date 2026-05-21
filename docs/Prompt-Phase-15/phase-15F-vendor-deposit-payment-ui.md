# Prompt 06 — Phase 15F Vendor Deposit & Vendor Payment UI

```text
Kita lanjut Phase 15F — Vendor Deposit & Vendor Payment UI project TenantAppDevelopment.

NAMA SUBPHASE:
Phase 15F — Vendor Deposit & Vendor Payment UI

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
Membuat UI Vendor Deposit dan Vendor Payment untuk pembayaran vendor, posting, void, dan tampilan allocation dasar sesuai backend Phase 10.

WAJIB BACA FILE TERBATAS:
- hasil Phase 15A-15E
- frontend/features/purchase/*
- backend/routes/api.php bagian vendor deposits, vendor payments, vendor bills
- backend/config/permissions.php
- docs/phase-10-purchase-workflow-and-ap.md section vendor deposit dan vendor payment

JANGAN:
- relisting seluruh repository
- membuat backend module baru kecuali adapter kecil yang benar-benar dibutuhkan dan harus dijelaskan
- membuat Cash Bank UI penuh
- membuat bank reconciliation UI
- membuat stock movement UI
- membuat advanced payment allocation
- membuat export PDF/Excel

SCOPE:
VENDOR DEPOSIT UI:
1. List Vendor Deposit.
2. Create Vendor Deposit direct atau dari Purchase Order jika endpoint tersedia.
3. Vendor Deposit detail page.
4. Post Vendor Deposit.
5. Void Vendor Deposit.
6. Remaining amount display.
7. Source Purchase Order display.
8. Allocation history display jika backend return data.

VENDOR PAYMENT UI:
1. List Vendor Payment.
2. Create Vendor Payment untuk Vendor Bill.
3. Vendor Payment detail page.
4. Open vendor bills selector.
5. Payment amount input.
6. Cash/bank account selector basic.
7. Post Vendor Payment.
8. Void Vendor Payment.
9. Paid/remaining amount display.
10. Basic allocation display jika backend support.

API ENDPOINT YANG DIPAKAI:
Baca backend/routes/api.php dan ikuti route existing. Kemungkinan:
- GET /api/purchase/vendor-deposits
- POST /api/purchase/vendor-deposits
- GET /api/purchase/vendor-deposits/{id}
- PATCH /api/purchase/vendor-deposits/{id}/post
- PATCH /api/purchase/vendor-deposits/{id}/void
- GET /api/purchase/vendor-payments
- POST /api/purchase/vendor-payments
- GET /api/purchase/vendor-payments/{id}
- PATCH /api/purchase/vendor-payments/{id}/post
- PATCH /api/purchase/vendor-payments/{id}/void

PERMISSIONS:
- purchase.deposits.view
- purchase.deposits.create
- purchase.deposits.post
- purchase.deposits.void
- purchase.deposits.refund jika ada
- purchase.payments.view
- purchase.payments.create
- purchase.payments.post
- purchase.payments.void

UI BUSINESS RULES:
- Vendor Deposit adalah advance payment asset, bukan AP settlement langsung sampai dialokasikan.
- Vendor Payment mengurangi AP terhadap Vendor Bill.
- Cash Bank full module tetap Phase 16; di Phase 15 cukup selector akun cash/bank jika backend butuh.
- Jangan membuat advanced payment allocation many-to-many jika backend belum mendukung.
- Error account mapping/cash bank account/period lock harus tampil jelas.

ACCEPTANCE CRITERIA:
- User bisa melihat dan membuat Vendor Deposit.
- User bisa post/void Vendor Deposit sesuai permission.
- User bisa melihat dan membuat Vendor Payment.
- User bisa post/void Vendor Payment sesuai permission.
- Remaining/paid amount tampil jika backend return data.
- Error backend tampil jelas.

TESTS:
Jika test setup tersedia:
- vendor deposit list smoke test
- vendor payment create form smoke test
- permission-aware action test

COMMANDS:
Jalankan jika environment memungkinkan:
- npm run lint
- npm run test jika tersedia

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
add vendor deposit and payment frontend
```
