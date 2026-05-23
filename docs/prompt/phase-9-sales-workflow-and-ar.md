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

## Phase 9J — Accounts Receivable Subsidiary Ledger & Aging

Phase 9J menambahkan Buku Besar Pembantu Piutang dan Aging Piutang. GL Accounts Receivable tetap menjadi saldo kontrol utama, sedangkan AR subsidiary ledger menyimpan rincian piutang per customer dan per invoice dari dokumen sales posted.

Sumber movement AR:

- Debit: posted `sales_invoices`.
- Kredit: posted `sales_receipts`.
- Kredit: posted `customer_deposit_allocations`.
- Kredit: posted `sales_returns`.

Endpoint Phase 9J:

- `GET /api/sales/ar/customer-summary`
- `GET /api/sales/ar/customers/{customerId}/ledger`
- `GET /api/sales/ar/invoices/{invoiceId}/ledger`
- `GET /api/sales/ar/open-invoices`
- `GET /api/sales/ar/aging`
- `GET /api/sales/ar/reconciliation`

Aging memakai `due_date` invoice dengan bucket `current`, `1_30`, `31_60`, `61_90`, dan `over_90`. Paid invoice dikeluarkan dari aging; partially paid invoice di-aging berdasarkan `balance_due`.

Rekonsiliasi AR membandingkan total subsidiary ledger dengan saldo GL dari account mapping `sales.accounts_receivable`. Selisih harus nol agar `is_reconciled = true`. Void/obsolete document tidak dihitung pada normal view.

## Phase 9K — Integration Tests & Final Documentation

Phase 9K mengunci backend Sales Workflow & Accounts Receivable sebelum Phase 10 Purchase. Tidak ada fitur frontend, stock movement, inventory, purchase, atau Cash Bank penuh yang ditambahkan pada phase ini.

### Overview Phase 9

Phase 9 membangun backend-first Sales Workflow dan Accounts Receivable: quotation, sales order, customer deposit/down payment, delivery order sebagai dokumen pengiriman, proforma invoice, sales invoice accounting, billing invoice optional, sales receipt, sales return, AR subsidiary ledger, AR aging, dan integration tests.

### Global Rules

- Semua data sales berada di tenant database.
- Semua endpoint sales memakai `auth:sanctum`, `company.access`, dan permission guard.
- Mutating/posting action yang berdampak accounting memakai period lock guard.
- Phase 9 tidak membuat frontend sales.
- Phase 9 tidak membuat stock movement engine, COGS journal, inventory valuation, atau stock card.

### Document Chain

Rantai dokumen utama: Sales Quotation → Sales Order → Delivery Order → Proforma Invoice → Sales Invoice → Sales Receipt/Customer Deposit Allocation → Sales Return. Setiap dokumen menyimpan source link yang relevan (`source_type`, `source_id`, `source_number`, `source_revision`) untuk audit chain.

### Source Chain Rules

Sales Order dari quotation menjaga referensi quotation. Delivery Order menjaga referensi Sales Order dan mengupdate delivered quantity. Proforma bisa dibuat dari quotation/Sales Order. Sales Invoice bisa dibuat langsung, dari Sales Order, Delivery Order, atau Proforma. Billing Invoice optional bisa dibuat dari Sales Invoice tanpa membuat AR/revenue ulang.

### Down Payment Rules

Down Payment diinput dari Sales Order tetapi disimpan sebagai `customer_deposits`. Posting deposit membuat Dr Cash/Bank Cr Customer Deposit. Sales Invoice tidak menerima DP baru; Sales Invoice dari Sales Order hanya bisa apply posted Customer Deposit melalui allocation journal Dr Customer Deposit Cr Accounts Receivable.

### Discount Rules

Discount tersedia di Sales Order dan Sales Invoice dengan tipe `percent` atau `fixed_amount`. Discount Sales Order disalin ke Sales Invoice, tetapi discount Sales Invoice adalah final accounting discount dan boleh disesuaikan sebelum invoice diposting.

### Stock Movement Deferred Rule

Delivery Order, Sales Invoice langsung, Sales Return, dan dokumen sales lain di Phase 9 tidak membuat `stock_movements`, tidak mengubah stock balance, tidak membuat stock card, dan tidak membuat COGS journal. Stock movement dan COGS ditunda ke Phase 12 Inventory.

### Journal Posting Rules

- Sales Invoice: Dr Accounts Receivable, Cr Sales Revenue, Cr Output Tax jika ada tax.
- Customer Deposit: Dr Cash/Bank, Cr Customer Deposit.
- Customer Deposit Allocation: Dr Customer Deposit, Cr Accounts Receivable.
- Sales Receipt: Dr Cash/Bank, Cr Accounts Receivable.
- Customer Deposit Refund: Dr Customer Deposit, Cr Cash/Bank.
- Sales Return: Dr Sales Return/Contra Revenue, Dr Output Tax jika ada tax, Cr Accounts Receivable.
- Sales Quotation, Sales Order, Delivery Order, Proforma Invoice, dan linked Billing Invoice tidak membuat AR/revenue journal.

