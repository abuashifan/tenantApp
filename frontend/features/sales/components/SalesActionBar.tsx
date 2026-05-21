'use client';

import { PermissionGuard } from '@/components/ui/PermissionGuard';

export type SalesAction = {
  key: string;
  label: string;
  permission: string;
  danger?: boolean;
  confirm?: string;
  disabled?: boolean;
  onClick: () => Promise<void> | void;
};

type SalesActionBarProps = {
  actions: SalesAction[];
};

export function SalesActionBar({ actions }: SalesActionBarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <PermissionGuard key={action.key} permission={action.permission}>
          <button
            type="button"
            disabled={action.disabled}
            onClick={() => {
              if (action.confirm && !window.confirm(action.confirm)) return;
              void action.onClick();
            }}
            className={`rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50 ${
              action.danger
                ? 'border border-red-200 text-red-700 hover:bg-red-50'
                : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {action.label}
          </button>
        </PermissionGuard>
      ))}
    </div>
  );
}
