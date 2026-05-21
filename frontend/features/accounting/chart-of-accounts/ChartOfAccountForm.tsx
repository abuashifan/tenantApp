'use client';

import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import type {
  AccountType,
  ChartOfAccount,
  ChartOfAccountPayload,
  NormalBalance,
} from '@/types/accounting';

type ChartOfAccountFormProps = {
  initialValue?: ChartOfAccount | null;
  accounts: ChartOfAccount[];
  submitting: boolean;
  onSubmit: (payload: ChartOfAccountPayload) => Promise<void>;
};

const accountTypes: AccountType[] = [
  'asset',
  'liability',
  'equity',
  'revenue',
  'expense',
];

const normalBalances: NormalBalance[] = ['debit', 'credit'];

export function ChartOfAccountForm({
  initialValue,
  accounts,
  submitting,
  onSubmit,
}: ChartOfAccountFormProps) {
  const [accountCode, setAccountCode] = useState(initialValue?.account_code ?? '');
  const [accountName, setAccountName] = useState(initialValue?.account_name ?? '');
  const [accountType, setAccountType] = useState<AccountType>(
    initialValue?.account_type ?? 'asset',
  );
  const [normalBalance, setNormalBalance] = useState<NormalBalance>(
    initialValue?.normal_balance ?? 'debit',
  );
  const [parentAccountId, setParentAccountId] = useState<string>(
    initialValue?.parent_account_id ? String(initialValue.parent_account_id) : '',
  );
  const [isCashBank, setIsCashBank] = useState(Boolean(initialValue?.is_cash_bank));
  const [isActive, setIsActive] = useState(initialValue?.is_active ?? true);
  const [description, setDescription] = useState(initialValue?.description ?? '');

  const parentOptions = useMemo(() => {
    return accounts.filter((account) => account.id !== initialValue?.id);
  }, [accounts, initialValue?.id]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onSubmit({
      account_code: accountCode.trim(),
      account_name: accountName.trim(),
      account_type: accountType,
      normal_balance: normalBalance,
      parent_account_id: parentAccountId ? Number(parentAccountId) : null,
      is_cash_bank: isCashBank,
      is_active: isActive,
      description: description.trim() || null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Code</span>
          <input
            value={accountCode}
            onChange={(event) => setAccountCode(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Name</span>
          <input
            value={accountName}
            onChange={(event) => setAccountName(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Account Type</span>
          <select
            value={accountType}
            onChange={(event) => {
              const nextType = event.target.value as AccountType;
              setAccountType(nextType);
              if (nextType !== 'asset') setIsCashBank(false);
              setNormalBalance(
                nextType === 'asset' || nextType === 'expense' ? 'debit' : 'credit',
              );
            }}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
          >
            {accountTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Normal Balance</span>
          <select
            value={normalBalance}
            onChange={(event) => setNormalBalance(event.target.value as NormalBalance)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
          >
            {normalBalances.map((balance) => (
              <option key={balance} value={balance}>
                {balance}
              </option>
            ))}
          </select>
        </label>

        <label className="block md:col-span-2">
          <span className="text-sm font-medium text-slate-700">Parent Account</span>
          <select
            value={parentAccountId}
            onChange={(event) => setParentAccountId(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
          >
            <option value="">No parent</option>
            {parentOptions.map((account) => (
              <option key={account.id} value={account.id}>
                {account.account_code} - {account.account_name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={isCashBank}
            disabled={accountType !== 'asset'}
            onChange={(event) => setIsCashBank(event.target.checked)}
          />
          Cash/Bank account
        </label>

        <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
          />
          Active
        </label>

        <label className="block md:col-span-2">
          <span className="text-sm font-medium text-slate-700">Description</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
          />
        </label>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {submitting ? 'Saving...' : 'Save Account'}
        </button>
      </div>
    </form>
  );
}
