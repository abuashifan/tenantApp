<script setup lang="ts" generic="TRow extends { id: string }">
import { computed, h, ref, shallowRef, useSlots } from 'vue'
import type { ColumnDef, SortingState } from '@tanstack/vue-table'

import WorkspaceConfirmDialog from '@/components/workspace/WorkspaceConfirmDialog.vue'
import WorkspaceDataTable from '@/components/workspace/WorkspaceDataTable.vue'
import WorkspaceEmptyState from '@/components/workspace/WorkspaceEmptyState.vue'
import WorkspaceErrorState from '@/components/workspace/WorkspaceErrorState.vue'
import WorkspaceFilterPanel from '@/components/workspace/WorkspaceFilterPanel.vue'
import WorkspaceLoadingState from '@/components/workspace/WorkspaceLoadingState.vue'
import WorkspaceRowActions from '@/components/workspace/WorkspaceRowActions.vue'
import WorkspaceToolbar from '@/components/workspace/WorkspaceToolbar.vue'
import { useWorkspaceTabsStore } from '@/stores/workspaceTabsStore'
import type { WorkspaceListConfig, WorkspacePagination, WorkspaceRowAction } from '@/types/workspace'

const props = withDefaults(
  defineProps<{
    config: WorkspaceListConfig<TRow>
    rows?: TRow[]
    loading?: boolean
    error?: string | null
    pagination?: WorkspacePagination
    remotePagination?: boolean
    sorting?: SortingState
    remoteSort?: boolean
    search?: string
    startDate?: string
    endDate?: string
    status?: string
    includeVoid?: boolean
    showIncludeVoid?: boolean
    selectedIds?: string[]
    showFilterActions?: boolean
  }>(),
  {
    rows: () => [],
    loading: false,
    error: null,
    search: '',
    startDate: '',
    endDate: '',
    status: '',
    includeVoid: false,
    showIncludeVoid: false,
    selectedIds: () => [],
    showFilterActions: false,
  },
)

const emit = defineEmits<{
  refresh: []
  search: [value: string]
  filterChange: [filters: Record<string, unknown>]
  dateChange: [range: { startDate: string; endDate: string }]
  statusChange: [status: string]
  includeVoidChange: [includeVoid: boolean]
  pageChange: [page: number]
  perPageChange: [perPage: number]
  sortChange: [sorting: SortingState]
  applyFilters: []
  resetFilters: []
  rowClick: [row: TRow]
  actionClick: [payload: { key: string; row?: TRow }]
  bulkActionClick: [payload: { key: string; selectedIds: string[] }]
  'update:selectedIds': [ids: string[]]
}>()

const tabs = useWorkspaceTabsStore()
const slots = useSlots()
tabs.ensureListSecondaryTab(props.config.primaryTabId)

const filtersOpen = ref(false)
const pendingAction = shallowRef<{ action: WorkspaceRowAction<TRow>; row: TRow } | null>(null)
const activeSecondaryId = computed(() => tabs.activeSecondaryTabIdByPrimaryId[props.config.primaryTabId] ?? '')
const secondaryTabs = computed(() => tabs.secondaryTabsByPrimaryId[props.config.primaryTabId] ?? [])
const activeSecondary = computed(() => secondaryTabs.value.find((tab) => tab.id === activeSecondaryId.value) ?? null)
const hasFilters = computed(() => Boolean(slots['advanced-filters'] || props.config.statusOptions?.length || props.showIncludeVoid))

const columns = computed<ColumnDef<TRow, unknown>[]>(() => {
  if (!props.config.rowActions?.length) return props.config.columns

  return [
    ...props.config.columns,
    {
      id: 'actions',
      header: '',
      cell: ({ row }) =>
        h(WorkspaceRowActions<TRow>, {
          row: row.original,
          actions: props.config.rowActions ?? [],
          onActionClick: (key: string, selectedRow: TRow) => handleRowAction(key, selectedRow),
        }),
      enableSorting: false,
    },
  ]
})

function openCreateTab() {
  emit('actionClick', { key: 'create' })
}

function openEditTab(row: TRow) {
  emit('actionClick', { key: 'edit', row })
}

function openDetailTab(row: TRow) {
  emit('actionClick', { key: 'detail', row })
}

function handleRowAction(key: string, row: TRow) {
  const action = props.config.rowActions?.find((item) => item.key === key)
  if (action?.confirm) {
    pendingAction.value = { action, row }
    return
  }

  executeRowAction(key, row)
}

function executeRowAction(key: string, row: TRow) {
  if (key === 'edit') {
    openEditTab(row)
    return
  }
  if (key === 'detail' || key === 'open') {
    openDetailTab(row)
    return
  }
  emit('actionClick', { key, row })
}

function confirmPendingAction() {
  if (!pendingAction.value) return
  executeRowAction(pendingAction.value.action.key, pendingAction.value.row)
  pendingAction.value = null
}
</script>

