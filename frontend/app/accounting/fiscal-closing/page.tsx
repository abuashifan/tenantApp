'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest, getStoredCompanyId, getStoredToken } from '@/lib/api';
import { AppShell } from '@/components/layout/AppShell';
import type { ApiResponse } from '@/types/api';
import { ClosingStatusCard } from '@/components/accounting/closing/ClosingStatusCard';
import { ClosingChecklist } from '@/components/accounting/closing/ClosingChecklist';
import { ClosingPreviewPanel } from '@/components/accounting/closing/ClosingPreviewPanel';
import { ClosingActionPanel } from '@/components/accounting/closing/ClosingActionPanel';
import { ReopenFiscalYearDialog } from '@/components/accounting/closing/ReopenFiscalYearDialog';

type PeriodLockStatusPayload = {
  active_fiscal_year: {
    id: number;
    year: number;
    start_date: string | null;
    end_date: string | null;
    status: string;
    is_active: boolean;
    is_closed: boolean;
    locked_until: string | null;
  };
};

type ClosingChecklistPayload = {
  can_close: boolean;
  errors: Record<string, string[]>;
  warnings: string[];
  checks: Array<{ key: string; status: 'passed' | 'failed' | 'warning'; message: string }>;
};

type ClosingPreviewPayload = {
  valid: boolean;
  errors: Record<string, string[]>;
  warnings: string[];
  preview: {
    fiscal_year: {
      id: number;
      year: number;
      start_date: string;
      end_date: string;
      status: string;
      is_active: boolean;
      is_closed: boolean;
    };
    net_profit_loss: number;
    retained_earnings_account: { mapping_key: string; account_id: number | null };
    journal_count: number;
    warning_count: number;
    warnings: string[];
    can_close: boolean;
  };
};

