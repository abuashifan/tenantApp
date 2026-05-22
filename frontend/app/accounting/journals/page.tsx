'use client';

import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { PageHeader } from '@/components/ui/PageHeader';
import { PermissionGuard } from '@/components/ui/PermissionGuard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AccountingPageGate } from '@/features/accounting/AccountingPageGate';
import { getJournal, listJournals, voidJournal } from '@/features/accounting/journals/api';
import { getApiErrorMessage } from '@/lib/api';
import { formatAccountingStatus, formatCurrency, formatDate } from '@/lib/formatters';
import type { JournalEntry } from '@/types/accounting';

type Option = { value: string; label: string };
type DebitCreditTotals = { debit: number; credit: number };

const STATUS_OPTIONS: Option[] = [
  { value: 'draft', label: formatAccountingStatus('draft') },
  { value: 'approved', label: formatAccountingStatus('approved') },
  { value: 'posted', label: formatAccountingStatus('posted') },
  { value: 'void', label: formatAccountingStatus('void') },
];

const TRANSACTION_TYPE_OPTIONS: Option[] = [
  { value: 'general_journal', label: 'Jurnal Umum' },
  { value: 'depreciation', label: 'Depresiasi' },
  { value: 'sales_invoice', label: 'Sales Invoice' },
  { value: 'vendor_payment', label: 'Vendor Payment' },
  { value: 'cash_receipt', label: 'Cash Receipt' },
];

