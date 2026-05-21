'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { isOrderEditable } from '@/features/sales/documents/documentHelpers';
import { SalesOrderForm } from '@/features/sales/orders/SalesOrderForm';
import { getSalesOrder } from '@/features/sales/orders/api';
import { getApiErrorMessage } from '@/lib/api';
import type { SalesOrder } from '@/features/sales/types';

export default function EditSalesOrderPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<SalesOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getSalesOrder(params.id);
      setOrder(response.data);
    } catch (event) {
      setError(getApiErrorMessage(event));
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  if (loading) return <AppShell><LoadingState title="Loading sales order" /></AppShell>;
  if (error) return <AppShell><ErrorState message={error} /></AppShell>;
  if (!order) return <AppShell><ErrorState message="Sales order not found." /></AppShell>;
  if (!isOrderEditable(order.status)) return <AppShell><ErrorState message="This sales order status cannot be edited." /></AppShell>;

  return <SalesOrderForm mode="edit" order={order} />;
}
