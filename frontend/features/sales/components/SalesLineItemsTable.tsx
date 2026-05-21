import { DataTable } from '@/components/ui/DataTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, formatNumber } from '@/lib/formatters';
import type { SalesLineItem } from '../types';

type SalesLineItemsTableProps = {
  lines: SalesLineItem[];
};

export function SalesLineItemsTable({ lines }: SalesLineItemsTableProps) {
  if (lines.length === 0) {
    return <EmptyState title="No line items" description="Line item form will be added in the document subphase." />;
  }

  return (
    <DataTable columns={['Product', 'Description', 'Qty', 'Unit Price', 'Discount', 'Tax', 'Line Total']}>
      {lines.map((line, index) => (
        <tr key={index} className="hover:bg-slate-50">
          <td className="px-4 py-3 font-medium text-slate-900">{line.product_code ?? '-'}</td>
          <td className="px-4 py-3 text-slate-700">{line.description ?? '-'}</td>
          <td className="px-4 py-3 text-right">{formatNumber(Number(line.quantity ?? 0))}</td>
          <td className="px-4 py-3 text-right">{formatCurrency(Number(line.unit_price ?? 0))}</td>
          <td className="px-4 py-3 text-right">{formatCurrency(Number(line.discount_amount ?? 0))}</td>
          <td className="px-4 py-3 text-right">{formatCurrency(Number(line.tax_amount ?? 0))}</td>
          <td className="px-4 py-3 text-right font-semibold">{formatCurrency(Number(line.line_total ?? 0))}</td>
        </tr>
      ))}
    </DataTable>
  );
}
