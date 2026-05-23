# Phase 10 — Purchase Workflow & Accounts Payable Backend

## Tujuan

Phase 10 membangun backend Purchase Workflow dan Accounts Payable untuk aplikasi akuntansi multi-tenant. Phase ini mengikuti pola Phase 9 Sales & AR, tetapi dari sisi purchase/AP. Semua data purchase berada di tenant database dan semua endpoint purchase wajib memakai `auth:sanctum`, `company.access`, dan permission granular.

## Global Rules

- Phase 10 backend-first; frontend Purchase MVP masuk Phase 15.
- Phase 10 bukan frontend dan tidak membuat UI purchase.
- Phase 10 tidak membuat Stock Movement Engine.
- Stock Movement Engine tetap Phase 12.
- Phase 10 tidak membuat inventory valuation, stock card, warehouse stock update, landed cost, FIFO, atau moving average.
- Goods Receipt Phase 10 hanya dokumen penerimaan barang dan tidak menambah stok.
- Vendor Bill langsung Phase 10 belum membuat stock movement atau inventory valuation journal.
- Purchase Order tidak membuat journal, AP, stock movement, atau inventory valuation.
- COGS tidak relevan di purchase Phase 10; stock costing tetap Phase 12.
- Data purchase tidak boleh tercampur antar company/tenant.
- Tidak membuat public tenant/company endpoint.
- Tidak membuat PDF/email vendor bill, advanced tax, multi-currency penuh, promo/tiered discount, advanced payment allocation, atau overpayment support.

## Purchase Document Chain

Phase 10 mendukung alur:

- Purchase Request / Permintaan Pembelian
- Purchase Order / Pesanan Pembelian
- Goods Receipt / Penerimaan Barang
- Vendor Bill / Purchase Invoice / Faktur Pembelian
- Vendor Deposit / Uang Muka Vendor
- Vendor Payment / Pembayaran Vendor
- Purchase Return / Retur Pembelian
- AP Subsidiary Ledger / Buku Besar Pembantu Hutang
- AP Aging

Dokumen bisa dibuat dari dokumen sebelumnya atau langsung. Contoh chain utama: Purchase Request → Purchase Order → Goods Receipt → Vendor Bill → Vendor Payment.

## Source Chain Rules

Header dokumen purchase wajib mendukung:

- `source_type` nullable
- `source_id` nullable
- `source_number` nullable
- `source_revision` nullable

Line dokumen purchase wajib mendukung:

- `source_line_type` nullable
- `source_line_id` nullable

Source document dan source line nullable agar Purchase Order, Goods Receipt, Vendor Bill, dan Vendor Payment bisa dibuat langsung jika workflow bisnis tidak memakai dokumen sebelumnya.

## Vendor Deposit Rules

- Uang muka vendor diinput dari Purchase Order UI/API masa depan.
- Purchase Order cukup menyimpan `has_down_payment` true/false.
- Jika `has_down_payment` true, request boleh membawa nested `vendor_deposit` payload.
- Data uang muka vendor disimpan di tabel `vendor_deposits`, bukan sebagai field utama `purchase_orders`.
- Vendor Deposit adalah asset/advance payment, bukan liability.
- Posting Vendor Deposit membuat journal: Dr Vendor Deposit / Advance Payment, Cr Cash/Bank.
- Vendor Bill tidak input uang muka baru.
- Vendor Bill dari Purchase Order dapat apply posted Vendor Deposit yang tersedia.
- Apply Vendor Deposit membuat journal: Dr Accounts Payable, Cr Vendor Deposit / Advance Payment.

## Discount Rules

- Purchase Order boleh input discount komersial.
- Vendor Bill boleh input/edit discount final accounting.
- Saat Vendor Bill dibuat dari Purchase Order, discount Purchase Order dicopy ke Vendor Bill.
- Posted Vendor Bill wajib memakai discount final di Vendor Bill.
- Discount type: `percent`, `fixed_amount`, atau `null`.
- Discount level: line discount dan header/global discount.

## AP Subsidiary Ledger

Buku besar pembantu hutang masuk Phase 10H. Total AP subsidiary ledger wajib reconcile dengan saldo GL Accounts Payable.

Sumber AP ledger:

- posted `vendor_bills`
- posted `vendor_payments`
- posted `vendor_deposit_allocations`
- posted `purchase_returns`

## Shared Purchase Standards

