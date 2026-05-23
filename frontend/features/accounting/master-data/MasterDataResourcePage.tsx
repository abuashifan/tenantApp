'use client';

import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  DocumentListWorkspace,
  type WorkspaceColumn,
  type WorkspaceFilterState,
  type WorkspaceRowAction,
} from '@/components/workspace';
import { AccountingPageGate } from '@/features/accounting/AccountingPageGate';
import { getApiErrorMessage } from '@/lib/api';
import { getStoredPermissions, hasPermission } from '@/lib/permissions';
import type { MasterDataRecord } from '@/types/accounting';
import type { MasterDataResource } from './config';
import {
  activateMasterData,
  deactivateMasterData,
  listMasterData,
} from './api';

type MasterDataResourcePageProps = {
  resource: MasterDataResource;
};

const masterDataStatusOptions = [
  { label: 'All Status', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

export function MasterDataResourcePage({ resource }: MasterDataResourcePageProps) {
  const [items, setItems] = useState<MasterDataRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [filters, setFilters] = useState<WorkspaceFilterState>({
    search: '',
    status: 'all',
    party: 'all',
    dateFrom: '',
    dateTo: '',
  });

  async function loadItems() {
    try {
      setLoading(true);
      setError(null);
      const res = await listMasterData(resource.path);
      setItems(res.data ?? []);
    } catch (event) {
      setError(getApiErrorMessage(event));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    queueMicrotask(() => {
      void loadItems();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource.path]);

  async function toggleActive(item: MasterDataRecord) {
    try {
      setBusyId(item.id);
      setError(null);

      if (item.is_active) {
        await deactivateMasterData(resource.path, item.id);
      } else {
        await activateMasterData(resource.path, item.id);
      }

      await loadItems();
    } catch (event) {
      setError(getApiErrorMessage(event));
    } finally {
      setBusyId(null);
    }
  }

  const columns = useMemo<WorkspaceColumn<MasterDataRecord>[]>(
    () => [
      ...resource.columns.map<WorkspaceColumn<MasterDataRecord>>((column) => ({
        key: column.key,
        label: column.label,
        widthClassName: 'min-w-[140px]',
        sortable: true,
        sortValue: (item) => String(item[column.key] ?? ''),
        render: (item) =>
          column.render ? column.render(item) : formatCellValue(item[column.key]),
      })),
      {
        key: 'status',
        label: 'Status',
        widthClassName: 'min-w-[120px]',
        sortable: true,
        sortValue: (item) => (item.is_active === false ? 'inactive' : 'active'),
        render: (item) => (
          <StatusBadge
            status={item.is_active === false ? 'Inactive' : 'Active'}
            tone={item.is_active === false ? 'muted' : 'success'}
          />
        ),
      },
    ],
    [resource.columns],
  );

  const rowActions: WorkspaceRowAction<MasterDataRecord>[] = [
    {
      key: 'toggle-active',
      label: 'Activate / Deactivate',
      danger: true,
      disabled: (item) =>
        busyId === item.id ||
        !hasPermission(
          getStoredPermissions(),
          item.is_active === false
            ? resource.permissions.edit
            : resource.permissions.deactivate,
        ),
      onClick: toggleActive,
    },
  ];

  return (
    <AppShell>
      <AccountingPageGate permission={resource.permissions.view}>
        <PageHeader title={resource.title} description={resource.description} />

        <div className="mt-6">
          <DocumentListWorkspace
            documentLabel={resource.title}
            rows={items}
            columns={columns}
            filters={filters}
            statusOptions={masterDataStatusOptions}
            loading={loading}
            error={error}
            emptyTitle={`No ${resource.title.toLowerCase()} found`}
            emptyDescription="Create a record or adjust the search filter."
            searchPlaceholder={`Search ${resource.title.toLowerCase()}`}
            rowActions={rowActions}
            getSearchText={(item) =>
              resource.columns
                .map((column) => item[column.key])
                .concat([item.is_active === false ? 'inactive' : 'active'])
                .join(' ')
            }
            getStatus={(item) => (item.is_active === false ? 'inactive' : 'active')}
            getDate={() => ''}
            onApplyFilters={loadItems}
            onFilterChange={setFilters}
          />
        </div>
      </AccountingPageGate>
    </AppShell>
  );
}

function formatCellValue(value: unknown): string {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (value === null || value === undefined || value === '') return '-';
  return String(value);
}
