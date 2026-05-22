# Phase 16E — Bank Reconciliation UI Basic

```text
Kita lanjut Phase 16E project TenantAppDevelopment.

NAMA SUBPHASE:
Phase 16E — Bank Reconciliation UI Basic

WAJIB:
Baca hasil Phase 16A–16D.
Gunakan cash bank shared components.
Update docs/phase-16-cash-bank-frontend-mvp.md setelah selesai.

TUJUAN:
Membuat UI dasar Bank Reconciliation untuk mencocokkan transaksi sistem dengan rekening koran secara manual/simple.

SCOPE:
1. Reconciliation list/status page.
2. Reconciliation detail/session page.
3. Create reconciliation session form jika backend support.
4. Match/unmatch transaction UI jika endpoint tersedia.
5. Mark reconciled action jika endpoint tersedia.
6. Basic statement balance input.
7. Difference preview.
8. Permission-aware action.
9. Loading/error/empty state.
10. Dokumentasi Phase 16E.

WAJIB BACA:
- frontend/features/cash-bank/api/cashBankApi.ts
- frontend/features/cash-bank/components/*
- frontend/types/cash-bank.ts
- frontend/app/cash-bank/*
- backend/routes/api.php hanya endpoint reconciliation
- docs/phase-11-cash-bank-backend.md jika ada
- docs/phase-16-cash-bank-frontend-mvp.md

JANGAN:
- Membuat backend reconciliation baru.
- Membuat OCR/import rekening koran.
- Membuat bank feed integration.
- Membuat auto matching advanced.
- Membuat export.
- Membuat report advanced.

ROUTES:
- /cash-bank/reconciliation
- /cash-bank/reconciliation/create jika backend support
- /cash-bank/reconciliation/[id]

LIST PAGE:
Tampilkan:
- title Bank Reconciliation
- button New Reconciliation jika permission manage dan endpoint tersedia
- filter cash_bank_account_id, date_from, date_to, status
- table: session id/number, account, period, statement balance, system balance, difference, status

CREATE FORM:
Jika backend support create session:
- cash_bank_account_id
- period_start
- period_end
- statement_ending_balance
- notes

Jika backend belum support create session:
- Jangan membuat backend.
- Buat page read-only reconciliation status dari endpoint tersedia.
- Dokumentasikan limitation.

DETAIL PAGE:
Tampilkan:
- account
- period
- statement ending balance
- system ending balance
- difference
- status
- daftar transaksi: date, document number, description, in/out, amount, reconciled action jika tersedia
- summary total cleared in/out, unreconciled count, difference

ACTIONS:
Jika backend endpoint tersedia:
- match/reconcile selected transaction
- unmatch/unreconcile selected transaction
- finalize reconciliation
- reopen reconciliation jika allowed

Jika tidak tersedia:
- tampilkan read-only UI
- jangan buat endpoint baru
- dokumentasikan limitation

PERMISSIONS:
- cash_bank.reconciliation.view
- cash_bank.reconciliation.manage

TEST:
Jika tersedia:
- reconciliation list renders
- create form validation if available
- detail summary renders
- action button permission-aware
- difference preview works

COMMANDS:
- npm run lint
- npm run build
- npm test jika tersedia

COMMIT MESSAGE:
add basic bank reconciliation frontend
```
