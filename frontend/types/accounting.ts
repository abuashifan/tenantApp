export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';

export type NormalBalance = 'debit' | 'credit';

export type ChartOfAccount = {
  id: number;
  account_code: string;
  account_name: string;
  account_type: AccountType;
  parent_account_id: number | null;
  normal_balance: NormalBalance;
  is_cash_bank: boolean;
  is_active: boolean;
  is_system_default?: boolean;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type ChartOfAccountPayload = {
  account_code: string;
  account_name: string;
  account_type: AccountType;
  parent_account_id?: number | null;
  normal_balance?: NormalBalance;
  is_cash_bank?: boolean;
  is_active?: boolean;
  description?: string | null;
};

export type PermissionPayload = {
  role: string | null;
  permission_mode: string;
  permissions: string[];
};

export type MasterDataRecord = Record<string, unknown> & {
  id: number;
  is_active?: boolean;
};

export type AccountMapping = {
  id: number;
  mapping_key: string;
  module: string;
  account_id: number | null;
  is_required: boolean;
  is_active: boolean;
};

export type Department = {
  id: number;
  code: string;
  name: string;
  is_active: boolean;
};

export type Project = {
  id: number;
  code: string;
  name: string;
  status?: string | null;
  is_active: boolean;
};

export type JournalStatus = 'draft' | 'approved' | 'posted' | 'void';

export type JournalEntryLine = {
  id?: number;
  journal_entry_id?: number;
  account_id: number | null;
  department_id?: number | null;
  project_id?: number | null;
  description?: string | null;
  debit: number | string;
  credit: number | string;
  line_order?: number;
  account?: ChartOfAccount;
  department?: Department;
  project?: Project;
};

export type JournalEntry = {
  id: number;
  journal_number: string;
  journal_date: string;
  description?: string | null;
  status: JournalStatus;
  revision_no?: number;
  source_type?: string | null;
  source_number?: string | null;
  is_system_generated?: boolean;
  is_obsolete?: boolean;
  void_reason?: string | null;
  created_by?: number | null;
  lines?: JournalEntryLine[];
};

export type JournalEntryPayload = {
  journal_date: string;
  description?: string | null;
  edit_reason?: string | null;
  lines: Array<{
    account_id: number | null;
    department_id?: number | null;
    project_id?: number | null;
    description?: string | null;
    debit?: number;
    credit?: number;
    line_order?: number;
  }>;
};
