'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { getSubmenuIcon } from '@/components/layout/navigation';
import { DataTable } from '@/components/ui/DataTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { PageHeader } from '@/components/ui/PageHeader';
import { PermissionGuard } from '@/components/ui/PermissionGuard';
import { listChartOfAccounts } from '@/features/accounting/chart-of-accounts/api';
import { listMasterData } from '@/features/accounting/master-data/api';
import { createCashIn, createCashOut, createReconciliation, createTransfer, getCashBankAccounts, getCashBankReports, getCashInDetail, getCashInList, getCashOutDetail, getCashOutList, getReconciliationDetail, getReconciliationList, getTransferDetail, getTransferList, markReconciliationLines, postCashIn, postCashOut, postTransfer, refreshReconciliationLines, voidCashIn, voidCashOut, voidTransfer } from '@/features/cash-bank/api/cashBankApi';
import { CashBankPageGate } from '@/features/cash-bank/CashBankPageGate';
import { CASH_BANK_NAV_ITEMS } from '@/features/cash-bank/navigation';
import { CashBankStatusBadge } from '@/features/cash-bank/components/CashBankPrimitives';
import { getApiErrorMessage } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { getStoredPermissions, hasPermission } from '@/lib/permissions';
import type { BankReconciliation, CashBankAccount, CashBankTransaction } from '@/types/cash-bank';

type Row = Record<string, unknown> & { id?: number };
type SelectRecord = Record<string, unknown> & { id: number };
type CashMode = 'cash-in' | 'cash-out' | 'transfers';

const MODULES = {
  'cash-in': { title: 'Cash In', singular: 'Cash In', create: 'cash_bank.create', post: 'cash_bank.post', void: 'cash_bank.void', path: '/cash-bank/cash-in' },
  'cash-out': { title: 'Cash Out', singular: 'Cash Out', create: 'cash_bank.create', post: 'cash_bank.post', void: 'cash_bank.void', path: '/cash-bank/cash-out' },
  transfers: { title: 'Bank Transfers', singular: 'Bank Transfer', create: 'cash_bank.transfer', post: 'cash_bank.post', void: 'cash_bank.void', path: '/cash-bank/transfers' },
};

export function CashBankWorkspace({ segments = [] }: { segments?: string[] }) {
  const [module, action, id] = segments;
  if (!module) return <CashBankLanding />;
  if (module === 'reports') return <CashBankReports />;
  if (module === 'reconciliation') return action === 'create' ? <ReconciliationForm /> : action ? <ReconciliationDetail id={action} /> : <ReconciliationList />;
  if (module === 'cash-in' || module === 'cash-out' || module === 'transfers') {
    if (action === 'create') return <TransactionForm mode={module} />;
    if (id === 'edit' && action) return <TransactionForm mode={module} id={action} />;
    if (action) return <TransactionDetail mode={module} id={action} />;
    return <TransactionList mode={module} />;
  }
  return <CashBankLanding />;
}

