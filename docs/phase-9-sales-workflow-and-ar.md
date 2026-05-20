# Phase 9 — Sales Workflow & Accounts Receivable Backend

## Tujuan

Phase 9 membangun backend sales workflow dan accounts receivable untuk aplikasi akuntansi multi-tenant. Semua data sales berada di tenant database dan semua endpoint sales di subphase berikutnya wajib memakai `auth:sanctum`, `company.access`, dan permission granular.

## Global Rules

- Phase 9 backend-first; frontend Sales MVP masuk Phase 14.
- Phase 9 tidak membuat frontend, PDF/email invoice, advanced tax, multi-currency penuh, promo/tiered discount, atau advanced payment allocation.
- Phase 9 tidak membuat Stock Movement Engine, `stock_movements`, `stock_movement_lines`, stock card, inventory valuation, atau COGS journal.
- Stock Movement Engine tetap Phase 12B/12E; COGS journal ditunda ke Phase 12.
- Delivery Order Phase 9 hanya dokumen pengiriman dan tidak mengurangi stok.
- Sales Invoice langsung Phase 9 belum membuat stock movement dan belum membuat COGS journal.
- Semua transaksi sales tenant-aware, tidak hard delete, support audit log, period lock, permission check, dependency check jika relevan, dan void/revision mengikuti foundation Phase 4.
- Status `void` dan `obsolete` tidak masuk laporan normal.

## Sales Document Chain

Dokumen bisa dibuat dari dokumen sebelumnya atau langsung. Source document dan source line nullable agar alur seperti `Quotation -> Sales Order -> Delivery Order -> Sales Invoice -> Sales Receipt` maupun pembuatan langsung tetap valid.

Header standar memakai `source_type`, `source_id`, `source_number`, dan `source_revision`. Line standar memakai `source_line_type` dan `source_line_id`.

## Shared Sales Standards

Header dokumen sales memakai pola umum: `document_number`, `document_date`, `customer_id`, `currency_code`, `exchange_rate`, `is_taxable`, `tax_included`, `status`, subtotal/discount/tax/grand total, source fields nullable, `revision_no`, notes, user/timestamp audit fields, `void_reason`, dan `metadata`.

Line dokumen sales memakai pola umum: `product_id` nullable, `product_code`, `description`, `quantity`, `unit_id` nullable, `unit_price`, gross/discount/tax/line total, `warehouse_id` nullable, analytical dimensions nullable, source line fields nullable, dan `metadata`.

Calculation rule Phase 9A: gross dihitung dari `quantity * unit_price`, line discount dihitung sebelum header discount, header discount dihitung dari subtotal setelah line discount, tax dihitung setelah discount, dan grand total adalah subtotal after discount plus tax.

## Down Payment Rule

Down payment diinput dari Sales Order API/UI masa depan lewat `has_down_payment` dan nested payload. Nilai uang muka disimpan sebagai `customer_deposits`, bukan field utama `sales_orders`. Customer Deposit punya jurnal sendiri: Dr Cash/Bank, Cr Customer Deposit. Sales Invoice tidak input DP baru, tetapi dapat apply DP dari Sales Order. Apply DP journal: Dr Customer Deposit, Cr Accounts Receivable.

## Discount Rule

Sales Order boleh menyimpan discount komersial dan Sales Invoice menyimpan discount final accounting. Saat invoice dibuat dari order, discount dicopy. Discount mendukung `percent`, `fixed_amount`, dan `null`, baik level line maupun header. Tax dihitung setelah discount.

## AR Subsidiary Ledger

Buku besar pembantu piutang masuk Phase 9J. Total AR subsidiary ledger wajib reconcile dengan saldo GL Accounts Receivable. Sumber AR ledger: posted sales invoices, posted sales receipts, posted customer deposit allocations, dan posted sales returns.

## Phase 9A Foundation

Phase 9A menambahkan permission granular sales, document numbering sales, konfigurasi workflow sales, source chain helper, status helper, account mapping alias, dan `SalesCalculationService`. Phase 9A tidak membuat CRUD sales quotation/order/invoice/receipt/return.

## Phase 9B — Sales Quotation

