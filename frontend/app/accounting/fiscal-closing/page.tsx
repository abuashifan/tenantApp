'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { apiRequest, getApiErrorMessage, getStoredCompanyId, getStoredToken } from '@/lib/api';
import { AppShell } from '@/components/layout/AppShell';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { PageHeader } from '@/components/ui/PageHeader';
import { PermissionGuard } from '@/components/ui/PermissionGuard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { ApiResponse } from '@/types/api';
import { ClosingStatusCard } from '@/components/accounting/closing/ClosingStatusCard';
import { ClosingChecklist } from '@/components/accounting/closing/ClosingChecklist';
import { ClosingPreviewPanel } from '@/components/accounting/closing/ClosingPreviewPanel';
import { ClosingActionPanel } from '@/components/accounting/closing/ClosingActionPanel';
import { ReopenFiscalYearDialog } from '@/components/accounting/closing/ReopenFiscalYearDialog';
import { AccountingPageGate } from '@/features/accounting/AccountingPageGate';

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
    return !canClose || !preview?.valid || busy;
  }, [busy, canClose, preview?.valid]);

  async function guarded<T>(fn: () => Promise<T>): Promise<T | null> {
    try {
      setError(null);
      setNotice(null);
      return await fn();
    } catch (e) {
      setError(getApiErrorMessage(e));
      return null;
    }
  }

  async function refreshAll() {
    const token = getStoredToken();
    const companyId = getStoredCompanyId();
    if (!token || !companyId) return;

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
    queueMicrotask(() => {
      void refreshAll();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppShell>
      <AccountingPageGate permission="fiscal_year.view">
        <PageHeader
          title="Fiscal Closing"
          description="Operational closing workflow, checklist validation, period locking, and limited re-open flow."
          actions={
            <button
              type="button"
              onClick={() => refreshAll()}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Refresh
            </button>
          }
        />

        {loading ? (
          <div className="mt-6">
            <LoadingState title="Loading fiscal closing status" />
          </div>
        ) : error ? (
          <div className="mt-6">
            <ErrorState message={error} />
          </div>
        ) : null}

        {notice ? (
          <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 shadow-sm">
            {notice}
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <SummaryTile
            label="Fiscal Year"
            value={String(fiscalYear?.year ?? '-')}
            helper={`${fiscalYear?.start_date ?? '-'} → ${fiscalYear?.end_date ?? '-'}`}
          />
          <SummaryTile
            label="Closing Status"
            value={
              <StatusBadge
                status={fiscalYear?.is_closed ? 'Closed' : 'Open'}
                tone={fiscalYear?.is_closed ? 'danger' : 'success'}
              />
            }
            helper={fiscalYear?.status ?? '-'}
          />
          <SummaryTile
            label="Checklist"
            value={
              <StatusBadge
                status={canClose ? 'Ready' : 'Not Ready'}
                tone={canClose ? 'success' : 'warning'}
              />
            }
            helper={`${checklist?.checks?.length ?? 0} checks`}
          />
          <SummaryTile
            label="Locked Until"
            value={fiscalYear?.locked_until ?? '-'}
            helper="Reports remain readable"
          />
        </div>

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
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Period Lock</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Locking affects journal mutations only; historical reads and reports remain open.
                  </p>
                </div>
                <StatusBadge
                  status={fiscalYear?.locked_until ? 'Locked' : 'Unlocked'}
                  tone={fiscalYear?.locked_until ? 'warning' : 'success'}
                />
              </div>

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
                  <div className="text-xs text-slate-500">Override Reason</div>
                  <input
                    type="text"
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    placeholder="Required by policy when overriding manual locks"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                  />
                </label>
              </div>

              <PermissionGuard
                permission="fiscal_year.lock_manage"
                fallback={
                  <p className="mt-4 text-xs text-slate-500">
                    Your role can view period locks but cannot update them.
                  </p>
                }
              >
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
              </PermissionGuard>
            </div>
          </div>

          <div className="lg:col-span-1">
            <PermissionGuard
              permission="fiscal_year.close"
              fallback={
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
                  Your role can view fiscal closing but cannot close fiscal years.
                </div>
              }
            >
              <ClosingActionPanel
                canClose={canClose}
                onPreview={refreshPreview}
                onClose={closeFiscalYear}
                closingDisabled={closingDisabled}
              />
            </PermissionGuard>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">Re-open Workflow</h2>
                <PermissionGuard
                  permission="fiscal_year.reopen"
                  fallback={<span className="text-xs text-slate-400">View only</span>}
                >
                  <ReopenFiscalYearDialog disabled={busy || !fiscalYear?.is_closed} onReopen={reopenFiscalYear} />
                </PermissionGuard>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Re-open requires permission and a reason. Closing history is never deleted.
              </p>
            </div>

            {preview && !preview.valid ? (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 shadow-sm">
                Preview indicates closing is not ready. Resolve checklist errors before closing.
              </div>
            ) : null}
          </div>
        </div>
      </AccountingPageGate>
    </AppShell>
  );
}

function SummaryTile({
  label,
  value,
  helper,
}: {
  label: string;
  value: ReactNode;
  helper?: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-2 text-base font-semibold text-slate-950">{value}</div>
      {helper ? <div className="mt-1 text-xs text-slate-500">{helper}</div> : null}
    </div>
  );
}