function CashBankLanding() {
  const permissions = getStoredPermissions();
  const visible = CASH_BANK_NAV_ITEMS.filter((item) => hasPermission(permissions, item.permission));
  return (
    <AppShell>
      <CashBankPageGate permission={CASH_BANK_NAV_ITEMS.map((item) => item.permission)}>
        <PageHeader title="Cash Bank" description="Cash Bank Frontend MVP for receipts, payments, transfers, reconciliation, and account statement reports." />
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((item) => {
            const ItemIcon = getSubmenuIcon(item.href, item.label);

            return (
              <Link key={item.href} href={item.href} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--erp-ocean-soft)] text-[var(--erp-ocean)]">
                    <ItemIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-slate-950">{item.label}</h2>
                    <p className="mt-2 text-sm text-slate-600">{item.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </CashBankPageGate>
    </AppShell>
  );
}

function TransactionList({ mode }: { mode: CashMode }) {
  const config = MODULES[mode];
  const [rows, setRows] = useState<CashBankTransaction[]>([]);
  const [filters, setFilters] = useState({ search: '', status: '', date_from: '', date_to: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = mode === 'cash-in' ? await getCashInList(filters) : mode === 'cash-out' ? await getCashOutList(filters) : await getTransferList(filters);
      setRows(response.data ?? []);
    } catch (event) {
      setError(getApiErrorMessage(event));
    } finally {
      setLoading(false);
    }
  }, [filters, mode]);
  useEffect(() => { queueMicrotask(() => void load()); }, [load]);
  const visible = useMemo(() => rows.filter((row) => JSON.stringify(row).toLowerCase().includes(filters.search.toLowerCase())), [filters.search, rows]);
  return (
    <AppShell>
      <CashBankPageGate permission="cash_bank.view">
        <PageHeader title={config.title} description={`${config.singular} list with status actions and period-lock-aware backend errors.`} actions={<PermissionGuard permission={config.create}><Link href={`${config.path}/create`} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">Create {config.singular}</Link></PermissionGuard>} />
        <div className="mt-6 space-y-4">
          <FilterBar filters={filters} onChange={setFilters} onApply={load} />
          {loading ? <LoadingState title={`Loading ${config.title}`} /> : null}
          {error ? <ErrorState message={error} /> : null}
          {!loading && !error && visible.length === 0 ? <EmptyState title={`No ${config.title.toLowerCase()}`} description="Create a transaction or adjust filters." /> : null}
          {visible.length > 0 ? <DataTable columns={['Document', 'Date', 'Account / Direction', 'Status', 'Amount', 'Action']}>{visible.map((row) => <tr key={row.id} className="hover:bg-slate-50"><td className="px-4 py-3 font-medium">{docNumber(row, mode)}</td><td className="px-4 py-3">{formatDate(docDate(row, mode))}</td><td className="px-4 py-3">{accountText(row, mode)}</td><td className="px-4 py-3"><CashBankStatusBadge status={row.status} /></td><td className="px-4 py-3 text-right font-semibold">{formatCurrency(Number(row.amount ?? 0))}</td><td className="px-4 py-3"><Link className="underline" href={`${config.path}/${row.id}`}>View</Link></td></tr>)}</DataTable> : null}
        </div>
      </CashBankPageGate>
    </AppShell>
  );
}

function TransactionDetail({ mode, id }: { mode: CashMode; id: string }) {
  const router = useRouter();
  const config = MODULES[mode];
  const [row, setRow] = useState<CashBankTransaction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    try {
      setRow((mode === 'cash-in' ? await getCashInDetail(id) : mode === 'cash-out' ? await getCashOutDetail(id) : await getTransferDetail(id)).data);
    } catch (event) {
      setError(getApiErrorMessage(event));
    }
  }, [id, mode]);
  useEffect(() => { queueMicrotask(() => void load()); }, [load]);
  async function run(action: 'post' | 'void') {
    try {
      setError(null);
      const reason = action === 'void' ? window.prompt('Void reason') ?? 'Voided from UI' : undefined;
      if (mode === 'cash-in') await (action === 'post' ? postCashIn(id) : voidCashIn(id, reason));
      if (mode === 'cash-out') await (action === 'post' ? postCashOut(id) : voidCashOut(id, reason));
      if (mode === 'transfers') await (action === 'post' ? postTransfer(id) : voidTransfer(id, reason));
      router.refresh();
      await load();
    } catch (event) {
      setError(getApiErrorMessage(event));
    }
  }
  return (
    <AppShell>
      <CashBankPageGate permission="cash_bank.view">
        {row ? <PageHeader title={docNumber(row, mode)} description={`${config.singular} detail and backend workflow actions.`} actions={<><PermissionGuard permission={config.post}><button type="button" onClick={() => run('post')} className="rounded-lg border border-slate-200 px-4 py-2 text-sm">Post</button></PermissionGuard><PermissionGuard permission={config.void}><button type="button" onClick={() => run('void')} className="rounded-lg border border-red-200 px-4 py-2 text-sm text-red-700">Void</button></PermissionGuard></>} /> : null}
        <div className="mt-6 space-y-4">{error ? <ErrorState message={error} /> : null}{row ? <DetailCard row={row} mode={mode} /> : <LoadingState title={`Loading ${config.singular}`} />}</div>
      </CashBankPageGate>
    </AppShell>
  );
}

