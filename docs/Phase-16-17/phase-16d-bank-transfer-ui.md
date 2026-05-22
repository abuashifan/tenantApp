# Phase 16D — Bank Transfer UI

```text
Kita lanjut Phase 16D project TenantAppDevelopment.

NAMA SUBPHASE:
Phase 16D — Bank Transfer UI

WAJIB:
Baca hasil Phase 16A–16C.
Gunakan reusable components Cash Bank.
Update docs/phase-16-cash-bank-frontend-mvp.md setelah selesai.

TUJUAN:
Membuat UI Bank Transfer untuk pemindahan dana antar akun kas/bank.

SCOPE:
1. Bank Transfer list page.
2. Bank Transfer detail page.
3. Create Bank Transfer form.
4. Edit draft Bank Transfer form.
5. Post transfer action.
6. Void transfer action.
7. Filter list.
8. Permission-aware action.
9. Transfer amount preview.
10. Period lock warning.
11. Dokumentasi Phase 16D.

WAJIB BACA:
- frontend/app/cash-bank/cash-in/*
- frontend/app/cash-bank/cash-out/*
- frontend/features/cash-bank/api/cashBankApi.ts
- frontend/features/cash-bank/components/*
- frontend/types/cash-bank.ts
- backend/routes/api.php hanya endpoint bank transfer
- docs/phase-16-cash-bank-frontend-mvp.md

JANGAN:
- Membuat backend endpoint baru.
- Mengubah journal posting backend.
- Membuat bank reconciliation UI.
- Membuat report UI.
- Membuat multi-currency advanced.
- Membuat export.

ROUTES:
- /cash-bank/transfers
- /cash-bank/transfers/create
- /cash-bank/transfers/[id]
- /cash-bank/transfers/[id]/edit

LIST PAGE:
Tampilkan:
- title Bank Transfer
- button Create Transfer jika permission create
- table: transfer number, date, from account, to account, amount, status
- filter date_from, date_to, from_account_id, to_account_id, status, search

DETAIL PAGE:
Tampilkan:
- transfer number
- date
- from cash/bank account
- to cash/bank account
- amount
- admin fee jika backend support
- reference number
- notes
- status
- journal reference jika tersedia
- action buttons sesuai permission dan status

FORM:
Buat:
frontend/features/cash-bank/components/BankTransferForm.tsx

Fields:
- transfer_date
- from_cash_bank_account_id
- to_cash_bank_account_id
- amount
- reference_number optional
- notes optional

Validation:
- from account required
- to account required
- from account tidak boleh sama dengan to account
- amount > 0
- transfer_date required

Jika backend support:
- admin_fee_amount
- admin_fee_account_id
- department_id
- project_id

API:
Pastikan methods:
- getTransferList
- getTransferDetail
- createTransfer
- updateTransfer
- postTransfer
- voidTransfer

UX:
- Tampilkan preview From Account -amount dan To Account +amount
- Confirm sebelum post
- Void wajib reason

PERMISSIONS:
- cash_bank.transfers.view
- cash_bank.transfers.create
- cash_bank.transfers.edit
- cash_bank.transfers.post
- cash_bank.transfers.void

TEST:
Jika tersedia:
- transfer list renders
- same from/to account blocked
- create transfer calls API
- post action permission-aware
- void requires reason

COMMANDS:
- npm run lint
- npm run build
- npm test jika tersedia

COMMIT MESSAGE:
add bank transfer frontend
```