Header dokumen purchase memakai pola umum: `document_number`, `document_date`, `vendor_id`, `currency_code`, `exchange_rate`, `is_taxable`, `tax_included`, `status`, subtotal/discount/tax/grand total, source fields nullable, `revision_no`, notes, user/timestamp audit fields, `void_reason`, dan `metadata`.

Line dokumen purchase memakai pola umum: `product_id` nullable, `product_code`, `description`, `quantity`, `unit_id` nullable, `unit_price`, gross/discount/tax/line total, `warehouse_id` nullable, analytical dimensions nullable, `expense_account_id` nullable, source line fields nullable, dan `metadata`.

Calculation rule Phase 10A: gross dihitung dari `quantity * unit_price`, line discount dihitung sebelum header discount, header discount dihitung dari subtotal setelah line discount, tax dihitung setelah discount, dan grand total adalah subtotal after discount plus tax. Discount type yang didukung adalah `percent`, `fixed_amount`, dan `null`; discount tidak boleh negatif, percent harus 0-100, dan discount amount tidak boleh melebihi base.

## Account Mapping Rules

Phase 10A menyiapkan alias account mapping:

- `accounts_payable` → `purchase.accounts_payable`
- `purchase_expense` → `purchase.expense`
- `inventory_interim` → `purchase.inventory_interim`
- `input_tax` → `purchase.tax_input`
- `purchase_discount` → `purchase.discount`
- `purchase_return` → `purchase.return`
- `vendor_deposit` → `purchase.vendor_deposit`
- `cash_bank` → `purchase.default_cash_bank`

Mapping legacy `purchase.default_purchase` tetap tersedia sebagai compatibility key, tetapi service Phase 10 baru memakai `purchase.expense` atau `purchase.inventory_interim`.

## Phase 10A — Purchase Workflow Foundation

Phase 10A menambahkan fondasi bersama untuk subphase 10B-10I:

- Config `purchase_workflow` berisi document types, discount types, status visibility, dan account mapping aliases.
- Document numbering ditambahkan untuk `purchase_request`, `purchase_order`, `goods_receipt`, `vendor_bill`, `vendor_payment`, `vendor_deposit`, dan `purchase_return`.
- Permission granular purchase ditambahkan untuk request, order, goods receipt, bill, payment, deposit, return, serta AP ledger/reconcile.
- Service dibuat: `PurchaseCalculationService`, `PurchaseSourceChainService`, `PurchaseStatusService`, dan `PurchaseAccountMappingService`.
- Unit test dibuat untuk kalkulasi discount line/header dan tax after discount.

Phase 10A tidak membuat CRUD dokumen purchase, tidak membuat endpoint purchase, tidak membuat journal posting purchase, tidak membuat stock movement, dan tidak membuat frontend.

## Phase 10B — Purchase Request

Phase 10B menambahkan backend Purchase Request/Permintaan Pembelian sebagai dokumen internal non-accounting. Purchase Request bisa dibuat langsung, mendukung estimated price, source fields nullable, line source fields nullable, revision number, audit log, permission guard, department/project optional, dan tenant isolation.

Tabel tenant yang dibuat:

- `purchase_requests`
- `purchase_request_lines`

Status Purchase Request:

- `draft`
- `submitted`
- `approved`
- `rejected`
- `cancelled`
- `converted`

Endpoint Phase 10B:

- `GET /api/purchase/requests`
- `POST /api/purchase/requests`
- `GET /api/purchase/requests/{id}`
- `PATCH /api/purchase/requests/{id}`
- `PATCH /api/purchase/requests/{id}/submit`
- `PATCH /api/purchase/requests/{id}/approve`
- `PATCH /api/purchase/requests/{id}/reject`
- `PATCH /api/purchase/requests/{id}/cancel`

Semua endpoint Purchase Request wajib `auth:sanctum`, `company.access`, dan permission granular `purchase.requests.*`. Purchase Request tidak membuat journal entry, tidak membuat Accounts Payable, tidak mengubah stok, dan tidak membuat stock movement. Status `converted` disiapkan untuk Phase 10C saat Purchase Request dikonversi menjadi Purchase Order.

## Phase 10C — Purchase Order + Vendor Deposit Entry

Phase 10C menambahkan backend Purchase Order/Pesanan Pembelian. Purchase Order bisa dibuat langsung atau dari Purchase Request. Purchase Order mendukung discount line/header, source chain nullable, revision number, audit log, permission guard, dan nested vendor deposit/down payment payload.

