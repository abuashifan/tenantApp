<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import BaseButton from '@/components/ui/BaseButton.vue'
import WorkspaceEmptyState from '@/components/workspace/WorkspaceEmptyState.vue'
import WorkspaceErrorState from '@/components/workspace/WorkspaceErrorState.vue'
import { errorText, formatMoney } from '@/features/ar-ap-ledger/ledgerUtils'
import { getCustomerSummary, type ArCustomerSummaryRow } from '@/services/sales/ar.service'

const loading = ref(false)
const error = ref('')
const rows = ref<ArCustomerSummaryRow[]>([])
const search = ref('')

const filteredRows = computed(() => {
  const needle = search.value.trim().toLowerCase()
  if (!needle) return rows.value
  return rows.value.filter((row) => `${row.customer_name ?? ''} ${row.customer_id}`.toLowerCase().includes(needle))
})

const totals = computed(() => ({
  debit: rows.value.reduce((sum, row) => sum + Number(row.debit ?? 0), 0),
  credit: rows.value.reduce((sum, row) => sum + Number(row.credit ?? 0), 0),
  balance: rows.value.reduce((sum, row) => sum + Number(row.balance ?? 0), 0),
}))

async function load() {
  loading.value = true
  error.value = ''
  try {
    rows.value = await getCustomerSummary()
  } catch (reason) {
    error.value = errorText(reason)
    rows.value = []
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <section class="space-y-5">
    <div class="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p class="text-sm font-semibold text-[#1d81af]">Sales & AR</p>
          <h1 class="mt-2 text-3xl font-black tracking-tight text-slate-950">AR Customer Summary</h1>
          <p class="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            Posted accounts receivable balance by customer with drilldown to customer ledger detail.
          </p>
        </div>
        <BaseButton variant="secondary" :loading="loading" @click="load">Refresh</BaseButton>
      </div>
    </div>

    <WorkspaceErrorState v-if="error" :message="error" @retry="load" />

    <div class="grid gap-4 md:grid-cols-3">
      <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p class="text-xs font-black uppercase tracking-wide text-slate-400">Receivable Increase</p>
        <p class="mt-2 text-xl font-black text-slate-950">{{ formatMoney(totals.debit) }}</p>
      </div>
      <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p class="text-xs font-black uppercase tracking-wide text-slate-400">Receivable Decrease</p>
        <p class="mt-2 text-xl font-black text-slate-950">{{ formatMoney(totals.credit) }}</p>
      </div>
      <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p class="text-xs font-black uppercase tracking-wide text-slate-400">AR Balance</p>
        <p class="mt-2 text-xl font-black text-slate-950">{{ formatMoney(totals.balance) }}</p>
      </div>
    </div>

    <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <label class="text-sm font-bold text-slate-700">
        Search customer
        <input v-model="search" class="mt-2 h-10 w-full max-w-md rounded-xl border border-slate-200 px-3 text-sm" placeholder="Customer name or ID" />
      </label>
    </div>

    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div class="border-b border-slate-100 px-5 py-4">
        <h2 class="text-lg font-black text-slate-950">Customers</h2>
        <p class="mt-1 text-sm text-slate-500">{{ filteredRows.length }} row(s)</p>
      </div>
      <div v-if="loading" class="p-6 text-sm font-bold text-slate-500">Loading customer summary...</div>
      <WorkspaceEmptyState v-else-if="filteredRows.length === 0" title="No AR customer balance" />
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-100 text-sm">
          <thead class="bg-slate-50 text-left text-xs font-black uppercase tracking-wide text-slate-400">
            <tr>
              <th class="px-4 py-3">Customer</th>
              <th class="px-4 py-3 text-right">Debit</th>
              <th class="px-4 py-3 text-right">Credit</th>
              <th class="px-4 py-3 text-right">Balance</th>
              <th class="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="row in filteredRows" :key="row.customer_id" class="hover:bg-slate-50">
              <td class="px-4 py-3">
                <p class="font-black text-slate-900">{{ row.customer_name ?? '-' }}</p>
                <p class="text-xs font-semibold text-slate-500">Customer #{{ row.customer_id }}</p>
              </td>
              <td class="px-4 py-3 text-right font-bold">{{ formatMoney(row.debit) }}</td>
              <td class="px-4 py-3 text-right font-bold">{{ formatMoney(row.credit) }}</td>
              <td class="px-4 py-3 text-right font-black">{{ formatMoney(row.balance) }}</td>
              <td class="px-4 py-3 text-right">
                <RouterLink class="text-sm font-black text-[#1d81af] hover:underline" :to="`/sales/ar/customers/${row.customer_id}/ledger`">
                  View ledger
                </RouterLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
