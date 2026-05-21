'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { CustomerDepositDetail } from '@/features/sales/deposits/CustomerDepositDetail';
import { getCustomerDeposit } from '@/features/sales/deposits/api';
import { getApiErrorMessage } from '@/lib/api';
import type { CustomerDeposit } from '@/features/sales/types';

export default function CustomerDepositDetailPage() {
  const params = useParams<{ id: string }>();
  const [document, setDocument] = useState<CustomerDeposit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    try {
      setLoading(true); setError(null); setDocument((await getCustomerDeposit(params.id)).data);
    } catch (event) { setError(getApiErrorMessage(event)); } finally { setLoading(false); }
  }, [params.id]);
  useEffect(() => { queueMicrotask(() => void load()); }, [load]);
  if (loading) return <AppShell><LoadingState title="Loading customer deposit" /></AppShell>;
  if (error) return <AppShell><ErrorState message={error} /></AppShell>;
  if (!document) return <AppShell><ErrorState message="Customer deposit not found." /></AppShell>;
  return <CustomerDepositDetail deposit={document} />;
}
