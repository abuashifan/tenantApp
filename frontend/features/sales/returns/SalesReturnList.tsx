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
import { SalesFilters, type SalesFilterState } from '@/features/sales/components/SalesFilters';
import { SalesStatusBadge } from '@/features/sales/components/SalesStatusBadge';
import { SalesPageGate } from '@/features/sales/SalesPageGate';
import { customerName, salesDocumentDate, salesDocumentNumber } from '@/features/sales/documents/documentHelpers';
import { getApiErrorMessage } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/formatters';
import type { SalesReturn } from '@/features/sales/types';
import { listSalesReturns } from './api';

export function SalesReturnList() {
  const [rows, setRows] = useState<SalesReturn[]>([]);
  const [filters, setFilters] = useState<SalesFilterState>({ search: '', status: '', date_from: '', date_to: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => { try { setLoading(true); setError(null); setRows((await listSalesReturns({ status: filters.status })).data ?? []); } catch (event) { setError(getApiErrorMessage(event)); } finally { setLoading(false); } }, [filters.status]);
  useEffect(() => { queueMicrotask(() => void load()); }, [load]);
  const filtered = useMemo(() => rows.filter((row) => { const search = filters.search.toLowerCase(); const date = salesDocumentDate(row); return (!search || salesDocumentNumber(row).toLowerCase().includes(search) || customerName(row).toLowerCase().includes(search)) && (!filters.date_from || date >= filters.date_from) && (!filters.date_to || date <= filters.date_to); }), [filters, rows]);
  return <AppShell><SalesPageGate permission="sales.returns.view"><PageHeader title="Sales Returns" description="Manage return documents and AR impact without stock return movement UI." actions={<PermissionGuard permission="sales.returns.create"><Link href="/sales/returns/new" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">New Sales Return</Link></PermissionGuard>} /><div className="mt-6 space-y-4"><SalesFilters filters={filters} onChange={setFilters} onApply={load} statuses={['draft', 'approved', 'posted', 'void']} />{loading ? <LoadingState title="Loading sales returns" /> : null}{error ? <ErrorState message={error} /> : null}{!loading && !error && filtered.length === 0 ? <EmptyState title="No sales returns found" description="Create a return or convert from invoice/delivery." /> : null}{!loading && !error && filtered.length > 0 ? <DataTable columns={['Return', 'Date', 'Customer', 'Status', 'Amount', 'Actions']}>{filtered.map((row) => <tr key={row.id} className="hover:bg-slate-50"><td className="px-4 py-3 font-medium">{salesDocumentNumber(row)}</td><td className="px-4 py-3">{formatDate(row.return_date)}</td><td className="px-4 py-3">{customerName(row)}</td><td className="px-4 py-3"><SalesStatusBadge status={row.status ?? 'draft'} /></td><td className="px-4 py-3 text-right">{formatCurrency(row.grand_total)}</td><td className="px-4 py-3"><Link href={`/sales/returns/${row.id}`} className="text-sm font-medium underline">View</Link></td></tr>)}</DataTable> : null}</div></SalesPageGate></AppShell>;
}
