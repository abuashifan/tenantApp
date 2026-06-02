import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'

import WorkspaceStatusBadge from '@/components/workspace/WorkspaceStatusBadge.vue'
import type { WorkspaceListConfig } from '@/types/workspace'
import { formatDisplayDate } from '@/utils/date'

export type JournalListRow = {
  id: string
  journal_number: string
  journal_date: string
  memo: string
  total_debit: number
  total_credit: number
  status: string
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('id-ID').format(value)
}

export const journalListColumns: ColumnDef<JournalListRow, unknown>[] = [
  {
    accessorKey: 'journal_number',
    header: 'Number',
    cell: ({ row }) => row.original.journal_number,
  },
  {
    accessorKey: 'journal_date',
    header: 'Date',
    cell: ({ row }) => formatDisplayDate(row.original.journal_date),
  },
  {
    accessorKey: 'memo',
    header: 'Memo',
    cell: ({ row }) => row.original.memo,
  },
  {
    accessorKey: 'total_debit',
    header: 'Total Debit',
    cell: ({ row }) => formatMoney(row.original.total_debit),
  },
  {
    accessorKey: 'total_credit',
    header: 'Total Credit',
    cell: ({ row }) => formatMoney(row.original.total_credit),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => h(WorkspaceStatusBadge, { status: row.original.status }),
  },
]

export const journalListConfig: WorkspaceListConfig<JournalListRow> = {
  moduleKey: 'journals',
  primaryTabId: '/accounting/journals',
  title: 'Daftar Jurnal',
  subtitle: 'Kelola jurnal umum, approval, posting, dan void.',
  listTabLabel: 'Daftar Jurnal',
  createLabel: 'Buat Jurnal',
  search: {
    enabled: true,
    placeholder: 'Cari nomor jurnal, memo, atau akun...',
    debounceMs: 300,
  },
  dateFilter: {
    enabled: true,
    field: 'journal_date',
    label: 'Start Date',
  },
  statusOptions: [
    { label: 'Draft', value: 'draft', tone: 'draft' },
    { label: 'Posted', value: 'posted', tone: 'success' },
    { label: 'Void', value: 'void', tone: 'danger' },
  ],
  columns: journalListColumns,
  rowKey: 'id',
  selectable: true,
  permissions: {
    view: 'journal.view',
    create: 'journal.create',
    edit: 'journal.edit',
    void: 'journal.void',
  },
  rowActions: [
    {
      key: 'detail',
      label: 'Open',
      permission: 'journal.view',
      variant: 'secondary',
    },
    {
      key: 'edit',
      label: 'Edit',
      permission: 'journal.edit',
      variant: 'secondary',
      visibleWhen: (row) => row.status === 'draft',
    },
    {
      key: 'void',
      label: 'Void',
      permission: 'journal.void',
      variant: 'danger',
      visibleWhen: (row) => row.status === 'posted',
      confirm: {
        title: 'Void journal?',
        message: 'This action will void the selected journal after you provide a reason.',
        confirmLabel: 'Continue',
        variant: 'danger',
      },
    },
  ],
  globalActions: [
    { key: 'void', label: 'Void', variant: 'danger', permission: 'journal.void' },
  ],
  isRowSelectable: (row) => row.status === 'posted',
  clearSelectionOnPageChange: true,
  emptyTitle: 'No journals',
  emptyDescription: 'No journal entries match your filter.',
}
