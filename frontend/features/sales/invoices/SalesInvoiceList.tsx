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
import type { SalesInvoice } from '@/features/sales/types';
import { listSalesInvoices } from './api';

const statuses = ['draft', 'approved', 'posted', 'partially_paid', 'paid', 'overdue', 'void'];

export function SalesInvoiceList() {
  const [documents, setDocuments] = useState<SalesInvoice[]>([]);
  const [filters, setFilters] = useState<SalesFilterState>({ search: '', status: '', date_from: '', date_to: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await listSalesInvoices({ status: filters.status });
      setDocuments(response.data ?? []);
    } catch (event) {
      setError(getApiErrorMessage(event));
    } finally {
      setLoading(false);
    }
  }, [filters.status]);
  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);
  const rows = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return documents.filter((document) => {
      const date = salesDocumentDate(document);
      return (!search || salesDocumentNumber(document).toLowerCase().includes(search) || customerName(document).toLowerCase().includes(search)) &&
        (!filters.date_from || date >= filters.date_from) &&
        (!filters.date_to || date <= filters.date_to);
    });
  }, [documents, filters]);
  return (
    <AppShell>
      <SalesPageGate permission="sales.invoices.view">
        <PageHeader title="Sales Invoices" description="Create, approve, post, void, and monitor AR invoice balances." actions={<PermissionGuard permission="sales.invoices.create"><Link href="/sales/invoices/new" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">New Sales Invoice</Link></PermissionGuard>} />
        <div className="mt-6 space-y-4">
          <SalesFilters filters={filters} onChange={setFilters} onApply={load} statuses={statuses} />
          {loading ? <LoadingState title="Loading sales invoices" /> : null}
          {error ? <ErrorState message={error} /> : null}
          {!loading && !error && rows.length === 0 ? <EmptyState title="No sales invoices found" description="Create an invoice or convert a source document." /> : null}
          {!loading && !error && rows.length > 0 ? (
            <DataTable columns={['Invoice', 'Date', 'Due', 'Customer', 'Status', 'Balance', 'Actions']}>
              {rows.map((document) => (
                <tr key={document.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{salesDocumentNumber(document)}</td>
                  <td className="px-4 py-3 text-slate-700">{formatDate(salesDocumentDate(document))}</td>
                  <td className="px-4 py-3 text-slate-700">{formatDate(document.due_date)}</td>
                  <td className="px-4 py-3 text-slate-700">{customerName(document)}</td>
                  <td className="px-4 py-3"><SalesStatusBadge status={document.status ?? 'draft'} /></td>
                  <td className="px-4 py-3 text-right font-semibold">{formatCurrency(document.balance_due ?? document.grand_total)}</td>
                  <td className="px-4 py-3"><Link href={`/sales/invoices/${document.id}`} className="text-sm font-medium text-slate-900 underline">View</Link></td>
                </tr>
              ))}
            </DataTable>
          ) : null}
        </div>
      </SalesPageGate>
    </AppShell>
  );
}
