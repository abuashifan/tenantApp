'use client';

import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SalesPageGate } from '@/features/sales/SalesPageGate';
import { SALES_NAV_ITEMS } from '@/features/sales/navigation';
import { getStoredPermissions, hasPermission } from '@/lib/permissions';

export default function SalesLandingPage() {
  const permissions = getStoredPermissions();
  const visibleItems = SALES_NAV_ITEMS.filter((item) => hasPermission(permissions, item.permission));

  return (
    <AppShell>
      <SalesPageGate permission={SALES_NAV_ITEMS.map((item) => item.permission)}>
        <PageHeader
          title="Sales"
          description="Sales Frontend MVP workspace for quotations, orders, deliveries, invoices, receipts, returns, and AR reports."
        />

        {visibleItems.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title="No sales menu available"
              description="Your current role does not include sales permissions for this company."
            />
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-slate-950">{item.label}</h2>
                    <p className="mt-2 text-sm text-slate-600">{item.description}</p>
                  </div>
                  <StatusBadge status="MVP" tone="default" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </SalesPageGate>
    </AppShell>
  );
}
