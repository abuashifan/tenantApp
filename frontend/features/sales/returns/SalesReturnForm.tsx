'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { DataTable } from '@/components/ui/DataTable';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { PageHeader } from '@/components/ui/PageHeader';
import { listMasterData } from '@/features/accounting/master-data/api';
import { SalesPageGate } from '@/features/sales/SalesPageGate';
import { getApiErrorMessage } from '@/lib/api';
import type { MasterDataRecord } from '@/types/accounting';
import type { DeliveryOrder, SalesInvoice, SalesLineItem, SalesReturn } from '@/features/sales/types';
import { createSalesReturn, createSalesReturnFromDeliveryOrder, createSalesReturnFromInvoice, updateSalesReturn } from './api';

type SalesReturnFormProps = {
  mode: 'create' | 'edit' | 'from-invoice' | 'from-delivery';
  salesReturn?: SalesReturn | null;
  sourceInvoice?: SalesInvoice | null;
  sourceDelivery?: DeliveryOrder | null;
};

type DraftLine = { sales_invoice_line_id?: number | null; delivery_order_line_id?: number | null; description: string; quantity: string; max_quantity: number | null; unit_price: string; discount_amount: string; tax_amount: string; line_total: string };

export function SalesReturnForm({ mode, salesReturn, sourceInvoice, sourceDelivery }: SalesReturnFormProps) {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);
  const [contacts, setContacts] = useState<MasterDataRecord[]>([]);
  const [customerId, setCustomerId] = useState(String(salesReturn?.customer_id ?? sourceInvoice?.customer_id ?? sourceDelivery?.customer_id ?? ''));
  const [returnDate, setReturnDate] = useState(String(salesReturn?.return_date ?? today).slice(0, 10));
  const [reason, setReason] = useState(String(salesReturn?.reason ?? ''));
  const [notes, setNotes] = useState(String(salesReturn?.notes ?? ''));
  const [lines, setLines] = useState<DraftLine[]>(() => initialLines(salesReturn?.lines ?? sourceInvoice?.lines ?? sourceDelivery?.lines));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { queueMicrotask(async () => { try { setContacts((await listMasterData('/master-data/contacts')).data ?? []); } catch (event) { setError(getApiErrorMessage(event)); } finally { setLoading(false); } }); }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!customerId || lines.some((line) => !line.description || Number(line.quantity) <= 0)) { setError('Customer and positive return lines are required.'); return; }
    for (const [index, line] of lines.entries()) if (line.max_quantity !== null && Number(line.quantity) > line.max_quantity) { setError(`Line ${index + 1}: return quantity exceeds source quantity.`); return; }
    try {
      setSaving(true); setError(null);
      const payload = { return_date: returnDate, customer_id: Number(customerId), sales_invoice_id: sourceInvoice?.id ?? salesReturn?.sales_invoice_id ?? null, delivery_order_id: sourceDelivery?.id ?? salesReturn?.delivery_order_id ?? null, reason: reason || null, notes: notes || null, lines: lines.map((line) => ({ sales_invoice_line_id: line.sales_invoice_line_id ?? null, delivery_order_line_id: line.delivery_order_line_id ?? null, description: line.description, quantity: Number(line.quantity), unit_price: Number(line.unit_price || 0), discount_amount: Number(line.discount_amount || 0), tax_amount: Number(line.tax_amount || 0), line_total: Number(line.line_total || 0) })) };
      const response = mode === 'edit' ? await updateSalesReturn(salesReturn?.id ?? '', payload) : mode === 'from-invoice' && sourceInvoice ? await createSalesReturnFromInvoice(sourceInvoice.id, payload) : mode === 'from-delivery' && sourceDelivery ? await createSalesReturnFromDeliveryOrder(sourceDelivery.id, payload) : await createSalesReturn(payload);
      router.push(`/sales/returns/${response.data.id}`);
    } catch (eventError) { setError(getApiErrorMessage(eventError)); } finally { setSaving(false); }
  }
  function updateLine(index: number, key: keyof DraftLine, value: string) { setLines((current) => current.map((line, i) => (i === index ? { ...line, [key]: value, line_total: key === 'quantity' || key === 'unit_price' ? String(Number(key === 'quantity' ? value : line.quantity) * Number(key === 'unit_price' ? value : line.unit_price)) : line.line_total } : line))); }
  if (loading) return <AppShell><LoadingState title="Loading sales return form" /></AppShell>;
  return <AppShell><SalesPageGate permission="sales.returns.create"><PageHeader title={mode === 'edit' ? `Edit ${salesReturn?.return_number ?? 'Sales Return'}` : 'New Sales Return'} description="Create return document and AR impact summary without stock movement UI." /><form onSubmit={submit} className="mt-6 space-y-6">{error ? <ErrorState message={error} /> : null}<div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">No stock return movement UI is rendered in Phase 14. Inventory handling belongs to Inventory UI phases.</div><div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-3"><label><span className="text-xs font-medium text-slate-500">Customer *</span><select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"><option value="">Select customer</option>{contacts.map((contact) => <option key={contact.id} value={contact.id}>{String(contact.name ?? contact.id)}</option>)}</select></label><label><span className="text-xs font-medium text-slate-500">Return Date *</span><input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></label><label><span className="text-xs font-medium text-slate-500">Reason</span><input value={reason} onChange={(e) => setReason(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></label></div><DataTable columns={['Description', 'Qty', 'Max', 'Unit Price', 'Discount', 'Tax', 'Line Total']}>{lines.map((line, index) => <tr key={index}><td className="px-2 py-3"><input value={line.description} onChange={(e) => updateLine(index, 'description', e.target.value)} className="w-full rounded-lg border px-2 py-2 text-sm" /></td><td className="px-2 py-3"><input type="number" min="0" step="0.01" value={line.quantity} onChange={(e) => updateLine(index, 'quantity', e.target.value)} className="w-24 rounded-lg border px-2 py-2 text-right text-sm" /></td><td className="px-2 py-3 text-right">{line.max_quantity ?? '-'}</td><td className="px-2 py-3"><input type="number" min="0" step="0.01" value={line.unit_price} onChange={(e) => updateLine(index, 'unit_price', e.target.value)} className="w-28 rounded-lg border px-2 py-2 text-right text-sm" /></td><td className="px-2 py-3"><input type="number" min="0" step="0.01" value={line.discount_amount} onChange={(e) => updateLine(index, 'discount_amount', e.target.value)} className="w-28 rounded-lg border px-2 py-2 text-right text-sm" /></td><td className="px-2 py-3"><input type="number" min="0" step="0.01" value={line.tax_amount} onChange={(e) => updateLine(index, 'tax_amount', e.target.value)} className="w-28 rounded-lg border px-2 py-2 text-right text-sm" /></td><td className="px-2 py-3"><input type="number" min="0" step="0.01" value={line.line_total} onChange={(e) => updateLine(index, 'line_total', e.target.value)} className="w-32 rounded-lg border px-2 py-2 text-right text-sm" /></td></tr>)}</DataTable><label className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><span className="text-xs font-medium text-slate-500">Notes</span><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" /></label><button type="submit" disabled={saving} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">{saving ? 'Saving...' : 'Save Sales Return'}</button></form></SalesPageGate></AppShell>;
}

function initialLines(lines?: SalesLineItem[]): DraftLine[] {
  const mapped = (lines ?? []).map((line) => {
    const quantity = Number(line.quantity ?? 1);
    const returned = Number(line.returned_quantity ?? 0);
    const remaining = Math.max(0, quantity - returned);
    const unitPrice = Number(line.unit_price ?? 0);
    return { sales_invoice_line_id: line.proforma_invoice_line_id ? null : line.id ?? line.sales_order_line_id ?? null, delivery_order_line_id: line.delivery_order_line_id ?? null, description: line.description ?? '', quantity: String(remaining || quantity || 1), max_quantity: remaining || quantity || null, unit_price: String(unitPrice), discount_amount: String(line.discount_amount ?? 0), tax_amount: String(line.tax_amount ?? 0), line_total: String(line.line_total ?? quantity * unitPrice) };
  });
  return mapped.length ? mapped : [{ description: '', quantity: '1', max_quantity: null, unit_price: '0', discount_amount: '0', tax_amount: '0', line_total: '0' }];
}
