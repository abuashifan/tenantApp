<script setup lang="ts" generic="TRow extends { id: string }">
import { computed, ref, watch } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'

import DataTable from '@/components/table/DataTable.vue'
import DataTableToolbar from '@/components/table/DataTableToolbar.vue'
import WorkspaceSelectionActions from '@/components/workspace/WorkspaceSelectionActions.vue'
import { useWorkspaceList } from '@/composables/useWorkspaceList'
import { useWorkspaceTabsStore } from '@/stores/workspaceTabsStore'

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
    reloadKey?: string | number
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
    showFilter: true,
    showDateFilters: true,
  },
)

const emit = defineEmits<{
  filter: [filters: { search: string; startDate: string; endDate: string }]
  create: []
  void: [selectedIds: string[]]
  editFirstSelected: [id: string]
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
})
const rowsForTable = computed<TRow[]>(() => list.visibleRows.value)


function editFirstSelected() {
  const id = selectedIds.value[0]
  if (!id) return
  emit('editFirstSelected', id)
}

function applyFilter() {
  emit('filter', list.filters.value)
  void list.fetchRows()
}

watch(
  () => props.reloadKey,
  () => {
    void list.fetchRows()
  },
)
</script>

<template>
  <div class="space-y-4">
    <div v-if="activeSecondary?.mode === 'list'" class="space-y-4">
      <DataTableToolbar
        v-model:search="list.filters.value.search"
        v-model:startDate="list.filters.value.startDate"
        v-model:endDate="list.filters.value.endDate"
        :selected-count="selectedIds.length"
        :search-placeholder="searchPlaceholder"
        :create-label="createLabel"
        :void-label="voidLabel"
        :filter-label="filterLabel"
        :show-create="showCreate"
        :show-void="showVoid"
        :show-filter="showFilter"
        :show-date-filters="showDateFilters"
        @filter="applyFilter"
        @create="emit('create')"
        @void="emit('void', selectedIds)"
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
        :columns="columns"
        :data="rowsForTable"
        :loading="loading || list.loading.value"
        :empty-title="emptyTitle"
        :empty-description="emptyDescription"
        :selectable="selectable"
        v-model:selected-ids="selectedIds"
      />
    </div>

    <div v-else class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <slot name="form" :tab="activeSecondary" />
    </div>

  </div>
</template>
