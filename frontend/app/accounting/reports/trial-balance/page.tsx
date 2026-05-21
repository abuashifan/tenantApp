'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { DataTable } from '@/components/ui/DataTable';
import { EmptyState } from '@/components/ui/EmptyState';
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
import { getApiErrorMessage } from '@/lib/api';
import { formatAccountingStatus, formatCurrency } from '@/lib/formatters';
import type { Department, Project } from '@/types/accounting';

export default function TrialBalanceReportPage() {
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
        getReport('/reports/trial-balance', {
          start_date: filters.start_date,
          end_date: filters.end_date,
          department_id: filters.department_id,
          project_id: filters.project_id,
          include_zero_balance: filters.include_zero_balance,
          account_type: filters.account_type,
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

  const rows = (report?.accounts as Array<Record<string, unknown>> | undefined) ?? [];
  const totals = report?.totals ?? {};

  return (
    <AppShell>
      <AccountingPageGate permission="reports.view">
        <PageHeader
          title="Trial Balance"
          description="Opening, period, and ending debit/credit balances for posted journal data."
        />

        <ReportFilters
          filters={filters}
          onChange={setFilters}
          onApply={loadReport}
          departments={departments}
          projects={projects}
          showZeroBalance
          showAccountType
        />

        {report ? (
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <Metric label="Ending Debit" value={formatCurrency(Number(totals.ending_debit ?? 0))} />
            <Metric label="Ending Credit" value={formatCurrency(Number(totals.ending_credit ?? 0))} />
            <Metric label="Difference" value={formatCurrency(Number(totals.difference ?? 0))} />
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-xs text-slate-500">Balance Check</div>
              <div className="mt-2">
                <StatusBadge
                  status={totals.is_balanced ? 'Balanced' : 'Not Balanced'}
                  tone={totals.is_balanced ? 'success' : 'danger'}
                />
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-6">
          {loading ? (
            <LoadingState title="Loading trial balance" />
          ) : error ? (
            <ErrorState message={error} />
          ) : rows.length === 0 ? (
            <EmptyState title="No trial balance rows found" />
          ) : (
            <DataTable columns={['Account', 'Type', 'Opening Dr', 'Opening Cr', 'Period Dr', 'Period Cr', 'Ending Dr', 'Ending Cr']}>
              {rows.map((row, index) => (
                <tr key={index} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {String(row.account_code ?? '')} - {String(row.account_name ?? '')}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {formatAccountingStatus(String(row.account_type ?? '-'))}
                  </td>
                  <td className="px-4 py-3 text-right">{formatCurrency(Number(row.opening_debit ?? 0))}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(Number(row.opening_credit ?? 0))}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(Number(row.period_debit ?? 0))}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(Number(row.period_credit ?? 0))}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatCurrency(Number(row.ending_debit ?? 0))}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatCurrency(Number(row.ending_credit ?? 0))}</td>
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
