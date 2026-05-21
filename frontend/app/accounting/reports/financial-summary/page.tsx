'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
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

export default function FinancialSummaryReportPage() {
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
        getReport('/reports/financial-summary', {
          start_date: filters.start_date,
          end_date: filters.end_date,
          as_of_date: filters.as_of_date,
          department_id: filters.department_id,
          project_id: filters.project_id,
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

  const profitLoss = (report?.profit_loss as Record<string, unknown> | undefined) ?? {};
  const balanceSheet = (report?.balance_sheet as Record<string, unknown> | undefined) ?? {};
  const cashFlow = (report?.cash_flow as Record<string, unknown> | undefined) ?? {};

  return (
    <AppShell>
      <AccountingPageGate permission="reports.view">
        <PageHeader title="Financial Summary" description="Cross-statement consistency snapshot." />
        <ReportFilters filters={filters} onChange={setFilters} onApply={loadReport} departments={departments} projects={projects} showAsOfDate />

        <div className="mt-6">
          {loading ? (
            <LoadingState title="Loading financial summary" />
          ) : error ? (
            <ErrorState message={error} />
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              <MetricCard label="Net Profit / Loss" value={formatCurrency(Number(profitLoss.net_profit_or_loss ?? 0))} />
              <MetricCard label="Total Assets" value={formatCurrency(Number(balanceSheet.total_assets ?? 0))} />
              <MetricCard label="Total Liabilities" value={formatCurrency(Number(balanceSheet.total_liabilities ?? 0))} />
              <MetricCard label="Total Equity" value={formatCurrency(Number(balanceSheet.total_equity ?? 0))} />
              <MetricCard label="Opening Cash" value={formatCurrency(Number(cashFlow.opening_cash_balance ?? 0))} />
              <MetricCard label="Ending Cash" value={formatCurrency(Number(cashFlow.ending_cash_balance ?? 0))} />
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-xs text-slate-500">Balance Sheet</div>
                <div className="mt-2">
                  <StatusBadge status={balanceSheet.is_balanced ? 'Balanced' : 'Not Balanced'} tone={balanceSheet.is_balanced ? 'success' : 'danger'} />
                </div>
              </div>
            </div>
          )}
        </div>
      </AccountingPageGate>
    </AppShell>
  );
}
