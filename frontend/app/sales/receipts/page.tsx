import { SalesModulePlaceholder } from '@/features/sales/components/SalesModulePlaceholder';

export default function SalesReceiptsPage() {
  return (
    <SalesModulePlaceholder
      title="Sales Receipts"
      description="Receipt UI for customer invoice payments arrives in Phase 14F."
      permission="sales.receipts.view"
      nextPhase="Phase 14F"
    />
  );
}
