# Prompt 05 — Phase 15E Vendor Bill UI

```text
Kita lanjut Phase 15E — Vendor Bill UI project TenantAppDevelopment.

NAMA SUBPHASE:
Phase 15E — Vendor Bill UI

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
Membuat UI Vendor Bill / Purchase Invoice sebagai dokumen accounting utama AP untuk create/edit draft, approve, post, void, dan tampilan vendor deposit allocation.

WAJIB BACA FILE TERBATAS:
- hasil Phase 15A-15D
- frontend/features/purchase/*
- backend/routes/api.php bagian vendor bills, purchase orders, goods receipts, vendor deposits
- backend/config/permissions.php
- docs/phase-10-purchase-workflow-and-ap.md section vendor bill

JANGAN:
- relisting seluruh repository
- membuat backend module baru kecuali adapter kecil yang benar-benar dibutuhkan dan harus dijelaskan
- membuat Vendor Payment full UI di phase ini
- membuat stock movement UI
- membuat inventory valuation UI
- membuat landed cost
- membuat export PDF/Excel

SCOPE:
1. Vendor Bill list page dengan filter status/vendor/date/due_date/overdue.
2. Vendor Bill create direct form.
3. Create from Purchase Order flow jika endpoint tersedia.
4. Create from Goods Receipt flow jika endpoint tersedia.
5. Vendor Bill edit draft form.
6. Vendor Bill detail page.
7. Line editor dengan product/description/qty/unit/unit_price/discount/tax/warehouse/department/project/expense_account jika backend support.
8. Header discount percent/fixed_amount.
9. Totals preview.
10. Due date/payment terms fields jika backend support.
11. Available vendor deposit display.
12. Apply vendor deposit input/allocation jika backend support.
13. Journal preview/basic accounting impact jika endpoint/response tersedia.
14. Status/action buttons: approve, post, void.
15. Source chain display: PO/GR/Direct.
16. Permission-aware action rendering.
17. Update docs Phase 15E.

API ENDPOINT YANG DIPAKAI:
- GET /api/purchase/vendor-bills atau /api/purchase/bills sesuai backend route
- POST /api/purchase/vendor-bills atau /api/purchase/bills
- GET /api/purchase/vendor-bills/{id} atau /api/purchase/bills/{id}
- PATCH /api/purchase/vendor-bills/{id} atau /api/purchase/bills/{id}
- POST/PATCH action from PO/GR jika tersedia
- PATCH /api/purchase/vendor-bills/{id}/approve
- PATCH /api/purchase/vendor-bills/{id}/post
- PATCH /api/purchase/vendor-bills/{id}/void

Catatan:
- Jangan menebak route final jika backend memakai nama /bills. Baca backend/routes/api.php dan ikuti route existing.

PERMISSIONS:
- purchase.bills.view
- purchase.bills.create
- purchase.bills.edit
- purchase.bills.approve
- purchase.bills.post
- purchase.bills.void

UI BUSINESS RULES:
- Vendor Bill boleh edit discount final sebelum posted.
- Posted Vendor Bill read-only kecuali action void jika permission tersedia.
- Vendor Bill tidak menampilkan stock movement/valuation UI.
- Vendor deposit hanya di-apply ke bill sesuai backend, bukan membuat deposit baru dari Vendor Bill.
- Error period lock, account mapping missing, dependency, dan validation harus tampil jelas.

ACCEPTANCE CRITERIA:
- User bisa membuat Vendor Bill direct.
- User bisa membuat Vendor Bill dari PO/GR jika endpoint tersedia.
- User bisa approve/post/void sesuai permission.
- Vendor deposit available/allocation tampil jika backend return data.
- Posted bill read-only.
- Error backend tampil jelas.

TESTS:
Jika test setup tersedia:
- vendor bill list smoke test
- create bill form validation test
- post action permission test
- backend error display test

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
add vendor bill frontend
```
