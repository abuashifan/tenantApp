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
import type { SalesQuotation } from '@/features/sales/types';
import { listSalesQuotations } from './api';

const quotationStatuses = ['draft', 'sent', 'approved', 'accepted', 'rejected', 'converted', 'cancelled', 'expired'];

export function QuotationList() {
  const [quotations, setQuotations] = useState<SalesQuotation[]>([]);
  const [filters, setFilters] = useState<SalesFilterState>({ search: '', status: '', date_from: '', date_to: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await listSalesQuotations({ status: filters.status });
      setQuotations(response.data ?? []);
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

  const visibleQuotations = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return quotations.filter((quotation) => {
      const date = salesDocumentDate(quotation);
      const matchesSearch =
        !search ||
        salesDocumentNumber(quotation).toLowerCase().includes(search) ||
        customerName(quotation).toLowerCase().includes(search);
      const matchesFrom = !filters.date_from || date >= filters.date_from;
      const matchesTo = !filters.date_to || date <= filters.date_to;
      return matchesSearch && matchesFrom && matchesTo;
    });
  }, [filters.date_from, filters.date_to, filters.search, quotations]);

  return (
    <AppShell>
      <SalesPageGate permission="sales.quotations.view">
        <PageHeader
          title="Sales Quotations"
          description="Create, send, approve, accept, reject, cancel, and convert customer quotations."
          actions={
            <PermissionGuard permission="sales.quotations.create">
              <Link href="/sales/quotations/new" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
                New Quotation
              </Link>
            </PermissionGuard>
          }
        />

        <div className="mt-6 space-y-4">
          <SalesFilters filters={filters} onChange={setFilters} onApply={load} statuses={quotationStatuses} />
          {loading ? <LoadingState title="Loading quotations" /> : null}
          {error ? <ErrorState message={error} /> : null}
          {!loading && !error && visibleQuotations.length === 0 ? (
            <EmptyState title="No quotations found" description="Create a quotation or adjust the filters." />
          ) : null}
          {!loading && !error && visibleQuotations.length > 0 ? (
            <DataTable columns={['Quotation', 'Date', 'Customer', 'Status', 'Grand Total', 'Actions']}>
              {visibleQuotations.map((quotation) => (
                <tr key={quotation.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{salesDocumentNumber(quotation)}</td>
                  <td className="px-4 py-3 text-slate-700">{formatDate(salesDocumentDate(quotation))}</td>
                  <td className="px-4 py-3 text-slate-700">{customerName(quotation)}</td>
                  <td className="px-4 py-3"><SalesStatusBadge status={quotation.status ?? 'draft'} /></td>
                  <td className="px-4 py-3 text-right font-semibold">{formatCurrency(quotation.grand_total)}</td>
                  <td className="px-4 py-3">
                    <Link href={`/sales/quotations/${quotation.id}`} className="text-sm font-medium text-slate-900 underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </DataTable>
          ) : null}
        </div>
      </SalesPageGate>
    </AppShell>
  );
}
