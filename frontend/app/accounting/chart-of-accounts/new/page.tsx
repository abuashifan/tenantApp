'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { PageHeader } from '@/components/ui/PageHeader';
import { getStoredCompanyId, getStoredToken } from '@/lib/api';
import { fetchAndStorePermissions, hasPermission } from '@/lib/permissions';
import type { ChartOfAccount, ChartOfAccountPayload } from '@/types/accounting';
import { ChartOfAccountForm } from '@/features/accounting/chart-of-accounts/ChartOfAccountForm';
import {
  createChartOfAccount,
  listChartOfAccounts,
} from '@/features/accounting/chart-of-accounts/api';

export default function NewChartOfAccountPage() {
  const router = useRouter();
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
        if (!hasPermission(permissions, 'coa.create')) {
          setError('You do not have permission to create chart of accounts.');
          setLoading(false);
          return;
        }

        listChartOfAccounts()
          .then((res) => setAccounts(res.data ?? []))
          .catch((event) =>
            setError(event instanceof Error ? event.message : 'Failed to load accounts'),
          )
          .finally(() => setLoading(false));
      })
      .catch((event) => {
        setError(event instanceof Error ? event.message : 'Failed to load permissions');
        setLoading(false);
      });
  }, [router]);

  async function handleSubmit(payload: ChartOfAccountPayload) {
    try {
      setSubmitting(true);
      setError(null);
      const res = await createChartOfAccount(payload);
      router.push(`/accounting/chart-of-accounts/${res.data.id}`);
    } catch (event) {
      setError(event instanceof Error ? event.message : 'Failed to create account');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="New Account"
        description="Create a chart of accounts row for the active company."
        actions={
          <Link
            href="/accounting/chart-of-accounts"
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
        ) : (
          <ChartOfAccountForm
            accounts={accounts}
            submitting={submitting}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </AppShell>
  );
}
