TASK TITLE:
Implement Reusable Workspace List Pattern for ERP Pages

PROJECT:
TenantAppDevelopment — Frontend Vue

STACK:

- Vue 3 latest
- Vite
- TypeScript
- Vue Router 4
- Pinia
- TailwindCSS
- Axios
- TanStack Table for Vue
- VeeValidate + Zod for forms

CONTEXT:
Project ini adalah aplikasi akuntansi / ERP multi-tenant.
Frontend Vue sedang dibangun dengan prinsip design-first dan reusable component.
Backend Laravel API sudah menjadi sumber data utama.
Request API wajib mendukung:

- Authorization: Bearer TOKEN
- X-Company-ID: ACTIVE_COMPANY_ID

Tujuan task ini adalah membuat pola reusable untuk halaman daftar/workspace seperti:

- Daftar Jurnal
- Daftar Sales Order
- Daftar Sales Invoice
- Daftar Purchase Order
- Daftar Vendor Bill
- Daftar Inventory Movement
- Daftar Stock Adjustment
- dan halaman list ERP lainnya.

IMPORTANT DESIGN DECISION:
Jangan membuat setiap halaman list dari nol.
Jangan juga membuat satu WorkspaceComponent.vue raksasa yang memuat semua logic bisnis.

Gunakan pola:

1. Reusable workspace list shell
2. Reusable toolbar/filter/table/action/dialog component
3. Config per module
4. Service/API per module
5. Slot untuk behavior khusus
6. Terintegrasi dengan virtual tabs dan draft state

MAIN GOAL:
Buat fondasi reusable workspace list agar semua daftar modul ERP konsisten secara UI, tetapi tetap fleksibel untuk rules bisnis masing-masing modul.

DO NOT:

- Jangan mengubah backend.
- Jangan mengubah API contract.
- Jangan membuat semua halaman modul sekaligus.
- Jangan membuat business logic jurnal/sales/purchase secara hardcoded di WorkspaceListPage.
- Jangan membuat if module === "journal" atau if module === "sales_invoice" di komponen reusable.
- Jangan membuat table manual dari nol jika TanStack Table sudah tersedia.
- Jangan menambahkan library state selain Pinia.
- Jangan membuat dashboard baru.
- Jangan membuat form transaksi penuh dalam task ini.
- Jangan membuat style bebas di luar design token existing.
- Jangan bypass virtual tabs.

FILES / FOLDERS TO CHECK FIRST:
Baca file/folder berikut jika sudah ada:

- src/layouts/AppShell.vue
- src/components/layout/
- src/components/navigation/
- src/stores/workspace.store.ts
- src/stores/auth.store.ts
- src/stores/company.store.ts
- src/stores/permissions.store.ts
- src/services/api.ts
- src/router/index.ts
- src/types/
- src/components/ui/
- src/components/table/
- src/components/form/
- src/components/dialog/

Jika belum ada, buat struktur sesuai kebutuhan task ini.

TARGET FOLDER STRUCTURE:
Buat atau rapikan struktur berikut:

src/
├── components/
│ ├── workspace/
│ │ ├── WorkspaceListPage.vue
│ │ ├── WorkspaceToolbar.vue
│ │ ├── WorkspaceSearchBar.vue
│ │ ├── WorkspaceDateRangeFilter.vue
│ │ ├── WorkspaceFilterPanel.vue
│ │ ├── WorkspaceActionBar.vue
│ │ ├── WorkspaceDataTable.vue
│ │ ├── WorkspaceStatusBadge.vue
│ │ ├── WorkspaceEmptyState.vue
│ │ ├── WorkspaceLoadingState.vue
│ │ ├── WorkspaceErrorState.vue
│ │ └── WorkspaceConfirmDialog.vue
│ │
│ └── ui/
│ ├── BaseButton.vue
│ ├── BaseInput.vue
│ ├── BaseSelect.vue
│ ├── BaseBadge.vue
│ └── BaseDialog.vue
│
├── composables/
│ ├── useWorkspaceList.ts
│ ├── useWorkspaceFilters.ts
│ └── usePermission.ts
│
├── types/
│ ├── workspace.ts
│ ├── table.ts
│ └── api.ts
│
├── features/
│ ├── accounting/
│ │ ├── journals/
│ │ │ ├── journal-list.config.ts
│ │ │ ├── journal.service.ts
│ │ │ └── JournalListPage.vue
│ │
│ ├── sales/
│ │ ├── invoices/
│ │ │ ├── sales-invoice-list.config.ts
│ │ │ ├── sales-invoice.service.ts
│ │ │ └── SalesInvoiceListPage.vue
│ │
│ └── purchase/
│ └── orders/
│ ├── purchase-order-list.config.ts
│ ├── purchase-order.service.ts
│ └── PurchaseOrderListPage.vue

