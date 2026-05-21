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
import { formatDate } from '@/lib/formatters';
import type { SalesReturn } from '@/features/sales/types';
import { approveSalesReturn, postSalesReturn, voidSalesReturn } from './api';

export function SalesReturnDetail({ salesReturn }: { salesReturn: SalesReturn }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function run(action: () => Promise<unknown>) { try { setBusy(true); setError(null); await action(); router.refresh(); } catch (event) { setError(getApiErrorMessage(event)); } finally { setBusy(false); } }
  const actions: SalesAction[] = [
    { key: 'approve', label: 'Approve', permission: 'sales.returns.approve', disabled: busy || salesReturn.status !== 'draft', confirm: 'Approve this sales return?', onClick: () => run(() => approveSalesReturn(salesReturn.id)) },
    { key: 'post', label: 'Post', permission: 'sales.returns.post', disabled: busy || !['draft', 'approved'].includes(String(salesReturn.status)), confirm: 'Post this sales return?', onClick: () => run(() => postSalesReturn(salesReturn.id)) },
    { key: 'void', label: 'Void', permission: 'sales.returns.void', danger: true, disabled: busy || salesReturn.status === 'void', onClick: () => run(() => voidSalesReturn(salesReturn.id, window.prompt('Void reason') ?? 'Voided from UI')) },
  ];
  return <AppShell><SalesPageGate permission="sales.returns.view"><PageHeader title={salesDocumentNumber(salesReturn)} description="Sales return detail and AR impact summary. No stock movement UI is exposed." actions={isDraftEditable(salesReturn.status) ? <PermissionGuard permission="sales.returns.create"><Link href={`/sales/returns/${salesReturn.id}/edit`} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium">Edit</Link></PermissionGuard> : null} /><div className="mt-6 space-y-6">{error ? <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}<div className="grid gap-4 lg:grid-cols-[1fr_320px]"><div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs uppercase tracking-wide text-slate-500">Customer</p><p className="mt-1 text-lg font-semibold">{customerName(salesReturn)}</p><p className="mt-1 text-sm text-slate-600">Return Date: {formatDate(salesReturn.return_date)}</p><p className="text-sm text-slate-600">Reason: {salesReturn.reason ?? '-'}</p><p className="text-sm text-slate-600">Journal Entry ID: {salesReturn.journal_entry_id ?? '-'}</p></div><SalesStatusBadge status={salesReturn.status ?? 'draft'} /></div><div className="mt-4"><SalesActionBar actions={actions} /></div><div className="mt-4"><SalesSourceChain sourceType={salesReturn.source_type} sourceNumber={salesReturn.source_number ?? salesReturn.salesInvoice?.invoice_number ?? salesReturn.deliveryOrder?.delivery_number} sourceRevision={salesReturn.source_revision} /></div></div><SalesTotalsCard totals={salesReturn} /></div><div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Return posting may affect AR according to backend. Stock return movement UI is intentionally excluded.</div><SalesLineItemsTable lines={salesReturn.lines ?? []} /></div></SalesPageGate></AppShell>;
}
