'use client';

import { useParams } from 'next/navigation';
import { InvoiceLedgerPage } from '@/features/sales/ar/ARPages';

export default function InvoiceARLedgerRoute() {
  const params = useParams<{ invoiceId: string }>();
  return <InvoiceLedgerPage invoiceId={params.invoiceId} />;
}
