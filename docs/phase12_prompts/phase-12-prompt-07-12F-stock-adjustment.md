# Prompt 7 — Phase 12F Stock Adjustment

```text
Kita lanjut Phase 12F project TenantAppDevelopment.

NAMA SUBPHASE:
Phase 12F — Stock Adjustment

WAJIB:
Baca hasil Phase 12A–12E.
Gunakan StockMovementService untuk semua perubahan stok.
Update docs/phase-12-inventory-backend.md.
Update project memory/context bahwa Phase 12F selesai.

TUJUAN:
Membuat backend Stock Adjustment untuk koreksi stok manual yang terkontrol.

RULES:
- Stock Adjustment bukan edit stock balance langsung.
- Stock Adjustment membuat stock movement adjustment_in atau adjustment_out saat posted.
- Draft adjustment boleh diedit.
- Approved/posted adjustment tidak boleh diedit sembarangan.
- Posted adjustment harus audit log.
- Void adjustment harus reversal/void stock movement sesuai policy.
- Adjustment harus cek period lock.
- Adjustment harus cek permission.
- Adjustment bisa per warehouse.
- Adjustment line boleh punya reason.
- Adjustment value harus masuk journal:
  adjustment_in:
    Dr Inventory
        Cr Stock Adjustment Gain
  adjustment_out:
    Dr Stock Adjustment Loss
        Cr Inventory

STATUS:
- draft
- approved
- posted
- void

FILE YANG WAJIB DIBACA:
- backend/app/Services/Inventory/StockMovementService.php
- backend/app/Services/Inventory/StockBalanceService.php
- backend/app/Services/Inventory/AverageCostService.php
- backend/app/Services/Inventory/InventoryAccountMappingService.php
- backend/app/Services/DocumentNumbering/DocumentNumberService.php
- backend/app/Services/Transactions/TransactionDateGuardService.php
- backend/app/Services/Audit/AuditLogService.php
- backend/app/Models/Tenant/Product.php
- backend/app/Models/Tenant/Warehouse.php
- backend/routes/api.php
- backend/config/permissions.php

JANGAN:
- membuat frontend
- membuat stock opname penuh
- membuat transfer advanced
- membuat approval multi-level
- membuat FIFO/LIFO

TENANT MIGRATIONS:
Buat:
- create_stock_adjustments_table
- create_stock_adjustment_lines_table

stock_adjustments fields:
- id
- adjustment_number unique
- adjustment_date
- warehouse_id nullable
- status string default draft
- reason nullable
- notes nullable
- internal_notes nullable
- stock_movement_id nullable
- revision_no integer default 1
- created_by nullable
- updated_by nullable
- approved_by nullable
- posted_by nullable
- voided_by nullable
- approved_at nullable
- posted_at nullable
- voided_at nullable
- void_reason nullable
- metadata nullable json/text
- timestamps

stock_adjustment_lines fields:
- id
- stock_adjustment_id
- product_id
- warehouse_id
- unit_id nullable
- adjustment_type string
- quantity decimal
- unit_cost decimal nullable
- total_cost decimal nullable
- system_quantity_before decimal nullable
- system_value_before decimal nullable
- reason nullable
- department_id nullable
- project_id nullable
- sort_order integer default 0
- metadata nullable json/text
- timestamps

adjustment_type:
- increase
- decrease

MODELS:
Buat:
- StockAdjustment
- StockAdjustmentLine

Relations:
StockAdjustment:
- lines()
- stockMovement()
StockAdjustmentLine:
- adjustment()
- product()
- warehouse()
- unit()
- department()
- project()

SERVICE:
Buat:
backend/app/Services/Inventory/StockAdjustmentService.php

Methods:
- list(array $filters = [])
- find(int $id): StockAdjustment
- create(array $data): StockAdjustment
- update(StockAdjustment $adjustment, array $data): StockAdjustment
- approve(StockAdjustment $adjustment): StockAdjustment
- post(StockAdjustment $adjustment): StockAdjustment
- void(StockAdjustment $adjustment, ?string $reason = null): StockAdjustment
- createStockMovement(StockAdjustment $adjustment): StockMovement

Behavior:
- generate adjustment_number
- save header and lines transactionally
- draft can update
- approved can post
- posted creates stock movement
- line increase -> adjustment_in
- line decrease -> adjustment_out
- if decrease, assert sufficient stock unless negative stock allowed
- if increase, unit_cost required or fallback average cost according to config
- store system_quantity_before when creating/posting
- audit log each action

REQUESTS:
Buat:
- StoreStockAdjustmentRequest
- UpdateStockAdjustmentRequest
- StockAdjustmentActionRequest
- VoidStockAdjustmentRequest

Validation:
- adjustment_date required date
- warehouse_id nullable integer
- reason nullable string
- lines required array min 1
- lines.*.product_id required integer
- lines.*.warehouse_id required integer
- lines.*.adjustment_type required in increase,decrease
- lines.*.quantity required numeric gt 0
- lines.*.unit_cost nullable numeric min 0
- lines.*.reason nullable string
- lines.*.department_id nullable integer
- lines.*.project_id nullable integer

CONTROLLER:
Buat:
backend/app/Http/Controllers/Api/Inventory/StockAdjustmentController.php

Methods:
- index
- store
- show
- update
- approve
- post
- void

ROUTES:
GET /api/inventory/stock-adjustments
POST /api/inventory/stock-adjustments
GET /api/inventory/stock-adjustments/{id}
PATCH /api/inventory/stock-adjustments/{id}
PATCH /api/inventory/stock-adjustments/{id}/approve
PATCH /api/inventory/stock-adjustments/{id}/post
PATCH /api/inventory/stock-adjustments/{id}/void

Permissions:
- inventory.adjustments.view
- inventory.adjustments.create
- inventory.adjustments.edit
- inventory.adjustments.approve
- inventory.adjustments.post
- inventory.adjustments.void

TESTS:
Buat:
backend/tests/Feature/Inventory/StockAdjustmentTest.php

Tests:
- create draft stock adjustment
- update draft stock adjustment
- approve stock adjustment
- post increase adjustment creates adjustment_in movement
- post decrease adjustment creates adjustment_out movement
- increase updates stock balance and valuation
- decrease updates stock balance and valuation
- journal created for increase/decrease
- cannot decrease more than available if negative disabled
- cannot edit posted adjustment
- void posted adjustment reverses stock movement
- period lock blocks posting
- permission denied test
- tenant isolation

DOKUMENTASI:
Update docs/phase-12-inventory-backend.md:
- Tambah Phase 12F
- Jelaskan stock adjustment flow
- Jelaskan status
- Jelaskan journal impact
- Jelaskan no direct stock balance mutation
- Jelaskan limitations

COMMANDS:
Jalankan jika bisa:
- php artisan test --filter=StockAdjustmentTest
- php artisan route:list

FINAL SUMMARY:
Sertakan file dibuat/diubah, migration, endpoint, service, journal, tests, docs, command status.

COMMIT MESSAGE:
add stock adjustment backend
```