function TransactionForm({ mode, id }: { mode: CashMode; id?: string }) {
  const router = useRouter();
  const config = MODULES[mode];
  const today = new Date().toISOString().slice(0, 10);
  const [accounts, setAccounts] = useState<CashBankAccount[]>([]);
  const [contacts, setContacts] = useState<SelectRecord[]>([]);
  const [expenseAccounts, setExpenseAccounts] = useState<SelectRecord[]>([]);
  const [date, setDate] = useState(today);
  const [accountId, setAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [contactId, setContactId] = useState('');
  const [amount, setAmount] = useState('');
  const [lineAccountId, setLineAccountId] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => { queueMicrotask(async () => { try { const [cash, contactsRes, accountsRes] = await Promise.all([getCashBankAccounts(), listMasterData('/master-data/contacts'), listChartOfAccounts({ is_active: '1' })]); setAccounts(cash.data ?? []); setContacts(contactsRes.data ?? []); setExpenseAccounts(accountsRes.data ?? []); } catch (event) { setError(getApiErrorMessage(event)); } }); }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!date || Number(amount) <= 0 || !accountId || (mode === 'transfers' && (!toAccountId || toAccountId === accountId))) { setError('Date, account, and positive amount are required. Transfer accounts must be different.'); return; }
    try {
      setSaving(true);
      setError(null);
      let response: { data: CashBankTransaction };
      if (mode === 'transfers') response = await createTransfer({ transfer_date: date, from_cash_bank_account_id: Number(accountId), to_cash_bank_account_id: Number(toAccountId), amount: Number(amount), currency_code: 'IDR', exchange_rate: 1, notes: notes || null });
      else {
        const payload = { [mode === 'cash-in' ? 'receipt_date' : 'payment_date']: date, cash_bank_account_id: Number(accountId), contact_id: contactId ? Number(contactId) : null, amount: Number(amount), currency_code: 'IDR', exchange_rate: 1, notes: notes || null, lines: lineAccountId ? [{ account_id: Number(lineAccountId), amount: Number(amount), description: notes || null, line_order: 1 }] : undefined };
        response = mode === 'cash-in' ? await createCashIn(payload) : await createCashOut(payload);
      }
      router.push(`${config.path}/${response.data.id}`);
    } catch (eventError) {
      setError(getApiErrorMessage(eventError));
    } finally {
      setSaving(false);
    }
  }
  return (
    <AppShell>
      <CashBankPageGate permission={config.create}>
        <PageHeader title={`${id ? 'Edit' : 'Create'} ${config.singular}`} description="Backend remains authoritative for posting, period locks, journals, and validation." />
        <form onSubmit={submit} className="mt-6 space-y-6">
          {error ? <ErrorState message={error} /> : null}
          <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-3">
            <Input label={mode === 'transfers' ? 'Transfer Date *' : mode === 'cash-in' ? 'Receipt Date *' : 'Payment Date *'} type="date" value={date} onChange={setDate} />
            <Select label={mode === 'transfers' ? 'From Cash/Bank *' : 'Cash/Bank Account *'} value={accountId} onChange={setAccountId} options={accounts} optionLabel={accountLabel} />
            {mode === 'transfers' ? <Select label="To Cash/Bank *" value={toAccountId} onChange={setToAccountId} options={accounts} optionLabel={accountLabel} /> : <Select label="Contact" value={contactId} onChange={setContactId} options={contacts} optionLabel={(row) => text(row, 'name', 'contact_name', 'id')} />}
            <Input label="Amount *" type="number" value={amount} onChange={setAmount} />
            {mode !== 'transfers' ? <Select label={mode === 'cash-in' ? 'Offset Revenue/Other Account' : 'Expense/Offset Account'} value={lineAccountId} onChange={setLineAccountId} options={expenseAccounts} optionLabel={accountLabel} /> : null}
            <label className="md:col-span-3"><span className="text-xs font-medium text-slate-500">Notes</span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></label>
          </div>
          {mode === 'transfers' ? <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">Preview: from account {formatCurrency(-Number(amount || 0))}, to account +{formatCurrency(Number(amount || 0))}.</div> : null}
          <button type="submit" disabled={saving} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">{saving ? 'Saving...' : 'Save'}</button>
        </form>
      </CashBankPageGate>
    </AppShell>
  );
}

