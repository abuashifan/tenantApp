import { api } from '@/api'
import type { ApiResponse } from '@/services/apiResponse'
import { unwrap } from '@/services/apiResponse'

export type LedgerAccountOption = {
  account_id: number
  account_code: string
  account_name: string
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

type LedgerSummaryResponse = {
  accounts: Array<{
    account: { id: number; account_code: string; account_name: string }
  }>
}

export async function listLedgerAccounts(params: Record<string, unknown>) {
  const response = await api.get<ApiResponse<LedgerSummaryResponse>>('/reports/general-ledger', { params })
  return unwrap(response.data).accounts.map((row) => ({
    account_id: row.account.id,
    account_code: row.account.account_code,
    account_name: row.account.account_name,
  }))
}

export async function getGeneralLedger(accountId: number, params: Record<string, unknown>) {
  const response = await api.get<ApiResponse<LedgerDetail>>('/reports/general-ledger', {
    params: { ...params, account_id: accountId },
  })
  const result = unwrap(response.data)
  return {
    ...result,
    lines: result.lines.map((line) => ({ ...line, id: String(line.journal_entry_id) + '-' + line.journal_number })),
  }
}
