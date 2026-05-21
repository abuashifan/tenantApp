# Prompt 08 — Phase 14H AR Ledger & Aging UI

```text
Kita lanjut Phase 14H — AR Ledger & Aging UI project TenantAppDevelopment.

NAMA SUBPHASE:
Phase 14H — AR Ledger & Aging UI


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
Membuat UI read-only untuk AR Subsidiary Ledger, customer statement basic, open invoices, aging piutang, dan reconciliation summary sesuai backend Phase 9J.

WAJIB BACA FILE TERBATAS:
- hasil Phase 14A-14G
- frontend/features/sales/*
- backend/routes/api.php bagian AR ledger/aging/reconciliation
- backend/config/permissions.php
- docs/phase-9-sales-workflow-and-ar.md section AR subsidiary ledger and aging

JANGAN:
- relisting seluruh repository
- membuat backend module baru kecuali adapter kecil yang benar-benar dibutuhkan dan harus dijelaskan
- membuat Purchase/Cash Bank/Inventory UI
- membuat create tenant/company UI publik
- membuat stock movement UI
- membuat inventory valuation UI
- membuat export PDF/Excel

SCOPE:
1. AR Ledger summary page.
2. Customer AR ledger detail.
3. Invoice AR movement detail jika endpoint tersedia.
4. Open invoices page/table.
5. AR Aging page dengan bucket umur piutang.
6. AR vs GL reconciliation summary if endpoint tersedia.
7. Filters: customer, date range, due date, status, aging bucket.
8. Search customer/invoice number.
9. Read-only UI; no mutation except navigation to receipt/create if permission exists.
10. Print-friendly basic layout boleh, tapi jangan export PDF/Excel.

FRONTEND ROUTES:
- /sales/ar-ledger
- /sales/ar-ledger/customers/[customerId]
- /sales/ar-ledger/invoices/[invoiceId]
- /sales/open-invoices
- /sales/ar-aging
- /sales/ar-reconciliation

KOMPONEN / FILE YANG DISARANKAN:
- frontend/features/sales/ar/ARLedgerSummary.tsx
- frontend/features/sales/ar/CustomerLedgerTable.tsx
- frontend/features/sales/ar/OpenInvoicesTable.tsx
- frontend/features/sales/ar/ARAgingTable.tsx
- frontend/features/sales/ar/ARReconciliationCard.tsx
- route files under frontend/app/sales/ar-ledger, open-invoices, ar-aging, ar-reconciliation

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
- AR ledger page smoke test
- AR aging page smoke test
- filter state test
- reconciliation card renders balanced/unbalanced state
- no export engine generated

DOKUMENTASI:
Update docs/phase-14-sales-frontend-mvp.md:
- Tambahkan section Phase 14H — AR Ledger & Aging UI
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
add AR ledger and aging UI
```
