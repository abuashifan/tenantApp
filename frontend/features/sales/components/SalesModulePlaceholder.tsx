'use client';

import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { SalesPageGate } from '@/features/sales/SalesPageGate';
import { SalesFilters } from './SalesFilters';
import { SalesStatusBadge } from './SalesStatusBadge';
import { SalesSourceChain } from './SalesSourceChain';
import { SalesTotalsCard } from './SalesTotalsCard';

type SalesModulePlaceholderProps = {
  title: string;
  description: string;
  permission: string;
  nextPhase: string;
};

export function SalesModulePlaceholder({
  title,
  description,
  permission,
  nextPhase,
}: SalesModulePlaceholderProps) {
  return (
    <AppShell>
      <SalesPageGate permission={permission}>
        <PageHeader
          title={title}
          description={description}
          actions={
            <Link
              href="/sales"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Sales Home
            </Link>
          }
        />

        <div className="mt-6">
          <SalesFilters
            filters={{ search: '', status: '', date_from: '', date_to: '' }}
            onChange={() => undefined}
            onApply={() => undefined}
          />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <EmptyState
              title={`${title} UI starts in ${nextPhase}`}
              description="Phase 14A prepares navigation, shared components, selectors, filters, and API wrappers. Document CRUD/detail screens are implemented in their dedicated subphases."
            />
          </div>
          <div className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-xs text-slate-500">Status Badge Preview</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <SalesStatusBadge status="draft" />
                <SalesStatusBadge status="approved" />
                <SalesStatusBadge status="posted" />
                <SalesStatusBadge status="cancelled" />
              </div>
            </div>
            <SalesSourceChain sourceType="sales_quotation" sourceNumber="SQ-000001" sourceRevision={1} />
            <SalesTotalsCard
              totals={{
                subtotal: 0,
                discount_total: 0,
                tax_total: 0,
                paid_amount: 0,
                balance_due: 0,
                grand_total: 0,
              }}
            />
          </div>
        </div>
      </SalesPageGate>
    </AppShell>
  );
}
