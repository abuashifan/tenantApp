<script setup lang="ts">
import { computed, ref } from 'vue'

import DataTable from '@/components/table/DataTable.vue'
import DataTableCheckbox from '@/components/table/DataTableCheckbox.vue'
import DataTableStatusBadge from '@/components/table/DataTableStatusBadge.vue'
import DataTableToolbar from '@/components/table/DataTableToolbar.vue'
import SecondaryTabsBar from '@/components/navigation/SecondaryTabsBar.vue'
import UnsavedChangesDialog from '@/components/dialog/UnsavedChangesDialog.vue'
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
tabs.ensureListSecondaryTab(PRIMARY_ID)

const activeSecondaryId = computed(() => tabs.activeSecondaryTabIdByPrimaryId[PRIMARY_ID] ?? `${PRIMARY_ID}::list`)
const secondaryTabs = computed(() => tabs.secondaryTabsByPrimaryId[PRIMARY_ID] ?? [])
const activeSecondary = computed(() => secondaryTabs.value.find((t) => t.id === activeSecondaryId.value) ?? null)

const search = ref('')
const startDate = ref('')
const endDate = ref('')
const selectedIds = ref<string[]>([])

const rows = ref<TxRow[]>([
  { id: 'JRN.2026.0001', number: 'JRN.2026.0001', date: '2026-05-01', status: 'Draft', memo: 'Opening', total: 1250000 },
  { id: 'JRN.2026.0002', number: 'JRN.2026.0002', date: '2026-05-02', status: 'Posted', memo: 'Office expense', total: 420000 },
  { id: 'JRN.2026.0003', number: 'JRN.2026.0003', date: '2026-05-03', status: 'Posted', memo: 'Sales adjustment', total: 3200000 },
])

const filteredRows = computed(() => {
  const q = search.value.trim().toLowerCase()
  return rows.value.filter((r) => {
    const matchSearch = q === '' || r.number.toLowerCase().includes(q) || r.memo.toLowerCase().includes(q)
    const matchStart = startDate.value === '' || r.date >= startDate.value
    const matchEnd = endDate.value === '' || r.date <= endDate.value
    return matchSearch && matchStart && matchEnd
  })
})

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

function handleEditFirstSelected() {
  const id = selectedIds.value[0]
  const entity = rows.value.find((r) => r.id === id)
  if (!entity) return
  tabs.openEditSecondaryTab(PRIMARY_ID, { id: entity.id, number: entity.number })
}

const closePendingId = ref<string | null>(null)
const unsavedOpen = computed(() => closePendingId.value != null)

function requestClose(tabId: string) {
  const tab = secondaryTabs.value.find((t) => t.id === tabId)
  if (!tab || !tab.closable) return
  if (!tab.dirty) {
    tabs.closeSecondaryTab(PRIMARY_ID, tabId)
    return
  }
  closePendingId.value = tabId
}

function discardClose() {
  if (!closePendingId.value) return
  tabs.clearDraftState(closePendingId.value)
  tabs.closeSecondaryTab(PRIMARY_ID, closePendingId.value)
  closePendingId.value = null
}

function saveClose() {
  if (!closePendingId.value) return
  notify('Save (placeholder) before close')
  tabs.setSecondaryDirty(closePendingId.value, false)
  tabs.closeSecondaryTab(PRIMARY_ID, closePendingId.value)
  closePendingId.value = null
}
</script>

<template>
  <div class="space-y-4">
    <SecondaryTabsBar
      :tabs="secondaryTabs"
      :active-id="activeSecondaryId"
      @activate="(id) => tabs.activateSecondaryTab(PRIMARY_ID, id)"
      @close="requestClose"
    />

    <div v-if="activeSecondary?.mode === 'list'" class="space-y-4">
      <DataTableToolbar
        v-model:search="search"
        v-model:startDate="startDate"
        v-model:endDate="endDate"
        :selected-count="selectedIds.length"
        @filter="() => notify('Filter menu (placeholder)')"
        @create="handleCreate"
        @void="() => notify('Void (placeholder)')"
      />

      <div class="flex justify-end">
        <button
          type="button"
          class="text-xs font-bold text-slate-500 hover:text-slate-900"
          :class="selectedIds.length === 0 ? 'pointer-events-none opacity-50' : ''"
          @click="handleEditFirstSelected"
        >
          Edit first selected (placeholder)
        </button>
      </div>

      <DataTable :columns="columns" :data="filteredRows" v-model:selected-ids="selectedIds" />
    </div>

    <div v-else class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <JournalEntryFormPanel />
    </div>

    <UnsavedChangesDialog
      :open="unsavedOpen"
      @close="closePendingId = null"
      @discard="discardClose"
      @save="saveClose"
    />
  </div>
</template>
