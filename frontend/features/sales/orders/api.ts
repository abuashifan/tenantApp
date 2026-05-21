import { salesGet, salesPatch, salesPost, type SalesQueryParams } from '@/features/sales/api/salesApi';
import type { SalesOrder } from '@/features/sales/types';

export type SalesOrderPayload = Record<string, unknown>;

export function listSalesOrders(params: SalesQueryParams = {}) {
  return salesGet<SalesOrder[]>('/orders', params);
}

export function getSalesOrder(id: string | number) {
  return salesGet<SalesOrder>(`/orders/${id}`);
}

export function createSalesOrder(payload: SalesOrderPayload) {
  return salesPost<SalesOrder>('/orders', payload);
}

export function updateSalesOrder(id: string | number, payload: SalesOrderPayload) {
  return salesPatch<SalesOrder>(`/orders/${id}`, payload);
}

export function createSalesOrderFromQuotation(quotationId: string | number, payload: SalesOrderPayload) {
  return salesPost<SalesOrder>(`/orders/from-quotation/${quotationId}`, payload);
}

export function approveSalesOrder(id: string | number) {
  return salesPatch<SalesOrder>(`/orders/${id}/approve`);
}

export function confirmSalesOrder(id: string | number) {
  return salesPatch<SalesOrder>(`/orders/${id}/confirm`);
}

export function cancelSalesOrder(id: string | number, reason: string) {
  return salesPatch<SalesOrder>(`/orders/${id}/cancel`, { reason });
}

export function closeSalesOrder(id: string | number) {
  return salesPatch<SalesOrder>(`/orders/${id}/close`);
}

export function createDeliveryOrderFromSalesOrder(id: string | number) {
  return salesPost<Record<string, unknown>>(`/delivery-orders/from-sales-order/${id}`);
}

export function createSalesInvoiceFromSalesOrder(id: string | number) {
  return salesPost<Record<string, unknown>>(`/invoices/from-sales-order/${id}`);
}
