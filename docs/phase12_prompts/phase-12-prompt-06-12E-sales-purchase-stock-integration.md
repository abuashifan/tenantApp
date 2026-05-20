# Prompt 6 — Phase 12E Sales & Purchase Stock Integration

```text
Kita lanjut Phase 12E project TenantAppDevelopment.

NAMA SUBPHASE:
Phase 12E — Sales & Purchase Stock Integration

WAJIB:
Baca hasil Phase 12A–12D.
Baca hasil Phase 9 dan Phase 10 yang relevan.
Update docs/phase-12-inventory-backend.md.
Update docs Phase 9/10 jika perlu bagian integration note.
Update project memory/context bahwa Phase 12E selesai.

TUJUAN:
Menghubungkan stock movement engine dengan dokumen Sales dan Purchase yang sebelumnya hanya dokumen operasional.

Integrasi utama:
1. Delivery Order -> stock movement sales_out
2. Sales Invoice direct -> stock movement sales_out jika diizinkan config
3. Sales Return -> stock movement sales_return_in
4. Goods Receipt -> stock movement purchase_in
5. Vendor Bill direct -> stock movement purchase_in jika diizinkan config
6. Purchase Return -> stock movement purchase_return_out
7. Hindari double stock movement antar source document

RULES:
- Jangan membuat ulang modul Sales/Purchase.
- Integrasi harus minimal dan aman.
- Jangan mengubah flow besar Phase 9/10.
- Jangan membuat stock movement ganda.
- Jika Delivery Order sudah membuat sales_out, Sales Invoice dari Delivery Order tidak boleh membuat sales_out lagi.
- Jika Goods Receipt sudah membuat purchase_in, Vendor Bill dari Goods Receipt tidak boleh membuat purchase_in lagi.
- Direct Sales Invoice stock issue tergantung config allow_sales_invoice_direct_stock_issue.
- Direct Vendor Bill stock receipt tergantung config allow_vendor_bill_direct_stock_receipt.
- Semua stock movement harus posted melalui StockMovementService.
- Semua stock movement harus tenant-aware.
- Semua journal inventory/COGS harus dibuat sesuai movement.

FILE YANG WAJIB DIBACA:
Inventory:
- backend/app/Services/Inventory/StockMovementService.php
- backend/app/Services/Inventory/StockBalanceService.php
- backend/app/Services/Inventory/AverageCostService.php
- backend/app/Services/Inventory/InventoryValuationService.php
- backend/config/inventory.php

Sales:
- backend/app/Models/Tenant/DeliveryOrder.php jika ada
- backend/app/Models/Tenant/DeliveryOrderLine.php jika ada
- backend/app/Models/Tenant/SalesInvoice.php jika ada
- backend/app/Models/Tenant/SalesInvoiceLine.php jika ada
- backend/app/Models/Tenant/SalesReturn.php jika ada
- backend/app/Services/Sales/DeliveryOrderService.php jika ada
- backend/app/Services/Sales/SalesInvoiceService.php jika ada
- backend/app/Services/Sales/SalesReturnService.php jika ada

Purchase:
- backend/app/Models/Tenant/GoodsReceipt.php jika ada
- backend/app/Models/Tenant/GoodsReceiptLine.php jika ada
- backend/app/Models/Tenant/VendorBill.php jika ada
- backend/app/Models/Tenant/VendorBillLine.php jika ada
- backend/app/Models/Tenant/PurchaseReturn.php jika ada
- backend/app/Services/Purchase/GoodsReceiptService.php jika ada
- backend/app/Services/Purchase/VendorBillService.php jika ada
- backend/app/Services/Purchase/PurchaseReturnService.php jika ada

Foundation:
- backend/app/Services/Journal/JournalEntryService.php
- backend/app/Services/Audit/AuditLogService.php
- backend/app/Services/Transactions/TransactionDateGuardService.php
- backend/routes/api.php
- backend/config/permissions.php

JANGAN:
- membuat frontend
- membuat ulang Sales/Purchase migration besar
- membuat ulang Sales/Purchase services dari nol
- membuat FIFO/LIFO
- membuat landed cost advanced
- membuat advanced return workflow

SERVICE:
Buat:
backend/app/Services/Inventory/InventorySalesIntegrationService.php
backend/app/Services/Inventory/InventoryPurchaseIntegrationService.php

InventorySalesIntegrationService methods:
- createSalesOutFromDeliveryOrder(DeliveryOrder $deliveryOrder): StockMovement
- createSalesOutFromSalesInvoice(SalesInvoice $invoice): ?StockMovement
- createSalesReturnIn(SalesReturn $return): StockMovement
- assertNoDuplicateSalesMovement(string $sourceType, int $sourceId): void
- shouldCreateStockFromSalesInvoice(SalesInvoice $invoice): bool

InventoryPurchaseIntegrationService methods:
- createPurchaseInFromGoodsReceipt(GoodsReceipt $goodsReceipt): StockMovement
- createPurchaseInFromVendorBill(VendorBill $bill): ?StockMovement
- createPurchaseReturnOut(PurchaseReturn $return): StockMovement
- assertNoDuplicatePurchaseMovement(string $sourceType, int $sourceId): void
- shouldCreateStockFromVendorBill(VendorBill $bill): bool

UPDATE SALES SERVICES:
Minimal integration point:
- DeliveryOrderService when delivered/posted:
  call createSalesOutFromDeliveryOrder()
- SalesInvoiceService when posted:
  if direct and config allows, call createSalesOutFromSalesInvoice()
- SalesReturnService when posted:
  call createSalesReturnIn()

UPDATE PURCHASE SERVICES:
Minimal integration point:
- GoodsReceiptService when received/posted:
  call createPurchaseInFromGoodsReceipt()
- VendorBillService when posted:
  if direct and config allows, call createPurchaseInFromVendorBill()
- PurchaseReturnService when posted:
  call createPurchaseReturnOut()

JOURNAL RULES:
Goods Receipt purchase_in:
Dr Inventory
    Cr Inventory Interim

Vendor Bill from Goods Receipt:
Dr Inventory Interim
Dr Input Tax
    Cr Accounts Payable

Vendor Bill direct inventory item:
Dr Inventory
Dr Input Tax
    Cr Accounts Payable

Delivery Order sales_out:
Dr COGS
    Cr Inventory

Sales Invoice from Delivery Order:
Dr Accounts Receivable
    Cr Revenue
    Cr Output Tax
No stock movement here because DO already moved stock.

Sales Invoice direct stock issue if allowed:
- creates sales_out and COGS journal
- also posts AR/revenue journal
- ensure no duplicate stock movement

Sales Return:
Dr Inventory
    Cr COGS

Purchase Return:
Cr Inventory via movement journal, debit side follows existing purchase return/AP policy.

STOCKABLE PRODUCT RULE:
Only stockable products create stock movement.
If product is service/non-stock:
- no stock movement
- no inventory valuation
- no COGS from inventory
If product model does not have is_stockable field:
- use existing product type field if available
- if no field exists, document fallback and avoid schema changes unless necessary
- if necessary, add is_stockable boolean to products with default true/false according to existing product type policy

DUPLICATE PREVENTION:
Use stock_movements source_type + source_id + source_line_id where possible.
Examples:
- source_type = delivery_order
- source_id = delivery_orders.id
- source_line_type = delivery_order_line
- source_line_id = delivery_order_lines.id

Tests must verify:
- Delivery Order creates stock movement once
- rerunning deliver does not duplicate
- Sales Invoice from Delivery Order does not duplicate
- Goods Receipt creates stock movement once
- Vendor Bill from Goods Receipt does not duplicate

TESTS:
Buat:
backend/tests/Feature/Inventory/InventorySalesIntegrationTest.php
backend/tests/Feature/Inventory/InventoryPurchaseIntegrationTest.php

Sales integration tests:
- Delivery Order delivered creates sales_out stock movement
- sales_out reduces stock balance
- sales_out creates COGS journal
- Sales Invoice from Delivery Order does not create duplicate sales_out
- Sales Invoice direct creates sales_out only if config enabled
- Sales Return posted creates sales_return_in
- non-stockable product does not create stock movement
- insufficient stock blocks sales_out
- tenant isolation

Purchase integration tests:
- Goods Receipt received creates purchase_in stock movement
- purchase_in increases stock balance
- purchase_in updates average cost
- Vendor Bill from Goods Receipt does not duplicate purchase_in
- Vendor Bill direct creates purchase_in only if config enabled
- Purchase Return posted creates purchase_return_out
- purchase_return_out reduces stock balance
- tenant isolation

DOKUMENTASI:
Update docs/phase-12-inventory-backend.md:
- Tambah Phase 12E
- Jelaskan Sales integration
- Jelaskan Purchase integration
- Jelaskan no double movement rule
- Jelaskan source chain mapping
- Jelaskan journal behavior
- Jelaskan config direct invoice/bill movement
- Jelaskan limitation

COMMANDS:
Jalankan jika bisa:
- php artisan test --filter=InventorySalesIntegrationTest
- php artisan test --filter=InventoryPurchaseIntegrationTest
- php artisan route:list

FINAL SUMMARY:
Sertakan file dibuat/diubah, integration point, journal behavior, tests, docs, command status.

COMMIT MESSAGE:
integrate inventory stock movements with sales and purchase
```
