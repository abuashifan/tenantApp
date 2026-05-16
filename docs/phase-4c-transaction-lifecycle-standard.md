# Phase 4C — Transaction Lifecycle Standard

Phase 4C membuat standar lifecycle transaksi yang akan dipakai semua modul transaksi (journal, sales, purchase, cash bank, inventory, fixed asset) **tanpa** membuat tabel transaksi nyata atau endpoint lifecycle.

## Tujuan

- Menetapkan status utama transaksi yang konsisten.
- Menetapkan status accounting/system effect yang konsisten.
- Menetapkan aturan visibility dan reportability (void hidden, tidak reportable).
- Menetapkan bahwa hard delete tidak ada (delete diganti void).
- Menetapkan bahwa `posted` tetap bisa editable secara lifecycle (dengan guard/policy lain).
- Menetapkan konteks closing tahunan (fiscal year) tanpa membuat implementasinya sekarang.

## Keputusan Bisnis Wajib

1. Hard delete transaksi tidak ada.
2. Delete diganti void.
3. Void hidden by default dari UI client.
4. UI boleh punya toggle “tampilkan transaksi void” (di luar scope Phase 4C).
5. Void tidak masuk laporan normal.
6. Buku besar harus clean: hanya posted aktif (dan tidak obsolete).
7. Posted transaction boleh diedit secara lifecycle jika setting mengizinkan dan tidak ada dependency.
8. Status `void` terminal dan read-only.
9. Closed fiscal year / closed period membuat transaksi read-only (walaupun `posted` termasuk editable lifecycle).
10. Closing reminder hanya tahunan/fiscal year, bukan bulanan.
11. Tidak ada monthly closing reminder.
12. Tidak ada monthly transaction blocking.
13. Entry fiscal year baru nanti diblok jika fiscal year sebelumnya belum closed.
14. Setelah fiscal year closed, transaksi tahun tersebut tetap visible untuk histori/laporan, tetapi read-only.
15. Tenant tetap **1 company = 1 tenant database** dan tidak bergantung pada SQLite (SQLite hanya dev/MVP awal; production bisa driver lain).

## Status Transaksi Utama

Status utama transaksi user:
- `draft`
- `approved`
- `posted`
- `void`

Catatan:
- `posted` termasuk editable status (lifecycle) sesuai keputusan project.
- `void` terminal/read-only.

## Status Accounting / System Effect

Status effect (system) untuk jejak accounting/ledger:
- `draft`
- `posted`
- `void`
- `obsolete`

`obsolete` hanya untuk effect/system-generated, **bukan** status utama transaksi user.

## Standard Visibility & Reporting

- Visible (default UI): `draft`, `approved`, `posted`
- Hidden (default UI): `void`
- Reportable journal (normal reports): hanya `posted` dan **not obsolete**

## Flow Edit Posted Transaction (Dokumentasi)

Pola edit posted transaction (akan diimplementasikan bertahap):
1. cek permission
2. cek company setting
3. cek dependency
4. cek fiscal year / period lock
5. cek transaction date guard
6. void/obsolete accounting effect lama
7. update transaksi utama
8. generate accounting effect baru
9. post ulang jika perlu
10. simpan revision/audit

Phase 4C hanya mendokumentasikan flow ini, belum mengimplementasikan.

## Flow Void Transaction (Dokumentasi)

1. cek permission
2. cek company setting (boleh void atau tidak)
3. cek dependency (jika ada dependency yang melarang void)
4. set status transaksi menjadi `void`
5. set `void_reason`, `voided_by`, `voided_at`
6. void accounting effect terkait
7. transaksi menjadi read-only

## Metadata Standar Transaksi (Wajib Dipertimbangkan)

Semua transaksi utama nanti wajib mempertimbangkan field:
- `status`
- `revision_no`
- `transaction_date`
- `created_by`, `updated_by`
- `approved_by`, `posted_by`, `voided_by`
- `created_at`, `updated_at`
- `approved_at`, `posted_at`, `voided_at`
- `edit_reason`
- `void_reason`

