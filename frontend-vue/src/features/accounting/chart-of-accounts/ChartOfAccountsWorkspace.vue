<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue'
import { ChevronDown, ChevronRight } from 'lucide-vue-next'
import type { ColumnDef } from '@tanstack/vue-table'

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
import type { WorkspaceListConfig } from '@/types/workspace'
import { useWorkspaceTabsStore } from '@/stores/workspaceTabsStore'

type CoaNode = ChartOfAccountRow & { hasChildren: boolean; level: number }

const tabs = useWorkspaceTabsStore()
tabs.ensureListSecondaryTab(chartOfAccountsConfig.primaryTabId, {
  label: chartOfAccountsConfig.listTabLabel ?? chartOfAccountsConfig.title,
})

const accounts = ref<ChartOfAccountRow[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const search = ref('')
const accountType = ref('')
const activeFilter = ref<'active' | 'inactive' | 'all'>('active')
const expandedIds = ref<Set<string>>(new Set())
const secondaryTabs = computed(() => tabs.secondaryTabsByPrimaryId[chartOfAccountsConfig.primaryTabId] ?? [])
const activeSecondaryId = computed(
  () =>
    tabs.activeSecondaryTabIdByPrimaryId[chartOfAccountsConfig.primaryTabId] ??
    `${chartOfAccountsConfig.primaryTabId}::list`,
)
const activeSecondary = computed(() => secondaryTabs.value.find((tab) => tab.id === activeSecondaryId.value) ?? null)
const editingAccount = computed(() => accounts.value.find((row) => row.id === activeSecondary.value?.entityId) ?? null)

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

async function load() {
  loading.value = true
  error.value = null
  try {
    accounts.value = await listChartOfAccounts()
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
  tabs.openCreateSecondaryTab(chartOfAccountsConfig.primaryTabId, { label: chartOfAccountsConfig.createLabel ?? 'Add Account' })
}

function openEditForm(row: ChartOfAccountRow) {
  tabs.openEditSecondaryTab(chartOfAccountsConfig.primaryTabId, { id: row.id, number: row.code })
}

async function handleSave(payload: Record<string, unknown>) {
  const savePayload = payload as SaveChartOfAccountPayload
  error.value = null
  try {
    if (activeSecondary.value?.mode === 'edit' && editingAccount.value) {
      await updateChartOfAccount(editingAccount.value.id, savePayload)
    } else {
      await createChartOfAccount(savePayload)
    }
    await load()
    closeActiveForm()
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Unable to save account.'
  }
}

function closeActiveForm() {
  const tab = activeSecondary.value
  if (!tab?.closable) return
  tabs.clearDraftState(tab.id)
  tabs.closeSecondaryTab(chartOfAccountsConfig.primaryTabId, tab.id)
}

const columns = computed<ColumnDef<CoaNode, unknown>[]>(() => [
  {
    accessorKey: 'code',
    header: 'Account Code',
    cell: ({ row }) => h('div', { class: 'flex items-center gap-2', style: { paddingLeft: `${row.original.level * 16}px` } }, [
      row.original.hasChildren
        ? h('button', { type: 'button', class: 'grid h-6 w-6 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600', onClick: () => toggleExpand(row.original) },
            [h(expandedIds.value.has(row.original.id) ? ChevronDown : ChevronRight, { class: 'h-4 w-4' })])
        : h('span', { class: 'h-6 w-6' }),
      h('span', { class: 'font-semibold text-slate-900' }, row.original.code),
    ]),
  },
  { accessorKey: 'name', header: 'Account Name', cell: ({ row }) => row.original.name },
  { accessorKey: 'type', header: 'Account Type', cell: ({ row }) => row.original.type },
  { accessorKey: 'balance', header: 'Balance', cell: ({ row }) => new Intl.NumberFormat('id-ID').format(row.original.balance) },
  { id: 'actions', header: '', cell: ({ row }) => h('button', { type: 'button', class: 'text-xs font-bold text-slate-500 hover:text-slate-900', onClick: () => openEditForm(row.original) }, 'Edit') },
])

const config = computed<WorkspaceListConfig<CoaNode>>(() => ({ ...chartOfAccountsConfig, columns: columns.value, rowKey: 'id' }))

onMounted(load)
</script>

<template>
  <WorkspaceListPage
    :config="config"
    :rows="tableRows"
    :loading="loading"
    :error="error"
    :search="search"
    :start-date="''"
    :end-date="''"
    :status="''"
    :selected-ids="[]"
    @refresh="load"
    @search="search = $event"
    @action-click="(payload) => (payload.key === 'create' ? openCreateForm() : undefined)"
  >
    <template #toolbar-right>
      <div class="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-extrabold text-slate-600">
        Total: {{ filteredAccounts.length }}
      </div>
    </template>
    <template #advanced-filters>
      <div class="grid gap-3 sm:grid-cols-2">
        <label class="block space-y-1.5">
          <span class="text-xs font-bold text-slate-500">Account Type</span>
          <select v-model="accountType" class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700">
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
          <select v-model="activeFilter" class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="all">All</option>
          </select>
        </label>
      </div>
    </template>
    <template #secondary>
      <ChartOfAccountFormPanel
        :mode="activeSecondary?.mode === 'edit' ? 'edit' : 'create'"
        :account="editingAccount"
        :accounts="accounts"
        @cancel="closeActiveForm"
        @save="handleSave"
      />
    </template>
  </WorkspaceListPage>
</template>
