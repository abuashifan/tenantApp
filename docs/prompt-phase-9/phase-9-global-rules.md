Kita masuk Phase 9 project TenantAppDevelopment.

NAMA PHASE:
Phase 9 — Sales Workflow & Accounts Receivable Backend

WAJIB SIMPAN KE PROJECT MEMORY / DOCS:
Sebelum coding, baca dan update dokumen roadmap/project memory yang relevan, terutama:

- docs/Roadmap_Revisi_System_Policy_Accounting_Foundation.md
- docs/phase-9-sales-workflow-and-ar.md jika sudah ada
- .copilot/project-context.md jika ada
- project-plan.md jika ada

Tambahkan catatan bahwa:

- Phase 9 adalah backend-first.
- Phase 9 bukan frontend.
- Frontend sales masuk Phase 14.
- Phase 9 tidak membuat Stock Movement Engine.
- Stock Movement Engine tetap Phase 12B.
- Delivery Order Phase 9 hanya dokumen pengiriman.
- Sales Invoice langsung Phase 9 belum membuat stock movement.
- COGS journal ditunda ke Phase 12.
- Buku besar pembantu piutang masuk Phase 9J.

KONTEKS PROJECT:
Project ini adalah aplikasi akuntansi multi-tenant:

- Backend: Laravel API
- Frontend: Next.js
- Styling: TailwindCSS
- Database: SQLite untuk MVP/development
- 1 company = 1 tenant database
- Request tenant memakai header X-Company-ID
- Backend memakai auth:sanctum + company.access
- Data sales berada di tenant database
- Tidak boleh ada data sales antar company tercampur

STRATEGI UTAMA:
Backend-first.
Jangan membuat frontend sales di Phase 9.
Frontend Sales MVP nanti Phase 14.

STATUS SEBELUM PHASE 9:
Diasumsikan sudah ada:

- Phase 4 System Policy & Accounting Foundation
- Phase 5 Master Data Accounting
- Phase 6 Journal Entry Engine
- Phase 6A Analytical Dimensions
- Phase 7 General Ledger & Trial Balance
- Phase 8 Financial Statements Basic
- Phase 8E/8F Fiscal Closing & Period Locking

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

RULE GLOBAL PHASE 9:

1. Semua tabel sales masuk tenant database.
2. Semua endpoint sales wajib auth:sanctum + company.access.
3. Permission middleware dipakai untuk action sales.
4. Semua dokumen sales harus tenant-aware.
5. Semua dokumen sales harus support source document chain.
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
17. Tidak membuat frontend sales.
18. Tidak membuat stock movement engine.
19. Tidak membuat COGS journal.
20. Tidak membuat inventory valuation.
21. Tidak membuat stock card.
22. Tidak membuat PDF/email invoice.
23. Tidak membuat advanced tax.
24. Tidak membuat multi-currency penuh.
25. Tidak membuat promo/tiered discount.
26. Tidak membuat advanced payment allocation.

DOKUMEN SALES WORKFLOW:
Phase 9 harus mendukung alur:

- Sales Quotation / Penawaran Penjualan
- Sales Order / Pesanan Penjualan
- Delivery Order / Pengiriman Barang
- Proforma Invoice / Faktur Sementara
- Sales Invoice / Faktur Penjualan
- Billing Invoice / Faktur Penagihan optional
- Customer Deposit / Down Payment
- Sales Receipt / Penerimaan Penjualan
- Sales Return / Retur Penjualan
- AR Subsidiary Ledger / Buku Besar Pembantu Piutang
- AR Aging

SOURCE CHAIN:
Dokumen bisa dibuat dari dokumen sebelumnya atau langsung.
Contoh:
Quotation -> Sales Order -> Delivery Order -> Sales Invoice -> Sales Receipt
Tapi juga boleh:
Sales Order langsung
Delivery Order langsung
Sales Invoice langsung
Sales Receipt untuk invoice langsung

