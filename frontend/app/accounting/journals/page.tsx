'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { DataTable } from '@/components/ui/DataTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { PageHeader } from '@/components/ui/PageHeader';
import { PermissionGuard } from '@/components/ui/PermissionGuard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AccountingPageGate } from '@/features/accounting/AccountingPageGate';
import { listJournals } from '@/features/accounting/journals/api';
import { getApiErrorMessage } from '@/lib/api';
import { formatAccountingStatus, formatDate } from '@/lib/formatters';
import type { JournalEntry } from '@/types/accounting';

const statuses = ['all', 'draft', 'approved', 'posted', 'void'];

export default function JournalsPage() {
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  async function loadJournals() {
    try {
      setLoading(true);
      setError(null);
      const res = await listJournals({
        status: status === 'all' ? undefined : status,
        date_from: dateFrom,
        date_to: dateTo,
        search,
      });
      setJournals(res.data ?? []);
    } catch (event) {
      setError(getApiErrorMessage(event));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    queueMicrotask(() => {
      void loadJournals();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const visibleJournals = useMemo(() => journals, [journals]);

  return (
    <AppShell>
      <AccountingPageGate permission="journal.view">
        <PageHeader
          title="Journal Entries"
          description="Create, review, approve, post, and void manual journal entries."
          actions={
            <PermissionGuard permission="journal.create">
              <Link
                href="/accounting/journals/new"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                New Journal
              </Link>
            </PermissionGuard>
          }
        />

        <div className="mt-6 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-5">
          <label className="md:col-span-2">
            <span className="text-xs font-medium text-slate-500">Search</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Journal number or description"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            />
          </label>
          <label>
            <span className="text-xs font-medium text-slate-500">Date From</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            />
          </label>
          <label>
            <span className="text-xs font-medium text-slate-500">Date To</span>
            <input
              type="date"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            />
          </label>
          <label>
            <span className="text-xs font-medium text-slate-500">Status</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            >
              {statuses.map((item) => (
                <option key={item} value={item}>
                  {item === 'all' ? 'All statuses' : formatAccountingStatus(item)}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => loadJournals()}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 md:col-start-5"
          >
            Apply
          </button>
        </div>

        <div className="mt-6">
          {loading ? (
            <LoadingState title="Loading journals" />
          ) : error ? (
            <ErrorState message={error} />
          ) : visibleJournals.length === 0 ? (
            <EmptyState title="No journals found" />
          ) : (
            <DataTable columns={['Number', 'Date', 'Description', 'Status', 'Revision', 'Actions']}>
              {visibleJournals.map((journal) => (
                <tr key={journal.id} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                    {journal.journal_number}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {formatDate(journal.journal_date)}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{journal.description ?? '-'}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <StatusBadge
                      status={formatAccountingStatus(journal.status)}
                      tone={journalStatusTone(journal.status)}
                    />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {journal.revision_no ?? 1}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <Link
                      href={`/accounting/journals/${journal.id}`}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </DataTable>
          )}
        </div>
      </AccountingPageGate>
    </AppShell>
  );
}

function journalStatusTone(status: string): 'default' | 'success' | 'warning' | 'danger' | 'muted' {
  if (status === 'posted') return 'success';
  if (status === 'approved') return 'default';
  if (status === 'void') return 'danger';
  return 'warning';
}
