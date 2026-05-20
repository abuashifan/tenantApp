# Prompt 2 — Phase 12A Inventory Foundation

```text
Kita lanjut Phase 12A project TenantAppDevelopment.

NAMA SUBPHASE:
Phase 12A — Inventory Foundation

WAJIB:
Sebelum mulai, baca kembali hasil Prompt 1 / Phase 12 Global Rules.
Pastikan docs/project memory menyimpan aturan global Phase 12.
Jangan melanggar rule:
- Phase 12 backend-first
- Tidak membuat frontend
- Tidak membuat FIFO/LIFO
- Tidak membuat landed cost advanced
- Tidak membuat batch/serial tracking
- Tidak membuat manufacturing/BOM

TUJUAN:
Menyiapkan fondasi inventory backend sebelum stock movement engine dibuat di Phase 12B.

Phase 12A fokus pada:
1. Config inventory
2. Permission inventory
3. Account mapping inventory
4. Document number modules inventory
5. Shared inventory services
6. Standard movement types/status
7. Dokumentasi awal Phase 12

FILE YANG WAJIB DIBACA:
- backend/routes/api.php
- backend/config/permissions.php
- backend/config/document_numbers.php jika ada
- backend/config/transaction_lifecycle.php jika ada
- backend/app/Models/Tenant/Product.php
- backend/app/Models/Tenant/Warehouse.php
- backend/app/Models/Tenant/Unit.php
- backend/app/Models/Tenant/AccountMapping.php
- backend/app/Models/Tenant/ChartOfAccount.php
- backend/app/Services/DocumentNumbering/DocumentNumberService.php
- backend/app/Services/Audit/AuditLogService.php
- backend/app/Services/Transactions/TransactionDateGuardService.php
- backend/app/Services/Journal/JournalEntryService.php
- docs/phase-9-sales-workflow-and-ar.md jika ada
- docs/phase-10-purchase-workflow-and-ap.md jika ada
- docs/phase-11-cash-bank-backend.md jika ada

JANGAN:
- membaca seluruh repository
- membuat frontend
- membuat stock movement full engine
- membuat stock balance update dulu
- membuat valuation engine penuh
- membuat Sales/Purchase integration penuh
- membuat adjustment/opname dulu

SCOPE PHASE 12A:
1. Tambahkan config inventory jika belum ada.
2. Tambahkan permission inventory.
3. Tambahkan document number modules inventory.
4. Tambahkan account mapping keys inventory.
5. Buat shared constants/enum/status jika pattern project mendukung.
6. Buat InventoryAccountMappingService.
7. Buat InventorySourceService.
8. Buat InventoryQuantityService.
9. Buat dokumentasi Phase 12 utama.
10. Buat test kecil untuk quantity/source/account mapping jika memungkinkan.

INVENTORY CONFIG:
Buat jika cocok:
backend/config/inventory.php

Isi minimal:
- valuation_method default moving_average
- allow_negative_stock default false
- recognize_inventory_on default goods_receipt
- allow_sales_invoice_direct_stock_issue default false
- allow_vendor_bill_direct_stock_receipt default true
- stock_precision default 4
- cost_precision default 6
- amount_precision default 2
- default_movement_statuses
- movement_types

INVENTORY DOCUMENT MODULES:
Tambahkan module numbering untuk:
- stock_movement
- stock_adjustment
- stock_opname
- stock_transfer optional jika simple transfer masuk
- opening_stock

INVENTORY PERMISSIONS:
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

ACCOUNT MAPPING KEYS:
Pastikan ada mapping atau dokumentasikan jika sudah ada:
- inventory
- inventory_interim
- cogs
- stock_adjustment_gain
- stock_adjustment_loss
- purchase_return
- sales_return
- inventory_write_off
- opening_stock_equity

INVENTORY MOVEMENT TYPE CONSTANT:
Buat jika project punya folder Enums/Support:
- purchase_in
- purchase_return_out
- sales_out
- sales_return_in
- adjustment_in
- adjustment_out
- opname_in
- opname_out
- transfer_in
- transfer_out
- opening_stock

MOVEMENT STATUS:
- draft
- posted
- void

STOCK ADJUSTMENT STATUS:
- draft
- approved
- posted
- void

STOCK OPNAME STATUS:
- draft
- counted
- finalized
- void

BUAT SERVICE:
Jika folder belum ada:
backend/app/Services/Inventory

Buat:
- InventoryAccountMappingService.php
- InventorySourceService.php
- InventoryQuantityService.php
- InventoryConfigService.php jika cocok

InventoryAccountMappingService minimal:
- getInventoryAccount()
- getInventoryInterimAccount()
- getCogsAccount()
- getStockAdjustmentGainAccount()
- getStockAdjustmentLossAccount()
- getPurchaseReturnAccount()
- getSalesReturnAccount()
- getOpeningStockEquityAccount()
- resolveRequiredAccount(string $key)

InventorySourceService minimal:
- buildSourcePayload(?string $sourceType, ?int $sourceId, ?string $sourceNumber = null, ?int $sourceRevision = null): array
- buildSourceLinePayload(?string $sourceLineType, ?int $sourceLineId): array
- assertNoDuplicateSourceMovement(string $sourceType, int $sourceId, ?int $sourceLineId = null): void jika stock_movements sudah ada; jika belum, siapkan method skeleton untuk Phase 12B

InventoryQuantityService minimal:
- normalizeQuantity(float|int|string $qty): string|float sesuai pattern project
- assertPositiveQuantity($qty): void
- assertNonNegativeQuantity($qty): void
- calculateRemainingQuantity($orderedQty, $movedQty): float
- assertDoesNotExceedRemaining($qty, $remainingQty): void

DOKUMENTASI:
Buat/update:
docs/phase-12-inventory-backend.md

Isi wajib:
- tujuan Phase 12
- global rules Phase 12
- backend-first
- no frontend inventory
- inventory movement types
- stock direction
- valuation method MVP moving average
- sales integration plan
- purchase integration plan
- account mapping
- permissions
- subphase 12A–12I
- batasan scope
- known limitations

TESTS:
Jika memungkinkan buat:
backend/tests/Unit/Inventory/InventoryQuantityServiceTest.php
backend/tests/Unit/Inventory/InventorySourceServiceTest.php

Test minimal:
- positive quantity accepted
- zero/negative quantity rejected where required
- remaining quantity calculation
- movement source payload generated
- movement line source payload generated

COMMANDS:
Jalankan jika environment memungkinkan:
- php artisan test --filter=InventoryQuantityServiceTest
- php artisan test --filter=InventorySourceServiceTest
- php artisan config:clear
- php artisan route:list

FINAL SUMMARY:
Sertakan:
- file dibuat
- file diubah
- permissions ditambahkan
- document number modules ditambahkan
- account mapping keys ditambahkan
- services dibuat
- tests dibuat
- docs dibuat/update
- command berhasil/gagal
- catatan bahwa Phase 12A belum membuat stock movement table/engine penuh
- catatan bahwa frontend inventory tetap Phase 17

COMMIT MESSAGE:
add inventory backend foundation
```