function ReconciliationList() {
  const [rows, setRows] = useState<BankReconciliation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => { try { setLoading(true); setRows((await getReconciliationList()).data ?? []); } catch (event) { setError(getApiErrorMessage(event)); } finally { setLoading(false); } }, []);
  useEffect(() => { queueMicrotask(() => void load()); }, [load]);
  return <AppShell><CashBankPageGate permission="cash_bank.view"><PageHeader title="Bank Reconciliation" description="Basic reconciliation sessions and cleared line status." actions={<PermissionGuard permission="cash_bank.create"><Link href="/cash-bank/reconciliation/create" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">New Reconciliation</Link></PermissionGuard>} /><div className="mt-6 space-y-4">{loading ? <LoadingState title="Loading reconciliations" /> : null}{error ? <ErrorState message={error} /> : null}{rows.length === 0 && !loading && !error ? <EmptyState title="No reconciliation sessions" description="Create a session or wait for backend data." /> : null}{rows.length > 0 ? <DataTable columns={['Session', 'Period', 'Statement', 'System', 'Difference', 'Status', 'Action']}>{rows.map((row) => <tr key={row.id}><td className="px-4 py-3 font-medium">#{row.id}</td><td className="px-4 py-3">{formatDate(row.statement_start_date)} - {formatDate(row.statement_end_date)}</td><td className="px-4 py-3 text-right">{formatCurrency(Number(row.statement_ending_balance ?? 0))}</td><td className="px-4 py-3 text-right">{formatCurrency(Number(row.system_ending_balance ?? 0))}</td><td className="px-4 py-3 text-right">{formatCurrency(Number(row.difference ?? 0))}</td><td className="px-4 py-3"><CashBankStatusBadge status={row.status} /></td><td className="px-4 py-3"><Link className="underline" href={`/cash-bank/reconciliation/${row.id}`}>View</Link></td></tr>)}</DataTable> : null}</div></CashBankPageGate></AppShell>;
}

function ReconciliationForm() {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);
  const [accounts, setAccounts] = useState<CashBankAccount[]>([]);
  const [accountId, setAccountId] = useState('');
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState(today);
  const [statementBalance, setStatementBalance] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { queueMicrotask(async () => { try { setAccounts((await getCashBankAccounts()).data ?? []); } catch (event) { setError(getApiErrorMessage(event)); } }); }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accountId || !start || !end) { setError('Account and period are required.'); return; }
    try { const response = await createReconciliation({ cash_bank_account_id: Number(accountId), statement_start_date: start, statement_end_date: end, statement_ending_balance: Number(statementBalance || 0), notes: notes || null }); router.push(`/cash-bank/reconciliation/${response.data.id}`); } catch (eventError) { setError(getApiErrorMessage(eventError)); }
  }
  return <AppShell><CashBankPageGate permission="cash_bank.create"><PageHeader title="New Bank Reconciliation" description="Create a basic reconciliation session. Advanced bank feed import is out of scope." /><form onSubmit={submit} className="mt-6 grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-3">{error ? <div className="md:col-span-3"><ErrorState message={error} /></div> : null}<Select label="Cash/Bank Account *" value={accountId} onChange={setAccountId} options={accounts} optionLabel={accountLabel} /><Input label="Period Start *" type="date" value={start} onChange={setStart} /><Input label="Period End *" type="date" value={end} onChange={setEnd} /><Input label="Statement Ending Balance" type="number" value={statementBalance} onChange={setStatementBalance} /><label className="md:col-span-3"><span className="text-xs font-medium text-slate-500">Notes</span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></label><button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">Save</button></form></CashBankPageGate></AppShell>;
}

