<script setup lang="ts">
import { computed, h, ref } from 'vue'
import type { ColumnDef, SortingState } from '@tanstack/vue-table'

import WorkspaceStatusBadge from '@/components/workspace/WorkspaceStatusBadge.vue'
import WorkspaceModule from '@/components/workspace/WorkspaceModule.vue'
import VoidTransactionDialog from '@/components/dialog/VoidTransactionDialog.vue'

import TransactionFormPanel from '@/features/transaction-form/TransactionFormPanel.vue'

import { useWorkspaceTabsStore } from '@/stores/workspaceTabsStore'
import { usePermission } from '@/composables/usePermission'
import { toErrorMessage } from '@/composables/transaction-form/useTransactionValidation'
import type { RuntimeTransactionFormConfig, TransactionActionConfig } from '@/composables/transaction-form/types'
import type { WorkspaceStatusOption } from '@/types/workspace'
import { formatDisplayDate } from '@/utils/date'

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
const bulkActionIds = ref<string[]>([])
const bulkActionOpen = ref(false)
const bulkActionLoading = ref(false)
const pendingBulkAction = ref<TransactionActionConfig | null>(null)
const reloadKey = ref(0)
const clearSelectionKey = ref(0)
const defaultSorting: SortingState = [{ id: 'date', desc: true }]
const actionNotice = ref<string | null>(null)
const actionError = ref<string | null>(null)
const bulkLifecycleKeys = new Set(['cancel', 'reject', 'close', 'void'])
const bulkLifecycleActions = computed(() => {
  if (!props.config.apiService.action) return []
  return props.config.actions
    .filter((action) => bulkLifecycleKeys.has(action.key))
    .filter((action) => can(action.permission))
    .map((action) => ({
      key: action.key,
      label: action.label,
      variant: action.variant ?? (action.key === 'close' ? 'secondary' : 'danger'),
    }))
})
const statusOptions = computed<WorkspaceStatusOption[]>(() => {
  const statuses = new Set<string>()
  for (const action of props.config.actions) {
    for (const status of action.whenStatusIn ?? []) statuses.add(status)
  }
  return Array.from(statuses).map((value) => ({
    value,
    label: value
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' '),
  }))
})

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

  return {
    id: String(r.id ?? ''),
    number: String(number),
    date: formatDisplayDate(date),
    partner: String(partner),
    status,
    total,
  }
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(value)
}

function openCreate() {
  tabs.openCreateSecondaryTab(props.config.primaryTabId, { label: 'Data Baru' })
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
])

function closeSecondary(tabId?: string) {
  if (!tabId) return
  tabs.closeSecondaryTab(props.config.primaryTabId, tabId)
}

function supportsActionForStatus(action: TransactionActionConfig, status: string) {
  if (!action.whenStatusIn?.length) return true
  return action.whenStatusIn.includes(status.toLowerCase())
}

function openBulkLifecycleAction(payload: { key: string; selectedIds: string[]; selectedRows: TransactionListRow[] }) {
  if (!props.config.apiService.action || payload.selectedIds.length === 0) return
  const action = props.config.actions.find((item) => item.key === payload.key)
  if (!action || !bulkLifecycleKeys.has(action.key) || !can(action.permission)) return

  const actionableRows = payload.selectedRows.filter((row) => supportsActionForStatus(action, row.status))
  const skipped = payload.selectedRows.length - actionableRows.length
  if (actionableRows.length === 0) {
    actionError.value = `Tidak ada row terpilih yang statusnya valid untuk ${action.label}.`
    actionNotice.value = null
    return
  }

  bulkActionIds.value = actionableRows.map((row) => row.id)
  pendingBulkAction.value = action
  actionNotice.value = null
  actionError.value = skipped > 0 ? `${skipped} row dilewati karena statusnya tidak valid untuk ${action.label}.` : null
  bulkActionOpen.value = true
}

async function confirmBulkLifecycleAction(payload: { reason: string }) {
  const action = pendingBulkAction.value
  if (!props.config.apiService.action || !action) return
  bulkActionLoading.value = true
  const successes: string[] = []
  const failures: Array<{ id: string; error: string }> = []

  for (const id of bulkActionIds.value) {
    try {
      const body = action.requiresReason ? { reason: payload.reason } : undefined
      await props.config.apiService.action(action.key, id, body)
      successes.push(id)
    } catch (cause) {
      failures.push({ id, error: toErrorMessage(cause) })
    }
  }

  reloadKey.value += 1
  if (failures.length === 0) {
    clearSelectionKey.value += 1
    bulkActionOpen.value = false
  }
  actionNotice.value = `${successes.length} transaction(s) ${action.label.toLowerCase()} processed; ${failures.length} failed.`
  actionError.value = failures.map((item) => `${item.id}: ${item.error}`).join(' | ') || null
  bulkActionLoading.value = false
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
    :show-void="false"
    :bulk-actions="bulkLifecycleActions"
    :status-options="statusOptions"
    :reload-key="reloadKey"
    :clear-selection-key="clearSelectionKey"
    :default-sorting="defaultSorting"
    @create="openCreate"
    @bulk-action="openBulkLifecycleAction"
    @row-click="(row) => openEdit(row.id, row.number)"
  >
    <template #form="{ tab }">
      <TransactionFormPanel :config="config" :tab="tab ?? null" @close="closeSecondary(tab?.id)" @changed="reloadKey += 1" />
    </template>
  </WorkspaceModule>
  <div v-if="actionNotice" class="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{{ actionNotice }}</div>
  <div v-if="actionError" class="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{{ actionError }}</div>
  <VoidTransactionDialog
    :open="bulkActionOpen"
    :loading="bulkActionLoading"
    :transaction-number="`${bulkActionIds.length} selected ${config.title} transaction(s)`"
    :action-label="pendingBulkAction?.label"
    :requires-reason="pendingBulkAction?.requiresReason"
    @close="bulkActionOpen = false"
    @confirm="confirmBulkLifecycleAction"
  />
</template>
