<script setup lang="ts">
import type { ColumnDef } from '@tanstack/vue-table'
import { computed, h, onMounted, ref } from 'vue'
import { RefreshCw, Search } from 'lucide-vue-next'

import DataTable from '@/components/table/DataTable.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import DateInput from '@/components/ui/DateInput.vue'
import WorkspaceEmptyState from '@/components/workspace/WorkspaceEmptyState.vue'
import WorkspaceErrorState from '@/components/workspace/WorkspaceErrorState.vue'
import WorkspaceLoadingState from '@/components/workspace/WorkspaceLoadingState.vue'
import WorkspaceStatusBadge from '@/components/workspace/WorkspaceStatusBadge.vue'
import { formatDisplayDate } from '@/utils/date'
import {
  cashBankReportErrorMessage,
  getCashBankAccountStatement,
  listCashBankAccounts,
  type CashBankAccountOption,
  type CashBankAccountStatement,
  type CashBankStatementLine,
} from '@/services/cash-bank/cashBankReport.service'

function defaultPeriod() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return { startDate: `${year}-${month}-01`, endDate: `${year}-${month}-${day}` }
}

const initialPeriod = defaultPeriod()
const accounts = ref<CashBankAccountOption[]>([])
const selectedAccountId = ref<number | null>(null)
const startDate = ref(initialPeriod.startDate)
const endDate = ref(initialPeriod.endDate)
const search = ref('')
const statement = ref<CashBankAccountStatement | null>(null)
const loading = ref(false)
const accountsLoading = ref(false)
const error = ref<string | null>(null)
const accountsError = ref<string | null>(null)

const rows = computed(() => {
  const term = search.value.trim().toLowerCase()
  return (statement.value?.lines ?? []).filter((line) => {
    if (!term) return true
    const searchable = [
      line.journal_number,
      line.description,
      line.source_type,
      line.source_number,
      line.source_module,
    ].join(' ').toLowerCase()
    return searchable.includes(term)
  })
})

function formatMoney(value: number) {
  return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(value)
}

function sourceLabel(line: CashBankStatementLine) {
  return [line.source_type || line.source_module, line.source_number].filter(Boolean).join(' / ') || '-'
}

const columns = computed<ColumnDef<CashBankStatementLine, unknown>[]>(() => [
  { accessorKey: 'journal_date', header: 'Date', cell: ({ row }) => formatDisplayDate(row.original.journal_date) },
  { accessorKey: 'journal_number', header: 'Document No', cell: ({ row }) => row.original.journal_number },
  { accessorKey: 'description', header: 'Description / Memo', cell: ({ row }) => row.original.description || '-' },
  { id: 'source', header: 'Source Type', cell: ({ row }) => sourceLabel(row.original) },
  { accessorKey: 'debit', header: 'Debit / Cash In', cell: ({ row }) => formatMoney(row.original.debit) },
  { accessorKey: 'credit', header: 'Credit / Cash Out', cell: ({ row }) => formatMoney(row.original.credit) },
  { accessorKey: 'running_balance', header: 'Running Balance', cell: ({ row }) => formatMoney(row.original.running_balance) },
  { id: 'status', header: 'Status', cell: () => h(WorkspaceStatusBadge, { status: 'posted' }) },
])

async function loadAccounts() {
  accountsLoading.value = true
  accountsError.value = null
  try {
    accounts.value = await listCashBankAccounts()
    if (!selectedAccountId.value && accounts.value.length) {
      selectedAccountId.value = accounts.value[0]!.id
    }
  } catch (cause) {
    accounts.value = []
    selectedAccountId.value = null
    accountsError.value = cashBankReportErrorMessage(cause, 'Unable to load cash bank account options.')
  } finally {
    accountsLoading.value = false
  }
}

async function loadStatement() {
  if (!selectedAccountId.value) {
    statement.value = null
    return
  }
  if (startDate.value && endDate.value && endDate.value < startDate.value) {
    error.value = 'End Date must be on or after Start Date.'
    return
  }

  loading.value = true
  error.value = null
  try {
    statement.value = await getCashBankAccountStatement({
      cash_bank_account_id: selectedAccountId.value,
      start_date: startDate.value || undefined,
      end_date: endDate.value || undefined,
    })
  } catch (cause) {
    statement.value = null
    error.value = cashBankReportErrorMessage(cause)
  } finally {
    loading.value = false
  }
}

async function initialize() {
  await loadAccounts()
  await loadStatement()
}

function resetFilters() {
  const period = defaultPeriod()
  selectedAccountId.value = accounts.value[0]?.id ?? null
  startDate.value = period.startDate
  endDate.value = period.endDate
  search.value = ''
  void loadStatement()
}

