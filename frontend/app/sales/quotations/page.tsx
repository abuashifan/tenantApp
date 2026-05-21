import { SalesModulePlaceholder } from '@/features/sales/components/SalesModulePlaceholder';

export default function SalesQuotationsPage() {
  return (
    <SalesModulePlaceholder
      title="Sales Quotations"
      description="Prepare customer quotation list/detail/form UI in Phase 14B."
      permission="sales.quotations.view"
      nextPhase="Phase 14B"
    />
  );
}
