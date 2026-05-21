'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { DataTable } from '@/components/ui/DataTable';
import { PageHeader } from '@/components/ui/PageHeader';
import { PermissionGuard } from '@/components/ui/PermissionGuard';
import { SalesActionBar, type SalesAction } from '@/features/sales/components/SalesActionBar';
import { SalesLineItemsTable } from '@/features/sales/components/SalesLineItemsTable';
import { SalesSourceChain } from '@/features/sales/components/SalesSourceChain';
import { SalesStatusBadge } from '@/features/sales/components/SalesStatusBadge';
import { SalesTotalsCard } from '@/features/sales/components/SalesTotalsCard';
import { SalesPageGate } from '@/features/sales/SalesPageGate';
import { customerName, isOrderEditable, salesDocumentNumber } from '@/features/sales/documents/documentHelpers';
import { getApiErrorMessage } from '@/lib/api';
import { formatDate, formatNumber } from '@/lib/formatters';
import type { SalesOrder } from '@/features/sales/types';
import {
  approveSalesOrder,
  cancelSalesOrder,
  closeSalesOrder,
  confirmSalesOrder,
  createDeliveryOrderFromSalesOrder,
  createSalesInvoiceFromSalesOrder,
} from './api';

type SalesOrderDetailProps = {
  order: SalesOrder;
};

export function SalesOrderDetail({ order }: SalesOrderDetailProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function runAction(action: () => Promise<unknown>, redirectTo?: string) {
    try {
      setBusy(true);
      setError(null);
      await action();
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.refresh();
      }
    } catch (event) {
      setError(getApiErrorMessage(event));
    } finally {
      setBusy(false);
    }
  }

  const actions: SalesAction[] = [
    { key: 'approve', label: 'Approve', permission: 'sales.orders.approve', disabled: busy || order.status !== 'draft', confirm: 'Approve this sales order?', onClick: () => runAction(() => approveSalesOrder(order.id)) },
    { key: 'confirm', label: 'Confirm', permission: 'sales.orders.confirm', disabled: busy || !['draft', 'approved'].includes(String(order.status)), confirm: 'Confirm this sales order?', onClick: () => runAction(() => confirmSalesOrder(order.id)) },
    { key: 'cancel', label: 'Cancel', permission: 'sales.orders.cancel', danger: true, disabled: busy || !['draft', 'approved', 'confirmed'].includes(String(order.status)), onClick: () => runAction(() => cancelSalesOrder(order.id, window.prompt('Cancel reason') ?? 'Cancelled from UI')) },
    { key: 'close', label: 'Close', permission: 'sales.orders.confirm', disabled: busy || !['confirmed', 'delivered', 'invoiced'].includes(String(order.status)), confirm: 'Close this sales order?', onClick: () => runAction(() => closeSalesOrder(order.id)) },
    { key: 'delivery-order', label: 'Create Delivery Order', permission: 'sales.delivery_orders.create', disabled: busy, confirm: 'Create delivery order from this sales order?', onClick: () => runAction(() => createDeliveryOrderFromSalesOrder(order.id), '/sales/delivery-orders') },
    { key: 'sales-invoice', label: 'Create Sales Invoice', permission: 'sales.invoices.create', disabled: busy, confirm: 'Create sales invoice from this sales order?', onClick: () => runAction(() => createSalesInvoiceFromSalesOrder(order.id), '/sales/invoices') },
  ];

  return (
    <AppShell>
      <SalesPageGate permission="sales.orders.view">
        <PageHeader
          title={salesDocumentNumber(order)}
          description="Sales order detail with fulfillment tracking, down payment context, source chain, and workflow actions."
          actions={
            isOrderEditable(order.status) ? (
              <PermissionGuard permission="sales.orders.edit">
                <Link href={`/sales/orders/${order.id}/edit`} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  Edit
                </Link>
              </PermissionGuard>
            ) : null
          }
        />

        <div className="mt-6 space-y-6">
          {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
          <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Customer</p>
                  <p className="mt-1 text-lg font-semibold text-slate-950">{customerName(order)}</p>
                  <p className="mt-1 text-sm text-slate-600">Order Date: {formatDate(order.order_date)}</p>
                  {order.quotation ? <p className="text-sm text-slate-600">Source Quotation: {order.quotation.quotation_number}</p> : null}
                  {order.has_down_payment ? <p className="mt-2 text-sm font-medium text-amber-700">Down payment is stored as Customer Deposit.</p> : null}
                </div>
                <SalesStatusBadge status={order.status ?? 'draft'} />
              </div>
              <div className="mt-4">
                <SalesActionBar actions={actions} />
              </div>
              <SalesSourceChain
                sourceType={order.source_type}
                sourceNumber={order.source_number}
                sourceRevision={order.source_revision}
              />
            </div>
            <SalesTotalsCard totals={order} />
          </div>
          <SalesLineItemsTable lines={order.lines ?? []} />
          <FulfillmentTable order={order} />
        </div>
      </SalesPageGate>
    </AppShell>
  );
}

function FulfillmentTable({ order }: { order: SalesOrder }) {
  return (
    <DataTable columns={['Description', 'Ordered', 'Delivered', 'Invoiced', 'Returned']}>
      {(order.lines ?? []).map((line, index) => (
        <tr key={line.id ?? index} className="hover:bg-slate-50">
          <td className="px-4 py-3 text-slate-700">{line.description ?? '-'}</td>
          <td className="px-4 py-3 text-right">{formatNumber(line.quantity)}</td>
          <td className="px-4 py-3 text-right">{formatNumber(line.delivered_quantity)}</td>
          <td className="px-4 py-3 text-right">{formatNumber(line.invoiced_quantity)}</td>
          <td className="px-4 py-3 text-right">{formatNumber(line.returned_quantity)}</td>
        </tr>
      ))}
    </DataTable>
  );
}
