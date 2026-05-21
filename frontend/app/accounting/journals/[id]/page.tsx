'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { DataTable } from '@/components/ui/DataTable';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { PageHeader } from '@/components/ui/PageHeader';
import { PermissionGuard } from '@/components/ui/PermissionGuard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AccountingPageGate } from '@/features/accounting/AccountingPageGate';
import {
  approveJournal,
  getJournal,
  postJournal,
  voidJournal,
} from '@/features/accounting/journals/api';
import { getApiErrorMessage } from '@/lib/api';
import {
  formatAccountingStatus,
  formatCurrency,
  formatDate,
} from '@/lib/formatters';
import type { JournalEntry } from '@/types/accounting';

export default function JournalDetailPage() {
  const params = useParams<{ id: string }>();
  const [journal, setJournal] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadJournal() {
    try {
      setLoading(true);
      setError(null);
      const res = await getJournal(params.id);
      setJournal(res.data);
    } catch (event) {
      setError(getApiErrorMessage(event));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    queueMicrotask(() => {
      void loadJournal();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function runAction(action: 'approve' | 'post' | 'void') {
    if (!journal) return;
    try {
      setBusyAction(action);
      setError(null);
      if (action === 'approve') await approveJournal(journal.id);
      if (action === 'post') await postJournal(journal.id);
      if (action === 'void') {
        const reason = window.prompt('Void reason');
        if (!reason) return;
        await voidJournal(journal.id, reason);
      }
      await loadJournal();
    } catch (event) {
      setError(getApiErrorMessage(event));
    } finally {
      setBusyAction(null);
    }
  }

  const totalDebit = journal?.lines?.reduce((sum, line) => sum + Number(line.debit ?? 0), 0) ?? 0;
  const totalCredit = journal?.lines?.reduce((sum, line) => sum + Number(line.credit ?? 0), 0) ?? 0;

  return (
    <AppShell>
      <AccountingPageGate permission="journal.view">
        {loading ? (
          <LoadingState title="Loading journal" />
        ) : error ? (
          <ErrorState message={error} />
        ) : journal ? (
          <>
            <PageHeader
              title={journal.journal_number}
              description={`${formatDate(journal.journal_date)} · ${journal.description ?? 'No description'}`}
              actions={
                <>
                  <Link
                    href="/accounting/journals"
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Back
                  </Link>
                  <PermissionGuard permission="journal.edit">
                    <Link
                      href={`/accounting/journals/${journal.id}/edit`}
                      className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Edit
                    </Link>
                  </PermissionGuard>
                  <PermissionGuard permission="journal.approve">
                    <button
                      type="button"
                      disabled={busyAction !== null || journal.status !== 'draft'}
                      onClick={() => runAction('approve')}
                      className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      Approve
                    </button>
                  </PermissionGuard>
                  <PermissionGuard permission="journal.post">
                    <button
                      type="button"
                      disabled={busyAction !== null || journal.status === 'posted' || journal.status === 'void'}
                      onClick={() => runAction('post')}
                      className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                    >
                      Post
                    </button>
                  </PermissionGuard>
                  <PermissionGuard permission="journal.void">
                    <button
                      type="button"
                      disabled={busyAction !== null || journal.status === 'void'}
                      onClick={() => runAction('void')}
                      className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                    >
                      Void
                    </button>
                  </PermissionGuard>
                </>
              }
            />

            <div className="mt-6 grid gap-4 md:grid-cols-4">
              <InfoCard label="Status" value={<StatusBadge status={formatAccountingStatus(journal.status)} tone={journalStatusTone(journal.status)} />} />
              <InfoCard label="Revision" value={String(journal.revision_no ?? 1)} />
              <InfoCard label="Source" value={journal.source_number ?? journal.source_type ?? '-'} />
              <InfoCard label="Balance" value={formatCurrency(Math.abs(totalDebit - totalCredit))} />
            </div>

            <div className="mt-6">
              <DataTable columns={['Account', 'Description', 'Department', 'Project', 'Debit', 'Credit']}>
                {(journal.lines ?? []).map((line, index) => (
                  <tr key={`${line.id ?? index}`} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-900">
                      {line.account
                        ? `${line.account.account_code} - ${line.account.account_name}`
                        : `Account #${line.account_id}`}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{line.description ?? '-'}</td>
                    <td className="px-4 py-3 text-slate-600">{line.department?.name ?? line.department_id ?? '-'}</td>
                    <td className="px-4 py-3 text-slate-600">{line.project?.name ?? line.project_id ?? '-'}</td>
                    <td className="px-4 py-3 text-right text-slate-700">{formatCurrency(Number(line.debit ?? 0))}</td>
                    <td className="px-4 py-3 text-right text-slate-700">{formatCurrency(Number(line.credit ?? 0))}</td>
                  </tr>
                ))}
                <tr className="bg-slate-50 font-semibold text-slate-950">
                  <td className="px-4 py-3" colSpan={4}>
                    Totals
                  </td>
                  <td className="px-4 py-3 text-right">{formatCurrency(totalDebit)}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(totalCredit)}</td>
                </tr>
              </DataTable>
            </div>
          </>
        ) : null}
      </AccountingPageGate>
    </AppShell>
  );
}

function InfoCard({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-2 font-semibold text-slate-950">{value}</div>
    </div>
  );
}

function journalStatusTone(status: string): 'default' | 'success' | 'warning' | 'danger' | 'muted' {
  if (status === 'posted') return 'success';
  if (status === 'approved') return 'default';
  if (status === 'void') return 'danger';
  return 'warning';
}
