'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { PermissionGuard } from '@/components/ui/PermissionGuard';
import { SalesActionBar, type SalesAction } from '@/features/sales/components/SalesActionBar';
import { SalesLineItemsTable } from '@/features/sales/components/SalesLineItemsTable';
import { SalesSourceChain } from '@/features/sales/components/SalesSourceChain';
import { SalesStatusBadge } from '@/features/sales/components/SalesStatusBadge';
import { SalesTotalsCard } from '@/features/sales/components/SalesTotalsCard';
import { SalesPageGate } from '@/features/sales/SalesPageGate';
import { customerName, isQuotationEditable, salesDocumentNumber } from '@/features/sales/documents/documentHelpers';
import { getApiErrorMessage } from '@/lib/api';
import { formatDate } from '@/lib/formatters';
import type { SalesQuotation } from '@/features/sales/types';
import { acceptSalesQuotation, approveSalesQuotation, cancelSalesQuotation, rejectSalesQuotation, sendSalesQuotation } from './api';

type QuotationDetailProps = {
  quotation: SalesQuotation;
};

export function QuotationDetail({ quotation }: QuotationDetailProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function runAction(action: () => Promise<unknown>) {
    try {
      setBusy(true);
      setError(null);
      await action();
      router.refresh();
    } catch (event) {
      setError(getApiErrorMessage(event));
    } finally {
      setBusy(false);
    }
  }

  const actions: SalesAction[] = [
    { key: 'send', label: 'Send', permission: 'sales.quotations.edit', disabled: busy || quotation.status !== 'draft', confirm: 'Send this quotation?', onClick: () => runAction(() => sendSalesQuotation(quotation.id)) },
    { key: 'approve', label: 'Approve', permission: 'sales.quotations.approve', disabled: busy || !['draft', 'sent'].includes(String(quotation.status)), confirm: 'Approve this quotation?', onClick: () => runAction(() => approveSalesQuotation(quotation.id)) },
    { key: 'accept', label: 'Accept', permission: 'sales.quotations.approve', disabled: busy || !['sent', 'approved'].includes(String(quotation.status)), confirm: 'Mark this quotation as accepted?', onClick: () => runAction(() => acceptSalesQuotation(quotation.id)) },
    { key: 'reject', label: 'Reject', permission: 'sales.quotations.cancel', danger: true, disabled: busy || !['sent', 'approved'].includes(String(quotation.status)), onClick: () => runAction(() => rejectSalesQuotation(quotation.id, window.prompt('Reject reason') ?? 'Rejected from UI')) },
    { key: 'cancel', label: 'Cancel', permission: 'sales.quotations.cancel', danger: true, disabled: busy || !['draft', 'sent', 'approved', 'accepted'].includes(String(quotation.status)), onClick: () => runAction(() => cancelSalesQuotation(quotation.id, window.prompt('Cancel reason') ?? 'Cancelled from UI')) },
  ];

  return (
    <AppShell>
      <SalesPageGate permission="sales.quotations.view">
        <PageHeader
          title={salesDocumentNumber(quotation)}
          description="Sales quotation detail, workflow actions, source chain, and backend-calculated totals."
          actions={
            <>
              {isQuotationEditable(quotation.status) ? (
                <PermissionGuard permission="sales.quotations.edit">
                  <Link href={`/sales/quotations/${quotation.id}/edit`} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    Edit
                  </Link>
                </PermissionGuard>
              ) : null}
              <PermissionGuard permission="sales.orders.convert">
                <Link href={`/sales/orders/from-quotation/${quotation.id}`} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
                  Convert to Sales Order
                </Link>
              </PermissionGuard>
            </>
          }
        />

        <div className="mt-6 space-y-6">
          {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
          <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Customer</p>
                  <p className="mt-1 text-lg font-semibold text-slate-950">{customerName(quotation)}</p>
                  <p className="mt-1 text-sm text-slate-600">Quotation Date: {formatDate(quotation.quotation_date)}</p>
                  <p className="text-sm text-slate-600">Valid Until: {formatDate(quotation.valid_until)}</p>
                </div>
                <SalesStatusBadge status={quotation.status ?? 'draft'} />
              </div>
              <div className="mt-4">
                <SalesActionBar actions={actions} />
              </div>
              <SalesSourceChain
                sourceType={quotation.source_type}
                sourceNumber={quotation.source_number}
                sourceRevision={quotation.source_revision}
              />
            </div>
            <SalesTotalsCard totals={quotation} />
          </div>
          <SalesLineItemsTable lines={quotation.lines ?? []} />
        </div>
      </SalesPageGate>
    </AppShell>
  );
}
