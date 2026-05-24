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
import { computed, h, ref, watch } from 'vue'

import { useVueTable } from '@tanstack/vue-table'

import DataTableCheckbox from '@/components/table/DataTableCheckbox.vue'
import DataTableEmptyState from '@/components/table/DataTableEmptyState.vue'
import DataTablePagination from '@/components/table/DataTablePagination.vue'
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
    rowClickable?: boolean
    tableMaxHeight?: string
    compact?: boolean
    metaTitle?: string
    metaDescription?: string
    showMeta?: boolean
  }>(),
  {
    loading: false,
    emptyTitle: 'No data',
    emptyDescription: 'Try adjusting your filters or date range.',
    selectedIds: () => [],
    selectable: false,
    rowClickable: false,
    tableMaxHeight: undefined,
    compact: false,
    metaTitle: '',
    metaDescription: '',
    showMeta: false,
  },
)

const emit = defineEmits<{
  'update:selectedIds': [ids: string[]]
  rowClick: [row: TRow]
}>()

const globalFilter = ref('')
const sorting = ref<SortingState>([])
const pagination = ref<PaginationState>({ pageIndex: 0, pageSize: 10 })
const rowSelection = ref<RowSelectionState>({})

const selectionColumn = computed<ColumnDef<TRow, unknown>>(() => ({
  id: 'select',
  header: ({ table }) =>
    h(DataTableCheckbox, {
      checked: table.getIsAllPageRowsSelected(),
      indeterminate: table.getIsSomePageRowsSelected(),
      ariaLabel: 'Select all rows',
      onChange: table.getToggleAllPageRowsSelectedHandler(),
    }),
  cell: ({ row }) =>
    h(DataTableCheckbox, {
      checked: row.getIsSelected(),
      disabled: !row.getCanSelect(),
      ariaLabel: 'Select row',
      onChange: (checked: boolean) => row.toggleSelected(checked),
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
      return sorting.value
    },
    get pagination() {
      return pagination.value
    },
    get rowSelection() {
      return rowSelection.value
    },
  },
  onGlobalFilterChange: (updater) => {
    globalFilter.value = typeof updater === 'function' ? updater(globalFilter.value) : updater
  },
  onSortingChange: (updater) => {
    sorting.value = typeof updater === 'function' ? updater(sorting.value) : updater
  },
  onPaginationChange: (updater) => {
    pagination.value = typeof updater === 'function' ? updater(pagination.value) : updater
  },
  onRowSelectionChange: (updater) => {
    rowSelection.value = typeof updater === 'function' ? updater(rowSelection.value) : updater
  },
  get enableRowSelection() {
    return props.selectable
  },
  getRowId: (row) => row.id,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
})

const selectedIdsInternal = computed(() => table.getSelectedRowModel().rows.map((r) => r.id))
const pageCount = computed(() => Math.max(table.getPageCount(), 1))

watch(
  selectedIdsInternal,
  (ids) => {
    emit('update:selectedIds', ids)
  },
  { deep: true },
)
</script>

<template>
  <div :class="cn('flex min-h-0 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm')">
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
      class="min-h-0 overflow-x-auto"
      :style="props.tableMaxHeight ? { maxHeight: props.tableMaxHeight, overflowY: 'auto' } : undefined"
    >
      <table class="min-w-full text-left text-sm">
        <thead class="sticky top-0 z-10 bg-slate-50 text-xs font-bold text-slate-600">
          <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
            <th
              v-for="header in headerGroup.headers"
              :key="header.id"
              :class="cn('whitespace-nowrap px-4', compact ? 'py-1.5' : 'py-3')"
            >
              <FlexRender
                v-if="!header.isPlaceholder"
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
              :class="cn('whitespace-nowrap px-4', compact ? 'py-1.5' : 'py-3')"
            >
              <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <DataTablePagination :table="table as any" :compact="compact" />
  </div>
</template>
