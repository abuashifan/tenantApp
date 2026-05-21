# Prompt 00 — Phase 14 Global Rules

```text
Kita masuk Phase 14 project TenantAppDevelopment.

NAMA PHASE:
Phase 14 — Sales Frontend MVP

WAJIB SIMPAN KE PROJECT MEMORY / DOCS:
Sebelum coding, baca dan update dokumen roadmap/project memory yang relevan:
- docs/Roadmap_Revisi_System_Policy_Accounting_Foundation.md
- docs/phase-14-sales-frontend-mvp.md jika sudah ada
- docs/phase-9-sales-workflow-and-ar.md sebagai referensi backend sales
- docs/phase-13-accounting-frontend-mvp.md sebagai referensi pattern frontend
- .copilot/project-context.md jika ada
- project-plan.md jika ada
- update-roadmap.md jika ada

Tambahkan catatan:
- Phase 13 Accounting Frontend MVP sudah selesai atau diasumsikan selesai sebelum Phase 14 dimulai.
- Phase 14 dimulai sebagai Sales Frontend MVP.
- Phase 14 memakai backend Sales & AR dari Phase 9.
- Phase 14 tidak membuat backend sales baru.
- Phase 14 tidak membuat Purchase/Cash Bank/Inventory UI.
- Purchase Frontend masuk Phase 15.
- Cash Bank Frontend masuk Phase 16.
- Inventory Frontend masuk Phase 17.


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

SUBPHASE PHASE 14:
- Phase 14A — Sales Frontend Foundation
- Phase 14B — Sales Quotation UI
- Phase 14C — Sales Order UI
- Phase 14D — Delivery Order UI
- Phase 14E — Proforma & Sales Invoice UI
- Phase 14F — Customer Deposit & Sales Receipt UI
- Phase 14G — Sales Return UI
- Phase 14H — AR Ledger & Aging UI
- Phase 14I — Sales Frontend Tests & Documentation

DOKUMEN SALES YANG HARUS DIDUKUNG UI:
- Sales Quotation / Penawaran Penjualan
- Sales Order / Pesanan Penjualan
- Delivery Order / Pengiriman Barang
- Proforma Invoice / Faktur Sementara
- Sales Invoice / Faktur Penjualan
- Customer Deposit / Down Payment
- Sales Receipt / Penerimaan Penjualan
- Sales Return / Retur Penjualan
- AR Subsidiary Ledger / Buku Besar Pembantu Piutang
- AR Aging

FLOW UI UTAMA:
Quotation -> Sales Order -> Delivery Order -> Proforma optional -> Sales Invoice -> Sales Receipt

Flow langsung juga harus didukung jika backend mendukung:
- Sales Order langsung
- Delivery Order langsung
- Sales Invoice langsung
- Customer Deposit langsung
- Sales Receipt untuk invoice langsung

RULE UI SALES:
1. Semua halaman sales harus berada di area AppShell.
2. Semua route sales harus butuh login dan active company.
3. Semua fetch/mutation memakai apiRequest existing.
4. Semua request membawa X-Company-ID.
5. Semua tombol aksi harus permission-aware.
6. Semua form harus menampilkan validation error backend.
7. Semua status dokumen harus tampil dengan badge jelas.
8. Semua detail dokumen harus menampilkan source document chain bila tersedia.
9. Semua form line item harus support product, description, quantity, unit, unit_price, discount, tax preview, department, project, warehouse jika backend mendukung.
10. Sales Invoice harus bisa preview/apply customer deposit jika backend mendukung.
11. Delivery Order UI Phase 14 hanya dokumen pengiriman, bukan stock movement UI.
12. Sales Return UI Phase 14 tidak membuat stock movement UI.
13. AR ledger/aging hanya read/report UI, bukan payment allocation advanced.
14. Jangan membuat export PDF/Excel.
15. Print-friendly basic boleh jika ringan, tapi bukan export engine.

WAJIB BACA FILE TERBATAS SETIAP SUBPHASE:
- frontend/lib/api.ts
- frontend/types/api.ts
- frontend/components/layout/AppShell.tsx
- frontend/app/dashboard/page.tsx
- frontend/package.json
- hasil Phase 13 reusable components/features
- backend/routes/api.php bagian /api/sales sebagai referensi endpoint
- backend/config/permissions.php sebagai referensi permission
- docs/phase-9-sales-workflow-and-ar.md sebagai backend contract

JANGAN:
- relisting seluruh repository
- membuat backend sales module baru
- membuat Purchase/Cash Bank/Inventory UI
- membuat create tenant/company UI publik
- membuat stock movement UI
- membuat inventory costing/valuation UI

UNTUK SETIAP SUBPHASE:
1. Baca hasil subphase sebelumnya.
2. Jangan mengulang implementasi yang sudah ada.
3. Update docs/phase-14-sales-frontend-mvp.md.
4. Update project memory/context jika ada.
5. Sertakan final summary:
   - file dibuat
   - file diubah
   - route/page dibuat
   - component dibuat
   - tests dibuat
   - command yang dijalankan
   - command yang gagal/tidak bisa dijalankan
   - catatan scope yang sengaja tidak dikerjakan
6. Jangan lanjut ke subphase berikutnya kecuali diminta.

ACCEPTANCE GLOBAL PHASE 14:
Phase 14 selesai jika frontend support:
- Sales frontend navigation
- Quotation UI
- Sales Order UI
- Delivery Order UI
- Proforma UI
- Sales Invoice UI
- Customer Deposit UI
- Sales Receipt UI
- Sales Return UI
- AR Ledger UI
- AR Aging UI
- permission-aware actions
- loading/error/empty states
- responsive basic layout
- frontend tests/smoke tests
- documentation

Jangan coding sekarang kecuali prompt ini memang disertai subphase work instruction.
Tugas prompt ini hanya menyimpan global rules Phase 14 ke docs/project memory dan memastikan semua aturan dipahami.
```
