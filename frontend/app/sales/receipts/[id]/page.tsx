'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { SalesReceiptDetail } from '@/features/sales/receipts/SalesReceiptDetail';
import { getSalesReceipt } from '@/features/sales/receipts/api';
import { getApiErrorMessage } from '@/lib/api';
import type { SalesReceipt } from '@/features/sales/types';

export default function SalesReceiptDetailPage() {
  const params = useParams<{ id: string }>();
  const [document, setDocument] = useState<SalesReceipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    try {
      setLoading(true); setError(null); setDocument((await getSalesReceipt(params.id)).data);
    } catch (event) { setError(getApiErrorMessage(event)); } finally { setLoading(false); }
  }, [params.id]);
  useEffect(() => { queueMicrotask(() => void load()); }, [load]);
  if (loading) return <AppShell><LoadingState title="Loading sales receipt" /></AppShell>;
  if (error) return <AppShell><ErrorState message={error} /></AppShell>;
  if (!document) return <AppShell><ErrorState message="Sales receipt not found." /></AppShell>;
  return <SalesReceiptDetail receipt={document} />;
}
