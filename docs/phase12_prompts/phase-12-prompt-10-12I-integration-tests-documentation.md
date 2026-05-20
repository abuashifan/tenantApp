# Prompt 10 — Phase 12I Integration Tests & Documentation

```text
Kita lanjut Phase 12I project TenantAppDevelopment.

NAMA SUBPHASE:
Phase 12I — Integration Tests & Documentation

WAJIB:
Baca hasil Phase 12A–12H.
Jangan membuat fitur baru besar.
Fokus pada integration tests, consistency tests, route security, dokumentasi final, dan roadmap update.

TUJUAN:
Mengunci kualitas Phase 12 Inventory Backend agar siap lanjut ke Phase 13 Accounting Frontend MVP atau Phase 17 Inventory Frontend nanti.

SCOPE:
1. Full inventory workflow integration tests
2. Sales stock integration tests
3. Purchase stock integration tests
4. Valuation consistency tests
5. Stock balance rebuild tests
6. Stock card consistency tests
7. Period lock tests
8. Tenant isolation tests
9. Route security tests
10. Final docs Phase 12
11. Roadmap update

FILE YANG WAJIB DIBACA:
- docs/phase-12-inventory-backend.md
- docs/phase-9-sales-workflow-and-ar.md jika ada
- docs/phase-10-purchase-workflow-and-ap.md jika ada
- docs/phase-11-cash-bank-backend.md jika ada
- update-roadmap.md jika ada
- backend/routes/api.php
- backend/config/permissions.php
- backend/config/inventory.php jika ada
- backend/app/Services/Inventory/*
- backend/app/Models/Tenant/StockMovement.php
- backend/app/Models/Tenant/StockMovementLine.php
- backend/app/Models/Tenant/StockBalance.php
- backend/app/Models/Tenant/StockAdjustment.php jika ada
- backend/app/Models/Tenant/StockOpname.php jika ada

JANGAN:
- membuat frontend
- membuat export PDF/Excel
- membuat FIFO/LIFO
- membuat landed cost
- membuat serial/batch
- membuat advanced approval
- refactor besar Sales/Purchase/Cash Bank
- membuat fitur baru di luar test/docs kecuali bug fix kecil

INTEGRATION TESTS:
Buat/rapikan:
backend/tests/Feature/Inventory/InventoryWorkflowIntegrationTest.php
backend/tests/Feature/Inventory/InventoryConsistencyTest.php
backend/tests/Feature/Inventory/InventoryRouteSecurityTest.php

SCENARIO WAJIB:

1. Purchase to stock:
Purchase Order -> Goods Receipt
Expected:
- purchase_in stock movement created
- stock balance increases
- average cost updated
- inventory/interim journal created according to policy
- no duplicate movement

2. Purchase bill direct:
Vendor Bill direct with stockable product -> post
Expected:
- purchase_in created only if config allows
- stock balance increases
- average cost updated
- AP journal exists
- inventory journal policy consistent

3. Sales delivery:
Opening stock / purchase_in -> Sales Order -> Delivery Order delivered
Expected:
- sales_out stock movement created
- stock balance decreases
- COGS journal created
- Sales Invoice from DO does not create duplicate stock movement

4. Sales invoice direct:
Opening stock -> Sales Invoice direct
Expected:
- if config allows direct issue, sales_out created
- if config disables direct issue, no stock movement or blocked according to documented behavior

5. Sales return:
Sales out already exists -> Sales Return posted
Expected:
- sales_return_in created
- stock balance increases
- COGS reversed

6. Purchase return:
Purchase in already exists -> Purchase Return posted
Expected:
- purchase_return_out created
- stock balance decreases
- inventory value decreases

7. Stock adjustment:
Opening stock -> adjustment_in -> adjustment_out
Expected:
- movements created
- balance correct
- journals correct

8. Stock opname:
Opening stock -> stock opname physical qty different -> finalize
Expected:
- opname_in/opname_out movement created
- balance equals physical qty
- value consistent

9. Valuation consistency:
Expected:
- stock_balances.total_value equals inventory valuation total
- stock card ending quantity equals stock balance quantity
- stock card ending value equals stock balance value

10. Rebuild consistency:
Posted movements exist -> clear/rebuild stock balances using command/service
Expected:
- rebuilt stock balance equals pre-rebuild balance

11. Period lock:
Locked period -> attempt post stock movement/adjustment/opname
Expected:
- rejected
- no balance changed
- no journal created

12. Tenant isolation:
Company A movements do not affect Company B.
User A cannot access Company B inventory data.
X-Company-ID required.
Auth required.

13. Route security:
All /api/inventory/* routes protected by:
- auth:sanctum
- company.access
- permission where applicable
No public mutation route exists.

DOCS FINAL:
Update docs/phase-12-inventory-backend.md with final sections:
- Overview Phase 12
- Global rules
- Inventory architecture
- Stock movement engine
- Stock balance
- Average cost valuation
- Sales integration
- Purchase integration
- Stock adjustment
- Stock opname
- Inventory reports
- Journal posting rules
- Endpoint list
- Migration/table list
- Service list
- Test list
- Known limitations
- Next phase recommendation

KNOWN LIMITATIONS WAJIB DITULIS:
- No frontend inventory in Phase 12
- No FIFO/LIFO
- No landed cost advanced
- No batch/serial number tracking
- No barcode
- No mobile scanner
- No manufacturing/BOM
- No advanced warehouse transfer
- No export PDF/Excel
- No advanced stock reservation
- No reorder automation
- No inventory forecasting
- No multi-currency valuation advanced

ROADMAP UPDATE:
Update roadmap status:
Phase 12 — Inventory Backend: completed if tests/docs done.

Next:
Phase 13 — Accounting Frontend MVP
atau jika user ingin backend advanced dulu:
Phase 18+ sesuai roadmap, tetapi rekomendasi tetap lanjut Phase 13 frontend karena backend core sudah cukup luas.

COMMANDS:
Jalankan jika environment memungkinkan:
- php artisan test --filter=InventoryWorkflowIntegrationTest
- php artisan test --filter=InventoryConsistencyTest
- php artisan test --filter=InventoryRouteSecurityTest
- php artisan test --filter=Inventory
- php artisan test
- php artisan route:list

Jika command gagal karena environment, tulis jujur.

FINAL SUMMARY WAJIB:
Sertakan:
- ringkasan Phase 12A–12I
- file utama dibuat
- endpoint utama
- migrations utama
- services utama
- journals yang dibuat
- stock movement rules yang divalidasi
- valuation rules yang divalidasi
- tests dibuat
- command berhasil/gagal
- known limitations
- next phase recommendation

COMMIT MESSAGE:
complete inventory backend

COMMIT BODY:
Phase 12: complete backend-first Inventory module with inventory foundation, stock movement engine, stock balances, moving average valuation, sales and purchase stock integration, stock adjustment, stock opname basic, inventory reports, integration tests, route security tests, and documentation. Frontend inventory remains deferred to Phase 17. Advanced FIFO/LIFO, landed cost, batch/serial tracking, barcode, and export are out of scope.
```
