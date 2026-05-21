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
import { formatDate } from '@/lib/formatters';
import type { DeliveryOrder } from '@/features/sales/types';
import { listDeliveryOrders } from './api';

const statuses = ['draft', 'ready', 'shipped', 'delivered', 'cancelled', 'void'];

export function DeliveryOrderList() {
  const [documents, setDocuments] = useState<DeliveryOrder[]>([]);
  const [filters, setFilters] = useState<SalesFilterState>({ search: '', status: '', date_from: '', date_to: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await listDeliveryOrders({ status: filters.status });
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
      <SalesPageGate permission="sales.delivery_orders.view">
        <PageHeader
          title="Delivery Orders"
          description="Manage delivery documents and shipping workflow without exposing inventory stock movement UI."
          actions={<PermissionGuard permission="sales.delivery_orders.create"><Link href="/sales/delivery-orders/new" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">New Delivery Order</Link></PermissionGuard>}
        />
        <div className="mt-6 space-y-4">
          <SalesFilters filters={filters} onChange={setFilters} onApply={load} statuses={statuses} />
          {loading ? <LoadingState title="Loading delivery orders" /> : null}
          {error ? <ErrorState message={error} /> : null}
          {!loading && !error && rows.length === 0 ? <EmptyState title="No delivery orders found" description="Create a direct delivery or convert a sales order." /> : null}
          {!loading && !error && rows.length > 0 ? (
            <DataTable columns={['Delivery', 'Date', 'Customer', 'Status', 'Shipped', 'Delivered', 'Actions']}>
              {rows.map((document) => (
                <tr key={document.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{salesDocumentNumber(document)}</td>
                  <td className="px-4 py-3 text-slate-700">{formatDate(salesDocumentDate(document))}</td>
                  <td className="px-4 py-3 text-slate-700">{customerName(document)}</td>
                  <td className="px-4 py-3"><SalesStatusBadge status={document.status ?? 'draft'} /></td>
                  <td className="px-4 py-3 text-slate-700">{formatDate(document.shipped_at)}</td>
                  <td className="px-4 py-3 text-slate-700">{formatDate(document.delivered_at)}</td>
                  <td className="px-4 py-3"><Link href={`/sales/delivery-orders/${document.id}`} className="text-sm font-medium text-slate-900 underline">View</Link></td>
                </tr>
              ))}
            </DataTable>
          ) : null}
        </div>
      </SalesPageGate>
    </AppShell>
  );
}