Tabel tenant yang dibuat/disiapkan:

- `purchase_orders`
- `purchase_order_lines`
- `vendor_deposits` minimal untuk nested vendor deposit dari Purchase Order

Status Purchase Order:

- `draft`
- `approved`
- `confirmed`
- `partially_received`
- `received`
- `partially_billed`
- `billed`
- `closed`
- `cancelled`

Endpoint Phase 10C:

- `GET /api/purchase/orders`
- `POST /api/purchase/orders`
- `GET /api/purchase/orders/{id}`
- `PATCH /api/purchase/orders/{id}`
- `POST /api/purchase/orders/from-request/{purchaseRequestId}`
- `PATCH /api/purchase/orders/{id}/approve`
- `PATCH /api/purchase/orders/{id}/confirm`
- `PATCH /api/purchase/orders/{id}/cancel`
- `PATCH /api/purchase/orders/{id}/close`

Vendor deposit rule Phase 10C: Purchase Order hanya menyimpan `has_down_payment`. Jika nested `vendor_deposit` dikirim, backend membuat record `vendor_deposits` terpisah dengan source ke Purchase Order. Nilai DP tidak disimpan sebagai field utama `purchase_orders`. Posting jurnal vendor deposit penuh dilengkapi di Phase 10F.

Purchase Order dari Purchase Request mencopy line, estimated price menjadi unit price awal, source line reference, dan menandai Purchase Request sebagai `converted`. Phase 10C tetap tidak membuat AP journal, purchase expense journal, stock movement, inventory valuation, atau warehouse stock update.

## Phase 10D — Goods Receipt

Phase 10D menambahkan backend Goods Receipt/Penerimaan Barang sebagai dokumen penerimaan. Goods Receipt bisa dibuat langsung atau dari Purchase Order, mendukung partial receipt, multiple receipts dari satu Purchase Order, source chain nullable, audit log, permission guard, dan tenant isolation.

Tabel tenant yang dibuat:

- `goods_receipts`
- `goods_receipt_lines`

Status Goods Receipt:

- `draft`
- `received`
- `partially_billed`
- `billed`
- `cancelled`
- `void`

Endpoint Phase 10D:

- `GET /api/purchase/goods-receipts`
- `POST /api/purchase/goods-receipts`
- `GET /api/purchase/goods-receipts/{id}`
- `PATCH /api/purchase/goods-receipts/{id}`
- `POST /api/purchase/goods-receipts/from-purchase-order/{purchaseOrderId}`
- `PATCH /api/purchase/goods-receipts/{id}/receive`
- `PATCH /api/purchase/goods-receipts/{id}/cancel`
- `PATCH /api/purchase/goods-receipts/{id}/void`

Saat Goods Receipt di-`receive`, backend memvalidasi quantity tidak melebihi remaining quantity Purchase Order line, mengupdate `purchase_order_lines.received_quantity`, dan mengubah status Purchase Order menjadi `partially_received` atau `received`. Void Goods Receipt yang sudah received membalik received quantity selama belum ada billing.

Goods Receipt Phase 10 tetap hanya dokumen penerimaan: tidak membuat `stock_movements`, tidak menambah stok inventory, tidak membuat inventory valuation journal, dan tidak membuat journal accounting. Integrasi stock movement purchase-in tetap ditunda ke Phase 12B/12E.

## Phase 10E — Vendor Bill / Purchase Invoice

Phase 10E menambahkan backend Vendor Bill/Purchase Invoice sebagai dokumen accounting utama purchase. Vendor Bill bisa dibuat langsung, dari Purchase Order, atau dari Goods Receipt. Vendor Bill memakai discount final accounting di dokumen bill, sehingga discount dari Purchase Order hanya menjadi nilai awal yang boleh disesuaikan sebelum posting.

Tabel tenant yang dibuat:

- `vendor_bills`
- `vendor_bill_lines`
- `vendor_deposit_allocations` untuk alokasi DP ke bill

Status Vendor Bill:

- `draft`
- `approved`
- `posted`
- `partially_paid`
- `paid`
- `overdue`
- `void`

Endpoint Phase 10E:

- `GET /api/purchase/bills`
- `POST /api/purchase/bills`
- `GET /api/purchase/bills/{id}`
- `PATCH /api/purchase/bills/{id}`
- `POST /api/purchase/bills/from-purchase-order/{purchaseOrderId}`
- `POST /api/purchase/bills/from-goods-receipt/{goodsReceiptId}`
- `PATCH /api/purchase/bills/{id}/approve`
- `PATCH /api/purchase/bills/{id}/post`
- `PATCH /api/purchase/bills/{id}/void`

