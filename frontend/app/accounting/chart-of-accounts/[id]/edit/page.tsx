'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { PageHeader } from '@/components/ui/PageHeader';
import { getStoredCompanyId, getStoredToken } from '@/lib/api';
import { fetchAndStorePermissions, hasPermission } from '@/lib/permissions';
import type { ChartOfAccount, ChartOfAccountPayload } from '@/types/accounting';
import { ChartOfAccountForm } from '@/features/accounting/chart-of-accounts/ChartOfAccountForm';
import {
  getChartOfAccount,
  listChartOfAccounts,
  updateChartOfAccount,
} from '@/features/accounting/chart-of-accounts/api';

export default function EditChartOfAccountPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [account, setAccount] = useState<ChartOfAccount | null>(null);
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
        if (!hasPermission(permissions, 'coa.edit')) {
          setError('You do not have permission to edit chart of accounts.');
          setLoading(false);
          return;
        }

        Promise.all([getChartOfAccount(params.id), listChartOfAccounts()])
          .then(([accountRes, accountsRes]) => {
            setAccount(accountRes.data);
            setAccounts(accountsRes.data ?? []);
          })
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

  async function handleSubmit(payload: ChartOfAccountPayload) {
    try {
      setSubmitting(true);
      setError(null);
      await updateChartOfAccount(params.id, payload);
      router.push(`/accounting/chart-of-accounts/${params.id}`);
    } catch (event) {
      setError(event instanceof Error ? event.message : 'Failed to update account');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Edit Account"
        description="Update chart of accounts data for the active company."
        actions={
          <Link
            href={`/accounting/chart-of-accounts/${params.id}`}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Back
          </Link>
        }
      />

      <div className="mt-6">
        {loading ? (
          <LoadingState title="Loading form" />
        ) : error ? (
          <ErrorState message={error} />
        ) : account ? (
          <ChartOfAccountForm
            initialValue={account}
            accounts={accounts}
            submitting={submitting}
            onSubmit={handleSubmit}
          />
        ) : null}
      </div>
    </AppShell>
  );
}
