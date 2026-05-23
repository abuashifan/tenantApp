<script setup lang="ts">
import JournalEntryFormPanel from '@/pages/accounting/journals/JournalEntryFormPanel.vue'
import WorkspaceListPage from '@/components/workspace/WorkspaceListPage.vue'
import { useWorkspaceList } from '@/composables/useWorkspaceList'
import { journalListConfig } from '@/features/accounting/journals/journal-list.config'
import { listJournals, voidJournal, type JournalListRow } from '@/features/accounting/journals/journal.service'
import { useWorkspaceTabsStore } from '@/stores/workspaceTabsStore'

const list = useWorkspaceList<JournalListRow>({
  config: journalListConfig,
  fetcher: listJournals,
})

const tabs = useWorkspaceTabsStore()

async function handleSearch(value: string) {
  list.setSearch(value)
  await list.fetchRows()
}

async function handleDateChange(range: { startDate: string; endDate: string }) {
  list.setDateRange(range.startDate, range.endDate)
  await list.fetchRows()
}

async function handleStatusChange(status: string) {
  list.setStatus(status)
  await list.fetchRows()
}

async function handleAction(payload: { key: string; row?: JournalListRow }) {
  if (payload.key === 'create') {
    tabs.openCreateSecondaryTab(journalListConfig.primaryTabId, { label: journalListConfig.createLabel ?? 'Data Baru' })
    return
  }

  if (payload.key === 'edit' && payload.row) {
    tabs.openEditSecondaryTab(journalListConfig.primaryTabId, { id: payload.row.id, number: payload.row.journal_number })
    return
  }

  if ((payload.key === 'detail' || payload.key === 'open') && payload.row) {
    tabs.openDetailSecondaryTab(journalListConfig.primaryTabId, { id: payload.row.id, number: payload.row.journal_number })
    return
  }

  if (payload.key !== 'void' || !payload.row) return

  const reason = window.prompt('Reason for voiding selected journal')
  if (!reason) return

  await voidJournal(payload.row.id, reason)
  await list.refresh()
}
</script>

<template>
  <WorkspaceListPage
    :config="journalListConfig"
    :rows="list.rows.value"
    :loading="list.loading.value"
    :error="list.error.value"
    :search="list.filters.value.search"
    :start-date="list.filters.value.startDate"
    :end-date="list.filters.value.endDate"
    :status="list.status.value"
    :selected-ids="list.selectedIds.value"
    @refresh="list.refresh"
    @search="handleSearch"
    @date-change="handleDateChange"
    @status-change="handleStatusChange"
    @action-click="handleAction"
    @update:selected-ids="list.selectedIds.value = $event"
  >
    <template #secondary>
      <JournalEntryFormPanel />
    </template>
  </WorkspaceListPage>
</template>