Phase 9B menambahkan backend Sales Quotation/Penawaran Penjualan sebagai dokumen non-accounting. Quotation tidak membuat journal entry, tidak membuat piutang, tidak mengubah stok, dan tidak membuat stock movement.

Tabel tenant yang dibuat:

- `sales_quotations`
- `sales_quotation_lines`

Status quotation:

- `draft`
- `sent`
- `approved`
- `accepted`
- `rejected`
- `expired`
- `cancelled`
- `converted`

Endpoint Phase 9B:

- `GET /api/sales/quotations`
- `POST /api/sales/quotations`
- `GET /api/sales/quotations/{id}`
- `PATCH /api/sales/quotations/{id}`
- `PATCH /api/sales/quotations/{id}/send`
- `PATCH /api/sales/quotations/{id}/approve`
- `PATCH /api/sales/quotations/{id}/accept`
- `PATCH /api/sales/quotations/{id}/reject`
- `PATCH /api/sales/quotations/{id}/cancel`

Semua endpoint quotation wajib `auth:sanctum`, `company.access`, dan permission granular `sales.quotations.*`. Quotation mendukung source fields nullable, line source fields nullable, revision number, audit log, discount line/header, tax preview, optional department/project, dan tenant isolation.

## Phase 9C — Sales Order + Down Payment Entry

Phase 9C menambahkan backend Sales Order/Pesanan Penjualan. Sales Order bisa dibuat langsung atau dari Sales Quotation. Sales Order tidak membuat jurnal penjualan, tidak membuat piutang, tidak mengubah stok, dan tidak membuat stock movement.

Tabel tenant yang dibuat/disiapkan:

- `sales_orders`
- `sales_order_lines`
- `customer_deposits` minimal untuk nested down payment dari Sales Order

Status Sales Order:

- `draft`
- `approved`
- `confirmed`
- `partially_delivered`
- `delivered`
- `partially_invoiced`
- `invoiced`
- `closed`
- `cancelled`

Endpoint Phase 9C:

- `GET /api/sales/orders`
- `POST /api/sales/orders`
- `GET /api/sales/orders/{id}`
- `PATCH /api/sales/orders/{id}`
- `POST /api/sales/orders/from-quotation/{quotationId}`
- `PATCH /api/sales/orders/{id}/approve`
- `PATCH /api/sales/orders/{id}/confirm`
- `PATCH /api/sales/orders/{id}/cancel`
- `PATCH /api/sales/orders/{id}/close`

Down payment rule Phase 9C: Sales Order hanya menyimpan `has_down_payment`. Jika payload `down_payment` dikirim, backend membuat record `customer_deposits` terpisah dengan source ke Sales Order. Nilai DP tidak disimpan sebagai field utama `sales_orders`. Posting jurnal DP penuh dilengkapi di Phase 9H.

Sales Order dari Quotation mencopy customer, alamat, currency, exchange rate, tax flags, discount, dan line. Quotation sumber ditandai `converted`. Phase 9C tetap tidak membuat AR journal, revenue journal, COGS journal, atau stock movement.

## Phase 9D — Delivery Order

Phase 9D menambahkan backend Delivery Order/Pengiriman Barang sebagai dokumen pengiriman. Delivery Order bisa dibuat langsung atau dari Sales Order, mendukung partial delivery dan multiple delivery order dari satu Sales Order.

Tabel tenant yang dibuat:

- `delivery_orders`
- `delivery_order_lines`

Status Delivery Order:

- `draft`
- `ready`
- `shipped`
- `delivered`
- `partially_invoiced`
- `invoiced`
- `cancelled`
- `void`

Endpoint Phase 9D:

- `GET /api/sales/delivery-orders`
- `POST /api/sales/delivery-orders`
- `GET /api/sales/delivery-orders/{id}`
- `PATCH /api/sales/delivery-orders/{id}`
- `POST /api/sales/delivery-orders/from-sales-order/{salesOrderId}`
- `PATCH /api/sales/delivery-orders/{id}/ready`
- `PATCH /api/sales/delivery-orders/{id}/ship`
- `PATCH /api/sales/delivery-orders/{id}/deliver`
- `PATCH /api/sales/delivery-orders/{id}/cancel`
- `PATCH /api/sales/delivery-orders/{id}/void`