PHASE SCOPE:
Untuk task ini, implementasikan fondasi reusable dan minimal contoh 1 halaman:

- JournalListPage.vue sebagai contoh implementasi pertama

Opsional jika cepat dan aman:

- SalesInvoiceListPage.vue skeleton tanpa business logic kompleks

REUSABLE COMPONENT DESIGN:

1. WorkspaceListPage.vue

Purpose:
Komponen shell utama untuk semua halaman daftar.

Props:

- config: WorkspaceListConfig
- rows?: unknown[]
- loading?: boolean
- error?: string | null
- pagination?: WorkspacePagination
- filters?: Record<string, unknown>

Emits:

- refresh
- search
- filter-change
- date-change
- page-change
- sort-change
- row-click
- action-click
- bulk-action-click

Slots:

- toolbar-left
- toolbar-right
- advanced-filters
- before-table
- after-table
- row-actions
- empty
- loading
- error

Layout:

- Header title + subtitle
- Toolbar
- Search bar
- Date range filter
- Status filter
- Advanced filter slot
- Action bar
- Data table
- Pagination
- Loading state
- Empty state
- Error state

2. WorkspaceToolbar.vue

Purpose:
Menampilkan title, subtitle, search, filter, refresh, create button.

Behavior:

- Create button permission-aware.
- Refresh button tersedia.
- Search emit debounce.
- Date range filter optional.
- Status filter optional.
- Advanced filter toggle optional.

3. WorkspaceActionBar.vue

Purpose:
Menampilkan action global dan bulk action.

Behavior:

- Create
- Export placeholder optional
- Refresh
- Bulk action jika row selected
- Permission-aware
- Hidden jika tidak ada action visible

4. WorkspaceDataTable.vue

Purpose:
Reusable table menggunakan TanStack Table for Vue.

Features:

- Columns dari config
- Sorting
- Pagination
- Row selection optional
- Row click optional
- Row actions slot
- Empty state
- Loading state
- Responsive basic

Rules:

- Jangan buat table logic hardcoded per module.
- Column definition dari config.
- Support custom cell renderer jika memungkinkan via config/slot.
- Support status badge column.

5. WorkspaceFilterPanel.vue

Purpose:
Advanced filter area.

Behavior:

- Bisa collapse/expand
- Menerima filter schema dari config
- Support slot untuk custom filter
- Tidak hardcode filter jurnal/sales/purchase

6. WorkspaceConfirmDialog.vue

Purpose:
Reusable dialog untuk confirm action:

- Void
- Cancel
- Delete draft
- Close tab
- Bulk action

Props:

- open
- title
- message
- confirmLabel
- cancelLabel
- variant: default | danger | warning

Emits:

- confirm
- cancel
- close

TYPES:
Buat src/types/workspace.ts

Minimal type:

export type WorkspaceActionVariant =
| "primary"
| "secondary"
| "danger"
| "warning"
| "ghost";

export type WorkspaceRowAction<T = unknown> = {
key: string;
label: string;
icon?: string;
variant?: WorkspaceActionVariant;
permission?: string;
visibleWhen?: (row: T) => boolean;
disabledWhen?: (row: T) => boolean;
confirm?: {
title: string;
message: string;
confirmLabel?: string;
variant?: WorkspaceActionVariant;
};
};

export type WorkspaceGlobalAction = {
key: string;
label: string;
icon?: string;
variant?: WorkspaceActionVariant;
permission?: string;
visible?: boolean;
};

