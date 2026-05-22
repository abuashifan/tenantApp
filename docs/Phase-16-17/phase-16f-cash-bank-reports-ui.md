# Phase 16F — Cash Bank Reports UI

```text
Kita lanjut Phase 16F project TenantAppDevelopment.

NAMA SUBPHASE:
Phase 16F — Cash Bank Reports UI

WAJIB:
Baca hasil Phase 16A–16E.
Gunakan shared report/table/filter pattern dari Phase 13 dan shared cash bank components.
Update docs/phase-16-cash-bank-frontend-mvp.md setelah selesai.

TUJUAN:
Membuat UI laporan Cash Bank untuk melihat ringkasan mutasi kas/bank, saldo akun, dan transaksi per periode.

SCOPE:
1. Cash Bank Reports page.
2. Cash Bank Summary report.
3. Cash Bank Account Ledger report jika backend support.
4. Cash In/Out summary.
5. Filter date/account/status.
6. Print-friendly layout basic jika mudah.
7. No PDF/Excel export.
8. Loading/error/empty state.
9. Documentation.

WAJIB BACA:
- frontend/app/accounting/reports/* jika ada
- frontend/features/reports/* jika ada
- frontend/features/cash-bank/api/cashBankApi.ts
- frontend/features/cash-bank/components/*
- frontend/types/cash-bank.ts
- backend/routes/api.php hanya endpoint cash bank reports
- docs/phase-11-cash-bank-backend.md jika ada
- docs/phase-16-cash-bank-frontend-mvp.md

JANGAN:
- Membuat backend report baru.
- Membuat export PDF/Excel.
- Membuat advanced analytics dashboard.
- Membuat chart kompleks.
- Membuat cash flow statement ulang.
- Mengubah accounting report engine.

ROUTES:
- /cash-bank/reports

Boleh satu page tab-based:
- Summary
- Account Ledger
- Account Balances

REPORT PAGE:
Tampilkan:
- filter date_from, date_to, cash_bank_account_id, transaction_type, status
- summary cards:
  - opening balance
  - total cash in
  - total cash out
  - transfer in
  - transfer out
  - ending balance
- table:
  - date
  - account
  - document number
  - type
  - description
  - cash in
  - cash out
  - balance jika backend support
  - status

API:
Tambahkan/rapikan:
- getCashBankSummaryReport(filters)
- getCashBankLedgerReport(filters)
- getCashBankAccountBalances(filters)

PRINT FRIENDLY:
- hide action buttons on print
- show company name jika tersedia
- show filter period
- show generated date
- tidak perlu PDF export

PERMISSION:
- cash_bank.reports.view

TEST:
Jika tersedia:
- reports page renders
- filter changes query
- summary cards render
- empty state renders
- permission guard works

COMMANDS:
- npm run lint
- npm run build
- npm test jika tersedia

COMMIT MESSAGE:
add cash bank reports frontend
```
