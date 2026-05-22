'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getStoredCompanyId, getStoredToken } from '@/lib/api';
import {
  ACCOUNTING_NAV_ITEMS,
  fetchAndStorePermissions,
  getStoredPermissions,
  hasPermission,
} from '@/lib/permissions';
import { CASH_BANK_NAV_ITEMS } from '@/features/cash-bank/navigation';
import { INVENTORY_NAV_ITEMS } from '@/features/inventory/navigation';
import { PURCHASE_NAV_ITEMS } from '@/features/purchase/navigation';
import { SALES_NAV_ITEMS } from '@/features/sales/navigation';

type AppShellProps = {
  children: ReactNode;
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
  const pathname = usePathname();
  const [permissions, setPermissions] = useState<string[]>(() => getStoredPermissions());
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

  useEffect(() => {
    const token = getStoredToken();
    const companyId = getStoredCompanyId();
    if (!token || !companyId) return;

    fetchAndStorePermissions()
      .then((nextPermissions) => setPermissions(nextPermissions))
      .catch(() => {
        setPermissions(getStoredPermissions());
      });
  }, []);

  const visibleAccountingItems = useMemo(() => {
    return ACCOUNTING_NAV_ITEMS.filter((item) =>
      hasPermission(permissions, item.permission),
    );
  }, [permissions]);

  const visibleSalesItems = useMemo(() => {
    return SALES_NAV_ITEMS.filter((item) => hasPermission(permissions, item.permission));
  }, [permissions]);

  const visiblePurchaseItems = useMemo(() => {
    return PURCHASE_NAV_ITEMS.filter((item) => hasPermission(permissions, item.permission));
  }, [permissions]);

  const visibleCashBankItems = useMemo(() => {
    return CASH_BANK_NAV_ITEMS.filter((item) => hasPermission(permissions, item.permission));
  }, [permissions]);

  const visibleInventoryItems = useMemo(() => {
    return INVENTORY_NAV_ITEMS.filter((item) => hasPermission(permissions, item.permission));
  }, [permissions]);

  function logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('active_company_id');
    localStorage.removeItem('active_company');
    localStorage.removeItem('auth_permissions');
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

      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-6 py-2">
          <Link
            href="/dashboard"
            className={`rounded-lg px-3 py-2 text-sm font-medium ${
              pathname === '/dashboard'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Dashboard
          </Link>

          {visibleAccountingItems.length > 0 ? (
            <Link
              href="/accounting"
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                pathname?.startsWith('/accounting')
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              Accounting
            </Link>
          ) : null}

          {visibleSalesItems.length > 0 ? (
            <Link
              href="/sales"
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                pathname?.startsWith('/sales')
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              Sales
            </Link>
          ) : null}

          {visiblePurchaseItems.length > 0 ? (
            <Link
              href="/purchase"
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                pathname?.startsWith('/purchase')
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              Purchase
            </Link>
          ) : null}

          {visibleCashBankItems.length > 0 ? (
            <Link
              href="/cash-bank"
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                pathname?.startsWith('/cash-bank')
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              Cash Bank
            </Link>
          ) : null}

          {visibleInventoryItems.length > 0 ? (
            <Link
              href="/inventory"
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                pathname?.startsWith('/inventory')
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              Inventory
            </Link>
          ) : null}

          {pathname?.startsWith('/accounting')
            ? visibleAccountingItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-2 text-sm font-medium ${
                    pathname === item.href || pathname?.startsWith(`${item.href}/`)
                      ? 'bg-slate-100 text-slate-950'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </Link>
              ))
            : null}

          {pathname?.startsWith('/sales')
            ? visibleSalesItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-2 text-sm font-medium ${
                    pathname === item.href || pathname?.startsWith(`${item.href}/`)
                      ? 'bg-slate-100 text-slate-950'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </Link>
              ))
            : null}

          {pathname?.startsWith('/purchase')
            ? visiblePurchaseItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-2 text-sm font-medium ${
                    pathname === item.href || pathname?.startsWith(`${item.href}/`)
                      ? 'bg-slate-100 text-slate-950'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </Link>
              ))
            : null}

          {pathname?.startsWith('/cash-bank')
            ? visibleCashBankItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-2 text-sm font-medium ${
                    pathname === item.href || pathname?.startsWith(`${item.href}/`)
                      ? 'bg-slate-100 text-slate-950'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </Link>
              ))
            : null}

          {pathname?.startsWith('/inventory')
            ? visibleInventoryItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-2 text-sm font-medium ${
                    pathname === item.href || pathname?.startsWith(`${item.href}/`)
                      ? 'bg-slate-100 text-slate-950'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </Link>
              ))
            : null}
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-6 py-6">{children}</div>
    </div>
  );
}
