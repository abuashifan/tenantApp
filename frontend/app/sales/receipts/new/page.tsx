'use client';

import { SalesPaymentForm } from '@/features/sales/payments/SalesPaymentForm';
import { createSalesReceipt } from '@/features/sales/receipts/api';

export default function NewSalesReceiptPage() {
  return <SalesPaymentForm type="receipt" onSubmit={async (payload) => ({ id: (await createSalesReceipt(payload)).data.id })} />;
}
