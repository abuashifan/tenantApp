'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { isDraftEditable } from '@/features/sales/documents/documentHelpers';
import { SalesReturnForm } from '@/features/sales/returns/SalesReturnForm';
import { getSalesReturn } from '@/features/sales/returns/api';
import { getApiErrorMessage } from '@/lib/api';
import type { SalesReturn } from '@/features/sales/types';

export default function EditSalesReturnPage() {
  const params = useParams<{ id: string }>();
  const [document, setDocument] = useState<SalesReturn | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    try { setLoading(true); setError(null); setDocument((await getSalesReturn(params.id)).data); }
    catch (event) { setError(getApiErrorMessage(event)); } finally { setLoading(false); }
  }, [params.id]);
  useEffect(() => { queueMicrotask(() => void load()); }, [load]);
  if (loading) return <AppShell><LoadingState title="Loading sales return" /></AppShell>;
  if (error) return <AppShell><ErrorState message={error} /></AppShell>;
  if (!document) return <AppShell><ErrorState message="Sales return not found." /></AppShell>;
  if (!isDraftEditable(document.status)) return <AppShell><ErrorState message="This sales return status cannot be edited." /></AppShell>;
  return <SalesReturnForm mode="edit" salesReturn={document} />;
}
