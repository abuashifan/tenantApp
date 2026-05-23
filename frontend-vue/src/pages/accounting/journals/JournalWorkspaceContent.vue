<script setup lang="ts">
import { computed, h, ref } from 'vue'

import DataTableStatusBadge from '@/components/table/DataTableStatusBadge.vue'
import WorkspaceModule from '@/components/workspace/WorkspaceModule.vue'
import JournalEntryFormPanel from '@/pages/accounting/journals/JournalEntryFormPanel.vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { api } from '@/api'
import { unwrap, type ApiResponse } from '@/services/apiResponse'
import { useWorkspaceTabsStore } from '@/stores/workspaceTabsStore'

type TxRow = {
  id: string
  number: string
  date: string
  status: string
  memo: string
  total: number
}

type BackendJournal = {
  id: string | number
  journal_number?: string | null
  number?: string | null
  journal_date?: string | null
  date?: string | null
  status?: string | null
  description?: string | null
  memo?: string | null
  total?: string | number | null
  total_debit?: string | number | null
  metadata?: Record<string, unknown> | null
}

const PRIMARY_ID = '/accounting/journals'

const tabs = useWorkspaceTabsStore()
const reloadKey = ref(0)

function formatMoney(value: number) {
  return new Intl.NumberFormat('id-ID').format(value)
}

function normalizeStatus(status?: string | null) {
  if (!status) return 'Draft'
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function normalizeDate(value?: string | null) {
  if (!value) return '-'
  return value.slice(0, 10)
}

function normalizeNumber(value: unknown) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function mapJournalRow(row: unknown): TxRow {
  const journal = row as BackendJournal
  const id = String(journal.id)
  const number = journal.journal_number ?? journal.number ?? id

  return {
    id,
    number,
    date: normalizeDate(journal.journal_date ?? journal.date),
    status: normalizeStatus(journal.status),
    memo: journal.description ?? journal.memo ?? '-',
    total: normalizeNumber(journal.total_debit ?? journal.total ?? journal.metadata?.total),
  }
}

const columns = computed<ColumnDef<TxRow, unknown>[]>(() => [
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
  tabs.openEditSecondaryTab(PRIMARY_ID, { id, number: id })
}

async function handleVoid(selectedIds: string[]) {
  if (selectedIds.length === 0) return

  const reason = window.prompt('Reason for voiding selected journal(s)')
  if (!reason) return

  await Promise.all(
    selectedIds.map(async (id) => {
      const response = await api.post<ApiResponse<BackendJournal>>(`/journals/${id}/void`, { reason })
      unwrap(response.data)
    }),
  )

  reloadKey.value += 1
}
</script>

<template>
  <WorkspaceModule
    :primary-id="PRIMARY_ID"
    endpoint="/journals"
    :map-row="mapJournalRow"
    :columns="columns"
    :reload-key="reloadKey"
    search-placeholder="Search journal number or memo…"
    create-label="Create New"
    void-label="Void"
    edit-selected-label="Edit selected"
    empty-title="No journals"
    empty-description="No journal entries match your filter."
    @create="handleCreate"
    @void="handleVoid"
    @edit-first-selected="handleEditFirstSelected"
    @save-dirty-tab="() => notify('Save (placeholder) before close')"
  >
    <template #form>
      <JournalEntryFormPanel />
    </template>
  </WorkspaceModule>
</template>
