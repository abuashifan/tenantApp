'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { WorkspaceColumn, WorkspaceFilterState } from '@/components/workspace';
import {
  SalesDocumentListWorkspace,
  toWorkspaceStatusOptions,
} from '@/features/sales/components/SalesDocumentListWorkspace';
import { SalesStatusBadge } from '@/features/sales/components/SalesStatusBadge';
import { customerName, salesDocumentDate, salesDocumentNumber } from '@/features/sales/documents/documentHelpers';
import type { CustomerDeposit } from '@/features/sales/types';
import { getApiErrorMessage } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { listCustomerDeposits } from './api';

const statuses = ['draft', 'posted', 'partially_allocated', 'fully_allocated', 'refunded', 'void'];

export function CustomerDepositList() {
  const [rows, setRows] = useState<CustomerDeposit[]>([]);
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
      const response = await listCustomerDeposits({
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

  const columns = useMemo<WorkspaceColumn<CustomerDeposit>[]>(
    () => [
      {
        key: 'deposit',
        label: 'Deposit',
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
        render: (row) => formatDate(row.deposit_date),
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
        widthClassName: 'min-w-[170px]',
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
        key: 'remaining',
        label: 'Remaining',
        align: 'right',
        widthClassName: 'min-w-[150px]',
        sortable: true,
        sortValue: (row) => Number(row.remaining_amount ?? 0),
        render: (row) => (
          <p className="font-bold text-slate-950">{formatCurrency(row.remaining_amount ?? 0)}</p>
        ),
      },
    ],
    [],
  );

  return (
    <SalesDocumentListWorkspace
      title="Customer Deposits"
      description="Track customer down payments and remaining deposit balances. This is not a general Cash Bank UI."
      permission="sales.deposits.view"
      createPermission="sales.deposits.create"
      createHref="/sales/deposits/new"
      detailHref={(row) => `/sales/deposits/${row.id}`}
      documentLabel="Customer Deposit"
      newButtonLabel="New Deposit"
      rows={rows}
      columns={columns}
      filters={filters}
      statusOptions={toWorkspaceStatusOptions(statuses)}
      loading={loading}
      error={error}
      emptyTitle="No customer deposits found"
      emptyDescription="Create a deposit or adjust filters."
      searchPlaceholder="Cari nomor deposit, customer, source, atau status..."
      onApplyFilters={load}
      onFilterChange={setFilters}
    />
  );
}
