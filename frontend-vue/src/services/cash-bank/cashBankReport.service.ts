import { api } from '@/services/api'
import { unwrap, type ApiResponse } from '@/services/apiResponse'

export type CashBankAccountOption = {
  id: number
  account_code: string
  account_name: string
  account_type: string
  normal_balance: string
  is_cash_bank: boolean
  is_active: boolean
}

export type CashBankStatementLine = {
  id: string
  journal_entry_id: number
  journal_entry_line_id: number
  journal_number: string
  journal_date: string
  description: string | null
  debit: number
  credit: number
  running_balance: number
  source_type: string | null
  source_number: string | null
  source_module: string | null
}

export type CashBankAccountStatement = {
  account: {
    id: number
    account_code: string
    account_name: string
    normal_balance: string
    is_active: boolean
  }
  filter: {
    cash_bank_account_id: number
    start_date: string | null
    end_date: string | null
  }
  opening_balance: number
  period_totals: {
    debit: number
    credit: number
  }
  ending_balance: number
  lines: CashBankStatementLine[]
}

type CashBankAccountStatementPayload = Omit<CashBankAccountStatement, 'lines'> & {
  lines: Omit<CashBankStatementLine, 'id'>[]
}

type CashBankAccountListResult = {
  include_inactive: boolean
  accounts: CashBankAccountOption[]
}

export type CashBankStatementParams = {
  cash_bank_account_id: number
  start_date?: string
  end_date?: string
}

export async function listCashBankAccounts() {
  const response = await api.get<ApiResponse<CashBankAccountListResult>>('/cash-bank/accounts')
  return unwrap(response.data).accounts
}

export async function getCashBankAccountStatement(params: CashBankStatementParams) {
  const response = await api.get<ApiResponse<CashBankAccountStatementPayload>>('/cash-bank/reports/account-statement', { params })
  const result = unwrap(response.data)

  return {
    ...result,
    lines: result.lines.map((line) => ({
      ...line,
      id: String(line.journal_entry_line_id),
    })),
  }
}

export function cashBankReportErrorMessage(cause: unknown, fallback = 'Unable to load cash bank account statement.') {
  if (!cause || typeof cause !== 'object') return fallback

  const error = cause as { status?: number; message?: string; errors?: Record<string, string[]> }
  if (error.status === 401) return 'Your session has expired. Please sign in again.'
  if (error.status === 403) return 'You do not have permission to view cash bank account statements.'
  if (error.status === 404) return 'The cash bank account statement endpoint or selected account was not found.'
  if (error.status === 422) {
    const validation = error.errors ? Object.values(error.errors).flat().join(' ') : ''
    return validation || error.message || 'Check the selected account and reporting period.'
  }
  if (error.status === 0) return 'Unable to reach the server. Check your network connection and retry.'
  return error.message || fallback
}
