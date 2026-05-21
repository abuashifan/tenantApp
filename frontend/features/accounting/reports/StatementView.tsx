import Link from 'next/link';
import { DataTable } from '@/components/ui/DataTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatAccountingStatus, formatCurrency } from '@/lib/formatters';

export function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-2 font-semibold text-slate-950">{value}</div>
    </div>
  );
}

export function SectionTables({ sections }: { sections: Array<Record<string, unknown>> }) {
  if (sections.length === 0) return <EmptyState title="No report sections found" />;

  return (
    <div className="space-y-6">
      {sections.map((section) => {
        const accounts = (section.accounts as Array<Record<string, unknown>> | undefined) ?? [];

        return (
          <div key={String(section.key)} className="space-y-3">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-base font-semibold text-slate-950">
                {String(section.label ?? section.key)}
              </h2>
              <div className="text-sm font-semibold text-slate-950">
                Total: {formatCurrency(Number(section.total ?? 0))}
              </div>
            </div>
            {accounts.length === 0 ? (
              <EmptyState title="No accounts in this section" />
            ) : (
              <DataTable columns={['Account', 'Type', 'Debit', 'Credit', 'Amount', 'Detail']}>
                {accounts.map((account, index) => (
                  <tr key={`${section.key}-${index}`} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {String(account.account_code ?? '')} {account.account_code ? '-' : ''}{' '}
                      {String(account.account_name ?? '')}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {formatAccountingStatus(String(account.account_type ?? '-'))}
                    </td>
                    <td className="px-4 py-3 text-right">{formatCurrency(Number(account.debit ?? 0))}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(Number(account.credit ?? 0))}</td>
                    <td className="px-4 py-3 text-right font-semibold">{formatCurrency(Number(account.amount ?? 0))}</td>
                    <td className="px-4 py-3 text-right">
                      {account.account_id ? (
                        <Link
                          href={`/accounting/reports/account-ledger?account_id=${account.account_id}`}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Ledger
                        </Link>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </DataTable>
            )}
          </div>
        );
      })}
    </div>
  );
}
