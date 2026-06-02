<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { Printer, RefreshCw, Upload } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

import BaseButton from '@/components/ui/BaseButton.vue'
import DateInput from '@/components/ui/DateInput.vue'
import DataTable from '@/components/table/DataTable.vue'
import ToneBadge from '@/components/ui/ToneBadge.vue'
import WorkspaceEmptyState from '@/components/workspace/WorkspaceEmptyState.vue'
import { getTrialBalance, reportErrorMessage, type TrialBalanceRow, type TrialBalanceResult } from './trialBalance.service'
import { useWorkspaceTabsStore } from '@/stores/workspaceTabsStore'

type AccountTypeFilter = '' | TrialBalanceRow['account_type']

const router = useRouter()
const tabs = useWorkspaceTabsStore()
const startDate = ref('2026-01-01')
const endDate = ref('2026-01-31')
const search = ref('')
const accountType = ref<AccountTypeFilter>('')
const includeZero = ref(false)
const result = ref<TrialBalanceResult | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const rows = computed(() => (result.value?.accounts ?? []).filter((row) => {
  const term = search.value.trim().toLowerCase()
  return !term || `${row.account_code} ${row.account_name}`.toLowerCase().includes(term)
}))
const totals = computed(() => result.value?.totals ?? { ending_debit: 0, ending_credit: 0, is_balanced: true })

function formatRupiah(value: number) {
  return `Rp ${new Intl.NumberFormat('id-ID').format(value)}`
}

function dashIfZero(value: number) {
  return value === 0 ? '-' : formatRupiah(value)
}

function toneForType(type: TrialBalanceRow['account_type']) {
  if (type === 'asset' || type === 'expense') return 'green'
  if (type === 'liability' || type === 'equity') return 'lime'
  return 'blue'
}

async function load() {
  loading.value = true
  error.value = null
  try {
    result.value = await getTrialBalance({
      start_date: startDate.value,
      end_date: endDate.value,
      account_type: accountType.value || undefined,
      include_zero_balance: includeZero.value,
    })
  } catch (cause) {
    error.value = reportErrorMessage(cause, 'Unable to load trial balance.')
    result.value = null
  } finally {
    loading.value = false
  }
}

function resetFilters() {
  search.value = ''
  startDate.value = '2026-01-01'
  endDate.value = '2026-01-31'
  accountType.value = ''
  includeZero.value = false
  void load()
}

function openGeneralLedger() {
  tabs.openPrimaryTab({ id: '/reports/general-ledger', label: 'General Ledger', path: '/reports/general-ledger', closable: true })
  void router.push('/reports/general-ledger')
}

const columns = computed<ColumnDef<TrialBalanceRow, unknown>[]>(() => [
  { accessorKey: 'account_code', header: 'Account Code', cell: ({ row }) => row.original.account_code },
  { accessorKey: 'account_name', header: 'Account Name', cell: ({ row }) => row.original.account_name },
  { accessorKey: 'account_type', header: 'Type', cell: ({ row }) => h(ToneBadge, { tone: toneForType(row.original.account_type) }, () => row.original.account_type) },
  { accessorKey: 'ending_debit', header: 'Debit', cell: ({ row }) => dashIfZero(row.original.ending_debit) },
  { accessorKey: 'ending_credit', header: 'Credit', cell: ({ row }) => dashIfZero(row.original.ending_credit) },
  { accessorKey: 'ending_balance', header: 'Net Balance', cell: ({ row }) => formatRupiah(row.original.ending_balance) },
])

onMounted(load)
</script>

<template>
  <div class="workspace-card tablet-workspace-card tablet-workspace-card-gap flex min-w-0 flex-col gap-4 rounded-b-3xl rounded-tr-3xl border border-slate-200 bg-white p-4 shadow-sm lg:p-5">
    <div class="border-b border-slate-100 pb-4">
      <div class="flex min-w-0 flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <h1 class="text-2xl font-black tracking-tight text-slate-950">Trial Balance</h1>
        <div class="flex flex-wrap gap-2">
          <BaseButton variant="secondary" size="md"><Upload class="h-4 w-4" />Export</BaseButton>
          <BaseButton variant="secondary" size="md"><Printer class="h-4 w-4" />Print</BaseButton>
          <BaseButton variant="secondary" size="md" @click="load"><RefreshCw class="h-4 w-4" />Refresh</BaseButton>
        </div>
      </div>
    </div>
    <div class="rounded-2xl border border-slate-200 bg-slate-50/40 p-4">
      <div class="flex min-w-0 flex-col gap-3 xl:flex-row xl:items-end">
        <label class="block min-w-0 space-y-1.5 xl:flex-1">
          <span class="text-xs font-bold text-slate-500">Search</span>
          <input v-model="search" class="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" placeholder="Search account code or name..." />
        </label>
        <label class="block space-y-1.5 xl:w-[160px]">
          <span class="text-xs font-bold text-slate-500">Start Date</span>
          <DateInput v-model="startDate" />
        </label>
        <label class="block space-y-1.5 xl:w-[160px]">
          <span class="text-xs font-bold text-slate-500">End Date</span>
          <DateInput v-model="endDate" />
        </label>
        <label class="block space-y-1.5 xl:w-[160px]">
          <span class="text-xs font-bold text-slate-500">Account Type</span>
          <select v-model="accountType" class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold">
            <option value="">All</option><option value="asset">Asset</option><option value="liability">Liability</option>
            <option value="equity">Equity</option><option value="revenue">Revenue</option><option value="expense">Expense</option>
          </select>
        </label>
        <BaseButton variant="secondary" size="md" @click="resetFilters">Reset</BaseButton>
        <BaseButton variant="primary" size="md" @click="load">Apply</BaseButton>
      </div>
    </div>
    <p v-if="error" class="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">{{ error }}</p>
    <WorkspaceEmptyState v-if="!loading && rows.length === 0" title="No trial balance rows" description="Try adjusting filters or click Apply." />
    <div v-else class="space-y-2">
      <DataTable
        :columns="columns"
        :data="rows"
        :loading="loading"
        :selectable="false"
        :row-clickable="true"
        empty-title="No rows"
        empty-description="No rows match your filter."
        @row-click="openGeneralLedger"
      />
      <div class="flex min-w-0 flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
        <span class="font-semibold text-slate-600">Accounts: {{ rows.length }}</span>
        <span class="font-extrabold tabular-nums text-slate-900">
          Total Debit {{ formatRupiah(totals.ending_debit) }} | Total Credit {{ formatRupiah(totals.ending_credit) }}
          | {{ totals.is_balanced ? 'Balanced' : 'Unbalanced' }}
        </span>
      </div>
    </div>
  </div>
</template>
