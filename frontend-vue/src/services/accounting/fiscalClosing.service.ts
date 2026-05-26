import { api } from '@/api'
import { unwrap, type ApiResponse } from '@/services/apiResponse'

export type FiscalYearSummary = {
  id?: number
  year: number
  start_date: string | null
  end_date: string | null
  status: string
  is_active: boolean
  is_closed?: boolean
  locked_until?: string | null
  closed_at?: string | null
  closed_by?: string | null
}

export type FiscalYearStatus = {
  active_fiscal_year: FiscalYearSummary
  closing_required: boolean
  annual_closing_only: boolean
  monthly_closing_reminder: boolean
}

export type ClosingCheck = {
  key: string
  status: 'passed' | 'warning' | 'failed' | string
  message: string
}

export type ClosingChecklist = {
  can_close: boolean
  errors: Record<string, string[]>
  warnings: string[]
  checks: ClosingCheck[]
}

export type ClosingPreview = {
  valid: boolean
  errors: Record<string, string[]>
  warnings: string[]
  preview?: {
    fiscal_year?: FiscalYearSummary
    net_profit_loss?: number
    retained_earnings_account?: {
      mapping_key?: string
      account_id?: number | null
    }
    journal_count?: number
    warning_count?: number
    warnings?: string[]
    can_close?: boolean
  }
}

export type CloseFiscalYearResult = {
  valid: boolean
  fiscal_year_id: number
  retained_earnings_amount?: number
  retained_earnings_account_id?: number | null
  closed_at?: string
  errors?: Record<string, string[]>
  warnings?: string[]
}

export type ReopenFiscalYearResult = {
  valid: boolean
  fiscal_year_id: number
  reopened_at?: string
  errors?: Record<string, string[]>
}

export type PeriodLockStatus = {
  active_fiscal_year: FiscalYearSummary & {
    id: number
    locked_until: string | null
  }
}

export type PeriodLockUpdateResult = {
  fiscal_year_id: number
  locked_until: string | null
}

export async function getFiscalYearStatus() {
  const response = await api.get<ApiResponse<FiscalYearStatus>>('/accounting/fiscal-year/status')
  return unwrap(response.data)
}

export async function getClosingChecklist(fiscalYearId: number) {
  const response = await api.get<ApiResponse<ClosingChecklist>>(`/accounting/fiscal-years/${fiscalYearId}/closing-checklist`)
  return unwrap(response.data)
}

export async function getClosingPreview(fiscalYearId: number) {
  const response = await api.get<ApiResponse<ClosingPreview>>(`/accounting/fiscal-years/${fiscalYearId}/closing-preview`)
  return unwrap(response.data)
}

export async function closeFiscalYear(fiscalYearId: number, payload: { closing_notes?: string } = {}) {
  const response = await api.post<ApiResponse<CloseFiscalYearResult>>(`/accounting/fiscal-years/${fiscalYearId}/close`, payload)
  return unwrap(response.data)
}

export async function reopenFiscalYear(fiscalYearId: number, payload: { reopen_reason: string }) {
  const response = await api.post<ApiResponse<ReopenFiscalYearResult>>(`/accounting/fiscal-years/${fiscalYearId}/reopen`, payload)
  return unwrap(response.data)
}

export async function getPeriodLockStatus() {
  const response = await api.get<ApiResponse<PeriodLockStatus>>('/accounting/period-locks/status')
  return unwrap(response.data)
}

export async function updatePeriodLock(payload: { lock_until: string | null; override_reason?: string }) {
  const response = await api.patch<ApiResponse<PeriodLockUpdateResult>>('/accounting/period-locks', payload)
  return unwrap(response.data)
}
