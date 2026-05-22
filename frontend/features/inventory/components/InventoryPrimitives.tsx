'use client';

import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatCurrency } from '@/lib/formatters';

export function InventoryStatusBadge({ status }: { status?: string | null }) {
  const value = String(status ?? 'draft');
  const tone = ['posted', 'finalized', 'approved'].includes(value) ? 'success' : value === 'void' ? 'danger' : value === 'draft' ? 'muted' : 'warning';
  return <StatusBadge status={value.replaceAll('_', ' ')} tone={tone} />;
}

export function StockMovementTypeBadge({ type }: { type?: string | null }) {
  const value = String(type ?? '-');
  const tone = value.includes('out') || value.includes('decrease') ? 'warning' : value.includes('void') ? 'danger' : 'default';
  return <StatusBadge status={value.replaceAll('_', ' ')} tone={tone} />;
}

export function StockQuantityDisplay({ value }: { value?: unknown }) {
  const qty = Number(value ?? 0);
  return <span className={qty < 0 ? 'font-semibold text-red-700' : 'text-slate-700'}>{qty.toLocaleString()}</span>;
}

export function StockValueDisplay({ value }: { value?: unknown }) {
  return <span>{formatCurrency(Number(value ?? 0))}</span>;
}

export function InventoryLoadingState({ title = 'Loading inventory data' }: { title?: string }) {
  return <LoadingState title={title} />;
}

export function InventoryErrorState({ message }: { message: string }) {
  return <ErrorState message={message} />;
}

export function InventoryEmptyState({ title = 'No inventory rows', description = 'No inventory data matched the current filter.' }: { title?: string; description?: string }) {
  return <EmptyState title={title} description={description} />;
}

export function PeriodLockWarning({ message }: { message?: string }) {
  return <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{message ?? 'This transaction may be blocked by period lock rules.'}</div>;
}
