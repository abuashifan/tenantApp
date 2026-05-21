'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { SalesActionBar, type SalesAction } from '@/features/sales/components/SalesActionBar';
import { SalesStatusBadge } from '@/features/sales/components/SalesStatusBadge';
import { SalesPageGate } from '@/features/sales/SalesPageGate';
import { customerName, salesDocumentNumber } from '@/features/sales/documents/documentHelpers';
import { getApiErrorMessage } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/formatters';
import type { SalesReceipt } from '@/features/sales/types';
import { postSalesReceipt, voidSalesReceipt } from './api';

export function SalesReceiptDetail({ receipt }: { receipt: SalesReceipt }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function run(action: () => Promise<unknown>) { try { setBusy(true); setError(null); await action(); router.refresh(); } catch (event) { setError(getApiErrorMessage(event)); } finally { setBusy(false); } }
  const actions: SalesAction[] = [
    { key: 'post', label: 'Post', permission: 'sales.receipts.post', disabled: busy || receipt.status !== 'draft', confirm: 'Post this sales receipt?', onClick: () => run(() => postSalesReceipt(receipt.id)) },
    { key: 'void', label: 'Void', permission: 'sales.receipts.void', danger: true, disabled: busy || receipt.status === 'void', onClick: () => run(() => voidSalesReceipt(receipt.id, window.prompt('Void reason') ?? 'Voided from UI')) },
  ];
  return <AppShell><SalesPageGate permission="sales.receipts.view"><PageHeader title={salesDocumentNumber(receipt)} description="Sales receipt detail and single-invoice allocation summary." /><div className="mt-6 space-y-6">{error ? <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}<div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs uppercase tracking-wide text-slate-500">Customer</p><p className="mt-1 text-lg font-semibold">{customerName(receipt)}</p><p className="mt-1 text-sm text-slate-600">Date: {formatDate(receipt.receipt_date)}</p><p className="text-sm text-slate-600">Amount: {formatCurrency(receipt.amount)} · Applied: {formatCurrency(receipt.applied_amount ?? receipt.amount)} · Unapplied: {formatCurrency(receipt.unapplied_amount)}</p><p className="text-sm text-slate-600">Invoice: {receipt.salesInvoice?.invoice_number ?? receipt.sales_invoice?.invoice_number ?? receipt.sales_invoice_id ?? '-'}</p><p className="text-sm text-slate-600">Journal Entry ID: {receipt.journal_entry_id ?? '-'}</p></div><SalesStatusBadge status={receipt.status ?? 'draft'} /></div><div className="mt-4"><SalesActionBar actions={actions} /></div></div><div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950">Receipt allocation follows backend support. Advanced multi-invoice allocation is intentionally not added in Phase 14.</div></div></SalesPageGate></AppShell>;
}
