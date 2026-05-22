# Phase 17F — Inventory Valuation & Stock Card Frontend

```text
Kita lanjut Phase 17F project TenantAppDevelopment.

NAMA SUBPHASE:
Phase 17F — Inventory Valuation & Stock Card Frontend

WAJIB:
Baca hasil Phase 17A–17E.
Gunakan shared inventory components dan report/filter pattern existing.
Update docs/phase-17-inventory-frontend-mvp.md setelah selesai.

TUJUAN:
Membuat UI Inventory Valuation dan Stock Card untuk melihat nilai persediaan dan histori pergerakan stok.

SCOPE:
1. Inventory valuation page.
2. Stock card page.
3. Stock card movement timeline.
4. Running stock balance display.
5. Running stock value display.
6. Average cost display.
7. Warehouse filter.
8. Product filter.
9. Date range filter.
10. Print-friendly layout basic.
11. Export not included yet.
12. Docs Phase 17F.

WAJIB BACA:
- frontend/app/accounting/reports/* jika ada
- frontend/features/reports/* jika ada
- frontend/features/inventory/api/inventoryApi.ts
- frontend/types/inventory.ts
- frontend/features/inventory/components/*
- backend/routes/api.php hanya endpoint valuation/stock-card
- docs/phase-17-inventory-frontend-mvp.md

JANGAN:
- Membuat backend report baru.
- Mengubah valuation backend.
- Membuat PDF/Excel export.
- Membuat advanced analytics dashboard.
- Membuat chart kompleks.

ROUTES:
- /inventory/valuation
- /inventory/stock-card

VALUATION PAGE:
Tampilkan:
- title Inventory Valuation
- filter warehouse_id, category_id, product_id, as_of_date
- summary:
  - total stock value
  - total products
  - low stock count jika tersedia
  - negative stock count jika tersedia
- table:
  - product code
  - product name
  - warehouse
  - quantity
  - average cost
  - stock value
  - last movement date jika tersedia

STOCK CARD PAGE:
Tampilkan:
- filter product_id wajib/utama
- warehouse_id optional
- date_from
- date_to
- movement type optional
- opening balance
- movement timeline/table:
  - date
  - document number
  - source
  - movement type
  - qty in
  - qty out
  - running qty
  - unit cost
  - running value
  - average cost
- ending balance

PRINT FRIENDLY:
- show company name jika tersedia
- show report period/filter
- hide action/filter controls on print
- no PDF export

API:
Pastikan:
- getInventoryValuation(filters)
- getStockCard(filters)

PERMISSIONS:
- inventory.valuation.view
- inventory.stock_card.view

TEST:
Jika tersedia:
- valuation page renders
- valuation filter works
- stock card requires product filter or handles empty state
- stock card table renders
- print-friendly class exists

COMMANDS:
- npm run lint
- npm run build
- npm test jika tersedia

COMMIT MESSAGE:
add inventory valuation and stock card frontend
```
