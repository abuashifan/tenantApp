# Phase 16A — Cash Bank Frontend Foundation

```text
Kita lanjut Phase 16 project TenantAppDevelopment.

NAMA PHASE:
Phase 16 — Cash Bank Frontend MVP

NAMA SUBPHASE:
Phase 16A — Cash Bank Frontend Foundation

KONTEKS PROJECT:
Project ini adalah aplikasi akuntansi multi-tenant:
- Backend: Laravel API
- Frontend: Next.js
- Styling: TailwindCSS
- Database: SQLite untuk MVP/development
- 1 company = 1 tenant database
- Frontend request memakai Bearer token + X-Company-ID
- User memilih active company setelah login
- Semua halaman cash bank harus permission-aware dan tenant-aware

STATUS SEBELUM PHASE 16:
Diasumsikan sudah selesai:
- Phase 11 — Cash Bank Backend
- Phase 13 — Accounting Frontend MVP
- Phase 14 — Sales Frontend MVP
- Phase 15 — Purchase Frontend MVP

TUJUAN:
Membuat fondasi frontend untuk modul Cash Bank agar subphase 16B–16G tidak membuat pola sendiri-sendiri.

SCOPE:
1. Integrasi menu Cash Bank di AppShell/sidebar.
2. Struktur route cash bank.
3. Permission-aware navigation.
4. Shared API client untuk cash bank.
5. Shared types untuk cash bank.
6. Shared UI components untuk transaksi cash bank.
7. Shared form/table/list pattern.
8. Shared status badge.
9. Loading/error/empty states.
10. Dokumentasi Phase 16.

WAJIB BACA FILE TERBATAS:
- frontend/lib/api.ts
- frontend/types/api.ts
- frontend/components/layout/AppShell.tsx
- frontend/app/dashboard/page.tsx
- frontend/app/accounting/*
- frontend/app/sales/* jika ada
- frontend/app/purchase/* jika ada
- frontend/components/ui/*
- frontend/features/*
- backend/routes/api.php hanya untuk endpoint cash bank
- docs/update-roadmap.md
- docs/phase-11-cash-bank-backend.md jika ada
- docs/phase-13-accounting-frontend-mvp.md jika ada
- docs/phase-15-purchase-frontend-mvp.md jika ada

JANGAN:
- Membaca seluruh repository.
- Membuat backend cash bank baru.
- Membuat endpoint backend baru.
- Mengubah jurnal/accounting backend.
- Membuat export PDF/Excel.
- Membuat advanced bank reconciliation.
- Membuat role management.
- Membuat inventory.
- Membuat dashboard analytics besar.

ROUTE FRONTEND:
- /cash-bank
- /cash-bank/cash-in
- /cash-bank/cash-out
- /cash-bank/transfers
- /cash-bank/reconciliation
- /cash-bank/reports

MENU:
Tambahkan menu Cash Bank:
- Cash Bank Overview
- Cash In
- Cash Out
- Bank Transfer
- Bank Reconciliation
- Cash Bank Reports

Menu harus permission-aware, tenant-aware, dan mengikuti active state pattern existing.

PERMISSIONS:
Gunakan permission backend existing. Jika perlu mapping:
- cash_bank.view
- cash_bank.cash_in.view
- cash_bank.cash_in.create
- cash_bank.cash_in.edit
- cash_bank.cash_in.post
- cash_bank.cash_in.void
- cash_bank.cash_out.view
- cash_bank.cash_out.create
- cash_bank.cash_out.edit
- cash_bank.cash_out.post
- cash_bank.cash_out.void
- cash_bank.transfers.view
- cash_bank.transfers.create
- cash_bank.transfers.edit
- cash_bank.transfers.post
- cash_bank.transfers.void
- cash_bank.reconciliation.view
- cash_bank.reconciliation.manage
- cash_bank.reports.view

TYPES:
Buat:
frontend/types/cash-bank.ts

Isi minimal:
- CashBankAccount
- CashBankTransaction
- CashBankTransactionLine
- CashInTransaction
- CashOutTransaction
- BankTransfer
- BankReconciliation
- CashBankReportSummary
- CashBankStatus
- CashBankListFilters
- CashBankFormPayload

API CLIENT:
Buat:
frontend/features/cash-bank/api/cashBankApi.ts

Methods minimal:
- getCashBankAccounts()
- getCashInList(filters)
- getCashInDetail(id)
- createCashIn(payload)
- updateCashIn(id, payload)
- postCashIn(id)
- voidCashIn(id, reason)
- getCashOutList(filters)
- getCashOutDetail(id)
- createCashOut(payload)
- updateCashOut(id, payload)
- postCashOut(id)
- voidCashOut(id, reason)
- getTransferList(filters)
- getTransferDetail(id)
- createTransfer(payload)
- updateTransfer(id, payload)
- postTransfer(id)
- voidTransfer(id, reason)
- getReconciliationList(filters)
- getCashBankReports(filters)

Gunakan existing apiRequest. Jangan membuat axios baru.

COMPONENTS:
Buat:
frontend/features/cash-bank/components

Komponen:
- CashBankStatusBadge.tsx
- CashBankAccountSelector.tsx
- CashBankTransactionTable.tsx
- CashBankFilterBar.tsx
- CashBankFormHeader.tsx
- CashBankAmountInput.tsx
- CashBankEmptyState.tsx
- CashBankErrorState.tsx
- CashBankLoadingState.tsx

FOUNDATION PAGE:
Buat:
frontend/app/cash-bank/page.tsx

Isi:
- title Cash Bank
- cards navigasi
- summary placeholder atau fetch summary jika endpoint tersedia
- permission-aware quick actions
- loading/error/empty state

DOKUMENTASI:
Buat/update:
docs/phase-16-cash-bank-frontend-mvp.md

TEST:
Jika test framework tersedia:
- Cash Bank menu renders
- Cash Bank overview renders
- permission guard hides menu/action

COMMANDS:
Jalankan jika bisa:
- npm run lint
- npm run build
- npm test jika tersedia

ACCEPTANCE:
- Menu Cash Bank permission-aware.
- Route dasar dibuat.
- Shared types/API/components dibuat.
- Overview page dibuat.
- Docs dibuat/update.
- Tidak ada backend endpoint baru.

COMMIT MESSAGE:
add cash bank frontend foundation
```
