<script setup lang="ts">
import { computed, h, onMounted, onUnmounted, ref, watch } from 'vue'
import { ChevronDown, ChevronRight } from 'lucide-vue-next'
import type { ColumnDef } from '@tanstack/vue-table'

import UnsavedChangesDialog from '@/components/dialog/UnsavedChangesDialog.vue'
import WorkspaceListPage from '@/components/workspace/WorkspaceListPage.vue'
import ChartOfAccountFormPanel from '@/features/accounting/chart-of-accounts/ChartOfAccountFormPanel.vue'
import { chartOfAccountsConfig } from '@/features/accounting/chart-of-accounts/chartOfAccounts.config'
import {
  createChartOfAccount,
  listChartOfAccounts,
  updateChartOfAccount,
  type ChartOfAccountRow,
  type SaveChartOfAccountPayload,
} from '@/features/accounting/chart-of-accounts/chartOfAccounts.service'
import { normalizeApiError } from '@/services/api'
import type { WorkspaceListConfig, WorkspacePagination } from '@/types/workspace'
import { useWorkspaceTabsStore } from '@/stores/workspaceTabsStore'

type CoaNode = ChartOfAccountRow & { hasChildren: boolean; level: number }
type ChartOfAccountDraft = {
  accountCode: string
  accountName: string
  accountType: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
  parentAccountId: string
  normalBalance: 'debit' | 'credit'
  isActive: boolean
}

const tabs = useWorkspaceTabsStore()
tabs.ensureListSecondaryTab(chartOfAccountsConfig.primaryTabId, {
  label: chartOfAccountsConfig.listTabLabel ?? chartOfAccountsConfig.title,
})

const accounts = ref<ChartOfAccountRow[]>([])
const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const formErrors = ref<string[]>([])
const cancelConfirmOpen = ref(false)
const formPanel = ref<InstanceType<typeof ChartOfAccountFormPanel> | null>(null)
const savedListState = tabs.getListState(chartOfAccountsConfig.primaryTabId)
const search = ref(savedListState.search)
const accountType = ref(String(savedListState.filters.accountType ?? ''))
const activeFilter = ref<'active' | 'inactive' | 'all'>(
  savedListState.status === 'inactive' || savedListState.status === 'all' ? savedListState.status : 'active',
)
const selectedIds = ref<string[]>(savedListState.selectedIds)
const pagination = ref<WorkspacePagination>(savedListState.pagination)
const expandedIds = ref<Set<string>>(new Set())
const secondaryTabs = computed(() => tabs.secondaryTabsByPrimaryId[chartOfAccountsConfig.primaryTabId] ?? [])
const activeSecondaryId = computed(
  () =>
    tabs.activeSecondaryTabIdByPrimaryId[chartOfAccountsConfig.primaryTabId] ??
    `${chartOfAccountsConfig.primaryTabId}::list`,
)
const activeSecondary = computed(() => secondaryTabs.value.find((tab) => tab.id === activeSecondaryId.value) ?? null)
const editingAccount = computed(() => accounts.value.find((row) => row.id === activeSecondary.value?.entityId) ?? null)
const activeFormDirty = computed(() => activeSecondary.value?.dirty ?? false)
const registeredSaveHandlerIds = new Set<string>()

const filteredAccounts = computed(() => accounts.value.filter((row) => {
  const term = search.value.trim().toLowerCase()
  const matchesSearch = !term || `${row.code} ${row.name}`.toLowerCase().includes(term)
  const matchesType = !accountType.value || row.type === accountType.value
  const matchesStatus = activeFilter.value === 'all' || row.isActive === (activeFilter.value === 'active')
  return matchesSearch && matchesType && matchesStatus
}))

function flattenTree(rows: ChartOfAccountRow[]) {
  const visibleIds = new Set(rows.map((row) => row.id))
  const byParent = new Map<string | null, ChartOfAccountRow[]>()
  for (const row of rows) {
    const parent = row.parentId && visibleIds.has(row.parentId) ? row.parentId : null
    byParent.set(parent, [...(byParent.get(parent) ?? []), row])
  }
  const result: CoaNode[] = []
  const walk = (node: ChartOfAccountRow, level: number) => {
    const children = byParent.get(node.id) ?? []
    result.push({ ...node, hasChildren: children.length > 0, level })
    if (expandedIds.value.has(node.id)) children.forEach((child) => walk(child, level + 1))
  }
  ;(byParent.get(null) ?? []).forEach((row) => walk(row, 0))
  return result
}

const tableRows = computed(() => flattenTree(filteredAccounts.value))

function persistListState(partial: Partial<ReturnType<typeof tabs.getListState>> = {}) {
  tabs.updateListState(chartOfAccountsConfig.primaryTabId, {
    page: pagination.value.page,
    perPage: pagination.value.perPage,
    search: search.value,
    filters: { accountType: accountType.value },
    sortBy: null,
    sortDirection: null,
    selectedIds: selectedIds.value,
    startDate: '',
    endDate: '',
    status: activeFilter.value,
    includeVoid: false,
    pagination: pagination.value,
    sorting: [],
    ...partial,
  })
}

