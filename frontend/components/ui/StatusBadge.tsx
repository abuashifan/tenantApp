type StatusBadgeProps = {
  status: string;
  tone?: 'default' | 'success' | 'warning' | 'danger' | 'muted';
};

const toneClass: Record<NonNullable<StatusBadgeProps['tone']>, string> = {
  default: 'border-blue-200 bg-blue-50 text-blue-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  danger: 'border-red-200 bg-red-50 text-red-700',
  muted: 'border-slate-200 bg-slate-50 text-slate-600',
};

export function StatusBadge({ status, tone = 'default' }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${toneClass[tone]}`}
    >
      {status}
    </span>
  );
}

