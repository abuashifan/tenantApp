'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { isDraftEditable } from '@/features/sales/documents/documentHelpers';
import { SalesInvoiceForm } from '@/features/sales/invoices/SalesInvoiceForm';
import { getSalesInvoice } from '@/features/sales/invoices/api';
import { getApiErrorMessage } from '@/lib/api';
import type { SalesInvoice } from '@/features/sales/types';

export default function EditSalesInvoicePage() {
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
  if (!isDraftEditable(document.status)) return <AppShell><ErrorState message="This sales invoice status cannot be edited." /></AppShell>;
  return <SalesInvoiceForm mode="edit" invoice={document} />;
}
