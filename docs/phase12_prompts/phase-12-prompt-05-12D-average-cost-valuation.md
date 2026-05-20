# Prompt 5 — Phase 12D Average Cost / Valuation Foundation

```text
Kita lanjut Phase 12D project TenantAppDevelopment.

NAMA SUBPHASE:
Phase 12D — Average Cost / Valuation Foundation

WAJIB:
Baca hasil Phase 12A–12C.
Gunakan stock_movements, stock_movement_lines, dan stock_balances sebagai dasar valuation.
Update docs/phase-12-inventory-backend.md.
Update project memory/context bahwa Phase 12D selesai.

TUJUAN:
Membuat fondasi average cost dan inventory valuation backend.

RULES:
- Metode MVP: moving average / average cost.
- Average cost dihitung per product + warehouse.
- IN movement dengan unit cost menambah total value dan menghitung average cost baru.
- OUT movement memakai average cost current sebelum movement.
- total_value = quantity_on_hand * average_cost.
- Valuation harus dapat direbuild dari posted movements.
- Draft/void movement tidak masuk valuation normal.
- Tidak membuat FIFO/LIFO.
- Tidak membuat landed cost advanced.
- Tidak membuat standard cost.
- Tidak membuat batch/serial valuation.

FILE YANG WAJIB DIBACA:
- backend/app/Models/Tenant/StockMovement.php
- backend/app/Models/Tenant/StockMovementLine.php
- backend/app/Models/Tenant/StockBalance.php
- backend/app/Services/Inventory/StockMovementService.php
- backend/app/Services/Inventory/StockBalanceService.php
- backend/app/Services/Inventory/StockBalanceRebuildService.php
- backend/app/Services/Inventory/InventoryAccountMappingService.php
- backend/app/Services/Journal/JournalEntryService.php
- backend/config/inventory.php jika ada
- backend/routes/api.php
- backend/config/permissions.php

JANGAN:
- membuat frontend
- membuat FIFO/LIFO
- membuat landed cost advanced
- membuat warehouse transfer advanced
- membuat report frontend
- membuat export PDF/Excel

TENANT MIGRATION:
Jika diperlukan buat:
- create_inventory_valuation_snapshots_table optional

inventory_valuation_snapshots fields optional:
- id
- snapshot_date
- product_id nullable
- warehouse_id nullable
- quantity_on_hand decimal
- average_cost decimal
- total_value decimal
- source string nullable
- created_by nullable
- metadata nullable json/text
- timestamps

Catatan:
- Snapshot optional.
- Jika belum dibutuhkan, cukup valuation service dari stock_balances dan stock_movements.
- Jangan over-engineer.

SERVICE:
Buat:
backend/app/Services/Inventory/AverageCostService.php
backend/app/Services/Inventory/InventoryValuationService.php

AverageCostService methods:
- calculateIncomingAverageCost(float $qtyBefore, float $valueBefore, float $incomingQty, float $incomingUnitCost): array
- calculateOutgoingCost(float $currentAverageCost, float $outgoingQty): array
- applyIncoming(StockBalance $balance, StockMovementLine $line): StockBalance
- applyOutgoing(StockBalance $balance, StockMovementLine $line): StockBalance
- resolveUnitCostForReturn(StockMovementLine $line): float

InventoryValuationService methods:
- valuationAsOf(?string $date = null, array $filters = []): array
- currentValuation(array $filters = []): array
- valuationByProduct(int $productId, array $filters = []): array
- valuationByWarehouse(int $warehouseId, array $filters = []): array
- reconcileWithGL(?string $date = null): array optional if GL service ready

Update StockBalanceService:
- apply IN movement should update average_cost and total_value
- apply OUT movement should use current average_cost and update total_value
- StockMovementLine should store:
  - average_cost_before
  - average_cost_after
  - quantity_before
  - quantity_after
  - value_before
  - value_after

JOURNAL INTEGRATION:
Pastikan journal inventory memakai total_cost dari StockMovementLine.
Untuk sales_out:
- total_cost = quantity * average_cost_before
- Journal:
  Dr COGS
      Cr Inventory

Untuk adjustment_out:
- total_cost = quantity * average_cost_before
- Journal:
  Dr Stock Adjustment Loss
      Cr Inventory

Untuk adjustment_in:
- total_cost = quantity * unit_cost
- Journal:
  Dr Inventory
      Cr Stock Adjustment Gain

CONTROLLER:
Buat:
backend/app/Http/Controllers/Api/Inventory/InventoryValuationController.php

Methods:
- current
- asOf
- byProduct
- byWarehouse

ROUTES:
GET /api/inventory/valuation
GET /api/inventory/valuation/as-of
GET /api/inventory/valuation/products/{productId}
GET /api/inventory/valuation/warehouses/{warehouseId}

Permission:
- inventory.valuation.view

FILTERS:
- as_of_date
- product_id
- warehouse_id
- category_id
- include_zero
- include_negative

TESTS:
Buat:
backend/tests/Feature/Inventory/AverageCostValuationTest.php

Tests:
- first incoming sets average cost
- second incoming recalculates moving average
- outgoing uses average cost before movement
- outgoing reduces value correctly
- adjustment_in affects average cost
- adjustment_out uses current average cost
- valuation excludes draft and void movement
- valuation by warehouse correct
- valuation by product correct
- stock balance total_value equals quantity * average_cost
- sales_out journal uses average cost
- tenant isolation

DOKUMENTASI:
Update docs/phase-12-inventory-backend.md:
- Tambah Phase 12D
- Jelaskan moving average method
- Jelaskan IN/OUT valuation formula
- Jelaskan relation stock balance dengan valuation
- Jelaskan limitation: no FIFO/LIFO/landed cost/batch/serial

COMMANDS:
Jalankan jika bisa:
- php artisan test --filter=AverageCostValuationTest
- php artisan route:list

FINAL SUMMARY:
Sertakan file dibuat/diubah, migration jika ada, services, endpoint, journal impact, tests, docs, command status.

COMMIT MESSAGE:
add average cost inventory valuation foundation
```
