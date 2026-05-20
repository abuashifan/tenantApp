# Prompt 4 — Phase 12C Stock Balance

```text
Kita lanjut Phase 12C project TenantAppDevelopment.

NAMA SUBPHASE:
Phase 12C — Stock Balance

WAJIB:
Baca hasil Phase 12A dan 12B.
Gunakan StockMovementService sebagai satu-satunya sumber perubahan stok.
Update docs/phase-12-inventory-backend.md.
Update project memory/context bahwa Phase 12C selesai.

TUJUAN:
Membuat stock balance backend per product + warehouse berdasarkan posted stock movements.

RULES:
- Stock balance tidak boleh diubah langsung oleh controller.
- Stock balance hanya berubah saat stock movement posted/void/reversal.
- Stock balance harus per tenant.
- Stock balance minimal per product + warehouse.
- Balance harus menyimpan quantity_on_hand, average_cost, total_value.
- Negative stock default tidak boleh kecuali config allow_negative_stock true.
- Historical movement tetap menjadi audit trail.
- Stock balance boleh direbuild dari stock movements.
- Rebuild harus command internal, bukan public endpoint.

FILE YANG WAJIB DIBACA:
- backend/app/Models/Tenant/StockMovement.php
- backend/app/Models/Tenant/StockMovementLine.php
- backend/app/Services/Inventory/StockMovementService.php
- backend/app/Services/Inventory/StockMovementValidationService.php
- backend/app/Services/Inventory/InventoryQuantityService.php
- backend/config/inventory.php jika ada
- backend/app/Models/Tenant/Product.php
- backend/app/Models/Tenant/Warehouse.php
- backend/routes/api.php
- backend/config/permissions.php

JANGAN:
- membuat frontend
- membuat valuation advanced
- membuat FIFO/LIFO
- membuat Sales/Purchase integration penuh
- membuat stock opname penuh
- membuat adjustment UI

TENANT MIGRATION:
Buat:
- create_stock_balances_table

stock_balances fields:
- id
- product_id
- warehouse_id
- quantity_on_hand decimal default 0
- quantity_reserved decimal default 0
- quantity_available decimal default 0
- average_cost decimal default 0
- total_value decimal default 0
- last_movement_id nullable
- last_movement_at nullable
- metadata nullable json/text
- timestamps

Constraints/index:
- unique product_id + warehouse_id
- index product_id
- index warehouse_id
- index quantity_on_hand

MODELS:
Buat:
- backend/app/Models/Tenant/StockBalance.php

Relations:
- product()
- warehouse()
- lastMovement()

Helpers:
- recalculateAvailable()
- isNegative()
- hasStock()

SERVICE:
Buat:
backend/app/Services/Inventory/StockBalanceService.php
backend/app/Services/Inventory/StockBalanceRebuildService.php

StockBalanceService methods:
- getOrCreateBalance(int $productId, int $warehouseId): StockBalance
- getBalance(int $productId, int $warehouseId): ?StockBalance
- applyMovementLine(StockMovementLine $line): StockBalance
- reverseMovementLine(StockMovementLine $line): StockBalance
- assertSufficientStock(int $productId, int $warehouseId, float $qty): void
- list(array $filters = [])
- getProductWarehouseBalance(int $productId, int $warehouseId): array

StockBalanceRebuildService methods:
- rebuildAll(): void
- rebuildProduct(int $productId): void
- rebuildWarehouse(int $warehouseId): void
- rebuildProductWarehouse(int $productId, int $warehouseId): void

Integrasi:
- Update StockMovementService::post() agar memanggil StockBalanceService.
- Update StockMovementService::void()/reversal agar balance ikut berubah sesuai policy.
- Jangan double apply movement jika movement sudah posted.

COMMAND INTERNAL:
Buat command internal:
php artisan inventory:rebuild-stock-balances

Options:
- --product-id=
- --warehouse-id=
- --all

Command ini bukan API public.

CONTROLLER:
Buat/lanjutkan:
backend/app/Http/Controllers/Api/Inventory/StockBalanceController.php

Methods:
- index
- showProductWarehouse optional
- byProduct optional
- byWarehouse optional

ROUTES:
GET /api/inventory/stock-balances
GET /api/inventory/stock-balances/product/{productId}
GET /api/inventory/stock-balances/warehouse/{warehouseId}

Permission:
- inventory.stock.view

FILTERS:
- product_id
- warehouse_id
- category_id
- search
- low_stock
- negative_stock
- include_zero

TESTS:
Buat:
backend/tests/Feature/Inventory/StockBalanceTest.php

Tests:
- posting IN movement increases stock balance
- posting OUT movement decreases stock balance
- cannot OUT more than available if negative disabled
- allow negative only if config enabled
- balance unique by product+warehouse
- void/reversal updates balance
- rebuild command rebuilds from posted movements
- draft movement does not affect balance
- void movement does not affect normal balance twice
- tenant isolation
- stock balance endpoint requires auth/company access/permission

DOKUMENTASI:
Update docs/phase-12-inventory-backend.md:
- Tambah Phase 12C
- Jelaskan stock balance table
- Jelaskan no direct mutation
- Jelaskan rebuild command
- Jelaskan negative stock policy
- Jelaskan relation stock movement -> stock balance

COMMANDS:
Jalankan jika bisa:
- php artisan test --filter=StockBalanceTest
- php artisan inventory:rebuild-stock-balances --all
- php artisan route:list

FINAL SUMMARY:
Sertakan file dibuat/diubah, migration, service, command, endpoint, tests, docs, command status.

COMMIT MESSAGE:
add stock balance backend
```
