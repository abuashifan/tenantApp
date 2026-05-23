# Phase 17 — Inventory Frontend MVP

Phase 17 adds a tenant-aware and permission-aware Inventory frontend that consumes the existing Phase 12 Inventory backend. It does not add backend inventory logic.

## Routes

- `/inventory`
- `/inventory/stocks`
- `/inventory/stocks/{productId}`
- `/inventory/warehouses/{warehouseId}/stocks`
- `/inventory/movements`
- `/inventory/movements/{id}`
- `/inventory/adjustments`
- `/inventory/adjustments/create`
- `/inventory/adjustments/{id}`
- `/inventory/adjustments/{id}/edit`
- `/inventory/opname`
- `/inventory/opname/create`
- `/inventory/opname/{id}`
- `/inventory/valuation`
- `/inventory/stock-card`

## API Dependencies

- `/api/inventory/stock-balances`
- `/api/inventory/stock-movements`
- `/api/inventory/stock-adjustments`
- `/api/inventory/stock-opnames`
- `/api/inventory/reports/valuation`
- `/api/inventory/reports/stock-card`

## Permissions

- `inventory.stock.view`
- `inventory.movements.view`
- `inventory.adjustments.*`
- `inventory.opname.*`
- `inventory.valuation.view`
- `inventory.reports.view`

## Implemented Flow

- Product stock and warehouse stock read pages.
- Stock movement list/detail.
- Stock adjustment list, create/edit, approve, post, and void.
- Stock opname list, create, detail, generate lines, update physical quantity, and finalize.
- Inventory valuation and stock card browser reports.

## Known Limitations

- No backend changes.
- No PDF/Excel export.
- No barcode scanner, mobile warehouse app, Excel import, or advanced cycle count.
- No advanced inventory analytics dashboard.

## Manual Testing Checklist

- Open each Inventory route with an active company.
- Confirm permission-aware menu/action behavior.
- Confirm adjustment form validates warehouse/product/quantity.
- Confirm stock card requires a product filter.
- Confirm loading, empty, and backend error states remain visible.

## Commands

```bash
cd frontend
npm run lint
npm run build
```
