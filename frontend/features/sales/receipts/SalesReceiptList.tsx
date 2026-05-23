'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { WorkspaceColumn, WorkspaceFilterState } from '@/components/workspace';
import {
  SalesDocumentListWorkspace,
  toWorkspaceStatusOptions,
} from '@/features/sales/components/SalesDocumentListWorkspace';
import { SalesStatusBadge } from '@/features/sales/components/SalesStatusBadge';
import { customerName, salesDocumentDate, salesDocumentNumber } from '@/features/sales/documents/documentHelpers';
import type { SalesReceipt } from '@/features/sales/types';
import { getApiErrorMessage } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { listSalesReceipts } from './api';

const statuses = ['draft', 'posted', 'void'];

export function SalesReceiptList() {
  const [rows, setRows] = useState<SalesReceipt[]>([]);
  const [filters, setFilters] = useState<WorkspaceFilterState>({
    search: '',
    status: 'all',
    party: 'all',
    dateFrom: '',
    dateTo: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await listSalesReceipts({
        status: filters.status === 'all' ? undefined : filters.status,
      });
      setRows(response.data ?? []);
    } catch (event) {
      setError(getApiErrorMessage(event));
    } finally {
      setLoading(false);
    }
  }, [filters.status]);

  useEffect(() => {
    queueMicrotask(() => void load());
  }, [load]);

  const columns = useMemo<WorkspaceColumn<SalesReceipt>[]>(
    () => [
      {
        key: 'receipt',
        label: 'Receipt',
        widthClassName: 'min-w-[190px]',
        sortable: true,
        sortValue: salesDocumentNumber,
        render: (row) => <p className="font-bold text-slate-950">{salesDocumentNumber(row)}</p>,
      },
      {
        key: 'date',
        label: 'Date',
        widthClassName: 'min-w-[140px]',
        sortable: true,
        sortValue: salesDocumentDate,
        render: (row) => formatDate(row.receipt_date),
      },
      {
        key: 'customer',
        label: 'Customer',
        widthClassName: 'min-w-[240px]',
        sortable: true,
        sortValue: customerName,
        render: (row) => customerName(row),
      },
      {
        key: 'status',
        label: 'Status',
        widthClassName: 'min-w-[140px]',
        sortable: true,
        sortValue: (row) => String(row.status ?? 'draft'),
        render: (row) => <SalesStatusBadge status={row.status ?? 'draft'} />,
      },
      {
        key: 'amount',
        label: 'Amount',
        align: 'right',
        widthClassName: 'min-w-[150px]',
        sortable: true,
        sortValue: (row) => Number(row.amount ?? 0),
        render: (row) => (
          <p className="font-bold text-slate-950">{formatCurrency(row.amount ?? 0)}</p>
        ),
      },
      {
        key: 'invoice',
        label: 'Invoice',
        widthClassName: 'min-w-[180px]',
        sortable: true,
        sortValue: (row) =>
          row.salesInvoice?.invoice_number ?? row.sales_invoice?.invoice_number ?? String(row.sales_invoice_id ?? ''),
        render: (row) =>
          row.salesInvoice?.invoice_number ?? row.sales_invoice?.invoice_number ?? row.sales_invoice_id ?? '-',
      },
    ],
    [],
  );

  return (
    <SalesDocumentListWorkspace
      title="Sales Receipts"
      description="Record customer invoice receipts with simple single-invoice allocation."
      permission="sales.receipts.view"
      createPermission="sales.receipts.create"
      createHref="/sales/receipts/new"
      detailHref={(row) => `/sales/receipts/${row.id}`}
      documentLabel="Sales Receipt"
      newButtonLabel="New Receipt"
      rows={rows}
      columns={columns}
      filters={filters}
      statusOptions={toWorkspaceStatusOptions(statuses)}
      loading={loading}
      error={error}
      emptyTitle="No sales receipts found"
      emptyDescription="Create a receipt or adjust filters."
      searchPlaceholder="Cari nomor receipt, customer, invoice, atau status..."
      onApplyFilters={load}
      onFilterChange={setFilters}
    />
  );
}