export type WorkspaceStatusOption = {
label: string;
value: string;
tone?: "default" | "draft" | "success" | "warning" | "danger" | "info";
};

export type WorkspaceDateFilterConfig = {
enabled: boolean;
field?: string;
label?: string;
};

export type WorkspaceSearchConfig = {
enabled: boolean;
placeholder?: string;
debounceMs?: number;
};

export type WorkspacePagination = {
page: number;
perPage: number;
total: number;
};

export type WorkspaceListConfig<T = unknown> = {
moduleKey: string;
primaryTabId: string;
title: string;
subtitle?: string;
listTabLabel?: string;
createLabel?: string;
search?: WorkspaceSearchConfig;
dateFilter?: WorkspaceDateFilterConfig;
statusOptions?: WorkspaceStatusOption[];
columns: any[];
rowKey: keyof T | ((row: T) => string | number);
globalActions?: WorkspaceGlobalAction[];
rowActions?: WorkspaceRowAction<T>[];
permissions?: {
view?: string;
create?: string;
edit?: string;
void?: string;
delete?: string;
};
routes?: {
list?: string;
create?: string;
edit?: (row: T) => string;
detail?: (row: T) => string;
};
};

PERMISSION RULE:
Gunakan permission store/composable existing jika ada.
Jika belum ada, buat composable:

src/composables/usePermission.ts

API:

- can(permission?: string): boolean

Behavior:

- Jika permission kosong, return true.
- Jika permission ada, cek dari permissions store.
- Semua button/action harus permission-aware.

VIRTUAL TABS INTEGRATION:
WorkspaceListPage harus bisa membuka create/edit/detail sebagai secondary virtual tabs.

Gunakan workspace store existing jika ada.
Jika belum lengkap, jangan refactor besar di task ini, tapi sediakan integration function.

Expected usage:

- Create button memanggil:
  workspaceStore.openCreateSecondaryTab(config.primaryTabId, {
  label: config.createLabel || "Data Baru",
  mode: "create",
  moduleKey: config.moduleKey,
  })

- Row edit action memanggil:
  workspaceStore.openEditSecondaryTab(config.primaryTabId, {
  entityId: row.id,
  entityNumber: row.document_number || row.number || row.code || row.id,
  label: row.document_number || row.number || row.code || "Edit Data",
  moduleKey: config.moduleKey,
  })

- Row detail action memanggil:
  workspaceStore.openDetailSecondaryTab(config.primaryTabId, {
  entityId: row.id,
  entityNumber: row.document_number || row.number || row.code || row.id,
  label: row.document_number || row.number || row.code || "Detail",
  moduleKey: config.moduleKey,
  })

CRITICAL:

- Jangan hanya router.push untuk create/edit.
- Create/edit harus membuka secondary virtual tab.
- Jika edit tab dengan entity yang sama sudah ada, aktifkan tab tersebut.
- Multiple create tabs boleh.

COMPOSABLE:
Buat src/composables/useWorkspaceList.ts

Purpose:
Reusable state untuk list page.

Input:

- config
- fetcher function

State:

- rows
- loading
- error
- search
- filters
- dateRange
- status
- pagination
- sorting
- selectedRows

Methods:

- fetchRows()
- refresh()
- setSearch()
- setFilter()
- setDateRange()
- setStatus()
- setPage()
- setSorting()
- clearFilters()
- handleAction(actionKey, row?)
- handleBulkAction(actionKey)

API SERVICE PATTERN:
Buat contoh service:

src/features/accounting/journals/journal.service.ts

Functions:

- listJournals(params)
- getJournal(id) placeholder
- voidJournal(id, reason) placeholder

Gunakan src/services/api.ts existing.
Jangan hardcode token/company di service, karena api.ts harus otomatis handle Authorization dan X-Company-ID.

JOURNAL LIST CONFIG:
Buat:

src/features/accounting/journals/journal-list.config.ts

Config minimal:

