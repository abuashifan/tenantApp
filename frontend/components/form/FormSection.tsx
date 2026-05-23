import type { ReactNode } from 'react';

type FormSectionProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  compact?: boolean;
  errorSummary?: ReactNode;
  columns?: 1 | 2 | 3 | 4;
};

const gridClass: Record<NonNullable<FormSectionProps['columns']>, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-4',
};

export function FormSection({
  title,
  description,
  icon,
  children,
  compact = false,
  errorSummary,
  columns = 3,
}: FormSectionProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-start gap-3">
        {icon ? (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
            {icon}
          </div>
        ) : null}
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-slate-950">{title}</h2>
          {description ? <p className="mt-1 text-xs text-slate-500">{description}</p> : null}
        </div>
      </div>
      {errorSummary ? <div className="mb-4">{errorSummary}</div> : null}
      <div className={`grid ${compact ? 'gap-3' : 'gap-4'} ${gridClass[columns]}`}>{children}</div>
    </section>
  );
}
