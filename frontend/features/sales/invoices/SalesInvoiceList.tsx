'use client';

import { Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  DocumentListWorkspace,
  type WorkspaceColumn,
  type WorkspaceFilterState,
  type WorkspaceRowAction,
  type WorkspaceSelectOption,
} from '@/components/workspace';
import { SalesStatusBadge } from '@/features/sales/components/SalesStatusBadge';
import { SalesPageGate } from '@/features/sales/SalesPageGate';
import { customerName, salesDocumentDate, salesDocumentNumber } from '@/features/sales/documents/documentHelpers';
import { getApiErrorMessage } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { getStoredPermissions, hasPermission } from '@/lib/permissions';
import type { SalesInvoice } from '@/features/sales/types';
import { listSalesInvoices } from './api';

const statuses = ['draft', 'approved', 'posted', 'partially_paid', 'paid', 'overdue', 'void'];
const statusOptions: WorkspaceSelectOption[] = [
  { label: 'All Status', value: 'all' },
  ...statuses.map((status) => ({ label: status, value: status })),
];

export function SalesInvoiceList() {
  const router = useRouter();
  const [documents, setDocuments] = useState<SalesInvoice[]>([]);
  const [filters, setFilters] = useState<WorkspaceFilterState>({
    search: '',
    status: 'all',
    party: 'all',
    dateFrom: '',
    dateTo: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canCreate = hasPermission(getStoredPermissions(), 'sales.invoices.create');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await listSalesInvoices({
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
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  const columns = useMemo<WorkspaceColumn<SalesInvoice>[]>(
    () => [
      {
        key: 'invoice',
        label: 'Invoice',
        widthClassName: 'min-w-[190px]',
        sortable: true,
        sortValue: salesDocumentNumber,
        render: (document) => (
          <div>
            <button
              type="button"
              onClick={() => router.push(`/sales/invoices/${document.id}`)}
              className="font-bold text-slate-950 transition hover:text-[var(--color-cerulean-500)]"
            >
              {salesDocumentNumber(document)}
            </button>
            <p className="mt-1 text-xs text-slate-400">
              Due {document.due_date ? formatDate(document.due_date) : '-'}
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
        render: (document) => (
          <div>
            <p className="font-semibold text-slate-800">
              {formatDate(salesDocumentDate(document))}
            </p>
            <p className="mt-1 text-xs text-slate-400">Invoice Date</p>
          </div>
        ),
      },
      {
        key: 'customer',
        label: 'Customer',
        widthClassName: 'min-w-[240px]',
        sortable: true,
        sortValue: customerName,
        render: (document) => (
          <div>
            <p className="font-semibold text-slate-800">{customerName(document)}</p>
            <p className="mt-1 text-xs text-slate-400">
              {document.customer?.contact_code ?? 'Customer'}
            </p>
          </div>
        ),
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
        key: 'source',
        label: 'Source',
        widthClassName: 'min-w-[180px]',
        sortable: true,
        sortValue: (document) => document.source_number ?? document.source_type ?? '',
        render: (document) => (
          <div>
            <p className="font-medium text-slate-700">
              {document.source_number ?? document.source_type ?? '-'}
            </p>
            <p className="mt-1 text-xs text-slate-400">Source document</p>
          </div>
        ),
      },
      {
        key: 'total',
        label: 'Total',
        align: 'right',
        widthClassName: 'min-w-[150px]',
        sortable: true,
        sortValue: (document) => Number(document.grand_total ?? 0),
        render: (document) => (
          <div>
            <p className="font-bold text-slate-950">
              {formatCurrency(document.grand_total ?? 0)}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Paid {formatCurrency(document.paid_amount ?? 0)}
            </p>
          </div>
        ),
      },
      {
        key: 'balance',
        label: 'Balance Due',
        align: 'right',
        widthClassName: 'min-w-[160px]',
        sortable: true,
        sortValue: (document) => Number(document.balance_due ?? document.grand_total ?? 0),
        render: (document) => {
          const balance = document.balance_due ?? document.grand_total ?? 0;
          return (
            <p
              className={
                Number(balance) > 0
                  ? 'font-bold text-rose-600'
                  : 'font-bold text-[var(--color-emerald-600)]'
              }
            >
              {formatCurrency(balance)}
            </p>
          );
        },
      },
    ],
    [router],
  );

  const rowActions = useMemo<WorkspaceRowAction<SalesInvoice>[]>(
    () => [
      {
        key: 'view',
        label: 'View Detail',
        icon: <Eye className="h-4 w-4 text-slate-400" />,
        href: (document) => `/sales/invoices/${document.id}`,
      },
    ],
    [],
  );

  return (
    <AppShell>
      <SalesPageGate permission="sales.invoices.view">
        <PageHeader
          title="Sales Invoices"
          description="Create, approve, post, void, and monitor AR invoice balances."
        />
        <div className="mt-6">
          <DocumentListWorkspace
            documentLabel="Sales Invoice"
            newButtonLabel={canCreate ? 'New Invoice' : undefined}
            rows={documents}
            columns={columns}
            filters={filters}
            statusOptions={statusOptions}
            loading={loading}
            error={error}
            emptyTitle="No sales invoices found"
            emptyDescription="Create an invoice or convert a source document."
            searchPlaceholder="Cari nomor invoice, customer, source, atau status..."
            partyFilterLabel="Customer"
            rowActions={rowActions}
            getSearchText={(document) =>
              [
                salesDocumentNumber(document),
                customerName(document),
                document.customer?.contact_code,
                document.source_number,
                document.source_type,
                document.status,
              ]
                .filter(Boolean)
                .join(' ')
            }
            getStatus={(document) => String(document.status ?? 'draft')}
            getDate={salesDocumentDate}
            getPartyName={customerName}
            onCreate={canCreate ? () => router.push('/sales/invoices/new') : undefined}
            onApplyFilters={load}
            onFilterChange={setFilters}
          />
        </div>
      </SalesPageGate>
    </AppShell>
  );
}
