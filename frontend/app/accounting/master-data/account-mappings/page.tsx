'use client';

import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { DataTable } from '@/components/ui/DataTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { PageHeader } from '@/components/ui/PageHeader';
import { PermissionGuard } from '@/components/ui/PermissionGuard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AccountingPageGate } from '@/features/accounting/AccountingPageGate';
import {
  listAccountMappings,
  updateAccountMapping,
} from '@/features/accounting/master-data/api';
import { listChartOfAccounts } from '@/features/accounting/chart-of-accounts/api';
import { getApiErrorMessage } from '@/lib/api';
import { formatAccountingStatus } from '@/lib/formatters';
import type { AccountMapping, ChartOfAccount } from '@/types/accounting';

export default function AccountMappingsPage() {
  const [mappings, setMappings] = useState<AccountMapping[]>([]);
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [moduleFilter, setModuleFilter] = useState('all');

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const [mappingRes, accountRes] = await Promise.all([
        listAccountMappings(),
        listChartOfAccounts({ is_active: '1' }),
      ]);
      setMappings(mappingRes.data ?? []);
      setAccounts(accountRes.data ?? []);
    } catch (event) {
      setError(getApiErrorMessage(event));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    queueMicrotask(() => {
      void loadData();
    });
  }, []);

  const modules = useMemo(
    () => ['all', ...Array.from(new Set(mappings.map((mapping) => mapping.module))).sort()],
    [mappings],
  );

  const visibleMappings = useMemo(() => {
    if (moduleFilter === 'all') return mappings;
    return mappings.filter((mapping) => mapping.module === moduleFilter);
  }, [mappings, moduleFilter]);

  async function saveMapping(mapping: AccountMapping, accountId: string) {
    try {
      setSavingKey(mapping.mapping_key);
      setError(null);
      await updateAccountMapping(mapping.mapping_key, accountId ? Number(accountId) : null);
      await loadData();
    } catch (event) {
      setError(getApiErrorMessage(event));
    } finally {
      setSavingKey(null);
    }
  }

  return (
    <AppShell>
      <AccountingPageGate permission="settings.company.view">
        <PageHeader
          title="Account Mappings"
          description="Map default posting accounts carefully. These mappings influence journal generation in operational modules."
        />

        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Account mappings are operational controls. Update them only when the accounting policy is known.
        </div>

        <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <label className="block max-w-xs">
            <span className="text-xs font-medium text-slate-500">Module</span>
            <select
              value={moduleFilter}
              onChange={(event) => setModuleFilter(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            >
              {modules.map((module) => (
                <option key={module} value={module}>
                  {module === 'all' ? 'All modules' : formatAccountingStatus(module)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-6">
          {loading ? (
            <LoadingState title="Loading account mappings" />
          ) : error ? (
            <ErrorState message={error} />
          ) : visibleMappings.length === 0 ? (
            <EmptyState title="No mappings found" />
          ) : (
            <DataTable columns={['Module', 'Mapping Key', 'Required', 'Account', 'Status']}>
              {visibleMappings.map((mapping) => (
                <tr key={mapping.mapping_key} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                    {formatAccountingStatus(mapping.module)}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {mapping.mapping_key}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <StatusBadge
                      status={mapping.is_required ? 'Required' : 'Optional'}
                      tone={mapping.is_required ? 'warning' : 'muted'}
                    />
                  </td>
                  <td className="min-w-72 px-4 py-3">
                    <PermissionGuard
                      permission="settings.company.edit"
                      fallback={
                        <span className="text-slate-600">
                          {formatAccount(accounts, mapping.account_id)}
                        </span>
                      }
                    >
                      <select
                        value={mapping.account_id ?? ''}
                        disabled={savingKey === mapping.mapping_key}
                        onChange={(event) => saveMapping(mapping, event.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 disabled:opacity-60"
                      >
                        <option value="">Unmapped</option>
                        {accounts.map((account) => (
                          <option key={account.id} value={account.id}>
                            {account.account_code} - {account.account_name} ({account.account_type})
                          </option>
                        ))}
                      </select>
                    </PermissionGuard>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <StatusBadge
                      status={mapping.is_active ? 'Active' : 'Inactive'}
                      tone={mapping.is_active ? 'success' : 'muted'}
                    />
                  </td>
                </tr>
              ))}
            </DataTable>
          )}
        </div>
      </AccountingPageGate>
    </AppShell>
  );
}

function formatAccount(accounts: ChartOfAccount[], accountId: number | null) {
  if (!accountId) return 'Unmapped';
  const account = accounts.find((item) => item.id === accountId);
  return account ? `${account.account_code} - ${account.account_name}` : `Account #${accountId}`;
}
