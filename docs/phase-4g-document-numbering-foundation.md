# Phase 4G — Document Numbering Foundation

Phase 4G menambahkan fondasi **penomoran dokumen** yang konsisten dan otomatis untuk semua modul transaksi (journal/sales/purchase/cash bank/inventory) tanpa membuat tabel transaksi atau endpoint transaksi.

## Tujuan

- Nomor dokumen berlaku **per company**.
- Default reset period: **per fiscal year**.
- Format default: `{PREFIX}-{YEAR}-{NUMBER}` (contoh: `SI-2026-000001`).
- Nomor dibuat saat transaksi pertama kali disimpan (generate number).
- Nomor **tidak boleh dipakai ulang** walaupun transaksi `void`.
- Edit transaksi **tidak mengubah** nomor dokumen (hanya menaikkan `revision_no`).
- Preview nomor **bukan final** (bisa berubah jika user lain menyimpan duluan).

## Central Database Schema

### `document_numbering_settings`
Migration: `backend/database/migrations/central/2026_05_18_000001_create_document_numbering_settings_table.php`

Menyimpan setting format per company + document type:
- `company_id`
- `document_type`
- `prefix`, `format`, `reset_period`, `padding`
- `mode` (`auto` / `manual`)
- `allow_manual_number`, `allow_duplicate_number`
- `is_active`
- `metadata`

Unique: `(company_id, document_type)`

### `document_number_sequences`
Migration: `backend/database/migrations/central/2026_05_18_000002_create_document_number_sequences_table.php`

Menyimpan counter/sequence per company + document type + period key:
- `company_id`
- `document_type`
- `fiscal_year_id` (nullable)
- `period_key` (`2026`, `2026-05`, atau `all`)
- `last_number`

Unique: `(company_id, document_type, period_key)`

## Document Types & Prefix Default

Config: `backend/config/document_numbers.php`

Default mapping:
- `journal_entry` → `JV`
- `sales_invoice` → `SI`
- `purchase_invoice` → `PI`
- `cash_receipt` → `CR`
- `cash_payment` → `CP`
- `bank_transfer` → `BT`
- `stock_adjustment` → `SA`
- `stock_movement` → `SM`
- `stock_opname` → `SO`
- `opening_balance` → `OB`
- `closing_entry` → `CL`

## Service

Service: `backend/app/Services/DocumentNumbering/DocumentNumberService.php`

Fungsi utama:
- `ensureDefaultSettings()` membuat setting default untuk semua document types di config.
- `generate()` menghasilkan nomor dokumen dan **increment** sequence (transaction-safe via `DB::transaction`).
- `preview()` menghasilkan nomor dokumen tanpa increment sequence (catatan: tidak final).
- `validateManualNumber()` placeholder policy untuk manual number (tanpa query duplicate ke tabel transaksi karena modul belum ada).

### Reset Period
- `never` → `period_key = all`
- `fiscal_year` (default) → `period_key = <year>` (prefer fiscal year dari Phase 4F bila ada)
- `monthly` → `period_key = YYYY-MM` (disiapkan untuk future)

## Relasi ke Fiscal Year (Phase 4F)

Penomoran bersifat fiscal-year aware:
- Year untuk nomor mengikuti `document_date` / `transaction_date`.
- Jika fiscal year metadata tersedia, `fiscal_year_id` di sequence akan diisi.

## Hubungan dengan Phase 4H (Source Link Standard)

Nomor dokumen yang dihasilkan akan dipakai sebagai `source_number` pada efek turunan (journal entry, stock movement, dll) agar bisa ditelusuri balik ke dokumen sumber.

## Batasan Scope

Phase 4G tidak membuat:
- tabel transaksi nyata (invoice/journal/purchase/cash bank/inventory)
- endpoint transaksi
- UI pengaturan penomoran
- duplicate check manual number ke tabel transaksi (akan ditambahkan saat modul dibuat)

## Testing

Jalankan:
- `cd backend`
- `php artisan test --filter=DocumentNumberServiceTest`

## Notes Commit

Commit message:
`add document numbering foundation`

