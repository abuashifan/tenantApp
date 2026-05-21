type LoadingStateProps = {
  title?: string;
  description?: string;
};

export function LoadingState({
  title = 'Loading',
  description = 'Please wait while the data is being prepared.',
}: LoadingStateProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-sm">
      <div className="h-2 w-24 rounded-full bg-slate-200" />
      <div className="mt-4 text-sm font-semibold text-slate-900">{title}</div>
      <div className="mt-1 text-sm text-slate-500">{description}</div>
    </div>
  );
}

