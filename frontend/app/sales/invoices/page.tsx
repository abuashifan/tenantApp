import { SalesModulePlaceholder } from '@/features/sales/components/SalesModulePlaceholder';

export default function SalesInvoicesPage() {
  return (
    <SalesModulePlaceholder
      title="Sales Invoices"
      description="Sales invoice list/detail/form and posting UI arrives in Phase 14E."
      permission="sales.invoices.view"
      nextPhase="Phase 14E"
    />
  );
}
