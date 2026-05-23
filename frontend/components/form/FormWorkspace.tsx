import type { ReactNode } from 'react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { FormActionBar } from './FormActionBar';
import type { FormAction } from './types';

type FormWorkspaceProps = {
  title: string;
  subtitle?: string;
  status?: string;
  statusTone?: 'default' | 'success' | 'warning' | 'danger' | 'muted';
  dirty?: boolean;
  loading?: boolean;
  actions?: FormAction[];
  children: ReactNode;
};

export function FormWorkspace({
  title,
  subtitle,
  status,
  statusTone,
  dirty = false,
  loading = false,
  actions = [],
  children,
}: FormWorkspaceProps) {
  return (
    <div className="h-[calc(100vh-9rem)] min-h-[640px] overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold text-slate-950">{title}</h2>
              {status ? <StatusBadge status={status} tone={statusTone} /> : null}
              {dirty ? (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">
                  Unsaved changes
                </span>
              ) : null}
            </div>
            {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
          </div>
          {actions.length > 0 ? <FormActionBar actions={actions} loading={loading} /> : null}
        </div>
        <div className="min-h-0 flex-1 overflow-auto bg-slate-50/50 p-5">{children}</div>
      </div>
    </div>
  );
}

