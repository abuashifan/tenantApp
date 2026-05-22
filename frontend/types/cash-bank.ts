export type CashBankStatus = 'draft' | 'posted' | 'void' | 'reconciled' | 'open' | string;

export type CashBankAccount = Record<string, unknown> & {
  id: number;
  account_code?: string | null;
  account_name?: string | null;
  current_balance?: number | string | null;
  is_cash_bank?: boolean;
};

export type CashBankTransactionLine = Record<string, unknown> & {
  id?: number;
  account_id?: number | null;
  amount?: number | string | null;
  description?: string | null;
  department_id?: number | null;
  project_id?: number | null;
};

export type CashBankTransaction = Record<string, unknown> & {
  id: number;
  status?: CashBankStatus | null;
  cash_bank_account_id?: number | null;
  amount?: number | string | null;
  notes?: string | null;
  lines?: CashBankTransactionLine[];
};

export type CashInTransaction = CashBankTransaction & {
  receipt_number?: string | null;
  receipt_date?: string | null;
};

export type CashOutTransaction = CashBankTransaction & {
  payment_number?: string | null;
  payment_date?: string | null;
};

export type BankTransfer = CashBankTransaction & {
  transfer_number?: string | null;
  transfer_date?: string | null;
  from_cash_bank_account_id?: number | null;
  to_cash_bank_account_id?: number | null;
};

export type BankReconciliation = Record<string, unknown> & {
  id: number;
  status?: CashBankStatus | null;
  cash_bank_account_id?: number | null;
  statement_start_date?: string | null;
  statement_end_date?: string | null;
  statement_ending_balance?: number | string | null;
  system_ending_balance?: number | string | null;
  difference?: number | string | null;
  lines?: Array<Record<string, unknown>>;
};

export type CashBankReportSummary = Record<string, unknown>;

export type CashBankListFilters = Record<string, string | number | boolean | null | undefined>;

export type CashBankFormPayload = Record<string, unknown>;
