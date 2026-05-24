<script setup lang="ts">
import { computed, h, ref } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { Plus, RefreshCw } from 'lucide-vue-next'

import BaseButton from '@/components/ui/BaseButton.vue'
import BaseMultiSelect from '@/components/ui/BaseMultiSelect.vue'
import DataTable from '@/components/table/DataTable.vue'
import WorkspaceStatusBadge from '@/components/workspace/WorkspaceStatusBadge.vue'
import JournalEntryFormPanel from '@/pages/accounting/journals/JournalEntryFormPanel.vue'
import { journalListConfig, type JournalListRow } from '@/features/accounting/journals/journal-list.config'
import { useWorkspaceTabsStore } from '@/stores/workspaceTabsStore'
import { useMockAccountingDataStore, type MockJournalStatus } from '@/stores/mockAccountingDataStore'

const statusOptions = [
  { label: 'Draft', value: 'Draft' },
  { label: 'Posted', value: 'Posted' },
  { label: 'Void', value: 'Void' },
]

const mock = useMockAccountingDataStore()
const tabs = useWorkspaceTabsStore()
tabs.ensureListSecondaryTab(journalListConfig.primaryTabId, {
  label: journalListConfig.listTabLabel,
})

const selectedIds = ref<string[]>([])
const statusSelect = ref<InstanceType<typeof BaseMultiSelect> | null>(null)

const activeSecondaryId = computed(
  () => tabs.activeSecondaryTabIdByPrimaryId[journalListConfig.primaryTabId] ?? `${journalListConfig.primaryTabId}::list`,
)
const secondaryTabs = computed(() => tabs.secondaryTabsByPrimaryId[journalListConfig.primaryTabId] ?? [])
const activeSecondary = computed(() => secondaryTabs.value.find((tab) => tab.id === activeSecondaryId.value) ?? null)

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

const search = computed({
  get: () => mock.journalFiltersDraft.search,
  set: (value: string) => mock.setJournalSearch(value),
})

const startDate = computed({
  get: () => mock.journalFiltersDraft.startDate,
  set: (value: string) => mock.setJournalDateRange(value, mock.journalFiltersDraft.endDate),
})

const endDate = computed({
  get: () => mock.journalFiltersDraft.endDate,
  set: (value: string) => mock.setJournalDateRange(mock.journalFiltersDraft.startDate, value),
})

const statuses = computed({
  get: () => mock.journalFiltersDraft.statuses,
  set: (value: string[]) => mock.setJournalStatuses(value as MockJournalStatus[]),
})

function formatMoney(value: number) {
  return new Intl.NumberFormat('id-ID').format(value)
}

function openCreate() {
  tabs.openCreateSecondaryTab(journalListConfig.primaryTabId, { label: journalListConfig.createLabel ?? 'Buat Jurnal' })
}

function openDetail(row: JournalListRow) {
  tabs.openDetailSecondaryTab(journalListConfig.primaryTabId, { id: row.id, number: row.journal_number })
}

function openEdit(row: JournalListRow) {
  tabs.openEditSecondaryTab(journalListConfig.primaryTabId, { id: row.id, number: row.journal_number })
}

function voidJournal(row: JournalListRow) {
  const reason = window.prompt('Reason for voiding selected journal')
  if (!reason) return
  mock.voidJournal(row.id)
}

function applyFilters() {
  mock.applyJournalFilters()
  statusSelect.value?.close()
}

function resetFilters() {
  mock.resetJournalFilters()
  statusSelect.value?.close()
}

function refresh() {
  mock.applyJournalFilters()
}

