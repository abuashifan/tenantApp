'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { SalesPageGate } from '@/features/sales/SalesPageGate';
import { createSalesInvoiceFromSalesOrder } from '@/features/sales/invoices/api';
import { getApiErrorMessage } from '@/lib/api';

export default function InvoiceFromSalesOrderPage() {
  const params = useParams<{ salesOrderId: string }>();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    queueMicrotask(async () => {
      try {
        const response = await createSalesInvoiceFromSalesOrder(params.salesOrderId);
        router.replace(`/sales/invoices/${response.data.id}`);
      } catch (event) {
        setError(getApiErrorMessage(event));
      }
    });
  }, [params.salesOrderId, router]);
  return <AppShell><SalesPageGate permission="sales.invoices.create">{error ? <ErrorState message={error} /> : <LoadingState title="Creating sales invoice from sales order" />}</SalesPageGate></AppShell>;
}
