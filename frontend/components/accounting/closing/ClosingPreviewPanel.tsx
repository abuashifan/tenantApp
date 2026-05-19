'use client';

type ClosingPreviewPanelProps = {
  preview?: {
    net_profit_loss?: number;
    retained_earnings_account?: {
      account_id?: number | null;
    };
    journal_count?: number;
    can_close?: boolean;
    warnings?: unknown[];
  } | null;
};

export function ClosingPreviewPanel({ preview }: ClosingPreviewPanelProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900">Closing Preview</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 p-4">
          <div className="text-xs text-slate-500">Net Profit/Loss</div>
          <div className="mt-1 text-lg font-semibold text-slate-900">
            {typeof preview?.net_profit_loss === 'number'
              ? preview.net_profit_loss.toLocaleString()
              : '-'}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 p-4">
          <div className="text-xs text-slate-500">Retained Earnings Account</div>
          <div className="mt-1 text-lg font-semibold text-slate-900">
            {preview?.retained_earnings_account?.account_id ?? '-'}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 p-4">
          <div className="text-xs text-slate-500">Posted Journals</div>
          <div className="mt-1 text-lg font-semibold text-slate-900">
            {preview?.journal_count ?? '-'}
          </div>
        </div>
      </div>
      <p className="mt-4 text-xs text-slate-500">
        Preview harus dilakukan sebelum execute closing.
      </p>
    </div>
  );
}