const columns = computed<ColumnDef<JournalListRow, unknown>[]>(() => [
  {
    accessorKey: 'journal_number',
    header: 'Number',
    cell: ({ row }) => h('span', { class: 'font-bold text-slate-900' }, row.original.journal_number),
  },
  {
    accessorKey: 'journal_date',
    header: 'Date',
    cell: ({ row }) => row.original.journal_date,
  },
  {
    accessorKey: 'memo',
    header: 'Memo',
    cell: ({ row }) => h('span', { class: 'text-slate-700' }, row.original.memo),
  },
  {
    accessorKey: 'total_debit',
    header: () => h('div', { class: 'text-right' }, 'Total Debit'),
    cell: ({ row }) => h('div', { class: 'text-right font-bold tabular-nums text-slate-900' }, formatMoney(row.original.total_debit)),
  },
  {
    accessorKey: 'total_credit',
    header: () => h('div', { class: 'text-right' }, 'Total Credit'),
    cell: ({ row }) => h('div', { class: 'text-right font-bold tabular-nums text-slate-900' }, formatMoney(row.original.total_credit)),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => h(WorkspaceStatusBadge, { status: row.original.status }),
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
            onClick: (event: MouseEvent) => {
              event.stopPropagation()
              openDetail(row.original)
            },
          },
          () => 'Open',
        ),
        row.original.status === 'Draft'
          ? h(
              BaseButton,
              {
                variant: 'secondary',
                size: 'sm',
                onClick: (event: MouseEvent) => {
                  event.stopPropagation()
                  openEdit(row.original)
                },
              },
              () => 'Edit',
            )
          : null,
        row.original.status === 'Posted'
          ? h(
              BaseButton,
              {
                variant: 'danger',
                size: 'sm',
                onClick: (event: MouseEvent) => {
                  event.stopPropagation()
                  voidJournal(row.original)
                },
              },
              () => 'Void',
            )
          : null,
      ]),
    enableSorting: false,
  },
])
</script>

<template>
  <div v-if="activeSecondary?.mode === 'list'" class="flex h-full min-h-0 flex-col gap-2 overflow-hidden">
    <div class="flex flex-col gap-2 rounded-3xl border border-slate-200 bg-white px-4 py-1.5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 class="text-xl font-black leading-tight text-slate-950">Journal Entries</h1>
      </div>
      <div class="flex flex-wrap gap-2">
        <BaseButton variant="secondary" size="sm" @click="refresh">
          <RefreshCw class="h-4 w-4" />
          Refresh
        </BaseButton>
        <BaseButton variant="primary" size="sm" @click="openCreate">
          <Plus class="h-4 w-4" />
          Buat Jurnal
        </BaseButton>
      </div>
    </div>

    <div class="relative z-20 rounded-3xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
      <div class="grid gap-3 xl:grid-cols-[minmax(250px,1.4fr)_150px_150px_190px_auto_auto] xl:items-end">
        <label class="space-y-1">
          <span class="block text-xs font-extrabold text-slate-600">Search</span>
          <input
            v-model="search"
            class="h-8 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-4 focus:ring-slate-900/5"
            placeholder="Cari nomor jurnal, memo, atau akun..."
          />
        </label>

        <label class="space-y-1">
          <span class="block text-xs font-extrabold text-slate-600">Start Date</span>
          <input
            v-model="startDate"
            type="date"
            class="h-8 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-900/5"
          />
        </label>

        <label class="space-y-1">
          <span class="block text-xs font-extrabold text-slate-600">End Date</span>
          <input
            v-model="endDate"
            type="date"
            class="h-8 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-900/5"
          />
        </label>

        <div class="space-y-1">
          <span class="block text-xs font-extrabold text-slate-600">Status</span>
          <BaseMultiSelect
            ref="statusSelect"
            v-model="statuses"
            :options="statusOptions"
            all-label="All status"
            none-label="No status"
            aria-label="Status filter options"
          />
        </div>

        <BaseButton variant="secondary" size="sm" @click="resetFilters">Reset</BaseButton>
        <BaseButton variant="primary" size="sm" @click="applyFilters">Apply</BaseButton>
      </div>
    </div>

    <DataTable
      v-model:selected-ids="selectedIds"
      class="min-h-0"
      :columns="columns"
      :data="rows"
      :loading="false"
      :selectable="true"
      :compact="true"
      :fill-available="true"
      :show-meta="true"
      meta-title="Journal List"
      meta-description="Showing journals from current company. Posted journals can only be voided, not edited."
      empty-title="No journals"
      empty-description="No journal entries match your filter."
    />
  </div>

  <div v-else class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <JournalEntryFormPanel />
  </div>
</template>
