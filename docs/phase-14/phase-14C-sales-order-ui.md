# Prompt 03 — Phase 14C Sales Order UI

```text
Kita lanjut Phase 14C — Sales Order UI project TenantAppDevelopment.

NAMA SUBPHASE:
Phase 14C — Sales Order UI


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
Membuat UI Sales Order termasuk create direct, create from quotation, line discounts, has_down_payment, nested customer deposit payload, approve/confirm/cancel/close, dan tracking delivered/invoiced quantity.

WAJIB BACA FILE TERBATAS:
- hasil Phase 14A-14B
- frontend/features/sales/*
- backend/routes/api.php bagian sales orders dan quotations
- backend/config/permissions.php
- docs/phase-9-sales-workflow-and-ar.md section sales order + down payment

JANGAN:
- relisting seluruh repository
- membuat backend module baru kecuali adapter kecil yang benar-benar dibutuhkan dan harus dijelaskan
- membuat Purchase/Cash Bank/Inventory UI
- membuat create tenant/company UI publik
- membuat stock movement UI
- membuat inventory valuation UI
- membuat export PDF/Excel

SCOPE:
1. Sales Order list dengan filter status/customer/date.
2. Sales Order create direct.
3. Create Sales Order from Quotation flow.
4. Sales Order detail page.
5. Edit draft Sales Order.
6. Down payment section:
   - has_down_payment checkbox
   - optional down_payment amount/date/cash_bank_account_id/notes
   - jelaskan di UI bahwa DP disimpan sebagai Customer Deposit.
7. Line item editor dengan discount/tax preview.
8. Show delivered_quantity, invoiced_quantity, returned_quantity jika backend return.
9. Actions: approve, confirm, cancel, close.
10. Convert buttons ke Delivery Order / Sales Invoice jika backend route tersedia.
11. Tidak membuat stock movement UI.

FRONTEND ROUTES:
- /sales/orders
- /sales/orders/new
- /sales/orders/from-quotation/[quotationId]
- /sales/orders/[id]
- /sales/orders/[id]/edit

KOMPONEN / FILE YANG DISARANKAN:
- frontend/app/sales/orders/page.tsx
- frontend/app/sales/orders/new/page.tsx
- frontend/app/sales/orders/from-quotation/[quotationId]/page.tsx
- frontend/app/sales/orders/[id]/page.tsx
- frontend/app/sales/orders/[id]/edit/page.tsx
- frontend/features/sales/orders/SalesOrderList.tsx
- frontend/features/sales/orders/SalesOrderForm.tsx
- frontend/features/sales/orders/SalesOrderDetail.tsx
- frontend/features/sales/orders/DownPaymentSection.tsx
- frontend/features/sales/orders/SalesOrderActions.tsx

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
- create direct order smoke test
- create from quotation route smoke test
- down payment section toggles fields
- action buttons permission-aware
- no stock movement UI text/action exists

DOKUMENTASI:
Update docs/phase-14-sales-frontend-mvp.md:
- Tambahkan section Phase 14C — Sales Order UI
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
add sales order UI with down payment section
```
