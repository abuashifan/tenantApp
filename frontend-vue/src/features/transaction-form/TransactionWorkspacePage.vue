<script setup lang="ts">
import { computed, h, ref } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'

import BaseButton from '@/components/ui/BaseButton.vue'
import WorkspaceStatusBadge from '@/components/workspace/WorkspaceStatusBadge.vue'
import WorkspaceModule from '@/components/workspace/WorkspaceModule.vue'
import VoidTransactionDialog from '@/components/dialog/VoidTransactionDialog.vue'

import TransactionFormPanel from '@/features/transaction-form/TransactionFormPanel.vue'

import { useWorkspaceTabsStore } from '@/stores/workspaceTabsStore'
import { usePermission } from '@/composables/usePermission'
import { toErrorMessage } from '@/composables/transaction-form/useTransactionValidation'
import type { RuntimeTransactionFormConfig } from '@/composables/transaction-form/types'

type TransactionListRow = {
  id: string
  number: string
  date: string
  partner: string
  status: string
  total: number
}

const props = defineProps<{
  config: RuntimeTransactionFormConfig
}>()

const tabs = useWorkspaceTabsStore()
const { can } = usePermission()
const bulkVoidIds = ref<string[]>([])
const bulkVoidOpen = ref(false)
const bulkVoidLoading = ref(false)
const reloadKey = ref(0)
const clearSelectionKey = ref(0)
const actionNotice = ref<string | null>(null)
const actionError = ref<string | null>(null)
const voidAction = computed(() => props.config.actions.find((action) => action.key === 'void'))
const canBulkVoid = computed(() => Boolean(voidAction.value && props.config.apiService.action && can(voidAction.value.permission)))

function mapRow(row: unknown): TransactionListRow {
  const r = (row ?? {}) as Record<string, unknown>
  const customer = (r.customer ?? {}) as Record<string, unknown>
  const vendor = (r.vendor ?? {}) as Record<string, unknown>
  const number =
    r.document_number ??
    r.invoice_number ??
    r.billing_number ??
    r.order_number ??
    r.quotation_number ??
    r.return_number ??
    r.receipt_number ??
    r.request_number ??
    r.bill_number ??
    r.payment_number ??
    r.deposit_number ??
    String(r.id ?? '')

  const date =
    r.document_date ??
    r.invoice_date ??
    r.billing_date ??
    r.order_date ??
    r.quotation_date ??
    r.delivery_date ??
    r.return_date ??
    r.receipt_date ??
    r.request_date ??
    r.bill_date ??
    r.payment_date ??
    r.deposit_date ??
    ''

  const partner =
    r.customer_name ??
    r.vendor_name ??
    customer.name ??
    vendor.name ??
    customer.contact_name ??
    vendor.contact_name ??
    ''

  const status = String(r.status ?? r.state ?? '')
  const total = Number(r.grand_total ?? r.total_amount ?? r.total ?? r.amount ?? 0)

  return { id: String(r.id ?? ''), number: String(number), date: String(date), partner: String(partner), status, total }
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(value)
}

function openCreate() {
  tabs.openCreateSecondaryTab(props.config.primaryTabId, { label: 'Data Baru' })
}

function openDetail(id: string, number?: string) {
  tabs.openDetailSecondaryTab(props.config.primaryTabId, { id, number })
}

function openEdit(id: string, number?: string) {
  tabs.openEditSecondaryTab(props.config.primaryTabId, { id, number })
}

const columns = computed<ColumnDef<TransactionListRow, unknown>[]>(() => [
  {
    accessorKey: 'number',
    header: 'Number',
    cell: ({ row }) => h('span', { class: 'font-bold text-slate-900' }, row.original.number),
  },
  { accessorKey: 'date', header: 'Date' },
  { accessorKey: 'partner', header: props.config.partnerType === 'vendor' ? 'Vendor' : 'Customer' },
  { accessorKey: 'status', header: 'Status', cell: ({ row }) => h(WorkspaceStatusBadge, { status: row.original.status }) },
  {
    accessorKey: 'total',
    header: () => h('div', { class: 'text-right' }, 'Total'),
    cell: ({ row }) => h('div', { class: 'text-right font-black tabular-nums text-slate-900' }, formatMoney(row.original.total)),
  },
  {
    id: 'actions',
    header: () => h('div', { class: 'text-right' }, 'Actions'),
    cell: ({ row }) =>
      h('div', { class: 'flex justify-end gap-2' }, [
        h(
          BaseButton,
          {
            variant: 'secondary',
            size: 'sm',
            onClick: (e: MouseEvent) => {
              e.stopPropagation()
              openDetail(row.original.id, row.original.number)
            },
          },
          () => 'Open',
        ),
        h(
          BaseButton,
          {
            variant: 'secondary',
            size: 'sm',
            onClick: (e: MouseEvent) => {
              e.stopPropagation()
              openEdit(row.original.id, row.original.number)
            },
          },
          () => 'Edit',
        ),
      ]),
    enableSorting: false,
  },
])

function closeSecondary(tabId?: string) {
  if (!tabId) return
  tabs.closeSecondaryTab(props.config.primaryTabId, tabId)
}

function openBulkVoid(ids: string[]) {
  if (!canBulkVoid.value || ids.length === 0) return
  bulkVoidIds.value = [...ids]
  actionNotice.value = null
  actionError.value = null
  bulkVoidOpen.value = true
}

async function confirmBulkVoid(payload: { reason: string }) {
  if (!props.config.apiService.action) return
  bulkVoidLoading.value = true
  const successes: string[] = []
  const failures: Array<{ id: string; error: string }> = []

  for (const id of bulkVoidIds.value) {
    try {
      await props.config.apiService.action('void', id, { reason: payload.reason })
      successes.push(id)
    } catch (cause) {
      failures.push({ id, error: toErrorMessage(cause) })
    }
  }

  reloadKey.value += 1
  if (failures.length === 0) {
    clearSelectionKey.value += 1
    bulkVoidOpen.value = false
  }
  actionNotice.value = `${successes.length} transaction(s) voided; ${failures.length} failed.`
  actionError.value = failures.map((item) => `${item.id}: ${item.error}`).join(' | ') || null
  bulkVoidLoading.value = false
}
</script>

<template>
  <WorkspaceModule
    :primary-id="config.primaryTabId"
    :columns="columns"
    :endpoint="config.listEndpoint"
    :map-row="mapRow"
    :create-label="`Create ${config.title}`"
    :show-edit-selected="false"
    :show-void="canBulkVoid"
    :reload-key="reloadKey"
    :clear-selection-key="clearSelectionKey"
    @create="openCreate"
    @void="openBulkVoid"
  >
    <template #form="{ tab }">
      <TransactionFormPanel :config="config" :tab="tab ?? null" @close="closeSecondary(tab?.id)" @changed="reloadKey += 1" />
    </template>
  </WorkspaceModule>
  <div v-if="actionNotice" class="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{{ actionNotice }}</div>
  <div v-if="actionError" class="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{{ actionError }}</div>
  <VoidTransactionDialog
    :open="bulkVoidOpen"
    :loading="bulkVoidLoading"
    :transaction-number="`${bulkVoidIds.length} selected ${config.title} transaction(s)`"
    @close="bulkVoidOpen = false"
    @confirm="confirmBulkVoid"
  />
</template>