- moduleKey: "journals"
- primaryTabId: "/accounting/journals"
- title: "Daftar Jurnal"
- subtitle: "Kelola jurnal umum, approval, posting, dan void."
- listTabLabel: "Daftar Jurnal"
- createLabel: "Buat Jurnal"
- search placeholder: "Cari nomor jurnal, memo, atau akun..."
- dateFilter enabled
- statusOptions:
  - draft
  - approved
  - posted
  - void
- columns:
  - journal_number
  - journal_date
  - memo
  - total_debit
  - total_credit
  - status
- rowActions:
  - open/detail
  - edit visible when status draft
  - post visible when status approved
  - void visible when status posted
- permissions:
  - view: "journals.view"
  - create: "journals.create"
  - edit: "journals.edit"
  - void: "journals.void"

JOURNAL LIST PAGE:
Buat:

src/features/accounting/journals/JournalListPage.vue

Isi:

- import WorkspaceListPage
- import journalListConfig
- import useWorkspaceList
- panggil service listJournals
- render WorkspaceListPage dengan config dan state

ROUTER:
Jika route belum ada, tambahkan:

- /accounting/journals -> JournalListPage.vue

Pastikan route ini tetap berada di layout AppShell.

UI / STYLE RULE:
Gunakan TailwindCSS.
Ikuti palette/design token existing.
Default visual:

- background content: soft gray / near white
- card white
- border subtle
- rounded-xl atau rounded-2xl
- toolbar clean
- table compact ERP style
- header table sticky optional
- action button tidak terlalu besar
- mobile: filter dan action bisa stack vertical

MOBILE RULE:
Workspace list harus readable di mobile:

- Toolbar stack vertical
- Search full width
- Create button full width atau tetap accessible
- Table boleh horizontal scroll
- Filter panel collapse by default

STATUS BADGE:
WorkspaceStatusBadge harus support tone:

- draft: neutral/slate
- approved: blue/info
- posted: emerald/success
- void: red/danger
- cancelled: red/danger
- paid: emerald/success
- unpaid: amber/warning
- partial: blue/info

ERROR / EMPTY / LOADING:
WorkspaceListPage wajib punya:

- Loading skeleton sederhana
- Empty state dengan pesan dari config
- Error state dengan retry button

ACCEPTANCE CRITERIA:
Task dianggap selesai jika:

1. Reusable workspace component tersedia:
   - WorkspaceListPage.vue
   - WorkspaceToolbar.vue
   - WorkspaceDataTable.vue
   - WorkspaceFilterPanel.vue
   - WorkspaceActionBar.vue
   - WorkspaceStatusBadge.vue
   - WorkspaceConfirmDialog.vue

2. Type reusable tersedia:
   - src/types/workspace.ts

3. Composable tersedia:
   - useWorkspaceList.ts
   - usePermission.ts jika belum ada

4. Journal list contoh tersedia:
   - journal-list.config.ts
   - journal.service.ts
   - JournalListPage.vue

5. Journal list memakai WorkspaceListPage, bukan layout custom sendiri.

6. Create action membuka secondary virtual tab, bukan hanya router.push.

7. Edit/detail row action membuka secondary virtual tab.

8. Action button permission-aware.

9. Status badge tampil sesuai status.

10. Search, date filter, status filter, pagination minimal tersedia di state.

11. Tidak ada business logic spesifik modul di WorkspaceListPage.

12. Tidak ada perubahan backend.

13. Tidak ada dependency state baru selain Pinia.

14. Build/typecheck tidak error.

COMMANDS TO RUN:
Jalankan jika environment memungkinkan:

npm run dev
npm run build
npm run type-check
npm run lint

Jika command tidak tersedia, jelaskan di final summary.

FINAL SUMMARY REQUIRED:
Setelah selesai, berikan ringkasan:

- File dibuat
- File diubah
- Komponen reusable yang dibuat
- Route yang ditambahkan
- Cara JournalListPage menggunakan config
- Cara create/edit terhubung ke virtual tabs
- Command yang berhasil
- Command yang gagal/tidak dijalankan
- Catatan scope yang sengaja tidak dikerjakan

COMMIT MESSAGE:
implement reusable workspace list pattern
