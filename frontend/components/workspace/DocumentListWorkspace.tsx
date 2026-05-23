'use client';

import { FileText } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { SearchablePartyFilter } from './SearchablePartyFilter';
import { WorkspaceTable } from './WorkspaceTable';
import { WorkspaceToolbar } from './WorkspaceToolbar';
import type {
  WorkspaceBulkAction,
  WorkspaceColumn,
  WorkspaceFilterState,
  WorkspaceRow,
  WorkspaceRowAction,
  WorkspaceRowId,
  WorkspaceSelectOption,
} from './types';

type DocumentListWorkspaceProps<T extends WorkspaceRow> = {
  documentLabel: string;
  newButtonLabel?: string;
  rows: T[];
  columns: WorkspaceColumn<T>[];
  filters: WorkspaceFilterState;
  statusOptions: WorkspaceSelectOption[];
  loading?: boolean;
  error?: string | null;
  emptyTitle?: string;
  emptyDescription?: string;
  searchPlaceholder?: string;
  partyFilterLabel?: string;
  rowActions?: WorkspaceRowAction<T>[];
  bulkActions?: WorkspaceBulkAction[];
  getSearchText?: (row: T) => string;
  getStatus?: (row: T) => string;
  getDate?: (row: T) => string;
  getPartyName?: (row: T) => string;
  onCreate?: () => void;
  onExport?: () => void;
  onApplyFilters?: () => void;
  onFilterChange: (filters: WorkspaceFilterState) => void;
};

