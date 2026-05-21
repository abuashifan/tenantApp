import { SalesModulePlaceholder } from '@/features/sales/components/SalesModulePlaceholder';

export default function ARAgingPage() {
  return (
    <SalesModulePlaceholder
      title="AR Aging"
      description="Accounts receivable aging UI arrives in Phase 14H."
      permission="sales.ar.view"
      nextPhase="Phase 14H"
    />
  );
}
