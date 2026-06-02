<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import BaseButton from '@/components/ui/BaseButton.vue'
import DateInput from '@/components/ui/DateInput.vue'
import WorkspaceEmptyState from '@/components/workspace/WorkspaceEmptyState.vue'
import WorkspaceErrorState from '@/components/workspace/WorkspaceErrorState.vue'
import {
  documentLabel,
  errorText,
  formatDate,
  formatMoney,
  ledgerTotals,
  type LedgerMovement,
} from '@/features/ar-ap-ledger/ledgerUtils'
import { getBillLedger, getVendorLedger } from '@/services/purchase/ap.service'
import { getCustomerLedger, getInvoiceLedger } from '@/services/sales/ar.service'

const props = defineProps<{
  kind: 'ar-customer' | 'ar-invoice' | 'ap-vendor' | 'ap-bill'
}>()

const route = useRoute()
const loading = ref(false)
const error = ref('')
const rows = ref<LedgerMovement[]>([])
const startDate = ref('')
const endDate = ref('')

const isAr = computed(() => props.kind.startsWith('ar'))
const isDocumentLedger = computed(() => props.kind === 'ar-invoice' || props.kind === 'ap-bill')
const routeId = computed(() => {
  const key = props.kind === 'ar-customer' ? 'customerId' : props.kind === 'ar-invoice' ? 'invoiceId' : props.kind === 'ap-vendor' ? 'vendorId' : 'billId'
  return Number(route.params[key])
})
const title = computed(() => {
  if (props.kind === 'ar-customer') return 'AR Customer Ledger'
  if (props.kind === 'ar-invoice') return 'AR Invoice Ledger'
  if (props.kind === 'ap-vendor') return 'AP Vendor Ledger'
  return 'AP Bill Ledger'
})
const subtitle = computed(() =>
  isAr.value
    ? 'Read-only receivable movements from posted invoices, receipts, deposit allocations, and returns.'
    : 'Read-only payable movements from posted bills, payments, deposit allocations, and purchase returns.',
)
const identityLabel = computed(() => {
  const first = rows.value[0]
  if (props.kind === 'ar-customer') return first?.customer_name ?? `Customer #${routeId.value}`
  if (props.kind === 'ar-invoice') return first?.document_number ?? `Invoice #${routeId.value}`
  if (props.kind === 'ap-vendor') return first?.vendor_name ?? `Vendor #${routeId.value}`
  return first?.document_number ?? `Bill #${routeId.value}`
})
const totals = computed(() => ledgerTotals(rows.value, isAr.value ? 'debit-minus-credit' : 'credit-minus-debit'))
const debitLabel = computed(() => (isAr.value ? 'Receivable Increase' : 'Payable Decrease'))
const creditLabel = computed(() => (isAr.value ? 'Receivable Decrease' : 'Payable Increase'))
const balanceLabel = computed(() => (isAr.value ? 'AR Balance' : 'AP Balance'))

async function fetchLedger() {
  if (!Number.isFinite(routeId.value) || routeId.value <= 0) {
    error.value = 'Invalid ledger identifier.'
    rows.value = []
    return
  }

  loading.value = true
  error.value = ''
  try {
    if (props.kind === 'ar-customer') {
      rows.value = (await getCustomerLedger(routeId.value, { start_date: startDate.value || undefined, end_date: endDate.value || undefined })).movements
    } else if (props.kind === 'ar-invoice') {
      rows.value = (await getInvoiceLedger(routeId.value)).movements
    } else if (props.kind === 'ap-vendor') {
      rows.value = (await getVendorLedger(routeId.value, { start_date: startDate.value || undefined, end_date: endDate.value || undefined })).movements
    } else {
      rows.value = (await getBillLedger(routeId.value)).movements
    }
  } catch (reason) {
    error.value = errorText(reason)
    rows.value = []
  } finally {
    loading.value = false
  }
}

watch(
  () => [route.fullPath, props.kind],
  () => {
    void fetchLedger()
  },
)

onMounted(fetchLedger)
</script>

