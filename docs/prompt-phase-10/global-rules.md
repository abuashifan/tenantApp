Kita masuk Phase 10 project TenantAppDevelopment.

NAMA PHASE:
Phase 10 — Purchase Workflow & Accounts Payable Backend

WAJIB SIMPAN KE PROJECT MEMORY / DOCS:
Sebelum coding, baca dan update dokumen roadmap/project memory yang relevan, terutama:

- docs/Roadmap_Revisi_System_Policy_Accounting_Foundation.md
- docs/phase-10-purchase-workflow-and-ap.md jika sudah ada
- docs/phase-9-sales-workflow-and-ar.md sebagai pattern pembanding
- .copilot/project-context.md jika ada
- project-plan.md jika ada

Tambahkan catatan bahwa:

- Phase 10 adalah backend-first.
- Phase 10 bukan frontend.
- Frontend purchase masuk Phase 15.
- Phase 10 disamakan flow dan rule-nya dengan Phase 9 Sales & AR, tetapi dari sisi Purchase & AP.
- Phase 10 tidak membuat Stock Movement Engine.
- Stock Movement Engine tetap Phase 12.
- Goods Receipt Phase 10 hanya dokumen penerimaan barang.
- Vendor Bill langsung Phase 10 belum membuat stock movement.
- Inventory valuation ditunda ke Phase 12.
- COGS tidak relevan di purchase Phase 10; inventory valuation dan stock costing tetap Phase 12.
- Buku besar pembantu hutang masuk Phase 10H.

KONTEKS PROJECT:
Project ini adalah aplikasi akuntansi multi-tenant:

- Backend: Laravel API
- Frontend: Next.js
- Styling: TailwindCSS
- Database: SQLite untuk MVP/development
- 1 company = 1 tenant database
- Request tenant memakai header X-Company-ID
- Backend memakai auth:sanctum + company.access
- Data purchase berada di tenant database
- Tidak boleh ada data purchase antar company tercampur

STRATEGI UTAMA:
Backend-first.
Jangan membuat frontend purchase di Phase 10.
Frontend Purchase MVP nanti Phase 15.

STATUS SEBELUM PHASE 10:
Diasumsikan sudah ada:

- Phase 4 System Policy & Accounting Foundation
- Phase 5 Master Data Accounting
- Phase 6 Journal Entry Engine
- Phase 6A Analytical Dimensions
- Phase 7 General Ledger & Trial Balance
- Phase 8 Financial Statements Basic
- Phase 8E/8F Fiscal Closing & Period Locking
- Phase 9 Sales Workflow & Accounts Receivable Backend

WAJIB BACA FILE TERBATAS:
Jangan relisting seluruh repository.
Baca hanya file/folder yang relevan:

- backend/routes/api.php
- backend/config/permissions.php
- backend/config/document_numbers.php jika ada
- backend/config/transaction_lifecycle.php jika ada
- backend/config/api_errors.php jika ada
- backend/app/Services/Tenant/TenantContext.php
- backend/app/Http/Middleware/EnsureCompanyAccess.php
- backend/app/Http/Middleware/EnsurePermission.php
- backend/app/Services/DocumentNumbering/DocumentNumberService.php
- backend/app/Services/Transactions/TransactionPolicyService.php
- backend/app/Services/Transactions/TransactionDependencyService.php
- backend/app/Services/Transactions/TransactionDateGuardService.php
- backend/app/Services/Audit/AuditLogService.php
- backend/app/Services/Journal/JournalEntryService.php
- backend/app/Models/Tenant/ChartOfAccount.php
- backend/app/Models/Tenant/Contact.php
- backend/app/Models/Tenant/Product.php
- backend/app/Models/Tenant/Unit.php
- backend/app/Models/Tenant/Warehouse.php
- backend/app/Models/Tenant/AccountMapping.php
- backend/database/migrations/tenant/_journal_
- backend/database/migrations/tenant/_contacts_
- backend/database/migrations/tenant/_products_
- backend/database/migrations/tenant/_account_mappings_
- backend/app/Services/Sales/\* jika sudah ada sebagai reference pattern, jangan copy membabi buta

RULE GLOBAL PHASE 10:

1. Semua tabel purchase masuk tenant database.
2. Semua endpoint purchase wajib auth:sanctum + company.access.
3. Permission middleware dipakai untuk action purchase.
4. Semua dokumen purchase harus tenant-aware.
5. Semua dokumen purchase harus support source document chain.
6. Source document boleh nullable agar dokumen bisa dibuat langsung.
7. Line source reference juga nullable.
8. Semua dokumen harus support audit log.
9. Semua dokumen mutasi harus cek period lock.
10. Semua dokumen mutasi harus cek permission.
11. Semua dokumen mutasi harus cek dependency jika relevan.
12. Tidak boleh hard delete transaksi.
13. Void/revision mengikuti foundation Phase 4.
14. Status void/obsolete tidak masuk laporan normal.
15. Posted journal harus clean dan tidak double.
16. Tidak membuat public tenant/company endpoint.
17. Tidak membuat frontend purchase.
18. Tidak membuat stock movement engine.
19. Tidak membuat inventory valuation.
20. Tidak membuat stock card.
21. Tidak membuat PDF/email vendor bill.
22. Tidak membuat advanced tax.
23. Tidak membuat multi-currency penuh.
24. Tidak membuat promo/tiered discount.
25. Tidak membuat advanced payment allocation.
26. Tidak membuat warehouse stock update.

