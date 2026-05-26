import { api } from '@/api'
import { unwrap, type ApiResponse } from '@/services/apiResponse'
import type { ApiListParams } from '@/types/api'

export type ArLedgerMovement = {
  date: string | null
  customer_id?: number | null
  customer_name?: string | null
  document_type: string
  document_id: number
  document_number?: string | null
  description?: string | null
  debit: number
  credit: number
  balance: number
  source_type?: string
  source_id?: number
}

export type ArCustomerSummaryRow = {
  customer_id: number
  customer_name: string | null
  debit: number
  credit: number
  balance: number
}

export type ArOpenInvoiceRow = {
  invoice_id: number
  invoice_number: string
  invoice_date: string | null
  due_date: string | null
  customer_id: number
  customer_name: string | null
  grand_total: number
  paid_amount: number
  returned_amount: number
  balance_due: number
  status: string
}

export type ArLedgerDetail = {
  customer_id?: number
  invoice_id?: number
  movements: ArLedgerMovement[]
}

export type ArAgingResponse = {
  as_of_date: string
  buckets: Record<string, number>
  total: number
  invoices: ArOpenInvoiceRow[]
  customers: Array<{ customer_id: number; customer_name: string | null; buckets: Record<string, number>; total: number }>
}

export type ArReconciliationResponse = {
  subsidiary_balance: number
  gl_ar_balance: number
  difference: number
  is_reconciled: boolean
}

export function getCustomerSummary(params: ApiListParams = {}) {
  return api.get<ApiResponse<ArCustomerSummaryRow[]>>('/sales/ar/customer-summary', { params }).then((response) => unwrap(response.data))
}

export function getCustomerLedger(customerId: number, params: ApiListParams = {}) {
  return api.get<ApiResponse<ArLedgerDetail>>(`/sales/ar/customers/${customerId}/ledger`, { params }).then((response) => unwrap(response.data))
}

export function getInvoiceLedger(invoiceId: number) {
  return api.get<ApiResponse<ArLedgerDetail>>(`/sales/ar/invoices/${invoiceId}/ledger`).then((response) => unwrap(response.data))
}

export function getOpenInvoices(params: ApiListParams = {}) {
  return api.get<ApiResponse<ArOpenInvoiceRow[]>>('/sales/ar/open-invoices', { params }).then((response) => unwrap(response.data))
}

export function getAging(params: ApiListParams = {}) {
  return api.get<ApiResponse<ArAgingResponse>>('/sales/ar/aging', { params }).then((response) => unwrap(response.data))
}

export function getReconciliation(params: ApiListParams = {}) {
  return api.get<ApiResponse<ArReconciliationResponse>>('/sales/ar/reconciliation', { params }).then((response) => unwrap(response.data))
}
