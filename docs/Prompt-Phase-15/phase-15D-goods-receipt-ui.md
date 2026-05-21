# Prompt 04 — Phase 15D Goods Receipt UI

```text
Kita lanjut Phase 15D — Goods Receipt UI project TenantAppDevelopment.

NAMA SUBPHASE:
Phase 15D — Goods Receipt UI

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
Membuat UI Goods Receipt sebagai dokumen penerimaan barang. UI ini hanya untuk dokumen receipt dari backend Phase 10, bukan stock movement/stock update UI.

WAJIB BACA FILE TERBATAS:
- hasil Phase 15A-15C
- frontend/features/purchase/*
- backend/routes/api.php bagian goods receipts dan purchase orders
- backend/config/permissions.php
- docs/phase-10-purchase-workflow-and-ap.md section goods receipt

JANGAN:
- relisting seluruh repository
- membuat backend module baru kecuali adapter kecil yang benar-benar dibutuhkan dan harus dijelaskan
- membuat Vendor Bill full UI di phase ini
- membuat stock movement UI
- membuat inventory stock card/valuation UI
- membuat export PDF/Excel

SCOPE:
1. Goods Receipt list page dengan filter status/vendor/date/warehouse.
2. Goods Receipt create direct form jika backend support.
3. Create from Purchase Order flow.
4. Goods Receipt edit draft form.
5. Goods Receipt detail page.
6. Line editor untuk product/description/qty/unit/warehouse.
7. Remaining PO quantity display jika create from PO.
8. Warning jika qty input melebihi remaining, sebelum submit.
9. Status/action buttons: receive, cancel, void.
10. Source Purchase Order display.
11. Billed progress display jika backend return fields.
12. Permission-aware action rendering.
13. Update docs Phase 15D.

API ENDPOINT YANG DIPAKAI:
- GET /api/purchase/goods-receipts
- POST /api/purchase/goods-receipts
- GET /api/purchase/goods-receipts/{id}
- PATCH /api/purchase/goods-receipts/{id}
- POST /api/purchase/goods-receipts/from-purchase-order/{purchaseOrderId}
- PATCH /api/purchase/goods-receipts/{id}/receive
- PATCH /api/purchase/goods-receipts/{id}/cancel
- PATCH /api/purchase/goods-receipts/{id}/void

PERMISSIONS:
- purchase.goods_receipts.view
- purchase.goods_receipts.create
- purchase.goods_receipts.edit
- purchase.goods_receipts.receive
- purchase.goods_receipts.cancel
- purchase.goods_receipts.void

UI BUSINESS RULES:
- Goods Receipt Phase 15 tidak menampilkan stock movement.
- Jangan tampilkan saldo stok sebagai sumber kebenaran jika backend inventory belum memberi endpoint khusus.
- Tampilkan catatan bahwa receipt document tidak otomatis berarti stock movement UI di Phase 15.
- Jika backend menolak over receipt, tampilkan pesan error dengan jelas.

ACCEPTANCE CRITERIA:
- User bisa melihat list Goods Receipt.
- User bisa create direct atau from PO jika endpoint tersedia.
- User bisa receive/cancel/void sesuai permission.
- Over quantity warning muncul saat data source cukup.
- Tidak ada stock movement UI.

TESTS:
Jika test setup tersedia:
- goods receipt list smoke test
- create from PO page smoke test
- receive action permission test

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
add goods receipt frontend
```
