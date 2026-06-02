<script setup lang="ts" generic="TRow extends { id: string }">
import type { ColumnDef, SortingState } from '@tanstack/vue-table'

import DataTable from '@/components/table/DataTable.vue'
import type { WorkspacePagination } from '@/types/workspace'

defineProps<{
  columns: ColumnDef<TRow, unknown>[]
  rows: TRow[]
  loading?: boolean
  selectable?: boolean
  selectedIds: string[]
  emptyTitle?: string
  emptyDescription?: string
  pagination?: WorkspacePagination
  remotePagination?: boolean
  sorting?: SortingState
  remoteSort?: boolean
  isRowSelectable?: (row: TRow) => boolean
  clearSelectionOnPageChange?: boolean
}>()

defineEmits<{
  'update:selectedIds': [ids: string[]]
  rowClick: [row: TRow]
  pageChange: [page: number]
  perPageChange: [perPage: number]
  sortChange: [sorting: SortingState]
}>()
</script>

<template>
  <DataTable
    :columns="columns"
    :data="rows"
    :loading="loading"
    :selectable="selectable"
    :is-row-selectable="isRowSelectable"
    :selected-ids="selectedIds"
    :empty-title="emptyTitle"
    :empty-description="emptyDescription"
    :pagination="pagination"
    :manual-pagination="remotePagination"
    :sorting="sorting"
    :manual-sorting="remoteSort"
    :clear-selection-on-page-change="clearSelectionOnPageChange ?? remotePagination"
    compact
    fill-available
    row-clickable
    show-page-size
    @update:selected-ids="$emit('update:selectedIds', $event)"
    @row-click="$emit('rowClick', $event)"
    @page-change="$emit('pageChange', $event)"
    @per-page-change="$emit('perPageChange', $event)"
    @sort-change="$emit('sortChange', $event)"
  />
</template>