Semua header dokumen sales perlu pola:

- source_type nullable
- source_id nullable
- source_number nullable
- source_revision nullable

Semua line dokumen sales perlu pola:

- source_line_type nullable
- source_line_id nullable

STOCK RULE FINAL:
Sales Order:

- tidak mengubah stok
- tidak membuat stock movement
- tidak membuat jurnal COGS

Delivery Order:

- Phase 9 hanya dokumen pengiriman
- tidak membuat stock movement
- tidak mengurangi stok inventory
- stock movement sales_out nanti Phase 12B/12E

Sales Invoice langsung:

- Phase 9 belum membuat stock movement
- belum membuat COGS journal
- hanya membuat AR/revenue/tax/deposit allocation jika applicable

DOWN PAYMENT RULE FINAL:

- Down Payment diinput dari Sales Order UI/API.
- Sales Order cukup punya has_down_payment true/false.
- Jika has_down_payment true, request boleh membawa nested down_payment payload.
- Data uang muka tetap disimpan di tabel customer_deposits, bukan langsung menjadi field utama sales_orders.
- Customer Deposit memiliki jurnal sendiri:
  Dr Cash/Bank
  Cr Customer Deposit
- Sales Invoice tidak input DP baru.
- Jika Sales Invoice dibuat dari Sales Order yang punya Customer Deposit, invoice menampilkan available DP dan bisa apply DP.
- Apply DP journal:
  Dr Customer Deposit
  Cr Accounts Receivable

DISCOUNT RULE FINAL:

- Sales Order boleh input discount.
- Sales Invoice juga boleh input/edit discount.
- Sales Order discount = discount kesepakatan/komersial.
- Sales Invoice discount = discount final accounting.
- Saat Sales Invoice dibuat dari Sales Order, discount dari Sales Order dicopy ke Sales Invoice.
- Discount type:
  percent
  fixed_amount
- Discount level:
  line discount
  header/global discount

AR SUBSIDIARY LEDGER:

- Buku besar pembantu piutang wajib masuk Phase 9J.
- Total AR subsidiary ledger harus reconcile dengan saldo GL Accounts Receivable.
- Sumber AR ledger:
  sales_invoices posted
  sales_receipts posted
  customer_deposit_allocations posted
  sales_returns posted

SUBPHASE PHASE 9:
Prompt berikutnya harus dikerjakan berurutan:

- Phase 9A — Sales Workflow Foundation
- Phase 9B — Sales Quotation
- Phase 9C — Sales Order + Down Payment Entry
- Phase 9D — Delivery Order
- Phase 9E — Proforma Invoice
- Phase 9F — Sales Invoice
- Phase 9G — Billing Invoice optional/design
- Phase 9H — Sales Receipt, Customer Payment & Customer Deposit
- Phase 9I — Sales Return
- Phase 9J — AR Subsidiary Ledger & Aging
- Phase 9K — Integration Tests & Documentation

UNTUK SETIAP SUBPHASE:

1. Baca hasil subphase sebelumnya.
2. Jangan mengulang implementasi yang sudah ada.
3. Update docs/phase-9-sales-workflow-and-ar.md.
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

ACCEPTANCE GLOBAL PHASE 9:
Phase 9 selesai jika backend support:

- quotation
- sales order
- down payment dari sales order
- delivery order sebagai dokumen
- proforma invoice
- sales invoice
- discount percent/fixed di sales order dan sales invoice
- apply DP ke sales invoice
- sales receipt
- sales return
- AR subsidiary ledger
- AR aging
- AR vs GL reconciliation
- tidak ada stock movement di Phase 9
- tidak ada frontend sales di Phase 9

Jangan coding sekarang kecuali prompt ini memang disertai subphase work instruction.
Tugas prompt ini hanya menyimpan global rules Phase 9 ke docs/project memory dan memastikan semua aturan dipahami.
