import { api } from '@/api'
import { unwrap, type ApiResponse } from '@/services/apiResponse'
import type { ApiListParams } from '@/types/api'

export type ApLedgerMovement = {
  date: string | null
  vendor_id?: number | null
  vendor_name?: string | null
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

export type ApVendorSummaryRow = {
  vendor_id: number
  vendor_name: string | null
  debit: number
  credit: number
  balance: number
}

export type ApOpenBillRow = {
  bill_id: number
  bill_number: string
  bill_date: string | null
  due_date: string | null
  vendor_id: number
  vendor_name: string | null
  grand_total: number
  paid_amount: number
  returned_amount: number
  balance_due: number
  status: string
}

export type ApLedgerDetail = {
  vendor_id?: number
  bill_id?: number
  movements: ApLedgerMovement[]
}

export type ApAgingResponse = {
  as_of_date: string
  buckets: Record<string, number>
  total: number
  bills: ApOpenBillRow[]
  vendors: Array<{ vendor_id: number; vendor_name: string | null; buckets: Record<string, number>; total: number }>
}

export type ApReconciliationResponse = {
  subsidiary_balance: number
  gl_ap_balance: number
  difference: number
  is_reconciled: boolean
}

export function getVendorSummary(params: ApiListParams = {}) {
  return api.get<ApiResponse<ApVendorSummaryRow[]>>('/purchase/ap/vendor-summary', { params }).then((response) => unwrap(response.data))
}

export function getVendorLedger(vendorId: number, params: ApiListParams = {}) {
  return api.get<ApiResponse<ApLedgerDetail>>(`/purchase/ap/vendors/${vendorId}/ledger`, { params }).then((response) => unwrap(response.data))
}

export function getBillLedger(billId: number) {
  return api.get<ApiResponse<ApLedgerDetail>>(`/purchase/ap/bills/${billId}/ledger`).then((response) => unwrap(response.data))
}

export function getOpenBills(params: ApiListParams = {}) {
  return api.get<ApiResponse<ApOpenBillRow[]>>('/purchase/ap/open-bills', { params }).then((response) => unwrap(response.data))
}

export function getAging(params: ApiListParams = {}) {
  return api.get<ApiResponse<ApAgingResponse>>('/purchase/ap/aging', { params }).then((response) => unwrap(response.data))
}

export function getReconciliation(params: ApiListParams = {}) {
  return api.get<ApiResponse<ApReconciliationResponse>>('/purchase/ap/reconciliation', { params }).then((response) => unwrap(response.data))
}
