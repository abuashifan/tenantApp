# Phase 17C — Stock Movement Frontend

```text
Kita lanjut Phase 17C project TenantAppDevelopment.

NAMA SUBPHASE:
Phase 17C — Stock Movement Frontend

WAJIB:
Baca hasil Phase 17A–17B.
Gunakan shared inventory components.
Update docs/phase-17-inventory-frontend-mvp.md setelah selesai.

TUJUAN:
Membuat UI daftar dan detail stock movement dari backend inventory.

SCOPE:
1. Stock movement list page.
2. Stock movement detail page.
3. Movement type badge.
4. Movement source link display.
5. Stock movement filters.
6. Date range filter.
7. Warehouse filter.
8. Movement type filter.
9. Product filter.
10. Include void toggle.
11. Pagination support.
12. Sorting support.
13. Docs Phase 17C.

WAJIB BACA:
- frontend/features/inventory/api/inventoryApi.ts
- frontend/types/inventory.ts
- frontend/features/inventory/components/*
- frontend/app/inventory/stocks/*
- backend/routes/api.php hanya endpoint stock movement
- docs/phase-17-inventory-frontend-mvp.md

JANGAN:
- Membuat backend stock movement baru.
- Membuat stock adjustment form.
- Membuat stock opname.
- Membuat inventory valuation page.
- Membuat export.

ROUTES:
- /inventory/movements
- /inventory/movements/[id]

LIST PAGE:
Tampilkan:
- title Stock Movements
- filter:
  - date_from
  - date_to
  - warehouse_id
  - product_id
  - movement_type
  - source_type
  - include_void
  - search
- table:
  - movement date
  - movement number
  - movement type badge
  - source document link/display
  - warehouse
  - product count
  - quantity in
  - quantity out
  - status
  - action detail

DETAIL PAGE:
Tampilkan:
- movement header
- movement type
- source document
- warehouse
- transaction date
- status
- notes
- lines:
  - product
  - quantity in/out
  - unit
  - cost
  - value
  - running balance jika backend support
- audit info jika tersedia

MOVEMENT TYPE BADGE:
Support minimal:
- purchase_in
- sales_out
- adjustment_in
- adjustment_out
- transfer_in
- transfer_out
- opname_adjustment
- return_in
- return_out
- void/reversal jika ada

PERMISSIONS:
- inventory.movements.view

TEST:
Jika tersedia:
- movement list renders
- filter works
- type badge renders
- detail page renders
- source display renders

COMMANDS:
- npm run lint
- npm run build
- npm test jika tersedia

COMMIT MESSAGE:
add stock movement frontend
```
