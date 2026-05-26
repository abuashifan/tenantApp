<script setup lang="ts" generic="TRow extends { id: string }">
import { computed, h, ref, shallowRef } from 'vue'
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
  rowClick: [row: TRow]
  actionClick: [payload: { key: string; row?: TRow }]
  bulkActionClick: [payload: { key: string; selectedIds: string[] }]
  'update:selectedIds': [ids: string[]]
}>()

const tabs = useWorkspaceTabsStore()
tabs.ensureListSecondaryTab(props.config.primaryTabId)

const filtersOpen = ref(false)
const pendingAction = shallowRef<{ action: WorkspaceRowAction<TRow>; row: TRow } | null>(null)
const activeSecondaryId = computed(() => tabs.activeSecondaryTabIdByPrimaryId[props.config.primaryTabId] ?? '')
const secondaryTabs = computed(() => tabs.secondaryTabsByPrimaryId[props.config.primaryTabId] ?? [])
const activeSecondary = computed(() => secondaryTabs.value.find((tab) => tab.id === activeSecondaryId.value) ?? null)

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
  if (key === 'edit') openEditTab(row)
  if (key === 'detail' || key === 'open') openDetailTab(row)
  emit('actionClick', { key, row })
}

function confirmPendingAction() {
  if (!pendingAction.value) return
  executeRowAction(pendingAction.value.action.key, pendingAction.value.row)
  pendingAction.value = null
}
</script>

<template>
  <div>
    <div
      v-if="activeSecondary?.mode === 'list'"
      class="space-y-4 rounded-b-3xl rounded-tr-3xl border border-slate-200 bg-white p-4 shadow-sm lg:p-5"
    >
      <div>
        <h1 class="text-xl font-black text-slate-950">{{ config.title }}</h1>
        <p v-if="config.subtitle" class="mt-1 text-xs text-slate-500">{{ config.subtitle }}</p>
      </div>

      <WorkspaceToolbar
        :config="config"
        :search="search"
        :start-date="startDate"
        :end-date="endDate"
        :selected-count="selectedIds.length"
        embedded
        @update:search="emit('search', $event)"
        @update:start-date="emit('dateChange', { startDate: $event, endDate })"
        @update:end-date="emit('dateChange', { startDate, endDate: $event })"
        @toggle-filters="filtersOpen = !filtersOpen"
        @create="openCreateTab"
        @refresh="emit('refresh')"
        @action-click="emit('bulkActionClick', { key: $event, selectedIds })"
      >
        <template #toolbar-bottom>
          <slot name="toolbar-right" />
        </template>
      </WorkspaceToolbar>

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

      <slot name="before-table" />

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
        :columns="columns"
        :rows="rows"
        :loading="loading"
        :selectable="config.selectable !== false"
        :selected-ids="selectedIds"
        :empty-title="config.emptyTitle"
        :empty-description="config.emptyDescription"
        :pagination="pagination"
        :remote-pagination="remotePagination"
        :sorting="sorting"
        :remote-sort="remoteSort"
        @update:selected-ids="emit('update:selectedIds', $event)"
        @row-click="emit('rowClick', $event)"
        @page-change="emit('pageChange', $event)"
        @per-page-change="emit('perPageChange', $event)"
        @sort-change="emit('sortChange', $event)"
      />

      <slot name="after-table" />
    </div>

    <div v-else class="rounded-b-3xl rounded-tr-3xl border border-slate-200 bg-white p-4 shadow-sm lg:p-5">
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
