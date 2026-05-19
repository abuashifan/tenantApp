'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type AppShellProps = {
  children: React.ReactNode;
};

type StoredActiveCompany = {
  id: number;
  name: string;
  code?: string;
  slug?: string;
  user_role?: string;
  tenant_database?: {
    database_name?: string;
  };
};

export function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const [activeCompany] = useState<StoredActiveCompany | null>(
    () => {
      if (typeof window === 'undefined') return null;
      const raw = localStorage.getItem('active_company');
      if (!raw) return null;
      try {
        return JSON.parse(raw) as StoredActiveCompany;
      } catch {
        return null;
      }
    },
  );

  function logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('active_company_id');
    localStorage.removeItem('active_company');
    router.push('/login');
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div>
            <p className="text-sm text-slate-500">Accounting App</p>
            <h1 className="text-lg font-semibold text-slate-900">Dashboard</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700">
              <div className="text-xs text-slate-500">Active Company</div>
              <div className="font-medium">
                {activeCompany?.name ?? 'Not selected'}
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push('/select-company')}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Switch Company
            </button>

            <button
              type="button"
              onClick={logout}
              className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-6">{children}</div>
    </div>
  );
}
