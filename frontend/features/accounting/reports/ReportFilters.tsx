'use client';

import type { ChartOfAccount, Department, Project } from '@/types/accounting';

export type CommonReportFilterState = {
  start_date: string;
  end_date: string;
  as_of_date: string;
  account_id: string;
  department_id: string;
  project_id: string;
  include_zero_balance: boolean;
  account_type: string;
};

type ReportFiltersProps = {
  filters: CommonReportFilterState;
  onChange: (filters: CommonReportFilterState) => void;
  onApply: () => void;
  accounts?: ChartOfAccount[];
  departments?: Department[];
  projects?: Project[];
  showAccount?: boolean;
  showDateRange?: boolean;
  showAsOfDate?: boolean;
  showZeroBalance?: boolean;
  showAccountType?: boolean;
};

export function ReportFilters({
  filters,
  onChange,
  onApply,
  accounts = [],
  departments = [],
  projects = [],
  showAccount,
  showDateRange = true,
  showAsOfDate,
  showZeroBalance,
  showAccountType,
}: ReportFiltersProps) {
  const setFilter = (key: keyof CommonReportFilterState, value: string | boolean) =>
    onChange({ ...filters, [key]: value });

  return (
    <div className="mt-6 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4">
      {showDateRange ? (
        <>
          <label>
            <span className="text-xs font-medium text-slate-500">Start Date</span>
            <input
              type="date"
              value={filters.start_date}
              onChange={(event) => setFilter('start_date', event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            />
          </label>
          <label>
            <span className="text-xs font-medium text-slate-500">End Date</span>
            <input
              type="date"
              value={filters.end_date}
              onChange={(event) => setFilter('end_date', event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            />
          </label>
        </>
      ) : null}

      {showAsOfDate ? (
        <label>
          <span className="text-xs font-medium text-slate-500">As Of Date</span>
          <input
            type="date"
            value={filters.as_of_date}
            onChange={(event) => setFilter('as_of_date', event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
          />
        </label>
      ) : null}

      {showAccount ? (
        <label className="md:col-span-2">
          <span className="text-xs font-medium text-slate-500">Account</span>
          <select
            value={filters.account_id}
            onChange={(event) => setFilter('account_id', event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
          >
            <option value="">All accounts</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.account_code} - {account.account_name}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {showAccountType ? (
        <label>
          <span className="text-xs font-medium text-slate-500">Account Type</span>
          <select
            value={filters.account_type}
            onChange={(event) => setFilter('account_type', event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
          >
            <option value="">All</option>
            {['asset', 'liability', 'equity', 'revenue', 'expense'].map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <label>
        <span className="text-xs font-medium text-slate-500">Department</span>
        <select
          value={filters.department_id}
          onChange={(event) => setFilter('department_id', event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
        >
          <option value="">All</option>
          {departments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.code} - {department.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span className="text-xs font-medium text-slate-500">Project</span>
        <select
          value={filters.project_id}
          onChange={(event) => setFilter('project_id', event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
        >
          <option value="">All</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.code} - {project.name}
            </option>
          ))}
        </select>
      </label>

      {showZeroBalance ? (
        <label className="flex items-end gap-2 pb-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={filters.include_zero_balance}
            onChange={(event) => setFilter('include_zero_balance', event.target.checked)}
            className="rounded border-slate-300"
          />
          Include zero balance
        </label>
      ) : null}

      <button
        type="button"
        onClick={onApply}
        className="self-end rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
      >
        Apply Filters
      </button>
    </div>
  );
}

export function defaultReportFilters(): CommonReportFilterState {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const start = `${now.getFullYear()}-01-01`;
  return {
    start_date: start,
    end_date: today,
    as_of_date: today,
    account_id: '',
    department_id: '',
    project_id: '',
    include_zero_balance: false,
    account_type: '',
  };
}
