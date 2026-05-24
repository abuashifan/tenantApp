<script setup lang="ts">
import { computed, h, onMounted } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { Printer, RefreshCw, Upload } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

import BaseButton from '@/components/ui/BaseButton.vue'
import DataTable from '@/components/table/DataTable.vue'
import ToneBadge from '@/components/ui/ToneBadge.vue'
import WorkspaceEmptyState from '@/components/workspace/WorkspaceEmptyState.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { useMockAccountingDataStore, type TrialBalanceRow, type TrialBalanceAccountType, type TrialBalanceBalanceView } from '@/stores/mockAccountingDataStore'
import { useWorkspaceTabsStore } from '@/stores/workspaceTabsStore'

const router = useRouter()
const tabs = useWorkspaceTabsStore()
const store = useMockAccountingDataStore()

onMounted(() => store.initLedgerLines())

const filters = computed(() => store.trialBalanceFiltersDraft)
const applied = computed(() => store.trialBalanceFilters)
const rows = computed(() => store.trialBalanceRows)
const totals = computed(() => store.trialBalanceTotals)

function formatRupiah(value: number) {
  return `Rp ${new Intl.NumberFormat('id-ID').format(value)}`
}

function dashIfZero(value: number) {
  return value === 0 ? '-' : formatRupiah(value)
}

function toneForType(type: TrialBalanceRow['accountType']) {
  if (type === 'Asset' || type === 'Expense') return 'green'
  if (type === 'Liability' || type === 'Equity') return 'lime'
  return 'blue'
}

const columns = computed<ColumnDef<TrialBalanceRow, unknown>[]>(() => [
  { accessorKey: 'accountCode', header: 'Account Code', cell: ({ row }) => row.original.accountCode },
  { accessorKey: 'accountName', header: 'Account Name', cell: ({ row }) => row.original.accountName },
  {
    accessorKey: 'accountType',
    header: 'Type',
    cell: ({ row }) => h(ToneBadge, { tone: toneForType(row.original.accountType) }, () => row.original.accountType),
  },
  {
    accessorKey: 'debit',
    header: 'Debit',
    cell: ({ row }) => h('span', { class: 'tabular-nums' }, dashIfZero(row.original.debit)),
  },
  {
    accessorKey: 'credit',
    header: 'Credit',
    cell: ({ row }) => h('span', { class: 'tabular-nums' }, dashIfZero(row.original.credit)),
  },
  {
    accessorKey: 'netBalance',
    header: 'Net Balance',
    cell: ({ row }) => h('span', { class: 'tabular-nums font-bold' }, formatRupiah(row.original.netBalance)),
  },
])

function applyFilters() {
  store.applyTrialBalanceFilters()
}

function resetFilters() {
  store.resetTrialBalanceFilters()
}

function refresh() {
  store.refreshTrialBalance()
}

function openGeneralLedger(row: TrialBalanceRow) {
  store.setLedgerAccountCode(row.accountCode)
  tabs.openPrimaryTab({ id: '/reports/general-ledger', label: 'General Ledger', path: '/reports/general-ledger', closable: true })
  void router.push('/reports/general-ledger')
}
</script>

