# Prompt 01 — Phase 14A Sales Frontend Foundation

```text
Kita lanjut Phase 14A — Sales Frontend Foundation project TenantAppDevelopment.

NAMA SUBPHASE:
Phase 14A — Sales Frontend Foundation


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
Menyiapkan fondasi UI sales agar subphase 14B-14I konsisten, reusable, permission-aware, dan tenant-aware.

WAJIB BACA FILE TERBATAS:
- frontend/lib/api.ts
- frontend/types/api.ts
- frontend/components/layout/AppShell.tsx
- frontend/app/dashboard/page.tsx
- frontend/package.json
- hasil Phase 13 folder/components reusable
- backend/routes/api.php bagian /api/sales
- backend/config/permissions.php
- docs/phase-9-sales-workflow-and-ar.md
- docs/phase-13-accounting-frontend-mvp.md jika ada

JANGAN:
- relisting seluruh repository
- membuat backend module baru kecuali adapter kecil yang benar-benar dibutuhkan dan harus dijelaskan
- membuat Purchase/Cash Bank/Inventory UI
- membuat create tenant/company UI publik
- membuat stock movement UI
- membuat inventory valuation UI
- membuat export PDF/Excel

SCOPE:
1. Buat struktur folder frontend sales.
2. Tambahkan Sales menu/group di AppShell.
3. Buat sales route index/landing page.
4. Buat permission-aware sales navigation.
5. Buat reusable sales API client wrapper.
6. Buat reusable sales document status badge.
7. Buat reusable source chain display.
8. Buat reusable sales total summary card.
9. Buat reusable line item table/form pattern.
10. Buat reusable customer selector, product selector, unit selector, warehouse selector, department/project selector jika belum ada.
11. Buat reusable action bar untuk draft/approve/post/void/cancel/convert.
12. Buat loading/error/empty states jika belum ada dari Phase 13.
13. Buat docs phase 14 foundation.

FRONTEND ROUTES:
- /sales
- /sales/quotations
- /sales/orders
- /sales/delivery-orders
- /sales/proformas
- /sales/invoices
- /sales/deposits
- /sales/receipts
- /sales/returns
- /sales/ar-ledger
- /sales/ar-aging

KOMPONEN / FILE YANG DISARANKAN:
- frontend/features/sales/api/salesApi.ts
- frontend/features/sales/types.ts
- frontend/features/sales/components/SalesStatusBadge.tsx
- frontend/features/sales/components/SalesSourceChain.tsx
- frontend/features/sales/components/SalesTotalsCard.tsx
- frontend/features/sales/components/SalesLineItemsTable.tsx
- frontend/features/sales/components/SalesActionBar.tsx
- frontend/features/sales/components/SalesFilters.tsx
- frontend/app/sales/page.tsx
- update frontend/components/layout/AppShell.tsx

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
Buat minimal smoke test jika test framework tersedia:
- Sales navigation renders
- Sales dashboard/landing renders
- Permission-aware menu hides unavailable actions
- SalesStatusBadge renders known statuses
- SalesTotalsCard renders totals

DOKUMENTASI:
Update docs/phase-14-sales-frontend-mvp.md:
- Tambahkan section Phase 14A — Sales Frontend Foundation
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
add sales frontend foundation
```
