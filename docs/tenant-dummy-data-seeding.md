# Tenant Dummy Accounting Cycle Seed

## Purpose

`tenant:seed-dummy` mengisi satu tenant database dengan data uji kecil tetapi saling terkait untuk menguji workspace dan laporan melalui API. Data menggunakan prefix `DMY` dan metadata:

```json
{"seeded_by":"tenant_dummy_full_cycle_january_2026","period":"2026-01"}
```

Seeder tidak men-truncate database dan tidak menghapus data di luar dokumen dummy deterministik miliknya sendiri. Rerun memperbarui record dummy yang sama.

## Period

Periode default adalah `2026-01-01` sampai `2026-01-31`.

Command memastikan fiscal year 2026 dan accounting period Januari 2026 pada database central untuk company target berstatus `open`, bila tabel central tersebut tersedia. Transaksi selalu ditulis ke koneksi `tenant`.

## Command Usage

```bash
cd backend
composer dump-autoload
php artisan tenant:seed-dummy 1 --period=2026-01
```

`company_id` bersifat opsional; bila tidak diberikan, command memilih company aktif/trial pertama yang mempunyai tenant aktif. Pada environment `production`, command menolak berjalan kecuali diberi `--force`:

```bash
php artisan tenant:seed-dummy 1 --period=2026-01 --force
```

## Accounting Cycle Scenario

Seeder membuat 27 jurnal posted seimbang:

| Date | Scenario |
| --- | --- |
| 2026-01-01 | Modal awal masuk bank |
| 2026-01-03 | Pembelian persediaan kredit |
| 2026-01-05 | Pembayaran sebagian hutang vendor |
| 2026-01-06 | Uang muka vendor |
| 2026-01-08 | Penjualan kredit dan HPP |
| 2026-01-10 | Penerimaan sebagian piutang |
| 2026-01-11 | Uang muka customer |
| 2026-01-13 | Invoice kedua, HPP, dan apply deposit |
| 2026-01-14 | Transfer bank ke kas kecil |
| 2026-01-15 s.d. 2026-01-23 | Beban operasional dan penjualan tunai |
| 2026-01-18 | Retur penjualan serta pemulihan persediaan |
| 2026-01-20 | Retur pembelian |
| 2026-01-24 | Penerimaan pelunasan sebagian piutang |
| 2026-01-26 | Pembayaran lanjutan hutang vendor |
| 2026-01-31 | Accrued supplies/operating expense adjustments |

Skenario sengaja menyisakan saldo piutang dan hutang agar AR/AP outstanding dan mutation history dapat diuji.

## Seeded Modules

Untuk tenant yang telah dimigrasi penuh, seeder mengisi:

- Master data: 26 COA, 8 contacts, 3 units, 2 product categories, 5 products, 2 warehouses, 4 departments, 3 projects, account mappings.
- Journal: 27 posted balanced journal entries beserta lines.
- Sales: converted quotation, confirmed order, delivered delivery order, 2 posted invoices, customer deposit dan allocation, receipt, return.
- Purchase: converted request, confirmed order, received goods receipt, 2 posted vendor bills, vendor deposit, vendor payment, purchase return.
- Cash/Bank: cash receipts, cash payment, bank transfer, bank reconciliation sample beserta cleared lines.
- Inventory: opening/in/out/return/adjustment stock movements, stock balance, posted adjustment, finalized stock opname.

Jika suatu tabel modul belum tersedia, tabel tersebut dicatat pada output `Skipped tables`; command tidak membuat tabel ataupun endpoint baru.

## Backend Verification

```bash
cd backend
php artisan tenant:seed-dummy 1 --period=2026-01
php artisan route:list
php artisan test
```

Output command menampilkan jumlah jurnal dan hasil trial balance. Untuk data seeded company `1` pada schema penuh, hasil yang diharapkan:

```text
Journal entries: 27
Trial balance: debit 315800000.00 / credit 315800000.00 / balanced YES
Skipped tables: none
```

API dapat diuji setelah login dengan header `Authorization: Bearer ...` dan `X-Company-ID: 1`:

```text
GET /api/master-data/chart-of-accounts
GET /api/journals?date_from=2026-01-01&date_to=2026-01-31&status=posted
GET /api/reports/general-ledger?start_date=2026-01-01&end_date=2026-01-31
GET /api/reports/trial-balance?start_date=2026-01-01&end_date=2026-01-31
GET /api/reports/profit-loss?start_date=2026-01-01&end_date=2026-01-31
GET /api/reports/balance-sheet?as_of_date=2026-01-31
GET /api/reports/cash-flow?start_date=2026-01-01&end_date=2026-01-31
```

## Frontend Verification

```bash
cd frontend-vue
npm run type-check
npm run lint
npm run build
```

Manual flow:

1. Login and select the seeded company.
2. Open Chart of Accounts, Journal Entries, General Ledger, and Trial Balance.
3. Open Profit Loss, Balance Sheet, Cash Flow, Sales, Purchase, Cash Bank, and Inventory workspaces.
4. Refresh the browser; API rows remain because they originate from the tenant SQLite database.
5. Switch company; API rows follow the selected `X-Company-ID`.

## Pinia Mock Status

The designed Chart of Accounts, Journal Entries, General Ledger, and Trial Balance workspaces now fetch their active rows from API services. `mockAccountingDataStore.ts` may remain as an unused design/demo artifact, but it is no longer imported by active accounting workspace features.

## Safety Notes

- Run against a development/demo tenant unless explicitly needed elsewhere.
- Production execution requires `--force`.
- No public seed API endpoint is exposed.
- Existing non-dummy tenant records are not removed.
- Document numbers are deterministic and use `DMY`, for example `JRN-DMY-2026-01-001` and `SI-DMY-2026-01-001`.
