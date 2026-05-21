import { salesGet, salesPatch, salesPost, type SalesQueryParams } from '@/features/sales/api/salesApi';
import type { SalesQuotation } from '@/features/sales/types';

export type SalesQuotationPayload = Record<string, unknown>;

export function listSalesQuotations(params: SalesQueryParams = {}) {
  return salesGet<SalesQuotation[]>('/quotations', params);
}

export function getSalesQuotation(id: string | number) {
  return salesGet<SalesQuotation>(`/quotations/${id}`);
}

export function createSalesQuotation(payload: SalesQuotationPayload) {
  return salesPost<SalesQuotation>('/quotations', payload);
}

export function updateSalesQuotation(id: string | number, payload: SalesQuotationPayload) {
  return salesPatch<SalesQuotation>(`/quotations/${id}`, payload);
}

export function sendSalesQuotation(id: string | number) {
  return salesPatch<SalesQuotation>(`/quotations/${id}/send`);
}

export function approveSalesQuotation(id: string | number) {
  return salesPatch<SalesQuotation>(`/quotations/${id}/approve`);
}

export function acceptSalesQuotation(id: string | number) {
  return salesPatch<SalesQuotation>(`/quotations/${id}/accept`);
}

export function rejectSalesQuotation(id: string | number, reason: string) {
  return salesPatch<SalesQuotation>(`/quotations/${id}/reject`, { reason });
}

export function cancelSalesQuotation(id: string | number, reason: string) {
  return salesPatch<SalesQuotation>(`/quotations/${id}/cancel`, { reason });
}
