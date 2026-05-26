<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import BaseButton from '@/components/ui/BaseButton.vue'
import VoidTransactionDialog from '@/components/dialog/VoidTransactionDialog.vue'
import WorkspaceListPage from '@/components/workspace/WorkspaceListPage.vue'
import BackendResourceForm from './BackendResourceForm.vue'
import { listBackendResource, type BackendResourceRow } from './backendResource.service'
import { makeBackendResourceConfig, resourceCapability } from './backendResource.config'
import { backendResourceFormConfigs } from './backendResource.form.config'
import { runBackendResourceAction, extractLaravelErrors } from './backendResourceForm.service'
import { findSidebarMenuItem } from '@/navigation/sidebar'
import { useWorkspaceTabsStore } from '@/stores/workspaceTabsStore'

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
const status = ref('')
const selectedIds = ref<string[]>([])
const bulkVoidOpen = ref(false)
const bulkVoidLoading = ref(false)
const operationNotice = ref<string | null>(null)
const filterGuidance = computed(() => {
  if (capability.value?.requiredDateFilter === 'range' && (!startDate.value || !endDate.value)) {
    return 'Select a start date and end date to load this report.'
  }
  if (capability.value?.requiredDateFilter === 'as-of' && !endDate.value) {
    return 'Select an end date to use as the as-of date for this report.'
  }
  return ''
})

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
  const query = search.value.trim().toLowerCase()
  return rows.value.filter((row) => {
    if (query && !rowText(row).includes(query)) return false
    if (status.value && statusValue(row) !== status.value) return false
    const date = dateValue(row)
    if (startDate.value && date && date < startDate.value) return false
    if (endDate.value && date && date > endDate.value) return false
    return true
  })
})

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
    const params: Record<string, unknown> = {}
    if (capability.value?.requiredDateFilter === 'range') {
      params.start_date = startDate.value
      params.end_date = endDate.value
    }
    if (capability.value?.requiredDateFilter === 'as-of') {
      params.as_of_date = endDate.value
    }
    rows.value = await listBackendResource(menuItem.value.endpoint, params)
  } catch (reason) {
    error.value = reason instanceof Error ? reason.message : 'Unable to load workspace data.'
  } finally {
    loading.value = false
  }
}

function resetFilters() {
  search.value = ''
  startDate.value = ''
  endDate.value = ''
  status.value = ''
  if (!filterGuidance.value) void load()
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
}

watch(
  () => menuItem.value?.href,
  () => {
    if (!menuItem.value) return
    tabs.ensureListSecondaryTab(menuItem.value.href)
    resetFilters()
    void load()
  },
  { immediate: true },
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
    @refresh="load"
    @search="search = $event"
    @date-change="({ startDate: from, endDate: to }) => { startDate = from; endDate = to; load() }"
    @status-change="status = $event"
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
      <span class="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600">
        {{ filteredRows.length }} rows
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
