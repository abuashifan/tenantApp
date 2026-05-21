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
import type { SalesOrder } from '@/features/sales/types';
import { listSalesOrders } from './api';

const orderStatuses = ['draft', 'approved', 'confirmed', 'delivered', 'invoiced', 'closed', 'cancelled'];

export function SalesOrderList() {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [filters, setFilters] = useState<SalesFilterState>({ search: '', status: '', date_from: '', date_to: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await listSalesOrders({ status: filters.status });
      setOrders(response.data ?? []);
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

  const visibleOrders = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return orders.filter((order) => {
      const date = salesDocumentDate(order);
      const matchesSearch =
        !search ||
        salesDocumentNumber(order).toLowerCase().includes(search) ||
        customerName(order).toLowerCase().includes(search);
      return matchesSearch && (!filters.date_from || date >= filters.date_from) && (!filters.date_to || date <= filters.date_to);
    });
  }, [filters.date_from, filters.date_to, filters.search, orders]);

  return (
    <AppShell>
      <SalesPageGate permission="sales.orders.view">
        <PageHeader
          title="Sales Orders"
          description="Create direct orders, convert quotations, manage confirmations, and monitor fulfillment quantities."
          actions={
            <PermissionGuard permission="sales.orders.create">
              <Link href="/sales/orders/new" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
                New Sales Order
              </Link>
            </PermissionGuard>
          }
        />
        <div className="mt-6 space-y-4">
          <SalesFilters filters={filters} onChange={setFilters} onApply={load} statuses={orderStatuses} />
          {loading ? <LoadingState title="Loading sales orders" /> : null}
          {error ? <ErrorState message={error} /> : null}
          {!loading && !error && visibleOrders.length === 0 ? (
            <EmptyState title="No sales orders found" description="Create an order or convert an accepted quotation." />
          ) : null}
          {!loading && !error && visibleOrders.length > 0 ? (
            <DataTable columns={['Order', 'Date', 'Customer', 'Status', 'Grand Total', 'Actions']}>
              {visibleOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{salesDocumentNumber(order)}</td>
                  <td className="px-4 py-3 text-slate-700">{formatDate(salesDocumentDate(order))}</td>
                  <td className="px-4 py-3 text-slate-700">{customerName(order)}</td>
                  <td className="px-4 py-3"><SalesStatusBadge status={order.status ?? 'draft'} /></td>
                  <td className="px-4 py-3 text-right font-semibold">{formatCurrency(order.grand_total)}</td>
                  <td className="px-4 py-3">
                    <Link href={`/sales/orders/${order.id}`} className="text-sm font-medium text-slate-900 underline">
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
