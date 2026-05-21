# Prompt 04 — Phase 14D Delivery Order UI

```text
Kita lanjut Phase 14D — Delivery Order UI project TenantAppDevelopment.

NAMA SUBPHASE:
Phase 14D — Delivery Order UI


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
Membuat UI Delivery Order sebagai dokumen pengiriman: create direct, create from Sales Order, partial delivery, ship/deliver/cancel/void actions, tanpa stock movement UI.

WAJIB BACA FILE TERBATAS:
- hasil Phase 14A-14C
- frontend/features/sales/*
- backend/routes/api.php bagian delivery-orders dan sales orders
- backend/config/permissions.php
- docs/phase-9-sales-workflow-and-ar.md section delivery order

JANGAN:
- relisting seluruh repository
- membuat backend module baru kecuali adapter kecil yang benar-benar dibutuhkan dan harus dijelaskan
- membuat Purchase/Cash Bank/Inventory UI
- membuat create tenant/company UI publik
- membuat stock movement UI
- membuat inventory valuation UI
- membuat export PDF/Excel

SCOPE:
1. Delivery Order list dengan filter status/customer/date/warehouse.
2. Create Delivery Order direct.
3. Create Delivery Order from Sales Order flow.
4. Detail Delivery Order.
5. Edit draft Delivery Order.
6. Line quantity validation UI basic agar tidak melebihi remaining jika data tersedia.
7. Show shipped/delivered timestamps.
8. Actions: ready, ship, deliver, cancel, void.
9. Show source Sales Order link if available.
10. Tampilkan note jelas bahwa stok tidak dimutasi dari UI Phase 14; stock movement ada di Phase 17/Inventory UI.

FRONTEND ROUTES:
- /sales/delivery-orders
- /sales/delivery-orders/new
- /sales/delivery-orders/from-sales-order/[salesOrderId]
- /sales/delivery-orders/[id]
- /sales/delivery-orders/[id]/edit

KOMPONEN / FILE YANG DISARANKAN:
- frontend/app/sales/delivery-orders/page.tsx
- frontend/app/sales/delivery-orders/new/page.tsx
- frontend/app/sales/delivery-orders/from-sales-order/[salesOrderId]/page.tsx
- frontend/app/sales/delivery-orders/[id]/page.tsx
- frontend/app/sales/delivery-orders/[id]/edit/page.tsx
- frontend/features/sales/delivery-orders/DeliveryOrderList.tsx
- frontend/features/sales/delivery-orders/DeliveryOrderForm.tsx
- frontend/features/sales/delivery-orders/DeliveryOrderDetail.tsx
- frontend/features/sales/delivery-orders/DeliveryOrderActions.tsx

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
- delivery order list smoke test
- create from sales order route smoke test
- deliver action confirmation test
- permission-aware action test
- no stock movement action rendered

DOKUMENTASI:
Update docs/phase-14-sales-frontend-mvp.md:
- Tambahkan section Phase 14D — Delivery Order UI
- Tulis route/page yang dibuat
- Tulis component utama
- Tulis API endpoint yang dipakai
- Tulis permission yang dipakai
- Tulis batasan scope


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
add delivery order UI
```
