# Prompt 9 — Phase 12H Inventory Reports Backend

```text
Kita lanjut Phase 12H project TenantAppDevelopment.

NAMA SUBPHASE:
Phase 12H — Inventory Reports Backend

WAJIB:
Baca hasil Phase 12A–12G.
Gunakan stock movements, stock balances, average cost, dan valuation services.
Update docs/phase-12-inventory-backend.md.
Update project memory/context bahwa Phase 12H selesai.

TUJUAN:
Membuat backend report inventory dasar.

Reports:
1. Stock Balance Report
2. Stock Movement Report
3. Stock Card Report
4. Inventory Valuation Report
5. Low Stock / Negative Stock Report basic

RULES:
- Reports read-only.
- Reports hanya membaca posted movements dan current stock balance.
- Draft movement tidak masuk.
- Void movement tidak masuk normal report kecuali include_void true.
- Support filter product, warehouse, category, date range.
- Stock card harus menunjukkan running quantity dan running value.
- Valuation harus memakai average cost.
- Tidak membuat export PDF/Excel.
- Tidak membuat frontend.
- Report endpoint wajib auth:sanctum + company.access + permission.

FILE YANG WAJIB DIBACA:
- backend/app/Models/Tenant/StockMovement.php
- backend/app/Models/Tenant/StockMovementLine.php
- backend/app/Models/Tenant/StockBalance.php
- backend/app/Services/Inventory/InventoryValuationService.php
- backend/app/Services/Inventory/StockBalanceService.php
- backend/app/Services/Reports/* jika ada
- backend/app/Services/Report/* jika ada
- backend/routes/api.php
- backend/config/permissions.php

JANGAN:
- membuat frontend
- membuat export PDF/Excel
- membuat advanced dashboard
- membuat forecasting
- membuat reorder automation
- membuat inventory trend advanced

SERVICE:
Buat:
backend/app/Services/Inventory/Reports/StockBalanceReportService.php
backend/app/Services/Inventory/Reports/StockMovementReportService.php
backend/app/Services/Inventory/Reports/StockCardReportService.php
backend/app/Services/Inventory/Reports/InventoryValuationReportService.php
backend/app/Services/Inventory/Reports/InventoryAlertReportService.php

StockBalanceReportService:
- report(array $filters = []): array
- byProduct(int $productId): array
- byWarehouse(int $warehouseId): array

StockMovementReportService:
- report(array $filters = []): array
- movementSummary(array $filters = []): array

StockCardReportService:
- card(int $productId, ?int $warehouseId, array $filters = []): array
- runningBalances(array $movementLines): array

InventoryValuationReportService:
- current(array $filters = []): array
- asOf(string $date, array $filters = []): array
- summaryByWarehouse(array $filters = []): array
- summaryByCategory(array $filters = []): array

InventoryAlertReportService:
- lowStock(array $filters = []): array
- negativeStock(array $filters = []): array
- zeroStock(array $filters = []): array

CONTROLLERS:
Buat:
backend/app/Http/Controllers/Api/Inventory/InventoryReportController.php

Methods:
- stockBalances
- stockMovements
- stockCard
- valuation
- lowStock
- negativeStock

ROUTES:
GET /api/inventory/reports/stock-balances
GET /api/inventory/reports/stock-movements
GET /api/inventory/reports/stock-card
GET /api/inventory/reports/valuation
GET /api/inventory/reports/low-stock
GET /api/inventory/reports/negative-stock

Permission:
- inventory.reports.view
- inventory.valuation.view for valuation if separated

FILTERS:
Common:
- start_date
- end_date
- as_of_date
- product_id
- warehouse_id
- category_id
- search
- include_zero
- include_void
- include_negative
- per_page

Stock card required:
- product_id required
- warehouse_id nullable

RESPONSE STANDARD:
Stock Balance:
- product
- warehouse
- quantity_on_hand
- quantity_reserved
- quantity_available
- average_cost
- total_value

Stock Movement:
- movement_date
- movement_number
- movement_type
- source_type
- source_number
- product
- warehouse
- quantity_in
- quantity_out
- unit_cost
- total_cost

Stock Card:
- opening_quantity
- opening_value
- movements[]
  - date
  - number
  - type
  - qty_in
  - qty_out
  - running_quantity
  - unit_cost
  - value_in
  - value_out
  - running_value
- ending_quantity
- ending_value

Valuation:
- total_quantity
- total_value
- rows by product/warehouse
- average_cost

TESTS:
Buat:
backend/tests/Feature/Inventory/InventoryReportTest.php

Tests:
- stock balance report returns current balances
- stock movement report excludes draft
- stock movement report excludes void unless include_void true
- stock card running quantity correct
- stock card running value correct
- valuation current equals stock balance total values
- valuation as_of date works if implemented
- filter by product
- filter by warehouse
- filter by date range
- low stock report works if min stock exists
- negative stock report works
- permission denied test
- tenant isolation

DOKUMENTASI:
Update docs/phase-12-inventory-backend.md:
- Tambah Phase 12H
- Jelaskan report endpoints
- Jelaskan filter
- Jelaskan response shape
- Jelaskan limitation: no export/no frontend/no advanced trend

COMMANDS:
Jalankan jika bisa:
- php artisan test --filter=InventoryReportTest
- php artisan route:list

FINAL SUMMARY:
Sertakan file dibuat/diubah, endpoint, services, tests, docs, command status.

COMMIT MESSAGE:
add inventory backend reports
```
