'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { isDraftEditable } from '@/features/sales/documents/documentHelpers';
import { ProformaForm } from '@/features/sales/proformas/ProformaForm';
import { getProforma } from '@/features/sales/proformas/api';
import { getApiErrorMessage } from '@/lib/api';
import type { ProformaInvoice } from '@/features/sales/types';

export default function EditProformaPage() {
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
  if (!isDraftEditable(document.status)) return <AppShell><ErrorState message="This proforma status cannot be edited." /></AppShell>;
  return <ProformaForm mode="edit" proforma={document} />;
}
