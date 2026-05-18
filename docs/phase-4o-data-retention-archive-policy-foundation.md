# Phase 4O — Data Retention & Archive Policy Foundation

Phase 4O menambahkan fondasi **policy** data retention & archive agar sistem punya aturan tentang data void, data lama, audit log, revision history, dan kesiapan archive/purge di masa depan — tanpa membuat archive engine/purge engine.

## Prinsip

- Hard delete transaksi aktif tidak ada (delete diganti `void`).
- Void tetap disimpan untuk audit (hidden di UI normal dan excluded dari laporan normal).
- Closed fiscal year tetap visible read-only (bukan archive otomatis).
- Archive/purge advanced tidak dibuat di MVP.
- Jika purge nanti dibuat harus ada: backup, audit log, preview, dan otorisasi tinggi.

## Implementasi

Config:
- `backend/config/data_retention.php`

Support:
- `backend/app/Support/DataRetention/DataRetentionPolicy.php`
- `backend/app/Support/DataRetention/RetentionAction.php`
- `backend/app/Support/DataRetention/RetentionDecision.php`

Service & validator:
- `backend/app/Services/DataRetention/DataRetentionService.php` (decision only, tidak mengeksekusi archive/purge)
- `backend/app/Services/DataRetention/DataRetentionValidator.php`

## Behavior (Ringkas)

- Voided transaction:
  - default: `hide/keep` (kept for audit)
  - archive eligible hanya jika policy auto archive enabled dan umur data melewati threshold
- Closed fiscal year:
  - default: `keep` (visible read-only)
  - archive eligible hanya jika enabled dan melewati threshold years
- Purge:
  - default blocked (policy default tidak mengizinkan purge)
  - purge selalu butuh safeguards (backup/audit/preview)

## Hubungan Dengan Phase Lain

- Phase 4C: lifecycle (void bukan reportable).
- Phase 4H: source link & batch import (`source_batch_id`).
- Phase 4J: audit log retention (tenant audit logs).
- Phase 4K: report visibility (void/obsolete excluded).
- Phase 16: backup foundation.
- Phase 18: advanced archive/purge.

## Batasan Scope

Phase 4O tidak membuat:
- archive engine
- purge engine
- UI archive/purge
- delete endpoint / hard delete

## Testing

Jalankan:
- `cd backend`
- `php artisan test --filter=DataRetentionServiceTest`

## Notes Commit

Commit message:
`add data retention policy foundation`

