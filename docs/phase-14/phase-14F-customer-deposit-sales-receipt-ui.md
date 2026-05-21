# Prompt 06 — Phase 14F Customer Deposit & Sales Receipt UI

```text
Kita lanjut Phase 14F — Customer Deposit & Sales Receipt UI project TenantAppDevelopment.

NAMA SUBPHASE:
Phase 14F — Customer Deposit & Sales Receipt UI


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
Membuat UI Customer Deposit dan Sales Receipt untuk penerimaan pembayaran customer, posting, void, dan tampilan allocation dasar sesuai backend Phase 9.

WAJIB BACA FILE TERBATAS:
- hasil Phase 14A-14E
- frontend/features/sales/*
- backend/routes/api.php bagian customer deposits, sales receipts, sales invoices
- backend/config/permissions.php
- docs/phase-9-sales-workflow-and-ar.md section customer deposit dan sales receipt

JANGAN:
- relisting seluruh repository
- membuat backend module baru kecuali adapter kecil yang benar-benar dibutuhkan dan harus dijelaskan
- membuat Purchase/Cash Bank/Inventory UI
- membuat create tenant/company UI publik
- membuat stock movement UI
- membuat inventory valuation UI
- membuat export PDF/Excel

SCOPE:
CUSTOMER DEPOSIT UI:
1. List Customer Deposit.
2. Create Customer Deposit direct atau dari Sales Order jika endpoint tersedia.
3. Detail Customer Deposit.
4. Actions: post, void, refund jika backend tersedia.
5. Show remaining_amount dan allocations jika backend return.

SALES RECEIPT UI:
1. List Sales Receipt.
2. Create receipt for invoice.
3. Create direct receipt if backend supports.
4. Detail receipt.
5. Payment allocation simple ke invoice jika backend supports.
6. Actions: post, void.
7. Show cash/bank account, amount, applied amount, unapplied amount jika backend return.
8. Jangan membuat advanced payment allocation multi-invoice jika backend belum stabil.
9. Jangan membuat Cash Bank UI umum; itu Phase 16.

FRONTEND ROUTES:
- /sales/deposits
- /sales/deposits/new
- /sales/deposits/[id]
- /sales/receipts
- /sales/receipts/new
- /sales/receipts/from-invoice/[invoiceId]
- /sales/receipts/[id]

KOMPONEN / FILE YANG DISARANKAN:
- frontend/features/sales/deposits/CustomerDepositList.tsx
- frontend/features/sales/deposits/CustomerDepositForm.tsx
- frontend/features/sales/deposits/CustomerDepositDetail.tsx
- frontend/features/sales/receipts/SalesReceiptList.tsx
- frontend/features/sales/receipts/SalesReceiptForm.tsx
- frontend/features/sales/receipts/SalesReceiptDetail.tsx
- frontend/features/sales/receipts/ReceiptAllocationPreview.tsx
- route files under frontend/app/sales/deposits and frontend/app/sales/receipts

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
- deposit list smoke test
- deposit form renders
- receipt form from invoice route renders
- post action confirmation test
- void action permission-aware test
- no Cash Bank general UI rendered

DOKUMENTASI:
Update docs/phase-14-sales-frontend-mvp.md:
- Tambahkan section Phase 14F — Customer Deposit & Sales Receipt UI
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
add customer deposit and sales receipt UI
```
