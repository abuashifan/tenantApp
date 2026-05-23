<script setup lang="ts">
import { computed, ref } from 'vue'

import DataTableCheckbox from '@/components/table/DataTableCheckbox.vue'
import DataTableStatusBadge from '@/components/table/DataTableStatusBadge.vue'
import WorkspaceModule from '@/components/workspace/WorkspaceModule.vue'
import JournalEntryFormPanel from '@/pages/accounting/journals/JournalEntryFormPanel.vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import { useWorkspaceTabsStore } from '@/stores/workspaceTabsStore'

type TxRow = {
  id: string
  number: string
  date: string
  status: 'Draft' | 'Posted' | 'Void'
  memo: string
  total: number
}

const PRIMARY_ID = '/accounting/journals'

const tabs = useWorkspaceTabsStore()

const rows = ref<TxRow[]>([
  { id: 'JRN.2026.0001', number: 'JRN.2026.0001', date: '2026-05-01', status: 'Draft', memo: 'Opening', total: 1250000 },
  { id: 'JRN.2026.0002', number: 'JRN.2026.0002', date: '2026-05-02', status: 'Posted', memo: 'Office expense', total: 420000 },
  { id: 'JRN.2026.0003', number: 'JRN.2026.0003', date: '2026-05-03', status: 'Posted', memo: 'Sales adjustment', total: 3200000 },
])

function formatMoney(value: number) {
  return new Intl.NumberFormat('id-ID').format(value)
}

const columns = computed<ColumnDef<TxRow, unknown>[]>(() => [
  {
    id: 'select',
    header: ({ table }) =>
      h(DataTableCheckbox, {
        checked: table.getIsAllPageRowsSelected(),
        indeterminate: table.getIsSomePageRowsSelected(),
        ariaLabel: 'Select all',
        onChange: (checked: boolean) => table.toggleAllPageRowsSelected(checked),
      }),
    cell: ({ row }) =>
      h(DataTableCheckbox, {
        checked: row.getIsSelected(),
        indeterminate: row.getIsSomeSelected(),
        ariaLabel: `Select ${row.id}`,
        onChange: (checked: boolean) => row.toggleSelected(checked),
      }),
    enableSorting: false,
  },
  { accessorKey: 'number', header: 'Number', cell: ({ row }) => row.original.number },
  { accessorKey: 'date', header: 'Date', cell: ({ row }) => row.original.date },
  { accessorKey: 'status', header: 'Status', cell: ({ row }) => h(DataTableStatusBadge, { status: row.original.status }) },
  { accessorKey: 'memo', header: 'Memo', cell: ({ row }) => row.original.memo },
  { accessorKey: 'total', header: 'Total', cell: ({ row }) => formatMoney(row.original.total) },
])

function handleCreate() {
  tabs.openCreateSecondaryTab(PRIMARY_ID, { label: 'Data Baru' })
}

function notify(message: string) {
  alert(message)
}

function handleEditFirstSelected(id: string) {
  const entity = rows.value.find((r) => r.id === id)
  if (!entity) return
  tabs.openEditSecondaryTab(PRIMARY_ID, { id: entity.id, number: entity.number })
}
</script>

<template>
  <WorkspaceModule
    :primary-id="PRIMARY_ID"
    :rows="rows"
    :columns="columns"
    empty-title="No journals"
    empty-description="No journal entries match your filter."
    @filter="() => notify('Filter menu (placeholder)')"
    @create="handleCreate"
    @void="() => notify('Void (placeholder)')"
    @edit-first-selected="handleEditFirstSelected"
    @save-dirty-tab="() => notify('Save (placeholder) before close')"
  >
    <template #form>
      <JournalEntryFormPanel />
    </template>
  </WorkspaceModule>
</template>
