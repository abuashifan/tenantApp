import { salesGet, type SalesQueryParams } from '@/features/sales/api/salesApi';

export function getARCustomerSummary(params: SalesQueryParams = {}) {
  return salesGet<Record<string, unknown>[]>('/ar/customer-summary', params);
}

export function getARCustomerLedger(customerId: string | number, params: SalesQueryParams = {}) {
  return salesGet<Record<string, unknown>>(`/ar/customers/${customerId}/ledger`, params);
}

export function getARInvoiceLedger(invoiceId: string | number) {
  return salesGet<Record<string, unknown>>(`/ar/invoices/${invoiceId}/ledger`);
}

export function getOpenInvoices(params: SalesQueryParams = {}) {
  return salesGet<Record<string, unknown>[]>('/ar/open-invoices', params);
}

export function getARAging(params: SalesQueryParams = {}) {
  return salesGet<Record<string, unknown>>('/ar/aging', params);
}

export function getARReconciliation(params: SalesQueryParams = {}) {
  return salesGet<Record<string, unknown>>('/ar/reconciliation', params);
}
