'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { WorkspaceColumn, WorkspaceFilterState } from '@/components/workspace';
import {
  SalesDocumentListWorkspace,
  toWorkspaceStatusOptions,
} from '@/features/sales/components/SalesDocumentListWorkspace';
import { SalesStatusBadge } from '@/features/sales/components/SalesStatusBadge';
import { customerName, salesDocumentDate, salesDocumentNumber } from '@/features/sales/documents/documentHelpers';
import type { SalesOrder } from '@/features/sales/types';
import { getApiErrorMessage } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { listSalesOrders } from './api';

const orderStatuses = ['draft', 'approved', 'confirmed', 'delivered', 'invoiced', 'closed', 'cancelled'];

export function SalesOrderList() {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [filters, setFilters] = useState<WorkspaceFilterState>({
    search: '',
    status: 'all',
    party: 'all',
    dateFrom: '',
    dateTo: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await listSalesOrders({
        status: filters.status === 'all' ? undefined : filters.status,
      });
      setOrders(response.data ?? []);
    } catch (event) {
      setError(getApiErrorMessage(event));
    } finally {
      setLoading(false);
    }
  }, [filters.status]);

  useEffect(() => {
    queueMicrotask(() => void load());
  }, [load]);

  const columns = useMemo<WorkspaceColumn<SalesOrder>[]>(
    () => [
      {
        key: 'order',
        label: 'Order',
        widthClassName: 'min-w-[190px]',
        sortable: true,
        sortValue: salesDocumentNumber,
        render: (order) => (
          <div>
            <p className="font-bold text-slate-950">{salesDocumentNumber(order)}</p>
            <p className="mt-1 text-xs text-slate-400">
              Source {order.quotation?.quotation_number ?? order.source_number ?? '-'}
            </p>
          </div>
        ),
      },
      {
        key: 'date',
        label: 'Date',
        widthClassName: 'min-w-[140px]',
        sortable: true,
        sortValue: salesDocumentDate,
        render: (order) => formatDate(salesDocumentDate(order)),
      },
      {
        key: 'customer',
        label: 'Customer',
        widthClassName: 'min-w-[240px]',
        sortable: true,
        sortValue: customerName,
        render: (order) => customerName(order),
      },
      {
        key: 'status',
        label: 'Status',
        widthClassName: 'min-w-[150px]',
        sortable: true,
        sortValue: (order) => String(order.status ?? 'draft'),
        render: (order) => <SalesStatusBadge status={order.status ?? 'draft'} />,
      },
      {
        key: 'grand_total',
        label: 'Grand Total',
        align: 'right',
        widthClassName: 'min-w-[150px]',
        sortable: true,
        sortValue: (order) => Number(order.grand_total ?? 0),
        render: (order) => (
          <p className="font-bold text-slate-950">{formatCurrency(order.grand_total ?? 0)}</p>
        ),
      },
    ],
    [],
  );

  return (
    <SalesDocumentListWorkspace
      title="Sales Orders"
      description="Create direct orders, convert quotations, manage confirmations, and monitor fulfillment quantities."
      permission="sales.orders.view"
      createPermission="sales.orders.create"
      createHref="/sales/orders/new"
      detailHref={(order) => `/sales/orders/${order.id}`}
      documentLabel="Sales Order"
      newButtonLabel="New Sales Order"
      rows={orders}
      columns={columns}
      filters={filters}
      statusOptions={toWorkspaceStatusOptions(orderStatuses)}
      loading={loading}
      error={error}
      emptyTitle="No sales orders found"
      emptyDescription="Create an order or convert an accepted quotation."
      searchPlaceholder="Cari nomor order, customer, source, atau status..."
      onApplyFilters={load}
      onFilterChange={setFilters}
    />
  );
}
