'use client';

import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { SalesDocumentForm } from '@/features/sales/documents/SalesDocumentForm';
import { SalesPageGate } from '@/features/sales/SalesPageGate';
import type { SalesOrder, SalesQuotation } from '@/features/sales/types';
import { createSalesOrder, createSalesOrderFromQuotation, updateSalesOrder } from './api';

type SalesOrderFormProps = {
  mode: 'create' | 'edit' | 'from-quotation';
  order?: SalesOrder | null;
  sourceQuotation?: SalesQuotation | null;
};

export function SalesOrderForm({ mode, order, sourceQuotation }: SalesOrderFormProps) {
  const permission = mode === 'edit' ? 'sales.orders.edit' : mode === 'from-quotation' ? 'sales.orders.convert' : 'sales.orders.create';

  return (
    <AppShell>
      <SalesPageGate permission={permission}>
        <PageHeader
          title={mode === 'edit' ? `Edit ${order?.order_number ?? 'Sales Order'}` : mode === 'from-quotation' ? 'Create Sales Order from Quotation' : 'New Sales Order'}
          description="Order totals and down payment posting are recalculated by the backend. Down payment is saved as Customer Deposit."
        />
        <div className="mt-6">
          <SalesDocumentForm
            type="order"
            initial={order}
            sourceQuotation={sourceQuotation}
            submitLabel={mode === 'edit' ? 'Save Sales Order' : 'Create Sales Order'}
            onSubmit={async (payload) => {
              const response = mode === 'edit'
                ? await updateSalesOrder(order?.id ?? '', payload)
                : mode === 'from-quotation' && sourceQuotation
                  ? await createSalesOrderFromQuotation(sourceQuotation.id, payload)
                  : await createSalesOrder(payload);
              return { id: response.data.id };
            }}
          />
        </div>
      </SalesPageGate>
    </AppShell>
  );
}
