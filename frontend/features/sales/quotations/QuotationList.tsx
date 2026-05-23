'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  SalesDocumentListWorkspace,
  toWorkspaceStatusOptions,
} from '@/features/sales/components/SalesDocumentListWorkspace';
import { SalesStatusBadge } from '@/features/sales/components/SalesStatusBadge';
import { customerName, salesDocumentDate, salesDocumentNumber } from '@/features/sales/documents/documentHelpers';
import type { SalesQuotation } from '@/features/sales/types';
import { getApiErrorMessage } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/formatters';
import type { WorkspaceColumn, WorkspaceFilterState } from '@/components/workspace';
import { listSalesQuotations } from './api';

const quotationStatuses = ['draft', 'sent', 'approved', 'accepted', 'rejected', 'converted', 'cancelled', 'expired'];

export function QuotationList() {
  const [quotations, setQuotations] = useState<SalesQuotation[]>([]);
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
      const response = await listSalesQuotations({
        status: filters.status === 'all' ? undefined : filters.status,
      });
      setQuotations(response.data ?? []);
    } catch (event) {
      setError(getApiErrorMessage(event));
    } finally {
      setLoading(false);
    }
  }, [filters.status]);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  const columns = useMemo<WorkspaceColumn<SalesQuotation>[]>(
    () => [
      {
        key: 'quotation',
        label: 'Quotation',
        widthClassName: 'min-w-[190px]',
        sortable: true,
        sortValue: salesDocumentNumber,
        render: (quotation) => (
          <div>
            <p className="font-bold text-slate-950">{salesDocumentNumber(quotation)}</p>
            <p className="mt-1 text-xs text-slate-400">
              Valid until {quotation.valid_until ? formatDate(quotation.valid_until) : '-'}
            </p>
          </div>
        ),
      },
      {
        key: 'date',
        label: 'Date',
        widthClassName: 'min-w-[140px]',
        sortable: true,
        sortValue: salesDocumentDate,
        render: (quotation) => formatDate(salesDocumentDate(quotation)),
      },
      {
        key: 'customer',
        label: 'Customer',
        widthClassName: 'min-w-[240px]',
        sortable: true,
        sortValue: customerName,
        render: (quotation) => customerName(quotation),
      },
      {
        key: 'status',
        label: 'Status',
        widthClassName: 'min-w-[150px]',
        sortable: true,
        sortValue: (quotation) => String(quotation.status ?? 'draft'),
        render: (quotation) => <SalesStatusBadge status={quotation.status ?? 'draft'} />,
      },
      {
        key: 'grand_total',
        label: 'Grand Total',
        align: 'right',
        widthClassName: 'min-w-[150px]',
        sortable: true,
        sortValue: (quotation) => Number(quotation.grand_total ?? 0),
        render: (quotation) => (
          <p className="font-bold text-slate-950">{formatCurrency(quotation.grand_total ?? 0)}</p>
        ),
      },
    ],
    [],
  );

  return (
    <SalesDocumentListWorkspace
      title="Sales Quotations"
      description="Create, send, approve, accept, reject, cancel, and convert customer quotations."
      permission="sales.quotations.view"
      createPermission="sales.quotations.create"
      createHref="/sales/quotations/new"
      detailHref={(quotation) => `/sales/quotations/${quotation.id}`}
      documentLabel="Sales Quotation"
      newButtonLabel="New Quotation"
      rows={quotations}
      columns={columns}
      filters={filters}
      statusOptions={toWorkspaceStatusOptions(quotationStatuses)}
      loading={loading}
      error={error}
      emptyTitle="No quotations found"
      emptyDescription="Create a quotation or adjust the filters."
      searchPlaceholder="Cari nomor quotation, customer, source, atau status..."
      onApplyFilters={load}
      onFilterChange={setFilters}
    />
  );
}
