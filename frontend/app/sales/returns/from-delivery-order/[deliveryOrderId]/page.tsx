'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { getDeliveryOrder } from '@/features/sales/delivery-orders/api';
import { SalesReturnForm } from '@/features/sales/returns/SalesReturnForm';
import { getApiErrorMessage } from '@/lib/api';
import type { DeliveryOrder } from '@/features/sales/types';

export default function SalesReturnFromDeliveryOrderPage() {
  const params = useParams<{ deliveryOrderId: string }>();
  const [delivery, setDelivery] = useState<DeliveryOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    try { setLoading(true); setError(null); setDelivery((await getDeliveryOrder(params.deliveryOrderId)).data); }
    catch (event) { setError(getApiErrorMessage(event)); } finally { setLoading(false); }
  }, [params.deliveryOrderId]);
  useEffect(() => { queueMicrotask(() => void load()); }, [load]);
  if (loading) return <AppShell><LoadingState title="Loading source delivery order" /></AppShell>;
  if (error) return <AppShell><ErrorState message={error} /></AppShell>;
  if (!delivery) return <AppShell><ErrorState message="Source delivery order not found." /></AppShell>;
  return <SalesReturnForm mode="from-delivery" sourceDelivery={delivery} />;
}
