import { SalesModulePlaceholder } from '@/features/sales/components/SalesModulePlaceholder';

export default function ARLedgerPage() {
  return (
    <SalesModulePlaceholder
      title="AR Ledger"
      description="Accounts receivable subsidiary ledger UI arrives in Phase 14H."
      permission="sales.ar.view"
      nextPhase="Phase 14H"
    />
  );
}
