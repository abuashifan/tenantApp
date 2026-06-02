<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'

import BaseButton from '@/components/ui/BaseButton.vue'
import DateInput from '@/components/ui/DateInput.vue'
import DataTable from '@/components/table/DataTable.vue'
import WorkspaceEmptyState from '@/components/workspace/WorkspaceEmptyState.vue'
import {
  getBalanceSheet,
  getCashFlow,
  getFinancialSummary,
  getProfitLoss,
  reportErrorMessage,
  type BalanceSheetResult,
  type CashFlowResult,
  type FinancialSummaryResult,
  type ProfitLossResult,
} from '@/services/report.service'
import { useWorkspaceTabsStore } from '@/stores/workspaceTabsStore'

type StatementKind = 'profit-loss' | 'balance-sheet' | 'cash-flow' | 'financial-summary'
type DisplayRow = {
  id: string
  section: string
  account_code: string | null
  account_name: string
  debit?: number
  credit?: number
  amount?: number
  opening_balance?: number
  cash_in?: number
  cash_out?: number
  ending_balance?: number
}

const tabs = useWorkspaceTabsStore()
const kind = computed<StatementKind>(() => {
  const value = tabs.activePrimaryTabId.replace('/reports/', '')
  return value === 'balance-sheet' || value === 'cash-flow' || value === 'financial-summary' ? value : 'profit-loss'
})
const titles: Record<StatementKind, string> = {
  'profit-loss': 'Profit & Loss',
  'balance-sheet': 'Balance Sheet',
  'cash-flow': 'Cash Flow',
  'financial-summary': 'Financial Summary',
}
const today = new Date().toISOString().slice(0, 10)
const startDate = ref(`${today.slice(0, 4)}-01-01`)
const endDate = ref(today)
const profitLoss = ref<ProfitLossResult | null>(null)
const balanceSheet = ref<BalanceSheetResult | null>(null)
const cashFlow = ref<CashFlowResult | null>(null)
const financialSummary = ref<FinancialSummaryResult | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

function formatMoney(value: number) {
  return new Intl.NumberFormat('id-ID').format(value)
}

const rows = computed<DisplayRow[]>(() => {
  if (kind.value === 'cash-flow') {
    return (cashFlow.value?.accounts ?? []).map((row) => ({
      id: row.id,
      section: 'Cash / Bank',
      account_code: row.account_code,
      account_name: row.account_name,
      opening_balance: row.opening_balance,
      cash_in: row.cash_in,
      cash_out: row.cash_out,
      ending_balance: row.ending_balance,
    }))
  }

  const result = kind.value === 'profit-loss' ? profitLoss.value : balanceSheet.value
  return (result?.sections ?? []).flatMap((section) => section.accounts.map((account) => ({
    id: `${section.key}-${account.id}`,
    section: section.label,
    account_code: account.account_code,
    account_name: account.account_name,
    debit: account.debit,
    credit: account.credit,
    amount: account.amount,
  })))
})

const summaryCards = computed(() => {
  if (kind.value === 'profit-loss' && profitLoss.value) {
    return [
      ['Revenue', profitLoss.value.totals.total_revenue],
      ['Expense', profitLoss.value.totals.total_expense],
      ['Net Profit / Loss', profitLoss.value.totals.net_profit_or_loss],
    ]
  }
  if (kind.value === 'balance-sheet' && balanceSheet.value) {
    return [
      ['Assets', balanceSheet.value.totals.total_assets],
      ['Liabilities', balanceSheet.value.totals.total_liabilities],
      ['Equity', balanceSheet.value.totals.total_equity],
    ]
  }
  if (kind.value === 'cash-flow' && cashFlow.value) {
    return [
      ['Opening Cash', cashFlow.value.summary.opening_cash_balance],
      ['Cash In', cashFlow.value.summary.cash_in],
      ['Cash Out', cashFlow.value.summary.cash_out],
      ['Ending Cash', cashFlow.value.summary.ending_cash_balance],
    ]
  }
  if (kind.value === 'financial-summary' && financialSummary.value) {
    return [
      ['Net Profit / Loss', financialSummary.value.profit_loss.net_profit_or_loss],
      ['Total Assets', financialSummary.value.balance_sheet.total_assets],
      ['Total Liabilities', financialSummary.value.balance_sheet.total_liabilities],
      ['Total Equity', financialSummary.value.balance_sheet.total_equity],
      ['Opening Cash', financialSummary.value.cash_flow.opening_cash_balance],
      ['Cash In', financialSummary.value.cash_flow.cash_in],
      ['Cash Out', financialSummary.value.cash_flow.cash_out],
      ['Ending Cash', financialSummary.value.cash_flow.ending_cash_balance],
    ]
  }
  return []
})

const imbalanceWarning = computed(() => {
  if (kind.value === 'balance-sheet' && balanceSheet.value && !balanceSheet.value.totals.is_balanced) {
    return 'Warning: assets do not balance with liabilities and equity.'
  }
  if (kind.value === 'financial-summary' && financialSummary.value && !financialSummary.value.balance_sheet.is_balanced) {
    return 'Warning: the summarized balance sheet is not balanced.'
  }
  return ''
})