Posting Vendor Bill membuat journal: Dr Purchase Expense, Dr Input Tax jika ada tax, Cr Accounts Payable. Jika bill dari Purchase Order memiliki posted Vendor Deposit dan `applied_vendor_deposit_amount` tersedia, backend membuat alokasi deposit dan journal: Dr Accounts Payable, Cr Vendor Deposit. Vendor Bill tidak membuat stock movement, tidak membuat inventory valuation, dan tidak membuat warehouse stock update.

## Phase 10F — Vendor Deposit & Vendor Payment

Phase 10F melengkapi backend Vendor Deposit/Uang Muka Vendor dan Vendor Payment/Pembayaran Vendor. Vendor Deposit adalah asset/advance payment, bukan AP payment biasa. Vendor Payment adalah pembayaran Accounts Payable untuk Vendor Bill.

Tabel tenant yang dibuat/dilengkapi:

- `vendor_deposits`
- `vendor_deposit_allocations`
- `vendor_payments`
- `vendor_payment_lines`

Endpoint Phase 10F:

- `GET /api/purchase/vendor-deposits`
- `POST /api/purchase/vendor-deposits`
- `GET /api/purchase/vendor-deposits/{id}`
- `PATCH /api/purchase/vendor-deposits/{id}/post`
- `PATCH /api/purchase/vendor-deposits/{id}/void`
- `PATCH /api/purchase/vendor-deposits/{id}/refund`
- `POST /api/purchase/vendor-deposits/{id}/allocate-to-bill/{billId}`
- `GET /api/purchase/payments`
- `POST /api/purchase/payments`
- `GET /api/purchase/payments/{id}`
- `PATCH /api/purchase/payments/{id}/post`
- `PATCH /api/purchase/payments/{id}/void`

Journal Phase 10F:

- Vendor Deposit: Dr Vendor Deposit / Advance Payment, Cr Cash/Bank.
- Apply Vendor Deposit: Dr Accounts Payable, Cr Vendor Deposit / Advance Payment.
- Vendor Payment: Dr Accounts Payable, Cr Cash/Bank.
- Refund Vendor Deposit: Dr Cash/Bank, Cr Vendor Deposit / Advance Payment.

MVP membatasi payment 1 pembayaran ke 1 bill dan overpayment diblokir. Phase 10F tidak membuat Cash Bank module penuh, bank reconciliation, frontend, atau advanced payment allocation.

## Phase 10G — Purchase Return

Phase 10G menambahkan backend Purchase Return/Retur Pembelian. Purchase Return bisa dibuat langsung, dari Vendor Bill, atau dari Goods Receipt. Retur dari Vendor Bill mengurangi Accounts Payable dan balance bill; retur dari Goods Receipt mencatat dokumen retur penerimaan tanpa mengubah stok.

Tabel tenant yang dibuat:

- `purchase_returns`
- `purchase_return_lines`

Status Purchase Return:

- `draft`
- `approved`
- `posted`
- `void`

Endpoint Phase 10G:

- `GET /api/purchase/returns`
- `POST /api/purchase/returns`
- `GET /api/purchase/returns/{id}`
- `PATCH /api/purchase/returns/{id}`
- `POST /api/purchase/returns/from-bill/{billId}`
- `POST /api/purchase/returns/from-goods-receipt/{goodsReceiptId}`
- `PATCH /api/purchase/returns/{id}/approve`
- `PATCH /api/purchase/returns/{id}/post`
- `PATCH /api/purchase/returns/{id}/void`

Posting Purchase Return membuat journal: Dr Accounts Payable, Cr Purchase Return / Expense Reduction, dan Cr Input Tax jika ada tax return. Posting juga mengupdate `vendor_bills.returned_amount`, `vendor_bills.balance_due`, `vendor_bill_lines.returned_quantity`, dan `goods_receipt_lines.returned_quantity` sesuai sumber line.

Purchase Return Phase 10 tetap tidak membuat stock movement, tidak mengubah warehouse stock balance, dan tidak membuat inventory return journal. Integrasi retur stok masuk Phase 12.

## Phase 10H — Accounts Payable Subsidiary Ledger & Aging

