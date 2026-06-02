<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'

import BaseButton from '@/components/ui/BaseButton.vue'
import DateInput from '@/components/ui/DateInput.vue'
import DataTable from '@/components/table/DataTable.vue'
import WorkspaceEmptyState from '@/components/workspace/WorkspaceEmptyState.vue'
import WorkspaceStatusBadge from '@/components/workspace/WorkspaceStatusBadge.vue'
import { getGeneralLedger, listLedgerAccounts, reportErrorMessage, type LedgerAccountOption, type LedgerDetail, type LedgerLine } from './generalLedger.service'
import { formatDisplayDate } from '@/utils/date'

const accounts = ref<LedgerAccountOption[]>([])
const selectedAccountId = ref<number | null>(null)
const startDate = ref('2026-01-01')
const endDate = ref('2026-01-31')
const search = ref('')
const detail = ref<LedgerDetail | null>(null)
const loading = ref(false)
const accountsLoading = ref(false)
const error = ref<string | null>(null)
const accountsError = ref<string | null>(null)
const includeOpeningBalance = ref(true)
const includeZeroBalance = ref(false)

const rows = computed(() => (detail.value?.lines ?? []).filter((line) => {
  const term = search.value.trim().toLowerCase()
  return !term || `${line.journal_number} ${line.description ?? ''}`.toLowerCase().includes(term)
}))

function formatMoney(value: number) {
  return new Intl.NumberFormat('id-ID').format(value)
}

async function loadAccountOptions() {
  accountsLoading.value = true
  accountsError.value = null
  try {
    accounts.value = await listLedgerAccounts({ is_active: true })
  } catch (cause) {
    accounts.value = []
    accountsError.value = reportErrorMessage(cause, 'Unable to load chart of accounts.')
  } finally {
    accountsLoading.value = false
  }

  if (!selectedAccountId.value && accounts.value.length) selectedAccountId.value = accounts.value[0]!.account_id
}

async function load() {
  loading.value = true
  error.value = null
  try {
    if (!accounts.value.length) await loadAccountOptions()
    detail.value = selectedAccountId.value
      ? await getGeneralLedger(selectedAccountId.value, {
          start_date: startDate.value,
          end_date: endDate.value,
          include_opening_balance: includeOpeningBalance.value,
          include_zero_balance: includeZeroBalance.value,
        })
      : null
  } catch (cause) {
    error.value = reportErrorMessage(cause, 'Unable to load general ledger.')
    detail.value = null
  } finally {
    loading.value = false
  }
}

const columns = computed<ColumnDef<LedgerLine, unknown>[]>(() => [
  { accessorKey: 'journal_date', header: 'Date', cell: ({ row }) => formatDisplayDate(row.original.journal_date) },
  { accessorKey: 'journal_number', header: 'Journal No', cell: ({ row }) => row.original.journal_number },
  { accessorKey: 'description', header: 'Description', cell: ({ row }) => row.original.description ?? '-' },
  { accessorKey: 'source_type', header: 'Source', cell: ({ row }) => row.original.source_type ?? '-' },
  { accessorKey: 'debit', header: 'Debit', cell: ({ row }) => formatMoney(row.original.debit) },
  { accessorKey: 'credit', header: 'Credit', cell: ({ row }) => formatMoney(row.original.credit) },
  { accessorKey: 'running_balance', header: 'Balance', cell: ({ row }) => formatMoney(row.original.running_balance) },
  { id: 'status', header: 'Status', cell: () => h(WorkspaceStatusBadge, { status: 'posted' }) },
])

onMounted(load)
</script>

<template>
  <div class="workspace-card tablet-workspace-card tablet-workspace-card-gap flex min-w-0 flex-col gap-4 rounded-b-3xl rounded-tr-3xl border border-slate-200 bg-white p-4 shadow-sm lg:p-5">
    <h1 class="border-b border-slate-100 pb-4 text-xl font-black text-slate-950">General Ledger</h1>
    <div class="rounded-2xl border border-slate-200 bg-slate-50/40 p-4">
      <div class="flex min-w-0 flex-col gap-3 xl:flex-row xl:items-end">
        <label class="block min-w-0 space-y-1.5 xl:min-w-[320px] xl:flex-1">
          <span class="text-xs font-bold text-slate-500">Account</span>
          <select v-model="selectedAccountId" :disabled="accountsLoading" class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 disabled:bg-slate-100">
            <option :value="null">{{ accountsLoading ? 'Loading accounts...' : 'Select account...' }}</option>
            <option v-for="account in accounts" :key="account.account_id" :value="account.account_id">
              {{ account.label }}
            </option>
          </select>
          <span v-if="accountsError" class="block text-xs font-semibold text-rose-600">{{ accountsError }}</span>
        </label>
        <label class="block space-y-1.5 xl:w-[165px]">
          <span class="text-xs font-bold text-slate-500">Start Date</span>
          <DateInput v-model="startDate" />
        </label>
        <label class="block space-y-1.5 xl:w-[165px]">
          <span class="text-xs font-bold text-slate-500">End Date</span>
          <DateInput v-model="endDate" />
        </label>
        <label class="block min-w-0 space-y-1.5 xl:min-w-[220px] xl:flex-1">
          <span class="text-xs font-bold text-slate-500">Search</span>
          <input v-model="search" class="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm" placeholder="Search journal no or description..." />
        </label>
        <label class="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600">
          <input v-model="includeOpeningBalance" type="checkbox" class="h-4 w-4 rounded border-slate-300" />
          Opening
        </label>
        <label class="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600">
          <input v-model="includeZeroBalance" type="checkbox" class="h-4 w-4 rounded border-slate-300" />
          Zero
        </label>
        <BaseButton variant="primary" size="md" @click="load">Apply</BaseButton>
      </div>
    </div>

    <p v-if="error" class="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">{{ error }}</p>
    <div v-if="detail" class="grid min-w-0 gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 xl:grid-cols-6">
      <div class="xl:col-span-2">
        <p class="text-xs font-bold text-slate-500">Account</p>
        <p class="mt-1 text-sm font-extrabold text-slate-900">{{ detail.account.account_code }}</p>
        <p class="text-sm text-slate-600">{{ detail.account.account_name }}</p>
      </div>
      <div><p class="text-xs font-bold text-slate-500">Opening</p><p class="mt-1 font-extrabold tabular-nums">{{ formatMoney(detail.opening_balance.balance) }}</p></div>
      <div><p class="text-xs font-bold text-slate-500">Period Debit</p><p class="mt-1 font-extrabold tabular-nums">{{ formatMoney(detail.period_totals.debit) }}</p></div>
      <div><p class="text-xs font-bold text-slate-500">Period Credit</p><p class="mt-1 font-extrabold tabular-nums">{{ formatMoney(detail.period_totals.credit) }}</p></div>
      <div><p class="text-xs font-bold text-slate-500">Ending</p><p class="mt-1 font-extrabold tabular-nums">{{ formatMoney(detail.ending_balance) }}</p></div>
    </div>
    <WorkspaceEmptyState v-if="!loading && !detail" title="Select an account" description="Choose an account and load ledger lines." />
    <DataTable
      v-else-if="detail"
      :columns="columns"
      :data="rows"
      :loading="loading"
      :selectable="false"
      table-max-height="max(240px, calc(100dvh - 520px))"
      empty-title="No ledger lines"
      empty-description="No posted journal lines match your filters."
    />
  </div>
</template>
