'use client';

import { ChevronDown, Download, Filter, Plus, Search } from 'lucide-react';
import type { ReactNode } from 'react';
import type {
  WorkspaceBulkAction,
  WorkspaceFilterState,
  WorkspaceRowId,
  WorkspaceSelectOption,
} from './types';

type WorkspaceToolbarProps = {
  searchPlaceholder: string;
  filters: WorkspaceFilterState;
  statusOptions: WorkspaceSelectOption[];
  showFilters: boolean;
  partyFilter?: ReactNode;
  bulkActions: WorkspaceBulkAction[];
  selectedIds: WorkspaceRowId[];
  newButtonLabel?: string;
  onCreate?: () => void;
  onExport?: () => void;
  onApplyFilters?: () => void;
  onFilterChange: (filters: WorkspaceFilterState) => void;
  onToggleFilters: () => void;
};

export function WorkspaceToolbar({
  searchPlaceholder,
  filters,
  statusOptions,
  showFilters,
  partyFilter,
  bulkActions,
  selectedIds,
  newButtonLabel,
  onCreate,
  onExport,
  onApplyFilters,
  onFilterChange,
  onToggleFilters,
}: WorkspaceToolbarProps) {
  const setFilter = (key: keyof WorkspaceFilterState, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="border-b border-slate-100 p-4 lg:p-5">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
          <div className="relative min-w-0 flex-1 md:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={filters.search}
              onChange={(event) => setFilter('search', event.target.value)}
              placeholder={searchPlaceholder}
              className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-[var(--color-cerulean-500)] focus:bg-white focus:ring-4 focus:ring-[var(--color-cerulean-50)]"
            />
          </div>

          <button
            type="button"
            onClick={onToggleFilters}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Filter className="h-4 w-4" />
            Filter
            <ChevronDown className={`h-4 w-4 transition ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedIds.length > 0 ? (
            <span className="rounded-full bg-[var(--color-emerald-50)] px-3 py-1.5 text-xs font-semibold text-[var(--color-emerald-700)]">
              {selectedIds.length} selected
            </span>
          ) : null}

          {onExport ? (
            <button
              type="button"
              onClick={onExport}
              className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          ) : null}

          {newButtonLabel && onCreate ? (
            <button
              type="button"
              onClick={onCreate}
              className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[var(--color-yale-blue-950)] px-4 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-[var(--color-yale-blue-900)]"
            >
              <Plus className="h-4 w-4" />
              {newButtonLabel}
            </button>
          ) : null}

          {bulkActions.map((action) => (
            <button
              key={action.key}
              type="button"
              disabled={selectedIds.length === 0 || action.disabled}
              onClick={() => action.onClick(selectedIds)}
              className={`inline-flex h-11 items-center gap-2 rounded-2xl px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-300 ${
                action.danger
                  ? 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {showFilters ? (
        <div className="mt-4 grid gap-3 rounded-3xl bg-slate-50 p-3 md:grid-cols-4">
          <label className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-normal text-slate-500">
              Status
            </span>
            <select
              value={filters.status}
              onChange={(event) => setFilter('status', event.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[var(--color-cerulean-500)] focus:ring-4 focus:ring-[var(--color-cerulean-50)]"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          {partyFilter}

          <label className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-normal text-slate-500">
              Tanggal Awal
            </span>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(event) => setFilter('dateFrom', event.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[var(--color-cerulean-500)] focus:ring-4 focus:ring-[var(--color-cerulean-50)]"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-normal text-slate-500">
              Tanggal Akhir
            </span>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(event) => setFilter('dateTo', event.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[var(--color-cerulean-500)] focus:ring-4 focus:ring-[var(--color-cerulean-50)]"
            />
          </label>

          {onApplyFilters ? (
            <button
              type="button"
              onClick={onApplyFilters}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 md:col-start-4"
            >
              Apply
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
