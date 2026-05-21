'use client';

import { createCustomerDeposit } from '@/features/sales/deposits/api';
import { SalesPaymentForm } from '@/features/sales/payments/SalesPaymentForm';

export default function NewCustomerDepositPage() {
  return <SalesPaymentForm type="deposit" onSubmit={async (payload) => ({ id: (await createCustomerDeposit(payload)).data.id })} />;
}
