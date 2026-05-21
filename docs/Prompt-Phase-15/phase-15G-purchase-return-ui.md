# Prompt 07 — Phase 15G Purchase Return UI

```text
Kita lanjut Phase 15G — Purchase Return UI project TenantAppDevelopment.

NAMA SUBPHASE:
Phase 15G — Purchase Return UI

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
Membuat UI Purchase Return untuk retur pembelian dari Vendor Bill/Goods Receipt/Purchase Order jika backend mendukung, approval/post/void, dan tampilan impact AP tanpa stock movement UI.

WAJIB BACA FILE TERBATAS:
- hasil Phase 15A-15F
- frontend/features/purchase/*
- backend/routes/api.php bagian purchase returns, vendor bills, goods receipts, purchase orders
- backend/config/permissions.php
- docs/phase-10-purchase-workflow-and-ap.md section purchase return

JANGAN:
- relisting seluruh repository
- membuat backend module baru kecuali adapter kecil yang benar-benar dibutuhkan dan harus dijelaskan
- membuat stock movement UI
- membuat inventory valuation UI
- membuat landed cost
- membuat export PDF/Excel

SCOPE:
1. Purchase Return list dengan filter status/vendor/date.
2. Create Purchase Return direct jika backend support.
3. Create from Vendor Bill.
4. Create from Goods Receipt/Purchase Order jika endpoint tersedia.
5. Purchase Return detail page.
6. Line item table dengan returned qty/amount.
7. Reason field.
8. Impact summary ke AP jika backend return data.
9. Action buttons: approve, post, void/cancel sesuai backend.
10. Source document chain display.
11. Permission-aware action rendering.
12. Update docs Phase 15G.

API ENDPOINT YANG DIPAKAI:
Baca backend/routes/api.php dan ikuti route existing. Kemungkinan:
- GET /api/purchase/returns
- POST /api/purchase/returns
- GET /api/purchase/returns/{id}
- PATCH /api/purchase/returns/{id}
- POST /api/purchase/returns/from-vendor-bill/{vendorBillId}
- POST /api/purchase/returns/from-goods-receipt/{goodsReceiptId}
- PATCH /api/purchase/returns/{id}/approve
- PATCH /api/purchase/returns/{id}/post
- PATCH /api/purchase/returns/{id}/void

PERMISSIONS:
- purchase.returns.view
- purchase.returns.create
- purchase.returns.approve
- purchase.returns.post
- purchase.returns.void

UI BUSINESS RULES:
- Purchase Return UI Phase 15 tidak membuat stock return UI/stock movement UI.
- Jika backend Phase 10 belum mengubah stok, UI jangan menampilkan klaim stock sudah bertambah/berkurang.
- Return posted harus read-only kecuali void jika permission tersedia.
- Error dependency/period lock/permission harus tampil jelas.

ACCEPTANCE CRITERIA:
- User bisa melihat list Purchase Return.
- User bisa membuat return dari source yang didukung backend.
- User bisa approve/post/void sesuai permission.
- Source chain dan AP impact tampil jika backend return data.
- Tidak ada stock movement UI.

TESTS:
Jika test setup tersedia:
- purchase return list smoke test
- create return from bill smoke test
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
add purchase return frontend
```
