<script setup lang="ts" generic="TRow extends { id: string }">
import {
  type ColumnDef,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  FlexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from '@tanstack/vue-table'
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-vue-next'
import { computed, h, ref, watch } from 'vue'

import { useVueTable } from '@tanstack/vue-table'

import DataTableCheckbox from '@/components/table/DataTableCheckbox.vue'
import DataTableEmptyState from '@/components/table/DataTableEmptyState.vue'
import DataTablePagination from '@/components/table/DataTablePagination.vue'
import type { WorkspacePagination } from '@/types/workspace'
import { cn } from '@/utils/cn'

const props = withDefaults(
  defineProps<{
    columns: ColumnDef<TRow, unknown>[]
    data: TRow[]
    loading?: boolean
    emptyTitle?: string
    emptyDescription?: string
    selectedIds?: string[]
    selectable?: boolean
    isRowSelectable?: (row: TRow) => boolean
    clearSelectionOnPageChange?: boolean
    rowClickable?: boolean
    tableMaxHeight?: string
    compact?: boolean
    metaTitle?: string
    metaDescription?: string
    showMeta?: boolean
    fillAvailable?: boolean
    pagination?: WorkspacePagination
    manualPagination?: boolean
    sorting?: SortingState
    manualSorting?: boolean
    showPageSize?: boolean
  }>(),
  {
    loading: false,
    emptyTitle: 'No data',
    emptyDescription: 'Try adjusting your filters or date range.',
    selectedIds: () => [],
    selectable: false,
    clearSelectionOnPageChange: false,
    rowClickable: false,
    tableMaxHeight: undefined,
    compact: false,
    metaTitle: '',
    metaDescription: '',
    showMeta: false,
    fillAvailable: false,
    manualPagination: false,
    manualSorting: false,
    showPageSize: false,
  },
)

const emit = defineEmits<{
  'update:selectedIds': [ids: string[]]
  rowClick: [row: TRow]
  pageChange: [page: number]
  perPageChange: [perPage: number]
  sortChange: [sorting: SortingState]
}>()

const globalFilter = ref('')
const tableSorting = ref<SortingState>(props.sorting ?? [])
const tablePagination = ref<PaginationState>({
  pageIndex: Math.max(0, (props.pagination?.page ?? 1) - 1),
  pageSize: props.pagination?.perPage ?? 10,
})
const rowSelection = ref<RowSelectionState>({})

function selectedIdsFromState(state: RowSelectionState) {
  return Object.entries(state)
    .filter(([, selected]) => selected)
    .map(([id]) => id)
}

function setRowSelectionState(next: RowSelectionState) {
  rowSelection.value = next
  emit('update:selectedIds', selectedIdsFromState(next))
}

function isRowSelected(rowId: string) {
  return Boolean(rowSelection.value[rowId])
}

function toggleRow(rowId: string, checked: boolean) {
  const next = { ...rowSelection.value }
  if (checked) next[rowId] = true
  else delete next[rowId]
  setRowSelectionState(next)
}

function pageSelectableRows() {
  return table.getRowModel().rows.filter((row) => row.getCanSelect())
}

function isAllPageRowsSelected() {
  const rows = pageSelectableRows()
  return rows.length > 0 && rows.every((row) => isRowSelected(row.id))
}

function isSomePageRowsSelected() {
  const rows = pageSelectableRows()
  return rows.some((row) => isRowSelected(row.id)) && !isAllPageRowsSelected()
}

function toggleAllPageRows(checked: boolean) {
  const next = { ...rowSelection.value }
  for (const row of pageSelectableRows()) {
    if (checked) next[row.id] = true
    else delete next[row.id]
  }
  setRowSelectionState(next)
}

const selectionColumn = computed<ColumnDef<TRow, unknown>>(() => ({
  id: 'select',
  header: ({ table }) =>
    h(DataTableCheckbox, {
      checked: isAllPageRowsSelected(),
      indeterminate: isSomePageRowsSelected(),
      disabled: !table.getRowModel().rows.some((row) => row.getCanSelect()),
      ariaLabel: 'Select all rows',
      onChange: toggleAllPageRows,
    }),
  cell: ({ row }) =>
    h(DataTableCheckbox, {
      checked: isRowSelected(row.id),
      disabled: !row.getCanSelect(),
      ariaLabel: 'Select row',
      onChange: (checked: boolean) => toggleRow(row.id, checked),
    }),
  enableSorting: false,
  enableHiding: false,
}))

const columnsWithSelection = computed<ColumnDef<TRow, unknown>[]>(() => {
  if (!props.selectable) return props.columns
  return [selectionColumn.value, ...props.columns]
})

watch(
  () => props.selectedIds,
  (ids) => {
    const next: RowSelectionState = {}
    for (const id of ids) next[id] = true
    rowSelection.value = next
  },
  { immediate: true },
)

watch(
  () => props.pagination,
  (next) => {
    if (!next) return
    tablePagination.value = { pageIndex: Math.max(0, next.page - 1), pageSize: next.perPage }
  },
  { deep: true },
)

watch(
  () => props.sorting,
  (next) => {
    if (next && props.manualSorting) tableSorting.value = next
  },
  { deep: true },
)

const remotePageCount = computed(() => {
  const pagination = props.pagination
  if (!pagination) return 1
  return Math.max(1, pagination.lastPage ?? Math.ceil(pagination.total / pagination.perPage))
})

const table = useVueTable({
  get data() {
    return props.data
  },
  get columns() {
    return columnsWithSelection.value
  },
  state: {
    get globalFilter() {
      return globalFilter.value
    },
    get sorting() {
      return tableSorting.value
    },
    get pagination() {
      return tablePagination.value
    },
    get rowSelection() {
      return rowSelection.value
    },
  },
  onGlobalFilterChange: (updater) => {
    globalFilter.value = typeof updater === 'function' ? updater(globalFilter.value) : updater
  },
  onSortingChange: (updater) => {
    tableSorting.value = typeof updater === 'function' ? updater(tableSorting.value) : updater
    if (props.manualSorting) emit('sortChange', tableSorting.value)
  },
  onPaginationChange: (updater) => {
    const next = typeof updater === 'function' ? updater(tablePagination.value) : updater
    const pageChanged = next.pageIndex !== tablePagination.value.pageIndex || next.pageSize !== tablePagination.value.pageSize
    const pageSizeChanged = next.pageSize !== tablePagination.value.pageSize
    tablePagination.value = next
    if (pageSizeChanged) emit('perPageChange', next.pageSize)
    else if (pageChanged) emit('pageChange', next.pageIndex + 1)
    if (props.clearSelectionOnPageChange && pageChanged) {
      setRowSelectionState({})
    }
  },
  onRowSelectionChange: (updater) => {
    setRowSelectionState(typeof updater === 'function' ? updater(rowSelection.value) : updater)
  },
  enableRowSelection: (row) => props.selectable && (props.isRowSelectable ? props.isRowSelectable(row.original) : true),
  getRowId: (row) =>
    String(
      row.id ??
        (row as Record<string, unknown>).number ??
        (row as Record<string, unknown>).journal_number,
    ),
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  get manualPagination() {
    return props.manualPagination
  },
  get manualSorting() {
    return props.manualSorting
  },
  get pageCount() {
    return props.manualPagination ? remotePageCount.value : undefined
  },
})

const pageCount = computed(() => Math.max(table.getPageCount(), 1))
</script>

<template>
  <div
    :class="
      cn(
        'flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white',
        fillAvailable && 'flex-1',
      )
    "
  >
    <div
      v-if="showMeta"
      :class="cn('flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-4', compact ? 'py-2' : 'py-3')"
    >
      <div>
        <p :class="cn('font-black text-slate-950', compact ? 'text-xs' : 'text-sm')">{{ metaTitle }}</p>
        <p v-if="metaDescription" :class="cn('text-xs text-slate-500', compact ? 'mt-0.5' : 'mt-1')">{{ metaDescription }}</p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <span class="inline-flex h-6 items-center rounded-full bg-slate-100 px-3 text-xs font-bold text-slate-600">
          {{ table.getRowModel().rows.length }} rows
        </span>
        <span class="inline-flex h-6 items-center rounded-full bg-slate-100 px-3 text-xs font-bold text-slate-600">
          Page {{ table.getState().pagination.pageIndex + 1 }} of {{ pageCount }}
        </span>
      </div>
    </div>

    <div
      :class="cn('workspace-table-scroll min-h-0 min-w-0 overflow-x-auto', fillAvailable && 'flex-1 overflow-y-auto')"
      :style="props.tableMaxHeight ? { maxHeight: props.tableMaxHeight, overflowY: 'auto' } : undefined"
    >
      <table class="w-full min-w-full text-left text-sm">
        <thead class="sticky top-0 z-10 bg-slate-50 text-xs font-bold text-slate-600">
          <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
            <th
              v-for="header in headerGroup.headers"
              :key="header.id"
              :class="
                cn(
                  'whitespace-nowrap tablet-table-cell px-4',
                  compact ? 'tablet-table-cell-compact py-2 text-xs' : 'py-3',
                  header.column.id === 'actions' && 'workspace-table-action-cell',
                )
              "
            >
              <button
                v-if="!header.isPlaceholder && header.column.getCanSort()"
                type="button"
                class="inline-flex w-full items-center gap-1.5 text-left font-bold hover:text-slate-900"
                @click="header.column.toggleSorting(header.column.getIsSorted() === 'asc')"
              >
                <FlexRender :render="header.column.columnDef.header" :props="header.getContext()" />
                <ArrowUp v-if="header.column.getIsSorted() === 'asc'" class="h-3.5 w-3.5 shrink-0" />
                <ArrowDown v-else-if="header.column.getIsSorted() === 'desc'" class="h-3.5 w-3.5 shrink-0" />
                <ChevronsUpDown v-else class="h-3.5 w-3.5 shrink-0 text-slate-400" />
              </button>
              <FlexRender
                v-else-if="!header.isPlaceholder"
                :render="header.column.columnDef.header"
                :props="header.getContext()"
              />
            </th>
          </tr>
        </thead>

        <tbody class="divide-y divide-slate-100">
          <tr v-if="loading">
            <td :colspan="table.getAllColumns().length" class="px-4 py-10">
              <div class="flex items-center justify-center gap-3 text-sm font-semibold text-slate-500">
                <span class="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-r-transparent" />
                Loading…
              </div>
            </td>
          </tr>

          <tr v-else-if="table.getRowModel().rows.length === 0">
            <td :colspan="table.getAllColumns().length" class="px-4 py-8">
              <DataTableEmptyState :title="emptyTitle" :description="emptyDescription" />
            </td>
          </tr>

          <tr
            v-else
            v-for="row in table.getRowModel().rows"
            :key="row.id"
            :class="cn('hover:bg-slate-50/70', rowClickable && 'cursor-pointer')"
            @click="rowClickable ? emit('rowClick', row.original) : undefined"
          >
            <td
              v-for="cell in row.getVisibleCells()"
              :key="cell.id"
              :class="
                cn(
                  'whitespace-nowrap tablet-table-cell px-4',
                  compact ? 'tablet-table-cell-compact py-2 text-sm' : 'py-3',
                  cell.column.id === 'actions' && 'workspace-table-action-cell',
                )
              "
            >
              <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <DataTablePagination
      :table="table as any"
      :compact="compact"
      :pagination="props.manualPagination ? props.pagination : undefined"
      :show-page-size="props.showPageSize"
    />
  </div>
</template>
