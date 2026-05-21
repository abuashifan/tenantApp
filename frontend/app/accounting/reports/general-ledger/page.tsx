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

export default function GeneralLedgerReportPage() {
  const [filters, setFilters] = useState<CommonReportFilterState>(() => defaultReportFilters());
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [report, setReport] = useState<ReportResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadReport() {
    try {
      setLoading(true);
      setError(null);
      const [reportRes, accountRes, departmentRes, projectRes] = await Promise.all([
        getReport('/reports/general-ledger', {
          start_date: filters.start_date,
          end_date: filters.end_date,
          account_id: filters.account_id,
          department_id: filters.department_id,
          project_id: filters.project_id,
          include_zero_balance: filters.include_zero_balance,
        }),
        accounts.length ? Promise.resolve({ data: accounts }) : listChartOfAccounts(),
        departments.length ? Promise.resolve({ data: departments }) : listMasterData('/master-data/departments'),
        projects.length ? Promise.resolve({ data: projects }) : listMasterData('/master-data/projects'),
      ]);
      setReport(reportRes.data);
      setAccounts(accountRes.data as ChartOfAccount[]);
      setDepartments(departmentRes.data as Department[]);
      setProjects(projectRes.data as Project[]);
    } catch (event) {
      setError(getApiErrorMessage(event));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    queueMicrotask(() => {
      void loadReport();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = (report?.accounts as Array<Record<string, unknown>> | undefined) ?? [];
  const lines = (report?.lines as Array<Record<string, unknown>> | undefined) ?? [];

  return (
    <AppShell>
      <AccountingPageGate permission="reports.view">
        <PageHeader
          title="General Ledger"
          description="Posted and not obsolete journal movement by account, with optional account drilldown."
        />

        <ReportFilters
          filters={filters}
          onChange={setFilters}
          onApply={loadReport}
          accounts={accounts}
          departments={departments}
          projects={projects}
          showAccount
          showZeroBalance
        />

        <div className="mt-6 print:mt-4">
          {loading ? (
            <LoadingState title="Loading general ledger" />
          ) : error ? (
            <ErrorState message={error} />
          ) : filters.account_id && lines.length > 0 ? (
            <DataTable columns={['Date', 'Journal', 'Description', 'Debit', 'Credit', 'Running Balance']}>
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
                </tr>
              ))}
            </DataTable>
          ) : rows.length === 0 ? (
            <EmptyState title="No ledger rows found" />
          ) : (
            <DataTable columns={['Account', 'Opening', 'Period Debit', 'Period Credit', 'Ending', 'Detail']}>
              {rows.map((row, index) => {
                const account = row.account as Record<string, unknown> | undefined;
                const opening = row.opening_balance as Record<string, unknown> | undefined;
                const period = row.period_totals as Record<string, unknown> | undefined;
                return (
                  <tr key={index} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {String(account?.account_code ?? '')} - {String(account?.account_name ?? '')}
                    </td>
                    <td className="px-4 py-3 text-right">{formatCurrency(Number(opening?.balance ?? 0))}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(Number(period?.debit ?? 0))}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(Number(period?.credit ?? 0))}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(Number(row.ending_balance ?? 0))}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/accounting/reports/account-ledger?account_id=${account?.id ?? ''}&start_date=${filters.start_date}&end_date=${filters.end_date}`}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </DataTable>
          )}
        </div>
      </AccountingPageGate>
    </AppShell>
  );
}