function resetListPage() {
  pagination.value = { ...pagination.value, page: 1 }
  selectedIds.value = []
}

async function load() {
  loading.value = true
  error.value = null
  try {
    accounts.value = await listChartOfAccounts()
    pagination.value = {
      ...pagination.value,
      total: tableRows.value.length,
      lastPage: Math.max(1, Math.ceil(tableRows.value.length / pagination.value.perPage)),
    }
    persistListState({ lastLoadedAt: new Date().toISOString() })
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Endpoint belum tersedia'
  } finally {
    loading.value = false
  }
}

function toggleExpand(row: CoaNode) {
  const next = new Set(expandedIds.value)
  if (next.has(row.id)) next.delete(row.id)
  else next.add(row.id)
  expandedIds.value = next
}

function openCreateForm() {
  formErrors.value = []
  tabs.openCreateSecondaryTab(chartOfAccountsConfig.primaryTabId, { label: chartOfAccountsConfig.createLabel ?? 'Add Account' })
}

function openEditForm(row: ChartOfAccountRow) {
  formErrors.value = []
  tabs.openEditSecondaryTab(chartOfAccountsConfig.primaryTabId, { id: row.id, number: row.code })
}

function updateSearch(value: string) {
  search.value = value
  resetListPage()
  persistListState()
}

function updateAccountType(value: string) {
  accountType.value = value
  resetListPage()
  persistListState()
}

function updateActiveFilter(value: 'active' | 'inactive' | 'all') {
  activeFilter.value = value
  resetListPage()
  persistListState()
}

function updatePage(page: number) {
  pagination.value = { ...pagination.value, page }
  selectedIds.value = []
  persistListState()
}

function updatePerPage(perPage: number) {
  pagination.value = { ...pagination.value, page: 1, perPage }
  selectedIds.value = []
  persistListState()
}

function draftPayload(draft: ChartOfAccountDraft): SaveChartOfAccountPayload {
  return {
    account_code: draft.accountCode,
    account_name: draft.accountName,
    account_type: draft.accountType,
    parent_account_id: draft.parentAccountId ? Number(draft.parentAccountId) : null,
    normal_balance: draft.normalBalance,
    is_active: draft.isActive,
  }
}

function validateDraft(draft: ChartOfAccountDraft) {
  const errors: string[] = []
  if (!draft.accountCode.trim()) errors.push('Account code is required')
  if (!draft.accountName.trim()) errors.push('Account name is required')
  return errors
}

async function saveTab(tabId: string, payload: SaveChartOfAccountPayload, closeAfterSave: boolean) {
  if (saving.value) return false
  formErrors.value = []
  error.value = null
  saving.value = true
  const tab = secondaryTabs.value.find((item) => item.id === tabId)
  try {
    if (tab?.mode === 'edit' && tab.entityId) {
      await updateChartOfAccount(tab.entityId, payload)
    } else {
      await createChartOfAccount(payload)
    }
    await load()
    tabs.clearDraftState(tabId)
    if (closeAfterSave) closeActiveForm()
    return true
  } catch (cause) {
    const apiError = normalizeApiError(cause)
    const fieldErrors = Object.values(apiError.errors ?? {}).flat()
    formErrors.value = fieldErrors.length ? fieldErrors : [apiError.message || 'Unable to save account.']
    tabs.activateSecondaryTab(chartOfAccountsConfig.primaryTabId, tabId)
    return false
  } finally {
    saving.value = false
  }
}

async function saveDraftTab(tabId: string) {
  const raw = tabs.draftStateBySecondaryTabId[tabId]
  if (!raw || typeof raw !== 'object') return false
  const draft = raw as ChartOfAccountDraft
  const validationErrors = validateDraft(draft)
  if (validationErrors.length) {
    formErrors.value = validationErrors
    tabs.activateSecondaryTab(chartOfAccountsConfig.primaryTabId, tabId)
    return false
  }
  return await saveTab(tabId, draftPayload(draft), false)
}

async function handleSave(payload: Record<string, unknown>) {
  const tab = activeSecondary.value
  if (!tab) return
  await saveTab(tab.id, payload as SaveChartOfAccountPayload, true)
}

function closeActiveForm() {
  formErrors.value = []
  const tab = activeSecondary.value
  if (!tab?.closable) return
  tabs.clearDraftState(tab.id)
  tabs.closeSecondaryTab(chartOfAccountsConfig.primaryTabId, tab.id)
}

function requestCancelForm() {
  if (activeFormDirty.value) {
    cancelConfirmOpen.value = true
    return
  }
  closeActiveForm()
}

function discardCancelForm() {
  cancelConfirmOpen.value = false
  closeActiveForm()
}

