'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { PageHeader } from '@/components/ui/PageHeader';
import { PermissionGuard } from '@/components/ui/PermissionGuard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatAccountingStatus, formatDate } from '@/lib/formatters';
import { getStoredCompanyId, getStoredToken } from '@/lib/api';
import { fetchAndStorePermissions, hasPermission } from '@/lib/permissions';
import type { ChartOfAccount } from '@/types/accounting';
import { getChartOfAccount } from '@/features/accounting/chart-of-accounts/api';

export default function ChartOfAccountDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [account, setAccount] = useState<ChartOfAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      router.replace('/login');
      return;
    }
    if (!getStoredCompanyId()) {
      router.replace('/select-company');
      return;
    }
    fetchAndStorePermissions()
      .then((permissions) => {
        if (!hasPermission(permissions, 'coa.view')) {
          setError('You do not have permission to view chart of accounts.');
          setLoading(false);
          return;
        }

        getChartOfAccount(params.id)
          .then((res) => setAccount(res.data))
          .catch((event) =>
            setError(event instanceof Error ? event.message : 'Failed to load account'),
          )
          .finally(() => setLoading(false));
      })
      .catch((event) => {
        setError(event instanceof Error ? event.message : 'Failed to load permissions');
        setLoading(false);
      });
  }, [params.id, router]);

  return (
    <AppShell>
      <PageHeader
        title="Account Detail"
        description="Chart of accounts detail for the active company."
        actions={
          <>
            <Link
              href="/accounting/chart-of-accounts"
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Back
            </Link>
            <PermissionGuard permission="coa.edit">
              <Link
                href={`/accounting/chart-of-accounts/${params.id}/edit`}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Edit
              </Link>
            </PermissionGuard>
          </>
        }
      />

      <div className="mt-6">
        {loading ? (
          <LoadingState title="Loading account" />
        ) : error ? (
          <ErrorState message={error} />
        ) : account ? (
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="text-sm text-slate-500">{account.account_code}</div>
                <h2 className="mt-1 text-xl font-semibold text-slate-950">
                  {account.account_name}
                </h2>
              </div>
              <StatusBadge
                status={account.is_active ? 'Active' : 'Inactive'}
                tone={account.is_active ? 'success' : 'muted'}
              />
            </div>

            <dl className="mt-6 grid gap-4 md:grid-cols-2">
              <DetailItem label="Account Type" value={formatAccountingStatus(account.account_type)} />
              <DetailItem label="Normal Balance" value={formatAccountingStatus(account.normal_balance)} />
              <DetailItem label="Parent Account ID" value={account.parent_account_id ?? '-'} />
              <DetailItem label="Cash/Bank" value={account.is_cash_bank ? 'Yes' : 'No'} />
              <DetailItem label="Created At" value={formatDate(account.created_at)} />
              <DetailItem label="Updated At" value={formatDate(account.updated_at)} />
              <DetailItem
                label="Description"
                value={account.description || '-'}
                className="md:col-span-2"
              />
            </dl>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}

function DetailItem({
  label,
  value,
  className = '',
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-xs font-medium uppercase tracking-normal text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-slate-900">{value}</dd>
    </div>
  );
}
