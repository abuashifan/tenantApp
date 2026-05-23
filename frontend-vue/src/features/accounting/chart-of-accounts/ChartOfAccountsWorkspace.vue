<script setup lang="ts">
import { computed, h, ref } from 'vue'
import { ChevronDown, ChevronRight } from 'lucide-vue-next'
import type { ColumnDef } from '@tanstack/vue-table'

import WorkspaceListPage from '@/components/workspace/WorkspaceListPage.vue'
import { chartOfAccountsConfig } from '@/features/accounting/chart-of-accounts/chartOfAccounts.config'
import ChartOfAccountsDrawer from '@/features/accounting/chart-of-accounts/ChartOfAccountsDrawer.vue'
import type { WorkspaceListConfig } from '@/types/workspace'
import { useMockAccountingDataStore, type MockChartOfAccount, type MockChartOfAccountType } from '@/stores/mockAccountingDataStore'

type CoaNode = MockChartOfAccount & { hasChildren: boolean }

const mock = useMockAccountingDataStore()

const accountType = computed({
  get: () => mock.coaFilters.type,
  set: (value: MockChartOfAccountType | '') => mock.setCoaTypeFilter(value),
})
const activeFilter = computed({
  get: () => mock.coaFilters.active,
  set: (value: 'active' | 'inactive' | 'all') => mock.setCoaActiveFilter(value),
})

const expandedIds = ref<Set<string>>(new Set())
const drawerOpen = ref(false)
const drawerMode = ref<'create' | 'edit'>('create')
const editingAccount = ref<MockChartOfAccount | null>(null)

function buildChildrenMap(rows: MockChartOfAccount[]) {
  const byParent = new Map<string | null, MockChartOfAccount[]>()
  for (const row of rows) {
    const key = row.parentCode
    const current = byParent.get(key) ?? []
    current.push(row)
    byParent.set(key, current)
  }
  return byParent
}

function flattenTree(rows: MockChartOfAccount[]) {
  const byParent = buildChildrenMap(rows)
  const roots = byParent.get(null) ?? []

  const result: CoaNode[] = []

  function walk(node: MockChartOfAccount) {
    const children = byParent.get(node.code) ?? []
    const hasChildren = children.length > 0
    result.push({ ...node, hasChildren })
    const shouldExpand = expandedIds.value.has(node.code)

    if (!hasChildren || !shouldExpand) return
    for (const child of children) walk(child)
  }

  for (const root of roots) walk(root)
  return result
}

const tableRows = computed<CoaNode[]>(() => {
  return flattenTree(mock.filteredChartOfAccounts)
})

const totalCount = computed(() => mock.filteredChartOfAccounts.length)

function toggleExpand(row: CoaNode) {
  const next = new Set(expandedIds.value)
  if (next.has(row.code)) next.delete(row.code)
  else next.add(row.code)
  expandedIds.value = next
}

function openCreateDrawer() {
  drawerMode.value = 'create'
  editingAccount.value = null
  drawerOpen.value = true
}

function openEditDrawer(row: MockChartOfAccount) {
  drawerMode.value = 'edit'
  editingAccount.value = row
  drawerOpen.value = true
}

function handleSave(payload: Record<string, unknown>) {
  const code = String(payload.account_code ?? '').trim()
  const name = String(payload.account_name ?? '').trim()
  const type = payload.account_type as MockChartOfAccountType | undefined
  const parentCode = (payload.parent_code as string | null | undefined) ?? null
  const normalBalance = (payload.normal_balance as MockChartOfAccount['normalBalance'] | undefined) ?? 'Debit'
  const isActive = Boolean(payload.is_active)

  if (!code || !name || !type) return

  if (drawerMode.value === 'create') {
    const parent = parentCode ? mock.chartOfAccounts.find((r) => r.code === parentCode) ?? null : null
    const level = parent ? parent.level + 1 : 0
    mock.addMockCoa({
      code,
      name,
      type,
      normalBalance,
      parentCode: parentCode || null,
      level,
      isGroup: false,
      isActive,
      isSystemLocked: false,
      balance: 0,
    })
  } else if (editingAccount.value) {
    mock.updateMockCoa(editingAccount.value.id, {
      name,
      type,
      normalBalance,
      parentCode: parentCode || null,
      isActive,
    })
  }
}

