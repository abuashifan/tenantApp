'use client';

export type SalesFilterState = {
  search: string;
  status: string;
  date_from: string;
  date_to: string;
};

type SalesFiltersProps = {
  filters: SalesFilterState;
  onChange: (filters: SalesFilterState) => void;
  onApply: () => void;
  statuses?: string[];
};

export function SalesFilters({
  filters,
  onChange,
  onApply,
  statuses = ['draft', 'approved', 'posted', 'void', 'cancelled'],
}: SalesFiltersProps) {
  const setFilter = (key: keyof SalesFilterState, value: string) =>
    onChange({ ...filters, [key]: value });

  return (
    <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-5">
      <label className="md:col-span-2">
        <span className="text-xs font-medium text-slate-500">Search</span>
        <input
          value={filters.search}
          onChange={(event) => setFilter('search', event.target.value)}
          placeholder="Document number, customer, notes"
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
        />
      </label>
      <label>
        <span className="text-xs font-medium text-slate-500">Date From</span>
        <input
          type="date"
          value={filters.date_from}
          onChange={(event) => setFilter('date_from', event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
        />
      </label>
      <label>
        <span className="text-xs font-medium text-slate-500">Date To</span>
        <input
          type="date"
          value={filters.date_to}
          onChange={(event) => setFilter('date_to', event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
        />
      </label>
      <label>
        <span className="text-xs font-medium text-slate-500">Status</span>
        <select
          value={filters.status}
          onChange={(event) => setFilter('status', event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
        >
          <option value="">All</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        onClick={onApply}
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 md:col-start-5"
      >
        Apply
      </button>
    </div>
  );
}
