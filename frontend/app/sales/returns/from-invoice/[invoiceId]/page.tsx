'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { getSalesInvoice } from '@/features/sales/invoices/api';
import { SalesReturnForm } from '@/features/sales/returns/SalesReturnForm';
import { getApiErrorMessage } from '@/lib/api';
import type { SalesInvoice } from '@/features/sales/types';

export default function SalesReturnFromInvoicePage() {
  const params = useParams<{ invoiceId: string }>();
  const [invoice, setInvoice] = useState<SalesInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    try { setLoading(true); setError(null); setInvoice((await getSalesInvoice(params.invoiceId)).data); }
    catch (event) { setError(getApiErrorMessage(event)); } finally { setLoading(false); }
  }, [params.invoiceId]);
  useEffect(() => { queueMicrotask(() => void load()); }, [load]);
  if (loading) return <AppShell><LoadingState title="Loading source invoice" /></AppShell>;
  if (error) return <AppShell><ErrorState message={error} /></AppShell>;
  if (!invoice) return <AppShell><ErrorState message="Source invoice not found." /></AppShell>;
  return <SalesReturnForm mode="from-invoice" sourceInvoice={invoice} />;
}
