'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { SalesReturnDetail } from '@/features/sales/returns/SalesReturnDetail';
import { getSalesReturn } from '@/features/sales/returns/api';
import { getApiErrorMessage } from '@/lib/api';
import type { SalesReturn } from '@/features/sales/types';

export default function SalesReturnDetailPage() {
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
  return <SalesReturnDetail salesReturn={document} />;
}