Delivery Order dari Sales Order memvalidasi quantity tidak boleh melebihi remaining quantity, lalu saat `deliver` mengupdate `sales_order_lines.delivered_quantity` dan status Sales Order menjadi `partially_delivered` atau `delivered`. Phase 9D tidak membuat stock movement, tidak mengurangi stok, tidak membuat COGS journal, dan tidak membuat journal accounting. Integrasi stock movement tetap Phase 12B/12E.

## Phase 9E — Proforma Invoice

Phase 9E menambahkan backend Proforma Invoice/Faktur Sementara. Proforma adalah dokumen penagihan sementara/non-accounting: belum menjadi piutang resmi, tidak membuat revenue, tidak membuat journal entry, dan tidak mengubah stok.

Tabel tenant yang dibuat:

- `proforma_invoices`
- `proforma_invoice_lines`

Status Proforma:

- `draft`
- `issued`
- `accepted`
- `cancelled`
- `converted`

Endpoint Phase 9E:

- `GET /api/sales/proformas`
- `POST /api/sales/proformas`
- `GET /api/sales/proformas/{id}`
- `PATCH /api/sales/proformas/{id}`
- `POST /api/sales/proformas/from-quotation/{quotationId}`
- `POST /api/sales/proformas/from-sales-order/{salesOrderId}`
- `PATCH /api/sales/proformas/{id}/issue`
- `PATCH /api/sales/proformas/{id}/accept`
- `PATCH /api/sales/proformas/{id}/cancel`

Proforma bisa dibuat langsung, dari Sales Quotation, atau dari Sales Order. Discount dan tax hanya preview dan bisa dikonversi ke Sales Invoice di Phase 9F. Phase 9E tidak membuat AR, revenue journal, stock movement, atau COGS journal.

## Phase 9F — Sales Invoice

Phase 9F menambahkan backend Sales Invoice/Faktur Penjualan sebagai dokumen accounting utama sales. Sales Invoice bisa dibuat langsung, dari Sales Order, dari Delivery Order, atau dari Proforma Invoice.

Tabel tenant yang dibuat:

- `sales_invoices`
- `sales_invoice_lines`
- `customer_deposit_allocations`

Status Sales Invoice:

- `draft`
- `approved`
- `posted`
- `partially_paid`
- `paid`
- `overdue`
- `void`

Endpoint Phase 9F:

- `GET /api/sales/invoices`
- `POST /api/sales/invoices`
- `GET /api/sales/invoices/{id}`
- `PATCH /api/sales/invoices/{id}`
- `POST /api/sales/invoices/from-sales-order/{salesOrderId}`
- `POST /api/sales/invoices/from-delivery-order/{deliveryOrderId}`
- `POST /api/sales/invoices/from-proforma/{proformaId}`
- `PATCH /api/sales/invoices/{id}/approve`
- `PATCH /api/sales/invoices/{id}/post`
- `PATCH /api/sales/invoices/{id}/void`

Posting Sales Invoice membuat journal: Dr Accounts Receivable, Cr Sales Revenue, dan Cr Output Tax jika ada tax. Jika Sales Invoice dari Sales Order memiliki posted Customer Deposit, invoice dapat apply DP dan membuat allocation journal: Dr Customer Deposit, Cr Accounts Receivable. Sales Invoice tidak input DP baru.

Discount di Sales Invoice adalah discount final accounting dan boleh diedit selama invoice masih draft. Phase 9F tetap tidak membuat stock movement, tidak membuat COGS journal, dan tidak membuat inventory valuation; integrasi stok tetap Phase 12.

## Phase 9G — Billing Invoice Optional

Phase 9G menggunakan Option A: schema/model/service/controller basic untuk Billing Invoice/Faktur Penagihan optional. Billing Invoice bisa dibuat langsung atau dari Sales Invoice sebagai layer penagihan, tetapi jika linked ke Sales Invoice tidak membuat AR/revenue journal baru agar tidak double AR.

Tabel tenant yang dibuat:

- `billing_invoices`
- `billing_invoice_lines`

Endpoint Phase 9G:

