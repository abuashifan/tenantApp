# Prompt 05 — Phase 14E Proforma & Sales Invoice UI

```text
Kita lanjut Phase 14E — Proforma & Sales Invoice UI project TenantAppDevelopment.

NAMA SUBPHASE:
Phase 14E — Proforma & Sales Invoice UI


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
Membuat UI Proforma Invoice dan Sales Invoice. Proforma bersifat non-accounting document. Sales Invoice adalah accounting document yang bisa post AR/revenue/tax dan apply customer deposit sesuai backend.

WAJIB BACA FILE TERBATAS:
- hasil Phase 14A-14D
- frontend/features/sales/*
- backend/routes/api.php bagian proformas, sales invoices, sales orders, delivery orders
- backend/config/permissions.php
- docs/phase-9-sales-workflow-and-ar.md section proforma dan sales invoice

JANGAN:
- relisting seluruh repository
- membuat backend module baru kecuali adapter kecil yang benar-benar dibutuhkan dan harus dijelaskan
- membuat Purchase/Cash Bank/Inventory UI
- membuat create tenant/company UI publik
- membuat stock movement UI
- membuat inventory valuation UI
- membuat export PDF/Excel

SCOPE:
PROFORMA UI:
1. List Proforma.
2. Create direct.
3. Create from Quotation/Sales Order jika endpoint tersedia.
4. Detail/edit draft.
5. Actions: issue, accept, cancel, convert to Sales Invoice jika tersedia.

SALES INVOICE UI:
1. List Sales Invoice dengan filter status/customer/date/due_date.
2. Create direct.
3. Create from Sales Order.
4. Create from Delivery Order.
5. Create from Proforma.
6. Detail Sales Invoice.
7. Edit draft Sales Invoice.
8. Discount final editable sebelum posted.
9. Customer deposit application section:
   - tampilkan available deposit jika API menyediakan
   - allow input applied amount jika backend support
   - jangan input DP baru di invoice
10. Actions: approve, post, void.
11. Show journal status/reference if backend returns it.
12. Show balance_due, paid_amount, returned_amount jika tersedia.
13. Tidak membuat COGS/stock movement UI.

FRONTEND ROUTES:
- /sales/proformas
- /sales/proformas/new
- /sales/proformas/[id]
- /sales/proformas/[id]/edit
- /sales/invoices
- /sales/invoices/new
- /sales/invoices/from-sales-order/[salesOrderId]
- /sales/invoices/from-delivery-order/[deliveryOrderId]
- /sales/invoices/from-proforma/[proformaId]
- /sales/invoices/[id]
- /sales/invoices/[id]/edit

KOMPONEN / FILE YANG DISARANKAN:
- frontend/features/sales/proformas/ProformaList.tsx
- frontend/features/sales/proformas/ProformaForm.tsx
- frontend/features/sales/proformas/ProformaDetail.tsx
- frontend/features/sales/invoices/SalesInvoiceList.tsx
- frontend/features/sales/invoices/SalesInvoiceForm.tsx
- frontend/features/sales/invoices/SalesInvoiceDetail.tsx
- frontend/features/sales/invoices/CustomerDepositApplySection.tsx
- frontend/features/sales/invoices/SalesInvoiceActions.tsx
- related app route files under frontend/app/sales/proformas and frontend/app/sales/invoices

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
- proforma list smoke test
- invoice list smoke test
- invoice form renders customer deposit apply section
- post action confirmation test
- void action confirmation test
- invoice does not show stock movement/COGS UI

DOKUMENTASI:
Update docs/phase-14-sales-frontend-mvp.md:
- Tambahkan section Phase 14E — Proforma & Sales Invoice UI
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
add proforma and sales invoice UI
```
