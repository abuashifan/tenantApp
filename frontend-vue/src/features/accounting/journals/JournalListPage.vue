<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { Plus, RefreshCw, Slash } from 'lucide-vue-next'

import BaseButton from '@/components/ui/BaseButton.vue'
import BaseMultiSelect from '@/components/ui/BaseMultiSelect.vue'
import DataTable from '@/components/table/DataTable.vue'
import WorkspaceConfirmDialog from '@/components/workspace/WorkspaceConfirmDialog.vue'
import WorkspaceStatusBadge from '@/components/workspace/WorkspaceStatusBadge.vue'
import JournalEntryFormPanel from '@/pages/accounting/journals/JournalEntryFormPanel.vue'
import { journalListConfig, type JournalListRow } from '@/features/accounting/journals/journal-list.config'
import { listJournals, voidJournal as voidJournalApi } from '@/features/accounting/journals/journal.service'
import { useAuthStore } from '@/stores/authStore'
import { useWorkspaceTabsStore } from '@/stores/workspaceTabsStore'

const statusOptions = [
  { label: 'Draft', value: 'draft' },
  { label: 'Posted', value: 'posted' },
  { label: 'Void', value: 'void' },
]

const tabs = useWorkspaceTabsStore()
const auth = useAuthStore()
tabs.ensureListSecondaryTab(journalListConfig.primaryTabId, {
  label: journalListConfig.listTabLabel,
})

const selectedIds = ref<string[]>([])
const bulkVoidOpen = ref(false)
const bulkVoidLoading = ref(false)
const statusSelect = ref<InstanceType<typeof BaseMultiSelect> | null>(null)
const rows = ref<JournalListRow[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const search = ref('')
const startDate = ref('2026-01-01')
const endDate = ref('2026-01-31')
const statuses = ref<string[]>(['posted'])

const activeSecondaryId = computed(
  () => tabs.activeSecondaryTabIdByPrimaryId[journalListConfig.primaryTabId] ?? `${journalListConfig.primaryTabId}::list`,
)
const secondaryTabs = computed(() => tabs.secondaryTabsByPrimaryId[journalListConfig.primaryTabId] ?? [])
const activeSecondary = computed(() => secondaryTabs.value.find((tab) => tab.id === activeSecondaryId.value) ?? null)
const canVoidPermission = computed(
  () => auth.permissions.includes('*') || auth.permissions.includes(journalListConfig.permissions?.void ?? 'journal.void'),
)
const selectedRows = computed(() => rows.value.filter((row) => selectedIds.value.includes(row.id)))
const selectedVoidRows = computed(() => selectedRows.value.filter(canVoidJournal))

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

function canVoidJournal(row: JournalListRow) {
  return row.status === 'posted'
}

function clearSelection() {
  selectedIds.value = []
}

function openBulkVoid() {
  if (!canVoidPermission.value || selectedVoidRows.value.length === 0) return
  bulkVoidOpen.value = true
}

async function confirmBulkVoid() {
  const targets = [...selectedVoidRows.value]
  if (targets.length === 0) {
    bulkVoidOpen.value = false
    return
  }

  const reason = window.prompt('Reason for voiding selected journals')
  if (!reason) return

  bulkVoidLoading.value = true
  try {
    for (const row of targets) {
      await voidJournalApi(row.id, reason)
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

async function load() {
  loading.value = true
  error.value = null
  try {
    const status = statuses.value.length === 1 ? statuses.value[0] : undefined
    rows.value = await listJournals({
      search: search.value || undefined,
      date_from: startDate.value || undefined,
      date_to: endDate.value || undefined,
      status,
      include_void: statuses.value.includes('void'),
    })
    selectedIds.value = selectedIds.value.filter((id) => rows.value.some((row) => row.id === id && canVoidJournal(row)))
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Endpoint belum tersedia'
  } finally {
    loading.value = false
  }
}

function applyFilters() {
  statusSelect.value?.close()
  clearSelection()
  void load()
}

function resetFilters() {
  search.value = ''
  startDate.value = '2026-01-01'
  endDate.value = '2026-01-31'
  statuses.value = ['posted']
  statusSelect.value?.close()
  clearSelection()
  void load()
}

function refresh() {
  clearSelection()
  void load()
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
        row.original.status === 'draft'
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
        row.original.status === 'posted' && canVoidPermission.value
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

onMounted(load)
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
        <BaseButton
          variant="danger"
          size="sm"
          :disabled="!canVoidPermission || selectedVoidRows.length === 0"
          :loading="bulkVoidLoading"
          @click="openBulkVoid"
        >
          <Slash class="h-4 w-4" />
          Void
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
      :loading="loading"
      :selectable="true"
      :is-row-selectable="canVoidJournal"
      :clear-selection-on-page-change="true"
      :compact="true"
      :fill-available="true"
      :show-meta="true"
      meta-title="Journal List"
      empty-title="No journals"
      empty-description="No journal entries match your filter."
    />
    <p v-if="error" class="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">{{ error }}</p>

    <WorkspaceConfirmDialog
      :open="bulkVoidOpen"
      title="Void selected journals?"
      :message="`This will void ${selectedVoidRows.length} selected journal${selectedVoidRows.length === 1 ? '' : 's'}.`"
      confirm-label="Void selected"
      variant="danger"
      @close="bulkVoidOpen = false"
      @cancel="bulkVoidOpen = false"
      @confirm="confirmBulkVoid"
    />
  </div>

  <div v-else class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <JournalEntryFormPanel />
  </div>
</template>
