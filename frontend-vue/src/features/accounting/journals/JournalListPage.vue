<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { SortingState } from '@tanstack/vue-table'

import VoidTransactionDialog from '@/components/dialog/VoidTransactionDialog.vue'
import WorkspaceListPage from '@/components/workspace/WorkspaceListPage.vue'
import JournalEntryFormPanel from '@/pages/accounting/journals/JournalEntryFormPanel.vue'
import { journalListConfig, type JournalListRow } from '@/features/accounting/journals/journal-list.config'
import { listJournals, voidJournal as voidJournalApi } from '@/features/accounting/journals/journal.service'
import { useAuthStore } from '@/stores/authStore'
import { useWorkspaceTabsStore } from '@/stores/workspaceTabsStore'
import type { WorkspacePagination, WorkspaceStatusFilter } from '@/types/workspace'
import { currentMonthDateRange } from '@/utils/date'

const defaultJournalSorting: SortingState = [{ id: 'journal_date', desc: true }]
const defaultDateRange = currentMonthDateRange()

const tabs = useWorkspaceTabsStore()
const auth = useAuthStore()
tabs.ensureListSecondaryTab(journalListConfig.primaryTabId, {
  label: journalListConfig.listTabLabel,
})

const rows = ref<JournalListRow[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const search = ref('')
const startDate = ref(defaultDateRange.startDate)
const endDate = ref(defaultDateRange.endDate)
const status = ref<WorkspaceStatusFilter>([])
const selectedIds = ref<string[]>([])
const sorting = ref<SortingState>(defaultJournalSorting)
const pagination = ref<WorkspacePagination>({ page: 1, perPage: 10, total: 0, lastPage: 1 })
const bulkVoidOpen = ref(false)
const bulkVoidLoading = ref(false)

const canVoidPermission = computed(
  () => auth.permissions.includes('*') || auth.permissions.includes(journalListConfig.permissions?.void ?? 'journal.void'),
)
const selectedRows = computed(() => rows.value.filter((row) => selectedIds.value.includes(row.id)))
const selectedVoidRows = computed(() => selectedRows.value.filter(canVoidJournal))

function openCreate() {
  tabs.openCreateSecondaryTab(journalListConfig.primaryTabId, { label: journalListConfig.createLabel ?? 'Buat Jurnal' })
}

function openDetail(row: JournalListRow) {
  tabs.openDetailSecondaryTab(journalListConfig.primaryTabId, { id: row.id, number: row.journal_number })
}

function openEdit(row: JournalListRow) {
  tabs.openEditSecondaryTab(journalListConfig.primaryTabId, { id: row.id, number: row.journal_number })
}

function canVoidJournal(row: JournalListRow) {
  return row.status === 'posted'
}

function sortJournalRows(rows: JournalListRow[]) {
  return [...rows].sort((a, b) => {
    const dateCompare = b.journal_date.localeCompare(a.journal_date)
    if (dateCompare !== 0) return dateCompare
    return b.journal_number.localeCompare(a.journal_number)
  })
}

function clearSelection() {
  selectedIds.value = []
}

function updatePagination() {
  pagination.value = {
    ...pagination.value,
    total: rows.value.length,
    lastPage: Math.max(1, Math.ceil(rows.value.length / pagination.value.perPage)),
  }
}

async function voidJournal(row: JournalListRow) {
  if (!canVoidPermission.value || !canVoidJournal(row)) return
  const reason = window.prompt('Reason for voiding selected journal')
  if (!reason) return
  try {
    await voidJournalApi(row.id, reason)
    await load()
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Unable to void journal.'
  }
}

async function load() {
  loading.value = true
  error.value = null
  try {
    rows.value = sortJournalRows(await listJournals({
      search: search.value || undefined,
      date_from: startDate.value || undefined,
      date_to: endDate.value || undefined,
      status: status.value.length === 1 ? status.value[0] : undefined,
      include_void: status.value.length === 0 || status.value.includes('void'),
      sort_by: 'journal_date',
      sort_direction: 'desc',
    })).filter((row) => status.value.length === 0 || status.value.includes(row.status))
    selectedIds.value = selectedIds.value.filter((id) => rows.value.some((row) => row.id === id && canVoidJournal(row)))
    updatePagination()
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Endpoint belum tersedia'
  } finally {
    loading.value = false
  }
}

function applyFilters() {
  clearSelection()
  pagination.value = { ...pagination.value, page: 1 }
  void load()
}

function updateSearch(value: string) {
  search.value = value
  applyFilters()
}

function updateDates(range: { startDate: string; endDate: string }) {
  startDate.value = range.startDate
  endDate.value = range.endDate
  applyFilters()
}

function updateStatus(value: WorkspaceStatusFilter) {
  status.value = value
  applyFilters()
}

function resetFilters() {
  search.value = ''
  const nextDateRange = currentMonthDateRange()
  startDate.value = nextDateRange.startDate
  endDate.value = nextDateRange.endDate
  status.value = []
  sorting.value = defaultJournalSorting
  clearSelection()
  pagination.value = { ...pagination.value, page: 1 }
  void load()
}

function refresh() {
  clearSelection()
  void load()
}

function updatePage(page: number) {
  pagination.value = { ...pagination.value, page }
}

function updatePerPage(perPage: number) {
  pagination.value = { ...pagination.value, page: 1, perPage }
  updatePagination()
}

function updateSorting(value: SortingState) {
  sorting.value = value.length ? value : defaultJournalSorting
}

function handleAction(payload: { key: string; row?: JournalListRow }) {
  if (payload.key === 'create') openCreate()
  if (payload.row && payload.key === 'detail') openDetail(payload.row)
  if (payload.row && payload.key === 'edit') openEdit(payload.row)
  if (payload.row && payload.key === 'void') void voidJournal(payload.row)
}

function handleBulkAction(payload: { key: string; selectedIds: string[] }) {
  if (payload.key !== 'void' || !canVoidPermission.value || payload.selectedIds.length === 0) return
  bulkVoidOpen.value = true
}

async function confirmBulkVoid(payload: { reason: string }) {
  const targets = [...selectedVoidRows.value]
  if (targets.length === 0) {
    bulkVoidOpen.value = false
    return
  }

  bulkVoidLoading.value = true
  try {
    for (const row of targets) {
      await voidJournalApi(row.id, payload.reason)
    }
    clearSelection()
    bulkVoidOpen.value = false
    await load()
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Unable to void selected journals.'
  } finally {
    bulkVoidLoading.value = false
  }
}

onMounted(load)
</script>

<template>
  <WorkspaceListPage
    v-model:selected-ids="selectedIds"
    :config="journalListConfig"
    :rows="rows"
    :loading="loading"
    :error="error"
    :search="search"
    :start-date="startDate"
    :end-date="endDate"
    :status="status"
    :pagination="pagination"
    :sorting="sorting"
    @refresh="refresh"
    @search="updateSearch"
    @date-change="updateDates"
    @status-change="updateStatus"
    @page-change="updatePage"
    @per-page-change="updatePerPage"
    @sort-change="updateSorting"
    @action-click="handleAction"
    @bulk-action-click="handleBulkAction"
  >
    <template #secondary>
      <JournalEntryFormPanel />
    </template>
  </WorkspaceListPage>

  <VoidTransactionDialog
    :open="bulkVoidOpen"
    :loading="bulkVoidLoading"
    :transaction-number="`${selectedVoidRows.length} selected journal${selectedVoidRows.length === 1 ? '' : 's'}`"
    @close="bulkVoidOpen = false"
    @confirm="confirmBulkVoid"
  />
</template>