export default function JournalsPage() {
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedTransactionTypes, setSelectedTransactionTypes] = useState<string[]>([]);
  const [selectedJournalIds, setSelectedJournalIds] = useState<number[]>([]);
  const [busyBulkVoid, setBusyBulkVoid] = useState(false);
  const [totalsByJournalId, setTotalsByJournalId] = useState<Record<number, DebitCreditTotals>>({});
  const loadingTotalsRef = useRef<Set<number>>(new Set());
  const selectAllRef = useRef<HTMLInputElement | null>(null);

  const loadJournals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await listJournals({ include_void: true });
      const next = res.data ?? [];
      setJournals(next);
      setSelectedJournalIds((prev) => {
        if (prev.length === 0) return prev;
        const available = new Set(next.map((row) => row.id));
        const voidIds = new Set(next.filter((row) => row.status === 'void').map((row) => row.id));
        return prev.filter((id) => available.has(id) && !voidIds.has(id));
      });
    } catch (event) {
      setError(getApiErrorMessage(event));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void loadJournals();
    });
  }, [loadJournals]);

  const visibleJournals = useMemo(
    () =>
      filterGeneralJournals(
        journals,
        search,
        selectedStatuses,
        selectedTransactionTypes,
        dateFrom,
        dateTo,
      ),
    [dateFrom, dateTo, journals, search, selectedStatuses, selectedTransactionTypes],
  );

  const selectedJournalIdSet = useMemo(() => new Set(selectedJournalIds), [selectedJournalIds]);

  const visibleSelectableIds = useMemo(
    () => getSelectableJournals(visibleJournals).map((row) => row.id),
    [visibleJournals],
  );

  const allVisibleSelected =
    visibleSelectableIds.length > 0 && visibleSelectableIds.every((id) => selectedJournalIdSet.has(id));
  const someVisibleSelected =
    visibleSelectableIds.length > 0 && visibleSelectableIds.some((id) => selectedJournalIdSet.has(id));

  useEffect(() => {
    if (!selectAllRef.current) return;
    selectAllRef.current.indeterminate = someVisibleSelected && !allVisibleSelected;
  }, [allVisibleSelected, someVisibleSelected]);

  useEffect(() => {
    if (loading) return;
    if (visibleJournals.length === 0) return;

    let cancelled = false;

    async function hydrateTotals() {
      const idsToLoad = visibleJournals
        .map((row) => row.id)
        .filter((id) => !totalsByJournalId[id] && !loadingTotalsRef.current.has(id))
        .slice(0, 25);

      for (const id of idsToLoad) {
        loadingTotalsRef.current.add(id);
        try {
          const res = await getJournal(id);
          const journal = res.data;
          const debit = journal?.lines?.reduce((sum, line) => sum + Number(line.debit ?? 0), 0) ?? 0;
          const credit = journal?.lines?.reduce((sum, line) => sum + Number(line.credit ?? 0), 0) ?? 0;
          if (cancelled) return;
          setTotalsByJournalId((prev) => ({ ...prev, [id]: { debit, credit } }));
        } catch {
          if (cancelled) return;
          setTotalsByJournalId((prev) => ({ ...prev, [id]: { debit: 0, credit: 0 } }));
        } finally {
          loadingTotalsRef.current.delete(id);
        }
      }
    }

    queueMicrotask(() => {
      void hydrateTotals();
    });

    return () => {
      cancelled = true;
    };
  }, [loading, totalsByJournalId, visibleJournals]);

  const clearDisabled =
    !hasActiveFilters(search, selectedStatuses, selectedTransactionTypes, dateFrom, dateTo) &&
    selectedJournalIds.length === 0;

  function clearFilters() {
    setSearch('');
    setDateFrom('');
    setDateTo('');
    setSelectedTransactionTypes([]);
    setSelectedStatuses([]);
    setSelectedJournalIds([]);
  }

  function toggleSelectAllVisible() {
    if (visibleSelectableIds.length === 0) return;
    setSelectedJournalIds((prev) => {
      const set = new Set(prev);
      const everySelected = visibleSelectableIds.every((id) => set.has(id));
      if (everySelected) {
        visibleSelectableIds.forEach((id) => set.delete(id));
      } else {
        visibleSelectableIds.forEach((id) => set.add(id));
      }
      return Array.from(set);
    });
  }

  function toggleSelected(id: number, nextChecked: boolean) {
    setSelectedJournalIds((prev) => {
      const set = new Set(prev);
      if (nextChecked) set.add(id);
      else set.delete(id);
      return Array.from(set);
    });
  }

  async function handleBulkVoid() {
    if (busyBulkVoid) return;
    const ids = selectedJournalIds;
    if (ids.length === 0) return;
    const reason = window.prompt('Void reason');
    if (!reason) return;

    try {
      setBusyBulkVoid(true);
      setError(null);
      for (const id of ids) {
        // Backend currently supports single void; loop preserves existing API pattern.
        // TODO: replace with a bulk endpoint when available.
        await voidJournal(id, reason);
      }
      await loadJournals();
      setSelectedJournalIds([]);
    } catch (event) {
      setError(getApiErrorMessage(event));
    } finally {
      setBusyBulkVoid(false);
    }
  }

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

        <div className="mt-6 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-12">
          <label className="md:col-span-2">
            <span className="text-xs font-medium text-slate-500">Date From</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            />
          </label>
          <label className="md:col-span-2">
            <span className="text-xs font-medium text-slate-500">Date To</span>
            <input
              type="date"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            />
          </label>
          <div className="md:col-span-3">
            <CheckboxFilter
              label="Jenis Transaksi"
              placeholder="All types"
              options={TRANSACTION_TYPE_OPTIONS}
              value={selectedTransactionTypes}
              onChange={setSelectedTransactionTypes}
            />
          </div>
          <label className="md:col-span-3">
            <span className="text-xs font-medium text-slate-500">Search</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Number, description, source, or created by"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            />
          </label>
          <div className="md:col-span-2">
            <CheckboxFilter
              label="Status"
              placeholder="All statuses"
              options={STATUS_OPTIONS}
              value={selectedStatuses}
              onChange={setSelectedStatuses}
            />
          </div>
          <div className="md:col-span-12 flex items-end justify-end gap-2">
            <button
              type="button"
              onClick={clearFilters}
              disabled={clearDisabled}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Clear Filter
            </button>
            <button
              type="button"
              onClick={() => loadJournals()}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="mt-6">
          {loading ? (
            <LoadingState title="Loading journals" />
          ) : error ? (
            <ErrorState message={error} />
          ) : visibleJournals.length === 0 ? (
            <EmptyState title="No journals found" />
          ) : (
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-950">List Jurnal</p>
                  <p className="text-xs text-slate-500">
                    {visibleJournals.length} row{visibleJournals.length === 1 ? '' : 's'}
                    {selectedJournalIds.length > 0 ? ` · ${selectedJournalIds.length} selected` : ''}
                  </p>
                </div>
                <PermissionGuard permission="journal.void">
                  <button
                    type="button"
                    disabled={busyBulkVoid || selectedJournalIds.length === 0}
                    onClick={() => void handleBulkVoid()}
                    className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                  >
                    {busyBulkVoid ? 'Voiding...' : 'Bulk Void'}
                  </button>
                </PermissionGuard>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th
                        scope="col"
                        className="w-10 px-4 py-3 text-left text-xs font-semibold uppercase tracking-normal text-slate-500"
                      >
                        <input
                          ref={selectAllRef}
                          type="checkbox"
                          disabled={visibleSelectableIds.length === 0}
                          checked={allVisibleSelected}
                          onChange={() => toggleSelectAllVisible()}
                          className="h-4 w-4 rounded border-slate-300 text-slate-900 disabled:opacity-50"
                        />
                      </th>
                      {['No. Jurnal', 'Tanggal', 'Deskripsi', 'Sumber', 'Status', 'Debit', 'Credit'].map((column) => (
                        <th
                          key={column}
                          scope="col"
                          className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-normal text-slate-500 ${
                            column === 'Debit' || column === 'Credit' ? 'text-right' : ''
                          }`}
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {visibleJournals.map((journal) => {
                      const disabled = journal.status === 'void';
                      const checked = selectedJournalIdSet.has(journal.id);
                      const totals = totalsByJournalId[journal.id];

                      return (
                        <tr key={journal.id} className={disabled ? 'bg-slate-50 text-slate-500' : 'hover:bg-slate-50'}>
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              disabled={disabled}
                              checked={checked}
                              onChange={(event) => toggleSelected(journal.id, event.target.checked)}
                              className="h-4 w-4 rounded border-slate-300 text-slate-900 disabled:opacity-50"
                            />
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 font-medium">
                            <Link
                              href={`/accounting/journals/${journal.id}`}
                              className="hover:underline"
                            >
                              {journal.journal_number}
                            </Link>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">{formatDate(journal.journal_date)}</td>
                          <td className="px-4 py-3 text-slate-700">{journal.description ?? '-'}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                            {formatTransactionType(journal.source_type)}
                            {journal.source_number ? ` · ${journal.source_number}` : ''}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <StatusBadge
                              status={formatAccountingStatus(journal.status)}
                              tone={journalStatusTone(journal.status)}
                            />
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right text-slate-700">
                            {totals ? formatCurrency(totals.debit) : '-'}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right text-slate-700">
                            {totals ? formatCurrency(totals.credit) : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
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

function normalizeTransactionType(value: string | null | undefined): string {
  const normalized = String(value ?? '').trim();
  if (!normalized) return '';
  if (normalized === 'manual_journal') return 'general_journal';
  return normalized;
}

function formatTransactionType(value: string | null | undefined): string {
  const normalized = normalizeTransactionType(value);
  const option = TRANSACTION_TYPE_OPTIONS.find((item) => item.value === normalized);
  if (option) return option.label;
  return normalized ? formatAccountingStatus(normalized) : '-';
}

export function filterGeneralJournals(
  items: JournalEntry[],
  search: string,
  selectedStatuses: string[],
  selectedTransactionTypes: string[],
  dateFrom: string,
  dateTo: string,
): JournalEntry[] {
  const term = search.trim().toLowerCase();
  return items.filter((journal) => {
    const journalDate = String(journal.journal_date ?? '').slice(0, 10);
    const type = normalizeTransactionType(journal.source_type);
    const matchesDateFrom = !dateFrom || (journalDate && journalDate >= dateFrom);
    const matchesDateTo = !dateTo || (journalDate && journalDate <= dateTo);
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(String(journal.status));
    const matchesType = selectedTransactionTypes.length === 0 || selectedTransactionTypes.includes(type);
    const matchesSearch =
      !term ||
      String(journal.journal_number ?? '').toLowerCase().includes(term) ||
      String(journal.description ?? '').toLowerCase().includes(term) ||
      String(journal.source_type ?? '').toLowerCase().includes(term) ||
      String(journal.source_number ?? '').toLowerCase().includes(term) ||
      String(journal.created_by ?? '').toLowerCase().includes(term);

    return matchesDateFrom && matchesDateTo && matchesStatus && matchesType && matchesSearch;
  });
}

export function hasActiveFilters(
  search: string,
  selectedStatuses: string[],
  selectedTransactionTypes: string[],
  dateFrom: string,
  dateTo: string,
): boolean {
  return (
    search.trim().length > 0 ||
    dateFrom.trim().length > 0 ||
    dateTo.trim().length > 0 ||
    selectedStatuses.length > 0 ||
    selectedTransactionTypes.length > 0
  );
}

export function getSelectableJournals(items: JournalEntry[]): JournalEntry[] {
  return items.filter((row) => row.status !== 'void');
}

function CheckboxFilter({
  label,
  placeholder,
  options,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  options: Option[];
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown, true);
    return () => document.removeEventListener('pointerdown', handlePointerDown, true);
  }, [open]);

  const summary = useMemo(() => {
    if (value.length === 0) return placeholder;
    if (value.length === 1) {
      const opt = options.find((item) => item.value === value[0]);
      return opt?.label ?? value[0];
    }
    return `${value.length} selected`;
  }, [options, placeholder, value]);

  function toggleOption(option: string) {
    const set = new Set(value);
    if (set.has(option)) set.delete(option);
    else set.add(option);
    onChange(Array.from(set));
  }

  return (
    <div ref={containerRef} className="relative">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="mt-1 flex w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-700 outline-none focus:border-slate-400"
      >
        <span className="truncate">{summary}</span>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-[72px] z-[70] rounded-xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-950/10">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-slate-700">{label}</p>
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-xs font-medium text-slate-600 hover:underline"
            >
              Reset filter
            </button>
          </div>
          <div className="max-h-56 space-y-2 overflow-auto pr-1">
            {options.map((item) => (
              <label key={item.value} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={value.includes(item.value)}
                  onChange={() => toggleOption(item.value)}
                  className="h-4 w-4 rounded border-slate-300 text-slate-900"
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
