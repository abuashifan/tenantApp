'use client';

type ChecklistItem = {
  key: string;
  status: 'passed' | 'failed' | 'warning';
  message: string;
};

type ClosingChecklistProps = {
  canClose?: boolean;
  checks?: ChecklistItem[];
  errors?: Record<string, string[]>;
  warnings?: string[];
};

export function ClosingChecklist({
  canClose,
  checks = [],
  errors = {},
  warnings = [],
}: ClosingChecklistProps) {
  const errorKeys = Object.keys(errors);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">Closing Checklist</h2>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            canClose
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-amber-100 text-amber-800'
          }`}
        >
          {canClose ? 'Ready' : 'Not Ready'}
        </span>
      </div>

      {errorKeys.length > 0 ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <div className="font-medium">Errors</div>
          <ul className="mt-2 list-disc pl-5">
            {errorKeys.map((k) =>
              (errors[k] ?? []).map((msg, idx) => (
                <li key={`${k}-${idx}`}>{k}: {msg}</li>
              )),
            )}
          </ul>
        </div>
      ) : null}

      {warnings.length > 0 ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <div className="font-medium">Warnings</div>
          <ul className="mt-2 list-disc pl-5">
            {warnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-200">
        {checks.length === 0 ? (
          <div className="p-4 text-sm text-slate-600">No checks</div>
        ) : (
          checks.map((c) => (
            <div key={c.key} className="flex items-center justify-between p-4">
              <div className="text-sm text-slate-800">{c.message}</div>
              <div
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  c.status === 'passed'
                    ? 'bg-emerald-100 text-emerald-800'
                    : c.status === 'warning'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                }`}
              >
                {c.status}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

