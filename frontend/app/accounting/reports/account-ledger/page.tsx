'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { DataTable } from '@/components/ui/DataTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { PageHeader } from '@/components/ui/PageHeader';
import { AccountingPageGate } from '@/features/accounting/AccountingPageGate';
import { listChartOfAccounts } from '@/features/accounting/chart-of-accounts/api';
import { listMasterData } from '@/features/accounting/master-data/api';
import { getReport, type ReportResult } from '@/features/accounting/reports/api';
import {
  defaultReportFilters,
  ReportFilters,
  type CommonReportFilterState,
} from '@/features/accounting/reports/ReportFilters';
import { getApiErrorMessage } from '@/lib/api';
import { formatCurrency } from '@/lib/formatters';
import type { ChartOfAccount, Department, Project } from '@/types/accounting';

export default function AccountLedgerReportPage() {
  const [filters, setFilters] = useState<CommonReportFilterState>(() => ({
    ...defaultReportFilters(),
    account_id: typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get('account_id') ?? '',
    start_date:
      typeof window === 'undefined'
        ? defaultReportFilters().start_date
        : new URLSearchParams(window.location.search).get('start_date') ?? defaultReportFilters().start_date,
    end_date:
      typeof window === 'undefined'
        ? defaultReportFilters().end_date
        : new URLSearchParams(window.location.search).get('end_date') ?? defaultReportFilters().end_date,
  }));
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [report, setReport] = useState<ReportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const [accountRes, departmentRes, projectRes] = await Promise.all([
        accounts.length ? Promise.resolve({ data: accounts }) : listChartOfAccounts(),
        departments.length ? Promise.resolve({ data: departments }) : listMasterData('/master-data/departments'),
        projects.length ? Promise.resolve({ data: projects }) : listMasterData('/master-data/projects'),
      ]);
      setAccounts(accountRes.data as ChartOfAccount[]);
      setDepartments(departmentRes.data as Department[]);
      setProjects(projectRes.data as Project[]);

      if (filters.account_id) {
        const reportRes = await getReport(`/reports/account-ledger/${filters.account_id}`, {
          start_date: filters.start_date,
          end_date: filters.end_date,
          department_id: filters.department_id,
          project_id: filters.project_id,
          include_zero_balance: true,
        });
        setReport(reportRes.data);
      } else {
        setReport(null);
      }
    } catch (event) {
      setError(getApiErrorMessage(event));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    queueMicrotask(() => {
      void loadData();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lines = (report?.lines as Array<Record<string, unknown>> | undefined) ?? [];
  const opening = report?.opening_balance as Record<string, unknown> | undefined;
  const period = report?.period_totals as Record<string, unknown> | undefined;

  return (
    <AppShell>
      <AccountingPageGate permission="reports.view">
        <PageHeader
          title="Account Ledger Detail"
          description="Detailed posted movements and running balance for one account."
        />

        <ReportFilters
          filters={filters}
          onChange={setFilters}
          onApply={loadData}
          accounts={accounts}
          departments={departments}
          projects={projects}
          showAccount
          showZeroBalance={false}
        />

        {report ? (
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <Metric label="Opening" value={formatCurrency(Number(opening?.balance ?? 0))} />
            <Metric label="Period Debit" value={formatCurrency(Number(period?.debit ?? 0))} />
            <Metric label="Period Credit" value={formatCurrency(Number(period?.credit ?? 0))} />
            <Metric label="Ending" value={formatCurrency(Number(report.ending_balance ?? 0))} />
          </div>
        ) : null}

        <div className="mt-6">
          {loading ? (
            <LoadingState title="Loading account ledger" />
          ) : error ? (
            <ErrorState message={error} />
          ) : !filters.account_id ? (
            <EmptyState title="Choose an account" description="Select an account and apply filters to load detail." />
          ) : lines.length === 0 ? (
            <EmptyState title="No account ledger lines found" />
          ) : (
            <DataTable columns={['Date', 'Journal', 'Description', 'Debit', 'Credit', 'Running Balance', 'Dimension']}>
              {lines.map((line, index) => (
                <tr key={index} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{String(line.journal_date ?? '-')}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <Link className="font-medium text-slate-900 hover:underline" href={`/accounting/journals/${line.journal_entry_id}`}>
                      {String(line.journal_number ?? '-')}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{String(line.description ?? '-')}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(Number(line.debit ?? 0))}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(Number(line.credit ?? 0))}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatCurrency(Number(line.running_balance ?? 0))}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {[line.department_name, line.project_name].filter(Boolean).join(' / ') || '-'}
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-2 font-semibold text-slate-950">{value}</div>
    </div>
  );
}
