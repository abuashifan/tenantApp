'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { virtualTabsStorageKey } from '@/components/layout/VirtualTabsProvider';
import { ApiRequestError, apiRequest, getStoredToken } from '@/lib/api';
import type { ApiResponse } from '@/types/api';
import type { ActiveCompany, Company } from '@/types/company';

export default function SelectCompanyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectingId, setSelectingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      router.replace('/login');
      return;
    }

    apiRequest<ApiResponse<Company[]>>('/companies', { token })
      .then((res) => setCompanies(res.data ?? []))
      .catch((e) => {
        if (e instanceof ApiRequestError && e.status === 401) {
          clearStoredSession();
          router.replace('/login');
          return;
        }

        setError(e instanceof Error ? e.message : 'Failed');
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function selectCompany(companyId: number) {
    const token = getStoredToken();
    if (!token) {
      router.replace('/login');
      return;
    }

    try {
      setSelectingId(companyId);
      setError(null);

      const res = await apiRequest<ApiResponse<{ active_company: ActiveCompany }>>(
        '/companies/select',
        { method: 'POST', token, body: { company_id: companyId } },
      );

      localStorage.setItem('active_company_id', String(companyId));
      localStorage.setItem('active_company', JSON.stringify(res.data.active_company));
      sessionStorage.removeItem(virtualTabsStorageKey);
      router.push('/dashboard');
    } catch (e) {
      if (e instanceof ApiRequestError && e.status === 401) {
        clearStoredSession();
        router.replace('/login');
        return;
      }

      setError(e instanceof Error ? e.message : 'Failed to select company');
    } finally {
      setSelectingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-6">
          <p className="text-sm font-medium text-slate-500">Accounting App</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            Select Company
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Pilih company aktif untuk request berikutnya (X-Company-ID).
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            Loading...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
            {error}
          </div>
        ) : companies.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-slate-700">
            Belum ada company untuk user ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {companies.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => selectCompany(c.id)}
                disabled={selectingId === c.id}
                className="text-left rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-slate-300 hover:shadow disabled:opacity-60"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold text-slate-900">
                      {c.name}
                    </div>
                    <div className="mt-1 text-sm text-slate-600">
                      {c.legal_name ?? '-'}
                    </div>
                  </div>
                  <div className="text-xs font-medium text-slate-700">
                    {c.user_role}
                  </div>
                </div>

                <div className="mt-4 text-sm text-slate-700">
                  <div>
                    <span className="font-medium">Tenant DB:</span>{' '}
                    {c.tenant_database?.database_name ?? '-'}
                  </div>
                </div>

                <div className="mt-4 text-xs text-slate-500">
                  {selectingId === c.id ? 'Selecting...' : 'Click to select'}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function clearStoredSession() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
  localStorage.removeItem('active_company_id');
  localStorage.removeItem('active_company');
  localStorage.removeItem('auth_permissions');
  sessionStorage.removeItem(virtualTabsStorageKey);
}
