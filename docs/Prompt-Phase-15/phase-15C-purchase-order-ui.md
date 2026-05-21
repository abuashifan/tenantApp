# Prompt 03 — Phase 15C Purchase Order UI

```text
Kita lanjut Phase 15C — Purchase Order UI project TenantAppDevelopment.

NAMA SUBPHASE:
Phase 15C — Purchase Order UI

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
Membuat UI Purchase Order untuk list, detail, create/edit, convert dari Purchase Request, approval/confirm/cancel/close, discount, dan vendor deposit entry jika backend Phase 10 mendukung.

WAJIB BACA FILE TERBATAS:
- hasil Phase 15A-15B
- frontend/features/purchase/*
- backend/routes/api.php bagian purchase orders dan vendor deposits
- backend/config/permissions.php
- docs/phase-10-purchase-workflow-and-ap.md section purchase order dan vendor deposit rule

JANGAN:
- relisting seluruh repository
- membuat backend module baru kecuali adapter kecil yang benar-benar dibutuhkan dan harus dijelaskan
- membuat Goods Receipt/Vendor Bill full UI di phase ini
- membuat stock movement UI
- membuat inventory valuation UI
- membuat export PDF/Excel

SCOPE:
1. Purchase Order list page dengan filter status/vendor/date.
2. Purchase Order create form direct.
3. Create from Purchase Request flow jika endpoint tersedia.
4. Purchase Order edit draft form.
5. Purchase Order detail page.
6. Line editor dengan product/description/qty/unit/unit_price/discount/tax/warehouse/department/project/expense_account jika backend support.
7. Header discount percent/fixed_amount.
8. Totals preview: subtotal, line discount, header discount, tax, grand total.
9. Vendor deposit section:
   - has_down_payment checkbox.
   - optional nested vendor_deposit payload.
   - deposit_date, cash_bank_account_id, amount, notes.
10. Status/action buttons: approve, confirm, cancel, close.
11. Source Purchase Request display.
12. Received/billed progress display jika backend return fields.
13. Permission-aware action rendering.
14. Update docs Phase 15C.

API ENDPOINT YANG DIPAKAI:
- GET /api/purchase/orders
- POST /api/purchase/orders
- GET /api/purchase/orders/{id}
- PATCH /api/purchase/orders/{id}
- POST /api/purchase/orders/from-request/{purchaseRequestId}
- PATCH /api/purchase/orders/{id}/approve
- PATCH /api/purchase/orders/{id}/confirm
- PATCH /api/purchase/orders/{id}/cancel
- PATCH /api/purchase/orders/{id}/close

PERMISSIONS:
- purchase.orders.view
- purchase.orders.create
- purchase.orders.edit
- purchase.orders.approve
- purchase.orders.confirm
- purchase.orders.cancel
- purchase.orders.convert
- purchase.deposits.create untuk nested vendor deposit

UI BUSINESS RULES:
- Purchase Order tidak menampilkan stock movement.
- Goods Receipt nanti Phase 15D.
- Vendor Bill nanti Phase 15E.
- Vendor deposit di PO hanya entry/preview sesuai backend, bukan full payment allocation.
- Discount final di Vendor Bill nanti bisa berbeda; tampilkan catatan kecil jika perlu.

ACCEPTANCE CRITERIA:
- User bisa create PO direct.
- User bisa create PO from Purchase Request jika endpoint tersedia.
- Discount line/header tampil dan terkirim benar.
- Vendor deposit nested payload terkirim jika diisi.
- Action approve/confirm/cancel/close berjalan sesuai permission.
- Error backend tampil jelas.

TESTS:
Jika test setup tersedia:
- purchase order list smoke test
- create PO form validation test
- vendor deposit section conditional rendering test
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
add purchase order frontend
```
