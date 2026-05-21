import { formatCurrency } from '@/lib/formatters';
import type { SalesTotals } from '../types';

type SalesTotalsCardProps = {
  totals: SalesTotals;
};

export function SalesTotalsCard({ totals }: SalesTotalsCardProps) {
  const rows = [
    ['Subtotal', totals.subtotal],
    ['Discount', totals.discount_total],
    ['Tax', totals.tax_total],
    ['Paid', totals.paid_amount],
    ['Balance Due', totals.balance_due],
    ['Grand Total', totals.grand_total],
  ] as const;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-950">Totals</h3>
      <div className="mt-3 space-y-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4 text-sm">
            <span className="text-slate-500">{label}</span>
            <span className={label === 'Grand Total' ? 'font-semibold text-slate-950' : 'text-slate-700'}>
              {formatCurrency(Number(value ?? 0))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
