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

## Scope Boundary

Tidak ada frontend purchase. Tidak ada stock movement. Tidak ada inventory valuation. Tidak ada stock card. Tidak ada warehouse stock balance update. Tidak ada Cash Bank module penuh. Semua subphase Phase 10 wajib membaca hasil subphase sebelumnya, tidak mengulang implementasi yang sudah ada, dan memperbarui dokumen ini.