<template>
  <div class="space-y-4">
    <div class="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p class="text-xs font-extrabold text-slate-500">Accounting / Trial Balance</p>
          <h1 class="mt-2 text-2xl font-black tracking-tight text-slate-950">Trial Balance</h1>
          <p class="mt-2 text-sm leading-6 text-slate-500">
            Ringkasan saldo debit dan kredit seluruh akun untuk validasi keseimbangan pembukuan.
          </p>
        </div>

        <div class="flex flex-wrap items-center justify-start gap-2 lg:justify-end">
          <BaseButton variant="secondary" size="md" @click="() => undefined">
            <Upload class="h-4 w-4" />
            Export
          </BaseButton>
          <BaseButton variant="secondary" size="md" @click="() => undefined">
            <Printer class="h-4 w-4" />
            Print
          </BaseButton>
          <BaseButton variant="secondary" size="md" @click="refresh">
            <RefreshCw class="h-4 w-4" />
            Refresh
          </BaseButton>
        </div>
      </div>
    </div>

    <div class="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-end">
        <label class="block space-y-1.5 lg:min-w-[260px] lg:flex-1">
          <span class="text-xs font-bold text-slate-500">Search</span>
          <input
            :value="filters?.search ?? ''"
            class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#24a1db] focus:ring-4 focus:ring-[#e9f6fb]"
            placeholder="Search account code or name…"
            @input="store.setTrialBalanceSearch(($event.target as HTMLInputElement).value)"
          />
        </label>

        <label class="block space-y-1.5 lg:w-[160px]">
          <span class="text-xs font-bold text-slate-500">Period</span>
          <select
            :value="filters?.period"
            class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#24a1db] focus:ring-4 focus:ring-[#e9f6fb]"
            @change="store.setTrialBalancePeriod(($event.target as HTMLSelectElement).value as any)"
          >
            <option>May 2026</option>
            <option>April 2026</option>
            <option>March 2026</option>
          </select>
        </label>

        <label class="block space-y-1.5 lg:w-[160px]">
          <span class="text-xs font-bold text-slate-500">As of Date</span>
          <input
            :value="filters?.asOfDate ?? ''"
            type="date"
            class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#24a1db] focus:ring-4 focus:ring-[#e9f6fb]"
            @input="store.setTrialBalanceAsOfDate(($event.target as HTMLInputElement).value)"
          />
        </label>

        <label class="block space-y-1.5 lg:w-[160px]">
          <span class="text-xs font-bold text-slate-500">Account Type</span>
          <select
            :value="filters?.accountType ?? 'All'"
            class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#24a1db] focus:ring-4 focus:ring-[#e9f6fb]"
            @change="store.setTrialBalanceAccountType(($event.target as HTMLSelectElement).value as TrialBalanceAccountType)"
          >
            <option value="All">All</option>
            <option value="Asset">Asset</option>
            <option value="Liability">Liability</option>
            <option value="Equity">Equity</option>
            <option value="Revenue">Revenue</option>
            <option value="Expense">Expense</option>
          </select>
        </label>

        <label class="block space-y-1.5 lg:w-[220px]">
          <span class="text-xs font-bold text-slate-500">Balance View</span>
          <select
            :value="filters?.balanceView ?? 'hide_zero'"
            class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#24a1db] focus:ring-4 focus:ring-[#e9f6fb]"
            @change="store.setTrialBalanceBalanceView(($event.target as HTMLSelectElement).value as TrialBalanceBalanceView)"
          >
            <option value="hide_zero">Hide zero balance</option>
            <option value="show_all">Show all accounts</option>
            <option value="only_with_balance">Only accounts with balance</option>
          </select>
        </label>

        <div class="flex flex-wrap items-center justify-start gap-2 lg:shrink-0 lg:justify-end">
          <BaseButton variant="secondary" size="md" @click="resetFilters">Reset</BaseButton>
          <BaseButton variant="primary" size="md" @click="applyFilters">Apply</BaseButton>
        </div>
      </div>

      <p class="mt-3 text-xs text-slate-500">
        Applied: {{ applied?.period }} • As of {{ applied?.asOfDate }}
      </p>
    </div>

    <div class="grid gap-3 lg:grid-cols-4">
      <div class="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <p class="text-xs font-bold text-slate-500">Total Debit</p>
        <p class="mt-2 text-lg font-black tabular-nums text-slate-950">{{ formatRupiah(totals.totalDebit) }}</p>
      </div>
      <div class="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <p class="text-xs font-bold text-slate-500">Total Credit</p>
        <p class="mt-2 text-lg font-black tabular-nums text-slate-950">{{ formatRupiah(totals.totalCredit) }}</p>
      </div>
      <div class="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <p class="text-xs font-bold text-slate-500">Difference</p>
        <p class="mt-2 text-lg font-black tabular-nums text-slate-950">{{ formatRupiah(Math.abs(totals.difference)) }}</p>
      </div>
      <div class="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <p class="text-xs font-bold text-slate-500">Status</p>
        <div class="mt-2">
          <StatusBadge :status="totals.isBalanced ? 'Balanced' : 'Unbalanced'" />
        </div>
      </div>
    </div>

    <WorkspaceEmptyState
      v-if="rows.length === 0"
      title="No trial balance rows"
      description="Try adjusting your filters or click Apply."
    />

    <div v-else class="space-y-2">
      <DataTable
        :columns="columns"
        :data="rows"
        :loading="false"
        :selectable="false"
        :row-clickable="true"
        empty-title="No rows"
        empty-description="No rows match your filter."
        @row-click="openGeneralLedger($event)"
      />

      <div class="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
        <span class="font-semibold text-slate-600">Accounts: {{ totals.accountCount }}</span>
        <span class="font-extrabold text-slate-900 tabular-nums">
          Total Debit {{ formatRupiah(totals.totalDebit) }} • Total Credit {{ formatRupiah(totals.totalCredit) }}
        </span>
      </div>

      <p class="text-xs text-slate-500">
        Showing grouped account balances. Click an account row to open General Ledger detail.
      </p>
    </div>
  </div>
</template>
