# Phase 16G — Cash Bank Frontend Tests & Documentation

```text
Kita lanjut Phase 16G project TenantAppDevelopment.

NAMA SUBPHASE:
Phase 16G — Cash Bank Frontend Tests & Documentation

WAJIB:
Baca hasil Phase 16A–16F.
Jangan membuat fitur besar baru.
Fokus pada testing, cleanup kecil, dokumentasi final, dan roadmap update.

TUJUAN:
Mengunci kualitas Phase 16 Cash Bank Frontend MVP sebelum lanjut Phase 17 Inventory Frontend MVP.

SCOPE:
1. Smoke test cash bank routes.
2. Permission-aware action tests.
3. API error handling tests.
4. Loading state tests.
5. Empty state tests.
6. Form validation tests.
7. Manual responsive checklist.
8. Final documentation.
9. Roadmap update.

WAJIB BACA:
- frontend/app/cash-bank/*
- frontend/features/cash-bank/*
- frontend/types/cash-bank.ts
- frontend/lib/api.ts
- docs/phase-16-cash-bank-frontend-mvp.md
- docs/update-roadmap.md
- frontend/package.json

JANGAN:
- Membuat backend endpoint baru.
- Menambah fitur cash bank baru.
- Membuat export.
- Membuat advanced reconciliation.
- Membuat inventory UI.
- Refactor besar seluruh frontend.

TEST TARGET:
Jika test framework tersedia:
1. Cash Bank navigation/menu test.
2. Cash In frontend test.
3. Cash Out frontend test.
4. Bank Transfer frontend test.
5. Bank Reconciliation frontend test.
6. Cash Bank Reports frontend test.
7. API error handling test.

Jika test framework belum siap:
- Jangan setup framework besar.
- Buat manual checklist di docs.
- Tambahkan TODO test setup untuk Phase 24.

DOCUMENTATION FINAL:
Update:
docs/phase-16-cash-bank-frontend-mvp.md

Isi wajib:
- Overview Phase 16
- Route list
- Page list
- Component list
- API dependency list
- Permission mapping
- Cash In flow
- Cash Out flow
- Bank Transfer flow
- Reconciliation basic flow
- Reports UI flow
- Error handling behavior
- Loading/empty states
- Known limitations
- Manual testing checklist
- Commands run
- Next phase: Phase 17 Inventory Frontend MVP

KNOWN LIMITATIONS:
- No backend changes
- No PDF/Excel export
- No bank statement import
- No OCR
- No bank feed integration
- No advanced auto matching
- Reconciliation action depends on backend endpoint availability

ROADMAP UPDATE:
Update docs/update-roadmap.md:
- Phase 16 status selesai jika semua subphase selesai.
- Next active phase: Phase 17 — Inventory Frontend MVP

COMMANDS:
- npm run lint
- npm run build
- npm test jika tersedia

ACCEPTANCE:
- Cash Bank menu/routes tersedia.
- Cash In UI selesai.
- Cash Out UI selesai.
- Bank Transfer UI selesai.
- Bank Reconciliation Basic UI selesai atau read-only sesuai backend.
- Cash Bank Reports UI selesai.
- Permission-aware actions berjalan.
- Loading/error/empty states tersedia.
- Tests atau manual checklist tersedia.
- Docs final tersedia.
- Roadmap update.

COMMIT MESSAGE:
complete cash bank frontend mvp
```
