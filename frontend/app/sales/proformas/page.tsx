import { SalesModulePlaceholder } from '@/features/sales/components/SalesModulePlaceholder';

export default function ProformasPage() {
  return (
    <SalesModulePlaceholder
      title="Proforma Invoices"
      description="Proforma and non-accounting invoice UI arrives in Phase 14E."
      permission="sales.proformas.view"
      nextPhase="Phase 14E"
    />
  );
}
