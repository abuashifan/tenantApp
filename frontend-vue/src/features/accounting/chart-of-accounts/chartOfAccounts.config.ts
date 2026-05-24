import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'

import WorkspaceStatusBadge from '@/components/workspace/WorkspaceStatusBadge.vue'
import type { WorkspaceListConfig } from '@/types/workspace'
import type { ChartOfAccountRow } from '@/features/accounting/chart-of-accounts/chartOfAccounts.service'

function formatMoney(value: number) {
  return new Intl.NumberFormat('id-ID').format(value)
}

export const chartOfAccountsColumns: ColumnDef<ChartOfAccountRow, unknown>[] = [
  {
    accessorKey: 'code',
    header: 'Account Code',
    cell: ({ row }) => row.original.code,
  },
  {
    accessorKey: 'name',
    header: 'Account Name',
    cell: ({ row }) => row.original.name,
  },
  {
    accessorKey: 'type',
    header: 'Account Type',
    cell: ({ row }) => row.original.type,
  },
  {
    accessorKey: 'balance',
    header: 'Balance',
    cell: ({ row }) => formatMoney(row.original.balance),
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ row }) => h(WorkspaceStatusBadge, { status: row.original.isActive ? 'active' : 'inactive' }),
  },
]

export const chartOfAccountsConfig: WorkspaceListConfig<ChartOfAccountRow> = {
  moduleKey: 'chart-of-accounts',
  primaryTabId: '/accounting/chart-of-accounts',
  title: 'Chart of Accounts',
  subtitle: 'Manage account codes, hierarchy, and active status.',
  createLabel: 'Add Account',
  search: {
    enabled: true,
    placeholder: 'Search account code or name…',
    debounceMs: 250,
  },
  dateFilter: { enabled: false },
  columns: chartOfAccountsColumns,
  rowKey: 'id',
  selectable: false,
  permissions: {
    view: 'coa.view',
    create: 'coa.create',
    edit: 'coa.edit',
  },
  emptyTitle: 'No accounts',
  emptyDescription: 'No chart of accounts rows match your filter.',
}
