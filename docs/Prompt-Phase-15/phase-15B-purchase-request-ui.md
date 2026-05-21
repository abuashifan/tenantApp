# Prompt 02 — Phase 15B Purchase Request UI

```text
Kita lanjut Phase 15B — Purchase Request UI project TenantAppDevelopment.

NAMA SUBPHASE:
Phase 15B — Purchase Request UI

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
Membuat UI Purchase Request untuk list, detail, create/edit draft, submit, approve, reject, cancel, dan convert ke Purchase Order jika backend endpoint tersedia.

WAJIB BACA FILE TERBATAS:
- hasil Phase 15A
- frontend/features/purchase/*
- backend/routes/api.php bagian purchase requests
- backend/config/permissions.php
- docs/phase-10-purchase-workflow-and-ap.md section purchase request

JANGAN:
- relisting seluruh repository
- membuat backend module baru kecuali adapter kecil yang benar-benar dibutuhkan dan harus dijelaskan
- membuat Purchase Order full UI di phase ini
- membuat Goods Receipt/Vendor Bill/Vendor Payment UI
- membuat stock movement UI
- membuat export PDF/Excel

SCOPE:
1. Purchase Request list page dengan filter status, date range, requester/department/project jika tersedia.
2. Purchase Request create form.
3. Purchase Request edit form hanya untuk status yang masih bisa diedit.
4. Purchase Request detail page.
5. Line item editor untuk product/description/qty/unit/estimated price.
6. Department/project selector optional jika backend mendukung.
7. Estimated total preview.
8. Action buttons: submit, approve, reject, cancel, convert to PO jika endpoint tersedia.
9. Status badge.
10. Source/revision info jika tersedia.
11. Backend validation error display.
12. Permission-aware action rendering.
13. Update docs Phase 15B.

API ENDPOINT YANG DIPAKAI:
- GET /api/purchase/requests
- POST /api/purchase/requests
- GET /api/purchase/requests/{id}
- PATCH /api/purchase/requests/{id}
- PATCH /api/purchase/requests/{id}/submit
- PATCH /api/purchase/requests/{id}/approve
- PATCH /api/purchase/requests/{id}/reject
- PATCH /api/purchase/requests/{id}/cancel

Jika endpoint convert ada:
- POST /api/purchase/orders/from-request/{purchaseRequestId}

PERMISSIONS:
- purchase.requests.view
- purchase.requests.create
- purchase.requests.edit
- purchase.requests.approve
- purchase.requests.cancel
- purchase.requests.convert

FORM RULES:
- request_date wajib
- needed_date optional
- lines minimal 1
- quantity > 0
- estimated_unit_price >= 0
- jangan submit kalau line kosong
- tampilkan error backend untuk invalid status transition/period lock/permission

ACCEPTANCE CRITERIA:
- User bisa melihat list Purchase Request.
- User bisa membuat draft Purchase Request.
- User bisa update draft.
- User bisa submit/approve/reject/cancel sesuai permission.
- UI tidak menampilkan action yang user tidak punya permission.
- Error backend tampil jelas.
- Tenant request tetap membawa X-Company-ID.

TESTS:
Jika test setup tersedia:
- purchase request list smoke test
- create form validation test
- permission-aware action rendering test

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
add purchase request frontend
```
