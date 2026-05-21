import { salesGet, salesPatch, salesPost, type SalesQueryParams } from '@/features/sales/api/salesApi';
import type { CustomerDeposit } from '@/features/sales/types';

export type CustomerDepositPayload = Record<string, unknown>;

export function listCustomerDeposits(params: SalesQueryParams = {}) {
  return salesGet<CustomerDeposit[]>('/customer-deposits', params);
}

export function getCustomerDeposit(id: string | number) {
  return salesGet<CustomerDeposit>(`/customer-deposits/${id}`);
}

export function createCustomerDeposit(payload: CustomerDepositPayload) {
  return salesPost<CustomerDeposit>('/customer-deposits', payload);
}

export function postCustomerDeposit(id: string | number) {
  return salesPatch<CustomerDeposit>(`/customer-deposits/${id}/post`);
}

export function voidCustomerDeposit(id: string | number, reason: string) {
  return salesPatch<CustomerDeposit>(`/customer-deposits/${id}/void`, { reason });
}

export function refundCustomerDeposit(id: string | number, amount: number, reason: string) {
  return salesPatch<CustomerDeposit>(`/customer-deposits/${id}/refund`, { amount, reason });
}
