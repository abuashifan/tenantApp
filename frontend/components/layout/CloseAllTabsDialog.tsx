'use client';

import type { CloseAllCandidate } from './types';

type CloseAllTabsDialogProps = {
  candidate: CloseAllCandidate | null;
  onCancel: () => void;
  onDiscard: () => void;
  onSave: () => Promise<void>;
};

export function CloseAllTabsDialog({
  candidate,
  onCancel,
  onDiscard,
  onSave,
}: CloseAllTabsDialogProps) {
  if (!candidate) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/35 px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-950/20">
        <h2 className="text-lg font-bold text-slate-950">Unsaved Form</h2>
        <p className="mt-1 text-sm font-semibold text-slate-700">{candidate.label}</p>
        <p className="mt-3 text-sm text-slate-600">
          Form ini belum disimpan. Simpan perubahan sebelum ditutup?
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onDiscard}
            className="rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
          >
            Jangan Simpan
          </button>
          <button
            type="button"
            onClick={() => void onSave()}
            className="rounded-xl bg-slate-950 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
