import { salesGet, salesPatch, salesPost, type SalesQueryParams } from '@/features/sales/api/salesApi';
import type { ProformaInvoice } from '@/features/sales/types';

export type ProformaPayload = Record<string, unknown>;

export function listProformas(params: SalesQueryParams = {}) {
  return salesGet<ProformaInvoice[]>('/proformas', params);
}

export function getProforma(id: string | number) {
  return salesGet<ProformaInvoice>(`/proformas/${id}`);
}

export function createProforma(payload: ProformaPayload) {
  return salesPost<ProformaInvoice>('/proformas', payload);
}

export function updateProforma(id: string | number, payload: ProformaPayload) {
  return salesPatch<ProformaInvoice>(`/proformas/${id}`, payload);
}

export function createProformaFromQuotation(id: string | number, payload: ProformaPayload = {}) {
  return salesPost<ProformaInvoice>(`/proformas/from-quotation/${id}`, payload);
}

export function createProformaFromSalesOrder(id: string | number, payload: ProformaPayload = {}) {
  return salesPost<ProformaInvoice>(`/proformas/from-sales-order/${id}`, payload);
}

export function issueProforma(id: string | number) {
  return salesPatch<ProformaInvoice>(`/proformas/${id}/issue`);
}

export function acceptProforma(id: string | number) {
  return salesPatch<ProformaInvoice>(`/proformas/${id}/accept`);
}

export function cancelProforma(id: string | number, reason: string) {
  return salesPatch<ProformaInvoice>(`/proformas/${id}/cancel`, { reason });
}
