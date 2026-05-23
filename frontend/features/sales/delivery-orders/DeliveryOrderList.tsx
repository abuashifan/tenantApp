'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { WorkspaceColumn, WorkspaceFilterState } from '@/components/workspace';
import {
  SalesDocumentListWorkspace,
  toWorkspaceStatusOptions,
} from '@/features/sales/components/SalesDocumentListWorkspace';
import { SalesStatusBadge } from '@/features/sales/components/SalesStatusBadge';
import { customerName, salesDocumentDate, salesDocumentNumber } from '@/features/sales/documents/documentHelpers';
import type { DeliveryOrder } from '@/features/sales/types';
import { getApiErrorMessage } from '@/lib/api';
import { formatDate } from '@/lib/formatters';
import { listDeliveryOrders } from './api';

const statuses = ['draft', 'ready', 'shipped', 'delivered', 'cancelled', 'void'];

export function DeliveryOrderList() {
  const [documents, setDocuments] = useState<DeliveryOrder[]>([]);
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
      const response = await listDeliveryOrders({
        status: filters.status === 'all' ? undefined : filters.status,
      });
      setDocuments(response.data ?? []);
    } catch (event) {
      setError(getApiErrorMessage(event));
    } finally {
      setLoading(false);
    }
  }, [filters.status]);

  useEffect(() => {
    queueMicrotask(() => void load());
  }, [load]);

  const columns = useMemo<WorkspaceColumn<DeliveryOrder>[]>(
    () => [
      {
        key: 'delivery',
        label: 'Delivery',
        widthClassName: 'min-w-[190px]',
        sortable: true,
        sortValue: salesDocumentNumber,
        render: (document) => (
          <div>
            <p className="font-bold text-slate-950">{salesDocumentNumber(document)}</p>
            <p className="mt-1 text-xs text-slate-400">
              SO {document.salesOrder?.order_number ?? document.sales_order?.order_number ?? document.source_number ?? '-'}
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
        render: (document) => formatDate(salesDocumentDate(document)),
      },
      {
        key: 'customer',
        label: 'Customer',
        widthClassName: 'min-w-[240px]',
        sortable: true,
        sortValue: customerName,
        render: (document) => customerName(document),
      },
      {
        key: 'status',
        label: 'Status',
        widthClassName: 'min-w-[150px]',
        sortable: true,
        sortValue: (document) => String(document.status ?? 'draft'),
        render: (document) => <SalesStatusBadge status={document.status ?? 'draft'} />,
      },
      {
        key: 'shipped',
        label: 'Shipped',
        widthClassName: 'min-w-[140px]',
        sortable: true,
        sortValue: (document) => document.shipped_at ?? '',
        render: (document) => (document.shipped_at ? formatDate(document.shipped_at) : '-'),
      },
      {
        key: 'delivered',
        label: 'Delivered',
        widthClassName: 'min-w-[140px]',
        sortable: true,
        sortValue: (document) => document.delivered_at ?? '',
        render: (document) => (document.delivered_at ? formatDate(document.delivered_at) : '-'),
      },
    ],
    [],
  );

  return (
    <SalesDocumentListWorkspace
      title="Delivery Orders"
      description="Manage delivery documents and shipping workflow without exposing inventory stock movement UI."
      permission="sales.delivery_orders.view"
      createPermission="sales.delivery_orders.create"
      createHref="/sales/delivery-orders/new"
      detailHref={(document) => `/sales/delivery-orders/${document.id}`}
      documentLabel="Delivery Order"
      newButtonLabel="New Delivery Order"
      rows={documents}
      columns={columns}
      filters={filters}
      statusOptions={toWorkspaceStatusOptions(statuses)}
      loading={loading}
      error={error}
      emptyTitle="No delivery orders found"
      emptyDescription="Create a direct delivery or convert a sales order."
      searchPlaceholder="Cari nomor delivery, customer, source, atau status..."
      onApplyFilters={load}
      onFilterChange={setFilters}
    />
  );
}