onMounted(initialize)
</script>

<template>
  <div class="workspace-card tablet-workspace-card tablet-workspace-card-gap flex min-w-0 flex-col gap-4 rounded-b-3xl rounded-tr-3xl border border-slate-200 bg-white p-4 shadow-sm lg:p-5">
    <div class="flex min-w-0 flex-col gap-3 border-b border-slate-100 pb-4 xl:flex-row xl:items-center xl:justify-between">
      <div>
        <h1 class="text-xl font-black text-slate-950">Cash Bank Account Statement</h1>
        <p class="mt-1 text-sm text-slate-500">Mutasi Rekening Kas Bank</p>
      </div>
      <BaseButton variant="secondary" size="md" :loading="loading || accountsLoading" @click="initialize">
        <RefreshCw class="h-4 w-4" />Refresh
      </BaseButton>
    </div>

    <div class="rounded-2xl border border-slate-200 bg-slate-50/40 p-4">
      <div class="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(250px,1.4fr)_165px_165px_minmax(220px,1fr)_auto_auto] xl:items-end">
        <label class="block space-y-1.5">
          <span class="text-xs font-bold text-slate-500">Account</span>
          <select v-model="selectedAccountId" :disabled="accountsLoading || accounts.length === 0" class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700">
            <option :value="null">{{ accountsLoading ? 'Loading accounts...' : 'Select account...' }}</option>
            <option v-for="account in accounts" :key="account.id" :value="account.id">
              {{ account.account_code }} - {{ account.account_name }}
            </option>
          </select>
        </label>
        <label class="block space-y-1.5">
          <span class="text-xs font-bold text-slate-500">Start Date</span>
          <DateInput v-model="startDate" />
        </label>
        <label class="block space-y-1.5">
          <span class="text-xs font-bold text-slate-500">End Date</span>
          <DateInput v-model="endDate" />
        </label>
        <label class="block space-y-1.5">
          <span class="text-xs font-bold text-slate-500">Search</span>
          <span class="relative block">
            <Search class="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input v-model="search" class="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm" placeholder="Document or memo..." />
          </span>
        </label>
        <BaseButton variant="secondary" size="md" @click="resetFilters">Reset</BaseButton>
        <BaseButton variant="primary" size="md" :disabled="!selectedAccountId" :loading="loading" @click="loadStatement">Apply</BaseButton>
      </div>
    </div>

    <WorkspaceErrorState v-if="accountsError" :message="accountsError" @retry="initialize" />
    <WorkspaceErrorState v-else-if="error" :message="error" @retry="loadStatement" />
    <WorkspaceLoadingState v-if="accountsLoading || loading" />

    <template v-else-if="!accountsError">
      <WorkspaceEmptyState
        v-if="accounts.length === 0"
        title="No cash bank accounts available"
        description="No active cash or bank accounts are available for this company."
      />
      <WorkspaceEmptyState
        v-else-if="!statement"
        title="Select an account"
        description="Choose a cash or bank account and apply a reporting period."
      />
      <template v-else>
        <div class="grid min-w-0 gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 xl:grid-cols-5">
          <div>
            <p class="text-xs font-bold text-slate-500">Account</p>
            <p class="mt-1 text-sm font-extrabold text-slate-900">{{ statement.account.account_code }}</p>
            <p class="truncate text-sm text-slate-600">{{ statement.account.account_name }}</p>
          </div>
          <div><p class="text-xs font-bold text-slate-500">Opening Balance</p><p class="mt-1 font-extrabold tabular-nums text-slate-900">{{ formatMoney(statement.opening_balance) }}</p></div>
          <div><p class="text-xs font-bold text-slate-500">Cash In / Debit</p><p class="mt-1 font-extrabold tabular-nums text-slate-900">{{ formatMoney(statement.period_totals.debit) }}</p></div>
          <div><p class="text-xs font-bold text-slate-500">Cash Out / Credit</p><p class="mt-1 font-extrabold tabular-nums text-slate-900">{{ formatMoney(statement.period_totals.credit) }}</p></div>
          <div><p class="text-xs font-bold text-slate-500">Ending Balance</p><p class="mt-1 font-extrabold tabular-nums text-slate-900">{{ formatMoney(statement.ending_balance) }}</p></div>
        </div>
        <DataTable
          :columns="columns"
          :data="rows"
          :loading="false"
          :selectable="false"
          table-max-height="max(240px, calc(100dvh - 550px))"
          empty-title="No statement movements"
          empty-description="No posted cash bank journal lines match the selected period or search."
        />
      </template>
    </template>
  </div>
</template>
