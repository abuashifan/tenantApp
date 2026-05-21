'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { SalesOrderDetail } from '@/features/sales/orders/SalesOrderDetail';
import { getSalesOrder } from '@/features/sales/orders/api';
import { getApiErrorMessage } from '@/lib/api';
import type { SalesOrder } from '@/features/sales/types';

export default function SalesOrderDetailPage() {
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

  return <SalesOrderDetail order={order} />;
}
