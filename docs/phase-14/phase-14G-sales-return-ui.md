# Prompt 07 — Phase 14G Sales Return UI

```text
Kita lanjut Phase 14G — Sales Return UI project TenantAppDevelopment.

NAMA SUBPHASE:
Phase 14G — Sales Return UI


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
Membuat UI Sales Return untuk return dari invoice/delivery order jika backend mendukung, approval/post/void, dan tampilan impact AR tanpa stock movement UI.

WAJIB BACA FILE TERBATAS:
- hasil Phase 14A-14F
- frontend/features/sales/*
- backend/routes/api.php bagian sales returns, sales invoices, delivery orders
- backend/config/permissions.php
- docs/phase-9-sales-workflow-and-ar.md section sales return

JANGAN:
- relisting seluruh repository
- membuat backend module baru kecuali adapter kecil yang benar-benar dibutuhkan dan harus dijelaskan
- membuat Purchase/Cash Bank/Inventory UI
- membuat create tenant/company UI publik
- membuat stock movement UI
- membuat inventory valuation UI
- membuat export PDF/Excel

SCOPE:
1. Sales Return list dengan filter status/customer/date.
2. Create Sales Return direct jika backend support.
3. Create from Sales Invoice.
4. Create from Delivery Order jika backend support.
5. Detail Sales Return.
6. Edit draft Sales Return.
7. Show returned quantity and amount.
8. Show AR impact / credit note style summary if backend returns it.
9. Actions: approve, post, void.
10. Prevent UI return quantity exceeding source quantity if data available.
11. Jangan membuat stock return/stock movement UI di Phase 14.

FRONTEND ROUTES:
- /sales/returns
- /sales/returns/new
- /sales/returns/from-invoice/[invoiceId]
- /sales/returns/from-delivery-order/[deliveryOrderId]
- /sales/returns/[id]
- /sales/returns/[id]/edit

KOMPONEN / FILE YANG DISARANKAN:
- frontend/features/sales/returns/SalesReturnList.tsx
- frontend/features/sales/returns/SalesReturnForm.tsx
- frontend/features/sales/returns/SalesReturnDetail.tsx
- frontend/features/sales/returns/SalesReturnActions.tsx
- route files under frontend/app/sales/returns

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
- sales return list smoke test
- create from invoice route smoke test
- post action confirmation test
- permission-aware action test
- no stock return movement UI rendered

DOKUMENTASI:
Update docs/phase-14-sales-frontend-mvp.md:
- Tambahkan section Phase 14G — Sales Return UI
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
add sales return UI
```
