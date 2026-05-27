import { api } from '@/api'
import type { ApiResponse } from '@/services/apiResponse'
import { unwrap } from '@/services/apiResponse'

export type ReportParams = Record<string, unknown>

export type LedgerAccountOption = {
  account_id: number
  account_code: string
  account_name: string
  label: string
}

export type LedgerLine = {
  id: string
  journal_entry_id: number
  journal_number: string
  journal_date: string
  description: string | null
  debit: number
  credit: number
  running_balance: number
  source_type: string | null
  source_number: string | null
}

export type LedgerDetail = {
  account: { id: number; account_code: string; account_name: string }
  opening_balance: { balance: number }
  period_totals: { debit: number; credit: number }
  ending_balance: number
  lines: LedgerLine[]
}

type BackendChartOfAccount = {
  id?: string | number | null
  code?: string | null
  name?: string | null
  account_code?: string | null
  account_name?: string | null
  is_active?: boolean | number | string | null
  is_postable?: boolean | number | string | null
  is_group?: boolean | number | string | null
  level?: number | string | null
}

type BackendListPayload<T> = T[] | { data?: T[]; items?: T[] }

export type TrialBalanceRow = {
  id: string
  account_id: number
  account_code: string
  account_name: string
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
  ending_debit: number
  ending_credit: number
  ending_balance: number
}

export type TrialBalanceResult = {
  accounts: TrialBalanceRow[]
  totals: {
    ending_debit: number
    ending_credit: number
    is_balanced: boolean
  }
}

export type FinancialAccountRow = {
  id: string
  account_id: number | null
  account_code: string | null
  account_name: string
  account_type: string
  debit: number
  credit: number
  amount: number
}

export type FinancialSection = {
  key: string
  label: string
  accounts: FinancialAccountRow[]
  total: number
}

export type ProfitLossResult = {
  sections: FinancialSection[]
  totals: {
    total_revenue: number
    total_expense: number
    net_profit: number
    net_loss: number
    net_profit_or_loss: number
  }
}

export type BalanceSheetResult = {
  sections: FinancialSection[]
  totals: {
    total_assets: number
    total_liabilities: number
    total_equity: number
    total_liabilities_and_equity: number
    current_year_profit_or_loss: number
    difference: number
    is_balanced: boolean
  }
}

export type CashFlowRow = {
  id: string
  account_id: number
  account_code: string
  account_name: string
  opening_balance: number
  cash_in: number
  cash_out: number
  net_cash_flow: number
  ending_balance: number
}

export type CashFlowResult = {
  accounts: CashFlowRow[]
  summary: {
    opening_cash_balance: number
    cash_in: number
    cash_out: number
    net_cash_flow: number
    ending_cash_balance: number
  }
}

export type FinancialSummaryResult = {
  profit_loss: {
    net_profit_or_loss: number
  }
  balance_sheet: {
    total_assets: number
    total_liabilities: number
    total_equity: number
    is_balanced: boolean
    current_year_profit_or_loss: number
  }
  cash_flow: {
    opening_cash_balance: number
    cash_in: number
    cash_out: number
    ending_cash_balance: number
  }
}

function withFinancialIds<T extends { sections: FinancialSection[] }>(result: T): T {
  return {
    ...result,
    sections: result.sections.map((section) => ({
      ...section,
      accounts: section.accounts.map((account, index) => ({
        ...account,
        id: account.account_id == null ? `${section.key}-${index}` : String(account.account_id),
      })),
    })),
  }
}

export function reportErrorMessage(cause: unknown, fallback = 'Unable to load report data.') {
  if (cause instanceof Error) return cause.message
  if (cause && typeof cause === 'object' && 'message' in cause && typeof cause.message === 'string') {
    return cause.message
  }
  return fallback
}

function normalizeList<T>(payload: BackendListPayload<T>) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload.data)) return payload.data
  if (Array.isArray(payload.items)) return payload.items
  return []
}

function isFalseLike(value: unknown) {
  return value === false || value === 0 || value === '0' || value === 'false'
}

function accountLabel(account: BackendChartOfAccount) {
  const code = String(account.code ?? account.account_code ?? '').trim()
  const name = String(account.name ?? account.account_name ?? '').trim()
  return [code, name].filter(Boolean).join(' - ') || 'Unnamed account'
}

function cleanReportParams(params: ReportParams = {}) {
  const cleaned: Record<string, string | number> = {}

  for (const [key, value] of Object.entries(params)) {
    if (value == null || value === '') continue
    if (typeof value === 'boolean') {
      cleaned[key] = value ? 'true' : 'false'
      continue
    }
    cleaned[key] = typeof value === 'number' ? value : String(value)
  }

  return cleaned
}

export async function listLedgerAccounts(params: ReportParams = {}) {
  const response = await api.get<ApiResponse<BackendListPayload<BackendChartOfAccount>>>(
    '/master-data/chart-of-accounts',
    { params: cleanReportParams(params) },
  )

  return normalizeList(unwrap(response.data))
    .filter((account) => !isFalseLike(account.is_active))
    .filter((account) => account.is_postable == null || !isFalseLike(account.is_postable))
    .filter((account) => account.is_group == null || isFalseLike(account.is_group))
    .map((account) => ({
      account_id: Number(account.id),
      account_code: String(account.code ?? account.account_code ?? ''),
      account_name: String(account.name ?? account.account_name ?? ''),
      label: accountLabel(account),
    }))
    .filter((account) => Number.isFinite(account.account_id))
}

export async function getGeneralLedger(accountId: number, params: ReportParams = {}) {
  const response = await api.get<ApiResponse<LedgerDetail>>('/reports/general-ledger', {
    params: cleanReportParams({ ...params, account_id: accountId }),
  })
  const result = unwrap(response.data)
  return {
    ...result,
    lines: result.lines.map((line) => ({ ...line, id: `${line.journal_entry_id}-${line.journal_number}` })),
  }
}

export async function getAccountLedger(accountId: number, params: ReportParams = {}) {
  const response = await api.get<ApiResponse<LedgerDetail>>(`/reports/account-ledger/${accountId}`, { params })
  const result = unwrap(response.data)
  return {
    ...result,
    lines: result.lines.map((line) => ({ ...line, id: `${line.journal_entry_id}-${line.journal_number}` })),
  }
}

export async function getTrialBalance(params: ReportParams = {}) {
  const response = await api.get<ApiResponse<TrialBalanceResult>>('/reports/trial-balance', { params })
  const result = unwrap(response.data)
  return {
    ...result,
    accounts: result.accounts.map((row) => ({ ...row, id: String(row.account_id) })),
  }
}

export async function getProfitLoss(params: ReportParams) {
  const response = await api.get<ApiResponse<ProfitLossResult>>('/reports/profit-loss', { params })
  return withFinancialIds(unwrap(response.data))
}

export async function getBalanceSheet(params: ReportParams) {
  const response = await api.get<ApiResponse<BalanceSheetResult>>('/reports/balance-sheet', { params })
  return withFinancialIds(unwrap(response.data))
}

export async function getCashFlow(params: ReportParams) {
  const response = await api.get<ApiResponse<CashFlowResult>>('/reports/cash-flow', { params })
  const result = unwrap(response.data)
  return {
    ...result,
    accounts: result.accounts.map((account) => ({ ...account, id: String(account.account_id) })),
  }
}

export async function getFinancialSummary(params: ReportParams) {
  const response = await api.get<ApiResponse<FinancialSummaryResult>>('/reports/financial-summary', { params })
  return unwrap(response.data)
}