function ReconciliationDetail({ id }: { id: string }) {
  const [row, setRow] = useState<BankReconciliation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => { try { setRow((await getReconciliationDetail(id)).data); } catch (event) { setError(getApiErrorMessage(event)); } }, [id]);
  useEffect(() => { queueMicrotask(() => void load()); }, [load]);
  async function refresh() { try { await refreshReconciliationLines(id); await load(); } catch (event) { setError(getApiErrorMessage(event)); } }
  return <AppShell><CashBankPageGate permission="cash_bank.view"><PageHeader title={`Bank Reconciliation #${id}`} description="Manual/simple reconciliation detail. Match actions depend on backend line endpoints." actions={<PermissionGuard permission="cash_bank.edit"><button onClick={refresh} type="button" className="rounded-lg border border-slate-200 px-4 py-2 text-sm">Refresh Lines</button></PermissionGuard>} /><div className="mt-6 space-y-4">{error ? <ErrorState message={error} /> : null}{row ? <><SummaryGrid data={row} /><DataTable columns={['Date', 'Document', 'Description', 'Amount', 'Cleared', 'Action']}>{(row.lines ?? []).map((line, index) => <tr key={String(line.id ?? index)}><td className="px-4 py-3">{formatDate(String(line.transaction_date ?? line.date ?? ''))}</td><td className="px-4 py-3">{String(line.document_number ?? line.reference_number ?? '-')}</td><td className="px-4 py-3">{String(line.description ?? line.notes ?? '-')}</td><td className="px-4 py-3 text-right">{formatCurrency(Number(line.amount ?? 0))}</td><td className="px-4 py-3">{String(line.is_cleared ?? line.cleared ?? false)}</td><td className="px-4 py-3"><PermissionGuard permission="cash_bank.edit"><button type="button" onClick={() => line.id ? markReconciliationLines(id, [Number(line.id)], !Boolean(line.is_cleared ?? line.cleared)).then(() => load()).catch((event) => setError(getApiErrorMessage(event))) : undefined} className="underline">Toggle</button></PermissionGuard></td></tr>)}</DataTable></> : <LoadingState title="Loading reconciliation" />}</div></CashBankPageGate></AppShell>;
}

function CashBankReports() {
  const [accounts, setAccounts] = useState<CashBankAccount[]>([]);
  const [accountId, setAccountId] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [data, setData] = useState<Row | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { queueMicrotask(async () => { try { setAccounts((await getCashBankAccounts()).data ?? []); } catch (event) { setError(getApiErrorMessage(event)); } }); }, []);
  async function load() { try { if (!accountId) { setError('Cash/bank account is required for account statement report.'); return; } setError(null); setData((await getCashBankReports({ cash_bank_account_id: accountId, start_date: start, end_date: end })).data as Row); } catch (event) { setError(getApiErrorMessage(event)); } }
  const rows = Array.isArray(data?.lines) ? data.lines as Row[] : Array.isArray(data?.transactions) ? data.transactions as Row[] : [];
  return <AppShell><CashBankPageGate permission="cash_bank.view"><PageHeader title="Cash Bank Reports" description="Account statement report with print-friendly browser view. No PDF/Excel export in Phase 16." /><div className="mt-6 space-y-4"><div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4 print:hidden"><Select label="Cash/Bank Account *" value={accountId} onChange={setAccountId} options={accounts} optionLabel={accountLabel} /><Input label="Start Date" type="date" value={start} onChange={setStart} /><Input label="End Date" type="date" value={end} onChange={setEnd} /><button type="button" onClick={load} className="self-end rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">Run Report</button></div>{error ? <ErrorState message={error} /> : null}{data ? <SummaryGrid data={data} /> : null}{rows.length > 0 ? <DataTable columns={Object.keys(rows[0]).slice(0, 8)}>{rows.map((row, index) => <tr key={index}>{Object.keys(rows[0]).slice(0, 8).map((key) => <td key={key} className="px-4 py-3">{String(row[key] ?? '-')}</td>)}</tr>)}</DataTable> : data ? <EmptyState title="No report rows" description="The account statement returned no transaction rows." /> : null}</div></CashBankPageGate></AppShell>;
}

