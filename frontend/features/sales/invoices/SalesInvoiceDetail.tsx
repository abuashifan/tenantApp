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
import { getApiErrorMessage } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/formatters';
import type { SalesInvoice } from '@/features/sales/types';
import { approveSalesInvoice, postSalesInvoice, voidSalesInvoice } from './api';

export function SalesInvoiceDetail({ invoice }: { invoice: SalesInvoice }) {
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
    { key: 'approve', label: 'Approve', permission: 'sales.invoices.approve', disabled: busy || invoice.status !== 'draft', confirm: 'Approve this sales invoice?', onClick: () => runAction(() => approveSalesInvoice(invoice.id)) },
    { key: 'post', label: 'Post', permission: 'sales.invoices.post', disabled: busy || !['draft', 'approved'].includes(String(invoice.status)), confirm: 'Post this sales invoice and create accounting journals?', onClick: () => runAction(() => postSalesInvoice(invoice.id)) },
    { key: 'void', label: 'Void', permission: 'sales.invoices.void', danger: true, disabled: busy || invoice.status === 'void', onClick: () => runAction(() => voidSalesInvoice(invoice.id, window.prompt('Void reason') ?? 'Voided from UI')) },
  ];
  return (
    <AppShell>
      <SalesPageGate permission="sales.invoices.view">
        <PageHeader title={salesDocumentNumber(invoice)} description="Sales invoice detail with AR balance, customer deposit application, and journal reference when available." actions={isDraftEditable(invoice.status) ? <PermissionGuard permission="sales.invoices.edit"><Link href={`/sales/invoices/${invoice.id}/edit`} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Edit</Link></PermissionGuard> : null} />
        <div className="mt-6 space-y-6">
          {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
          <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><p className="text-xs uppercase tracking-wide text-slate-500">Customer</p><p className="mt-1 text-lg font-semibold text-slate-950">{customerName(invoice)}</p><p className="mt-1 text-sm text-slate-600">Invoice Date: {formatDate(invoice.invoice_date)} · Due: {formatDate(invoice.due_date)}</p><p className="text-sm text-slate-600">Paid: {formatCurrency(invoice.paid_amount)} · Balance: {formatCurrency(invoice.balance_due)} · Returned: {formatCurrency(invoice.returned_amount)}</p><p className="text-sm text-slate-600">Journal Entry ID: {invoice.journal_entry_id ?? '-'}</p></div>
                <SalesStatusBadge status={invoice.status ?? 'draft'} />
              </div>
              <div className="mt-4"><SalesActionBar actions={actions} /></div>
              <div className="mt-4"><SalesSourceChain sourceType={invoice.source_type} sourceNumber={invoice.source_number ?? invoice.salesOrder?.order_number ?? invoice.deliveryOrder?.delivery_number ?? invoice.proformaInvoice?.proforma_number} sourceRevision={invoice.source_revision} /></div>
            </div>
            <SalesTotalsCard totals={invoice} />
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950">Applied customer deposit: {formatCurrency(invoice.applied_down_payment_amount)}. This UI does not create new down payments or expose COGS/stock movement controls.</div>
          <SalesLineItemsTable lines={invoice.lines ?? []} />
        </div>
      </SalesPageGate>
    </AppShell>
  );
}
