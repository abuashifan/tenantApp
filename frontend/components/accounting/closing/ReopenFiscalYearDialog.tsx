'use client';

import { useState } from 'react';

type ReopenFiscalYearDialogProps = {
  disabled?: boolean;
  onReopen: (reason: string) => Promise<void> | void;
};

export function ReopenFiscalYearDialog({
  disabled,
  onReopen,
}: ReopenFiscalYearDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');

  if (!open) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
      >
        Reopen
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-sm font-medium text-slate-900">Reopen Fiscal Year</div>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason (required)"
        className="mt-3 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-slate-400"
        rows={3}
      />
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={disabled || reason.trim().length === 0}
          onClick={async () => {
            await onReopen(reason.trim());
            setReason('');
            setOpen(false);
          }}
          className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          Confirm Reopen
        </button>
      </div>
    </div>
  );
}

