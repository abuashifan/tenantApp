import type { ReactNode } from 'react';

type ErrorStateProps = {
  title?: string;
  message: string;
  action?: ReactNode;
};

export function ErrorState({
  title = 'Something went wrong',
  message,
  action,
}: ErrorStateProps) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-800 shadow-sm">
      <div className="font-semibold">{title}</div>
      <div className="mt-1">{message}</div>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
