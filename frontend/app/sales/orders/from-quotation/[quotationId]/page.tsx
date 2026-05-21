'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { SalesOrderForm } from '@/features/sales/orders/SalesOrderForm';
import { getSalesQuotation } from '@/features/sales/quotations/api';
import { getApiErrorMessage } from '@/lib/api';
import type { SalesQuotation } from '@/features/sales/types';

export default function SalesOrderFromQuotationPage() {
  const params = useParams<{ quotationId: string }>();
  const [quotation, setQuotation] = useState<SalesQuotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getSalesQuotation(params.quotationId);
      setQuotation(response.data);
    } catch (event) {
      setError(getApiErrorMessage(event));
    } finally {
      setLoading(false);
    }
  }, [params.quotationId]);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  if (loading) return <AppShell><LoadingState title="Loading source quotation" /></AppShell>;
  if (error) return <AppShell><ErrorState message={error} /></AppShell>;
  if (!quotation) return <AppShell><ErrorState message="Source quotation not found." /></AppShell>;

  return <SalesOrderForm mode="from-quotation" sourceQuotation={quotation} />;
}
