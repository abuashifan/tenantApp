'use client';

import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { SalesDocumentForm } from '@/features/sales/documents/SalesDocumentForm';
import { SalesPageGate } from '@/features/sales/SalesPageGate';
import type { SalesInvoice } from '@/features/sales/types';
import { createSalesInvoice, updateSalesInvoice } from './api';

export function SalesInvoiceForm({ mode, invoice }: { mode: 'create' | 'edit'; invoice?: SalesInvoice | null }) {
  return (
    <AppShell>
      <SalesPageGate permission={mode === 'edit' ? 'sales.invoices.edit' : 'sales.invoices.create'}>
        <PageHeader
          title={mode === 'edit' ? `Edit ${invoice?.invoice_number ?? 'Sales Invoice'}` : 'New Sales Invoice'}
          description="Sales invoice can post AR/revenue/tax later. Customer Deposit can be applied, but no new DP is created here."
        />
        <div className="mt-6">
          <SalesDocumentForm
            type="invoice"
            initial={invoice}
            submitLabel={mode === 'edit' ? 'Save Sales Invoice' : 'Create Sales Invoice'}
            onSubmit={async (payload) => {
              const response = mode === 'edit' ? await updateSalesInvoice(invoice?.id ?? '', payload) : await createSalesInvoice(payload);
              return { id: response.data.id };
            }}
          />
        </div>
      </SalesPageGate>
    </AppShell>
  );
}
