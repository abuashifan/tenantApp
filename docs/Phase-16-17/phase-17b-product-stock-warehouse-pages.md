# Phase 17B — Product Stock & Warehouse Pages

```text
Kita lanjut Phase 17B project TenantAppDevelopment.

NAMA SUBPHASE:
Phase 17B — Product Stock & Warehouse Pages

WAJIB:
Baca hasil Phase 17A.
Gunakan inventory API client, types, shared components, permission guard, dan layout existing.
Update docs/phase-17-inventory-frontend-mvp.md setelah selesai.

TUJUAN:
Membuat UI untuk melihat saldo stok produk dan stok per gudang.

SCOPE:
1. Stock list page.
2. Product stock detail page.
3. Warehouse stock page.
4. Stock balance display.
5. Stock value display.
6. Average cost display.
7. Filter by warehouse.
8. Filter by product.
9. Filter by category.
10. Low stock highlight.
11. Negative stock warning.
12. Search product.
13. Pagination support.
14. Docs Phase 17B.

WAJIB BACA:
- frontend/app/inventory/page.tsx
- frontend/features/inventory/api/inventoryApi.ts
- frontend/types/inventory.ts
- frontend/features/inventory/components/*
- backend/routes/api.php hanya endpoint stock/warehouse stock
- docs/phase-17-inventory-frontend-mvp.md

JANGAN:
- Membuat backend endpoint baru.
- Mengubah stock balance backend.
- Membuat stock movement UI.
- Membuat adjustment form.
- Membuat export PDF/Excel.

ROUTES:
- /inventory/stocks
- /inventory/stocks/[productId]
- /inventory/warehouses/[warehouseId]/stocks

STOCK LIST PAGE:
Tampilkan:
- title Product Stock
- filter:
  - search
  - warehouse_id
  - product_id
  - category_id
  - low_stock_only
  - include_zero_stock
- table:
  - product code
  - product name
  - category
  - total stock
  - available stock jika ada
  - reserved stock jika ada
  - average cost
  - stock value
  - low stock badge
  - negative stock warning
  - action view detail

PRODUCT STOCK DETAIL:
Tampilkan:
- product identity
- stock per warehouse
- total quantity
- total value
- average cost
- recent movements jika endpoint tersedia
- warning negative stock/low stock
- link stock card

WAREHOUSE STOCK PAGE:
Tampilkan:
- warehouse identity
- product stock list dalam warehouse tersebut
- total stock value jika backend support
- filter product/category/search

UX:
- currency/number formatting rapi
- low stock highlight
- negative stock warning jelas
- pagination
- loading/error/empty states

PERMISSIONS:
- inventory.stocks.view
- inventory.view

API:
Pastikan:
- getStockList(filters)
- getProductStockDetail(productId, filters)
- getWarehouseStock(warehouseId, filters)

TEST:
Jika tersedia:
- stock list renders
- filter updates query
- low stock badge renders
- negative stock warning renders
- detail page renders
- warehouse stock page renders

COMMANDS:
- npm run lint
- npm run build
- npm test jika tersedia

COMMIT MESSAGE:
add product and warehouse stock pages
```
