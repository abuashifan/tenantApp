'use client';

import { useParams } from 'next/navigation';
import { CustomerLedgerPage } from '@/features/sales/ar/ARPages';

export default function CustomerARLedgerRoute() {
  const params = useParams<{ customerId: string }>();
  return <CustomerLedgerPage customerId={params.customerId} />;
}
