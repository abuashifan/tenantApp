import { SalesModulePlaceholder } from '@/features/sales/components/SalesModulePlaceholder';

export default function DeliveryOrdersPage() {
  return (
    <SalesModulePlaceholder
      title="Delivery Orders"
      description="Delivery document UI arrives in Phase 14D without stock movement UI."
      permission="sales.delivery_orders.view"
      nextPhase="Phase 14D"
    />
  );
}
