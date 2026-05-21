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
import { customerName, isDraftEditable, salesDocumentNumber } from '@/features/sales/documents/documentHelpers';
import { createSalesInvoiceFromProforma } from '@/features/sales/invoices/api';
import { getApiErrorMessage } from '@/lib/api';
import { formatDate } from '@/lib/formatters';
import type { ProformaInvoice } from '@/features/sales/types';
import { acceptProforma, cancelProforma, issueProforma } from './api';

export function ProformaDetail({ proforma }: { proforma: ProformaInvoice }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function runAction(action: () => Promise<unknown>, redirectTo?: string) {
    try {
      setBusy(true);
      setError(null);
      const response = await action();
      if (redirectTo && typeof response === 'object' && response && 'data' in response) {
        const data = (response as { data?: { id?: number } }).data;
        router.push(data?.id ? `${redirectTo}/${data.id}` : redirectTo);
      } else {
        router.refresh();
      }
    } catch (event) {
      setError(getApiErrorMessage(event));
    } finally {
      setBusy(false);
    }
  }
  const actions: SalesAction[] = [
    { key: 'issue', label: 'Issue', permission: 'sales.proformas.issue', disabled: busy || proforma.status !== 'draft', confirm: 'Issue this proforma?', onClick: () => runAction(() => issueProforma(proforma.id)) },
    { key: 'accept', label: 'Accept', permission: 'sales.proformas.issue', disabled: busy || proforma.status !== 'issued', confirm: 'Accept this proforma?', onClick: () => runAction(() => acceptProforma(proforma.id)) },
    { key: 'cancel', label: 'Cancel', permission: 'sales.proformas.cancel', danger: true, disabled: busy || !['draft', 'issued'].includes(String(proforma.status)), onClick: () => runAction(() => cancelProforma(proforma.id, window.prompt('Cancel reason') ?? 'Cancelled from UI')) },
    { key: 'invoice', label: 'Convert to Sales Invoice', permission: 'sales.invoices.create', disabled: busy || !['issued', 'accepted'].includes(String(proforma.status)), confirm: 'Create sales invoice from this proforma?', onClick: () => runAction(() => createSalesInvoiceFromProforma(proforma.id), '/sales/invoices') },
  ];
  return (
    <AppShell>
      <SalesPageGate permission="sales.proformas.view">
        <PageHeader title={salesDocumentNumber(proforma)} description="Proforma detail. This is a non-accounting document until converted to Sales Invoice." actions={isDraftEditable(proforma.status) ? <PermissionGuard permission="sales.proformas.edit"><Link href={`/sales/proformas/${proforma.id}/edit`} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Edit</Link></PermissionGuard> : null} />
        <div className="mt-6 space-y-6">
          {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
          <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><p className="text-xs uppercase tracking-wide text-slate-500">Customer</p><p className="mt-1 text-lg font-semibold text-slate-950">{customerName(proforma)}</p><p className="mt-1 text-sm text-slate-600">Proforma Date: {formatDate(proforma.proforma_date)}</p><p className="text-sm text-slate-600">Valid Until: {formatDate(proforma.valid_until)}</p></div>
                <SalesStatusBadge status={proforma.status ?? 'draft'} />
              </div>
              <div className="mt-4"><SalesActionBar actions={actions} /></div>
              <div className="mt-4"><SalesSourceChain sourceType={proforma.source_type} sourceNumber={proforma.source_number ?? proforma.quotation?.quotation_number ?? proforma.salesOrder?.order_number ?? proforma.sales_order?.order_number} sourceRevision={proforma.source_revision} /></div>
            </div>
            <SalesTotalsCard totals={proforma} />
          </div>
          <SalesLineItemsTable lines={proforma.lines ?? []} />
        </div>
      </SalesPageGate>
    </AppShell>
  );
}
