'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { SalesInvoiceDetail } from '@/features/sales/invoices/SalesInvoiceDetail';
import { getSalesInvoice } from '@/features/sales/invoices/api';
import { getApiErrorMessage } from '@/lib/api';
import type { SalesInvoice } from '@/features/sales/types';

export default function SalesInvoiceDetailPage() {
  const params = useParams<{ id: string }>();
  const [document, setDocument] = useState<SalesInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getSalesInvoice(params.id);
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
  if (loading) return <AppShell><LoadingState title="Loading sales invoice" /></AppShell>;
  if (error) return <AppShell><ErrorState message={error} /></AppShell>;
  if (!document) return <AppShell><ErrorState message="Sales invoice not found." /></AppShell>;
  return <SalesInvoiceDetail invoice={document} />;
}
