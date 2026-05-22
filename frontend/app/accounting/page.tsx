'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { getSubmenuIcon } from '@/components/layout/navigation';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { getStoredCompanyId, getStoredToken } from '@/lib/api';
import {
  ACCOUNTING_NAV_ITEMS,
  fetchAndStorePermissions,
  hasPermission,
} from '@/lib/permissions';

export default function AccountingPage() {
  const router = useRouter();
  const [permissions, setPermissions] = useState<string[]>([]);

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

    fetchAndStorePermissions().then(setPermissions).catch(() => setPermissions([]));
  }, [router]);

  const visibleItems = useMemo(() => {
    return ACCOUNTING_NAV_ITEMS.filter((item) =>
      hasPermission(permissions, item.permission),
    );
  }, [permissions]);

  return (
    <AppShell>
      <PageHeader
        title="Accounting"
        description="Accounting workspace for master data, journals, ledgers, financial statements, and fiscal closing."
      />

      {visibleItems.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No accounting menu available"
            description="Your current role does not include accounting permissions for this company."
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleItems.map((item) => {
            const ItemIcon = getSubmenuIcon(item.href, item.label);

            return (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--erp-lime-soft)] text-[var(--erp-emerald-dark)]">
                      <ItemIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-slate-950">
                        {item.label}
                      </h2>
                      <p className="mt-2 text-sm text-slate-600">
                        {accountingItemDescription(item.label)}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status="Ready" tone="success" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}

function accountingItemDescription(label: string): string {
  const descriptions: Record<string, string> = {
    'Chart of Accounts': 'Maintain the account structure used by journals and reports.',
    'Master Data': 'Accounting dimensions and shared master data.',
    'Journal Entries': 'Manual journals, approval, posting, and void workflow.',
    'General Ledger': 'Posted journal history with running balances.',
    'Trial Balance': 'Account balances and debit-credit checks.',
    'Financial Statements': 'Profit and loss, balance sheet, and cash flow reports.',
    'Fiscal Closing': 'Period lock and fiscal year closing operations.',
  };

  return descriptions[label] ?? 'Open accounting workspace.';
}
