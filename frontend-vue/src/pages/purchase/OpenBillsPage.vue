<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import BaseButton from '@/components/ui/BaseButton.vue'
import WorkspaceEmptyState from '@/components/workspace/WorkspaceEmptyState.vue'
import WorkspaceErrorState from '@/components/workspace/WorkspaceErrorState.vue'
import WorkspaceStatusBadge from '@/components/workspace/WorkspaceStatusBadge.vue'
import { errorText, formatDate, formatMoney } from '@/features/ar-ap-ledger/ledgerUtils'
import { getOpenBills, type ApOpenBillRow } from '@/services/purchase/ap.service'

const loading = ref(false)
const error = ref('')
const rows = ref<ApOpenBillRow[]>([])
const search = ref('')

const filteredRows = computed(() => {
  const needle = search.value.trim().toLowerCase()
  if (!needle) return rows.value
  return rows.value.filter((row) => `${row.bill_number} ${row.vendor_name ?? ''}`.toLowerCase().includes(needle))
})

const balanceTotal = computed(() => rows.value.reduce((sum, row) => sum + Number(row.balance_due ?? 0), 0))

async function load() {
  loading.value = true
  error.value = ''
  try {
    rows.value = await getOpenBills()
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
          <p class="text-sm font-semibold text-[#1d81af]">Purchase & AP</p>
          <h1 class="mt-2 text-3xl font-black tracking-tight text-slate-950">Open Bills</h1>
          <p class="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            Posted vendor bills with outstanding balance and drilldown to bill or vendor ledger detail.
          </p>
        </div>
        <BaseButton variant="secondary" :loading="loading" @click="load">Refresh</BaseButton>
      </div>
    </div>

    <WorkspaceErrorState v-if="error" :message="error" @retry="load" />

    <div class="grid gap-4 md:grid-cols-2">
      <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p class="text-xs font-black uppercase tracking-wide text-slate-400">Open Bills</p>
        <p class="mt-2 text-xl font-black text-slate-950">{{ rows.length }}</p>
      </div>
      <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p class="text-xs font-black uppercase tracking-wide text-slate-400">Outstanding AP</p>
        <p class="mt-2 text-xl font-black text-slate-950">{{ formatMoney(balanceTotal) }}</p>
      </div>
    </div>

    <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <label class="text-sm font-bold text-slate-700">
        Search bill/vendor
        <input v-model="search" class="mt-2 h-10 w-full max-w-md rounded-xl border border-slate-200 px-3 text-sm" placeholder="Bill number or vendor" />
      </label>
    </div>

    <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div class="border-b border-slate-100 px-5 py-4">
        <h2 class="text-lg font-black text-slate-950">Open Bill Rows</h2>
        <p class="mt-1 text-sm text-slate-500">{{ filteredRows.length }} row(s)</p>
      </div>
      <div v-if="loading" class="p-6 text-sm font-bold text-slate-500">Loading open bills...</div>
      <WorkspaceEmptyState v-else-if="filteredRows.length === 0" title="No open bills" />
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-100 text-sm">
          <thead class="bg-slate-50 text-left text-xs font-black uppercase tracking-wide text-slate-400">
            <tr>
              <th class="px-4 py-3">Bill</th>
              <th class="px-4 py-3">Vendor</th>
              <th class="px-4 py-3">Due Date</th>
              <th class="px-4 py-3 text-right">Total</th>
              <th class="px-4 py-3 text-right">Paid/Returned</th>
              <th class="px-4 py-3 text-right">Balance</th>
              <th class="px-4 py-3">Status</th>
              <th class="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="row in filteredRows" :key="row.bill_id" class="hover:bg-slate-50">
              <td class="px-4 py-3">
                <p class="font-black text-slate-900">{{ row.bill_number }}</p>
                <p class="text-xs font-semibold text-slate-500">{{ formatDate(row.bill_date) }}</p>
              </td>
              <td class="px-4 py-3">{{ row.vendor_name ?? '-' }}</td>
              <td class="px-4 py-3">{{ formatDate(row.due_date) }}</td>
              <td class="px-4 py-3 text-right font-bold">{{ formatMoney(row.grand_total) }}</td>
              <td class="px-4 py-3 text-right font-bold">{{ formatMoney(row.paid_amount + row.returned_amount) }}</td>
              <td class="px-4 py-3 text-right font-black">{{ formatMoney(row.balance_due) }}</td>
              <td class="px-4 py-3"><WorkspaceStatusBadge :status="row.status" /></td>
              <td class="px-4 py-3 text-right">
                <div class="flex flex-col gap-1">
                  <RouterLink class="font-black text-[#1d81af] hover:underline" :to="`/purchase/ap/bills/${row.bill_id}/ledger`">
                    Bill ledger
                  </RouterLink>
                  <RouterLink class="font-bold text-slate-500 hover:underline" :to="`/purchase/ap/vendors/${row.vendor_id}/ledger`">
                    Vendor ledger
                  </RouterLink>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