export function DocumentListWorkspace<T extends WorkspaceRow>({
  documentLabel,
  newButtonLabel,
  rows,
  columns,
  filters,
  statusOptions,
  loading = false,
  error = null,
  emptyTitle,
  emptyDescription,
  searchPlaceholder = `Cari ${documentLabel.toLowerCase()}...`,
  partyFilterLabel,
  rowActions = [],
  bulkActions = [],
  getSearchText,
  getStatus,
  getDate,
  getPartyName,
  onCreate,
  onExport,
  onApplyFilters,
  onFilterChange,
}: DocumentListWorkspaceProps<T>) {
  const [showFilters, setShowFilters] = useState(false);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedIds, setSelectedIds] = useState<WorkspaceRowId[]>([]);
  const [visibleCount, setVisibleCount] = useState(12);
  const tableScrollRef = useRef<HTMLDivElement | null>(null);

  const partyOptions = useMemo(() => {
    if (!getPartyName) return [];
    return Array.from(new Set(rows.map((row) => getPartyName(row)).filter(Boolean))).sort(
      (a, b) => a.localeCompare(b),
    );
  }, [getPartyName, rows]);

  const filteredRows = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    const result = rows.filter((row) => {
      const matchesSearch =
        !search || !getSearchText || getSearchText(row).toLowerCase().includes(search);
      const matchesStatus =
        !getStatus || filters.status === 'all' || getStatus(row) === filters.status;
      const matchesParty =
        !getPartyName || filters.party === 'all' || getPartyName(row) === filters.party;
      const rowDate = getDate?.(row);
      const matchesDateFrom = !rowDate || !filters.dateFrom || rowDate >= filters.dateFrom;
      const matchesDateTo = !rowDate || !filters.dateTo || rowDate <= filters.dateTo;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesParty &&
        matchesDateFrom &&
        matchesDateTo
      );
    });

    if (!sortKey) return result;

    const activeColumn = columns.find((column) => column.key === sortKey);
    if (!activeColumn?.sortValue) return result;

    return [...result].sort((a, b) => {
      const aValue = activeColumn.sortValue?.(a);
      const bValue = activeColumn.sortValue?.(b);

      if (aValue === undefined || bValue === undefined) return 0;

      const comparison =
        typeof aValue === 'number' && typeof bValue === 'number'
          ? aValue - bValue
          : String(aValue).localeCompare(String(bValue));

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [
    columns,
    filters.dateFrom,
    filters.dateTo,
    filters.party,
    filters.search,
    filters.status,
    getDate,
    getPartyName,
    getSearchText,
    getStatus,
    rows,
    sortDirection,
    sortKey,
  ]);

  const visibleRows = filteredRows.slice(0, visibleCount);
  const hasMoreRows = visibleRows.length < filteredRows.length;

  function loadMoreRows() {
    setVisibleCount((current) => Math.min(current + 12, filteredRows.length));
  }

  function handleTableScroll() {
    const element = tableScrollRef.current;
    if (!element || !hasMoreRows) return;

    const distanceFromBottom = element.scrollHeight - element.scrollTop - element.clientHeight;
    if (distanceFromBottom < 96) loadMoreRows();
  }

  function toggleRow(id: WorkspaceRowId) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((selectedId) => selectedId !== id) : [...current, id],
    );
  }

  function toggleAllVisibleRows() {
    const allVisibleSelected =
      visibleRows.length > 0 && visibleRows.every((row) => selectedIds.includes(row.id));

    if (allVisibleSelected) {
      setSelectedIds((current) =>
        current.filter((id) => !visibleRows.some((row) => row.id === id)),
      );
      return;
    }

    setSelectedIds((current) =>
      Array.from(new Set([...current, ...visibleRows.map((row) => row.id)])),
    );
  }

  function toggleSort(column: WorkspaceColumn<T>) {
    if (!column.sortable) return;

    if (sortKey === column.key) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortKey(column.key);
    setSortDirection('asc');
  }

  const partyFilter =
    partyFilterLabel && getPartyName ? (
      <SearchablePartyFilter
        label={partyFilterLabel}
        value={filters.party}
        options={partyOptions}
        onChange={(party) => onFilterChange({ ...filters, party })}
      />
    ) : null;

  return (
    <div className="h-[calc(100vh-9rem)] min-h-[620px] overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
      <div className="flex h-full min-h-0 flex-col">
        <WorkspaceToolbar
          searchPlaceholder={searchPlaceholder}
          filters={filters}
          statusOptions={statusOptions}
          showFilters={showFilters}
          partyFilter={partyFilter}
          bulkActions={bulkActions}
          selectedIds={selectedIds}
          newButtonLabel={newButtonLabel}
          onCreate={onCreate}
          onExport={onExport}
          onApplyFilters={onApplyFilters}
          onFilterChange={onFilterChange}
          onToggleFilters={() => setShowFilters((current) => !current)}
        />

        {loading ? (
          <div className="p-5">
            <LoadingState title={`Loading ${documentLabel.toLowerCase()}`} />
          </div>
        ) : error ? (
          <div className="p-5">
            <ErrorState message={error} />
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="flex flex-1 items-center justify-center p-5">
            <EmptyState
              title={emptyTitle ?? `No ${documentLabel.toLowerCase()} found`}
              description={emptyDescription}
            />
          </div>
        ) : (
          <>
            <div
              ref={tableScrollRef}
              onScroll={handleTableScroll}
              className="min-h-0 flex-1 overflow-auto"
            >
              <WorkspaceTable
                rows={visibleRows}
                columns={columns}
                rowActions={rowActions}
                selectedIds={selectedIds}
                sortKey={sortKey}
                sortDirection={sortDirection}
                onToggleRow={toggleRow}
                onToggleAll={toggleAllVisibleRows}
                onToggleSort={toggleSort}
              />
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 bg-white px-5 py-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
              <p>
                Menampilkan{' '}
                <span className="font-semibold text-slate-900">{visibleRows.length}</span>{' '}
                dari{' '}
                <span className="font-semibold text-slate-900">{filteredRows.length}</span>{' '}
                hasil filter
                <span className="text-slate-300"> / </span>
                total <span className="font-semibold text-slate-900">{rows.length}</span>{' '}
                {documentLabel.toLowerCase()}.
              </p>
              {hasMoreRows ? (
                <button
                  type="button"
                  onClick={loadMoreRows}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Load more
                </button>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-normal text-slate-400">
                  <FileText className="h-4 w-4" />
                  Semua data sudah tampil
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
