'use client';

import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { DataTable } from '@/components/ui/DataTable';
import { listChartOfAccounts } from '@/features/accounting/chart-of-accounts/api';
import { listMasterData } from '@/features/accounting/master-data/api';
import { createJournal, updateJournal } from './api';
import { formatCurrency } from '@/lib/formatters';
import { getApiErrorMessage } from '@/lib/api';
import { useVirtualTabDraft } from '@/hooks/useVirtualTabDraft';
import type {
  ChartOfAccount,
  Department,
  JournalEntry,
  JournalEntryLine,
  JournalEntryPayload,
  Project,
} from '@/types/accounting';

type JournalEntryFormProps = {
  journal?: JournalEntry;
};

type DraftLine = {
  account_id: string;
  department_id: string;
  project_id: string;
  description: string;
  debit: string;
  credit: string;
};

type JournalDraftState = {
  journalDate: string;
  description: string;
  editReason: string;
  lines: DraftLine[];
};

export function JournalEntryForm({ journal }: JournalEntryFormProps) {
  const router = useRouter();
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const initialDraft = useMemo<JournalDraftState>(
    () => ({
      journalDate: toDateInput(journal?.journal_date),
      description: journal?.description ?? '',
      editReason: '',
      lines: journal?.lines?.length ? journal.lines.map(lineToDraft) : [blankLine(), blankLine()],
    }),
    [journal],
  );
  const { draft, setDraft, patchDraft, setDirty, resetDraft } =
    useVirtualTabDraft<JournalDraftState>(initialDraft);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { journalDate, description, editReason, lines } = draft;

  async function loadSelectors() {
    try {
      setLoading(true);
      const [accountRes, departmentRes, projectRes] = await Promise.all([
        listChartOfAccounts({ is_active: '1' }),
        listMasterData('/master-data/departments'),
        listMasterData('/master-data/projects'),
      ]);
      setAccounts(accountRes.data ?? []);
      setDepartments((departmentRes.data ?? []) as Department[]);
      setProjects((projectRes.data ?? []) as Project[]);
    } catch (event) {
      setError(getApiErrorMessage(event));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    queueMicrotask(() => {
      void loadSelectors();
    });
  }, []);

  const totals = useMemo(() => {
    const debit = lines.reduce((sum, line) => sum + numberValue(line.debit), 0);
    const credit = lines.reduce((sum, line) => sum + numberValue(line.credit), 0);
    return { debit, credit, difference: debit - credit, balanced: Math.abs(debit - credit) < 0.0001 };
  }, [lines]);

  const formIssues = useMemo(() => validateLines(lines, totals.balanced), [lines, totals.balanced]);

  function updateLine(index: number, key: keyof DraftLine, value: string) {
    setDraft((current) =>
      ({
        ...current,
        lines: current.lines.map((line, lineIndex) =>
          lineIndex === index ? normalizeLineInput({ ...line, [key]: value }, key) : line,
        ),
      }),
    );
    setDirty(true);
  }

  function removeLine(index: number) {
    setDraft((current) => ({
      ...current,
      lines: current.lines.filter((_, lineIndex) => lineIndex !== index),
    }));
    setDirty(true);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (formIssues.length > 0) {
      setError(formIssues.join(' '));
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const payload: JournalEntryPayload = {
        journal_date: journalDate,
        description: description || null,
        edit_reason: editReason || null,
        lines: lines.map((line, index) => ({
          account_id: Number(line.account_id),
          department_id: line.department_id ? Number(line.department_id) : null,
          project_id: line.project_id ? Number(line.project_id) : null,
          description: line.description || null,
          debit: numberValue(line.debit),
          credit: numberValue(line.credit),
          line_order: index + 1,
        })),
      };

      const res = journal ? await updateJournal(journal.id, payload) : await createJournal(payload);
      resetDraft(initialDraft);
      router.push(`/accounting/journals/${res.data.id}`);
    } catch (eventError) {
      setError(getApiErrorMessage(eventError));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState title="Loading journal selectors" />;

  return (
    <form onSubmit={submit} className="space-y-6">
      {error ? <ErrorState message={error} /> : null}

      <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-2">
        <label>
          <span className="text-xs font-medium text-slate-500">Journal Date *</span>
          <input
            type="date"
            required
            value={journalDate}
            onChange={(event) => {
              patchDraft({ journalDate: event.target.value });
              setDirty(true);
            }}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
          />
        </label>

        <label>
          <span className="text-xs font-medium text-slate-500">Description</span>
          <input
            value={description}
            onChange={(event) => {
              patchDraft({ description: event.target.value });
              setDirty(true);
            }}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
          />
        </label>

        {journal?.status === 'posted' ? (
          <label className="md:col-span-2">
            <span className="text-xs font-medium text-slate-500">Edit Reason for Posted Journal</span>
            <input
              value={editReason}
              onChange={(event) => {
                patchDraft({ editReason: event.target.value });
                setDirty(true);
              }}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            />
          </label>
        ) : null}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold text-slate-950">Journal Lines</h2>
            <p className="text-xs text-slate-500">Minimum two lines. Debit and credit totals must balance.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setDraft((current) => ({ ...current, lines: [...current.lines, blankLine()] }));
              setDirty(true);
            }}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Add Line
          </button>
        </div>

        <DataTable columns={['Account', 'Department', 'Project', 'Description', 'Debit', 'Credit', '']}>
          {lines.map((line, index) => (
            <tr key={index} className="align-top">
              <td className="min-w-56 px-3 py-3">
                <select
                  value={line.account_id}
                  onChange={(event) => updateLine(index, 'account_id', event.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm outline-none focus:border-slate-400"
                >
                  <option value="">Select account</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.account_code} - {account.account_name}
                    </option>
                  ))}
                </select>
              </td>
              <td className="min-w-40 px-3 py-3">
                <select
                  value={line.department_id}
                  onChange={(event) => updateLine(index, 'department_id', event.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm outline-none focus:border-slate-400"
                >
                  <option value="">-</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.code} - {department.name}
                    </option>
                  ))}
                </select>
              </td>
              <td className="min-w-40 px-3 py-3">
                <select
                  value={line.project_id}
                  onChange={(event) => updateLine(index, 'project_id', event.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm outline-none focus:border-slate-400"
                >
                  <option value="">-</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.code} - {project.name}
                    </option>
                  ))}
                </select>
              </td>
              <td className="min-w-52 px-3 py-3">
                <input
                  value={line.description}
                  onChange={(event) => updateLine(index, 'description', event.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm outline-none focus:border-slate-400"
                />
              </td>
              <td className="min-w-32 px-3 py-3">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={line.debit}
                  onChange={(event) => updateLine(index, 'debit', event.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-2 py-2 text-right text-sm outline-none focus:border-slate-400"
                />
              </td>
              <td className="min-w-32 px-3 py-3">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={line.credit}
                  onChange={(event) => updateLine(index, 'credit', event.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-2 py-2 text-right text-sm outline-none focus:border-slate-400"
                />
              </td>
              <td className="px-3 py-3 text-right">
                <button
                  type="button"
                  onClick={() => removeLine(index)}
                  disabled={lines.length <= 2}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </DataTable>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <SummaryBox label="Total Debit" value={formatCurrency(totals.debit)} />
          <SummaryBox label="Total Credit" value={formatCurrency(totals.credit)} />
          <SummaryBox
            label="Difference"
            value={formatCurrency(Math.abs(totals.difference))}
            tone={totals.balanced ? 'text-emerald-700' : 'text-red-700'}
          />
        </div>

        {formIssues.length > 0 ? (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            {formIssues.join(' ')}
          </div>
        ) : null}
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving || formIssues.length > 0}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {saving ? 'Saving...' : journal ? 'Save Journal' : 'Create Draft'}
        </button>
      </div>
    </form>
  );
}

function SummaryBox({ label, value, tone = 'text-slate-950' }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`mt-1 font-semibold ${tone}`}>{value}</div>
    </div>
  );
}

function blankLine(): DraftLine {
  return { account_id: '', department_id: '', project_id: '', description: '', debit: '', credit: '' };
}

function lineToDraft(line: JournalEntryLine): DraftLine {
  return {
    account_id: line.account_id ? String(line.account_id) : '',
    department_id: line.department_id ? String(line.department_id) : '',
    project_id: line.project_id ? String(line.project_id) : '',
    description: line.description ?? '',
    debit: Number(line.debit) > 0 ? String(line.debit) : '',
    credit: Number(line.credit) > 0 ? String(line.credit) : '',
  };
}

function numberValue(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeLineInput(line: DraftLine, key: keyof DraftLine): DraftLine {
  if (key === 'debit' && numberValue(line.debit) > 0) return { ...line, credit: '' };
  if (key === 'credit' && numberValue(line.credit) > 0) return { ...line, debit: '' };
  return line;
}

function validateLines(lines: DraftLine[], balanced: boolean): string[] {
  const issues: string[] = [];
  if (lines.length < 2) issues.push('Journal must have at least two lines.');
  lines.forEach((line, index) => {
    if (!line.account_id) issues.push(`Line ${index + 1}: account is required.`);
    const debit = numberValue(line.debit);
    const credit = numberValue(line.credit);
    if (debit > 0 && credit > 0) issues.push(`Line ${index + 1}: debit and credit cannot both be filled.`);
    if (debit === 0 && credit === 0) issues.push(`Line ${index + 1}: enter either debit or credit.`);
  });
  if (!balanced) issues.push('Total debit must equal total credit.');
  return issues;
}

function toDateInput(value?: string | null): string {
  if (!value) return new Date().toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}
