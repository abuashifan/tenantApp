import { salesGet, salesPatch, salesPost, type SalesQueryParams } from '@/features/sales/api/salesApi';
import type { DeliveryOrder } from '@/features/sales/types';

export type DeliveryOrderPayload = Record<string, unknown>;

export function listDeliveryOrders(params: SalesQueryParams = {}) {
  return salesGet<DeliveryOrder[]>('/delivery-orders', params);
}

export function getDeliveryOrder(id: string | number) {
  return salesGet<DeliveryOrder>(`/delivery-orders/${id}`);
}

export function createDeliveryOrder(payload: DeliveryOrderPayload) {
  return salesPost<DeliveryOrder>('/delivery-orders', payload);
}

export function updateDeliveryOrder(id: string | number, payload: DeliveryOrderPayload) {
  return salesPatch<DeliveryOrder>(`/delivery-orders/${id}`, payload);
}

export function createDeliveryOrderFromSalesOrder(id: string | number, payload: DeliveryOrderPayload = {}) {
  return salesPost<DeliveryOrder>(`/delivery-orders/from-sales-order/${id}`, payload);
}

export function readyDeliveryOrder(id: string | number) {
  return salesPatch<DeliveryOrder>(`/delivery-orders/${id}/ready`);
}

export function shipDeliveryOrder(id: string | number) {
  return salesPatch<DeliveryOrder>(`/delivery-orders/${id}/ship`);
}

export function deliverDeliveryOrder(id: string | number) {
  return salesPatch<DeliveryOrder>(`/delivery-orders/${id}/deliver`);
}

export function cancelDeliveryOrder(id: string | number, reason: string) {
  return salesPatch<DeliveryOrder>(`/delivery-orders/${id}/cancel`, { reason });
}

export function voidDeliveryOrder(id: string | number, reason: string) {
  return salesPatch<DeliveryOrder>(`/delivery-orders/${id}/void`, { reason });
}
