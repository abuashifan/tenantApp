# Prompt 00 — Phase 15 Global Rules

```text
Kita masuk Phase 15 project TenantAppDevelopment.

NAMA PHASE:
Phase 15 — Purchase Frontend MVP

WAJIB SIMPAN KE PROJECT MEMORY / DOCS:
Sebelum coding, baca dan update dokumen roadmap/project memory yang relevan:
- docs/Roadmap_Revisi_System_Policy_Accounting_Foundation.md
- docs/phase-15-purchase-frontend-mvp.md jika sudah ada
- docs/phase-10-purchase-workflow-and-ap.md sebagai referensi backend purchase/AP
- docs/phase-13-accounting-frontend-mvp.md sebagai referensi pattern frontend accounting
- docs/phase-14-sales-frontend-mvp.md sebagai referensi pattern frontend transactional workflow
- .copilot/project-context.md jika ada
- project-plan.md jika ada
- update-roadmap.md jika ada

Tambahkan catatan:
- Phase 15 dimulai sebagai Purchase Frontend MVP.
- Phase 15 memakai backend Purchase & AP dari Phase 10.
- Phase 15 tidak membuat backend purchase baru.
- Phase 15 tidak membuat Sales/Cash Bank/Inventory UI baru.
- Cash Bank Frontend masuk Phase 16.
- Inventory Frontend masuk Phase 17.
- Purchase frontend mengikuti pola UI transaction workflow dari Phase 14, tetapi disesuaikan untuk vendor/AP.

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

SUBPHASE PHASE 15:
- Phase 15A — Purchase Frontend Foundation
- Phase 15B — Purchase Request UI
- Phase 15C — Purchase Order UI
- Phase 15D — Goods Receipt UI
- Phase 15E — Vendor Bill UI
- Phase 15F — Vendor Deposit & Vendor Payment UI
- Phase 15G — Purchase Return UI
- Phase 15H — AP Ledger & Aging UI
- Phase 15I — Purchase Frontend Tests & Documentation

PURCHASE FRONTEND FLOW:
UI harus mendukung flow utama:
- Purchase Request -> Purchase Order -> Goods Receipt -> Vendor Bill -> Vendor Payment

Tetapi juga harus mendukung dokumen langsung jika backend Phase 10 mendukung:
- Purchase Order langsung
- Goods Receipt langsung
- Vendor Bill langsung
- Vendor Payment untuk bill langsung

KONSEP UTAMA UI:
- List page untuk setiap dokumen.
- Detail page untuk setiap dokumen.
- Create/edit form untuk draft.
- Action buttons permission-aware.
- Status badge konsisten.
- Source document chain ditampilkan.
- Line table reusable.
- Discount preview sesuai backend.
- Vendor deposit preview dan allocation ditampilkan di Vendor Bill.
- Error period lock/dependency/permission dari backend harus terlihat jelas.

BATASAN GLOBAL:
- Tidak membuat backend purchase baru.
- Tidak membuat stock movement UI.
- Tidak membuat inventory valuation UI.
- Tidak membuat warehouse stock update UI.
- Tidak membuat landed cost.
- Tidak membuat PDF/Excel export.
- Tidak membuat advanced AP allocation.
- Tidak membuat purchase approval workflow kompleks di luar endpoint backend yang sudah ada.

UNTUK SETIAP SUBPHASE:
1. Baca hasil subphase sebelumnya.
2. Jangan mengulang implementasi yang sudah ada.
3. Update docs/phase-15-purchase-frontend-mvp.md.
4. Update project memory/context jika ada.
5. Jangan lanjut ke subphase berikutnya kecuali diminta.

ACCEPTANCE GLOBAL PHASE 15:
Phase 15 selesai jika frontend support:
- Purchase menu dan route purchase
- Purchase Request UI
- Purchase Order UI
- Vendor Deposit entry dari Purchase Order jika backend mendukung
- Goods Receipt UI sebagai dokumen penerimaan
- Vendor Bill UI
- Vendor Payment UI
- Vendor Deposit UI
- Purchase Return UI
- AP Subsidiary Ledger UI
- AP Aging UI
- permission-aware actions
- tenant-aware API requests
- error handling jelas
- dokumentasi final

Jangan coding sekarang kecuali prompt ini memang disertai subphase work instruction.
Tugas prompt ini hanya menyimpan global rules Phase 15 ke docs/project memory dan memastikan semua aturan dipahami.
```
