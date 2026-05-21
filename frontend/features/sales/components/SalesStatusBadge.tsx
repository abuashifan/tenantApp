import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatAccountingStatus } from '@/lib/formatters';

type SalesStatusBadgeProps = {
  status?: string | null;
};

export function SalesStatusBadge({ status }: SalesStatusBadgeProps) {
  const normalized = String(status ?? 'unknown').toLowerCase();

  const tone =
    normalized === 'posted' ||
    normalized === 'paid' ||
    normalized === 'delivered' ||
    normalized === 'accepted' ||
    normalized === 'confirmed'
      ? 'success'
      : normalized === 'void' ||
          normalized === 'cancelled' ||
          normalized === 'rejected' ||
          normalized === 'expired'
        ? 'danger'
        : normalized === 'draft'
          ? 'warning'
          : 'default';

  return <StatusBadge status={formatAccountingStatus(normalized)} tone={tone} />;
}
