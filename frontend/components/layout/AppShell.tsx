type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div>
            <p className="text-sm text-slate-500">Accounting App</p>
            <h1 className="text-lg font-semibold text-slate-900">Dashboard</h1>
          </div>

          <div className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600">
            Company Switcher Later
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-6">{children}</div>
    </div>
  );
}
