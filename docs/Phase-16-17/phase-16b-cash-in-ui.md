# Phase 16B — Cash In UI

```text
Kita lanjut Phase 16B project TenantAppDevelopment.

NAMA SUBPHASE:
Phase 16B — Cash In UI

WAJIB:
Baca hasil Phase 16A.
Gunakan shared cash bank API client, types, components, permission guard, dan layout yang sudah dibuat.
Update docs/phase-16-cash-bank-frontend-mvp.md setelah selesai.

TUJUAN:
Membuat UI Cash In / Penerimaan Kas Bank untuk mencatat dan melihat transaksi uang masuk.

SCOPE:
1. Cash In list page.
2. Cash In detail page.
3. Create Cash In form.
4. Edit draft Cash In form.
5. Post Cash In action.
6. Void Cash In action.
7. Filter list.
8. Status badge.
9. Loading/error/empty state.
10. Permission-aware action buttons.
11. Period lock warning jika backend mengirim error lock.
12. Dokumentasi Phase 16B.

WAJIB BACA:
- frontend/app/cash-bank/page.tsx
- frontend/features/cash-bank/api/cashBankApi.ts
- frontend/types/cash-bank.ts
- frontend/features/cash-bank/components/*
- frontend/lib/api.ts
- backend/routes/api.php hanya endpoint cash in
- docs/phase-16-cash-bank-frontend-mvp.md

JANGAN:
- Membuat backend endpoint baru.
- Mengubah service backend cash bank.
- Membuat Cash Out UI.
- Membuat Bank Transfer UI.
- Membuat reconciliation UI.
- Membuat export PDF/Excel.

ROUTES:
- /cash-bank/cash-in
- /cash-bank/cash-in/create
- /cash-bank/cash-in/[id]
- /cash-bank/cash-in/[id]/edit

LIST PAGE:
Tampilkan:
- title Cash In
- button Create Cash In jika permission create
- table transaksi
- filter date_from, date_to, cash_bank_account_id, status, search
- pagination jika API support
- status badge
- amount formatted
- action detail/edit/post/void sesuai permission dan status

DETAIL PAGE:
Tampilkan:
- document number
- date
- cash/bank account
- payer/source
- reference number
- amount
- description/notes
- status
- journal reference jika ada
- created/posted/voided info jika API menyediakan
- action edit/post/void/back

FORM:
Buat:
frontend/features/cash-bank/components/CashInForm.tsx

Fields:
- transaction_date
- cash_bank_account_id
- received_from/contact_id optional
- reference_number optional
- amount
- description
- notes
- department_id optional jika backend support
- project_id optional jika backend support

Behavior:
- create mode
- edit mode
- client-side validation basic
- submit loading
- show backend validation errors
- redirect ke detail setelah sukses
- amount harus > 0

API:
Pastikan methods:
- getCashInList
- getCashInDetail
- createCashIn
- updateCashIn
- postCashIn
- voidCashIn

VOID:
Buat/reuse dialog reason. Void wajib minta reason.

POST:
Post button:
- muncul hanya untuk draft
- confirm sebelum post
- disabled saat loading
- handle period locked error

ERROR HANDLING:
- 401 redirect login
- 403 permission denied
- 422 validation errors
- period locked warning
- not found state

TEST:
Jika tersedia:
- list page renders
- create form validation
- submit create calls API
- detail page renders
- post hidden without permission
- void requires reason

COMMANDS:
- npm run lint
- npm run build
- npm test jika tersedia

COMMIT MESSAGE:
add cash in frontend
```
