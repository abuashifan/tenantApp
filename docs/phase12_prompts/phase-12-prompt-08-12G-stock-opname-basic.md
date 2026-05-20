# Prompt 8 — Phase 12G Stock Opname Basic

```text
Kita lanjut Phase 12G project TenantAppDevelopment.

NAMA SUBPHASE:
Phase 12G — Stock Opname Basic

WAJIB:
Baca hasil Phase 12A–12F.
Gunakan StockMovementService untuk adjustment hasil opname.
Update docs/phase-12-inventory-backend.md.
Update project memory/context bahwa Phase 12G selesai.

TUJUAN:
Membuat backend Stock Opname Basic untuk pencocokan stok fisik dengan stok sistem.

RULES:
- Stock opname membuat sesi per warehouse.
- User input physical_quantity.
- Sistem menyimpan system_quantity saat session dibuat atau saat line generated.
- Difference dihitung: difference = physical_quantity - system_quantity
- Jika difference positif -> opname_in
- Jika difference negatif -> opname_out
- Jika difference nol -> tidak perlu stock movement line
- Finalize opname membuat stock movement opname_in/opname_out.
- Stock opname finalized tidak boleh diedit.
- Void opname harus void/reverse stock movement sesuai policy.
- Stock opname harus audit log.
- Stock opname harus cek period lock saat finalize.
- Stock opname basic belum perlu barcode/import Excel/mobile scanner.

STATUS:
- draft
- counted
- finalized
- void

FILE YANG WAJIB DIBACA:
- backend/app/Services/Inventory/StockMovementService.php
- backend/app/Services/Inventory/StockBalanceService.php
- backend/app/Services/Inventory/AverageCostService.php
- backend/app/Services/Inventory/InventoryQuantityService.php
- backend/app/Services/DocumentNumbering/DocumentNumberService.php
- backend/app/Services/Audit/AuditLogService.php
- backend/app/Services/Transactions/TransactionDateGuardService.php
- backend/app/Models/Tenant/Product.php
- backend/app/Models/Tenant/Warehouse.php
- backend/routes/api.php
- backend/config/permissions.php

JANGAN:
- membuat frontend
- membuat barcode
- membuat import Excel
- membuat mobile scanner
- membuat cycle count advanced
- membuat approval multi-level

TENANT MIGRATIONS:
Buat:
- create_stock_opnames_table
- create_stock_opname_lines_table

stock_opnames fields:
- id
- opname_number unique
- opname_date
- warehouse_id
- status string default draft
- counted_at nullable
- finalized_at nullable
- stock_movement_id nullable
- notes nullable
- internal_notes nullable
- created_by nullable
- updated_by nullable
- counted_by nullable
- finalized_by nullable
- voided_by nullable
- voided_at nullable
- void_reason nullable
- metadata nullable json/text
- timestamps

stock_opname_lines fields:
- id
- stock_opname_id
- product_id
- warehouse_id
- unit_id nullable
- system_quantity decimal default 0
- physical_quantity decimal nullable
- difference_quantity decimal default 0
- average_cost decimal default 0
- difference_value decimal default 0
- reason nullable
- counted_by nullable
- counted_at nullable
- sort_order integer default 0
- metadata nullable json/text
- timestamps

MODELS:
Buat:
- StockOpname
- StockOpnameLine

Relations:
StockOpname:
- lines()
- warehouse()
- stockMovement()
StockOpnameLine:
- opname()
- product()
- warehouse()
- unit()

SERVICE:
Buat:
backend/app/Services/Inventory/StockOpnameService.php

Methods:
- list(array $filters = [])
- find(int $id): StockOpname
- createSession(array $data): StockOpname
- generateLinesFromStockBalance(StockOpname $opname): StockOpname
- updateLineCount(StockOpnameLine $line, array $data): StockOpnameLine
- markCounted(StockOpname $opname): StockOpname
- finalize(StockOpname $opname): StockOpname
- void(StockOpname $opname, ?string $reason = null): StockOpname
- createStockMovementFromDifferences(StockOpname $opname): ?StockMovement

Behavior:
- generate opname_number
- create session per warehouse
- generate lines from current stock balance
- store system_quantity snapshot
- physical_quantity can be input later
- calculate difference automatically
- finalize only if all required lines counted or allow_partial_count config true
- positive difference -> opname_in
- negative difference -> opname_out
- zero difference ignored for movement
- use average cost for difference value
- audit log each action

REQUESTS:
Buat:
- StoreStockOpnameRequest
- UpdateStockOpnameLineRequest
- StockOpnameActionRequest
- VoidStockOpnameRequest

Validation:
Store:
- opname_date required date
- warehouse_id required integer
- notes nullable string

Update line:
- physical_quantity required numeric min 0
- reason nullable string

CONTROLLER:
Buat:
backend/app/Http/Controllers/Api/Inventory/StockOpnameController.php

Methods:
- index
- store
- show
- generateLines
- updateLine
- markCounted
- finalize
- void

ROUTES:
GET /api/inventory/stock-opnames
POST /api/inventory/stock-opnames
GET /api/inventory/stock-opnames/{id}
POST /api/inventory/stock-opnames/{id}/generate-lines
PATCH /api/inventory/stock-opnames/{id}/lines/{lineId}
PATCH /api/inventory/stock-opnames/{id}/counted
PATCH /api/inventory/stock-opnames/{id}/finalize
PATCH /api/inventory/stock-opnames/{id}/void

Permissions:
- inventory.opname.view
- inventory.opname.create
- inventory.opname.edit
- inventory.opname.finalize

TESTS:
Buat:
backend/tests/Feature/Inventory/StockOpnameTest.php

Tests:
- create stock opname session
- generate lines from stock balance
- update physical quantity
- difference calculated correctly
- positive difference creates opname_in
- negative difference creates opname_out
- zero difference creates no movement line
- finalize updates stock balance
- finalize creates journal if valuation impact exists
- cannot edit finalized opname
- void finalized opname reverses stock movement
- period lock blocks finalize
- permission denied test
- tenant isolation

DOKUMENTASI:
Update docs/phase-12-inventory-backend.md:
- Tambah Phase 12G
- Jelaskan stock opname session
- Jelaskan system qty vs physical qty
- Jelaskan difference
- Jelaskan finalize behavior
- Jelaskan limitations: no barcode/import/mobile scanner

COMMANDS:
Jalankan jika bisa:
- php artisan test --filter=StockOpnameTest
- php artisan route:list

FINAL SUMMARY:
Sertakan file dibuat/diubah, migration, endpoint, service, stock movement behavior, tests, docs, command status.

COMMIT MESSAGE:
add basic stock opname backend
```
