'use client';

import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import type { ApiResponse } from '@/types/api';

type CompanyDemo = {
  id: number;
  name: string;
  legal_name: string | null;
  slug: string;
  code: string;
  status: string;
  role: string | null;
  tenant_database: null | {
    database_name: string;
    status: string;
  };
  subscription: null | {
    status: string;
    plan: string | null;
  };
};

export default function CompaniesDemoPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<CompanyDemo[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        setLoading(true);
        setError(null);
        const res = await apiRequest<ApiResponse<CompanyDemo[]>>(
          '/my-companies-demo',
        );
        if (!cancelled) setCompanies(res.data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Unknown error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">
            Companies Demo
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Endpoint demo sementara untuk validasi central schema (Phase 1B).
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            Loading...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-white p-6 text-red-700 shadow-sm">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {companies.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold text-slate-900">
                      {c.name}
                    </div>
                    <div className="mt-1 text-sm text-slate-600">
                      {c.code} • {c.slug}
                    </div>
                  </div>
                  <div className="text-xs font-medium text-slate-700">
                    {c.status}
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm text-slate-700">
                  <div>
                    <span className="font-medium">Role:</span>{' '}
                    <span>{c.role ?? '-'}</span>
                  </div>
                  <div>
                    <span className="font-medium">Tenant DB:</span>{' '}
                    <span>
                      {c.tenant_database?.database_name ?? '-'} (
                      {c.tenant_database?.status ?? '-'})
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Subscription:</span>{' '}
                    <span>
                      {c.subscription?.plan ?? '-'} ({c.subscription?.status ?? '-'})
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

