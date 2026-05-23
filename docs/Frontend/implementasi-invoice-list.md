REUSABILITY UNTUK MODUL LAIN:
Workspace ini tidak boleh dibuat khusus hanya untuk Sales Invoice.

Desain dan struktur komponennya harus dibuat generic/reusable agar bisa dipakai juga untuk halaman daftar dokumen lain yang format UX-nya sama atau mirip, seperti:

- Sales Orders
- Sales Quotations
- Delivery Orders
- Sales Receipts
- Sales Returns
- Purchase Requests
- Purchase Orders
- Goods Receipts
- Vendor Bills
- Vendor Payments
- Purchase Returns
- Journal Entries
- Cash In
- Cash Out
- Bank Transfers
- Stock Movements
- Stock Adjustments
- Stock Opname
- Products
- Customers
- Vendors
- AR Aging
- AP Aging

Karena itu, jangan hardcode istilah Sales Invoice terlalu dalam di reusable component.

Pisahkan menjadi:

1. Generic reusable workspace component.
2. Module-specific wrapper untuk Sales Invoice.

Contoh struktur:

- `components/workspace/DocumentListWorkspace.tsx`
- `components/workspace/WorkspaceToolbar.tsx`
- `components/workspace/WorkspaceTable.tsx`
- `components/workspace/SearchablePartyFilter.tsx`
- `components/workspace/WorkspaceActionMenu.tsx`
- `features/sales/invoices/SalesInvoiceWorkspace.tsx`

Generic workspace harus menerima konfigurasi seperti:

- `documentLabel`
- `newButtonLabel`
- `rows/items`
- `columns`
- `filters`
- `statusOptions`
- `partyFilterLabel`
- `partyOptions`
- `selectedIds`
- `loading`
- `hasMore`
- `sort`
- `actions`
- `bulkActions`
- `onLoadMore`
- `onSearchChange`
- `onFilterChange`
- `onSortChange`
- `onSelectRow`
- `onSelectVisibleRows`
- `onCreate`
- `onBulkAction`
- `onRowAction`

Untuk Sales Invoice:

- `partyFilterLabel = "Customer"`
- create button = "New Invoice"
- bulk destructive action = "Void"
- columns mengikuti Sales Invoice.

Untuk Vendor Bill:

- `partyFilterLabel = "Vendor"`
- create button bisa menjadi "New Vendor Bill"
- bulk action tetap bisa Void jika backend mendukung.
- columns bisa menyesuaikan bill number, vendor, due date, total, balance due.

Untuk Purchase Order:

- party bisa Vendor.
- action bisa Approve, Close, Void, atau sesuai lifecycle backend.

Untuk Sales Order:

- party bisa Customer.
- action bisa Approve, Convert, Close, Void, atau sesuai lifecycle backend.

Workspace harus mendukung variasi action per modul:

- Ada modul yang punya Void.
- Ada modul yang tidak punya Void.
- Ada modul yang punya Approve/Post/Close.
- Ada modul yang hanya View/Edit.
- Ada modul yang tidak punya party filter.
- Ada modul yang party filter-nya Customer.
- Ada modul yang party filter-nya Vendor.
- Ada modul yang memakai date field berbeda, misalnya order_date, bill_date, transaction_date, posting_date.

Jadi jangan hardcode:

- endpoint
- route
- action label
- status list
- status badge mapping
- party label
- date field
- row action menu
- bulk action button

Semua harus dikonfigurasi dari wrapper module masing-masing.

Tetap implementasikan Sales Invoice terlebih dahulu sebagai penggunaan pertama dari reusable workspace ini. Setelah itu pastikan struktur reusable-nya cukup fleksibel untuk dipakai oleh Purchase, Sales Order, Journal, Cash Bank, dan Inventory tanpa rewrite besar.
