<script setup lang="ts">
import type { SortingState } from '@tanstack/vue-table'
import { computed, ref, watch } from 'vue'

import BaseButton from '@/components/ui/BaseButton.vue'
import VoidTransactionDialog from '@/components/dialog/VoidTransactionDialog.vue'
import WorkspaceListPage from '@/components/workspace/WorkspaceListPage.vue'
import BackendResourceForm from './BackendResourceForm.vue'
import { listBackendResource, type BackendResourceRow } from './backendResource.service'
import { makeBackendResourceConfig, resourceCapability, type BackendQueryParamMap } from './backendResource.config'
import { backendResourceFormConfigs } from './backendResource.form.config'
import { runBackendResourceAction, extractLaravelErrors } from './backendResourceForm.service'
import { findSidebarMenuItem } from '@/navigation/sidebar'
import { useWorkspaceTabsStore } from '@/stores/workspaceTabsStore'
import type { WorkspacePagination, WorkspaceStatusFilter } from '@/types/workspace'
import { currentMonthDateRange } from '@/utils/date'

const tabs = useWorkspaceTabsStore()
const menuItem = computed(() => findSidebarMenuItem(tabs.activePrimaryTabId))
const config = computed(() => (menuItem.value ? makeBackendResourceConfig(menuItem.value) : null))
const capability = computed(() => (menuItem.value ? resourceCapability(menuItem.value) : null))
const formConfig = computed(() => (menuItem.value ? backendResourceFormConfigs[menuItem.value.href] : null))

