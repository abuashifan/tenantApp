'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { DataTable } from '@/components/ui/DataTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { PageHeader } from '@/components/ui/PageHeader';
import { AccountingPageGate } from '@/features/accounting/AccountingPageGate';
import { listMasterData } from '@/features/accounting/master-data/api';
import { getReport, type ReportResult } from '@/features/accounting/reports/api';
import {
  defaultReportFilters,
  ReportFilters,
  type CommonReportFilterState,
} from '@/features/accounting/reports/ReportFilters';
import { MetricCard } from '@/features/accounting/reports/StatementView';
import { getApiErrorMessage } from '@/lib/api';
import { formatCurrency } from '@/lib/formatters';
import type { Department, Project } from '@/types/accounting';

export default function CashFlowReportPage() {
  const [filters, setFilters] = useState<CommonReportFilterState>(() => defaultReportFilters());
  const [departments, setDepartments] = useState<Department[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [report, setReport] = useState<ReportResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadReport() {
    try {
      setLoading(true);
      setError(null);
      const [reportRes, departmentRes, projectRes] = await Promise.all([
        getReport('/reports/cash-flow', {
          start_date: filters.start_date,
          end_date: filters.end_date,
          department_id: filters.department_id,
          project_id: filters.project_id,
          include_account_breakdown: true,
        }),
        departments.length ? Promise.resolve({ data: departments }) : listMasterData('/master-data/departments'),
        projects.length ? Promise.resolve({ data: projects }) : listMasterData('/master-data/projects'),
      ]);
      setReport(reportRes.data);
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

  const summary = (report?.summary as Record<string, unknown> | undefined) ?? {};
  const accounts = (report?.accounts as Array<Record<string, unknown>> | undefined) ?? [];

  return (
    <AppShell>
      <AccountingPageGate permission="reports.view">
        <PageHeader title="Cash Flow Statement" description="Simple cash flow based on cash/bank account movement." />
        <ReportFilters filters={filters} onChange={setFilters} onApply={loadReport} departments={departments} projects={projects} />

        {report ? (
          <div className="mt-6 grid gap-4 md:grid-cols-5">
            <MetricCard label="Opening Cash" value={formatCurrency(Number(summary.opening_cash_balance ?? 0))} />
            <MetricCard label="Cash In" value={formatCurrency(Number(summary.cash_in ?? 0))} />
            <MetricCard label="Cash Out" value={formatCurrency(Number(summary.cash_out ?? 0))} />
            <MetricCard label="Net Cash Flow" value={formatCurrency(Number(summary.net_cash_flow ?? 0))} />
            <MetricCard label="Ending Cash" value={formatCurrency(Number(summary.ending_cash_balance ?? 0))} />
          </div>
        ) : null}

        <div className="mt-6">
          {loading ? (
            <LoadingState title="Loading cash flow" />
          ) : error ? (
            <ErrorState message={error} />
          ) : accounts.length === 0 ? (
            <EmptyState title="No cash/bank accounts found" />
          ) : (
            <DataTable columns={['Account', 'Opening', 'Cash In', 'Cash Out', 'Net', 'Ending']}>
              {accounts.map((account, index) => (
                <tr key={index} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {String(account.account_code ?? '')} - {String(account.account_name ?? '')}
                  </td>
                  <td className="px-4 py-3 text-right">{formatCurrency(Number(account.opening_balance ?? 0))}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(Number(account.cash_in ?? 0))}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(Number(account.cash_out ?? 0))}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(Number(account.net_cash_flow ?? 0))}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatCurrency(Number(account.ending_balance ?? 0))}</td>
                </tr>
              ))}
            </DataTable>
          )}
        </div>
      </AccountingPageGate>
    </AppShell>
  );
}
