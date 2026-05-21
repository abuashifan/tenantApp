import { salesGet, salesPatch, salesPost, type SalesQueryParams } from '@/features/sales/api/salesApi';
import type { SalesReceipt } from '@/features/sales/types';

export type SalesReceiptPayload = Record<string, unknown>;

export function listSalesReceipts(params: SalesQueryParams = {}) {
  return salesGet<SalesReceipt[]>('/receipts', params);
}

export function getSalesReceipt(id: string | number) {
  return salesGet<SalesReceipt>(`/receipts/${id}`);
}

export function createSalesReceipt(payload: SalesReceiptPayload) {
  return salesPost<SalesReceipt>('/receipts', payload);
}

export function postSalesReceipt(id: string | number) {
  return salesPatch<SalesReceipt>(`/receipts/${id}/post`);
}

export function voidSalesReceipt(id: string | number, reason: string) {
  return salesPatch<SalesReceipt>(`/receipts/${id}/void`, { reason });
}
