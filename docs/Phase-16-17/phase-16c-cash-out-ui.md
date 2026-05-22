# Phase 16C — Cash Out UI

```text
Kita lanjut Phase 16C project TenantAppDevelopment.

NAMA SUBPHASE:
Phase 16C — Cash Out UI

WAJIB:
Baca hasil Phase 16A dan 16B.
Gunakan pola Cash In UI sebagai pattern.
Update docs/phase-16-cash-bank-frontend-mvp.md setelah selesai.

TUJUAN:
Membuat UI Cash Out / Pengeluaran Kas Bank untuk mencatat dan melihat transaksi uang keluar.

SCOPE:
1. Cash Out list page.
2. Cash Out detail page.
3. Create Cash Out form.
4. Edit draft Cash Out form.
5. Post Cash Out action.
6. Void Cash Out action.
7. Filter list.
8. Status badge.
9. Permission-aware actions.
10. Period lock warning.
11. Dokumentasi Phase 16C.

WAJIB BACA:
- frontend/app/cash-bank/cash-in/*
- frontend/features/cash-bank/components/CashInForm.tsx
- frontend/features/cash-bank/api/cashBankApi.ts
- frontend/types/cash-bank.ts
- frontend/features/cash-bank/components/*
- backend/routes/api.php hanya endpoint cash out
- docs/phase-16-cash-bank-frontend-mvp.md

JANGAN:
- Membuat backend endpoint baru.
- Mengubah logic backend.
- Membuat bank transfer UI.
- Membuat reconciliation UI.
- Membuat advanced payment allocation.
- Membuat export.

ROUTES:
- /cash-bank/cash-out
- /cash-bank/cash-out/create
- /cash-bank/cash-out/[id]
- /cash-bank/cash-out/[id]/edit

LIST PAGE:
Tampilkan:
- title Cash Out
- button Create Cash Out jika permission create
- table transaksi
- filter date_from, date_to, cash_bank_account_id, status, search
- amount formatted
- status badge
- action detail/edit/post/void sesuai permission dan status

DETAIL PAGE:
Tampilkan:
- document number
- transaction date
- cash/bank account
- paid_to/contact_id optional
- reference number
- amount
- expense/account mapping info jika tersedia
- description/notes
- status
- journal reference jika ada
- created/posted/voided info jika tersedia
- action edit/post/void/back

FORM:
Buat:
frontend/features/cash-bank/components/CashOutForm.tsx

Fields:
- transaction_date
- cash_bank_account_id
- paid_to/contact_id optional
- reference_number optional
- amount
- expense_account_id optional jika backend support
- description
- notes
- department_id optional jika backend support
- project_id optional jika backend support

Behavior:
- create mode
- edit mode
- client-side validation
- backend validation errors
- redirect ke detail setelah sukses
- amount > 0

API:
Pastikan methods:
- getCashOutList
- getCashOutDetail
- createCashOut
- updateCashOut
- postCashOut
- voidCashOut

REUSE:
- CashBankStatusBadge
- CashBankAccountSelector
- CashBankFilterBar
- CashBankLoadingState
- CashBankErrorState
- CashBankEmptyState
- CashBankVoidDialog

TEST:
Jika tersedia:
- cash out list renders
- create form validation
- submit create calls API
- detail renders
- post button permission-aware
- void requires reason

COMMANDS:
- npm run lint
- npm run build
- npm test jika tersedia

COMMIT MESSAGE:
add cash out frontend
```
