'use client';

import { Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  DocumentListWorkspace,
  type WorkspaceColumn,
  type WorkspaceFilterState,
  type WorkspaceRowAction,
  type WorkspaceSelectOption,
} from '@/components/workspace';
import { SalesPageGate } from '@/features/sales/SalesPageGate';
import { customerName, salesDocumentDate, salesDocumentNumber } from '@/features/sales/documents/documentHelpers';
import type { SalesDocument } from '@/features/sales/types';
import { getStoredPermissions, hasPermission } from '@/lib/permissions';

type SalesDocumentListWorkspaceProps<T extends SalesDocument> = {
  title: string;
  description: string;
  permission: string;
  createPermission: string;
  createHref: string;
  detailHref: (row: T) => string;
  documentLabel: string;
  newButtonLabel: string;
  rows: T[];
  columns: WorkspaceColumn<T>[];
  filters: WorkspaceFilterState;
  statusOptions: WorkspaceSelectOption[];
  loading: boolean;
  error: string | null;
  emptyTitle: string;
  emptyDescription: string;
  searchPlaceholder: string;
  onApplyFilters: () => void;
  onFilterChange: (filters: WorkspaceFilterState) => void;
};

export function SalesDocumentListWorkspace<T extends SalesDocument>({
  title,
  description,
  permission,
  createPermission,
  createHref,
  detailHref,
  documentLabel,
  newButtonLabel,
  rows,
  columns,
  filters,
  statusOptions,
  loading,
  error,
  emptyTitle,
  emptyDescription,
  searchPlaceholder,
  onApplyFilters,
  onFilterChange,
}: SalesDocumentListWorkspaceProps<T>) {
  const router = useRouter();
  const canCreate = hasPermission(getStoredPermissions(), createPermission);

  const rowActions = useMemo<WorkspaceRowAction<T>[]>(
    () => [
      {
        key: 'view',
        label: 'View Detail',
        icon: <Eye className="h-4 w-4 text-slate-400" />,
        href: detailHref,
      },
    ],
    [detailHref],
  );

  return (
    <AppShell>
      <SalesPageGate permission={permission}>
        <PageHeader title={title} description={description} />
        <div className="mt-6">
          <DocumentListWorkspace
            documentLabel={documentLabel}
            newButtonLabel={canCreate ? newButtonLabel : undefined}
            rows={rows}
            columns={columns}
            filters={filters}
            statusOptions={statusOptions}
            loading={loading}
            error={error}
            emptyTitle={emptyTitle}
            emptyDescription={emptyDescription}
            searchPlaceholder={searchPlaceholder}
            partyFilterLabel="Customer"
            rowActions={rowActions}
            getSearchText={(row) =>
              [
                salesDocumentNumber(row),
                customerName(row),
                customerCode(row),
                row.source_number,
                row.source_type,
                row.status,
              ]
                .filter(Boolean)
                .join(' ')
            }
            getStatus={(row) => String(row.status ?? 'draft')}
            getDate={salesDocumentDate}
            getPartyName={customerName}
            onCreate={canCreate ? () => router.push(createHref) : undefined}
            onApplyFilters={onApplyFilters}
            onFilterChange={onFilterChange}
          />
        </div>
      </SalesPageGate>
    </AppShell>
  );
}

export function toWorkspaceStatusOptions(statuses: string[]): WorkspaceSelectOption[] {
  return [
    { label: 'All Status', value: 'all' },
    ...statuses.map((status) => ({ label: status, value: status })),
  ];
}

function customerCode(row: SalesDocument): string | null {
  const customer = row.customer as { contact_code?: string | null } | undefined;
  return customer?.contact_code ?? null;
}
