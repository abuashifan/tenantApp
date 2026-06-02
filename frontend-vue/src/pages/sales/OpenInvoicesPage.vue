<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import BaseButton from '@/components/ui/BaseButton.vue'
import WorkspaceEmptyState from '@/components/workspace/WorkspaceEmptyState.vue'
import WorkspaceErrorState from '@/components/workspace/WorkspaceErrorState.vue'
import WorkspaceStatusBadge from '@/components/workspace/WorkspaceStatusBadge.vue'
import { errorText, formatDate, formatMoney } from '@/features/ar-ap-ledger/ledgerUtils'
import { getOpenInvoices, type ArOpenInvoiceRow } from '@/services/sales/ar.service'

const loading = ref(false)
const error = ref('')
const rows = ref<ArOpenInvoiceRow[]>([])
const search = ref('')

const filteredRows = computed(() => {
  const needle = search.value.trim().toLowerCase()
  if (!needle) return rows.value
  return rows.value.filter((row) => `${row.invoice_number} ${row.customer_name ?? ''}`.toLowerCase().includes(needle))
})

const balanceTotal = computed(() => rows.value.reduce((sum, row) => sum + Number(row.balance_due ?? 0), 0))

async function load() {
  loading.value = true
  error.value = ''
  try {
    rows.value = await getOpenInvoices()
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
  <section class="h-full min-h-0 min-w-0">
    <div class="flex h-full min-h-0 min-w-0 flex-col gap-2 rounded-b-2xl rounded-tr-2xl border border-slate-200 bg-white p-2.5 shadow-sm lg:p-3">
      <header class="flex min-w-0 flex-none flex-wrap items-center justify-between gap-2">
        <div class="min-w-0">
          <p class="text-xs font-semibold text-[#1d81af]">Sales & AR</p>
          <h1 class="truncate text-base font-black leading-5 text-slate-950">Open Invoices</h1>
        </div>
        <BaseButton variant="secondary" size="sm" :loading="loading" @click="load">Refresh</BaseButton>
      </header>

      <WorkspaceErrorState v-if="error" :message="error" @retry="load" />

      <div class="grid min-w-0 flex-none items-center gap-2 border-b border-slate-100 pb-2 md:grid-cols-[minmax(0,1fr)_auto]">
        <label class="min-w-0">
          <span class="sr-only">Search invoice/customer</span>
          <input v-model="search" class="h-9 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-[#24a1db] focus:ring-2 focus:ring-[#e9f6fb]" placeholder="Search invoice/customer" />
        </label>
        <div class="workspace-table-scroll flex min-w-0 flex-nowrap items-center gap-2 overflow-x-auto md:justify-end">
          <span class="inline-flex h-9 shrink-0 items-center rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-extrabold text-slate-600">
            Rows: {{ filteredRows.length }}
          </span>
          <span class="inline-flex h-9 shrink-0 items-center rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-extrabold text-slate-600">
            Outstanding: {{ formatMoney(balanceTotal) }}
          </span>
        </div>
      </div>

      <div v-if="loading" class="p-4 text-sm font-bold text-slate-500">Loading open invoices...</div>
      <WorkspaceEmptyState v-else-if="filteredRows.length === 0" title="No open invoices" />
      <div v-else class="workspace-table-scroll min-h-0 min-w-0 flex-1 overflow-auto rounded-2xl border border-slate-200">
        <table class="min-w-full divide-y divide-slate-100 text-sm">
          <thead class="bg-slate-50 text-left text-xs font-black uppercase tracking-wide text-slate-400">
            <tr>
              <th class="px-3 py-2">Invoice</th>
              <th class="px-3 py-2">Customer</th>
              <th class="px-3 py-2">Due Date</th>
              <th class="px-3 py-2 text-right">Total</th>
              <th class="px-3 py-2 text-right">Paid/Returned</th>
              <th class="px-3 py-2 text-right">Balance</th>
              <th class="px-3 py-2">Status</th>
              <th class="sticky right-0 bg-slate-50 px-3 py-2 text-right shadow-[-12px_0_18px_-18px_rgba(15,23,42,0.35)]">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="row in filteredRows" :key="row.invoice_id" class="hover:bg-slate-50">
              <td class="px-3 py-2">
                <p class="font-black text-slate-900">{{ row.invoice_number }}</p>
                <p class="text-xs font-semibold text-slate-500">{{ formatDate(row.invoice_date) }}</p>
              </td>
              <td class="px-3 py-2">{{ row.customer_name ?? '-' }}</td>
              <td class="px-3 py-2">{{ formatDate(row.due_date) }}</td>
              <td class="px-3 py-2 text-right font-bold">{{ formatMoney(row.grand_total) }}</td>
              <td class="px-3 py-2 text-right font-bold">{{ formatMoney(row.paid_amount + row.returned_amount) }}</td>
              <td class="px-3 py-2 text-right font-black">{{ formatMoney(row.balance_due) }}</td>
              <td class="px-3 py-2"><WorkspaceStatusBadge :status="row.status" /></td>
              <td class="sticky right-0 bg-white px-3 py-2 text-right shadow-[-12px_0_18px_-18px_rgba(15,23,42,0.35)]">
                <div class="flex flex-col gap-1">
                  <RouterLink class="font-black text-[#1d81af] hover:underline" :to="`/sales/ar/invoices/${row.invoice_id}/ledger`">
                    Invoice ledger
                  </RouterLink>
                  <RouterLink class="font-bold text-slate-500 hover:underline" :to="`/sales/ar/customers/${row.customer_id}/ledger`">
                    Customer ledger
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
