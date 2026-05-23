'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  DocumentListWorkspace,
  type WorkspaceColumn,
  type WorkspaceFilterState,
  type WorkspaceRowAction,
} from '@/components/workspace';
import { AccountingPageGate } from '@/features/accounting/AccountingPageGate';
import {
  activateChartOfAccount,
  deactivateChartOfAccount,
  listChartOfAccounts,
} from '@/features/accounting/chart-of-accounts/api';
import { formatAccountingStatus } from '@/lib/formatters';
import { getStoredPermissions, hasPermission } from '@/lib/permissions';
import type { ChartOfAccount } from '@/types/accounting';

const accountStatusOptions = [
  { label: 'All Status', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

export default function ChartOfAccountsPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<WorkspaceFilterState>({
    search: '',
    status: 'all',
    party: 'all',
    dateFrom: '',
    dateTo: '',
  });
  const permissions = getStoredPermissions();
  const canCreate = hasPermission(permissions, 'coa.create');

  async function loadAccounts() {
    try {
      setError(null);
      setLoading(true);
      const res = await listChartOfAccounts({
        is_active:
          filters.status === 'all'
            ? undefined
            : filters.status === 'active'
              ? '1'
              : '0',
      });
      setAccounts(res.data ?? []);
    } catch (event) {
      setError(event instanceof Error ? event.message : 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    queueMicrotask(() => {
      void loadAccounts();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status]);

  async function toggleActive(account: ChartOfAccount) {
    try {
      setBusyId(account.id);
      setError(null);

      if (account.is_active) {
        await deactivateChartOfAccount(account.id);
      } else {
        await activateChartOfAccount(account.id);
      }

      await loadAccounts();
    } catch (event) {
      setError(event instanceof Error ? event.message : 'Failed to update account');
    } finally {
      setBusyId(null);
    }
  }

  const parentById = useMemo(
    () => new Map(accounts.map((account) => [account.id, account])),
    [accounts],
  );

  const columns = useMemo<WorkspaceColumn<ChartOfAccount>[]>(
    () => [
      {
        key: 'code',
        label: 'Code',
        widthClassName: 'min-w-[140px]',
        sortable: true,
        sortValue: (account) => account.account_code,
        render: (account) => (
          <p className="font-bold text-slate-950">{account.account_code}</p>
        ),
      },
      {
        key: 'name',
        label: 'Name',
        widthClassName: 'min-w-[240px]',
        sortable: true,
        sortValue: (account) => account.account_name,
        render: (account) => account.account_name,
      },
      {
        key: 'type',
        label: 'Type',
        widthClassName: 'min-w-[140px]',
        sortable: true,
        sortValue: (account) => account.account_type,
        render: (account) => formatAccountingStatus(account.account_type),
      },
      {
        key: 'normal',
        label: 'Normal',
        widthClassName: 'min-w-[120px]',
        sortable: true,
        sortValue: (account) => account.normal_balance,
        render: (account) => formatAccountingStatus(account.normal_balance),
      },
      {
        key: 'parent',
        label: 'Parent',
        widthClassName: 'min-w-[240px]',
        sortable: true,
        sortValue: (account) => {
          const parent = account.parent_account_id
            ? parentById.get(account.parent_account_id)
            : null;
          return parent ? `${parent.account_code} ${parent.account_name}` : '';
        },
        render: (account) => {
          const parent = account.parent_account_id
            ? parentById.get(account.parent_account_id)
            : null;
          return parent ? `${parent.account_code} - ${parent.account_name}` : '-';
        },
      },
      {
        key: 'cash_bank',
        label: 'Cash/Bank',
        widthClassName: 'min-w-[140px]',
        sortable: true,
        sortValue: (account) => Number(account.is_cash_bank),
        render: (account) =>
          account.is_cash_bank ? (
            <StatusBadge status="Cash/Bank" tone="default" />
          ) : (
            <span className="text-slate-400">-</span>
          ),
      },
      {
        key: 'status',
        label: 'Status',
        widthClassName: 'min-w-[120px]',
        sortable: true,
        sortValue: (account) => (account.is_active ? 'active' : 'inactive'),
        render: (account) => (
          <StatusBadge
            status={account.is_active ? 'Active' : 'Inactive'}
            tone={account.is_active ? 'success' : 'muted'}
          />
        ),
      },
    ],
    [parentById],
  );

  const rowActions: WorkspaceRowAction<ChartOfAccount>[] = [
    {
      key: 'view',
      label: 'View Detail',
      href: (account) => `/accounting/chart-of-accounts/${account.id}`,
    },
    {
      key: 'edit',
      label: 'Edit',
      href: (account) => `/accounting/chart-of-accounts/${account.id}/edit`,
      disabled: () => !hasPermission(getStoredPermissions(), 'coa.edit'),
    },
    {
      key: 'toggle-active',
      label: 'Activate / Deactivate',
      danger: true,
      disabled: (account) =>
        busyId === account.id ||
        !hasPermission(
          getStoredPermissions(),
          account.is_active ? 'coa.deactivate' : 'coa.edit',
        ),
      onClick: toggleActive,
    },
  ];

  return (
    <AppShell>
      <AccountingPageGate permission="coa.view">
        <PageHeader
          title="Chart of Accounts"
          description="Review and maintain the tenant chart of accounts used by journals and reports."
        />

        <div className="mt-6">
          <DocumentListWorkspace
            documentLabel="Chart of Account"
            newButtonLabel={canCreate ? 'New Account' : undefined}
            rows={accounts}
            columns={columns}
            filters={filters}
            statusOptions={accountStatusOptions}
            loading={loading}
            error={error}
            emptyTitle="No accounts found"
            emptyDescription="Adjust filters or create the first account for this tenant."
            searchPlaceholder="Search code, name, type, normal balance, or parent"
            rowActions={rowActions}
            getSearchText={(account) => {
              const parent = account.parent_account_id
                ? parentById.get(account.parent_account_id)
                : null;
              return [
                account.account_code,
                account.account_name,
                account.account_type,
                account.normal_balance,
                parent?.account_code,
                parent?.account_name,
                account.is_cash_bank ? 'cash bank' : '',
                account.is_active ? 'active' : 'inactive',
              ]
                .filter(Boolean)
                .join(' ');
            }}
            getStatus={(account) => (account.is_active ? 'active' : 'inactive')}
            getDate={() => ''}
            onCreate={canCreate ? () => router.push('/accounting/chart-of-accounts/new') : undefined}
            onApplyFilters={loadAccounts}
            onFilterChange={setFilters}
          />
        </div>
      </AccountingPageGate>
    </AppShell>
  );
}
