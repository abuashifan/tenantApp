# Phase 17G — Inventory Frontend Integration Tests & Documentation

```text
Kita lanjut Phase 17G project TenantAppDevelopment.

NAMA SUBPHASE:
Phase 17G — Inventory Frontend Integration Tests & Documentation

WAJIB:
Baca hasil Phase 17A–17F.
Jangan membuat fitur besar baru.
Fokus pada test, cleanup kecil, dokumentasi final, dan roadmap update.

TUJUAN:
Mengunci kualitas Phase 17 Inventory Frontend MVP sebelum lanjut Phase 18 Role, Permission & User Management Advanced.

SCOPE:
1. Stock list smoke test.
2. Stock movement page smoke test.
3. Stock adjustment form test.
4. Stock opname smoke test.
5. Stock card smoke test.
6. Inventory valuation smoke test.
7. Permission-aware action test.
8. API error handling test.
9. Loading state test.
10. Empty state test.
11. Responsive layout manual checklist.
12. Final docs Phase 17.

WAJIB BACA:
- frontend/app/inventory/*
- frontend/features/inventory/*
- frontend/types/inventory.ts
- frontend/lib/api.ts
- docs/phase-17-inventory-frontend-mvp.md
- docs/update-roadmap.md
- frontend/package.json

JANGAN:
- Membuat backend endpoint baru.
- Menambah fitur inventory baru.
- Membuat export.
- Membuat role management UI.
- Refactor besar seluruh frontend.

TEST TARGET:
Jika test framework tersedia:
1. Inventory navigation/menu test.
2. Product stock pages test.
3. Warehouse stock page test.
4. Stock movement page test.
5. Stock adjustment form/action test.
6. Stock opname page test.
7. Inventory valuation page test.
8. Stock card page test.
9. API error handling test.

Jika test framework belum siap:
- Jangan setup framework besar.
- Buat manual checklist di docs.
- Tambahkan TODO test setup untuk Phase 24 Frontend Smoke Tests.

DOCUMENTATION FINAL:
Update:
docs/phase-17-inventory-frontend-mvp.md

Isi wajib:
- Overview Phase 17
- Route list
- Page list
- Component list
- API dependency list
- Permission mapping
- Product stock flow
- Warehouse stock flow
- Stock movement flow
- Stock adjustment flow
- Stock opname flow
- Valuation flow
- Stock card flow
- Error handling behavior
- Loading/empty states
- Known limitations
- Manual testing checklist
- Commands run
- Next phase: Phase 18 Role, Permission & User Management Advanced

KNOWN LIMITATIONS:
- No backend changes
- No PDF/Excel export
- No barcode scanner
- No mobile warehouse app
- No Excel import
- No advanced cycle count
- No advanced inventory dashboard

ROADMAP UPDATE:
Update docs/update-roadmap.md:
- Phase 17 status selesai jika semua subphase selesai.
- Next active phase: Phase 18 — Role, Permission & User Management Advanced

COMMANDS:
- npm run lint
- npm run build
- npm test jika tersedia

ACCEPTANCE:
- Inventory menu/routes tersedia.
- Product stock & warehouse stock pages selesai.
- Stock movement UI selesai.
- Stock adjustment UI selesai.
- Stock opname basic UI selesai.
- Inventory valuation UI selesai.
- Stock card UI selesai.
- Permission-aware actions berjalan.
- Loading/error/empty states tersedia.
- Tests atau manual checklist tersedia.
- Docs final tersedia.
- Roadmap update.
- Tidak ada backend endpoint baru.

COMMIT MESSAGE:
complete inventory frontend mvp
```
