import { AppShell } from '@/components/layout/AppShell';

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Active Company</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">
            Not selected yet
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Database Mode</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">
            SQLite per company
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Phase</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">Phase 0</p>
        </div>
      </div>
    </AppShell>
  );
}
