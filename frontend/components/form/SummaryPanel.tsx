import { AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import type { SummaryPanelRow } from './types';

type SummaryPanelProps = {
  title?: string;
  rows: SummaryPanelRow[];
  currencyCode?: string;
  note?: string;
  warning?: string;
};

export function SummaryPanel({
  title = 'Summary',
  rows,
  currencyCode = 'IDR',
  note,
  warning,
}: SummaryPanelProps) {
  return (
    <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
      <div className="mt-3 space-y-2">
        {rows.map((row) => (
          <div
            key={row.key}
            className={`flex items-center justify-between gap-4 text-sm ${
              row.emphasized ? 'border-t border-slate-100 pt-3' : ''
            }`}
          >
            <span className={row.warning ? 'text-amber-700' : 'text-slate-500'}>{row.label}</span>
            <span
              className={
                row.emphasized
                  ? 'text-base font-semibold text-slate-950'
                  : row.warning
                    ? 'font-semibold text-amber-700'
                    : 'font-medium text-slate-700'
              }
            >
              {typeof row.value === 'number'
                ? formatCurrency(row.value, currencyCode)
                : row.value}
            </span>
          </div>
        ))}
      </div>
      {warning ? (
        <div className="mt-4 flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{warning}</span>
        </div>
      ) : note ? (
        <p className="mt-4 text-xs text-slate-500">{note}</p>
      ) : null}
    </aside>
  );
}

