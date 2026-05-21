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
import { MetricCard, SectionTables } from '@/features/accounting/reports/StatementView';
import { getApiErrorMessage } from '@/lib/api';
import { formatCurrency } from '@/lib/formatters';
import type { Department, Project } from '@/types/accounting';

export default function BalanceSheetReportPage() {
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
        getReport('/reports/balance-sheet', {
          as_of_date: filters.as_of_date,
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
        <PageHeader title="Balance Sheet" description="Assets, liabilities, equity, and balance check." />
        <ReportFilters filters={filters} onChange={setFilters} onApply={loadReport} departments={departments} projects={projects} showDateRange={false} showAsOfDate showZeroBalance />

        {report ? (
          <div className="mt-6 grid gap-4 md:grid-cols-5">
            <MetricCard label="Assets" value={formatCurrency(Number(totals.total_assets ?? 0))} />
            <MetricCard label="Liabilities" value={formatCurrency(Number(totals.total_liabilities ?? 0))} />
            <MetricCard label="Equity" value={formatCurrency(Number(totals.total_equity ?? 0))} />
            <MetricCard label="Difference" value={formatCurrency(Number(totals.difference ?? 0))} />
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-xs text-slate-500">Balance Check</div>
              <div className="mt-2">
                <StatusBadge status={totals.is_balanced ? 'Balanced' : 'Not Balanced'} tone={totals.is_balanced ? 'success' : 'danger'} />
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-6">
          {loading ? (
            <LoadingState title="Loading balance sheet" />
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
