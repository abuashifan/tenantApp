import { salesGet, salesPatch, salesPost, type SalesQueryParams } from '@/features/sales/api/salesApi';
import type { SalesInvoice } from '@/features/sales/types';

export type SalesInvoicePayload = Record<string, unknown>;

export function listSalesInvoices(params: SalesQueryParams = {}) {
  return salesGet<SalesInvoice[]>('/invoices', params);
}

export function getSalesInvoice(id: string | number) {
  return salesGet<SalesInvoice>(`/invoices/${id}`);
}

export function createSalesInvoice(payload: SalesInvoicePayload) {
  return salesPost<SalesInvoice>('/invoices', payload);
}

export function updateSalesInvoice(id: string | number, payload: SalesInvoicePayload) {
  return salesPatch<SalesInvoice>(`/invoices/${id}`, payload);
}

export function createSalesInvoiceFromSalesOrder(id: string | number, payload: SalesInvoicePayload = {}) {
  return salesPost<SalesInvoice>(`/invoices/from-sales-order/${id}`, payload);
}

export function createSalesInvoiceFromDeliveryOrder(id: string | number, payload: SalesInvoicePayload = {}) {
  return salesPost<SalesInvoice>(`/invoices/from-delivery-order/${id}`, payload);
}

export function createSalesInvoiceFromProforma(id: string | number, payload: SalesInvoicePayload = {}) {
  return salesPost<SalesInvoice>(`/invoices/from-proforma/${id}`, payload);
}

export function approveSalesInvoice(id: string | number) {
  return salesPatch<SalesInvoice>(`/invoices/${id}/approve`);
}

export function postSalesInvoice(id: string | number, appliedDownPaymentAmount?: number) {
  return salesPatch<SalesInvoice>(`/invoices/${id}/post`, appliedDownPaymentAmount === undefined ? undefined : { applied_down_payment_amount: appliedDownPaymentAmount });
}

export function voidSalesInvoice(id: string | number, reason: string) {
  return salesPatch<SalesInvoice>(`/invoices/${id}/void`, { reason });
}
