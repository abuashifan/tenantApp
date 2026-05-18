# Phase 4M — Account Mapping Foundation

Phase 4M menambahkan fondasi **account mapping** agar modul transaksi tidak pernah hardcode `account_id`. Mapping final nantinya menunjuk ke Chart of Accounts (COA) **di tenant database**, tetapi Phase 4M belum membuat tabel mapping final karena COA belum ada.

## Tujuan

- Menstandarkan mapping key per module (format `module.purpose`).
- Mendefinisikan required vs optional mappings.
- Memvalidasi kelengkapan mapping sebelum transaksi bisa diposting (future).
- Menyediakan service skeleton untuk Phase 5/6.

## Kenapa Harus Mapping (Bukan Hardcode)

Setiap company bisa punya struktur COA berbeda. Jika account_id di-hardcode, maka:
- posting jurnal jadi salah,
- konfigurasi tidak fleksibel,
- modul sales/purchase/inventory/cash bank jadi tidak reusable.

## Lokasi Data

- Mapping final harus berada di **tenant database** karena menunjuk ke `chart_of_accounts` tenant.
- Phase 4M hanya menyimpan requirement/config dan validator (tanpa storage).
- Tabel `account_mappings` final dibuat di Phase 5 setelah COA tersedia.

## Implementasi

Config:
- `backend/config/account_mappings.php`

Support classes:
- `backend/app/Support/AccountMapping/AccountMappingModule.php`
- `backend/app/Support/AccountMapping/AccountMappingKey.php`
- `backend/app/Support/AccountMapping/AccountMappingRequirement.php`

Service & validator:
- `backend/app/Services/AccountMapping/AccountMappingService.php`
- `backend/app/Services/AccountMapping/AccountMappingValidator.php`

## Required vs Optional

- Required mapping wajib ada sebelum posting (future).
- Optional mapping boleh kosong.

Contoh:
- `sales.accounts_receivable` (required)
- `sales.discount` (optional)

## Behavior Saat Mapping Belum Lengkap (Future)

- Jika `auto_post_transactions = true` dan mapping belum lengkap → posting otomatis harus ditolak.
- Jika `auto_post_transactions = false` → transaksi boleh disimpan draft, tetapi tidak boleh post sampai mapping lengkap.

## Catatan Opening Balance & Closing

Mapping yang disiapkan untuk integrasi:
- `opening_balance.equity`
- `closing.retained_earnings`
- `closing.current_year_earnings`

## Batasan Scope

Phase 4M tidak membuat:
- COA table
- account mapping storage table final
- UI mapping
- journal engine / posting jurnal

## Testing

Jalankan:
- `cd backend`
- `php artisan test --filter=AccountMappingServiceTest`

## Notes Commit

Commit message:
`add account mapping foundation`

