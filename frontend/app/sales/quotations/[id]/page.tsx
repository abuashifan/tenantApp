'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { QuotationDetail } from '@/features/sales/quotations/QuotationDetail';
import { getSalesQuotation } from '@/features/sales/quotations/api';
import { getApiErrorMessage } from '@/lib/api';
import type { SalesQuotation } from '@/features/sales/types';

export default function SalesQuotationDetailPage() {
  const params = useParams<{ id: string }>();
  const [quotation, setQuotation] = useState<SalesQuotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getSalesQuotation(params.id);
      setQuotation(response.data);
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

  if (loading) return <AppShell><LoadingState title="Loading quotation" /></AppShell>;
  if (error) return <AppShell><ErrorState message={error} /></AppShell>;
  if (!quotation) return <AppShell><ErrorState message="Quotation not found." /></AppShell>;

  return <QuotationDetail quotation={quotation} />;
}
