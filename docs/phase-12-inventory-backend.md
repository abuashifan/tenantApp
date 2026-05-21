# Phase 12 — Inventory Backend

## Tujuan

Phase 12 membangun backend inventory dan mengaktifkan **stock movement engine** yang sebelumnya ditunda pada Phase 9 (sales) dan Phase 10 (purchase).

## Global Rules (ringkas)

- Backend-first. Tidak membuat frontend inventory di Phase 12 (frontend inventory target Phase 17).
- Tidak membuat FIFO/LIFO, batch/serial tracking, landed cost advanced, manufacturing/BOM.
- SQLite hanya untuk MVP/development; tidak membuat logic yang hanya cocok SQLite.

## Movement Types & Direction

IN menambah quantity:
- `purchase_in`
- `sales_return_in`
- `adjustment_in`
- `opname_in`
- `transfer_in`
- `opening_stock`

OUT mengurangi quantity:
- `sales_out`
- `purchase_return_out`
- `adjustment_out`
- `opname_out`
- `transfer_out`

## Valuation Method (MVP)

- Moving Average / Average Cost.

## Integration Plan

- Phase 9 Delivery Order sebelumnya hanya dokumen pengiriman (belum stock movement).
- Phase 10 Goods Receipt sebelumnya hanya dokumen penerimaan (belum stock movement).
- Phase 12E akan menghubungkan Delivery Order → `sales_out` dan Goods Receipt → `purchase_in`.

## Account Mapping

Key utama yang dipakai inventory (lihat `backend/config/account_mappings.php`):
- `inventory.asset` (required)
- `inventory.cogs` (required)
- `inventory.adjustment_gain` (optional)
- `inventory.adjustment_loss` (optional)
- `purchase.inventory_interim` (optional)
- `purchase.return` (optional)
- `sales.return` (optional)
- `inventory.write_off` (optional)
- `inventory.opening_stock_equity` (optional)

## Permissions (Phase 12A)

Phase 12A menambahkan permission granular inventory (tanpa menghapus permission legacy):
- `inventory.stock.view`
- `inventory.movements.*`
- `inventory.adjustments.*`
- `inventory.opname.*`
- `inventory.valuation.view`
- `inventory.reports.view`
- `inventory.integration.run`

## Subphase Plan

- 12A Inventory Foundation
- 12B Stock Movement Engine
- 12C Stock Balance
- 12D Average Cost / Valuation Foundation
- 12E Sales & Purchase Stock Integration
- 12F Stock Adjustment
- 12G Stock Opname Basic
- 12H Inventory Reports Backend
- 12I Integration Tests & Documentation

## Phase 12A — Inventory Foundation (Implemented)

Added:
- `backend/config/inventory.php`
- Inventory support constants (`backend/app/Support/Inventory/*`)
- Inventory shared services (`backend/app/Services/Inventory/*`)
- Document numbering types: `stock_transfer`, `opening_stock`

## Limitations (Phase 12A)

- Belum membuat tabel/engine `stock_movements` (mulai Phase 12B).
- Belum membuat stock balance dan valuation engine penuh.
- Belum menghubungkan sales/purchase ke stock movement (Phase 12E).

## Phase 12B — Stock Movement Engine (Implemented)

Stock movement engine adalah pusat semua perubahan stok.

### Tables (tenant)

- `stock_movements`
- `stock_movement_lines`

### Status

- `draft`
- `posted`
- `void` (void posted movement membuat reversal movement)

### Direction

- `in` untuk movement types yang menambah stok
- `out` untuk movement types yang mengurangi stok

### No double movement

Jika `source_type` + `source_id` diisi, sistem menolak pembuatan stock movement baru untuk source yang sama (status draft/posted).

### Journal behavior (initial)

Di Phase 12B, jurnal inventory dibuat untuk:
- `sales_out` (Dr COGS, Cr Inventory)
- `sales_return_in` (Dr Inventory, Cr COGS)
- `adjustment_in/out` (Inventory vs adjustment gain/loss)
- `opening_stock` (Dr Inventory, Cr Opening Stock Equity)

Stock balance update belum dibuat penuh sampai Phase 12C.

## Phase 12C — Stock Balance (Implemented)

Phase 12C menambahkan **stock balance** yang selalu dihitung dari stock movement yang **posted**.

### Table (tenant)

- `stock_balances` (unique: `product_id` + `warehouse_id`)

Fields utama:
- `quantity_on_hand`
- `quantity_reserved` (MVP: default 0)
- `quantity_available` (on_hand - reserved)
- `average_cost` (moving average)
- `total_value`
- `last_movement_id`, `last_movement_at`

### Rule penting

- Stock balance **tidak boleh diubah langsung dari controller**.
- Stock balance berubah hanya melalui posting/void stock movement:
  - `StockMovementService::post()` memanggil `StockBalanceService::applyMovementLine()` untuk setiap line.
  - `void` untuk movement posted membuat **reversal movement** yang diposting (balance ikut ter-update), lalu movement original di-mark void.
- Default **negative stock tidak diperbolehkan**, kecuali `config('inventory.allow_negative_stock') = true`.

### API (tenant-aware)

- `GET /api/inventory/stock-balances` (permission: `inventory.stock.view`)
- `GET /api/inventory/stock-balances/product/{productId}` (permission: `inventory.stock.view`)
- `GET /api/inventory/stock-balances/warehouse/{warehouseId}` (permission: `inventory.stock.view`)

### Internal command (no public API)

Rebuild stock balances hanya lewat artisan command (internal):

- `php artisan inventory:rebuild-stock-balances --all`
- `php artisan inventory:rebuild-stock-balances --product-id=1`
- `php artisan inventory:rebuild-stock-balances --warehouse-id=1`
- `php artisan inventory:rebuild-stock-balances --product-id=1 --warehouse-id=1`

