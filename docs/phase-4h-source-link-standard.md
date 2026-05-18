# Phase 4H — Source Link Standard

Phase 4H menambahkan standar **source link** agar semua efek turunan dari sebuah transaksi bisa dilacak balik ke dokumen sumbernya, tanpa membuat tabel transaksi nyata, endpoint, atau import engine.

## Tujuan

- Setiap efek sistem (journal entry, stock movement, cash bank transaction, audit log, dll) menyimpan metadata asal:
  - `source_type`, `source_id`, `source_number`, `source_revision`, `source_module`
  - `source_batch_id` (untuk import batch / batch processing)
  - `is_system_generated`, `is_obsolete`
- Mendukung lifecycle & policy:
  - Edit posted transaction: effect lama bisa ditandai obsolete, effect baru dibuat dengan `source_revision` terbaru.
  - Void transaction: semua effect terkait bisa ditemukan berdasarkan `source_type + source_id`.

## Config

File: `backend/config/source_links.php`

Berisi daftar:
- `source_types`
- `source_modules`
- `system_generated_effects`

## Support Classes & Value Object

- `backend/app/Support/SourceLink/SourceType.php`
- `backend/app/Support/SourceLink/SourceModule.php`
- `backend/app/Support/SourceLink/SourceLink.php`
- `backend/app/Support/SourceLink/SourceLinkFactory.php`

### Contoh Source Link

Sales Invoice `SI-2026-000015` (id 15, revision 2, module sales) menghasilkan Journal Entry:
- `source_type = sales_invoice`
- `source_id = 15`
- `source_number = SI-2026-000015`
- `source_revision = 2`
- `source_module = sales`
- `is_system_generated = true`
- `is_obsolete = false`

Jika invoice diedit ke revision 3:
- effect lama (revision 2) ditandai `is_obsolete = true`
- effect baru dibuat dengan `source_revision = 3`

## Trait: HasSourceLink

File: `backend/app/Traits/HasSourceLink.php`

Trait ini disiapkan untuk dipakai di model efek sistem masa depan (mis: `journal_entries`, `stock_movements`, `cash_bank_transactions`).

Trait menyediakan:
- scopes filter (`forSource`, `forSourceNumber`, `forSourceRevision`, `forSourceModule`, `forSourceBatch`, `systemGenerated`, `notObsolete`, `obsolete`)
- helper `sourceLink()` untuk membangun `SourceLink` dari kolom model
- helper status `isSystemGenerated()`, `isObsolete()`, `markAsObsolete()`, `belongsToSource()`

## Standard Kolom Untuk Migration Masa Depan

Phase 4H tidak membuat migration transaksi, tetapi standar kolom untuk tabel efek sistem:
- `source_type` nullable/string
- `source_id` nullable
- `source_number` nullable/string
- `source_revision` nullable/integer
- `source_module` nullable/string
- `source_batch_id` nullable/string
- `is_system_generated` boolean default false
- `is_obsolete` boolean default false
- `metadata` json nullable (opsional)

Tabel yang nanti wajib mengikuti standar ini:
- `journal_entries`
- `stock_movements`
- `cash_bank_transactions`
- `audit_logs` (jika dipakai untuk effect)

## Hubungan Dengan Phase Lain

- Phase 4C (lifecycle): source link tidak menggantikan lifecycle.
- Phase 4E (dependency): dependency checker bisa memakai source link untuk mencari “transaksi turunan”.
- Phase 4G (document numbering): nomor dokumen akan dipakai sebagai `source_number`.
- Phase 4I (revision tracking): `source_revision` akan diselaraskan dengan revision tracking yang lebih lengkap.

## Batasan Scope

Phase 4H tidak membuat:
- tabel invoice/journal/stock movement
- import engine
- endpoint void/edit transaction
- implementasi voiding effect

## Testing

Jalankan:
- `cd backend`
- `php artisan test --filter=SourceLinkTest`

## Notes Commit

Commit message:
`add source link foundation`

