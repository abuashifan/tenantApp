'use client';

import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import type { WorkspaceColumn, WorkspaceRow, WorkspaceRowAction, WorkspaceRowId } from './types';
import { WorkspaceActionMenu } from './WorkspaceActionMenu';

type WorkspaceTableProps<T extends WorkspaceRow> = {
  rows: T[];
  columns: WorkspaceColumn<T>[];
  rowActions: WorkspaceRowAction<T>[];
  selectedIds: WorkspaceRowId[];
  sortKey: string | null;
  sortDirection: 'asc' | 'desc';
  onToggleRow: (id: WorkspaceRowId) => void;
  onToggleAll: () => void;
  onToggleSort: (column: WorkspaceColumn<T>) => void;
};

export function WorkspaceTable<T extends WorkspaceRow>({
  rows,
  columns,
  rowActions,
  selectedIds,
  sortKey,
  sortDirection,
  onToggleRow,
  onToggleAll,
  onToggleSort,
}: WorkspaceTableProps<T>) {
  const allSelected = rows.length > 0 && rows.every((row) => selectedIds.includes(row.id));
  const alignClass = (align?: 'left' | 'center' | 'right') => {
    if (align === 'right') return 'text-right';
    if (align === 'center') return 'text-center';
    return 'text-left';
  };

  return (
    <table className="min-w-full divide-y divide-slate-100 text-sm">
      <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur">
        <tr>
          <th className="w-12 px-5 py-4 text-left">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={onToggleAll}
              className="h-4 w-4 rounded border-slate-300 text-[var(--color-cerulean-500)] focus:ring-[var(--color-cerulean-500)]"
            />
          </th>
          {columns.map((column) => {
            const isActiveSort = sortKey === column.key;
            const SortIcon = !isActiveSort
              ? ArrowUpDown
              : sortDirection === 'asc'
                ? ArrowUp
                : ArrowDown;

            return (
              <th
                key={column.key}
                className={`px-4 py-4 text-xs font-bold uppercase tracking-normal text-slate-400 ${alignClass(column.align)} ${column.widthClassName ?? ''}`}
              >
                <button
                  type="button"
                  onClick={() => onToggleSort(column)}
                  disabled={!column.sortable}
                  className={`inline-flex items-center gap-1.5 rounded-lg transition ${
                    column.align === 'right' ? 'justify-end' : 'justify-start'
                  } ${column.sortable ? 'hover:text-slate-700' : 'cursor-default'}`}
                >
                  <span>{column.label}</span>
                  {column.sortable ? <SortIcon className="h-3.5 w-3.5" /> : null}
                </button>
              </th>
            );
          })}
          {rowActions.length > 0 ? (
            <th className="w-14 px-5 py-4 text-right text-xs font-bold uppercase tracking-normal text-slate-400">
              Action
            </th>
          ) : null}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 bg-white">
        {rows.map((row) => (
          <tr key={row.id} className="group transition hover:bg-[var(--color-lime-cream-50)]/70">
            <td className="px-5 py-4 align-top">
              <input
                type="checkbox"
                checked={selectedIds.includes(row.id)}
                onChange={() => onToggleRow(row.id)}
                className="h-4 w-4 rounded border-slate-300 text-[var(--color-cerulean-500)] focus:ring-[var(--color-cerulean-500)]"
              />
            </td>
            {columns.map((column) => (
              <td
                key={column.key}
                className={`px-4 py-4 align-top ${alignClass(column.align)}`}
              >
                {column.render(row)}
              </td>
            ))}
            {rowActions.length > 0 ? (
              <td className="px-5 py-4 text-right align-top">
                <WorkspaceActionMenu row={row} actions={rowActions} />
              </td>
            ) : null}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