Phase 10H menambahkan AP subsidiary ledger, open bills, AP aging, dan reconciliation terhadap GL Accounts Payable. AP subsidiary ledger membaca dokumen purchase posted, bukan hanya journal umum, lalu dibandingkan dengan saldo GL AP dari `journal_entry_lines`.

Endpoint Phase 10H:

- `GET /api/purchase/ap/vendor-summary`
- `GET /api/purchase/ap/vendors/{vendorId}/ledger`
- `GET /api/purchase/ap/bills/{billId}/ledger`
- `GET /api/purchase/ap/open-bills`
- `GET /api/purchase/ap/aging`
- `GET /api/purchase/ap/reconciliation`

Sumber movement AP:

- Credit: posted `vendor_bills`.
- Debit: posted `vendor_payments`.
- Debit: posted `vendor_deposit_allocations`.
- Debit: posted `purchase_returns`.

Running balance AP dihitung sebagai `credit - debit` agar saldo liability tampil positif. Aging memakai `vendor_bills.due_date` dan bucket: `current`, `1_30`, `31_60`, `61_90`, dan `over_90`. Bill yang sudah lunas atau void tidak masuk open bills/aging normal.

Reconciliation rule: `AP subsidiary balance = GL Accounts Payable balance`, dengan GL AP dihitung dari posted journal aktif sebagai `credit - debit`.

## Phase 10I — Integration Tests & Final Documentation

Phase 10I mengunci integrasi backend Purchase Workflow & AP sebelum lanjut Phase 11 Cash Bank. Integration test memvalidasi chain Purchase Request → Purchase Order → Goods Receipt → Vendor Bill, Vendor Deposit dari Purchase Order, deposit allocation ke Vendor Bill, Vendor Payment, Purchase Return, AP reconciliation, route security, permission guard, dan rule tidak ada stock movement/inventory valuation.

Test utama Phase 10:

- `PurchaseCalculationServiceTest`
- `PurchaseRequestTest`
- `PurchaseOrderTest`
- `GoodsReceiptTest`
- `VendorBillTest`
- `VendorDepositTest`
- `VendorPaymentTest`
- `PurchaseReturnTest`
- `AccountsPayableLedgerTest`
- `AccountsPayableAgingTest`
- `PurchaseWorkflowIntegrationTest`

Service utama Phase 10:

- `PurchaseCalculationService`
- `PurchaseSourceChainService`
- `PurchaseStatusService`
- `PurchaseAccountMappingService`
- `PurchaseRequestService`
- `PurchaseOrderService`
- `GoodsReceiptService`
- `VendorBillService`
- `VendorDepositService`
- `VendorPaymentService`
- `PurchaseReturnService`
- `APSubsidiaryLedgerService`
- `APAgingService`
- `APReconciliationService`

Known limitations Phase 10:

- Tidak ada frontend purchase.
- Tidak ada stock movement engine.
- Tidak ada inventory valuation.
- Tidak ada stock card.
- Tidak ada warehouse stock balance update.
- Tidak ada advanced payment allocation.
- Tidak ada overpayment support.
- Tidak ada promo/tiered discount.
- Tidak ada PDF/email vendor bill.
- Tidak ada advanced tax.
- Tidak ada multi-currency penuh.
- Tidak ada landed cost.
- Tidak ada FIFO/moving average.

Next phase: Phase 11 — Cash Bank Backend.

## Subphase

- 10A — Purchase Workflow Foundation
- 10B — Purchase Request
- 10C — Purchase Order + Vendor Deposit Entry
- 10D — Goods Receipt
- 10E — Vendor Bill / Purchase Invoice
- 10F — Vendor Payment & Vendor Deposit
- 10G — Purchase Return
- 10H — AP Subsidiary Ledger & Aging
- 10I — Integration Tests & Documentation

## Final Status

Phase 10 — Purchase Workflow & Accounts Payable Backend selesai untuk scope backend-first 10A sampai 10I. Semua endpoint purchase berada di tenant database dan dilindungi `auth:sanctum`, `company.access`, serta permission granular.

## Scope Boundary

Tidak ada frontend purchase. Tidak ada stock movement. Tidak ada inventory valuation. Tidak ada stock card. Tidak ada warehouse stock balance update. Tidak ada Cash Bank module penuh. Semua subphase Phase 10 wajib membaca hasil subphase sebelumnya, tidak mengulang implementasi yang sudah ada, dan memperbarui dokumen ini.
