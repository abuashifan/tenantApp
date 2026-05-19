'use client';

type ClosingStatusCardProps = {
  fiscalYear?: {
    id?: number;
    year?: number;
    start_date?: string | null;
    end_date?: string | null;
    status?: string;
    is_active?: boolean;
    is_closed?: boolean;
    locked_until?: string | null;
  } | null;
};

export function ClosingStatusCard({ fiscalYear }: ClosingStatusCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Active Fiscal Year</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">
            {fiscalYear?.year ?? '-'}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            {fiscalYear?.start_date ?? '-'} → {fiscalYear?.end_date ?? '-'}
          </p>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-500">Status</div>
          <div className="mt-1 inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">
            {fiscalYear?.status ?? '-'}
          </div>
          <div className="mt-3 text-xs text-slate-500">Locked Until</div>
          <div className="mt-1 text-sm font-medium text-slate-900">
            {fiscalYear?.locked_until ?? '-'}
          </div>
        </div>
      </div>
    </div>
  );
}

