'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { DataTable } from '@/components/ui/DataTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { PageHeader } from '@/components/ui/PageHeader';
import { PermissionGuard } from '@/components/ui/PermissionGuard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatAccountingStatus } from '@/lib/formatters';
import { getStoredCompanyId, getStoredToken } from '@/lib/api';
import { fetchAndStorePermissions, hasPermission } from '@/lib/permissions';
import type { AccountType, ChartOfAccount } from '@/types/accounting';
import {
  activateChartOfAccount,
  deactivateChartOfAccount,
  listChartOfAccounts,
} from '@/features/accounting/chart-of-accounts/api';

const accountTypes: Array<AccountType | 'all'> = [
  'all',
  'asset',
  'liability',
  'equity',
  'revenue',
  'expense',
];

export default function ChartOfAccountsPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<AccountType | 'all'>('all');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>(
    'all',
  );

  async function loadAccounts() {
    try {
      setError(null);
      setLoading(true);
      const res = await listChartOfAccounts({
        account_type: typeFilter === 'all' ? undefined : typeFilter,
        is_active:
          activeFilter === 'all'
            ? undefined
            : activeFilter === 'active'
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
    const token = getStoredToken();
    if (!token) {
      router.replace('/login');
      return;
    }

    const companyId = getStoredCompanyId();
    if (!companyId) {
      router.replace('/select-company');
      return;
    }

    fetchAndStorePermissions()
      .then((permissions) => {
        if (!hasPermission(permissions, 'coa.view')) {
          setLoading(false);
          setError('You do not have permission to view chart of accounts.');
          return;
        }

        void loadAccounts();
      })
      .catch((event) => {
        setLoading(false);
        setError(event instanceof Error ? event.message : 'Failed to load permissions');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, typeFilter, activeFilter]);

  const filteredAccounts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return accounts;

    return accounts.filter((account) => {
      return (
        account.account_code.toLowerCase().includes(q) ||
        account.account_name.toLowerCase().includes(q) ||
        account.account_type.toLowerCase().includes(q)
      );
    });
  }, [accounts, search]);

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

  return (
    <AppShell>
      <PageHeader
        title="Chart of Accounts"
        description="Review and maintain the tenant chart of accounts used by journals and reports."
        actions={
          <PermissionGuard permission="coa.create">
            <Link
              href="/accounting/chart-of-accounts/new"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              New Account
            </Link>
          </PermissionGuard>
        }
      />

      <div className="mt-6 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4">
        <label className="md:col-span-2">
          <span className="text-xs font-medium text-slate-500">Search</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Code, name, or type"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
          />
        </label>

        <label>
          <span className="text-xs font-medium text-slate-500">Type</span>
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value as AccountType | 'all')}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
          >
            {accountTypes.map((type) => (
              <option key={type} value={type}>
                {type === 'all' ? 'All types' : type}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="text-xs font-medium text-slate-500">Status</span>
          <select
            value={activeFilter}
            onChange={(event) =>
              setActiveFilter(event.target.value as 'all' | 'active' | 'inactive')
            }
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
      </div>

      <div className="mt-6">
        {loading ? (
          <LoadingState title="Loading accounts" />
        ) : error ? (
          <ErrorState message={error} />
        ) : filteredAccounts.length === 0 ? (
          <EmptyState
            title="No accounts found"
            description="Adjust filters or create the first account for this tenant."
          />
        ) : (
          <DataTable
            columns={[
              'Code',
              'Name',
              'Type',
              'Normal',
              'Parent',
              'Cash/Bank',
              'Status',
              'Actions',
            ]}
          >
            {filteredAccounts.map((account) => {
              const parent = accounts.find(
                (item) => item.id === account.parent_account_id,
              );

              return (
                <tr key={account.id} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                    {account.account_code}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {account.account_name}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {formatAccountingStatus(account.account_type)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {formatAccountingStatus(account.normal_balance)}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {parent ? `${parent.account_code} - ${parent.account_name}` : '-'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {account.is_cash_bank ? (
                      <StatusBadge status="Cash/Bank" tone="default" />
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <StatusBadge
                      status={account.is_active ? 'Active' : 'Inactive'}
                      tone={account.is_active ? 'success' : 'muted'}
                    />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/accounting/chart-of-accounts/${account.id}`}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        View
                      </Link>
                      <PermissionGuard permission="coa.edit">
                        <Link
                          href={`/accounting/chart-of-accounts/${account.id}/edit`}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Edit
                        </Link>
                      </PermissionGuard>
                      <PermissionGuard
                        permission={account.is_active ? 'coa.deactivate' : 'coa.edit'}
                      >
                        <button
                          type="button"
                          disabled={busyId === account.id}
                          onClick={() => toggleActive(account)}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                        >
                          {account.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </PermissionGuard>
                    </div>
                  </td>
                </tr>
              );
            })}
          </DataTable>
        )}
      </div>
    </AppShell>
  );
}
