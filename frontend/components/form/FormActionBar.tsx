import type { FormAction } from './types';

type FormActionBarProps = {
  actions: FormAction[];
  loading?: boolean;
  align?: 'left' | 'right';
};

export function FormActionBar({ actions, loading = false, align = 'right' }: FormActionBarProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
      {actions.map((action) => (
        <button
          key={action.key}
          type={action.type ?? 'button'}
          onClick={action.onClick}
          disabled={loading || action.loading || action.disabled}
          className={actionClassName(action.variant ?? (action.danger ? 'danger' : 'secondary'))}
        >
          {action.icon}
          {action.loading ? 'Loading...' : action.label}
        </button>
      ))}
    </div>
  );
}

function actionClassName(variant: NonNullable<FormAction['variant']>): string {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60';
  if (variant === 'primary') return `${base} bg-slate-900 text-white hover:bg-slate-800`;
  if (variant === 'danger') return `${base} border border-red-200 text-red-700 hover:bg-red-50`;
  if (variant === 'ghost') return `${base} text-slate-600 hover:bg-slate-100`;
  return `${base} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50`;
}

