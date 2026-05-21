'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { PageHeader } from '@/components/ui/PageHeader';
import { listChartOfAccounts } from '@/features/accounting/chart-of-accounts/api';
import { listMasterData } from '@/features/accounting/master-data/api';
import { SalesPageGate } from '@/features/sales/SalesPageGate';
import { getApiErrorMessage } from '@/lib/api';
import type { ChartOfAccount, MasterDataRecord } from '@/types/accounting';

type SalesPaymentFormProps = {
  type: 'deposit' | 'receipt';
  sourceInvoiceId?: string | number | null;
  onSubmit: (payload: Record<string, unknown>) => Promise<{ id: number }>;
};

export function SalesPaymentForm({ type, sourceInvoiceId, onSubmit }: SalesPaymentFormProps) {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);
  const [contacts, setContacts] = useState<MasterDataRecord[]>([]);
  const [cashAccounts, setCashAccounts] = useState<ChartOfAccount[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [documentDate, setDocumentDate] = useState(today);
  const [cashAccountId, setCashAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [sourceId, setSourceId] = useState(String(sourceInvoiceId ?? ''));
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    queueMicrotask(async () => {
      try {
        const [contactRes, cashRes] = await Promise.all([
          listMasterData('/master-data/contacts'),
          listChartOfAccounts({ is_cash_bank: '1', is_active: '1' }),
        ]);
        setContacts(contactRes.data ?? []);
        setCashAccounts(cashRes.data ?? []);
      } catch (event) {
        setError(getApiErrorMessage(event));
      } finally {
        setLoading(false);
      }
    });
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!customerId || !cashAccountId || Number(amount) <= 0) {
      setError('Customer, cash/bank account, and positive amount are required.');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      const payload: Record<string, unknown> = {
        customer_id: Number(customerId),
        cash_bank_account_id: Number(cashAccountId),
        amount: Number(amount),
        notes: notes || null,
      };
      if (type === 'deposit') {
        payload.deposit_date = documentDate;
        payload.sales_order_id = sourceId ? Number(sourceId) : null;
      } else {
        payload.receipt_date = documentDate;
        payload.sales_invoice_id = sourceId ? Number(sourceId) : null;
      }
      const response = await onSubmit(payload);
      router.push(type === 'deposit' ? `/sales/deposits/${response.id}` : `/sales/receipts/${response.id}`);
    } catch (eventError) {
      setError(getApiErrorMessage(eventError));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <AppShell><LoadingState title="Loading payment form data" /></AppShell>;

  return (
    <AppShell>
      <SalesPageGate permission={type === 'deposit' ? 'sales.deposits.create' : 'sales.receipts.create'}>
        <PageHeader
          title={type === 'deposit' ? 'New Customer Deposit' : 'New Sales Receipt'}
          description={type === 'deposit' ? 'Create customer down payment/deposit. This is not a general Cash Bank UI.' : 'Create customer receipt for posted sales invoice. Advanced multi-invoice allocation is out of scope.'}
        />
        <form onSubmit={submit} className="mt-6 space-y-6">
          {error ? <ErrorState message={error} /> : null}
          <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-3">
            <label><span className="text-xs font-medium text-slate-500">Customer *</span><select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"><option value="">Select customer</option>{contacts.map((contact) => <option key={contact.id} value={contact.id}>{String(contact.name ?? contact.id)}</option>)}</select></label>
            <label><span className="text-xs font-medium text-slate-500">{type === 'deposit' ? 'Deposit Date' : 'Receipt Date'} *</span><input type="date" value={documentDate} onChange={(e) => setDocumentDate(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></label>
            <label><span className="text-xs font-medium text-slate-500">Cash/Bank Account *</span><select value={cashAccountId} onChange={(e) => setCashAccountId(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"><option value="">Select account</option>{cashAccounts.map((account) => <option key={account.id} value={account.id}>{account.account_code} - {account.account_name}</option>)}</select></label>
            <label><span className="text-xs font-medium text-slate-500">Amount *</span><input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></label>
            <label><span className="text-xs font-medium text-slate-500">{type === 'deposit' ? 'Sales Order ID' : 'Sales Invoice ID'}</span><input value={sourceId} onChange={(e) => setSourceId(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></label>
            <label className="md:col-span-3"><span className="text-xs font-medium text-slate-500">Notes</span><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></label>
          </div>
          <button type="submit" disabled={saving} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60">{saving ? 'Saving...' : 'Save'}</button>
        </form>
      </SalesPageGate>
    </AppShell>
  );
}