- `GET /api/sales/billings`
- `POST /api/sales/billings`
- `GET /api/sales/billings/{id}`
- `POST /api/sales/billings/from-sales-invoice/{salesInvoiceId}`
- `PATCH /api/sales/billings/{id}/issue`
- `PATCH /api/sales/billings/{id}/cancel`

Billing Invoice status: `draft`, `issued`, `partially_paid`, `paid`, `cancelled`. Payment dapat mereferensi Billing Invoice di phase berikutnya, tetapi Phase 9G tidak membuat journal accounting, tidak membuat stock movement, dan tidak membuat revenue ulang.

## Phase 9H — Sales Receipt, Customer Payment & Customer Deposit

Phase 9H menambahkan backend Customer Deposit/Down Payment, alokasi deposit ke invoice, refund deposit basic, dan Sales Receipt untuk pembayaran invoice. Down Payment bukan AR payment biasa; Down Payment masuk liability `Customer Deposit`.

Tabel tenant yang dibuat/dilengkapi:

- `customer_deposits`
- `customer_deposit_allocations`
- `sales_receipts`
- `sales_receipt_lines`

Endpoint Phase 9H:

- `GET /api/sales/customer-deposits`
- `POST /api/sales/customer-deposits`
- `GET /api/sales/customer-deposits/{id}`
- `PATCH /api/sales/customer-deposits/{id}/post`
- `PATCH /api/sales/customer-deposits/{id}/void`
- `PATCH /api/sales/customer-deposits/{id}/refund`
- `POST /api/sales/customer-deposits/{id}/allocate-to-invoice/{invoiceId}`
- `GET /api/sales/receipts`
- `POST /api/sales/receipts`
- `GET /api/sales/receipts/{id}`
- `PATCH /api/sales/receipts/{id}/post`
- `PATCH /api/sales/receipts/{id}/void`

Journal Phase 9H: Customer Deposit posting Dr Cash/Bank Cr Customer Deposit; allocation Dr Customer Deposit Cr Accounts Receivable; Sales Receipt Dr Cash/Bank Cr Accounts Receivable; refund Dr Customer Deposit Cr Cash/Bank. MVP membatasi 1 receipt ke 1 invoice dan overpayment diblokir.

## Phase 9I — Sales Return

Phase 9I menambahkan backend Sales Return/Retur Penjualan. Sales Return bisa dibuat dari Sales Invoice, dari Delivery Order jika diizinkan, atau langsung dengan permission yang sesuai. Sales Return mengurangi piutang/pendapatan melalui contra revenue journal.

Tabel tenant yang dibuat:

- `sales_returns`
- `sales_return_lines`

Endpoint Phase 9I:

- `GET /api/sales/returns`
- `POST /api/sales/returns`
- `GET /api/sales/returns/{id}`
- `PATCH /api/sales/returns/{id}`
- `POST /api/sales/returns/from-invoice/{invoiceId}`
- `POST /api/sales/returns/from-delivery-order/{deliveryOrderId}`
- `PATCH /api/sales/returns/{id}/approve`
- `PATCH /api/sales/returns/{id}/post`
- `PATCH /api/sales/returns/{id}/void`

Posting Sales Return membuat journal: Dr Sales Return/Contra Revenue, Dr Output Tax Payable jika ada tax, Cr Accounts Receivable. Sales Return mengupdate `returned_amount`, `balance_due`, dan returned quantity invoice line. Phase 9I tidak membuat stock movement, tidak mengubah stock balance, dan tidak membuat inventory return journal; integrasi stock return tetap Phase 12.

## Subphase

- 9A — Sales Workflow Foundation
- 9B — Sales Quotation
- 9C — Sales Order + Down Payment Entry
- 9D — Delivery Order
- 9E — Proforma Invoice
- 9F — Sales Invoice
- 9G — Billing Invoice optional/design
- 9H — Sales Receipt, Customer Payment & Customer Deposit
- 9I — Sales Return
- 9J — AR Subsidiary Ledger & Aging
- 9K — Integration Tests & Documentation

## Scope Boundary

Tidak ada public tenant/company endpoint baru. Tidak ada frontend sales. Tidak ada stock movement. Tidak ada COGS journal. Tidak ada inventory valuation. Semua subphase berikutnya wajib membaca hasil subphase sebelumnya dan memperbarui dokumen ini.
