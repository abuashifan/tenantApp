# Phase 4K — Report Visibility Standard

Phase 4K menambahkan standar **visibility** agar modul UI transaksi dan modul laporan akuntansi nanti tidak memiliki aturan query yang berbeda-beda (yang bisa menyebabkan void masuk laporan atau obsolete effect terhitung ganda).

## Tujuan

- Menstandarkan apa yang:
  - visible di UI default (hide void)
  - visible di UI dengan toggle include void
  - reportable untuk laporan normal
  - reportable untuk jurnal/effects (GL/TB/FS)
  - visible untuk audit view / revision view
- Menegaskan bahwa **closed fiscal year** tetap visible (historical data) tetapi read-only.

## Definisi

- **Void**: transaksi dibatalkan (status `void`), hidden di UI default, dan **excluded** dari laporan normal.
- **Obsolete**: generated effect lama yang tergantikan oleh revision baru (`is_obsolete = true`), **excluded** dari laporan normal.
- **Closed fiscal year**: data historis valid, tetap visible untuk histori/laporan, tetapi **read-only** (bukan hidden, bukan void).

## Konsep Query Standard (Masa Depan)

- Transaction list default (UI): `WHERE status != 'void'`
- Transaction list include void (UI toggle): `WHERE status IN ('draft','approved','posted','void')`
- General Ledger / Trial Balance / Financial Statements:
  - `WHERE journal_entries.status = 'posted'`
  - `AND journal_entries.is_obsolete = false`
  - void dan obsolete tidak dihitung
- Audit view: boleh include `void` dan `obsolete`
- Revision view: boleh include `obsolete` berdasarkan `source_revision`

## Implementasi

Config:
- `backend/config/report_visibility.php`

Support:
- `backend/app/Support/Reports/ReportVisibilityMode.php`

Service:
- `backend/app/Services/Reports/ReportVisibilityService.php`

Trait (untuk model masa depan yang punya kolom `status` dan opsional `is_obsolete`):
- `backend/app/Traits/HasReportVisibility.php`

Catatan:
- `hide_voided_transactions` hanya memengaruhi UI list default, bukan laporan accounting.

## Hubungan Dengan Phase Lain

- Phase 4C: lifecycle status standar (draft/approved/posted/void).
- Phase 4H: `is_obsolete` untuk generated effects.
- Phase 4I: revision menaikkan `revision_no` dan effect lama bisa obsolete.
- Phase 4J: audit view boleh include void/obsolete.

## Batasan Scope

Phase 4K tidak membuat:
- General Ledger / Trial Balance / Financial Statements
- tabel jurnal/transaksi
- endpoint report
- UI toggle tampilkan void

## Testing

Jalankan:
- `cd backend`
- `php artisan test --filter=ReportVisibilityServiceTest`

## Notes Commit

Commit message:
`add report visibility foundation`

