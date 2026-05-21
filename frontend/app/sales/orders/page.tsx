import { SalesModulePlaceholder } from '@/features/sales/components/SalesModulePlaceholder';

export default function SalesOrdersPage() {
  return (
    <SalesModulePlaceholder
      title="Sales Orders"
      description="Manage sales order workflow screens in Phase 14C."
      permission="sales.orders.view"
      nextPhase="Phase 14C"
    />
  );
}
