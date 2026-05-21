import { salesGet, salesPatch, salesPost, type SalesQueryParams } from '@/features/sales/api/salesApi';
import type { SalesReturn } from '@/features/sales/types';

export type SalesReturnPayload = Record<string, unknown>;

export function listSalesReturns(params: SalesQueryParams = {}) {
  return salesGet<SalesReturn[]>('/returns', params);
}

export function getSalesReturn(id: string | number) {
  return salesGet<SalesReturn>(`/returns/${id}`);
}

export function createSalesReturn(payload: SalesReturnPayload) {
  return salesPost<SalesReturn>('/returns', payload);
}

export function updateSalesReturn(id: string | number, payload: SalesReturnPayload) {
  return salesPatch<SalesReturn>(`/returns/${id}`, payload);
}

export function createSalesReturnFromInvoice(id: string | number, payload: SalesReturnPayload = {}) {
  return salesPost<SalesReturn>(`/returns/from-invoice/${id}`, payload);
}

export function createSalesReturnFromDeliveryOrder(id: string | number, payload: SalesReturnPayload = {}) {
  return salesPost<SalesReturn>(`/returns/from-delivery-order/${id}`, payload);
}

export function approveSalesReturn(id: string | number) {
  return salesPatch<SalesReturn>(`/returns/${id}/approve`);
}

export function postSalesReturn(id: string | number) {
  return salesPatch<SalesReturn>(`/returns/${id}/post`);
}

export function voidSalesReturn(id: string | number, reason: string) {
  return salesPatch<SalesReturn>(`/returns/${id}/void`, { reason });
}