## Phase 12D — Average Cost / Valuation Foundation (Implemented)

Phase 12D menambahkan fondasi **moving average (average cost)** dan **inventory valuation**.

### Moving average rules (per product + warehouse)

- IN movement:
  - incoming_value = qty_in * unit_cost
  - qty_after = qty_before + qty_in
  - value_after = value_before + incoming_value
  - average_cost_after = value_after / qty_after
- OUT movement:
  - outgoing_value = qty_out * average_cost_before
  - qty_after = qty_before - qty_out
  - value_after = value_before - outgoing_value
  - average_cost_after tetap mengikuti `value_after / qty_after`

### Stock movement line valuation metadata

Saat posting stock movement, tiap line akan menyimpan snapshot valuation:
- `quantity_before`, `quantity_after`
- `average_cost_before`, `average_cost_after`
- `value_before`, `value_after`

Untuk OUT movement, `unit_cost` dan `total_cost` akan di-set otomatis menggunakan `average_cost_before`.

### Inventory valuation API (tenant-aware)

Permission: `inventory.valuation.view`

- `GET /api/inventory/valuation` (berbasis `stock_balances` saat ini)
- `GET /api/inventory/valuation/as-of?as_of_date=YYYY-MM-DD` (replay posted movements sampai tanggal)
- `GET /api/inventory/valuation/products/{productId}`
- `GET /api/inventory/valuation/warehouses/{warehouseId}`

### Limitations

- Tidak ada FIFO/LIFO.
- Tidak ada landed cost advanced.
- Tidak ada batch/serial valuation.

## Phase 12E — Sales & Purchase Stock Integration (Implemented)

Phase 12E menghubungkan dokumen operasional Sales/Purchase ke `stock_movements` agar stok dan valuation update otomatis.

### Sales integration

- Delivery Order `deliver()` membuat `stock_movements`:
  - `movement_type = sales_out` (posted)
  - `source_type = delivery_order`
  - Line-level mapping: `source_line_type = delivery_order_line`
- Sales Invoice:
  - Jika invoice berasal dari Delivery Order (`delivery_order_id` terisi), **tidak** membuat stock movement baru.
  - Jika invoice direct (tanpa DO) dan `inventory.allow_sales_invoice_direct_stock_issue = true`, maka invoice posting membuat `sales_out` (posted) dengan `source_type = sales_invoice`.
- Sales Return `post()` membuat `movement_type = sales_return_in` (posted) dengan `source_type = sales_return`.

### Purchase integration

- Goods Receipt `receive()` membuat `movement_type = purchase_in` (posted) dengan `source_type = goods_receipt`.
  - `unit_cost` untuk valuation diambil dari `purchase_order_lines.unit_price` bila tersedia.
- Vendor Bill direct:
  - Jika bill tidak berasal dari Goods Receipt (`goods_receipt_id` kosong) dan `inventory.allow_vendor_bill_direct_stock_receipt = true`, maka bill posting membuat `purchase_in` (posted) dengan `source_type = vendor_bill`.
- Purchase Return `post()` membuat `movement_type = purchase_return_out` (posted) dengan `source_type = purchase_return`.

### No double movement rule

Integrasi memastikan tidak terjadi stock movement ganda untuk dokumen sumber yang sama dengan cara:
- menggunakan `source_type + source_id` pada `stock_movements`
- jika movement sudah ada (draft/posted), integrasi akan reuse movement tersebut (tidak membuat baru).

## Phase 12F — Stock Adjustment (Implemented)

Stock adjustment adalah koreksi stok manual yang terkontrol dan audit-able.

### Flow

- Create draft: `POST /api/inventory/stock-adjustments`
- Update draft: `PATCH /api/inventory/stock-adjustments/{id}`
- Approve: `PATCH /api/inventory/stock-adjustments/{id}/approve`
- Post: `PATCH /api/inventory/stock-adjustments/{id}/post`
  - menghasilkan `stock_movements`:
    - `adjustment_in` untuk line `increase`
    - `adjustment_out` untuk line `decrease`
  - journal impact mengikuti movement (Inventory vs adjustment gain/loss).
- Void posted: `PATCH /api/inventory/stock-adjustments/{id}/void`
  - void dilakukan via `StockMovementService::void()` (policy reversal untuk movement posted)

### Status
- `draft` -> `approved` -> `posted` -> `void`

### Rules
- Tidak pernah edit `stock_balances` langsung.
- Decrease akan reject jika stok tidak cukup (kecuali negative stock diizinkan).
- Post adjustment akan check period lock.

## Phase 12G — Stock Opname Basic (Implemented)

Stock opname adalah sesi pencocokan stok fisik vs stok sistem (per warehouse).

### Flow
- Create session: `POST /api/inventory/stock-opnames`
- Generate lines dari stock balance: `POST /api/inventory/stock-opnames/{id}/generate-lines`
- Input physical qty per line: `PATCH /api/inventory/stock-opnames/{id}/lines/{lineId}`
- Mark counted: `PATCH /api/inventory/stock-opnames/{id}/counted`
- Finalize: `PATCH /api/inventory/stock-opnames/{id}/finalize`
  - difference = physical - system
  - positif -> `opname_in`
  - negatif -> `opname_out`
  - nol -> tidak dibuat movement line
- Void finalized: `PATCH /api/inventory/stock-opnames/{id}/void` (via reversal movement policy)

### Status
- `draft` -> `counted` -> `finalized` -> `void`

### Rules / Limitations
- Check period lock saat finalize.
- Basic only: belum ada barcode/import Excel/mobile scanner/cycle count advanced.
