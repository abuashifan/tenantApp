'use client';

import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { AccountingPageGate } from '@/features/accounting/AccountingPageGate';

const reports = [
  {
    title: 'Profit & Loss',
    href: '/accounting/reports/profit-loss',
    description: 'Revenue, expenses, and net profit or loss for a date range.',
  },
  {
    title: 'Balance Sheet',
    href: '/accounting/reports/balance-sheet',
    description: 'Assets, liabilities, equity, and balance check as of one date.',
  },
  {
    title: 'Cash Flow',
    href: '/accounting/reports/cash-flow',
    description: 'Simple cash flow from cash/bank account movement.',
  },
  {
    title: 'Financial Summary',
    href: '/accounting/reports/financial-summary',
    description: 'Cross-statement summary for P&L, balance sheet, and cash flow.',
  },
];

export default function FinancialStatementsLandingPage() {
  return (
    <AppShell>
      <AccountingPageGate permission="reports.view">
        <PageHeader
          title="Financial Statements"
          description="Open core financial statement reports. Export and advanced analytics remain out of scope for Phase 13."
        />

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {reports.map((report) => (
            <Link
              key={report.href}
              href={report.href}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
            >
              <h2 className="font-semibold text-slate-950">{report.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{report.description}</p>
            </Link>
          ))}
        </div>
      </AccountingPageGate>
    </AppShell>
  );
}
