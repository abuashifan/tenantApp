# Demo Trading Company Accounting Cycle 2025

## Tujuan

Dokumen ini menjelaskan demo data tenant untuk menguji siklus akuntansi perusahaan dagang penuh pada backend Laravel API TenantAppDevelopment.

Demo dibuat untuk tenant target saja melalui command:

```bash
php artisan tenant:seed-demo-accounting-cycle --company-id=1 --year=2025 --reset-demo-data
```

Command tidak membuat endpoint publik baru, tidak mengubah kontrak API, tidak mengubah frontend, dan tidak mengubah migration.

## Profil Demo

- Company: PT Nusantara Dagang Sejahtera
- Tahun fiskal: 2025
- Periode data: 2025-01-01 sampai 2025-12-31
- Mata uang: IDR
- Jenis usaha: perusahaan dagang pembelian barang dari supplier dan penjualan ke customer
- Accounting period: Januari sampai Desember 2025 dibuat open secara default

Optional close/lock:

```bash
php artisan tenant:seed-demo-accounting-cycle --company-id=1 --year=2025 --reset-demo-data --close-year
```

Default command membiarkan tahun 2025 open supaya data demo mudah diedit dan diuji.

## Master Data

Seeder membuat COA untuk kas/bank, piutang, persediaan, uang muka vendor/customer, PPN, hutang, modal, retained earnings, penjualan, retur/potongan, COGS, beban operasional, pendapatan bunga, dan beban lain.

Customer:

- Toko Sumber Rezeki
- Toko Maju Jaya
- CV Berkah Abadi
- Toko Amanah Mart
- PT Ritel Nusantara

Supplier:

- PT Grosir Utama Indonesia
- CV Sinar Distribusi
- PT Prima Produk Nasional
- UD Sentosa Supplier

Produk:

- Beras Premium 5kg
- Minyak Goreng 2L
- Gula Pasir 1kg
- Tepung Terigu 1kg
- Kopi Sachet Box
- Mie Instan Karton
- Sabun Cair 1L
- Air Mineral Karton

Unit: `pcs`, `karton`, `dus`, `pack`, `kg`, `liter`.

Warehouse: Gudang Utama dan Gudang Retur.

Department: Operasional, Penjualan, Administrasi, Gudang.

Project: Campaign Q1 2025, Promo Lebaran 2025, Year End Clearance 2025.

## Opening Balance

Opening balance per 2025-01-01 dibuat sebagai posted journal, bukan saldo final di COA.

Debit:

- Kas: 25.000.000
- Bank: 175.000.000
- Persediaan Barang Dagang: 80.000.000
- Perlengkapan Kantor: 5.000.000
- Sewa Dibayar Dimuka: 12.000.000
- Peralatan Kantor: 30.000.000

Credit:

- Modal Disetor: 327.000.000

Total debit dan credit: 327.000.000.

## Ringkasan Transaksi

Setiap bulan 2025 memiliki posted journal untuk pembelian persediaan, penjualan, COGS, penerimaan customer, pembayaran supplier, gaji, listrik/air, internet, transportasi, biaya administrasi bank, dan pendapatan bunga bank.

Variasi workflow:

- Quotation -> sales order -> delivery order -> proforma invoice -> sales invoice -> receipt
- Direct sales invoice
- Customer deposit dan allocation
- Full paid, partial paid, dan unpaid invoice
- Sales return
- Purchase request -> purchase order -> goods receipt -> vendor bill -> vendor payment
- Direct vendor bill
- Vendor deposit dan allocation
- Purchase return
- Cash receipt, cash payment, bank transfer, dan bank reconciliation sample
- Stock movement opening, purchase in, sales out, sales return in, purchase return out, stock adjustment, dan stock opname

## Jurnal Penyesuaian

Per 2025-12-31:

- Beban Sewa 12.000.000 / Sewa Dibayar Dimuka 12.000.000
- Beban Perlengkapan 4.000.000 / Perlengkapan Kantor 4.000.000
- Beban Penyusutan 6.000.000 / Akumulasi Penyusutan Peralatan Kantor 6.000.000
- Beban Gaji 8.000.000 / Beban Yang Masih Harus Dibayar 8.000.000
- Beban Lain-lain 750.000 / Persediaan Barang Dagang 750.000 untuk selisih opname

## Reset Data

Tanpa `--reset-demo-data`, command akan berhenti jika data demo ini sudah ada di tenant target.

Dengan `--reset-demo-data`, command hanya menghapus data tenant yang memiliki metadata:

```json
{"seeded_by":"trading_company_accounting_cycle_2025"}
```

Data central penting seperti user, company assignment, subscription, dan tenant database tidak dihapus.

## Endpoint Cek Manual

Gunakan header `X-Company-ID` sesuai tenant target.

- `GET /api/reports/general-ledger?start_date=2025-01-01&end_date=2025-12-31`
- `GET /api/reports/trial-balance?start_date=2025-01-01&end_date=2025-12-31`
- `GET /api/reports/profit-loss?start_date=2025-01-01&end_date=2025-12-31`
- `GET /api/reports/balance-sheet?as_of_date=2025-12-31`
- `GET /api/reports/cash-flow?start_date=2025-01-01&end_date=2025-12-31`
- `GET /api/reports/financial-summary?start_date=2025-01-01&end_date=2025-12-31`
- `GET /api/sales/ar-aging`
- `GET /api/purchase/ap-aging`
- `GET /api/inventory/reports/valuation`
- `GET /api/inventory/reports/stock-card`

## Consistency Checklist

- Opening balance journal balanced
- Semua posted journal balanced
- Trial balance debit = credit
- Profit loss berisi revenue, COGS, operating expense, dan net profit/loss
- Balance sheet balanced, termasuk current year profit/loss dari report engine
- Cash flow ending cash balance sama dengan saldo akun kas/bank
- AR ledger bersumber dari sales invoice, receipt, deposit allocation, dan return
- AP ledger bersumber dari vendor bill, payment, deposit allocation, dan return
- Inventory report memiliki opening, in, out, adjustment, dan opname

## Batasan

Seeder ini fokus ke demo data. Jurnal otomatis dari service modul tidak dipaksa ulang; data dokumen modul dihubungkan ke posted journal demo agar report, ledger, aging, dan workflow endpoint punya data uji realistis tanpa mengubah business logic.
