# Prompt 1 — Phase 12 Global Rules

```text
Kita masuk Phase 12 project TenantAppDevelopment.

NAMA PHASE:
Phase 12 — Inventory Backend

WAJIB SIMPAN KE PROJECT MEMORY / DOCS:
Sebelum coding, baca dan update dokumen roadmap/project memory yang relevan, terutama:
- docs/Roadmap_Revisi_System_Policy_Accounting_Foundation.md
- docs/phase-12-inventory-backend.md jika sudah ada
- docs/phase-9-sales-workflow-and-ar.md sebagai referensi integrasi sales
- docs/phase-10-purchase-workflow-and-ap.md sebagai referensi integrasi purchase
- docs/phase-11-cash-bank-backend.md jika sudah ada
- .copilot/project-context.md jika ada
- project-plan.md jika ada
- update-roadmap.md jika dipakai sebagai roadmap ringkas

Tambahkan catatan bahwa:
- Phase 12 adalah backend-first.
- Phase 12 bukan frontend.
- Frontend inventory masuk Phase 17.
- Phase 12 adalah fase yang mengaktifkan stock movement engine.
- Phase 9 Delivery Order sebelumnya hanya dokumen pengiriman, belum mengurangi stok.
- Phase 10 Goods Receipt sebelumnya hanya dokumen penerimaan, belum menambah stok.
- Phase 12 akan menghubungkan Delivery Order dan Goods Receipt ke stock movement.
- Phase 12 akan membuat stock balance, stock card, dan average cost/valuation foundation.
- Phase 12 akan membuat stock adjustment dan stock opname basic.
- Phase 12 belum membuat frontend inventory.
- Phase 12 belum membuat FIFO/LIFO/serial number/batch tracking/landed cost advanced.
- Phase 12 belum membuat export PDF/Excel.

KONTEKS PROJECT:
Project ini adalah aplikasi akuntansi multi-tenant:
- Backend: Laravel API
- Frontend: Next.js
- Styling: TailwindCSS
- Database: SQLite untuk MVP/development
- Production nanti bisa MySQL/MariaDB/PostgreSQL
- 1 company = 1 tenant database
- Request tenant memakai header X-Company-ID
- Backend memakai auth:sanctum + company.access
- Data inventory berada di tenant database
- Tidak boleh ada data inventory antar company tercampur

STRATEGI UTAMA:
Backend-first.
Jangan membuat frontend inventory di Phase 12.
Frontend Inventory MVP nanti Phase 17.

STATUS SEBELUM PHASE 12:
Diasumsikan sudah ada:
- Phase 4 System Policy & Accounting Foundation
- Phase 5 Master Data Accounting
- Phase 6 Journal Entry Engine
- Phase 6A Analytical Dimensions
- Phase 7 General Ledger & Trial Balance
- Phase 8 Financial Statements Basic & Closing
- Phase 9 Sales Workflow & Accounts Receivable Backend
- Phase 10 Purchase Workflow & Accounts Payable Backend
- Phase 11 Cash Bank Backend

Dari Phase 9:
- Sales Order tidak mengubah stok.
- Delivery Order hanya dokumen pengiriman.
- Sales Invoice belum membuat stock movement.
- COGS journal ditunda ke Phase 12.

Dari Phase 10:
- Purchase Order tidak mengubah stok.
- Goods Receipt hanya dokumen penerimaan.
- Vendor Bill belum membuat stock movement.
- Inventory valuation ditunda ke Phase 12.

WAJIB BACA FILE TERBATAS:
Jangan relisting seluruh repository.
Baca hanya file/folder yang relevan:

Core routing/config:
- backend/routes/api.php
- backend/config/permissions.php
- backend/config/document_numbers.php jika ada
- backend/config/transaction_lifecycle.php jika ada
- backend/config/api_errors.php jika ada

Tenant/security:
- backend/app/Services/Tenant/TenantContext.php
- backend/app/Http/Middleware/EnsureCompanyAccess.php
- backend/app/Http/Middleware/EnsurePermission.php

Foundation:
- backend/app/Services/DocumentNumbering/DocumentNumberService.php
- backend/app/Services/Transactions/TransactionPolicyService.php
- backend/app/Services/Transactions/TransactionDependencyService.php
- backend/app/Services/Transactions/TransactionDateGuardService.php
- backend/app/Services/Audit/AuditLogService.php
- backend/app/Services/Journal/JournalEntryService.php

Master data:
- backend/app/Models/Tenant/ChartOfAccount.php
- backend/app/Models/Tenant/Contact.php
- backend/app/Models/Tenant/Product.php
- backend/app/Models/Tenant/ProductCategory.php
- backend/app/Models/Tenant/Unit.php
- backend/app/Models/Tenant/Warehouse.php
- backend/app/Models/Tenant/AccountMapping.php
- backend/app/Models/Tenant/Department.php jika ada
- backend/app/Models/Tenant/Project.php jika ada

Sales integration reference:
- backend/app/Models/Tenant/SalesOrder.php jika ada
- backend/app/Models/Tenant/SalesOrderLine.php jika ada
- backend/app/Models/Tenant/DeliveryOrder.php jika ada
- backend/app/Models/Tenant/DeliveryOrderLine.php jika ada
- backend/app/Models/Tenant/SalesInvoice.php jika ada
- backend/app/Services/Sales/DeliveryOrderService.php jika ada
- backend/app/Services/Sales/SalesInvoiceService.php jika ada

Purchase integration reference:
- backend/app/Models/Tenant/PurchaseOrder.php jika ada
- backend/app/Models/Tenant/PurchaseOrderLine.php jika ada
- backend/app/Models/Tenant/GoodsReceipt.php jika ada
- backend/app/Models/Tenant/GoodsReceiptLine.php jika ada
- backend/app/Models/Tenant/VendorBill.php jika ada
- backend/app/Services/Purchase/GoodsReceiptService.php jika ada
- backend/app/Services/Purchase/VendorBillService.php jika ada

Existing tenant migrations:
- backend/database/migrations/tenant/*products*
- backend/database/migrations/tenant/*warehouses*
- backend/database/migrations/tenant/*sales*
- backend/database/migrations/tenant/*purchase*
- backend/database/migrations/tenant/*journal*

RULE GLOBAL PHASE 12:
1. Semua tabel inventory masuk tenant database.
2. Semua endpoint inventory wajib auth:sanctum + company.access.
3. Permission middleware dipakai untuk action inventory.
4. Semua transaksi inventory harus tenant-aware.
5. Semua stock movement wajib punya source document jika berasal dari Sales/Purchase/Adjustment/Opname.
6. Source document boleh nullable untuk manual movement hanya jika jenis movement memang manual/adjustment.
7. Tidak boleh hard delete stock movement.
8. Void/reversal inventory harus menjaga audit trail.
9. Stock movement posted tidak boleh diedit langsung.
10. Koreksi stok dilakukan lewat reversal atau adjustment.
11. Stock balance tidak boleh dimanipulasi langsung dari controller.
12. Stock balance hanya boleh berubah lewat StockMovementService.
13. Stock movement harus cek period lock.
14. Stock movement harus cek permission.
15. Stock movement harus cek dependency jika relevan.
16. Semua movement harus audit log.
17. Semua quantity decimal-safe.
18. Semua valuation decimal-safe.
19. Jangan membuat logic yang hanya cocok untuk SQLite.
20. Jangan membuat frontend inventory.
21. Jangan membuat export PDF/Excel.
22. Jangan membuat FIFO/LIFO.
23. Jangan membuat landed cost advanced.
24. Jangan membuat serial number/batch tracking.
25. Jangan membuat manufacturing/BOM.
26. Jangan membuat barcode system.
27. Jangan membuat multi-warehouse transfer advanced di luar scope Phase 12.
28. Jangan membuat advanced approval workflow.
29. Jangan membuat procurement ulang.
30. Jangan mengubah Sales/Purchase flow besar-besaran.

INVENTORY MOVEMENT TYPES:
Minimal movement type:
- purchase_in
- purchase_return_out
- sales_out
- sales_return_in
- adjustment_in
- adjustment_out
- opname_in
- opname_out
- transfer_out optional jika simple transfer dibuat
- transfer_in optional jika simple transfer dibuat
- opening_stock

STOCK DIRECTION:
IN menambah quantity:
- purchase_in
- sales_return_in
- adjustment_in
- opname_in
- transfer_in
- opening_stock

OUT mengurangi quantity:
- sales_out
- purchase_return_out
- adjustment_out
- opname_out
- transfer_out

VALUATION METHOD MVP:
Gunakan Moving Average / Average Cost sebagai metode MVP.

Rules:
- purchase_in menambah qty dan value, lalu recalculates average cost
- sales_out mengurangi qty dan value memakai average cost saat movement
- adjustment_in bisa punya unit_cost manual
- adjustment_out memakai average cost current
- sales_return_in memakai cost dari original sales_out jika tersedia; jika tidak, fallback ke average cost current
- purchase_return_out memakai cost dari related purchase_in/goods receipt jika tersedia; jika tidak, fallback ke average cost current
- stock opname difference:
  - positive difference = opname_in
  - negative difference = opname_out

ACCOUNTING JOURNAL RULE:
Phase 12 mulai membuat journal inventory yang sebelumnya ditunda.

Purchase integration recommended MVP:
Gunakan inventory_interim agar Goods Receipt bisa menambah stok dan nilai persediaan tanpa menunggu Vendor Bill.
- Goods Receipt:
  Dr Inventory
      Cr Inventory Interim
- Vendor Bill from Goods Receipt:
  Dr Inventory Interim
  Dr Input Tax
      Cr Accounts Payable
- Vendor Bill direct tanpa Goods Receipt:
  Dr Inventory / Expense
  Dr Input Tax
      Cr Accounts Payable

Sales integration:
- Delivery Order delivered membuat stock movement sales_out.
- COGS journal dibuat saat sales_out:
  Dr COGS
      Cr Inventory
- Sales Invoice tidak membuat stock movement jika sudah ada Delivery Order.
- Sales Invoice direct tanpa Delivery Order boleh membuat sales_out hanya jika config mengizinkan.
- Hindari double stock movement.

Purchase Return:
- Membuat purchase_return_out.
- Journal mengikuti policy purchase return/AP existing, tetapi inventory harus berkurang.

Sales Return:
- Membuat sales_return_in.
- Reverse COGS:
  Dr Inventory
      Cr COGS

ACCOUNT MAPPING KEYS:
Pastikan ada atau dokumentasikan jika belum ada:
- inventory
- inventory_interim
- cogs
- stock_adjustment_gain
- stock_adjustment_loss
- purchase_return
- sales_return
- inventory_write_off
- opening_stock_equity optional

PERMISSIONS:
Tambahkan permission granular minimal:
- inventory.stock.view
- inventory.movements.view
- inventory.movements.create
- inventory.movements.post
- inventory.movements.void
- inventory.adjustments.view
- inventory.adjustments.create
- inventory.adjustments.edit
- inventory.adjustments.approve
- inventory.adjustments.post
- inventory.adjustments.void
- inventory.opname.view
- inventory.opname.create
- inventory.opname.edit
- inventory.opname.finalize
- inventory.valuation.view
- inventory.reports.view
- inventory.integration.run

SUBPHASE PHASE 12:
Prompt berikutnya harus dikerjakan berurutan:
- Phase 12A — Inventory Foundation
- Phase 12B — Stock Movement Engine
- Phase 12C — Stock Balance
- Phase 12D — Average Cost / Valuation Foundation
- Phase 12E — Sales & Purchase Stock Integration
- Phase 12F — Stock Adjustment
- Phase 12G — Stock Opname Basic
- Phase 12H — Inventory Reports Backend
- Phase 12I — Integration Tests & Documentation

UNTUK SETIAP SUBPHASE:
1. Baca hasil subphase sebelumnya.
2. Jangan mengulang implementasi yang sudah ada.
3. Update docs/phase-12-inventory-backend.md.
4. Update project memory/context jika ada.
5. Sertakan final summary:
   - file dibuat
   - file diubah
   - endpoint ditambahkan
   - migrations dibuat
   - services dibuat
   - tests dibuat
   - journal behavior
   - command yang dijalankan
   - command yang gagal/tidak bisa dijalankan
   - catatan scope yang sengaja tidak dikerjakan
6. Jangan lanjut ke subphase berikutnya kecuali diminta.

ACCEPTANCE GLOBAL PHASE 12:
Phase 12 selesai jika backend support:
- inventory foundation
- stock movement engine
- stock balance by product and warehouse
- average cost / valuation foundation
- purchase_in dari Goods Receipt/Vendor Bill
- sales_out dari Delivery Order/Sales Invoice direct jika diizinkan
- sales_return_in
- purchase_return_out
- stock adjustment
- stock opname basic
- inventory valuation report backend
- stock card report backend
- inventory movement report backend
- journal inventory dan COGS sesuai policy
- no double stock movement
- no frontend inventory
- integration tests lengkap

Jangan coding sekarang kecuali prompt ini memang disertai subphase work instruction.
Tugas prompt ini hanya menyimpan global rules Phase 12 ke docs/project memory dan memastikan semua aturan dipahami.
```
