'use client';

import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { DataTable } from '@/components/ui/DataTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { PageHeader } from '@/components/ui/PageHeader';
import { PermissionGuard } from '@/components/ui/PermissionGuard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AccountingPageGate } from '@/features/accounting/AccountingPageGate';
import { getApiErrorMessage } from '@/lib/api';
import { formatAccountingStatus } from '@/lib/formatters';
import type { MasterDataRecord } from '@/types/accounting';
import type { MasterDataField, MasterDataResource } from './config';
import {
  activateMasterData,
  createMasterData,
  deactivateMasterData,
  listMasterData,
  updateMasterData,
} from './api';

type MasterDataResourcePageProps = {
  resource: MasterDataResource;
};

export function MasterDataResourcePage({ resource }: MasterDataResourcePageProps) {
  const [items, setItems] = useState<MasterDataRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<MasterDataRecord | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>(() => emptyForm(resource.fields));
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');

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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;

    return items.filter((item) =>
      resource.columns.some((column) =>
        String(item[column.key] ?? '').toLowerCase().includes(q),
      ),
    );
  }, [items, resource.columns, search]);

  function startCreate() {
    setEditing(null);
    setForm(emptyForm(resource.fields));
  }

  function startEdit(item: MasterDataRecord) {
    setEditing(item);
    setForm(formFromRecord(resource.fields, item));
  }

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setBusy(true);
      setError(null);
      const payload = normalizePayload(form);

      if (editing) {
        await updateMasterData(resource.path, editing.id, payload);
      } else {
        await createMasterData(resource.path, payload);
      }

      startCreate();
      await loadItems();
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(item: MasterDataRecord) {
    try {
      setBusy(true);
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
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <AccountingPageGate permission={resource.permissions.view}>
        <PageHeader
          title={resource.title}
          description={resource.description}
          actions={
            <PermissionGuard permission={resource.permissions.create}>
              <button
                type="button"
                onClick={startCreate}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                New
              </button>
            </PermissionGuard>
          }
        />

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <label>
                <span className="text-xs font-medium text-slate-500">Search</span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={`Search ${resource.title.toLowerCase()}`}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                />
              </label>
            </div>

            {loading ? (
              <LoadingState title={`Loading ${resource.title.toLowerCase()}`} />
            ) : error ? (
              <ErrorState message={error} />
            ) : filtered.length === 0 ? (
              <EmptyState
                title={`No ${resource.title.toLowerCase()} found`}
                description="Create a record or adjust the search filter."
              />
            ) : (
              <DataTable columns={[...resource.columns.map((column) => column.label), 'Status', 'Actions']}>
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    {resource.columns.map((column) => (
                      <td key={column.key} className="px-4 py-3 text-slate-700">
                        {column.render
                          ? column.render(item)
                          : formatCellValue(item[column.key])}
                      </td>
                    ))}
                    <td className="whitespace-nowrap px-4 py-3">
                      <StatusBadge
                        status={item.is_active === false ? 'Inactive' : 'Active'}
                        tone={item.is_active === false ? 'muted' : 'success'}
                      />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <PermissionGuard permission={resource.permissions.edit}>
                          <button
                            type="button"
                            onClick={() => startEdit(item)}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Edit
                          </button>
                        </PermissionGuard>
                        <PermissionGuard
                          permission={
                            item.is_active === false
                              ? resource.permissions.edit
                              : resource.permissions.deactivate
                          }
                        >
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => toggleActive(item)}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                          >
                            {item.is_active === false ? 'Activate' : 'Deactivate'}
                          </button>
                        </PermissionGuard>
                      </div>
                    </td>
                  </tr>
                ))}
              </DataTable>
            )}
          </div>

          <PermissionGuard permission={editing ? resource.permissions.edit : resource.permissions.create}>
            <form
              onSubmit={submitForm}
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-4">
                <h2 className="font-semibold text-slate-950">
                  {editing ? `Edit ${resource.title}` : `New ${resource.title}`}
                </h2>
                <p className="text-xs text-slate-500">
                  Submit changes to the tenant API using current company context.
                </p>
              </div>

              <div className="space-y-3">
                {resource.fields.map((field) => (
                  <FieldInput
                    key={field.key}
                    field={field}
                    value={form[field.key]}
                    onChange={(value) =>
                      setForm((current) => ({ ...current, [field.key]: value }))
                    }
                  />
                ))}
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  {busy ? 'Saving...' : editing ? 'Save Changes' : 'Create'}
                </button>
                {editing ? (
                  <button
                    type="button"
                    onClick={startCreate}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                ) : null}
              </div>
            </form>
          </PermissionGuard>
        </div>
      </AccountingPageGate>
    </AppShell>
  );
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: MasterDataField;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  if (field.type === 'checkbox') {
    return (
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(event.target.checked)}
          className="rounded border-slate-300"
        />
        {field.label}
      </label>
    );
  }

  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-500">
        {field.label}
        {field.required ? ' *' : ''}
      </span>
      {field.type === 'textarea' ? (
        <textarea
          value={String(value ?? '')}
          onChange={(event) => onChange(event.target.value)}
          rows={3}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
        />
      ) : field.type === 'select' ? (
        <select
          value={String(value ?? '')}
          onChange={(event) => onChange(event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
        >
          <option value="">-</option>
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {formatAccountingStatus(option.label)}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={field.type ?? 'text'}
          value={String(value ?? '')}
          onChange={(event) => onChange(event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
        />
      )}
    </label>
  );
}

function emptyForm(fields: MasterDataField[]): Record<string, unknown> {
  return Object.fromEntries(
    fields.map((field) => [field.key, field.type === 'checkbox' ? field.key === 'is_active' : '']),
  );
}

function formFromRecord(fields: MasterDataField[], item: MasterDataRecord): Record<string, unknown> {
  return Object.fromEntries(fields.map((field) => [field.key, item[field.key] ?? emptyValue(field)]));
}

function emptyValue(field: MasterDataField): unknown {
  return field.type === 'checkbox' ? false : '';
}

function normalizePayload(form: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(form).map(([key, value]) => {
      if (value === '') return [key, null];
      if (typeof value === 'string' && /^-?\d+(\.\d+)?$/.test(value) && key.endsWith('_id')) {
        return [key, Number(value)];
      }
      if (typeof value === 'string' && /^-?\d+(\.\d+)?$/.test(value) && key === 'precision') {
        return [key, Number(value)];
      }
      return [key, value];
    }),
  );
}

function formatCellValue(value: unknown): string {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (value === null || value === undefined || value === '') return '-';
  return String(value);
}
