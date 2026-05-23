'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { WorkspaceColumn, WorkspaceFilterState } from '@/components/workspace';
import {
  SalesDocumentListWorkspace,
  toWorkspaceStatusOptions,
} from '@/features/sales/components/SalesDocumentListWorkspace';
import { SalesStatusBadge } from '@/features/sales/components/SalesStatusBadge';
import { customerName, salesDocumentDate, salesDocumentNumber } from '@/features/sales/documents/documentHelpers';
import type { ProformaInvoice } from '@/features/sales/types';
import { getApiErrorMessage } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { listProformas } from './api';

const statuses = ['draft', 'issued', 'accepted', 'converted', 'cancelled'];

export function ProformaList() {
  const [documents, setDocuments] = useState<ProformaInvoice[]>([]);
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
      const response = await listProformas({
        status: filters.status === 'all' ? undefined : filters.status,
      });
      setDocuments(response.data ?? []);
    } catch (event) {
      setError(getApiErrorMessage(event));
    } finally {
      setLoading(false);
    }
  }, [filters.status]);

  useEffect(() => {
    queueMicrotask(() => void load());
  }, [load]);

  const columns = useMemo<WorkspaceColumn<ProformaInvoice>[]>(
    () => [
      {
        key: 'proforma',
        label: 'Proforma',
        widthClassName: 'min-w-[190px]',
        sortable: true,
        sortValue: salesDocumentNumber,
        render: (document) => (
          <div>
            <p className="font-bold text-slate-950">{salesDocumentNumber(document)}</p>
            <p className="mt-1 text-xs text-slate-400">
              Valid until {document.valid_until ? formatDate(document.valid_until) : '-'}
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
        render: (document) => formatDate(salesDocumentDate(document)),
      },
      {
        key: 'customer',
        label: 'Customer',
        widthClassName: 'min-w-[240px]',
        sortable: true,
        sortValue: customerName,
        render: (document) => customerName(document),
      },
      {
        key: 'status',
        label: 'Status',
        widthClassName: 'min-w-[150px]',
        sortable: true,
        sortValue: (document) => String(document.status ?? 'draft'),
        render: (document) => <SalesStatusBadge status={document.status ?? 'draft'} />,
      },
      {
        key: 'grand_total',
        label: 'Grand Total',
        align: 'right',
        widthClassName: 'min-w-[150px]',
        sortable: true,
        sortValue: (document) => Number(document.grand_total ?? 0),
        render: (document) => (
          <p className="font-bold text-slate-950">{formatCurrency(document.grand_total ?? 0)}</p>
        ),
      },
    ],
    [],
  );

  return (
    <SalesDocumentListWorkspace
      title="Proforma Invoices"
      description="Non-accounting proforma documents with issue, accept, cancel, and invoice conversion workflow."
      permission="sales.proformas.view"
      createPermission="sales.proformas.create"
      createHref="/sales/proformas/new"
      detailHref={(document) => `/sales/proformas/${document.id}`}
      documentLabel="Proforma Invoice"
      newButtonLabel="New Proforma"
      rows={documents}
      columns={columns}
      filters={filters}
      statusOptions={toWorkspaceStatusOptions(statuses)}
      loading={loading}
      error={error}
      emptyTitle="No proformas found"
      emptyDescription="Create a proforma or adjust filters."
      searchPlaceholder="Cari nomor proforma, customer, source, atau status..."
      onApplyFilters={load}
      onFilterChange={setFilters}
    />
  );
}
