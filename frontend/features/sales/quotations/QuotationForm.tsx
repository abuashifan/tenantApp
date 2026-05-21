'use client';

import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { SalesDocumentForm } from '@/features/sales/documents/SalesDocumentForm';
import { SalesPageGate } from '@/features/sales/SalesPageGate';
import type { SalesQuotation } from '@/features/sales/types';
import { createSalesQuotation, updateSalesQuotation } from './api';

type QuotationFormProps = {
  mode: 'create' | 'edit';
  quotation?: SalesQuotation | null;
};

export function QuotationForm({ mode, quotation }: QuotationFormProps) {
  return (
    <AppShell>
      <SalesPageGate permission={mode === 'create' ? 'sales.quotations.create' : 'sales.quotations.edit'}>
        <PageHeader
          title={mode === 'create' ? 'New Sales Quotation' : `Edit ${quotation?.quotation_number ?? 'Quotation'}`}
          description="Draft quotation details are recalculated by the backend on save. Frontend totals are only a preview."
        />
        <div className="mt-6">
          <SalesDocumentForm
            type="quotation"
            initial={quotation}
            submitLabel={mode === 'create' ? 'Create Quotation' : 'Save Quotation'}
            onSubmit={async (payload) => {
              const response = mode === 'create'
                ? await createSalesQuotation(payload)
                : await updateSalesQuotation(quotation?.id ?? '', payload);
              return { id: response.data.id };
            }}
          />
        </div>
      </SalesPageGate>
    </AppShell>
  );
}
