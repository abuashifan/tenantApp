import { api } from '@/api'
import type { ApiResponse } from '@/services/apiResponse'
import { unwrap } from '@/services/apiResponse'

export type CompanyAccountingSettings = {
  base_currency: string | null
  default_payment_term_id: number | string | null
  amount_precision: number | null
  quantity_precision: number | null
  rounding_method: 'half_up' | 'half_down' | 'bankers' | 'floor' | 'ceil' | null
  transaction_workflow_mode: 'simple_auto_post' | 'draft_then_post' | 'draft_approve_post' | null
  auto_post_transactions: boolean | null
  allow_edit_transactions: boolean | null
  allow_edit_posted_transactions: boolean | null
  allow_void_transactions: boolean | null
  hide_voided_transactions: boolean | null
  require_void_reason: boolean | null
  approval_enabled: boolean | null
  tax_enabled: boolean | null
  user_permission_mode: 'role_template' | 'manual_per_user' | null
  block_outside_current_fiscal_year: boolean | null
  date_warning_enabled: boolean | null
  allow_backdated_transactions: boolean | null
  max_backdate_days: number | null
  allow_future_transactions: boolean | null
  max_future_days: number | null
}

export type CompanyModuleSettings = {
  sales_enabled: boolean | null
  purchase_enabled: boolean | null
  cash_bank_enabled: boolean | null
  inventory_enabled: boolean | null
  warehouse_enabled: boolean | null
  fixed_asset_enabled: boolean | null
  approval_enabled: boolean | null
  tax_enabled: boolean | null
  reports_enabled: boolean | null
}

export type CompanySettings = {
  accounting: CompanyAccountingSettings
  transaction_defaults: CompanyTransactionDefaults
  modules: CompanyModuleSettings
}

export type CompanyTransactionDefaults = {
  default_payment_term_id: number | string | null
}

export type CompanyWorkflowSettings = Pick<
  CompanyAccountingSettings,
  'transaction_workflow_mode' | 'auto_post_transactions' | 'approval_enabled' | 'allow_void_transactions'
>

export async function getCompanySettings() {
  const response = await api.get<ApiResponse<CompanySettings>>('/settings/company')
  return unwrap(response.data)
}

export async function getCompanyWorkflowSettings() {
  const response = await api.get<ApiResponse<CompanyWorkflowSettings>>('/settings/company/workflow')
  return unwrap(response.data)
}

export async function updateCompanyAccountingSettings(payload: CompanyAccountingSettings) {
  const response = await api.patch<ApiResponse<{ accounting: CompanyAccountingSettings }>>('/settings/company/accounting', payload)
  return unwrap(response.data).accounting
}

export async function updateCompanyModuleSettings(payload: CompanyModuleSettings) {
  const response = await api.patch<ApiResponse<{ modules: CompanyModuleSettings }>>('/settings/company/modules', payload)
  return unwrap(response.data).modules
}

export async function updateCompanyTransactionDefaults(payload: CompanyTransactionDefaults) {
  const response = await api.patch<ApiResponse<{ transaction_defaults: CompanyTransactionDefaults }>>('/settings/company/transaction-defaults', payload)
  return unwrap(response.data).transaction_defaults
}
