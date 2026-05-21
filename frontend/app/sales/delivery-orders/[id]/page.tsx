'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { DeliveryOrderDetail } from '@/features/sales/delivery-orders/DeliveryOrderDetail';
import { getDeliveryOrder } from '@/features/sales/delivery-orders/api';
import { getApiErrorMessage } from '@/lib/api';
import type { DeliveryOrder } from '@/features/sales/types';

export default function DeliveryOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [document, setDocument] = useState<DeliveryOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getDeliveryOrder(params.id);
      setDocument(response.data);
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
  if (loading) return <AppShell><LoadingState title="Loading delivery order" /></AppShell>;
  if (error) return <AppShell><ErrorState message={error} /></AppShell>;
  if (!document) return <AppShell><ErrorState message="Delivery order not found." /></AppShell>;
  return <DeliveryOrderDetail deliveryOrder={document} />;
}
