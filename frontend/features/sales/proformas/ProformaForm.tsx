'use client';

import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { SalesDocumentForm } from '@/features/sales/documents/SalesDocumentForm';
import { SalesPageGate } from '@/features/sales/SalesPageGate';
import type { ProformaInvoice } from '@/features/sales/types';
import { createProforma, updateProforma } from './api';

export function ProformaForm({ mode, proforma }: { mode: 'create' | 'edit'; proforma?: ProformaInvoice | null }) {
  return (
    <AppShell>
      <SalesPageGate permission={mode === 'edit' ? 'sales.proformas.edit' : 'sales.proformas.create'}>
        <PageHeader
          title={mode === 'edit' ? `Edit ${proforma?.proforma_number ?? 'Proforma'}` : 'New Proforma Invoice'}
          description="Proforma is a non-accounting sales document. Backend recalculates totals on save."
        />
        <div className="mt-6">
          <SalesDocumentForm
            type="proforma"
            initial={proforma}
            submitLabel={mode === 'edit' ? 'Save Proforma' : 'Create Proforma'}
            onSubmit={async (payload) => {
              const response = mode === 'edit' ? await updateProforma(proforma?.id ?? '', payload) : await createProforma(payload);
              return { id: response.data.id };
            }}
          />
        </div>
      </SalesPageGate>
    </AppShell>
  );
}