function saveCancelForm() {
  cancelConfirmOpen.value = false
  void formPanel.value?.submit()
}

function registerSaveHandlers() {
  const currentIds = new Set(
    secondaryTabs.value
      .filter((tab) => tab.closable && (tab.mode === 'create' || tab.mode === 'edit'))
      .map((tab) => tab.id),
  )

  for (const tabId of currentIds) {
    if (registeredSaveHandlerIds.has(tabId)) continue
    tabs.registerSecondarySaveHandler(tabId, () => saveDraftTab(tabId))
    registeredSaveHandlerIds.add(tabId)
  }

  for (const tabId of registeredSaveHandlerIds) {
    if (currentIds.has(tabId)) continue
    tabs.unregisterSecondarySaveHandler(tabId)
    registeredSaveHandlerIds.delete(tabId)
  }
}

watch(secondaryTabs, registerSaveHandlers, { immediate: true })

onUnmounted(() => {
  for (const tabId of registeredSaveHandlerIds) {
    tabs.unregisterSecondarySaveHandler(tabId)
  }
  registeredSaveHandlerIds.clear()
})

const columns = computed<ColumnDef<CoaNode, unknown>[]>(() => [
  {
    accessorKey: 'code',
    header: 'Account Code',
    cell: ({ row }) => h('div', { class: 'flex items-center gap-2', style: { paddingLeft: `${row.original.level * 16}px` } }, [
      row.original.hasChildren
        ? h('button', {
            type: 'button',
            class: 'grid h-6 w-6 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600',
            onClick: (event: MouseEvent) => {
              event.stopPropagation()
              toggleExpand(row.original)
            },
          }, [h(expandedIds.value.has(row.original.id) ? ChevronDown : ChevronRight, { class: 'h-4 w-4' })])
        : h('span', { class: 'h-6 w-6' }),
      h('span', { class: 'font-semibold text-slate-900' }, row.original.code),
    ]),
  },
  { accessorKey: 'name', header: 'Account Name', cell: ({ row }) => row.original.name },
  { accessorKey: 'type', header: 'Account Type', cell: ({ row }) => row.original.type },
  { accessorKey: 'balance', header: 'Balance', cell: ({ row }) => new Intl.NumberFormat('id-ID').format(row.original.balance) },
])

const config = computed<WorkspaceListConfig<CoaNode>>(() => ({ ...chartOfAccountsConfig, columns: columns.value, rowKey: 'id' }))

watch(
  tableRows,
  (rows) => {
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
  { immediate: true },
)

watch(selectedIds, () => persistListState(), { deep: true })

onMounted(load)
</script>

<template>
  <WorkspaceListPage
    v-model:selected-ids="selectedIds"
    :config="config"
    :rows="tableRows"
    :loading="loading"
    :error="error"
    :search="search"
    :start-date="''"
    :end-date="''"
    :status="[]"
    :pagination="pagination"
    @refresh="load"
    @search="updateSearch"
    @page-change="updatePage"
    @per-page-change="updatePerPage"
    @action-click="(payload) => (payload.key === 'create' ? openCreateForm() : payload.key === 'edit' && payload.row ? openEditForm(payload.row) : undefined)"
  >
    <template #toolbar-right>
      <div class="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-extrabold text-slate-600">
        Total: {{ filteredAccounts.length }}
      </div>
    </template>
    <template #advanced-filters>
      <div class="grid gap-3">
        <label class="block space-y-1.5">
          <span class="text-xs font-bold text-slate-500">Account Type</span>
          <select :value="accountType" class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700" @change="updateAccountType(($event.target as HTMLSelectElement).value)">
            <option value="">All</option>
            <option value="asset">Asset</option>
            <option value="liability">Liability</option>
            <option value="equity">Equity</option>
            <option value="revenue">Revenue</option>
            <option value="expense">Expense</option>
          </select>
        </label>
        <label class="block space-y-1.5">
          <span class="text-xs font-bold text-slate-500">Status</span>
          <select :value="activeFilter" class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700" @change="updateActiveFilter(($event.target as HTMLSelectElement).value as 'active' | 'inactive' | 'all')">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="all">All</option>
          </select>
        </label>
      </div>
    </template>
    <template #secondary>
      <ChartOfAccountFormPanel
        ref="formPanel"
        :key="activeSecondary?.id"
        :mode="activeSecondary?.mode === 'edit' ? 'edit' : 'create'"
        :account="editingAccount"
        :accounts="accounts"
        :secondary-tab-id="activeSecondary?.id ?? ''"
        :saving="saving"
        :server-errors="formErrors"
        @cancel="requestCancelForm"
        @save="handleSave"
      />
    </template>
  </WorkspaceListPage>

  <UnsavedChangesDialog
    :open="cancelConfirmOpen"
    @close="cancelConfirmOpen = false"
    @discard="discardCancelForm"
    @save="saveCancelForm"
  />
</template>
