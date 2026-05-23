'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { WorkspaceColumn, WorkspaceFilterState } from '@/components/workspace';
import {
  SalesDocumentListWorkspace,
  toWorkspaceStatusOptions,
} from '@/features/sales/components/SalesDocumentListWorkspace';
import { SalesStatusBadge } from '@/features/sales/components/SalesStatusBadge';
import { customerName, salesDocumentDate, salesDocumentNumber } from '@/features/sales/documents/documentHelpers';
import type { SalesReturn } from '@/features/sales/types';
import { getApiErrorMessage } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { listSalesReturns } from './api';

const statuses = ['draft', 'approved', 'posted', 'void'];

export function SalesReturnList() {
  const [rows, setRows] = useState<SalesReturn[]>([]);
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
      const response = await listSalesReturns({
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

  const columns = useMemo<WorkspaceColumn<SalesReturn>[]>(
    () => [
      {
        key: 'return',
        label: 'Return',
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
        render: (row) => formatDate(row.return_date),
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
        sortValue: (row) => Number(row.grand_total ?? 0),
        render: (row) => (
          <p className="font-bold text-slate-950">{formatCurrency(row.grand_total ?? 0)}</p>
        ),
      },
    ],
    [],
  );

  return (
    <SalesDocumentListWorkspace
      title="Sales Returns"
      description="Manage return documents and AR impact without stock return movement UI."
      permission="sales.returns.view"
      createPermission="sales.returns.create"
      createHref="/sales/returns/new"
      detailHref={(row) => `/sales/returns/${row.id}`}
      documentLabel="Sales Return"
      newButtonLabel="New Sales Return"
      rows={rows}
      columns={columns}
      filters={filters}
      statusOptions={toWorkspaceStatusOptions(statuses)}
      loading={loading}
      error={error}
      emptyTitle="No sales returns found"
      emptyDescription="Create a return or convert from invoice/delivery."
      searchPlaceholder="Cari nomor return, customer, source, atau status..."
      onApplyFilters={load}
      onFilterChange={setFilters}
    />
  );
}
