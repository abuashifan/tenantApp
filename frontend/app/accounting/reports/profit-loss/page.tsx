'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
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
import { MetricCard, SectionTables } from '@/features/accounting/reports/StatementView';
import { getApiErrorMessage } from '@/lib/api';
import { formatCurrency } from '@/lib/formatters';
import type { Department, Project } from '@/types/accounting';

export default function ProfitLossReportPage() {
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
        getReport('/reports/profit-loss', {
          start_date: filters.start_date,
          end_date: filters.end_date,
          department_id: filters.department_id,
          project_id: filters.project_id,
          include_zero_balance: filters.include_zero_balance,
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

  const totals = report?.totals ?? {};

  return (
    <AppShell>
      <AccountingPageGate permission="reports.view">
        <PageHeader title="Profit & Loss" description="Revenue, expense, and net profit or loss statement." />
        <ReportFilters filters={filters} onChange={setFilters} onApply={loadReport} departments={departments} projects={projects} showZeroBalance />

        {report ? (
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <MetricCard label="Revenue" value={formatCurrency(Number(totals.total_revenue ?? 0))} />
            <MetricCard label="Expense" value={formatCurrency(Number(totals.total_expense ?? 0))} />
            <MetricCard label="Net Profit" value={formatCurrency(Number(totals.net_profit ?? 0))} />
            <MetricCard label="Net Loss" value={formatCurrency(Number(totals.net_loss ?? 0))} />
          </div>
        ) : null}

        <div className="mt-6">
          {loading ? (
            <LoadingState title="Loading profit and loss" />
          ) : error ? (
            <ErrorState message={error} />
          ) : (
            <SectionTables sections={(report?.sections as Array<Record<string, unknown>> | undefined) ?? []} />
          )}
        </div>
      </AccountingPageGate>
    </AppShell>
  );
}
