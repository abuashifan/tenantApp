# Prompt 02 — Phase 14B Sales Quotation UI

```text
Kita lanjut Phase 14B — Sales Quotation UI project TenantAppDevelopment.

NAMA SUBPHASE:
Phase 14B — Sales Quotation UI


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
Membuat UI Sales Quotation untuk list, detail, create/edit draft, send, approve, accept, reject, cancel, dan convert ke Sales Order jika backend endpoint tersedia.

WAJIB BACA FILE TERBATAS:
- hasil Phase 14A
- frontend/features/sales/*
- backend/routes/api.php bagian sales quotations
- backend/config/permissions.php
- docs/phase-9-sales-workflow-and-ar.md section quotation

JANGAN:
- relisting seluruh repository
- membuat backend module baru kecuali adapter kecil yang benar-benar dibutuhkan dan harus dijelaskan
- membuat Purchase/Cash Bank/Inventory UI
- membuat create tenant/company UI publik
- membuat stock movement UI
- membuat inventory valuation UI
- membuat export PDF/Excel

SCOPE:
1. Quotation list page dengan search/filter status/customer/date.
2. Quotation create form.
3. Quotation edit form hanya untuk status yang masih bisa diedit.
4. Quotation detail page.
5. Line item editor dengan product/description/qty/unit_price/discount/tax preview.
6. Totals preview memakai hasil backend jika tersedia, fallback hanya display kalkulasi frontend untuk preview non-authoritative.
7. Actions: send, approve, accept, reject, cancel.
8. Convert to Sales Order button jika endpoint tersedia dan permission ada.
9. Status badge dan source chain display.
10. Error handling validation backend.

FRONTEND ROUTES:
- /sales/quotations
- /sales/quotations/new
- /sales/quotations/[id]
- /sales/quotations/[id]/edit

KOMPONEN / FILE YANG DISARANKAN:
- frontend/app/sales/quotations/page.tsx
- frontend/app/sales/quotations/new/page.tsx
- frontend/app/sales/quotations/[id]/page.tsx
- frontend/app/sales/quotations/[id]/edit/page.tsx
- frontend/features/sales/quotations/QuotationList.tsx
- frontend/features/sales/quotations/QuotationForm.tsx
- frontend/features/sales/quotations/QuotationDetail.tsx
- frontend/features/sales/quotations/QuotationActions.tsx

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
- list page smoke test
- form renders line item editor
- create quotation calls API
- edit quotation calls API
- action buttons permission-aware
- cancelled quotation cannot show edit action

DOKUMENTASI:
Update docs/phase-14-sales-frontend-mvp.md:
- Tambahkan section Phase 14B — Sales Quotation UI
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
add sales quotation UI
```
