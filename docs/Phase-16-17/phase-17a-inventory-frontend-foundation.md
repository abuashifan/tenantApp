# Phase 17A — Inventory Frontend Foundation

```text
Kita lanjut Phase 17 project TenantAppDevelopment.

NAMA PHASE:
Phase 17 — Inventory Frontend MVP

NAMA SUBPHASE:
Phase 17A — Inventory Frontend Foundation

KONTEKS PROJECT:
Project ini adalah aplikasi akuntansi multi-tenant:
- Backend: Laravel API
- Frontend: Next.js
- Styling: TailwindCSS
- Database: SQLite untuk MVP/development
- 1 company = 1 tenant database
- Frontend request memakai Bearer token + X-Company-ID
- Semua halaman inventory harus permission-aware dan tenant-aware

STATUS SEBELUM PHASE 17:
Diasumsikan sudah selesai:
- Phase 12 — Inventory Backend
- Phase 13 — Accounting Frontend MVP
- Phase 14 — Sales Frontend MVP
- Phase 15 — Purchase Frontend MVP
- Phase 16 — Cash Bank Frontend MVP

TUJUAN:
Membuat fondasi frontend inventory agar subphase 17B–17G konsisten.

SCOPE:
1. Inventory menu integration.
2. Inventory route structure.
3. Inventory permission guard.
4. Inventory layout consistency.
5. Reusable stock table pattern.
6. Reusable stock form pattern.
7. Reusable stock badge/status.
8. Loading/error/empty states.
9. Docs Phase 17A.

WAJIB BACA FILE TERBATAS:
- frontend/lib/api.ts
- frontend/types/api.ts
- frontend/components/layout/AppShell.tsx
- frontend/app/dashboard/page.tsx
- frontend/app/accounting/*
- frontend/app/sales/* jika ada
- frontend/app/purchase/* jika ada
- frontend/app/cash-bank/* jika ada
- frontend/components/ui/*
- frontend/features/*
- backend/routes/api.php hanya endpoint inventory
- docs/update-roadmap.md
- docs/phase-12-inventory-backend.md jika ada
- docs/phase-16-cash-bank-frontend-mvp.md jika ada

JANGAN:
- Membaca seluruh repository.
- Membuat backend inventory baru.
- Membuat endpoint backend baru.
- Mengubah stock movement engine backend.
- Mengubah inventory valuation backend.
- Membuat export PDF/Excel.
- Membuat role management.
- Membuat dashboard analytics besar.

ROUTE FRONTEND:
Siapkan:
- /inventory
- /inventory/stocks
- /inventory/stocks/[productId]
- /inventory/warehouses/[warehouseId]/stocks
- /inventory/movements
- /inventory/movements/[id]
- /inventory/adjustments
- /inventory/adjustments/create
- /inventory/adjustments/[id]
- /inventory/adjustments/[id]/edit
- /inventory/opname
- /inventory/opname/[id]
- /inventory/valuation
- /inventory/stock-card

MENU:
Tambahkan menu Inventory:
- Inventory Overview
- Product Stock
- Warehouse Stock
- Stock Movements
- Stock Adjustment
- Stock Opname
- Inventory Valuation
- Stock Card

PERMISSIONS:
Gunakan permission backend existing. Mapping awal:
- inventory.view
- inventory.stocks.view
- inventory.movements.view
- inventory.adjustments.view
- inventory.adjustments.create
- inventory.adjustments.edit
- inventory.adjustments.approve
- inventory.adjustments.post
- inventory.adjustments.void
- inventory.opname.view
- inventory.opname.create
- inventory.opname.finalize
- inventory.valuation.view
- inventory.stock_card.view

TYPES:
Buat:
frontend/types/inventory.ts

Isi minimal:
- InventoryProductStock
- WarehouseStock
- StockMovement
- StockMovementLine
- StockAdjustment
- StockAdjustmentLine
- StockOpname
- StockOpnameLine
- InventoryValuation
- StockCardEntry
- InventoryStatus
- InventoryListFilters
- StockAdjustmentPayload
- StockOpnamePayload

API CLIENT:
Buat:
frontend/features/inventory/api/inventoryApi.ts

Methods awal:
- getStockList(filters)
- getProductStockDetail(productId, filters)
- getWarehouseStock(warehouseId, filters)
- getStockMovements(filters)
- getStockMovementDetail(id)
- getStockAdjustments(filters)
- getStockAdjustmentDetail(id)
- createStockAdjustment(payload)
- updateStockAdjustment(id, payload)
- approveStockAdjustment(id)
- postStockAdjustment(id)
- voidStockAdjustment(id, reason)
- getStockOpnameList(filters)
- getStockOpnameDetail(id)
- createStockOpname(payload)
- finalizeStockOpname(id)
- getInventoryValuation(filters)
- getStockCard(filters)

Gunakan existing apiRequest. Jangan membuat axios baru.

COMPONENTS:
Buat:
frontend/features/inventory/components

Komponen:
- InventoryStatusBadge.tsx
- StockMovementTypeBadge.tsx
- WarehouseSelector.tsx
- ProductSelector.tsx
- StockFilterBar.tsx
- StockTable.tsx
- StockQuantityDisplay.tsx
- StockValueDisplay.tsx
- InventoryEmptyState.tsx
- InventoryErrorState.tsx
- InventoryLoadingState.tsx
- PeriodLockWarning.tsx jika belum ada shared component

OVERVIEW PAGE:
Buat:
frontend/app/inventory/page.tsx

Isi:
- navigation cards
- quick summary jika endpoint tersedia
- low stock placeholder jika endpoint tersedia
- permission-aware quick actions
- loading/error/empty state

DOKUMENTASI:
Buat/update:
docs/phase-17-inventory-frontend-mvp.md

TEST:
Jika test framework tersedia:
- inventory menu renders
- overview renders
- permission guard hides action

COMMANDS:
- npm run lint
- npm run build
- npm test jika tersedia

ACCEPTANCE:
- Menu Inventory tersedia permission-aware.
- Route foundation dibuat.
- Types/API/components foundation dibuat.
- Overview page dibuat.
- Docs dibuat/update.
- Tidak ada backend endpoint baru.

COMMIT MESSAGE:
add inventory frontend foundation
```
