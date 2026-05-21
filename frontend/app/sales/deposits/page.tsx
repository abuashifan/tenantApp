import { SalesModulePlaceholder } from '@/features/sales/components/SalesModulePlaceholder';

export default function CustomerDepositsPage() {
  return (
    <SalesModulePlaceholder
      title="Customer Deposits"
      description="Customer deposit and allocation UI arrives in Phase 14F."
      permission="sales.deposits.view"
      nextPhase="Phase 14F"
    />
  );
}
