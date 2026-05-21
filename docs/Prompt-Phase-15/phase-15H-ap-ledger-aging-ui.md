# Prompt 08 — Phase 15H AP Ledger & Aging UI

```text
Kita lanjut Phase 15H — AP Ledger & Aging UI project TenantAppDevelopment.

NAMA SUBPHASE:
Phase 15H — AP Ledger & Aging UI

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
Membuat UI read-only untuk AP Subsidiary Ledger, supplier/vendor statement basic, open bills, aging hutang, dan reconciliation summary sesuai backend Phase 10H.

WAJIB BACA FILE TERBATAS:
- hasil Phase 15A-15G
- frontend/features/purchase/*
- backend/routes/api.php bagian AP ledger/aging/reconciliation
- backend/config/permissions.php
- docs/phase-10-purchase-workflow-and-ap.md section AP subsidiary ledger and aging

JANGAN:
- relisting seluruh repository
- membuat backend module baru kecuali adapter kecil yang benar-benar dibutuhkan dan harus dijelaskan
- membuat Cash Bank UI penuh
- membuat stock movement UI
- membuat export PDF/Excel
- membuat advanced report builder

SCOPE:
1. AP Ledger summary page.
2. Vendor AP ledger detail.
3. Bill AP movement detail jika endpoint tersedia.
4. Open vendor bills table.
5. AP Aging page.
6. Aging buckets display.
7. Filter by vendor/date/as_of_date/status.
8. AP vs GL reconciliation summary jika endpoint tersedia.
9. Drill link ke Vendor Bill/Vendor Payment/Vendor Deposit/Purchase Return detail.
10. Permission-aware read-only access.
11. Update docs Phase 15H.

API ENDPOINT YANG DIPAKAI:
Baca backend/routes/api.php dan ikuti route existing. Kemungkinan:
- GET /api/purchase/ap/ledger
- GET /api/purchase/ap/aging
- GET /api/purchase/ap/reconciliation
- GET /api/purchase/ap/vendors/{vendorId}

PERMISSIONS:
- purchase.ap.view
- purchase.ap.reconcile untuk reconciliation summary/detail jika protected terpisah

UI BUSINESS RULES:
- AP Ledger/Aging read-only.
- Data harus mengikuti backend posted-only rules.
- Void/obsolete tidak boleh ditampilkan sebagai normal balance jika backend mengembalikan flag.
- Reconciliation mismatch harus ditampilkan sebagai warning, bukan diubah di frontend.
- Jangan membuat report export di Phase 15.

ACCEPTANCE CRITERIA:
- User bisa melihat AP Ledger summary.
- User bisa melihat AP Aging.
- Filter vendor/date/as_of_date bekerja sesuai API.
- Drill link ke dokumen purchase bekerja jika data punya id/source.
- Reconciliation warning tampil jika backend return mismatch.

TESTS:
Jika test setup tersedia:
- AP ledger page smoke test
- AP aging page smoke test
- filter state test
- empty state test

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
add ap ledger and aging frontend
```
