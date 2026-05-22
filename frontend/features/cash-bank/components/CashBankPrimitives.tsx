'use client';

import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatCurrency } from '@/lib/formatters';

export function CashBankStatusBadge({ status }: { status?: string | null }) {
  const value = String(status ?? 'draft');
  const tone = value === 'posted' || value === 'reconciled' ? 'success' : value === 'void' ? 'danger' : value === 'draft' ? 'muted' : 'warning';
  return <StatusBadge status={value.replaceAll('_', ' ')} tone={tone} />;
}

export function CashBankAmountInput({ value, onChange, label = 'Amount *' }: { value: string; onChange: (value: string) => void; label?: string }) {
  return <label><span className="text-xs font-medium text-slate-500">{label}</span><input type="number" min="0" step="0.01" value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-right text-sm" /></label>;
}

export function CashBankLoadingState({ title = 'Loading cash bank data' }: { title?: string }) {
  return <LoadingState title={title} />;
}

export function CashBankErrorState({ message }: { message: string }) {
  return <ErrorState message={message} />;
}

export function CashBankEmptyState({ title = 'No cash bank rows', description = 'No data matched the current filter.' }: { title?: string; description?: string }) {
  return <EmptyState title={title} description={description} />;
}

export function CashBankMoney({ value }: { value?: unknown }) {
  return <span>{formatCurrency(Number(value ?? 0))}</span>;
}

export { CashBankStatusBadge as default };
