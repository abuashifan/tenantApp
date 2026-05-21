# Prompt 01 — Phase 15A Purchase Frontend Foundation

```text
Kita lanjut Phase 15A — Purchase Frontend Foundation project TenantAppDevelopment.

NAMA SUBPHASE:
Phase 15A — Purchase Frontend Foundation

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
Menyiapkan fondasi UI purchase agar subphase 15B-15I konsisten, reusable, permission-aware, dan tenant-aware.

WAJIB BACA FILE TERBATAS:
- frontend/lib/api.ts
- frontend/types/api.ts
- frontend/components/layout/AppShell.tsx
- frontend/app/dashboard/page.tsx
- frontend/package.json
- hasil Phase 13 folder/components reusable
- hasil Phase 14 folder/components reusable untuk transactional workflow
- backend/routes/api.php bagian /api/purchase
- backend/config/permissions.php
- docs/phase-10-purchase-workflow-and-ap.md
- docs/phase-14-sales-frontend-mvp.md jika ada

JANGAN:
- relisting seluruh repository
- membuat backend module baru kecuali adapter kecil yang benar-benar dibutuhkan dan harus dijelaskan
- membuat Sales/Cash Bank/Inventory UI baru
- membuat create tenant/company UI publik
- membuat stock movement UI
- membuat inventory valuation UI
- membuat export PDF/Excel

SCOPE:
1. Tambahkan menu Purchase di AppShell/sidebar sesuai permission.
2. Tambahkan route structure frontend purchase.
3. Buat folder feature purchase.
4. Buat purchase API client/helper jika pattern project memakai feature client.
5. Buat types purchase umum.
6. Buat reusable purchase status badge.
7. Buat reusable purchase document table.
8. Buat reusable purchase line editor/table.
9. Buat reusable vendor selector wrapper jika belum ada.
10. Buat reusable product/unit/warehouse selector integration memakai existing master data API.
11. Buat reusable document action bar permission-aware.
12. Buat reusable source document display.
13. Buat reusable totals summary card.
14. Buat loading/error/empty states konsisten.
15. Buat docs/phase-15-purchase-frontend-mvp.md.

ROUTE STRUCTURE REKOMENDASI:
- /purchase
- /purchase/requests
- /purchase/requests/new
- /purchase/requests/[id]
- /purchase/requests/[id]/edit
- /purchase/orders
- /purchase/orders/new
- /purchase/orders/[id]
- /purchase/orders/[id]/edit
- /purchase/goods-receipts
- /purchase/goods-receipts/new
- /purchase/goods-receipts/[id]
- /purchase/goods-receipts/[id]/edit
- /purchase/vendor-bills
- /purchase/vendor-bills/new
- /purchase/vendor-bills/[id]
- /purchase/vendor-bills/[id]/edit
- /purchase/vendor-deposits
- /purchase/vendor-payments
- /purchase/returns
- /purchase/ap-ledger
- /purchase/ap-aging

TYPES MINIMAL:
- PurchaseDocumentStatus
- PurchaseRequest
- PurchaseRequestLine
- PurchaseOrder
- PurchaseOrderLine
- GoodsReceipt
- GoodsReceiptLine
- VendorBill
- VendorBillLine
- VendorDeposit
- VendorPayment
- PurchaseReturn
- ApLedgerEntry
- ApAgingBucket
- PurchaseDocumentTotals
- PurchaseApiListResponse jika pattern membutuhkan

PERMISSION MENU:
Menu/route harus cek permission minimal:
- purchase.requests.view
- purchase.orders.view
- purchase.goods_receipts.view
- purchase.bills.view
- purchase.payments.view
- purchase.deposits.view
- purchase.returns.view
- purchase.ap.view

DOCUMENT STATUS BADGE:
Support status umum:
- draft
- submitted
- approved
- confirmed
- partially_received
- received
- partially_billed
- billed
- posted
- partially_paid
- paid
- overdue
- cancelled
- void
- rejected

ACCEPTANCE CRITERIA:
- Purchase menu muncul hanya jika user punya permission purchase terkait.
- Route foundation ada dan tidak broken.
- Reusable purchase components tersedia.
- API helper/type purchase tersedia.
- Loading/error/empty state konsisten.
- Dokumentasi Phase 15 dibuat.

TESTS:
Jika project punya frontend test setup, buat smoke test untuk purchase route/menu foundation.

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
add purchase frontend foundation
```
