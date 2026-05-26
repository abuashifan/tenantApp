# Point 8 - Generic Workspace Pagination, Filter, and Sort

## Scope

Perubahan ini mengeraskan jalur `BackendResourceWorkspace` tanpa mengubah layout workspace, virtual tabs, form, bulk void, atau endpoint backend. Generic workspace sekarang memiliki kontrak remote opt-in untuk endpoint yang mendukung paginator dan tetap mempertahankan filter/pagination lokal untuk endpoint collection yang ada saat ini.

## Temuan Backend

Audit service yang dipakai generic Sales, Purchase, Cash Bank, Master Data, dan Inventory menunjukkan list saat ini mengembalikan `Collection` atau query yang di-`get()`, bukan paginator. Karena parameter `search`, `page`, atau `sort_by` belum dijamin diproses endpoint tersebut, seluruh capability existing tetap default `paginationMode: 'local'`.

Mode remote dapat diaktifkan pada capability tertentu setelah endpoint tersebut benar-benar mendukung query dan mengembalikan metadata paginator.

## Implementasi

### Response Parser

`backendResource.service.ts` sekarang mengembalikan `{ rows, pagination }` dan menerima bentuk response berikut:

- array langsung dalam envelope API;
- object dengan `data: [...]`;
- nested envelope dengan `data: { data: [...], meta: {...}, links: {...} }`;
- Laravel paginator dengan `current_page`, `data`, `total`, `per_page`, dan `last_page`.

Metadata paginator dinormalisasi menjadi `page`, `perPage`, `total`, dan `lastPage`.

### Capability Contract

`backendResource.config.ts` menambahkan kontrak konfigurasi:

```ts
paginationMode: 'remote' | 'local' | 'none'
remoteSearch?: boolean
remoteFilters?: boolean
remoteSort?: boolean
includeVoidFilter?: boolean
queryParamMap?: {
  page?: string
  perPage?: string
  search?: string
  sortBy?: string
  sortDirection?: string
  status?: string
  startDate?: string
  endDate?: string
  asOfDate?: string
  includeVoid?: string
}
```

Default query key remote adalah `page`, `per_page`, `search`, `sort_by`, `sort_direction`, `status`, `start_date`, `end_date`, `as_of_date`, dan `include_void`.

### Workspace State

Untuk capability remote, workspace menyimpan page, page size, search, status, date range, include-void, dan sorting. Search tetap melalui debounce toolbar existing. Perubahan search/filter/date/status/include-void/page size mengembalikan page ke 1 dan menghapus selection; perpindahan page juga menghapus selection.

Jika capability ditandai remote tetapi response tidak membawa metadata paginator, tabel kembali menggunakan filter, sort, dan pagination lokal. Hal ini mencegah halaman kosong atau hanya memfilter sebagian page dari endpoint yang belum memenuhi kontrak.

### Table Wiring

Jalur `WorkspaceListPage` -> `WorkspaceDataTable` -> `DataTable` kini dapat menerima pagination dan sort terkontrol. Paginator existing menampilkan total dan page size saat remote serta menyediakan pilihan 10, 25, 50, atau 100 baris per halaman. Kolom generic sekarang memiliki accessor sehingga sort lokal bekerja dan id kolom dapat diteruskan sebagai `sort_by` pada mode remote.

Filter panel juga meneruskan opsi include-void bila capability endpoint mengaktifkannya, dan fallback status filter generic tetap dirender ketika tidak ada advanced-filter slot khusus.

## Batasan

- Tidak ada endpoint backend yang diubah atau dipaginate dalam point ini.
- Tidak ada capability existing yang dipaksa remote karena audit backend belum menemukan kontrak paginator pada endpoint generic aktif.
- Aktivasi remote per menu mensyaratkan backend memproses parameter query terkait dan mengembalikan metadata paginator.

## Verifikasi Manual

- Buka generic Sales/Purchase/Cash Bank/Inventory workspace dan pastikan list, search, status/date filter, sort, pagination lokal, virtual tabs, serta bulk selection tetap berjalan.
- Pada endpoint yang kelak diberi `paginationMode: 'remote'`, verifikasi network request memuat query remote, paginator menampilkan total/page size, dan selection kosong setelah perubahan page/filter.
- Uji response paginator nested dan Laravel untuk memastikan baris serta metadata tampil benar.
