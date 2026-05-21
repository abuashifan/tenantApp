import { SalesModulePlaceholder } from '@/features/sales/components/SalesModulePlaceholder';

export default function SalesReturnsPage() {
  return (
    <SalesModulePlaceholder
      title="Sales Returns"
      description="Sales return UI arrives in Phase 14G without stock movement UI."
      permission="sales.returns.view"
      nextPhase="Phase 14G"
    />
  );
}
