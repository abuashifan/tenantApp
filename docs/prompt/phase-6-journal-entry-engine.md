# Phase 6 — Journal Entry Engine

Phase 6 membangun **engine jurnal manual** (debit/kredit) di **tenant database** sebagai fondasi inti akuntansi.

Catatan scope:
- Phase 6 **belum** membuat General Ledger, Trial Balance, Financial Statements.
- Phase 6 **belum** membuat modul Sales/Purchase/Cash Bank/Inventory/Stock Movement.
- Phase 6 hanya menyiapkan struktur & API untuk **journal_entries** dan **journal_entry_lines**.
- System-generated journal **didukung secara struktur**, tetapi **belum diproduksi** oleh modul lain (akan datang di phase berikutnya).
- Analytical Dimensions (Department/Project) ditangani di **Phase 6A**.

## Tenant Tables

### `journal_entries`
Kolom penting:
- `journal_number` (unique per-tenant)
- `journal_date` (date)
- `status` (`draft|approved|posted|void`)
- `revision_no` (default `1`)
- Source link fields:
  - `source_type`, `source_id`, `source_number`, `source_revision`, `source_module`, `source_batch_id`
  - `is_system_generated`, `is_obsolete`
- Audit fields (central user id, tanpa FK lintas DB):
  - `created_by`, `updated_by`, `approved_by`, `posted_by`, `voided_by`
  - `approved_at`, `posted_at`, `voided_at`
  - `void_reason`, `edit_reason`
- `metadata` (json)

Rule report visibility:
- Report/GL di phase berikutnya **wajib** membaca jurnal: `status=posted` dan `is_obsolete=false`.

### `journal_entry_lines`
Kolom penting:
- `journal_entry_id` (FK ke `journal_entries`, cascade delete)
- `account_id` (FK ke `chart_of_accounts`)
- (Phase 6A) optional: `department_id`, `project_id` (nullable)
- `debit`, `credit` (decimal 18,2)
- `line_order`
- `metadata` (json)

## Lifecycle & Business Rules

Status:
- `draft`: belum masuk report
- `approved`: belum masuk report
- `posted`: masuk report
- `void`: tidak masuk report (dan hidden dari index default)

Validasi debit/kredit (wajib):
1. Minimal 2 line.
2. Setiap line wajib `account_id` valid.
3. Satu line tidak boleh memiliki debit dan credit sekaligus (>0 keduanya).
4. Debit/credit tidak boleh negatif.
5. Line tidak boleh keduanya 0.
6. Total debit harus sama dengan total credit (tolerance kecil).

No hard delete:
- Tidak ada endpoint DELETE untuk jurnal.
- “Delete” diganti `void`.

Manual vs system-generated:
- Manual journal:
  - `source_type=manual_journal`
  - `source_module=journal`
  - `is_system_generated=false`
  - `source_revision=revision_no`
- System-generated journal (future):
  - `source_type=sales_invoice|purchase_invoice|opening_balance|...`
  - `source_id`, `source_number`, `source_revision`, `source_module` wajib terisi
  - `is_system_generated=true`
  - Tidak boleh diedit/void langsung dari modul jurnal (harus dari source transaction)

Edit posted manual journal:
- `journal_number` tidak berubah.
- `revision_no` naik.
- Wajib `edit_reason`.
- Snapshot perubahan dicatat via `TransactionRevisionService` (jika tersedia).

## Integrations

### Permission
Endpoint journal memakai middleware `permission:*`:
- `journal.view`
- `journal.create`
- `journal.edit`
- `journal.approve`
- `journal.post`
- `journal.void`

### Company Access / Tenant Isolation
Request wajib:
- `auth:sanctum`
- header `X-Company-ID`
- middleware `company.access` (menghubungkan DB tenant per-request)

### Document Numbering
Nomor jurnal dibuat via `DocumentNumberService`:
- `document_type = journal_entry`
- prefix `JV` (lihat `backend/config/document_numbers.php`)

### Fiscal Year / Date Guard
Journal create/edit/post/void melewati `TransactionPolicyService` yang memanggil `TransactionDateGuardService`.
Contoh: fiscal year `status=closed` akan memblok transaksi (read-only).

### Audit Log
Jika `AuditLogService` tersedia, event yang dicatat:
- `journal.created`
- `journal.updated`
- `journal.approved`
- `journal.posted`
- `journal.voided`

## API Endpoints (Phase 6)

Semua endpoint di bawah:
- `auth:sanctum` + `company.access`
- Tidak ada DELETE route

Routes:
- `GET /api/journals` (permission `journal.view`)
  - query: `status`, `date_from`, `date_to`, `search`, `include_void=true`
- `POST /api/journals` (permission `journal.create`)
- `GET /api/journals/{id}` (permission `journal.view`)
- `PATCH /api/journals/{id}` (permission `journal.edit`)
- `POST /api/journals/{id}/approve` (permission `journal.approve`)
- `POST /api/journals/{id}/post` (permission `journal.post`)
- `POST /api/journals/{id}/void` (permission `journal.void`)

### Request contoh (create)
```json
{
  "journal_date": "2026-05-18",
  "description": "Penyesuaian",
  "lines": [
    {"account_id": 1, "debit": 100000},
    {"account_id": 2, "credit": 100000}
  ]
}
```

## Test Commands
```bash
cd backend
php artisan test --filter=JournalValidationServiceTest
php artisan test --filter=JournalEntryTest
php artisan test --filter=JournalPostingTest
php artisan test --filter=JournalVoidTest
php artisan route:list | grep journals
```

## Limitations (Phase 6)
- Belum ada posting effect ke GL/trial balance.
- Belum ada journal template, recurring, attachment, approval flow lanjutan.
- System-generated journal belum dibuat oleh modul lain (hanya support struktur).