const columns = computed<ColumnDef<DisplayRow, unknown>[]>(() => {
  if (kind.value === 'cash-flow') {
    return [
      { accessorKey: 'account_code', header: 'Account Code', cell: ({ row }) => row.original.account_code ?? '-' },
      { accessorKey: 'account_name', header: 'Account Name', cell: ({ row }) => row.original.account_name },
      { accessorKey: 'opening_balance', header: 'Opening', cell: ({ row }) => formatMoney(row.original.opening_balance ?? 0) },
      { accessorKey: 'cash_in', header: 'Cash In', cell: ({ row }) => formatMoney(row.original.cash_in ?? 0) },
      { accessorKey: 'cash_out', header: 'Cash Out', cell: ({ row }) => formatMoney(row.original.cash_out ?? 0) },
      { accessorKey: 'ending_balance', header: 'Ending', cell: ({ row }) => h('span', { class: 'font-bold tabular-nums' }, formatMoney(row.original.ending_balance ?? 0)) },
    ]
  }
  return [
    { accessorKey: 'section', header: 'Section', cell: ({ row }) => row.original.section },
    { accessorKey: 'account_code', header: 'Account Code', cell: ({ row }) => row.original.account_code ?? '-' },
    { accessorKey: 'account_name', header: 'Account Name', cell: ({ row }) => row.original.account_name },
    { accessorKey: 'debit', header: 'Debit', cell: ({ row }) => formatMoney(row.original.debit ?? 0) },
    { accessorKey: 'credit', header: 'Credit', cell: ({ row }) => formatMoney(row.original.credit ?? 0) },
    { accessorKey: 'amount', header: 'Amount', cell: ({ row }) => h('span', { class: 'font-bold tabular-nums' }, formatMoney(row.original.amount ?? 0)) },
  ]
})

async function load() {
  loading.value = true
  error.value = null
  try {
    if (kind.value === 'profit-loss') {
      profitLoss.value = await getProfitLoss({ start_date: startDate.value, end_date: endDate.value })
    } else if (kind.value === 'balance-sheet') {
      balanceSheet.value = await getBalanceSheet({ as_of_date: endDate.value })
    } else if (kind.value === 'cash-flow') {
      cashFlow.value = await getCashFlow({
        start_date: startDate.value,
        end_date: endDate.value,
        include_account_breakdown: true,
      })
    } else {
      financialSummary.value = await getFinancialSummary({
        start_date: startDate.value,
        end_date: endDate.value,
        as_of_date: endDate.value,
      })
    }
  } catch (cause) {
    error.value = reportErrorMessage(cause)
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="workspace-card tablet-workspace-card tablet-workspace-card-gap flex min-w-0 flex-col gap-4 rounded-b-3xl rounded-tr-3xl border border-slate-200 bg-white p-4 shadow-sm lg:p-5">
    <h1 class="border-b border-slate-100 pb-4 text-xl font-black text-slate-950">{{ titles[kind] }}</h1>
    <div class="rounded-2xl border border-slate-200 bg-slate-50/40 p-4">
      <div class="flex min-w-0 flex-col gap-3 xl:flex-row xl:items-end">
        <label v-if="kind !== 'balance-sheet'" class="block space-y-1.5 xl:w-[180px]">
          <span class="text-xs font-bold text-slate-500">Start Date</span>
          <DateInput v-model="startDate" />
        </label>
        <label class="block space-y-1.5 xl:w-[180px]">
          <span class="text-xs font-bold text-slate-500">{{ kind === 'balance-sheet' ? 'As Of Date' : 'End Date' }}</span>
          <DateInput v-model="endDate" />
        </label>
        <BaseButton variant="primary" size="md" @click="load">Apply</BaseButton>
      </div>
    </div>

    <p v-if="error" class="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">{{ error }}</p>
    <p v-if="imbalanceWarning" class="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-700">{{ imbalanceWarning }}</p>

    <div v-if="summaryCards.length" class="grid min-w-0 gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 xl:grid-cols-4">
      <div v-for="[label, value] in summaryCards" :key="label">
        <p class="text-xs font-bold text-slate-500">{{ label }}</p>
        <p class="mt-1 font-extrabold tabular-nums text-slate-900">{{ formatMoney(value as number) }}</p>
      </div>
    </div>

    <WorkspaceEmptyState
      v-if="!loading && !error && kind !== 'financial-summary' && rows.length === 0"
      title="Tidak ada data untuk filter ini."
      description="Adjust the report filters and click Apply."
    />
    <DataTable
      v-else-if="kind !== 'financial-summary'"
      :columns="columns"
      :data="rows"
      :loading="loading"
      :selectable="false"
      empty-title="Tidak ada data untuk filter ini."
      empty-description="No posted journal data matches the selected period."
    />
  </div>
</template>
