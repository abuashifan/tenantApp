import { apiRequest } from '@/lib/api';
import type { ApiResponse } from '@/types/api';
import type { PurchaseQueryParams } from '@/features/purchase/types';

export function buildPurchaseQuery(params: PurchaseQueryParams = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value));
  });
  return search.toString() ? `?${search.toString()}` : '';
}

export async function purchaseGet<T>(path: string, params: PurchaseQueryParams = {}) {
  return apiRequest<ApiResponse<T>>(`/purchase${path}${buildPurchaseQuery(params)}`);
}

export async function purchasePost<T>(path: string, body?: unknown) {
  return apiRequest<ApiResponse<T>>(`/purchase${path}`, { method: 'POST', body });
}

export async function purchasePatch<T>(path: string, body?: unknown) {
  return apiRequest<ApiResponse<T>>(`/purchase${path}`, { method: 'PATCH', body });
}