<template>
  <div class="h-full min-h-0 min-w-0">
    <div
      v-if="activeSecondary?.mode === 'list'"
      class="workspace-card tablet-workspace-card flex h-full min-h-0 min-w-0 flex-col gap-2 rounded-b-2xl rounded-tr-2xl border border-slate-200 bg-white p-2.5 shadow-sm lg:p-3"
    >
      <div class="flex min-w-0 flex-none flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <div class="min-w-0">
          <h1 class="truncate text-base font-black leading-5 text-slate-950">{{ config.title }}</h1>
          <p v-if="config.subtitle" class="truncate text-xs leading-4 text-slate-500">{{ config.subtitle }}</p>
        </div>
      </div>

      <WorkspaceToolbar
        :config="config"
        :search="search"
        :start-date="startDate"
        :end-date="endDate"
        :selected-count="selectedIds.length"
        :show-filter-actions="showFilterActions"
        :has-filters="hasFilters"
        embedded
        @update:search="emit('search', $event)"
        @update:start-date="emit('dateChange', { startDate: $event, endDate })"
        @update:end-date="emit('dateChange', { startDate, endDate: $event })"
        @toggle-filters="filtersOpen = !filtersOpen"
        @apply-filters="emit('applyFilters')"
        @reset-filters="emit('resetFilters')"
        @create="openCreateTab"
        @refresh="emit('refresh')"
        @action-click="emit('bulkActionClick', { key: $event, selectedIds })"
      >
        <template #toolbar-bottom>
          <slot name="toolbar-right" />
        </template>
      </WorkspaceToolbar>

      <slot name="before-table" />

      <div
        class="min-h-0 min-w-0 flex-1 gap-2"
        :class="filtersOpen ? 'grid xl:grid-cols-[260px_minmax(0,1fr)]' : 'flex flex-col'"
      >
        <WorkspaceFilterPanel
          v-if="$slots['advanced-filters']"
          :open="filtersOpen"
          :status="status"
          :status-options="config.statusOptions"
          :show-include-void="showIncludeVoid"
          :include-void="includeVoid"
          @update:status="emit('statusChange', $event)"
          @update:include-void="emit('includeVoidChange', $event)"
        >
          <slot name="advanced-filters" />
        </WorkspaceFilterPanel>
        <WorkspaceFilterPanel
          v-else
          :open="filtersOpen"
          :status="status"
          :status-options="config.statusOptions"
          :show-include-void="showIncludeVoid"
          :include-void="includeVoid"
          @update:status="emit('statusChange', $event)"
          @update:include-void="emit('includeVoidChange', $event)"
        />

        <div class="flex min-h-0 min-w-0 flex-1 flex-col">
          <slot v-if="loading" name="loading">
            <WorkspaceLoadingState />
          </slot>

          <slot v-else-if="error" name="error">
            <WorkspaceErrorState :message="error" @retry="emit('refresh')" />
          </slot>

          <slot v-else-if="rows.length === 0" name="empty">
            <WorkspaceEmptyState :title="config.emptyTitle" :description="config.emptyDescription" />
          </slot>

          <WorkspaceDataTable
            v-else
            class="min-h-0 flex-1"
            :columns="columns"
            :rows="rows"
            :loading="loading"
            :selectable="config.selectable !== false"
            :is-row-selectable="config.isRowSelectable"
            :selected-ids="selectedIds"
            :empty-title="config.emptyTitle"
            :empty-description="config.emptyDescription"
            :pagination="pagination"
            :remote-pagination="remotePagination"
            :sorting="sorting"
            :remote-sort="remoteSort"
            :clear-selection-on-page-change="config.clearSelectionOnPageChange"
            @update:selected-ids="emit('update:selectedIds', $event)"
            @row-click="emit('rowClick', $event)"
            @page-change="emit('pageChange', $event)"
            @per-page-change="emit('perPageChange', $event)"
            @sort-change="emit('sortChange', $event)"
          />
        </div>
      </div>

      <slot name="after-table" />
    </div>

    <div v-else class="workspace-card tablet-workspace-card min-w-0 rounded-b-3xl rounded-tr-3xl border border-slate-200 bg-white p-4 shadow-sm lg:p-5">
      <slot name="secondary" :tab="activeSecondary" />
    </div>

    <WorkspaceConfirmDialog
      :open="pendingAction != null"
      :title="pendingAction?.action.confirm?.title ?? 'Confirm action'"
      :message="pendingAction?.action.confirm?.message ?? 'Continue this action?'"
      :confirm-label="pendingAction?.action.confirm?.confirmLabel ?? 'Confirm'"
      :variant="pendingAction?.action.confirm?.variant"
      @close="pendingAction = null"
      @cancel="pendingAction = null"
      @confirm="confirmPendingAction"
    />
  </div>
</template>
