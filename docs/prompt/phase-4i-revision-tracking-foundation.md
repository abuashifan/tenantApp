# Phase 4I — Revision Tracking Foundation

Phase 4I menambahkan fondasi **revision tracking** agar transaksi (termasuk `posted`) yang diedit tetap punya histori perubahan yang rapi, tanpa membuat tabel transaksi nyata atau endpoint edit/void.

## Tujuan

- Transaksi utama memiliki `revision_no` (default 1).
- Edit transaksi menaikkan `revision_no` (terutama untuk posted).
- Nomor dokumen **tidak berubah** saat transaksi diedit (Phase 4G).
- Histori perubahan disimpan di `transaction_revisions` (tenant database).
- Old/new snapshot dan `changed_fields` tersedia untuk kebutuhan audit dan troubleshooting.

## Tenant Database Schema

Migration: `backend/database/migrations/tenant/2026_05_18_000003_create_transaction_revisions_table.php`

Table: `transaction_revisions` (di tenant database)

Menyimpan:
- source link: `source_type`, `source_id`, `source_number`, `source_module`
- revision: `source_revision_from`, `source_revision_to`
- action: `edit` / `void` / `correction` / `system_rebuild`
- reason: `edit_reason` / `void_reason`
- snapshots: `old_values`, `new_values`, `changed_fields`
- context: `edited_by` (central user id), `edited_at`, `metadata`

Catatan:
- Tidak ada foreign key ke central users/companies dari tenant.
- `edited_by` hanya disimpan sebagai angka.

## Model & Service

- Model: `backend/app/Models/Tenant/TransactionRevision.php` (connection `tenant`)
- Service: `backend/app/Services/Transactions/TransactionRevisionService.php`
- Snapshot helper: `backend/app/Support/Revision/RevisionSnapshot.php`
- Trait: `backend/app/Traits/HasRevisionTracking.php`

## Flow Edit Posted (Dokumentasi)

1. Policy `canEdit`
2. Dependency clear (Phase 4E)
3. Fiscal year/date guard clear (Phase 4F)
4. Capture old snapshot
5. Update transaksi
6. `revision_no` naik
7. Record `transaction_revisions` action `edit`
8. Mark generated effects lama obsolete/void by `source_revision` lama (Phase 4H standard)
9. Generate effects baru dengan `source_revision` terbaru
10. Audit log (Phase 4J)

## Flow Void (Dokumentasi)

1. Policy `canVoid`
2. Dependency clear
3. Fiscal year/date guard clear
4. Capture snapshot
5. Set status transaksi `void`
6. Record revision action `void`
7. Void related generated effects by source link
8. Audit log

## Batasan Scope

Phase 4I tidak membuat:
- tabel transaksi nyata (invoice/journal/purchase/cash bank/inventory)
- endpoint edit/void transaksi
- implementasi mark obsolete effect (baru standard source link)
- audit log final (Phase 4J basic menyusul)

## Testing

Jalankan:
- `cd backend`
- `php artisan test --filter=TransactionRevisionServiceTest`

## Notes Commit

Commit message:
`add revision tracking foundation`

