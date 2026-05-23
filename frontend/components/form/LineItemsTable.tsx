import { Copy, Plus, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';

export type LineItemsColumn<T> = {
  key: string;
  label: string;
  widthClassName?: string;
  align?: 'left' | 'right' | 'center';
  render: (row: T, index: number) => ReactNode;
};

type LineItemsTableProps<T> = {
  title?: string;
  rows: T[];
  columns: LineItemsColumn<T>[];
  readonly?: boolean;
  addLabel?: string;
  onAdd?: () => void;
  onDuplicate?: (index: number) => void;
  onRemove?: (index: number) => void;
  getRowError?: (index: number) => string | undefined;
};

export function LineItemsTable<T>({
  title = 'Line Items',
  rows,
  columns,
  readonly = false,
  addLabel = 'Add Line',
  onAdd,
  onDuplicate,
  onRemove,
  getRowError,
}: LineItemsTableProps<T>) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-950">{title}</h2>
        {!readonly && onAdd ? (
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <Plus className="h-4 w-4" />
            {addLabel}
          </button>
        ) : null}
      </div>
      <div className="overflow-hidden rounded-lg border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className={`px-3 py-3 text-left text-xs font-semibold uppercase tracking-normal text-slate-500 ${
                      column.align === 'right'
                        ? 'text-right'
                        : column.align === 'center'
                          ? 'text-center'
                          : ''
                    } ${column.widthClassName ?? ''}`}
                  >
                    {column.label}
                  </th>
                ))}
                {!readonly && (onDuplicate || onRemove) ? (
                  <th className="w-20 px-3 py-3 text-right text-xs font-semibold uppercase tracking-normal text-slate-500">
                    Action
                  </th>
                ) : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {rows.map((row, index) => {
                const rowError = getRowError?.(index);
                return (
                  <tr key={index} className="align-top hover:bg-slate-50/60">
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`px-3 py-3 ${
                          column.align === 'right'
                            ? 'text-right'
                            : column.align === 'center'
                              ? 'text-center'
                              : ''
                        }`}
                      >
                        {column.render(row, index)}
                        {column.key === columns[0]?.key && rowError ? (
                          <p className="mt-1 text-xs font-medium text-red-600">{rowError}</p>
                        ) : null}
                      </td>
                    ))}
                    {!readonly && (onDuplicate || onRemove) ? (
                      <td className="px-3 py-3">
                        <div className="flex justify-end gap-1">
                          {onDuplicate ? (
                            <button
                              type="button"
                              onClick={() => onDuplicate(index)}
                              className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
                              aria-label="Duplicate line"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                          ) : null}
                          {onRemove ? (
                            <button
                              type="button"
                              onClick={() => onRemove(index)}
                              disabled={rows.length <= 1}
                              className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-700 disabled:opacity-40"
                              aria-label="Remove line"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          ) : null}
                        </div>
                      </td>
                    ) : null}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

