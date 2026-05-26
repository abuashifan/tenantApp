import {
  getFiscalYearStatus,
  type FiscalYearStatus,
} from '@/services/accounting/fiscalClosing.service'
import {
  getFinancialSummary,
  type FinancialSummaryResult,
} from '@/services/report.service'
import type { ApiError } from '@/types/api'

export type DashboardFinancialPeriod = {
  start_date: string
  end_date: string
  as_of_date: string
}

export function financialPeriodFromFiscalYear(status: FiscalYearStatus): DashboardFinancialPeriod | null {
  const fiscalYear = status.active_fiscal_year
  if (!fiscalYear.start_date || !fiscalYear.end_date) return null

  return {
    start_date: fiscalYear.start_date,
    end_date: fiscalYear.end_date,
    as_of_date: fiscalYear.end_date,
  }
}

export function getDashboardFiscalYearStatus() {
  return getFiscalYearStatus()
}

export function getDashboardFinancialSummary(period: DashboardFinancialPeriod): Promise<FinancialSummaryResult> {
  return getFinancialSummary(period)
}

export function dashboardErrorMessage(cause: unknown, fallback: string) {
  const error = cause as Partial<ApiError>
  if (error.status === 401) return 'Your session has expired. Please sign in again.'
  if (error.status === 403) return 'You do not have permission to view this dashboard section.'
  if (error.status === 422) {
    const validation = error.errors ? Object.values(error.errors).flat().join(' ') : ''
    return validation || error.message || 'The dashboard report period is invalid.'
  }
  if (error.status === 0) return 'Unable to reach the server. Check your network connection and retry.'
  if (typeof error.message === 'string') return error.message
  return fallback
}
