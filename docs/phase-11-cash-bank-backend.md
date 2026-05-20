# Phase 11 — Cash Bank Backend

## Scope & Notes

- Phase 11 adalah **backend-first**.
- Phase 11 **bukan frontend**; Cash/Bank frontend masuk **Phase 16**.
- Phase 11 fokus **cash movement** dan **bank transaction management**.
- Phase 11 belum membuat:
  - auto bank feed integration
  - reconciliation AI / import statement parser
  - advanced reconciliation (tetap lightweight/basic dulu)
  - multi currency penuh
  - advanced cash flow report (target Phase 19/22)

## Phase 11A — Cash Bank Foundation

Tujuan Phase 11A: menyiapkan fondasi bersama untuk transaksi cash bank (Phase 11B–11G) agar tidak perlu refactor besar.

### Existing marker

- Cash/bank account diidentifikasi dari `chart_of_accounts.is_cash_bank = true` (tenant DB).

### Endpoint (foundation)

- `GET /api/cash-bank/accounts`
  - Middleware: `auth:sanctum`, `company.access`, `permission:cash_bank.view`
  - Query: `include_inactive=1` untuk ikut mengembalikan akun cash/bank yang nonaktif.

## Limitations (Phase 11A)

- Belum ada transaksi Cash In / Cash Out / Transfer.
- Belum ada reconciliation.
- Belum ada export dan UI.

