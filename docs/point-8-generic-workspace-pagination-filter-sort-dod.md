# Point 8 - Definition of Done

## Functional DoD

- [x] Generic backend resource parser menangani array, nested `data/meta`, dan bentuk Laravel paginator.
- [x] Capability memiliki mode `remote | local | none`, mapping query, serta flag remote search/filter/sort/include-void.
- [x] Endpoint generic existing tetap memakai mode lokal karena backend saat ini belum mengembalikan paginator.
- [x] Mode remote menyusun parameter page, per-page, search, sort, status, date range, dan include-void sesuai konfigurasi.
- [x] Response tanpa paginator pada capability remote jatuh kembali ke perilaku lokal.
- [x] Search/filter/date/status/include-void/page-size mengembalikan page ke 1 dan membersihkan selection.
- [x] Navigasi page remote membersihkan selection dan mengambil page baru.
- [x] Table reusable meneruskan controlled pagination dan sorting tanpa mengubah pemanggil lokal existing.
- [x] Paginator menampilkan total/page size remote dan menyediakan pemilihan jumlah baris.
- [x] Status filter generic tetap tersedia; include-void muncul hanya bila dikonfigurasi.
- [x] Virtual tabs, form actions, dan bulk void flow tetap memakai pola existing.

## Files Changed

- `frontend-vue/src/features/workspace/backend-resource/BackendResourceWorkspace.vue`
- `frontend-vue/src/features/workspace/backend-resource/backendResource.service.ts`
- `frontend-vue/src/features/workspace/backend-resource/backendResource.config.ts`
- `frontend-vue/src/components/workspace/WorkspaceListPage.vue`
- `frontend-vue/src/components/workspace/WorkspaceDataTable.vue`
- `frontend-vue/src/components/workspace/WorkspaceFilterPanel.vue`
- `frontend-vue/src/components/table/DataTable.vue`
- `frontend-vue/src/components/table/DataTablePagination.vue`
- `frontend-vue/src/types/workspace.ts`
- `docs/point-8-generic-workspace-pagination-filter-sort.md`
- `docs/frontend-audit-gap-report.md`

## Validation DoD

- [x] `cd frontend-vue && npm run typecheck` dijalankan; gagal karena package tidak memiliki script `typecheck` dan menyarankan `type-check`.
- [x] `cd frontend-vue && npm run type-check` lulus.
- [x] `cd frontend-vue && npm run lint` lulus.
- [x] `cd frontend-vue && npm run build` lulus.
- [x] `cd backend && php artisan route:list --path=api` lulus dan menampilkan 307 route.
- [x] `git diff --check` lulus.
- [x] Review staged diff memastikan prompt files yang sudah ada tidak ikut commit.

`php artisan test` tidak dijalankan karena point ini tidak mengubah kode atau kontrak backend.
