# Phase 17D — Stock Adjustment Frontend

```text
Kita lanjut Phase 17D project TenantAppDevelopment.

NAMA SUBPHASE:
Phase 17D — Stock Adjustment Frontend

WAJIB:
Baca hasil Phase 17A–17C.
Gunakan shared inventory components dan API client.
Update docs/phase-17-inventory-frontend-mvp.md setelah selesai.

TUJUAN:
Membuat UI Stock Adjustment untuk koreksi stok manual sesuai backend inventory.

SCOPE:
1. Stock adjustment page.
2. Create stock adjustment form.
3. Edit draft stock adjustment form.
4. Warehouse selector.
5. Product selector.
6. Qty adjustment input.
7. Adjustment reason input.
8. Stock before/after preview.
9. Generate value adjustment preview.
10. Approve/post/void actions.
11. Permission-aware actions.
12. Period lock warning.
13. Dependency warning.
14. Success/error notifications.
15. Docs Phase 17D.

WAJIB BACA:
- frontend/features/inventory/api/inventoryApi.ts
- frontend/types/inventory.ts
- frontend/features/inventory/components/*
- frontend/app/inventory/movements/*
- backend/routes/api.php hanya endpoint stock adjustment
- docs/phase-17-inventory-frontend-mvp.md

JANGAN:
- Membuat backend endpoint baru.
- Mengubah stock adjustment backend.
- Membuat stock opname UI.
- Membuat valuation report.
- Membuat export.

ROUTES:
- /inventory/adjustments
- /inventory/adjustments/create
- /inventory/adjustments/[id]
- /inventory/adjustments/[id]/edit

LIST PAGE:
Tampilkan:
- title Stock Adjustments
- button create jika permission
- filter date range, warehouse, status, search
- table adjustment number, date, warehouse, reason, status, line count, action

FORM:
Buat:
frontend/features/inventory/components/StockAdjustmentForm.tsx

Fields:
- adjustment_date
- warehouse_id
- reason
- notes
- lines:
  - product_id
  - system_qty readonly/preview jika tersedia
  - adjustment_qty
  - final_qty preview
  - unit_cost jika backend support
  - value_adjustment preview
  - line_notes

Behavior:
- create/edit draft
- add/remove lines
- validate warehouse required
- validate product required
- validate adjustment_qty not zero
- show stock before/after preview
- show backend validation errors
- prevent submit while loading

DETAIL PAGE:
Tampilkan:
- adjustment header
- status
- warehouse
- reason
- lines with before/adjustment/after/value
- journal/stock movement reference jika ada
- actions approve/post/void sesuai permission/status

ACTIONS:
- approve draft/pending
- post approved
- void posted
- void wajib reason
- confirm sebelum post

PERMISSIONS:
- inventory.adjustments.view
- inventory.adjustments.create
- inventory.adjustments.edit
- inventory.adjustments.approve
- inventory.adjustments.post
- inventory.adjustments.void

ERROR HANDLING:
- period lock warning
- dependency warning
- validation error
- permission denied

TEST:
Jika tersedia:
- list renders
- create form validation
- add/remove line works
- stock before/after preview
- approve/post/void permission-aware
- void requires reason

COMMANDS:
- npm run lint
- npm run build
- npm test jika tersedia

COMMIT MESSAGE:
add stock adjustment frontend
```
