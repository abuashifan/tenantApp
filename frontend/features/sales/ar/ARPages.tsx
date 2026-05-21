'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { DataTable } from '@/components/ui/DataTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { PageHeader } from '@/components/ui/PageHeader';
import { PermissionGuard } from '@/components/ui/PermissionGuard';
import { SalesPageGate } from '@/features/sales/SalesPageGate';
import { getApiErrorMessage } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { getARAging, getARCustomerLedger, getARCustomerSummary, getARInvoiceLedger, getARReconciliation, getOpenInvoices } from './api';

type Row = Record<string, unknown>;

export function ARLedgerSummary() {
  const [rows, setRows] = useState<Row[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => { try { setLoading(true); setError(null); setRows((await getARCustomerSummary()).data ?? []); } catch (event) { setError(getApiErrorMessage(event)); } finally { setLoading(false); } }, []);
  useEffect(() => { queueMicrotask(() => void load()); }, [load]);
  const visible = useMemo(() => rows.filter((row) => JSON.stringify(row).toLowerCase().includes(search.toLowerCase())), [rows, search]);
  return <AppShell><SalesPageGate permission="sales.ar.view"><PageHeader title="AR Ledger" description="Read-only customer receivable subsidiary ledger summary." /><div className="mt-6 space-y-4"><SearchBox value={search} onChange={setSearch} />{loading ? <LoadingState title="Loading AR ledger" /> : null}{error ? <ErrorState message={error} /> : null}{!loading && !error && visible.length === 0 ? <EmptyState title="No AR rows found" description="No receivable summary matched the current filter." /> : null}{visible.length > 0 ? <DataTable columns={['Customer', 'Opening', 'Debit', 'Credit', 'Balance', 'Actions']}>{visible.map((row, index) => <tr key={index}><td className="px-4 py-3 font-medium">{text(row, 'customer_name', 'name', 'customer_id')}</td><td className="px-4 py-3 text-right">{money(row, 'opening_balance')}</td><td className="px-4 py-3 text-right">{money(row, 'debit')}</td><td className="px-4 py-3 text-right">{money(row, 'credit')}</td><td className="px-4 py-3 text-right font-semibold">{money(row, 'balance', 'ending_balance')}</td><td className="px-4 py-3">{row.customer_id ? <Link className="underline" href={`/sales/ar-ledger/customers/${String(row.customer_id)}`}>Detail</Link> : '-'}</td></tr>)}</DataTable> : null}</div></SalesPageGate></AppShell>;
}

export function CustomerLedgerPage({ customerId }: { customerId: string }) {
  return <ARObjectPage title="Customer AR Ledger" permission="sales.ar.view" loader={() => getARCustomerLedger(customerId)} />;
}

export function InvoiceLedgerPage({ invoiceId }: { invoiceId: string }) {
  return <ARObjectPage title="Invoice AR Movements" permission="sales.ar.view" loader={() => getARInvoiceLedger(invoiceId)} />;
}

export function OpenInvoicesPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => { try { setLoading(true); setError(null); setRows((await getOpenInvoices()).data ?? []); } catch (event) { setError(getApiErrorMessage(event)); } finally { setLoading(false); } }, []);
  useEffect(() => { queueMicrotask(() => void load()); }, [load]);
  const visible = useMemo(() => rows.filter((row) => JSON.stringify(row).toLowerCase().includes(search.toLowerCase())), [rows, search]);
  return <AppShell><SalesPageGate permission="sales.ar.view"><PageHeader title="Open Invoices" description="Read-only list of receivables still open for collection." /><div className="mt-6 space-y-4"><SearchBox value={search} onChange={setSearch} />{loading ? <LoadingState title="Loading open invoices" /> : null}{error ? <ErrorState message={error} /> : null}{!loading && !error && visible.length === 0 ? <EmptyState title="No open invoices" description="No open invoice matched the current filter." /> : null}{visible.length > 0 ? <DataTable columns={['Invoice', 'Customer', 'Date', 'Due', 'Balance', 'Action']}>{visible.map((row, index) => <tr key={index}><td className="px-4 py-3 font-medium">{text(row, 'invoice_number', 'document_number')}</td><td className="px-4 py-3">{text(row, 'customer_name', 'customer_id')}</td><td className="px-4 py-3">{formatDate(String(row.invoice_date ?? row.date ?? ''))}</td><td className="px-4 py-3">{formatDate(String(row.due_date ?? ''))}</td><td className="px-4 py-3 text-right font-semibold">{money(row, 'balance_due', 'balance')}</td><td className="px-4 py-3"><PermissionGuard permission="sales.receipts.create">{row.id || row.invoice_id ? <Link className="underline" href={`/sales/receipts/from-invoice/${String(row.id ?? row.invoice_id)}`}>Receive</Link> : null}</PermissionGuard></td></tr>)}</DataTable> : null}</div></SalesPageGate></AppShell>;
}

export function ARAgingPage() {
  return <ARObjectPage title="AR Aging" permission="sales.ar.view" loader={() => getARAging()} />;
}

export function ARReconciliationPage() {
  return <ARObjectPage title="AR Reconciliation" permission="sales.ar.reconcile" loader={() => getARReconciliation()} />;
}

function ARObjectPage({ title, permission, loader }: { title: string; permission: string; loader: () => Promise<{ data: Record<string, unknown> }> }) {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => { try { setLoading(true); setError(null); setData((await loader()).data); } catch (event) { setError(getApiErrorMessage(event)); } finally { setLoading(false); } }, [loader]);
  useEffect(() => { queueMicrotask(() => void load()); }, [load]);
  const rows = Array.isArray(data?.rows) ? data.rows as Row[] : Array.isArray(data?.data) ? data.data as Row[] : Array.isArray(data?.invoices) ? data.invoices as Row[] : [];
  return <AppShell><SalesPageGate permission={permission}><PageHeader title={title} description="Read-only AR report. Print-friendly browser view only; no export engine is generated." /><div className="mt-6 space-y-4">{loading ? <LoadingState title={`Loading ${title}`} /> : null}{error ? <ErrorState message={error} /> : null}{data ? <SummaryCard data={data} /> : null}{rows.length > 0 ? <DataTable columns={Object.keys(rows[0]).slice(0, 6)}>{rows.map((row, index) => <tr key={index}>{Object.keys(rows[0]).slice(0, 6).map((key) => <td key={key} className="px-4 py-3">{String(row[key] ?? '-')}</td>)}</tr>)}</DataTable> : !loading && !error ? <EmptyState title="No report rows" description="The backend returned no tabular rows for this report." /> : null}</div></SalesPageGate></AppShell>;
}

function SummaryCard({ data }: { data: Record<string, unknown> }) {
  return <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 text-sm shadow-sm md:grid-cols-4">{Object.entries(data).filter(([, value]) => !Array.isArray(value) && typeof value !== 'object').slice(0, 12).map(([key, value]) => <div key={key}><div className="text-xs uppercase text-slate-500">{key.replaceAll('_', ' ')}</div><div className="mt-1 font-semibold text-slate-950">{String(value ?? '-')}</div></div>)}</div>;
}

function SearchBox({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <input value={value} onChange={(event) => onChange(event.target.value)} placeholder="Search customer or invoice" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm md:max-w-md" />;
}

function text(row: Row, ...keys: string[]): string {
  const value = keys.map((key) => row[key]).find((item) => item !== undefined && item !== null && item !== '');
  return String(value ?? '-');
}

function money(row: Row, ...keys: string[]): string {
  const value = keys.map((key) => row[key]).find((item) => item !== undefined && item !== null && item !== '');
  return formatCurrency(value as string | number | null | undefined);
}