async function handleSearch(value: string) {
  mock.setCoaSearch(value)
}

async function handleRefresh() {
  // mock-only: no remote refresh
}

const columns = computed<ColumnDef<CoaNode, unknown>[]>(() => [
  {
    accessorKey: 'code',
    header: 'Account Code',
    cell: ({ row }) => {
      const original = row.original
      const pad = `${original.level * 16}px`
      const icon = original.hasChildren
        ? (expandedIds.value.has(original.code) ? ChevronDown : ChevronRight)
        : null

      return h(
        'div',
        { class: 'flex items-center gap-2', style: { paddingLeft: pad } },
        [
          icon
            ? h(
                'button',
                {
                  type: 'button',
                  class:
                    'grid h-6 w-6 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                  onClick: () => toggleExpand(original),
                },
                [h(icon, { class: 'h-4 w-4' })],
              )
            : h('span', { class: 'h-6 w-6' }),
          h('span', { class: 'font-semibold text-slate-900' }, original.code),
        ],
      )
    },
  },
  {
    accessorKey: 'name',
    header: 'Account Name',
    cell: ({ row }) => row.original.name,
  },
  {
    accessorKey: 'type',
    header: 'Account Type',
    cell: ({ row }) => row.original.type,
  },
  {
    accessorKey: 'balance',
    header: 'Balance',
    cell: ({ row }) => h('span', { class: 'tabular-nums' }, new Intl.NumberFormat('id-ID').format(row.original.balance)),
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) =>
      h(
        'button',
        {
          type: 'button',
          class: 'text-xs font-bold text-slate-500 hover:text-slate-900',
          onClick: () => openEditDrawer(row.original),
        },
        'Edit',
      ),
    enableSorting: false,
  },
])

const config = computed<WorkspaceListConfig<CoaNode>>(() => ({
  ...(chartOfAccountsConfig as unknown as WorkspaceListConfig<CoaNode>),
  columns: columns.value,
  rowKey: 'id',
  selectable: false,
}))
</script>

<template>
  <WorkspaceListPage
    :config="config"
    :rows="tableRows"
    :loading="false"
    :error="null"
    :search="mock.coaFilters.search"
    :start-date="''"
    :end-date="''"
    :status="''"
    :selected-ids="[]"
    @refresh="handleRefresh"
    @search="handleSearch"
    @action-click="(p) => (p.key === 'create' ? openCreateDrawer() : undefined)"
  >
    <template #toolbar-right>
      <div class="flex flex-wrap items-center gap-2">
        <div class="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-extrabold text-slate-600">
          Total: {{ totalCount }}
        </div>
      </div>
    </template>

    <template #advanced-filters>
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label class="block space-y-1.5">
          <span class="text-xs font-bold text-slate-500">Account Type</span>
          <select
            v-model="accountType"
            class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#24a1db] focus:ring-4 focus:ring-[#e9f6fb]"
          >
            <option value="">All</option>
            <option value="Kas & Bank">Kas & Bank</option>
            <option value="Piutang">Piutang</option>
            <option value="Persediaan">Persediaan</option>
            <option value="Aset Tetap">Aset Tetap</option>
            <option value="Hutang">Hutang</option>
            <option value="Modal">Modal</option>
            <option value="Pendapatan">Pendapatan</option>
            <option value="Beban">Beban</option>
          </select>
        </label>

        <label class="block space-y-1.5">
          <span class="text-xs font-bold text-slate-500">Status</span>
          <select
            v-model="activeFilter"
            class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#24a1db] focus:ring-4 focus:ring-[#e9f6fb]"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="all">All</option>
          </select>
        </label>

        <div class="flex items-end justify-start gap-2">
          <button
            type="button"
            class="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 hover:bg-slate-50"
            @click="openCreateDrawer"
          >
            Add
          </button>
        </div>
      </div>
    </template>
  </WorkspaceListPage>

  <ChartOfAccountsDrawer
    :open="drawerOpen"
    :mode="drawerMode"
    :account="editingAccount"
    @close="drawerOpen = false"
    @save="(payload) => { handleSave(payload); drawerOpen = false }"
  />
</template>
