import { formatAccountingStatus } from '@/lib/formatters';

type SalesSourceChainProps = {
  sourceType?: string | null;
  sourceNumber?: string | null;
  sourceRevision?: number | string | null;
};

export function SalesSourceChain({
  sourceType,
  sourceNumber,
  sourceRevision,
}: SalesSourceChainProps) {
  if (!sourceType && !sourceNumber) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
        Direct document
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
      <div className="text-xs font-medium uppercase text-blue-600">Source Document</div>
      <div className="mt-1 font-semibold">
        {sourceNumber ?? '-'} {sourceType ? `· ${formatAccountingStatus(sourceType)}` : ''}
      </div>
      {sourceRevision ? <div className="mt-1 text-xs text-blue-700">Revision {sourceRevision}</div> : null}
    </div>
  );
}
