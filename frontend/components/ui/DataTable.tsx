import type { ReactNode } from 'react';

type DataTableProps = {
  columns: string[];
  children: ReactNode;
};

export function DataTable({ columns, children }: DataTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-normal text-slate-500"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">{children}</tbody>
        </table>
      </div>
    </div>
  );
}
