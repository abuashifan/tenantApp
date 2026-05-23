<script setup lang="ts">
import { computed, h, ref, watch } from 'vue'
import { ChevronDown, ChevronRight } from 'lucide-vue-next'
import type { ColumnDef } from '@tanstack/vue-table'

import WorkspaceListPage from '@/components/workspace/WorkspaceListPage.vue'
import { useWorkspaceList } from '@/composables/useWorkspaceList'
import { chartOfAccountsConfig } from '@/features/accounting/chart-of-accounts/chartOfAccounts.config'
import {
  listChartOfAccounts,
  type ChartOfAccountRow,
} from '@/features/accounting/chart-of-accounts/chartOfAccounts.service'
import ChartOfAccountsDrawer from '@/features/accounting/chart-of-accounts/ChartOfAccountsDrawer.vue'
import type { WorkspaceListConfig } from '@/types/workspace'

type CoaNode = ChartOfAccountRow & { level: number; hasChildren: boolean }

const list = useWorkspaceList<ChartOfAccountRow>({
  config: chartOfAccountsConfig,
  fetcher: listChartOfAccounts,
  clientFilter: true,
})

const accountType = ref<string>('')
const activeFilter = ref<string>('active')

const expandedIds = ref<Set<string>>(new Set())
const drawerOpen = ref(false)
const drawerMode = ref<'create' | 'edit'>('create')
const editingAccount = ref<ChartOfAccountRow | null>(null)

function accountMatchesSearch(row: ChartOfAccountRow, query: string) {
  const q = query.toLowerCase()
  return row.code.toLowerCase().includes(q) || row.name.toLowerCase().includes(q)
}

function buildChildrenMap(rows: ChartOfAccountRow[]) {
  const byParent = new Map<string | null, ChartOfAccountRow[]>()
  for (const row of rows) {
    const key = row.parentId
    const current = byParent.get(key) ?? []
    current.push(row)
    byParent.set(key, current)
  }
  return byParent
}

function flattenTree(rows: ChartOfAccountRow[], query: string) {
  const byParent = buildChildrenMap(rows)
  const roots = byParent.get(null) ?? []

  const matchingIds = new Set<string>()
  const parentById = new Map<string, string | null>()
  for (const row of rows) parentById.set(row.id, row.parentId)

  if (query.trim()) {
    for (const row of rows) {
      if (!accountMatchesSearch(row, query)) continue
      matchingIds.add(row.id)
      let pid = parentById.get(row.id) ?? null
      while (pid) {
        matchingIds.add(pid)
        pid = parentById.get(pid) ?? null
      }
    }
  }

  const result: CoaNode[] = []

  function walk(node: ChartOfAccountRow, level: number) {
    const children = byParent.get(node.id) ?? []
    const hasChildren = children.length > 0
    const isVisibleBySearch = matchingIds.size === 0 || matchingIds.has(node.id)
    if (isVisibleBySearch) {
      result.push({ ...node, level, hasChildren })
    }

    const shouldExpand =
      matchingIds.size > 0
        ? true
        : expandedIds.value.has(node.id)

    if (!hasChildren || !shouldExpand) return
    for (const child of children) walk(child, level + 1)
  }

  for (const root of roots) walk(root, 0)
  return result
}

const tableRows = computed<CoaNode[]>(() => {
  const query = list.filters.value.search
  return flattenTree(list.rows.value, query)
})

const totalCount = computed(() => list.rows.value.length)

watch(accountType, async (value) => {
  if (value) list.setFilter('account_type', value)
  else list.setFilter('account_type', undefined)
  await list.fetchRows()
})

watch(activeFilter, async (value) => {
  if (value === 'all') list.setFilter('is_active', undefined)
  else list.setFilter('is_active', value === 'active')
  await list.fetchRows()
})

function toggleExpand(row: CoaNode) {
  const next = new Set(expandedIds.value)
  if (next.has(row.id)) next.delete(row.id)
  else next.add(row.id)
  expandedIds.value = next
}

function openCreateDrawer() {
  drawerMode.value = 'create'
  editingAccount.value = null
  drawerOpen.value = true
}

function openEditDrawer(row: ChartOfAccountRow) {
  drawerMode.value = 'edit'
  editingAccount.value = row
  drawerOpen.value = true
}

async function handleSearch(value: string) {
  list.setSearch(value)
  // client filter only, no fetch required
}

async function handleRefresh() {
  await list.refresh()
}

const columns = computed<ColumnDef<CoaNode, unknown>[]>(() => [
  {
    accessorKey: 'code',
    header: 'Account Code',
    cell: ({ row }) => {
      const original = row.original
      const pad = `${original.level * 16}px`
      const icon = original.hasChildren
        ? (expandedIds.value.has(original.id) ? ChevronDown : ChevronRight)
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
  ...chartOfAccountsConfig,
  columns: columns.value,
  rowKey: 'id',
  selectable: false,
}))
</script>

<template>
  <WorkspaceListPage
    :config="config"
    :rows="tableRows"
    :loading="list.loading.value"
    :error="list.error.value"
    :search="list.filters.value.search"
    :start-date="list.filters.value.startDate"
    :end-date="list.filters.value.endDate"
    :status="list.status.value"
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
            <option value="asset">Asset</option>
            <option value="liability">Liability</option>
            <option value="equity">Equity</option>
            <option value="revenue">Revenue</option>
            <option value="expense">Expense</option>
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
    @save="drawerOpen = false"
  />
</template>