<template>
  <section class="space-y-5">
    <div class="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p class="text-sm font-semibold text-[#1d81af]">{{ isAr ? 'Sales & AR' : 'Purchase & AP' }}</p>
          <h1 class="mt-2 text-3xl font-black tracking-tight text-slate-950">{{ title }}</h1>
          <p class="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{{ subtitle }}</p>
        </div>
        <BaseButton variant="secondary" :loading="loading" @click="fetchLedger">Refresh</BaseButton>
      </div>
    </div>

    <WorkspaceErrorState v-if="error" :message="error" @retry="fetchLedger" />

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
      <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
        <p class="text-xs font-black uppercase tracking-wide text-slate-400">{{ isAr ? 'Counterparty / Document' : 'Vendor / Document' }}</p>
        <p class="mt-2 text-xl font-black text-slate-950">{{ identityLabel }}</p>
        <p class="mt-1 text-sm text-slate-500">Ledger ID: {{ routeId }}</p>
      </div>
      <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p class="text-xs font-black uppercase tracking-wide text-slate-400">Opening Balance</p>
        <p class="mt-2 text-xl font-black text-slate-950">{{ formatMoney(totals.opening) }}</p>
      </div>
      <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p class="text-xs font-black uppercase tracking-wide text-slate-400">{{ debitLabel }}</p>
        <p class="mt-2 text-xl font-black text-slate-950">{{ formatMoney(totals.debit) }}</p>
      </div>
      <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p class="text-xs font-black uppercase tracking-wide text-slate-400">{{ creditLabel }}</p>
        <p class="mt-2 text-xl font-black text-slate-950">{{ formatMoney(totals.credit) }}</p>
      </div>
      <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p class="text-xs font-black uppercase tracking-wide text-slate-400">{{ balanceLabel }}</p>
        <p class="mt-2 text-xl font-black text-slate-950">{{ formatMoney(totals.ending) }}</p>
      </div>
    </div>

    <div v-if="!isDocumentLedger" class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div class="flex min-w-0 flex-col gap-3 xl:flex-row xl:items-end">
        <label class="text-sm font-bold text-slate-700">
          Start date
          <DateInput v-model="startDate" class="mt-2" />
        </label>
        <label class="text-sm font-bold text-slate-700">
          End date
          <DateInput v-model="endDate" class="mt-2" />
        </label>
        <BaseButton :loading="loading" @click="fetchLedger">Apply Filter</BaseButton>
      </div>
    </div>

    <div class="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div class="border-b border-slate-100 px-5 py-4">
        <h2 class="text-lg font-black text-slate-950">Ledger Movements</h2>
        <p class="mt-1 text-sm text-slate-500">{{ rows.length }} row(s)</p>
      </div>
      <div v-if="loading" class="p-6 text-sm font-bold text-slate-500">Loading ledger movements...</div>
      <WorkspaceEmptyState v-else-if="rows.length === 0" title="No ledger movements" description="No posted AR/AP movement matched this ledger." />
      <div v-else class="workspace-table-scroll min-w-0 overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-100 text-sm">
          <thead class="bg-slate-50 text-left text-xs font-black uppercase tracking-wide text-slate-400">
            <tr>
              <th class="px-4 py-3">Date</th>
              <th class="px-4 py-3">Document</th>
              <th class="px-4 py-3">Description</th>
              <th class="px-4 py-3 text-right">Debit</th>
              <th class="px-4 py-3 text-right">Credit</th>
              <th class="px-4 py-3 text-right">{{ balanceLabel }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="row in rows" :key="`${row.document_type}-${row.document_id}-${row.date}`" class="hover:bg-slate-50">
              <td class="whitespace-nowrap px-4 py-3 font-semibold text-slate-700">{{ formatDate(row.date) }}</td>
              <td class="px-4 py-3">
                <p class="font-black text-slate-900">{{ row.document_number ?? '-' }}</p>
                <p class="text-xs font-semibold text-slate-500">{{ documentLabel(row.document_type) }}</p>
              </td>
              <td class="px-4 py-3 text-slate-600">{{ row.description ?? '-' }}</td>
              <td class="whitespace-nowrap px-4 py-3 text-right font-bold text-slate-800">{{ formatMoney(row.debit) }}</td>
              <td class="whitespace-nowrap px-4 py-3 text-right font-bold text-slate-800">{{ formatMoney(row.credit) }}</td>
              <td class="whitespace-nowrap px-4 py-3 text-right font-black text-slate-950">{{ formatMoney(row.balance) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
