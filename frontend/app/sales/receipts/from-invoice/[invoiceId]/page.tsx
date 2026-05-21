'use client';

import { useParams } from 'next/navigation';
import { SalesPaymentForm } from '@/features/sales/payments/SalesPaymentForm';
import { createSalesReceipt } from '@/features/sales/receipts/api';

export default function SalesReceiptFromInvoicePage() {
  const params = useParams<{ invoiceId: string }>();
  return <SalesPaymentForm type="receipt" sourceInvoiceId={params.invoiceId} onSubmit={async (payload) => ({ id: (await createSalesReceipt(payload)).data.id })} />;
}
