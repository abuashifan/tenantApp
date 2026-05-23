'use client';

import { Ban, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  DocumentListWorkspace,
  type WorkspaceBulkAction,
  type WorkspaceColumn,
  type WorkspaceFilterState,
  type WorkspaceRowAction,
  type WorkspaceSelectOption,
} from '@/components/workspace';
import { AccountingPageGate } from '@/features/accounting/AccountingPageGate';
import { listJournals, voidJournal } from '@/features/accounting/journals/api';
import { getApiErrorMessage } from '@/lib/api';
import { formatAccountingStatus, formatDate } from '@/lib/formatters';
import { getStoredPermissions, hasPermission } from '@/lib/permissions';
import type { JournalEntry } from '@/types/accounting';

type Option = { value: string; label: string };

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

const statusOptions: WorkspaceSelectOption[] = [
  { label: 'All statuses', value: 'all' },
  ...STATUS_OPTIONS,
];

export default function JournalsPage() {
  const router = useRouter();
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyBulkVoid, setBusyBulkVoid] = useState(false);
  const [filters, setFilters] = useState<WorkspaceFilterState>({
    search: '',
    status: 'all',
    party: 'all',
    dateFrom: '',
    dateTo: '',
  });
  const permissions = getStoredPermissions();
  const canCreate = hasPermission(permissions, 'journal.create');
  const canVoid = hasPermission(permissions, 'journal.void');

  const loadJournals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await listJournals({
        status: filters.status === 'all' ? undefined : filters.status,
        date_from: filters.dateFrom,
        date_to: filters.dateTo,
        search: filters.search,
        include_void: true,
      });
      setJournals(res.data ?? []);
    } catch (event) {
      setError(getApiErrorMessage(event));
    } finally {
      setLoading(false);
    }
  }, [filters.dateFrom, filters.dateTo, filters.search, filters.status]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadJournals();
    });
  }, [loadJournals]);

  const columns = useMemo<WorkspaceColumn<JournalEntry>[]>(
    () => [
      {
        key: 'number',
        label: 'No. Jurnal',
        widthClassName: 'min-w-[180px]',
        sortable: true,
        sortValue: (journal) => journal.journal_number,
        render: (journal) => (
          <button
            type="button"
            onClick={() => router.push(`/accounting/journals/${journal.id}`)}
            className="font-bold text-slate-950 transition hover:text-[var(--color-cerulean-500)]"
          >
            {journal.journal_number}
          </button>
        ),
      },
      {
        key: 'date',
        label: 'Tanggal',
        widthClassName: 'min-w-[140px]',
        sortable: true,
        sortValue: (journal) => journal.journal_date,
        render: (journal) => (
          <div>
            <p className="font-semibold text-slate-800">
              {formatDate(journal.journal_date)}
            </p>
            <p className="mt-1 text-xs text-slate-400">Journal Date</p>
          </div>
        ),
      },
      {
        key: 'description',
        label: 'Deskripsi',
        widthClassName: 'min-w-[280px]',
        sortable: true,
        sortValue: (journal) => journal.description ?? '',
        render: (journal) => (
          <div>
            <p className="font-medium text-slate-700">{journal.description ?? '-'}</p>
            <p className="mt-1 text-xs text-slate-400">
              {formatTransactionType(journal.source_type)}
              {journal.source_number ? ` · ${journal.source_number}` : ''}
            </p>
          </div>
        ),
      },
      {
        key: 'status',
        label: 'Status',
        widthClassName: 'min-w-[140px]',
        sortable: true,
        sortValue: (journal) => journal.status,
        render: (journal) => (
          <StatusBadge
            status={formatAccountingStatus(journal.status)}
            tone={journalStatusTone(journal.status)}
          />
        ),
      },
      {
        key: 'revision',
        label: 'Revision',
        align: 'right',
        widthClassName: 'min-w-[120px]',
        sortable: true,
        sortValue: (journal) => journal.revision_no ?? 1,
        render: (journal) => (
          <p className="font-semibold text-slate-700">{journal.revision_no ?? 1}</p>
        ),
      },
    ],
    [router],
  );

  const rowActions = useMemo<WorkspaceRowAction<JournalEntry>[]>(
    () => [
      {
        key: 'view',
        label: 'View Detail',
        icon: <Eye className="h-4 w-4 text-slate-400" />,
        href: (journal) => `/accounting/journals/${journal.id}`,
      },
    ],
    [],
  );

  const handleBulkVoid = useCallback(async (selectedIds: Array<string | number>) => {
    if (busyBulkVoid || selectedIds.length === 0) return;
    const reason = window.prompt('Void reason');
    if (!reason) return;

    try {
      setBusyBulkVoid(true);
      setError(null);
      for (const id of selectedIds) {
        await voidJournal(id, reason);
      }
      await loadJournals();
    } catch (event) {
      setError(getApiErrorMessage(event));
    } finally {
      setBusyBulkVoid(false);
    }
  }, [busyBulkVoid, loadJournals]);

  const bulkActions = useMemo<WorkspaceBulkAction[]>(
    () =>
      canVoid
        ? [
            {
              key: 'void',
              label: busyBulkVoid ? 'Voiding...' : 'Bulk Void',
              danger: true,
              disabled: busyBulkVoid,
              icon: <Ban className="h-4 w-4" />,
              onClick: (selectedIds) => {
                void handleBulkVoid(selectedIds);
              },
            },
          ]
        : [],
    [busyBulkVoid, canVoid, handleBulkVoid],
  );

  return (
    <AppShell>
      <AccountingPageGate permission="journal.view">
        <PageHeader
          title="Journal Entries"
          description="Create, review, approve, post, and void manual journal entries."
        />

        <div className="mt-6">
          <DocumentListWorkspace
            documentLabel="Journal Entry"
            newButtonLabel={canCreate ? 'New Journal' : undefined}
            rows={journals}
            columns={columns}
            filters={filters}
            statusOptions={statusOptions}
            loading={loading}
            error={error}
            emptyTitle="No journals found"
            searchPlaceholder="Cari nomor jurnal, deskripsi, source, atau status..."
            rowActions={rowActions}
            bulkActions={bulkActions}
            getSearchText={(journal) =>
              [
                journal.journal_number,
                journal.description,
                journal.source_number,
                journal.source_type,
                journal.status,
                journal.created_by,
              ]
                .filter(Boolean)
                .join(' ')
            }
            getStatus={(journal) => journal.status}
            getDate={(journal) => String(journal.journal_date ?? '').slice(0, 10)}
            onCreate={canCreate ? () => router.push('/accounting/journals/new') : undefined}
            onApplyFilters={loadJournals}
            onFilterChange={setFilters}
          />
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
  return normalized ? formatAccountingStatus(normalized) : 'Manual journal';
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
    const matchesStatus =
      selectedStatuses.length === 0 || selectedStatuses.includes(String(journal.status));
    const matchesType =
      selectedTransactionTypes.length === 0 || selectedTransactionTypes.includes(type);
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