export default function FiscalClosingPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [fiscalYear, setFiscalYear] =
    useState<PeriodLockStatusPayload['active_fiscal_year'] | null>(null);
  const [checklist, setChecklist] = useState<ClosingChecklistPayload | null>(null);
  const [preview, setPreview] = useState<ClosingPreviewPayload | null>(null);

  const [lockUntil, setLockUntil] = useState<string>('');
  const [overrideReason, setOverrideReason] = useState<string>('');

  const fiscalYearId = fiscalYear?.id;

  const canClose = useMemo(() => {
    return Boolean(checklist?.can_close);
  }, [checklist?.can_close]);

  const closingDisabled = useMemo(() => {
    return !preview?.valid;
  }, [preview?.valid]);

  async function guarded<T>(fn: () => Promise<T>): Promise<T | null> {
    try {
      setError(null);
      setNotice(null);
      return await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
      return null;
    }
  }

  async function refreshAll() {
    const token = getStoredToken();
    const companyId = getStoredCompanyId();
    if (!token) {
      router.replace('/login');
      return;
    }
    if (!companyId) {
      router.replace('/select-company');
      return;
    }

    setLoading(true);
    const status = await guarded(() =>
      apiRequest<ApiResponse<PeriodLockStatusPayload>>('/accounting/period-locks/status', {
        token,
        companyId,
      }),
    );

    if (!status?.data?.active_fiscal_year) {
      setLoading(false);
      return;
    }

    const fy = status.data.active_fiscal_year;
    setFiscalYear(fy);
    setLockUntil(fy.locked_until ?? '');

    const id = fy.id;

    const [checklistRes, previewRes] = await Promise.allSettled([
      apiRequest<ApiResponse<ClosingChecklistPayload>>(
        `/accounting/fiscal-years/${id}/closing-checklist`,
        { token, companyId },
      ),
      apiRequest<ApiResponse<ClosingPreviewPayload>>(`/accounting/fiscal-years/${id}/closing-preview`, {
        token,
        companyId,
      }),
    ]);

    if (checklistRes.status === 'fulfilled') {
      setChecklist(checklistRes.value.data);
    } else {
      setChecklist(null);
    }

    if (previewRes.status === 'fulfilled') {
      setPreview(previewRes.value.data);
    } else {
      setPreview(null);
    }

    setLoading(false);
  }

  async function refreshPreview() {
    if (!fiscalYearId) return;
    const token = getStoredToken();
    const companyId = getStoredCompanyId();
    if (!token || !companyId) return;

    await guarded(async () => {
      setBusy(true);
      const res = await apiRequest<ApiResponse<ClosingPreviewPayload>>(
        `/accounting/fiscal-years/${fiscalYearId}/closing-preview`,
        { token, companyId },
      );
      setPreview(res.data);
      setNotice('Preview refreshed.');
    });

    setBusy(false);
  }

  async function closeFiscalYear(notes?: string) {
    if (!fiscalYearId) return;
    const token = getStoredToken();
    const companyId = getStoredCompanyId();
    if (!token || !companyId) return;

    await guarded(async () => {
      setBusy(true);
      await apiRequest<ApiResponse<unknown>>(`/accounting/fiscal-years/${fiscalYearId}/close`, {
        token,
        companyId,
        method: 'POST',
        body: {
          closing_notes: notes ?? null,
        },
      });
      setNotice('Fiscal year closed.');
      await refreshAll();
    });

    setBusy(false);
  }

  async function reopenFiscalYear(reason: string) {
    if (!fiscalYearId) return;
    const token = getStoredToken();
    const companyId = getStoredCompanyId();
    if (!token || !companyId) return;

    await guarded(async () => {
      setBusy(true);
      await apiRequest<ApiResponse<unknown>>(`/accounting/fiscal-years/${fiscalYearId}/reopen`, {
        token,
        companyId,
        method: 'POST',
        body: {
          reopen_reason: reason,
        },
      });
      setNotice('Fiscal year reopened.');
      await refreshAll();
    });

    setBusy(false);
  }

  async function updatePeriodLock() {
    const token = getStoredToken();
    const companyId = getStoredCompanyId();
    if (!token || !companyId) return;

    await guarded(async () => {
      setBusy(true);
      const res = await apiRequest<ApiResponse<{ fiscal_year_id: number; locked_until: string | null }>>(
        '/accounting/period-locks',
        {
          token,
          companyId,
          method: 'PATCH',
          body: {
            lock_until: lockUntil.trim().length > 0 ? lockUntil : null,
            override_reason: overrideReason.trim().length > 0 ? overrideReason : null,
          },
        },
      );
      setNotice('Period lock updated.');
      setOverrideReason('');
      setFiscalYear((prev) =>
        prev ? { ...prev, locked_until: res.data.locked_until } : prev,
      );
    });

    setBusy(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppShell>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Fiscal Closing</h2>
          <p className="mt-1 text-sm text-slate-600">
            Closing checklist, preview, and period locking.
          </p>
        </div>

        <button
          type="button"
          onClick={() => refreshAll()}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          Loading...
        </div>
      ) : error ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
          {error}
        </div>
      ) : null}

      {notice ? (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 shadow-sm">
          {notice}
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ClosingStatusCard fiscalYear={fiscalYear} />

          <div className="mt-4">
            <ClosingChecklist
              canClose={checklist?.can_close}
              checks={checklist?.checks ?? []}
              errors={checklist?.errors ?? {}}
              warnings={checklist?.warnings ?? []}
            />
          </div>

          <div className="mt-4">
            <ClosingPreviewPanel preview={preview?.preview ?? null} />
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Period Lock</h2>
            <p className="mt-1 text-xs text-slate-500">
              Locking affects transaction mutations only; reports remain readable.
            </p>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <label className="md:col-span-1">
                <div className="text-xs text-slate-500">Lock Until</div>
                <input
                  type="date"
                  value={lockUntil}
                  onChange={(e) => setLockUntil(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                />
              </label>

              <label className="md:col-span-2">
                <div className="text-xs text-slate-500">Override Reason (optional)</div>
                <input
                  type="text"
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g. Month-end locking policy update"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                />
              </label>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => updatePeriodLock()}
                className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
              >
                Update Lock
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setLockUntil('');
                  setOverrideReason('');
                }}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <ClosingActionPanel
            canClose={canClose}
            onPreview={refreshPreview}
            onClose={closeFiscalYear}
            closingDisabled={closingDisabled || busy}
          />

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Re-open</h2>
              <ReopenFiscalYearDialog disabled={busy} onReopen={reopenFiscalYear} />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Re-open requires permission and a reason. Historical data remains readable.
            </p>
          </div>

          {preview && !preview.valid ? (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 shadow-sm">
              Preview indicates closing is not ready. Run checklist and resolve errors.
            </div>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}
