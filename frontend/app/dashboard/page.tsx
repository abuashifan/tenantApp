'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest, getStoredCompanyId, getStoredToken } from '@/lib/api';
import { AppShell } from '@/components/layout/AppShell';
import type { ApiResponse } from '@/types/api';
import type { TenantContextTest } from '@/types/company';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [context, setContext] = useState<TenantContextTest | null>(null);

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

    apiRequest<ApiResponse<TenantContextTest>>('/tenant-context-test', {
      token,
      companyId,
    })
      .then((res) => setContext(res.data))
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <AppShell>
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          Loading...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
          {error}
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Active Company</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">
            {context?.company_name ?? '-'}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Tenant Database</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">
            {context?.database_name ?? '-'}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">User Role</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">
            {context?.user_role ?? '-'}
          </p>
        </div>
      </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-700">
              Tenant Context Test
            </p>
            <pre className="mt-3 overflow-auto rounded-xl bg-slate-950 p-4 text-xs text-slate-100">
              {JSON.stringify(context, null, 2)}
            </pre>
          </div>
        </>
      )}
    </AppShell>
  );
}
