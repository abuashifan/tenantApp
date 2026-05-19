'use client';

import { useState } from 'react';

type ClosingActionPanelProps = {
  canClose: boolean;
  onPreview: () => Promise<void> | void;
  onClose: (notes?: string) => Promise<void> | void;
  closingDisabled?: boolean;
};

export function ClosingActionPanel({
  canClose,
  onPreview,
  onClose,
  closingDisabled,
}: ClosingActionPanelProps) {
  const [notes, setNotes] = useState('');

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900">Actions</h2>
      <div className="mt-4 flex flex-col gap-3">
        <button
          type="button"
          onClick={() => onPreview()}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          Refresh Preview
        </button>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Closing notes (optional)"
          className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-slate-400"
          rows={3}
        />

        <button
          type="button"
          disabled={!canClose || closingDisabled}
          onClick={() => onClose(notes.trim() || undefined)}
          className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          Close Fiscal Year
        </button>

        {!canClose ? (
          <p className="text-xs text-slate-500">
            Close button disabled until checklist passes.
          </p>
        ) : null}
      </div>
    </div>
  );
}

