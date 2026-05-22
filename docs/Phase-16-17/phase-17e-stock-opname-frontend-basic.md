# Phase 17E — Stock Opname Frontend Basic

```text
Kita lanjut Phase 17E project TenantAppDevelopment.

NAMA SUBPHASE:
Phase 17E — Stock Opname Frontend Basic

WAJIB:
Baca hasil Phase 17A–17D.
Gunakan shared inventory components.
Update docs/phase-17-inventory-frontend-mvp.md setelah selesai.

TUJUAN:
Membuat UI dasar Stock Opname untuk input hasil hitung fisik dan finalize opname sesuai backend.

SCOPE:
1. Stock opname page.
2. Stock opname session.
3. Warehouse selector.
4. Physical qty input.
5. System qty preview.
6. Selisih qty preview.
7. Adjustment preview.
8. Finalize opname action.
9. Audit display basic.
10. Stock opname status badge.
11. Docs Phase 17E.

WAJIB BACA:
- frontend/features/inventory/api/inventoryApi.ts
- frontend/types/inventory.ts
- frontend/features/inventory/components/*
- frontend/app/inventory/adjustments/*
- backend/routes/api.php hanya endpoint stock opname
- docs/phase-17-inventory-frontend-mvp.md

JANGAN:
- Membuat backend endpoint baru.
- Membuat barcode scanner.
- Membuat mobile app khusus gudang.
- Membuat import Excel.
- Membuat advanced cycle count.
- Membuat export.

ROUTES:
- /inventory/opname
- /inventory/opname/create jika backend support
- /inventory/opname/[id]

LIST PAGE:
Tampilkan:
- title Stock Opname
- button create session jika permission dan endpoint tersedia
- filter warehouse, status, date range
- table session number, warehouse, period/date, status, line count, difference summary, action

CREATE SESSION:
Jika endpoint tersedia:
Fields:
- opname_date
- warehouse_id
- notes
- product/category filter optional jika backend support

DETAIL/SESSION PAGE:
Tampilkan:
- session header
- warehouse
- opname date
- status badge
- lines:
  - product
  - system qty
  - physical qty input
  - difference qty
  - adjustment preview
  - notes
- summary:
  - total products counted
  - total variance qty
  - estimated value adjustment jika tersedia

ACTIONS:
- save draft/count
- finalize opname
- finalize wajib confirmation
- show generated adjustment/stock movement if backend returns reference

PERMISSIONS:
- inventory.opname.view
- inventory.opname.create
- inventory.opname.finalize

ERROR HANDLING:
- period lock warning
- validation errors
- permission denied
- session already finalized

TEST:
Jika tersedia:
- list renders
- session detail renders
- physical qty updates difference preview
- finalize button permission-aware
- finalized session readonly

COMMANDS:
- npm run lint
- npm run build
- npm test jika tersedia

COMMIT MESSAGE:
add basic stock opname frontend
```
