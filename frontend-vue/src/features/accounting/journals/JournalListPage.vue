<script setup lang="ts">
import { computed } from 'vue'

import JournalEntryFormPanel from '@/pages/accounting/journals/JournalEntryFormPanel.vue'
import WorkspaceListPage from '@/components/workspace/WorkspaceListPage.vue'
import { journalListConfig, type JournalListRow } from '@/features/accounting/journals/journal-list.config'
import { useWorkspaceTabsStore } from '@/stores/workspaceTabsStore'
import { useMockAccountingDataStore, type MockJournalStatus } from '@/stores/mockAccountingDataStore'

const mock = useMockAccountingDataStore()
const rows = computed<JournalListRow[]>(() =>
  mock.filteredJournals.map((j) => ({
    id: j.id,
    journal_number: j.journalNo,
    journal_date: j.date,
    memo: j.description,
    total_debit: j.totalDebit,
    total_credit: j.totalCredit,
    status: j.status,
    is_balanced: j.isBalanced,
    source: j.source,
    created_by: j.createdBy,
    updated_at: j.updatedAt,
  })),
)

const tabs = useWorkspaceTabsStore()

function handleSearch(value: string) {
  mock.setJournalSearch(value)
}

function handleStatusChange(status: string) {
  mock.setJournalStatusFilter((status || 'All') as MockJournalStatus | 'All')
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

  mock.voidJournal(payload.row.id)
}
</script>

<template>
  <WorkspaceListPage
    :config="journalListConfig"
    :rows="rows"
    :loading="false"
    :error="null"
    :search="mock.journalFilters.search"
    :start-date="''"
    :end-date="''"
    :status="mock.journalFilters.status === 'All' ? '' : mock.journalFilters.status"
    :selected-ids="[]"
    @refresh="() => undefined"
    @search="handleSearch"
    @status-change="handleStatusChange"
    @action-click="handleAction"
  >
    <template #secondary>
      <JournalEntryFormPanel />
    </template>
  </WorkspaceListPage>
</template>