function DetailCard({ row, mode }: { row: CashBankTransaction; mode: CashMode }) {
  return <div className="grid gap-4 lg:grid-cols-[1fr_320px]"><div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><div className="flex justify-between gap-4"><div><p className="text-xs uppercase tracking-wide text-slate-500">Account / Direction</p><p className="mt-1 text-lg font-semibold text-slate-950">{accountText(row, mode)}</p><p className="mt-1 text-sm text-slate-600">Date: {formatDate(docDate(row, mode))}</p><p className="text-sm text-slate-600">Notes: {String(row.notes ?? '-')}</p></div><CashBankStatusBadge status={row.status} /></div></div><div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><p className="text-sm text-slate-500">Amount</p><p className="mt-2 text-2xl font-semibold">{formatCurrency(Number(row.amount ?? 0))}</p></div></div>;
}

function FilterBar({ filters, onChange, onApply }: { filters: { search: string; status: string; date_from: string; date_to: string }; onChange: (value: { search: string; status: string; date_from: string; date_to: string }) => void; onApply: () => void }) {
  return <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-5"><Input label="Search" value={filters.search} onChange={(value) => onChange({ ...filters, search: value })} /><Input label="Status" value={filters.status} onChange={(value) => onChange({ ...filters, status: value })} /><Input label="From" type="date" value={filters.date_from} onChange={(value) => onChange({ ...filters, date_from: value })} /><Input label="To" type="date" value={filters.date_to} onChange={(value) => onChange({ ...filters, date_to: value })} /><button type="button" onClick={onApply} className="self-end rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">Apply</button></div>;
}

function SummaryGrid({ data }: { data: Row }) {
  return <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 text-sm shadow-sm md:grid-cols-4">{Object.entries(data).filter(([, value]) => !Array.isArray(value) && typeof value !== 'object').slice(0, 12).map(([key, value]) => <div key={key}><div className="text-xs uppercase text-slate-500">{key.replaceAll('_', ' ')}</div><div className="mt-1 font-semibold text-slate-950">{String(value ?? '-')}</div></div>)}</div>;
}

function Input({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <label><span className="text-xs font-medium text-slate-500">{label}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></label>;
}

function Select({ label, value, onChange, options, optionLabel }: { label: string; value: string; onChange: (value: string) => void; options: SelectRecord[]; optionLabel: (row: SelectRecord) => string }) {
  return <label><span className="text-xs font-medium text-slate-500">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"><option value="">-</option>{options.map((option) => <option key={option.id} value={option.id}>{optionLabel(option)}</option>)}</select></label>;
}

function docNumber(row: Row, mode: CashMode) {
  const keys = mode === 'cash-in' ? ['receipt_number', 'document_number'] : mode === 'cash-out' ? ['payment_number', 'document_number'] : ['transfer_number', 'document_number'];
  return String(value(row, ...keys) ?? `#${row.id ?? '-'}`);
}

function docDate(row: Row, mode: CashMode) {
  const keys = mode === 'cash-in' ? ['receipt_date', 'transaction_date'] : mode === 'cash-out' ? ['payment_date', 'transaction_date'] : ['transfer_date', 'transaction_date'];
  return String(value(row, ...keys) ?? '').slice(0, 10);
}

function accountText(row: Row, mode: CashMode) {
  if (mode === 'transfers') return `${String(row.from_account_name ?? row.from_cash_bank_account_id ?? '-')} → ${String(row.to_account_name ?? row.to_cash_bank_account_id ?? '-')}`;
  return String(row.account_name ?? row.cash_bank_account_name ?? row.cash_bank_account_id ?? '-');
}

function accountLabel(row: SelectRecord) {
  return `${text(row, 'account_code', 'code', 'id')} - ${text(row, 'account_name', 'name')}`;
}

function value(row: Row, ...keys: string[]) {
  return keys.map((key) => row[key]).find((item) => item !== undefined && item !== null && item !== '');
}

function text(row: Row, ...keys: string[]) {
  return String(value(row, ...keys) ?? '-');
}
