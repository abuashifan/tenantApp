'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { PermissionGuard } from '@/components/ui/PermissionGuard';
import { SalesActionBar, type SalesAction } from '@/features/sales/components/SalesActionBar';
import { SalesLineItemsTable } from '@/features/sales/components/SalesLineItemsTable';
import { SalesSourceChain } from '@/features/sales/components/SalesSourceChain';
import { SalesStatusBadge } from '@/features/sales/components/SalesStatusBadge';
import { SalesPageGate } from '@/features/sales/SalesPageGate';
import { customerName, isDeliveryOrderEditable, salesDocumentNumber } from '@/features/sales/documents/documentHelpers';
import { getApiErrorMessage } from '@/lib/api';
import { formatDate } from '@/lib/formatters';
import type { DeliveryOrder } from '@/features/sales/types';
import { cancelDeliveryOrder, deliverDeliveryOrder, readyDeliveryOrder, shipDeliveryOrder, voidDeliveryOrder } from './api';

export function DeliveryOrderDetail({ deliveryOrder }: { deliveryOrder: DeliveryOrder }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function runAction(action: () => Promise<unknown>) {
    try {
      setBusy(true);
      setError(null);
      await action();
      router.refresh();
    } catch (event) {
      setError(getApiErrorMessage(event));
    } finally {
      setBusy(false);
    }
  }

  const actions: SalesAction[] = [
    { key: 'ready', label: 'Mark Ready', permission: 'sales.delivery_orders.ship', disabled: busy || deliveryOrder.status !== 'draft', confirm: 'Mark this delivery order ready?', onClick: () => runAction(() => readyDeliveryOrder(deliveryOrder.id)) },
    { key: 'ship', label: 'Ship', permission: 'sales.delivery_orders.ship', disabled: busy || !['draft', 'ready'].includes(String(deliveryOrder.status)), confirm: 'Ship this delivery order?', onClick: () => runAction(() => shipDeliveryOrder(deliveryOrder.id)) },
    { key: 'deliver', label: 'Deliver', permission: 'sales.delivery_orders.deliver', disabled: busy || !['ready', 'shipped'].includes(String(deliveryOrder.status)), confirm: 'Mark this delivery order delivered?', onClick: () => runAction(() => deliverDeliveryOrder(deliveryOrder.id)) },
    { key: 'cancel', label: 'Cancel', permission: 'sales.delivery_orders.cancel', danger: true, disabled: busy || !['draft', 'ready', 'shipped'].includes(String(deliveryOrder.status)), onClick: () => runAction(() => cancelDeliveryOrder(deliveryOrder.id, window.prompt('Cancel reason') ?? 'Cancelled from UI')) },
    { key: 'void', label: 'Void', permission: 'sales.delivery_orders.void', danger: true, disabled: busy || deliveryOrder.status === 'void', onClick: () => runAction(() => voidDeliveryOrder(deliveryOrder.id, window.prompt('Void reason') ?? 'Voided from UI')) },
  ];

  return (
    <AppShell>
      <SalesPageGate permission="sales.delivery_orders.view">
        <PageHeader
          title={salesDocumentNumber(deliveryOrder)}
          description="Delivery order detail. Phase 14 does not expose inventory stock movement UI."
          actions={isDeliveryOrderEditable(deliveryOrder.status) ? <PermissionGuard permission="sales.delivery_orders.edit"><Link href={`/sales/delivery-orders/${deliveryOrder.id}/edit`} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Edit</Link></PermissionGuard> : null}
        />
        <div className="mt-6 space-y-6">
          {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Customer</p>
                <p className="mt-1 text-lg font-semibold text-slate-950">{customerName(deliveryOrder)}</p>
                <p className="mt-1 text-sm text-slate-600">Delivery Date: {formatDate(deliveryOrder.delivery_date)}</p>
                <p className="text-sm text-slate-600">Shipped: {formatDate(deliveryOrder.shipped_at)} · Delivered: {formatDate(deliveryOrder.delivered_at)}</p>
              </div>
              <SalesStatusBadge status={deliveryOrder.status ?? 'draft'} />
            </div>
            <div className="mt-4"><SalesActionBar actions={actions} /></div>
            <div className="mt-4"><SalesSourceChain sourceType={deliveryOrder.source_type ?? 'sales_order'} sourceNumber={deliveryOrder.source_number ?? deliveryOrder.salesOrder?.order_number ?? deliveryOrder.sales_order?.order_number} sourceRevision={deliveryOrder.source_revision} /></div>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">No stock movement button is rendered in Phase 14. Inventory movement belongs to Inventory UI phases.</div>
          <SalesLineItemsTable lines={deliveryOrder.lines ?? []} />
        </div>
      </SalesPageGate>
    </AppShell>
  );
}
