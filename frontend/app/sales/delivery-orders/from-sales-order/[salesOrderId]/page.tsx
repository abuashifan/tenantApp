'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { DeliveryOrderForm } from '@/features/sales/delivery-orders/DeliveryOrderForm';
import { getSalesOrder } from '@/features/sales/orders/api';
import { getApiErrorMessage } from '@/lib/api';
import type { SalesOrder } from '@/features/sales/types';

export default function DeliveryOrderFromSalesOrderPage() {
  const params = useParams<{ salesOrderId: string }>();
  const [order, setOrder] = useState<SalesOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getSalesOrder(params.salesOrderId);
      setOrder(response.data);
    } catch (event) {
      setError(getApiErrorMessage(event));
    } finally {
      setLoading(false);
    }
  }, [params.salesOrderId]);
  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);
  if (loading) return <AppShell><LoadingState title="Loading source sales order" /></AppShell>;
  if (error) return <AppShell><ErrorState message={error} /></AppShell>;
  if (!order) return <AppShell><ErrorState message="Source sales order not found." /></AppShell>;
  return <DeliveryOrderForm mode="from-order" sourceOrder={order} />;
}
