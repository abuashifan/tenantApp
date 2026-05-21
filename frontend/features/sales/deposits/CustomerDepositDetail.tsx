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
import type { CustomerDeposit } from '@/features/sales/types';
import { postCustomerDeposit, refundCustomerDeposit, voidCustomerDeposit } from './api';

export function CustomerDepositDetail({ deposit }: { deposit: CustomerDeposit }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function run(action: () => Promise<unknown>) { try { setBusy(true); setError(null); await action(); router.refresh(); } catch (event) { setError(getApiErrorMessage(event)); } finally { setBusy(false); } }
  const actions: SalesAction[] = [
    { key: 'post', label: 'Post', permission: 'sales.deposits.post', disabled: busy || deposit.status !== 'draft', confirm: 'Post this customer deposit?', onClick: () => run(() => postCustomerDeposit(deposit.id)) },
    { key: 'refund', label: 'Refund', permission: 'sales.deposits.refund', disabled: busy || !['posted', 'partially_allocated'].includes(String(deposit.status)), onClick: () => run(() => refundCustomerDeposit(deposit.id, Number(window.prompt('Refund amount') ?? 0), window.prompt('Refund reason') ?? 'Refunded from UI')) },
    { key: 'void', label: 'Void', permission: 'sales.deposits.void', danger: true, disabled: busy || deposit.status === 'void', onClick: () => run(() => voidCustomerDeposit(deposit.id, window.prompt('Void reason') ?? 'Voided from UI')) },
  ];
  return <AppShell><SalesPageGate permission="sales.deposits.view"><PageHeader title={salesDocumentNumber(deposit)} description="Customer deposit detail, remaining balance, and allocation context." /><div className="mt-6 space-y-6">{error ? <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}<div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs uppercase tracking-wide text-slate-500">Customer</p><p className="mt-1 text-lg font-semibold">{customerName(deposit)}</p><p className="mt-1 text-sm text-slate-600">Date: {formatDate(deposit.deposit_date)}</p><p className="text-sm text-slate-600">Amount: {formatCurrency(deposit.amount)} · Allocated: {formatCurrency(deposit.allocated_amount)} · Remaining: {formatCurrency(deposit.remaining_amount)}</p><p className="text-sm text-slate-600">Journal Entry ID: {deposit.journal_entry_id ?? '-'}</p></div><SalesStatusBadge status={deposit.status ?? 'draft'} /></div><div className="mt-4"><SalesActionBar actions={actions} /></div></div><div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950">Allocations are displayed when returned by backend. Advanced Cash Bank UI is out of Phase 14 scope.</div></div></SalesPageGate></AppShell>;
}
