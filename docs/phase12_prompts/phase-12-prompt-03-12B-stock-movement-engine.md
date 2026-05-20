# Prompt 3 — Phase 12B Stock Movement Engine

```text
Kita lanjut Phase 12B project TenantAppDevelopment.

NAMA SUBPHASE:
Phase 12B — Stock Movement Engine

WAJIB:
Baca hasil Phase 12A terlebih dahulu.
Gunakan InventoryAccountMappingService, InventorySourceService, dan InventoryQuantityService dari Phase 12A.
Update docs/phase-12-inventory-backend.md setelah selesai.
Update project memory/context bahwa Phase 12B selesai.

TUJUAN:
Membuat stock movement engine sebagai pusat semua perubahan stok.

RULES:
- Semua perubahan stok wajib melalui stock_movements dan stock_movement_lines.
- Stock movement posted tidak boleh diedit.
- Void stock movement harus membuat reversal atau menandai void sesuai policy existing.
- Stock movement harus tenant-aware.
- Stock movement harus cek period lock.
- Stock movement harus audit log.
- Stock movement harus bisa source dari goods_receipt, vendor_bill direct, delivery_order, sales_invoice direct jika diizinkan, purchase_return, sales_return, stock_adjustment, stock_opname, opening_stock.
- Tidak boleh double movement dari source yang sama.
- Jangan update stock balance dulu secara penuh jika Phase 12C belum siap; tetapi siapkan event/hook/service method.

STATUS:
- draft
- posted
- void

FILE YANG WAJIB DIBACA:
- backend/app/Services/Inventory/*
- backend/app/Services/DocumentNumbering/DocumentNumberService.php
- backend/app/Services/Transactions/TransactionDateGuardService.php
- backend/app/Services/Transactions/TransactionDependencyService.php
- backend/app/Services/Audit/AuditLogService.php
- backend/app/Services/Journal/JournalEntryService.php
- backend/app/Models/Tenant/Product.php
- backend/app/Models/Tenant/Warehouse.php
- backend/app/Models/Tenant/Unit.php
- backend/app/Models/Tenant/AccountMapping.php
- backend/routes/api.php
- backend/config/permissions.php
- backend/config/inventory.php jika ada

JANGAN:
- membuat frontend
- membuat Sales/Purchase integration penuh
- membuat adjustment/opname penuh
- membuat FIFO/LIFO
- membuat landed cost
- membuat stock card report lengkap

TENANT MIGRATIONS:
Buat:
- create_stock_movements_table
- create_stock_movement_lines_table

stock_movements fields:
- id
- movement_number unique
- movement_date
- movement_type string
- direction string nullable
- status string default draft
- source_type nullable
- source_id nullable
- source_number nullable
- source_revision nullable
- warehouse_id nullable
- description nullable
- notes nullable
- internal_notes nullable
- total_quantity decimal default 0
- total_value decimal default 0
- journal_entry_id nullable
- reversal_of_id nullable
- reversed_by_id nullable
- revision_no integer default 1
- created_by nullable
- updated_by nullable
- posted_by nullable
- voided_by nullable
- posted_at nullable
- voided_at nullable
- void_reason nullable
- metadata nullable json/text
- timestamps

stock_movement_lines fields:
- id
- stock_movement_id
- movement_type string
- direction string
- product_id
- product_code nullable
- warehouse_id
- unit_id nullable
- quantity decimal
- unit_cost decimal default 0
- total_cost decimal default 0
- average_cost_before decimal nullable
- average_cost_after decimal nullable
- quantity_before decimal nullable
- quantity_after decimal nullable
- value_before decimal nullable
- value_after decimal nullable
- source_line_type nullable
- source_line_id nullable
- department_id nullable
- project_id nullable
- sort_order integer default 0
- metadata nullable json/text
- timestamps

Indexes:
- stock_movements movement_date
- stock_movements movement_type
- stock_movements status
- stock_movements source_type/source_id
- stock_movement_lines product_id
- stock_movement_lines warehouse_id
- stock_movement_lines stock_movement_id
- stock_movement_lines source_line_type/source_line_id

MODELS:
Buat:
- backend/app/Models/Tenant/StockMovement.php
- backend/app/Models/Tenant/StockMovementLine.php

Relations:
StockMovement:
- lines()
- journalEntry()
- reversalOf()
- reversedBy()
StockMovementLine:
- stockMovement()
- product()
- warehouse()
- unit()
- department()
- project()

SERVICE:
Buat:
- backend/app/Services/Inventory/StockMovementService.php
- backend/app/Services/Inventory/StockMovementValidationService.php
- backend/app/Services/Inventory/StockMovementJournalService.php jika journal dipisah

StockMovementService methods:
- list(array $filters = [])
- find(int $id): StockMovement
- createDraft(array $data): StockMovement
- post(StockMovement $movement): StockMovement
- void(StockMovement $movement, ?string $reason = null): StockMovement
- createAndPost(array $data): StockMovement
- createReversal(StockMovement $movement, ?string $reason = null): StockMovement
- assertSourceNotAlreadyMoved(string $sourceType, int $sourceId, ?int $sourceLineId = null): void

StockMovementValidationService:
- validateMovementType(string $type): void
- validateDirection(string $direction): void
- validateLines(array $lines): void
- validateProductIsStockable(Product $product): void
- validateWarehouseExists(int $warehouseId): void
- validateNoDuplicateSource(array $data): void
- validatePeriodNotLocked(string $movementDate): void
- validateCannotEditPosted(StockMovement $movement): void

StockMovementJournalService:
- createInventoryJournalForMovement(StockMovement $movement): ?JournalEntry
- createCogsJournalForSalesOut(StockMovement $movement): ?JournalEntry
- createAdjustmentJournal(StockMovement $movement): ?JournalEntry
- createReturnJournal(StockMovement $movement): ?JournalEntry

Journal behavior minimal:
- sales_out:
  Dr COGS
      Cr Inventory
- sales_return_in:
  Dr Inventory
      Cr COGS
- adjustment_in:
  Dr Inventory
      Cr Stock Adjustment Gain
- adjustment_out:
  Dr Stock Adjustment Loss
      Cr Inventory
- opening_stock:
  Dr Inventory
      Cr Opening Stock Equity
- purchase_in journal boleh ditunda ke Phase 12E integration jika kebijakan membutuhkan goods receipt/vendor bill context.

REQUESTS:
Buat:
- StoreStockMovementRequest
- PostStockMovementRequest jika perlu
- VoidStockMovementRequest

Validation:
- movement_date required date
- movement_type required string
- source_type nullable string
- source_id nullable integer
- warehouse_id nullable integer
- lines required array min 1
- lines.*.product_id required integer
- lines.*.warehouse_id required integer
- lines.*.quantity required numeric gt 0
- lines.*.unit_cost nullable numeric min 0
- lines.*.department_id nullable integer
- lines.*.project_id nullable integer

CONTROLLER:
Buat:
backend/app/Http/Controllers/Api/Inventory/StockMovementController.php

Methods:
- index
- store
- show
- post
- void

ROUTES:
Tambahkan route dalam group auth:sanctum + company.access:
prefix inventory

GET /api/inventory/stock-movements
POST /api/inventory/stock-movements
GET /api/inventory/stock-movements/{id}
PATCH /api/inventory/stock-movements/{id}/post
PATCH /api/inventory/stock-movements/{id}/void

Permissions:
- inventory.movements.view
- inventory.movements.create
- inventory.movements.post
- inventory.movements.void

TESTS:
Buat:
backend/tests/Feature/Inventory/StockMovementTest.php

Tests minimal:
- unauthenticated rejected
- missing X-Company-ID rejected
- can create draft stock movement
- can post opening stock movement
- can post adjustment_in movement
- can post adjustment_out movement
- posted movement cannot be edited
- can void posted movement using reversal/void policy
- cannot double post same source
- period lock blocks posting
- non-stockable product rejected if product has stockable flag
- tenant isolation
- journal created for sales_out/adjustment if implemented in 12B
- no frontend changes

DOKUMENTASI:
Update docs/phase-12-inventory-backend.md:
- Tambah Phase 12B
- Jelaskan stock movement tables
- Jelaskan movement status
- Jelaskan direction
- Jelaskan no direct stock balance mutation
- Jelaskan journal behavior awal
- Jelaskan integration ke stock balance akan dilanjutkan di Phase 12C

COMMANDS:
Jalankan jika bisa:
- php artisan migrate atau tenant:migrate sesuai project
- php artisan test --filter=StockMovementTest
- php artisan route:list

FINAL SUMMARY:
Sertakan file dibuat/diubah, migration, endpoint, service, journal behavior, tests, docs, command status.

COMMIT MESSAGE:
add stock movement engine
```