const rows = ref<BackendResourceRow[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const search = ref('')
const startDate = ref('')
const endDate = ref('')
const status = ref<WorkspaceStatusFilter>([])
const includeVoid = ref(false)
const selectedIds = ref<string[]>([])
const sorting = ref<SortingState>([])
const pagination = ref<WorkspacePagination>({ page: 1, perPage: 10, total: 0, lastPage: 1 })
const responsePaginated = ref(false)
const bulkVoidOpen = ref(false)
const bulkVoidLoading = ref(false)
const operationNotice = ref<string | null>(null)
const requestedRemote = computed(() => capability.value?.paginationMode === 'remote')
const effectiveRemote = computed(() => requestedRemote.value && responsePaginated.value)
const defaultSorting = computed<SortingState>(() => {
  if (!capability.value?.dateFilter) return []
  if (!['document', 'inventory'].includes(capability.value.kind)) return []
  return [{ id: 'date', desc: true }]
})
const filterGuidance = computed(() => {
  if (capability.value?.requiredDateFilter === 'range' && (!startDate.value || !endDate.value)) {
    return 'Select a start date and end date to load this report.'
  }
  if (capability.value?.requiredDateFilter === 'as-of' && !endDate.value) {
    return 'Select an end date to use as the as-of date for this report.'
  }
  return ''
})

function normalizeStatusFilter(value: unknown): WorkspaceStatusFilter {
  if (Array.isArray(value)) return value.map(String).filter(Boolean)
  if (typeof value === 'string' && value) return [value]
  return []
}

function currentPrimaryId() {
  return config.value?.primaryTabId ?? menuItem.value?.href ?? tabs.activePrimaryTabId
}

function persistListState(partial: Parameters<typeof tabs.updateListState>[1] = {}) {
  const activeSort = sorting.value[0]
  tabs.updateListState(currentPrimaryId(), {
    page: pagination.value.page,
    perPage: pagination.value.perPage,
    search: search.value,
    filters: {},
    sortBy: activeSort?.id ?? null,
    sortDirection: activeSort ? (activeSort.desc ? 'desc' : 'asc') : null,
    selectedIds: selectedIds.value,
    startDate: startDate.value,
    endDate: endDate.value,
    status: status.value,
    includeVoid: includeVoid.value,
    pagination: pagination.value,
    sorting: sorting.value,
    ...partial,
  })
}

function hydrateListState(primaryTabId: string) {
  const state = tabs.getListState(primaryTabId)
  const defaultDateRange = currentMonthDateRange()
  const usesDateRange = Boolean(capability.value?.dateFilter || capability.value?.requiredDateFilter)
  search.value = state.search
  startDate.value = usesDateRange ? state.startDate || defaultDateRange.startDate : state.startDate
  endDate.value = usesDateRange ? state.endDate || defaultDateRange.endDate : state.endDate
  status.value = normalizeStatusFilter(state.status)
  includeVoid.value = state.includeVoid
  sorting.value = state.sorting.length ? state.sorting : defaultSorting.value
  pagination.value = state.pagination
  selectedIds.value = state.selectedIds
}

function rowText(row: BackendResourceRow) {
  return Object.values(row)
    .filter((value) => typeof value !== 'object')
    .join(' ')
    .toLowerCase()
}

function dateValue(row: BackendResourceRow) {
  return String(row.document_date ?? row.date ?? row.transaction_date ?? row.created_at ?? '')
}

function statusValue(row: BackendResourceRow) {
  const value = row.status ?? row.state ?? row.is_active
  if (typeof value === 'boolean') return value ? 'active' : 'inactive'
  return String(value ?? '').toLowerCase()
}

const filteredRows = computed(() => {
  if (effectiveRemote.value) return rows.value
  const query = search.value.trim().toLowerCase()
  return rows.value.filter((row) => {
    if (query && !rowText(row).includes(query)) return false
    if (status.value.length > 0 && !status.value.includes(statusValue(row))) return false
    const date = dateValue(row)
    if (startDate.value && date && date < startDate.value) return false
    if (endDate.value && date && date > endDate.value) return false
    return true
  })
})

function queryKey(key: keyof BackendQueryParamMap, fallback: string) {
  return capability.value?.queryParamMap?.[key] ?? fallback
}

function supportsRemote(feature: 'remoteSearch' | 'remoteFilters' | 'remoteSort') {
  return requestedRemote.value && capability.value?.[feature] !== false
}

function resetPageAndSelection() {
  pagination.value.page = 1
  selectedIds.value = []
  persistListState()
}

function requestParams() {
  const params: Record<string, unknown> = {}
  if (requestedRemote.value) {
    params[queryKey('page', 'page')] = pagination.value.page
    params[queryKey('perPage', 'per_page')] = pagination.value.perPage
    if (supportsRemote('remoteSearch') && search.value.trim()) params[queryKey('search', 'search')] = search.value.trim()
    if (supportsRemote('remoteFilters') && status.value.length === 1) params[queryKey('status', 'status')] = status.value[0]
    if (supportsRemote('remoteFilters') && startDate.value) params[queryKey('startDate', 'start_date')] = startDate.value
    if (supportsRemote('remoteFilters') && endDate.value) params[queryKey('endDate', 'end_date')] = endDate.value
    if (supportsRemote('remoteFilters') && capability.value?.includeVoidFilter) {
      params[queryKey('includeVoid', 'include_void')] = includeVoid.value
    }
    const activeSort = sorting.value[0]
    if (supportsRemote('remoteSort') && activeSort) {
      params[queryKey('sortBy', 'sort_by')] = activeSort.id
      params[queryKey('sortDirection', 'sort_direction')] = activeSort.desc ? 'desc' : 'asc'
    }
  }
  if (capability.value?.requiredDateFilter === 'range') {
    params[queryKey('startDate', 'start_date')] = startDate.value
    params[queryKey('endDate', 'end_date')] = endDate.value
  }
  if (capability.value?.requiredDateFilter === 'as-of') {
    params[queryKey('asOfDate', 'as_of_date')] = endDate.value
  }
  return params
}

async function load() {
  if (!menuItem.value) return
  if (filterGuidance.value) {
    rows.value = []
    error.value = null
    return
  }
  loading.value = true
  error.value = null
  try {
    const result = await listBackendResource(menuItem.value.endpoint, requestParams())
    rows.value = result.rows
    responsePaginated.value = result.pagination != null
    if (result.pagination) pagination.value = result.pagination
    else pagination.value = { ...pagination.value, total: rows.value.length, lastPage: Math.max(1, Math.ceil(rows.value.length / pagination.value.perPage)) }
    persistListState({ lastLoadedAt: new Date().toISOString() })
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : 'Unable to load workspace data.'
  } finally {
    loading.value = false
  }
}

function updateSearch(value: string) {
  search.value = value
  resetPageAndSelection()
  persistListState()
  if (supportsRemote('remoteSearch')) void load()
}

function updateDates(range: { startDate: string; endDate: string }) {
  startDate.value = range.startDate
  endDate.value = range.endDate
  resetPageAndSelection()
  persistListState()
  if (supportsRemote('remoteFilters') || capability.value?.requiredDateFilter) void load()
}

function updateStatus(value: WorkspaceStatusFilter) {
  status.value = value
  resetPageAndSelection()
  persistListState()
  if (supportsRemote('remoteFilters')) void load()
}

function updateIncludeVoid(value: boolean) {
  includeVoid.value = value
  resetPageAndSelection()
  persistListState()
  if (supportsRemote('remoteFilters')) void load()
}

function updatePage(page: number) {
  pagination.value.page = page
  selectedIds.value = []
  persistListState()
  if (effectiveRemote.value) void load()
}

function updatePerPage(perPage: number) {
  pagination.value.perPage = perPage
  resetPageAndSelection()
  persistListState()
  if (effectiveRemote.value) void load()
}

function updateSort(value: SortingState) {
  if (!effectiveRemote.value || !supportsRemote('remoteSort')) return
  sorting.value = value
  resetPageAndSelection()
  persistListState()
  void load()
}

function openCreate() {
  if (!config.value) return
  tabs.openCreateSecondaryTab(config.value.primaryTabId, { label: config.value.createLabel ?? 'Create' })
}

function openRowTab(key: string, row?: BackendResourceRow) {
  if (!config.value || !row) return
  const entity = { id: row.id, number: String(row.document_number ?? row.number ?? row.code ?? row.id) }
  const tab = key === 'edit'
    ? tabs.openEditSecondaryTab(config.value.primaryTabId, entity)
    : key === 'detail' || key === 'open'
      ? tabs.openDetailSecondaryTab(config.value.primaryTabId, entity)
      : null
  if (tab) tabs.updateDraftState(tab.id, row)
}

function closeSecondary(tabId?: string) {
  if (!config.value || !tabId) return
  tabs.closeSecondaryTab(config.value.primaryTabId, tabId)
}

function closeSecondaryAfterSave(tabId?: string) {
  if (!config.value || !tabId) return
  tabs.clearDraftState(tabId)
  tabs.closeSecondaryTab(config.value.primaryTabId, tabId)
}

function openBulkAction(payload: { key: string; selectedIds: string[] }) {
  if (payload.key !== 'void' || payload.selectedIds.length === 0) return
  bulkVoidOpen.value = true
  operationNotice.value = null
}

async function confirmBulkVoid(payload: { reason: string }) {
  if (!formConfig.value) return
  bulkVoidLoading.value = true
  const failures: string[] = []
  let successCount = 0
  for (const id of selectedIds.value) {
    try {
      await runBackendResourceAction(formConfig.value.endpoint, id, 'void', 'patch', { reason: payload.reason })
      successCount += 1
    } catch (reason) {
      failures.push(`${id}: ${extractLaravelErrors(reason).messages.join(', ')}`)
    }
  }
  await load()
  if (failures.length === 0) {
    selectedIds.value = []
    bulkVoidOpen.value = false
  }
  operationNotice.value = `${successCount} transaction(s) voided; ${failures.length} failed.`
  error.value = failures.join(' | ') || null
  bulkVoidLoading.value = false
  persistListState()
}

watch(
  () => menuItem.value?.href,
  () => {
    if (!menuItem.value) return
    tabs.ensureListSecondaryTab(menuItem.value.href)
    hydrateListState(menuItem.value.href)
    responsePaginated.value = false
    void load()
  },
  { immediate: true },
)

watch(selectedIds, () => persistListState(), { deep: true })

watch(
  filteredRows,
  (rows) => {
    if (effectiveRemote.value) return
    pagination.value = {
      ...pagination.value,
      total: rows.length,
      lastPage: Math.max(1, Math.ceil(rows.length / pagination.value.perPage)),
    }
    if (pagination.value.page > (pagination.value.lastPage ?? 1)) {
      pagination.value = { ...pagination.value, page: pagination.value.lastPage ?? 1 }
    }
    persistListState()
  },
)
</script>

<template>
  <WorkspaceListPage
    v-if="config && menuItem"
    v-model:selected-ids="selectedIds"
    :config="config"
    :rows="filteredRows"
    :loading="loading"
    :error="error"
    :search="search"
    :start-date="startDate"
    :end-date="endDate"
    :status="status"
    :include-void="includeVoid"
    :show-include-void="Boolean(capability?.includeVoidFilter)"
    :pagination="pagination"
    :remote-pagination="effectiveRemote"
    :sorting="sorting"
    :remote-sort="effectiveRemote && supportsRemote('remoteSort')"
    @refresh="load"
    @search="updateSearch"
    @date-change="updateDates"
    @status-change="updateStatus"
    @include-void-change="updateIncludeVoid"
    @page-change="updatePage"
    @per-page-change="updatePerPage"
    @sort-change="updateSort"
    @action-click="(payload) => payload.key === 'create' ? openCreate() : openRowTab(payload.key, payload.row)"
    @bulk-action-click="openBulkAction"
  >
    <template #before-table>
      <div v-if="operationNotice" class="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-700">{{ operationNotice }}</div>
      <div v-if="filterGuidance" class="rounded-2xl border border-slate-200 bg-slate-50/40 px-5 py-4 text-sm font-semibold text-slate-600">
        {{ filterGuidance }}
      </div>
    </template>

    <template #toolbar-right>
      <span class="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600">
        {{ effectiveRemote ? pagination.total : filteredRows.length }} rows
      </span>
    </template>

    <template #secondary="{ tab }">
      <BackendResourceForm
        v-if="formConfig && tab && !formConfig.skippedReason"
        :config="formConfig"
        :primary-tab-id="config.primaryTabId"
        :tab="tab"
        @saved="load"
        @close="closeSecondaryAfterSave(tab?.id)"
      />
      <div v-else class="space-y-4">
        <div>
          <p class="text-sm font-semibold text-[#1d81af]">{{ menuItem.module }}</p>
          <h1 class="mt-2 text-2xl font-bold tracking-tight text-slate-950">
            {{ tab?.mode === 'create' ? `Create ${menuItem.label}` : `${menuItem.label} ${tab?.entityNumber ?? ''}` }}
          </h1>
          <p class="mt-2 text-sm leading-6 text-slate-500">
            {{ formConfig?.skippedReason ?? 'Endpoint belum tersedia untuk form input modul ini.' }}
          </p>
        </div>
        <BaseButton variant="secondary" size="md" @click="closeSecondary(tab?.id)">
          Back to List
        </BaseButton>
      </div>
    </template>
  </WorkspaceListPage>
  <VoidTransactionDialog
    :open="bulkVoidOpen"
    :loading="bulkVoidLoading"
    :transaction-number="`${selectedIds.length} selected ${formConfig?.title ?? 'transaction'} record(s)`"
    @close="bulkVoidOpen = false"
    @confirm="confirmBulkVoid"
  />
</template>
