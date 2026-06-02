<script setup lang="ts" generic="TRow extends { id: string }">
import { computed, ref, watch } from 'vue'
import type { ColumnDef, SortingState } from '@tanstack/vue-table'

import DataTable from '@/components/table/DataTable.vue'
import DataTableToolbar from '@/components/table/DataTableToolbar.vue'
import WorkspaceSelectionActions from '@/components/workspace/WorkspaceSelectionActions.vue'
import { useWorkspaceList } from '@/composables/useWorkspaceList'
import { useWorkspaceTabsStore } from '@/stores/workspaceTabsStore'
import type { WorkspaceStatusFilter, WorkspaceStatusOption } from '@/types/workspace'

const props = withDefaults(
  defineProps<{
    primaryId: string
    columns: ColumnDef<TRow, unknown>[]
    rows?: TRow[]
    endpoint?: string
    mapRow?: (row: unknown) => TRow
    loading?: boolean
    emptyTitle?: string
    emptyDescription?: string
    selectable?: boolean
    searchPlaceholder?: string
    createLabel?: string
    voidLabel?: string
    filterLabel?: string
    editSelectedLabel?: string
    showEditSelected?: boolean
    showCreate?: boolean
    showVoid?: boolean
    showFilter?: boolean
    showDateFilters?: boolean
    statusOptions?: WorkspaceStatusOption[]
    bulkActions?: Array<{ key: string; label: string; variant?: 'primary' | 'secondary' | 'danger' }>
    reloadKey?: string | number
    clearSelectionKey?: string | number
    defaultSorting?: SortingState
  }>(),
  {
    rows: () => [],
    loading: false,
    emptyTitle: 'No data',
    emptyDescription: 'Try adjusting your filters or date range.',
    selectable: true,
    searchPlaceholder: 'Search transaction number…',
    createLabel: 'Create New',
    voidLabel: 'Void',
    filterLabel: 'Filter',
    editSelectedLabel: 'Edit first selected',
    showEditSelected: true,
    showCreate: true,
    showVoid: true,
    showFilter: false,
    showDateFilters: true,
    statusOptions: () => [],
    bulkActions: () => [],
  },
)

const emit = defineEmits<{
  filter: [filters: { search: string; startDate: string; endDate: string }]
  create: []
  void: [selectedIds: string[]]
  bulkAction: [payload: { key: string; selectedIds: string[]; selectedRows: TRow[] }]
  editFirstSelected: [id: string]
  rowClick: [row: TRow]
  loadError: [message: string]
}>()

const tabs = useWorkspaceTabsStore()
tabs.ensureListSecondaryTab(props.primaryId)

const activeSecondaryId = computed(
  () => tabs.activeSecondaryTabIdByPrimaryId[props.primaryId] ?? `${props.primaryId}::list`,
)
const secondaryTabs = computed(() => tabs.secondaryTabsByPrimaryId[props.primaryId] ?? [])
const activeSecondary = computed(() => secondaryTabs.value.find((t) => t.id === activeSecondaryId.value) ?? null)

const selectedIds = ref<string[]>([])

const sourceRows = computed(() => props.rows)
const list = useWorkspaceList<TRow>({
  endpoint: props.endpoint,
  rows: sourceRows,
  mapRow: props.mapRow,
  primaryTabId: props.primaryId,
  defaultSorting: props.defaultSorting,
})
selectedIds.value = list.selectedIds.value
const rowsForTable = computed<TRow[]>(() => list.visibleRows.value)
const selectedRows = computed(() => rowsForTable.value.filter((row) => selectedIds.value.includes(row.id)))


function editFirstSelected() {
  const id = selectedIds.value[0]
  if (!id) return
  emit('editFirstSelected', id)
}

function applyFilter() {
  emit('filter', list.filters.value)
  void list.fetchRows()
}

function updateSearch(value: string) {
  list.setSearch(value)
  applyFilter()
}

function updateStartDate(value: string) {
  list.setDateRange(value, list.filters.value.endDate)
  applyFilter()
}

function updateEndDate(value: string) {
  list.setDateRange(list.filters.value.startDate, value)
  applyFilter()
}

function updateStatus(value: WorkspaceStatusFilter) {
  list.setStatus(value)
  applyFilter()
}

watch(
  () => props.reloadKey,
  () => {
    void list.fetchRows()
  },
)

watch(
  () => props.clearSelectionKey,
  () => {
    selectedIds.value = []
  },
)

watch(
  selectedIds,
  (ids) => {
    list.selectedIds.value = ids
  },
  { deep: true },
)
</script>

<template>
  <div class="h-full min-h-0 min-w-0">
    <div
      v-if="activeSecondary?.mode === 'list'"
      class="workspace-card tablet-workspace-card flex h-full min-h-0 min-w-0 flex-col gap-2 rounded-b-2xl rounded-tr-2xl border border-slate-200 bg-white p-3 shadow-sm lg:p-4"
    >
      <DataTableToolbar
        :search="list.filters.value.search"
        :start-date="list.filters.value.startDate"
        :end-date="list.filters.value.endDate"
        :status="list.status.value"
        :status-options="statusOptions"
        :selected-count="selectedIds.length"
        :search-placeholder="searchPlaceholder"
        :create-label="createLabel"
        :void-label="voidLabel"
        :filter-label="filterLabel"
        :show-create="showCreate"
        :show-void="showVoid"
        :show-filter="showFilter"
        :show-date-filters="showDateFilters"
        :bulk-actions="bulkActions"
        embedded
        @update:search="updateSearch"
        @update:start-date="updateStartDate"
        @update:end-date="updateEndDate"
        @update:status="updateStatus"
        @filter="applyFilter"
        @create="emit('create')"
        @void="emit('void', selectedIds)"
        @bulk-action="emit('bulkAction', { key: $event, selectedIds, selectedRows })"
      />

      <div
        v-if="list.error.value"
        class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
      >
        {{ list.error.value }}
      </div>

      <WorkspaceSelectionActions
        :selected-count="selectedIds.length"
        :edit-label="editSelectedLabel"
        :show-edit="showEditSelected"
        @edit="editFirstSelected"
      />

      <DataTable
        class="min-h-0 flex-1"
        :columns="columns"
        :data="rowsForTable"
        :loading="loading || list.loading.value"
        :empty-title="emptyTitle"
        :empty-description="emptyDescription"
        :selectable="selectable"
        v-model:selected-ids="selectedIds"
        :pagination="list.pagination.value"
        :sorting="list.sorting.value"
        compact
        fill-available
        row-clickable
        @page-change="list.setPage"
        @row-click="emit('rowClick', $event)"
        @per-page-change="(perPage) => { list.pagination.value.perPage = perPage; list.setPage(1) }"
      />
    </div>

    <div v-else class="workspace-card tablet-workspace-card h-full min-h-0 min-w-0 overflow-hidden rounded-b-3xl rounded-tr-3xl border border-slate-200 bg-white p-3 shadow-sm lg:p-4">
      <slot name="form" :tab="activeSecondary" />
    </div>

  </div>
</template>
