# Phase 4L — Opening Balance Standard

Phase 4L menambahkan standar/fondasi **opening balance** agar saldo awal masuk ke sistem akuntansi melalui **opening journal**, bukan angka mati di COA.

## Prinsip

- Opening balance harus masuk buku besar lewat jurnal pembuka.
- Opening balance harus bisa diaudit (source link + audit log).
- Opening balance memakai:
  - `document_type = opening_balance` (Phase 4G, prefix default `OB`)
  - `source_type = opening_balance` dan `source_module = opening_balance` (Phase 4H)
- Opening balance harus balance (total debit = total credit).

## Implementasi (Foundation)

Config:
- `backend/config/opening_balance.php`

Value objects / helpers:
- `backend/app/Support/OpeningBalance/OpeningBalanceType.php`
- `backend/app/Support/OpeningBalance/OpeningBalanceLine.php`
- `backend/app/Support/OpeningBalance/OpeningBalanceBatch.php`

Validator + service skeleton:
- `backend/app/Services/OpeningBalance/OpeningBalanceValidator.php`
- `backend/app/Services/OpeningBalance/OpeningBalanceService.php`

Catatan:
- `prepareJournalPayload()` hanya menyiapkan payload untuk Journal Entry Engine (Phase 6). Tidak melakukan insert/posting jurnal karena tabel jurnal belum ada.

## Rules Penting

- Default opening balance hanya untuk akun riil: `asset`, `liability`, `equity`.
- `revenue`/`expense` ditolak by default (kecuali nanti ada mode migrasi).
- Jika fiscal year sudah closed, opening balance read-only; koreksi melalui jurnal koreksi di tahun berjalan (bukan mengubah opening balance tahun lama).

## Hubungan Dengan Phase Lain

- Phase 4F: fiscal year (opening balance umumnya dibuat untuk fiscal year awal).
- Phase 4G: document numbering (OB).
- Phase 4H: source link (opening_balance).
- Phase 6: journal entry engine akan memakai payload opening balance.
- Phase 7: GL/Trial Balance mengambil saldo awal dari opening journal (bukan dari angka COA).

## Batasan Scope

Phase 4L tidak membuat:
- chart of accounts table
- journal_entries table
- opening balance UI / endpoint
- posting opening journal nyata

## Testing

Jalankan:
- `cd backend`
- `php artisan test --filter=OpeningBalanceServiceTest`

## Notes Commit

Commit message:
`add opening balance foundation`