### AR Subsidiary Ledger Rules

AR subsidiary ledger memakai posted Sales Invoice sebagai debit dan posted Sales Receipt, Customer Deposit Allocation, serta Sales Return sebagai kredit. Ledger dapat dilihat per customer dan per invoice, open invoices memakai `balance_due`, aging memakai `due_date`, dan reconciliation membandingkan subsidiary balance dengan GL AR account mapping `sales.accounts_receivable`.

### Endpoint List

- Sales Quotation: `GET|POST /api/sales/quotations`, `GET|PATCH /api/sales/quotations/{id}`, `PATCH /send|approve|accept|reject|cancel`.
- Sales Order: `GET|POST /api/sales/orders`, `GET|PATCH /api/sales/orders/{id}`, `POST /from-quotation/{quotationId}`, `PATCH /approve|confirm|cancel|close`.
- Delivery Order: `GET|POST /api/sales/delivery-orders`, `GET|PATCH /api/sales/delivery-orders/{id}`, `POST /from-sales-order/{salesOrderId}`, `PATCH /ready|ship|deliver|cancel|void`.
- Proforma Invoice: `GET|POST /api/sales/proformas`, `GET|PATCH /api/sales/proformas/{id}`, `POST /from-quotation|from-sales-order`, `PATCH /issue|accept|cancel`.
- Sales Invoice: `GET|POST /api/sales/invoices`, `GET|PATCH /api/sales/invoices/{id}`, `POST /from-sales-order|from-delivery-order|from-proforma`, `PATCH /approve|post|void`.
- Billing Invoice: `GET|POST /api/sales/billings`, `GET /api/sales/billings/{id}`, `POST /from-sales-invoice/{salesInvoiceId}`, `PATCH /issue|cancel`.
- Customer Deposit: `GET|POST /api/sales/customer-deposits`, `GET /api/sales/customer-deposits/{id}`, `PATCH /post|void|refund`, `POST /allocate-to-invoice/{invoiceId}`.
- Sales Receipt: `GET|POST /api/sales/receipts`, `GET /api/sales/receipts/{id}`, `PATCH /post|void`.
- Sales Return: `GET|POST /api/sales/returns`, `GET|PATCH /api/sales/returns/{id}`, `POST /from-invoice|from-delivery-order`, `PATCH /approve|post|void`.
- Accounts Receivable: `GET /api/sales/ar/customer-summary`, `/customers/{customerId}/ledger`, `/invoices/{invoiceId}/ledger`, `/open-invoices`, `/aging`, `/reconciliation`.

### Migration/Table List

- `sales_quotations`, `sales_quotation_lines`
- `sales_orders`, `sales_order_lines`
- `customer_deposits`, `customer_deposit_allocations`
- `delivery_orders`, `delivery_order_lines`
- `proforma_invoices`, `proforma_invoice_lines`
- `sales_invoices`, `sales_invoice_lines`
- `billing_invoices`, `billing_invoice_lines`
- `sales_receipts`, `sales_receipt_lines`
- `sales_returns`, `sales_return_lines`

### Service List

- `SalesCalculationService`, `SalesSourceChainService`, `SalesStatusService`, `SalesAccountMappingService`
- `SalesQuotationService`, `SalesOrderService`, `DeliveryOrderService`, `ProformaInvoiceService`
- `SalesInvoiceService`, `BillingInvoiceService`, `CustomerDepositService`, `SalesReceiptService`, `SalesReturnService`
- `ARSubsidiaryLedgerService`, `ARAgingService`, `ARReconciliationService`

### Test List

- `SalesCalculationServiceTest`
- `SalesQuotationTest`, `SalesOrderTest`, `DeliveryOrderTest`, `ProformaInvoiceTest`
- `SalesInvoiceTest`, `BillingInvoiceTest`, `CustomerDepositTest`, `SalesReceiptTest`, `SalesReturnTest`
- `AccountsReceivableLedgerTest`, `AccountsReceivableAgingTest`, `SalesWorkflowIntegrationTest`

### Known Limitations

- No frontend sales in Phase 9.
- No stock movement engine in Phase 9.
- No COGS journal in Phase 9.
- No inventory valuation.
- No stock card.
- No advanced payment allocation.
- No overpayment support.
- No promo/tiered discount.
- No PDF/email invoice.
- No advanced tax.
- No multi-currency full implementation.

### Next Phase

Phase berikutnya adalah Phase 10 — Purchase & Accounts Payable Backend. Purchase/AP harus mengikuti pola backend-first, tenant-aware, permission-guarded, dan period-lock-aware yang sudah distabilkan di Phase 9.

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
