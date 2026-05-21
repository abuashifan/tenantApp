'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { ProformaDetail } from '@/features/sales/proformas/ProformaDetail';
import { getProforma } from '@/features/sales/proformas/api';
import { getApiErrorMessage } from '@/lib/api';
import type { ProformaInvoice } from '@/features/sales/types';

export default function ProformaDetailPage() {
  const params = useParams<{ id: string }>();
  const [document, setDocument] = useState<ProformaInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getProforma(params.id);
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
  if (loading) return <AppShell><LoadingState title="Loading proforma" /></AppShell>;
  if (error) return <AppShell><ErrorState message={error} /></AppShell>;
  if (!document) return <AppShell><ErrorState message="Proforma not found." /></AppShell>;
  return <ProformaDetail proforma={document} />;
}
