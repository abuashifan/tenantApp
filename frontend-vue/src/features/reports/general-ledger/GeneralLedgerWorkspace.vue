<script setup lang="ts">
import { computed, h, onMounted } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'

import BaseButton from '@/components/ui/BaseButton.vue'
import DataTable from '@/components/table/DataTable.vue'
import WorkspaceEmptyState from '@/components/workspace/WorkspaceEmptyState.vue'
import WorkspaceStatusBadge from '@/components/workspace/WorkspaceStatusBadge.vue'
import { useMockAccountingDataStore, type MockJournalStatus, type MockLedgerLine } from '@/stores/mockAccountingDataStore'

type LedgerRow = MockLedgerLine & { runningBalance: number }

const store = useMockAccountingDataStore()

onMounted(() => store.initLedgerLines())

const ledgerAccounts = computed(() => store.ledgerAccounts)
const selectedAccountCode = computed({
  get: () => store.ledgerFilters.accountCode ?? store.selectedLedgerAccountCode,
  set: (value: string | null) => store.setLedgerAccountCode(value),
})
const statuses = computed({
  get: () => store.ledgerFilters.statuses,
  set: (value: MockJournalStatus[]) => store.setLedgerStatuses(value),
})
const search = computed({
  get: () => store.ledgerFilters.search,
  set: (value: string) => store.setLedgerSearch(value),
})

const summary = computed(() => store.ledgerSummary)
const rows = computed<LedgerRow[]>(() => store.ledgerRunningLines)

function formatMoney(value: number) {
  return new Intl.NumberFormat('id-ID').format(value)
}

function toggleStatus(next: MockJournalStatus) {
  const current = new Set(statuses.value)
  if (current.has(next)) current.delete(next)
  else current.add(next)
  statuses.value = Array.from(current)
}

const columns = computed<ColumnDef<LedgerRow, unknown>[]>(() => [
  { accessorKey: 'date', header: 'Date', cell: ({ row }) => row.original.date },
  { accessorKey: 'journalNo', header: 'Journal No', cell: ({ row }) => row.original.journalNo },
  { accessorKey: 'description', header: 'Description', cell: ({ row }) => row.original.description },
  { accessorKey: 'source', header: 'Source', cell: ({ row }) => row.original.source },
  {
    accessorKey: 'debit',
    header: 'Debit',
    cell: ({ row }) => formatMoney(row.original.debit),
  },
  {
    accessorKey: 'credit',
    header: 'Credit',
    cell: ({ row }) => formatMoney(row.original.credit),
  },
  {
    accessorKey: 'runningBalance',
    header: 'Balance',
    cell: ({ row }) => formatMoney(row.original.runningBalance),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => h(WorkspaceStatusBadge, { status: row.original.status }),
  },
])
</script>

<template>
  <div class="space-y-4">
    <div>
      <h1 class="text-2xl font-black text-slate-950">General Ledger</h1>
      <p class="mt-1 text-sm text-slate-500">Buku besar per akun berdasarkan transaksi jurnal</p>
    </div>

    <div class="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-end">
        <label class="block space-y-1.5 lg:min-w-[380px] lg:flex-1">
          <span class="text-xs font-bold text-slate-500">Account</span>
          <select
            v-model="selectedAccountCode"
            class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#24a1db] focus:ring-4 focus:ring-[#e9f6fb]"
          >
            <option :value="null">Select account…</option>
            <option v-for="acc in ledgerAccounts" :key="acc.code" :value="acc.code">
              {{ acc.code }} — {{ acc.name }}
            </option>
          </select>
        </label>

        <div class="space-y-1.5 lg:w-[220px]">
          <p class="text-xs font-bold text-slate-500">Status</p>
          <div class="flex flex-wrap items-center gap-2">
            <label class="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                class="h-4 w-4 accent-[#24a1db]"
                :checked="statuses.includes('Posted')"
                @change="toggleStatus('Posted')"
              />
              Posted
            </label>
            <label class="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                class="h-4 w-4 accent-[#24a1db]"
                :checked="statuses.includes('Draft')"
                @change="toggleStatus('Draft')"
              />
              Draft
            </label>
            <label class="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                class="h-4 w-4 accent-[#24a1db]"
                :checked="statuses.includes('Void')"
                @change="toggleStatus('Void')"
              />
              Void
            </label>
          </div>
        </div>

        <label class="block space-y-1.5 lg:min-w-[260px] lg:flex-1">
          <span class="text-xs font-bold text-slate-500">Search</span>
          <input
            v-model="search"
            class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#24a1db] focus:ring-4 focus:ring-[#e9f6fb]"
            placeholder="Search journal no or description…"
          />
        </label>

        <BaseButton class="lg:shrink-0" variant="secondary" size="md" @click="store.resetLedgerFilters()">Reset</BaseButton>
      </div>
    </div>

    <div v-if="summary" class="grid gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-6">
      <div class="lg:col-span-2">
        <p class="text-xs font-bold text-slate-500">Account</p>
        <p class="mt-1 text-sm font-extrabold text-slate-900">{{ summary.accountCode }}</p>
        <p class="text-sm text-slate-600">{{ summary.accountName }}</p>
        <p class="mt-1 text-xs font-bold text-slate-500">{{ summary.accountType }} • Normal {{ summary.normalBalance }}</p>
      </div>
      <div>
        <p class="text-xs font-bold text-slate-500">Opening</p>
        <p class="mt-1 text-sm font-extrabold tabular-nums text-slate-900">{{ formatMoney(summary.openingBalance) }}</p>
      </div>
      <div>
        <p class="text-xs font-bold text-slate-500">Period Debit</p>
        <p class="mt-1 text-sm font-extrabold tabular-nums text-slate-900">{{ formatMoney(summary.periodDebit) }}</p>
      </div>
      <div>
        <p class="text-xs font-bold text-slate-500">Period Credit</p>
        <p class="mt-1 text-sm font-extrabold tabular-nums text-slate-900">{{ formatMoney(summary.periodCredit) }}</p>
      </div>
      <div>
        <p class="text-xs font-bold text-slate-500">Ending</p>
        <p class="mt-1 text-sm font-extrabold tabular-nums text-slate-900">{{ formatMoney(summary.endingBalance) }}</p>
      </div>
    </div>

    <WorkspaceEmptyState
      v-if="!selectedAccountCode"
      title="Select an account"
      description="Choose an account to view ledger lines."
    />
    <WorkspaceEmptyState
      v-else-if="rows.length === 0"
      title="No ledger lines"
      description="No ledger lines match your filters."
    />
    <DataTable
      v-else
      :columns="columns"
      :data="rows"
      :loading="false"
      :selectable="false"
      table-max-height="calc(100vh - 520px)"
      empty-title="No ledger lines"
      empty-description="No ledger lines match your filters."
    />
  </div>
</template>
