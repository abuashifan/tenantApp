import { api } from '@/api'
import type { ApiResponse } from '@/services/apiResponse'
import { unwrap } from '@/services/apiResponse'

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

export async function getTrialBalance(params: Record<string, unknown>) {
  const response = await api.get<ApiResponse<TrialBalanceResult>>('/reports/trial-balance', { params })
  const result = unwrap(response.data)
  return {
    ...result,
    accounts: result.accounts.map((row) => ({ ...row, id: String(row.account_id) })),
  }
}
