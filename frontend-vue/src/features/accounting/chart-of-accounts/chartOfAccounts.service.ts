import { api } from '@/api'
import type { ApiResponse } from '@/services/apiResponse'
import { unwrap } from '@/services/apiResponse'

export type ChartOfAccountsListParams = {
  account_type?: string
  is_active?: boolean
  is_cash_bank?: boolean
}

export type BackendChartOfAccount = {
  id: string | number
  account_code: string
  account_name: string
  account_type: string
  parent_account_id?: number | null
  normal_balance?: string | null
  is_active: boolean
  is_cash_bank?: boolean
  is_system_default?: boolean
  description?: string | null
  metadata?: Record<string, unknown> | null
}

export type ChartOfAccountRow = {
  id: string
  code: string
  name: string
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
  balance: number
  parentId: string | null
  isActive: boolean
  normalBalance: 'debit' | 'credit'
}

export type SaveChartOfAccountPayload = {
  account_code: string
  account_name: string
  account_type: string
  parent_account_id?: number | null
  normal_balance: 'debit' | 'credit'
  is_active: boolean
}

type BackendListPayload<T> = T[] | { data?: T[]; items?: T[] }

function normalizeList<T>(payload: BackendListPayload<T>) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload.data)) return payload.data
  if (Array.isArray(payload.items)) return payload.items
  return []
}

function normalizeNormalBalance(value?: string | null): 'debit' | 'credit' {
  return value === 'credit' ? 'credit' : 'debit'
}

function normalizeAccountType(value: string): ChartOfAccountRow['type'] {
  return value === 'liability' || value === 'equity' || value === 'revenue' || value === 'expense' ? value : 'asset'
}

export function mapChartOfAccount(row: BackendChartOfAccount): ChartOfAccountRow {
  return {
    id: String(row.id),
    code: row.account_code,
    name: row.account_name,
    type: normalizeAccountType(row.account_type),
    balance: 0,
    parentId: row.parent_account_id == null ? null : String(row.parent_account_id),
    isActive: Boolean(row.is_active),
    normalBalance: normalizeNormalBalance(row.normal_balance),
  }
}

export async function listChartOfAccounts(params: ChartOfAccountsListParams = {}) {
  const response = await api.get<ApiResponse<BackendListPayload<BackendChartOfAccount>>>(
    '/master-data/chart-of-accounts',
    { params },
  )
  return normalizeList(unwrap(response.data)).map(mapChartOfAccount)
}

export async function createChartOfAccount(payload: SaveChartOfAccountPayload) {
  const response = await api.post<ApiResponse<BackendChartOfAccount>>('/master-data/chart-of-accounts', payload)
  return mapChartOfAccount(unwrap(response.data))
}

export async function updateChartOfAccount(id: string | number, payload: SaveChartOfAccountPayload) {
  const response = await api.patch<ApiResponse<BackendChartOfAccount>>(`/master-data/chart-of-accounts/${id}`, payload)
  return mapChartOfAccount(unwrap(response.data))
}