Accounting/system-generated effect nanti wajib mempertimbangkan:
- `source_type`, `source_id`
- `source_number`, `source_revision`
- `source_module`
- `source_batch_id`
- `is_system_generated`
- `is_obsolete`

## Catatan Fiscal Year & Closing

Phase 4C tidak membuat fiscal year/period lock/date guard.

Phase 4F nanti akan membuat:
- `fiscal_years`, `accounting_periods`
- `FiscalYearService`, `PeriodLockService`, `TransactionDateGuardService`
- block outside current fiscal year
- annual closing gate
- read-only closed fiscal year

Catatan closing:
- Closing reminder hanya tahunan (fiscal year).
- Tidak ada reminder closing bulanan.
- Tidak ada blocking transaksi bulanan.
- Jika fiscal year sebelumnya belum closed, input fiscal year baru nanti harus diblok.
- Tutup buku tetap di tenant database yang sama (tidak membuat database baru).

## Source Standard (Ringkas)

- Config: `backend/config/transaction_lifecycle.php`
- Helpers: `App\\Support\\Transaction\\TransactionStatus`, `App\\Support\\Transaction\\TransactionLifecycle`
- Trait: `App\\Traits\\HasTransactionLifecycle`

## Batasan Scope

Phase 4C tidak membuat:
- migration tabel transaksi (journal/invoice/stock movement)
- endpoint API lifecycle (create/edit/void)
- dependency service / fiscal year service / period lock / date guard
- UI apapun

## Command Test

- `cd backend`
- `php artisan migrate`
- `php artisan test --filter=TransactionLifecycleTest`

## Notes Commit

Commit message:
`add transaction lifecycle foundation`

=====================
# progress notes
--------------------
Phase 4C selesai sesuai docs/prompt_phase-4c.md (tanpa push ke GitHub).

Revisi minimal Phase 4A (sesuai rules terbaru)

Menambahkan field baru pada company_accounting_settings:
block_outside_current_fiscal_year boolean default true
date_warning_enabled boolean default true
(user_permission_mode sudah ada dari Phase 4B) tetap role_template / manual_per_user
Update model + request validation + default service + docs Phase 4A.
Transaction Lifecycle Standard (Phase 4C)

Menambahkan config lifecycle, helper class status/lifecycle, reusable trait, unit test, dan dokumentasi.
Tidak membuat tabel transaksi, tidak membuat route API baru, tidak membuat modul akuntansi.
File created (baru)
backend/database/migrations/2026_05_17_000001_add_policy_fields_to_company_accounting_settings_table.php
backend/config/transaction_lifecycle.php
backend/app/Support/Transaction/TransactionStatus.php
backend/app/Support/Transaction/TransactionLifecycle.php
backend/app/Traits/HasTransactionLifecycle.php
backend/tests/Unit/TransactionLifecycleTest.php
docs/phase-4c-transaction-lifecycle-standard.md
File edited
backend/app/Models/CompanyAccountingSetting.php (fillable/casts: tambah policy fields)
backend/app/Services/Settings/CompanySettingService.php (default create: tambah policy fields)
backend/app/Http/Requests/Settings/UpdateCompanyAccountingSettingRequest.php (validation: tambah policy fields)
docs/phase-4a-company-settings-foundation.md (tambahkan penjelasan policy fields)
docs/phase-4b-permission-foundation-basic.md (tegaskan permission granular, bukan permission kasar)
Command yang berhasil dijalankan
cd backend
composer dump-autoload
php artisan migrate --force
php artisan test --filter=TransactionLifecycleTest
php artisan test
Catatan penting
Unit test TransactionLifecycleTest dibuat sebagai Laravel test (Tests\TestCase) supaya helper config() tersedia (bukan PHPUnit bare test).
Phase 4C hanya foundation lifecycle + dokumentasi; fiscal year/period lock/date guard/annual closing gate akan dibuat di Phase 4F/8A.
Tidak ada monthly closing reminder dan tidak ada monthly transaction blocking (didokumentasikan).
Tenant tetap 1 company = 1 tenant database; tidak bergantung pada SQLite (SQLite hanya dev/MVP, production bisa driver lain).