DOKUMEN PURCHASE WORKFLOW:
Phase 10 harus mendukung alur:

- Purchase Request / Permintaan Pembelian
- Purchase Order / Pesanan Pembelian
- Goods Receipt / Penerimaan Barang
- Vendor Bill / Purchase Invoice / Faktur Pembelian
- Vendor Deposit / Uang Muka Vendor
- Vendor Payment / Pembayaran Vendor
- Purchase Return / Retur Pembelian
- AP Subsidiary Ledger / Buku Besar Pembantu Hutang
- AP Aging

SOURCE CHAIN:
Dokumen bisa dibuat dari dokumen sebelumnya atau langsung.
Contoh:
Purchase Request -> Purchase Order -> Goods Receipt -> Vendor Bill -> Vendor Payment

Tapi juga boleh:
Purchase Order langsung
Goods Receipt langsung
Vendor Bill langsung
Vendor Payment untuk bill langsung

Semua header dokumen purchase perlu pola:

- source_type nullable
- source_id nullable
- source_number nullable
- source_revision nullable

Semua line dokumen purchase perlu pola:

- source_line_type nullable
- source_line_id nullable

STOCK RULE FINAL:
Purchase Order:

- tidak mengubah stok
- tidak membuat stock movement
- tidak membuat jurnal inventory

Goods Receipt:

- Phase 10 hanya dokumen penerimaan barang
- tidak membuat stock movement
- tidak menambah stok inventory
- stock movement purchase_in nanti Phase 12B/12E

Vendor Bill langsung:

- Phase 10 belum membuat stock movement
- belum membuat inventory valuation
- hanya membuat AP/expense/input tax/vendor deposit allocation jika applicable

DOWN PAYMENT / VENDOR DEPOSIT RULE FINAL:

- Uang muka vendor diinput dari Purchase Order UI/API.
- Purchase Order cukup punya has_down_payment true/false.
- Jika has_down_payment true, request boleh membawa nested vendor_deposit payload.
- Data uang muka tetap disimpan di tabel vendor_deposits, bukan langsung menjadi field utama purchase_orders.
- Vendor Deposit memiliki jurnal sendiri:
  Dr Vendor Deposit / Advance Payment
  Cr Cash/Bank
- Vendor Bill tidak input uang muka baru.
- Jika Vendor Bill dibuat dari Purchase Order yang punya Vendor Deposit, bill menampilkan available vendor deposit dan bisa apply deposit.
- Apply Vendor Deposit journal:
  Dr Accounts Payable
  Cr Vendor Deposit / Advance Payment
- Vendor Deposit adalah asset/advance payment, bukan liability.

DISCOUNT RULE FINAL:

- Purchase Order boleh input discount.
- Vendor Bill juga boleh input/edit discount.
- Purchase Order discount = discount kesepakatan/komersial dengan vendor.
- Vendor Bill discount = discount final accounting.
- Saat Vendor Bill dibuat dari Purchase Order, discount dari Purchase Order dicopy ke Vendor Bill.
- Discount type:
  percent
  fixed_amount
- Discount level:
  line discount
  header/global discount
- Posted Vendor Bill harus memakai discount final di Vendor Bill, bukan hanya discount PO.

AP SUBSIDIARY LEDGER:

- Buku besar pembantu hutang wajib masuk Phase 10H.
- Total AP subsidiary ledger harus reconcile dengan saldo GL Accounts Payable.
- Sumber AP ledger:
  posted vendor_bills
  posted vendor_payments
  posted vendor_deposit_allocations
  posted purchase_returns

SUBPHASE PHASE 10:
Prompt berikutnya harus dikerjakan berurutan:

- Phase 10A — Purchase Workflow Foundation
- Phase 10B — Purchase Request
- Phase 10C — Purchase Order + Vendor Deposit Entry
- Phase 10D — Goods Receipt
- Phase 10E — Vendor Bill / Purchase Invoice
- Phase 10F — Vendor Payment & Vendor Deposit
- Phase 10G — Purchase Return
- Phase 10H — AP Subsidiary Ledger & Aging
- Phase 10I — Integration Tests & Documentation

UNTUK SETIAP SUBPHASE:

1. Baca hasil subphase sebelumnya.
2. Jangan mengulang implementasi yang sudah ada.
3. Update docs/phase-10-purchase-workflow-and-ap.md.
4. Update project memory/context jika ada.
5. Sertakan final summary:
   - file dibuat
   - file diubah
   - endpoint ditambahkan
   - tests dibuat
   - command yang dijalankan
   - command yang gagal/tidak bisa dijalankan
   - catatan scope yang sengaja tidak dikerjakan
6. Jangan lanjut ke subphase berikutnya kecuali diminta.

ACCEPTANCE GLOBAL PHASE 10:
Phase 10 selesai jika backend support:

- purchase request
- purchase order
- vendor deposit dari purchase order
- goods receipt sebagai dokumen
- vendor bill / purchase invoice
- discount percent/fixed di purchase order dan vendor bill
- apply vendor deposit ke vendor bill
- vendor payment
- purchase return
- AP subsidiary ledger
- AP aging
- AP vs GL reconciliation
- tidak ada stock movement di Phase 10
- tidak ada frontend purchase di Phase 10

Jangan coding sekarang kecuali prompt ini memang disertai subphase work instruction.
Tugas prompt ini hanya menyimpan global rules Phase 10 ke docs/project memory dan memastikan semua aturan dipahami.
